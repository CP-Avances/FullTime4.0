// IMPORTAR LIBRERIAS
import * as moment from 'moment';
import { Router } from '@angular/router';
import { ThemePalette } from '@angular/material/core';
import { ToastrService } from 'ngx-toastr';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { Component, OnInit, Input } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';

// IMPORTACION DE SERVICIOS
import { HorarioService } from 'src/app/servicios/catalogos/catHorarios/horario.service';
import { FeriadosService } from 'src/app/servicios/catalogos/catFeriados/feriados.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { PlanGeneralService } from 'src/app/servicios/planGeneral/plan-general.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { EmpleadoHorariosService } from 'src/app/servicios/horarios/empleadoHorarios/empleado-horarios.service';
import { DetalleCatHorariosService } from 'src/app/servicios/horarios/detalleCatHorarios/detalle-cat-horarios.service';
import { VerEmpleadoComponent } from 'src/app/componentes/empleado/ver-empleado/ver-empleado.component';
import { HorarioMultipleEmpleadoComponent } from '../../rango-fechas/horario-multiple-empleado/horario-multiple-empleado.component';

@Component({
  selector: 'app-registo-empleado-horario',
  templateUrl: './registo-empleado-horario.component.html',
  styleUrls: ['./registo-empleado-horario.component.css'],
})

export class RegistoEmpleadoHorarioComponent implements OnInit {

  @Input() data_horario: any;

  // VARIABLES PROGRESS SPINNER
  progreso: boolean = false;
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 10;

  // VARIABLES QUE ALMACENAN SELECCION DE DIAS LIBRES
  lunes = false;
  martes = false;
  miercoles = false;
  jueves = false;
  viernes = false;
  sabado = false;
  domingo = false;

  // VARIABLE DE ALMACENAMIENTO
  horarios: any = [];
  feriados: any = [];

  // CONTROL DE BOTONES
  cerrar_ventana: boolean = true;
  btn_eliminar: boolean = true;
  btn_resetear: boolean = false;
  btn_guardar: boolean = true;
  btn_nuevo: boolean = false;


  // INICIALIZACIÓN DE CAMPOS DE FORMULARIOS
  fechaInicioF = new FormControl('', Validators.required);
  fechaFinalF = new FormControl('', [Validators.required]);
  miercolesF = new FormControl('');
  horarioF = new FormControl('', [Validators.required]);
  viernesF = new FormControl('');
  domingoF = new FormControl('');
  martesF = new FormControl('');
  juevesF = new FormControl('');
  sabadoF = new FormControl('');
  lunesF = new FormControl('');

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    fechaInicioForm: this.fechaInicioF,
    fechaFinalForm: this.fechaFinalF,
    miercolesForm: this.miercolesF,
    horarioForm: this.horarioF,
    viernesForm: this.viernesF,
    domingoForm: this.domingoF,
    martesForm: this.martesF,
    juevesForm: this.juevesF,
    sabadoForm: this.sabadoF,
    lunesForm: this.lunesF,
  });

  constructor(
    public rest: EmpleadoHorariosService,
    public restH: HorarioService,
    public restE: EmpleadoService,
    public restP: PlanGeneralService,
    public restD: DetalleCatHorariosService,
    public router: Router,
    public validar: ValidacionesService,
    public ventana: VerEmpleadoComponent,
    public feriado: FeriadosService,
    public componente: HorarioMultipleEmpleadoComponent,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    console.log('data', this.data_horario)
    this.BuscarHorarios();
    this.ObtenerEmpleado(this.data_horario.idEmpleado);
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
            nombre: '(' + this.hora_entrada + '-' + this.hora_salida + ') ' + hor.codigo
          }]
          if (this.vista_horarios.length === 0) {
            this.vista_horarios = datos_horario;
          } else {
            this.vista_horarios = this.vista_horarios.concat(datos_horario);
          }
        }, error => {
          let datos_horario = [{
            id: hor.id,
            nombre: hor.codigo
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

  // METODO PARA VER LA INFORMACION DEL EMPLEADO 
  empleado: any = [];
  ObtenerEmpleado(idemploy: any) {
    this.empleado = [];
    this.restE.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleado = data;
    })
  }

  // METODO PARA VERIFICAR QUE CAMPOS DE FECHAS NO SE ENCUENTREN VACIOS
  VerificarIngresoFechas(form: any) {
    if (form.fechaInicioForm === '' || form.fechaInicioForm === null || form.fechaInicioForm === undefined ||
      form.fechaFinalForm === '' || form.fechaFinalForm === null || form.fechaFinalForm === undefined) {
      this.toastr.warning('Por favor ingrese fechas de inicio y fin de actividades.', '', {
        timeOut: 6000,
      });

      this.formulario.patchValue({
        horarioForm: ''
      })
    }
    else {
      this.ValidarFechas(form);
    }
  }

  // METODO PARA VERIFICAR SI EL EMPLEADO INGRESO CORRECTAMENTE LAS FECHAS
  ValidarFechas(form: any) {
    let datosBusqueda = {
      id_empleado: this.data_horario.idEmpleado
    }

    // METODO PARA BUSCAR FECHA DE CONTRATO REGISTRADO EN FICHA DE EMPLEADO
    this.restE.BuscarFechaContrato(datosBusqueda).subscribe(response => {
      // VERIFICAR SI LAS FECHAS SON VALIDAS DE ACUERDO A LOS REGISTROS Y FECHAS INGRESADAS
      if (Date.parse(response[0].fec_ingreso.split('T')[0]) < Date.parse(form.fechaInicioForm)) {
        if (Date.parse(form.fechaInicioForm) <= Date.parse(form.fechaFinalForm)) {
          this.VerificarDuplicidad(form);
        }
        else {
          this.toastr.warning('Fecha de inicio de actividades debe ser mayor a la fecha fin de actividades.', '', {
            timeOut: 6000,
          });
          this.formulario.patchValue({
            horarioForm: ''
          })
        }
      }
      else {
        this.toastr.warning('Fecha de inicio de actividades no puede ser anterior a fecha de ingreso de contrato.', '', {
          timeOut: 6000,
        });
        this.formulario.patchValue({
          horarioForm: ''
        })
      }
    });
  }

  // METODO PARA VERIFICAR DUPLICIDAD DE REGISTROS
  horarioExistentes: any = [];
  VerificarDuplicidad(form: any) {
    let fechas = {
      fechaInicio: form.fechaInicioForm,
      fechaFinal: form.fechaFinalForm,
      id_horario: form.horarioForm
    };
    this.rest.VerificarDuplicidadHorarios(this.data_horario.codigo, fechas).subscribe(existe => {
      this.toastr.warning(
        'Fechas y horario seleccionado ya se encuentran registrados.',
        'Verificar la planificación.', {
        timeOut: 6000,
      });
      this.ControlarBotones(false, true, true, true, false);
    }, error => {
      this.BuscarFeriados(form);
      this.BuscarFeriadosRecuperar(form);
      this.ValidarHorarioByHorasTrabaja(form);
    });
  }

  // METODO PARA BUSCAR FERIADOS
  BuscarFeriados(form: any) {
    this.feriados = [];
    let datos = {
      fecha_inicio: form.fechaInicioForm,
      fecha_final: form.fechaFinalForm,
      id_empleado: parseInt(this.data_horario.idEmpleado)
    }
    this.feriado.ListarFeriadosCiudad(datos).subscribe(data => {
      this.feriados = data;
    })
  }

  // METODO PARA BUSCAR FECHAS DE RECUPERACION DE FERIADOS
  recuperar: any = [];
  BuscarFeriadosRecuperar(form: any) {
    this.recuperar = [];
    let datos = {
      fecha_inicio: form.fechaInicioForm,
      fecha_final: form.fechaFinalForm,
      id_empleado: parseInt(this.data_horario.idEmpleado)
    }
    this.feriado.ListarFeriadosRecuperarCiudad(datos).subscribe(data => {
      this.recuperar = data;
    })
  }

  // VARIABLES USADAS PARA AUDITORIA
  data_nueva: any = [];
  // METODO PARA REGISTRAR DATOS DE HORARIO
  fechasHorario: any = [];
  inicioDate: any;
  finDate: any;
  InsertarPlanificacion(form: any) {
    this.restP.CrearPlanGeneral(this.plan_general).subscribe(res => {
      if (res.message === 'OK') {
        this.progreso = false;
        this.toastr.success('Operación exitosa.', 'Registro guardado.', {
          timeOut: 6000,
        });
        this.ControlarBotones(false, true, true, false, true);
      }
      else {
        this.progreso = false;
        this.toastr.error('Ups!!! se ha producido un error. Es recomendable eliminar la planificación.', 'Verificar la planificación.', {
          timeOut: 6000,
        });
        this.ControlarBotones(false, true, false, false, false);
      }
    }, error => {
      this.progreso = false;
      this.toastr.error('Ups!!! se ha producido un error. Es recomendable eliminar la planificación.', 'Verificar la planificación.', {
        timeOut: 6000,
      });
      this.ControlarBotones(false, true, false, false, false);
    })
    this.AuditarPlanificar(form);
  }

  // METODO DE INGRESO DE HORARIOS PLAN GENERAL
  detalles: any = [];
  plan_general: any = [];
  CrearPlanGeneral(form: any) {
    this.detalles = [];
    this.plan_general = [];
    this.restD.ConsultarUnDetalleHorario(form.horarioForm).subscribe(res => {
      this.detalles = res;
      this.fechasHorario = []; // ARRAY QUE CONTIENE TODAS LAS FECHAS DEL MES INDICADO 
      this.inicioDate = moment(form.fechaInicioForm).format('YYYY-MM-DD');
      this.finDate = moment(form.fechaFinalForm).format('YYYY-MM-DD');

      // LOGICA PARA OBTENER EL NOMBRE DE CADA UNO DE LOS DIAS DEL PERIODO INDICADO
      while (this.inicioDate <= this.finDate) {
        this.fechasHorario.push(this.inicioDate);
        var newDate = moment(this.inicioDate).add(1, 'd').format('YYYY-MM-DD')
        this.inicioDate = newDate;
      }

      var tipo: any = null;
      var tipo_dia: string = '';
      this.fechasHorario.map(obj => {
        // DEFINICION DE TIPO DE DIA SEGUN HORARIO
        tipo_dia = 'N';
        tipo = null;
        var day = moment(obj).day();
        if (moment.weekdays(day) === 'lunes') {
          if (form.lunesForm === true) {
            tipo = 'L';
            tipo_dia = 'L';
          }
        }
        if (moment.weekdays(day) === 'martes') {
          if (form.martesForm === true) {
            tipo = 'L';
            tipo_dia = 'L';
          }
        }
        if (moment.weekdays(day) === 'miércoles') {
          if (form.miercolesForm === true) {
            tipo = 'L';
            tipo_dia = 'L';
          }
        }
        if (moment.weekdays(day) === 'jueves') {
          if (form.juevesForm === true) {
            tipo = 'L';
            tipo_dia = 'L';
          }
        }
        if (moment.weekdays(day) === 'viernes') {
          if (form.viernesForm === true) {
            tipo = 'L';
            tipo_dia = 'L';
          }
        }
        if (moment.weekdays(day) === 'sábado') {
          if (form.sabadoForm === true) {
            tipo = 'L';
            tipo_dia = 'L';
          }
        }
        if (moment.weekdays(day) === 'domingo') {
          if (form.domingoForm === true) {
            tipo = 'L';
            tipo_dia = 'L';
          }
        }

        // BUSCAR FERIADOS 
        if (this.feriados.length != 0) {
          for (let i = 0; i < this.feriados.length; i++) {
            if (moment(this.feriados[i].fecha, 'YYYY-MM-DD').format('YYYY-MM-DD') === obj) {
              tipo = 'FD';
              tipo_dia = 'FD';
              break;
            }
          }
        }

        // BUSCAR FECHAS DE RECUPERACION DE FERIADOS
        if (this.recuperar.length != 0) {
          for (let j = 0; j < this.recuperar.length; j++) {
            if (moment(this.recuperar[j].fec_recuperacion, 'YYYY-MM-DD').format('YYYY-MM-DD') === obj) {
              tipo_dia = 'N';
              break;
            }
          }
        }

        // COLOCAR DETALLE DE DIA SEGUN HORARIO
        this.detalles.map(element => {
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
            codigo: this.empleado[0].codigo,
            tipo_dia: tipo_dia,
            min_antes: element.min_antes,
            tolerancia: accion,
            id_horario: form.horarioForm,
            min_despues: element.min_despues,
            fec_horario: obj,
            estado_timbre: tipo,
            id_empl_cargo: this.data_horario.idCargo,
            id_det_horario: element.id,
            salida_otro_dia: nocturno,
            tipo_entr_salida: element.tipo_accion,
            fec_hora_horario: obj + ' ' + element.hora,
          };
          if (element.segundo_dia === true) {
            plan.fec_hora_horario = moment(obj).add(1, 'd').format('YYYY-MM-DD') + ' ' + element.hora;
          }
          if (element.tercer_dia === true) {
            plan.fec_hora_horario = moment(obj).add(2, 'd').format('YYYY-MM-DD') + ' ' + element.hora;
          }

          // ALMACENAMIENTO DE PLANIFICACION GENERAL
          this.plan_general = this.plan_general.concat(plan);
        })
      })

      this.progreso = true;
      // METODO PARA REGISTTRAR LA PLANIFICACION
      this.InsertarPlanificacion(form);
    });
  }

  // METODO DE AUDITORIA
  AuditarPlanificar(form: any) {
    let planifica = {
      // DIAS DE LA SEMANA
      lunes: form.lunesForm,
      martes: form.martesForm,
      miercoles: form.miercolesForm,
      jueves: form.juevesForm,
      viernes: form.viernesForm,
      sabado: form.sabadoForm,
      domingo: form.domingoForm,
      // DATOS DE USUARIO Y HORARIO
      codigo: this.empleado[0].codigo,
      fec_final: form.fechaFinalForm,
      fec_inicio: form.fechaInicioForm,
      id_horarios: form.horarioForm,
      id_empl_cargo: this.data_horario.idCargo,
    };

    // METODO PARA AUDITAR PLANIFICACION HORARIA
    this.data_nueva = [];
    this.data_nueva = planifica;
    this.validar.Auditar('app-web', 'empl_horarios', '', this.data_nueva, 'INSERT');
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.formulario.reset();
    this.ControlarBotones(true, true, true, false, false);
  }

  // METODO PARA CERRAR VENTANA DE SELECCION DE HORARIO
  CerrarVentana() {
    this.LimpiarCampos();
    if (this.data_horario.pagina === 'ver_empleado') {
      this.ventana.ventana_horario = false;
      this.ventana.horarios_usuario = true;
    }
    else {
      this.componente.auto_individual = true;
      this.componente.ventana_horario = false;
      this.componente.seleccionar = true;
      this.componente.LimpiarFormulario();
    }
  }

  // METODO PARA VALIDAR HORAS DE TRABAJO SEGUN CONTRATO
  sumHoras: any;
  suma = '00:00:00';
  horariosEmpleado: any = []
  ValidarHorarioByHorasTrabaja(form: any) {
    this.suma = '00:00:00';
    this.sumHoras = '';
    const [obj_res] = this.horarios.filter(o => {
      return o.id === parseInt(form.horarioForm)
    })
    if (!obj_res) return this.toastr.warning('Horario no válido.');

    if (obj_res.detalle === false) {
      // HORARIOS SIN DETALLES
    }
    else {
      const seg = this.data_horario.horas_trabaja;
      const { hora_trabajo, id } = obj_res;

      // VERIFICACION DE FORMATO CORRECTO DE HORARIOS
      if (!this.StringTimeToSegundosTime(hora_trabajo)) {
        this.formulario.patchValue({ horarioForm: '' });

        this.toastr.warning(
          'Formato de horas en horario seleccionado no son válidas.',
          'Dar click para verificar registro de detalle de horario.', {
          timeOut: 6000,
        }).onTap.subscribe(obj => {
          this.router.navigate(['/verHorario', id]);
        });
      }
      else {
        // METODO PARA LECTURA DE HORARIOS DE EMPLEADO
        this.horariosEmpleado = [];
        let fechas = {
          fechaInicio: form.fechaInicioForm,
          fechaFinal: form.fechaFinalForm,
        };

        this.rest.VerificarHorariosExistentes(this.data_horario.codigo, fechas).subscribe(existe => {
          this.horariosEmpleado = existe;
          this.horariosEmpleado.map(h => {
            // SUMA DE HORAS DE CADA UNO DE LOS HORARIOS DEL EMPLEADO
            this.suma = moment(this.suma, 'HH:mm:ss').add(moment.duration(h.hora_trabajo)).format('HH:mm:ss');
          })
          // SUMA DE HORAS TOTALES DE HORARIO CON HORAS DE HORARIO SELECCIONADO
          this.sumHoras = moment(this.suma, 'HH:mm:ss').add(moment.duration(hora_trabajo)).format('HH:mm:ss');

          // METODO PARA COMPARAR HORAS DE TRABAJO CON HORAS DE CONTRATO
          if (this.StringTimeToSegundosTime(this.sumHoras) === this.StringTimeToSegundosTime(seg)) {
            return this.toastr.info('Va a cumplir un total de: ' + this.sumHoras + ' horas.', '',
              {
                timeOut: 2000,
              });
          } else if (this.StringTimeToSegundosTime(this.sumHoras) < this.StringTimeToSegundosTime(seg)) {
            return this.toastr.info('Cumplirá un total de ' + this.sumHoras + ' horas.',
              'Recuerde que de acuerdo a su contrato debe cumplir un total de ' + seg + ' horas.', {
              timeOut: 4000,
            });
          }
          else {
            this.formulario.patchValue({ horarioForm: '' });
            return this.toastr.warning('Esta registrando un total de ' + this.sumHoras + ' horas.',
              'Recuerde que de acuerdo a su contrato debe cumplir un total de ' + seg + ' horas.', {
              timeOut: 6000,
            });
          }
        }, error => {
          // METODO PARA COMPARAR HORAS DE TRABAJO CON HORAS DE CONTRATO CUANDO NO EXISTEN HORARIOS EN LAS FECHAS INDICADAS
          if (this.StringTimeToSegundosTime(hora_trabajo) === this.StringTimeToSegundosTime(seg)) {
            return this.toastr.info('Al resgitrar la planificación cumplirá con un total de: ' + hora_trabajo + ' horas.', '',
              {
                timeOut: 2000,
              });

          } else if (this.StringTimeToSegundosTime(hora_trabajo) < this.StringTimeToSegundosTime(seg)) {
            return this.toastr.info('Cumplirá un total de ' + hora_trabajo + ' horas.',
              'Recuerde que de acuerdo a su contrato debe cumplir un total de ' + seg + ' horas.', {
              timeOut: 4000,
            });
          }
          else {
            this.formulario.patchValue({ horarioForm: '' });
            return this.toastr.warning('El horario seleccionado indica un total de ' + hora_trabajo + ' horas.',
              'Recuerde que de acuerdo a su contrato debe cumplir un total de ' + seg + ' horas.', {
              timeOut: 6000,
            });
          }
        });
      }
    }
  }

  // METODO PARA ELIMINAR PLANIFICACION GENERAL DE HORARIOS
  EliminarPlanificacion(form: any) {
    this.progreso = true;
    let plan_fecha = {
      codigo: this.data_horario.codigo,
      fec_final: form.fechaFinalForm,
      fec_inicio: form.fechaInicioForm,
      id_horario: form.horarioForm,
    };
    this.restP.BuscarFechas(plan_fecha).subscribe(res => {
      // METODO PARA ELIMINAR DE LA BASE DE DATOS
      this.restP.EliminarRegistro(res).subscribe(datos => {
        console.log('ver eliminar ', datos)
        if (datos.message === 'OK') {
          this.progreso = false;
          this.toastr.error('Operación exitosa.', 'Registros eliminados.', {
            timeOut: 6000,
          });
          this.ControlarBotones(true, true, true, false, false);
        }
        else {
          this.progreso = false;
          this.toastr.error('Ups!!! se ha producido un error. Intentar eliminar los registros nuevamente.', '', {
            timeOut: 6000,
          });
          this.ControlarBotones(false, true, false, false, false);
        }
      }, error => {
        this.progreso = false;
        this.toastr.error('Ups!!! se ha producido un error. Intentar eliminar los registros nuevamente.', '', {
          timeOut: 6000,
        });
        this.ControlarBotones(false, true, false, false, false);
      })
    }, error => {
      this.progreso = false;
      this.toastr.success('Continuar...', 'No se han encontrado registros para eliminar.', {
        timeOut: 6000,
      });
      this.ControlarBotones(true, true, true, false, false);
    })
  }

  // METODO PARA SUMAR HORAS
  StringTimeToSegundosTime(stringTime: string) {
    const h = parseInt(stringTime.split(':')[0]) * 3600;
    const m = parseInt(stringTime.split(':')[1]) * 60;
    const s = parseInt(stringTime.split(':')[2]);
    return h + m + s
  }

  // METODO PARA LIMPIAR CAMPO SELECCION DE HORARIO
  LimpiarHorario() {
    this.formulario.patchValue({ horarioForm: '' });
  }

  // METODO PARA CONTROLAR VISIBILIDAD DE BOTONES
  ControlarBotones(guardar: boolean, eliminar: boolean, cerrar: boolean, resetear: boolean, nuevo: boolean) {
    this.btn_guardar = guardar;
    this.btn_eliminar = eliminar;
    this.cerrar_ventana = cerrar;
    this.btn_resetear = resetear;
    this.btn_nuevo = nuevo;
  }

  // METODO PARA CREAR NUEVO REGISTRO
  CrearNuevoRegistro() {
    this.LimpiarHorario();
    this.ControlarBotones(true, true, true, false, false);
  }

}
