import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { MetodosComponent } from '../../../administracionGeneral/metodoEliminar/metodos.component';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { CatDiscapacidadService } from 'src/app/servicios/catalogos/catDiscapacidad/cat-discapacidad.service';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { ThemePalette } from '@angular/material/core';
import { RegistroDiscapacidadComponent } from '../registrar-discapacidad/registrar-discapacidad.component';
import { EditarDiscapacidadComponent } from '../editar-discapacidad/editar-discapacidad.component';
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
import { ITableDiscapacidad } from 'src/app/model/reportes.model';

@Component({
  selector: 'app-cat-discapacidad',
  templateUrl: './cat-discapacidad.component.html',
  styleUrls: ['./cat-discapacidad.component.css']
})
export class CatDiscapacidadComponent implements OnInit {

  discapacidadesEliminar: any = [];

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

  discapacidades: any;

  empleado: any = [];
  idEmpleado: number; // VARIABLE DE ALMACENAMIENTO DE ID DE EMPLEADO QUE INICIA SESION

  // METODO DE LLAMADO DE DATOS DE EMPRESA COLORES - LOGO - MARCA DE AGUA
  get s_color(): string { return this.plantillaPDF.color_Secundary }
  get p_color(): string { return this.plantillaPDF.color_Primary }
  get frase(): string { return this.plantillaPDF.marca_Agua }
  get logo(): string { return this.plantillaPDF.logoBase64 }

  constructor(
    private plantillaPDF: PlantillaReportesService, // SERVICIO DATOS DE EMPRESA
    private rest: CatDiscapacidadService,
    private restE: EmpleadoService, // SERVICIO DATOS DE EMPLEADO
    public ventana: MatDialog, // VARIABLE DE MANEJO DE VENTANAS
    private toastr: ToastrService, // VARIABLE DE MENSAJES DE NOTIFICACIONES
    public parametro: ParametrosService,
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit() {
    this.discapacidades = [];
    this.ObtenerEmpleados(this.idEmpleado);
    this.ObtenerDiscapacidad();

  }

  // METODO PARA VER LA INFORMACION DEL EMPLEADO
  ObtenerEmpleados(idemploy: any) {
    this.empleado = [];
    this.restE.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleado = data;
    })
  }

  formato_fecha: string = 'DD/MM/YYYY';



  ObtenerDiscapacidad() {
    this.discapacidades = [];

    this.rest.listaDiscapacidad().subscribe(res => {
      this.discapacidades = res
    }, error => {
      console.log('Serivicio rest -> metodo RevisarFormato - ', error);
      this.toastr.error('Error al cargar los datos', 'Listado de Discapacidad', {
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
  }

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

  // VARIABLES DE MANEJO DE PLANTILLA DE DATOS
  nameFile: string;
  archivoSubido: Array<File>;
  mostrarbtnsubir: boolean = false;

  Datos_modalidad_laboral: any


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
    this.OrdenarDatos(this.discapacidades);
    const documentDefinition = this.GetDocumentDefinicion();
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download('Discapacidad.pdf'); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
    this.ObtenerDiscapacidad();
  }

  GetDocumentDefinicion() {
    sessionStorage.setItem('Discapacidades', this.discapacidades);
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
        { text: 'Lista de Discapacidades', bold: true, fontSize: 20, alignment: 'center', margin: [0, -10, 0, 10] },
        this.PresentarDataPDFDiscapacidades(),
      ],
      styles: {
        tableHeader: { fontSize: 12, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 10, alignment: 'center' },
        itemsTableD: { fontSize: 10 }
      }
    };
  }

  PresentarDataPDFDiscapacidades() {
    return {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          table: {
            widths: ['auto', 'auto'],
            body: [
              [
                { text: 'Código', style: 'tableHeader' },
                { text: 'Nombre', style: 'tableHeader' },

              ],
              ...this.discapacidades.map(obj => {
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
    this.OrdenarDatos(this.discapacidades);
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.discapacidades.map(obj => {
      return {
        CODIGO: obj.id,
        NOMBRE: obj.nombre,
      }
    }));
    // METODO PARA DEFINIR TAMAÑO DE LAS COLUMNAS DEL REPORTE
    const header = Object.keys(this.discapacidades[0]); // NOMBRE DE CABECERAS DE COLUMNAS
    var wscols: any = [];
    for (var i = 0; i < header.length; i++) {  // CABECERAS AÑADIDAS CON ESPACIOS
      wscols.push({ wpx: 100 })
    }
    wsr["!cols"] = wscols;
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'LISTA DISCAPACIDADES');
    xlsx.writeFile(wb, "DiscapacidadesEXCEL" + '.xlsx');
    this.ObtenerDiscapacidad();
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
    this.discapacidades.forEach(obj => {
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

  ExportToCVS() {
    this.OrdenarDatos(this.discapacidades);
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.discapacidades);
    const csvDataC = xlsx.utils.sheet_to_csv(wse);
    const data: Blob = new Blob([csvDataC], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, "DiscapacidadesCSV" + '.csv');
    this.ObtenerDiscapacidad();
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



  ConfirmarDelete(discapacidad: any) {

    const mensaje = 'eliminar';
    this.ventana.open(MetodosComponent, { width: '450px', data: mensaje }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.rest.eliminar(discapacidad.id).subscribe(res => {
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

  contador: number = 0;
  ingresar: boolean = false;
  EliminarMultiple() {
    this.ingresar = false;
    this.contador = 0;
    this.discapacidadesEliminar = this.selectionDiscapacidad.selected;
    this.discapacidadesEliminar.forEach((datos: any) => {
      this.discapacidades = this.discapacidades.filter(item => item.id !== datos.id);
      this.contador = this.contador + 1;
      this.rest.eliminar(datos.id).subscribe(res => {
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
