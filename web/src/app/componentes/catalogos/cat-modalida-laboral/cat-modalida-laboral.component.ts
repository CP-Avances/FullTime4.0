import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { MetodosComponent } from '../../administracionGeneral/metodoEliminar/metodos.component';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { CatModalidadLaboralService } from 'src/app/servicios/catalogos/catModalidadLaboral/cat-modalidad-laboral.service';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { ThemePalette } from '@angular/material/core';
import { RegistroModalidadComponent } from './registroModalidad/registro-modalidad/registro-modalidad.component';
import { EditarModalidadComponent } from './editarModalidad/editar-modalidad/editar-modalidad.component';

import * as FileSaver from 'file-saver';
import * as moment from 'moment';
import * as xlsx from 'xlsx';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as xml2js from 'xml2js';
import { PlantillaReportesService } from '../../reportes/plantilla-reportes.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { SelectionModel } from '@angular/cdk/collections';
import { ITableModalidad } from 'src/app/model/reportes.model';

@Component({
  selector: 'app-cat-modalida-laboral',
  templateUrl: './cat-modalida-laboral.component.html',
  styleUrls: ['./cat-modalida-laboral.component.css']
})
export class CatModalidaLaboralComponent implements OnInit {

  modalidadesEliminar: any = [];

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

  // VARIABLES PROGRESS SPINNER
  progreso: boolean = false;
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 10;

  listaModalida_Laboral: any;

  empleado: any = [];
  idEmpleado: number; // VARIABLE DE ALMACENAMIENTO DE ID DE EMPLEADO QUE INICIA SESION

  filtroModalidad = ''; // VARIABLE DE BUSQUEDA DE DATOS
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
    private plantillaPDF: PlantillaReportesService, // SERVICIO DATOS DE EMPRESA
    private _ModalidaLaboral: CatModalidadLaboralService,
    private restE: EmpleadoService, // SERVICIO DATOS DE EMPLEADO
    public ventana: MatDialog, // VARIABLE DE MANEJO DE VENTANAS
    private toastr: ToastrService, // VARIABLE DE MENSAJES DE NOTIFICACIONES
    public parametro: ParametrosService,
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit() {
    this.listaModalida_Laboral = [];
    this.ObtenerEmpleados(this.idEmpleado);
    this.BuscarParametro();

  }

  // METODO PARA VER LA INFORMACION DEL EMPLEADO
  ObtenerEmpleados(idemploy: any) {
    this.empleado = [];
    this.restE.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleado = data;
    })
  }

  formato_fecha: string = 'DD/MM/YYYY';

  // METODO PARA BUSCAR PARAMETRO DE FORMATO DE FECHA
  BuscarParametro() {
    // id_tipo_parametro Formato fecha = 25
    this.parametro.ListarDetalleParametros(25).subscribe(
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
      console.log('lista> ', res);
      this.listaModalida_Laboral = res
    }, error => {
      console.log('Serivicio rest -> metodo RevisarFormato - ', error);
      this.toastr.error('Error al cargar los datos', 'Listado de Modalidad laboral', {
        timeOut: 4000,
      });
    });
  }

  LimpiarCampos() {
    this.Datos_modalidad_laboral = null;
    this.archivoSubido = [];
    this.nameFile = '';
    this.ngOnInit();
    this.archivoForm.reset();
    this.mostrarbtnsubir = false;
    this.messajeExcel = '';
  }

  AbrirVentanaRegistrarModalidad(): void {
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
  // METODO PARA SELECCIONAR PLANTILLA DE DATOS -----------------------------------------------------------------
  FileChange(element: any) {
    this.archivoSubido = [];
    this.nameFile = '';
    this.archivoSubido = element.target.files;
    this.nameFile = this.archivoSubido[0].name;
    let arrayItems = this.nameFile.split(".");
    let itemExtencion = arrayItems[arrayItems.length - 1];
    let itemName = arrayItems[0].slice(0, 25);
    console.log('itemName: ', itemName);
    if (itemExtencion == 'xlsx' || itemExtencion == 'xls') {
      if (itemName.toLowerCase() == 'modalidad_cargo') {
        this.numero_paginaMul = 1;
        this.tamanio_paginaMul = 5;
        this.Revisarplantilla();
      } else {
        this.toastr.error('Seleccione plantilla con nombre modalidad_cargo', 'Plantilla seleccionada incorrecta', {
          timeOut: 6000,
        });

        this.nameFile = '';
      }
    } else {
      this.toastr.error('Error en el formato del documento', 'Plantilla no aceptada', {
        timeOut: 6000,
      });

      this.nameFile = '';
    }
    this.archivoForm.reset();
    this.mostrarbtnsubir = true;
  }

  Datos_modalidad_laboral: any
  listaModalidadCorrectas: any = [];
  messajeExcel: string = '';
  Revisarplantilla() {
    this.listaModalidadCorrectas = [];
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads", this.archivoSubido[i], this.archivoSubido[i].name);
    }

    this.progreso = true;

    // VERIFICACIÓN DE DATOS FORMATO - DUPLICIDAD DENTRO DEL SISTEMA
    this._ModalidaLaboral.RevisarFormato(formData).subscribe(res => {
      this.Datos_modalidad_laboral = res.data;
      this.messajeExcel = res.message;
      console.log('probando plantilla modalidad laboral', this.Datos_modalidad_laboral);

      if (this.messajeExcel == 'error') {
        this.toastr.error('Revisar que la numeración de la columna "item" sea correcta.', 'Plantilla no aceptada.', {
          timeOut: 4500,
        });
        this.mostrarbtnsubir = false;
      } else {
        this.Datos_modalidad_laboral.forEach(item => {
          if (item.observacion.toLowerCase() == 'ok') {
            this.listaModalidadCorrectas.push(item);
          }
        });
      }
    }, error => {
      console.log('Serivicio rest -> metodo RevisarFormato - ', error);
      this.toastr.error('Error al cargar los datos', 'Plantilla no aceptada', {
        timeOut: 4000,
      });
      this.progreso = false;
    }, () => {
      this.progreso = false;
    });
  }

  // METODO PARA DAR COLOR A LAS CELDAS Y REPRESENTAR LAS VALIDACIONES
  colorCelda: string = ''
  stiloCelda(observacion: string): string {
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
  stiloTextoCelda(texto: string): string {
    let arrayObservacion = texto.split(" ");
    if (arrayObservacion[0] == 'No') {
      return 'rgb(255, 80, 80)';
    } else {
      return 'black'
    }
  }


  //FUNCION PARA CONFIRMAR EL REGISTRO MULTIPLE DE LOS FERIADOS DEL ARCHIVO EXCEL
  ConfirmarRegistroMultiple() {
    const mensaje = 'registro';
    console.log('listaContratosCorrectas: ', this.listaModalidadCorrectas.length);
    this.ventana.open(MetodosComponent, { width: '450px', data: mensaje }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.subirDatosPlantillaModal()
        }
      });
  }

  subirDatosPlantillaModal() {
    if (this.listaModalidadCorrectas.length > 0) {
      this._ModalidaLaboral.subirArchivoExcel(this.listaModalidadCorrectas).subscribe(response => {
        console.log('respuesta: ', response);
        this.toastr.success('Operación exitosa.', 'Plantilla de Modalidad laboral importada.', {
          timeOut: 3000,
        });
        //window.location.reload();
        this.LimpiarCampos();
        this.archivoForm.reset();
        this.nameFile = '';
      });
    } else {
      console.log('entro en salir')
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

  GenerarPdf(action = 'open') {
    this.OrdenarDatos(this.listaModalida_Laboral);
    const documentDefinition = this.GetDocumentDefinicion();
    console.log('this.listaModalida_Laboral: ',this.listaModalida_Laboral)
    console.log('documentDefinition: ',documentDefinition)
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download('Modalidas_laboral.pdf'); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
    this.BuscarParametro();
  }

  GetDocumentDefinicion() {
    console.log('this.empleado: ',this.empleado)
    console.log('this.frase: ',this.frase)
    sessionStorage.setItem('ModalidadLabo', this.listaModalida_Laboral);
    return {
      // ENCABEZADO DE LA PAGINA
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por: ' + this.empleado[0].nombre + ' ' + this.empleado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },
      // PIE DE PAGINA
      footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
        var f = moment();
        fecha = f.format('YYYY-MM-DD');
        hora = f.format('HH:mm:ss');
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
        { image: this.logo, width: 150, margin: [10, -25, 0, 5] },
        { text: 'Lista de Modalidad Laboral', bold: true, fontSize: 20, alignment: 'center', margin: [0, -10, 0, 10] },
        this.PresentarDataPDFFeriados(),
      ],
      styles: {
        tableHeader: { fontSize: 12, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 10, alignment: 'center' },
        itemsTableD: { fontSize: 10, alignment: 'center' }
      }
    };
  }

  PresentarDataPDFFeriados() {
    return {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          table: {
            widths: ['auto', 'auto'],
            body: [
              [
                { text: 'Item', style: 'tableHeader' },
                { text: 'Modalidad laboral', style: 'tableHeader' },
              ],
              ...this.listaModalida_Laboral.map(obj => {
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

  ExportToExcel() {
    this.OrdenarDatos(this.listaModalida_Laboral);
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.listaModalida_Laboral.map(obj => {
      return {
        ITEM: obj.id,
        Modalidad_laboral: obj.descripcion,
      }
    }));
    // METODO PARA DEFINIR TAMAÑO DE LAS COLUMNAS DEL REPORTE
    const header = Object.keys(this.listaModalida_Laboral[0]); // NOMBRE DE CABECERAS DE COLUMNAS
    var wscols: any = [];
    for (var i = 0; i < header.length; i++) {  // CABECERAS AÑADIDAS CON ESPACIOS
      wscols.push({ wpx: 100 })
    }
    wsr["!cols"] = wscols;
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'Modalidad laboral');
    xlsx.writeFile(wb, "ModalidadLaboralEXCEL" + '.xlsx');
    this.BuscarParametro();
  }

  /** ************************************************************************************************* **
   ** **                              PARA LA EXPORTACION DE ARCHIVOS XML                            ** **
   ** ************************************************************************************************* **/

  urlxml: string;
  data: any = [];
  ExportToXML() {
    this.OrdenarDatos(this.listaModalida_Laboral);
    var objeto;
    var arregloFeriados: any = [];
    this.listaModalida_Laboral.forEach(obj => {
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
    a.download = 'Modalidad_laboral.xml';
    // SIMULAR UN CLIC EN EL ENLACE PARA INICIAR LA DESCARGA
    a.click();

    this.BuscarParametro();
  }

  /** ************************************************************************************************** **
   ** **                                METODO PARA EXPORTAR A CSV                                    ** **
   ** ************************************************************************************************** **/

  ExportToCVS() {
    this.OrdenarDatos(this.listaModalida_Laboral);
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.listaModalida_Laboral.map(obj => {
      return {
        ITEM: obj.id,
        MODALIDAD_LABORAL: obj.descripcion,
      }
    }));
    const csvDataC = xlsx.utils.sheet_to_csv(wse);
    const data: Blob = new Blob([csvDataC], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, "Modalidad_laboralCSV" + '.csv');
    this.BuscarParametro();
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



  ConfirmarDelete(modalidad: any) {
    const mensaje = 'eliminar';
    this.ventana.open(MetodosComponent, { width: '450px', data: mensaje }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this._ModalidaLaboral.eliminar(modalidad.id).subscribe(res => {
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

  contador: number = 0;
  ingresar: boolean = false;
  EliminarMultiple() {
    this.ingresar = false;
    this.contador = 0;
    this.modalidadesEliminar = this.selectionModalidad.selected;
    this.modalidadesEliminar.forEach((datos: any) => {
      this.listaModalida_Laboral = this.listaModalida_Laboral.filter(item => item.id !== datos.id);
      this.contador = this.contador + 1;
      this._ModalidaLaboral.eliminar(datos.id).subscribe(res => {
        if (res.message === 'error') {
          this.toastr.error('Existen datos relacionados con ' + datos.descripcion + '.', 'No fue posible eliminar.', {
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

  ConfirmarDeleteMultiple() {
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
            this.toastr.warning('No ha seleccionado PROVINCIAS.', 'Ups!!! algo salio mal.', {
              timeOut: 6000,
            })
          }
        }
      });
  }







}