// LLAMADO A LAS LIBRERIAS
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { DateTime, Duration } from 'luxon';
import { ToastrService } from 'ngx-toastr';

// LLAMADO A LOS SERVICIOS
import { EmpleadoHorariosService } from 'src/app/servicios/horarios/empleadoHorarios/empleado-horarios.service';
import { DatosGeneralesService } from 'src/app/servicios/generales/datosGenerales/datos-generales.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { PlanComidasService } from 'src/app/servicios/modulos/modulo-alimentacion/planComidas/plan-comidas.service';
import { TipoComidasService } from 'src/app/servicios/modulos/modulo-alimentacion/catTipoComidas/tipo-comidas.service';
import { ParametrosService } from 'src/app/servicios/configuracion/parametrizacion/parametrosGenerales/parametros.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/avisos/real-time.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario/usuario.service';

@Component({
  selector: 'app-editar-solicitud-comida',
  templateUrl: './editar-solicitud-comida.component.html',
  styleUrls: ['./editar-solicitud-comida.component.css'],
})

export class EditarSolicitudComidaComponent implements OnInit {

  // VALIDACIONES DE LOS CAMPOS DEL FORMULARIO
  fechaPlanificacionF = new FormControl('', Validators.required);
  observacionF = new FormControl('', [Validators.required, Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{4,48}")]);
  horaInicioF = new FormControl('', Validators.required);
  idComidaF = new FormControl('', Validators.required);
  horaFinF = new FormControl('', Validators.required);
  platosF = new FormControl('', Validators.required);
  fechaF = new FormControl('', [Validators.required]);
  extraF = new FormControl('', [Validators.required]);
  tipoF = new FormControl('', Validators.required);

  // ASIGNAR LOS CAMPOS EN UN FORMULARIO DE UN GRUPO
  public PlanificacionComidasForm = new FormGroup({
    fechaPlanificacionForm: this.fechaPlanificacionF,
    observacionForm: this.observacionF,
    horaInicioForm: this.horaInicioF,
    idComidaForm: this.idComidaF,
    horaFinForm: this.horaFinF,
    platosForm: this.platosF,
    extraForm: this.extraF,
    fechaForm: this.fechaF,
    tipoForm: this.tipoF,
  });

  FechaActual: any; // VARIABLE DE ALAMCENAMIENTO DE FECHA DEL DÍA DE HOY
  tipoComidas: any = []; // VARIABLE DE ALMACENAMIENTO DE DATOS DE TIPO DE COMIDAS
  empleados: any = []; // VARIABLE DE ALMACENAMIENTO DE DATOS DE EMPLEADO

  // DATOS DEL EMPLEADO QUE INICIA SESION
  idEmpleadoIngresa: number;
  nota = 'su solicitud';
  user = '';

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    public restUsuario: UsuarioService, // SERVICIO DE DATOS DE USUARIO
    public parametro: ParametrosService,
    public restPlan: PlanComidasService, // SERVICIO DE DATOS DE PLAN COMIDAS
    public validar: ValidacionesService,
    public ventana: MatDialogRef<EditarSolicitudComidaComponent>, // VARIABLE VENTANA DE DIÁLOGO
    public restH: EmpleadoHorariosService, // SERVICIO DE DATOS DE HORARIOS DE EMPLEADO
    public restE: EmpleadoService, // SERVICIO DE DATOS DE EMPLEADO
    public aviso: RealTimeService,
    private rest: TipoComidasService, // SERVICIO DE DATOS DE TIPO DE COMIDAS
    private toastr: ToastrService, // VARIABLE PARA MOSTRAR NOTIFICACIONES
    private informacion: DatosGeneralesService,
    @Inject(MAT_DIALOG_DATA) public data: any, // VARIABLE CON DATOS PASADOS DE LA VENTANA ANTERIOR
  ) {
    this.idEmpleadoIngresa = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

    this.ObtenerEmpleados(this.data.solicitud.id_empleado);
    this.obtenerInformacionEmpleado();
    this.ObtenerServicios();
    this.CargarDatos();
    this.BuscarParametro();
  }

  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** **
   ** **************************************************************************************** **/

  formato_fecha: string = 'dd/MM/yyyy';
  formato_hora: string = 'HH:mm:ss';
  idioma_fechas: string = 'es';
  // METODO PARA BUSCAR DATOS DE PARAMETROS
  BuscarParametro() {
    let datos: any = [];
    let detalles = { parametros: '1, 2' };
    this.parametro.ListarVariosDetallesParametros(detalles).subscribe(
      res => {
        datos = res;
        //console.log('datos ', datos)
        datos.forEach((p: any) => {
          // id_tipo_parametro Formato fecha = 1
          if (p.id_parametro === 1) {
            this.formato_fecha = p.descripcion;
          }
          // id_tipo_parametro Formato hora = 2
          else if (p.id_parametro === 2) {
            this.formato_hora = p.descripcion;
          }
        })
      });
  }


  // METODO PARA OBTENER CONFIGURACION DE NOTIFICACIONES
  solInfo: any;
  obtenerInformacionEmpleado() {
    var estado: boolean;
    this.informacion.ObtenerInfoConfiguracion(this.data.solicitud.id_empleado).subscribe(
      res => {
        if (res.estado === 1) {
          estado = true;
        }
        this.solInfo = [];
        this.solInfo = {
          comida_mail: res.comida_mail,
          comida_noti: res.comida_notificacion,
          empleado: res.id_empleado,
          id_dep: res.id_departamento,
          id_suc: res.id_sucursal,
          estado: estado,
          correo: res.correo,
          fullname: res.fullname,
        }
        if (this.data.solicitud.id_empleado != this.idEmpleadoIngresa) {
          this.nota = 'la solicitud';
          this.user = 'para ' + this.solInfo.fullname;
        }
      })
  }

  // METODO PARA MOSTRAR LA INFORMACIÓN DEL EMPLEADO
  ObtenerEmpleados(idemploy: any) {
    this.empleados = [];
    var f = DateTime.now();
    this.FechaActual = f.toFormat('yyyy-MM-dd');
    this.restE.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleados = data;
      this.PlanificacionComidasForm.patchValue({
        fechaForm: this.FechaActual,
        extraForm: 'false'
      })
    })
  }

  // METODO PARA CARGAR LA INFORMACIÓN DE LA PLANIFICACIÓN SELECCIONADA EN EL FORMULARIO
  CargarDatos() {
    this.rest.ConsultarUnServicio(this.data.solicitud.id_servicio).subscribe(datos => {
      this.tipoComidas = datos;
    })
    this.rest.ConsultarUnDetalleMenu(this.data.solicitud.id_menu).subscribe(datos => {
      this.detalle = datos;
    });
    this.PlanificacionComidasForm.patchValue({
      fechaPlanificacionForm: this.data.solicitud.fec_comida,
      observacionForm: this.data.solicitud.observacion,
      horaInicioForm: this.data.solicitud.hora_inicio,
      idComidaForm: this.data.solicitud.id_menu,
      horaFinForm: this.data.solicitud.hora_fin,
      platosForm: this.data.solicitud.id_detalle,
      tipoForm: this.data.solicitud.id_servicio,
    })
    if (this.data.solicitud.extra === true) {
      this.PlanificacionComidasForm.patchValue({
        extraForm: 'true'
      })
    }
    else {
      this.PlanificacionComidasForm.patchValue({
        extraForm: 'false'
      })
    }
  }

  // METODO PARA BUSCAR SERVICIO DE ALIMENTACIÓN
  servicios: any = []; // VARIABLE DE ALMACENAMIENTO DE DATOS DE SERVICIOS
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
    this.platosF.reset();
    this.tipoComidas = [];
    this.rest.ConsultarUnServicio(form.tipoForm).subscribe(datos => {
      this.tipoComidas = datos;
    }, error => {
      this.toastr.info('Verificar la información.', 'No existen registrados Menús para esta tipo de servicio.', {
        timeOut: 6000,
      })
    })
  }

  // METODO DE BUSQUEDA DE DETALLES DE MENÚS
  detalle: any = [];
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

  InsertarPlanificacion(form: any) {
    let datosDuplicados = {
      id_sol_comida: this.data.solicitud.id,
      fecha_inicio: form.fechaInicioForm,
      fecha_fin: form.fechaFinForm,
      id: this.data.solicitud.id_empleado,
    }
    this.restPlan.BuscarDuplicadosSolFechasActualizar(datosDuplicados).subscribe(plan => {
      console.log('datos fechas', plan)
      this.toastr.info(this.empleados[0].nombre + ' ' + this.empleados[0].apellido + ' ya tiene registrada una planificación de alimentación en la fecha solicitada.', '', {
        timeOut: 6000,
      })
    }, error => {
      this.VerificarSolicitudEmpleado(form);
    });
  }

  // METODO PARA VERIFICAR SI EL EMPLEADO TIENE SOLICITADO UN SERVICIO DE ALIMENTACIÓN
  VerificarSolicitudEmpleado(form: any) {
    // SUMA DE UN MINUTO A LA HORA INICIO DE SERVICIO DE ALIMENTACIÓN
    const inicio_hora = DateTime.fromFormat(form.horaInicioForm, 'HH:mm:ss').plus(Duration.fromISO('PT1M')).toFormat('HH:mm:ss');
    // RESTA DE UN MINUTO A LA HORA FINAL DE SERVICIO DE ALIMENTACIÓN
    const fin_hora = DateTime.fromFormat(form.horaFinForm, 'HH:mm:ss').minus(Duration.fromISO('PT1M')).toFormat('HH:mm:ss');
    let datosSolicitud = {
      id_empleado: this.data.solicitud.id_empleado,
      hora_inicio: inicio_hora,
      hora_fin: fin_hora,
      fecha: form.fechaPlanificacionForm,
      id: this.data.solicitud.id,
    }
    this.restPlan.BuscarDuplicadosSolicitudFechas(datosSolicitud).subscribe(plan => {
      this.toastr.info(this.empleados[0].nombre + ' ' + this.empleados[0].apellido + ' ya tiene realizada una solicitud de servicio de alimentación en la fecha indicada.', '', {
        timeOut: 6000,
      })
    }, error => {
      this.VerificarHorarioEmpleado(form);
    });
  }

  // METODO PARA VERIFICAR SI EL EMPLEADO TIENE REGISTRADO UN HORARIO EN LAS FECHAS INGRESADAS
  VerificarHorarioEmpleado(form: any) {
    let datosHorario = {
      fechaInicio: form.fechaPlanificacionForm,
      fechaFinal: form.fechaPlanificacionForm
    }
    this.restH.BuscarHorarioFechas(this.empleados[0].codigo, datosHorario).subscribe(plan => {
      this.ActualizarSolicitud(form);
    }, error => {
      this.toastr.info(this.empleados[0].nombre + ' ' + this.empleados[0].apellido + ' no tiene registro de horario laboral en las fechas indicadas.', '', {
        timeOut: 6000,
      })
    });
  }

  // METODO PARA ACTUALIZAR LA SOLICITUD SELECCIONADA
  ActualizarSolicitud(form: any) {
    let datosPlanComida = {
      id_empleado: this.data.solicitud.id_empleado,
      fec_comida: form.fechaPlanificacionForm,
      observacion: form.observacionForm,
      hora_inicio: form.horaInicioForm,
      id_comida: form.platosForm,
      hora_fin: form.horaFinForm,
      id: this.data.solicitud.id,
      fecha: form.fechaForm,
      extra: form.extraForm,
      id_departamento: this.solInfo.id_dep,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
    };
    this.restPlan.ActualizarSolicitudComida(datosPlanComida).subscribe(alimentacion => {

      console.log('ver data actualizada ', alimentacion)
      alimentacion.EmpleadosSendNotiEmail.push(this.solInfo);
      this.EnviarCorreo(alimentacion);
      this.NotificarPlanificacion(alimentacion);

      this.toastr.success('Operación exitosa.', 'Servicio de Alimentación Actualizado.', {
        timeOut: 6000,
      })
      this.CerrarRegistroPlanificacion();
    });
  }



  // METODO PARA ENVIO DE CORREO
  EnviarCorreo(alimentacion: any) {
    var cont = 0;
    var correo_usuarios = '';

    // METODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE ALIMENTACIÓN
    let solicitud = this.validar.FormatearFecha(alimentacion.fec_comida, this.formato_fecha, this.validar.dia_completo, this.idioma_fechas);

    alimentacion.EmpleadosSendNotiEmail.forEach(e => {

      // LECTURA DE DATOS LEIDOS
      cont = cont + 1;

      // SI EL USUARIO SE ENCUENTRA ACTIVO Y TIENEN CONFIGURACIÓN RECIBIRA CORREO DE SOLICITUD DE ALIMENTACIÓN
      if (e.comida_mail) {
        if (e.estado === true) {
          if (correo_usuarios === '') {
            correo_usuarios = e.correo;
          }
          else {
            correo_usuarios = correo_usuarios + ', ' + e.correo
          }
        }
      }

      if (cont === alimentacion.EmpleadosSendNotiEmail.length) {
        let comida = {
          id_usua_solicita: alimentacion.id_empleado,
          tipo_solicitud: 'Servicio de alimentación actualizado por',
          fec_solicitud: solicitud,
          observacion: alimentacion.observacion,
          id_comida: alimentacion.id_comida,
          proceso: 'actualizado',
          estadoc: 'Pendiente de autorización',
          correo: correo_usuarios,
          asunto: 'ACTUALIZACION DE SOLICITUD DE SERVICIO DE ALIMENTACION',
          inicio: this.validar.FormatearHora(alimentacion.hora_inicio, this.formato_hora),
          final: this.validar.FormatearHora(alimentacion.hora_fin, this.formato_hora),
          extra: alimentacion.extra,
          id: alimentacion.id,
          solicitado_por: localStorage.getItem('fullname_print'),
        }
        if (correo_usuarios != '') {
          this.restPlan.EnviarCorreo(comida).subscribe(
            resp => {
              if (resp.message === 'ok') {
                this.toastr.success('Correo de solicitud enviado exitosamente.', '', {
                  timeOut: 6000,
                });
              }
              else {
                this.toastr.warning('Ups algo salio mal !!!', 'No fue posible enviar correo de solicitud.', {
                  timeOut: 6000,
                });
              }
            },
            err => {
              this.toastr.error(err.error.message, '', {
                timeOut: 6000,
              });
            },
            () => { },
          )
        }
      }
    })
  }

  // METODO PARA ENVIO DE NOTIFICACION
  NotificarPlanificacion(alimentacion: any) {

    // METODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE ALIMENTACIÓN
    let desde = this.validar.FormatearFecha(alimentacion.fec_comida, this.formato_fecha, this.validar.dia_completo, this.idioma_fechas);

    let inicio = this.validar.FormatearHora(alimentacion.hora_inicio, this.formato_hora);
    let final = this.validar.FormatearHora(alimentacion.hora_fin, this.formato_hora);

    let mensaje = {
      id_empl_envia: this.idEmpleadoIngresa,
      id_empl_recive: '',
      tipo: 1, // SOLICITUD SERVICIO DE ALIMENTACIÓN
      mensaje: 'Ha actualizado ' + this.nota + ' de alimentación ' + this.user + ' desde ' +
        desde +
        ' horario de ' + inicio + ' a ' + final + ' servicio ',
      id_comida: alimentacion.id_comida,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
    }

    alimentacion.EmpleadosSendNotiEmail.forEach(e => {
      mensaje.id_empl_recive = e.empleado;
      if (e.comida_noti) {
        this.restPlan.EnviarMensajePlanComida(mensaje).subscribe(res => {
          console.log(res.message);
          this.aviso.RecibirNuevosAvisos(res.respuesta);
        })
      }
    })

  }



  // METODO PARA INGRESAR SOLO LETRAS
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

  // METODO PARA INDICAR ERROR EN EL INGRESO DE OBSERVACIONES
  ObtenerMensajeErrorObservacion() {
    if (this.observacionF.hasError('pattern')) {
      return 'Ingrese información válida';
    }
    return this.observacionF.hasError('required') ? 'Campo Obligatorio' : '';
  }

  // METODO PARA CERRAR VENTANA DE DIÁLOGO
  CerrarRegistroPlanificacion() {
    this.ventana.close();
  }


}
