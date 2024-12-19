// IMPORTAR LIBRERIAS
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Component, OnInit, Input } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { DateTime } from 'luxon';

// IMPORTACION DE SERVICIOS
import { HorarioService } from 'src/app/servicios/horarios/catHorarios/horario.service';
import { TimbresService } from 'src/app/servicios/timbres/timbrar/timbres.service';
import { FeriadosService } from 'src/app/servicios/horarios/catFeriados/feriados.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { PlanGeneralService } from 'src/app/servicios/horarios/planGeneral/plan-general.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { EmpleadoHorariosService } from 'src/app/servicios/horarios/empleadoHorarios/empleado-horarios.service';
import { DetalleCatHorariosService } from 'src/app/servicios/horarios/detalleCatHorarios/detalle-cat-horarios.service';

// IMPORTAR COMPONENTES
import { HorarioMultipleEmpleadoComponent } from '../horario-multiple-empleado/horario-multiple-empleado.component';
import { BuscarPlanificacionComponent } from '../buscar-planificacion/buscar-planificacion.component';
import { VerEmpleadoComponent } from 'src/app/componentes/usuarios/empleados/datos-empleado/ver-empleado/ver-empleado.component';

@Component({
  selector: 'app-registo-empleado-horario',
  templateUrl: './registo-empleado-horario.component.html',
  styleUrls: ['./registo-empleado-horario.component.css'],
})

export class RegistoEmpleadoHorarioComponent implements OnInit {
  ips_locales: any = '';

  @Input() data_horario: any;

  // VARIABLE DE ALMACENAMIENTO
  horarios: any = [];
  feriados: any = [];

  // CONTROL DE BOTONES
  cerrar_ventana: boolean = true;
  btn_eliminar: boolean = true;
  btn_resetear: boolean = false;
  btn_guardar: boolean = true;
  btn_nuevo: boolean = false;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // INICIALIZACION DE CAMPOS DE FORMULARIOS
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
    public timbrar: TimbresService,
    public busqueda: BuscarPlanificacionComponent,
    public componente: HorarioMultipleEmpleadoComponent,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');  
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    }); 

    this.BuscarHorarios();
    this.ObtenerEmpleado(this.data_horario.idEmpleado);
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
          // VERIFICAR HORARIOS DE DESCANSO Y FERIADOS
          if (hor.default_ === 'DL' || hor.default_ === 'DFD') {
            this.vista_descanso = this.vista_descanso.concat(datos_horario);
            let descanso = {
              tipo: hor.default_,
              id_horario: hor.id,
              detalle: this.detalles_horarios
            }
            // HORARIOS NO SE MUESTRAN EN LA LISTA PRINCIPAL
            this.lista_descanso = this.lista_descanso.concat(descanso);
          }
          else {
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

  fechaInicioFormluxon: any;
  fechaFinFormluxon: any;

  // METODO PARA VERIFICAR QUE CAMPOS DE FECHAS NO SE ENCUENTREN VACIOS
  VerificarIngresoFechas(form: any) {
    this.fechaInicioFormluxon = this.validar.DarFormatoFecha(form.fechaInicioForm, 'yyyy-MM-dd');
    this.fechaFinFormluxon = this.validar.DarFormatoFecha(form.fechaFinalForm, 'yyyy-MM-dd');

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
      const fechaInicioForm = form.fechaInicioForm;
      const fechaFinalForm = form.fechaFinalForm;

      // VERIFICAR SI LAS FECHAS SON VALIDAS DE ACUERDO A LOS REGISTROS Y FECHAS INGRESADAS (CONTRATO)
      if ((Date.parse(response[0].fecha_ingreso.split('T')[0]) <= Date.parse(DateTime.fromISO(fechaInicioForm).toFormat('yyyy-MM-dd'))) &&
        (Date.parse(response[0].fecha_salida.split('T')[0]) >= Date.parse(DateTime.fromISO(fechaFinalForm).toFormat('yyyy-MM-dd')))) {
        // VERIFICAR FECHAS INGRESADAS
        if (Date.parse(form.fechaInicioForm) <= Date.parse(form.fechaFinalForm)) {
          this.VerificarDuplicidad(form);
        }
        else {
          this.toastr.warning('Fecha de inicio de actividades debe ser mayor a la fecha fin de actividades.', '', {
            timeOut: 6000,
          });
          this.formulario.patchValue({
            horarioForm: '',
          });
        }
      }
      else {
        this.toastr.warning('Las fechas ingresadas no estan dentro del contrato vigente del empleado.', 'Ups!!! algo salio mal.', {
          timeOut: 6000,
        });
        this.formulario.patchValue({
          horarioForm: '',
        });
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
    this.rest.VerificarDuplicidadHorarios(this.data_horario.idEmpleado, fechas).subscribe(existe => {
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

  // METODO PARA VALIDAR HORAS DE TRABAJO SEGUN CONTRATO
  sumHoras: any;
  suma = '00:00:00';
  horariosEmpleado: any = []
  ValidarHorarioByHorasTrabaja(form: any) {
    this.suma = '00:00:00';
    this.sumHoras = '';
    // RETORNAR DATOS DE HORARIO SELECCIONADO
    const [obj_res] = this.horarios.filter((o: any) => {
      return o.id === parseInt(form.horarioForm)
    })
    if (!obj_res) return this.toastr.warning('Horario no válido.');
    const seg = this.data_horario.horas_trabaja;
    const { hora_trabajo, id } = obj_res;
    // VERIFICACION DE FORMATO CORRECTO DE HORAS DE HORARIOS
    if (!this.StringTimeToSegundosTime(hora_trabajo)) {
      this.formulario.patchValue({ horarioForm: '' });
      this.toastr.warning(
        'Formato de horas en horario seleccionado no son válidas.',
        'Dar click para verificar registro de detalle de horario.', {
        timeOut: 6000,
      }).onTap.subscribe(obj => {
        if (this.data_horario.pagina === 'ver_empleado') {
          this.router.navigate(['/horario/']);
        }
        else {
          this.componente.ventana_horario = false;
          this.componente.VerDetalleHorario(id);
        }
      });
    }
    else {
      // METODO PARA LECTURA DE HORARIOS DE EMPLEADO
      this.horariosEmpleado = [];
      let fechas = {
        fechaInicio: form.fechaInicioForm,
        fechaFinal: form.fechaFinalForm,
      };
      // BUSQUEDA DE HORARIOS
      this.rest.VerificarHorariosExistentes(this.data_horario.idEmpleado, fechas).subscribe(existe => {
        this.horariosEmpleado = existe;
        // LEER HORARIOS EXISTENTES
        this.horariosEmpleado.map((h: any) => {
          // SUMA DE HORAS DE CADA UNO DE LOS HORARIOS DEL EMPLEADO SE DESCARTA LIBRES Y FERIADOS DEL SISTEMA
          if (h.default_ != 'DL' && h.default_ != 'DFD') {
            this.suma = this.SumarHoras(this.suma, h.hora_trabajo);
          }
        })
        // SUMA DE HORAS TOTALES DE HORARIO CON HORAS DE HORARIO SELECCIONADO
        this.sumHoras = this.SumarHoras(this.suma, hora_trabajo);
        let verificador = this.VerificarHorarioRangos(obj_res);
        if (verificador === 2) {
          this.toastr.warning('No es posible registrar horarios con rangos de tiempo similares.', 'Ups!!! VERIFICAR.', {
            timeOut: 6000,
          });
          this.ControlarBotones(false, false, true, true, false);
        }
        else {
          // METODO PARA COMPARAR HORAS DE TRABAJO CON HORAS DE CONTRATO
          this.IndicarNotificacionHoras(form, this.sumHoras, seg);
        }
      }, error => {
        // METODO PARA COMPARAR HORAS DE TRABAJO CON HORAS DE CONTRATO CUANDO NO EXISTEN HORARIOS EN LAS FECHAS INDICADAS
        this.IndicarNotificacionHoras(form, hora_trabajo, seg);
      });
    }
  }

  // METODO PARA VERIFICAR QUE NO EXISTAN HORARIOS DENTRO DE LOS MISMOS RANGOS
  VerificarHorarioRangos(ingresado: any) {
    let verificador = 0;
    // SE VERIFICA LOS HORARIOS (existentes ===> this.horariosEmpleado)
    for (var i = 0; i < this.horariosEmpleado.length; i++) {
      // CICLO DE HORARIOS
      for (var j = 0; j < this.horarios.length; j++) {
        // SE COMPARA CON LOS DATOS DE HORARIOS DEL SISTEMA (sistema ===> this.horarios)
        if (this.horariosEmpleado[i].id_horario === this.horarios[j].id) {
          // SE LEE HORARIOS LABORABLES
          if (this.horarios[j].default_ === 'N' || this.horarios[j].default_ === 'DHA' || this.horarios[j].default_ === 'L' || this.horarios[j].default_ === 'FD') {
            // HORARIOS QUE FINALIZAN EL MISMO DIA
            if (this.horarios[j].detalles.segundo_dia === false && ingresado.detalles.segundo_dia === false) {
              // VERIFICAR QUE LAS HORAS NO SE INTERSEQUEN
              if (this.horarios[j].detalles.salida < ingresado.detalles.entrada) {
                verificador = 0;
              }
              else if (this.horarios[j].detalles.entrada > ingresado.detalles.salida) {
                verificador = 0
              }
              else {
                // RANGOS SIMILARES
                verificador = 2;
                break;
              }
            }
            // SALIDA AL SIGUIENTE DIA EN AMBOS HORARIOS
            else if (this.horarios[j].detalles.segundo_dia === true && ingresado.detalles.segundo_dia === true) {
              verificador = 2;
              break;
            }
            // SALIDA AL SIGUIENTE DIA EN EL HORARIO SELECCIONADO
            else if (this.horarios[j].detalles.segundo_dia === false && ingresado.detalles.segundo_dia === true) {
              if (this.horarios[j].detalles.entrada > ingresado.detalles.salida
                && this.horarios[j].detalles.salida > ingresado.detalles.salida
                && this.horarios[j].detalles.salida < ingresado.detalles.entrada) {
                verificador = 0;
              }
              else {
                verificador = 2;
                break;
              }
            }
            // SALIDA EN EL HORARIO DE COMPARACION
            else if (this.horarios[j].detalles.segundo_dia === true && ingresado.detalles.segundo_dia === false) {
              if (this.horarios[j].detalles.salida < ingresado.detalles.entrada
                && this.horarios[j].detalles.salida < ingresado.detalles.salida
                && this.horarios[j].detalles.entrada > ingresado.detalles.salida) {
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
      if (verificador != 0) {
        break;
      }
    }
    return verificador;
  }

  // METODO PARA COMPARAR HORAS DE TRABAJO CON HORAS DE ULTIMO CARGO
  IndicarNotificacionHoras(form: any, time_horario: any, time_contrato: any) {
    if (this.StringTimeToSegundosTime(time_horario) === this.StringTimeToSegundosTime(time_contrato)) {
      this.ConsultarDetalleHorario(form);
      this.ControlarBotones(true, true, true, true, false);
      return this.toastr.info('Al registrar la planificación cumplirá con un total de ' + time_horario + ' horas.', '',
        {
          timeOut: 2000,
        });
    } else if (this.StringTimeToSegundosTime(time_horario) < this.StringTimeToSegundosTime(time_contrato)) {
      this.ConsultarDetalleHorario(form);
      this.ControlarBotones(true, true, true, true, false);
      return this.toastr.info('Al registrar la planificación cumplirá con un total de ' + time_horario + ' horas.',
        'De acuerdo a su contrato debe cumplir un total de ' + time_contrato + ' horas.', {
        timeOut: 4000,
      });
    }
    else {
      this.ConsultarDetalleHorario(form);
      this.ControlarBotones(true, true, true, true, false);
      return this.toastr.info('Al registrar la planificación cumplirá con un total de ' + time_horario + ' horas.',
        'De acuerdo a su contrato debe cumplir un total de ' + time_contrato + ' horas.', {
        timeOut: 6000,
      });
    }
  }

  // METODO PARA CONSULTAR DETALLES DE HORARIOS
  ConsultarDetalleHorario(form: any) {
    this.detalles = [];
    this.restD.ConsultarUnDetalleHorario(form.horarioForm).subscribe(res => {
      this.detalles = res;
    })
  }

  // METODO PARA REGISTRAR DATOS DE HORARIO
  fechasHorario: any = [];
  inicioDate: any;
  finDate: any;
  InsertarPlanificacion(form: any) {
    // METODO PARA ELIMINAR HORARIOS DE DESCANSO
    let verificador = 0;
    this.eliminar_horarios = [];

    let datos = {
      id_plan: [],
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
    }

    this.lista_descanso.forEach((obj: any) => {
      let data_eliminar = {
        id: obj.id_horario,
      }
      this.eliminar_horarios = this.eliminar_horarios.concat(data_eliminar);
    })
    this.eliminar_horarios.forEach((h: any) => {
      let plan_fecha = {
        id_empleado: this.data_horario.idEmpleado,
        fec_final: form.fechaFinalForm,
        fec_inicio: form.fechaInicioForm,
        id_horario: h.id,
      };
      this.restP.BuscarFechas(plan_fecha).subscribe((res: any) => {
        datos.id_plan = res;
        // METODO PARA ELIMINAR DE LA BASE DE DATOS
        this.restP.EliminarRegistro(datos).subscribe(datos => {
          verificador = verificador + 1;
          if (verificador === this.eliminar_horarios.length) {
            this.RegistrarPlanGeneral();
          }
        }, error => {
          verificador = verificador + 1;
          if (verificador === this.eliminar_horarios.length) {
            this.RegistrarPlanGeneral();
          }
        })
      }, error => {
        verificador = verificador + 1;
        if (verificador === this.eliminar_horarios.length) {
          this.RegistrarPlanGeneral();
        }
      })
    })
  }

  // METODO PARA REGISTRAR PLAN GENERAL
  RegistrarPlanGeneral() {
    const datos = {
      plan_general: this.plan_general,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
    }
    this.restP.CrearPlanGeneral(datos).subscribe(res => {
      if (res.message === 'OK') {
        this.toastr.success('Operación exitosa.', 'Registro guardado.', {
          timeOut: 6000,
        });
        if (this.data_horario.pagina === 'busqueda') {
          this.busqueda.buscar_fechas = true;
        }
        this.ControlarBotones(false, true, true, false, true);
        this.cargar = true;
      }
      else {
        this.toastr.error('Ups!!! se ha producido un error. Es recomendable eliminar la planificación.', 'Verificar la planificación.', {
          timeOut: 6000,
        });
        this.ControlarBotones(false, true, false, false, false);
        this.cargar = false;
      }
    }, error => {
      this.toastr.error('Ups!!! se ha producido un error. Es recomendable eliminar la planificación.', 'Verificar la planificación.', {
        timeOut: 6000,
      });
      this.ControlarBotones(false, true, false, false, false);
      this.cargar = false;
    })
  }

  // METODO PARA CARGAR TIMBRES
  cargar: boolean = false;
  CargarTimbres(form: any) {
    console.log("ver fechaFinFormluxon: ", this.fechaFinFormluxon)
    var codigos = '\'' + this.data_horario.codigo + '\'';
    let usuarios = {
      codigo: codigos,
      fec_final:  DateTime.fromISO(this.fechaFinFormluxon).plus({ days: 2 }).toFormat('yyyy-MM-dd'),
      fec_inicio: DateTime.fromISO( this.fechaInicioFormluxon).toFormat('yyyy-MM-dd'),
    };
    this.timbrar.BuscarTimbresPlanificacion(usuarios).subscribe(datos => {
      if (datos.message === 'vacio') {
        this.toastr.info(
          'No se han encontrado registros de marcaciones.', '', {
          timeOut: 6000,
        })
      }
      else if (datos.message === 'error') {
        this.toastr.info(
          'Ups!!! algo salio mal', 'No se cargaron todos los registros.', {
          timeOut: 6000,
        })
      }
      else {
        this.toastr.success(
          'Operación exitosa.', 'Registros de marcaciones cargados.', {
          timeOut: 6000,
        })
      }
    }, vacio => {
      this.toastr.info(
        'No se han encontrado registros de marcaciones.', '', {
        timeOut: 6000,
      })
    })
  }

  // METODO DE INGRESO DE HORARIOS PLAN GENERAL
  detalles: any = [];
  plan_general: any = [];
  CrearPlanGeneral(form: any) {
    // CONSULTAR HORARIO
    const [obj_res] = this.horarios.filter((o: any) => {
      return o.id === parseInt(form.horarioForm)
    })
    if (!obj_res) return this.toastr.warning('Horario no válido.');
    const { default_ } = obj_res;
    this.plan_general = [];

    this.fechasHorario = []; // ARRAY QUE CONTIENE TODAS LAS FECHAS DEL MES INDICADO
    this.inicioDate = this.fechaInicioFormluxon;
    this.finDate = this.fechaFinFormluxon;
    // LOGICA PARA OBTENER EL NOMBRE DE CADA UNO DE LOS DIAS DEL PERIODO INDICADO
    while (this.inicioDate <= this.finDate) {
      this.fechasHorario.push(this.inicioDate);
      let inicioDateLuxon = DateTime.fromISO(this.inicioDate);
      let newDateLuxon = inicioDateLuxon.plus({ days: 1 });
      let newDateFormatted = newDateLuxon.toFormat('yyyy-MM-dd');

      var newDate = newDateFormatted;
      this.inicioDate = newDate;
    }
    // VARIABLES TIPO DE DIA (HORARIO)
    var tipo: any = null;
    var origen: string = '';
    var tipo_dia: string = '';
    this.fechasHorario.map((obj: any) => {
      // DEFINICION DE TIPO DE DIA SEGUN HORARIO
      tipo_dia = default_;
      origen = default_;
      tipo = null;
      var dateLuxon = DateTime.fromISO(obj);
      var day = dateLuxon.weekday;

      if (day === 1) {
        if (form.lunesForm === true) {
          tipo = 'L';
          tipo_dia = 'L';
          origen = 'L';
        }
      }
      if (day === 2) {
        if (form.martesForm === true) {
          tipo = 'L';
          tipo_dia = 'L';
          origen = 'L';
        }
      }
      if (day === 3) {
        if (form.miercolesForm === true) {
          tipo = 'L';
          tipo_dia = 'L';
          origen = 'L';
        }
      }
      if (day === 4) {
        if (form.juevesForm === true) {
          tipo = 'L';
          tipo_dia = 'L';
          origen = 'L';
        }
      }
      if (day === 5) {
        if (form.viernesForm === true) {
          tipo = 'L';
          tipo_dia = 'L';
          origen = 'L';
        }
      }
      if (day === 6) {
        if (form.sabadoForm === true) {
          tipo = 'L';
          tipo_dia = 'L';
          origen = 'L';
        }
      }
      if (day === 7) {
        if (form.domingoForm === true) {
          tipo = 'L';
          tipo_dia = 'L';
          origen = 'L';
        }
      }
      // LEER HORARIOS TIPO LIBRE Y FERIADO
      if (default_ === 'FD' || default_ === 'L') {
        tipo = default_;
        tipo_dia = default_;
        origen = 'H' + default_;
      }
      else {
        // LEER FERIADOS DEL SISTEMA
        if (this.feriados.length != 0) {
          for (let i = 0; i < this.feriados.length; i++) {
            if (DateTime.fromISO(this.feriados[i].fecha).toFormat('yyyy-MM-dd') === obj) {
              tipo = 'DFD';
              tipo_dia = 'DFD';
              break;
            }
          }
        }
      }
      // BUSCAR FECHAS DE RECUPERACION DE FERIADOS
      if (this.recuperar.length != 0) {
        for (let j = 0; j < this.recuperar.length; j++) {
          if (DateTime.fromISO(this.recuperar[j].fecha_recuperacion).toFormat('yyyy-MM-dd') === obj) {
            tipo = 'REC';
            tipo_dia = 'REC';
            break;
          }
        }
      }
      // BUSCAR LIBRES PARA ELIMINAR
      let fechas = {
        fechaInicio: obj,
        fechaFinal: obj,
      };
      // LEER HORARIOS DIFERENTES DEL DEFAULT DEL SISTEMA
      if (tipo_dia === 'N' || tipo_dia === 'REC' || tipo_dia === 'DHA' || origen === 'HFD' || origen === 'HL') {
        this.CrearDataHorario(obj, tipo_dia, origen, tipo, this.detalles);
      }
      // HORARIO DEFAULT FERIADO
      else if (tipo_dia === 'DFD') {
        this.rest.VerificarHorariosExistentes(this.data_horario.idEmpleado, fechas).subscribe(existe => {
          this.EliminarRegistrosH(existe, obj);
        });
        this.lista_descanso.forEach((desc: any) => {
          if (desc.tipo === 'DFD') {
            tipo = 'FD';
            tipo_dia = 'FD';
            origen = 'FD';
            this.CrearDataHorario(obj, tipo_dia, origen, tipo, desc.detalle);
          }
        })
      }
      // HORARIO LIBRE
      else if (tipo_dia === 'L' && origen === 'L') {
        this.rest.VerificarHorariosExistentes(this.data_horario.idEmpleado, fechas).subscribe(existe => {
          this.EliminarRegistrosH(existe, obj);
        });
        this.lista_descanso.forEach((desc: any) => {
          if (desc.tipo === 'DL') {
            tipo = 'L';
            tipo_dia = 'L';
            origen = 'L';
            this.CrearDataHorario(obj, tipo_dia, origen, tipo, desc.detalle);
          }
        })
      }
    })
    // METODO PARA REGISTTRAR LA PLANIFICACION
    this.InsertarPlanificacion(form);
  }

  // METODO PARA CREAR LA DATA DE REGISTRO DE HORARIO
  CrearDataHorario(obj: any, tipo_dia: any, origen: any, tipo: any, lista: any) {
    if (lista.length != 0) {
      // COLOCAR DETALLE DE DIA SEGUN HORARIO
      lista.map((element: any) => {
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
        // DATA DE PLANIFICACION HORARIA
        let plan = {
          id_empleado: this.empleado[0].id,
          tipo_dia: tipo_dia,
          min_antes: element.minutos_antes,
          tolerancia: accion,
          id_horario: element.id_horario,
          min_despues: element.minutos_despues,
          fec_horario: obj,
          estado_origen: origen,
          estado_timbre: tipo,
          id_empl_cargo: this.data_horario.idCargo,
          id_det_horario: element.id,
          salida_otro_dia: nocturno,
          tipo_entr_salida: element.tipo_accion,
          fec_hora_horario: obj + ' ' + element.hora,
          min_alimentacion: element.minutos_comida,
        };
        if (element.segundo_dia === true) {
          plan.fec_hora_horario = DateTime.fromISO(obj).plus({ days: 1 }).toFormat('yyyy-MM-dd') + element.hora;
        }
        if (element.tercer_dia === true) {
          plan.fec_hora_horario = DateTime.fromISO(obj).plus({ days: 2 }).toFormat('yyyy-MM-dd') + element.hora;
        }
        // ALMACENAMIENTO DE PLANIFICACION GENERAL
        this.plan_general = this.plan_general.concat(plan);
      })
    }
  }

  // METODO PARA BUSCAR EXISTENCIAS
  existencias: any = []
  BuscarExistencias(form: any) {
    this.cargar = false;
    this.existencias = [];
    let fechas = {
      fechaInicio: form.fechaInicioForm,
      fechaFinal: form.fechaFinalForm,
    };
    this.rest.VerificarHorariosExistentes(this.data_horario.idEmpleado, fechas).subscribe(existe => {
      this.existencias = existe;
      this.EliminarPlanificacion(form);
    }, vacio => {
      this.EliminarPlanificacion(form);
    })

  }

  // METODO PARA ELIMINAR PLANIFICACION GENERAL DE HORARIOS
  eliminar_horarios: any = [];
  EliminarPlanificacion(form: any) {
    // LIMPIAR ARRAY DE DATOS A ELIMINAR
    this.eliminar_horarios = [];

    // VARIABLES DE VALIDACION DEL PROCESO
    let verificador = 0;
    let eliminar = 0;
    let fechas = 0;
    let vacio = 0;
    let sumaN = 0;
    let sumaL = 0;

    // ALMACENAMIENTO DE LOS DATOS A ELIMINAR
    let datos = {
      id_plan: [],
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
    }

    // CONTABILIZAR CUANTOS HORARIOS TIENE EL USUARIO
    this.existencias.forEach((he: any) => {
      // HORARIOS LABORABLES - LIBRES - FERIADOS - ABIERTO
      if (he.default_ === 'N' || he.default_ === 'DHA' || he.default_ === 'L' || he.default_ === 'FD') {
        sumaN = sumaN + 1;
      }
      // HORARIOS DEFAULT LIBRE - DEFAULT FERIADO
      else {
        sumaL = sumaL + 1;
      }
    })

    // AGREGAR A LA LISTA DE ELIMINAR HORARIO SELECCIONADO
    this.eliminar_horarios.push({ id: form.horarioForm })

    // SI EXISTENTE SOLO UN HORARIO SE ELIMINA HORARIOS DE DESCANSO
    if (sumaN === 1 && sumaL > 0) {
      // SE COMPARA LOS HORARIOS DE DESCANSO EXISTENTES Y DEFAULT DEL SISTEMA
      this.lista_descanso.forEach((obj: any) => {
        this.existencias.forEach((he: any) => {
          if ((he.default_ === 'DL' && obj.tipo === 'DL') || (he.default_ === 'DFD' && obj.tipo === 'DFD')) {
            this.eliminar_horarios.push({ id: obj.id_horario });
          }
        })
      })
    }

    // METODO PARA ELIMINAR HORARIOS
    this.eliminar_horarios.forEach((h: any) => {
      let plan_fecha = {
        id_empleado: this.data_horario.idEmpleado,
        fec_final: form.fechaFinalForm,
        fec_inicio: form.fechaInicioForm,
        id_horario: h.id,
      };

      this.restP.BuscarFechas(plan_fecha).subscribe((res: any) => {
        // VERIFICAMOS SI TODAS LAS FECHAS HAN SIDO LEIDAS
        fechas = fechas + 1;
        // SE AGREGA ID DE HORARIOS A ELIMINAR
        datos.id_plan = res.map(item => item.id);
        // METODO PARA ELIMINAR DE LA BASE DE DATOS
        this.restP.EliminarRegistro(datos).subscribe(datos => {
          // VERIIFCAR SI SE REALIZO EL PROCESO
          verificador = verificador + 1;
          if (datos.message === 'OK') {
            // SI LA RESPUESTA FUE OK, CONTABILIZAR EL NUMERO DE PASADAS ELIMINADAS
            eliminar = eliminar + 1;
            // SI LAS PASADAS SON IGUALES AL TOTAL DE HORARIOS A ELIMINAR
            if (verificador === this.eliminar_horarios.length) {
              // FINALIZA EL PROCESO
              this.ControlarBotones(true, true, true, false, false);
              if (eliminar === fechas) {
                this.toastr.error('Operación exitosa.', 'Registros eliminados.', {
                  timeOut: 6000,
                });
              }
              else {
                this.toastr.warning('Ups!!! algo salio mal. Intentar eliminar los registros nuevamente.', '', {
                  timeOut: 6000,
                });
              }
              if (this.data_horario.pagina === 'busqueda') {
                this.busqueda.buscar_fechas = true;
              }
            }
          }
          else {
            // ENVIAR MENSAJE INFORMADO UNA NOVEDAD
            this.EmitirMensajeNovedad(verificador, false, true, false, false, false);
          }
        }, error => {
          // ENVIAR MENSAJE INFORMADO UNA NOVEDAD
          verificador = verificador + 1;
          this.EmitirMensajeNovedad(verificador, false, true, false, false, false);
        })
      }, error => {
        verificador = verificador + 1;
        vacio = vacio + 1;
        if (verificador === this.eliminar_horarios.length) {
          this.ControlarBotones(true, true, true, false, false);
          // SI NO EXISTEN DATOS SE NOTIFICA AL USUARIO
          if (vacio === this.eliminar_horarios.length) {
            this.toastr.success('Continuar...', 'No se han encontrado registros para eliminar.', {
              timeOut: 6000,
            });
          }
          else {
            this.toastr.error('Ups!!! se ha producido un error. Intentar eliminar los registros nuevamente.', '', {
              timeOut: 6000,
            });
          }
        }
      })
    })
  }

  // METODO PARA ENVIAR MENSAJE - ERROR
  EmitirMensajeNovedad(verificador: any, guardar: boolean, eliminar: boolean, cerrar: boolean, resetear: boolean, nuevo: boolean) {
    if (verificador === this.eliminar_horarios.length) {
      this.ControlarBotones(guardar, eliminar, cerrar, resetear, nuevo);
      this.toastr.error('Ups!!! se ha producido un error. Intentar eliminar los registros nuevamente.', '', {
        timeOut: 6000,
      });
    }
  }

  // METODO PARA SUMAR HORAS
  StringTimeToSegundosTime(stringTime: string) {
    const h = parseInt(stringTime.split(':')[0]) * 3600;
    const m = parseInt(stringTime.split(':')[1]) * 60;
    const s = parseInt(stringTime.split(':')[2]);
    return h + m + s;
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

    // CCONVERTIR A DOS DIGITOS
    h = sumah < 10 ? '0' + sumah : String(sumah);
    m = sumam < 10 ? '0' + sumam : String(sumam);
    s = sumas < 10 ? '0' + sumas : String(sumas);

    return h + ':' + m + ':' + s;

  }

  // METODO PARA ELIMINAR HORARIOS PARA REGISTRAR LIBRES
  EliminarRegistrosH(existe: any, obj: any) {
    let datos = {
      id_plan: [],
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
    }
    existe.forEach((h: any) => {
      if (h.default_ === 'N' || h.default_ === 'DHA' || h.default_ === 'L' || h.default_ === 'FD') {
        let plan_fecha = {
          id_empleado: this.data_horario.idEmpleado,
          fec_final: obj,
          fec_inicio: obj,
          id_horario: h.id_horario,
        };
        this.restP.BuscarFechas(plan_fecha).subscribe((res: any) => {
          datos.id_plan = res;
          // METODO PARA ELIMINAR DE LA BASE DE DATOS
          this.restP.EliminarRegistro(datos).subscribe(datos => {
          })
        })
      }
    })
  }

  // METODO PARA LIMPIAR CAMPO SELECCION DE HORARIO
  LimpiarHorario() {
    this.formulario.patchValue({ horarioForm: '' });
    this.cargar = false;
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
    this.cargar = false;
    if (this.data_horario.pagina === 'busqueda') {
      this.busqueda.buscar_fechas = false;
    }
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.formulario.reset();
    this.cargar = false;
    this.ControlarBotones(true, true, true, false, false);
    if (this.data_horario.pagina === 'busqueda') {
      this.busqueda.buscar_fechas = false;
    }
  }

  // METODO PARA CERRAR VENTANA DE SELECCION DE HORARIO
  CerrarVentana() {
    this.LimpiarCampos();
    if (this.data_horario.pagina === 'ver_empleado') {
      this.ventana.ventana_horario = false;
      this.ventana.ver_tabla_horarios = true;
    }
    else if (this.data_horario.pagina === 'rango_fecha') {
      this.componente.auto_individual = true;
      this.componente.ventana_horario = false;
      this.componente.seleccionar = true;
      this.componente.LimpiarFormulario();
    }
    else if (this.data_horario.pagina === 'busqueda') {
      this.busqueda.ventana_horario_individual = false;
      this.busqueda.seleccionar = true;
      this.busqueda.buscar_fechas = true;
      this.busqueda.auto_individual = true;
      this.busqueda.multiple = true;
    }
  }

}
