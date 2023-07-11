import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Validators, FormControl, FormGroup } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
// Librería para manejar formatos de fechas
import * as moment from 'moment';
moment.locale('es');
// Librería para generar reportes en formato PDF
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
// Librería para generar reportes en formato EXCEL
import * as xlsx from 'xlsx';

// IMPORTACION de servicios
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { HorasExtrasRealesService } from 'src/app/servicios/reportes/horasExtrasReales/horas-extras-reales.service';
import { ReportesService } from 'src/app/servicios/reportes/reportes.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
// IMPORTACION de componentes
import { ConfigurarAtrasosComponent } from 'src/app/componentes/reportes/configuracion-reportes/configurar-atrasos/configurar-atrasos.component';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { HorarioTimbre } from 'src/app/model/timbres.model';

@Component({
  selector: 'app-reporte-atrasos',
  templateUrl: './reporte-atrasos.component.html',
  styleUrls: ['./reporte-atrasos.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
  ]
})

export class ReporteAtrasosComponent implements OnInit {

  // Datos del Empleado Timbre
  empleado: any = [];

  // Arreglo datos del empleado
  datosEmpleado: any = [];

  // Datos del Fórmulario de BUSQUEDA
  codigo = new FormControl('');
  cedula = new FormControl('', [Validators.minLength(2)]);
  nombre = new FormControl('', [Validators.minLength(2)]);
  departamentoF = new FormControl('', [Validators.minLength(2)]);
  regimenF = new FormControl('', [Validators.minLength(2)]);
  cargoF = new FormControl('', [Validators.minLength(2)]);

  // Datos del Fórmulario de Periodo
  fechaInicialF = new FormControl('', [Validators.required]);
  fechaFinalF = new FormControl('', [Validators.required]);

  // Fórmulario de Periodo
  public fechasForm = new FormGroup({
    inicioForm: this.fechaInicialF,
    finalForm: this.fechaFinalF,
  });

  // Datos de filtros de BUSQUEDA
  filtroCodigo: number;
  filtroCedula: '';
  filtroEmpleado = '';
  filtroDepartamento: '';
  filtroRegimen: '';
  filtroCargo: '';

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  // Datos del empleado Logueado
  empleadoLogueado: any = [];
  idEmpleado: number;

  constructor(
    public rest: EmpleadoService,
    public restH: HorasExtrasRealesService,
    public restR: ReportesService,
    public restD: DatosGeneralesService,
    public restEmpre: EmpresaService,
    public vistaConfigurarAtraso: MatDialog,
    public router: Router,
    private toastr: ToastrService,
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.ObtenerEmpleadoLogueado(this.idEmpleado);
    this.VerDatosEmpleado();
    this.ObtenerLogo();
    this.ObtenerColores();
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

  // METODO para verificar ingreso correcto de periodo de fechas
  confirmado: boolean;
  ConfigurarAtrasos(id_seleccionado: any, form, archivo: string) {
    if (form.inicioForm === '' || form.finalForm === '') {
      this.toastr.info('Ingresar fechas de periodo de búsqueda.', 'VERIFICAR DATOS DE FECHA', {
        timeOut: 6000,
      })
    }
    else {
      if (Date.parse(form.inicioForm) <= Date.parse(form.finalForm)) {
        let fechas = {
          fechaInicio: form.inicioForm,
          fechaFinal: form.finalForm
        }
        /** METODO para seleccionar forma de cálculo de atrasos*/
        this.vistaConfigurarAtraso.open(ConfigurarAtrasosComponent, { width: '450px' }).afterClosed()
          .subscribe((seleccion: string) => {
            if (seleccion === 'con') {
              this.confirmado = true;
              this.VerAtrasosHorario(id_seleccionado, fechas, archivo, form, this.confirmado);
            }
            else if (seleccion === 'sin') {
              this.confirmado = false;
              this.VerAtrasosHorario(id_seleccionado, fechas, archivo, form, this.confirmado);
            }
            else {
              this.router.navigate(['/reporteAtrasos']);
            }
          });
      }
      else {
        this.toastr.info('La fecha de inicio de Periodo no puede ser posterior a la fecha de fin de Periodo.', 'VERIFICAR', {
          timeOut: 6000,
        });
      }
    }
  }

  // METODO para obtener los atrasos del empleado de acuerdo al horario del empleado
  atrasosHorario: Array<HorarioTimbre> = [];
  atrasosPlanificacion: Array<HorarioTimbre> = [];
  totalAtrasos: Array<HorarioTimbre> = [];
  VerAtrasosHorario(id_seleccionado, datosFecha, archivo, form, confirmado) {
    this.atrasosHorario = [];
    this.atrasosPlanificacion = [];
    this.totalAtrasos = [];
    this.restR.ObtenerTimbresAtrasosHorario(id_seleccionado, datosFecha).subscribe((dataH: any) => {
      this.atrasosHorario = dataH;
      this.VerAtrasosPlanificacion(this.atrasosHorario, id_seleccionado, archivo, datosFecha, form, confirmado);
    }, error => {
      this.VerAtrasosPlanificacion(this.atrasosHorario, id_seleccionado, archivo, datosFecha, form, confirmado);
    });
  }

  // METODO para obtener los atrasos del empleado de acuerdo a la planificación de horario del empleado
  VerAtrasosPlanificacion(atrasos_horario: Array<HorarioTimbre>, id_seleccionado: number, archivo: string, datos_fechas, form, confirmado) {
    this.restR.ObtenerTimbresAtrasosPlanificacion(id_seleccionado, datos_fechas).subscribe((dataP: any) => {
      this.atrasosPlanificacion = dataP;
      if (atrasos_horario.length != 0) {
        atrasos_horario = atrasos_horario.concat(this.atrasosPlanificacion);
        this.totalAtrasos = atrasos_horario;
      }
      else {
        this.totalAtrasos = this.atrasosPlanificacion;
      }
      this.OrdenarDatos(this.totalAtrasos);
      this.GenerarArchivos(id_seleccionado, archivo, form, confirmado);
      this.LimpiarFechas();
      this.LimpiarCampos();
    }, error => {
      if (atrasos_horario.length != 0) {
        this.totalAtrasos = atrasos_horario;
        this.OrdenarDatos(this.totalAtrasos);
        this.GenerarArchivos(id_seleccionado, archivo, form, confirmado);
        this.LimpiarFechas();
        this.LimpiarCampos();
      }
      else {
        this.toastr.info('En el periodo indicado el empleado no tiene registros de Atrasos.', 'Dar click aquí, para obtener reporte, en el que se indica que no existen registros.', {
          timeOut: 10000,
        }).onTap.subscribe(obj => {
          if (archivo === 'pdf') {
            this.PDF_Vacio('open', id_seleccionado, form);
            this.LimpiarFechas();
          }
        });
      }
    })
  }

  // METODO para generar los archivos de descarga
  GenerarArchivos(id_seleccionado: number, archivo: string, form, confirmado) {
    if (archivo === 'pdf') {
      this.generarPdf('open', id_seleccionado, form, confirmado);
    }
    else if (archivo === 'excel') {
      this.exportToExcel(confirmado, id_seleccionado, form);
    }
  }

  // METODO para ingresar solo letras
  IngresarSoloLetras(e) {
    let key = e.keyCode || e.which;
    let tecla = String.fromCharCode(key).toString();
    //Se define todo el abecedario que se va a usar.
    let letras = " áéíóúabcdefghijklmnñopqrstuvwxyzÁÉÍÓÚABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    //Es la validación del KeyCodes, que teclas recibe el campo de texto.
    let especiales = [8, 37, 39, 46, 6, 13];
    let tecla_especial = false
    for (var i in especiales) {
      if (key == especiales[i]) {
        tecla_especial = true;
        break;
      }
    }
    if (letras.indexOf(tecla) == -1 && !tecla_especial) {
      this.toastr.info('No se admite datos numéricos', 'Usar solo letras', {
        timeOut: 6000,
      })
      return false;
    }
  }

  // METODO PARA INGRESAR SOLO NUMEROS
  IngresarSoloNumeros(evt) {
    if (window.event) {
      var keynum = evt.keyCode;
    }
    else {
      keynum = evt.which;
    }
    // COMPROBAMOS SI SE ENCUENTRA EN EL RANGO NUMERICO Y QUE TECLAS NO RECIBIRA.
    if ((keynum > 47 && keynum < 58) || keynum == 8 || keynum == 13 || keynum == 6) {
      return true;
    }
    else {
      this.toastr.info('No se admite el ingreso de letras', 'Usar solo números', {
        timeOut: 6000,
      })
      return false;
    }
  }

  // METODO para limpiar registros de campos de BUSQUEDA
  LimpiarCampos() {
    this.codigo.reset();
    this.cedula.reset();
    this.nombre.reset();
    this.departamentoF.reset();
    this.regimenF.reset();
    this.cargoF.reset();
    this.filtroEmpleado = '';
  }

  // METODO para limpiar campos de fecha 
  LimpiarFechas() {
    this.fechaInicialF.reset();
    this.fechaFinalF.reset();
  }

  // Ordenar los datos según la fecha
  OrdenarDatos(array) {
    function compare(a, b) {
      if (a.fec_hora_timbre < b.fec_hora_timbre) {
        return -1;
      }
      if (a.fec_hora_timbre > b.fec_hora_timbre) {
        return 1;
      }
      return 0;
    }
    array.sort(compare);
  }


  /* ****************************************************************************************************
   *                               PARA LA EXPORTACION DE ARCHIVOS PDF
   * ****************************************************************************************************/

  generarPdf(action = 'open', id_seleccionado, form, confirmado) {
    const documentDefinition = this.getDocumentDefinicion(id_seleccionado, form, confirmado);

    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(); break;

      default: pdfMake.createPdf(documentDefinition).open(); break;
    }

  }

  getDocumentDefinicion(id_seleccionado: number, form, confirmado) {
    sessionStorage.setItem('Administrador', this.empleadoLogueado);

    return {

      // ENCABEZADO DE LA PAGINA
      pageOrientation: 'landscape',
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleadoLogueado[0].nombre + ' ' + this.empleadoLogueado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },

      // PIE DE PAGINA
      footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
        // Obtener fecha y hora actual
        var h = new Date();
        var f = moment();
        fecha = f.format('YYYY-MM-DD');
        // Formato de hora actual
        if (h.getMinutes() < 10) {
          var time = h.getHours() + ':0' + h.getMinutes();
        }
        else {
          var time = h.getHours() + ':' + h.getMinutes();
        }
        return [
          {
            table: {
              widths: ['auto', 'auto', 'auto', 'auto', 'auto'],
              body: [
                [
                  { text: 'Glosario de Términos: ', bold: true, border: [false, false, false, false], style: ['quote', 'small'] },
                  { text: 'MM = ', bold: true, border: [false, false, false, false], style: ['quote', 'small'] },
                  { text: 'Minutos de Tolerancia ', border: [false, false, false, false], style: ['quote', 'small'] },
                  { text: 'HH = ', bold: true, border: [false, false, false, false], style: ['quote', 'small'] },
                  { text: 'Horas Laborables ', border: [false, false, false, false], style: ['quote', 'small'] },
                ]
              ]
            }
          },
          {
            margin: [10, -2, 10, 0],
            columns: [
              {
                text: [{
                  text: 'Fecha: ' + fecha + ' Hora: ' + time,
                  alignment: 'left', opacity: 0.3
                }]
              },
              {
                text: [{
                  text: '© Pag ' + currentPage.toString() + ' of ' + pageCount, alignment: 'right', opacity: 0.3
                }],
              }
            ], fontSize: 9
          }
        ]
      },

      // Títulos del archivo PDF y contenido general 
      content: [
        { image: this.logo, width: 150, margin: [10, -25, 0, 5] },
        ...this.datosEmpleado.map(obj => {
          if (obj.codigo === id_seleccionado) {
            return [
              { text: obj.empresa.toUpperCase(), bold: true, fontSize: 25, alignment: 'center', margin: [0, -30, 0, 5] },
              { text: 'REPORTE DE ATRASOS', fontSize: 17, alignment: 'center', margin: [0, 0, 0, 5] },
            ];
          }
        }),
        this.presentarDatosGenerales(id_seleccionado, form, confirmado),
        this.presentarAtrasos(confirmado),
      ],

      // Estilos del archivo PDF
      styles: {
        tableHeader: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTableD: { fontSize: 9, alignment: 'center' },
        itemsTableI: { fontSize: 9, alignment: 'left', margin: [50, 5, 5, 5] },
        itemsTableP: { fontSize: 9, alignment: 'left', bold: true, margin: [50, 5, 5, 5] },
        tableHeaderA: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color, margin: [20, 0, 20, 0], },
        tableHeaderS: { fontSize: 9, bold: true, alignment: 'center', fillColor: this.s_color },
        itemsTableC: { fontSize: 9, alignment: 'center', margin: [50, 5, 5, 5] },
        itemsTableF: { fontSize: 9, alignment: 'center' },
        quote: { margin: [5, -2, 0, -2], italics: true },
        small: { fontSize: 9, opacity: 0.3 },
        ver: { fontSize: 10, bold: true, alignment: 'center', border: false }
      }
    };
  }

  // Datos generales del PDF y sumatoria total de calculos realizados
  presentarDatosGenerales(id_seleccionado, form, confirmado) {
    // Inicialización de varibles
    var ciudad, nombre, apellido, cedula, codigo, sucursal, departamento, cargo, regimen;
    var tiempoTotal: string, horaF: string, minF: string, secondF: string;
    var minTDecimal, horaTDecimal, minTDecimalH, horaTDecimalH, diasDecimal, trabaja;
    var day, hora1, hora2, formatoHorasDecimal: number = 0, formatoDiasDecimal: number = 0;
    var tHoras = 0, tMinutos = 0, tSegudos = 0, formatoHorasEntero, minutosEscrito;
    var t1 = new Date();
    var t2 = new Date();
    // BUSQUEDA de los datos del empleado del cual se obtiene el reporte
    this.datosEmpleado.forEach(obj => {
      if (obj.codigo === id_seleccionado) {
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
    this.totalAtrasos.forEach(obj => {
      day = moment(obj.fec_hora_timbre).day();
      hora1 = (moment(obj.fec_hora_timbre).format('HH:mm:ss')).split(":");

      // Control de configuración de cálculos
      if (confirmado === true) {
        hora2 = (obj.hora_total).split(":");
      }
      else {
        hora2 = (obj.hora).split(":");
      }

      t1.setHours(parseInt(hora1[0]), parseInt(hora1[1]), parseInt(hora1[2]));
      t2.setHours(parseInt(hora2[0]), parseInt(hora2[1]), parseInt(hora2[2]));

      //Aquí hago la resta
      t1.setHours(t1.getHours() - t2.getHours(), t1.getMinutes() - t2.getMinutes(), t1.getSeconds() - t2.getSeconds());

      // Establecer formato de hora
      tHoras = tHoras + t1.getHours();
      tSegudos = tSegudos + t1.getSeconds();
      tMinutos = tMinutos + t1.getMinutes();
      if (tHoras < 10) {
        horaF = '0' + tHoras;
      }
      else {
        horaF = String(tHoras);
      }
      if (tMinutos < 10) {
        minF = '0' + tMinutos;
      }
      else {
        minF = String(tMinutos);
      }
      if (tSegudos < 10) {
        secondF = '0' + tSegudos;
      }
      else {
        secondF = String(tSegudos);
      }
      tiempoTotal = horaF + ':' + minF + ':' + secondF;

      // Realización de cálculos
      // Fórmula minutos = (segundos * 60) + minutos
      minTDecimal = (t1.getSeconds() * 60) + t1.getMinutes();
      //Fórmula horas = (minutos / 60) + horas
      horaTDecimal = (minTDecimal / 60) + t1.getHours();
      formatoHorasDecimal = formatoHorasDecimal + parseFloat(horaTDecimal.toFixed(3));
      formatoHorasEntero = parseFloat('0.' + String(formatoHorasDecimal).split('.')[1]) * 60

      // Control de escritura de minutos
      if (formatoHorasEntero.toFixed(0) < 10) {
        minutosEscrito = '0' + formatoHorasEntero.toFixed(0);
      }
      else {
        minutosEscrito = formatoHorasEntero.toFixed(0);
      }

      // Obtención de días de las horas de trabajo del empleado
      if ((obj.horario_horas).split(":")[1] != undefined) {
        trabaja = obj.horario_horas + ':00'
      }
      else {
        trabaja = obj.horario_horas + ':00:00'
      }
      var hTrabajo = (trabaja).split(":")
      var t3 = new Date();
      t3.setHours(parseInt(hTrabajo[0]), parseInt(hTrabajo[1]), parseInt(hTrabajo[2]));
      // Fórmula minutos = (segundos * 60) + minutos
      minTDecimalH = (t3.getSeconds() * 60) + t3.getMinutes();
      // Fórmula horas = (minutos / 60) + horas
      horaTDecimalH = (minTDecimalH / 60) + t3.getHours();
      // Fórmula dias = horasAtrasos / horasLaborables
      diasDecimal = horaTDecimal / horaTDecimalH;
      formatoDiasDecimal = formatoDiasDecimal + parseFloat(diasDecimal.toFixed(3));
    });
    var diaI = moment(form.inicioForm).day();
    var diaF = moment(form.finalForm).day();

    // Estructura de la tabla de lista de registros
    return {
      table: {
        widths: ['*'],
        body: [
          [{ text: 'INFORMACIÓN GENERAL EMPLEADO', style: 'tableHeader' },],
          [{
            columns: [
              { text: [{ text: 'CIUDAD: ' + ciudad, style: 'itemsTableI' }] },
              { text: [{ text: '', style: 'itemsTableI' }] },
              { text: [{ text: 'PERIODO DEL: ' + String(moment(form.inicioForm, "YYYY/MM/DD").format("DD/MM/YYYY")) + ' AL ' + String(moment(form.finalForm, "YYYY/MM/DD").format("DD/MM/YYYY")), style: 'itemsTableP' }] },
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
              { text: [{ text: 'N° REGISTROS: ' + this.totalAtrasos.length, style: 'itemsTableI' }] },
            ]
          }],
          [{
            border: [false, false, false, false],
            table: {
              widths: ['*', '*'],
              body: [
                [
                  { text: 'SUMATORIA TOTAL DE ATRASOS EN DIAS Y HORAS FORMATO DECIMAL', style: 'tableHeaderS' },
                  { text: 'SUMATORIA TOTAL DE ATRASOS EN DIAS Y HORAS FORMATO GENERAL', style: 'tableHeaderS' },
                ],
                [
                  { text: 'TOTAL DE ATRASOS EN DIAS LABORABLES DECIMAL: ' + formatoDiasDecimal.toFixed(3), style: 'itemsTableF' },
                  { rowSpan: 2, text: 'TOTAL DE ATRASOS EN HORAS Y MINUTOS: ' + String(formatoHorasDecimal).split('.')[0] + ' horas : ' + minutosEscrito + ' minutos', style: 'itemsTableF', margin: [0, 20, 0, 20] }
                ],
                [
                  { text: 'TOTAL DE ATRASOS EN HORAS LABORABLES DECIMAL: ' + formatoHorasDecimal.toFixed(3), style: 'itemsTableF' },

                ],
              ]
            },
            layout: {
              hLineColor: function (i, node) {
                return (i === 0 || i === node.table.body.length) ? 'rgb(80,87,97)' : 'rgb(80,87,97)';
              },
              paddingLeft: function (i, node) { return 10; },
              paddingRight: function (i, node) { return 10; },
              paddingTop: function (i, node) { return 10; },
              paddingBottom: function (i, node) { return 10; }
            }
          }],
          [{ text: 'LISTA DE ATRASOS PERIODO DEL ' + moment.weekdays(diaI).toUpperCase() + ' ' + String(moment(form.inicioForm, "YYYY/MM/DD").format("DD/MM/YYYY")) + ' AL ' + moment.weekdays(diaF).toUpperCase() + ' ' + String(moment(form.finalForm, "YYYY/MM/DD").format("DD/MM/YYYY")), style: 'tableHeader' },],
        ]
      },
      layout: {
        hLineColor: function (i, node) {
          return (i === 0 || i === node.table.body.length) ? 'rgb(80,87,97)' : 'rgb(80,87,97)';
        },
        paddingLeft: function (i, node) { return 40; },
        paddingRight: function (i, node) { return 40; },
        paddingTop: function (i, node) { return 10; },
        paddingBottom: function (i, node) { return 10; }
      }
    }
  }

  // Estructura Lista de Registros
  contarRegistros: number = 0;
  presentarAtrasos(confirmado: boolean) {
    this.contarRegistros = 0;
    return {
      table: {
        widths: ['auto', '*', 'auto', 'auto', '*', 'auto', '*', '*', 'auto', 'auto'],
        body: [
          [
            { text: 'N° REGISTRO', style: 'tableHeader' },
            { text: 'DÍA', style: 'tableHeader' },
            { text: 'FECHA', style: 'tableHeader' },
            { text: 'HORARIO', style: 'tableHeader' },
            { text: 'MM. TOLERANCIA', style: 'tableHeader' },
            { text: 'HORA TIMBRE', style: 'tableHeader' },
            { text: 'HH. TRABAJO', style: 'tableHeader' },
            { text: 'ATRASO', style: 'tableHeader', fillColor: this.s_color },
            { text: 'HORAS', style: 'tableHeader' },
            { text: 'DÍAS', style: 'tableHeader' },
          ],
          ...this.totalAtrasos.map(obj => {
            // Inicialización de variables
            var tiempoTotal: string, horaF: string, minF: string, secondF: string;
            var minTDecimal, horaTDecimal, minTDecimalH, horaTDecimalH, diasDecimal, trabaja;
            var day = moment(obj.fec_hora_timbre).day();
            var hora1 = (moment(obj.fec_hora_timbre).format('HH:mm:ss')).split(":");

            // Control de configuración de cálculos
            if (confirmado === true) {
              var hora2 = (obj.hora_total).split(":");
            }
            else {
              var hora2 = (obj.hora).split(":");
            }

            var t1 = new Date();
            var t2 = new Date();
            t1.setHours(parseInt(hora1[0]), parseInt(hora1[1]), parseInt(hora1[2]));
            t2.setHours(parseInt(hora2[0]), parseInt(hora2[1]), parseInt(hora2[2]));

            //Aquí hago la resta
            t1.setHours(t1.getHours() - t2.getHours(), t1.getMinutes() - t2.getMinutes(), t1.getSeconds() - t2.getSeconds());
            // Establecer formato de hora
            if (t1.getHours() < 10) {
              horaF = '0' + t1.getHours();
            }
            else {
              horaF = String(t1.getHours());
            }
            if (t1.getMinutes() < 10) {
              minF = '0' + t1.getMinutes();
            }
            else {
              minF = String(t1.getMinutes());
            }
            if (t1.getSeconds() < 10) {
              secondF = '0' + t1.getSeconds();
            }
            else {
              secondF = String(t1.getSeconds());
            }
            tiempoTotal = horaF + ':' + minF + ':' + secondF;

            // Realización de cálculos
            // Fórmula minutos = (segundos * 60) + minutos
            minTDecimal = (t1.getSeconds() * 60) + t1.getMinutes();
            // Fórmula horas = (minutos / 60) + minutos
            horaTDecimal = (minTDecimal / 60) + t1.getHours();

            // Obtención de días de trabajo del empleado
            if ((obj.horario_horas).split(":")[1] != undefined) {
              trabaja = obj.horario_horas + ':00'
            }
            else {
              trabaja = obj.horario_horas + ':00:00'
            }
            var hTrabajo = (trabaja).split(":")
            var t3 = new Date();
            t3.setHours(parseInt(hTrabajo[0]), parseInt(hTrabajo[1]), parseInt(hTrabajo[2]));
            // Fórmula minutos = (segundos * 60) + minutos
            minTDecimalH = (t3.getSeconds() * 60) + t3.getMinutes();
            // Fórmula horas = (minutos / 60) + horas
            horaTDecimalH = (minTDecimalH / 60) + t3.getHours();
            // Fórmula dias = horasAtrasos / horasLaborables
            diasDecimal = horaTDecimal / horaTDecimalH;
            this.contarRegistros = this.contarRegistros + 1;

            return [
              { text: this.contarRegistros, style: 'itemsTableD' },
              { text: moment.weekdays(day).charAt(0).toUpperCase() + moment.weekdays(day).slice(1), style: 'itemsTableD' },
              { text: moment(obj.fec_hora_timbre).format('DD/MM/YYYY'), style: 'itemsTableD' },
              { text: obj.hora, style: 'itemsTableD' },
              { text: obj.minu_espera + ' min', style: 'itemsTableD' },
              { text: moment(obj.fec_hora_timbre).format('HH:mm:ss'), style: 'itemsTableD' },
              { text: obj.horario_horas, style: 'itemsTableD' },
              { text: tiempoTotal, style: 'itemsTableD' },
              { text: horaTDecimal.toFixed(3), style: 'itemsTableD' },
              { text: diasDecimal.toFixed(3), style: 'itemsTableD' },
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

  PDF_Vacio(action = 'open', id_seleccionado, form) {
    const documentDefinition = this.GenerarSinRegstros(id_seleccionado, form);

    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(); break;

      default: pdfMake.createPdf(documentDefinition).open(); break;
    }

  }

  GenerarSinRegstros(id_seleccionado: any, form) {

    sessionStorage.setItem('Administrador', this.empleadoLogueado);

    return {

      // ENCABEZADO DE LA PAGINA
      //pageOrientation: 'landscape',
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleadoLogueado[0].nombre + ' ' + this.empleadoLogueado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },

      // PIE DE LA PAGINA
      footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
        var h = new Date();
        var f = moment();
        fecha = f.format('YYYY-MM-DD');
        // Formato de hora actual
        if (h.getMinutes() < 10) {
          var time = h.getHours() + ':0' + h.getMinutes();
        }
        else {
          var time = h.getHours() + ':' + h.getMinutes();
        }
        return {
          margin: 10,
          columns: [
            {
              text: [{
                text: 'Fecha: ' + fecha + ' Hora: ' + time,
                alignment: 'left', opacity: 0.3
              }]
            },
            {
              text: [{
                text: '© Pag ' + currentPage.toString() + ' of ' + pageCount, alignment: 'right', opacity: 0.3
              }],
            }
          ], fontSize: 10
        }
      },
      content: [
        { image: this.logo, width: 150, margin: [10, -25, 0, 5] },
        ...this.datosEmpleado.map(obj => {
          if (obj.codigo === id_seleccionado) {
            return [
              { text: obj.empresa.toUpperCase(), bold: true, fontSize: 25, alignment: 'center', margin: [0, -30, 0, 5] },
              { text: 'REPORTE DE ATRASOS', fontSize: 17, alignment: 'center', margin: [0, 0, 0, 5] },
            ];
          }
        }),
        this.presentarDatosEmpleado(id_seleccionado, form)
      ],
      // Estilos del archivo PDF
      styles: {
        tableHeader: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTableI: { fontSize: 9, alignment: 'left', margin: [50, 5, 5, 5] },
        itemsTableP: { fontSize: 9, alignment: 'left', bold: true, margin: [50, 5, 5, 5] },
      }
    };
  }

  // Datos generales del PDF y sumatoria total de calculos realizados
  presentarDatosEmpleado(id_seleccionado, form) {
    // Inicialización de varibles
    var ciudad, nombre, apellido, cedula, codigo, sucursal, departamento, cargo, regimen;
    // BUSQUEDA de los datos del empleado del cual se obtiene el reporte
    this.datosEmpleado.forEach(obj => {
      if (obj.codigo === id_seleccionado) {
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

    // Estructura de la tabla de lista de registros
    return {
      table: {
        widths: ['*'],
        body: [
          [{ text: 'INFORMACIÓN GENERAL EMPLEADO', style: 'tableHeader' },],
          [{
            columns: [
              { text: [{ text: 'PERIODO DEL: ' + String(moment(form.inicioForm, "YYYY/MM/DD").format("DD/MM/YYYY")) + ' AL ' + String(moment(form.finalForm, "YYYY/MM/DD").format("DD/MM/YYYY")), style: 'itemsTableP' }] },
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
              { text: [{ text: 'CIUDAD: ' + ciudad, style: 'itemsTableI' }] },
              { text: [{ text: 'SUCURSAL: ' + sucursal, style: 'itemsTableI' }] },
              { text: [{ text: 'DEPARTAMENTO: ' + departamento, style: 'itemsTableI' }] },
            ]
          }],
          [{ text: 'NO EXISTEN REGISTROS DE ATRASOS', style: 'tableHeader' },],
        ]
      },
      layout: {
        hLineColor: function (i, node) {
          return (i === 0 || i === node.table.body.length) ? 'rgb(80,87,97)' : 'rgb(80,87,97)';
        },
        paddingLeft: function (i, node) { return 40; },
        paddingRight: function (i, node) { return 40; },
        paddingTop: function (i, node) { return 10; },
        paddingBottom: function (i, node) { return 10; }
      }
    }
  }


  /* ****************************************************************************************************
   *                               PARA LA EXPORTACION DE ARCHIVOS EXCEL
   * ****************************************************************************************************/

  exportToExcel(confirmado: boolean, id_seleccionado, form) {
    this.contarRegistros = 0;
    // Inicialización de varibles
    var datosGenerales, mensaje: string = '';
    var tiempoTotal: string, horaF: string, minF: string, secondF: string;
    var minTDecimal, horaTDecimal, minTDecimalH, horaTDecimalH, diasDecimal, trabaja;
    var day, hora1, hora2, formatoHorasDecimal: number = 0, formatoDiasDecimal: number = 0;
    var tHoras = 0, tMinutos = 0, tSegudos = 0, formatoHorasEntero, minutosEscrito;
    var t1 = new Date();
    var t2 = new Date();

    this.totalAtrasos.forEach(obj => {
      day = moment(obj.fec_hora_timbre).day();
      hora1 = (moment(obj.fec_hora_timbre).format('HH:mm:ss')).split(":");

      // Control de configuración de cálculos
      if (confirmado === true) {
        hora2 = (obj.hora_total).split(":");
      }
      else {
        hora2 = (obj.hora).split(":");
      }

      t1.setHours(parseInt(hora1[0]), parseInt(hora1[1]), parseInt(hora1[2]));
      t2.setHours(parseInt(hora2[0]), parseInt(hora2[1]), parseInt(hora2[2]));

      //Aquí hago la resta
      t1.setHours(t1.getHours() - t2.getHours(), t1.getMinutes() - t2.getMinutes(), t1.getSeconds() - t2.getSeconds());

      // Establecer formato de hora
      tHoras = tHoras + t1.getHours();
      tSegudos = tSegudos + t1.getSeconds();
      tMinutos = tMinutos + t1.getMinutes();
      if (tHoras < 10) {
        horaF = '0' + tHoras;
      }
      else {
        horaF = String(tHoras);
      }
      if (tMinutos < 10) {
        minF = '0' + tMinutos;
      }
      else {
        minF = String(tMinutos);
      }
      if (tSegudos < 10) {
        secondF = '0' + tSegudos;
      }
      else {
        secondF = String(tSegudos);
      }
      tiempoTotal = horaF + ':' + minF + ':' + secondF;

      // Realización de cálculos
      // Fórmula minutos = (segundos * 60) + minutos
      minTDecimal = (t1.getSeconds() * 60) + t1.getMinutes();
      // Fórmula horas = (minutos / 60) + horas
      horaTDecimal = (minTDecimal / 60) + t1.getHours();
      formatoHorasDecimal = formatoHorasDecimal + parseFloat(horaTDecimal.toFixed(3));
      formatoHorasEntero = parseFloat('0.' + String(formatoHorasDecimal).split('.')[1]) * 60

      // Control de escritura de minutos
      if (formatoHorasEntero.toFixed(0) < 10) {
        minutosEscrito = '0' + formatoHorasEntero.toFixed(0);
      }
      else {
        minutosEscrito = formatoHorasEntero.toFixed(0);
      }

      // Obtención de días de las horas de trabajo del empleado
      if ((obj.horario_horas).split(":")[1] != undefined) {
        trabaja = obj.horario_horas + ':00'
      }
      else {
        trabaja = obj.horario_horas + ':00:00'
      }
      var hTrabajo = (trabaja).split(":")
      var t3 = new Date();
      t3.setHours(parseInt(hTrabajo[0]), parseInt(hTrabajo[1]), parseInt(hTrabajo[2]));
      // Fórmula minutos = (segundos * 60) + minutos
      minTDecimalH = (t3.getSeconds() * 60) + t3.getMinutes();
      // Fórmula horas = (minutos / 60) + horas
      horaTDecimalH = (minTDecimalH / 60) + t3.getHours();
      // Fórmula dias = horasAtrasos / horasLaborables
      diasDecimal = horaTDecimal / horaTDecimalH;
      formatoDiasDecimal = formatoDiasDecimal + parseFloat(diasDecimal.toFixed(3));
    });

    // BUSQUEDA de los datos del empleado del cual se obtiene el reporte
    this.datosEmpleado.forEach(obj => {
      if (obj.codigo === id_seleccionado) {
        datosGenerales = [{
          NOMBRE: obj.nombre,
          APELLIDO: obj.apellido,
          CEDULA: obj.cedula,
          CODIGO: obj.codigo,
          SUCURSAL: obj.sucursal,
          DEPARTAMENTO: obj.departamento,
          CIUDAD: obj.ciudad,
          CARGO: obj.cargo,
          REGIMEN: obj.regimen,
          TOTAL_ATRASOS_DIAS_LABORABLES: parseFloat(formatoDiasDecimal.toFixed(3)),
          TOTAL_ATRASOS_HORAS_LABORABLES: parseFloat(formatoHorasDecimal.toFixed(3))
        }]
      }
    });
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(datosGenerales);

    const headerE = Object.keys(datosGenerales[0]); // columns name

    var wscolsE : any = [];
    for (var i = 0; i < headerE.length; i++) {  // columns length added
      wscolsE.push({ wpx: 115 })
    }
    wse["!cols"] = wscolsE;

    const wsa: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.totalAtrasos.map(obj => {
      // Inicialización de variables
      var tiempoTotal: string, horaF: string, minF: string, secondF: string;
      var minTDecimal, horaTDecimal, minTDecimalH, horaTDecimalH, diasDecimal, trabaja;
      var day = moment(obj.fec_hora_timbre).day();
      var hora1 = (moment(obj.fec_hora_timbre).format('HH:mm:ss')).split(":");

      // Control de configuración de cálculos
      if (confirmado === true) {
        var hora2 = (obj.hora_total).split(":");
        mensaje = 'con_minutos_tolerancia';
      }
      else {
        var hora2 = (obj.hora).split(":");
        mensaje = 'sin_minutos_tolerancia';
      }

      var t1 = new Date();
      var t2 = new Date();
      t1.setHours(parseInt(hora1[0]), parseInt(hora1[1]), parseInt(hora1[2]));
      t2.setHours(parseInt(hora2[0]), parseInt(hora2[1]), parseInt(hora2[2]));

      //Aquí hago la resta
      t1.setHours(t1.getHours() - t2.getHours(), t1.getMinutes() - t2.getMinutes(), t1.getSeconds() - t2.getSeconds());
      // Establecer formato de hora
      if (t1.getHours() < 10) {
        horaF = '0' + t1.getHours();
      }
      else {
        horaF = String(t1.getHours());
      }
      if (t1.getMinutes() < 10) {
        minF = '0' + t1.getMinutes();
      }
      else {
        minF = String(t1.getMinutes());
      }
      if (t1.getSeconds() < 10) {
        secondF = '0' + t1.getSeconds();
      }
      else {
        secondF = String(t1.getSeconds());
      }
      tiempoTotal = horaF + ':' + minF + ':' + secondF;

      // Realización de cálculos
      // Fórmula minutos = (segundos * 60) +  minutos
      minTDecimal = (t1.getSeconds() * 60) + t1.getMinutes();
      // Fórmula horas = (minutos / 60) + horas
      horaTDecimal = (minTDecimal / 60) + t1.getHours();

      // Obtención de días de trabajo del empleado
      if ((obj.horario_horas).split(":")[1] != undefined) {
        trabaja = obj.horario_horas + ':00'
      }
      else {
        trabaja = obj.horario_horas + ':00:00'
      }
      var hTrabajo = (trabaja).split(":")
      var t3 = new Date();
      t3.setHours(parseInt(hTrabajo[0]), parseInt(hTrabajo[1]), parseInt(hTrabajo[2]));
      // Fórmula minutos = (segundos * 60) + minutos
      minTDecimalH = (t3.getSeconds() * 60) + t3.getMinutes();
      // Fórmula horas = (minutos / 60) + horas
      horaTDecimalH = (minTDecimalH / 60) + t3.getHours();
      // Fórmula dias = horasAtrasos / horasLaborables
      diasDecimal = horaTDecimal / horaTDecimalH;
      this.contarRegistros = this.contarRegistros + 1;

      return {
        N_REGISTROS: this.contarRegistros,
        DIA: moment.weekdays(day).charAt(0).toUpperCase() + moment.weekdays(day).slice(1),
        FECHA: moment(obj.fec_hora_timbre).format('DD/MM/YYYY'),
        HORARIO: obj.hora,
        MINUTOS_TOLERANCIA: obj.minu_espera + ' min',
        HORA_TIMBRE: moment(obj.fec_hora_timbre).format('HH:mm:ss'),
        HORAS_LABORABLES: obj.horario_horas,
        HORAS_ATRASOS: tiempoTotal,
        HORAS_DECIMAL: parseFloat(horaTDecimal.toFixed(3)),
        DIAS_DECIMAL: parseFloat(diasDecimal.toFixed(3)),
      }
    }));

    const header = Object.keys(this.totalAtrasos[0]); // nombres de las columnas

    var wscols : any = [];
    for (var i = 0; i < header.length; i++) {  // contar columnas
      wscols.push({ wpx: 110 })
    }
    wsa["!cols"] = wscols;

    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wse, 'Empleado');
    xlsx.utils.book_append_sheet(wb, wsa, 'Atrasos');
    xlsx.writeFile(wb, "Atrasos - " + mensaje + ' - ' + String(moment(form.inicioForm, "YYYY/MM/DD").format("DD/MM/YYYY")) + ' - ' + String(moment(form.finalForm, "YYYY/MM/DD").format("DD/MM/YYYY")) + '.xlsx');
  }

}
