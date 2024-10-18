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

import { MetodosComponent } from 'src/app/componentes/generales/metodoEliminar/metodos.component';

import { ValidacionesService } from '../../../../../servicios/validaciones/validaciones.service';
import { HorasExtrasService } from 'src/app/servicios/catalogos/catHorasExtras/horas-extras.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { MainNavService } from 'src/app/componentes/generales/main-nav/main-nav.service';

@Component({
  selector: 'app-lista-horas-extras',
  templateUrl: './lista-horas-extras.component.html',
  styleUrls: ['./lista-horas-extras.component.css']
})

export class ListaHorasExtrasComponent implements OnInit {

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // ITEMS DE PAGINACION DE LA TABLA
  numero_pagina: number = 1;
  tamanio_pagina: number = 5;
  pageSizeOptions = [5, 10, 20, 50];
  
  horasExtras: any = [];
  empleado: any = [];
  idEmpleado: number;

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  nombreF = new FormControl('', [Validators.minLength(2)]);

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public BuscarHoraExtraForm = new FormGroup({
    nombreForm: this.nombreF,
  });

  get habilitarHorasE(): boolean { return this.funciones.horasExtras; }

  constructor(
    private rest: HorasExtrasService,
    private toastr: ToastrService,
    private router: Router,
    private validar: ValidacionesService,
    public restE: EmpleadoService,
    public ventana: MatDialog,
    public restEmpre: EmpresaService,
    public parametro: ParametrosService,
    private funciones: MainNavService
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    if (this.habilitarHorasE === false) {
      let mensaje = {
        access: false,
        title: `Ups!!! al parecer no tienes activado en tu plan el Módulo de Horas Extras. \n`,
        message: '¿Te gustaría activarlo? Comunícate con nosotros.',
        url: 'www.casapazmino.com.ec'
      }
      return this.validar.RedireccionarHomeAdmin(mensaje);
    }
    else {
      this.user_name = localStorage.getItem('usuario');
      this.ip = localStorage.getItem('ip');

      this.BuscarHora();
      this.ObtenerLogo();
      this.ObtenerColores();
      this.ObtenerEmpleados(this.idEmpleado);
    }
  }


  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** **
   ** **************************************************************************************** **/

  formato_hora: string = 'HH:mm:ss';

  BuscarHora() {
    this.horasExtras = [];
    // id_tipo_parametro Formato hora = 2
    this.parametro.ListarDetalleParametros(2).subscribe(
      res => {
        this.formato_hora = res[0].descripcion;
        this.ObtenerHorasExtras(this.formato_hora);
      },
      vacio => {
        this.ObtenerHorasExtras(this.formato_hora);
      });
  }

  // METODO PARA VER LA INFORMACION DEL EMPLEADO
  ObtenerEmpleados(idemploy: any) {
    this.empleado = [];
    this.restE.BuscarUnEmpleado(idemploy).subscribe(data => {
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

  // EVENTO PARA PAGINACION DE TABLA
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // METODO PARA CONSULTAR CONFIGURACION HORAS EXTRAS
  ObtenerHorasExtras(formato_hora: string) {
    this.horasExtras = [];
    this.rest.ListarHorasExtras().subscribe(datos => {
      this.horasExtras = datos;

      this.horasExtras.forEach((data: any) => {
        data.h_inicio_ = this.validar.FormatearHora(data.hora_inicio, formato_hora);
        data.h_final_ = this.validar.FormatearHora(data.hora_final, formato_hora);

        if (data.tipo_descuento === 1) {
          data.tipo_descuento = 'Horas Extras';
        }
        else {
          data.tipo_descuento = 'Recargo Nocturno';
        }
        if (data.hora_jornada === 1) {
          data.hora_jornada = 'Diurna';
        }
        else if (data.hora_jornada === 2) {
          data.hora_jornada = 'Nocturna';
        }
        if (data.tipo_dia === 1) {
          data.tipo_dia = 'Libre';
        }
        else if (data.tipo_dia === 2) {
          data.tipo_dia = 'Feriado';
        }
        else {
          data.tipo_dia = 'Normal';
        }
      })
    }, err => {
      return this.validar.RedireccionarHomeAdmin(err.error)
    });
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.BuscarHoraExtraForm.setValue({
      nombreForm: '',
    });
    this.BuscarHora();
  }

  // VENTANA PARA EDITAR DATOS DE HORA EXTRA SELECCIONADO
  ver_editar: boolean = false;
  pagina: string = '';
  EditarDatos(datosSeleccionados: any): void {
    this.ver_lista = false;
    this.ver_editar = true;
    this.hora_id = datosSeleccionados;
    this.pagina = 'listar-configuracion';
  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO
  Eliminar(id_permiso: number) {
    const datos = {
      user_name: this.user_name,
      ip: this.ip
    };

    this.rest.EliminarRegistro(id_permiso, datos).subscribe(res => {
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
      this.BuscarHora();
    }, err => {
      return this.validar.RedireccionarHomeAdmin(err.error)
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  ConfirmarDelete(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Eliminar(datos.id);
        } else {
          this.router.navigate(['/listaHorasExtras']);
        }
      });
  }

  // METODO PARA REGISTRAR CONFIGURACION
  ver_lista: boolean = true;
  ver_registrar: boolean = false;
  AbrirRegistrar() {
    this.ver_lista = false;
    this.ver_registrar = true;
  }

  // METODO PARA VER DATOS
  ver_datos: boolean = false;
  hora_id: any;
  AbrirVistaDatos(id: number) {
    this.ver_datos = true;
    this.ver_lista = false;
    this.hora_id = id;
  }

  /** ******************************************************************************************** **
   ** **                           METODO PARA EXPORTAR A PDF                                   ** **
   ** ******************************************************************************************** **/
  generarPdf(action = 'open') {
    if (Object.keys(this.horasExtras).length === 0) {
      this.toastr.error('No se ha encontrado registro de horas extras.')
    } else {
      const documentDefinition = this.DefinirInformacionPDF();

      switch (action) {
        case 'open': pdfMake.createPdf(documentDefinition).open(); break;
        case 'print': pdfMake.createPdf(documentDefinition).print(); break;
        case 'download': pdfMake.createPdf(documentDefinition).download(); break;

        default: pdfMake.createPdf(documentDefinition).open(); break;
      }
    }

  }

  DefinirInformacionPDF() {

    return {

      // ENCABEZADO DE LA PAGINA
      pageOrientation: 'landscape',
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleado[0].nombre + ' ' + this.empleado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },

      // PIE DE PAGINA
      footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
        var f = moment();
        fecha = f.format('YYYY-MM-DD');

        var h = new Date();
        // FORMATO DE HORA ACTUAL
        if (h.getMinutes() < 10) {
          var time = h.getHours() + ':0' + h.getMinutes();
        }
        else {
          var time = h.getHours() + ':' + h.getMinutes();
        }
        return {
          margin: 10,
          columns: [
            { text: 'Fecha: ' + fecha + ' Hora: ' + time, opacity: 0.3 },
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
        { text: 'Lista de Horas Extras Configuradas', bold: true, fontSize: 20, alignment: 'center', margin: [0, -30, 0, 10] },
        this.presentarDataPDFHorasExtras(),
      ],
      styles: {
        tableHeader: { fontSize: 9, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 8, alignment: 'center', }
      }
    };
  }

  Almuerzo: any = ['Si', 'No'];
  presentarDataPDFHorasExtras() {
    return {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          table: {
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Código', style: 'tableHeader' },
                { text: 'Descripción', style: 'tableHeader' },
                { text: 'Tipo Recargo', style: 'tableHeader' },
                { text: 'Recargo Porcentual', style: 'tableHeader' },
                { text: 'Hora Inicio', style: 'tableHeader' },
                { text: 'Hora Final', style: 'tableHeader' },
                { text: 'Jornada', style: 'tableHeader' },
                { text: 'Tipo Día', style: 'tableHeader' },
                { text: 'Incluir Almuerzo', style: 'tableHeader' },
              ],
              ...this.horasExtras.map((obj: any) => {
                var incluirAlmuerzo = this.Almuerzo[obj.minutos_comida - 1];
                return [
                  { text: obj.id, style: 'itemsTable' },
                  { text: obj.descripcion, style: 'itemsTable' },
                  { text: obj.tipo_descuento, style: 'itemsTable' },
                  { text: obj.recargo_porcentaje, style: 'itemsTable' },
                  { text: obj.hora_inicio, style: 'itemsTable' },
                  { text: obj.hora_final, style: 'itemsTable' },
                  { text: obj.hora_jornada, style: 'itemsTable' },
                  { text: obj.tipo_dia, style: 'itemsTable' },
                  { text: incluirAlmuerzo, style: 'itemsTable' },
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

  /** ********************************************************************************************** **
   ** **                                  METODO PARA EXPORTAR A EXCEL                            ** **
   ** ********************************************************************************************** **/
  exportToExcel() {
    if (Object.keys(this.horasExtras).length === 0) {
      this.toastr.error('No se ha encontrado registro de horas extras.')
    } else {
      const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.horasExtras);
      const wb: xlsx.WorkBook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, wsr, 'HorasExtras');
      xlsx.writeFile(wb, "HorasExtras" + new Date().getTime() + '.xlsx');
    }
  }

  /** ********************************************************************************************** **
   ** **                                   METODO PARA EXPORTAR A CSV                             ** **
   ** ********************************************************************************************** **/

  exportToCVS() {
    if (Object.keys(this.horasExtras).length === 0) {
      this.toastr.error('No se ha encontrado registro de horas extras.')
    } else {
      const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.horasExtras);
      const csvDataH = xlsx.utils.sheet_to_csv(wse);
      const data: Blob = new Blob([csvDataH], { type: 'text/csv;charset=utf-8;' });
      FileSaver.saveAs(data, "HorasExtrasCSV" + new Date().getTime() + '.csv');
    }
  }

  /** ********************************************************************************************** **
   ** **                            PARA LA EXPORTACION DE ARCHIVOS XML                           ** **
   ** ********************************************************************************************** **/

  urlxml: string;
  data: any = [];
  exportToXML() {
    if (Object.keys(this.horasExtras).length === 0) {
      this.toastr.error('No se ha encontrado registro de horas extras.')
    } else {
      var objeto;
      var arreglohorasExtras: any = [];
      this.horasExtras.forEach((obj: any) => {
        var incluirAlmuerzo = this.Almuerzo[obj.minutos_comida - 1];
        objeto = {
          "horas_extras": {
            '@id': obj.id,
            "descripcion": obj.descripcion,
            "tipo_descuento": obj.tipo_descuento,
            "reca_porcentaje": obj.recargo_porcentaje,
            "hora_inicio": obj.hora_inicio,
            "hora_final": obj.hora_final,
            "hora_jornada": obj.hora_jornada,
            "tipo_dia": obj.tipo_dia,
            "incl_almuerzo": incluirAlmuerzo,
          }
        }
        arreglohorasExtras.push(objeto)
      });

      this.rest.CrearXML(arreglohorasExtras).subscribe(res => {
        this.data = res;
        console.log("prueba data", res)
        this.urlxml = `${(localStorage.getItem('empresaURL') as string)}/horasExtras/download/` + this.data.name;
        window.open(this.urlxml, "_blank");
      }, err => {
        return this.validar.RedireccionarHomeAdmin(err.error)
      });
    }
  }

  //CONTROL BOTONES
  getConfigurar(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Configurar Hora Extra');
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 1);
    }
  }

  getEliminar(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Eliminar Configuración Hora Extra');
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 1);
    }
  }

  getEditar(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Editar Configuración Hora Extra');
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 1);
    }
  }

  getDescargarReportes(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Descargar Reportes Configuración Hora Extra');
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 1);
    }
  }

}

