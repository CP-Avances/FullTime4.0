// IMPORTAR LIBRERIAS
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as FileSaver from 'file-saver';
import * as moment from 'moment';
import * as xlsx from 'xlsx';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as xml2js from 'xml2js';

// IMPORTAR SERVICIOS
import { DetalleCatHorariosService } from 'src/app/servicios/horarios/detalleCatHorarios/detalle-cat-horarios.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { HorarioService } from 'src/app/servicios/catalogos/catHorarios/horario.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';

// IMPORTAR COMPONENTES
import { DetalleCatHorarioComponent } from 'src/app/componentes/catalogos/catHorario/detalle/detalle-cat-horario/detalle-cat-horario.component';
import { RegistroHorarioComponent } from 'src/app/componentes/catalogos/catHorario/horario/registro-horario/registro-horario.component';
import { EditarHorarioComponent } from '../editar-horario/editar-horario.component';
import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { SpinnerService } from '../../../../../servicios/spinner/spinner.service';

import { SelectionModel } from '@angular/cdk/collections';
import { ITableHorarios } from 'src/app/model/reportes.model';
@Component({
  selector: 'app-principal-horario',
  templateUrl: './principal-horario.component.html',
  styleUrls: ['./principal-horario.component.css']
})

export class PrincipalHorarioComponent implements OnInit {


  horariosEliminar: any = [];

  // ALMACENAMIENTO DE DATOS Y BUSQUEDA
  horarios: any = [];
  ver_horarios: boolean = true;

  // FILTROS
  filtroNombreHorario = '';

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  nombreHorarioF = new FormControl('', Validators.minLength(2));
  archivo1Form = new FormControl('');
  descripcionF = new FormControl('');
  codigoF = new FormControl('');
  codigoFD = new FormControl('');

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    nombreHorarioForm: this.nombreHorarioF,
    descripcionForm: this.descripcionF,
    codigoForm: this.codigoF,
    codigoFormD: this.codigoFD,
  });

  // VARIABLES USADAS EN SELECCIÓN DE ARCHIVOS
  nameFile: string;
  archivoSubido: Array<File>;

  // ITEMS DE PAGINACION DE LA TABLA
  numero_pagina: number = 1;
  tamanio_pagina: number = 5;
  pageSizeOptions = [5, 10, 20, 50];

  // ITEMS DE PAGINACION DE LA TABLA HORARIOS
  numero_paginaH: number = 1;
  tamanio_paginaH: number = 5;
  pageSizeOptionsH = [5, 10, 20, 50];

  // ITEMS DE PAGINACION DE LA TABLA DETALLES
  numero_paginaD: number = 1;
  tamanio_paginaD: number = 5;
  pageSizeOptionsD = [5, 10, 20, 50];

  // VARIABLES DE ALMACENAMIENTO DE USUARIO DE INICIO SESIÓN
  empleado: any = [];
  idEmpleado: number;

  // VARIABLE DE NAVEGABILIDAD
  hipervinculo: string = environment.url;

  //VARIABLES PARA VALIDAR HORARIOS Y DETALLES
  dataHorarios: any;
  mostrarbtnsubir: boolean = false;
  listaHorariosCorrectos: any = [];
  listaDetalleCorrectos: any = [];

  // VARIABLES PROGRESS SPINNER
  habilitarprogress: boolean = false;
  mode: ProgressSpinnerMode = 'indeterminate';
  color: ThemePalette = 'primary';
  value = 10;

  constructor(
    public restEmpre: EmpresaService, // SERVICIO DATOS DE EMPRESA
    public validar: ValidacionesService, // VARIABLE USADA PARA CONTROL DE VALIDACIONES
    public ventana: MatDialog, // VARIABLES MANEJO DE VENTANAS
    public router: Router, // VARIABLE DE MANEJO DE RUTAS
    public restE: EmpleadoService, // SERVICIO DATOS DE EMPLEADO
    private rest: HorarioService, // SERVICIO DATOS DE HORARIO
    private restD: DetalleCatHorariosService, // SERVICIO DE DATOS DE DETALLES DE HORARIOS
    private toastr: ToastrService, // VARIABLE DE MANEJO DE NOTIFICACIONES
    private spinnerService: SpinnerService
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.nameFile = '';
    this.ObtenerLogo();
    this.ObtenerColores();
    this.ObtenerHorarios();
    this.ObtenerEmpleados();
  }

  // METODO PARA VER LA INFORMACION DEL EMPLEADO
  ObtenerEmpleados() {
    this.empleado = [];
    this.restE.BuscarUnEmpleado(this.idEmpleado).subscribe(data => {
      this.empleado = data;
    })
  }

  // METODO PARA OBTENER EL LOGO DE LA EMPRESA
  logo: any = String;
  ObtenerLogo() {
    this.restEmpre.LogoEmpresaImagenBase64(localStorage.getItem('empresa') as string).subscribe(res => {
      this.logo = 'data:image/jpeg;base64,' + res.imagen;
    });
  }

  // METODO PARA OBTENER COLORES Y MARCA DE AGUA DE EMPRESA
  p_color: any;
  s_color: any;
  frase: any;
  ObtenerColores() {
    this.restEmpre.ConsultarDatosEmpresa(parseInt(localStorage.getItem('empresa') as string)).subscribe(res => {
      this.p_color = res[0].color_p;
      this.s_color = res[0].color_s;
      this.frase = res[0].marca_agua;
    });
  }

  // METODO PARA MANEJAR PAGINAS DE TABLA
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // METODO PARA MANEJAR PAGINAS DE TABLA HORARIOS
  ManejarPaginaH(e: PageEvent) {
    this.tamanio_paginaH = e.pageSize;
    this.numero_paginaH = e.pageIndex + 1;
  }

  // METODO PARA MANEJAR PAGINAS DE TABLA DETALLES
  ManejarPaginaD(e: PageEvent) {
    this.tamanio_paginaD = e.pageSize;
    this.numero_paginaD = e.pageIndex + 1;
  }

  // METODO PARA OBTENER HORARIOS
  ObtenerHorarios() {
    this.horarios = [];
    this.rest.BuscarListaHorarios().subscribe(datos => {
      this.horarios = datos;
      this.horarios.forEach(obj => {
        if (obj.default_ === 'N') {
          obj.default_tipo = 'Laborable';
        }
        else if (obj.default_ === 'L' || obj.default_ === 'DL') {
          obj.default_tipo = 'Libre';
        }
        else if (obj.default_ === 'FD' || obj.default_ === 'DFD') {
          obj.default_tipo = 'Feriado';
        }
        else if (obj.default_ === 'HA' || obj.default_ === 'DHA') {
          obj.default_tipo = 'Abierto';
        }
      })
    })
  }

  // METODO PARA ABRIR VENTANA REGISTRAR HORARIO
  AbrirVentanaRegistrarHorario(): void {
    this.ventana.open(RegistroHorarioComponent, { width: '1000px' })
      .afterClosed().subscribe(items => {
        if (items > 0) {
          this.VerDetallesHorario(items)
        }
        else if (items === 0) {
          this.ObtenerHorarios();
        }
      });
  }

  // METODO PARA ABRIR VENTANA REGISTRAR DETALLE DE HORARIO
  AbrirRegistraDetalle(datosSeleccionados: any): void {
    this.ventana.open(DetalleCatHorarioComponent,
      { width: '610px', data: { datosHorario: datosSeleccionados, actualizar: false } })
      .afterClosed().subscribe(items => {
        if (items) {
          this.VerDetallesHorario(items)
        }
      });
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.dataHorarios = null;
    this.archivoSubido = [];
    this.nameFile = '';
    this.numero_paginaH = 1;
    this.numero_paginaD = 1;
    this.tamanio_paginaH = 5;
    this.tamanio_paginaD = 5;
    this.mostrarbtnsubir = false;
    this.formulario.setValue({
      nombreHorarioForm: '',
      descripcionForm: '',
      codigoForm: '',
      codigoFormD: '',
    });
    this.archivo1Form.reset();
    this.ObtenerHorarios();
  }

  // METODO PARA ABRIR VENTANA EDITAR HORARIO
  AbrirVentanaEditarHorario(datosSeleccionados: any): void {
    this.ventana.open(EditarHorarioComponent,
      { width: '1000px', data: { horario: datosSeleccionados, actualizar: false } })
      .afterClosed().subscribe(items => {
        if (items === 1) {
          this.VerDetallesHorario(datosSeleccionados.id)
        }
      });
  }



  // METODO PARA VISUALIZAR PANTALLA DE HORARIOS Y DETALLES
  ver_detalles: boolean = false;
  horario_id: number;
  pagina: string;
  VerDetallesHorario(id: number) {
    this.horario_id = id;
    this.ver_horarios = false;
    this.ver_detalles = true;
    this.pagina = 'lista-horarios';
  }

  /** ************************************************************************************************* **
   ** **                              PLANTILLA CARGAR SOLO HORARIOS                                 ** **
   ** ************************************************************************************************* **/

  // LIMPIAR CAMPOS PLANTILLA
  LimpiarCamposPlantilla() {
    this.mostrarbtnsubir = false;
    this.dataHorarios = null;
    this.archivoSubido = [];
    this.nameFile = '';
    this.listaHorariosCorrectos = [];
    this.listaDetalleCorrectos = [];
    this.archivo1Form.reset();
    this.habilitarprogress = false;
    this.spinnerService.hide();
    this.numero_paginaH = 1;
    this.numero_paginaD = 1;
    this.tamanio_paginaH = 5;
    this.tamanio_paginaD = 5;
  }

  CargarPlantillaGeneral(element: any) {
    this.habilitarprogress = true;
    this.spinnerService.show();
    if (element.target.files && element.target.files[0]) {
      this.archivoSubido = element.target.files;
      this.nameFile = this.archivoSubido[0].name;
      let arrayItems = this.nameFile.split(".");
      let itemExtencion = arrayItems[arrayItems.length - 1];
      let itemName = arrayItems[0];

      if (itemExtencion == 'xlsx' || itemExtencion == 'xls') {
        if (itemName.toLowerCase() == 'plantillageneral') {
          this.VerificarPlantilla();
        } else {
          this.toastr.error('Solo se acepta plantillaGeneral', 'Plantilla seleccionada incorrecta', {
            timeOut: 6000,
          });
          this.LimpiarCamposPlantilla();
        }
      } else {
        this.toastr.error('Error en el formato del documento', 'Plantilla no aceptada', {
          timeOut: 6000,
        });
        this.LimpiarCamposPlantilla();
      }
    } else {
      this.toastr.error('Error al cargar el archivo', 'Ups!!! algo salio mal.', {
        timeOut: 6000,
      });
      this.LimpiarCamposPlantilla();
    }
    this.archivo1Form.reset();
    this.mostrarbtnsubir = true;
  }

  VerificarPlantilla() {
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads", this.archivoSubido[i], this.archivoSubido[i].name);

    }
    console.log("formdata", formData);
    this.rest.VerificarDatosHorario(formData).subscribe(res => {
      this.dataHorarios = res;
      this.dataHorarios.plantillaHorarios.forEach(obj => {
        if (obj.OBSERVACION == 'Ok') {
          this.listaHorariosCorrectos.push(obj);
        }
      });

      this.dataHorarios.plantillaDetalles.forEach(obj => {
        if (obj.OBSERVACION == 'Ok') {
          this.listaDetalleCorrectos.push(obj);
        }
      });
      this.habilitarprogress = false;
      this.spinnerService.hide();
    });
  }

  //FUNCION PARA CONFIRMAR EL REGISTRO MULTIPLE DE HORARIOS Y DETALLES DEL ARCHIVO EXCEL
  ConfirmarRegistroMultiple() {
    const mensaje = 'registro';
    this.ventana.open(MetodosComponent, { width: '450px', data: mensaje }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.RegistrarHorariosDetalles();
        }
      });
  }

  RegistrarHorariosDetalles() {
    this.habilitarprogress = true;
    this.spinnerService.show();
    const data = {
      horarios: this.listaHorariosCorrectos,
      detalles: this.listaDetalleCorrectos
    }
    if (this.listaHorariosCorrectos.length == 0) {
      this.toastr.error('No se ha encontrado datos para su registro', 'Plantilla procesada.', {
        timeOut: 6000,
      });
      this.LimpiarCamposPlantilla();
      return;
    } else {
      this.rest.CargarHorariosMultiples(data).subscribe(res => {
        if (res.mensaje === 'error') {
          this.toastr.error('Error al importar horarios y detalles', 'Ups!!! algo salio mal.', {
            timeOut: 6000,
          });
          this.archivo1Form.reset();
          this.nameFile = '';
          this.habilitarprogress = false;
          this.spinnerService.hide();
        } else {
          this.toastr.success('Plantilla de horarios importada', 'Operación exitosa.', {
            timeOut: 6000,
          });
          this.LimpiarCamposPlantilla();
          this.LimpiarCampos();
        }
      }, error => {
        this.toastr.error('Error al importar horarios y detalles', 'Ups!!! algo salio mal.', {
          timeOut: 6000,
        });
        this.LimpiarCamposPlantilla();
      });
    }
  }


  /** ************************************************************************************************* **
   ** **                                METODO PARA EXPORTAR A PDF                                   ** **
   ** ************************************************************************************************* **/

  // GENERAR ARCHIVO PDF
  GenerarPDF(action = 'open') {
    const documentDefinition = this.EstructurarPDF();

    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download('Horarios.pdf'); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }

  }

  // DEFINICION DEL DOCUMENTO PDF
  EstructurarPDF() {
    sessionStorage.setItem('Empleados', this.horarios);
    return {
      // ENCABEZADO DE PÁGINA
      pageOrientation: 'landscape',
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleado[0].nombre + ' ' + this.empleado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },
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
        { text: 'Lista de Horarios', bold: true, fontSize: 20, alignment: 'center', margin: [0, -30, 0, 10] },
        this.PresentarDataPDFEmpleados(),
      ],
      styles: {
        tableHeader: { fontSize: 12, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 10 },
        itemsTableC: { fontSize: 10, alignment: 'center' }
      }
    };
  }

  // METODO PARA PRESENTAR DATOS DEL DOCUMENTO PDF
  PresentarDataPDFEmpleados() {
    return {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          table: {
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Código', style: 'tableHeader' },
                { text: 'Nombre', style: 'tableHeader' },
                { text: 'Minutos de almuerzo', style: 'tableHeader' },
                { text: 'Horas de trabajo', style: 'tableHeader' },
                { text: 'Horario noturno', style: 'tableHeader' },
                { text: 'Requiere detalle', style: 'tableHeader' },
                { text: 'Documento', style: 'tableHeader' },
              ],
              ...this.horarios.map(obj => {
                return [
                  { text: obj.id, style: 'itemsTableC' },
                  { text: obj.nombre, style: 'itemsTable' },
                  { text: obj.min_almuerzo, style: 'itemsTableC' },
                  { text: obj.hora_trabajo, style: 'itemsTableC' },
                  { text: obj.noturno == true ? 'Sí' : 'No', style: 'itemsTableC' },
                  { text: obj.detalle == true ? 'Sí' : 'No', style: 'itemsTableC' },
                  { text: obj.documento, style: 'itemsTableC' },
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
   ** **                                 METODO PARA EXPORTAR A EXCEL                                ** **
   ** ************************************************************************************************* **/

  ExportToExcel() {
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.horarios);
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'horarios');
    xlsx.writeFile(wb, "HorariosEXCEL" + '.xlsx');
  }

  /** ************************************************************************************************* **
   ** **                               METODO PARA EXPORTAR A CSV                                    ** **
   ** ************************************************************************************************* **/

  ExportToCVS() {
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.horarios);
    const csvDataH = xlsx.utils.sheet_to_csv(wse);
    const data: Blob = new Blob([csvDataH], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, "HorariosCSV" + '.csv');
  }

  /** ************************************************************************************************* **
   ** **                           PARA LA EXPORTACION DE ARCHIVOS XML                                ** **
   ** ************************************************************************************************* **/

  urlxml: string;
  data: any = [];
  ExportToXML() {
    var objeto: any;
    var arregloHorarios: any = [];
    this.horarios.forEach(obj => {
      objeto = {
        "horario": {
          "$": { "id": obj.id },
          "nombre": obj.nombre,
          "min_almuerzo": obj.min_almuerzo,
          "hora_trabajo": obj.hora_trabajo,
          "noturno": obj.nocturno,
          "requiere_detalle": obj.detalle,
          "documento": obj.documento,
        }
      }
      arregloHorarios.push(objeto)
    });

    const xmlBuilder = new xml2js.Builder({ rootName: 'Horarios' });
    const xml = xmlBuilder.buildObject(arregloHorarios);

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
    // const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = xmlUrl;
    a.download = 'Horarios.xml';
    // SIMULAR UN CLIC EN EL ENLACE PARA INICIAR LA DESCARGA
    a.click();
  }


  //METODO PARA DEFINIR EL COLOR DE LA OBSERVACION
  ObtenerColorValidacion(observacion: string): string {
    if (observacion.startsWith('Datos no registrados:')) {
      return 'rgb(242, 21, 21)';
    }

    if (observacion.startsWith('Formato') || (observacion.startsWith('Tipo'))) {
      return 'rgb(222, 162, 73)';
    }

    if (observacion.startsWith('Requerido') || observacion.startsWith('No cumple') || observacion.startsWith('Minutos de alimentación no')) {
      return 'rgb(238, 34, 207)';
    }

    switch (observacion) {
      case 'Ok':
        return 'rgb(159, 221, 154)';
      case 'Ya existe en el sistema':
        return 'rgb(239, 203, 106)';
      case 'Codigo de horario no existe en los horarios validos':
        return 'rgb(239, 203, 106)';
      case 'Registro duplicado dentro de la plantilla':
        return 'rgb(156, 214, 255)';
      default:
        return 'rgb(242, 21, 21)';
    }
  }

  ObtenerColorDatoRegistrado(dato: string) {
    if (dato == 'No registrado') {
      return 'rgb(242, 21, 21)';
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

  selectionHorarios = new SelectionModel<ITableHorarios>(true, []);



  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedPag() {
    const numSelected = this.selectionHorarios.selected.length;
    return numSelected === this.horarios.length
  }


  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterTogglePag() {
    this.isAllSelectedPag() ?
      this.selectionHorarios.clear() :
      this.horarios.forEach((row: any) => this.selectionHorarios.select(row));
  }


  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelPag(row?: ITableHorarios): string {
    if (!row) {
      return `${this.isAllSelectedPag() ? 'select' : 'deselect'} all`;
    }
    this.horariosEliminar = this.selectionHorarios.selected;
    //console.log('paginas para Eliminar',this.paginasEliminar);

    //console.log(this.selectionPaginas.selected)
    return `${this.selectionHorarios.isSelected(row) ? 'deselect' : 'select'} row ${row.descripcion + 1}`;

  }


  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO PLANIFICACIÓN
  EliminarDetalle(id_horario: any) {


    this.rest.EliminarRegistro(id_horario).subscribe(res => {

      if (res.message === 'error') {
        this.toastr.error('No se puede elminar.', '', {
          timeOut: 6000,
        });

      } else {

        // METODO PARA AUDITAR CATÁLOGO HORARIOS
        this.validar.Auditar('app-web', 'cg_horarios', id_horario, '', 'DELETE');
        this.toastr.error('Registro eliminado.', '', {
          timeOut: 6000,
        });
        this.ObtenerHorarios();

      }


    });
  }




  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  ConfirmarDelete(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarDetalle(datos.id);
        }
      });
  }


  contador: number = 0;
  ingresar: boolean = false;

  EliminarMultiple() {

    this.ingresar = false;
    this.contador = 0;
    this.horariosEliminar = this.selectionHorarios.selected;
    this.horariosEliminar.forEach((datos: any) => {

      this.horarios = this.horarios.filter(item => item.id !== datos.id);

      this.contador = this.contador + 1;

      this.rest.EliminarRegistro(datos.id).subscribe(res => {

        if (res.message === 'error') {
          this.toastr.error('No se puede elminar.', '', {
            timeOut: 6000,
          });
          this.contador = this.contador - 1;

        } else {

          // METODO PARA AUDITAR CATÁLOGO HORARIOS
          this.validar.Auditar('app-web', 'cg_horarios', datos.id, '', 'DELETE');
          if (!this.ingresar) {
            this.toastr.error('Se ha Eliminado ' + this.contador + ' registros.', '', {
              timeOut: 6000,
            });
            this.ingresar = true;
          }
          this.ObtenerHorarios();

        }
      });
    }
    )
  }


  ConfirmarDeleteMultiple() {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {

          if (this.horariosEliminar.length != 0) {
            this.EliminarMultiple();
            this.activar_seleccion = true;

            this.plan_multiple = false;
            this.plan_multiple_ = false;
          } else {
            this.toastr.warning('No ha seleccionado HORARIOS.', 'Ups!!! algo salio mal.', {
              timeOut: 6000,
            })

          }

          this.selectionHorarios.clear();

        } else {
          this.router.navigate(['/horario']);
        }


      });
    this.ObtenerHorarios();

  }


}
