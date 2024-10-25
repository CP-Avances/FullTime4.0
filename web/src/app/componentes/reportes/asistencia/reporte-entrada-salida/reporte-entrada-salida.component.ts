import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';
import { Validators, FormControl, FormGroup } from '@angular/forms';
import { DateTime } from 'luxon';

import * as xlsx from 'xlsx';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

import { HorasExtrasRealesService } from 'src/app/servicios/reportes/horasExtrasReales/horas-extras-reales.service';
import { EmpleadoHorariosService } from 'src/app/servicios/horarios/empleadoHorarios/empleado-horarios.service';
import { CiudadFeriadosService } from 'src/app/servicios/ciudadFeriados/ciudad-feriados.service';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { ValidacionesService } from '../../../../servicios/validaciones/validaciones.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { ReportesService } from 'src/app/servicios/reportes/reportes.service';
import { FeriadosService } from 'src/app/servicios/catalogos/catFeriados/feriados.service';
import { EntradasSalidas } from 'src/app/model/timbres.model';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';

@Component({
  selector: 'app-reporte-entrada-salida',
  templateUrl: './reporte-entrada-salida.component.html',
  styleUrls: ['./reporte-entrada-salida.component.css'],
})

export class ReporteEntradaSalidaComponent implements OnInit {

  // Datos del Empleado Timbre
  empleado: any = [];

  // Arreglo datos del empleado
  datosEmpleado: any = [];

  // Datos del Formulario de BUSQUEDA
  codigo = new FormControl('');
  cedula = new FormControl('', [Validators.minLength(2)]);
  nombre = new FormControl('', [Validators.minLength(2)]);

  // Datos del Formulario de Periodo
  fechaInicialF = new FormControl('', [Validators.required]);
  fechaFinalF = new FormControl('', [Validators.required]);

  // Formulario de Periodo
  public fechasForm = new FormGroup({
    inicioForm: this.fechaInicialF,
    finalForm: this.fechaFinalF,
  });

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
    public restF: FeriadosService,
    public restCF: CiudadFeriadosService,
    public restEmpre: EmpresaService,
    public restHorario: EmpleadoHorariosService,
    public restD: DatosGeneralesService,
    public router: Router,
    public validacionesService: ValidacionesService,
    private toastr: ToastrService,
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.ObtenerEmpleadoLogueado(this.idEmpleado);
    this.VerDatosEmpleado();
    this.ObtenerFeriados();
    this.ObtenerLogo();
    this.ObtenerColores();
  }

  // METODO PARA VER LA INFORMACION DEL EMPLEADO
  ObtenerEmpleadoLogueado(idemploy: any) {
    this.empleadoLogueado = [];
    this.rest.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleadoLogueado = data;
      console.log('emple', this.empleadoLogueado)
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

  // Evento para menejar el uso de paginación
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // Obtener feriados registrados en el sistema
  feriados: any = [];
  ObtenerFeriados() {
    this.feriados = [];
    this.restF.ConsultarFeriado().subscribe(data => {
      this.feriados = data;
    });
  }

  // Obtener lista de empleados con contrato y cargo
  VerDatosEmpleado() {
    this.datosEmpleado = [];
    this.restD.ListarInformacionActual().subscribe(data => {
      this.datosEmpleado = data;
      console.log('datos_actuales', this.datosEmpleado)
    });
  }

  // METODO para controlar ingreso de periodo de fechas
  fechasPeriodo: any = [];
  inicioDate: any;
  finDate: any
  ciudadFeriados: any = [];
  VerEntradasSalidasEmpleado(id_seleccionado, form, archivo) {
    if (form.inicioForm === '' || form.finalForm === '') {
      this.toastr.info('Ingresar fechas de periodo de BUSQUEDA.', 'VERIFICAR DATOS DE FECHA', {
        timeOut: 6000,
      })
    }
    else {
      if (Date.parse(form.inicioForm) <= Date.parse(form.finalForm)) {
        let fechas = {
          fechaInicio: form.inicioForm,
          fechaFinal: form.finalForm
        }
        this.fechasPeriodo = []; // Array que contiene todas las fechas del mes indicado
        this.inicioDate = DateTime.fromISO(form.inicioForm).toFormat('MM-dd-yyyy');
        this.finDate = DateTime.fromISO(form.finalForm).toFormat('MM-dd-yyyy');

        // Inicializar datos de fecha
        var start = new Date(this.inicioDate);
        var end = new Date(this.finDate);

        // Lógica para obtener el nombre de cada uno de los día del periodo indicado
        while (start <= end) {
          this.fechasPeriodo.push(DateTime.fromISO(start).toFormat('dddd dd/MM/yyyy'));
          var newDate = start.setDate(start.getDate() + 1);
          start = new Date(newDate);
        }
        this.ValidarCiudadFeriado(id_seleccionado, fechas, archivo, form, this.fechasPeriodo);
        //this.VerEntradasSalidasHorario(id_seleccionado, fechas, archivo, form, this.fechasPeriodo);
      }
      else {
        this.toastr.info('La fecha de inicio de Periodo no puede ser posterior a la fecha de fin de Periodo.', 'VERIFICAR', {
          timeOut: 6000,
        });
      }
    }
  }

  feriadosTotales: any = [];
  ValidarCiudadFeriado(id_seleccionado, datosFecha, archivo, form, fechasTotales) {
    this.feriadosTotales = [];
    this.ciudadFeriados = [];
    this.datosEmpleado.map((obj: any) => {
      if (obj.codigo === id_seleccionado) {
        this.restCF.BuscarFeriados(obj.id_ciudad).subscribe(data => {
          this.ciudadFeriados = data;
          this.ciudadFeriados.map(datos => {
            this.feriados.map((element: any) => {
              let datosF = [
                {
                  id: datos.id_feriado,
                  fecha: element.fecha
                }
              ]
              if (datos.id_feriado === element.id) {
                if (this.feriadosTotales.length === 0) {
                  this.feriadosTotales = datosF;
                }
                else {
                  this.feriadosTotales = this.feriadosTotales.concat(datosF);
                }
              }
            })
          })
          console.log('feriados', this.feriadosTotales);
          this.VerEntradasSalidasHorario(id_seleccionado, datosFecha, archivo, form, fechasTotales)
        }, error => {
          this.VerEntradasSalidasHorario(id_seleccionado, datosFecha, archivo, form, fechasTotales);
        })
      }
    })
  }

  // METODO para obtener timbres de entradas y salidas del empleado de acuerdo al horario
  entradaSalidaHorario: Array<EntradasSalidas> = [];
  entradaSalidaPlanificacion: Array<EntradasSalidas> = [];
  totalEntradasSalidas: Array<EntradasSalidas> = [];
  VerEntradasSalidasHorario(id_seleccionado, datosFecha, archivo, form, fechasTotales) {
    this.entradaSalidaHorario = [];
    this.entradaSalidaPlanificacion = [];
    this.totalEntradasSalidas = [];

    this.restR.ObtenerEntradaSalidaHorario(id_seleccionado, datosFecha).subscribe((dataH: any) => {
      this.entradaSalidaHorario = dataH;

      console.log('ver data entrada salida horario', this.entradaSalidaHorario);

      this.VerEntradasSalidasPlanificacion(this.entradaSalidaHorario, id_seleccionado, archivo, datosFecha, form, fechasTotales);

    }, error => {
      this.VerEntradasSalidasPlanificacion(this.entradaSalidaHorario, id_seleccionado, archivo, datosFecha, form, fechasTotales);
    });
  }

  // METODO para obtener timbres de entradas y salidas del empleado de acuerdo a la planificación
  VerEntradasSalidasPlanificacion(entradas_salida_horario: any, codigo: string | number, archivo: string, datos_fechas, form, fechasTotales: any) {
    this.restR.ObtenerEntradaSalidaPlanificacion(codigo, datos_fechas).subscribe((dataP: any) => {
      this.entradaSalidaPlanificacion = dataP;
      if (entradas_salida_horario.length != 0) {
        entradas_salida_horario = entradas_salida_horario.concat(this.entradaSalidaPlanificacion);
        this.totalEntradasSalidas = entradas_salida_horario;

        console.log('ver data entrada salida planificacion true ', this.totalEntradasSalidas)
      }
      else {
        this.totalEntradasSalidas = this.entradaSalidaPlanificacion;

        console.log('ver data entrada salida planificacion false ', this.totalEntradasSalidas)

      }
      // this.totalAtrasos = this.totalAtrasos.sort((a, b) => new Date(a.fec_hora_timbre) > new Date(b.fec_hora_timbre));

      this.GenerarArchivos(codigo, archivo, form, fechasTotales);
      this.LimpiarFechas();
      this.LimpiarCampos();
    }, error => {
      if (entradas_salida_horario.length != 0) {
        this.totalEntradasSalidas = entradas_salida_horario;
        // console.log('prueba2', this.totalEntradasSalidas);
        //  this.totalAtrasos = this.totalAtrasos.sort((a, b) => new Date(a.fec_hora_timbre) > new Date(b.fec_hora_timbre));
        this.GenerarArchivos(codigo, archivo, form, fechasTotales);
        this.LimpiarFechas();
        this.LimpiarCampos();
      }
      else {
        this.toastr.info('En el periodo indicado el empleado no tiene registros de Timbres.', 'Dar click aquí, para obtener reporte, en el que se indica que no existen registros.', {
          timeOut: 10000,
        }).onTap.subscribe(obj => {
          if (archivo === 'pdf') {
            this.PDF_Vacio('open', codigo, form);
            this.LimpiarFechas();
          }
        });
      }
    })
  }

  // Generación de reportes en formatos PDF - EXCEL
  empleadoHorario: any = [];
  empleadoPlan: any = [];
  GenerarArchivos(codigo: string | number, archivo: string, form, fechasTotales: any) {
    let fechas = {
      fechaInicio: form.inicioForm,
      fechaFinal: form.finalForm
    }
    this.empleadoHorario = [];
    this.empleadoPlan = [];

    // BUSQUEDA de la lista de los horarios del empleado
    this.restHorario.ObtenerHorariosFechasEmpleado(codigo, fechas).subscribe(data => {
      this.empleadoHorario = data;
      console.log('horario', this.empleadoHorario);
      // BUSQUEDA de la lista de las planificaciones del empleado
      /*this.restPlan.ObtenerPlanHorarioEmpleadoFechas(codigo, fechas).subscribe(dataP => {
        this.empleadoPlan = dataP;
        console.log('plan', this.empleadoPlan);
        // Llamado a ver archivos
        this.VerArchivos(codigo, archivo, form, fechasTotales);

      }, error => {
        // Llamado a ver archivos cuando no existe horarios de planificación del empleado
        this.VerArchivos(codigo, archivo, form, fechasTotales);
      })*/

    }, error => {
      // BUSQUEDA de la lista de las planificaciones del empleado
      /* this.restPlan.ObtenerPlanHorarioEmpleadoFechas(codigo, fechas).subscribe(dataP => {
         this.empleadoPlan = dataP;
         console.log('plan', this.empleadoPlan);
         // Llamado a ver archivos
         this.VerArchivos(codigo, archivo, form, fechasTotales);
 
       }, error => {
         // Llamado a ver archivos cuando no existe horarios de planifiación del empleado
         this.VerArchivos(codigo, archivo, form, fechasTotales);
       })*/
    })
  }

  VerArchivos(codigo, archivo, form, fechasTotales) {
    if (archivo === 'pdf') {
      this.generarPdf('open', codigo, form, fechasTotales);
    }
    else if (archivo === 'excel') {
      this.exportToExcel(codigo, form, fechasTotales);
    }
  }

  // METODO para ingresar solo letras
  IngresarSoloLetras(e) {
    return this.validacionesService.IngresarSoloLetras(e);
  }

  // METODO PARA INGRESAR SOLO NUMEROS
  IngresarSoloNumeros(evt) {
    return this.validacionesService.IngresarSoloNumeros(evt);

  }

  // METODO para limpiar campos de BUSQUEDA
  LimpiarCampos() {
    this.codigo.reset();
    this.cedula.reset();
    this.nombre.reset();
  }

  // METODO para limpiar campos de fecha
  LimpiarFechas() {
    this.fechaInicialF.reset();
    this.fechaFinalF.reset();
  }

  /* ****************************************************************************************************
   *                               PARA LA EXPORTACION DE ARCHIVOS PDF
   * ****************************************************************************************************/

  generarPdf(action = 'open', id_seleccionado, form, fechasTotales: any) {
    const documentDefinition = this.DefinirInformacionPDF(id_seleccionado, form, fechasTotales);

    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(); break;

      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  DefinirInformacionPDF(id_seleccionado: number, form, fechasTotales: any) {

    sessionStorage.setItem('Administrador', this.empleadoLogueado);

    return {
      // ENCABEZADO DE LA PAGINA
      pageOrientation: 'landscape',
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleadoLogueado[0].nombre + ' ' + this.empleadoLogueado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },

      // PIE DE PAGINA
      footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
        let f = DateTime.now();
        fecha = f.toFormat('yyyy-MM-dd');
        let time = f.toFormat('HH:mm:ss');
        return [
          {
            table: {
              widths: ['auto', 'auto', 'auto'],
              body: [
                [
                  { text: 'Glosario de Términos: ', bold: true, border: [false, false, false, false], style: ['quote', 'small'] },
                  { text: 'ALM = ', bold: true, border: [false, false, false, false], style: ['quote', 'small'] },
                  { text: 'Almuerzo ', border: [false, false, false, false], style: ['quote', 'small'] },
                ]
              ]
            }
          },
          {
            margin: [10, -2, 10, 0],
            columns: [
              {
                text: [{
                  text: 'Fecha: ' + fecha + ' Hora: ' + time, alignment: 'left', opacity: 0.3
                }]
              },
              { text: [{ text: '© Pag ' + currentPage.toString() + ' de ' + pageCount, alignment: 'right', opacity: 0.3 }], }
            ], fontSize: 9
          }
        ]
      },
      // Título e imagen del archivo PDF - Contenido del archivo
      content: [
        { image: this.logo, width: 150, margin: [10, -25, 0, 5] },
        ...this.datosEmpleado.map((obj: any) => {
          if (obj.codigo === id_seleccionado) {
            return [
              {
                text: obj.empresa.toUpperCase(),
                bold: true, fontSize: 25, alignment: 'center', margin: [0, -30, 0, 5]
              },
              {
                text: 'REPORTE ENTRADAS - SALIDAS',
                fontSize: 17, alignment: 'center', margin: [0, 0, 0, 5]
              },
            ];
          }
        }),
        this.presentarDatosGenerales(id_seleccionado, form, fechasTotales),
        this.presentarEntradasSalidas(fechasTotales),
      ],

      // Estilos del archivo PDF
      styles: {
        tableHeader: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTableD: { fontSize: 8, alignment: 'center' },
        itemsTableI: { fontSize: 9, alignment: 'left', margin: [50, 5, 5, 5] },
        itemsTableP: { fontSize: 9, alignment: 'left', bold: true, margin: [50, 5, 5, 5] },
        tableHeaderESC: { fontSize: 9, bold: true, alignment: 'center', fillColor: this.s_color },
        tableHeaderES: { fontSize: 9, bold: true, alignment: 'center', fillColor: this.p_color },
        centrado: { fontSize: 9, bold: true, alignment: 'center', fillColor: this.p_color, margin: [0, 10, 0, 10] },
        quote: { margin: [5, -2, 0, -2], italics: true },
        small: { fontSize: 9, opacity: 0.3 }
      }
    };
  }

  // Estructura de los datos generales del empleado
  presentarDatosGenerales(id_seleccionado, form, fechasTotales) {
    var ciudad, nombre, apellido, cedula, codigo, sucursal, departamento, cargo, regimen;
    this.datosEmpleado.forEach((obj: any) => {
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
    })
    var diaI = DateTime.fromISO(form.inicioForm).weekday;
    var diaF = DateTime.fromISO(form.finalForm).weekday;
    return {
      table: {
        widths: ['*'],
        body: [
          [{ text: 'INFORMACIÓN GENERAL EMPLEADO', style: 'tableHeader' },],
          [{
            columns: [
              { text: [{ text: 'CIUDAD: ' + ciudad, style: 'itemsTableI' }] },
              { text: [{ text: '', style: 'itemsTableI' }] },
              { text: [{ text: 'PERIODO DEL: ' + DateTime.fromFormat(form.inicioForm, 'yyyy/MM/dd').toFormat('dd/MM/yyyy') + ' AL ' + DateTime.fromFormat(form.finalForm, 'yyyy/MM/dd').toFormat('dd/MM/yyyy'), style: 'itemsTableP' }] },
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
              { text: [{ text: 'N° REGISTROS: ' + fechasTotales.length, style: 'itemsTableI' }] },
            ]
          }],
          [{
            text: 'LISTA DE ENTRADAS - SALIDAS PERIODO DEL ' +
              DateTime.fromObject({ weekday: diaI }).toFormat('cccc').toUpperCase() + ' ' +
              DateTime.fromFormat(form.inicioForm, "yyyy/MM/dd").toFormat("dd/MM/yyyy") +
              ' AL ' +
              DateTime.fromObject({ weekday: diaF }).toFormat('cccc').toUpperCase() + ' ' +
              DateTime.fromFormat(form.finalForm, "yyyy/MM/dd").toFormat("dd/MM/yyyy"),
            style: 'tableHeader'
          },],]
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

  IterarFeriados(day, dayFecha): any {
    var estado = '';
    var fechaPlan;

    // Buscar dias en la lista de planificacion del empleado
    if (this.empleadoPlan.length != 0) {
      for (var k = 0; k <= this.empleadoPlan.length - 1; k++) {
        fechaPlan = DateTime.fromISO(this.empleadoPlan[k].fecha_dia).toFormat('dd/MM/yyyy');
        if (dayFecha === fechaPlan) {
          if (this.empleadoPlan[k].tipo_dia === 1) {
            estado = 'Libre';
          }
          else if (this.empleadoPlan[k].tipo_dia === 2) {
            estado = 'Feriado';
          }
          break;
        }
        else {
          // Buscar días en la lista del horario del empleado
          if (this.empleadoHorario.length != 0) {
            for (var j = 0; j <= this.empleadoHorario.length - 1; j++) {
              if (day === 'Lunes' && this.empleadoHorario[j].lunes === true) {
                estado = 'Libre';
                break;
              }
              else if (day === 'Martes' && this.empleadoHorario[j].martes === true) {
                estado = 'Libre';
                break;
              }
              else if (day === 'Miercoles' && this.empleadoHorario[j].miercoles === true) {
                estado = 'Libre';
                break;
              }
              else if (day === 'Jueves' && this.empleadoHorario[j].jueves === true) {
                estado = 'Libre';
                break;
              }
              else if (day === 'Viernes' && this.empleadoHorario[j].viernes === true) {
                estado = 'Libre';
                break;
              }
              else if (day === 'Sabado' && this.empleadoHorario[j].sabado === true) {
                estado = 'Libre';
                break;
              }
              else if (day === 'Domingo' && this.empleadoHorario[j].domingo === true) {
                estado = 'Libre';
                break;
              }
            }
          }
        }
      }
      return estado;
    }
    else {
      // Buscar días en la lista del horario del empleado
      if (this.empleadoHorario.length != 0) {
        for (var j = 0; j <= this.empleadoHorario.length - 1; j++) {
          if (day === 'Lunes' && this.empleadoHorario[j].lunes === true) {
            estado = 'Libre';
            break;
          }
          else if (day === 'Martes' && this.empleadoHorario[j].martes === true) {
            estado = 'Libre';
            break;
          }
          else if (day === 'Miercoles' && this.empleadoHorario[j].miercoles === true) {
            estado = 'Libre';
            break;
          }
          else if (day === 'Jueves' && this.empleadoHorario[j].jueves === true) {
            estado = 'Libre';
            break;
          }
          else if (day === 'Viernes' && this.empleadoHorario[j].viernes === true) {
            estado = 'Libre';
            break;
          }
          else if (day === 'Sabado' && this.empleadoHorario[j].sabado === true) {
            estado = 'Libre';
            break;
          }
          else if (day === 'Domingo' && this.empleadoHorario[j].domingo === true) {
            estado = 'Libre';
            break;
          }
        }
        return estado;
      }
    }
  }

  contadorRegistros: number = 0;
  // Lista de registros de entradas y salidas
  presentarEntradasSalidas(fechasTotales: any) {
    this.contadorRegistros = 0;
    return {
      table: {
        widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*', '*', 'auto', '*', '*', 'auto', 'auto', 'auto', 'auto'],
        body: [
          [
            { rowSpan: 2, text: 'N° REGISTROS', style: 'centrado' },
            { rowSpan: 2, text: 'DÍA', style: 'centrado' },
            { rowSpan: 2, text: 'FECHA', style: 'centrado' },
            { colSpan: 2, text: 'ENTRADA', style: 'tableHeaderES' },
            '',
            { rowSpan: 2, text: 'ESTADO', style: 'centrado' },
            { colSpan: 2, text: 'SALIDA ALM.', style: 'tableHeaderES' },
            '',
            { rowSpan: 2, text: 'ESTADO', style: 'centrado' },
            { colSpan: 2, text: 'ENTRADA ALM.', style: 'tableHeaderES' },
            '',
            { rowSpan: 2, text: 'ESTADO', style: 'centrado' },
            { colSpan: 2, text: 'SALIDA', style: 'tableHeaderES' },
            '',
            { rowSpan: 2, text: 'ESTADO', style: 'centrado' },
          ],
          [
            '', '', '',
            { text: 'HORARIO', style: 'tableHeaderES' },
            { text: 'TIMBRE', style: 'tableHeaderESC' },
            '',
            { text: 'HORARIO', style: 'tableHeaderES' },
            { text: 'TIMBRE', style: 'tableHeaderESC' },
            '',
            { text: 'HORARIO', style: 'tableHeaderES' },
            { text: 'TIMBRE', style: 'tableHeaderESC' },
            '',
            { text: 'HORARIO', style: 'tableHeaderES' },
            { text: 'TIMBRE', style: 'tableHeaderESC' },
            '',
          ],
          ...fechasTotales.map((obj: any) => {
            // Inicialización de variables
            var fecha_timbre, fechaFeriado, dayFecha, day;
            var entrada = '', salida = '', almuerzoS = '', almuerzoE = '', sinTimbre = '';
            var horarioE = '-', horarioS = '-', horarioAE = '-', horarioAS = '-';
            var timbreE = '-', timbreS = '-', timbreAlmuerzoE = '-', timbreAlmuerzoS = '-';
            dayFecha = obj.split(' ')[1];
            day = obj.split(' ')[0].charAt(0).toUpperCase() + obj.split(' ')[0].slice(1);


            //console.log('ver fecha map ', obj + ' ' + dayFecha + ' ' + day);

            // BUSQUEDA de los datos
            this.totalEntradasSalidas.forEach((element: any) => {
              fecha_timbre = DateTime.fromISO(element.fecha_hora_timbre).toFormat('dd/MM/yyyy');
              // TIMBRE EXISTENTE - ESTADO Y HORA DEL TIMBRE

              //console.log('ver fecha2 map ', fecha_timbre, element.accion);


              if (dayFecha === fecha_timbre && element.accion === 'E') {
                console.log('entrada ', fecha_timbre, element.accion);
                entrada = 'REGISTRADO'
                horarioE = element.hora;
                timbreE = DateTime.fromISO(element.fecha_hora_timbre).toFormat('HH:mm:ss')
              }
              else if (dayFecha === fecha_timbre && element.accion === 'S') {
                console.log('salida ', fecha_timbre, element.accion);
                salida = 'REGISTRADO'
                horarioS = element.hora;
                timbreS = DateTime.fromISO(element.fecha_hora_timbre).toFormat('HH:mm:ss')
              }
              else if (dayFecha === fecha_timbre && element.accion === 'I/A') {
                console.log('inicio comida ', fecha_timbre, element.accion);
                almuerzoS = 'REGISTRADO'
                horarioAS = element.hora;
                timbreAlmuerzoS = DateTime.fromISO(element.fecha_hora_timbre).toFormat('HH:mm:ss')
              }
              else if (dayFecha === fecha_timbre && element.accion === 'F/A') {
                console.log('fin comida ', fecha_timbre, element.accion);
                almuerzoE = 'REGISTRADO'
                horarioAE = element.hora;
                timbreAlmuerzoE = DateTime.fromISO(element.fecha_hora_timbre).toFormat('HH:mm:ss')
              }
              // NO EXISTE TIMBRE
              else {
                if (this.feriadosTotales.length != 0) {
                  // Buscar días en la lista de feriados
                  for (var i = 0; i <= this.feriadosTotales.length - 1; i++) {
                    fechaFeriado = DateTime.fromISO(this.feriadosTotales[i].fecha).toFormat('dd/MM/yyyy');
                    if (dayFecha === fechaFeriado) {
                      sinTimbre = 'Feriado';
                      break;
                    }
                    else {
                      sinTimbre = this.IterarFeriados(day, dayFecha);
                    }
                  }
                }
                else {
                  sinTimbre = this.IterarFeriados(day, dayFecha);
                }
              }
            });

            // Control de estados SIN TIMBRE
            if (entrada === '' && sinTimbre === '') {
              entrada = 'Falta Timbre';
            }
            if (salida === '' && sinTimbre === '') {
              salida = 'Falta Timbre'
            }
            if (almuerzoE === '' && sinTimbre === '') {
              almuerzoE = 'Falta Timbre'
            }
            if (almuerzoS === '' && sinTimbre === '') {
              almuerzoS = 'Falta Timbre'
            }

            // Control de estados FERIADOS
            if (entrada === '' && sinTimbre === 'Feriado') {
              entrada = 'FERIADO';
            }
            if (salida === '' && sinTimbre === 'Feriado') {
              salida = 'FERIADO'
            }
            if (almuerzoE === '' && sinTimbre === 'Feriado') {
              almuerzoE = 'FERIADO'
            }
            if (almuerzoS === '' && sinTimbre === 'Feriado') {
              almuerzoS = 'FERIADO'
            }

            // Control de estados LIBRES
            if (entrada === '' && sinTimbre === 'Libre') {
              entrada = 'LIBRE';
            }
            if (salida === '' && sinTimbre === 'Libre') {
              salida = 'LIBRE'
            }
            if (almuerzoE === '' && sinTimbre === 'Libre') {
              almuerzoE = 'LIBRE'
            }
            if (almuerzoS === '' && sinTimbre === 'Libre') {
              almuerzoS = 'LIBRE'
            }

            // Conteo de registros
            this.contadorRegistros = this.contadorRegistros + 1;

            return [
              { text: this.contadorRegistros, style: 'itemsTableD' },
              { text: obj.split(' ')[0].charAt(0).toUpperCase() + obj.split(' ')[0].slice(1), style: 'itemsTableD' },
              { text: obj.split(' ')[1], style: 'itemsTableD' },
              { text: horarioE, style: 'itemsTableD' },
              { text: timbreE, style: 'itemsTableD' },
              { text: entrada, style: 'itemsTableD' },
              { text: horarioAS, style: 'itemsTableD' },
              { text: timbreAlmuerzoS, style: 'itemsTableD' },
              { text: almuerzoS, style: 'itemsTableD' },
              { text: horarioAE, style: 'itemsTableD' },
              { text: timbreAlmuerzoE, style: 'itemsTableD' },
              { text: almuerzoE, style: 'itemsTableD' },
              { text: horarioS, style: 'itemsTableD' },
              { text: timbreS, style: 'itemsTableD' },
              { text: salida, style: 'itemsTableD' },
            ];
          })
        ]
      },
      // Estilo de colores formato zebra
      layout: {
        fillColor: function (i, node) {
          return (i % 2 === 0) ? '#CCD1D1' : null;
        }
      },
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
        let f = DateTime.now();
        fecha = f.toFormat('yyyy-MM-dd');
        let time = f.toFormat('HH:mm:ss');
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
                text: '© Pag ' + currentPage.toString() + ' de ' + pageCount, alignment: 'right', opacity: 0.3
              }],
            }
          ], fontSize: 10
        }
      },
      content: [
        { image: this.logo, width: 150, margin: [10, -25, 0, 5] },
        ...this.datosEmpleado.map((obj: any) => {
          if (obj.codigo === id_seleccionado) {
            return [
              { text: obj.empresa.toUpperCase(), bold: true, fontSize: 25, alignment: 'center', margin: [0, -30, 0, 5] },
              { text: 'REPORTE ENTRADAS - SALIDAS', fontSize: 17, alignment: 'center', margin: [0, 0, 0, 5] },
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
    this.datosEmpleado.forEach((obj: any) => {
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
              { text: [{ text: 'PERIODO DEL: ' + DateTime.fromFormat(form.inicioForm, 'yyyy/MM/dd').toFormat('dd/MM/yyyy') + ' AL ' + DateTime.fromFormat(form.finalForm, 'yyyy/MM/dd').format('dd/MM/yyyy'), style: 'itemsTableP' }] },
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
          [{ text: 'NO EXISTEN REGISTROS DE ENTRADAS - SALIDAS', style: 'tableHeader' },],
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

  exportToExcel(id_empleado: number, form, fechasTotales) {
    var j = 0;
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
          REGIMEN: this.datosEmpleado[i].regimen
        }]
        break;
      }
    }
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(datosEmpleado);

    const headerE = Object.keys(datosEmpleado[0]); // columns name

    var wscolsE: any = [];
    for (var i = 0; i < headerE.length; i++) {  // columns length added
      wscolsE.push({ wpx: 110 })
    }
    wse["!cols"] = wscolsE;

    const wst: xlsx.WorkSheet = xlsx.utils.json_to_sheet(fechasTotales.map((obj: any) => {
      // Inicialización de variables
      var fecha_timbre, fechaFeriado, dayFecha, day;
      var entrada = '', salida = '', almuerzoS = '', almuerzoE = '', sinTimbre = '';
      var horarioE = '-', horarioS = '-', horarioAE = '-', horarioAS = '-';
      var timbreE = '-', timbreS = '-', timbreAlmuerzoE = '-', timbreAlmuerzoS = '-';
      dayFecha = obj.split(' ')[1];
      day = obj.split(' ')[0].charAt(0).toUpperCase() + obj.split(' ')[0].slice(1);

      // BUSQUEDA de los datos
      this.totalEntradasSalidas.forEach((element: any) => {
        fecha_timbre = DateTime.fromISO(element.fecha_hora_timbre).toFormat('dd/MM/yyyy');
        // TIMBRE EXISTENTE - ESTADO Y HORA DEL TIMBRE
        if (dayFecha === fecha_timbre && element.accion === 'E') {
          entrada = 'REGISTRADO'
          horarioE = element.hora;
          timbreE = DateTime.fromISO(element.fecha_hora_timbre).toFormat('HH:mm:ss')
        }
        else if (dayFecha === fecha_timbre && element.accion === 'S') {
          salida = 'REGISTRADO'
          horarioS = element.hora;
          timbreS = DateTime.fromISO(element.fecha_hora_timbre).toFormat('HH:mm:ss')
        }
        else if (dayFecha === fecha_timbre && element.accion === 'I/A') {
          almuerzoS = 'REGISTRADO'
          horarioAS = element.hora;
          timbreAlmuerzoS = DateTime.fromISO(element.fecha_hora_timbre).toFormat('HH:mm:ss')
        }
        else if (dayFecha === fecha_timbre && element.accion === 'F/A') {
          almuerzoE = 'REGISTRADO'
          horarioAE = element.hora;
          timbreAlmuerzoE = DateTime.fromISO(element.fecha_hora_timbre).toFormat('HH:mm:ss')
        }
        // NO EXISTE TIMBRE
        else {
          if (this.feriadosTotales.length != 0) {
            // Buscar días en la lista de feriados
            for (var i = 0; i <= this.feriadosTotales.length - 1; i++) {
              fechaFeriado = DateTime.fromISO(this.feriadosTotales[i].fecha).toFormat('dd/MM/yyyy');
              if (dayFecha === fechaFeriado) {
                sinTimbre = 'Feriado';
                break;
              }
              else {
                sinTimbre = this.IterarFeriados(day, dayFecha);
              }
            }
          }
          else {
            sinTimbre = this.IterarFeriados(day, dayFecha);
          }
        }
      });

      // Control de estados SIN TIMBRE
      if (entrada === '' && sinTimbre === '') {
        entrada = 'Falta Timbre';
      }
      if (salida === '' && sinTimbre === '') {
        salida = 'Falta Timbre'
      }
      if (almuerzoE === '' && sinTimbre === '') {
        almuerzoE = 'Falta Timbre'
      }
      if (almuerzoS === '' && sinTimbre === '') {
        almuerzoS = 'Falta Timbre'
      }

      // Control de estados FERIADOS
      if (entrada === '' && sinTimbre === 'Feriado') {
        entrada = 'FERIADO';
      }
      if (salida === '' && sinTimbre === 'Feriado') {
        salida = 'FERIADO'
      }
      if (almuerzoE === '' && sinTimbre === 'Feriado') {
        almuerzoE = 'FERIADO'
      }
      if (almuerzoS === '' && sinTimbre === 'Feriado') {
        almuerzoS = 'FERIADO'
      }

      // Control de estados LIBRES
      if (entrada === '' && sinTimbre === 'Libre') {
        entrada = 'LIBRE';
      }
      if (salida === '' && sinTimbre === 'Libre') {
        salida = 'LIBRE'
      }
      if (almuerzoE === '' && sinTimbre === 'Libre') {
        almuerzoE = 'LIBRE'
      }
      if (almuerzoS === '' && sinTimbre === 'Libre') {
        almuerzoS = 'LIBRE'
      }
      return {
        N_REGISTROS: j = j + 1,
        DIA_TIMBRE: obj.split(' ')[0].charAt(0).toUpperCase() + obj.split(' ')[0].slice(1),
        FECHA_TIMBRE: obj.split(' ')[1],
        HORARIO_ENTRADA: horarioE,
        TIMBRE_ENTRADA: timbreE,
        ESTADO_ENTRADA: entrada,
        HORARIO_SALIDA_ALMUERZO: horarioAS,
        TIMBRE_SALIDA_ALMUERZO: timbreAlmuerzoS,
        ESTADO_SALIDA_ALMUERZO: almuerzoS,
        HORARIO_ENTRADA_ALMUERZO: horarioAE,
        TIMBRE_ENTRADA_ALMUERZO: timbreAlmuerzoE,
        ESTADO_ENTRADA_ALMUERZO: almuerzoE,
        HORARIO_SALIDA: horarioS,
        TIMBRE_SALIDA: timbreS,
        ESTADO_SALIDA: salida,
      }
    }));

    const header = Object.keys(this.totalEntradasSalidas[0]); // nombres de la columnas

    var wscols: any = [];
    for (var i = 0; i < header.length; i++) {  // número de columnas
      wscols.push({ wpx: 130 })
    }
    wst["!cols"] = wscols;

    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wse, 'Empleado');
    xlsx.utils.book_append_sheet(wb, wst, 'Timbres');
    xlsx.writeFile(wb, "Timbres Entradas-Salidas - " + DateTime.fromFormat(form.inicioForm, 'yyyy/MM/dd').toFormat('dd/MM/yyyy') + ' - ' + DateTime.fromFormat(form.finalForm, 'yyyy/MM/dd').toFormat('dd/MM/yyyy') + '.xlsx');
  }

}
