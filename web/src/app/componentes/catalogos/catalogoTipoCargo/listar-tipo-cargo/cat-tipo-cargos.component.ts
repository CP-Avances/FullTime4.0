import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { MetodosComponent } from '../../../administracionGeneral/metodoEliminar/metodos.component';
import { PageEvent } from '@angular/material/paginator';
import { CatTipoCargosService } from 'src/app/servicios/catalogos/catTipoCargos/cat-tipo-cargos.service';
import { RegistrarCargoComponent } from '../registrar-cargo/registrar-cargo.component';
import { EditarTipoCargoComponent } from '../editar-tipo-cargo/editar-tipo-cargo.component';

import * as FileSaver from 'file-saver';
import * as moment from 'moment';
import * as xlsx from 'xlsx';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as xml2js from 'xml2js';
import { PlantillaReportesService } from '../../../reportes/plantilla-reportes.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';

import { SelectionModel } from '@angular/cdk/collections';
import { ITableTipoCargo } from 'src/app/model/reportes.model';

@Component({
  selector: 'app-cat-tipo-cargos',
  templateUrl: './cat-tipo-cargos.component.html',
  styleUrls: ['./cat-tipo-cargos.component.css']
})
export class CatTipoCargosComponent {

  tiposCargoEliminar: any = [];
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

  listaTipoCargos: any;

  empleado: any = [];
  idEmpleado: number;

  filtroNombre = ''; // VARIABLE DE BUSQUEDA DE DATOS
  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  buscarNombre = new FormControl('', [Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{2,48}")]);

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    nombreForm: this.buscarNombre,
  });

  // METODO DE LLAMADO DE DATOS DE EMPRESA COLORES - LOGO - MARCA DE AGUA
  get s_color(): string { return this.plantillaPDF.color_Secundary }
  get p_color(): string { return this.plantillaPDF.color_Primary }
  get frase(): string { return this.plantillaPDF.marca_Agua }
  get logo(): string { return this.plantillaPDF.logoBase64 }

  constructor(
    private plantillaPDF: PlantillaReportesService, // SERVICIO DATOS DE EMPRESA
    private _TipoCargos: CatTipoCargosService,
    public ventana: MatDialog, // VARIABLE DE MANEJO DE VENTANAS
    private toastr: ToastrService, // VARIABLE DE MENSAJES DE NOTIFICACIONES
    public parametro: ParametrosService,
    private restE: EmpleadoService, // SERVICIO DATOS DE EMPLEADO
  ){
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit() {
    this.listaTipoCargos = [];
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
        this.obtenerCargos();
      },
      vacio => {
        this.obtenerCargos();
      });
  }

  obtenerCargos(){
    
    this._TipoCargos.listaCargos().subscribe(res =>{
      console.log('lista ',res);
      this.listaTipoCargos = res
    }, error => {
      console.log('Serivicio rest -> metodo RevisarFormato - ', error);
      this.toastr.error('Error al cargar los datos', 'Listado de Tipo Cargos', {
        timeOut: 4000,
      });
    });
  }

  LimpiarCampos() {
    this.Datos_tipo_cargos = null;
    this.archivoSubido = [];
    this.nameFile = '';
    this.ngOnInit();
    this.archivoForm.reset();
    this.mostrarbtnsubir = false;
    this.messajeExcel = '';
  }

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
  AbrirEditar(item_cargo: any): void {
    this.ventana.open(EditarTipoCargoComponent, { width: '450px', data: item_cargo })
      .afterClosed().subscribe(items => {
        this.ngOnInit();
      });
  }

  ConfirmarDelete(cargo: any) {
    const mensaje = 'eliminar';
    this.ventana.open(MetodosComponent, { width: '450px', data: mensaje }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this._TipoCargos.eliminar(cargo.id).subscribe(res => {
            console.log('res eliminado: ', res);
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


  Datos_tipo_cargos: any
  listaCargosCorrectas: any = [];
  messajeExcel: string = '';
  Revisarplantilla() {
    this.listaCargosCorrectas = [];
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads", this.archivoSubido[i], this.archivoSubido[i].name);
    }

    this.progreso = true;

    // VERIFICACIÓN DE DATOS FORMATO - DUPLICIDAD DENTRO DEL SISTEMA
    this._TipoCargos.RevisarFormato(formData).subscribe(res => {
      this.Datos_tipo_cargos = res.data;
      this.messajeExcel = res.message;
      console.log('probando plantilla tipo cargos', this.Datos_tipo_cargos);

      if (this.messajeExcel == 'error') {
        this.toastr.error('Revisar que la numeración de la columna "item" sea correcta.', 'Plantilla no aceptada.', {
          timeOut: 4500,
        });
        this.mostrarbtnsubir = false;
      } else {
        this.Datos_tipo_cargos.forEach(item => {
          if (item.observacion.toLowerCase() == 'ok') {
            this.listaCargosCorrectas.push(item);
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
    } else if (arrayObservacion[0] == 'Cargo ') {
      return 'rgb(242, 21, 21)';
    } else {
      return 'white'
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
    console.log('listaCargosCorrectas: ', this.listaCargosCorrectas.length);
    this.ventana.open(MetodosComponent, { width: '450px', data: mensaje }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.subirDatosPlantillaModal()
        }
      });
  }

  subirDatosPlantillaModal() {
    if (this.listaCargosCorrectas.length > 0) {
      this._TipoCargos.subirArchivoExcel(this.listaCargosCorrectas).subscribe(response => {
        console.log('respuesta: ', response);
        this.toastr.success('Operación exitosa.', 'Plantilla de Tipo Cargos importada.', {
          timeOut: 2500,
        });
        window.location.reload();
        this.archivoForm.reset();
        this.nameFile = '';
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

   GenerarPdf(action = 'open') {
    this.OrdenarDatos(this.listaTipoCargos);
    const documentDefinition = this.GetDocumentDefinicion();
    console.log('this.listaTipoCargos: ',this.listaTipoCargos)
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download('Tipo_Cargos.pdf'); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
    this.BuscarParametro();
  }

  GetDocumentDefinicion() {
    sessionStorage.setItem('tipoCargo', this.listaTipoCargos);
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
        { text: 'Lista de Tipo Cargos', bold: true, fontSize: 20, alignment: 'center', margin: [0, -10, 0, 10] },
        this.PresentarDataPDFFeriados(),
      ],
      styles: {
        tableHeader: { fontSize: 12, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 10, alignment: 'center' },
        itemsTableD: { fontSize: 10 }
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
                { text: 'Cargos', style: 'tableHeader' },
              ],
              ...this.listaTipoCargos.map(obj => {
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

  ExportToExcel() {
    this.OrdenarDatos(this.listaTipoCargos);
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.listaTipoCargos.map(obj => {
      return {
        CODIGO: obj.id,
        FERIADO: obj.descripcion,
        FECHA: obj.fecha_,
        FECHA_RECUPERA: obj.fec_recuperacion_
      }
    }));
    // METODO PARA DEFINIR TAMAÑO DE LAS COLUMNAS DEL REPORTE
    const header = Object.keys(this.listaTipoCargos[0]); // NOMBRE DE CABECERAS DE COLUMNAS
    var wscols: any = [];
    for (var i = 0; i < header.length; i++) {  // CABECERAS AÑADIDAS CON ESPACIOS
      wscols.push({ wpx: 100 })
    }
    wsr["!cols"] = wscols;
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'LISTA FERIADOS');
    xlsx.writeFile(wb, "FeriadosEXCEL" + '.xlsx');
    this.BuscarParametro();
  }

  /** ************************************************************************************************* **
   ** **                              PARA LA EXPORTACION DE ARCHIVOS XML                            ** **
   ** ************************************************************************************************* **/

  urlxml: string;
  data: any = [];
  ExportToXML() {
    this.OrdenarDatos(this.listaTipoCargos);
    var objeto;
    var arregloFeriados: any = [];
    this.listaTipoCargos.forEach(obj => {
      objeto = {
        "roles": {
          "$": { "id": obj.id },
          "descripcion": obj.descripcion,
        }
      }
      arregloFeriados.push(objeto)
    });

    const xmlBuilder = new xml2js.Builder({ rootName: 'Feriados' });
    const xml = xmlBuilder.buildObject(arregloFeriados);

    if (xml === undefined) {
      console.error('Error al construir el objeto XML.');
      return;
    }

    const blob = new Blob([xml], { type: 'application/xml' });
    const xmlUrl = URL.createObjectURL(blob);

    // Abrir una nueva pestaña o ventana con el contenido XML
    const newTab = window.open(xmlUrl, '_blank');
    if (newTab) {
      newTab.opener = null; // Evitar que la nueva pestaña tenga acceso a la ventana padre
      newTab.focus(); // Dar foco a la nueva pestaña
    } else {
      alert('No se pudo abrir una nueva pestaña. Asegúrese de permitir ventanas emergentes.');
    }
    // const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = xmlUrl;
    a.download = 'Feriados.xml';
    // Simular un clic en el enlace para iniciar la descarga
    a.click();

    this.BuscarParametro();
  }

  /** ************************************************************************************************** **
   ** **                                METODO PARA EXPORTAR A CSV                                    ** **
   ** ************************************************************************************************** **/

  ExportToCVS() {
    this.OrdenarDatos(this.listaTipoCargos);
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.listaTipoCargos.map(obj => {
      return {
        CODIGO: obj.id,
        FERIADO: obj.descripcion,
        FECHA: obj.fecha_,
        FECHA_RECUPERA: obj.fec_recuperacion_
      }
    }));
    const csvDataC = xlsx.utils.sheet_to_csv(wse);
    const data: Blob = new Blob([csvDataC], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, "FeriadosCSV" + '.csv');
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




  contador: number = 0;
  ingresar: boolean = false;
  EliminarMultiple() {
    this.ingresar = false;
    this.contador = 0;
    this.tiposCargoEliminar = this.selectionTipoCargo.selected;
    this.tiposCargoEliminar.forEach((datos: any) => {
      this.listaTipoCargos = this.listaTipoCargos.filter(item => item.id !== datos.id);
      this.contador = this.contador + 1;
      this._TipoCargos.eliminar(datos.id).subscribe(res => {
        console.log('res eliminado: ', res);
        if (!this.ingresar) {
          this.toastr.error('Se ha eliminado ' + this.contador + ' registros.', '', {
            timeOut: 6000,
          });
          this.ingresar = true;
        }
        this.ngOnInit();
      }, error => {
        if (error.error.code == "23503") {
          this.toastr.error('Existen datos relacionados con ' + datos.cargo + '.', 'No fue posible eliminar.', {
            timeOut: 6000,
          });
        } else {
          this.toastr.error(error.error.message, 'Error al eliminar dato', {
            timeOut: 6000,
          });
        }
        this.contador = this.contador - 1;

      })
    }
    );
  }

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
            this.toastr.warning('No ha seleccionado PROVINCIAS.', 'Ups!!! algo salio mal.', {
              timeOut: 6000,
            })
          }
        }
      });
  }



}
