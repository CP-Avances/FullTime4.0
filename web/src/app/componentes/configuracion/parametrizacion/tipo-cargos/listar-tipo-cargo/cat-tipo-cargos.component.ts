import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Component, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { DateTime } from 'luxon';
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import * as xml2js from 'xml2js';
import * as FileSaver from 'file-saver';
import ExcelJS, { FillPattern } from "exceljs";

import { ITableTipoCargo } from 'src/app/model/reportes.model';

import { PlantillaReportesService } from 'src/app/componentes/reportes/plantilla-reportes.service';
import { CatTipoCargosService } from 'src/app/servicios/configuracion/parametrizacion/catTipoCargos/cat-tipo-cargos.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/configuracion/parametrizacion/parametrosGenerales/parametros.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';

import { MetodosComponent } from 'src/app/componentes/generales/metodoEliminar/metodos.component';
import { RegistrarCargoComponent } from '../registrar-cargo/registrar-cargo.component';
import { EditarTipoCargoComponent } from '../editar-tipo-cargo/editar-tipo-cargo.component';

@Component({
  selector: 'app-cat-tipo-cargos',
  standalone: false,
  templateUrl: './cat-tipo-cargos.component.html',
  styleUrls: ['./cat-tipo-cargos.component.css']
})

export class CatTipoCargosComponent {
  ips_locales: any = '';

  private imagen: any;

  private bordeCompleto!: Partial<ExcelJS.Borders>;

  private bordeGrueso!: Partial<ExcelJS.Borders>;

  private fillAzul!: FillPattern;

  private fontTitulo!: Partial<ExcelJS.Font>;

  private fontHipervinculo!: Partial<ExcelJS.Font>;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  tiposCargoEliminar: any = [];
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

  tiposCargosCorrectos: number = 0;
  listaTipoCargos: any;
  idEmpleado: number;
  empleado: any = [];

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  buscarCargo = new FormControl('', [Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{2,48}")]);

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    nombreForm: this.buscarCargo,
  });

  // METODO DE LLAMADO DE DATOS DE EMPRESA COLORES - LOGO - MARCA DE AGUA
  get s_color(): string { return this.plantillaPDF.color_Secundary }
  get p_color(): string { return this.plantillaPDF.color_Primary }
  get frase(): string { return this.plantillaPDF.marca_Agua }
  get logo(): string { return this.plantillaPDF.logoBase64 }

  constructor(
    private plantillaPDF: PlantillaReportesService, // SERVICIO DATOS DE EMPRESA
    private _TipoCargos: CatTipoCargosService,
    private toastr: ToastrService, // VARIABLE DE MENSAJES DE NOTIFICACIONES
    private restE: EmpleadoService, // SERVICIO DATOS DE EMPLEADO
    public ventana: MatDialog, // VARIABLE DE MANEJO DE VENTANAS
    public parametro: ParametrosService,
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

    this.listaTipoCargos = [];
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
        this.ObtenerCargos();
      },
      vacio => {
        this.ObtenerCargos();
      });
  }


  // METODO PARA LISTAR TIPO DE CARGOS
  ObtenerCargos() {
    this._TipoCargos.ListaCargos().subscribe(res => {
      this.listaTipoCargos = res
    }, error => {
      if (error.status == 400 || error.status == 404) {
        this.toastr.info('No se han encontrado registros.', '', {
          timeOut: 3500,
        });
      } else {
        this.toastr.error('Error al cargar los datos.', 'Ups!!! algo salio mal.', {
          timeOut: 3500,
        });
      }

    });
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.Datos_tipo_cargos = null;
    this.archivoSubido = [];
    this.nameFile = '';
    this.formulario.setValue({
      nombreForm: '',
    });
    this.ngOnInit();
    this.archivoForm.reset();
    this.mostrarbtnsubir = false;
    this.messajeExcel = '';
  }

  // METODO PARA ABRIR VENTA DE REGISTRO DE TIPO CARGO
  AbrirVentanaRegistrarCargo(): void {
    this.ventana.open(RegistrarCargoComponent, { width: '500px' })
      .afterClosed().subscribe(items => {
        this.ngOnInit();
      });
    this.activar_seleccion = true;
    this.plan_multiple = false;
    this.plan_multiple_ = false;
    this.selectionTipoCargo.clear();
    this.tiposCargoEliminar = [];
  }

  // METODO PARA ABRIR VENTANA DE EDICION DE TIPOS DE CARGOS
  AbrirEditar(item_cargo: any): void {
    this.ventana.open(EditarTipoCargoComponent, { width: '450px', data: item_cargo })
      .afterClosed().subscribe(items => {
        this.ngOnInit();
      });
  }

  // METODO DE CONFIRMAICON DE ELIMINACION
  ConfirmarDelete(cargo: any) {
    const mensaje = 'eliminar';
    const data = {
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
    }
    this.ventana.open(MetodosComponent, { width: '450px', data: mensaje }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this._TipoCargos.Eliminar(cargo.id, data).subscribe(res => {
            this.toastr.error('Registro eliminado.', '', {
              timeOut: 4000,
            });
            this.ngOnInit();
          }, error => {
            if (error.error.code == "23503") {
              this.toastr.error('Existen datos relacionados con este registro.', 'No fue posible eliminar.', {
                timeOut: 4000,
              });
            } else {
              this.toastr.error(error.error.message, 'Error al eliminar dato', {
                timeOut: 4000,
              });
            }
          })
          this.activar_seleccion = true;
          this.plan_multiple = false;
          this.plan_multiple_ = false;
          this.tiposCargoEliminar = [];
          this.selectionTipoCargo.clear();
          this.ngOnInit();
        }
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

  // METODO PARA REVISAR DATOS DE PLANTILLAS
  Datos_tipo_cargos: any
  listaCargosCorrectas: any = [];
  messajeExcel: string = '';
  Revisarplantilla() {
    this.listaCargosCorrectas = [];
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads", this.archivoSubido[i], this.archivoSubido[i].name);
    }
    // VERIFICACION DE DATOS FORMATO - DUPLICIDAD DENTRO DEL SISTEMA
    this._TipoCargos.RevisarFormato(formData).subscribe(res => {
      this.Datos_tipo_cargos = res.data;
      this.messajeExcel = res.message;

      this.Datos_tipo_cargos.sort((a: any, b: any) => {
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
        this.toastr.error('No se ha encontrado pestaña TIPO_CARGO en la plantilla.', 'Plantilla no aceptada.', {
          timeOut: 4500,
        });
        this.mostrarbtnsubir = false;
      }
      else {
        this.Datos_tipo_cargos.forEach((item: any) => {
          if (item.observacion.toLowerCase() == 'ok') {
            this.listaCargosCorrectas.push(item);
          }
        });
        this.tiposCargosCorrectos = this.listaCargosCorrectas.length;
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
    } else if (arrayObservacion[0] == 'Cargo ') {
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

  // FUNCION PARA CONFIRMAR EL REGISTRO MULTIPLE DE DATOS
  ConfirmarRegistroMultiple() {
    const mensaje = 'registro';
    this.ventana.open(MetodosComponent, { width: '450px', data: mensaje }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.SubirDatosPlantilla()
        }
      });
  }

  // METODO PARA CARGAR DATOS DE LA PLANTILLA
  SubirDatosPlantilla() {
    if (this.listaCargosCorrectas.length > 0) {
      const data = {
        plantilla: this.listaCargosCorrectas,
        user_name: this.user_name,
        ip: this.ip, ip_local: this.ips_locales,
      }
      this._TipoCargos.SubirArchivoExcel(data).subscribe({
        next: (response) => {
          this.toastr.success('Plantilla de Tipo Cargos importada.', 'Operación exitosa.', {
            timeOut: 3000,
          });
          this.LimpiarCampos();
          this.archivoForm.reset();
          this.nameFile = '';
        },
        error: (error) => {
          this.toastr.error('No se pudo cargar la plantilla.', 'Ups !!! algo salio mal.', {
            timeOut: 3500,
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
    this.OrdenarDatos(this.listaTipoCargos);
    const pdfMake = await this.validar.ImportarPDF();
    const documentDefinition = this.DefinirInformacionPDF();
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download('Tipo_Cargos.pdf'); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
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
        { text: 'LISTA TIPO DE CARGOS', bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 0] },
        this.PresentarDataPDF(),
      ],
      styles: {
        tableHeader: { fontSize: 9, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 8, alignment: 'center' },
        itemsTableD: { fontSize: 8 },
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
                { text: 'CARGOS', style: 'tableHeader' },
              ],
              ...this.listaTipoCargos.map((obj: any) => {
                return [
                  { text: obj.id, style: 'itemsTable' },
                  { text: obj.cargo, style: 'itemsTableD' },
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

    this.listaTipoCargos.map((obj: any) => {
      datos.push([
        n++,
        obj.id,
        obj.cargo,
      ])
    })

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Tipos de Cargos");
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
    worksheet.getCell("B2").value = "Lista de Tipos de Cargos".toUpperCase();

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
      { key: "codigo", width: 30 },
      { key: "cargo", width: 45 },
    ];

    const columnas = [
      { name: "ITEM", totalsRowLabel: "Total:", filterButton: false },
      { name: "CÓDIGO", totalsRowLabel: "Total:", filterButton: true },
      { name: "CARGO", totalsRowLabel: "", filterButton: true },
    ];

    worksheet.addTable({
      name: "TipoCargoTabla",
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
      FileSaver.saveAs(blob, "CargosEXCEL.xlsx");
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
    this.OrdenarDatos(this.listaTipoCargos);
    var objeto: any;
    var arregloFeriados: any = [];
    this.listaTipoCargos.forEach((obj: any) => {
      objeto = {
        "roles": {
          "$": { "id": obj.id },
          "descripcion": obj.cargo,
        }
      }
      arregloFeriados.push(objeto)
    });

    const xmlBuilder = new xml2js.Builder({ rootName: 'Cargos' });
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
    a.download = 'Cargos.xml';
    // SIMULAR UN CLIC EN EL ENLACE PARA INICIAR LA DESCARGA
    a.click();

    this.BuscarParametro();
  }

  /** ************************************************************************************************** **
   ** **                                METODO PARA EXPORTAR A CSV                                    ** **
   ** ************************************************************************************************** **/

 

  ExportToCSV() {
    this.OrdenarDatos(this.listaTipoCargos);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('CargosCSV');
    worksheet.columns = [
      { header: 'ITEM', key: 'n', width: 10 },
      { header: 'CARGOS', key: 'cargos', width: 30 },
    ];

    this.listaTipoCargos.map((obj: any) => {
      worksheet.addRow({
        n: obj.id,
        cargos: obj.cargo,
      }).commit();
    });

    workbook.csv.writeBuffer().then((buffer) => {
      const data: Blob = new Blob([buffer], { type: 'text/csv;charset=utf-8;' });
      FileSaver.saveAs(data, "CargosCSV.csv");
    });
    this.BuscarParametro();
  }



  /** ************************************************************************************************* **
   ** **                         METODO DE SELECCION MULTIPLE DE DATOS                               ** **
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

  selectionTipoCargo = new SelectionModel<ITableTipoCargo>(true, []);

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedPag() {
    const numSelected = this.selectionTipoCargo.selected.length;
    return numSelected === this.listaTipoCargos.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterTogglePag() {
    this.isAllSelectedPag() ?
      this.selectionTipoCargo.clear() :
      this.listaTipoCargos.forEach((row: any) => this.selectionTipoCargo.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelPag(row?: ITableTipoCargo): string {
    if (!row) {
      return `${this.isAllSelectedPag() ? 'select' : 'deselect'} all`;
    }
    this.tiposCargoEliminar = this.selectionTipoCargo.selected;
    return `${this.selectionTipoCargo.isSelected(row) ? 'deselect' : 'select'} row ${row.cargo + 1}`;
  }

  // METODO DE ELIMINACION MULTIPLE DE DATOS
  contador: number = 0;
  ingresar: boolean = false;
  EliminarMultiple() {
    const data = {
      user_name: this.user_name,
      ip: this.ip,
      ip_local: this.ips_locales,
    };
  
    const peticiones = this.selectionTipoCargo.selected.map((datos: any) =>
      this._TipoCargos.Eliminar(datos.id, data).pipe(
        map((res: any) => ({ success: true, cargo: datos.cargo, relacionado: false })),
        catchError((error) => {
          if (error.error.code === "23503") {
            return of({ success: false, cargo: datos.cargo, relacionado: true });
          } else {
            this.toastr.error(error.error.message, 'Error al eliminar dato.', {
              timeOut: 6000,
            });
            return of({ success: false, cargo: datos.cargo, relacionado: false });
          }
        })
      )
    );
  
    forkJoin(peticiones).subscribe(resultados => {
      let eliminados = 0;
  
      resultados.forEach((resultado: any) => {
        if (resultado.success) {
          eliminados++;
        } else if (resultado.relacionado) {
          this.toastr.warning('Existen datos relacionados con ' + resultado.cargo + '.', 'No fue posible eliminar.', {
            timeOut: 6000,
          });
        }
      });
  
      if (eliminados > 0) {
        this.toastr.error(`Se ha eliminado ${eliminados} registro${eliminados > 1 ? 's' : ''}.`, '', {
          timeOut: 6000,
        });
      }
  
      this.tiposCargoEliminar = [];
      this.selectionTipoCargo.clear();
      this.ngOnInit();
    });
  }
  

  // METODO PARA CONFIRMAR ELIMINACION MULTIPLE
  ConfirmarDeleteMultiple() {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          if (this.tiposCargoEliminar.length != 0) {
            this.EliminarMultiple();
            this.activar_seleccion = true;
            this.plan_multiple = false;
            this.plan_multiple_ = false;
            this.tiposCargoEliminar = [];
            this.selectionTipoCargo.clear();
            this.ngOnInit();
          } else {
            this.toastr.warning('No ha seleccionado TIPO CARGO.', 'Ups!!! algo salio mal.', {
              timeOut: 6000,
            })
          }
        }
      });
  }

  //CONTROL BOTONES
  private tienePermiso(accion: string, idFuncion?: number): boolean {
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      try {
        const datos = JSON.parse(datosRecuperados);
        return datos.some((item: any) =>
          item.accion === accion && (idFuncion === undefined || item.id_funcion === idFuncion)
        );
      } catch {
        return false;
      }
    } else {
      return parseInt(localStorage.getItem('rol') || '0') === 1;
    }
  }

  getCrearTipoCargo(){
    return this.tienePermiso('Crear Tipo Cargo');
  }

  getEditarTipoCargo(){
    return this.tienePermiso('Editar Tipo Cargo');
  }

  getEliminarTipoCargo(){
    return this.tienePermiso('Eliminar Tipo Cargo');
  }

  getCargarPlantillaTipoCargo(){
    return this.tienePermiso('Cargar Plantilla Tipo Cargo');
  }

  getDescargarReportesTipoCargo(){
    return this.tienePermiso('Descargar Reportes Tipo Cargo');
  }

}
