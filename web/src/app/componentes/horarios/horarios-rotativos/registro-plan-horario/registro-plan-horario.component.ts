import { MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, ThemePalette } from '@angular/material/core';
import { Component, OnInit, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDatepicker } from '@angular/material/datepicker';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { default as _rollupMoment, Moment } from 'moment';
import moment from 'moment';

import { DetalleCatHorariosService } from 'src/app/servicios/horarios/detalleCatHorarios/detalle-cat-horarios.service';
import { EmpleadoHorariosService } from 'src/app/servicios/horarios/empleadoHorarios/empleado-horarios.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { PlanGeneralService } from 'src/app/servicios/planGeneral/plan-general.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { FeriadosService } from 'src/app/servicios/catalogos/catFeriados/feriados.service';
import { HorarioService } from 'src/app/servicios/catalogos/catHorarios/horario.service';
import { TimbresService } from 'src/app/servicios/timbres/timbres.service';

import { HorarioMultipleEmpleadoComponent } from '../../rango-fechas/horario-multiple-empleado/horario-multiple-empleado.component';
import { BuscarPlanificacionComponent } from '../../rango-fechas/buscar-planificacion/buscar-planificacion.component';
import { HorariosEmpleadoComponent } from 'src/app/componentes/rolEmpleado/horarios-empleado/horarios-empleado.component';
import { VerEmpleadoComponent } from 'src/app/componentes/empleado/ver-empleado/ver-empleado.component';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-registro-plan-horario',
  templateUrl: './registro-plan-horario.component.html',
  styleUrls: ['./registro-plan-horario.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
  ],
})

export class RegistroPlanHorarioComponent implements OnInit {

  @Input() datoEmpleado: any;

  // VARIABLES PROGRESS SPINNER
  progreso: boolean = false;
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 10;

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

  expansion: boolean = false;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    public componentev: VerEmpleadoComponent,
    public componentem: HorarioMultipleEmpleadoComponent,
    public componenteb: BuscarPlanificacionComponent,
    public componentep: HorariosEmpleadoComponent,
    public parametro: ParametrosService,
    public feriado: FeriadosService,
    public validar: ValidacionesService,
    public horario: EmpleadoHorariosService,
    public timbrar: TimbresService,
    public router: Router,
    public restE: EmpleadoService,
    public restD: DetalleCatHorariosService,
    public restH: HorarioService,
    public restP: PlanGeneralService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

    this.BuscarHorarios();
    this.BuscarHora();
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
      });
  }

  // VARIABLES DE ALMACENAMIENTO DE DATOS ESPECIFICOS DE UN HORARIO
  detalles_horarios: any = [];
  vista_horarios: any = [];
  vista_descanso: any = [];
  lista_descanso: any = [];
  hora_entrada: any;
  hora_salida: any;
  segundo_dia: any;
  tercer_dia: any;
  // METODO PARA MOSTRAR NOMBRE DE HORARIO CON DETALLE DE ENTRADA Y SALIDA
  BuscarHorarios() {
    this.horarios = [];
    this.vista_horarios = [];
    this.vista_descanso = [];
    this.lista_descanso = [];
    // BUSQUEDA DE HORARIOS
    this.restH.BuscarListaHorarios().subscribe(datos => {
      this.horarios = datos;
      this.horarios.map((hor: any) => {
        // BUSQUEDA DE DETALLES DE ACUERDO AL ID DE HORARIO
        this.restD.ConsultarUnDetalleHorario(hor.id).subscribe(res => {
          this.detalles_horarios = res;
          this.detalles_horarios.map((det: any) => {
            if (det.tipo_accion === 'E') {
              this.hora_entrada = det.hora.slice(0, 5);
            }
            if (det.tipo_accion === 'S') {
              this.hora_salida = det.hora.slice(0, 5);
              this.segundo_dia = det.segundo_dia;
              this.tercer_dia = det.tercer_dia;
            }
          })
          let datos_horario = [{
            id: hor.id,
            nombre: hor.codigo + ' (' + this.hora_entrada + '-' + this.hora_salida + ')',
            codigo: hor.codigo,
            entrada: this.hora_entrada,
            salida: this.hora_salida,
            segundo_dia: this.segundo_dia,
            tercer_dia: this.tercer_dia,
          }]
          hor.detalles = datos_horario[0];
          if (hor.default_ === 'DL' || hor.default_ === 'DFD') {
            this.vista_descanso = this.vista_descanso.concat(datos_horario);
            let descanso = {
              tipo: hor.default_,
              id_horario: hor.id,
              detalle: this.detalles_horarios
            }
            this.lista_descanso = this.lista_descanso.concat(descanso);
          }
          else {
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
    // VERIFICAR SI LAS FECHAS ESTAN INGRESADAS DE FORMA CORRECTA
    if (Date.parse(feci) <= Date.parse(fecf)) {
      let datosBusqueda = {
        id_empleado: parseInt(this.datoEmpleado.idEmpleado)
      }
      // METODO PARA BUSCAR FECHA DE CONTRATO REGISTRADO EN FICHA DE EMPLEADO
      this.restE.BuscarFechaContrato(datosBusqueda).subscribe(response => {
        // VERIFICAR SI LAS FECHAS SON VALIDAS DE ACUERDO A LOS REGISTROS Y FECHAS INGRESADAS (CONTRATO)
        //--console.log('ver fechas ', feci, ' ', fecf)
        if ((Date.parse(response[0].fecha_ingreso.split('T')[0]) <= Date.parse(feci)) &&
          (Date.parse(response[0].fecha_salida.split('T')[0]) >= Date.parse(fecf))) {
          // REGISTRO DE LA FECHA EN EL FORMULARIO
          if (opcion === 1) {
            formulario.setValue(moment(inicio, 'DD/MM/YYYY'));
          }
          else {
            formulario.setValue(moment(final, 'DD/MM/YYYY'));
          }
        }
        else {
          this.toastr.warning('Las fechas ingresadas no estan dentro del contrato vigente del empleado.', 'Ups!!! algo salio mal.', {
            timeOut: 6000,
          });
        }
      });
    }
    else {
      // METODO PARA VERIFICAR SI EL EMPLEADO INGRESO CORRECTAMENTE LAS FECHAS
      this.toastr.warning('La fecha no se registro. Ups!!! la fecha no es correcta.', 'VERIFICAR', {
        timeOut: 6000,
      });
    }
  }

  // METODO PARA SELECCIONAR TIPO DE BUSQUEDA
  GenerarCalendario() {
    this.ver_horario = true;
    this.cargar = false;
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
  hora_feriado: boolean = false;
  ListarFechas(fecha_inicio: any, fecha_final: any) {
    this.fechas_mes = []; // ARRAY QUE CONTIENE TODAS LAS FECHAS DEL MES INDICADO

    this.dia_inicio = moment(fecha_inicio, 'YYYY-MM-DD').format('YYYY-MM-DD');
    this.dia_fin = moment(fecha_final, 'YYYY-MM-DD').format('YYYY-MM-DD');
    // LOGICA PARA OBTENER EL NOMBRE DE CADA UNO DE LOS DIAS DEL PERIODO INDICADO
    while (this.dia_inicio <= this.dia_fin) {
      let fechas = {
        fecha: this.dia_inicio,
        dia: (moment(this.dia_inicio).format('dddd')).toUpperCase(),
        num_dia: moment(this.dia_inicio, 'YYYY/MM/DD').isoWeekday(),
        formato: (moment(this.dia_inicio).format('MMMM, ddd DD, YYYY')).toUpperCase(),
        mes: moment(this.dia_inicio).format('MMMM').toUpperCase(),
        anio: moment(this.dia_inicio).format('YYYY'),
        horarios: [],
        registrados: [],
        tipo_dia: '-',
        estado: false,
        observacion: '',
        horarios_existentes: '',
        supera_jornada: '',
        horas_superadas: '',
        tipo_dia_origen: '-', // TRATAMIENTO LIBRES Y FERIADOS
      }
      this.fechas_mes.push(fechas);
      var newDate = moment(this.dia_inicio).add(1, 'd').format('YYYY-MM-DD')
      this.dia_inicio = newDate;
    }
    // TRATAMIENTO DE FERIADOS
    this.fechas_mes.forEach((obj: any) => {
      // BUSCAR FERIADOS
      if (this.feriados.length != 0) {
        //---console.log('ingresa feriados ', this.feriados)
        for (let i = 0; i < this.feriados.length; i++) {
          //---console.log('fecha feriados ', moment(this.feriados[i].fecha, 'YYYY-MM-DD').format('YYYY-MM-DD'))
          //---console.log('obj ', obj)
          if (moment(this.feriados[i].fecha, 'YYYY-MM-DD').format('YYYY-MM-DD') === obj.fecha) {
            obj.tipo_dia = 'FD';
            obj.estado = true;
            obj.observacion = 'FERIADO*';
            obj.tipo_dia_origen = 'DFD';
            this.hora_feriado = true;
            const [datoHorario] = this.horarios.filter((o: any) => {
              return o.default_ === 'DFD';
            })
            let data = [{
              horario: datoHorario.codigo,
              detalles: datoHorario.detalles,
              id_horario: datoHorario.id,
              hora_trabajo: datoHorario.hora_trabajo,
              verificar: '',
            }]
            obj.horarios = data;
            break;
          }
        }
      }
      // BUSCAR FECHAS DE RECUPERACION DE FERIADOS
      if (this.recuperar.length != 0) {
        for (let j = 0; j < this.recuperar.length; j++) {
          if (moment(this.recuperar[j].fecha_recuperacion, 'YYYY-MM-DD').format('YYYY-MM-DD') === obj.fecha) {
            obj.tipo_dia = 'N';
            obj.observacion = 'RECUPERACIÓN*';
            break;
          }
        }
      }
      // METODO DE BUSQUEDA DE PLANIFICACIONES EXISTENTES
      let fechas = {
        fechaInicio: obj.fecha,
        fechaFinal: obj.fecha,
      };
      this.horario.VerificarHorariosExistentes(this.datoEmpleado.idEmpleado, fechas).subscribe(existe => {
        obj.horarios_existentes = '***';
        obj.registrados = existe;
        if (existe.length === 1) {
          if (existe[0].default_ === 'DL') {
            obj.estado = false;
          }
        }
      }, error => {
        obj.horarios_existentes = '';
      });
    })
    //---console.log('ver fechas ', this.fechas_mes)
  }

  // METODO PARA CAMBIAR DE COLORES SEGUN EL MES
  CambiarColores(opcion: any) {
    let color: string;
    switch (opcion) {
      case 'OK':
        return color = '#115703';
      case 'Horario ya existe.':
        return color = '#DC341A';
      case '1':
        return color = '#FFFFFF';
      case 6:
        return color = '#F6DDCC';
      case 7:
        return color = '#F6DDCC';
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
    this.valor = this.horarioF.value;
  }

  // METODO PARA VALIDAR SELECCION DE HORARIO
  ValidarHorario() {
    const [obj_res] = this.horarios.filter((o: any) => {
      return o.codigo === this.horarioF.value
    })
    if (!obj_res) return this.toastr.warning('Horario no válido.');
    const { hora_trabajo, id, codigo, minutos_comida } = obj_res;
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
      this.ObtenerDetallesHorario(id, codigo, minutos_comida);
    }
  }

  // METODO PARA SUMAR HORAS
  StringTimeToSegundosTime(stringTime: string) {
    const h = parseInt(stringTime.split(':')[0]) * 3600;
    const m = parseInt(stringTime.split(':')[1]) * 60;
    const s = parseInt(stringTime.split(':')[2]);
    return h + m + s
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
      this.detalles.forEach((obj: any) => {
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
      this.detalle_acciones.forEach((detalle: any) => {
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
  lista_eliminar: any = [];
  IngresarHorario(index: number) {
    //---console.log('verificar existencias ', this.fechas_mes[index])
    //---console.log('tipo dia origen', this.fechas_mes[index].tipo_dia_origen)
    this.cargar = false;
    let verificador = 0;
    let procesar = 0;
    this.ControlarBotones(true, false);
    const [datoHorario] = this.horarios.filter((o: any) => {
      return o.codigo === this.horarioF.value
    })
    //---console.log('ver horario ', datoHorario)
    let data = {
      horario: this.horarioF.value,
      detalles: datoHorario.detalles,
      id_horario: datoHorario.id,
      hora_trabajo: datoHorario.hora_trabajo,
    }
    // SI EL DIA ES FERIADO, INGRESAR HORARIOS TIPO LIBRES O FERIADOS
    if (this.fechas_mes[index].tipo_dia_origen === 'DFD') {
      if (datoHorario.default_ === 'FD' || datoHorario.default_ === 'L') {
        procesar = 0
      }
      else {
        procesar = 1;
      }
    }
    // PROCESAMIENTO DE LOS DATOS AL CUMPLIR LAS CONDICIONES
    if (procesar === 0) {
      // EXISTEN HORARIOS REGISTRADOS
      if (this.fechas_mes[index].registrados.length === 1) {
        if (this.fechas_mes[index].registrados[0].default_ === 'DL' || this.fechas_mes[index].registrados[0].default_ === 'DFD') {
          let eliminar = {
            fecha: this.fechas_mes[index].fecha,
            id_horarios: this.fechas_mes[index].registrados[0].id_horario,
          }
          this.lista_eliminar = this.lista_eliminar.concat(eliminar);
          this.fechas_mes[index].registrados = [];
        }
      }
      //---console.log('tipo dia ', this.fechas_mes[index].tipo_dia, ' observa ', this.fechas_mes[index].observacion, ' registrados ', this.fechas_mes[index].registrados)
      //---console.log('fechas mes ', this.fechas_mes[index], 'ver data horario ', data.detalles.segundo_dia)
      console.log('tipo dia origen', this.fechas_mes[index].tipo_dia_origen)
      // DIA REGISTRADO COMO LIBRE
      if (this.fechas_mes[index].tipo_dia_origen === 'DL') {
        this.EliminarLibre(index)
      }
      //---console.log('horarios ', this.fechas_mes[index].horarios)
      // LECTURA DE HORARIOS ASIGNADOS
      for (let i = 0; i < this.fechas_mes[index].horarios.length; i++) {
        if (this.fechas_mes[index].horarios[i].horario != 'DEFAULT-FERIADO') {
          if (this.fechas_mes[index].horarios[i].horario === this.horarioF.value) {
            verificador = 1;
            break
          }
          else {
            if (this.fechas_mes[index].horarios[i].detalles.segundo_dia === false && data.detalles.segundo_dia === false) {
              if (this.fechas_mes[index].horarios[i].detalles.salida < data.detalles.entrada) {
                verificador = 0;
              }
              else if (this.fechas_mes[index].horarios[i].detalles.entrada > data.detalles.salida) {
                verificador = 0
              }
              else {
                verificador = 2;
                break;
              }
            }
            else if (this.fechas_mes[index].horarios[i].detalles.segundo_dia === true && data.detalles.segundo_dia === true) {
              verificador = 2;
              break;
            }
            else if (this.fechas_mes[index].horarios[i].detalles.segundo_dia === false && data.detalles.segundo_dia === true) {
              if (this.fechas_mes[index].horarios[i].detalles.entrada > data.detalles.salida
                && this.fechas_mes[index].horarios[i].detalles.salida > data.detalles.salida
                && this.fechas_mes[index].horarios[i].detalles.salida < data.detalles.entrada) {
                verificador = 0;
              }
              else {
                verificador = 2;
                break;
              }
            }
            else if (this.fechas_mes[index].horarios[i].detalles.segundo_dia === true && data.detalles.segundo_dia === false) {
              if (this.fechas_mes[index].horarios[i].detalles.salida < data.detalles.entrada
                && this.fechas_mes[index].horarios[i].detalles.salida < data.detalles.salida
                && this.fechas_mes[index].horarios[i].detalles.entrada > data.detalles.salida) {
                verificador = 0;
              }
              else {
                verificador = 2;
                break;
              }
            }
          }
        }
        else {
          verificador = 0;
          this.fechas_mes[index].horarios.splice(i, 1);
        }
      }
      //---console.log('ver data ', this.fechas_mes[index])
      if (verificador === 0) {
        this.fechas_mes[index].estado = true;
        this.fechas_mes[index].tipo_dia = datoHorario.default_;
        this.fechas_mes[index].tipo_dia_origen = datoHorario.default_;
        this.fechas_mes[index].horarios = this.fechas_mes[index].horarios.concat(data);
      }
      else if (verificador === 1) {
        this.toastr.warning('Horario ya se encuentra registrado.', 'Ups!!! VERIFICAR.', {
          timeOut: 6000,
        });
      }
      else if (verificador === 2) {
        this.toastr.warning('No es posible registrar horarios con rangos de tiempo similares.', 'Ups!!! VERIFICAR.', {
          timeOut: 6000,
        });
      }
    }
    else {
      this.toastr.warning('Día configurado como FERIADO dentro del sistema.', 'Ups!!! VERIFICAR.', {
        timeOut: 6000,
      });
    }
  }

  // METODO PARA INGRESAR HORARIO
  IngresarLibre(index: number) {
    this.cargar = false;
    let verificador = 0;
    this.ControlarBotones(true, false);
    const [datoHorario] = this.horarios.filter((o: any) => {
      return o.default_ === 'DL';
    })
    let data = [{
      horario: datoHorario.codigo,
      detalles: datoHorario.detalles,
      id_horario: datoHorario.id,
      hora_trabajo: datoHorario.hora_trabajo,
      verificar: '',
    }]
    //---console.log('ver libre ', this.fechas_mes[index], 'data ', data)
    if (this.fechas_mes[index].registrados.length === 1) {
      if (this.fechas_mes[index].registrados[0].default_ === 'DL') {
        this.toastr.info('Ya se encuentra registrado como día de descanso.', 'Ups!!! VERIFICAR.', {
          timeOut: 6000,
        });
      }
      else {
        this.toastr.warning('Ya se encuentra registrada una planificación horaria.', 'Ups!!! VERIFICAR.', {
          timeOut: 6000,
        });
      }
    }
    else if (this.fechas_mes[index].registrados.length > 1) {
      this.toastr.warning('Ya se encuentra registrada una planificación horaria.', 'Ups!!! VERIFICAR.', {
        timeOut: 6000,
      });
    }
    else {
      verificador = 1;
    }
    if (verificador === 1) {
      if (this.fechas_mes[index].tipo_dia_origen === 'DL') {
        this.EliminarLibre(index)
      }
      else {
        this.fechas_mes[index].horarios = [];
        this.fechas_mes[index].horarios_existentes = '';
        this.fechas_mes[index].estado = true;
        this.fechas_mes[index].tipo_dia = 'L';
        this.fechas_mes[index].tipo_dia_origen = 'DL';
        this.fechas_mes[index].horarios = this.fechas_mes[index].horarios.concat(data);
        //---console.log('ver libre------- ', this.fechas_mes[index])
      }
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
      this.fechas_mes[index].estado = false;
      this.fechas_mes[index].horas_validas = '';
    }
    this.fechas_mes[index].horas_superadas = '';
    this.fechas_mes[index].supera_jornada = '';
  }

  // METODO PARA ELIMINAR HORARIOS LIBRES
  EliminarLibre(index: number) {
    this.ControlarBotones(true, false);
    for (let i = 0; i < this.fechas_mes[index].horarios.length; i++) {
      if (this.fechas_mes[index].tipo_dia_origen === 'DL') {
        this.fechas_mes[index].tipo_dia = '-';
        this.fechas_mes[index].tipo_dia_origen = '-';
        this.fechas_mes[index].estado = false;
        this.fechas_mes[index].horarios.splice(i, 1);
        break
      }
    }
    //---console.log('ver fechas final', this.fechas_mes)
  }

  // METODO PARA VALIDAR DATOS SELECCIONADOS
  data_horarios: any = [];
  VerificarHorario(opcion: number) {
    let verificador = 0;
    this.data_horarios = [];
    //---console.log('ver fechas origen ', this.fechas_mes, ' form ', this.horarioF.value);
    this.fechas_mes.forEach((obj: any) => {
      if (obj.estado === true) {
        verificador = verificador + 1;
        this.data_horarios = this.data_horarios.concat(obj);
      }
    })
    //---console.log('verificador ', verificador);
    if (verificador > 0) {
      console.log('ingresa ver datos seleccionados ', this.data_horarios)
      this.VerificarDuplicidad(opcion);
    }
    else {
      this.toastr.warning('No ha registrado horarios.', 'Ups!!! VERIFICAR.', {
        timeOut: 6000,
      });
    }
    //---console.log('ver datos seleccionados ', this.data_horarios)
  }

  // METODO PARA VERIFICAR DUPLICIDAD DE REGISTROS
  iterar: number = 0;
  leer_horario: number = 0;
  contar_duplicado: number = 0;
  sin_duplicidad: any = [];
  VerificarDuplicidad(opcion: number) {
    //---console.log('duplicidad ', this.data_horarios);
    this.sin_duplicidad = [];
    let total = 0;
    this.data_horarios.forEach((obj: any) => {
      total = total + obj.horarios.length
    })
    this.contar_duplicado = 0;
    this.leer_horario = 0;
    this.iterar = 0;
    this.data_horarios.forEach((obj: any) => {
      this.iterar = this.iterar + 1;
      obj.horarios.forEach((h: any) => {
        const [horario] = this.horarios.filter((o: any) => {
          return o.codigo === h.horario
        })
        let fechas = {
          fechaInicio: obj.fecha,
          fechaFinal: obj.fecha,
          id_horario: horario.id
        };
        h.verificar = 'OK';
        obj.supera_jornada = '';
        obj.horas_superadas = '';
        //---console.log('ver datos de horario ', fechas)
        this.horario.VerificarDuplicidadHorarios(this.datoEmpleado.idEmpleado, fechas).subscribe(existe => {
          this.leer_horario = this.leer_horario + 1;
          this.contar_duplicado = 1;
          h.verificar = 'Horario ya existe.';
          //---console.log('duplicado ', this.contar_duplicado)
          if (this.iterar === this.data_horarios.length) {
            if (this.leer_horario === total) {
              this.ValidarHorarioByHorasTrabaja(opcion)
            }
          }
        }, error => {
          this.leer_horario = this.leer_horario + 1;
          if (this.iterar === this.data_horarios.length) {
            if (this.leer_horario === total) {
              this.ValidarHorarioByHorasTrabaja(opcion)
            }
          }
        });
      })
      //---console.log('duplicaso for', this.contar_duplicado)
    })
    this.data_horarios.forEach((obj: any) => {
      this.fechas_mes.forEach((fec: any) => {
        if (obj.fecha === fec.fecha) {
          fec.horarios = obj.horarios;
        }
      })
    })
    //---console.log('data_horarios ', this.data_horarios)
  }

  // METODO PARA VALIDAR HORAS DE TRABAJO SEGUN ULTIMO CARGO
  sumHoras: any;
  suma = '00:00:00';
  horariosEmpleado: any = [];
  iterar2: number = 0;
  leer_horario2: number = 0;
  ValidarHorarioByHorasTrabaja(opcion: number) {
    const trabajo = this.datoEmpleado.horas_trabaja;
    let suma1 = '00:00:00';
    let suma2 = '00:00:00';
    this.iterar2 = 0;
    this.leer_horario2 = 0;
    let horario1: number = 0;
    let horario2: number = 0;
    let iterar3 = 0;
    let iterar4 = 0;
    // LEER HORAS DE HORARIOS SELECCIONADOS
    this.data_horarios.forEach((obj: any) => {
      this.iterar2 = this.iterar2 + 1;
      obj.horas_seleccionadas = suma1;
      obj.horas_registradas = suma2;
      obj.horarios.forEach((valor: any) => {
        horario1 = horario1 + 1;
        // SUMA DE HORAS DE CADA UNO DE LOS HORARIOS SELECCIONADOS
        suma1 = this.SumarHoras(suma1, valor.hora_trabajo);
        if (obj.horarios.length === horario1) {
          obj.horas_seleccionadas = suma1;
          horario1 = 0;
          suma1 = '00:00:00';
        }
      })
    })

    // LEER HORAS DE HORARIOS REGISTRADOS O EXISTENTES
    if (this.iterar2 === this.data_horarios.length) {
      this.data_horarios.forEach((obj: any) => {
        iterar3 = iterar3 + 1;
        obj.registrados.map((h: any) => {
          horario2 = horario2 + 1;
          //---console.log('h ', h)
          //---console.log('hora trabajo  ---- ', h.hora_trabajo)
          // SUMA DE HORAS DE CADA UNO DE LOS HORARIOS DEL EMPLEADO
          if (h.default_ != 'DL' && h.default_ != 'DFD') {
            suma2 = this.SumarHoras(suma2, h.hora_trabajo);
          }
          //---console.log('horario 2 ---- ', horario2, ' original ', obj.registrados.length)
          if (horario2 === obj.registrados.length) {
            obj.horas_registradas = suma2;
            horario2 = 0;
            suma2 = '00:00:00';
            //---console.log('iterar 2 ---- ', this.iterar2, ' original ', this.data_horarios.length)
          }
        })
      })
    }

    if (iterar3 === this.data_horarios.length) {
      this.data_horarios.forEach((obj: any) => {
        this.leer_horario2 = this.leer_horario2 + 1;
        //---console.log('ingresa  ', obj.tipo_dia_origen)
        if (obj.tipo_dia_origen != 'DL' && obj.tipo_dia_origen != 'DFD') {
          //---console.log('ver valor ****', obj.horas_registradas, obj.horas_seleccionadas)
          let suma3 = this.SumarHoras(obj.horas_seleccionadas, obj.horas_registradas);
          if (this.StringTimeToSegundosTime(suma3) <= this.StringTimeToSegundosTime(trabajo)) {
            obj.horas_validas = 'OK';
          }
          else {
            obj.horas_validas = 'OK';
            obj.supera_jornada = 'OK';
            obj.horas_superadas = 'Jornada superada: ' + suma3;
          }
        }
      })
    }
    //---console.log('iterar2 ', this.leer_horario2, ' ver original ', this.data_horarios.length)
    //---console.log('leer horario 2 ---- ', this.leer_horario2, ' original ', this.data_horarios.length)
    if (this.leer_horario2 === this.data_horarios.length) {
      this.data_horarios.forEach((obj: any) => {
        iterar4 = iterar4 + 1;
        this.VerificarHorarioRangos(obj.registrados, obj.horarios, obj.tipo_dia, obj);
      })
    }
    if (iterar4 === this.data_horarios.length) {
      this.LeerDatosValidos(opcion);
    }
    //---console.log('ver data horarios ', this.data_horarios)
  }

  // METODO PARA LEER DATOS VALIDOS
  LeerDatosValidos(opcion: number) {
    //---console.log('datos a verificar *****', this.data_horarios)
    let datos: any = [];
    this.data_horarios.forEach((valor: any) => {
      if (valor.horas_validas === 'OK') {
        datos = datos.concat(valor);
      }
    })
    if (datos.length === 0) {
      this.toastr.warning('', 'Ups!!! verificar calendario.', {
        timeOut: 6000,
      });
      this.ControlarBotones(true, false);
    }
    else {
      //---console.log('datos eliminar', this.lista_eliminar)
      if (opcion === 2) {
        this.progreso = true;
      }
      this.CrearPlanGeneral(datos, opcion);
    }
    //---console.log('datos finales ', datos)
  }

  // METODO PARA CREAR LISTA DE PLANIFICACION
  plan_general: any = [];
  CrearPlanGeneral(seleccionados: any, opcion: number) {
    //---console.log('ver general ', seleccionados)
    this.plan_general = [];
    var origen: string = '';
    if (opcion === 2) {
      if (this.lista_eliminar.length != 0) {
        //---console.log('ingresa eliminar ')
        // ELIMINACION HORARIOS LIBRES - FERIADOS
        this.EliminarPlanificacion(seleccionados, origen, opcion);
      }
      else {
        this.LeerDatosConHorario(seleccionados, origen, opcion);
      }
    }
    else {
      this.LeerDatosConHorario(seleccionados, origen, opcion);
    }
    //---console.log('ver datos totala ', total)
  }

  // METODO PARA VERIFICAR QUE NO EXISTAN HORARIOS DENTRO DE LOS MISMOS RANGOS
  VerificarHorarioRangos(existe: any, ingresados: any, tipo: any, valor: any) {
    //---console.log('existentes------ ', existe)
    //--console.log('horarios ', this.horarios)
    //--console.log('seleccionado ', ingresados)
    //--console.log('data horarios ', this.data_horarios.length, ' data h ', this.data_horarios)
    this.horarios.forEach((obj: any) => {
      for (var h = 0; h < existe.length; h++) {
        if (obj.id === existe[h].id_horario) {
          existe[h].detalles = obj.detalles;
          break;
        }
      }
    })
    //--console.log('existentes...---- ', existe)
    for (var i = 0; i < existe.length; i++) {
      //--console.log('ver i ', i)
      if ((tipo === 'N' || tipo === 'HA' || tipo === 'N' || tipo === 'HA') && valor.tipo_dia_origen != 'DFD' && valor.tipo_dia_origen != 'DL') {
        for (var k = 0; k < ingresados.length; k++) {
          //--console.log('horarios ... ', ingresados[k].detalles.segundo_dia)
          //--console.log('ver K ', k)
          //--console.log('ver datos ****** ', existe[i].detalles.segundo_dia)
          if (existe[i].detalles.segundo_dia === false && ingresados[k].detalles.segundo_dia === false) {
            if (existe[i].detalles.salida < ingresados[k].detalles.entrada) {
              valor.horas_validas = 'OK';
            }
            else if (existe[i].detalles.entrada > ingresados[k].detalles.salida) {
              valor.horas_validas = 'OK';
            }
            else {
              valor.horas_validas = 'Horarios con rangos de jornada similares.';
              break;
            }
          }
          else if (existe[i].detalles.segundo_dia === true && ingresados[k].detalles.segundo_dia === true) {
            valor.horas_validas = 'Horarios con rangos de jornada similares.';
            break;
          }
          else if (existe[i].detalles.segundo_dia === false && ingresados[k].detalles.segundo_dia === true) {
            if (existe[i].detalles.entrada > ingresados[k].detalles.salida
              && existe[i].detalles.salida > ingresados[k].detalles.salida
              && existe[i].detalles.salida < ingresados[k].detalles.entrada) {
              valor.horas_validas = 'OK';
            }
            else {
              valor.horas_validas = 'Horarios con rangos de jornada similares.';
              break;
            }
          }
          else if (existe[i].detalles.segundo_dia === true && ingresados[k].detalles.segundo_dia === false) {
            if (existe[i].detalles.salida < ingresados[k].detalles.entrada
              && existe[i].detalles.salida < ingresados[k].detalles.salida
              && existe[i].detalles.entrada > ingresados[k].detalles.salida) {
              valor.horas_validas = 'OK';
            }
            else {
              valor.horas_validas = 'Horarios con rangos de jornada similares.';
              break;
            }
          }
        }
      }
    }
  }

  // METODO PARA VALIDAR RANGOS DE TIEMPOS EN HORARIOS
  ValidarRangos(lista: any) {
    var datos_o: any = [];
    var datos: any = [];
    lista.forEach((obj: any) => {
      if (obj.salida_otro_dia === 1) {
        datos = datos.concat(obj)
      }
      else {
        datos_o = datos_o.concat(obj);
      }
    })
    datos.forEach((ele: any) => {
      for (var i = 0; i < datos_o.length; i++) {

        if (ele.codigo === datos_o[i].codigo) {

          if ((moment(datos_o[i].fecha_hora_horario).format('YYYY-MM-DD') === moment(ele.fecha_hora_horario).format('YYYY-MM-DD')) &&
            datos_o[i].tipo_accion === 'E' && ele.tipo_accion === 'S' && datos_o[i].tipo_dia === 'N') {

            if (moment(datos_o[i].fecha_hora_horario).format('HH:mm:ss') <= moment(ele.fecha_hora_horario).format('HH:mm:ss')) {
              //--console.log('existen horarios en rangos de tiempo similares ', contador)
              this.data_horarios.forEach((li: any) => {
                if (li.fecha === moment(ele.fecha_hora_horario).format('YYYY-MM-DD')) {
                  li.horas_validas = 'RANGOS DE TIEMPO SIMILARES'
                }
              })
              break;
            }
            /*
                        console.log(obj.codigo)
                        console.log(moment(obj.fec_hora_horario).format('YYYY-MM-DD'))
                        console.log(moment(obj.fec_hora_horario).format('HH:mm:ss'))
                        console.log('datos ')
                        console.log(moment(ele.fec_hora_horario).format('YYYY-MM-DD'))
                        console.log(moment(ele.fec_hora_horario).format('HH:mm:ss'))
                        console.log('-------------------------------------------------- ')*/
          }
        }
      }
    })
    //---console.log('validos ', this.data_horarios)
    this.ControlarBotones(false, true);
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

  // METODO PARA GUARDAR DATOS
  guardar: any = [];
  GuardarDatos(opcion: number) {
    console.log('datos a verificar ', this.data_horarios)
    let datos: any = [];
    this.data_horarios.forEach((valor: any) => {
      if (valor.horas_validas === 'OK') {
        datos = datos.concat(valor);
      }
      if (valor.tipo_dia_origen === 'DL') {
        datos = datos.concat(valor);
      }
      if (valor.tipo_dia_origen === 'DFD') {
        valor.registrados.forEach((r: any) => {
          let eliminar = {
            fecha: valor.fecha,
            id_horarios: r.id_horario,
          }
          this.lista_eliminar = this.lista_eliminar.concat(eliminar);
        })
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
      //---console.log('datos eliminar', this.lista_eliminar)
      this.progreso = true;
      this.CrearPlanGeneral(datos, opcion);
    }
    //---console.log('datos finales ', datos)
  }

  // METODO PARA ELIMINAR PLANIFICACION GENERAL DE HORARIOS
  EliminarPlanificacion(seleccionados: any, origen: any, opcion: number) {
    let verificador = 0;

    let datos = {
      id_plan: [],
      user_name: this.user_name,
      ip: this.ip,
    }
    this.lista_eliminar.forEach((eliminar: any) => {
      let plan_fecha = {
        id_empleado: this.datoEmpleado.idEmpleado,
        fec_final: eliminar.fecha,
        fec_inicio: eliminar.fecha,
        id_horario: eliminar.id_horarios,
      };
      //--console.log('ver plan ', plan_fecha)
      this.restP.BuscarFechas(plan_fecha).subscribe(res => {
        // METODO PARA ELIMINAR DE LA BASE DE DATOS
        this.restP.EliminarRegistro(datos).subscribe(datos => {
          verificador = verificador + 1;
          //--console.log('veriifcador eliminado ', verificador, ' lengh ', this.lista_eliminar.length)
          if (verificador === this.lista_eliminar.length) {
            this.LeerDatosConHorario(seleccionados, origen, opcion);
          }
        })
      }, vacio => {
        verificador = verificador + 1;
        if (verificador === this.lista_eliminar.length) {
          this.LeerDatosConHorario(seleccionados, origen, opcion);
        }
      })
    })
  }

  // METODO PARA LEER DATOS CON HORARIO
  LeerDatosConHorario(seleccionados: any, origen: any, opcion: number) {
    let cont1 = 0;
    let cont2 = 0;
    let cont3 = 0;
    let total = 0;
    //--console.log('ver datos ', seleccionados)
    // SE CONTABILIZA EL TOTAL DE HORARIOS SELEECCIONADOS POR DIA
    seleccionados.forEach((valor: any) => {
      total = total + valor.horarios.length;
    })
    // SELECCIONADOS CON HORARIOS
    seleccionados.forEach((valor: any) => {
      cont1 = cont1 + 1;
      valor.horarios.forEach((h: any) => {
        this.restD.ConsultarUnDetalleHorario(h.id_horario).subscribe(res => {
          cont2 = cont2 + 1;
          if (res.length != 0) {
            // COLOCAR DETALLE DE DIA SEGUN HORARIO
            res.map((deta: any) => {
              cont3 = cont3 + 1;
              //--console.log('ver detalle ', deta)
              var accion = 0;
              var nocturno: number = 0;
              if (deta.tipo_accion === 'E') {
                accion = deta.tolerancia;
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
              // SE COLOCA TIPO DE DIA ACORDE AL TIPO DE HORARIO
              if (valor.tipo_dia_origen === 'DFD') {
                valor.tipo_dia = 'FD';
                origen = 'FD';
              }
              else if (valor.tipo_dia_origen === 'DL') {
                valor.tipo_dia = 'L';
                origen = 'L';
              }
              else if (valor.tipo_dia === 'L') {
                valor.tipo_dia = 'L';
                origen = 'HL';
              }
              else if (valor.tipo_dia === 'FD') {
                valor.tipo_dia = 'FD';
                origen = 'HFD';
              }
              else {
                valor.tipo_dia = 'N';
                origen = 'N';
              }

              let plan = {
                id_empleado: this.datoEmpleado.idEmpleado,
                tipo_dia: valor.tipo_dia,
                min_antes: deta.minutos_antes,
                tolerancia: accion,
                id_horario: h.id_horario,
                min_despues: deta.minutos_despues,
                fec_horario: valor.fecha,
                estado_origen: origen,
                estado_timbre: valor.tipo_dia,
                id_empl_cargo: this.datoEmpleado.idCargo,
                id_det_horario: deta.id,
                salida_otro_dia: nocturno,
                tipo_entr_salida: deta.tipo_accion,
                fec_hora_horario: valor.fecha + ' ' + deta.hora,
                min_alimentacion: deta.minutos_comida,
              };
              if (deta.segundo_dia === true) {
                plan.fec_hora_horario = moment(valor.fecha).add(1, 'd').format('YYYY-MM-DD') + ' ' + deta.hora;
              }
              if (deta.tercer_dia === true) {
                plan.fec_hora_horario = moment(valor.fecha).add(2, 'd').format('YYYY-MM-DD') + ' ' + deta.hora;
              }
              // ALMACENAMIENTO DE PLANIFICACION GENERAL
              this.plan_general = this.plan_general.concat(plan);
              //--console.log('cont 3 ', cont3, 'res leng ', res.length);
              if (cont3 === res.length) {
                cont3 = 0;
                //--console.log('cont 1 ', cont1, 'selec leng ', seleccionados.length);
                if (cont1 === seleccionados.length) {
                  //--console.log('cont 2 ', cont2, 'horarios leng ', total);
                  if (cont2 === total) {
                    //--console.log('ver data plan generala ', this.plan_general);
                    if (opcion === 1) {
                      this.ValidarRangos(this.plan_general);
                    }
                    else {
                      //--console.log('paln_general ', this.plan_general)
                      this.InsertarPlanificacion();
                    }
                  }
                }
              }
            })
          }
        })
      })
    })
  }

  // METODO PARA INGRESAR DATOS A LA BASE
  InsertarPlanificacion() {
    const datos = {
      plan_general: this.plan_general,
      user_name: this.user_name,
      ip: this.ip,
    }
    this.restP.CrearPlanGeneral(datos).subscribe(res => {
      if (res.message === 'OK') {
        this.progreso = false;
        this.toastr.success('Operación exitosa.', 'Planificación horaria registrada.', {
          timeOut: 6000,
        });
        this.cargar = true;
        this.ver_guardar = false;
      }
      else {
        this.progreso = false;
        this.toastr.error('Ups!!! se ha producido un error.', 'Verificar la planificación.', {
          timeOut: 6000,
        });
        this.CerrarVentana();
      }
    }, error => {
      this.progreso = false;
      this.toastr.error('Ups!!! se ha producido un error.', 'Verificar la planificación.', {
        timeOut: 6000,
      });
      this.CerrarVentana();
    })
  }


  // METODO PARA CARGAR TIMBRES
  cargar: boolean = false;
  CargarTimbres() {
    var codigos = '\'' + this.datoEmpleado.codigo + '\'';
    let usuarios = {
      codigo: codigos,
      fec_final: moment(moment(this.fechaFinalF.value).format('YYYY-MM-DD')).add(2, 'days'),
      fec_inicio: moment(this.fechaInicialF.value).format('YYYY-MM-DD'),
    };
    this.timbrar.BuscarTimbresPlanificacion(usuarios).subscribe(datos => {
      //---console.log('datos ', datos)
      if (datos.message === 'vacio') {
        this.toastr.info(
          'No se han encontrado registros de marcaciones.', '', {
          timeOut: 6000,
        })
        this.CerrarVentana();
      }
      else if (datos.message === 'error') {
        this.toastr.info(
          'Ups!!! algo salio mal', 'No se cargaron todos los registros.', {
          timeOut: 6000,
        })
      }
      else {
        this.toastr.success(
          'Operación exitosa.', 'Registros cargados.', {
          timeOut: 6000,
        })
        this.CerrarVentana();
      }
    }, vacio => {
      this.toastr.info(
        'No se han encontrado registros de marcaciones.', '', {
        timeOut: 6000,
      })
    })
  }

  // METODO PARA CERRAR VENTANA
  CerrarVentana() {
    if (this.datoEmpleado.pagina === 'ver-empleado') {
      this.componentev.ver_tabla_horarios = true;
      this.componentev.registrar_rotativo = false;
    }
    else if (this.datoEmpleado.pagina === 'mutiple-horario') {
      this.componentem.seleccionar = true;
      this.componentem.registrar_rotativo = false;
      this.componentem.LimpiarFormulario();
    }
    else if (this.datoEmpleado.pagina === 'busqueda') {
      this.componenteb.registrar_rotativo = false;
      this.componenteb.seleccionar = true;
      this.componenteb.buscar_fechas = true;
      this.componenteb.auto_individual = true;
      this.componenteb.multiple = true;
    }
    else if (this.datoEmpleado.pagina === 'perfil-empleado') {
      this.componentep.ver_tabla_horarios = true;
      this.componentep.registrar_rotativo = false;
    }
  }

}


