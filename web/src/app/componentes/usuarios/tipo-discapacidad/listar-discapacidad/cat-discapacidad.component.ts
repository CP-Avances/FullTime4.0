import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { DateTime } from 'luxon';

import * as xml2js from 'xml2js';
import * as FileSaver from 'file-saver';
import ExcelJS, { FillPattern } from "exceljs";

import { PlantillaReportesService } from '../../../reportes/plantilla-reportes.service';
import { CatDiscapacidadService } from 'src/app/servicios/usuarios/catDiscapacidad/cat-discapacidad.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { ITableDiscapacidad } from 'src/app/model/reportes.model';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';

import { RegistroDiscapacidadComponent } from '../registrar-discapacidad/registrar-discapacidad.component';
import { EditarDiscapacidadComponent } from '../editar-discapacidad/editar-discapacidad.component';
import { MetodosComponent } from '../../../generales/metodoEliminar/metodos.component';

@Component({
  selector: 'app-cat-discapacidad',
  templateUrl: './cat-discapacidad.component.html',
  styleUrls: ['./cat-discapacidad.component.css']
})

export class CatDiscapacidadComponent implements OnInit {
  ips_locales: any = '';

  private imagen: any;

  private bordeCompleto!: Partial<ExcelJS.Borders>;

  private bordeGrueso!: Partial<ExcelJS.Borders>;

  private fillAzul!: FillPattern;

  private fontTitulo!: Partial<ExcelJS.Font>;

  private fontHipervinculo!: Partial<ExcelJS.Font>;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  nombreF = new FormControl('', [Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{2,48}")]);

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    nombreForm: this.nombreF,
  });

  // METODO PARA VALIDAR INGRESO DE LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  archivoForm = new FormControl('', Validators.required);

  // VARIABLE PARA TOMAR RUTA DEL SISTEMA
  hipervinculo: string = environment.url

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_paginaMul: number = 5;
  numero_paginaMul: number = 1;

  discapacidadesEliminar: any = [];
  discapacidades: any;
  idEmpleado: number; // VARIABLE DE ALMACENAMIENTO DE ID DE EMPLEADO QUE INICIA SESION
  empleado: any = [];

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  tiposDiscapacidadCorrectos: number = 0;

  // METODO DE LLAMADO DE DATOS DE EMPRESA COLORES - LOGO - MARCA DE AGUA
  get s_color(): string { return this.plantillaPDF.color_Secundary }
  get p_color(): string { return this.plantillaPDF.color_Primary }
  get frase(): string { return this.plantillaPDF.marca_Agua }
  get logo(): string { return this.plantillaPDF.logoBase64 }

  constructor(
    private plantillaPDF: PlantillaReportesService, // SERVICIO DATOS DE EMPRESA
    private toastr: ToastrService, // VARIABLE DE MENSAJES DE NOTIFICACIONES
    private restE: EmpleadoService, // SERVICIO DATOS DE EMPLEADO
    private rest: CatDiscapacidadService,
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

    this.discapacidades = [];
    this.ObtenerEmpleados(this.idEmpleado);
    this.ObtenerDiscapacidad();
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

  // METODO PARA LISTAR TIPOS DE DISCAPACIDAD
  ObtenerDiscapacidad() {
    this.discapacidades = [];
    this.rest.ListarDiscapacidad().subscribe(res => {
      this.discapacidades = res
    }, error => {
      if (error.status == 400 || error.status == 404) {
        this.toastr.info('No se han encontrado registros.', '', {
          timeOut: 3500,
        });
      } else {
        this.toastr.error('Error al cargar los datos.', 'Discapacidad', {
          timeOut: 3500,
        });
      }
    });
  }

  // METODO PARA LIMPIAR FOMULARIO
  LimpiarCampos() {
    this.Datos_discapacidad = null;
    this.archivoSubido = [];
    this.nameFile = '';
    this.formulario.setValue({
      nombreForm: '',
    });
    this.ngOnInit();
    this.messajeExcel = '';
    this.archivoForm.reset();
    this.mostrarbtnsubir = false;
  }

  // METODO PARA ABRI VENTANA DE REGISTRO
  AbrirVentanaRegistrarDiscapacidad(): void {
    this.ventana.open(RegistroDiscapacidadComponent, { width: '500px' })
      .afterClosed().subscribe(items => {
        this.ngOnInit();
      });
    this.activar_seleccion = true;
    this.plan_multiple = false;
    this.plan_multiple_ = false;
    this.selectionDiscapacidad.clear();
    this.discapacidadesEliminar = [];
  }

  // METODO PARA EDITAR MODALIDAD LABORAL
  AbrirEditar(item_modalidad: any): void {
    this.ventana.open(EditarDiscapacidadComponent, { width: '450px', data: item_modalidad })
      .afterClosed().subscribe(items => {
        this.ngOnInit();
      });
  }

  // CONTROL DE PAGINACION
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1
  }

  // EVENTO PARA MOSTRAR FILAS DETERMINADAS EN LA TABLA
  ManejarPaginaMulti(e: PageEvent) {
    this.tamanio_paginaMul = e.pageSize;
    this.numero_paginaMul = e.pageIndex + 1
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

  // VARIABLES DE MANEJO DE PLANTILLA DE DATOS
  nameFile: string;
  archivoSubido: Array<File>;
  mostrarbtnsubir: boolean = false;
  // METODO PARA SELECCIONAR PLANTILLA DE DATOS
  FileChange(element: any) {
    this.numero_paginaMul = 1;
    this.tamanio_paginaMul = 5;
    this.paginator.firstPage();
    this.archivoSubido = [];
    this.nameFile = '';
    this.archivoSubido = element.target.files;
    this.nameFile = this.archivoSubido[0].name;
    let arrayItems = this.nameFile.split(".");
    let itemExtencion = arrayItems[arrayItems.length - 1];
    let itemName = arrayItems[0];
    if (itemExtencion == 'xlsx' || itemExtencion == 'xls') {
      if (itemName.toLowerCase().startsWith('plantillaconfiguraciongeneral')) {
        this.numero_paginaMul = 1;
        this.tamanio_paginaMul = 5;
        this.Revisarplantilla();
      } else {
        this.toastr.error('Seleccione plantilla con nombre plantillaConfiguracionGeneral.', 'Plantilla seleccionada incorrecta.', {
          timeOut: 6000,
        });

        this.nameFile = '';
      }
    } else {
      this.toastr.error('Error en el formato del documento.', 'Plantilla no aceptada.', {
        timeOut: 6000,
      });

      this.nameFile = '';
    }
    this.archivoForm.reset();
    this.mostrarbtnsubir = true;
  }

  // METODO PARA REVISAR DATOS DE PLANTILLA
  Datos_discapacidad: any
  listaDiscapacidadCorrectas: any = [];
  messajeExcel: string = '';
  Revisarplantilla() {
    this.listaDiscapacidadCorrectas = [];
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads", this.archivoSubido[i], this.archivoSubido[i].name);
    }

    // VERIFICACION DE DATOS FORMATO - DUPLICIDAD DENTRO DEL SISTEMA
    this.rest.RevisarFormato(formData).subscribe(res => {
      this.Datos_discapacidad = res.data;
      this.messajeExcel = res.message;

      this.Datos_discapacidad.sort((a: any, b: any) => {
        if (a.observacion !== 'ok' && b.observacion === 'ok') {
          return -1;
        }
        if (a.observacion === 'ok' && b.observacion !== 'ok') {
          return 1;
        }
        return 0;
      });

      if (this.messajeExcel == 'error') {
        this.toastr.error('Revisar que la numeración de la columna "item" sea correcta.', 'Plantilla no aceptada.', {
          timeOut: 4500,
        });
        this.mostrarbtnsubir = false;
      }
      else if (this.messajeExcel == 'no_existe') {
        this.toastr.error('No se ha encontrado pestaña TIPO_DISCAPACIDAD en la plantilla.', 'Plantilla no aceptada.', {
          timeOut: 4500,
        });
        this.mostrarbtnsubir = false;
      }
      else {
        this.Datos_discapacidad.forEach((item: any) => {
          if (item.observacion.toLowerCase() == 'ok') {
            this.listaDiscapacidadCorrectas.push(item);
          }
        });

        this.tiposDiscapacidadCorrectos = this.listaDiscapacidadCorrectas.length;
      }
    }, error => {
      this.toastr.error('Error al cargar los datos.', 'Plantilla no aceptada.', {
        timeOut: 4000,
      });
    });
  }

  // METODO PARA DAR COLOR A LAS CELDAS Y REPRESENTAR LAS VALIDACIONES
  colorCelda: string = ''
  EstiloCelda(observacion: string): string {
    let arrayObservacion = observacion.split(" ");
    if (observacion == 'Registro duplicado') {
      return 'rgb(156, 214, 255)';
    } else if (observacion == 'ok') {
      return 'rgb(159, 221, 154)';
    } else if (observacion == 'Ya existe en el sistema') {
      return 'rgb(239, 203, 106)';
    } else if (arrayObservacion[0] == 'Discapacidad ') {
      return 'rgb(242, 21, 21)';
    } else {
      return 'rgb(242, 21, 21)';
    }
  }

  colorTexto: string = '';
  EstiloTextoCelda(texto: string): string {
    let arrayObservacion = texto.split(" ");
    if (arrayObservacion[0] == 'No') {
      return 'rgb(255, 80, 80)';
    } else {
      return 'black'
    }
  }

  // FUNCION PARA CONFIRMAR EL REGISTRO MULTIPLE DE DATOS DEL ARCHIVO EXCEL
  ConfirmarRegistroMultiple() {
    const mensaje = 'registro';
    this.ventana.open(MetodosComponent, { width: '450px', data: mensaje }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.SubirDatosPlantilla();
        }
      });
  }

  // METODO PARA CARGAR LOS DATOS DE LA PLANTILLA
  SubirDatosPlantilla() {
    if (this.listaDiscapacidadCorrectas.length > 0) {
      const data = {
        plantilla: this.listaDiscapacidadCorrectas,
        user_name: this.user_name,
        ip: this.ip, ip_local: this.ips_locales,
      }
      this.rest.SubirArchivoExcel(data).subscribe({
        next: (response) => {
          this.toastr.success('Operación exitosa.', 'Plantilla de Discapacidad importada.', {
            timeOut: 3000,
          });
          this.LimpiarCampos();
          this.archivoForm.reset();
          this.nameFile = '';
        },
        error: (error) => {
          ;
          this.toastr.error('No se pudo cargar la plantilla', 'Ups !!! algo salio mal', {
            timeOut: 4000,
          });
        }
      });
    } else {
      this.toastr.error('No se ha encontrado datos para su registro.', 'Plantilla procesada.', {
        timeOut: 4000,
      });
      this.archivoForm.reset();
      this.nameFile = '';
    }
  }


  /** ************************************************************************************************* **
   ** **                           PARA LA EXPORTACION DE ARCHIVOS PDF                               ** **
   ** ************************************************************************************************* **/


  async GenerarPdf(action = 'open') {
    this.OrdenarDatos(this.discapacidades);
    const pdfMake = await this.validar.ImportarPDF();
    const documentDefinition = this.DefinirInformacionPDF();
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download('Discapacidad.pdf'); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
    this.ObtenerDiscapacidad();
  }

  DefinirInformacionPDF() {
    return {
      // ENCABEZADO DE LA PAGINA
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por: ' + this.empleado[0].nombre + ' ' + this.empleado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },
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
        { image: this.logo, width: 100, margin: [10, -25, 0, 5] },
        { text: localStorage.getItem('name_empresa')?.toUpperCase(), bold: true, fontSize: 14, alignment: 'center', margin: [0, -30, 0, 5] },
        { text: 'LISTA DE DISCAPACIDADES', bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 0] },
        this.PresentarDataPDFDiscapacidades(),
      ],
      styles: {
        tableHeader: { fontSize: 9, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 8, alignment: 'center' },
        itemsTableD: { fontSize: 8 },
        tableMargin: { margin: [0, 5, 0, 0] },
      }
    };
  }

  PresentarDataPDFDiscapacidades() {
    return {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          style: 'tableMargin',
          table: {
            widths: ['*', '*'],
            body: [
              [
                { text: 'CÓDIGO', style: 'tableHeader' },
                { text: 'NOMBRE', style: 'tableHeader' },

              ],
              ...this.discapacidades.map((obj: any) => {
                return [
                  { text: obj.id, style: 'itemsTableD' },
                  { text: obj.nombre, style: 'itemsTable' },

                ];
              })
            ]
          },
          // ESTILO DE COLORES FORMATO ZEBRA
          layout: {
            fillColor: function (i: any) {
              return (i % 2 === 0) ? '#CCD1D1' : null;
            }
          }
        },
        { width: '*', text: '' },
      ]
    };
  }

  /** ************************************************************************************************* **
   ** **                          PARA LA EXPORTACION DE ARCHIVOS EXCEL                              ** **
   ** ************************************************************************************************* **/
  
  async generarExcel() {
    let datos: any[] = [];
    let n: number = 1;

    this.discapacidades.map((obj: any) => {
      datos.push([
        n++,
        obj.id,
        obj.nombre
      ])
    })

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Discapacidades");
    this.imagen = workbook.addImage({
      base64: this.logo,
      extension: "png",
    });

    worksheet.addImage(this.imagen, {
      tl: { col: 0, row: 0 },
      ext: { width: 220, height: 105 },
    });
    // COMBINAR CELDAS
    worksheet.mergeCells("B1:C1");
    worksheet.mergeCells("B2:C2");
    worksheet.mergeCells("B3:C3");
    worksheet.mergeCells("B4:C4");
    worksheet.mergeCells("B5:C5");

    // AGREGAR LOS VALORES A LAS CELDAS COMBINADAS
    worksheet.getCell("B1").value = localStorage.getItem('name_empresa')?.toUpperCase();
    worksheet.getCell("B2").value = 'LISTA TIPO DISCAPACIDADES';

    // APLICAR ESTILO DE CENTRADO Y NEGRITA A LAS CELDAS COMBINADAS
    ["B1", "B2"].forEach((cell) => {
      worksheet.getCell(cell).alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      worksheet.getCell(cell).font = { bold: true, size: 14 };
    });


    worksheet.columns = [
      { key: "n", width: 20 },
      { key: "codigo", width: 30 },
      { key: "nombre", width: 40 },
    ];

    const columnas = [
      { name: "ITEM", totalsRowLabel: "Total:", filterButton: false },
      { name: "CÓDIGO", totalsRowLabel: "Total:", filterButton: true },
      { name: "NOMBRE", totalsRowLabel: "", filterButton: true },
    ]

    worksheet.addTable({
      name: "DiscapacidadesTabla",
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
      for (let j = 1; j <= 3; j++) {
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
      FileSaver.saveAs(blob, "DiscapacidadEXCEL.xlsx");
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
   ** **                              PARA LA EXPORTACION DE ARCHIVOS XML                            ** **
   ** ************************************************************************************************* **/

  urlxml: string;
  data: any = [];
  ExportToXML() {
    this.OrdenarDatos(this.discapacidades);
    var objeto;
    var arregloDiscapacidades: any = [];
    this.discapacidades.forEach((obj: any) => {
      objeto = {
        "discapacidad": {
          "$": { "id": obj.id },
          "nombre": obj.nombre,
        }
      }
      arregloDiscapacidades.push(objeto)
    });

    const xmlBuilder = new xml2js.Builder({ rootName: 'Dicapacidades' });
    const xml = xmlBuilder.buildObject(arregloDiscapacidades);

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
    a.download = 'Discapacidades.xml';
    // SIMULAR UN CLIC EN EL ENLACE PARA INICIAR LA DESCARGA
    a.click();

    this.ObtenerDiscapacidad();
  }

  /** ************************************************************************************************** **
   ** **                                METODO PARA EXPORTAR A CSV                                    ** **
   ** ************************************************************************************************** **/
  
  ExportToCSV() {

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('DiscapacidadesCSV');
    //  Agregar encabezados dinámicos basados en las claves del primer objeto
    const keys = Object.keys(this.discapacidades[0] || {}); // Obtener las claves
    worksheet.columns = keys.map(key => ({ header: key, key, width: 20 }));
    // Llenar las filas con los datos
    this.discapacidades.forEach((obj: any) => {
      worksheet.addRow(obj);
    });
    workbook.csv.writeBuffer().then((buffer) => {
      const data: Blob = new Blob([buffer], { type: 'text/csv;charset=utf-8;' });
      FileSaver.saveAs(data, "DiscapacidadesCSV.csv");
    });

  }

  /** ************************************************************************************************* **
   ** **                           METODO DE SELECCION MULTIPLE DE DATOS                             ** **
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

  selectionDiscapacidad = new SelectionModel<ITableDiscapacidad>(true, []);

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedPag() {
    const numSelected = this.selectionDiscapacidad.selected.length;
    return numSelected === this.discapacidades.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterTogglePag() {
    this.isAllSelectedPag() ?
      this.selectionDiscapacidad.clear() :
      this.discapacidades.forEach((row: any) => this.selectionDiscapacidad.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelPag(row?: ITableDiscapacidad): string {
    if (!row) {
      return `${this.isAllSelectedPag() ? 'select' : 'deselect'} all`;
    }
    this.discapacidadesEliminar = this.selectionDiscapacidad.selected;
    return `${this.selectionDiscapacidad.isSelected(row) ? 'deselect' : 'select'} row ${row.nombre + 1}`;
  }

  // METODO PARA CONFIRMAR ELIMINACION
  ConfirmarDelete(discapacidad: any) {
    const mensaje = 'eliminar';
    const data = {
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
    }
    this.ventana.open(MetodosComponent, { width: '450px', data: mensaje }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.rest.Eliminar(discapacidad.id, data).subscribe((res: any) => {
            if (res.message === 'error') {
              this.toastr.error('Existen datos relacionados con este registro.', 'No fue posible eliminar.', {
                timeOut: 6000,
              });
            } else {
              this.toastr.error('Registro eliminado.', '', {
                timeOut: 6000,
              });
              this.ngOnInit();
            }
          })
          this.activar_seleccion = true;
          this.plan_multiple = false;
          this.plan_multiple_ = false;
          this.discapacidadesEliminar = [];
          this.selectionDiscapacidad.clear();
          this.ngOnInit();
        }
      });
  }

  // METODO PARA ELIMINAR DATOS
  contador: number = 0;
  ingresar: boolean = false;
  EliminarMultiple() {
    const data = {
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
    }
    this.ingresar = false;
    this.contador = 0;
    this.discapacidadesEliminar = this.selectionDiscapacidad.selected;
    this.discapacidadesEliminar.forEach((datos: any) => {
      this.discapacidades = this.discapacidades.filter(item => item.id !== datos.id);
      this.contador = this.contador + 1;
      this.rest.Eliminar(datos.id, data).subscribe((res: any) => {
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
          this.ngOnInit();
        }
      });
    }
    );
  }

  // METODO PARA CONFIRMAR ELIMINACION MULTIPLE
  ConfirmarDeleteMultiple() {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          if (this.discapacidadesEliminar.length != 0) {
            this.EliminarMultiple();
            this.activar_seleccion = true;
            this.plan_multiple = false;
            this.plan_multiple_ = false;
            this.discapacidadesEliminar = [];
            this.selectionDiscapacidad.clear();
            this.ngOnInit();
          } else {
            this.toastr.warning('No ha seleccionado DISCAPACIDADES.', 'Ups!!! algo salio mal.', {
              timeOut: 6000,
            })
          }
        }
      });
  }

}
