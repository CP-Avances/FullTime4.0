import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { DateTime } from 'luxon';

import * as xlsx from 'xlsx';
import * as xml2js from 'xml2js';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
import * as FileSaver from 'file-saver';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

import { ITableVacuna } from 'src/app/model/reportes.model';
import { SelectionModel } from '@angular/cdk/collections';

import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { CatVacunasService } from 'src/app/servicios/catalogos/catVacunas/cat-vacunas.service';
import { PlantillaReportesService } from '../../../reportes/plantilla-reportes.service';

import { EditarVacunasComponent } from '../editar-vacuna/editar-vacuna.component';
import { TipoVacunaComponent } from '../tipo-vacuna/tipo-vacuna.component';
import { MetodosComponent } from '../../../generales/metodoEliminar/metodos.component';

@Component({
  selector: 'app-cat-discapacidad',
  templateUrl: './cat-vacunas.component.html',
  styleUrls: ['./cat-vacunas.component.css']
})

export class CatVacunasComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;

  vacunasEliminar: any = [];

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  nombreF = new FormControl('', [Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{2,48}")]);

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    nombreForm: this.nombreF,
  });

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

  vacunas: any;
  empleado: any = [];
  idEmpleado: number; // VARIABLE DE ALMACENAMIENTO DE ID DE EMPLEADO QUE INICIA SESION

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  vacunasCorrectas: number = 0;

  // METODO DE LLAMADO DE DATOS DE EMPRESA COLORES - LOGO - MARCA DE AGUA
  get s_color(): string { return this.plantillaPDF.color_Secundary }
  get p_color(): string { return this.plantillaPDF.color_Primary }
  get frase(): string { return this.plantillaPDF.marca_Agua }
  get logo(): string { return this.plantillaPDF.logoBase64 }

  constructor(
    private plantillaPDF: PlantillaReportesService, // SERVICIO DATOS DE EMPRESA
    private rest: CatVacunasService,
    private restE: EmpleadoService, // SERVICIO DATOS DE EMPLEADO
    public ventana: MatDialog, // VARIABLE DE MANEJO DE VENTANAS
    private toastr: ToastrService, // VARIABLE DE MENSAJES DE NOTIFICACIONES
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit() {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

    this.vacunas = [];
    this.ObtenerEmpleados(this.idEmpleado);
    this.ObtenerVacuna();

  }

  // METODO PARA VER LA INFORMACION DEL EMPLEADO
  ObtenerEmpleados(idemploy: any) {
    this.empleado = [];
    this.restE.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleado = data;
    })
  }

  // METODO PARA LISTAR TIPO VACUNAS
  ObtenerVacuna() {
    this.vacunas = [];
    this.rest.ListaVacuna().subscribe(res => {
      this.vacunas = res
    }, error => {
      if (error.status == 400 || error.status == 404) {
        this.toastr.info('No se ha encontrado registros.', '', {
          timeOut: 1500,
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
    this.Datos_vacunas = null;
    this.archivoSubido = [];
    this.nameFile = '';
    this.formulario.setValue({
      nombreForm: '',
    });
    this.ObtenerVacuna();
    this.archivoForm.reset();
    this.mostrarbtnsubir = false;
  }

  // METODO PARA ABRI VENTANA VACUNA
  AbrirVentanaRegistrarVacuna(): void {
    this.ventana.open(TipoVacunaComponent, { width: '500px' })
      .afterClosed().subscribe(items => {
        this.ngOnInit();
      });
    this.activar_seleccion = true;
    this.plan_multiple = false;
    this.plan_multiple_ = false;
    this.selectionVacuna.clear();
    this.vacunasEliminar = [];
  }

  // METODO PARA EDITAR TIPO VACUNA
  AbrirEditar(item_modalidad: any): void {
    this.ventana.open(EditarVacunasComponent, { width: '450px', data: item_modalidad })
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

  // METODO PARA REVISAR DATOS DE PLANTILLA
  Datos_vacunas: any
  listaVacunasCorrectas: any = [];
  messajeExcel: string = '';
  Revisarplantilla() {
    this.listaVacunasCorrectas = [];
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads", this.archivoSubido[i], this.archivoSubido[i].name);
    }

    // VERIFICACION DE DATOS FORMATO - DUPLICIDAD DENTRO DEL SISTEMA
    this.rest.RevisarFormato(formData).subscribe(res => {
      this.Datos_vacunas = res.data;
      this.messajeExcel = res.message;

      this.Datos_vacunas.sort((a: any, b: any) => {
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
        this.toastr.error('No se ha encontrado pestaña TIPO_VACUNA en la plantilla.', 'Plantilla no aceptada.', {
          timeOut: 4500,
        });
        this.mostrarbtnsubir = false;
      }
      else {
        this.Datos_vacunas.forEach((item: any) => {
          if (item.observacion.toLowerCase() == 'ok') {
            this.listaVacunasCorrectas.push(item);
          }
        });

        this.vacunasCorrectas = this.listaVacunasCorrectas.length;
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
    } else if (arrayObservacion[0] == 'Vacunas ') {
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

// METODO PARA CARGAR DATOS DE PLANTILLA AL SISTEMA
  SubirDatosPlantilla() {
    if (this.listaVacunasCorrectas.length > 0) {
      const data = {
        plantilla: this.listaVacunasCorrectas,
        user_name: this.user_name,
        ip: this.ip,
      }
      this.rest.SubirArchivoExcel(data).subscribe({
        next: (response) => {
          this.toastr.success('Plantilla de vacunas importada.', 'Operación exitosa.',  {
            timeOut: 3000,
          });
          this.LimpiarCampos();
          this.archivoForm.reset();
          this.nameFile = '';
        },
        error: (error) => {;
          this.toastr.error('No se pudo cargar la plantilla', 'Ups !!! algo salio mal',  {
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

  GenerarPdf(action = 'open') {
    this.OrdenarDatos(this.vacunas);
    const documentDefinition = this.DefinirInformacionPDF();
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download('Vacunas.pdf'); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
    this.ObtenerVacuna();
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
        { text: 'LISTA TIPOS DE VACUNAS', bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 0] },
        this.PresentarDataPDFvacunas(),
      ],
      styles: {
        tableHeader: { fontSize: 9, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 8, alignment: 'center' },
        itemsTableD: { fontSize: 8 },
        tableMargin: { margin: [0, 5, 0, 0] },
      }
    };
  }

  PresentarDataPDFvacunas() {
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
              ...this.vacunas.map((obj: any) => {
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

  ExportToExcel() {
    this.OrdenarDatos(this.vacunas);
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.vacunas.map((obj: any) => {
      return {
        CODIGO: obj.id,
        NOMBRE: obj.nombre,
      }
    }));
    // METODO PARA DEFINIR TAMAÑO DE LAS COLUMNAS DEL REPORTE
    const header = Object.keys(this.vacunas[0]); // NOMBRE DE CABECERAS DE COLUMNAS
    var wscols: any = [];
    for (var i = 0; i < header.length; i++) {  // CABECERAS AÑADIDAS CON ESPACIOS
      wscols.push({ wpx: 100 })
    }
    wsr["!cols"] = wscols;
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'LISTA VACUNAS');
    xlsx.writeFile(wb, "VacunasEXCEL" + '.xlsx');
    this.ObtenerVacuna();
  }

  /** ************************************************************************************************* **
   ** **                              PARA LA EXPORTACION DE ARCHIVOS XML                            ** **
   ** ************************************************************************************************* **/

  urlxml: string;
  data: any = [];
  ExportToXML() {
    this.OrdenarDatos(this.vacunas);
    var objeto: any;
    var arreglovacunas: any = [];
    this.vacunas.forEach((obj: any) => {
      objeto = {
        "vacuna": {
          "$": { "id": obj.id },
          "nombre": obj.nombre,
        }
      }
      arreglovacunas.push(objeto)
    });

    const xmlBuilder = new xml2js.Builder({ rootName: 'Vacunas' });
    const xml = xmlBuilder.buildObject(arreglovacunas);

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
    a.download = 'Vacunas.xml';
    // SIMULAR UN CLIC EN EL ENLACE PARA INICIAR LA DESCARGA
    a.click();

    this.ObtenerVacuna();
  }

  /** ************************************************************************************************** **
   ** **                                METODO PARA EXPORTAR A CSV                                    ** **
   ** ************************************************************************************************** **/

  ExportToCVS() {
    this.OrdenarDatos(this.vacunas);
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.vacunas);
    const csvDataC = xlsx.utils.sheet_to_csv(wse);
    const data: Blob = new Blob([csvDataC], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, "vacunasCSV" + '.csv');
    this.ObtenerVacuna();
  }

  /** ************************************************************************************************* **
   ** **                           METODO DE SELECCION MULTIPLE DE DATPS                             ** **
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

  selectionVacuna = new SelectionModel<ITableVacuna>(true, []);

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedPag() {
    const numSelected = this.selectionVacuna.selected.length;
    return numSelected === this.vacunas.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterTogglePag() {
    this.isAllSelectedPag() ?
      this.selectionVacuna.clear() :
      this.vacunas.forEach((row: any) => this.selectionVacuna.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelPag(row?: ITableVacuna): string {
    if (!row) {
      return `${this.isAllSelectedPag() ? 'select' : 'deselect'} all`;
    }
    this.vacunasEliminar = this.selectionVacuna.selected;
    return `${this.selectionVacuna.isSelected(row) ? 'deselect' : 'select'} row ${row.nombre + 1}`;
  }

  // METODO PARA CONFIRMAR ELIMINAR REGISTRO
  ConfirmarDelete(vacuna: any) {
    const mensaje = 'eliminar';
    const data = {
      user_name: this.user_name,
      ip: this.ip,
    }
    this.ventana.open(MetodosComponent, { width: '450px', data: mensaje }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.rest.Eliminar(vacuna.id, data).subscribe((res: any) => {
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
          this.vacunasEliminar = [];
          this.selectionVacuna.clear();
          this.ngOnInit();
        }
      });
  }

  // METODO PARA REALIZAR UNA ELIMINACION MULTIPLE
  contador: number = 0;
  ingresar: boolean = false;
  EliminarMultiple() {
    const data = {
      user_name: this.user_name,
      ip: this.ip,
    }
    this.ingresar = false;
    this.contador = 0;
    this.vacunasEliminar = this.selectionVacuna.selected;
    this.vacunasEliminar.forEach((datos: any) => {
      this.vacunas = this.vacunas.filter((item: any) => item.id !== datos.id);
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
          if (this.vacunasEliminar.length != 0) {
            this.EliminarMultiple();
            this.activar_seleccion = true;
            this.plan_multiple = false;
            this.plan_multiple_ = false;
            this.vacunasEliminar = [];
            this.selectionVacuna.clear();
            this.ngOnInit();
          } else {
            this.toastr.warning('No ha seleccionado TIPO VACUNAS.', 'Ups!!! algo salio mal.', {
              timeOut: 6000,
            })
          }
        }
      });
  }

}
