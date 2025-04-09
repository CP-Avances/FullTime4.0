// IMPORTACION DE LIBRERIAS
import { FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { DateTime } from 'luxon';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import * as xml2js from 'xml2js';
import * as FileSaver from 'file-saver';
import ExcelJS, { FillPattern } from "exceljs";

// IMPORTACION DE COMPONENTES
import { RegistroRolComponent } from 'src/app/componentes/configuracion/parametrizacion/roles/registro-rol/registro-rol.component';
import { EditarRolComponent } from 'src/app/componentes/configuracion/parametrizacion/roles/editar-rol/editar-rol.component';
import { MetodosComponent } from 'src/app/componentes/generales/metodoEliminar/metodos.component';

// IMPORTACION DE SERVICIOS
import { PlantillaReportesService } from 'src/app/componentes/reportes/plantilla-reportes.service';
import { RolPermisosService } from 'src/app/servicios/configuracion/parametrizacion/catRolPermisos/rol-permisos.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { MainNavService } from 'src/app/componentes/generales/main-nav/main-nav.service';
import { RolesService } from 'src/app/servicios/configuracion/parametrizacion/catRoles/roles.service';

import { SelectionModel } from '@angular/cdk/collections';
import { ITableRoles } from 'src/app/model/reportes.model';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';

@Component({
  selector: 'app-vista-roles',
  standalone: false,
  templateUrl: './vista-roles.component.html',
  styleUrls: ['./vista-roles.component.css'],
})

export class VistaRolesComponent implements OnInit {
  ips_locales: any = '';

  private imagen: any;

  private bordeCompleto!: Partial<ExcelJS.Borders>;

  private bordeGrueso!: Partial<ExcelJS.Borders>;

  private fillAzul!: FillPattern;

  private fontTitulo!: Partial<ExcelJS.Font>;

  private fontHipervinculo!: Partial<ExcelJS.Font>;

  ver_roles: boolean = true;
  ver_funciones: boolean = false;

  idEmpleado: number; // VARIABLE DE ID DE EMPLEADO QUE INICIA SESIÓN
  roles: any = []; // VARIABLE DE ALMACENAMIENTO DE DATOS DE ROLES
  empleado: any = []; // VARIABLE DE ALMACENAMIENTO DE DATOS DE EMPLEADO
  rolesEliminar: any = [];

  // ITEMS DE PAGINACION DE LA TABLA
  pageSizeOptions = [5, 10, 20, 50];
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // CAMPO DE BUSQUEDA DE DATOS
  buscarDescripcion = new FormControl('', Validators.minLength(2));

  get reloj_virtual(): boolean { return this.varificarFunciones.app_movil; }
  // METODO DE LLAMADO DE DATOS DE EMPRESA COLORES - LOGO - MARCA DE AGUA
  get s_color(): string { return this.plantilla.color_Secundary }
  get p_color(): string { return this.plantilla.color_Primary }
  get logoE(): string { return this.plantilla.logoBase64 }
  get frase(): string { return this.plantilla.marca_Agua }

  constructor(
    private varificarFunciones: MainNavService,
    private plantilla: PlantillaReportesService, // SERVICIO DATOS DE EMPRESA
    private permisos: RolPermisosService,
    private toastr: ToastrService, // VARIABLE DE MANEJO DE MENSAJES DE NOTIFICACIONES
    private router: Router, // VARAIBLE MANEJO DE RUTAS URL
    private restE: EmpleadoService, // SERVICIO DATOS DE EMPLEADO
    private rest: RolesService, // SERVICIO DATOS DE ROLES
    public ventana: MatDialog, // VARIABLE DE MANEJO DE VENTANAS
    public validar: ValidacionesService,
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit() {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');  
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    }); 

    this.ObtenerEmpleados(this.idEmpleado);
    this.ObtenerRoles();
    this.bordeCompleto = {
      top: { style: "thin" as ExcelJS.BorderStyle },
      left: { style: "thin" as ExcelJS.BorderStyle },
      bottom: { style: "thin" as ExcelJS.BorderStyle },
      right: { style: "thin" as ExcelJS.BorderStyle },
    };

    this.bordeGrueso = {
      top: { style: "medium" as ExcelJS.BorderStyle },
      left: { style: "medium" as ExcelJS.BorderStyle },
      bottom: { style: "medium" as ExcelJS.BorderStyle },
      right: { style: "medium" as ExcelJS.BorderStyle },
    };

    this.fillAzul = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "4F81BD" }, // Azul claro
    };

    this.fontTitulo = { bold: true, size: 12, color: { argb: "FFFFFF" } };

    this.fontHipervinculo = { color: { argb: "0000FF" }, underline: true };
  }


  // METODO PARA MOSTRAR FILAS DETERMINADAS DE DATOS EN LA TABLA
  ManejarPagina(e: PageEvent) {
    this.numero_pagina = e.pageIndex + 1;
    this.tamanio_pagina = e.pageSize;
  }

  // METODO PARA VER LA INFORMACION DEL EMPLEADO
  ObtenerEmpleados(idemploy: any) {
    this.empleado = [];
    this.restE.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleado = data;
    })
  }

  // METODO PARA OBTENER ROLES
  ObtenerRoles() {
    this.roles = [];
    this.numero_pagina = 1;
    this.rest.BuscarRoles().subscribe(res => {
      this.roles = res;
      this.ObtenerFuncionesRoles();
    });
  }

  /** ***************************************************************************** **
   ** **                  VENTANA PARA REGISTRAR Y EDITAR DATOS                  ** **
   ** ***************************************************************************** **/

  // METODO PARA EDITAR ROL
  AbrirVentanaEditar(datosSeleccionados: any): void {
    this.ventana.open(EditarRolComponent,
      { width: '400px', data: { datosRol: datosSeleccionados, actualizar: true } })
      .afterClosed().subscribe(items => {
        if (items == true) {
          this.ObtenerRoles();
        }
      });
  }

  // METODO PARA REGISTRAR ROL
  AbrirVentanaRegistrarRol() {
    this.ventana.open(RegistroRolComponent, { width: '400px' }).afterClosed().subscribe(items => {
      if (items == true) {
        this.ObtenerRoles();
      }
    });
    this.activar_seleccion = true;
    this.plan_multiple = false;
    this.plan_multiple_ = false;
    this.selectionRoles.clear();
    this.rolesEliminar = [];
  }

  // METODO PARA LIMPIAR CAMPOS DE BUSQUEDA
  LimpiarCampoBuscar() {
    this.buscarDescripcion.reset();
  }

  // ORDENAR LOS DATOS SEGUN EL ID
  OrdenarDatos(array: any) {
    function compare(a: any, b: any) {
      if (a.id < b.id) {
        return -1;
      }
      if (a.id > b.id) {
        return 1;
      }
      return 0;
    }
    array.sort(compare);
  }

  // METODO PARA ABRIR PAGINA LISTA DE FUNCIONES
  rol_id: number = 0;
  VerFunciones(id_rol: number) {
    this.rol_id = id_rol;
    this.ver_roles = false;
    this.ver_funciones = true;
  }


  // METODO PARA BUSCAR FUNCIONES DE LOS ROLES
  funciones: any = [];
  data_general: any = [];
  ObtenerFuncionesRoles() {
    this.funciones = [];
    this.data_general = [];
    this.permisos.BuscarFuncionesRoles().subscribe(res => {
      this.funciones = res;
      this.data_general = this.roles;
      this.data_general.forEach((rol: any) => {
        rol.funciones = this.funciones.filter((funcion: any) => funcion.id_rol === rol.id);
      });
      this.data_general.sort((a: any, b: any) => a.id - b.id);
      console.log('funciones ', this.data_general);
    });
  }

  // METODO PARA SELECCIONAR INFORMACION
  datos_archivo: any;
  SeleccionarDatos(id: number) {
    this.datos_archivo = [];
    if (id != 0) {
      this.datos_archivo = this.data_general.filter((item: any) => item.id === id);
    }
    else {
      this.datos_archivo = this.data_general;
    }
  }

  /** ************************************************************************************************* **
   ** **                            PARA LA EXPORTACION DE ARCHIVOS PDF                              ** **
   ** ************************************************************************************************* **/


  // METODO PARA CREAR ARCHIVO PDF
  async GenerarPdf(action = 'open', id: number) {
    this.SeleccionarDatos(id);
    const pdfMake = await this.validar.ImportarPDF();
    const documentDefinition = this.DefinirInformacionPDF();
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download('Roles' + '.pdf'); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  DefinirInformacionPDF() {
    return {
      // ENCABEZADO DE PÁGINA
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [40, 50, 40, 50],
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleado[0].nombre + ' ' + this.empleado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },
      // PIE DE PAGINA
      footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
        var f = DateTime.now();
        fecha = f.toFormat('yyyy-MM-dd');
        hora = f.toFormat('HH:mm:ss');
        return {
          margin: 10,
          columns: [
            { text: 'Fecha: ' + fecha + ' Hora: ' + hora, opacity: 0.3 },
            {
              text: [
                {
                  text: '© Pag ' + currentPage.toString() + ' of ' + pageCount,
                  alignment: 'right', opacity: 0.3
                }
              ],
            }
          ], fontSize: 10
        }
      },
      content: [
        { image: this.logoE, width: 100, margin: [10, -25, 0, 5] },
        { text: localStorage.getItem('name_empresa')?.toUpperCase(), bold: true, fontSize: 14, alignment: 'center', margin: [0, -30, 0, 5] },
        { text: 'PERMISOS O FUNCIONALIDADES DEL ROL', bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 0] },
        ...this.PresentarDataPDF(),
      ],
      styles: {
        tableHeader: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.s_color },
        itemsTableInfo: { fontSize: 9, margin: [0, -1, 0, -1], fillColor: this.p_color },
        itemsTableCentrado: { fontSize: 8, alignment: 'center' },
        tableMargin: { margin: [0, 5, 0, 0] },
        tableMarginCabecera: { margin: [0, 10, 0, 0] },
      }
    };
  }

  // METODO PARA PRESENTAR DATOS DEL DOCUMENTO PDF
  PresentarDataPDF(): Array<any> {
    let n: any = []
    this.datos_archivo.forEach((obj: any) => {
      n.push({
        style: 'tableMarginCabecera',
        table: {
          widths: ['*'],
          headerRows: 1,
          body: [
            [
              { text: `ROL: ${obj.nombre}`, style: 'itemsTableInfo', border: [true, true, true, true] },],
          ]
        },
      });

      if (obj.funciones.length > 0) {
        n.push({
          style: 'tableMargin',
          table: {
            widths: ['*'],
            headerRows: 1,
            body: [
              [{ rowSpan: 1, text: 'FUNCIONES DEL SISTEMA ASIGNADAS', style: 'tableHeader', border: [true, true, true, false] }],
            ]
          }
        });
        n.push({
          style: 'tableMargin',
          table: {
            widths: ['*', '*', 'auto', 'auto', 'auto'],
            headerRows: 1,
            body: [
              [
                { text: 'PÁGINA', style: 'tableHeader' },
                { text: 'FUNCIÓN', style: 'tableHeader' },
                { text: 'MÓDULO', style: 'tableHeader' },
                { text: 'APLICACIÓN WEB', style: 'tableHeader' },
                { text: 'APLICACIÓN MÓVIL', style: 'tableHeader' },
              ],
              ...obj.funciones.map((detalle: any) => {
                return [
                  { text: detalle.pagina, style: 'itemsTableCentrado' },
                  { text: detalle.accion, style: 'itemsTableCentrado' },
                  {
                    text: detalle.nombre_modulo === 'permisos'
                      ? 'Módulo de Permisos'
                      : detalle.nombre_modulo === 'vacaciones'
                        ? 'Módulo de Vacaciones'
                        : detalle.nombre_modulo === 'horas_extras'
                          ? 'Módulo de Horas Extras'
                          : detalle.nombre_modulo === 'alimentacion'
                            ? 'Módulo de Alimentación'
                            : detalle.nombre_modulo === 'acciones_personal'
                              ? 'Módulo de Acciones de Personal'
                              : detalle.nombre_modulo === 'geolocalizacion'
                                ? 'Módulo de Geolocalización'
                                : detalle.nombre_modulo === 'timbre_virtual'
                                  ? 'Módulo de Timbre Virtual'
                                  : detalle.nombre_modulo === 'reloj_virtual'
                                    ? 'Aplicación Móvil'
                                    : detalle.nombre_modulo === 'aprobar'
                                      ? 'Aprobaciones Solicitudes'
                                      : detalle.nombre_modulo, style: 'itemsTableCentrado'
                  },
                  { text: detalle.movil == false ? 'Sí' : '', style: 'itemsTableCentrado' },
                  { text: detalle.movil == true ? 'Sí' : '', style: 'itemsTableCentrado' },
                ];
              })
            ]
          },
          layout: {
            fillColor: function (rowIndex: any) {
              return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
            }
          }
        });
      }
    });
    return n;
  }


  /** ************************************************************************************************* **
   ** **                             PARA LA EXPORTACION DE ARCHIVOS EXCEL                           ** **
   ** ************************************************************************************************* **/
  async generarExcelRoles() {

    let datos: any[] = [];
    let n: number = 1;
    this.data_general.forEach((obj: any) => {
      obj.funciones.forEach((det: any) => {
        datos.push([
          n++,
          obj.nombre,
          det.pagina,
          det.accion,
          det.nombre_modulo === 'permisos'
            ? 'Módulo de Permisos'
            : det.nombre_modulo === 'vacaciones'
              ? 'Módulo de Vacaciones'
              : det.nombre_modulo === 'horas_extras'
                ? 'Módulo de Horas Extras'
                : det.nombre_modulo === 'alimentacion'
                  ? 'Módulo de Alimentación'
                  : det.nombre_modulo === 'acciones_personal'
                    ? 'Módulo de Acciones de Personal'
                    : det.nombre_modulo === 'geolocalizacion'
                      ? 'Módulo de Geolocalización'
                      : det.nombre_modulo === 'timbre_virtual'
                        ? 'Módulo de Timbre Virtual'
                        : det.nombre_modulo === 'reloj_virtual'
                          ? 'Aplicación Móvil'
                          : det.nombre_modulo === 'aprobar'
                            ? 'Aprobaciones Solicitudes'
                            : det.nombre_modulo,
          det.movil == false ? 'Sí' : '',
          det.movil == true ? 'Sí' : '',
        ]);
      });
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Funcionalidades de Rol");
    this.imagen = workbook.addImage({
      base64: this.logoE,
      extension: "png",
    });

    worksheet.addImage(this.imagen, {
      tl: { col: 0, row: 0 },
      ext: { width: 220, height: 105 },
    });
    // COMBINAR CELDAS
    worksheet.mergeCells("B1:G1");
    worksheet.mergeCells("B2:G2");
    worksheet.mergeCells("B3:G3");
    worksheet.mergeCells("B4:G4");
    worksheet.mergeCells("B5:G5");

    // AGREGAR LOS VALORES A LAS CELDAS COMBINADAS
    worksheet.getCell("B1").value = localStorage.getItem('name_empresa')?.toUpperCase();
    worksheet.getCell("B2").value = "PERMISOS O FUNCIONALIDADES DEL ROL".toUpperCase();

    // APLICAR ESTILO DE CENTRADO Y NEGRITA A LAS CELDAS COMBINADAS
    ["B1", "B2"].forEach((cell) => {
      worksheet.getCell(cell).alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      worksheet.getCell(cell).font = { bold: true, size: 14 };
    });


    worksheet.columns = [
      { key: "n", width: 10 },
      { key: "rol", width: 30 },
      { key: "pagina", width: 40 },
      { key: "funcion", width: 60 },
      { key: "modulo", width: 30 },
      { key: "appweb", width: 30 },
      { key: "appmovil", width: 30 },
    ];


    const columnas = [
      { name: "ITEM", totalsRowLabel: "Total:", filterButton: false },
      { name: "ROL", totalsRowLabel: "Total:", filterButton: true },
      { name: "PÁGINA", totalsRowLabel: "", filterButton: true },
      { name: "FUNCIÓN", totalsRowLabel: "", filterButton: true },
      { name: "MÓDULO", totalsRowLabel: "", filterButton: true },
      { name: "APLICACIÓN WEB", totalsRowLabel: "", filterButton: true },
      { name: "APLICACIÓN MÓVIL", totalsRowLabel: "", filterButton: true },

    ];

    worksheet.addTable({
      name: "RolesTabla",
      ref: "A6",
      headerRow: true,
      totalsRow: false,
      style: {
        theme: "TableStyleMedium16",
        showRowStripes: true,
      },
      columns: columnas,
      rows: datos,
    });


    const numeroFilas = datos.length;
    for (let i = 0; i <= numeroFilas; i++) {
      for (let j = 1; j <= 7; j++) {
        const cell = worksheet.getRow(i + 6).getCell(j);
        if (i === 0) {
          cell.alignment = { vertical: "middle", horizontal: "center" };
        } else {
          cell.alignment = {
            vertical: "middle",
            horizontal: this.obtenerAlineacionHorizontalEmpleados(j),
          };
        }
        cell.border = this.bordeCompleto;
      }
    }
    worksheet.getRow(6).font = this.fontTitulo;

    try {
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/octet-stream" });
      FileSaver.saveAs(blob, "RolesEXCEL.xlsx");
    } catch (error) {
      console.error("Error al generar el archivo Excel:", error);
    }
  }

  private obtenerAlineacionHorizontalEmpleados(
    j: number
  ): "left" | "center" | "right" {
    if (j === 1 || j === 9 || j === 10 || j === 11) {
      return "center";
    } else {
      return "left";
    }
  }


  /** ************************************************************************************************* **
   ** **                               PARA LA EXPORTACION DE ARCHIVOS XML                           ** **
   ** ************************************************************************************************* **/

  urlxml: string;
  data: any = [];
  ExportToXML() {
    var objeto: any;
    var arregloRoles: any = [];
    this.data_general.forEach((obj: any) => {
      let detalles: any = [];
      obj.funciones.forEach((det: any) => {
        detalles.push({
          "pagina": det.pagina,
          "funcion": det.accion,
          "modulo": det.nombre_modulo === 'permisos'
            ? 'Módulo de Permisos'
            : det.nombre_modulo === 'vacaciones'
              ? 'Módulo de Vacaciones'
              : det.nombre_modulo === 'horas_extras'
                ? 'Módulo de Horas Extras'
                : det.nombre_modulo === 'alimentacion'
                  ? 'Módulo de Alimentación'
                  : det.nombre_modulo === 'acciones_personal'
                    ? 'Módulo de Acciones de Personal'
                    : det.nombre_modulo === 'geolocalizacion'
                      ? 'Módulo de Geolocalización'
                      : det.nombre_modulo === 'timbre_virtual'
                        ? 'Módulo de Timbre Virtual'
                        : det.nombre_modulo === 'reloj_virtual'
                          ? 'Aplicación Móvil'
                          : det.nombre_modulo === 'aprobar'
                            ? 'Aprobaciones Solicitudes'
                            : det.nombre_modulo,
          "aplicacion_web": det.movil == false ? 'Sí' : '',
          "aplicacion_movil": det.movil == true ? 'Sí' : '',
        });
      });

      objeto = {
        "rol": {
          "$": { "id": obj.id },
          "nombre": obj.nombre,
          "funciones": { "detalle": detalles }
        }
      }
      arregloRoles.push(objeto)
    });

    const xmlBuilder = new xml2js.Builder({ rootName: 'Roles' });
    const xml = xmlBuilder.buildObject(arregloRoles);

    if (xml === undefined) {
      return;
    }

    const blob = new Blob([xml], { type: 'application/xml' });
    const xmlUrl = URL.createObjectURL(blob);

    // ABRIR UNA NUEVA PESTAÑA O VENTANA CON EL CONTENIDO XML
    const newTab = window.open(xmlUrl, '_blank');
    if (newTab) {
      newTab.opener = null; // EVITAR QUE LA NUEVA PESTAÑA TENGA ACCESO A LA VENTANA PADRE
      newTab.focus(); // DAR FOCO A LA NUEVA PESTAÑA
    } else {
      alert('No se pudo abrir una nueva pestaña. Asegúrese de permitir ventanas emergentes.');
    }

    const a = document.createElement('a');
    a.href = xmlUrl;
    a.download = 'Roles.xml';
    // SIMULAR UN CLIC EN EL ENLACE PARA INICIAR LA DESCARGA
    a.click();
  }

  /** ************************************************************************************************** **
   ** **                                     METODO PARA EXPORTAR A CSV                               ** **
   ** ************************************************************************************************** **/


  ExportToCSV() {
    // 1. Crear un nuevo workbook
    const workbook = new ExcelJS.Workbook();
    let n: number = 1;

    // 2. Crear una hoja en el workbook
    const worksheet = workbook.addWorksheet('RolesCSV');
    // 3. Agregar encabezados de las columnas
    worksheet.columns = [
      { header: 'n', key: 'n', width: 10 },
      { header: 'rol', key: 'rol', width: 30 },
      { header: 'pagina', key: 'pagina', width: 15 },
      { header: 'funcion', key: 'funcion', width: 15 },
      { header: 'modulo', key: 'modulo', width: 15 },
      { header: 'aplicacion_web', key: 'aplicacion_web', width: 15 },
      { header: 'aplicacion_movil', key: 'aplicacion_movil', width: 15 },

    ];
    // 4. Llenar las filas con los datos
    this.data_general.forEach((obj: any) => {
      obj.funciones.forEach((det: any) => {
        worksheet.addRow({
          n: n++,
          rol: obj.nombre,
          pagina: det.pagina,
          funcion: det.accion,
          modulo: det.nombre_modulo === 'permisos'
            ? 'Módulo de Permisos'
            : det.nombre_modulo === 'vacaciones'
              ? 'Módulo de Vacaciones'
              : det.nombre_modulo === 'horas_extras'
                ? 'Módulo de Horas Extras'
                : det.nombre_modulo === 'alimentacion'
                  ? 'Módulo de Alimentación'
                  : det.nombre_modulo === 'acciones_personal'
                    ? 'Módulo de Acciones de Personal'
                    : det.nombre_modulo === 'geolocalizacion'
                      ? 'Módulo de Geolocalización'
                      : det.nombre_modulo === 'timbre_virtual'
                        ? 'Módulo de Timbre Virtual'
                        : det.nombre_modulo === 'reloj_virtual'
                          ? 'Aplicación Móvil'
                          : det.nombre_modulo === 'aprobar'
                            ? 'Aprobaciones Solicitudes'
                            : det.nombre_modulo,
          aplicacion_web: det.movil == false ? 'Sí' : '',
          aplicacion_movil: det.movil == true ? 'Sí' : '',

        }).commit();
      })
    });
    // 5. Escribir el CSV en un buffer
    workbook.csv.writeBuffer().then((buffer) => {
      // 6. Crear un blob y descargar el archivo
      const data: Blob = new Blob([buffer], { type: 'text/csv;charset=utf-8;' });
      FileSaver.saveAs(data, "RolesCSV.csv");
    });
  }

  //CONTROL BOTONES
  getCrearRol(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Crear Rol');
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 1);
    }
  }

  getDescargarReportes(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => (item.accion === 'Descargar Reportes Roles' && item.id_funcion === 4));
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 1);
    }
  }

  getVerFuncionesRol() {
    var datosRecuperados = sessionStorage.getItem('paginaRol');
    var rolEmpl = parseInt(localStorage.getItem('rol') as string);
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      var encontrado = false;
      const index = datos.findIndex(item => item.accion === 'Ver Funciones Rol');
      if (index !== -1) {
        encontrado = true;
      }
      return encontrado;
    } else {
      if (rolEmpl != 1) {
        return false;
      } else {
        return true;
      }
    }
  }

  getEditarRol() {
    var datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      var encontrado = false;
      const index = datos.findIndex(item => item.accion === 'Editar Rol');
      if (index !== -1) {
        encontrado = true;
      }
      return encontrado;
    } else {
      if (parseInt(localStorage.getItem('rol') as string) != 1) {
        return false;
      } else {
        return true;
      }
    }
  }

  getEliminarRol() {
    var datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      var encontrado = false;
      const index = datos.findIndex(item => item.accion === 'Eliminar Rol');
      if (index !== -1) {
        encontrado = true;
      }
      return encontrado;
    } else {
      if (parseInt(localStorage.getItem('rol') as string) != 1) {
        return false;
      } else {
        return true;
      }
    }
  }

  // METODOS PARA LA SELECCION MULTIPLE
  plan_multiple: boolean = false;
  plan_multiple_: boolean = false;

  HabilitarSeleccion() {
    this.plan_multiple = true;
    this.plan_multiple_ = true;
    this.auto_individual = false;
    this.activar_seleccion = false;
  }

  auto_individual: boolean = true;
  activar_seleccion: boolean = true;
  seleccion_vacia: boolean = true;

  selectionRoles = new SelectionModel<ITableRoles>(true, []);

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedPag() {
    const numSelected = this.selectionRoles.selected.length;
    return numSelected === this.roles.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterTogglePag() {
    this.isAllSelectedPag() ?
      this.selectionRoles.clear() :
      this.roles.forEach((row: any) => this.selectionRoles.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelPag(row?: ITableRoles): string {
    if (!row) {
      return `${this.isAllSelectedPag() ? 'select' : 'deselect'} all`;
    }
    this.rolesEliminar = this.selectionRoles.selected;
    return `${this.selectionRoles.isSelected(row) ? 'deselect' : 'select'} row ${row.nombre + 1}`;
  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO
  Eliminar(rol: any) {
    const datos = {
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales
    };
    this.rest.EliminarRoles(rol.id, datos).subscribe((res: any) => {
      if (res.message === 'error') {
        this.toastr.error('No se puede eliminar.', '', {
          timeOut: 6000,
        });
      } else {
        this.toastr.error('Registro eliminado.', '', {
          timeOut: 6000,
        });
        this.ObtenerRoles();
      }
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  ConfirmarDelete(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Eliminar(datos);
          this.activar_seleccion = true;
          this.plan_multiple = false;
          this.plan_multiple_ = false;
          this.rolesEliminar = [];
          this.selectionRoles.clear();
          this.ObtenerRoles();
        } else {
          this.router.navigate(['/roles']);
        }
      });
  }

  // FUNCION PARA ELIMINAR LOS REGISTROS SELECCIONADOS
  contador: number = 0;
  ingresar: boolean = false;
  EliminarMultiple() {
    const data = {
      user_name: this.user_name,
      ip: this.ip,
      ip_local: this.ips_locales
    };
  
    const peticiones = this.selectionRoles.selected.map((datos: any) =>
      this.rest.EliminarRoles(datos.id, data).pipe(
        map((res: any) => ({ success: res.message !== 'error', nombre: datos.nombre })),
        catchError(() => of({ success: false, nombre: datos.nombre }))
      )
    );
  
    forkJoin(peticiones).subscribe(resultados => {
      let eliminados = 0;
  
      resultados.forEach(resultado => {
        if (resultado.success) {
          eliminados++;
        } else {
          this.toastr.warning('Existen datos relacionados con ' + resultado.nombre + '.', 'No fue posible eliminar.', {
            timeOut: 6000,
          });
        }
      });
  
      if (eliminados > 0) {
        this.toastr.error(`Se ha eliminado ${eliminados} registro${eliminados > 1 ? 's' : ''}.`, '', {
          timeOut: 6000,
        });
      }
  
      this.rolesEliminar = [];
      this.selectionRoles.clear();
      this.ObtenerRoles();
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO LOS REGISTROS
  ConfirmarDeleteMultiple() {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          if (this.rolesEliminar.length != 0) {
            this.EliminarMultiple();
            this.activar_seleccion = true;
            this.plan_multiple = false;
            this.plan_multiple_ = false;
            this.rolesEliminar = [];
            this.selectionRoles.clear();
            this.ObtenerRoles();
          } else {
            this.toastr.warning('No ha seleccionado ROLES.', 'Ups!!! algo salio mal.', {
              timeOut: 6000,
            })
          }
        } else {
          this.router.navigate(['/roles']);
        }
      });
  }
}
