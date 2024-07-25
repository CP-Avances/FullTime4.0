// IMPORTACION DE LIBRERIAS
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import * as xlsx from 'xlsx';
import * as moment from 'moment';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
import * as FileSaver from 'file-saver';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// IMPORTAR COMPONENTES
import { EditarTipoComidasComponent } from 'src/app/componentes/modulos/alimentacion/catTipoComidas/tipos-comidas/editar-tipo-comidas/editar-tipo-comidas.component';
import { TipoComidasComponent } from 'src/app/componentes/modulos/alimentacion/catTipoComidas/tipos-comidas/tipo-comidas/tipo-comidas.component';
import { DetalleMenuComponent } from '../../detalles-comidas/detalle-menu/detalle-menu.component';
import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';

// IMPORTAR SERVICIOS
import { PlantillaReportesService } from 'src/app/componentes/reportes/plantilla-reportes.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { TipoComidasService } from 'src/app/servicios/catalogos/catTipoComidas/tipo-comidas.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { MainNavService } from 'src/app/componentes/administracionGeneral/main-nav/main-nav.service';

@Component({
  selector: 'app-listar-tipo-comidas',
  templateUrl: './listar-tipo-comidas.component.html',
  styleUrls: ['./listar-tipo-comidas.component.css']
})

export class ListarTipoComidasComponent implements OnInit {

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  nombreF = new FormControl('', [Validators.minLength(2)]);
  tipoF = new FormControl('', [Validators.minLength(1)]);
  archivoForm = new FormControl('', Validators.required);

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public BuscarTipoComidaForm = new FormGroup({
    nombreForm: this.nombreF,
    tipoForm: this.tipoF
  });

  // ALMACENAMIENTO DE DATOS CONSULTADOS
  tipoComidas: any = [];
  empleado: any = [];
  idEmpleado: number; // VARIABLE DE ALMACENAMIENTO DE ID DE EMPLEADO QUE INICIA SESIÓN

  // ITEMS DE PAGINACION DE LA TABLA
  pageSizeOptions = [5, 10, 20, 50];
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;

  // VARIABLE DE NAVEGACION ENTRE RUTAS
  hipervinculo: string = (localStorage.getItem('empresaURL') as string);

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // METODO DE LLAMADO DE DATOS DE EMPRESA COLORES - LOGO - MARCA DE AGUA
  get s_color(): string { return this.plantillaPDF.color_Secundary }
  get p_color(): string { return this.plantillaPDF.color_Primary }
  get frase(): string { return this.plantillaPDF.marca_Agua }
  get logo(): string { return this.plantillaPDF.logoBase64 }

  get habilitarComida(): boolean { return this.funciones.alimentacion; }

  constructor(
    private plantillaPDF: PlantillaReportesService, // SERVICIO DATOS DE EMPRESA
    private toastr: ToastrService, // VARIABLE DE MANEJO DE MENSAJES DE NOTIFICACIONES
    private rest: TipoComidasService, // SERVICIO DATOS DE TIPOS DE SERVICIOS DE COMIDAS
    public ventana: MatDialog, // VARIABLE DE MANEJO DE VENTANAS
    public restE: EmpleadoService, // SERVICIO DATOS DE EMPLEADO
    public router: Router, // VARIABLE DE MANEJO DE RUTAS URL
    public validar: ValidacionesService,
    public parametro: ParametrosService,
    private funciones: MainNavService
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    if (this.habilitarComida === false) {
      let mensaje = {
        access: false,
        title: `Ups!!! al parecer no tienes activado en tu plan el Módulo de Alimentación. \n`,
        message: '¿Te gustaría activarlo? Comunícate con nosotros.',
        url: 'www.casapazmino.com.ec'
      }
      return this.validar.RedireccionarHomeAdmin(mensaje);
    }
    else {
      this.user_name = localStorage.getItem('usuario');
      this.ip = localStorage.getItem('ip');

      this.ObtenerEmpleados(this.idEmpleado);
      this.BuscarHora();
    }
  }


  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** **
   ** **************************************************************************************** **/

  formato_hora: string = 'HH:mm:ss';

  BuscarHora() {
    // id_tipo_parametro Formato hora = 2
    this.parametro.ListarDetalleParametros(2).subscribe(
      res => {
        this.formato_hora = res[0].descripcion;
        this.ObtenerTipoComidas(this.formato_hora);
      },
      vacio => {
        this.ObtenerTipoComidas(this.formato_hora);
      });
  }

  // METODO PARA VER LA INFORMACION DEL EMPLEADO
  ObtenerEmpleados(idemploy: any) {
    this.empleado = [];
    this.restE.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleado = data;
    })
  }

  // EVENTO QUE MUESTRA FILAS DETERMINADAS DE LA TABLA
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // LECTURA DE DATOS
  ObtenerTipoComidas(formato_hora: string) {
    this.tipoComidas = [];
    this.rest.ConsultarTipoComida().subscribe(datos => {
      this.tipoComidas = datos;
      this.tipoComidas.forEach((data: any) => {
        data.horaInicio = this.validar.FormatearHora(data.hora_inicio, formato_hora);
        data.horaFin = this.validar.FormatearHora(data.hora_fin, formato_hora);
      })
    })
  }

  // METODO PARA ABRIR FORMULARIO CREAR
  ver_datos: boolean = false;
  ver_lista: boolean = true;
  tipo_id: number;
  AbrirVentanaRegistrar(): void {
    this.ventana.open(TipoComidasComponent, { width: '600px' })
      .afterClosed().subscribe(items => {
        if (items) {
          if (items > 0) {
            this.VerListaDetalles(items);
          }
        }
      });
  }

  // METODO PARA ABRIR FORMULARIO EDITAR
  AbrirVentanaEditar(datosSeleccionados: any): void {
    this.ventana.open(EditarTipoComidasComponent, { width: '600px', data: datosSeleccionados })
      .afterClosed().subscribe(items => {
        if (items) {
          if (items === 2) {
            this.VerListaDetalles(datosSeleccionados.id);
          }
        }
      });
      this.BuscarHora();

  }

  // METODO PARA ABRIR FORMULARIO MENU
  AbrirVentanaDetalles(datosSeleccionados: any): void {
    this.ventana.open(DetalleMenuComponent,
      { width: '350px', data: { menu: datosSeleccionados, vista: 'lista' } })
      .afterClosed().subscribe(item => {
        if (item) {
          if (item === 2) {
            this.VerListaDetalles(datosSeleccionados.id);
          }
        }
      });
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.BuscarTipoComidaForm.setValue({
      nombreForm: '',
      tipoForm: ''
    });
    this.BuscarHora();
  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO
  Eliminar(id_tipo: number) {
    const datos = {
      user_name: this.user_name,
      ip: this.ip
    };
    this.rest.EliminarRegistro(id_tipo, datos).subscribe((res: any) => {

      if (res.message === 'error') {
        this.toastr.error('Existen datos relacionados con este registro.', 'No fue posible eliminar.', {
          timeOut: 6000,
        });

      } else {
        this.toastr.error('Registro eliminado.', '', {
          timeOut: 6000,
        });
        this.BuscarHora();
      }

    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  ConfirmarDelete(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Eliminar(datos.id);
        } else {
          this.router.navigate(['/listarTipoComidas']);
        }
      });
  }

  // METODO PARA VER LISTA DE COMIDAS
  VerListaDetalles(id: number) {
    this.ver_lista = false;
    this.ver_datos = true;
    this.tipo_id = id;
  }

  /** ********************************************************************************************** **
   ** **                              METODO PARA EXPORTAR A PDF                                  ** **
   ** ********************************************************************************************** **/
  GenerarPdf(action = 'open') {
    const documentDefinition = this.GetDocumentDefinicion();
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  GetDocumentDefinicion() {
    sessionStorage.setItem('Comidas', this.tipoComidas);
    return {
      // ENCABEZADO DE LA PAGINA
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
        { text: 'Lista Servicios de Alimentación', bold: true, fontSize: 20, alignment: 'center', margin: [0, -5, 0, 10] },
        this.PresentarDataPDFAlmuerzos(),
      ],
      styles: {
        tableHeader: { fontSize: 12, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 10 },
        itemsTableD: { fontSize: 10, alignment: 'center' }
      }
    };
  }

  PresentarDataPDFAlmuerzos() {
    return {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          table: {
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Código', style: 'tableHeader' },
                { text: 'Servicio', style: 'tableHeader' },
                { text: 'Menú', style: 'tableHeader' },
                { text: 'Nombre del plato', style: 'tableHeader' },
                { text: 'Valor', style: 'tableHeader' },
                { text: 'Hora Inicia', style: 'tableHeader' },
                { text: 'Hora Finaliza', style: 'tableHeader' },
                { text: 'Observaciones', style: 'tableHeader' },
              ],
              ...this.tipoComidas.map((obj: any) => {
                return [
                  { text: obj.id, style: 'itemsTableD' },
                  { text: obj.tipo, style: 'itemsTableD' },
                  { text: obj.nombre, style: 'itemsTableD' },
                  { text: obj.nombre_plato, style: 'itemsTableD' },
                  { text: obj.valor, style: 'itemsTableD' },
                  { text: obj.hora_inicio, style: 'itemsTableD' },
                  { text: obj.hora_fin, style: 'itemsTableD' },
                  { text: obj.observacion, style: 'itemsTableD' },
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

  /** ************************************************************************************************** **
   ** **                                     METODO PARA EXPORTAR A EXCEL                             ** **
   ** ************************************************************************************************** **/
  ExportToExcel() {
    const wsc: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.tipoComidas.map((obj: any) => {
      return {
        CODIGO: obj.id,
        SERVICIO: obj.tipo,
        MENU: obj.nombre,
        NOMBRE_PLATO: obj.nombre_plato,
        VALOR: obj.valor,
        HORA_INICIA: obj.hora_inicio,
        HORA_FINALIZA: obj.hora_fin,
        OBSERVACIONES: obj.observacion
      }
    }));
    // METODO PARA DEFINIR TAMAÑO DE LAS COLUMNAS DEL REPORTE
    const header = Object.keys(this.tipoComidas[0]); // NOMBRE DE CABECERAS DE COLUMNAS
    var wscols: any = [];
    for (var i = 0; i < header.length; i++) {  // CABECERAS AÑADIDAS CON ESPACIOS
      wscols.push({ wpx: 100 })
    }
    wsc["!cols"] = wscols;
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsc, 'SERVICIOS COMIDAS');
    xlsx.writeFile(wb, "Comidas" + new Date().getTime() + '.xlsx');
  }

  /** ************************************************************************************************** **
   ** **                                   METODO PARA EXPORTAR A CSV                                 ** **
   ** ************************************************************************************************** **/
  ExportToCVS() {
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.tipoComidas);
    const csvDataH = xlsx.utils.sheet_to_csv(wse);
    const data: Blob = new Blob([csvDataH], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, "TipoComidasCSV" + new Date().getTime() + '.csv');
  }

  /** ************************************************************************************************* **
   ** **                            PARA LA EXPORTACION DE ARCHIVOS XML                              ** **
   ** ************************************************************************************************* **/
  urlxml: string;
  data: any = [];
  ExportToXML() {
    var objeto: any;
    var arregloComidas: any = [];
    this.tipoComidas.forEach((obj: any) => {
      objeto = {
        "tipo_comida": {
          '@id': obj.id,
          "servicio": obj.tipo,
          "menu": obj.nombre,
          "hora_inicia": obj.hora_inicio,
          "hora_finaliza": obj.hora_fin
        }
      }
      arregloComidas.push(objeto)
    });
    this.rest.CrearXML(arregloComidas).subscribe(res => {
      this.data = res;
      this.urlxml = `${(localStorage.getItem('empresaURL') as string)}/tipoComidas/download/` + this.data.name;
      window.open(this.urlxml, "_blank");
    });
  }

  //Control Botones
  getCrearNuevoMenu(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Crear Horario Alimentación');
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 1);
    }
  }

  getVerMenu(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Ver Detalle Alimentación');
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 1);
    }
  }

  getDetalleMenu(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Crear Detalle Alimentación');
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 1);
    }
  }

  getEditarMenu(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Editar Horario Alimentación');
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 1);
    }
  }

  getEliminarMenu(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Eliminar Horario Alimentación');
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 1);
    }
  }

  getDescargarReportes(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Descargar Reportes Alimentación');
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 1);
    }
  }

}
