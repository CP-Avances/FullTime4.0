import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { DateTime } from 'luxon';
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';


import * as xml2js from 'xml2js';
import * as FileSaver from 'file-saver';
import ExcelJS, { FillPattern } from "exceljs";

import { CatModalidadLaboralService } from 'src/app/servicios/configuracion/parametrizacion/catModalidadLaboral/cat-modalidad-laboral.service';
import { PlantillaReportesService } from 'src/app/componentes/reportes/plantilla-reportes.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/configuracion/parametrizacion/parametrosGenerales/parametros.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';

import { SelectionModel } from '@angular/cdk/collections';
import { ITableModalidad } from 'src/app/model/reportes.model';

import { MetodosComponent } from 'src/app/componentes/generales/metodoEliminar/metodos.component';
import { EditarModalidadComponent } from '../editar-modalidad/editar-modalidad.component';
import { RegistroModalidadComponent } from '../registro-modalidad/registro-modalidad.component';

@Component({
  selector: 'app-cat-modalida-laboral',
  standalone: false,
  templateUrl: './cat-modalida-laboral.component.html',
  styleUrls: ['./cat-modalida-laboral.component.css']
})

export class CatModalidaLaboralComponent implements OnInit {
  ips_locales: any = '';

  private imagen: any;

  private bordeCompleto!: Partial<ExcelJS.Borders>;

  private bordeGrueso!: Partial<ExcelJS.Borders>;

  private fillAzul!: FillPattern;

  private fontTitulo!: Partial<ExcelJS.Font>;

  private fontHipervinculo!: Partial<ExcelJS.Font>;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  modalidadesEliminar: any = [];

  archivoForm = new FormControl('', Validators.required);

  // VARIABLE PARA TOMAR RUTA DEL SISTEMA
  hipervinculo: string = (localStorage.getItem('empresaURL') as string);

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_paginaMul: number = 5;
  numero_paginaMul: number = 1;

  listaModalida_Laboral: any;
  empleado: any = [];
  idEmpleado: number; // VARIABLE DE ALMACENAMIENTO DE ID DE EMPLEADO QUE INICIA SESION

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  modalidadesCorrectas: number = 0;

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  buscarModalidad = new FormControl('', [Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{2,48}")]);

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    nombreForm: this.buscarModalidad,
  });

  // METODO DE LLAMADO DE DATOS DE EMPRESA COLORES - LOGO - MARCA DE AGUA
  get s_color(): string { return this.plantillaPDF.color_Secundary }
  get p_color(): string { return this.plantillaPDF.color_Primary }
  get frase(): string { return this.plantillaPDF.marca_Agua }
  get logo(): string { return this.plantillaPDF.logoBase64 }

  constructor(
    private _ModalidaLaboral: CatModalidadLaboralService,
    private plantillaPDF: PlantillaReportesService, // SERVICIO DATOS DE EMPRESA
    private toastr: ToastrService, // VARIABLE DE MENSAJES DE NOTIFICACIONES
    private restE: EmpleadoService, // SERVICIO DATOS DE EMPLEADO
    public ventana: MatDialog, // VARIABLE DE MANEJO DE VENTANAS
    public validar: ValidacionesService,
    public parametro: ParametrosService,
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit() {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });

    this.listaModalida_Laboral = [];
    this.ObtenerEmpleados(this.idEmpleado);
    this.BuscarParametro();
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

  // METODO PARA BUSCAR PARAMETRO DE FORMATO DE FECHA
  formato_fecha: string = 'dd/MM/yyyy';
  BuscarParametro() {
    // id_tipo_parametro Formato fecha = 1
    this.parametro.ListarDetalleParametros(1).subscribe(
      res => {
        this.formato_fecha = res[0].descripcion;
        this.ObtenerModalidaLaboral()
      },
      vacio => {
        this.ObtenerModalidaLaboral()
      });
  }

  ObtenerModalidaLaboral() {
    this._ModalidaLaboral.listaModalidad_laboral().subscribe(res => {
      this.listaModalida_Laboral = res
    }, error => {
      if (error.status == 400 || error.status == 404) {
        this.toastr.info('No se ha encontrado registros.', '', {
          timeOut: 1500,
        });
      } else {
        this.toastr.error('Error al cargar los datos.', 'Ups! algo salio mal.', {
          timeOut: 3500,
        });
      }
    });
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.Datos_modalidad_laboral = null;
    this.archivoSubido = [];
    this.nameFile = '';
    this.archivoForm.reset();
    this.mostrarbtnsubir = false;
    this.messajeExcel = '';
    this.formulario.setValue({
      nombreForm: '',
    });
    this.ObtenerModalidaLaboral();
  }

  // METODO PARA ABRIR VENTANA REGISTRO DE MODALIDAD LABORAL
  AbrirVentanaRegistrarModalidad(): void {
    (document.activeElement as HTMLElement)?.blur();
    this.ventana.open(RegistroModalidadComponent, { width: '500px' })
      .afterClosed().subscribe(items => {
        this.ngOnInit();
      });
    this.activar_seleccion = true;
    this.plan_multiple = false;
    this.plan_multiple_ = false;
    this.selectionModalidad.clear();
    this.modalidadesEliminar = [];
  }

  // METODO PARA EDITAR MODALIDAD LABORAL
  AbrirEditar(item_modalidad: any): void {
    this.ventana.open(EditarModalidadComponent, { width: '450px', data: item_modalidad })
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
        this.toastr.error('Seleccione plantilla con nombre plantillaConfiguracionGeneral.', 'Plantilla seleccionada incorrecta', {
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

  // METODO PARA VALIDAR DATOS DE PLANTILLAS
  Datos_modalidad_laboral: any
  listaModalidadCorrectas: any = [];
  messajeExcel: string = '';
  Revisarplantilla() {
    this.listaModalidadCorrectas = [];
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads", this.archivoSubido[i], this.archivoSubido[i].name);
    }
    // VERIFICACION DE DATOS FORMATO - DUPLICIDAD DENTRO DEL SISTEMA
    this._ModalidaLaboral.RevisarFormato(formData).subscribe(res => {
      this.Datos_modalidad_laboral = res.data;
      this.messajeExcel = res.message;
      if (this.messajeExcel == 'error') {
        this.toastr.error('Revisar que la numeración de la columna "item" sea correcta.', 'Plantilla no aceptada.', {
          timeOut: 4500,
        });
        this.mostrarbtnsubir = false;
      }
      else if (this.messajeExcel == 'no_existe') {
        this.toastr.error('No se ha encontrado pestaña MODALIDAD_LABORAL en la plantilla.', 'Plantilla no aceptada.', {
          timeOut: 4500,
        });
        this.mostrarbtnsubir = false;
      }
      else {
        this.Datos_modalidad_laboral.sort((a: any, b: any) => {
          if (a.observacion !== 'ok' && b.observacion === 'ok') {
            return -1;
          }
          if (a.observacion === 'ok' && b.observacion !== 'ok') {
            return 1;
          }
          return 0;
        });
        this.Datos_modalidad_laboral.forEach((item: any) => {
          if (item.observacion.toLowerCase() == 'ok') {
            this.listaModalidadCorrectas.push(item);
          }
        });
        this.modalidadesCorrectas = this.listaModalidadCorrectas.length;
      }
    }, error => {
      this.toastr.error('Error al cargar los datos', 'Plantilla no aceptada', {
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
    } else if (arrayObservacion[0] == 'Modalidad Laboral ') {
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
    (document.activeElement as HTMLElement)?.blur();
    this.ventana.open(MetodosComponent, { width: '450px', data: mensaje }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.SubirDatosPlantilla()
        }
      });
  }

  // METODO PARA CARGAR DATOS DE PLANTIILA AL SISTEMA
  SubirDatosPlantilla() {
    if (this.listaModalidadCorrectas.length > 0) {
      const data = {
        plantilla: this.listaModalidadCorrectas,
        user_name: this.user_name,
        ip: this.ip,
        ip_local: this.ips_locales
      }
      this._ModalidaLaboral.SubirArchivoExcel(data).subscribe({
        next: (response: any) => {
          this.toastr.success('Plantilla de Modalidad laboral importada.', 'Operación exitosa.', {
            timeOut: 3000,
          });
          this.LimpiarCampos();
          this.archivoForm.reset();
          this.nameFile = '';
        },
        error: (error: any) => {
          this.toastr.error('No se pudo cargar la plantilla.', 'Ups! algo salio mal.', {
            timeOut: 4000,
          });
          this.archivoForm.reset();
          this.nameFile = '';
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


  /** ************************************************************************************************* **
   ** **                           PARA LA EXPORTACION DE ARCHIVOS PDF                               ** **
   ** ************************************************************************************************* **/

  async GenerarPdf(action = 'open') {
    this.OrdenarDatos(this.listaModalida_Laboral);

    // 👉 Usar microservicio SOLO si es 'download'
    if (action === 'download') {
      const data = {
        usuario: this.empleado[0].nombre + ' ' + this.empleado[0].apellido,
        empresa: localStorage.getItem('name_empresa')?.toUpperCase(),
        fraseMarcaAgua: this.frase,
        logoBase64: this.logo,
        colorPrincipal: this.p_color,
        modalidades: this.listaModalida_Laboral.map((item: any) => ({
          id: item.id,
          descripcion: item.descripcion
        }))
      };

      console.log("Enviando al microservicio:", data);

      this.validar.generarReporteModalidadLaboral(data).subscribe((pdfBlob: Blob) => {
        FileSaver.saveAs(pdfBlob, 'Modalidad_Laboral.pdf');
        console.log("PDF generado correctamente desde el microservicio.");
      }, error => {
        console.error('Error al generar PDF desde el microservicio:', error);
                this.toastr.error(
          'No se pudo generar el reporte. El servicio de reportes no está disponible en este momento. Intentelo mas tarde',
          'Error'
        );
      });

    } else {
      // 👈 Para 'open' o 'print' se usa aún pdfMake local
      const pdfMake = await this.validar.ImportarPDF();
      const documentDefinition = this.DefinirInformacionPDF();

      switch (action) {
        case 'open':
          pdfMake.createPdf(documentDefinition).open();
          break;
        case 'print':
          pdfMake.createPdf(documentDefinition).print();
          break;
        default:
          pdfMake.createPdf(documentDefinition).open();
          break;
      }
    }

    this.BuscarParametro();
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
        { text: 'MODALIDAD LABORAL', bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 0] },
        this.PresentarDataPDF(),
      ],
      styles: {
        tableHeader: { fontSize: 9, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 8, alignment: 'center' },
        itemsTableD: { fontSize: 8, alignment: 'center' },
        tableMargin: { margin: [0, 5, 0, 0] },
      }
    };
  }

  PresentarDataPDF() {
    return {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          style: 'tableMargin',
          table: {
            widths: ['auto', 'auto'],
            body: [
              [
                { text: 'ITEM', style: 'tableHeader' },
                { text: 'MODALIDAD LABORAL', style: 'tableHeader' },
              ],
              ...this.listaModalida_Laboral.map((obj: any) => {
                return [
                  { text: obj.id, style: 'itemsTable' },
                  { text: obj.descripcion, style: 'itemsTableD' },
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


  async generarExcelModalidad() {
    let datos: any[] = [];
    let n: number = 1;

    this.listaModalida_Laboral.map((obj: any) => {
      datos.push([
        n++,
        obj.id,
        obj.descripcion,
      ])
    })

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Modalidad Laboral");
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
    worksheet.getCell("B2").value = "Lista de Modalidad Laboral".toUpperCase();

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
      { key: "descripcion", width: 40 },
    ];

    const columnas = [
      { name: "ITEM", totalsRowLabel: "Total:", filterButton: false },
      { name: "CÓDIGO", totalsRowLabel: "Total:", filterButton: true },
      { name: "DESCRIPCION", totalsRowLabel: "", filterButton: true },
    ];

    worksheet.addTable({
      name: "RegimenTabla",
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
      FileSaver.saveAs(blob, "ModalidadLaboralEXCEL.xlsx");
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
    this.OrdenarDatos(this.listaModalida_Laboral);
    var objeto: any;
    var arregloFeriados: any = [];
    this.listaModalida_Laboral.forEach((obj: any) => {
      objeto = {
        "roles": {
          "$": { "id": obj.id },
          "modalidad_laboral": obj.descripcion,
        }
      }
      arregloFeriados.push(objeto)
    });

    const xmlBuilder = new xml2js.Builder({ rootName: 'Modalidad_laboral' });
    const xml = xmlBuilder.buildObject(arregloFeriados);

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
    a.download = 'Modalidad_laboral.xml';
    // SIMULAR UN CLIC EN EL ENLACE PARA INICIAR LA DESCARGA
    a.click();

    this.BuscarParametro();
  }

  /** ************************************************************************************************** **
   ** **                                METODO PARA EXPORTAR A CSV                                    ** **
   ** ************************************************************************************************** **/


  ExportToCSV() {
    this.OrdenarDatos(this.listaModalida_Laboral);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Modalidad_laboralCSV');
    worksheet.columns = [
      { header: 'ITEM', key: 'n', width: 10 },
      { header: 'MODALIDAD_LABORAL', key: 'modalidad', width: 30 },
    ];

    this.listaModalida_Laboral.map((obj: any) => {
      worksheet.addRow({
        n: obj.id,
        modalidad: obj.descripcion,
      }).commit();
    });

    workbook.csv.writeBuffer().then((buffer) => {
      const data: Blob = new Blob([buffer], { type: 'text/csv;charset=utf-8;' });
      FileSaver.saveAs(data, "Modalidad_laboralCSV.csv");
    });
    this.BuscarParametro();
  }


  /** ************************************************************************************************** **
   ** **                            METODO DE SELECCION MULTIPLE DE DATOS                             ** **
   ** ************************************************************************************************** **/

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

  selectionModalidad = new SelectionModel<ITableModalidad>(true, []);

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedPag() {
    const numSelected = this.selectionModalidad.selected.length;
    return numSelected === this.listaModalida_Laboral.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterTogglePag() {
    this.isAllSelectedPag() ?
      this.selectionModalidad.clear() :
      this.listaModalida_Laboral.forEach((row: any) => this.selectionModalidad.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelPag(row?: ITableModalidad): string {
    if (!row) {
      return `${this.isAllSelectedPag() ? 'select' : 'deselect'} all`;
    }
    this.modalidadesEliminar = this.selectionModalidad.selected;
    return `${this.selectionModalidad.isSelected(row) ? 'deselect' : 'select'} row ${row.descripcion + 1}`;
  }

  // METODO PARA CONFIMAR ELIMINACION DE REGISTROS
  ConfirmarDelete(modalidad: any) {
    const mensaje = 'eliminar';
    const data = {
      user_name: this.user_name,
      ip: this.ip,
      ip_local: this.ips_locales
    };
    (document.activeElement as HTMLElement)?.blur();
    this.ventana.open(MetodosComponent, { width: '450px', data: mensaje }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this._ModalidaLaboral.Eliminar(modalidad.id, data).subscribe((res: any) => {
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
          this.modalidadesEliminar = [];
          this.selectionModalidad.clear();
          this.ngOnInit();
        }
      });
  }


  // METODO DE ELIMINACION MULTIPLE DE DATOS
  contador: number = 0;
  ingresar: boolean = false;
  EliminarMultiple() {
    const data = {
      user_name: this.user_name,
      ip: this.ip,
      ip_local: this.ips_locales
    };

    const peticiones = this.selectionModalidad.selected.map((datos: any) =>
      this._ModalidaLaboral.Eliminar(datos.id, data).pipe(
        map((res: any) => ({ success: res.message !== 'error', descripcion: datos.descripcion })),
        catchError(() => of({ success: false, descripcion: datos.descripcion }))
      )
    );

    forkJoin(peticiones).subscribe(resultados => {
      let eliminados = 0;

      resultados.forEach(resultado => {
        if (resultado.success) {
          eliminados++;
        } else {
          this.toastr.warning('Existen datos relacionados con ' + resultado.descripcion + '.', 'No fue posible eliminar.', {
            timeOut: 6000,
          });
        }
      });

      if (eliminados > 0) {
        this.toastr.error(`Se ha eliminado ${eliminados} registro${eliminados > 1 ? 's' : ''}.`, '', {
          timeOut: 6000,
        });
      }

      this.modalidadesEliminar = [];
      this.selectionModalidad.clear();
      this.ngOnInit();
    });
  }

  // METODO PARA CONFIRMAR ELIMINACION MULTIPLE
  ConfirmarDeleteMultiple() {
    (document.activeElement as HTMLElement)?.blur();
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          if (this.modalidadesEliminar.length != 0) {
            this.EliminarMultiple();
            this.activar_seleccion = true;
            this.plan_multiple = false;
            this.plan_multiple_ = false;
            this.modalidadesEliminar = [];
            this.selectionModalidad.clear();
            this.ngOnInit();
          } else {
            this.toastr.warning('No ha seleccionado MODALIDAD LABORAL.', 'Ups! algo salio mal.', {
              timeOut: 6000,
            })
          }
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

  getEditarModalidadLaboral() {
    return this.tienePermiso('Editar Modalidad Laboral');
  }

  getEliminarModalidadLaboral() {
    return this.tienePermiso('Eliminar Modalidad Laboral');
  }

  getCargarPlantillaModalidadLaboral() {
    return this.tienePermiso('Cargar Plantilla Modalidad Laboral');
  }

  getDescargarReportesModalidadLaboral() {
    return this.tienePermiso('Descargar Reportes Modalidad Laboral');
  }

  getCrearModalidadLaboral() {
    return this.tienePermiso('Crear Modalidad Laboral');
  }

}
