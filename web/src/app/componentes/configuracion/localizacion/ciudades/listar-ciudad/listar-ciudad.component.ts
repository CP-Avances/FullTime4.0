import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { DateTime } from 'luxon';
import { Router } from '@angular/router';
import * as xml2js from 'xml2js';
import * as FileSaver from 'file-saver';
import ExcelJS, { FillPattern } from "exceljs";
import { RegistrarCiudadComponent } from 'src/app/componentes/configuracion/localizacion/ciudades/registrar-ciudad/registrar-ciudad.component'
import { MetodosComponent } from 'src/app/componentes/generales/metodoEliminar/metodos.component';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { ProvinciaService } from 'src/app/servicios/configuracion/localizacion/catProvincias/provincia.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { EmpresaService } from 'src/app/servicios/configuracion/parametrizacion/catEmpresa/empresa.service';
import { SelectionModel } from '@angular/cdk/collections';
import { ITableCiudades } from 'src/app/model/reportes.model';
import { CiudadService } from 'src/app/servicios/configuracion/localizacion/ciudad/ciudad.service';

@Component({
  selector: 'app-listar-ciudad',
  standalone: false,
  templateUrl: './listar-ciudad.component.html',
  styleUrls: ['./listar-ciudad.component.css'],
})

export class ListarCiudadComponent implements OnInit {
  ips_locales: any = '';

  private imagen: any;

  private bordeCompleto!: Partial<ExcelJS.Borders>;

  private bordeGrueso!: Partial<ExcelJS.Borders>;

  private fillAzul!: FillPattern;

  private fontTitulo!: Partial<ExcelJS.Font>;

  private fontHipervinculo!: Partial<ExcelJS.Font>;

  datosCiudadesEliminar: any = [];

  // ALMACENAMIENTO DE DATOS
  datosCiudades: any = [];
  empleado: any = [];
  idEmpleado: number;

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  ciudadF = new FormControl('', [Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{2,48}")]);
  provinciaF = new FormControl('', [Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{2,48}")]);

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    ciudadForm: this.ciudadF,
    provinciaForm: this.provinciaF,
  });

  constructor(
    private router: Router,
    private toastr: ToastrService,
    public rest: CiudadService,
    public restp: ProvinciaService,
    public restE: EmpleadoService,
    public ventana: MatDialog,
    public validar: ValidacionesService,
    public restEmpre: EmpresaService,
    
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');  
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    }); 
  
    this.ListarCiudades();
    this.ObtenerEmpleados(this.idEmpleado);
    this.ObtenerColores();
    this.ObtenerLogo();
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

  // METODO PARA VER LA INFORMACION DEL EMPLEADO
  ObtenerEmpleados(idemploy: any) {
    this.empleado = [];
    this.restE.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleado = data;
    })
  }

  // METODO PARA OBTENER EL LOGO DE LA EMPRESA
  logo: any = String;
  ObtenerLogo() {
    this.restEmpre.LogoEmpresaImagenBase64(localStorage.getItem('empresa') as string as string).subscribe(res => {
      this.logo = 'data:image/jpeg;base64,' + res.imagen;
    });
  }

  // METODO PARA OBTENER COLORES Y MARCA DE AGUA DE EMPRESA
  p_color: any;
  s_color: any;
  frase: any;
  ObtenerColores() {
    this.restEmpre.ConsultarDatosEmpresa(parseInt(localStorage.getItem('empresa') as string as string)).subscribe(res => {
      this.p_color = res[0].color_principal;
      this.s_color = res[0].color_secundario;
      this.frase = res[0].marca_agua;
    });
  }

  // METODO QUE MANEJA PAGINACION
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // METODO PARA LISTAR CIUDADES
  ListarCiudades() {
    this.datosCiudades = [];
    this.numero_pagina = 1;
    this.rest.ListarNombreCiudadProvincia().subscribe(datos => {
      this.datosCiudades = datos;
    })
  }

  // METODO PARA REGISTRAR CIUDAD
  AbrirVentanaRegistrarCiudad() {
    this.ventana.open(RegistrarCiudadComponent, { width: '600px' }).afterClosed().subscribe(item => {
      this.ListarCiudades();
    });
    this.activar_seleccion = true;
    this.plan_multiple = false;
    this.plan_multiple_ = false;
    this.selectiondatosCiudades.clear();
    this.datosCiudadesEliminar = [];
  }

  // METODO PARA VALIDAR INGRESO DE LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.formulario.setValue({
      ciudadForm: '',
      provinciaForm: ''
    });
    this.ListarCiudades;
  }

  /** ************************************************************************************************** **
   ** **                                      METODO PARA EXPORTAR A PDF                              ** **
   ** ************************************************************************************************** **/


  // GENERACION DE REPORTE DE PDF
  async GenerarPdf(action = "open") {
    const pdfMake = await this.validar.ImportarPDF();
    const documentDefinition = this.DefinirInformacionPDF();
    switch (action) {
      case "open":
        pdfMake.createPdf(documentDefinition).open();
        break;
      case "print":
        pdfMake.createPdf(documentDefinition).print();
        break;
      case "download":
        pdfMake.createPdf(documentDefinition).download('Ciudades' + '.pdf');
        break;

      default:
        pdfMake.createPdf(documentDefinition).open();
        break;
    }
  }

  DefinirInformacionPDF() {
    return {
      // ENCABEZADO DE LA PAGINA
      pageSize: 'A4',
      pageOrientation: "portrait",
      watermark: {
        text: this.frase,
        color: "blue",
        opacity: 0.1,
        bold: true,
        italics: false,
      },
      header: {
        text:
          "Impreso por:  " +
          this.empleado[0].nombre +
          " " +
          this.empleado[0].apellido,
        margin: 10,
        fontSize: 9,
        opacity: 0.3,
        alignment: "right",
      },
      // PIE DE PAGINA
      footer: function (
        currentPage: any,
        pageCount: any,
        fecha: any,
        hora: any
      ) {
        var f = DateTime.now();
        fecha = f.toFormat("yyyy-MM-dd");
        hora = f.toFormat("HH:mm:ss");
        return {
          margin: 10,
          columns: [
            { text: "Fecha: " + fecha + " Hora: " + hora, opacity: 0.3 },
            {
              text: [
                {
                  text: "© Pag " + currentPage.toString() + " of " + pageCount,
                  alignment: "right",
                  opacity: 0.3,
                },
              ],
            },
          ],
          fontSize: 10,
        };
      },
      content: [
        { image: this.logo, width: 100, margin: [10, -25, 0, 5] },
        { text: localStorage.getItem('name_empresa')?.toUpperCase(), bold: true, fontSize: 14, alignment: 'center', margin: [0, -30, 0, 5] },
        { text: 'LISTA DE CIUDADES', bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 0] },
        this.presentarDataPDFCiudades(),
      ],
      styles: {
        tableHeader: {
          fontSize: 9,
          bold: true,
          alignment: "center",
          fillColor: this.p_color,
        },
        itemsTable: { fontSize: 8 },
        itemsTableC: { fontSize: 8, alignment: "center" },
        tableMargin: { margin: [0, 5, 0, 0] },
      },
    };
  }

  presentarDataPDFCiudades() {
    return {
      columns: [
        { width: "*", text: "" },
        {
          width: "auto",
          style: 'tableMargin',
          table: {
            widths: ["auto", "auto"],
            body: [
              [
                { text: "Provincia", style: "tableHeader" },
                { text: "Ciudad", style: "tableHeader" },

              ],
              ...this.datosCiudades.map((obj: any) => {
                return [
                  { text: obj.provincia, style: "itemsTableC" },
                  { text: obj.nombre, style: "itemsTableC" },
                ];
              }),
            ],
          },
          // ESTILO DE COLORES FORMATO ZEBRA
          layout: {
            fillColor: function (i: any) {
              return i % 2 === 0 ? "#CCD1D1" : null;
            },
          },
        },
        { width: "*", text: "" },
      ],
    };
  }

  /** ************************************************************************************************** **
   ** **                                      METODO PARA EXPORTAR A EXCEL                            ** **
   ** ************************************************************************************************** **/
  async generarExcelCiudades() {

    const ciudadeslista: any[] = [];

    this.datosCiudades.forEach((ciudades: any, index: number) => {
      ciudadeslista.push([
        index + 1,
        ciudades.id,
        ciudades.nombre,
        ciudades.provincia,
        ciudades.id_prov,
      ]);
    });


    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Ciudades");


    this.imagen = workbook.addImage({
      base64: this.logo,
      extension: "png",
    });

    worksheet.addImage(this.imagen, {
      tl: { col: 0, row: 0 },
      ext: { width: 220, height: 105 },
    });
    // COMBINAR CELDAS
    worksheet.mergeCells("B1:E1");
    worksheet.mergeCells("B2:E2");
    worksheet.mergeCells("B3:E3");
    worksheet.mergeCells("B4:E4");
    worksheet.mergeCells("B5:E5");

    // AGREGAR LOS VALORES A LAS CELDAS COMBINADAS
    worksheet.getCell("B1").value = localStorage.getItem('name_empresa')?.toUpperCase();
    worksheet.getCell("B2").value = "Lista de Ciudades".toUpperCase();

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
      { key: "id", width: 20 },
      { key: "nombre", width: 20 },
      { key: "provincia", width: 20 },
      { key: "id_provincia", width: 20 },

    ];


    const columnas = [
      { name: "ITEM", totalsRowLabel: "Total:", filterButton: false },
      { name: "ID", totalsRowLabel: "Total:", filterButton: true },
      { name: "NOMBRE", totalsRowLabel: "", filterButton: true },
      { name: "PROVINCIA", totalsRowLabel: "", filterButton: true },
      { name: "ID_PROVINCIA", totalsRowLabel: "", filterButton: true },
    ];

    worksheet.addTable({
      name: "CiudadesTabla",
      ref: "A6",
      headerRow: true,
      totalsRow: false,
      style: {
        theme: "TableStyleMedium16",
        showRowStripes: true,
      },
      columns: columnas,
      rows: ciudadeslista,
    });


    const numeroFilas = ciudadeslista.length;
    for (let i = 0; i <= numeroFilas; i++) {
      for (let j = 1; j <= 5; j++) {
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
      FileSaver.saveAs(blob, "Ciudades.xlsx");
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

  /** ************************************************************************************************** **
   ** **                                      METODO PARA EXPORTAR A CSV                              ** **
   ** ************************************************************************************************** **/

  ExportToCSV() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('CiudadesCSV');
    //  Agregar encabezados dinámicos basados en las claves del primer objeto
    const keys = Object.keys(this.datosCiudades[0] || {}); // Obtener las claves
    worksheet.columns = keys.map(key => ({ header: key, key, width: 20 }));
    // Llenar las filas con los datos
    this.datosCiudades.forEach((obj: any) => {
      worksheet.addRow(obj);
    });
  
    workbook.csv.writeBuffer().then((buffer) => {
      const data: Blob = new Blob([buffer], { type: 'text/csv;charset=utf-8;' });
      FileSaver.saveAs(data, "CiudadesCSV.csv");
    });

  }

  /** ************************************************************************************************* **
   ** **                                PARA LA EXPORTACION DE ARCHIVOS XML                          ** **
   ** ************************************************************************************************* **/

  urlxml: string;
  data: any = [];
  exportToXML() {
    var objeto: any;
    var arregloCiudades: any = [];
    this.datosCiudades.forEach((obj: any) => {
      objeto = {
        ciudad: {
          "$": { "id": obj.id },
          nombre: obj.nombre,
          provincia: obj.provincia
        },
      };
      arregloCiudades.push(objeto);
    });

    const xmlBuilder = new xml2js.Builder({ rootName: 'Ciudades' });
    const xml = xmlBuilder.buildObject(arregloCiudades);

    if (xml === undefined) {
      console.error('Error al construir el objeto XML.');
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
    a.download = 'Ciudades.xml';
    // SIMULAR UN CLIC EN EL ENLACE PARA INICIAR LA DESCARGA
    a.click();

  }

  /** ************************************************************************************************* **
   ** **                               METODO DE SELECCION MULTIPLE DE DATOS                         ** **
   ** ************************************************************************************************* **/

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
  selectiondatosCiudades = new SelectionModel<ITableCiudades>(true, []);

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedPag() {
    const numSelected = this.selectiondatosCiudades.selected.length;
    return numSelected === this.datosCiudades.length;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterTogglePag() {
    this.isAllSelectedPag() ?
      this.selectiondatosCiudades.clear() :
      this.datosCiudades.forEach((row: any) => this.selectiondatosCiudades.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelPag(row?: ITableCiudades): string {
    if (!row) {
      return `${this.isAllSelectedPag() ? 'select' : 'deselect'} all`;
    }
    this.datosCiudadesEliminar = this.selectiondatosCiudades.selected;

    return `${this.selectiondatosCiudades.isSelected(row) ? 'deselect' : 'select'} row ${row.nombre + 1}`;

  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO
  Eliminar(id_ciu: number) {
    const datos = {
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales
    }
    this.rest.EliminarCiudad(id_ciu, datos).subscribe((res: any) => {
      if (res.message === 'error') {
        this.toastr.error('Existen datos relacionados con este registro.', 'No fue posible eliminar.', {
          timeOut: 6000,
        });
      } else {
        this.toastr.error('Registro eliminado.', '', {
          timeOut: 6000,
        });
        this.ListarCiudades();
      }
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  ConfirmarDelete(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Eliminar(datos.id);
          this.activar_seleccion = true;
          this.plan_multiple = false;
          this.plan_multiple_ = false;
          this.datosCiudadesEliminar = [];
          this.selectiondatosCiudades.clear();
          this.ListarCiudades();
        } else {
          this.router.navigate(['/listarCiudades']);
        }
      });
  }

  // METODO DE ELIMINACION MULTIPLE
  contador: number = 0;
  ingresar: boolean = false;
  EliminarMultiple() {
    const data = {
      user_name: this.user_name,
      ip: this.ip,
      ip_local: this.ips_locales
    };
  
    let eliminados = 0;
    let totalProcesados = 0;
    const totalSeleccionados = this.selectiondatosCiudades.selected.length;
  
    this.datosCiudadesEliminar = this.selectiondatosCiudades.selected;
  
    this.datosCiudadesEliminar.forEach((datos: any) => {
      this.rest.EliminarCiudad(datos.id, data).subscribe((res: any) => {
        totalProcesados++;
  
        if (res.message === 'error') {
          this.toastr.warning('Existen datos relacionados con ' + datos.nombre + '.', 'No fue posible eliminar.', {
            timeOut: 6000,
          });
        } else {
          eliminados++;
          this.datosCiudades = this.datosCiudades.filter(item => item.id !== datos.id);
        }
  
        if (totalProcesados === totalSeleccionados) {
          if (eliminados > 0) {
            this.toastr.error(`Se ha eliminado ${eliminados} registro${eliminados > 1 ? 's' : ''}.`, '', {
              timeOut: 6000,
            });
          }
  
          this.selectiondatosCiudades.clear();
          this.datosCiudadesEliminar = [];
          this.ListarCiudades();
        }
      });
    });
  }
  

  // METODO DE CONFIRMACION DE ELIMINACION MULTIPLE
  ConfirmarDeleteMultiple() {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          if (this.datosCiudadesEliminar.length != 0) {
            this.EliminarMultiple();
            this.activar_seleccion = true;
            this.plan_multiple = false;
            this.plan_multiple_ = false;
            this.datosCiudadesEliminar = [];
            this.selectiondatosCiudades.clear();
            this.ListarCiudades();
          } else {
            this.toastr.warning('No ha seleccionado CIUDADES.', 'Ups! algo salio mal.', {
              timeOut: 6000,
            })
          }
        } else {
          this.router.navigate(['/listarCiudades']);
        }
      });
  }

  //CONTROL BOTONES
  private tienePermiso(accion: string): boolean {
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      try {
        const datos = JSON.parse(datosRecuperados);
        return datos.some((item: any) => item.accion === accion);
      } catch {
        return false;
      }
    } else {
      // Si no hay datos, se permite si el rol es 1 (Admin)
      return parseInt(localStorage.getItem('rol') || '0') === 1;
    }
  }

  getCrearCiudad(){
    return this.tienePermiso('Crear Ciudad');
  }

  getEliminarCiudad(){
    return this.tienePermiso('Eliminar Ciudad');
  }

  getDescargarReportes(){
    return this.tienePermiso('Descargar Reportes Ciudades');
  }

}
