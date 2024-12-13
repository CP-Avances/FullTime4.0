// IMPORTAR LIBRERIAS
import { Validators, FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';
import { DateTime } from 'luxon';
import { Router } from '@angular/router';

// LIBRERIA PARA GENERAR REPORTES EN FORMATO EXCEL

// IMPORTACION DE SERVICIOS
import { HorasExtrasRealesService } from 'src/app/servicios/reportes/horasExtrasReales/horas-extras-reales.service';
import { DatosGeneralesService } from 'src/app/servicios/generales/datosGenerales/datos-generales.service';
import { ValidacionesService } from '../../../../../servicios/generales/validaciones/validaciones.service';
import { PedHoraExtraService } from 'src/app/servicios/modulos/modulo-horas-extras/horaExtra/ped-hora-extra.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { EmpresaService } from 'src/app/servicios/configuracion/parametrizacion/catEmpresa/empresa.service';

@Component({
  selector: 'app-reporte-horas-pedidas',
  templateUrl: './reporte-horas-pedidas.component.html',
  styleUrls: ['./reporte-horas-pedidas.component.css']
})

export class ReporteHorasPedidasComponent implements OnInit {

  // ARREGLO DATOS DEL EMPLEADO
  datosEmpleado: any = [];

  // DATOS DEL FÓRMULARIO DE BUSQUEDA
  codigo = new FormControl('');
  cedula = new FormControl('', [Validators.minLength(2)]);
  nombre = new FormControl('', [Validators.minLength(2)]);

  // ITEMS DE PAGINACION DE LA TABLA
  numero_pagina: number = 1;
  tamanio_pagina: number = 5;
  pageSizeOptions = [5, 10, 20, 50];

  // DATOS DEL EMPLEADO LOGUEADO
  empleadoLogueado: any = [];
  idEmpleado: number;

  reporte: boolean = false;

  constructor(
    public rest: EmpleadoService,
    public restH: HorasExtrasRealesService,
    public restEmpre: EmpresaService,
    public restPedido: PedHoraExtraService,
    public restD: DatosGeneralesService,
    public router: Router,
    private toastr: ToastrService,
    private validar: ValidacionesService
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.ObtenerEmpleadoLogueado(this.idEmpleado);
    this.VerDatosEmpleado();
    this.ObtenerLogo();
    this.ObtenerColores();
    //this.VerPedidosHorasAutorizadas();
    // this.VerPedidosHorasExtras();
  }

  // METODO PARA VER LA INFORMACION DEL EMPLEADO
  ObtenerEmpleadoLogueado(idemploy: any) {
    this.empleadoLogueado = [];
    this.rest.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleadoLogueado = data;
    })
  }

  // METODO PARA OBTENER EL LOGO DE LA EMPRESA
  logo: any = String;
  ObtenerLogo() {
    this.restEmpre.LogoEmpresaImagenBase64(localStorage.getItem('empresa') as string).subscribe(res => {
      this.logo = 'data:image/jpeg;base64,' + res.imagen;
    });
  }

  // METODO para obtener colores de empresa
  p_color: any;
  s_color: any;
  nombreEmpresa: any;
  frase: any;
  ObtenerColores() {
    this.restEmpre.ConsultarDatosEmpresa(parseInt(localStorage.getItem('empresa') as string)).subscribe(res => {
      this.p_color = res[0].color_principal;
      this.s_color = res[0].color_secundario;
      this.nombreEmpresa = res[0].nombre;
      this.frase = res[0].marca_agua;
    });
  }

  // METODO para manejar evento de paginación
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // Obtener datos del empleado
  VerDatosEmpleado() {
    this.datosEmpleado = [];
    this.restD.ListarInformacionActual().subscribe(data => {
      this.datosEmpleado = data;
      console.log('datos_actuales', this.datosEmpleado)
    });
  }

  // METODO para limpiar registros de campos de BUSQUEDA
  LimpiarCampos() {
    this.codigo.reset();
    this.cedula.reset();
    this.nombre.reset();
  }

  // METODO PARA INGRESAR SOLO LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  // METODO PARA INGRESAR SOLO NUMEROS
  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

  // METODO PARA OBTENER SOLICITUDES DE HORAS EXTRAS
  solicitudHoras: any = [];
  VerPedidosHorasExtras(archivo: String, accion: any, forma: any) {
    console.log('entra 1')
    this.solicitudHoras = [];
    this.restPedido.ListarPedidosHE().subscribe(data => {
      this.solicitudHoras = data;
      if (archivo === 'PDF') {
        this.GenerarPdf(accion, forma, this.solicitudHoras);
      }
      else {
        this.GenerarExcel(forma, this.solicitudHoras);
      }
      console.log('horas autorizadas', this.solicitudHoras)
    }, err => {
      return this.validar.RedireccionarHomeAdmin(err.error)
    });
  }

  // METODO PARA OBTENER SOLICITUDES DE HORAS EXTRAS AUTORIZADAS
  horasAutorizadas: any = [];
  VerPedidosHorasAutorizadas(archivo: String, accion: any, forma: any) {
    console.log('entra 2')
    this.horasAutorizadas = [];
    this.restPedido.ListarPedidosHEAutorizadas().subscribe(data => {
      this.horasAutorizadas = data;
      if (archivo === 'PDF') {
        this.GenerarPdf(accion, forma, this.horasAutorizadas);
      }
      else {
        this.GenerarExcel(forma, this.horasAutorizadas);
      }
      console.log('horas autorizadas', this.horasAutorizadas)
    }, err => {
      return this.validar.RedireccionarHomeAdmin(err.error)
    });
  }

  // Manejo del estado del selector
  estado_reporte: boolean;
  setAll(completed: boolean) {
    this.estado_reporte = completed;
  }

  solicitudes_empleado: any = [];
  VerPDFSolicitudesEmpleado(action, id_seleccionado) {
    this.solicitudes_empleado = [];
    if (this.estado_reporte === true) {
      this.restPedido.ListarPedidosHEAutorizadas_Empleado(id_seleccionado).subscribe(data => {
        this.solicitudes_empleado = data;
        this.GenerarPdfEmpleado(action, 'autorizadas', id_seleccionado);
        this.reporte = false;
      }, err => {
        this.toastr.info('No se encuentran registros de solicitudes de horas extras', '', {
          timeOut: 6000,
        })

        return this.validar.RedireccionarHomeAdmin(err.error)
      });
    }
    else {
      this.restPedido.ListarPedidosHE_Empleado(id_seleccionado).subscribe(data => {
        this.solicitudes_empleado = data;
        this.GenerarPdfEmpleado(action, 'solicitudes', id_seleccionado);
      }, err => {
        this.toastr.info('No se encuentran registros de solicitudes de horas extras', '', {
          timeOut: 6000,
        })

        return this.validar.RedireccionarHomeAdmin(err.error)
      });
    }
  }

  VerExcelSolicitudesEmpleado(id_seleccionado) {
    this.solicitudes_empleado = [];
    if (this.estado_reporte === true) {
      this.restPedido.ListarPedidosHEAutorizadas_Empleado(id_seleccionado).subscribe(data => {
        this.solicitudes_empleado = data;
        this.GenerarExcelEmpleado('autorizadas', id_seleccionado);
        this.reporte = false;
      }, err => {
        this.toastr.info('No se encuentran registros de solicitudes de horas extras', '', {
          timeOut: 6000,
        });
        return this.validar.RedireccionarHomeAdmin(err.error)
      });
    }
    else {
      this.restPedido.ListarPedidosHE_Empleado(id_seleccionado).subscribe(data => {
        this.solicitudes_empleado = data;
        this.GenerarExcelEmpleado('solicitudes', id_seleccionado);
      }, err => {
        this.toastr.info('No se encuentran registros de solicitudes de horas extras', '', {
          timeOut: 6000,
        });

        return this.validar.RedireccionarHomeAdmin(err.error)
      });
    }
  }

  /* ****************************************************************************************************
   *                               PARA LA EXPORTACION DE ARCHIVOS PDF SOLICITUDES
   * ****************************************************************************************************/


  async GenerarPdf(action = 'open', forma: string, solicitudHoras: any) {
    var documentDefinition: any;
    const pdfMake = await this.validar.ImportarPDF();
    if (forma === 'solicitudes') {
      documentDefinition = this.GenerarArchivoSolicitudes(solicitudHoras);
    }
    if (forma === 'autorizadas') {
      documentDefinition = this.GenerarSolicitudesAprobadas(solicitudHoras);
    }
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  GenerarArchivoSolicitudes(solicitudHoras) {

    return {
      // ENCABEZADO DE LA PAGINA
      pageSize: 'A4',
      pageOrientation: 'landscape',
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleadoLogueado[0].nombre + ' ' + this.empleadoLogueado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },
      // PIE DE PAGINA
      footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
        // OBTENER FECHA Y HORA ACTUAL
        var f = DateTime.now();
        fecha = f.toFormat('yyyy-MM-dd');
        hora = f.toFormat('HH:mm:ss');
        return [
          {
            margin: [10, -2, 10, 0],
            columns: [
              {
                text: [{
                  text: 'Fecha: ' + fecha + ' Hora: ' + hora,
                  alignment: 'left', opacity: 0.3
                }]
              },
              {
                text: [{
                  text: '© Pag ' + currentPage.toString() + ' de ' + pageCount, alignment: 'right', opacity: 0.3
                }],
              }
            ], fontSize: 10
          }
        ]
      },
      // TÍTULOS DEL ARCHIVO PDF Y CONTENIDO GENERAL
      content: [
        { image: this.logo, width: 150, margin: [10, -25, 0, 5] },
        { text: this.nombreEmpresa.toUpperCase(), bold: true, fontSize: 25, alignment: 'center', margin: [0, -30, 0, 5] },
        { text: 'REPORTE GENERAL DE SOLICITUDES DE HORAS EXTRAS', fontSize: 17, alignment: 'center', margin: [0, 0, 0, 5] },
        this.presentarSolicitudes(solicitudHoras),
      ],
      // ESTILOS DEL ARCHIVO PDF
      styles: {
        tableHeader: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTableD: { fontSize: 9, alignment: 'center' },
        tableHeaderA: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color, margin: [0, 10, 0, 10] },
      }
    };
  }

  // ESTRUCTURA LISTA DE SOLICITUDES
  contarRegistros: number = 0;
  presentarSolicitudes(solicitudHoras) {
    this.contarRegistros = 0;
    return {
      table: {
        widths: ['auto', 'auto', '*', '*', '*', 'auto', 'auto', 'auto', 'auto', 'auto'],
        body: [
          [
            { rowSpan: 2, text: 'N° REGISTRO', style: 'tableHeaderA' },
            { rowSpan: 2, text: 'CÓDIGO', style: 'tableHeaderA' },
            { colSpan: 2, text: 'EMPLEADO', style: 'tableHeader', fillColor: this.s_color },
            '',
            { rowSpan: 2, text: 'DESCRIPCIÓN', style: 'tableHeaderA' },
            { rowSpan: 2, text: 'FECHA INICIO', style: 'tableHeaderA' },
            { rowSpan: 2, text: 'FECHA FIN', style: 'tableHeaderA' },
            { rowSpan: 2, text: 'HORA INICIO', style: 'tableHeaderA' },
            { rowSpan: 2, text: 'HORA FIN', style: 'tableHeaderA' },
            { rowSpan: 2, text: 'HORAS SOLICITADAS', style: 'tableHeaderA' },
          ],
          [
            '', '',
            { text: 'NOMBRE', style: 'tableHeader' },
            { text: 'APELLIDO', style: 'tableHeader' },
            '', '', '', ''
          ],
          ...solicitudHoras.map((obj: any) => {
            this.contarRegistros = this.contarRegistros + 1;
            return [
              { text: this.contarRegistros, style: 'itemsTableD' },
              { text: obj.codigo, style: 'itemsTableD' },
              { text: obj.nombre, style: 'itemsTableD' },
              { text: obj.apellido, style: 'itemsTableD' },
              { text: obj.descripcion, style: 'itemsTableD' },
              { text: DateTime.fromISO(obj.fec_inicio).toFormat('dd/MM/yyyy'), style: 'itemsTableD' },
              { text: DateTime.fromISO(obj.fec_final).toFormat('dd/MM/yyyy'), style: 'itemsTableD' },
              { text: obj.hora_inicio, style: 'itemsTableD' },
              { text: obj.hora_final, style: 'itemsTableD' },
              { text: obj.num_hora, style: 'itemsTableD' },
            ];
          })
        ]
      },
      // ESTILO DE COLORES FORMATO ZEBRA
      layout: {
        fillColor: function (i, node) {
          return (i % 2 === 0) ? '#CCD1D1' : null;
        }
      }
    };
  }

  /* ****************************************************************************************************
   *                               PARA LA EXPORTACION DE ARCHIVOS EXCEL SOLICITUDES
   * ****************************************************************************************************/

  GenerarExcel(forma: string, datos: any) {
    if (forma === 'solicitudes') {
      this.ExportarExcelSolicitudes(datos);
    }
    if (forma === 'autorizadas') {
      this.ExportarExcelSolicitudesAutorizadas(datos);
    }
  }

  ExportarExcelSolicitudes(datos) {
    /*
    this.contarRegistros = 0;
    const wsa: xlsx.WorkSheet = xlsx.utils.json_to_sheet(datos.map((obj: any) => {
      this.contarRegistros = this.contarRegistros + 1;
      return {
        N_REGISTROS: this.contarRegistros,
        CODIGO: obj.codigo,
        EMPLEADO: obj.nombre + ' ' + obj.apellido,
        DESCRIPCION: obj.descripcion,
        FECHA_INICIO: DateTime.fromISO(obj.fec_inicio).toFormat('dd/MM/yyyy'),
        FECHA_FIN: DateTime.fromISO(obj.fec_final).toFormat('dd/MM/yyyy'),
        HORA_INICIO: obj.hora_inicio,
        HORA_FIN: obj.hora_final,
        HORAS_SOLICITADAS: obj.num_hora,
      }
    }));
    const header = Object.keys(datos[0]); // NOMBRE DE LAS COLUMNAS
    var wscols: any = [];
    for (var i = 0; i < header.length; i++) {  // NÚMERO DE COLUMNAS AÑADIDAS
      wscols.push({ wpx: 80 })
    }
    wsa["!cols"] = wscols;
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsa, 'Solicitud Horas Extras');
    var f = DateTime.now();
    xlsx.writeFile(wb, "SolicitudesHorasExtras - " + f.toFormat('yyyy-MM-dd') + '.xlsx');
    */
  }

  /* ****************************************************************************************************
   *                               PARA LA EXPORTACION DE ARCHIVOS PDF SOLICITUDES AUTORIZADAS
   * ****************************************************************************************************/

  GenerarSolicitudesAprobadas(horasAutorizadas) {

    return {
      // ENCABEZADO DE LA PAGINA
      pageSize: 'A4',
      pageOrientation: 'landscape',
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleadoLogueado[0].nombre + ' ' + this.empleadoLogueado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },
      // PIE DE PAGINA
      footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
        // OBTENER FECHA Y HORA ACTUAL
        var f = DateTime.now();
        fecha = f.toFormat('yyyy-MM-dd');
        hora = f.toFormat('HH:mm:ss');
        return [
          {
            margin: [10, -2, 10, 0],
            columns: [
              {
                text: [{
                  text: 'Fecha: ' + fecha + ' Hora: ' + hora,
                  alignment: 'left', opacity: 0.3
                }]
              },
              {
                text: [{
                  text: '© Pag ' + currentPage.toString() + ' de ' + pageCount, alignment: 'right', opacity: 0.3
                }],
              }
            ], fontSize: 10
          }
        ]
      },
      // TÍTULOS DEL ARCHIVO PDF Y CONTENIDO GENERAL
      content: [
        { image: this.logo, width: 150, margin: [10, -25, 0, 5] },
        { text: this.nombreEmpresa.toUpperCase(), bold: true, fontSize: 25, alignment: 'center', margin: [0, -30, 0, 5] },
        { text: 'REPORTE GENERAL DE SOLICITUDES DE HORAS EXTRAS AUTORIZADAS', fontSize: 17, alignment: 'center', margin: [0, 0, 0, 5] },
        this.presentarSolicitudesAutorizadas(horasAutorizadas),
      ],
      // ESTILOS DEL ARCHIVO PDF
      styles: {
        tableHeader: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTableD: { fontSize: 9, alignment: 'center' },
        tableHeaderA: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color, margin: [0, 10, 0, 10] },
      }
    };
  }

  // ESTRUCTURA LISTA DE SOLICITUDES AUTORIZADAS
  presentarSolicitudesAutorizadas(horasAutorizadas) {
    this.contarRegistros = 0;
    return {
      table: {
        widths: ['auto', 'auto', '*', '*', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
        body: [
          [
            { rowSpan: 2, text: 'N° REGISTRO', style: 'tableHeaderA' },
            { rowSpan: 2, text: 'CÓDIGO', style: 'tableHeaderA' },
            { colSpan: 2, text: 'EMPLEADO', style: 'tableHeader', fillColor: this.s_color },
            '',
            { rowSpan: 2, text: 'DESCRIPCIÓN', style: 'tableHeaderA' },
            { rowSpan: 2, text: 'FECHA INICIO', style: 'tableHeaderA' },
            { rowSpan: 2, text: 'FECHA FIN', style: 'tableHeaderA' },
            { rowSpan: 2, text: 'HORA INICIO', style: 'tableHeaderA' },
            { rowSpan: 2, text: 'HORA FIN', style: 'tableHeaderA' },
            { rowSpan: 2, text: 'HORAS AUTORIZADAS', style: 'tableHeaderA' },
            { rowSpan: 2, text: 'ESTADO', style: 'tableHeaderA' },
          ],
          [
            '', '',
            { text: 'NOMBRE', style: 'tableHeader' },
            { text: 'APELLIDO', style: 'tableHeader' },
            '', '', '', '', ''
          ],
          ...horasAutorizadas.map((obj: any) => {
            if (obj.estado === 3) {
              obj.estado = 'Autorizado'
            }
            this.contarRegistros = this.contarRegistros + 1;
            return [
              { text: this.contarRegistros, style: 'itemsTableD' },
              { text: obj.codigo, style: 'itemsTableD' },
              { text: obj.nombre, style: 'itemsTableD' },
              { text: obj.apellido, style: 'itemsTableD' },
              { text: obj.descripcion, style: 'itemsTableD' },
              { text: DateTime.fromISO(obj.fec_inicio).toFormat('dd/MM/yyyy'), style: 'itemsTableD' },
              { text: DateTime.fromISO(obj.fec_final).toFormat('dd/MM/yyyy'), style: 'itemsTableD' },
              { text: obj.hora_inicio, style: 'itemsTableD' },
              { text: obj.hora_final, style: 'itemsTableD' },
              { text: obj.tiempo_autorizado, style: 'itemsTableD' },
              { text: obj.estado, style: 'itemsTableD' },
            ];
          })
        ]
      },
      // ESTILO DE COLORES FORMATO ZEBRA
      layout: {
        fillColor: function (i, node) {
          return (i % 2 === 0) ? '#CCD1D1' : null;
        }
      }
    };
  }

  /* ****************************************************************************************************
   *                               PARA LA EXPORTACION DE ARCHIVOS EXCEL SOLICITUDES AUTORIZADAS
   * ****************************************************************************************************/

  ExportarExcelSolicitudesAutorizadas(datos) {
    /*
    this.contarRegistros = 0;
    const wsa: xlsx.WorkSheet = xlsx.utils.json_to_sheet(datos.map((obj: any) => {
      if (obj.estado === 3) {
        obj.estado = 'Autorizado'
      }
      this.contarRegistros = this.contarRegistros + 1;
      return {
        N_REGISTROS: this.contarRegistros,
        CODIGO: obj.codigo,
        EMPLEADO: obj.nombre + ' ' + obj.apellido,
        DESCRIPCION: obj.descripcion,
        FECHA_INICIO: DateTime.fromISO(obj.fec_inicio).toFormat('dd/MM/yyyy'),
        FECHA_FIN: DateTime.fromISO(obj.fec_final).toFormat('dd/MM/yyyy'),
        HORA_INICIO: obj.hora_inicio,
        HORA_FIN: obj.hora_final,
        HORAS_SOLICITADAS: obj.tiempo_autorizado,
        ESTADO: obj.estado
      }
    }));
    const header = Object.keys(datos[0]); // nombres de las columnas
    var wscols: any = [];
    for (var i = 0; i < header.length; i++) {  // contar columnas
      wscols.push({ wpx: 80 })
    }
    wsa["!cols"] = wscols;
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsa, 'HorasExtras Autorizadas');
    var f = DateTime.now();
    xlsx.writeFile(wb, "SolicitudesAutorizadas - " + f.toFormat('yyyy-MM-dd') + '.xlsx');
    */
  }

  /** *******************************************************************************************
   *                             EXPORTAR ARCHIVOS EN FORMATO PDF SOLICITUDES POR EMPLEADO
   *  **********************************************************************************************/

  async GenerarPdfEmpleado(action = 'open', forma: string, id_seleccionado: number) {
    var documentDefinition: any;
    const pdfMake = await this.validar.ImportarPDF();
    if (forma === 'solicitudes') {
      documentDefinition = this.GenerarSolicitudEmpleado(id_seleccionado);
    }
    if (forma === 'autorizadas') {
      documentDefinition = this.GenerarSolicitudAutorizaEmpleado(id_seleccionado);
    }
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  GenerarSolicitudEmpleado(id_seleccionado: number) {

    return {
      // ENCABEZADO DE LA PAGINA
      pageSize: 'A4',
      pageOrientation: 'landscape',
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleadoLogueado[0].nombre + ' ' + this.empleadoLogueado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },
      // PIE DE PAGINA
      footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
        // OBTENER FECHA Y HORA ACTUAL
        var f = DateTime.now();
        fecha = f.toFormat('yyyy-MM-dd');
        hora = f.toFormat('HH:mm:ss');
        return [
          {
            margin: [10, -2, 10, 0],
            columns: [
              {
                text: [{
                  text: 'Fecha: ' + fecha + ' Hora: ' + hora,
                  alignment: 'left', opacity: 0.3
                }]
              },
              {
                text: [{
                  text: '© Pag ' + currentPage.toString() + ' de ' + pageCount, alignment: 'right', opacity: 0.3
                }],
              }
            ], fontSize: 9
          }
        ]
      },
      // TÍTULOS DEL ARCHIVO PDF Y CONTENIDO GENERAL
      content: [
        { image: this.logo, width: 150, margin: [10, -25, 0, 5] },
        ...this.datosEmpleado.map((obj: any) => {
          if (obj.id === id_seleccionado) {
            return [
              { text: obj.empresa.toUpperCase(), bold: true, fontSize: 25, alignment: 'center', margin: [0, -30, 0, 5] },
              { text: 'REPORTE DE SOLICITUDES DE HORAS EXTRAS', fontSize: 17, alignment: 'center', margin: [0, 0, 0, 5] },
            ];
          }
        }),
        this.DatosSolicitudEmpleado(id_seleccionado),
        this.PresentarSolicitudEmpleado(),
      ],
      // ESTILOS DEL ARCHIVO PDF
      styles: {
        tableHeader: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTableD: { fontSize: 9, alignment: 'center' },
        itemsTableI: { fontSize: 9, alignment: 'left', margin: [50, 5, 5, 5] },
      }
    };
  }

  // DATOS GENERALES DEL PDF
  DatosSolicitudEmpleado(id_seleccionado) {
    // INICIALIZACIÓN DE VARIBLES
    var ciudad, nombre, apellido, cedula, codigo, sucursal, departamento, cargo, regimen;
    // BUSQUEDA DE LOS DATOS DEL EMPLEADO DEL CUAL SE OBTIENE EL REPORTE
    this.datosEmpleado.forEach((obj: any) => {
      if (obj.id === id_seleccionado) {
        nombre = obj.nombre;
        apellido = obj.apellido;
        cedula = obj.cedula;
        codigo = obj.codigo;
        sucursal = obj.sucursal;
        departamento = obj.departamento;
        ciudad = obj.ciudad;
        cargo = obj.cargo;
        regimen = obj.regimen;
      }
    });
    // ESTRUCTURA DE LA TABLA DE LISTA DE REGISTROS
    return {
      table: {
        widths: ['*'],
        body: [
          [{ text: 'INFORMACIÓN GENERAL EMPLEADO', style: 'tableHeader' },],
          [{
            columns: [
              { text: [{ text: 'CIUDAD: ' + ciudad, style: 'itemsTableI' }] },
            ]
          }],
          [{
            columns: [
              { text: [{ text: 'APELLIDOS: ' + apellido, style: 'itemsTableI' }] },
              { text: [{ text: 'NOMBRES: ' + nombre, style: 'itemsTableI' }] },
              { text: [{ text: 'CÉDULA: ' + cedula, style: 'itemsTableI' }] },
            ]
          }],
          [{
            columns: [
              { text: [{ text: 'CÓDIGO: ' + codigo, style: 'itemsTableI' }] },
              { text: [{ text: 'CARGO: ' + cargo, style: 'itemsTableI' }] },
              { text: [{ text: 'REGIMEN LABORAL: ' + regimen, style: 'itemsTableI' }] },
            ]
          }],
          [{
            columns: [
              { text: [{ text: 'SUCURSAL: ' + sucursal, style: 'itemsTableI' }] },
              { text: [{ text: 'DEPARTAMENTO: ' + departamento, style: 'itemsTableI' }] },
              { text: [{ text: 'N° REGISTROS: ' + this.solicitudes_empleado.length, style: 'itemsTableI' }] },
            ]
          }],
          [{ text: 'LISTA DE SOLICITUDES DE HORAS EXTRAS', style: 'tableHeader' },],
        ]
      },
      layout: {
        hLineColor: function (i, node) {
          return (i === 0 || i === node.table.body.length) ? 'rgb(80,87,97)' : 'rgb(80,87,97)';
        },
        paddingLeft: function (i, node) { return 40; },
        paddingRight: function (i, node) { return 40; },
        paddingTop: function (i, node) { return 5; },
        paddingBottom: function (i, node) { return 5; }
      }
    }
  }

  // ESTRUCTURA LISTA DE REGISTROS
  PresentarSolicitudEmpleado() {
    this.contarRegistros = 0;
    return {
      table: {
        widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto'],
        body: [
          [
            { text: 'N° REGISTRO', style: 'tableHeader' },
            { text: 'DESCRIPCIÓN', style: 'tableHeader' },
            { text: 'FECHA INICIO', style: 'tableHeader' },
            { text: 'FECHA FINAL', style: 'tableHeader' },
            { text: 'HORA INICIO', style: 'tableHeader' },
            { text: 'HORA FINAL', style: 'tableHeader' },
            { text: 'HORAS SOLICITADAS', style: 'tableHeader' },
          ],
          ...this.solicitudes_empleado.map((obj: any) => {
            this.contarRegistros = this.contarRegistros + 1;
            return [
              { text: this.contarRegistros, style: 'itemsTableD' },
              { text: obj.descripcion, style: 'itemsTableD' },
              { text: DateTime.fromISO(obj.fec_inicio).toFormat('dd/MM/yyyy'), style: 'itemsTableD' },
              { text: DateTime.fromISO(obj.fec_final).toFormat('dd/MM/yyyy'), style: 'itemsTableD' },
              { text: obj.hora_inicio, style: 'itemsTableD' },
              { text: obj.hora_fin, style: 'itemsTableD' },
              { text: obj.num_hora, style: 'itemsTableD' },
            ];
          })
        ]
      },
      // ESTILO DE COLORES FORMATO ZEBRA
      layout: {
        fillColor: function (i, node) {
          return (i % 2 === 0) ? '#CCD1D1' : null;
        }
      }
    };
  }

  /* ****************************************************************************************************
   *                               PARA LA EXPORTACION DE ARCHIVOS EXCEL SOLICITUDES
   * ****************************************************************************************************/

  GenerarExcelEmpleado(forma: string, id_seleccionado) {
    if (forma === 'solicitudes') {
      this.GenerarExcelSolicitudEmpleado(id_seleccionado);
    }
    if (forma === 'autorizadas') {
      this.GenerarExcelSolicitudAutorizadaEmpleado(id_seleccionado);
    }
  }

  GenerarExcelSolicitudEmpleado(id_seleccionado) {
    /*
    this.contarRegistros = 0;
    // INICIALIZACIÓN DE VARIABLES
    var datosGenerales, mensaje: string;
    // BUSQUEDA DE LOS DATOS DEL EMPLEADO DEL CUAL SE OBTIENE EL REPORTE
    this.datosEmpleado.forEach((obj: any) => {
      if (obj.id === id_seleccionado) {
        datosGenerales = [{
          NOMBRE: obj.nombre,
          APELLIDO: obj.apellido,
          CEDULA: obj.cedula,
          CODIGO: obj.codigo,
          SUCURSAL: obj.sucursal,
          DEPARTAMENTO: obj.departamento,
          CIUDAD: obj.ciudad,
          CARGO: obj.cargo,
          REGIMEN: obj.regimen
        }]
      }
    });
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(datosGenerales);

    const headerE = Object.keys(datosGenerales[0]); // NOMBRE DE LAS COLUMNAS

    var wscolsE: any = [];
    for (var i = 0; i < headerE.length; i++) {  // NÚMERO DE COLUMNAS AÑADIDAS
      wscolsE.push({ wpx: 80 })
    }
    wse["!cols"] = wscolsE;

    const wsa: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.solicitudes_empleado.map((obj: any) => {
      this.contarRegistros = this.contarRegistros + 1;
      return {
        N_REGISTROS: this.contarRegistros,
        DESCRIPCION: obj.descripcion,
        FECHA_INICIO: DateTime.fromISO(obj.fec_inicio).toFormat('dd/MM/yyyy'),
        FECHA_FIN: DateTime.fromISO(obj.fec_final).toFormat('dd/MM/yyyy'),
        HORA_INICIO: obj.hora_inicio,
        HORA_FINAL: obj.hora_final,
        HORAS_SOLICITADAS: obj.num_hora,
      }
    }));
    const header = Object.keys(this.solicitudes_empleado[0]); // NOMBRE DE LAS COLUMNAS
    var wscols: any = [];
    for (var i = 0; i < header.length; i++) {  // NÚMERO DE COLUMNAS AÑADIDAS
      wscols.push({ wpx: 80 })
    }
    wsa["!cols"] = wscols;
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wse, 'Empleado');
    xlsx.utils.book_append_sheet(wb, wsa, 'Solicitud Horas Extras');
    var f = DateTime.now();
    xlsx.writeFile(wb, "SolicitudesHorasExtras - " + f.toformat('yyyy-MM-dd') + '.xlsx');
    */
  }

  /** *******************************************************************************************
   *             EXPORTAR ARCHIVOS EN FORMATO PDF SOLICITUDES AUTORIZADAS POR EMPLEADO
   *  **********************************************************************************************/

  GenerarSolicitudAutorizaEmpleado(id_seleccionado: number) {

    return {
      // ENCABEZADO DE LA PAGINA
      pageSize: 'A4',
      pageOrientation: 'landscape',
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleadoLogueado[0].nombre + ' ' + this.empleadoLogueado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },
      // PIE DE PAGINA
      footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
        // OBTENER FECHA Y HORA ACTUAL
        var f = DateTime.now();
        fecha = f.toFormat('yyyy-MM-dd');
        hora = f.toFormat('HH:mm:ss');
        return [
          {
            margin: [10, -2, 10, 0],
            columns: [
              {
                text: [{
                  text: 'Fecha: ' + fecha + ' Hora: ' + hora,
                  alignment: 'left', opacity: 0.3
                }]
              },
              {
                text: [{
                  text: '© Pag ' + currentPage.toString() + ' de ' + pageCount, alignment: 'right', opacity: 0.3
                }],
              }
            ], fontSize: 9
          }
        ]
      },
      // TÍTULOS DEL ARCHIVO PDF Y CONTENIDO GENERAL
      content: [
        { image: this.logo, width: 150, margin: [10, -25, 0, 5] },
        ...this.datosEmpleado.map((obj: any) => {
          if (obj.id === id_seleccionado) {
            return [
              { text: obj.empresa.toUpperCase(), bold: true, fontSize: 25, alignment: 'center', margin: [0, -30, 0, 5] },
              { text: 'REPORTE DE SOLICITUDES DE HORAS EXTRAS AUTORIZADAS', fontSize: 17, alignment: 'center', margin: [0, 0, 0, 5] },
            ];
          }
        }),
        this.DatosSolicitudAutorizaEmpleado(id_seleccionado),
        this.PresentarSolicitudAutorizaEmpleado(),
      ],
      // ESTILOS DEL ARCHIVO PDF
      styles: {
        tableHeader: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTableD: { fontSize: 9, alignment: 'center' },
        itemsTableI: { fontSize: 9, alignment: 'left', margin: [50, 5, 5, 5] },
      }
    };
  }

  // DATOS GENERALES DEL PDF
  DatosSolicitudAutorizaEmpleado(id_seleccionado) {
    // INICIALIZACIÓN DE VARIABLES
    var ciudad, nombre, apellido, cedula, codigo, sucursal, departamento, cargo, regimen;
    // BUSQUEDA DE LOS DATOS DEL EMPLEADO DEL CUAL SE OBTIENE EL REPORTE
    this.datosEmpleado.forEach((obj: any) => {
      if (obj.id === id_seleccionado) {
        nombre = obj.nombre;
        apellido = obj.apellido;
        cedula = obj.cedula;
        codigo = obj.codigo;
        sucursal = obj.sucursal;
        departamento = obj.departamento;
        ciudad = obj.ciudad;
        cargo = obj.cargo;
        regimen = obj.regimen;
      }
    });
    // ESTRUCTURA DE LA TABLA DE LISTA DE REGISTROS
    return {
      table: {
        widths: ['*'],
        body: [
          [{ text: 'INFORMACIÓN GENERAL EMPLEADO', style: 'tableHeader' },],
          [{
            columns: [
              { text: [{ text: 'CIUDAD: ' + ciudad, style: 'itemsTableI' }] },
            ]
          }],
          [{
            columns: [
              { text: [{ text: 'APELLIDOS: ' + apellido, style: 'itemsTableI' }] },
              { text: [{ text: 'NOMBRES: ' + nombre, style: 'itemsTableI' }] },
              { text: [{ text: 'CÉDULA: ' + cedula, style: 'itemsTableI' }] },
            ]
          }],
          [{
            columns: [
              { text: [{ text: 'CÓDIGO: ' + codigo, style: 'itemsTableI' }] },
              { text: [{ text: 'CARGO: ' + cargo, style: 'itemsTableI' }] },
              { text: [{ text: 'REGIMEN LABORAL: ' + regimen, style: 'itemsTableI' }] },
            ]
          }],
          [{
            columns: [
              { text: [{ text: 'SUCURSAL: ' + sucursal, style: 'itemsTableI' }] },
              { text: [{ text: 'DEPARTAMENTO: ' + departamento, style: 'itemsTableI' }] },
              { text: [{ text: 'N° REGISTROS: ' + this.solicitudes_empleado.length, style: 'itemsTableI' }] },
            ]
          }],
          [{ text: 'LISTA DE SOLICITUDES DE HORAS EXTRAS AUTORIZADAS', style: 'tableHeader' },],
        ]
      },
      layout: {
        hLineColor: function (i, node) {
          return (i === 0 || i === node.table.body.length) ? 'rgb(80,87,97)' : 'rgb(80,87,97)';
        },
        paddingLeft: function (i, node) { return 40; },
        paddingRight: function (i, node) { return 40; },
        paddingTop: function (i, node) { return 5; },
        paddingBottom: function (i, node) { return 5; }
      }
    }
  }

  // ESTRUCTURA LISTA DE REGISTROS
  PresentarSolicitudAutorizaEmpleado() {
    this.contarRegistros = 0;
    return {
      table: {
        widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
        body: [
          [
            { text: 'N° REGISTRO', style: 'tableHeader' },
            { text: 'DESCRIPCIÓN', style: 'tableHeader' },
            { text: 'FECHA INICIO', style: 'tableHeader' },
            { text: 'FECHA FINAL', style: 'tableHeader' },
            { text: 'HORA INICIO', style: 'tableHeader' },
            { text: 'HORA FIN', style: 'tableHeader' },
            { text: 'ESTADO', style: 'tableHeader' },
            { text: 'HORAS AUTORIZADAS', style: 'tableHeader' },
          ],
          ...this.solicitudes_empleado.map((obj: any) => {
            if (obj.estado === 3) {
              obj.estado = 'Autorizado'
            }
            this.contarRegistros = this.contarRegistros + 1;
            return [
              { text: this.contarRegistros, style: 'itemsTableD' },
              { text: obj.descripcion, style: 'itemsTableD' },
              { text: DateTime.fromISO(obj.fec_inicio).toFormat('dd/MM/yyyy'), style: 'itemsTableD' },
              { text: DateTime.fromISO(obj.fec_final).toFormat('dd/MM/yyyy'), style: 'itemsTableD' },
              { text: obj.hora_inicio, style: 'itemsTableD' },
              { text: obj.hora_final, style: 'itemsTableD' },
              { text: obj.estado, style: 'itemsTableD' },
              { text: obj.tiempo_autorizado, style: 'itemsTableD' },
            ];
          })
        ]
      },
      // ESTILO DE COLORES FORMATO ZEBRA
      layout: {
        fillColor: function (i, node) {
          return (i % 2 === 0) ? '#CCD1D1' : null;
        }
      }
    };
  }

  /* ****************************************************************************************************
   *                               PARA LA EXPORTACION DE ARCHIVOS EXCEL SOLICITUDES AUTORIZADAS
   * ****************************************************************************************************/

  GenerarExcelSolicitudAutorizadaEmpleado(id_seleccionado) {
    /*
    this.contarRegistros = 0;
    // INICIALIZACIÓN DE VARIABLES
    var datosGenerales: any;
    // BUSQUEDA DE LOS DATOS DEL EMPLEADO DEL CUAL SE OBTIENE EL REPORTE
    this.datosEmpleado.forEach((obj: any) => {
      if (obj.id === id_seleccionado) {
        datosGenerales = [{
          NOMBRE: obj.nombre,
          APELLIDO: obj.apellido,
          CEDULA: obj.cedula,
          CODIGO: obj.codigo,
          SUCURSAL: obj.sucursal,
          DEPARTAMENTO: obj.departamento,
          CIUDAD: obj.ciudad,
          CARGO: obj.cargo,
          REGIMEN: obj.regimen
        }]
      }
    });
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(datosGenerales);

    const headerE = Object.keys(datosGenerales[0]); // columns name

    var wscolsE: any = [];
    for (var i = 0; i < headerE.length; i++) {  // columns length added
      wscolsE.push({ wpx: 80 })
    }
    wse["!cols"] = wscolsE;

    const wsa: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.solicitudes_empleado.map((obj: any) => {
      if (obj.estado === 3) {
        obj.estado = 'Autorizado'
      }
      this.contarRegistros = this.contarRegistros + 1;
      return {
        N_REGISTROS: this.contarRegistros,
        DESCRIPCION: obj.descripcion,
        FECHA_INICIO: DateTime.fromISO(obj.fec_inicio).toFormat('dd/MM/yyyy'),
        FECHA_FIN: DateTime.fromISO(obj.fec_final).toFormat('dd/MM/yyyy'),
        HORA_INICIO: obj.hora_inicio,
        HORA_FIN: obj.hora_final,
        ESTADO: obj.estado,
        HORAS_SOLICITADAS: obj.tiempo_autorizado,
      }
    }));
    const header = Object.keys(this.solicitudes_empleado[0]); // NOMBRE DE LAS COLUMNAS
    var wscols: any = [];
    for (var i = 0; i < header.length; i++) {  // NÚMERO DE COLUMNAS AÑADIDAS
      wscols.push({ wpx: 80 })
    }
    wsa["!cols"] = wscols;
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wse, 'Empleado');
    xlsx.utils.book_append_sheet(wb, wsa, 'SolicitudHoras Autorizadas');
    var f = DateTime.now();
    xlsx.writeFile(wb, "SolicitudAutorizadas - " + f.toFormat('yyyy-MM-dd') + '.xlsx');
    */
  }

}
