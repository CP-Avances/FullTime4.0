// IMPORTAR LIBRERIAS
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ThemePalette } from '@angular/material/core';
import { environment } from 'src/environments/environment';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import * as xlsx from 'xlsx';
import * as xml2js from 'xml2js';
import * as moment from 'moment';
import * as FileSaver from 'file-saver';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// IMPORTAR SERVICIOS
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { HorarioService } from 'src/app/servicios/catalogos/catHorarios/horario.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';

// IMPORTAR COMPONENTES
import { DetalleCatHorarioComponent } from 'src/app/componentes/catalogos/catHorario/detalle/detalle-cat-horario/detalle-cat-horario.component';
import { RegistroHorarioComponent } from 'src/app/componentes/catalogos/catHorario/horario/registro-horario/registro-horario.component';
import { EditarHorarioComponent } from '../editar-horario/editar-horario.component';
import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';

import { SelectionModel } from '@angular/cdk/collections';
import { ITableHorarios } from 'src/app/model/reportes.model';
import { DetalleCatHorariosService } from 'src/app/servicios/horarios/detalleCatHorarios/detalle-cat-horarios.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';

@Component({
  selector: 'app-principal-horario',
  templateUrl: './principal-horario.component.html',
  styleUrls: ['./principal-horario.component.css']
})

export class PrincipalHorarioComponent implements OnInit {

  // ALMACENAMIENTO DE DATOS Y BUSQUEDA
  horarios: any = [];
  detallesHorarios: any = [];
  ver_horarios: boolean = true;
  horariosEliminar: any = [];

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
  @ViewChild('paginator') paginator: MatPaginator;
  numero_pagina: number = 1;
  tamanio_pagina: number = 5;
  pageSizeOptions = [5, 10, 20, 50];

  // ITEMS DE PAGINACION DE LA TABLA HORARIOS
  @ViewChild('paginatorH') paginatorH: MatPaginator;
  numero_paginaH: number = 1;
  tamanio_paginaH: number = 5;
  pageSizeOptionsH = [5, 10, 20, 50];

  // ITEMS DE PAGINACION DE LA TABLA DETALLES
  @ViewChild('paginatorD') paginatorD: MatPaginator;
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
  horariosCorrectos: number = 0;
  detallesCorrectos: number = 0;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;


  constructor(
    public restEmpre: EmpresaService, // SERVICIO DATOS DE EMPRESA
    public validar: ValidacionesService, // VARIABLE USADA PARA CONTROL DE VALIDACIONES
    public ventana: MatDialog, // VARIABLES MANEJO DE VENTANAS
    public router: Router, // VARIABLE DE MANEJO DE RUTAS
    public restE: EmpleadoService, // SERVICIO DATOS DE EMPLEADO
    private rest: HorarioService, // SERVICIO DATOS DE HORARIO
    private restD: DetalleCatHorariosService,
    private toastr: ToastrService, // VARIABLE DE MANEJO DE NOTIFICACIONES
    public parametro: ParametrosService,
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

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
      this.p_color = res[0].color_principal;
      this.s_color = res[0].color_secundario;
      this.frase = res[0].marca_agua;
    });
  }

  formato_hora: string = 'HH:mm:ss';
  BuscarHora() {
    // id_tipo_parametro Formato hora = 2
    this.parametro.ListarDetalleParametros(2).subscribe(
      res => {
        this.formato_hora = res[0].descripcion;
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
    this.rest.BuscarListaHorarios().subscribe((datos: any) => {
      this.horarios = datos.map((obj: any) => {
        switch (obj.default_) {
          case 'N':
            obj.default_tipo = 'Laborable';
            break;
          case 'L':
          case 'DL':
            obj.default_tipo = 'Libre';
            break;
          case 'FD':
          case 'DFD':
            obj.default_tipo = 'Feriado';
            break;
          case 'HA':
          case 'DHA':
            obj.default_tipo = 'Abierto';
            break;
          default:
            obj.default_tipo = 'Desconocido'; // Manejo de caso por defecto
        }
        return obj;
      });

      this.restD.ConsultarDetalleHorarios({}).subscribe((data: any) => {
        this.detallesHorarios = data.map((detalle: any) => {
          // Formatear la hora del detalle
          detalle.hora = this.validar.FormatearHora(detalle.hora, this.formato_hora);
          return detalle;
        });

        this.horarios.forEach((horario: any) => {
          horario.detalles = this.detallesHorarios.filter((detalle: any) => detalle.id_horario === horario.id);
        });
      });
    });
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
    this.activar_seleccion = true;
    this.plan_multiple = false;
    this.plan_multiple_ = false;
    this.selectionHorarios.clear();
    this.horariosEliminar = [];
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
    if(this.paginator) {
      this.paginator.firstPage();
    }
    if (this.paginatorH) {
      this.paginatorH.firstPage();
    }
    if (this.paginatorD) {
      this.paginatorD.firstPage();
    }
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
    this.mostrarbtnsubir = true;
    this.archivo1Form.reset();
    this.numero_paginaH = 1;
    this.numero_paginaD = 1;
    this.tamanio_paginaH = 5;
    this.tamanio_paginaD = 5;
    if (this.paginatorH) {
      this.paginatorH.firstPage();
    }
    if (this.paginatorD) {
      this.paginatorD.firstPage();
    }
  }

  CargarPlantillaGeneral(element: any) {
    if (element.target.files && element.target.files[0]) {
      this.archivoSubido = element.target.files;
      this.nameFile = this.archivoSubido[0].name;
      let arrayItems = this.nameFile.split(".");
      let itemExtencion = arrayItems[arrayItems.length - 1];
      let itemName = arrayItems[0];

      if (itemExtencion == 'xlsx' || itemExtencion == 'xls') {
        if (itemName.toLowerCase().startsWith('plantillaconfiguraciongeneral')) {
          this.VerificarPlantilla();
        } else {
          this.toastr.error('Solo se acepta plantillaConfiguracionGeneral.', 'Plantilla seleccionada incorrecta', {
            timeOut: 6000,
          });
        }
      } else {
        this.toastr.error('Error en el formato del documento.', 'Plantilla no aceptada.', {
          timeOut: 6000,
        });
      }
    } else {
      this.toastr.error('Error al cargar el archivo.', 'Ups!!! algo salio mal.', {
        timeOut: 6000,
      });
    }
    this.LimpiarCamposPlantilla();
  }

  VerificarPlantilla() {
    this.listaHorariosCorrectos = [];
    this.listaDetalleCorrectos = [];

    let formData = new FormData();
    for (let i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads", this.archivoSubido[i], this.archivoSubido[i].name);

    }

    this.rest.VerificarDatosHorario(formData).subscribe(res => {
      this.dataHorarios = res;
      this.dataHorarios.plantillaHorarios.forEach((obj: any) => {
        if (obj.OBSERVACION == 'Ok') {
          this.listaHorariosCorrectos.push(obj);
        }
      });
      this.dataHorarios.plantillaDetalles.forEach((obj: any) => {
        if (obj.OBSERVACION == 'Ok') {
          this.listaDetalleCorrectos.push(obj);
        }
      });
      this.OrdenarHorarios();
      this.OrdenarDetalles();

      this.horariosCorrectos = this.listaHorariosCorrectos.length;
      this.detallesCorrectos = this.listaDetalleCorrectos.length;
    });
  }

  // METODO PARA ORDENAR HORARIOS POR OBSERVACION
  OrdenarHorarios() {
    this.dataHorarios.plantillaHorarios.sort((a: any, b: any) => {
      if (a.OBSERVACION !== 'Ok' && b.OBSERVACION === 'Ok') {
        return -1;
      }
      if (a.OBSERVACION === 'Ok' && b.OBSERVACION !== 'Ok') {
        return 1;
      }
      if (a.OBSERVACION === 'Ok' && b.OBSERVACION === 'Ok') {
        if (!a.DETALLE && b.DETALLE) {
          return -1;
        }
        if (a.DETALLE && !b.DETALLE) {
          return 1;
        }
      }
      return 0;
    });
  }

  // METODO PARA ORDENAR DETALLES POR OBSERVACION
  OrdenarDetalles() {
    this.dataHorarios.plantillaDetalles.sort((a: any, b: any) => {
      if (a.OBSERVACION !== 'Ok' && b.OBSERVACION === 'Ok') {
        return -1;
      }
      if (a.OBSERVACION === 'Ok' && b.OBSERVACION !== 'Ok') {
        return 1;
      }
      return 0;
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
    const data = {
      horarios: this.listaHorariosCorrectos,
      detalles: this.listaDetalleCorrectos,
      user_name: this.user_name,
      ip: this.ip,
    };

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
        }
        else if (res.mensaje === 'no_existe_horario') {
          this.toastr.error('No se ha encontrado pestaña HORARIOS en la plantilla.', 'Plantilla no aceptada.', {
            timeOut: 4500,
          });
          this.archivo1Form.reset();
          this.nameFile = '';
        }
        else if (res.mensaje === 'no_existe_detalle') {
          this.toastr.error('No se ha encontrado pestaña DETALLE_HORARIOS en la plantilla.', 'Plantilla no aceptada.', {
            timeOut: 4500,
          });
          this.archivo1Form.reset();
          this.nameFile = '';
        }
        else {
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
    console.log('horarios', this.horarios);

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
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [40, 50, 40, 50],
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
        { image: this.logo, width: 100, margin: [10, -25, 0, 5] },
        { text: localStorage.getItem('name_empresa')?.toUpperCase(), bold: true, fontSize: 14, alignment: 'center', margin: [0, -30, 0, 5] },
        { text: 'LISTA DE HORARIOS', bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 0] },
        ...this.PresentarDataPDFHorarios(),
      ],
      styles: {
        tableHeader: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.s_color },
        centrado: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.s_color, margin: [0, 7, 0, 0] },
        itemsTable: { fontSize: 8 },
        itemsTableInfo: { fontSize: 10, margin: [0, 3, 0, 3], fillColor: this.s_color },
        itemsTableInfoHorario: { fontSize: 9, margin: [0, -1, 0, -1], fillColor: this.p_color },
        itemsTableCentrado: { fontSize: 8, alignment: 'center' },
        tableMargin: { margin: [0, 0, 0, 0] },
        tableMarginCabecera: { margin: [0, 15, 0, 0] },
        tableMarginCabeceraHorario: { margin: [0, 10, 0, 0] },
      }
    };
  }

  // METODO PARA PRESENTAR DATOS DEL DOCUMENTO PDF
  PresentarDataPDFHorarios(): Array<any> {
    let n: any = []

    this.horarios.forEach((obj: any) => {
      n.push({
        style: 'tableMarginCabeceraHorario',
        table: {
          widths: ['*','*'],
          headerRows: 2,
          body: [
            [
              { text: `HORARIO: ${obj.nombre}`, style: 'itemsTableInfoHorario', border: [true, true, false, false] },
              { text: `HORAS DE TRABAJO: ${obj.hora_trabajo}`, style: 'itemsTableInfoHorario', border: [false, true, true, false] }
            ],
            [
              { text: `CÓDIGO: ${obj.codigo}`, style: 'itemsTableInfoHorario', border: [true, false, false, false] },
              { text: `HORARIO NOTURNO ${obj.noturno == true ? 'Sí' : 'No'}`, style: 'itemsTableInfoHorario', border: [false, false, true, false] }
            ],
          ]
        },
      });

      n.push({
        style: 'tableMargin',
        table: {
          widths: ['*'],
          headerRows: 1,
          body: [
            [
              { text: `DOCUMENTO: ${obj.documento ? obj.documento : ''}`, style: 'itemsTableInfoHorario', border: obj.detalles.length > 0 ? [true, false, true, false] : [true, false, true, true] },
            ]
          ]
        }
      });

      if (obj.detalles.length > 0) {
        n.push({
          style: 'tableMargin',
          table: {
            widths: [ '*'],
            headerRows: 1,
            body: [
              [{ rowSpan: 1, text: 'DETALLES', style: 'tableHeader', border: [true, true, true, false]  }],
            ]
          }
        });
        n.push({
          style: 'tableMargin',
          table: {
            widths: ['auto', 'auto', 'auto', '*', 'auto', 'auto', 'auto'],
            headerRows: 1,
            body: [
              [
                { text: 'ORDEN', style: 'tableHeader' },
                { text: 'HORA', style: 'tableHeader' },
                { text: 'TOLERANCIA', style: 'tableHeader' },
                { text: 'ACCIÓN', style: 'tableHeader' },
                { text: 'OTRO DIA', style: 'tableHeader' },
                { text: 'MINUTOS ANTES', style: 'tableHeader' },
                { text: 'MINUTOS DESPUES', style: 'tableHeader' },
              ],
              ...obj.detalles.map((detalle: any) => {
                return [
                  { text: detalle.orden, style: 'itemsTableCentrado' },
                  { text: detalle.hora, style: 'itemsTableCentrado' },
                  { text: detalle.tolerancia !=null ? detalle.tolerancia : '', style: 'itemsTableCentrado' },
                  { text: detalle.tipo_accion_show, style: 'itemsTableCentrado' },
                  { text: detalle.segundo_dia == true ? 'Sí' : 'No', style: 'itemsTableCentrado' },
                  { text: detalle.minutos_antes, style: 'itemsTableCentrado' },
                  { text: detalle.minutos_despues, style: 'itemsTableCentrado' },
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
    // return {
    //   columns: [
    //     { width: '*', text: '' },
    //     {
    //       width: 'auto',
    //       table: {
    //         widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
    //         body: [
    //           [
    //             { text: 'Código', style: 'tableHeader' },
    //             { text: 'Nombre', style: 'tableHeader' },
    //             { text: 'Minutos de almuerzo', style: 'tableHeader' },
    //             { text: 'Horas de trabajo', style: 'tableHeader' },
    //             { text: 'Horario noturno', style: 'tableHeader' },
    //             { text: 'Documento', style: 'tableHeader' },
    //           ],
    //           ...this.horarios.map((obj: any) => {
    //             return [
    //               { text: obj.codigo, style: 'itemsTableC' },
    //               { text: obj.nombre, style: 'itemsTable' },
    //               { text: obj.minutos_comida, style: 'itemsTableC' },
    //               { text: obj.hora_trabajo, style: 'itemsTableC' },
    //               { text: obj.noturno == true ? 'Sí' : 'No', style: 'itemsTableC' },
    //               { text: obj.documento, style: 'itemsTableC' },
    //             ];
    //           })
    //         ]
    //       },
    //       // ESTILO DE COLORES FORMATO ZEBRA
    //       layout: {
    //         fillColor: function (i: any) {
    //           return (i % 2 === 0) ? '#CCD1D1' : null;
    //         }
    //       }
    //     },
    //     { width: '*', text: '' },
    //   ]
    // };
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
    this.horarios.forEach((obj: any) => {
      objeto = {
        "horario": {
          "$": { "id": obj.id },
          "nombre": obj.nombre,
          "min_almuerzo": obj.minutos_comida,
          "hora_trabajo": obj.hora_trabajo,
          "noturno": obj.nocturno,
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

    const a = document.createElement('a');
    a.href = xmlUrl;
    a.download = 'Horarios.xml';
    // SIMULAR UN CLIC EN EL ENLACE PARA INICIAR LA DESCARGA
    a.click();
  }


  // METODO PARA DEFINIR EL COLOR DE LA OBSERVACION
  ObtenerColorValidacion(observacion: string): string {
    if (observacion.startsWith('Datos no registrados:')) {
      return 'rgb(242, 21, 21)';
    }

    if (observacion.startsWith('Formato') || (observacion.startsWith('Tipo'))) {
      return 'rgb(222, 162, 73)';
    }

    if (observacion.startsWith('Requerido') || observacion.startsWith('No cumple')
        || (observacion.startsWith('Horas')) || observacion.startsWith('Minutos de alimentación no')) {
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

    return `${this.selectionHorarios.isSelected(row) ? 'deselect' : 'select'} row ${row.descripcion + 1}`;
  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO PLANIFICACIÓN
  EliminarDetalle(id_horario: any) {
    const datos = {
      user_name: this.user_name,
      ip: this.ip
    };
    this.rest.EliminarRegistro(id_horario, datos).subscribe((res: any) => {
      if (res.message === 'error') {
        this.toastr.error('Existen datos relacionados con este registro.', 'No fue posible eliminar.', {
          timeOut: 6000,
        });
      } else {
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
          this.activar_seleccion = true;
          this.plan_multiple = false;
          this.plan_multiple_ = false;
          this.horariosEliminar = [];
          this.selectionHorarios.clear();
          this.ObtenerHorarios();
        }
      });
  }

  // METODO PARA ELIMINAR REGISTROS
  contador: number = 0;
  ingresar: boolean = false;
  EliminarMultiple() {
    const data = {
      user_name: this.user_name,
      ip: this.ip
    };
    this.ingresar = false;
    this.contador = 0;
    this.horariosEliminar = this.selectionHorarios.selected;
    this.horariosEliminar.forEach((datos: any) => {
      this.horarios = this.horarios.filter(item => item.id !== datos.id);
      this.contador = this.contador + 1;
      this.rest.EliminarRegistro(datos.id, data).subscribe((res: any) => {
        if (res.message === 'error') {
          this.toastr.error('Existen datos relacionados con ' + datos.codigo + '.', 'No fue posible eliminar.', {
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
          this.ObtenerHorarios();
        }
      });
    }
    )
  }

  // METODO PARA CONFIRMAR ELIMINACION MULTIPLE
  ConfirmarDeleteMultiple() {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          if (this.horariosEliminar.length != 0) {
            this.EliminarMultiple();
            this.activar_seleccion = true;
            this.plan_multiple = false;
            this.plan_multiple_ = false;
            this.horariosEliminar = [];
            this.selectionHorarios.clear();
            this.ObtenerHorarios();
          } else {
            this.toastr.warning('No ha seleccionado HORARIOS.', 'Ups!!! algo salio mal.', {
              timeOut: 6000,
            })
          }
        } else {
          this.router.navigate(['/horario']);
        }
      });

  }

}
