// IMPORTACION DE LIBRERIAS
import { FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { DateTime } from 'luxon';
import { Router } from '@angular/router';

import * as xlsx from 'xlsx';
import * as xml2js from 'xml2js';
const pdfMake = require('src/assets/build/pdfmake.js');
const pdfFonts = require('src/assets/build/vfs_fonts.js');
import * as FileSaver from 'file-saver';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// IMPORTACION DE COMPONENTES
import { RegistroRolComponent } from 'src/app/componentes/configuracion/parametrizacion/roles/registro-rol/registro-rol.component';
import { EditarRolComponent } from 'src/app/componentes/configuracion/parametrizacion/roles/editar-rol/editar-rol.component';
import { MetodosComponent } from 'src/app/componentes/generales/metodoEliminar/metodos.component';

// IMPORTACION DE SERVICIOS
import { PlantillaReportesService } from 'src/app/componentes/reportes/plantilla-reportes.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { RolesService } from 'src/app/servicios/configuracion/parametrizacion/catRoles/roles.service';

import { SelectionModel } from '@angular/cdk/collections';
import { ITableRoles } from 'src/app/model/reportes.model';
import { RolPermisosService } from 'src/app/servicios/configuracion/parametrizacion/catRolPermisos/rol-permisos.service';
import { MainNavService } from 'src/app/componentes/generales/main-nav/main-nav.service';

@Component({
  selector: 'app-vista-roles',
  templateUrl: './vista-roles.component.html',
  styleUrls: ['./vista-roles.component.css'],
})

export class VistaRolesComponent implements OnInit {

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
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit() {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

    this.ObtenerEmpleados(this.idEmpleado);
    this.ObtenerRoles();
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

  GenerarPdf(action = 'open', id: number) {
    this.SeleccionarDatos(id);
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

  ExportToExcel() {
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.EstructurarDatosExcel());
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'Roles');
    xlsx.writeFile(wb, "RolesEXCEL" + '.xlsx');
  }

  EstructurarDatosExcel() {
    let datos: any = [];
    let n: number = 1;
    this.data_general.forEach((obj: any) => {
      obj.funciones.forEach((det: any) => {
        datos.push({
          'N°': n++,
          'ROL': obj.nombre,
          'PÁGINA': det.pagina,
          'FUNCIÓN': det.accion,
          'MÓDULO': det.nombre_modulo === 'permisos'
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
          'APLICACIÓN WEB': det.movil == false ? 'Sí' : '',
          'APLICACIÓN MÓVIL': det.movil == true ? 'Sí' : '',
        });
      });
    });

    return datos;
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

  ExportToCVS() {
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.EstructurarDatosCSV());
    const csvDataH = xlsx.utils.sheet_to_csv(wse);
    const data: Blob = new Blob([csvDataH], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, "RolesCSV" + '.csv');
  }

  EstructurarDatosCSV() {
    let datos: any = [];
    let n: number = 1;
    this.data_general.forEach((obj: any) => {
      obj.funciones.forEach((det: any) => {
        datos.push({
          'n': n++,
          'rol': obj.nombre,
          'pagina': det.pagina,
          'funcion': det.accion,
          'modulo': det.nombre_modulo === 'permisos'
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
          'aplicacion_web': det.movil == false ? 'Sí' : '',
          'aplicacion_movil': det.movil == true ? 'Sí' : '',
        });
      });
    });
    return datos;
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
      ip: this.ip
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
      ip: this.ip
    };
    this.ingresar = false;
    this.contador = 0;
    this.rolesEliminar = this.selectionRoles.selected;
    this.rolesEliminar.forEach((datos: any) => {
      this.roles = this.roles.filter(item => item.id !== datos.id);
      this.contador = this.contador + 1;
      this.rest.EliminarRoles(datos.id, data).subscribe((res: any) => {
        if (res.message === 'error') {
          this.toastr.error('Existen datos relacionados con ' + datos.nombre + '.', 'No fue posible eliminar.', {
            timeOut: 6000,
          });
          this.contador = this.contador - 1;
        } else {
          if (!this.ingresar) {
            this.toastr.error('Se ha eliminado ' + this.contador + ' registros.', '', {
              timeOut: 6000,
            });
            this.ingresar = true;
          }
          this.ObtenerRoles();
        }
      });
    }
    )
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
