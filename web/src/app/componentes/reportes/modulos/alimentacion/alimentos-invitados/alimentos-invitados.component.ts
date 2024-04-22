// IMPORTACION DE LIBRERIAS
import { MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Validators, FormControl, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

// LIBRERÍA FORMATO DE FECHAS
import * as moment from 'moment';
moment.locale('es');

// LIBRERÍA PARA GENERAR ARCHIVOS PDF
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// LIBRERÍA PARA GENERAR ARCHIVOS EXCEL
import * as xlsx from 'xlsx';

// IMPORTACION DE SERVICIOS
import { AlimentacionService } from 'src/app/servicios/reportes/alimentacion/alimentacion.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { ValidacionesService } from '../../../../../servicios/validaciones/validaciones.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { ReportesService } from 'src/app/servicios/reportes/reportes.service';

@Component({
  selector: 'app-alimentos-invitados',
  templateUrl: './alimentos-invitados.component.html',
  styleUrls: ['./alimentos-invitados.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
  ]
})

export class AlimentosInvitadosComponent implements OnInit {

  // DATOS DE SERVICIOS DE INVITADOS
  invitados: any = [];

  // DATOS DEL FORMULARIO DE PERIODO
  fechaInicialF = new FormControl('', Validators.required);
  fechaFinalF = new FormControl('', Validators.required);

  // FORMULARIO DE PERIODO
  public fechasForm = new FormGroup({
    inicioForm: this.fechaInicialF,
    finalForm: this.fechaFinalF,
  });

  // DATOS DEL EMPLEADO LOGUEADO
  empleadoLogueado: any = [];
  idEmpleado: number;

  constructor(
    public restA: AlimentacionService,
    public rest: EmpleadoService,
    public validacionesService: ValidacionesService,
    public restR: ReportesService,
    public restEmpre: EmpresaService,
    public router: Router,
    private toastr: ToastrService,
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.ObtenerEmpleadoLogueado(this.idEmpleado);
    this.ObtenerLogo();
    this.ObtenerColores();
  }

  // METODO PARA VER LA INFORMACION DEL EMPLEADO QUE INICIA SESIÓN
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

  // METODO PARA OBTENER COLORES DE EMPRESA
  p_color: any;
  s_color: any;
  empresa: any;
  frase: any;
  ObtenerColores() {
    this.restEmpre.ConsultarDatosEmpresa(parseInt(localStorage.getItem('empresa') as string)).subscribe(res => {
      this.p_color = res[0].color_principal;
      this.s_color = res[0].color_secundario;
      this.empresa = res[0].nombre;
      this.frase = res[0].marca_agua;
    });
  }

  // CONTROL PARA VERIFICAR INGRESO DE FECHAS
  inicio: any;
  fin: any;
  VerFechas(form, archivo) {
    if (Date.parse(form.inicioForm) <= Date.parse(form.finalForm)) {
      let fechas = {
        fec_inicio: form.inicioForm,
        fec_final: form.finalForm
      }
      this.inicio = moment(form.inicioForm).format('YYYY-MM-DD');
      this.fin = moment(form.finalForm).format('YYYY-MM-DD');
      this.invitados = [];
      // BUSQUEDA DE DATOS DE SERVICIOS DE INVITADOS
      this.restA.ObtenerDetallesInvitados(fechas).subscribe(plan => {
        this.invitados = plan;
        this.ImprimirArchivo(archivo, form);
      }, err => {
        // MENSAJE INDICANDO QUE NO EXISTEN REGISTROS
        this.toastr.info('No existen registros en el periodo indicado.', 'Dar click aquí, para obtener reporte, en el que se indica que no existen registros.', {
          timeOut: 10000,
        }).onTap.subscribe(obj => {
          // LLAMADO A METODO DE IMPRESIÓN DE ARCHIVO SIN REGISTROS
          this.generarPdf('open');
          this.LimpiarFechas();
        });
       // return this.validacionesService.RedireccionarHomeAdmin(err.error)
      });
    }
    else {
      this.toastr.info('La fecha de inicio de Periodo no puede ser posterior a la fecha de fin de Periodo.', 'VERIFICAR', {
        timeOut: 6000,
      });
    }
  }

  ImprimirArchivo(archivo: string, form) {
    if (archivo === 'pdf') {
      this.generarPdf('open');
      this.LimpiarFechas();
    }
    else if (archivo === 'excel') {
      this.exportToExcelAlimentacion(form);
      this.LimpiarFechas();
    }
  }

  LimpiarFechas() {
    this.fechaInicialF.reset();
    this.fechaFinalF.reset();
  }

  /* ****************************************************************************************************
   *                               PARA LA EXPORTACION DE ARCHIVOS PDF
   * ****************************************************************************************************/

  generarPdf(action = 'open') {
    if (this.invitados.length === 0) {
      const documentDefinition_ = this.GenerarSinRegistros();
      switch (action) {
        case 'open': pdfMake.createPdf(documentDefinition_).open(); break;
        case 'print': pdfMake.createPdf(documentDefinition_).print(); break;
        case 'download': pdfMake.createPdf(documentDefinition_).download(); break;

        default: pdfMake.createPdf(documentDefinition_).open(); break;
      }
    }
    else {
      const documentDefinition = this.getDocumentDefinicion();
      switch (action) {
        case 'open': pdfMake.createPdf(documentDefinition).open(); break;
        case 'print': pdfMake.createPdf(documentDefinition).print(); break;
        case 'download': pdfMake.createPdf(documentDefinition).download(); break;

        default: pdfMake.createPdf(documentDefinition).open(); break;
      }
    }
  }

  getDocumentDefinicion() {
    sessionStorage.setItem('Administrador', this.empleadoLogueado);
    return {
      // ENCABEZADO DE LA PAGINA
      pageOrientation: 'landscape',
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleadoLogueado[0].nombre + ' ' + this.empleadoLogueado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },
      // PIE DE LA PAGINA
      footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
        var f = moment();
        fecha = f.format('YYYY-MM-DD');
        hora = f.format('HH:mm:ss');
        return {
          margin: 10,
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
      },
      content: [
        { image: this.logo, width: 150, margin: [10, -25, 0, 5] },

        { text: this.empresa.toUpperCase(), bold: true, fontSize: 25, alignment: 'center', margin: [0, -30, 0, 5] },
        { text: 'REPORTE SERVICIOS INVITADOS', fontSize: 17, alignment: 'center', margin: [0, 0, 0, 5] },
        this.presentarEncabezado('TOTAL DE ALIMENTOS PLANIFICADOS CONSUMIDOS'),
        this.presentarAlimentacion(this.invitados),
        this.presentarTotales(this.invitados),
        this.presentarEspacio(),
        this.presentarSumatoriaTotal(this.invitados),
      ],
      styles: {
        tableHeader: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTableD: { fontSize: 9, alignment: 'center' },
        itemsTableI: { fontSize: 9, alignment: 'center' },
        itemsTableT: { fontSize: 10, alignment: 'center', bold: true },
        centrado: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color, margin: [0, 5, 0, 5] },
        ver: { fontSize: 10, bold: true, alignment: 'center', border: false }
      }
    };
  }

  presentarEncabezado(titulo: any) {
    return {
      table: {
        widths: ['*'],
        body: [
          [{ text: titulo, style: 'tableHeader' },],
          [{
            columns: [
              { text: [{ text: 'FECHA INICIO: ' + this.inicio, style: 'itemsTableI' }] },
              { text: [{ text: 'FECHA FIN: ' + this.fin, style: 'itemsTableI' }] },
            ]
          }],
        ]
      },
      layout: {
        hLineColor: function (i, node) {
          return (i === 0 || i === node.table.body.length) ? 'rgb(80,87,97)' : 'rgb(80,87,97)';
        },
        paddingLeft: function (i, node) { return 40; },
        paddingRight: function (i, node) { return 40; },
        paddingTop: function (i, node) { return 6; },
        paddingBottom: function (i, node) { return 6; }
      }
    }
  }

  presentarEspacio() {
    return {
      table: {
        widths: ['*'],
        body: [
          [{ text: '', style: 'ver', margin: [0, 5, 0, 5] },],
        ]
      },
      layout:
        'noBorders'
    }
  }

  presentarTotales(arreglo: any) {
    var t_cantida = 0, t_costo = 0, t_total = 0;
    arreglo.forEach(obj => {
      t_cantida = t_cantida + parseInt(obj.cantidad),
        t_costo = t_costo + parseFloat(obj.valor),
        t_total = t_total + parseFloat(obj.total)
    })
    return {
      table: {
        widths: ['*', '*', '*', '*', '*', '*', '*', '*', '*', '*'],
        body: [
          [
            { colSpan: 7, text: 'TOTAL: ', style: 'itemsTableT', fillColor: this.s_color },
            '', '', '', '', '', '',
            { text: t_cantida, style: 'itemsTableT', fillColor: this.s_color },
            { text: '$ ' + t_costo.toFixed(2), style: 'itemsTableT', fillColor: this.s_color },
            { text: '$ ' + t_total.toFixed(2), style: 'itemsTableT', fillColor: this.s_color },
          ]
        ]
      },
      layout: {
        hLineColor: function (i, node) {
          return (i === 0 || i === node.table.body.length) ? 'rgb(80,87,97)' : 'rgb(80,87,97)';
        },
        vLineColor: function (i, node) {
          return (i === 0 || i === node.table.body.length) ? 'rgb(80,87,97)' : 'rgb(80,87,97)';
        },
        paddingLeft: function (i, node) { return 20; },
        paddingRight: function (i, node) { return 20; },
        paddingTop: function (i, node) { return 6; },
        paddingBottom: function (i, node) { return 6; }
      }
    }
  }

  presentarSumatoriaTotal(arreglo1: any) {
    var t_total1 = 0;
    var suma_total = 0;
    arreglo1.forEach(obj1 => {
      t_total1 = t_total1 + parseFloat(obj1.total)
    })
    suma_total = t_total1
    return {
      table: {
        widths: ['*', '*', '*', '*', '*', '*', '*', '*', '*', '*'],
        body: [
          [
            { colSpan: 8, text: 'SUMATORIA TOTAL DE ALIMENTOS CONSUMIDOS: ', style: 'itemsTableT', fillColor: this.s_color, fontSize: 12 },
            '', '', '', '', '', '', '',
            { colSpan: 2, text: '$ ' + suma_total.toFixed(2), style: 'itemsTableT', fillColor: this.s_color, fontSize: 11 },
            '',
          ]
        ]
      },
      layout: {
        hLineColor: function (i, node) {
          return (i === 0 || i === node.table.body.length) ? 'rgb(80,87,97)' : 'rgb(80,87,97)';
        },
        vLineColor: function (i, node) {
          return (i === 0 || i === node.table.body.length) ? 'rgb(80,87,97)' : 'rgb(80,87,97)';
        },
        paddingLeft: function (i, node) { return 20; },
        paddingRight: function (i, node) { return 20; },
        paddingTop: function (i, node) { return 6; },
        paddingBottom: function (i, node) { return 6; }
      }
    }
  }

  accionT: string;
  contarRegistros: number = 0;
  presentarAlimentacion(arreglo: any) {
    return {
      table: {
        widths: ['*', '*', '*', '*', '*', '*', 'auto', '*', '*', '*'],
        body: [
          [
            { text: 'TICKET', style: 'centrado' },
            { text: 'INVITADO', style: 'centrado' },
            { text: 'CÉDULA', style: 'centrado' },
            { text: 'TIPO COMIDA', style: 'centrado' },
            { text: 'MENÚ', style: 'centrado' },
            { text: 'PLATO', style: 'centrado' },
            { text: 'DESCRIPCIÓN', style: 'centrado' },
            { text: 'CANTIDAD', style: 'centrado' },
            { text: 'COSTO', style: 'centrado' },
            { text: 'COSTO TOTAL', style: 'centrado' },
          ],
          ...arreglo.map(obj => {
            return [
              { text: obj.ticket, style: 'itemsTableD' },
              { text: obj.apellido_invitado + ' ' + obj.nombre_invitado, style: 'itemsTableD' },
              { text: obj.cedula_invitado, style: 'itemsTableD' },
              { text: obj.comida_tipo, style: 'itemsTableD' },
              { text: obj.menu, style: 'itemsTableD' },
              { text: obj.plato, style: 'itemsTableD' },
              { text: obj.observacion, style: 'itemsTableD' },
              { text: obj.cantidad, style: 'itemsTableD' },
              { text: '$ ' + obj.valor, style: 'itemsTableD' },
              { text: '$ ' + obj.total.toFixed(2), style: 'itemsTableD' },
            ];
          })
        ]
      },
      // Estilo de colores formato zebra
      layout: {
        fillColor: function (i, node) {
          return (i % 2 === 0) ? '#CCD1D1' : null;
        }
      }
    };
  }

  /** GENERACIÓN DE PDF AL NO CONTAR CON REGISTROS */
  GenerarSinRegistros() {
    sessionStorage.setItem('Administrador', this.empleadoLogueado);
    return {
      // ENCABEZADO DE LA PAGINA
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleadoLogueado[0].nombre + ' ' + this.empleadoLogueado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },

      // PIE DE LA PAGINA
      footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
        var h = new Date();
        var f = moment();
        fecha = f.format('YYYY-MM-DD');
        hora = f.format('HH:mm:ss');
        return {
          margin: 10,
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
      },
      content: [
        { image: this.logo, width: 150, margin: [10, -25, 0, 5] },
        { text: this.empresa.toUpperCase(), bold: true, fontSize: 25, alignment: 'center', margin: [0, 20, 0, 5] },
        { text: 'REPORTE ALIMENTOS INVITADOS', fontSize: 17, alignment: 'center', margin: [0, 0, 0, 5] },
        this.presentarEspacio(),
        {
          text: [{ text: 'FECHA INICIO: ' + this.inicio, alignment: 'center', margin: [0, 0, 0, 5] },
          { text: '   -   FECHA FIN: ' + this.fin, alignment: 'center', margin: [0, 0, 0, 5] }]
        },
        this.presentarEspacio(),
        { text: 'NO EXISTEN REGISTROS DE SERVICIOS DE ALIMENTACIÓN', fontSize: 15, alignment: 'center', margin: [0, 0, 0, 10] },
      ],
    };
  }

  /******************************************************************************************************
     *                                       METODO PARA EXPORTAR A EXCEL
     ******************************************************************************************************/
  exportToExcelAlimentacion(form: any) {
    var j = 0;
    const wsp: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.invitados.map(obj => {
      return {
        N_REGISTROS: j = j + 1,
        TICKET: obj.ticket,
        CEDULA: obj.cedula_invitado,
        INVITADO: obj.apellido_invitado + ' ' + obj.nombre_invitado,
        TIPO_COMIDA: obj.comida_tipo,
        MENU: obj.menu,
        PLATO: obj.plato,
        DESCRIPCION: obj.observacion,
        CANTIDAD: parseInt(obj.cantidad),
        COSTO: obj.valor,
        COSTO_TOTAL: obj.total,
      }
    }));
    if (this.invitados.length != 0) {
      const header = Object.keys(this.invitados[0]); // COLUMNS NAME
      var wscols : any = [];
      for (var i = 0; i < header.length; i++) {  // COLUMNS LENGTH ADDED
        wscols.push({ wpx: 110 })
      }
      wsp["!cols"] = wscols;
    }

    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    if (this.invitados.length != 0) {
      xlsx.utils.book_append_sheet(wb, wsp, 'Alimentos Invitados');
    }
    xlsx.writeFile(wb, "Alimentacion - " + String(moment(form.inicioForm, "YYYY/MM/DD").format("DD/MM/YYYY")) + ' - ' + String(moment(form.finalForm, "YYYY/MM/DD").format("DD/MM/YYYY")) + '.xlsx');
  }

}
