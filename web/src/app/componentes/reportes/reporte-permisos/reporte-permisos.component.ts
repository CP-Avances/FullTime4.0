// IMPORTAR LIBRERIAS
import { MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Validators, FormControl, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
// LIBRERÍA PARA MANEJAR FECHAS
import * as moment from 'moment';
moment.locale('es');
// LIBRERÍA PARA GENERAR ARCHIVOS 
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as xlsx from 'xlsx';
// IMPORTAR SERVICIOS
import { HorasExtrasRealesService } from 'src/app/servicios/reportes/horasExtrasReales/horas-extras-reales.service';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { ReportesService } from 'src/app/servicios/reportes/reportes.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
// SERVICIOS FILTROS DE BUSQUEDA
import { DepartamentosService } from 'src/app/servicios/catalogos/catDepartamentos/departamentos.service';
import { EmplCargosService } from 'src/app/servicios/empleado/empleadoCargo/empl-cargos.service';
import { SucursalService } from 'src/app/servicios/sucursales/sucursal.service';
import { RegimenService } from 'src/app/servicios/catalogos/catRegimen/regimen.service';

@Component({
  selector: 'app-reporte-permisos',
  templateUrl: './reporte-permisos.component.html',
  styleUrls: ['./reporte-permisos.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
  ]
})

export class ReportePermisosComponent implements OnInit {

  // DATOS EMPLEADO PERMISOS
  empleado: any = [];

  // ARREGLO DATOS EMPLEADO
  datosEmpleado: any = [];

  // DATOS DEL FORMULARIO DE BUSQUEDA
  departamentoF = new FormControl('', [Validators.minLength(2)]);
  regimenF = new FormControl('', [Validators.minLength(2)]);
  codigo = new FormControl('');
  cedula = new FormControl('', [Validators.minLength(2)]);
  nombre = new FormControl('', [Validators.minLength(2)]);
  cargoF = new FormControl('', [Validators.minLength(2)]);

  // DATOS DEL FORMULARIO DE PERIODO
  fechaInicialF = new FormControl('', [Validators.required]);
  fechaFinalF = new FormControl('', [Validators.required]);

  // FORMULARIO DE PERIODO
  public fechasForm = new FormGroup({
    inicioForm: this.fechaInicialF,
    finalForm: this.fechaFinalF,
  });

  // DATOS DE FILTROS DE BUSQUEDA
  filtroDepartamento: '';
  filtroEmpleado = '';
  filtroRegimen: '';
  filtroCodigo: number;
  filtroCedula: '';
  filtroCargo: '';

  // ITEMS DE PAGINACION DE LA TABLA
  pageSizeOptions = [5, 10, 20, 50];
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;

  // DATOS DEL EMPLEADO LOGUEADO
  empleadoLogueado: any = [];
  idEmpleado: number;

  // FILTROS DE BUSQUEDA 
  sucursalF = new FormControl('');
  laboralF = new FormControl('');
  cargosF = new FormControl('');
  depaF = new FormControl('');

  // FORMULARIO DE BUSQUEDAS
  public busquedasForm = new FormGroup({
    sucursalForm: this.sucursalF,
    laboralForm: this.laboralF,
    cargosForm: this.cargosF,
    depaForm: this.depaF,
  });

  constructor(
    // FILTROS DE BUSQUEDA 
    public restGeneralepa: DepartamentosService,
    public restRegimen: RegimenService,
    public restSucur: SucursalService,
    public restCargo: EmplCargosService,

    private toastr: ToastrService,
    public restGeneral: DatosGeneralesService,
    public restEmpre: EmpresaService,
    public validar: ValidacionesService,
    public router: Router,
    public restH: HorasExtrasRealesService,
    public restR: ReportesService,
    public rest: EmpleadoService,
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.ObtenerEmpleadoLogueado(this.idEmpleado);
    this.VerDatosEmpleado();
    this.ObtenerColores();
    this.ObtenerLogo();
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

  // METODO PARA MANEJO DE PAGINACIÓN
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // OBTENER LISTA DE EMPLEADOS QUE TIENEN DATOS DE CONTRATO Y CARGO
  VerDatosEmpleado() {
    this.datosEmpleado = [];
    this.restGeneral.ListarInformacionActual().subscribe(data => {
      this.datosEmpleado = data;
      console.log('datos_actuales', this.datosEmpleado)
    });
  }

  // OBTENER DATOS DE PERMISO DEL EMPLEADO DE ACUERDO AL HORARIO
  datosAutorizacion: any = [];
  permisosHorarios: any = [];
  totalPermisos: any = [];
  permisosPlanificacion: any = [];
  VerPermisosEmpleado(codigo, archivo, form) {
    this.permisosHorarios = [];
    this.permisosPlanificacion = [];
    this.totalPermisos = [];
    this.restR.ObtenerPermisosHorarios(codigo).subscribe(dataH => {
      this.permisosHorarios = dataH;
      this.VerPermisosInformacion(this.permisosHorarios, codigo, archivo, form);
    }, error => {
      this.VerPermisosInformacion(this.permisosHorarios, codigo, archivo, form);
    });
  }

  // OBTENER DATOS DE PERMISOS DEL EMPLEADO DE ACUERDO A LA PLANIFICACIÓN
  VerPermisosInformacion(permisos_horario: any, codigo: string | number, archivo: string, form) {
    if (permisos_horario.length != 0) {
      this.totalPermisos = permisos_horario;
      this.OrdenarDatos(this.totalPermisos);
      this.VerDatosAutorizacion(codigo, archivo, form);
    }
    else {
      this.toastr.info('En el periodo indicado el empleado no tiene registros de Permisos.', 'Dar click aquí, para obtener reporte, en el que se indica que no existen registros.', {
        timeOut: 10000,
      }).onTap.subscribe(obj => {
        if (archivo === 'pdf') {
          this.PDF_Vacio('open', codigo, form);
          this.LimpiarFechas();
        }
      });
    }
  }

  // ORDENAR LOS DATOS SEGÚN EL NÚMERO DE PERMISO
  OrdenarDatos(array) {
    function compare(a, b) {
      if (a.num_permiso < b.num_permiso) {
        return -1;
      }
      if (a.num_permiso > b.num_permiso) {
        return 1;
      }
      return 0;
    }
    array.sort(compare);
  }

  // OBTENER DATOS DE LA AUTORIZACIÓN DE LOS PERMISOS
  consultaAutoriza: any = [];
  verificar: number = 0;
  VerDatosAutorizacion(codigo: string | number, archivo: string, form) {
    this.verificar = 1;
    // RECORREMOS EL ARRAY DE DATOS PARA CAMBIAR EL ESTADO
    this.totalPermisos.map(obj => {
      // OBTENEMOS EL ID DEL EMPLEADO QUE REALIZO EL CAMBIO DE ESTADO A LA AUTORIZACIÓN
      // BUSCAMOS LOS RESPECTIVOS DATOS DEL ID DEL EMPLEADO ENCONTRADO
      if (obj.estado != 'Pendiente') {
        this.restGeneral.InformarEmpleadoAutoriza(obj.autoriza).subscribe(dataE => {
          // CREAMOS UN ARRAY DE DATO EN EL QUE INCLUIOS EL NOMBRE DEL EMPLEADO QUE AUTORIZO EL PERMISO
          obj.autorizado_por = dataE[0].fullname;
          // VERIFICAMOS SI YA ESTAN TODOS LOS DATOS Y PASAMOS A GENERAR LOS ARCHIVOS
          if (this.verificar === this.totalPermisos.length) {
            this.verificar = 1;
            this.GenerarArchivo(archivo, codigo, form);
          }
          this.verificar = this.verificar + 1;
        });
      } else {
        if (this.verificar === this.totalPermisos.length) {
          this.verificar = 1;
          this.GenerarArchivo(archivo, codigo, form);
        }
        this.verificar = this.verificar + 1;
      }
    })
  }

  GenerarArchivo(archivo: String, id_seleccionado: any, form) {
    if (archivo === 'pdf') {
      this.generarPdf('open', id_seleccionado);
    }
    else if (archivo === 'excel') {
      this.exportToExcel(id_seleccionado, form);
    }
  }


  // OBTENCIÓN DE LOS PERMISOS DE ACUERDO AL PERIODO DE FECHAS INDICADO
  VerPermisosEmpleadoFecha(codigo, archivo, fechas, form) {
    this.permisosHorarios = [];
    this.totalPermisos = [];
    this.restR.ObtenerPermisosHorariosFechas(codigo, fechas).subscribe(dataH => {
      this.permisosHorarios = dataH;
      this.VerificarInformacion(this.permisosHorarios, codigo, archivo, form);
    }, error => {
      this.VerificarInformacion(this.permisosHorarios, codigo, archivo, form);
    });
  }

  // OBTENCIÓN DE LOS PERMISOS DE ACUERDO A LA PLANIFICACIÓN Y AL PERIODO DE FECHAS INDICADO 
  VerificarInformacion(permisos_horario: any, codigo: string | number, archivo: string, form) {
    if (permisos_horario.length != 0) {
      this.totalPermisos = permisos_horario;
      this.OrdenarDatos(this.totalPermisos);
      this.VerDatosAutorizacion(codigo, archivo, form);
    }
    else {
      this.toastr.info('En el periodo indicado el empleado no tiene registros de Permisos.', 'Dar click aquí, para obtener reporte, en el que se indica que no existen registros.', {
        timeOut: 10000,
      }).onTap.subscribe(obj => {
        if (archivo === 'pdf') {
          this.PDF_Vacio('open', codigo, form);
          this.LimpiarFechas();
        }
      });
    }
  }

  // METODO PARA CONTROLAR INGRESO ADECUADO DE PERIODO DE FECHAS
  VerPermisos(form, archivo, codigo) {
    if (form.inicioForm === '' && form.finalForm === '' || form.inicioForm === null && form.finalForm === null) {
      this.VerPermisosEmpleado(codigo, archivo, form);
    }
    else {
      if (form.inicioForm === '' || form.finalForm === '') {
        this.toastr.info('Ingresar las dos fechas de periodo de búsqueda.', 'VERIFICAR DATOS DE FECHA', {
          timeOut: 6000,
        })
      }
      else {
        if (Date.parse(form.inicioForm) <= Date.parse(form.finalForm)) {
          var fechas = {
            fechaInicio: form.inicioForm,
            fechaFinal: form.finalForm
          }
          this.VerPermisosEmpleadoFecha(codigo, archivo, fechas, form);
          this.LimpiarFechas();
        }
        else {
          this.toastr.info('La fecha de inicio de Periodo no puede ser posterior a la fecha de fin de Periodo.', 'VERIFICAR', {
            timeOut: 6000,
          });
        }
      }
    }
  }

  // METODO PARA INGRESAR SOLO LETRAS
  IngresarSoloLetras(e) {
    this.validar.IngresarSoloLetras(e);
  }

  // METODO PARA INGRESAR SOLO NUMEROS
  IngresarSoloNumeros(evt) {
    this.validar.IngresarSoloNumeros(evt);
  }

  // METODO PARA LIMPIAR CAMPOS DE BUSQUEDA
  LimpiarCampos() {
    this.codigo.reset();
    this.cedula.reset();
    this.nombre.reset();
    this.departamentoF.reset();
    this.regimenF.reset();
    this.cargoF.reset();
    this.filtroEmpleado = '';
  }

  // METODO PARA LIMPIAR CAMPOS DE FECHA
  LimpiarFechas() {
    this.fechaInicialF.reset();
    this.fechaFinalF.reset();
  }

  /* ****************************************************************************************************
   *                               PARA LA EXPORTACION DE ARCHIVOS PDF
   * ****************************************************************************************************/

  generarPdf(action = 'open', codigo) {
    const documentDefinition = this.getDocumentDefinicion(codigo);

    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(); break;

      default: pdfMake.createPdf(documentDefinition).open(); break;
    }

  }

  getDocumentDefinicion(codigo: string | number) {
    sessionStorage.setItem('Administrador', this.empleadoLogueado);
    return {

      // ENCABEZADO DE LA PAGINA
      pageOrientation: 'landscape',
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleadoLogueado[0].nombre + ' ' + this.empleadoLogueado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },

      // PIE DE PAGINA
      footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
        // METODO de obtención de fecha y hora actual
        var h = new Date();
        var f = moment();
        fecha = f.format('YYYY-MM-DD');
        hora = f.format('HH:mm:ss');
        return [
          {
            table: {
              widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
              body: [
                [
                  { text: 'Glosario de Términos: ', bold: true, border: [false, false, false, false], style: ['quote', 'small'] },
                  { text: 'DD = ', bold: true, border: [false, false, false, false], style: ['quote', 'small'] },
                  { text: 'Días de Permiso ', border: [false, false, false, false], style: ['quote', 'small'] },
                  { text: 'HH:MM = ', bold: true, border: [false, false, false, false], style: ['quote', 'small'] },
                  { text: 'Horas y minutos de permiso ', border: [false, false, false, false], style: ['quote', 'small'] },
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
                  text: 'Fecha: ' + fecha + ' Hora: ' + hora,
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
      // TÍTULO DEL ARCHIVO Y SUMATORIA DE CÁLCULOS
      content: [
        { image: this.logo, width: 150, margin: [10, -25, 0, 5] },
        ...this.datosEmpleado.map(obj => {
          if (obj.codigo === codigo) {
            return [
              { text: obj.empresa.toUpperCase(), bold: true, fontSize: 25, alignment: 'center', margin: [0, -30, 0, 5] },
              { text: 'REPORTE GENERAL DE PERMISOS', fontSize: 17, alignment: 'center', margin: [0, 0, 0, 5] },
            ];
          }
        }),
        this.presentarDatosGenerales(codigo),
        this.presentarPermisos(),
      ],
      // ESTILOS DEL ARCHIVO PDF
      styles: {
        tableHeader: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTableD: { fontSize: 9, alignment: 'center' },
        itemsTable: { fontSize: 9 },
        itemsTableI: { fontSize: 9, alignment: 'left', margin: [50, 5, 5, 5] },
        itemsTableC: { fontSize: 9, alignment: 'center', margin: [50, 5, 5, 5] },
        tableHeaderF: { fontSize: 9, bold: true, alignment: 'center', fillColor: this.s_color, },
        itemsTableS: { fontSize: 9, alignment: 'center', },
        quote: { margin: [5, -2, 0, -2], italics: true },
        small: { fontSize: 9, opacity: 0.3 }
      }
    };
  }

  // DATOS GENERALES DEL EMPLEADO DEL QUE SE OBTIENE EL REPORTE Y SUMATORIA DE CÁLCULOS REALIZADOS
  datosEmpleadoAutoriza: any = [];
  presentarDatosGenerales(codigo) {
    var ciudad, nombre, apellido, cedula, codigo, regimen, sucursal, departamento, cargo, totalDias = 0, totalHoras = 0, formatoHoras = '0', formatoMinutos;
    var horas_decimal, dias_decimal, horas_horario, minutosHoras, tDias, horasDias, horaT, horaTDecimalH;
    this.datosEmpleado.forEach(obj => {
      if (obj.codigo === codigo) {
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
    })
    this.totalPermisos.forEach(obj => {
      if (String(obj.hora_trabaja).length != 1) {
        horas_horario = obj.hora_trabaja + ':00:00'
      }
      else {
        horas_horario = '0' + obj.hora_trabaja + ':00:00'
      }

      if (obj.estado === 'Autorizado') {
        var hora1 = (obj.hora_numero).split(":");
        var t1 = new Date();
        t1.setHours(parseInt(hora1[0]), parseInt(hora1[1]), parseInt(hora1[2]));
        var minTDecimal = (t1.getSeconds() * 60) + t1.getMinutes();
        horas_decimal = (minTDecimal / 60) + t1.getHours();
        var hTrabajo = (horas_horario).split(":")
        var t3 = new Date();
        t3.setHours(parseInt(hTrabajo[0]), parseInt(hTrabajo[1]), parseInt(hTrabajo[2]));
        var minTDecimalH = (t3.getSeconds() * 60) + t3.getMinutes();
        horaTDecimalH = (minTDecimalH / 60) + t3.getHours();
        horaT = horas_decimal + (horaTDecimalH * obj.dia);
        dias_decimal = horaT / horaTDecimalH;
        totalHoras = totalHoras + horaT;
        totalDias = totalDias + dias_decimal;
      }
    });
    // REALIZACIÓN DE CÁLCULOS
    minutosHoras = parseFloat('0.' + String(totalHoras).split('.')[1]) * 60;
    tDias = parseFloat('0.' + String(totalDias).split('.')[1]) * horaTDecimalH;
    horasDias = parseFloat('0.' + String(tDias).split('.')[1]) * 60;

    console.log('ver días ', tDias, ' horas ' + horasDias + ' ' + horasDias.toFixed(0))
    // CONTROL DE ESCRITURA DE HORAS Y MINUTOS
    if (parseInt(String(tDias).split('.')[0]) < 10) {
      formatoHoras = '0' + parseInt(String(tDias).split('.')[0]);
    }
    else {
      formatoHoras = String(parseInt(String(tDias).split('.')[0]));
    }

    if (formatoHoras === 'NaN') {
      formatoHoras = '0';
    }

    if (horasDias.toFixed(0) < 10) {
      formatoMinutos = '0' + horasDias.toFixed(0);
    }
    else {
      formatoMinutos = horasDias.toFixed(0);
    }

    if (minutosHoras.toFixed(0) >= 10) {
      minutosHoras = minutosHoras.toFixed(0);
    }
    else {
      minutosHoras = '0' + minutosHoras.toFixed(0);
    }
    // ESTRUCTURA DEL PDF
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
              { text: [{ text: 'N° DE PERMISOS: ' + this.totalPermisos.length, style: 'itemsTableI' }] },
            ]
          }],
          [{
            border: [false, false, false, false],
            table: {
              widths: ['*', '*'],
              body: [
                [
                  { text: 'SUMATORIA TOTAL DE PERMISOS EN DIAS Y HORAS FORMATO DECIMAL', style: 'tableHeaderF' },
                  { text: 'SUMATORIA TOTAL DE PERMISOS EN DIAS Y HORAS FORMATO GENERAL', style: 'tableHeaderF' },
                ],
                [
                  { text: 'TOTAL DE PERMISOS EN DÍAS DECIMAL: ' + totalDias.toFixed(3), style: 'itemsTableS' },
                  { text: 'TOTAL DE DÍAS Y HORAS DE PERMISO: ' + String(totalDias).split('.')[0] + ' días ' + ' ' + formatoHoras + ' horas: ' + formatoMinutos + ' minutos', style: 'itemsTableS' }
                ],
                [
                  { text: 'TOTAL DE PERMISOS EN HORAS DECIMAL: ' + totalHoras.toFixed(3), style: 'itemsTableS' },
                  { text: 'TOTAL DE HORAS Y MINUTOS DE PERMISO: ' + String(totalHoras.toFixed(3)).split('.')[0] + ' horas : ' + minutosHoras + ' minutos', style: 'itemsTableS' }
                ],
              ]
            },
            layout: {
              hLineColor: function (i, node) {
                return (i === 0 || i === node.table.body.length) ? 'rgb(80,87,97)' : 'rgb(80,87,97)';
              },
              paddingLeft: function (i, node) { return 10; },
              paddingRight: function (i, node) { return 10; },
              paddingTop: function (i, node) { return 5; },
              paddingBottom: function (i, node) { return 5; }
            }
          }],
          [{ text: 'LISTA DE PERMISOS', style: 'tableHeader' },],
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
      },
    }
  }

  // ESTRUCTURA DE LISTA DE PERMISOS REGISTRADOS POR EL EMPLEADO
  presentarPermisos() {

    return {
      table: {
        widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*', 'auto', 'auto'],
        body: [
          [
            { text: 'N° PERMISO', style: 'tableHeader' },
            { text: 'SOLICITADO', style: 'tableHeader' },
            { text: 'TIPO', style: 'tableHeader' },
            { text: 'DESDE', style: 'tableHeader' },
            { text: 'HASTA', style: 'tableHeader' },
            { text: 'DD', style: 'tableHeader' },
            { text: 'HH:MM', style: 'tableHeader' },
            { text: 'HH. TRABAJO', style: 'tableHeader' },
            { text: 'ESTADO', style: 'tableHeader' },
            { text: 'REVISADO POR', style: 'tableHeader' },
            { text: 'HORAS', style: 'tableHeader' },
            { text: 'DÍAS', style: 'tableHeader' },
          ],

          ...this.totalPermisos.map(obj => {
            var horas_decimal, dias_decimal, horaT, trabaja;
            // FORMATO DE HORAS:MINUTOS:SEGUNDOS
            if (String(obj.hora_trabaja).length != 1) {
              trabaja = obj.hora_trabaja + ':00:00'
            }
            else {
              trabaja = '0' + obj.hora_trabaja + ':00:00'
            }
            if (obj.estado === 'Autorizado') {
              // REALIZACIÓN DE CÁLCULOS
              var hora1 = (obj.hora_numero).split(":");
              var t1 = new Date();
              t1.setHours(parseInt(hora1[0]), parseInt(hora1[1]), parseInt(hora1[2]));
              var minTDecimal = (t1.getSeconds() * 60) + t1.getMinutes();
              horas_decimal = (minTDecimal / 60) + t1.getHours();
              var hTrabajo = (trabaja).split(":")
              var t3 = new Date();
              t3.setHours(parseInt(hTrabajo[0]), parseInt(hTrabajo[1]), parseInt(hTrabajo[2]));
              var minTDecimalH = (t3.getSeconds() * 60) + t3.getMinutes();
              var horaTDecimalH = (minTDecimalH / 60) + t3.getHours();
              horaT = horas_decimal + (horaTDecimalH * obj.dia);
              dias_decimal = horaT / horaTDecimalH;
              horaT = horaT.toFixed(3);
              dias_decimal = dias_decimal.toFixed(3);
            }
            return [
              { text: obj.num_permiso, style: 'itemsTableD' },
              { text: moment(obj.fec_creacion).format("DD/MM/YYYY"), style: 'itemsTableD' },
              { text: obj.tipo, style: 'itemsTableD' },
              { text: String(moment(obj.fec_inicio, "YYYY/MM/DD").format("DD/MM/YYYY")), style: 'itemsTableD' },
              { text: String(moment(obj.fec_final, "YYYY/MM/DD").format("DD/MM/YYYY")), style: 'itemsTableD' },
              { text: obj.dia, style: 'itemsTableD' },
              { text: obj.hora_numero, style: 'itemsTableD' },
              { text: trabaja, style: 'itemsTableD' },
              { text: obj.estado, style: 'itemsTableD' },
              { text: obj.autorizado_por, style: 'itemsTable' },
              { text: horaT, style: 'itemsTableD' },
              { text: dias_decimal, style: 'itemsTableD' },
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

  // GENERACIÓN DE PDF AL NO CONTAR CON REGISTROS 

  PDF_Vacio(action = 'open', codigo, form) {
    const documentDefinition = this.GenerarSinRegstros(codigo, form);

    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(); break;

      default: pdfMake.createPdf(documentDefinition).open(); break;
    }

  }

  GenerarSinRegstros(codigo: any, form) {

    sessionStorage.setItem('Administrador', this.empleadoLogueado);

    return {
      // ENCABEZADO DE LA PAGINA
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: {
        text: 'Impreso por:  ' + this.empleadoLogueado[0].nombre + ' ' +
          this.empleadoLogueado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right'
      },
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
                text: '© Pag ' + currentPage.toString() + ' of ' + pageCount, alignment: 'right', opacity: 0.3
              }],
            }
          ], fontSize: 10
        }
      },
      content: [
        { image: this.logo, width: 150, margin: [10, -25, 0, 5] },
        ...this.datosEmpleado.map(obj => {
          if (obj.codigo === codigo) {
            return [
              { text: obj.empresa.toUpperCase(), bold: true, fontSize: 25, alignment: 'center', margin: [0, 50, 0, 5] },
              { text: 'REPORTE GENERAL DE PERMISOS', fontSize: 17, alignment: 'center', margin: [0, 0, 0, 5] },
            ];
          }
        }),
        this.presentarDatosEmpleado(codigo, form)
      ],
      // ESTILOS DEL ARCHIVO PDF
      styles: {
        tableHeader: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTableI: { fontSize: 9, alignment: 'left', margin: [50, 0, 5, 0] },
        itemsTableP: { fontSize: 9, alignment: 'left', bold: true, margin: [50, 0, 5, 0] },
      }
    };
  }

  // DATOS GENERALES DEL PDF Y SUMATORIA TOTAL DE CALCULOS REALIZADOS
  presentarDatosEmpleado(codigo, form) {
    // INICIALIZACIÓN DE VARIBLES
    var ciudad, nombre, apellido, cedula, codigo, sucursal, departamento, cargo, regimen;
    // BUSQUEDA DE LOS DATOS DEL EMPLEADO DEL CUAL SE OBTIENE EL REPORTE
    this.datosEmpleado.forEach(obj => {
      if (obj.codigo === codigo) {
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
    if (form.inicioForm != '' && form.inicioForm != null &&
      form.finalForm != '' && form.finalForm != null) {
      var informacion = 'PERIODO DEL: ' + String(moment(form.inicioForm).format("DD/MM/YYYY")) + ' AL ' + String(moment(form.finalForm).format("DD/MM/YYYY"));
    }
    else {
      informacion = 'PERMISOS'
    }
    return {
      table: {
        widths: ['*'],
        body: [
          [{ text: 'INFORMACIÓN GENERAL EMPLEADO', style: 'tableHeader' },],
          [{
            columns: [
              { text: [{ text: informacion, style: 'itemsTableP' }] },
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
          [{ text: 'NO EXISTEN REGISTROS DE PERMISOS', style: 'tableHeader' },],
        ]
      },
      layout: {
        hLineColor: function (i, node) {
          return (i === 0 || i === node.table.body.length) ? 'rgb(80,87,97)' : 'rgb(80,87,97)';
        },
        paddingLeft: function (i, node) { return 30; },
        paddingRight: function (i, node) { return 30; },
        paddingTop: function (i, node) { return 10; },
        paddingBottom: function (i, node) { return 10; }
      }
    }
  }

  /* ****************************************************************************************************
   *                               PARA LA EXPORTACION DE ARCHIVOS EXCEL
   * ****************************************************************************************************/

  exportToExcel(id_empleado, form) {
    var totalDias = 0, totalHoras = 0, formatoHoras = '0', formatoMinutos;
    var horas_decimal, dias_decimal, horas_horario, minutosHoras, tDias, horasDias, horaT, horaTDecimalH;

    this.totalPermisos.forEach(obj => {
          if (obj.estado === 'Autorizado') {
            var hora1 = (obj.hora_numero).split(":");
            var t1 = new Date();
            t1.setHours(parseInt(hora1[0]), parseInt(hora1[1]), parseInt(hora1[2]));
            var minTDecimal = (t1.getSeconds() * 60) + t1.getMinutes();
            horas_decimal = (minTDecimal / 60) + t1.getHours();
            if (String(obj.hora_trabaja).length != 1) {
              horas_horario = obj.hora_trabaja + ':00:00'
            }
            else {
              horas_horario = '0' + obj.hora_trabaja + ':00:00'
            }
            var hTrabajo = (horas_horario).split(":")
            var t3 = new Date();
            t3.setHours(parseInt(hTrabajo[0]), parseInt(hTrabajo[1]), parseInt(hTrabajo[2]));
            var minTDecimalH = (t3.getSeconds() * 60) + t3.getMinutes();
            horaTDecimalH = (minTDecimalH / 60) + t3.getHours();
            horaT = horas_decimal + (horaTDecimalH * obj.dia);
            dias_decimal = horaT / horaTDecimalH;
            totalHoras = totalHoras + horaT;
            totalDias = totalDias + dias_decimal;
          }
    });
    // Realización de cálculos
    minutosHoras = parseFloat('0.' + String(totalHoras).split('.')[1]) * 60;
    tDias = parseFloat('0.' + String(totalDias).split('.')[1]) * horaTDecimalH;
    horasDias = parseFloat('0.' + String(tDias).split('.')[1]) * 60;

    // Control de escritura de horas y minutos
    if (parseInt(String(tDias).split('.')[0]) < 10) {
      formatoHoras = '0' + parseInt(String(tDias).split('.')[0]);
    }
    else {
      formatoHoras = String(parseInt(String(tDias).split('.')[0]));
    }

    if (formatoHoras === 'NaN') {
      formatoHoras = '0';
    }

    if (horasDias.toFixed(0) < 10) {
      formatoMinutos = '0' + horasDias.toFixed(0);
    }
    else {
      formatoMinutos = horasDias.toFixed(0);
    }

    if (minutosHoras.toFixed(0) >= 10) {
      minutosHoras = minutosHoras.toFixed(0);
    }
    else {
      minutosHoras = '0' + minutosHoras.toFixed(0);
    }
    for (var i = 0; i <= this.datosEmpleado.length - 1; i++) {
      if (this.datosEmpleado[i].codigo === id_empleado) {
        var datosEmpleado: any = [{
          CODIGO: this.datosEmpleado[i].codigo,
          NOMBRE: this.datosEmpleado[i].nombre,
          APELLIDO: this.datosEmpleado[i].apellido,
          CEDULA: this.datosEmpleado[i].cedula,
          SUCURSAL: this.datosEmpleado[i].sucursal,
          DEPARTAMENTO: this.datosEmpleado[i].departamento,
          CIUDAD: this.datosEmpleado[i].ciudad,
          CARGO: this.datosEmpleado[i].cargo,
          REGIMEN: this.datosEmpleado[i].regimen,
          TOTAL_PERMISOS_DIAS_DECIMAL: parseFloat(totalDias.toFixed(3)),
          TOTAL_PERMISOS_HORAS_DECIMAL: parseFloat(totalHoras.toFixed(3)),
        }]
        break;
      }
    }
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(datosEmpleado);

    const headerE = Object.keys(datosEmpleado[0]); // columns name

    var wscolsE : any = [];
    for (var i = 0; i < headerE.length; i++) {  // columns length added
      wscolsE.push({ wpx: 115 })
    }
    wse["!cols"] = wscolsE;

    const wsp: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.totalPermisos.map(obj => {
      var estado = '', horas_decimal, dias_decimal, horaT, trabaja, empleadoAutoriza = '';
          if (obj.estado === 'Autorizado') {
            empleadoAutoriza = obj.autorizado_por;
            // Realización de cálculos
            var hora1 = (obj.hora_numero).split(":");
            var t1 = new Date();
            t1.setHours(parseInt(hora1[0]), parseInt(hora1[1]), parseInt(hora1[2]));
            var minTDecimal = (t1.getSeconds() * 60) + t1.getMinutes();
            horas_decimal = (minTDecimal / 60) + t1.getHours();

            // Obtención de las horas de trabajo en días
            if (String(obj.hora_trabaja).length != 1) {
              trabaja = obj.hora_trabaja + ':00:00'
            }
            else {
              trabaja = '0' + obj.hora_trabaja + ':00:00'
            }
            var hTrabajo = (trabaja).split(":")
            var t3 = new Date();
            t3.setHours(parseInt(hTrabajo[0]), parseInt(hTrabajo[1]), parseInt(hTrabajo[2]));
            var minTDecimalH = (t3.getSeconds() * 60) + t3.getMinutes();
            var horaTDecimalH = (minTDecimalH / 60) + t3.getHours();
            horaT = horas_decimal + (horaTDecimalH * obj.dia);
            dias_decimal = horaT / horaTDecimalH;
            horaT = horaT.toFixed(3);
            dias_decimal = dias_decimal.toFixed(3);
          }
          else {
            empleadoAutoriza = obj.autorizado_por;
            horaT = 0.000;
            dias_decimal = 0.000;
          }
      return {
        N_PERMISO: obj.num_permiso,
        FECHA_CREACION: moment(obj.fec_creacion).format("DD/MM/YYYY"),
        NOMBRE_PERMISO: obj.tipo,
        FECHA_INICIAL: String(moment(obj.fec_inicio, "YYYY/MM/DD").format("DD/MM/YYYY")),
        FECHA_FINAL: String(moment(obj.fec_final, "YYYY/MM/DD").format("DD/MM/YYYY")),
        DIAS_PERMISO: obj.dia,
        HORAS_PERMISO: obj.hora_numero,
        HORAS_LABORABLES: trabaja,
        ESTADO: obj.estado,
        EMPLEADO_AUTORIZA: empleadoAutoriza,
        HORAS_TOTALES_DECIMAL: parseFloat(horaT),
        DIAS_TOTALES_DECIMAL: parseFloat(dias_decimal),
      };
    }));

    const header = Object.keys(this.totalPermisos[0]); // NOMBRE DE LAS COLUMNAS

    var wscols : any = [];
    for (var i = 0; i < header.length; i++) {  // NÚMERO DE COLUMNAS AÑADIDAS
      wscols.push({ wpx: 125 })
    }
    wsp["!cols"] = wscols;

    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wse, 'Empleado');
    xlsx.utils.book_append_sheet(wb, wsp, 'Permisos');
    if (form.inicioForm === '' || form.finalForm === '') {
      var f = moment();
      xlsx.writeFile(wb, "Permisos - " + f.format('YYYY-MM-DD') + '.xlsx');
    }
    else {
      xlsx.writeFile(wb, "Permisos - " + String(moment(form.inicioForm, "YYYY/MM/DD").format("DD/MM/YYYY")) + ' - ' + String(moment(form.finalForm, "YYYY/MM/DD").format("DD/MM/YYYY")) + '.xlsx');
    }
  }

  /*FILTROS DE BUSQUEDA*/
  sucursales: any = [];
  ListarSucursales() {
    this.sucursales = [];
    this.restSucur.BuscarSucursal().subscribe(res => {
      this.sucursales = res;
    });
  }

  departamentos: any = [];
  ListarDepartamentos() {
    this.departamentos = [];
    this.restGeneralepa.ConsultarDepartamentos().subscribe(res => {
      this.departamentos = res;
    });
  }

  cargos: any = [];
  ListarCargos() {
    this.cargos = [];
    this.restCargo.ObtenerTipoCargos().subscribe(res => {
      this.cargos = res;
    });
  }

  regimen: any = [];
  ListarRegimen() {
    this.regimen = [];
    this.restRegimen.ConsultarRegimen().subscribe(res => {
      this.regimen = res;
    });
  }

  LimpiarBusquedas() {
    this.busquedasForm.patchValue(
      {
        laboralForm: '',
        depaForm: '',
        cargosForm: '',
        sucursalForm: ''
      })
    this.VerDatosEmpleado();
    this.ListarSucursales();
    this.ListarDepartamentos();
    this.ListarCargos();
    this.ListarRegimen();
  }

  LimpiarCampos1() {
    this.busquedasForm.patchValue(
      {
        laboralForm: '',
        depaForm: '',
        cargosForm: ''
      })
  }

  LimpiarCampos2() {
    this.busquedasForm.patchValue(
      {
        depaForm: '',
        cargosForm: ''
      })
  }

  LimpiarCampos3() {
    this.busquedasForm.patchValue(
      { cargosForm: '' })
  }


  FiltrarSucursal(form: any) {
    this.departamentos = [];
    this.restGeneralepa.BuscarDepartamentoSucursal(form.sucursalForm).subscribe(res => {
      this.departamentos = res;
    });
    this.cargos = [];
    this.restCargo.ObtenerCargoSucursal(form.sucursalForm).subscribe(res => {
      this.cargos = res;
    }, error => {
      this.toastr.info('La sucursal seleccionada no cuenta con cargos registrados.', 'Verificar la Información', {
        timeOut: 3000,
      })
    });
    this.regimen = [];
    this.restRegimen.ConsultarRegimenSucursal(form.sucursalForm).subscribe(res => {
      this.regimen = res;
    });
    this.LimpiarCampos1();
  }

  FiltrarRegimen(form: any) {
    this.cargos = [];
    this.restCargo.ObtenerCargoRegimen(form.laboralForm).subscribe(res => {
      this.cargos = res;
    }, error => {
      this.toastr.info('El regimen seleccionado no cuenta con cargos registrados.', 'Verificar la Información', {
        timeOut: 3000,
      })
    });
    this.departamentos = [];
    this.restGeneralepa.BuscarDepartamentoRegimen(form.laboralForm).subscribe(res => {
      this.departamentos = res;
    });
    this.LimpiarCampos2();
  }

  FiltrarDepartamento(form: any) {
    this.cargos = [];
    this.restCargo.ObtenerCargoDepartamento(form.depaForm).subscribe(res => {
      this.cargos = res;
    }, error => {
      this.toastr.info('El departamento seleccionado no cuenta con cargos registrados.', 'Verificar la Información', {
        timeOut: 3000,
      })
    });
    this.LimpiarCampos3();
  }

  /*
  VerInformacionSucursal(form: any) {
    this.datosEmpleado = [];
    this.restGeneral.VerDatosSucursal(form.sucursalForm).subscribe(res => {
      this.datosEmpleado = res;
    }, error => {
      this.toastr.error('Ningún dato coincide con los criterios de búsqueda indicados.', 'Verficar Información', {
        timeOut: 6000,
      })
    });
  }

  VerInformacionSucuDepa(form: any) {
    this.datosEmpleado = [];
    this.restGeneral.VerDatosSucuDepa(form.sucursalForm, form.depaForm).subscribe(res => {
      this.datosEmpleado = res;
    }, error => {
      this.toastr.error('Ningún dato coincide con los criterios de búsqueda indicados.', 'Verficar Información', {
        timeOut: 6000,
      })
    });
  }

  VerInformacionSucuDepaRegimen(form: any) {
    this.datosEmpleado = [];
    this.restGeneral.VerDatosSucuDepaRegimen(form.sucursalForm, form.depaForm, form.laboralForm).subscribe(res => {
      this.datosEmpleado = res;
    }, error => {
      this.toastr.error('Ningún dato coincide con los criterios de búsqueda indicados.', 'Verficar Información', {
        timeOut: 6000,
      })
    });
  }

  VerInformacionSucuCargo(form: any) {
    this.datosEmpleado = [];
    this.restGeneral.VerDatosSucuCargo(form.sucursalForm, form.cargosForm).subscribe(res => {
      this.datosEmpleado = res;
    }, error => {
      this.toastr.error('Ningún dato coincide con los criterios de búsqueda indicados.', 'Verficar Información', {
        timeOut: 6000,
      })
    });
  }

  VerInformacionSucuRegimen(form: any) {
    this.datosEmpleado = [];
    this.restGeneral.VerDatosSucuRegimen(form.sucursalForm, form.laboralForm).subscribe(res => {
      this.datosEmpleado = res;
    }, error => {
      this.toastr.error('Ningún dato coincide con los criterios de búsqueda indicados.', 'Verficar Información', {
        timeOut: 6000,
      })
    });
  }

  VerInformacionSucuRegimenCargo(form: any) {
    this.datosEmpleado = [];
    this.restGeneral.VerDatosSucuRegimenCargo(form.sucursalForm, form.laboralForm, form.cargosForm).subscribe(res => {
      this.datosEmpleado = res;
    }, error => {
      this.toastr.error('Ningún dato coincide con los criterios de búsqueda indicados.', 'Verficar Información', {
        timeOut: 6000,
      })
    });
  }

  VerInformacionSucuDepaCargo(form: any) {
    this.datosEmpleado = [];
    this.restGeneral.VerDatosSucuDepaCargo(form.sucursalForm, form.depaForm, form.cargosForm).subscribe(res => {
      this.datosEmpleado = res;
    }, error => {
      this.toastr.error('Ningún dato coincide con los criterios de búsqueda indicados.', 'Verficar Información', {
        timeOut: 6000,
      })
    });
  }

  VerInformacionSucuDepaCargoRegimen(form: any) {
    this.datosEmpleado = [];
    this.restGeneral.VerDatosSucuRegimenDepartamentoCargo(form.sucursalForm, form.depaForm, form.laboralForm, form.cargosForm).subscribe(res => {
      this.datosEmpleado = res;
    }, error => {
      this.toastr.error('Ningún dato coincide con los criterios de búsqueda indicados.', 'Verficar Información', {
        timeOut: 6000,
      })
    });
  }

  VerInformacionDepartamento(form: any) {
    this.datosEmpleado = [];
    this.restGeneral.VerDatosDepartamento(form.depaForm).subscribe(res => {
      this.datosEmpleado = res;
    }, error => {
      this.toastr.error('Ningún dato coincide con los criterios de búsqueda indicados.', 'Verficar Información', {
        timeOut: 6000,
      })
    });
  }

  VerInformacionDepaCargo(form: any) {
    this.datosEmpleado = [];
    this.restGeneral.VerDatosDepaCargo(form.depaForm, form.cargosForm).subscribe(res => {
      this.datosEmpleado = res;
    }, error => {
      this.toastr.error('Ningún dato coincide con los criterios de búsqueda indicados.', 'Verficar Información', {
        timeOut: 6000,
      })
    });
  }

  VerInformacionDepaRegimen(form: any) {
    this.datosEmpleado = [];
    this.restGeneral.VerDatosDepaRegimen(form.depaForm, form.laboralForm).subscribe(res => {
      this.datosEmpleado = res;
    }, error => {
      this.toastr.error('Ningún dato coincide con los criterios de búsqueda indicados.', 'Verficar Información', {
        timeOut: 6000,
      })
    });
  }

  VerInformacionDepaRegimenCargo(form: any) {
    this.datosEmpleado = [];
    this.restGeneral.VerDatosDepaRegimenCargo(form.depaForm, form.laboralForm, form.cargosForm).subscribe(res => {
      this.datosEmpleado = res;
    }, error => {
      this.toastr.error('Ningún dato coincide con los criterios de búsqueda indicados.', 'Verficar Información', {
        timeOut: 6000,
      })
    });
  }

  VerInformacionRegimen(form: any) {
    this.datosEmpleado = [];
    this.restGeneral.VerDatosRegimen(form.laboralForm).subscribe(res => {
      this.datosEmpleado = res;
    }, error => {
      this.toastr.error('Ningún dato coincide con los criterios de búsqueda indicados.', 'Verficar Información', {
        timeOut: 6000,
      })
    });
  }

  VerInformacionRegimenCargo(form: any) {
    this.datosEmpleado = [];
    this.restGeneral.VerDatosRegimenCargo(form.laboralForm, form.cargosForm).subscribe(res => {
      this.datosEmpleado = res;
    }, error => {
      this.toastr.error('Ningún dato coincide con los criterios de búsqueda indicados.', 'Verficar Información', {
        timeOut: 6000,
      })
    });
  }

  VerInformacionCargo(form: any) {
    this.datosEmpleado = [];
    this.restGeneral.VerDatosCargo(form.cargosForm).subscribe(res => {
      this.datosEmpleado = res;
    }, error => {
      this.toastr.error('Ningún dato coincide con los criterios de búsqueda indicados.', 'Verficar Información', {
        timeOut: 6000,
      })
    });
  }
  */

  VerificarBusquedas(form: any) {
    console.log('form', form.depaForm, form.sucursalForm, form.cargosForm, form.laboralForm)
   /* if (form.sucursalForm === '' && form.depaForm === '' &&
      form.laboralForm === '' && form.cargosForm === '') {
      this.toastr.info('Ingresar un criterio de búsqueda.', 'Verficar Información', {
        timeOut: 6000,
      })
    }
    else if (form.sucursalForm != '' && form.depaForm === '' &&
      form.laboralForm === '' && form.cargosForm === '') {
      this.VerInformacionSucursal(form);
    }
    else if (form.sucursalForm != '' && form.depaForm != '' &&
      form.laboralForm === '' && form.cargosForm === '') {
      this.VerInformacionSucuDepa(form);
    }
    else if (form.sucursalForm != '' && form.depaForm != '' &&
      form.laboralForm != '' && form.cargosForm === '') {
      this.VerInformacionSucuDepaRegimen(form);
    }
    else if (form.sucursalForm != '' && form.depaForm != '' &&
      form.laboralForm === '' && form.cargosForm != '') {
      this.VerInformacionSucuDepaCargo(form);
    }
    else if (form.sucursalForm != '' && form.depaForm === '' &&
      form.laboralForm === '' && form.cargosForm != '') {
      this.VerInformacionSucuCargo(form);
    }
    else if (form.sucursalForm != '' && form.depaForm === '' &&
      form.laboralForm != '' && form.cargosForm === '') {
      this.VerInformacionSucuRegimen(form);
    }
    else if (form.sucursalForm != '' && form.depaForm === '' &&
      form.laboralForm != '' && form.cargosForm != '') {
      this.VerInformacionSucuRegimenCargo(form);
    }
    else if (form.sucursalForm != '' && form.depaForm != '' &&
      form.laboralForm != '' && form.cargosForm != '') {
      this.VerInformacionSucuDepaCargoRegimen(form);
    }
    else if (form.sucursalForm === '' && form.depaForm != '' &&
      form.laboralForm === '' && form.cargosForm === '') {
      this.VerInformacionDepartamento(form);
    }
    else if (form.sucursalForm === '' && form.depaForm != '' &&
      form.laboralForm === '' && form.cargosForm != '') {
      this.VerInformacionDepaCargo(form);
    }
    else if (form.sucursalForm === '' && form.depaForm != '' &&
      form.laboralForm != '' && form.cargosForm === '') {
      this.VerInformacionDepaRegimen(form);
    }
    else if (form.sucursalForm === '' && form.depaForm != '' &&
      form.laboralForm != '' && form.cargosForm != '') {
      this.VerInformacionDepaRegimenCargo(form);
    }
    else if (form.sucursalForm === '' && form.depaForm === '' &&
      form.laboralForm != '' && form.cargosForm === '') {
      this.VerInformacionRegimen(form);
    }
    else if (form.sucursalForm === '' && form.depaForm === '' &&
      form.laboralForm != '' && form.cargosForm != '') {
      this.VerInformacionRegimenCargo(form);
    }
    else if (form.sucursalForm === '' && form.depaForm === '' &&
      form.laboralForm === '' && form.cargosForm != '') {
      this.VerInformacionCargo(form);
    }*/
  }
  

}
