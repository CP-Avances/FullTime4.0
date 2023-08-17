import { MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Component, OnInit, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDatepicker } from '@angular/material/datepicker';
import { FormControl } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { default as _rollupMoment, Moment } from 'moment';
import moment from 'moment';

import { DetalleCatHorariosService } from 'src/app/servicios/horarios/detalleCatHorarios/detalle-cat-horarios.service';
import { PlanHorarioService } from 'src/app/servicios/horarios/planHorario/plan-horario.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { FeriadosService } from 'src/app/servicios/catalogos/catFeriados/feriados.service';
import { HorarioService } from 'src/app/servicios/catalogos/catHorarios/horario.service';

import { VerEmpleadoComponent } from 'src/app/componentes/empleado/ver-empleado/ver-empleado.component';
import { EmpleadoHorariosService } from 'src/app/servicios/horarios/empleadoHorarios/empleado-horarios.service';
import { PlanGeneralService } from 'src/app/servicios/planGeneral/plan-general.service';

@Component({
  selector: 'app-registro-plan-horario',
  templateUrl: './registro-plan-horario.component.html',
  styleUrls: ['./registro-plan-horario.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
  ]
})

export class RegistroPlanHorarioComponent implements OnInit {

  @Input() datoEmpleado: any

  // FECHAS DE BUSQUEDA
  fechaInicialF = new FormControl();
  fechaFinalF = new FormControl();
  horarioF = new FormControl();
  fecHorario: boolean = true;

  // VARIABLE DE ALMACENAMIENTO
  horarios: any = [];
  feriados: any = [];
  ver_horario: boolean = false;
  ver_horario_: boolean = false;
  ver_guardar: boolean = false;

  constructor(
    public componentev: VerEmpleadoComponent,
    public parametro: ParametrosService,
    public feriado: FeriadosService,
    public validar: ValidacionesService,
    public horario: EmpleadoHorariosService,
    public router: Router,
    public restE: EmpleadoService,
    public restD: DetalleCatHorariosService,
    public restH: HorarioService,
    public restP: PlanGeneralService,
    public rest: PlanHorarioService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.BuscarHorarios();
    this.BuscarHora();
  }

  /** **************************************************************************************** **
 ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** ** 
 ** **************************************************************************************** **/
  formato_hora: string = 'HH:mm:ss';

  BuscarHora() {
    // id_tipo_parametro Formato hora = 26
    this.parametro.ListarDetalleParametros(26).subscribe(
      res => {
        this.formato_hora = res[0].descripcion;
      });
  }

  // VARIABLES DE ALMACENAMIENTO DE DATOS ESPECIFICOS DE UN HORARIO
  detalles_horarios: any = [];
  vista_horarios: any = [];
  hora_entrada: any;
  hora_salida: any;
  // METODO PARA MOSTRAR NOMBRE DE HORARIO CON DETALLE DE ENTRADA Y SALIDA
  BuscarHorarios() {
    this.horarios = [];
    this.vista_horarios = [];
    // BUSQUEDA DE HORARIOS
    this.restH.BuscarListaHorarios().subscribe(datos => {
      this.horarios = datos;
      this.horarios.map(hor => {
        // BUSQUEDA DE DETALLES DE ACUERDO AL ID DE HORARIO
        this.restD.ConsultarUnDetalleHorario(hor.id).subscribe(res => {
          this.detalles_horarios = res;
          this.detalles_horarios.map(det => {
            if (det.tipo_accion === 'E') {
              this.hora_entrada = det.hora.slice(0, 5)
            }
            if (det.tipo_accion === 'S') {
              this.hora_salida = det.hora.slice(0, 5)
            }
          })
          let datos_horario = [{
            id: hor.id,
            nombre: hor.codigo + ' (' + this.hora_entrada + '-' + this.hora_salida + ')',
            codigo: hor.codigo
          }]
          if (this.vista_horarios.length === 0) {
            this.vista_horarios = datos_horario;
          } else {
            this.vista_horarios = this.vista_horarios.concat(datos_horario);
          }
        }, error => {
          let datos_horario = [{
            id: hor.id,
            nombre: hor.codigo,
            codigo: hor.codigo
          }]
          if (this.vista_horarios.length === 0) {
            this.vista_horarios = datos_horario;
          } else {
            this.vista_horarios = this.vista_horarios.concat(datos_horario);
          }
        })
      })
    })
  }

  // METODO PARA BUSCAR FERIADOS
  BuscarFeriados(inicio: any, fin: any) {
    this.feriados = [];
    let datos = {
      fecha_inicio: inicio,
      fecha_final: fin,
      id_empleado: parseInt(this.datoEmpleado.idEmpleado)
    }
    this.feriado.ListarFeriadosCiudad(datos).subscribe(data => {
      this.feriados = data;
      this.BuscarFeriadosRecuperar(inicio, fin)
    }, error => {
      this.BuscarFeriadosRecuperar(inicio, fin)
    })
  }

  // METODO PARA BUSCAR FECHAS DE RECUPERACION DE FERIADOS
  recuperar: any = [];
  BuscarFeriadosRecuperar(inicio: any, fin: any) {
    this.recuperar = [];
    let datos = {
      fecha_inicio: inicio,
      fecha_final: fin,
      id_empleado: parseInt(this.datoEmpleado.idEmpleado)
    }
    this.feriado.ListarFeriadosRecuperarCiudad(datos).subscribe(data => {
      this.recuperar = data;
      this.ListarFechas(inicio, fin);
    }, error => {
      this.ListarFechas(inicio, fin);
    })
  }

  // METODO PARA MOSTRAR FECHA SELECCIONADA
  FormatearFecha(fecha: Moment, datepicker: MatDatepicker<Moment>, opcion: number) {
    this.ControlarBotones(true, false);
    const ctrlValue = fecha;
    if (opcion === 1) {
      if (this.fechaFinalF.value) {
        this.ValidarFechas(ctrlValue, this.fechaFinalF.value, this.fechaInicialF, opcion);
      }
      else {
        let inicio = moment(ctrlValue).format('01/MM/YYYY');
        this.fechaInicialF.setValue(moment(inicio, 'DD/MM/YYYY'));
      }
      this.fecHorario = false;
    }
    else {
      this.ValidarFechas(this.fechaInicialF.value, ctrlValue, this.fechaFinalF, opcion);
    }
    datepicker.close();
  }

  // METODO PARA VALIDAR EL INGRESO DE LAS FECHAS
  ValidarFechas(fec_inicio: any, fec_fin: any, formulario: any, opcion: number) {
    // FORMATO DE FECHA PERMITIDO PARA COMPARARLAS
    let inicio = moment(fec_inicio).format('01/MM/YYYY');
    let final = moment(fec_fin).daysInMonth() + moment(fec_fin).format('/MM/YYYY');
    let feci = moment(inicio, 'DD/MM/YYYY').format('YYYY/MM/DD');
    let fecf = moment(final, 'DD/MM/YYYY').format('YYYY/MM/DD');
    // VERIFICAR SI LAS FECHAS ESTAN INGRESDAS DE FORMA CORRECTA
    if (Date.parse(feci) <= Date.parse(fecf)) {
      if (opcion === 1) {
        formulario.setValue(moment(inicio, 'DD/MM/YYYY'));
      }
      else {
        formulario.setValue(moment(final, 'DD/MM/YYYY'));
      }
    }
    else {
      this.toastr.warning('La fecha no se registro. Ups la fecha no es correcta.!!!', 'VERIFICAR', {
        timeOut: 6000,
      });
    }
  }

  // METODO PARA SELECCIONAR TIPO DE BUSQUEDA
  GenerarCalendario() {
    this.ver_horario = true;
    this.ControlarBotones(true, false);

    if (this.fechaInicialF.value != null && this.fechaFinalF.value != null) {
      this.BuscarFeriados(this.fechaInicialF.value, this.fechaFinalF.value);
    }
    else {
      let inicio = moment().format('YYYY/MM/01');
      let final = moment().format('YYYY/MM/') + moment().daysInMonth();
      this.BuscarFeriados(inicio, final);
    }
  }

  // METODO PARA OBTENER FECHAS, MES, DIA, AÑO
  fechas_mes: any = [];
  dia_inicio: any;
  dia_fin: any;
  ListarFechas(fecha_inicio: any, fecha_final: any) {
    this.fechas_mes = []; // ARRAY QUE CONTIENE TODAS LAS FECHAS DEL MES INDICADO 

    this.dia_inicio = moment(fecha_inicio, 'YYYY-MM-DD').format('YYYY-MM-DD');
    this.dia_fin = moment(fecha_final, 'YYYY-MM-DD').format('YYYY-MM-DD');

    // LOGICA PARA OBTENER EL NOMBRE DE CADA UNO DE LOS DIAS DEL PERIODO INDICADO
    while (this.dia_inicio <= this.dia_fin) {
      let fechas = {
        fecha: this.dia_inicio,
        dia: (moment(this.dia_inicio).format('dddd')).toUpperCase(),
        formato: (moment(this.dia_inicio).format('MMMM DD, YYYY')).toUpperCase(),
        mes: moment(this.dia_inicio).format('MMMM').toUpperCase(),
        anio: moment(this.dia_inicio).format('YYYY'),
        horarios: [],
        tipo_dia: '-',
        estado: false,
      }
      this.fechas_mes.push(fechas);
      var newDate = moment(this.dia_inicio).add(1, 'd').format('YYYY-MM-DD')
      this.dia_inicio = newDate;
    }

    // TRATAMIENTO DE FERIADOS
    this.fechas_mes.forEach(obj => {
      // BUSCAR FERIADOS 
      if (this.feriados.length != 0) {
        //console.log('ingresa feriados ', this.feriados)
        for (let i = 0; i < this.feriados.length; i++) {
          //console.log('fecha feriados ', moment(this.feriados[i].fecha, 'YYYY-MM-DD').format('YYYY-MM-DD'))
          //console.log('obj ', obj)
          if (moment(this.feriados[i].fecha, 'YYYY-MM-DD').format('YYYY-MM-DD') === obj.fecha) {
            obj.tipo_dia = 'FD';
            obj.estado = true;
            obj.observacion = 'FERIADO*';
            break;
          }
        }
      }

      // BUSCAR FECHAS DE RECUPERACION DE FERIADOS
      if (this.recuperar.length != 0) {
        for (let j = 0; j < this.recuperar.length; j++) {
          if (moment(this.recuperar[j].fec_recuperacion, 'YYYY-MM-DD').format('YYYY-MM-DD') === obj.fecha) {
            obj.tipo_dia = 'N';
            obj.observacion = 'RECUPERACIÓN*';
            break;
          }
        }
      }
    })
  }

  // METODO PARA CAMBIAR DE COLORES SEGUN EL MES
  CambiarColores(opcion: any) {
    let color: string;
    switch (opcion) {
      case 'ENERO':
        return color = '#FFC7A3';
      case 'FEBRERO':
        return color = '#CAFFA9';
      case 'MARZO':
        return color = '#FEEEA9';
      case 'ABRIL':
        return color = '#AFDDE9';
      case 'MAYO':
        return color = '#F2B8FF';
      case 'JUNIO':
        return color = '#FFFF97';
      case 'JULIO':
        return color = '#FE9594';
      case 'AGOSTO':
        return color = '#CCAAFE';
      case 'SEPTIEMBRE':
        return color = '#80E7FF';
      case 'OCTUBRE':
        return color = '#FDD6F6';
      case 'NOVIEMBRE':
        return color = '#E9C6B0';
      case 'DICIEMBRE':
        return color = '#C9E9B0';
      case 'OK':
        return color = '#115703';
      case 'Horario ya existe.':
        return color = '#DC341A';
    }
  }

  // METODO PARA SUBRAYAR TEXTO
  EstiloSubrayado(opcion: any) {
    let color: string;
    switch (opcion) {
      case 'OK':
        return color = 'none';
      case 'Horario ya existe.':
        return color = 'line-through red';
    }
  }

  // METODO PARA SELECCIONAR HORARIO
  valor: any;
  ver_icono: boolean = false;
  SeleccionarHorario() {
    this.ver_icono = true;
    this.valor = this.horarioF.value
  }

  // METODO PARA VALIDAR SELECCION DE HORARIO
  ValidarHorario() {
    const [obj_res] = this.horarios.filter(o => {
      return o.codigo === this.horarioF.value
    })
    if (!obj_res) return this.toastr.warning('Horario no válido.');

    const { hora_trabajo, id, codigo, min_almuerzo } = obj_res;

    // VERIFICACION DE FORMATO CORRECTO DE HORARIOS
    if (!this.StringTimeToSegundosTime(hora_trabajo)) {
      this.ver_icono = false;
      this.horarioF.setValue('');
      this.toastr.warning(
        'Formato de horas en horario seleccionado no son válidas.',
        'Dar click para verificar registro de detalle de horario.', {
        timeOut: 6000,
      }).onTap.subscribe(obj => {
        this.router.navigate(['/horario/']);
      });
    }
    else {
      this.SeleccionarHorario();
      this.ObtenerDetallesHorario(id, codigo, min_almuerzo);
    }
  }

  // METODO PARA SUMAR HORAS
  StringTimeToSegundosTime(stringTime: string) {
    const h = parseInt(stringTime.split(':')[0]) * 3600;
    const m = parseInt(stringTime.split(':')[1]) * 60;
    const s = parseInt(stringTime.split(':')[2]);
    return h + m + s
  }

  // ITEMS DE PAGINACION DE LA TABLA 
  pageSizeOptionsD = [5, 10, 20, 50];
  tamanio_paginaD: number = 5;
  numero_paginaD: number = 1;

  // EVENTO PARA MOSTRAR NÚMERO DE FILAS EN TABLA
  ManejarPaginaDetalles(e: PageEvent) {
    this.numero_paginaD = e.pageIndex + 1;
    this.tamanio_paginaD = e.pageSize;
  }


  // METODO PARA VER DETALLE DE HORARIO
  ver_acciones: boolean = false;
  detalle_acciones: any = [];
  detalles: any = [];
  // ACCIONES DE HORARIOS
  inicio_comida = '';
  fin_comida = '';
  entrada: '';
  salida: '';
  ObtenerDetallesHorario(id: number, codigo: any, min_almuerzo: any) {
    this.inicio_comida = '';
    this.fin_comida = '';
    this.entrada = '';
    this.salida = '';
    this.detalles = [];
    let tipos: any = [];
    this.detalle_acciones = [];
    // BUSQUEDA DE DETALLES DE PLANIFICACIONES
    this.restD.ConsultarUnDetalleHorario(id).subscribe(res => {

      this.ver_acciones = true;
      this.detalle_acciones = [];
      this.detalles = res;

      this.detalles.forEach(obj => {
        this.ValidarAcciones(obj);
      })

      // AL FINALIZAR EL CICLO CONCATENAR VALORES
      tipos = [{
        horario: codigo,
        entrada: this.entrada,
        inicio_comida: this.inicio_comida,
        fin_comida: this.fin_comida,
        salida: this.salida,
        almuerzo: min_almuerzo,
      }]

      this.detalle_acciones = this.detalle_acciones.concat(tipos);

      this.detalle_acciones.forEach(detalle => {
        detalle.entrada_ = this.validar.FormatearHora(detalle.entrada, this.formato_hora);
        if (detalle.inicio_comida != '') {
          detalle.inicio_comida = this.validar.FormatearHora(detalle.inicio_comida, this.formato_hora);
        }
        if (detalle.fin_comida != '') {
          detalle.fin_comida = this.validar.FormatearHora(detalle.fin_comida, this.formato_hora);
        }
        detalle.salida_ = this.validar.FormatearHora(detalle.salida, this.formato_hora);
      })
    })
  }

  // CONDICIONES DE ACCIONES EN HORARIO ASIGNADO
  ValidarAcciones(obj: any) {
    if (obj.tipo_accion === 'E') {
      return this.entrada = obj.hora;
    }
    if (obj.tipo_accion === 'S') {
      return this.salida = obj.hora;
    }
    if (obj.tipo_accion === 'I/A') {
      return this.inicio_comida = obj.hora;
    }
    if (obj.tipo_accion === 'F/A') {
      return this.fin_comida = obj.hora;
    }
  }

  // METODO PARA INGRESAR HORARIO
  IngresarHorario(index: number) {
    let verificador = 0;
    this.ControlarBotones(true, false);

    const [datoHorario] = this.horarios.filter(o => {
      return o.codigo === this.horarioF.value
    })

    let data = [{
      horario: this.horarioF.value,
      id_horario: datoHorario.id,
      hora_trabajo: datoHorario.hora_trabajo,
    }]

    //console.log('tipo dia ', this.fechas_mes[index].tipo_dia, ' observa ', this.fechas_mes[index].observacion)
    if (this.fechas_mes[index].tipo_dia === 'L') {
      this.toastr.warning('Este día esta configurado como libre.', 'Ups!!! VERIFICAR.', {
        timeOut: 6000,
      });
    }
    else {
      for (let i = 0; i < this.fechas_mes[index].horarios.length; i++) {
        if (this.fechas_mes[index].horarios[i].horario === this.horarioF.value) {
          verificador = 1;
          break
        }
      }

      if (verificador === 0) {
        this.fechas_mes[index].estado = true;
        this.fechas_mes[index].tipo_dia = 'N';
        if (this.fechas_mes[index].observacion === 'FERIADO*') {
          if (this.fechas_mes[index].horarios.length === 0) {
            this.fechas_mes[index].tipo_dia = 'FD';
            this.fechas_mes[index].horarios = this.fechas_mes[index].horarios.concat(data);
          }
          else {
            this.toastr.warning('No es factible registrar más de un horario.', 'Ups!!! VERIFICAR.', {
              timeOut: 6000,
            });
          }
        }
        else {
          this.fechas_mes[index].horarios = this.fechas_mes[index].horarios.concat(data);
        }
      }
      else {
        this.toastr.warning('Horario ya se encuentra registrado.', 'Ups!!! VERIFICAR.', {
          timeOut: 6000,
        });
      }
    }

  }

  // METODO PARA INGRESAR HORARIO
  IngresarLibre(index: number) {
    let verificador = 0;
    this.ControlarBotones(true, false);

    const [datoHorario] = this.horarios.filter(o => {
      return o.codigo === this.horarioF.value
    })

    let data = [{
      horario: this.horarioF.value,
      id_horario: datoHorario.id,
      hora_trabajo: datoHorario.hora_trabajo,
      verificar: '',
    }]

    if (this.fechas_mes[index].horarios.length === 0) {
      for (let i = 0; i < this.fechas_mes[index].horarios.length; i++) {
        if (this.fechas_mes[index].horarios[i].tipo_dia === 'L') {
          verificador = 1;
          break
        }
      }

      if (verificador === 0) {

        // METODO PARA LECTURA DE HORARIOS EXISTENTES DEL EMPLEADO
        let fechas = {
          fechaInicio: this.fechas_mes[index].fecha,
          fechaFinal: this.fechas_mes[index].fecha,
        };

        this.horario.VerificarHorariosExistentes(this.datoEmpleado.codigo, fechas).subscribe(existe => {
          this.fechas_mes[index].horarios_existentes = '***';
          this.toastr.warning('Ya se encuentra registrada una planificación horaria.', 'Ups!!! VERIFICAR.', {
            timeOut: 6000,
          });
        }, error => {
          this.fechas_mes[index].horarios_existentes = '';
          this.fechas_mes[index].estado = true;
          this.fechas_mes[index].tipo_dia = 'L';
          this.fechas_mes[index].horarios = this.fechas_mes[index].horarios.concat(data);
        });

      }
      else {
        this.toastr.warning('Día libre ya se encuentra registrado.', 'Ups!!! VERIFICAR.', {
          timeOut: 6000,
        });
      }

    }
    else {
      this.toastr.info('Este día ya tiene configurado horarios. No puede ser libre.', 'Ups!!! VERIFICAR.', {
        timeOut: 6000,
      });
    }

  }

  // METODO PARA ELIMINAR HORARIOS
  EliminarHorario(index: number) {
    this.ControlarBotones(true, false);

    for (let i = 0; i < this.fechas_mes[index].horarios.length; i++) {

      if (this.fechas_mes[index].horarios[i].horario === this.horarioF.value) {
        this.fechas_mes[index].horarios.splice(i, 1);
        break
      }
    }
    if (this.fechas_mes[index].horarios.length === 0) {
      this.fechas_mes[index].tipo_dia = '-';
      if (this.fechas_mes[index].observacion === 'FERIADO*') {
        this.fechas_mes[index].tipo_dia = 'FD';
      }
      this.fechas_mes[index].estado = false;
      this.fechas_mes[index].horas_validas = '';
    }

  }

  // METODO PARA ELIMINAR HORARIOS LIBRES
  EliminarLibre(index: number) {
    this.ControlarBotones(true, false);

    for (let i = 0; i < this.fechas_mes[index].horarios.length; i++) {
      if (this.fechas_mes[index].tipo_dia === 'L') {
        this.fechas_mes[index].tipo_dia = '-';
        this.fechas_mes[index].estado = false;
        this.fechas_mes[index].horarios.splice(i, 1);
        break
      }
    }
    //console.log('ver fechas final', this.fechas_mes)
  }

  // METODO PARA VALIDAR DATOS SELECCIONADOS
  data_horarios: any = [];
  VerificarHorario() {
    let verificador = 0;
    this.data_horarios = [];
    //console.log('ver fechas origen ', this.fechas_mes, ' form ', this.horarioF.value);
    if (this.horarioF.value != null) {

      this.fechas_mes.forEach(obj => {
        if (obj.estado === true) {
          verificador = verificador + 1;
          this.data_horarios = this.data_horarios.concat(obj);
        }
      })

      // METODO PARA TRATAR FERIADOS
      this.RegistrarFeriados();

      //console.log('verificador ', verificador);
      if (verificador > 0) {
        //console.log('ingresa ver datos seleccionados ', this.data_horarios)
        this.VerificarContrato();
      }
      else {
        this.toastr.warning('No ha registrado horarios.', 'Ups!!! VERIFICAR.', {
          timeOut: 6000,
        });
      }
    }
    else {
      this.toastr.warning('No ha registrado horarios.', 'Ups!!! VERIFICAR.', {
        timeOut: 6000,
      });
    }
    //console.log('ver datos seleccionados ', this.data_horarios)
  }

  // METODO PARA VALIDAR REGISTRO DE HORARIO POSTERIOR AL CONTRATO
  VerificarContrato() {
    //console.log('ver datos horarios ', this.data_horarios);
    let datosBusqueda = {
      id_empleado: this.datoEmpleado.idEmpleado
    }

    let inicio = moment(this.data_horarios[0].fecha).format('YYYY-MM-DD');

    // METODO PARA BUSCAR FECHA DE CONTRATO REGISTRADO EN FICHA DE EMPLEADO
    this.restE.BuscarFechaContrato(datosBusqueda).subscribe(response => {
      // VERIFICAR SI LAS FECHAS SON VALIDAS DE ACUERDO A LOS REGISTROS Y FECHAS INGRESADAS
      if (Date.parse(response[0].fec_ingreso.split('T')[0]) < Date.parse(inicio)) {
        //console.log('ingresa a verificar duplicidad');
        this.VerificarDuplicidad();
      }
      else {
        this.toastr.warning('Fecha de inicio de actividades no puede ser anterior a fecha de ingreso de contrato.', '', {
          timeOut: 6000,
        });
      }
    });
  }

  // METODO PARA VERIFICAR DUPLICIDAD DE REGISTROS
  iterar: number = 0;
  leer_horario: number = 0;
  contar_duplicado: number = 0;
  sin_duplicidad: any = [];
  VerificarDuplicidad() {
    //console.log('duplicidad ', this.data_horarios);
    this.sin_duplicidad = [];
    let total = 0;

    this.data_horarios.forEach(obj => {
      total = total + obj.horarios.length
    })

    this.contar_duplicado = 0;
    this.leer_horario = 0;
    this.iterar = 0;

    this.data_horarios.forEach(obj => {

      this.iterar = this.iterar + 1;
      obj.horarios.forEach(h => {
        const [horario] = this.horarios.filter(o => {
          return o.codigo === h.horario
        })

        let fechas = {
          fechaInicio: obj.fecha,
          fechaFinal: obj.fecha,
          id_horario: horario.id
        };

        h.verificar = 'OK';
        //console.log('ver datos de horario ', fechas)
        this.horario.VerificarDuplicidadHorarios(this.datoEmpleado.codigo, fechas).subscribe(existe => {
          this.leer_horario = this.leer_horario + 1;
          this.contar_duplicado = 1;
          h.verificar = 'Horario ya existe.';
          //console.log('duplicado ', this.contar_duplicado)
          if (this.iterar === this.data_horarios.length) {
            if (this.leer_horario === total) {
              this.ValidarHorarioByHorasTrabaja()
            }
          }
        }, error => {
          this.leer_horario = this.leer_horario + 1;
          if (this.iterar === this.data_horarios.length) {
            if (this.leer_horario === total) {
              this.ValidarHorarioByHorasTrabaja()
            }
          }
        });
      })
      //console.log('duplicaso for', this.contar_duplicado)
    })

    this.data_horarios.forEach(obj => {
      this.fechas_mes.forEach(fec => {
        if (obj.fecha === fec.fecha) {
          fec.horarios = obj.horarios;
        }
      })
    })

    //console.log('data_horarios ', this.data_horarios)
  }

  // METODO PARA VALIDAR HORAS DE TRABAJO SEGUN CONTRATO
  sumHoras: any;
  suma = '00:00:00';
  horariosEmpleado: any = [];
  iterar2: number = 0;
  leer_horario2: number = 0;
  ValidarHorarioByHorasTrabaja() {
    const trabajo = this.datoEmpleado.horas_trabaja;
    let suma1 = '00:00:00';
    let suma2 = '00:00:00';
    this.iterar2 = 0;
    this.leer_horario2 = 0;
    let horario1: number = 0;
    let horario2: number = 0;

    this.data_horarios.forEach(obj => {
      obj.horas_seleccionadas = suma1;
      obj.horas_registradas = suma2;

      obj.horarios.forEach(valor => {
        horario1 = horario1 + 1;
        // SUMA DE HORAS DE CADA UNO DE LOS HORARIOS SELECCIONADOS
        suma1 = this.SumarHoras(suma1, valor.hora_trabajo);
        if (obj.horarios.length === horario1) {
          obj.horas_seleccionadas = suma1;
          horario1 = 0;
          suma1 = '00:00:00';
        }
      })

      // METODO PARA LECTURA DE HORARIOS EXISTENTES DEL EMPLEADO
      let fechas = {
        fechaInicio: obj.fecha,
        fechaFinal: obj.fecha,
      };

      this.horario.VerificarHorariosExistentes(this.datoEmpleado.codigo, fechas).subscribe(existe => {
        this.iterar2 = this.iterar2 + 1;
        obj.horarios_existentes = '***';
        obj.registrados = existe;
        existe.map(h => {
          horario2 = horario2 + 1;
          // SUMA DE HORAS DE CADA UNO DE LOS HORARIOS DEL EMPLEADO
          suma2 = this.SumarHoras(suma2, h.hora_trabajo);
          if (horario2 === existe.length) {
            obj.horas_registradas = suma2;
            horario2 = 0;
            suma2 = '00:00:00';
            if (this.iterar2 === this.data_horarios.length) {
              this.data_horarios.forEach(obj => {
                this.leer_horario2 = this.leer_horario2 + 1;
                if (obj.tipo_dia != 'L') {
                  //console.log('ver valor ', obj.horas_registradas, obj.horas_seleccionadas)
                  let suma3 = this.SumarHoras(obj.horas_seleccionadas, obj.horas_registradas);
                  if (this.StringTimeToSegundosTime(suma3) <= this.StringTimeToSegundosTime(trabajo)) {
                    obj.horas_validas = 'OK'
                  }
                  else {
                    obj.horas_validas = 'Jornada superada: ' + suma3;
                  }
                }
              })

              //console.log('iterar2 ', this.leer_horario2, ' ver original ', this.data_horarios.length)
              if (this.leer_horario2 === this.data_horarios.length) {
                //console.log('ingresa 1')
                this.ControlarBotones(false, true);
              }
            }
          }
        })
      }, error => {
        this.iterar2 = this.iterar2 + 1;
        obj.horarios_existentes = '';
        obj.horas_registradas = suma2;
        if (this.iterar2 === this.data_horarios.length) {
          this.data_horarios.forEach(obj => {
            this.leer_horario2 = this.leer_horario2 + 1;
            if (obj.tipo_dia != 'L') {
              //console.log('ver valor ', obj.horas_registradas, obj.horas_seleccionadas)
              let suma3 = this.SumarHoras(obj.horas_seleccionadas, obj.horas_registradas);
              if (this.StringTimeToSegundosTime(suma3) <= this.StringTimeToSegundosTime(trabajo)) {
                obj.horas_validas = 'OK';
              }
              else {
                obj.horas_validas = 'Jornada superada: ' + suma3;
              }
            }
          })

          //console.log('iterar2 ', this.leer_horario2, ' ver original ', this.data_horarios.length)
          if (this.leer_horario2 === this.data_horarios.length) {
            //console.log('ingresa 2')
            this.ControlarBotones(false, true);
          }
        }
      });
    })
    //console.log('ver data horarios ', this.data_horarios)
  }

  // METODO PARA SUMAR HORAS
  SumarHoras(suma: string, tiempo: string) {
    //console.log('dato 1 ', suma, ' dato 2 ', tiempo)
    let sumah = parseInt(suma.split(':')[0]) + parseInt(tiempo.split(':')[0]);
    let sumam = parseInt(suma.split(':')[1]) + parseInt(tiempo.split(':')[1]);
    let sumas = parseInt(suma.split(':')[2]) + parseInt(tiempo.split(':')[2]);

    if (sumam === 60) {
      sumam = 0;
      sumah = sumah + 1;
    }

    let h = '00';
    let m = '00';
    let s = '00';

    if (sumah < 10) {
      h = '0' + sumah;
    }
    else {
      h = String(sumah)
    }
    if (sumam < 10) {
      m = '0' + sumam;
    }
    else {
      m = String(sumam)
    }
    if (sumas < 10) {
      s = '0' + sumas;
    }
    else {
      s = String(sumas)
    }

    return h + ':' + m + ':' + s

  }

  // CONTROL DE BOTONES
  ControlarBotones(horario: boolean, guardar: boolean) {
    this.ver_horario_ = horario;
    this.ver_guardar = guardar;
  }

  // METODO DE VALIDACION DE REGISTRO DE HORARIOS
  RegistrarFeriados() {
    const [datoHorario] = this.horarios.filter(o => {
      return o.codigo === this.horarioF.value
    })

    let data = [{
      horario: this.horarioF.value,
      id_horario: datoHorario.id,
      hora_trabajo: datoHorario.hora_trabajo,
    }]

    this.data_horarios.forEach(valor => {
      if (valor.observacion === 'FERIADO*') {
        valor.horas_validas = 'OK';
        if (valor.horarios.length === 0) {
          valor.horarios = data;
        }
      }
    })
  }

  // METODO PARA GUARDAR DATOS
  guardar: any = [];
  GuardarDatos() {
    //console.log('datos a verificar ', this.data_horarios)
    let datos: any = [];

    this.data_horarios.forEach(valor => {
      if (valor.horas_validas === 'OK') {
        datos = datos.concat(valor);
      }
      if (valor.tipo_dia === 'L') {
        datos = datos.concat(valor);
      }
    })

    if (datos.length === 0) {
      this.toastr.warning('No se han encontrado datos para registrar.', 'Ups!!! verificar calendario.', {
        timeOut: 6000,
      });
      this.ControlarBotones(true, false);
    }
    else {
      this.CrearPlanGeneral(datos);
    }
    //console.log('datos finales ', datos)
  }

  plan_general: any = [];
  CrearPlanGeneral(seleccionados: any) {
    this.plan_general = [];
    let total = 0;
    var origen: string = '';

    // DEFINICION DE TIPO DE DIA SEGUN HORARIO
    origen = 'N';

    // SELECCIONADOS SIN HORARIOS
    total = this.LeerDatosFeriados(seleccionados, total, origen);

    this.LeerDatosConHorario(seleccionados, total, origen);

    //this.progreso = true;
    //console.log('ver datos totala ', total)
  }

  // METODO PARA LEER DATOS DE FERIADOS
  LeerDatosFeriados(seleccionados: any, total: number, origen: any) {
    seleccionados.forEach(valor => {
      total = total + valor.horarios.length;
      if (valor.observacion === 'FERIADO*') {
        if (valor.horarios_existentes === '***') {
          //console.log('ver datos ', valor.registrados)
          valor.registrados.forEach(h => {
            this.EliminarPlanificacion(valor, h);
          })
        }
      }
    })
    return total;
  }

  // METODO PARA ELIMINAR PLANIFICACION GENERAL DE HORARIOS
  EliminarPlanificacion(valor: any, horario: any) {
    let plan_fecha = {
      codigo: this.datoEmpleado.codigo,
      fec_final: valor.fecha,
      fec_inicio: valor.fecha,
      id_horario: horario.id_horario,
    };
    this.restP.BuscarFechas(plan_fecha).subscribe(res => {
      // METODO PARA ELIMINAR DE LA BASE DE DATOS
      this.restP.EliminarRegistro(res).subscribe(datos => {
      })
    })
  }

  // METODO PARA LEER DATOS CON HORARIO
  LeerDatosConHorario(seleccionados: any, total: number, origen: any) {
    let cont1 = 0;
    let cont2 = 0;
    let cont3 = 0;
    // SELECCIONADOS CON HORARIOS
    seleccionados.forEach(valor => {
      cont1 = cont1 + 1;
      valor.horarios.forEach(h => {
        this.restD.ConsultarUnDetalleHorario(h.id_horario).subscribe(res => {
          cont2 = cont2 + 1;
          if (res.length != 0) {
            // COLOCAR DETALLE DE DIA SEGUN HORARIO
            res.map(deta => {
              cont3 = cont3 + 1;
              //console.log('ver detalle ', deta)
              var accion = 0;
              var nocturno: number = 0;
              if (deta.tipo_accion === 'E') {
                accion = deta.minu_espera;
              }
              if (deta.segundo_dia === true) {
                nocturno = 1;
              }
              else if (deta.tercer_dia === true) {
                nocturno = 2;
              }
              else {
                nocturno = 0;
              }

              let plan = {
                codigo: this.datoEmpleado.codigo,
                tipo_dia: valor.tipo_dia,
                min_antes: deta.min_antes,
                tolerancia: accion,
                id_horario: h.id_horario,
                min_despues: deta.min_despues,
                fec_horario: valor.fecha,
                estado_origen: origen,
                estado_timbre: valor.tipo_dia,
                id_empl_cargo: this.datoEmpleado.idCargo,
                id_det_horario: deta.id,
                salida_otro_dia: nocturno,
                tipo_entr_salida: deta.tipo_accion,
                fec_hora_horario: valor.fecha + ' ' + deta.hora,
              };
              if (deta.segundo_dia === true) {
                plan.fec_hora_horario = moment(valor.fecha).add(1, 'd').format('YYYY-MM-DD') + ' ' + deta.hora;
              }
              if (deta.tercer_dia === true) {
                plan.fec_hora_horario = moment(valor.fecha).add(2, 'd').format('YYYY-MM-DD') + ' ' + deta.hora;
              }
              // ALMACENAMIENTO DE PLANIFICACION GENERAL
              this.plan_general = this.plan_general.concat(plan);

              if (cont3 === res.length) {
                cont3 = 0;
                if (cont1 === seleccionados.length) {
                  if (cont2 === total) {
                    console.log('ver data plan generala ', this.plan_general);
                    this.InsertarPlanificacion();
                  }
                }
              }
            })
          }
          else {
            let plan = {
              codigo: this.datoEmpleado.codigo,
              tipo_dia: valor.tipo_dia,
              min_antes: 0,
              tolerancia: 0,
              id_horario: h.id_horario,
              min_despues: 0,
              fec_horario: valor.fecha,
              estado_origen: origen,
              estado_timbre: valor.tipo_dia,
              id_empl_cargo: this.datoEmpleado.idCargo,
              id_det_horario: null,
              salida_otro_dia: 99,
              tipo_entr_salida: 'HA',
              fec_hora_horario: valor.fecha,
            };
            // ALMACENAMIENTO DE PLANIFICACION GENERAL
            this.plan_general = this.plan_general.concat(plan);

            if (cont3 === res.length) {
              cont3 = 0;
              if (cont1 === seleccionados.length) {
                if (cont2 === total) {
                  console.log('ver data plan generala ', this.plan_general)
                  this.InsertarPlanificacion();
                }
              }
            }
          }
        })
      })
    })
  }

  // METODO PARA INGRESAR DATOS A LA BASE
  InsertarPlanificacion() {
    this.restP.CrearPlanGeneral(this.plan_general).subscribe(res => {
      if (res.message === 'OK') {
        //this.progreso = false;
        this.toastr.success('Operación exitosa.', 'Planificación horaria registrada.', {
          timeOut: 6000,
        });
        this.CerrarVentana();
      }
      else {
        //this.progreso = false;
        this.toastr.error('Ups!!! se ha producido un error.', 'Verificar la planificación.', {
          timeOut: 6000,
        });
        this.CerrarVentana();
      }
    }, error => {
      //this.progreso = false;
      this.toastr.error('Ups!!! se ha producido un error.', 'Verificar la planificación.', {
        timeOut: 6000,
      });
      this.CerrarVentana();
    })
    //this.AuditarPlanificar(form);
  }

  // METODO PARA CERRAR VENTANA
  CerrarVentana() {
    if (this.datoEmpleado.pagina === 'ver-empleado') {
      this.componentev.ver_rotativo = true;
      this.componentev.registrar_rotativo = false;
    }
  }


}


