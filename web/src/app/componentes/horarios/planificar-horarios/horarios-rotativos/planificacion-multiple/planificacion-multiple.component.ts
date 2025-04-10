import { Component, OnInit, Input } from '@angular/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { ToastrService } from 'ngx-toastr';
import { FormControl } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';

import { HorarioMultipleEmpleadoComponent } from '../../rango-fechas/horario-multiple-empleado/horario-multiple-empleado.component';
import { BuscarPlanificacionComponent } from '../../rango-fechas/buscar-planificacion/buscar-planificacion.component';

import { DetalleCatHorariosService } from 'src/app/servicios/horarios/detalleCatHorarios/detalle-cat-horarios.service';
import { EmpleadoHorariosService } from 'src/app/servicios/horarios/empleadoHorarios/empleado-horarios.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { PlanGeneralService } from 'src/app/servicios/horarios/planGeneral/plan-general.service';
import { ParametrosService } from 'src/app/servicios/configuracion/parametrizacion/parametrosGenerales/parametros.service';
import { FeriadosService } from 'src/app/servicios/horarios/catFeriados/feriados.service';
import { HorarioService } from 'src/app/servicios/horarios/catHorarios/horario.service';
import { TimbresService } from 'src/app/servicios/timbres/timbrar/timbres.service';

@Component({
  selector: 'app-planificacion-multiple',
  standalone: false,
  templateUrl: './planificacion-multiple.component.html',
  styleUrls: ['./planificacion-multiple.component.css']
})

export class PlanificacionMultipleComponent implements OnInit {
  ips_locales: any = '';

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

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    public componentem: HorarioMultipleEmpleadoComponent,
    public componenteb: BuscarPlanificacionComponent,
    public parametro: ParametrosService,
    public feriado: FeriadosService,
    public validar: ValidacionesService,
    public horario: EmpleadoHorariosService,
    public timbrar: TimbresService,
    public router: Router,
    public restD: DetalleCatHorariosService,
    public restH: HorarioService,
    public restP: PlanGeneralService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');  
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    }); 
    this.BuscarHorarios();
    this.BuscarHora();
    this.InicialiciarDatos();
  }

  // METODO PARA INCIALIZAR VARIABLES
  InicialiciarDatos() {
    let index = 0;
    console.log("ver datos seleccionados: ", this.datosSeleccionados)
    this.datosSeleccionados.usuarios.forEach((obj: any) => {
      obj.asignado = [];
      obj.existencias = [];
      obj.totalizador = [];
      obj.index = index;
      index = index + 1;
    })
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

  // METODO PARA MOSTRAR FECHA SELECCIONADA
  FormatearFecha(fecha: DateTime, datepicker: MatDatepicker<DateTime>) {
    const ctrlValue = fecha;
    console.log("ctrlValue", ctrlValue)
    let inicio = ctrlValue.set({ day: 1 }).toFormat('dd/MM/yyyy');
    console.log("inicio luxon", inicio)
    let final = `${ctrlValue.daysInMonth}${ctrlValue.toFormat('/MM/yyyy')}`;
    console.log("final luxon", final)

    this.fechaInicialF.setValue(DateTime.fromFormat(inicio, 'dd/MM/yyyy').toJSDate());
    console.log("fechaInicialF", this.fechaInicialF.value)

    this.fechaFinalF.setValue(DateTime.fromFormat(final, 'dd/MM/yyyy').toJSDate());

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
      const now = DateTime.now();
      // Formatear la fecha de inicio como '01/MM/YYYY'
      let inicio = now.set({ day: 1 }).toFormat('dd/MM/yyyy');
      // Obtener el número de días en el mes y formatear la fecha final
      let final = `${now.daysInMonth}${now.toFormat('/MM/yyyy')}`;
      // Establecer los valores de fecha inicial y final usando Luxon
      this.fechaInicialF.setValue(DateTime.fromFormat(inicio, 'dd/MM/yyyy').toJSDate());
      this.fechaFinalF.setValue(DateTime.fromFormat(final, 'dd/MM/yyyy').toJSDate());
      console.log("fechaInicialF sin seleccionar", this.fechaInicialF.value)
      console.log("fechaFinalF sin seleccionar", this.fechaFinalF.value)
    }
    console.log("fechaInicialF", this.fechaInicialF.value)
    console.log("fechaFinalF", this.fechaFinalF.value)

    this.mes_asignar = ('DE ' + DateTime.fromJSDate(this.fechaInicialF.value).setLocale('es').toFormat('MMMM')).toUpperCase();
    console.log("ver mes_asignar: ", this.mes_asignar )
    this.ListarFechas(this.fechaInicialF.value, this.fechaFinalF.value);
    this.ver_horario = true;
    this.mostrar_feriados = true;
    this.ver_verificar = false;
    this.ver_guardar = false;
    this.cargar = false;
    this.InicialiciarDatos();
  }

  // METODO PARA OBTENER FECHAS, MES, DIA, AÑO
  fechas_mes: any = [];
  dia_inicio: any;
  dia_fin: any;
  ListarFechas(fecha_inicio: any, fecha_final: any) {
    this.fechas_mes = []; // ARRAY QUE CONTIENE TODAS LAS FECHAS DEL MES INDICADO

    this.dia_inicio = DateTime.fromJSDate(fecha_inicio).toFormat('yyyy-MM-dd')
    this.dia_fin = DateTime.fromJSDate(fecha_final).toFormat('yyyy-MM-dd')
    
    // Convertimos las fechas de inicio y fin a DateTime de Luxon
    let dia_inicio = DateTime.fromJSDate(fecha_inicio).setLocale('es').startOf('day');
    let dia_fin = DateTime.fromJSDate(fecha_final).setLocale('es').startOf('day');
    // LOGICA PARA OBTENER EL NOMBRE DE CADA UNO DE LOS DIAS DEL PERIODO INDICADO
    while (dia_inicio <= dia_fin) {
      let fechas = {
        fecha: dia_inicio.toFormat('yyyy-MM-dd'),
        dia: dia_inicio.toFormat('EEEE').toUpperCase(), // Nombre del día completo
        num_dia: dia_inicio.weekday, // Día de la semana (1-7, donde 1 es lunes)
        formato: dia_inicio.toFormat('MMMM, EEE. dd, yyyy').toUpperCase(), // Formato largo de la fecha
        formato_: dia_inicio.toFormat('MMM. EEE. dd, yyyy').toUpperCase(), // Formato corto de la fecha
        mes: dia_inicio.toFormat('MMMM').toUpperCase(), // Mes en texto completo
        anio: dia_inicio.toFormat('yyyy'), // Año
        horarios: [],
        registrados: [],
        tipo_dia: '-',
        tipo_dia_origen: '-',
        estado: false,
        observacion: '',
        horarios_existentes: '',
        supera_jornada: '',
        horas_superadas: '',
      }
      this.fechas_mes.push(fechas);
      dia_inicio = dia_inicio.plus({ days: 1 });
    }

    console.log("ver fechas_mes: ", this.fechas_mes)

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

  // METODO PARA VALIDAR SELECCION DE HORARIO
  ver_informacion: boolean = false
  ValidarHorario() {
    const [obj_res] = this.horarios.filter((o: any) => {
      return o.codigo === this.horarioF.value
    })
    if (!obj_res) return this.toastr.warning('Horario no válido.');

    const { hora_trabajo, id, codigo, minutos_comida } = obj_res;

    // VERIFICACION DE FORMATO CORRECTO DE HORARIOS
    if (!this.StringTimeToSegundosTime(hora_trabajo)) {
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
      this.ObtenerDetallesHorario(id, codigo, minutos_comida);
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
    return h + m + s;
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

  // INICIALIZACION DE VARIABLES
  mostrar_feriados: boolean = false;
  ver_verificar: boolean = false;
  ver_horario: boolean = false;
  ver_guardar: boolean = false;

  ver_registrar: boolean = false;
  ver_eliminar: boolean = false;
  ver_libre: boolean = false;
  expansion: boolean = false;

  // METODO PARA INGRESAR HORARIO
  IngresarHorario(index: number, dia: any) {
    let verificador = 0;

    const [datoHorario] = this.horarios.filter((o: any) => {
      return o.codigo === this.horarioF.value
    })

    if (!datoHorario) return this.toastr.warning('No ha seleccionado un horario.');

    let mes = DateTime.fromJSDate(this.fechaInicialF.value).toFormat('MM-yyyy');
    let fecha = dia + '-' + mes;

    let data = [{
      dia: dia,
      rango: '',
      fecha: DateTime.fromFormat(fecha, 'd-MM-yyyy').toFormat('yyyy-MM-dd'),
      horario: this.horarioF.value,
      detalles: datoHorario.detalles,
      id_horario: datoHorario.id,
      hora_trabajo: datoHorario.hora_trabajo,
      tipo_dia: datoHorario.default_,
    }]
    for (var i = 0; i < this.datosSeleccionados.usuarios[index].asignado.length; i++) {
      if (this.datosSeleccionados.usuarios[index].asignado[i].dia === dia) {
        if (this.datosSeleccionados.usuarios[index].asignado[i].tipo_dia === 'DL') {
          this.datosSeleccionados.usuarios[index].asignado.splice(i, 1);
          verificador = 0;
          break;
        }
        else if (this.datosSeleccionados.usuarios[index].asignado[i].tipo_dia === 'DFD') {
          if (data[0].tipo_dia === 'FD' || data[0].tipo_dia === 'L') {
            this.datosSeleccionados.usuarios[index].asignado.splice(i, 1);
            verificador = 0;
          }
          else {
            verificador = 3;
          }
          break;
        }
        else {
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
      let id_empleado = this.datosSeleccionados.usuarios[index].id;
      this.VerificarExistencias(dia, id_empleado, data, index);
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
  VerificarExistencias(dia: any, id_empleado: string, data: any, index: any) {

    let verificar = 0;
    let mes = DateTime.fromJSDate(this.fechaInicialF.value).toFormat('MM-yyyy');
    let fecha = dia + '-' + mes

    console.log("verificar fecha en VerificarExistencias", fecha);


    let fechas = {
      fechaInicio: DateTime.fromFormat(fecha, 'd-MM-yyyy').toFormat('yyyy-MM-dd'),
      fechaFinal: DateTime.fromFormat(fecha, 'd-MM-yyyy').toFormat('yyyy-MM-dd')
    };

    this.horario.VerificarHorariosExistentes(id_empleado, fechas).subscribe(existe => {
      let existencias = {
        existe: existe,
        dia: dia
      }
      this.datosSeleccionados.usuarios[index].existencias = existencias;
      for (var i = 0; i < existe.length; i++) {
        this.horarios.forEach((o: any) => {
          if (o.codigo === existe[i].codigo) {
            existe[i].detalles = o;
          }
        })

        // SI EXISTEN HORARIOS LIBRES O FERIADOS REGISTRADOS SE BORRAN PARA ACTUALIZAR LOS REGISTROS
        if (existe[i].default_ === 'DL' || existe[i].default_ === 'DFD') {
          // PREPARAR DATA PARA ELIMINAR HORARIO
          let plan_fecha = {
            codigo: this.datosSeleccionados.usuarios[index].codigo,
            fec_final: DateTime.fromFormat(fecha, 'd-MM-yyyy').toFormat('yyyy-MM-dd'),
            fec_inicio: DateTime.fromFormat(fecha, 'd-MM-yyyy').toFormat('yyyy-MM-dd'),
            id_horario: existe[i].id_horario,
          };
          this.eliminar_lista = this.eliminar_lista.concat(plan_fecha);
          verificar = 0;
        }

        else {
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
      this.SumarJornada(index, dia);
    });
  }

  // METODO PARA SUMAR HORAS DE JORNADA
  SumarJornada(index: any, dia: any) {
    let suma1 = '00:00:00';
    if (this.datosSeleccionados.usuarios[index].existencias.dia === dia) {
      this.datosSeleccionados.usuarios[index].existencias.existe.forEach(existe => {
        if (existe.default_ != 'DL' && existe.default_ != 'DFD') {
          suma1 = this.SumarHoras(suma1, existe.hora_trabajo);
        }
      })
    }
    for (var i = 0; i < this.datosSeleccionados.usuarios[index].asignado.length; i++) {
      if (this.datosSeleccionados.usuarios[index].asignado[i].dia === dia) {
        suma1 = this.SumarHoras(suma1, this.datosSeleccionados.usuarios[index].asignado[i].hora_trabajo);
      }
    }

    let total = 0;
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

    const [datoHorario] = this.horarios.filter((o: any) => {
      return o.default_ === 'DL';
    })

    let mes = DateTime.fromJSDate(this.fechaInicialF.value).toFormat('MM-yyyy');
    let fecha = dia + '-' + mes;

    let data = [{
      dia: dia,
      rango: '',
      fecha: DateTime.fromFormat(fecha, 'd-MM-yyyy').toFormat('yyyy-MM-dd'),
      horario: datoHorario.codigo,
      detalles: datoHorario.detalles,
      id_horario: datoHorario.id,
      hora_trabajo: datoHorario.hora_trabajo,
      tipo_dia: 'DL',
    }]

    if (this.datosSeleccionados.usuarios[index].asignado.length === 0) {
      this.VerificarDiaLibre(index, dia, data)
    }
    else if (this.datosSeleccionados.usuarios[index].asignado.length === 1) {
      if (this.datosSeleccionados.usuarios[index].asignado[0].dia === dia) {
        if (this.datosSeleccionados.usuarios[index].asignado[0].tipo_dia === 'DL') {
          this.datosSeleccionados.usuarios[index].asignado.splice(0, 1);
        }
        else if (this.datosSeleccionados.usuarios[index].asignado[0].tipo_dia === 'DFD') {
          this.toastr.warning('Dia configurado como FERIADO dentro del sistema.', 'Ups!!! VERIFICAR.', {
            timeOut: 6000,
          });
        }
        else {
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
        if (this.datosSeleccionados.usuarios[index].asignado[i].dia === dia) {
          if (this.datosSeleccionados.usuarios[index].asignado[i].tipo_dia === 'DL') {
            similar = 1;
            this.datosSeleccionados.usuarios[index].asignado.splice(i, 1);
            break;
          }
          else if (this.datosSeleccionados.usuarios[index].asignado[i].tipo_dia === 'DFD') {
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
      }
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
    let mes = DateTime.fromJSDate(this.fechaInicialF.value).toFormat('MM-yyyy');
    let fecha = dia + '-' + mes;

    if (this.datosSeleccionados.usuarios[index].existencias.dia != undefined) {

      if (this.datosSeleccionados.usuarios[index].existencias.dia === dia) {
        this.datosSeleccionados.usuarios[index].existencias.existe.forEach(existe => {
          if (existe.default_ === 'DL' || existe.default_ === 'DFD') {
            // PREPARAR DATA PARA ELIMINAR HORARIO
            let plan_fecha = {
              codigo: this.datosSeleccionados.usuarios[index].codigo,
              fec_final: DateTime.fromFormat(fecha, 'd-MM-yyyy').toFormat('yyyy-MM-dd'),
              fec_inicio: DateTime.fromFormat(fecha, 'd-MM-yyyy').toFormat('yyyy-MM-dd'),
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
        }
      }
      else {
        this.BuscarHorariosLibres(index, dia, data);
      }
    }
    else {
      this.BuscarHorariosLibres(index, dia, data);
    }
  }

  // METODO PARA BUSCAR HORARIOS EXISTENTES EN DIA COMO LIBRE
  BuscarHorariosLibres(index: any, dia: any, data: any) {
    let validar = 0;
    let mes = DateTime.fromJSDate(this.fechaInicialF.value).toFormat('MM-yyyy');;
    let fecha = dia + '-' + mes
    let fechas = {
      fechaInicio: DateTime.fromFormat(fecha, 'd-MM-yyyy').toFormat('yyyy-MM-dd'),
      fechaFinal: DateTime.fromFormat(fecha, 'd-MM-yyyy').toFormat('yyyy-MM-dd'),
    };

    let id_empleado = this.datosSeleccionados.usuarios[index].id;
    this.horario.VerificarHorariosExistentes(id_empleado, fechas).subscribe(existe => {
      let existencias = {
        existe: existe,
        dia: dia
      }
      this.datosSeleccionados.usuarios[index].existencias = existencias;

      for (var i = 0; i < existe.length; i++) {
        if (existe[i].default_ === 'DL' || existe[i].default_ === 'DFD') {
          // PREPARAR DATA PARA ELIMINAR HORARIO
          let plan_fecha = {
            codigo: this.datosSeleccionados.usuarios[index].codigo,
            fec_final: DateTime.fromFormat(fecha, 'd-MM-yyyy').toFormat('yyyy-MM-dd'),
            fec_inicio: DateTime.fromFormat(fecha, 'd-MM-yyyy').toFormat('yyyy-MM-dd'),
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
    console.log("ver feriado: ", feriado)
    const [datoHorario] = this.horarios.filter((o: any) => {
      return o.default_ === 'DFD';
    })
    var lista_feriados: any = [];
    console.log("ver lista feriados: ", feriado)
    console.log("ver fechaInicialF: ", this.fechaInicialF.value)
    feriado.forEach((d: any) => {
      let dia = DateTime.fromISO(d.fecha).toFormat('d');
      let mes = DateTime.fromJSDate(this.fechaInicialF.value).toFormat('MM-yyyy');
      let fecha = dia + '-' + mes;
      let data = [{
        dia: parseInt(dia),
        fecha: DateTime.fromFormat(fecha, 'd-MM-yyyy').toFormat('yyyy-MM-dd'),
        horario: datoHorario.codigo,
        detalles: datoHorario.detalles,
        id_horario: datoHorario.id,
        hora_trabajo: datoHorario.hora_trabajo,
        tipo_dia: 'DFD',
      }]
      lista_feriados = lista_feriados.concat(data);
      console.log("ver lista de feriados: ", lista_feriados)

      // PREPARAR DATA PARA ELIMINAR HORARIO
      let plan_fecha = {
        id_empleado: usuario.id,
        fec_final: DateTime.fromFormat(fecha, 'd-MM-yyyy').toFormat('yyyy-MM-dd'),
        fec_inicio: DateTime.fromFormat(fecha, 'd-MM-yyyy').toFormat('yyyy-MM-dd'),
        id_horario: datoHorario.id,
      };

      // Verificar si plan_fecha ya está en eliminar_lista
      const existe = this.eliminar_lista.some((plan: any) =>
        plan.id_empleado === plan_fecha.id_empleado &&
        plan.fec_final === plan_fecha.fec_final &&
        plan.fec_inicio === plan_fecha.fec_inicio &&
        plan.id_horario === plan_fecha.id_horario
      );

      if (!existe) {
        this.eliminar_lista = this.eliminar_lista.concat(plan_fecha);
        console.log("ver lista a eliminar: ", this.eliminar_lista)
      }
    })

    for (var a = 0; a < usuario.asignado.length; a++) {
      for (var f = 0; f < lista_feriados.length; f++) {
        if (usuario.asignado[a].dia === lista_feriados[f].dia) {
          if (usuario.asignado[a].tipo_dia === 'FD' || usuario.asignado[a].tipo_dia === 'L') {
            lista_feriados.splice(f, 1);
          }
        }
      }
    }

    usuario.asignado = usuario.asignado.concat(lista_feriados)
  }

  // METODO PARA VERIFICAR HORARIOS ASIGNADOS
  VerificarAsignados() {
    let usuarios: any = [];
    this.datosSeleccionados.usuarios.forEach((usu: any) => {
      if (usu.asignado.length != 0) {
        usuarios = usuarios.concat(usu);
      }
    })
    if (usuarios.length === 0) {
      this.toastr.warning('No ha registrado horarios.', 'Ups!!! VERIFICAR.', {
        timeOut: 6000,
      });
    } else {
      this.BuscarFeriados(this.fechaInicialF.value, this.fechaFinalF.value, usuarios, true);
    }
  }

  // METODO PARA BUSCAR FERIADOS
  async BuscarFeriados(inicio: any, fin: any, validos: any, verificar: boolean) {
    let feriados2: { [key: number]: any } = {};
    let cont = 0;
    const ids = validos.map((dh: any) => dh.id);

    let datos = {
      fecha_inicio: inicio,
      fecha_final: fin,
      ids
    }

    await this.feriado.ListarFeriadosCiudadMultiplesEmpleados(datos).subscribe(data => {
      data.forEach(feriado => {
        if (!feriados2[feriado.id]) {
          feriados2[feriado.id] = [feriado]
        } else {
          feriados2[feriado.id].push(feriado);
        }
      })
      validos.forEach((val: any) => {
        cont = cont + 1;
        if (feriados2[val.id]) {
          feriados2[val.id].forEach((f: any) => {
            console.log("ver fecha al verificar: ", f.fecha)
            for (var a = 0; a < val.asignado.length; a++) { 
            console.log("ver numero del dia al verificar: ", parseInt(DateTime.fromISO(f.fecha).toFormat('d')))

            if (val.asignado[a].dia === parseInt(DateTime.fromISO(f.fecha).toFormat('d'))) {
              // SI EL HORARIO ASIGNADO ES DE TIPO LABORABLE SE RETIRA DE LA LISTA
              if (val.asignado[a].tipo_dia != 'FD' && val.asignado[a].tipo_dia != 'L') {
                val.asignado.splice(a, 1);
              }
            }
          }
          })
      this.AsignarFeriado(feriados2[val.id], val);
    }

        if (cont === validos.length) {
      console.log("entra al metodo CrearDataHorario")
      this.datosSeleccionados.usuario = validos;
      this.CrearDataHorario(validos, verificar);
    }
  })
}, vacio => {
  this.datosSeleccionados.usuario = validos;
  this.CrearDataHorario(validos, verificar);
}
    )
  }

// METODO PARA CREAR LA DATA DE REGISTRO DE HORARIO
plan_general: any = [];

CrearDataHorario(lista: any, validar: boolean) {
  var contador = 0;
  var asignados = 0;

  lista.forEach((li: any) => {
    asignados = asignados + li.asignado.length;
  })

  let horarios2: { [key: number]: any } = {};
  this.plan_general = [];
  let ids_horario = []

  if (lista.length != 0) {
    lista.forEach((li: any) => {
      ids_horario = li.asignado.map((asig: any) => asig.id_horario);
    })
    this.restD.ConsultarUnDetalleHorarioMultiple({ ids_horario }).subscribe(det1 => {
      det1.forEach(horario => {
        if (!horarios2[horario.id_horario]) {
          horarios2[horario.id_horario] = [horario]
        } else {
          horarios2[horario.id_horario].push(horario);
        }
      })
      console.log("ver detalles de los horarios", horarios2)
      lista.forEach((li: any) => {
        console.log("ver asignado ", li.asignado);

        li.asignado.forEach((asig: any) => {
          contador = contador + 1;

          asig.rango = '';
          let dia_tipo = '';
          let origen = '';
          let tipo: any = null;

          if (asig.tipo_dia === 'DFD') {
            dia_tipo = 'FD';
            origen = 'FD';
            tipo = 'FD';
          }
          else if (asig.tipo_dia === 'DL') {
            dia_tipo = 'L';
            origen = 'L';
            tipo = 'L';
          }
          else if (asig.tipo_dia === 'FD') {
            dia_tipo = 'FD';
            origen = 'HFD';
            tipo = 'FD';
          }
          else if (asig.tipo_dia === 'L') {
            dia_tipo = 'L';
            origen = 'HL';
            tipo = 'L';
          }
          else {
            dia_tipo = 'N';
            origen = 'N';
          }

          if (horarios2[asig.id_horario]) {
            horarios2[asig.id_horario].map((element: any) => {
              var accion = 0;
              var nocturno: number = 0;
              if (element.tipo_accion === 'E') {
                accion = element.tolerancia;
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
                id_empleado: li.id,
                tipo_dia: dia_tipo,
                min_antes: element.minutos_antes,
                tolerancia: accion,
                id_horario: element.id_horario,
                min_despues: element.minutos_despues,
                fec_horario: asig.fecha,
                estado_origen: origen,
                estado_timbre: tipo,
                id_empl_cargo: li.id_cargo,
                id_det_horario: element.id,
                salida_otro_dia: nocturno,
                tipo_entr_salida: element.tipo_accion,
                fec_hora_horario: asig.fecha + ' ' + element.hora,
                min_alimentacion: element.minutos_comida,
              };
              if (element.segundo_dia === true) {
                plan.fec_hora_horario = DateTime.fromISO(asig.fecha).plus({ days: 1 }).toFormat('yyyy-MM-dd') + element.hora;

              }
              if (element.tercer_dia === true) {
                plan.fec_hora_horario = DateTime.fromISO(asig.fecha).plus({ days: 2 }).toFormat('yyyy-MM-dd') + element.hora;

              }
              // ALMACENAMIENTO DE PLANIFICACION GENERAL
              this.plan_general = this.plan_general.concat(plan);
            })
          }
          if (contador === asignados) {
            if (validar === true) {
              this.ValidarRangos(this.plan_general)
            }
          }
        })
      }
      )
    })
  }
}


// METODO PARA VALIDAR RANGOS DE TIEMPOS EN HORARIOS
ValidarRangos(lista: any) {
  var datos_o: any = [];
  var datos: any = [];
  var contador = 0;
  console.log("lista: ", lista)
  lista.forEach((obj: any) => {
    if (obj.salida_otro_dia === 1) {
      datos = datos.concat(obj)
    }
    else {
      datos_o = datos_o.concat(obj);
    }
  })

  console.log("ver verificacion de rangos datos: ", datos);
  datos.forEach((ele: any) => {

    for (var i = 0; i < datos_o.length; i++) {

      if (ele.codigo === datos_o[i].codigo) {

        if ((DateTime.fromISO(datos_o[i].fec_hora_horario).toFormat('yyyy-MM-dd') == DateTime.fromISO(ele.fec_hora_horario).toFormat('yyyy-MM-dd'))
          &&
          datos_o[i].tipo_accion === 'E' && ele.tipo_accion === 'S' && datos_o[i].tipo_dia === 'N') {

          if ( DateTime.fromISO(datos_o[i].fec_hora_horario).toFormat('HH:mm:ss') <= DateTime.fromISO(ele.fec_hora_horario).toFormat('HH:mm:ss')) {
            contador = 1;
            this.datosSeleccionados.usuario.forEach((li: any) => {
              if (li.codigo === ele.codigo) {
                li.asignado.forEach((asig: any) => {
                  if (asig.fecha === DateTime.fromISO(ele.fec_hora_horario).toFormat('yyyy-MM-dd')) {
                    asig.rango = 'RANGOS DE TIEMPO SIMILARES'
                  }
                })
              }
            })
            break;
          }
        }
      }
    }
  })
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
  let contador = 0;
  if (this.eliminar_lista.length === 0) {
    this.RegistrarPlanificacionMultiple();
  }
  else {
    let listaEliminar = this.eliminar_lista
    console.log("ver lista eliminar ", listaEliminar)
    this.restP.BuscarFechasMultiples({ listaEliminar }).subscribe((res: any) => {
      console.log("ver res", res)


      //res.forEach(item => {
      let datos = {
        id_plan:  res.map(item => item.id),
        user_name: this.user_name,
        ip: this.ip, ip_local: this.ips_locales,
      }

      this.restP.EliminarRegistro(datos).subscribe(datos => {
        //contador = contador + 1;
        //if (contador === this.eliminar_lista.length) {
        this.RegistrarPlanificacionMultiple();
        //}
      }, error => {
        //contador = contador + 1;
        //if (contador === this.eliminar_lista.length) {
        this.RegistrarPlanificacionMultiple();
        // }
      })
      //})
    }, error => {
      this.RegistrarPlanificacionMultiple();
    })
  }
}

// METODO PARA GUARDAR REGISTRO DE HORARIOS
RegistrarPlanificacionMultiple() {

  const datos = {
    plan_general: this.plan_general,
    user_name: this.user_name,
    ip: this.ip, ip_local: this.ips_locales,
  };
  // Dividir el objeto plan_general en partes más pequeñas
  const partes = this.dividirPlanGeneral(datos.plan_general);
  const totalPartes = partes.length; // Obtén la cantidad total de partes

  this.enviarParte(partes, 0, totalPartes);

}


enviarParte(partes: any[], parteIndex: number, totalPartes: number) {
  const datosParcial = {
    parte: partes[parteIndex],
    user_name: this.user_name,
    ip: this.ip, ip_local: this.ips_locales,
    parteIndex: parteIndex, // Enviar el índice de la parte actual
    totalPartes: totalPartes // Enviar el total de partes
  };

  // Llamada HTTP para enviar la parte actual
  this.restP.CrearPlanGeneralPorLotes(datosParcial).subscribe(res => {
    // Si la respuesta es "OK", continuamos
    if (res.message === 'OK') {
      if ((parteIndex + 1) < totalPartes) {
        // Si no hemos enviado todas las partes, llamamos recursivamente para enviar la siguiente
        this.enviarParte(partes, parteIndex + 1, totalPartes);
      } else {
        // Si hemos enviado todas las partes, mostramos el toast de éxito
        this.cargar = true;
        this.cargar = true;
        this.toastr.success('Operación exitosa.', 'Registro guardado.', {
          timeOut: 6000,
        });
      }
    } else {
      // Si hay un error, lo mostramos en consola
      console.log(res.message);
    }
  });
}

dividirPlanGeneral(plan_general: any[]): any[][] {
  const partes: any[][] = []; // Define explícitamente el tipo como un array de arrays
  const tamañoParte = 90000; // Ajusta el tamaño de cada parte según sea necesario
  // Verifica si el tamaño total es menor que el tamaño de cada parte
  if (plan_general.length <= tamañoParte) {
    return [plan_general]; // Devuelve el array original como la única parte
  }
  for (let i = 0; i < plan_general.length; i += tamañoParte) {
    const parte = plan_general.slice(i, i + tamañoParte); // Obtener una parte del array

    // Verifica si la parte es no vacía y la agrega
    if (parte.length > 0) {
      partes.push(parte); // Agregar la parte al array de partes
    }
  }
  return partes; // Devuelve el array de partes
}

// METODO PARA CARGAR TIMBRES
cargar: boolean = false;
CargarTimbres() {
  var codigos = '';
  this.datosSeleccionados.usuario.forEach((obj: any) => {
    if (codigos === '') {
      codigos = '\'' + obj.codigo + '\''
    }
    else {
      codigos = codigos + ', \'' + obj.codigo + '\''
    }
  })

  let usuarios = {
    codigo: codigos,
    
    fec_final: DateTime.fromJSDate(this.fechaFinalF.value).plus({ days: 2 }).toFormat('yyyy-MM-dd'),
    fec_inicio: DateTime.fromJSDate(this.fechaInicialF.value).toFormat('yyyy-MM-dd'),
    
  };

  this.timbrar.BuscarTimbresPlanificacion(usuarios).subscribe(datos => {
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


// METODO PARA SUMAR HORAS
SumarHoras(suma: string, tiempo: string) {
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
  return h + ':' + m + ':' + s;
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

// METODO PARA MOSTRAR FERIADOS EXISTENTES EN EL CALENDARIO
MostrarFeriados() {
  this.BuscarFeriados(this.fechaInicialF.value, this.fechaFinalF.value, this.datosSeleccionados.usuarios, false);
  this.ver_verificar = true;
  this.mostrar_feriados = false;
}

}
