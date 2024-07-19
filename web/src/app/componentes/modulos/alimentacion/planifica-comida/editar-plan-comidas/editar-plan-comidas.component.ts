// LLAMADO A LAS LIBRERIAS
import { MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

// LLAMADO A LOS SERVICIOS
import { EmpleadoHorariosService } from 'src/app/servicios/horarios/empleadoHorarios/empleado-horarios.service';
import { TipoComidasService } from 'src/app/servicios/catalogos/catTipoComidas/tipo-comidas.service';
import { PlanComidasService } from 'src/app/servicios/planComidas/plan-comidas.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';

@Component({
  selector: 'app-editar-plan-comidas',
  templateUrl: './editar-plan-comidas.component.html',
  styleUrls: ['./editar-plan-comidas.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
  ]
})
export class EditarPlanComidasComponent implements OnInit {

  // VALIDACIONES DE CAMPOS DE FORMULARIO
  observacionF = new FormControl('', [Validators.required, Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{4,48}")]);
  fechaInicioF = new FormControl('', Validators.required);
  horaInicioF = new FormControl('', Validators.required);
  idComidaF = new FormControl('', Validators.required);
  fechaFinF = new FormControl('', Validators.required);
  fechaF = new FormControl('', [Validators.required]);
  horaFinF = new FormControl('', Validators.required);
  extraF = new FormControl('', [Validators.required]);
  platosF = new FormControl('', Validators.required);
  tipoF = new FormControl('', Validators.required);

  // ASIGNAR LOS CAMPOS EN UN FORMULARIO EN GRUPO
  public PlanificacionComidasForm = new FormGroup({
    observacionForm: this.observacionF,
    fechaInicioForm: this.fechaInicioF,
    horaInicioForm: this.horaInicioF,
    fechaFinForm: this.fechaFinF,
    idComidaForm: this.idComidaF,
    horaFinForm: this.horaFinF,
    platosForm: this.platosF,
    extraForm: this.extraF,
    fechaForm: this.fechaF,
    tipoForm: this.tipoF,
  });

  idEmpleadoLogueado: any; // VARIABLE PARA ALMACENAR ID DE EMPLEADO QUE INICIA SESIÓN
  tipoComidas: any = []; // VARIABLE PARA ALMACENAR DATOS DE TIPOS DE COMIDAS
  empleados: any = []; // VARIABLE PARA ALMACENAR DATOS DE EMPLEADO
  FechaActual: any; // VARIBLE PARA ALMACENAR LA FECHA DEL DÍA DE HOY

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    public restPlan: PlanComidasService, // SERVICIO DATOS PLAN COMIDAS
    public validar: ValidacionesService,
    public ventana: MatDialogRef<EditarPlanComidasComponent>, // VENTANA EN FORMATO DIALOGO
    public restE: EmpleadoService, // SERVICIO DE DATOS DE EMPLEADOS
    public aviso: RealTimeService,
    private toastr: ToastrService, // VARIABLE PARA MOSTRAR NOTIFICACIONES
    private restH: EmpleadoHorariosService, // SERVICIO DATOS HORARIO DE EMPLEADOS
    private parametro: ParametrosService,
    private rest: TipoComidasService, // SERVICIO DATOS TIPOS DE COMIDAS
    @Inject(MAT_DIALOG_DATA) public data: any, // PASAR DATOS DE LA VENTANA ANTERIOR
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

    this.ObtenerServicios();
    this.CargarDatos();
    this.BuscarParametro();
    this.BuscarFecha();
    this.BuscarHora();
  }

  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** **
   ** **************************************************************************************** **/

  formato_fecha: string = 'DD/MM/YYYY';
  formato_hora: string = 'HH:mm:ss';

  // METODO PARA BUSCAR PARAMETRO DE FORMATO DE FECHA
  BuscarFecha() {
    // id_tipo_parametro Formato fecha = 1
    this.parametro.ListarDetalleParametros(1).subscribe(
      res => {
        this.formato_fecha = res[0].descripcion;
      });
  }

  BuscarHora() {
    // id_tipo_parametro Formato hora = 2
    this.parametro.ListarDetalleParametros(2).subscribe(
      res => {
        this.formato_hora = res[0].descripcion;
      });
  }

  // METODO PARA CARGAR LA INFORMACIÓN DE LA PLANIFICACIÓN SELECCIONADA EN EL FORMULARIO
  leer_dato: any;
  CargarDatos() {
    if (this.data.modo === 'individual') {
      this.leer_dato = this.data.solicitud;
    } else {
      this.leer_dato = this.data.solicitud[0];
    }
    this.PlanificacionComidasForm.patchValue({
      observacionForm: this.leer_dato.observacion,
      horaInicioForm: this.leer_dato.hora_inicio,
      fechaInicioForm: this.leer_dato.fec_inicio,
      fechaFinForm: this.leer_dato.fec_final,
      platosForm: this.leer_dato.id_detalle,
      idComidaForm: this.leer_dato.id_menu,
      horaFinForm: this.leer_dato.hora_fin,
      tipoForm: this.leer_dato.id_servicio,
    })
    if (this.leer_dato.extra === true) {
      this.PlanificacionComidasForm.patchValue({
        extraForm: 'true'
      })
    }
    else {
      this.PlanificacionComidasForm.patchValue({
        extraForm: 'false'
      })
    }
    this.ObtenerDatosComidas(this.leer_dato);
  }

  // METODO PARA MOSTRAR DATOS DE SERVICIOS Y DETALLES DE MENÚ
  empleado_recibe: number; // ID DE EMPLEADO QUE RECIBE UNA NOTIFICACIÓN
  empleado_envia: number; // ID DE EMPLEADO QUE ENVIA UNA NOTIFICACIÓN
  ObtenerDatosComidas(lectura: any) {
    this.rest.ConsultarUnServicio(lectura.id_servicio).subscribe(datos => {
      this.tipoComidas = datos;
    })
    this.rest.ConsultarUnDetalleMenu(lectura.id_menu).subscribe(datos => {
      this.detalle = datos;
    });
    var f = moment();
    this.FechaActual = f.format('YYYY-MM-DD');
    this.PlanificacionComidasForm.patchValue({
      fechaForm: this.FechaActual
    })
    if (this.data.modo === 'individual') {
      this.ObtenerEmpleados(this.data.solicitud.id_empleado);
      this.empleado_envia = this.idEmpleadoLogueado;
      this.empleado_recibe = this.data.solicitud.id_empleado;
    }
    else {
      this.empleado_envia = this.idEmpleadoLogueado;
    }
  }

  // METODO PARA CONSULTAR DATOS DE SERVICIOS DE COMIDAS
  servicios: any = []; // VARIABLE PARA GUARDAR DATOS DE SERVICIOS
  ObtenerServicios() {
    this.servicios = [];
    this.restPlan.ObtenerTipoComidas().subscribe(datos => {
      this.servicios = datos;
    })
  }

  // AL SELECCIONAR UN TIPO DE SERVICIO SE MUESTRA LA LISTA DE MENÚS REGISTRADOS
  ObtenerPlatosComidas(form: any) {
    this.horaInicioF.reset();
    this.idComidaF.reset();
    this.horaFinF.reset();
    this.tipoComidas = [];
    this.platosF.reset();
    this.rest.ConsultarUnServicio(form.tipoForm).subscribe(datos => {
      this.tipoComidas = datos;
    }, error => {
      this.toastr.info('Verificar la información.', 'No existen registrados Menús para este tipo de servicio.', {
        timeOut: 6000,
      })
    })
  }

  // METODO PARA BUSQUEDA DE DETALLE DE MENÚS
  detalle: any = []; // VARIABLE PARA GUARDAR DATOS DE DETALLES DE MENÚ
  ObtenerDetalleMenu(form: any) {
    this.horaInicioF.reset();
    this.horaFinF.reset();
    this.platosF.reset();
    this.detalle = [];
    this.rest.ConsultarUnDetalleMenu(form.idComidaForm).subscribe(datos => {
      this.detalle = datos;
      this.PlanificacionComidasForm.patchValue({
        horaInicioForm: this.detalle[0].hora_inicio,
        horaFinForm: this.detalle[0].hora_fin
      })
    }, error => {
      this.toastr.info('Verificar la información.', 'No existen registros de Alimentación para este Menú.', {
        timeOut: 6000,
      })
    })
  }

  // METODO PARA VER LA INFORMACION DEL EMPLEADO
  ObtenerEmpleados(idemploy: any) {
    this.empleados = [];
    this.restE.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleados = data;
    })
  }

  // METODO PARA REGISTRAR PLANIFICACIÓN
  fechasHorario: any = [];
  inicioDate: any;
  finDate: any;
  contador: number = 0;
  contadorFechas: number = 0;
  InsertarPlanificacion(form: any) {
    if (Date.parse(form.fechaInicioForm) <= Date.parse(form.fechaFinForm)) {
      if (this.data.modo === "multiple") {
        this.InsertarPlanificacionMultiple(form);
      }
      else {
        this.InsertarPlanificacionIndividual(form);
      }
    }
    else {
      this.toastr.info('La fecha final de planificación debe ser posterior a la fecha de inicio de planificación.', '', {
        timeOut: 6000,
      })
    }
  }

  /** *************************************************************************************************** *
   *     METODOS PARA REALIZAR ACTUALIZACIÓN DE UNA PLANIFICACIÓN DE FORMA INDIVIDUAL - FICHA EMPLEADO    *
   ** *************************************************************************************************** *
   */
  // METODO PARA TOMAR LOS DATOS INGRESADOS EN EL FORMULARIO
  InsertarPlanificacionIndividual(form: any) {
    let datosPlanComida = {
      observacion: form.observacionForm,
      hora_inicio: form.horaInicioForm,
      fec_comida: form.fechaInicioForm,
      fec_inicio: form.fechaInicioForm,
      fec_final: form.fechaFinForm,
      id_comida: form.platosForm,
      hora_fin: form.horaFinForm,
      fecha: form.fechaForm,
      extra: form.extraForm,
      user_name: this.user_name,
      ip: this.ip,
    };
    this.VerificarDuplicidadIndividual(form, datosPlanComida);
  }

  // METODO PARA VERIFICAR SI EL EMPLEADO YA TIENE UNA PLANIFICACIÓN REGISTRADA EN ESAS FECHAS
  VerificarDuplicidadIndividual(form, datosPlanComida) {
    let datosDuplicados = {
      id_plan_comida: this.data.solicitud.id,
      id: this.data.solicitud.id_empleado,
      fecha_inicio: form.fechaInicioForm,
      fecha_fin: form.fechaFinForm,
    }
    this.restPlan.BuscarDuplicadosFechasActualizar(datosDuplicados).subscribe(plan => {
      this.toastr.info(this.empleados[0].nombre + ' ' + this.empleados[0].apellido + ' ya tiene registrada una planificación de alimentación en las fechas ingresadas.', '', {
        timeOut: 6000,
      })
    }, error => {
      this.VerificarHorarioEmpleado(form, datosPlanComida);
    });
  }

  // METODO PARA VERIFICAR SI EL EMPLEADO TIENE REGISTRADO UN HORARIO EN LAS FECHAS INGRESADAS
  VerificarHorarioEmpleado(form: any, datosPlanComida: any) {
    let datosHorario = {
      fechaInicio: form.fechaInicioForm,
      fechaFinal: form.fechaFinForm
    }
    this.restH.BuscarHorarioFechas(parseInt(this.empleados[0].codigo), datosHorario).subscribe(plan => {
      this.PlanificacionIndividual(form, datosPlanComida);
    }, error => {
      this.toastr.info(this.empleados[0].nombre + ' ' + this.empleados[0].apellido + ' no tiene registro de horario laboral en las fechas indicadas.', '', {
        timeOut: 6000,
      })
    });
  }

  // METODO PARA ACTUALIZAR UN PLANIFICACIÓN, ELIMINAR LA ANTERIOR Y CREAR UNA NUEVA
  PlanificacionIndividual(form, datosPlanComida) {
    const datos = {
      user_name: this.user_name,
      ip: this.ip,
    }
    // METODO PARA ELIMINAR PLANIFICACIÓN ANTERIOR
    this.restPlan.EliminarPlanComida(this.data.solicitud.id, this.data.solicitud.id_empleado, datos)
      .subscribe(eliminar => {
        // CREACIÓN DE LA PLANIFICACIÓN PARA UN EMPLEADO
        this.restPlan.CrearPlanComidas(datosPlanComida).subscribe(res => {
          var plan = res.info;
          // INDICAMOS A QUE EMPLEADO SE LE REALIZA UNA PLANIFICACIÓN
          this.inicioDate = moment(form.fechaInicioForm).format('MM-DD-YYYY');
          this.finDate = moment(form.fechaFinForm).format('MM-DD-YYYY');
          this.fechasHorario = []; // ARRAY QUE CONTIENE TODAS LAS FECHAS DEL MES INDICADO
          // INICIALIZAR DATOS DE FECHA
          var start = new Date(this.inicioDate);
          var end = new Date(this.finDate);
          // LÓGICA PARA OBTENER EL NOMBRE DE CADA UNO DE LOS DÍA DEL PERIODO INDICADO
          while (start <= end) {
            this.fechasHorario.push(moment(start).format('YYYY-MM-DD'));
            var newDate = start.setDate(start.getDate() + 1);
            start = new Date(newDate);
          }

          this.contadorFechas = 0;

          // DATOS DE PLANIFICACION DE SERVICIO DE ALIMENTACION AL USUARIO
          let planEmpleado = {
            id_empleado: this.data.solicitud.id_empleado,
            hora_inicio: form.horaInicioForm,
            id_plan_comida: plan.id,
            hora_fin: form.horaFinForm,
            consumido: false,
            fecha: '',
            user_name: this.user_name,
            ip: this.ip,
          }

          // LECTURA DE DATOS DE USUARIO
          let usuario = '<tr><th>' + this.data.solicitud.nombre +
            '</th><th>' + this.data.solicitud.cedula + '</th></tr>';
          let cuenta_correo = this.data.solicitud.correo;

          // LECTURA DE DATOS DE LA PLANIFICACIÓN
          let desde = this.validar.FormatearFecha(plan.fec_inicio, this.formato_fecha, this.validar.dia_completo);
          let hasta = this.validar.FormatearFecha(plan.fec_final, this.formato_fecha, this.validar.dia_completo);

          let h_inicio = this.validar.FormatearHora(plan.hora_inicio, this.formato_hora);
          let h_fin = this.validar.FormatearHora(plan.hora_fin, this.formato_hora);

          this.fechasHorario.map((obj: any) => {
            planEmpleado.fecha = obj;
            this.restPlan.CrearPlanComidasEmpleado(planEmpleado).subscribe(res => {
              this.contadorFechas = this.contadorFechas + 1;
              // SI TODO LOS DATOS HAN SIDO LEIDOS SE ENVIA NOTIFICACIONES
              if (this.contadorFechas === this.fechasHorario.length) {
                this.NotificarPlanificacion(plan, desde, hasta, h_inicio, h_fin, this.data.solicitud.id_empleado);
                this.EnviarCorreo(plan, cuenta_correo, usuario, desde, hasta, h_inicio, h_fin);
                this.toastr.success('Planificación Servicio de Alimentación registrada.', '', {
                  timeOut: 6000,
                })
                this.CerrarRegistroPlanificacion();
              }
            });
          })
        });
      });
  }

  /** *************************************************************************************************** **
   ** **     METODOS PARA REALIZAR ACTUALIZACIÓN DE UNA PLANIFICACIÓN DE FORMA  MULTIPLE               ** **
   ** *************************************************************************************************** **/

  // METODO PARA TOMAR LOS DATOS INGRESADOS EN EL FORMULARIO
  InsertarPlanificacionMultiple(form: any) {
    let datosPlanComida = {
      observacion: form.observacionForm,
      fec_comida: form.fechaInicioForm,
      hora_inicio: form.horaInicioForm,
      fec_inicio: form.fechaInicioForm,
      fec_final: form.fechaFinForm,
      id_comida: form.platosForm,
      hora_fin: form.horaFinForm,
      fecha: form.fechaForm,
      extra: form.extraForm,
      user_name: this.user_name,
      ip: this.ip,
    };
    this.ContarCorreos(this.leer_dato);
    if (this.cont_correo <= this.correos) {
      this.VerificarDuplicidadMultiple(form, datosPlanComida);
    }
    else {
      this.toastr.warning('Trata de enviar correo de un total de ' + this.cont_correo + ' colaboradores, sin embargo solo tiene permitido enviar un total de ' + this.correos + ' correos.', 'ACCIÓN NO PERMITIDA.', {
        timeOut: 6000,
      });
    }
  }

  // METODO PARA VERIFICAR SI LOS EMPLEADOS TIENEN YA REGISTRADA UNA PLANIFICACIÓN
  empleados_conPlanificacion: any = [];
  empleados_sinPlanificacion: any = [];
  VerificarDuplicidadMultiple(form, datosPlanComida) {
    this.empleados_conPlanificacion = [];
    this.empleados_sinPlanificacion = [];
    var contar_seleccionados = 0;
    this.data.solicitud.map((obj: any) => {
      let datosDuplicados = {
        fecha_inicio: form.fechaInicioForm,
        fecha_fin: form.fechaFinForm,
        id_plan_comida: obj.id,
        id: obj.id_empleado,
      }
      this.restPlan.BuscarDuplicadosFechasActualizar(datosDuplicados).subscribe(plan => {
        contar_seleccionados = contar_seleccionados + 1;
        this.empleados_conPlanificacion = this.empleados_conPlanificacion.concat(obj);
        if (contar_seleccionados === this.data.solicitud.length) {
          this.VerificarHorariosEmpleadosMultiples(form, datosPlanComida, this.empleados_sinPlanificacion, this.empleados_conPlanificacion);
        }
      }, error => {
        contar_seleccionados = contar_seleccionados + 1;
        this.empleados_sinPlanificacion = this.empleados_sinPlanificacion.concat(obj);
        if (contar_seleccionados === this.data.solicitud.length) {
          this.VerificarHorariosEmpleadosMultiples(form, datosPlanComida, this.empleados_sinPlanificacion, this.empleados_conPlanificacion);
        }
      });
    })
  }

  // METODO PARA VERIFICAR SI EL EMPLEADO TIENE FECHA DE HORARIO REGISTRADA
  empleados_conHorario: any = [];
  empleados_sinHorario: any = [];
  VerificarHorariosEmpleadosMultiples(form, datosPlanComida, sin_planificacion, con_planificacion) {
    var contar_horario = 0;
    sin_planificacion.map((obj: any) => {
      let datosHorario = {
        fechaInicio: form.fechaInicioForm,
        fechaFinal: form.fechaFinForm
      }
      this.restH.BuscarHorarioFechas(obj.codigo, datosHorario).subscribe(plan => {
        contar_horario = contar_horario + 1;
        this.empleados_conHorario = this.empleados_conHorario.concat(obj);
        if (contar_horario === sin_planificacion.length) {
          this.EliminarPlanificacion(form, datosPlanComida, this.empleados_conHorario);
          this.IndicarMensajePlanificados(con_planificacion);
          this.IndicarMensajeHorarios(this.empleados_sinHorario, sin_planificacion);
        }
      }, error => {
        contar_horario = contar_horario + 1;
        this.empleados_sinHorario = this.empleados_sinHorario.concat(obj);
        if (contar_horario === sin_planificacion.length) {
          this.EliminarPlanificacion(form, datosPlanComida, this.empleados_conHorario);
          this.IndicarMensajePlanificados(con_planificacion);
          this.IndicarMensajeHorarios(this.empleados_sinHorario, sin_planificacion);
        }
      });
    })
  }

  // METODO PARA MOSTRAR MENSAJES CUANDO NO SE REALIZAR PLANIFICACIÓN
  IndicarMensajePlanificados(array_datos: any) {
    if (array_datos.length != 0) {
      if (array_datos.length === this.data.solicitud.length) {
        this.toastr.info('No se ha registrado la planificación para ninguno de los empleado seleccionados.', 'Empleados ya cuenta con una planificación registrada en las fechas indicas.', {
          timeOut: 12000,
        })
        this.ventana.close();
      }
      else {
        var nombres_empleados = '';
        array_datos.map((obj: any) => {
          nombres_empleados = nombres_empleados + ' - ' + obj.nombre + ' ' + obj.apellido
        })
        this.toastr.info('No se ha registrado la planificación de los empleados ' + nombres_empleados, 'Empleados ya cuenta con una planificación registrada en las fechas indicas.', {
          timeOut: 12000,
        })
      }
    }
  }

  // METODO PARA MOSTRAR MENSAJES CUANDO NO TIENEN HORARIOS
  IndicarMensajeHorarios(array_datos: any, sin_planificacion) {
    if (array_datos.length != 0) {
      if (array_datos.length === sin_planificacion.length) {
        this.toastr.info('No se ha registrado la planificación para ninguno de los empleado seleccionados.', 'Empleados no tienen registrado un horario laboral en las fechas indicadas.', {
          timeOut: 12000,
        })
        this.ventana.close();
      }
      else {
        var nombres_empleados = '';
        array_datos.map((obj: any) => {
          nombres_empleados = nombres_empleados + ' - ' + obj.nombre + ' ' + obj.apellido
        })
        this.toastr.info('No se ha registrado la planificación de los empleados ' + nombres_empleados, 'Empleados no tienen registrado un horario laboral en las fechas indicadas.', {
          timeOut: 12000,
        })
      }
    }
  }

  // METODO PARA ELIMINAR TODAS LAS PLANIFICACIONES
  contar_eliminar: number = 0;
  EliminarPlanificacion(form: any, datosPlanComida: any, empleados_planificados: any) {
    const datos = {
      user_name: this.user_name,
      ip: this.ip,
    }
    if (empleados_planificados.length != 0) {
      this.contar_eliminar = 0;
      empleados_planificados.map((obj: any) => {
        this.restPlan.EliminarPlanComida(obj.id, obj.id_empleado, datos).subscribe(plan => {
          this.contar_eliminar = this.contar_eliminar + 1;
          if (this.contar_eliminar === empleados_planificados.length) {
            this.PlanificarMultiple(form, datosPlanComida, empleados_planificados);
          }
        })
      })
    }
  }

  // METODO PARA PLANIFICAR MULTIPLES EMPLEADOS
  PlanificarMultiple(form: any, datosPlanComida: any, empleados_planificados: any) {
    var usuario = '';
    this.inicioDate = moment(form.fechaInicioForm).format('MM-DD-YYYY');
    this.finDate = moment(form.fechaFinForm).format('MM-DD-YYYY');
    // CREACIÓN DE LA PLANIFICACIÓN PARA VARIOS EMPLEADOS
    this.restPlan.CrearPlanComidas(datosPlanComida).subscribe(res => {

      var plan = res.info;

      // LECTURA DE DATOS DE LA PLANIFICACIÓN
      let desde = this.validar.FormatearFecha(plan.fec_inicio, this.formato_fecha, this.validar.dia_completo);
      let hasta = this.validar.FormatearFecha(plan.fec_final, this.formato_fecha, this.validar.dia_completo);

      let h_inicio = this.validar.FormatearHora(plan.hora_inicio, this.formato_hora);
      let h_fin = this.validar.FormatearHora(plan.hora_fin, this.formato_hora);

      this.fechasHorario = []; // ARRAY QUE CONTIENE TODAS LAS FECHAS DEL MES INDICADO
      // INICIALIZAR DATOS DE FECHA
      var start = new Date(this.inicioDate);
      var end = new Date(this.finDate);
      // LÓGICA PARA OBTENER EL NOMBRE DE CADA UNO DE LOS DÍA DEL PERIODO INDICADO
      while (start <= end) {
        this.fechasHorario.push(moment(start).format('YYYY-MM-DD'));
        var newDate = start.setDate(start.getDate() + 1);
        start = new Date(newDate);
      }
      // INDICAMOS A QUE EMPLEADO SE LE REALIZA UNA PLANIFICACIÓN
      this.contador = 0;

      let planEmpleado = {
        id_empleado: '',
        id_plan_comida: plan.id,
        fecha: '',
        hora_inicio: form.horaInicioForm,
        hora_fin: form.horaFinForm,
        consumido: false,
        user_name: this.user_name,
        ip: this.ip,
      }

      // LEER DATOS DE CADA USUARIOS
      empleados_planificados.map((obj: any) => {
        planEmpleado.id_empleado = obj.id;

        // LECTURA DE NOMBRES DE USUARIOS
        usuario = usuario + '<tr><th>' + obj.nombre + '</th><th>' + obj.cedula + '</th></tr>';

        this.contadorFechas = 0;

        // LEER DATOS POR CADA FECHA
        this.fechasHorario.map((fec: any) => {
          planEmpleado.fecha = fec;
          this.restPlan.CrearPlanComidasEmpleado(planEmpleado).subscribe(res => {
            this.contadorFechas = this.contadorFechas + 1;
            if (this.contadorFechas === this.fechasHorario.length) {
              this.NotificarPlanificacion(plan, desde, hasta, h_inicio, h_fin, obj.id);
            }
          });
        })
        // CONTADOR DE USUARIOS A LOS QUE SE REGISTRARÁ PLANIFICACION
        this.contador = this.contador + 1;
        if (this.contador === empleados_planificados.length) {
          this.EnviarCorreo(plan, this.info_correo, usuario, desde, hasta, h_inicio, h_fin);
          this.toastr.success('',
            'Se actualiza Planificación de alimentación a un total de ' + empleados_planificados.length + ' colaboradores.', {
            timeOut: 8000,
          })
          this.CerrarRegistroPlanificacion();
        }
      })
    })
  }



  /** ***************************************************************************************************** **
   ** **               METODO DE ENVIO DE NOTIFICACIONES DE PLANIFICACION DE ALIMENTACION                ** **
   ** ***************************************************************************************************** **/

  // METODO DE ENVIO DE CORREO DE PLANIFICACIÓN DE SERVICIO DE ALIMENTACION
  EnviarCorreo(datos: any, cuenta_correo: any, usuario: any, desde: any, hasta: any, h_inicio: any, h_fin: any) {

    // DATOS DE ESTRUCTURA DEL CORREO
    let DataCorreo = {
      tipo_solicitud: 'ACTUALIZA',
      observacion: datos.observacion,
      id_comida: datos.id_comida,
      id_envia: this.idEmpleadoLogueado,
      nombres: usuario,
      proceso: 'actualizado',
      asunto: 'ACTUALIZACION DE PLANIFICACION DE ALIMENTACION',
      correo: cuenta_correo,
      inicio: h_inicio,
      extra: datos.extra,
      desde: desde,
      hasta: hasta,
      final: h_fin,
    }

    console.log('DATOS A ENVIARSE POR CORREO', DataCorreo);
    // METODO ENVIO DE CORREO DE PLANIFICACIÓN DE ALIMENTACION
    this.restPlan.EnviarCorreoPlan(DataCorreo).subscribe(res => {
      if (res.message === 'ok') {
        this.toastr.success('Correo de planificación enviado exitosamente.', '', {
          timeOut: 6000,
        });
      }
      else {
        this.toastr.warning('Ups algo salio mal !!!', 'No fue posible enviar correo de planificación.', {
          timeOut: 6000,
        });
      }
      console.log(res.message);

    }, err => {
      const { access, message } = err.error.message;
      if (access === false) {
        this.toastr.error(message)
        this.ventana.close();
      }
    })
  }


  // METODO DE ENVIO DE NOTIFICACIONES DE PLANIFICACION DE SERVICIO DE ALIMENTACION
  NotificarPlanificacion(datos: any, desde: any, hasta: any, h_inicio: any, h_fin: any, id_empleado_recibe: number) {
    let mensaje = {
      id_comida: datos.id_comida,
      id_empl_envia: this.idEmpleadoLogueado,
      id_empl_recive: id_empleado_recibe,
      tipo: 20, // PLANIFICACIÓN DE ALIMENTACION
      mensaje: 'Planificación de alimentación actualizada desde ' +
        desde + ' hasta ' + hasta +
        ' horario de ' + h_inicio + ' a ' + h_fin + ' servicio ',
      user_name: this.user_name,
      ip: this.ip,
    }
    this.restPlan.EnviarMensajePlanComida(mensaje).subscribe(res => {
      this.aviso.RecibirNuevosAvisos(res.respuesta);
    }, err => {
      const { access, message } = err.error.message;
      if (access === false) {
        this.toastr.error(message)
        this.ventana.close();
      }
    })
  }

  // METODO PARA BUSCAR PARÁMETRO DE CORREOS
  correos: number;
  BuscarParametro() {
    // id_tipo_parametro LIMITE DE CORREOS = 33
    let datos: any = [];
    this.parametro.ListarDetalleParametros(33).subscribe(
      res => {
        datos = res;
        if (datos.length != 0) {
          this.correos = parseInt(datos[0].descripcion)
        }
        else {
          this.correos = 0
        }
      });
  }

  // METODO PARA CONTAR CORREOS A ENVIARSE
  cont_correo: number = 0;
  info_correo: string = '';
  ContarCorreos(data: any) {
    this.cont_correo = 0;
    this.info_correo = '';
    data.forEach((obj: any) => {
      this.cont_correo = this.cont_correo + 1;
      if (this.info_correo === '') {
        this.info_correo = obj.correo;
      }
      else {
        this.info_correo = this.info_correo + ', ' + obj.correo;
      }
    })
  }

  // METODO PARA INGRESAR SOLO LETRAS EN EL CAMPO DEL FORMULARIO
  IngresarSoloLetras(e) {
    let key = e.keyCode || e.which;
    let tecla = String.fromCharCode(key).toString();
    // SE DEFINE TODO EL ABECEDARIO QUE SE VA A USAR.
    let letras = " áéíóúabcdefghijklmnñopqrstuvwxyzÁÉÍÓÚABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    // ES LA VALIDACIÓN DEL KEYCODES, QUE TECLAS RECIBE EL CAMPO DE TEXTO.
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

  // METODO DE CONTROL DE ERRORES
  ObtenerMensajeErrorObservacion() {
    if (this.observacionF.hasError('pattern')) {
      return 'Ingrese información válida';
    }
    return this.observacionF.hasError('required') ? 'Campo Obligatorio' : '';
  }

  // METODO PARA SALIR DE LA VENTANA
  CerrarRegistroPlanificacion() {
    this.ventana.close();
  }

}
