import { Component, OnInit, Input } from '@angular/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { MatDatepicker } from '@angular/material/datepicker';
import { ToastrService } from 'ngx-toastr';
import { FormControl } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { default as _rollupMoment, Moment } from 'moment';
import moment from 'moment';

import { HorarioMultipleEmpleadoComponent } from '../../rango-fechas/horario-multiple-empleado/horario-multiple-empleado.component';
import { BuscarPlanificacionComponent } from '../../rango-fechas/buscar-planificacion/buscar-planificacion.component';

import { DetalleCatHorariosService } from 'src/app/servicios/horarios/detalleCatHorarios/detalle-cat-horarios.service';
import { EmpleadoHorariosService } from 'src/app/servicios/horarios/empleadoHorarios/empleado-horarios.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { PlanGeneralService } from 'src/app/servicios/planGeneral/plan-general.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { FeriadosService } from 'src/app/servicios/catalogos/catFeriados/feriados.service';
import { HorarioService } from 'src/app/servicios/catalogos/catHorarios/horario.service';
import { ThemePalette } from '@angular/material/core';

@Component({
  selector: 'app-planificacion-multiple',
  templateUrl: './planificacion-multiple.component.html',
  styleUrls: ['./planificacion-multiple.component.css']
})

export class PlanificacionMultipleComponent implements OnInit {

  @Input() datosSeleccionados: any;

  // FECHAS DE BUSQUEDA
  fechaInicialF = new FormControl;
  fechaFinalF = new FormControl();
  horarioF = new FormControl();
  fecHorario: boolean = true;

  // ITEMS DE PAGINACION DE LA TABLA EMPLEADOS
  pageSizeOptions_emp = [5, 10, 20, 50];
  tamanio_pagina_emp: number = 5;
  numero_pagina_emp: number = 1;

  // VARIABLES PROGRESS SPINNER
  progreso: boolean = false;
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 10;

  constructor(
    public componentem: HorarioMultipleEmpleadoComponent,
    public componenteb: BuscarPlanificacionComponent,
    public parametro: ParametrosService,
    public feriado: FeriadosService,
    public validar: ValidacionesService,
    public horario: EmpleadoHorariosService,
    public router: Router,
    public restD: DetalleCatHorariosService,
    public restH: HorarioService,
    public restP: PlanGeneralService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.BuscarHorarios();
    this.BuscarHora();
    this.InicialiciarDatos();
  }

  // METODO PARA INCIALIZAR VARIABLES
  InicialiciarDatos() {
    let index = 0;
    this.datosSeleccionados.usuarios.forEach(obj => {
      obj.asignado = [];
      obj.existencias = [];
      obj.totalizador = [];
      obj.index = index;
      index = index + 1;
    })
    console.log('this.datosSeleccionados: ', this.datosSeleccionados.usuarios!);
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

  // METODO PARA MOSTRAR FECHA SELECCIONADA
  FormatearFecha(fecha: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = fecha;

    let inicio = moment(ctrlValue).format('01/MM/YYYY');
    let final = moment(ctrlValue).daysInMonth() + moment(ctrlValue).format('/MM/YYYY');

    this.fechaInicialF.setValue(moment(inicio, 'DD/MM/YYYY'));
    this.fechaFinalF.setValue(moment(final, 'DD/MM/YYYY'));

    datepicker.close();
    this.ver_horario = false;
    this.ver_verificar = false;
    this.ver_guardar = false;
    this.ver_acciones = false;
    this.InicialiciarDatos();
    this.fechas_mes = [];
  }


  // METODO PARA GENERAR CALENDARIO
  mes_asignar: string = '';
  GenerarCalendario() {
    if (this.fechaInicialF.value === null && this.fechaFinalF.value === null) {
      let inicio = moment().format('01/MM/YYYY');
      let final = moment().daysInMonth() + moment().format('/MM/YYYY');
      this.fechaInicialF.setValue(moment(inicio, 'DD/MM/YYYY'));
      this.fechaFinalF.setValue(moment(final, 'DD/MM/YYYY'));
    }

    this.mes_asignar = ('DE ' + moment(this.fechaInicialF.value).format('MMMM')).toUpperCase();
    this.ListarFechas(this.fechaInicialF.value, this.fechaFinalF.value);
    this.ver_horario = true;
    this.ver_verificar = true;
    this.ver_guardar = false;
    this.InicialiciarDatos();
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
        num_dia: moment(this.dia_inicio, 'YYYY/MM/DD').isoWeekday(),
        formato: (moment(this.dia_inicio).format('MMMM, ddd DD, YYYY')).toUpperCase(),
        formato_: (moment(this.dia_inicio).format('MMM ddd DD, YYYY')).toUpperCase(),
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
      }
      this.fechas_mes.push(fechas);
      var newDate = moment(this.dia_inicio).add(1, 'd').format('YYYY-MM-DD')
      this.dia_inicio = newDate;
    }
    //console.log('ver fechas ', this.fechas_mes)
  }

  // VARIABLES DE ALMACENAMIENTO DE DATOS ESPECIFICOS DE UN HORARIO
  detalles_horarios: any = [];
  vista_horarios: any = [];
  vista_descanso: any = [];
  lista_descanso: any = [];
  horarios: any = []
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
      this.horarios.map(hor => {
        // BUSQUEDA DE DETALLES DE ACUERDO AL ID DE HORARIO
        this.restD.ConsultarUnDetalleHorario(hor.id).subscribe(res => {
          this.detalles_horarios = res;
          this.detalles_horarios.map(det => {
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

          if (hor.default === 'L' || hor.default === 'FD') {
            this.vista_descanso = this.vista_descanso.concat(datos_horario);
            let descanso = {
              tipo: hor.default,
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

  // METODO PARA VALIDAR SELECCION DE HORARIO
  ver_informacion: boolean = false
  ValidarHorario() {
    const [obj_res] = this.horarios.filter(o => {
      return o.codigo === this.horarioF.value
    })
    if (!obj_res) return this.toastr.warning('Horario no válido.');

    const { hora_trabajo, id, codigo, min_almuerzo } = obj_res;

    // VERIFICACION DE FORMATO CORRECTO DE HORARIOS
    if (!this.StringTimeToSegundosTime(hora_trabajo)) {
      //this.ver_icono = false;
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
      //this.SeleccionarHorario();
      this.ObtenerDetallesHorario(id, codigo, min_almuerzo);
      this.ver_registrar = true;
      this.ver_eliminar = true;
      this.ver_informacion = true;
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

  // INICIALIZACION DE VARIABLES
  ver_verificar: boolean = false;
  ver_horario: boolean = false;
  ver_guardar: boolean = false;

  ver_registrar: boolean = false;
  ver_eliminar: boolean = false;
  ver_libre: boolean = false;
  expansion: boolean = false;

  // METODO PARA INGRESAR HORARIO
  IngresarHorario(index: number, dia: any) {
    //console.log('verificar existencias ', this.fechas_mes[index].registrados)
    let verificador = 0;

    const [datoHorario] = this.horarios.filter(o => {
      return o.codigo === this.horarioF.value
    })

    if (!datoHorario) return this.toastr.warning('No ha seleccionado un horario.');

    let mes = moment(this.fechaInicialF.value).format('MM-YYYY');
    let fecha = dia + '-' + mes;

    let data = [{
      dia: dia,
      rango: '',
      fecha: moment(fecha, 'D-MM-YYYY').format('YYYY-MM-DD'),
      horario: this.horarioF.value,
      detalles: datoHorario.detalles,
      id_horario: datoHorario.id,
      hora_trabajo: datoHorario.hora_trabajo,
      tipo_dia: 'N',
    }]

    //console.log('ver como esta la data ', this.datosSeleccionados.usuarios[index])

    for (var i = 0; i < this.datosSeleccionados.usuarios[index].asignado.length; i++) {
      if (this.datosSeleccionados.usuarios[index].asignado[i].dia === dia) {
        if (this.datosSeleccionados.usuarios[index].asignado[i].tipo_dia === 'L') {
          this.datosSeleccionados.usuarios[index].asignado.splice(i, 1);
          verificador = 0;
          break;
        }
        else if (this.datosSeleccionados.usuarios[index].asignado[i].tipo_dia === 'FD') {
          verificador = 3;
          break;
        }
        else {
          //console.log('ver data ', data[0].detalles.segundo_dia)
          if (this.datosSeleccionados.usuarios[index].asignado[i].horario === this.horarioF.value) {
            verificador = 1;
            break;
          }
          else {
            if (this.datosSeleccionados.usuarios[index].asignado[i].detalles.segundo_dia === false && data[0].detalles.segundo_dia === false) {
              if (this.datosSeleccionados.usuarios[index].asignado[i].detalles.salida < data[0].detalles.entrada) {
                verificador = 0;
              }
              else if (this.datosSeleccionados.usuarios[index].asignado[i].detalles.entrada > data[0].detalles.salida) {
                verificador = 0;
              }
              else {
                verificador = 2;
                break;
              }
            }
            else if (this.datosSeleccionados.usuarios[index].asignado[i].detalles.segundo_dia === true && data[0].detalles.segundo_dia === true) {
              verificador = 2;
              break;
            }
            else if (this.datosSeleccionados.usuarios[index].asignado[i].detalles.segundo_dia === false && data[0].detalles.segundo_dia === true) {
              if (this.datosSeleccionados.usuarios[index].asignado[i].detalles.entrada > data[0].detalles.salida
                && this.datosSeleccionados.usuarios[index].asignado[i].detalles.salida > data[0].detalles.salida
                && this.datosSeleccionados.usuarios[index].asignado[i].detalles.salida < data[0].detalles.entrada) {
                verificador = 0;
              }
              else {
                verificador = 2;
                break;
              }
            }
            else if (this.datosSeleccionados.usuarios[index].asignado[i].detalles.segundo_dia === true && data[0].detalles.segundo_dia === false) {
              if (this.datosSeleccionados.usuarios[index].asignado[i].detalles.salida < data[0].detalles.entrada
                && this.datosSeleccionados.usuarios[index].asignado[i].detalles.salida < data[0].detalles.salida
                && this.datosSeleccionados.usuarios[index].asignado[i].detalles.entrada > data[0].detalles.salida) {
                verificador = 0;
              }
              else {
                verificador = 2;
                break;
              }
            }
          }
        }
      }
      else {
        verificador = 0;
      }
    }

    if (verificador === 0) {
      //console.log('ver seleccionado ', this.datosSeleccionados.usuarios[index].asignado);
      let codigo = this.datosSeleccionados.usuarios[index].codigo;
      this.VerificarExistencias(dia, codigo, data, index);
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
    else if (verificador === 3) {
      this.toastr.warning('Dia configurado como FERIADO dentro del sistema.', 'Ups!!! VERIFICAR.', {
        timeOut: 6000,
      });
    }

  }

  // METODO PARA VERIFICAR SI EXISTEN HORARIOS
  eliminar_lista: any = [];
  VerificarExistencias(dia: any, codigo: string, data: any, index: any) {

    let verificar = 0;
    let mes = moment(this.fechaInicialF.value).format('MM-YYYY');
    let fecha = dia + '-' + mes
    //console.log('fecha ', moment(fecha, 'D-MM-YYYY').format('DD-MM-YYYY'))

    let fechas = {
      fechaInicio: moment(fecha, 'D-MM-YYYY').format('DD-MM-YYYY'),
      fechaFinal: moment(fecha, 'D-MM-YYYY').format('DD-MM-YYYY'),
    };

    this.horario.VerificarHorariosExistentes(codigo, fechas).subscribe(existe => {
      //console.log('ver existencias ', existe, ' asignados ', asignados, ' data ', data)
      let existencias = {
        existe: existe,
        dia: dia
      }
      this.datosSeleccionados.usuarios[index].existencias = existencias;
      //console.log('ver datos de existencias ', this.datosSeleccionados.usuarios[index].existencias)

      for (var i = 0; i < existe.length; i++) {

        this.horarios.forEach(o => {
          if (o.codigo === existe[i].codigo) {
            existe[i].detalles = o;
          }
        })

        // SI EXISTEN HORARIOS LIBRES O FERIADOS REGISTRADOS SE BORRAN PARA ACTUALIZAR LOS REGISTROS
        if (existe[i].default === 'L' || existe[i].default === 'FD') {
          // PREPARAR DATA PARA ELIMINAR HORARIO
          let plan_fecha = {
            codigo: this.datosSeleccionados.usuarios[index].codigo,
            fec_final: moment(fecha, 'D-MM-YYYY').format('DD-MM-YYYY'),
            fec_inicio: moment(fecha, 'D-MM-YYYY').format('DD-MM-YYYY'),
            id_horario: existe[i].id_horario,
          };
          this.eliminar_lista = this.eliminar_lista.concat(plan_fecha);
          verificar = 0;
        }
        else {
          //console.log('ver existencias ', existe[i])
          if (existe[i].codigo === data[0].horario) {
            verificar = 1;
            break;
          }
          else {

            if (existe[i].detalles.detalles.segundo_dia === false && data[0].detalles.segundo_dia === false) {
              if (existe[i].detalles.detalles.salida < data[0].detalles.entrada) {
                verificar = 0;
              }
              else if (existe[i].detalles.detalles.entrada > data[0].detalles.salida) {
                verificar = 0;
              }
              else {
                verificar = 2;
                break;
              }
            }
            else if (existe[i].detalles.detalles.segundo_dia === true && data[0].detalles.segundo_dia === true) {
              verificar = 2;
              break;
            }
            else if (existe[i].detalles.detalles.segundo_dia === false && data[0].detalles.segundo_dia === true) {
              if (existe[i].detalles.detalles.entrada > data[0].detalles.salida
                && existe[i].detalles.detalles.salida > data[0].detalles.salida
                && existe[i].detalles.detalles.salida < data[0].detalles.entrada) {
                verificar = 0;
              }
              else {
                verificar = 2;
                break;
              }
            }
            else if (existe[i].detalles.detalles.segundo_dia === true && data[0].detalles.segundo_dia === false) {
              if (existe[i].detalles.detalles.salida < data[0].detalles.entrada
                && existe[i].detalles.detalles.salida < data[0].detalles.salida
                && existe[i].detalles.detalles.entrada > data[0].detalles.salida) {
                verificar = 0;
              }
              else {
                verificar = 2;
                break;
              }
            }
          }
        }
      }

      if (verificar === 0) {
        this.datosSeleccionados.usuarios[index].asignado = this.datosSeleccionados.usuarios[index].asignado.concat(data);
        this.ControlarBotones(true, false);
        this.SumarJornada(index, dia);
        //console.log('ver datos de usuarios ', this.datosSeleccionados.usuarios[index])
      }
      else if (verificar === 1) {
        this.toastr.warning('Horario ya se encuentra registrado.', 'Ups!!! VERIFICAR.', {
          timeOut: 6000,
        });
      }
      else if (verificar === 2) {
        this.toastr.warning('Ya existe registro de horarios y no es posible registrar horarios con rangos de tiempo similares.', 'Ups!!! VERIFICAR.', {
          timeOut: 6000,
        });
      }

    }, vacio => {
      this.datosSeleccionados.usuarios[index].asignado = this.datosSeleccionados.usuarios[index].asignado.concat(data);
      this.ControlarBotones(true, false);
      //console.log('ver datos de usuarios ', this.datosSeleccionados.usuarios[index])
      this.SumarJornada(index, dia);
      //console.log('ver datos de usuarios ', this.datosSeleccionados.usuarios[index])
    });
  }

  // METODO PARA SUMAR HORAS DE JORNADA
  SumarJornada(index: any, dia: any) {
    //console.log('ingresa dia ', dia)
    let suma1 = '00:00:00';

    //console.log('ver existencias ', this.datosSeleccionados.usuarios[index].existencias)
    if (this.datosSeleccionados.usuarios[index].existencias.dia === dia) {
      this.datosSeleccionados.usuarios[index].existencias.existe.forEach(existe => {
        if (existe.default != 'L' && existe.default != 'FD') {
          suma1 = this.SumarHoras(suma1, existe.hora_trabajo);
        }
      })
    }

    //console.log('ver asignados ', this.datosSeleccionados.usuarios[index].asignado.length)
    for (var i = 0; i < this.datosSeleccionados.usuarios[index].asignado.length; i++) {
      if (this.datosSeleccionados.usuarios[index].asignado[i].dia === dia) {
        suma1 = this.SumarHoras(suma1, this.datosSeleccionados.usuarios[index].asignado[i].hora_trabajo);
      }
    }

    let total = 0;
    //console.log('ver horas sumadas ', suma1)
    if (this.datosSeleccionados.usuarios[index].totalizador.length === 0) {
      let suma = [{
        dia: dia,
        suma: suma1
      }]
      this.datosSeleccionados.usuarios[index].totalizador = this.datosSeleccionados.usuarios[index].totalizador.concat(suma);
    }
    else {
      for (var i = 0; i < this.datosSeleccionados.usuarios[index].totalizador.length; i++) {
        if (this.datosSeleccionados.usuarios[index].totalizador[i].dia === dia) {
          //console.log('ingresa ... ', this.datosSeleccionados.usuarios[index].totalizador[i].dia)
          this.datosSeleccionados.usuarios[index].totalizador[i].suma = suma1
        }
        else {
          total = total + 1;
        }
      }
      if (total === this.datosSeleccionados.usuarios[index].totalizador.length) {
        let suma = [{
          dia: dia,
          suma: suma1
        }]
        this.datosSeleccionados.usuarios[index].totalizador = this.datosSeleccionados.usuarios[index].totalizador.concat(suma);
      }
    }
  }

  // METODO PARA DIA COMO LIBRE O NO LABORABLE
  IngresarLibre(index: number, dia: any) {
    let verificador = 0;
    let similar = 0;
    this.ControlarBotones(true, false);

    const [datoHorario] = this.horarios.filter(o => {
      return o.default === 'L';
    })

    let mes = moment(this.fechaInicialF.value).format('MM-YYYY');
    let fecha = dia + '-' + mes;

    let data = [{
      dia: dia,
      rango: '',
      fecha: moment(fecha, 'D-MM-YYYY').format('YYYY-MM-DD'),
      horario: datoHorario.codigo,
      detalles: datoHorario.detalles,
      id_horario: datoHorario.id,
      hora_trabajo: datoHorario.hora_trabajo,
      tipo_dia: 'L',
    }]

    //console.log('ver length ', this.datosSeleccionados.usuarios[index].asignado.length)
    //console.log('ver data ', this.datosSeleccionados.usuarios[index])

    if (this.datosSeleccionados.usuarios[index].asignado.length === 0) {
      //console.log('ingresa asignado 0 ')
      this.VerificarDiaLibre(index, dia, data)
    }
    else if (this.datosSeleccionados.usuarios[index].asignado.length === 1) {
      //console.log('ingresa asignado 1 ')
      if (this.datosSeleccionados.usuarios[index].asignado[0].dia === dia) {
        if (this.datosSeleccionados.usuarios[index].asignado[0].tipo_dia === 'L') {
          this.datosSeleccionados.usuarios[index].asignado.splice(0, 1);
        }
        else if (this.datosSeleccionados.usuarios[index].asignado[0].tipo_dia === 'FD') {
          this.toastr.warning('Dia configurado como FERIADO dentro del sistema.', 'Ups!!! VERIFICAR.', {
            timeOut: 6000,
          });
        }
        else {
          //console.log('ingresa asignado dia normal ')
          this.datosSeleccionados.usuarios[index].asignado.splice(0, 1);
          this.VerificarDiaLibre(index, dia, data)
        }
      }
      else {
        this.VerificarDiaLibre(index, dia, data)
      }
    }
    else {
      for (var i = 0; i < this.datosSeleccionados.usuarios[index].asignado.length; i++) {
        //console.log('asignados ', this.datosSeleccionados.usuarios[index].asignado[i])
        if (this.datosSeleccionados.usuarios[index].asignado[i].dia === dia) {
          //console.log(' dia ', dia, 'tipo ', this.datosSeleccionados.usuarios[index].asignado[i].tipo_dia)
          if (this.datosSeleccionados.usuarios[index].asignado[i].tipo_dia === 'L') {
            similar = 1;
            this.datosSeleccionados.usuarios[index].asignado.splice(i, 1);
            break;
          }
          else if (this.datosSeleccionados.usuarios[index].asignado[i].tipo_dia === 'FD') {
            similar = 1;
            this.toastr.warning('Dia configurado como FERIADO dentro del sistema.', 'Ups!!! VERIFICAR.', {
              timeOut: 6000,
            });
            break;
          }
          else {
            this.datosSeleccionados.usuarios[index].asignado[i] = [];
            verificador = 1;
          }
        }
        else {
          verificador = 1;
        }
        //console.log('ver length ', this.datosSeleccionados.usuarios[index].asignado.length)
      }

      //console.log('verificador ', verificador, 'similar ', similar)
      if (verificador === 1 && similar === 0) {
        this.VerificarDiaLibre(index, dia, data)
      }
    }

    // METODO PARA ELIMINAR REGISTROS VACIOS
    let datos: any = []
    for (var i = 0; i < this.datosSeleccionados.usuarios[index].asignado.length; i++) {
      if (this.datosSeleccionados.usuarios[index].asignado[i].dia) {
        datos = datos.concat(this.datosSeleccionados.usuarios[index].asignado[i])
      }
    }
    this.datosSeleccionados.usuarios[index].asignado = datos;
  }

  // VALIDAR INGRESO DE DIAS LIBRES
  VerificarDiaLibre(index: any, dia: any, data: any) {
    let validar = 0;
    let mes = moment(this.fechaInicialF.value).format('MM-YYYY');
    let fecha = dia + '-' + mes;

    if (this.datosSeleccionados.usuarios[index].existencias.dia != undefined) {
      //console.log('ingresa con existencias ')

      if (this.datosSeleccionados.usuarios[index].existencias.dia === dia) {
        this.datosSeleccionados.usuarios[index].existencias.existe.forEach(existe => {
          if (existe.default === 'L' || existe.default === 'FD') {
            // PREPARAR DATA PARA ELIMINAR HORARIO
            let plan_fecha = {
              codigo: this.datosSeleccionados.usuarios[index].codigo,
              fec_final: moment(fecha, 'D-MM-YYYY').format('DD-MM-YYYY'),
              fec_inicio: moment(fecha, 'D-MM-YYYY').format('DD-MM-YYYY'),
              id_horario: existe.id_horario,
            };
            this.eliminar_lista = this.eliminar_lista.concat(plan_fecha);
          }
          else {
            validar = 1;
          }
        })
        if (validar === 0) {
          this.ActualizarTotalizador(index, dia);
          this.datosSeleccionados.usuarios[index].asignado = this.datosSeleccionados.usuarios[index].asignado.concat(data);

        } else {
          this.toastr.warning('Ya existe registro de horarios, no es factible colocar como día libre.', 'Ups!!! VERIFICAR.', {
            timeOut: 6000,
          });
          this.ActualizarTotalizador(index, dia);
          //console.log('ingresa ... ', this.datosSeleccionados.usuarios[index].totalizador[i])
        }
      }
      else {
        this.BuscarHorariosLibres(index, dia, data);
      }
    }
    else {
      //console.log('ver existencias libre undefined')
      this.BuscarHorariosLibres(index, dia, data);
    }
  }

  // METODO PARA BUSCAR HORARIOS EXISTENTES EN DIA COMO LIBRE
  BuscarHorariosLibres(index: any, dia: any, data: any) {
    let validar = 0;
    let mes = moment(this.fechaInicialF.value).format('MM-YYYY');
    let fecha = dia + '-' + mes
    //console.log('fecha ', moment(fecha, 'D-MM-YYYY').format('DD-MM-YYYY'))

    let fechas = {
      fechaInicio: moment(fecha, 'D-MM-YYYY').format('DD-MM-YYYY'),
      fechaFinal: moment(fecha, 'D-MM-YYYY').format('DD-MM-YYYY'),
    };

    let codigo = this.datosSeleccionados.usuarios[index].codigo;
    this.horario.VerificarHorariosExistentes(codigo, fechas).subscribe(existe => {

      let existencias = {
        existe: existe,
        dia: dia
      }
      this.datosSeleccionados.usuarios[index].existencias = existencias;

      for (var i = 0; i < existe.length; i++) {
        if (existe[i].default === 'L' || existe[i].default === 'FD') {
          // PREPARAR DATA PARA ELIMINAR HORARIO
          let plan_fecha = {
            codigo: this.datosSeleccionados.usuarios[index].codigo,
            fec_final: moment(fecha, 'D-MM-YYYY').format('DD-MM-YYYY'),
            fec_inicio: moment(fecha, 'D-MM-YYYY').format('DD-MM-YYYY'),
            id_horario: existe[i].id_horario,
          };
          this.eliminar_lista = this.eliminar_lista.concat(plan_fecha);
          break;
        }
        else {
          validar = 1;
          break;
        }
      }

      if (validar === 0) {
        this.ActualizarTotalizador(index, dia);
        this.datosSeleccionados.usuarios[index].asignado = this.datosSeleccionados.usuarios[index].asignado.concat(data);
      } else {
        this.toastr.warning('Ya existe registro de horarios, no es factible colocar como día libre.', 'Ups!!! VERIFICAR.', {
          timeOut: 6000,
        });
        this.ActualizarTotalizador(index, dia);
      }

    }, vacio => {
      this.ActualizarTotalizador(index, dia);
      this.datosSeleccionados.usuarios[index].asignado = this.datosSeleccionados.usuarios[index].asignado.concat(data);
    })
  }

  // METODO PARA ACTUALIZAR SUMATORIA DE HORARIOS
  ActualizarTotalizador(index: any, dia: any) {
    for (var i = 0; i < this.datosSeleccionados.usuarios[index].totalizador.length; i++) {
      if (this.datosSeleccionados.usuarios[index].totalizador[i].dia === dia) {
        //console.log('ingresa ... ', this.datosSeleccionados.usuarios[index].totalizador[i].dia)
        this.datosSeleccionados.usuarios[index].totalizador[i].suma = '00:00:00'
      }
    }
  }


  // METODO PARA ELIMINAR HORARIOS
  EliminarHorario(index: number, dia: any) {
    for (let i = 0; i < this.datosSeleccionados.usuarios[index].asignado.length; i++) {
      if (this.datosSeleccionados.usuarios[index].asignado[i].dia === dia) {
        if (this.datosSeleccionados.usuarios[index].asignado[i].horario === this.horarioF.value) {
          this.datosSeleccionados.usuarios[index].asignado.splice(i, 1);
          this.ActualizarTotalizador(index, dia);
          break;
        }
      }
    }
    this.ControlarBotones(true, false);
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

  // METODO PARA ASIGNAR FERIADO
  AsignarFeriado(feriado: any, usuario: any) {
    const [datoHorario] = this.horarios.filter(o => {
      return o.default === 'FD';
    })
    feriado.forEach(d => {
      let dia = moment(d.fecha).format('D');
      let mes = moment(this.fechaInicialF.value).format('MM-YYYY');
      let fecha = dia + '-' + mes;
      //console.log('ver dia ', dia)
      let data = [{
        dia: parseInt(dia),
        fecha: moment(fecha, 'D-MM-YYYY').format('YYYY-MM-DD'),
        horario: datoHorario.codigo,
        detalles: datoHorario.detalles,
        id_horario: datoHorario.id,
        hora_trabajo: datoHorario.hora_trabajo,
        tipo_dia: 'FD',
      }]
      usuario.asignado = usuario.asignado.concat(data);
      // PREPARAR DATA PARA ELIMINAR HORARIO
      let plan_fecha = {
        codigo: usuario.codigo,
        fec_final: moment(fecha, 'D-MM-YYYY').format('DD-MM-YYYY'),
        fec_inicio: moment(fecha, 'D-MM-YYYY').format('DD-MM-YYYY'),
        id_horario: datoHorario.id,
      };
      this.eliminar_lista = this.eliminar_lista.concat(plan_fecha);
    })
    //console.log('ver datos de usuarios ', usuario)
  }

  // METODO PARA VERIFICAR HORARIOS ASIGNADOS
  VerificarAsignados() {
    let usuarios: any = [];
    //console.log('usuarios entrantes ', this.datosSeleccionados.usuarios);

    this.datosSeleccionados.usuarios.forEach(usu => {
      if (usu.asignado.length != 0) {
        usuarios = usuarios.concat(usu);
      }
    })

    //console.log('usuarios salientes ', this.datosSeleccionados.usuarios);
    if (usuarios.length === 0) {
      this.toastr.warning('No ha registrado horarios.', 'Ups!!! VERIFICAR.', {
        timeOut: 6000,
      });
    } else {
      this.BuscarFeriados(this.fechaInicialF.value, this.fechaFinalF.value, usuarios);
    }
  }

  // METODO PARA BUSCAR FERIADOS
  BuscarFeriados(inicio: any, fin: any, validos: any) {
    //console.log('ver validos feriados . ', validos)
    let cont = 0;
    validos.forEach(val => {
      let datos = {
        fecha_inicio: inicio,
        fecha_final: fin,
        id_empleado: val.id
      }
      this.feriado.ListarFeriadosCiudad(datos).subscribe(fer => {
        cont = cont + 1;
        let feriado: any = [];
        feriado = fer;
        //console.log('feriados ', fer)
        feriado.forEach(f => {
          //console.log('ver val ', val.asignado)
          for (var a = 0; a < val.asignado.length; a++) {
            //console.log('ver datos dia ', val.asignado[a].dia, ' dia fecha ', moment(f.fecha).format('D'))
            if (val.asignado[a].dia === parseInt(moment(f.fecha).format('D'))) {
              //console.log('ingresa comparar feriados')
              val.asignado.splice(a, 1);
            }
          }
        })

        this.AsignarFeriado(feriado, val);
        if (cont === validos.length) {
          this.datosSeleccionados.usuario = validos;
          //console.log('usuarios validos ', validos);
          //console.log('usuarios validos original ', this.datosSeleccionados.usuario);
          //console.log('usuarios eliminar ', this.eliminar_lista);
          this.CrearDataHorario(validos);
        }
      }, vacio => {
        cont = cont + 1;
        if (cont === validos.length) {
          this.datosSeleccionados.usuario = validos;
          //console.log('usuarios validos ', validos);
          //console.log('usuarios validos original ', this.datosSeleccionados.usuario);
          //console.log('usuarios eliminar ', this.eliminar_lista);
          this.CrearDataHorario(validos);
        }
      })
    })
  }

  // METODO PARA CREAR LA DATA DE REGISTRO DE HORARIO
  plan_general: any = [];
  CrearDataHorario(lista: any) {

    //console.log('validos ', lista)
    var contador = 0;

    var asignados = 0;

    lista.forEach(li => {
      asignados = asignados + li.asignado.length;
    })

    this.plan_general = [];

    if (lista.length != 0) {

      lista.forEach(li => {

        li.asignado.forEach(asig => {
          asig.rango = '';
          let origen = 'N';
          let tipo = null;
          //console.log('ver data asignado ')

          if (asig.tipo_dia != 'FD') {
            origen = asig.tipo_dia
          }

          if (asig.tipo_dia === 'FD' || asig.tipo_dia === 'L') {
            tipo = asig.tipo_dia
          }

          this.restD.ConsultarUnDetalleHorario(asig.id_horario).subscribe(det => {
            contador = contador + 1;
            // COLOCAR DETALLE DE DIA SEGUN HORARIO
            det.map(element => {
              //console.log('ver detalle ', element)
              var accion = 0;
              var nocturno: number = 0;
              if (element.tipo_accion === 'E') {
                accion = element.minu_espera;
              }
              if (element.segundo_dia === true) {
                nocturno = 1;
              }
              else if (element.tercer_dia === true) {
                nocturno = 2;
              }
              else {
                nocturno = 0;
              }

              let plan = {
                codigo: li.codigo,
                tipo_dia: asig.tipo_dia,
                min_antes: element.min_antes,
                tolerancia: accion,
                id_horario: element.id_horario,
                min_despues: element.min_despues,
                fec_horario: asig.fecha,
                estado_origen: origen,
                estado_timbre: tipo,
                id_empl_cargo: li.id_cargo,
                id_det_horario: element.id,
                salida_otro_dia: nocturno,
                tipo_entr_salida: element.tipo_accion,
                fec_hora_horario: asig.fecha + ' ' + element.hora,
                min_alimentacion: element.min_almuerzo,
              };
              if (element.segundo_dia === true) {
                plan.fec_hora_horario = moment(asig.fecha).add(1, 'd').format('YYYY-MM-DD') + ' ' + element.hora;
              }
              if (element.tercer_dia === true) {
                plan.fec_hora_horario = moment(asig.fecha).add(2, 'd').format('YYYY-MM-DD') + ' ' + element.hora;
              }
              // ALMACENAMIENTO DE PLANIFICACION GENERAL
              this.plan_general = this.plan_general.concat(plan);
              //console.log('ver plan_general ', this.plan_general)
            })

            if (contador === asignados) {
              this.ValidarRangos(this.plan_general)
            }

          })
        })
      })
    }
  }

  // METODO PARA VALIDAR RANGOS DE TIEMPOS EN HORARIOS
  ValidarRangos(lista: any) {
    var datos_o: any = [];
    var datos: any = [];
    var contador = 0;
    lista.forEach(obj => {
      if (obj.salida_otro_dia === 1) {
        datos = datos.concat(obj)
      }
      else {
        datos_o = datos_o.concat(obj);
      }
    })

    datos.forEach(ele => {

      for (var i = 0; i < datos_o.length; i++) {

        if (ele.codigo === datos_o[i].codigo) {

          if ((moment(datos_o[i].fec_hora_horario).format('YYYY-MM-DD') === moment(ele.fec_hora_horario).format('YYYY-MM-DD')) &&
            datos_o[i].tipo_entr_salida === 'E' && ele.tipo_entr_salida === 'S' && datos_o[i].tipo_dia === 'N') {

            if (moment(datos_o[i].fec_hora_horario).format('HH:mm:ss') <= moment(ele.fec_hora_horario).format('HH:mm:ss')) {
              contador = 1;
              //console.log('existen horarios en rangos de tiempo similares ', contador)
              this.datosSeleccionados.usuario.forEach(li => {
                if (li.codigo === ele.codigo) {
                  li.asignado.forEach(asig => {
                    if (asig.fecha === moment(ele.fec_hora_horario).format('YYYY-MM-DD')) {
                      asig.rango = 'RANGOS DE TIEMPO SIMILARES'
                    }
                  })
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
    //console.log('validos ', this.datosSeleccionados.usuario)
    if (contador === 0) {
      this.ControlarBotones(false, true);
    }
    else {
      this.ControlarBotones(true, false);
    }
  }

  // METODO PARA CONTROLAR BOTONES
  ControlarBotones(verificar: boolean, guardar: boolean) {
    this.ver_verificar = verificar;
    this.ver_guardar = guardar;
  }

  // METODO PARA GURADAR DATOS EN BASE DE DATOS
  GuardarPlanificacion() {
    this.progreso = true;
    //console.log('eliminar ', this.eliminar_lista)
    let contador = 0;

    if (this.eliminar_lista.length === 0) {
      this.RegistrarPlanificacionMultiple();
    }
    else {
      // METODO PARA ELIMINAR HORARIOS
      this.eliminar_lista.forEach(h => {
        //console.log('ingresa a eliminar horarios')
        let plan_fecha = {
          codigo: h.codigo,
          fec_final: h.fec_final,
          fec_inicio: h.fec_inicio,
          id_horario: h.id_horario,
        };
        this.restP.BuscarFechas(plan_fecha).subscribe(res => {
          // METODO PARA ELIMINAR DE LA BASE DE DATOS
          this.restP.EliminarRegistro(res).subscribe(datos => {
            contador = contador + 1;
            //console.log('ver contador ', contador, ' tamaño ', this.eliminar_lista.length)
            if (contador === this.eliminar_lista.length) {
              this.RegistrarPlanificacionMultiple();
            }
          }, error => {
            contador = contador + 1;
            if (contador === this.eliminar_lista.length) {
              this.RegistrarPlanificacionMultiple();
            }
          })
        }, error => {
          contador = contador + 1;
          //console.log('ver contador error ', contador, ' tamaño ', this.eliminar_lista.length)
          if (contador === this.eliminar_lista.length) {
            this.RegistrarPlanificacionMultiple();
          }
        })
      })
    }
  }

  // METODO PARA GUARDAR REGISTRO DE HORARIOS
  RegistrarPlanificacionMultiple() {
    //console.log('ver plan ', this.plan_general);

    this.restP.CrearPlanGeneral(this.plan_general).subscribe(res => {
      if (res.message === 'OK') {
        this.progreso = false;
        this.toastr.success('Operación exitosa.', 'Registro guardado.', {
          timeOut: 6000,
        });
        this.CerrarVentana();
      }
      else {
        this.progreso = false;
        this.toastr.error('Ups!!! se ha producido un error. Es recomendable eliminar la planificación.', 'Verificar la planificación.', {
          timeOut: 6000,
        });
        this.CerrarVentana();
      }
    }, error => {
      this.progreso = false;
      this.toastr.error('Ups!!! se ha producido un error. Es recomendable eliminar la planificación.', 'Verificar la planificación.', {
        timeOut: 6000,
      });
      this.CerrarVentana();
    })

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

  // EVENTO PARA LA PAGINACION
  ManejarPaginaHorarios(e: PageEvent) {
    this.tamanio_pagina_emp = e.pageSize;
    this.numero_pagina_emp = e.pageIndex + 1;
  }

  // METODO PARA CERRAR VENTANA
  CerrarVentana() {
    if (this.datosSeleccionados.pagina === 'multiple-empleado') {
      this.componentem.seleccionar = true;
      this.componentem.plan_rotativo = false;
      this.componentem.LimpiarFormulario();
    }
    else if (this.datosSeleccionados.pagina === 'busqueda') {
      this.componenteb.rotativo_multiple = false;
      this.componenteb.seleccionar = true;
      this.componenteb.buscar_fechas = true;
      this.componenteb.auto_individual = true;
      this.componenteb.multiple = true;
    }
  }

}
