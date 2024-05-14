import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

import { PedHoraExtraService } from 'src/app/servicios/horaExtra/ped-hora-extra.service';
import { AutorizacionService } from 'src/app/servicios/autorizacion/autorizacion.service';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { AutorizaDepartamentoService } from 'src/app/servicios/autorizaDepartamento/autoriza-departamento.service';
import { use } from 'echarts';

@Component({
  selector: 'app-tiempo-autorizado',
  templateUrl: './tiempo-autorizado.component.html',
  styleUrls: ['./tiempo-autorizado.component.css']
})

export class TiempoAutorizadoComponent implements OnInit {

  // VARIABLES PARA MOSTRAR PROCESO
  aprobacion: boolean = false;
  observacion: boolean = false;
  editarHoras: boolean = false;
  guardarHoras: boolean = false;

  // VARIABLES DE LOS FORMULARIOS
  mensaje = new FormControl('', Validators.required);
  timer = new FormControl('', Validators.required);

  // FORMULARIO EDICION DE HORAS EXTRAS
  public TiempoHoraExtraForm = new FormGroup({
    timerForm: this.timer,
  });

  // FORMULARIO DE OBSERVACION
  public MensajeForm = new FormGroup({
    mensajeF: this.mensaje
  });

  idEmpleado: number;

  ArrayAutorizacionTipos: any = [];
  gerencia: boolean = false;
  ocultarPre: boolean = true;
  ocultarAu: boolean = true;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  public autorizacion: any []
  public lectura: any;
  public estado_auto: any;
  public empleado_estado: any = [];
  public listaEnvioCorreo: any = [];

  constructor(
    private informacion: DatosGeneralesService,
    private realTime: RealTimeService,
    private restPH: PedHoraExtraService,
    private toastr: ToastrService,
    private restA: AutorizacionService,
    public ventana: MatDialogRef<TiempoAutorizadoComponent>,
    public validar: ValidacionesService,
    public parametro: ParametrosService,
    public restAutoriza: AutorizaDepartamentoService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

    this.obtenerInformacionEmpleado();
    this.MostrarProceso();
    this.BuscarParametro();
    this.BuscarHora();
  }

  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** **
   ** **************************************************************************************** **/

  formato_fecha: string = 'DD/MM/YYYY';
  formato_hora: string = 'HH:mm:ss';
  autorizaDirecto: boolean = false;
  InfoListaAutoriza: any = [];
  // METODO PARA BUSCAR PARAMETRO DE FORMATO DE FECHA
  BuscarParametro() {
    // id_tipo_parametro Formato fecha = 25
    this.parametro.ListarDetalleParametros(25).subscribe(
      res => {
        this.formato_fecha = res[0].descripcion;
      }
    );

    this.restAutoriza.BuscarAutoridadUsuarioDepa(this.idEmpleado).subscribe(
      (res) => {
        this.ArrayAutorizacionTipos = res;
      }
    );

    this.restAutoriza.BuscarAutoridadUsuarioDepa(this.idEmpleado).subscribe(
      (res) => {
        this.ArrayAutorizacionTipos = res;
        this.ArrayAutorizacionTipos.filter(x => {
          if(x.nombre == 'GERENCIA' && x.estado == true){
            this.gerencia = true;
            this.autorizaDirecto = false;
            this.InfoListaAutoriza = x;
            if(x.autorizar == true){
              this.ocultarAu = false;
              this.ocultarPre = true;
            }else if(x.preautorizar == true){
              this.ocultarAu = true;
              this.ocultarPre = false;
            }
          }
          else if((this.gerencia == false) && (this.data.auto.id_departamento == x.id_departamento && x.estado == true)){
            this.autorizaDirecto = true;
            this.InfoListaAutoriza = x;
            if(x.autorizar == true){
              this.ocultarAu = false;
              this.ocultarPre = true;
            }else if(x.preautorizar == true){
              this.ocultarAu = true;
              this.ocultarPre = false;
            }
          }
        });
      }
    );
  }

  BuscarHora() {
    // id_tipo_parametro Formato hora = 26
    this.parametro.ListarDetalleParametros(26).subscribe(
      res => {
        this.formato_hora = res[0].descripcion;
      });
  }

  // METODO PARA OBTENER CONFIGURACION DE NOTIFICACIONES
  solInfo: any;
  obtenerInformacionEmpleado() {
    var estado: boolean;
    this.informacion.ObtenerInfoConfiguracion(this.data.horaExtra.id_usua_solicita).subscribe(
      res => {
        if (res.estado === 1) {
          estado = true;
        }
        this.solInfo = [];
        this.solInfo = {
          hora_extra_mail: res.hora_extra_mail,
          hora_extra_noti: res.hora_extra_noti,
          empleado: res.id_empleado,
          id_dep: res.id_departamento,
          id_suc: res.id_sucursal,
          estado: estado,
          correo: res.correo,
          fullname: res.fullname,
        }
      })
  }

  // METODO PARA MOSTRAR PROCESO
  MostrarProceso() {
    if (this.data.proceso === 'aprobar') {
      this.aprobacion = true;
    }
    else if (this.data.proceso === 'editar') {
      this.editarHoras = true;
      this.guardarHoras = true;
    }
    else if (this.data.proceso === 'observacion') {
      this.observacion = true;
    }
  }

  // METODO DE APROBACION DE SOLICITUD
  AprobacionSolicitud(estado: number) {
    this.TiempoAprobado(estado, this.data.horaExtra.num_hora);
  }

  // METODO DE ACTUALIZACION DE HORAS
  ActualizarHoras(estado: number, form: any) {
    this.TiempoAprobado(estado, form.timerForm + ':00')
  }

  // ACTUALIZAR TIEMPO APROBADO EN SOLIICTUD
  TiempoAprobado(estado: number, valor: any) {
    let h = {
      hora: valor,
      user_name: this.user_name,
      ip: this.ip,
    }
    // GUARDAR HORAS EXTRAS REALIZADAS POR EL USUARIO
    this.restPH.AutorizarTiempoHoraExtra(this.data.horaExtra.id, h).subscribe(res => {
      this.ActualizarEstadoAprobacion(estado, valor);
    })
  }

  // EDITAR ESTADO DE LA AUTORIZACION
  ActualizarEstadoAprobacion(estado: number, valor: any) {
    let aprobacion = {
      id_documento: this.data.auto.id_documento + localStorage.getItem('empleado') as string + '_' + estado + ',',
      estado: estado,
      user_name: this.user_name,
      ip: this.ip
    }
    this.restA.ActualizarAprobacion(this.data.auto.id, aprobacion).subscribe(res => {
      this.EditarEstadoHoraExtra(estado);
      this.NotificarAprobacion(estado, valor);
    })
  }

  // EDITAR ESTADO DE LA SOLICITUD
  EditarEstadoHoraExtra(estado: number) {
    let datosHorasExtras = {
      estado: estado,
      user_name: this.user_name,
      ip: this.ip
    }
    this.restPH.ActualizarEstado(this.data.horaExtra.id, datosHorasExtras).subscribe(horaExtra => {
    })
  }

  // METODO DE ENVIO DE NOTIFICACIONES RESPECTO A LA APROBACION
  NotificarAprobacion(estado: number, valor: any) {
    var datos = {
      depa_user_loggin: this.solInfo.id_dep,
      objeto: this.data.horaExtra,
    }

    // CAPTURANDO ESTADO DE LA SOLICITUD DE PERMISO
    if (estado === 2) {
      var estado_h = 'Preautorizado';
      var estado_c = 'Preautorizada';
      var estado_n = 'preautorizadas';
    }
    else if (estado === 3) {
      var estado_h = 'Autorizado';
      var estado_c = 'Autorizada';
      var estado_n = 'autorizadas';
    }
    else if (estado === 4) {
      var estado_h = 'Negado';
      var estado_c = 'Negada';
      var estado_n = 'negadas';
    }


    this.informacion.BuscarJefes(datos).subscribe(horaExtra => {
      horaExtra.EmpleadosSendNotiEmail.push(this.solInfo);
      this.ConfiguracionCorreo(horaExtra, estado_h, estado_c, valor, estado_n);
      this.EnviarNotificacion(horaExtra, estado_h, valor, estado_n);
      this.toastr.success('', 'Proceso realizado exitosamente.', {
        timeOut: 6000,
      });
      this.ventana.close(true);
    });
  }

  // METODO PARA CAMBIAR DE ESTADO EL CAMPO OBSERVACION DE SOLICITUD DE HORAS EXTRAS Y ENVIAR NOTIFICACIONES
  EnviarMensaje(form: any) {
    var datos = {
      observacion: true,
      user_name: this.user_name,
      ip: this.ip,
    }
    this.restPH.EditarObservacionPedido(this.data.horaExtra.id, datos).subscribe(res => {
    });
    this.EnviarCorreoJustificacion(this.data.horaExtra, form.mensajeF)
    this.NotificarJustificacion(this.data.horaExtra, this.data.horaExtra.num_hora);
    this.toastr.success('', 'Proceso realizado exitosamente.', {
      timeOut: 6000,
    });
    this.ventana.close(true);
  }

  /** ******************************************************************************************* **
   ** **                METODO DE ENVIO DE NOTIFICACIONES DE HORAS EXTRAS                      ** **
   ** ******************************************************************************************* **/
   listadoDepaAutoriza: any = [];
   id_departamento: any;
  // METODO PARA ENVIAR NOTIFICACIONES DE CORREO
  ConfiguracionCorreo(horaExtra: any, estado_h: string, estado_c: string, valor: any, estado_n: string) {
    console.log('ver horas extras ....   ', horaExtra)
    // METODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE HORA EXTRA
    let solicitud = this.validar.FormatearFecha(horaExtra.fec_solicita, this.formato_fecha, this.validar.dia_completo);
    let desde = this.validar.FormatearFecha(horaExtra.fec_inicio, this.formato_fecha, this.validar.dia_completo);
    let hasta = this.validar.FormatearFecha(horaExtra.fec_final, this.formato_fecha, this.validar.dia_completo);

    this.id_departamento = this.solInfo.id_dep;
    this.lectura = 1;
    this.restA.getUnaAutorizacionByHoraExtraRest(this.data.horaExtra.id).subscribe(res1 => {
      this.autorizacion = res1;
      console.log('this.autorizacion: ',this.autorizacion);
      // METODO PARA OBTENER EMPLEADOS Y ESTADOS
      var autorizaciones = this.autorizacion[0].id_documento.split(',');
      autorizaciones.map((obj: string) => {
        this.lectura = this.lectura + 1;
        if (obj != '') {
          let empleado_id = obj.split('_')[0];
          this.estado_auto = obj.split('_')[1];

          // CREAR ARRAY DE DATOS DE COLABORADORES
          var data = {
            id_empleado: empleado_id,
            estado: this.estado_auto
          }

          // CAMBIAR DATO ESTADO INT A VARCHAR
          if (this.estado_auto === '1') {
            this.estado_auto = 'Pendiente';
          }
          if (this.estado_auto === '2') {
            this.estado_auto = 'Preautorizado';
          }

          this.empleado_estado = this.empleado_estado.concat(data);
          // CUANDO TODOS LOS DATOS SE HAYAN REVISADO EJECUTAR METODO DE INFORMACIÓN DE AUTORIZACIÓN
          if (this.lectura === autorizaciones.length) {
            if((this.estado_auto === 'Pendiente') || (this.estado_auto === 'Preautorizado')){
              this.restAutoriza.BuscarListaAutorizaDepa(this.autorizacion[0].id_departamento).subscribe(res => {
                this.listadoDepaAutoriza = res;
                this.listadoDepaAutoriza.filter(item => {
                  if((item.nivel === autorizaciones.length) && (item.nivel_padre === item.nivel)){
                    return this.listaEnvioCorreo.push(item);
                  }else if((item.nivel === autorizaciones.length || item.nivel === (autorizaciones.length - 1))){
                    return this.listaEnvioCorreo.push(item);
                  }
                })
                console.log('this.listaEnvioCorreo1: ',this.listaEnvioCorreo);
                this.EnviarCorreo(horaExtra, this.listaEnvioCorreo, estado_h, estado_c, solicitud, desde, hasta, valor, estado_n);
              });
            }else if(this.estado_auto > 2){
              this.restAutoriza.BuscarListaAutorizaDepa(this.autorizacion[0].id_departamento).subscribe(res => {
                this.listadoDepaAutoriza = res;
                this.listadoDepaAutoriza.filter(item => {
                  if((item.nivel_padre === this.InfoListaAutoriza.nivel) && (item.nivel_padre === item.nivel)){
                    this.autorizaDirecto = false;
                    return this.listaEnvioCorreo.push(item);
                  }else{
                    this.autorizaDirecto = true;
                  }
                })

                //Esta condicion es para enviar el correo a todos los usuraios que autorizan siempre y cuando la solicitud fue negada antes
                if(this.autorizaDirecto === true){
                  this.listaEnvioCorreo = this.listadoDepaAutoriza;
                }

                console.log('this.listaEnvioCorreo2: ',this.listaEnvioCorreo);
                this.EnviarCorreo(horaExtra, this.listaEnvioCorreo, estado_h, estado_c, solicitud, desde, hasta, valor, estado_n);
              });
            }
          }

        }else if(autorizaciones.length == 1){
          this.restAutoriza.BuscarListaAutorizaDepa(this.autorizacion[0].id_departamento).subscribe(res => {
            this.listadoDepaAutoriza = res;
            this.listadoDepaAutoriza.filter(item => {
              if(item.nivel < 3 ){
                return this.listaEnvioCorreo.push(item);
              }
            })
            console.log('this.listaEnvioCorreo3: ',this.listaEnvioCorreo);
            this.EnviarCorreo(horaExtra, this.listaEnvioCorreo, estado_h, estado_c, solicitud, desde, hasta, valor, estado_n);
          });
        }
      })
    });

  }

  EnviarCorreo(horaExtra: any, listaEnvioCorreo: any, estado_h: string, estado_c: string, solicitud: any, desde: any, hasta: any, valor: any, estado_n: any){
    var cont = 0;
    var correo_usuarios = '';
    horaExtra.EmpleadosSendNotiEmail = listaEnvioCorreo;
    horaExtra.EmpleadosSendNotiEmail.push(this.solInfo);
    console.log('nueva lista hora extra: ',horaExtra.EmpleadosSendNotiEmail);

    // VERIFICACIÓN QUE TODOS LOS DATOS HAYAN SIDO LEIDOS PARA ENVIAR CORREO
    horaExtra.EmpleadosSendNotiEmail.forEach(e => {

      // LECTURA DE DATOS LEIDOS
      cont = cont + 1;

      if (e.hora_extra_mail) {
        if (e.estado === true) {
          if (correo_usuarios === '') {
            correo_usuarios = e.correo;
          }
          else {
            correo_usuarios = correo_usuarios + ', ' + e.correo
          }
        }
      }

      if (cont === horaExtra.EmpleadosSendNotiEmail.length) {

        let datosHoraExtraCreada = {
          tipo_solicitud: 'Solicitud de Hora Extra ' + estado_c.toLowerCase() + ' por',
          solicitud: solicitud,
          desde: desde,
          hasta: hasta,
          h_inicio: this.validar.FormatearHora(horaExtra.fec_inicio, this.formato_hora),
          h_final: this.validar.FormatearHora(horaExtra.fec_final, this.formato_hora),
          num_horas: moment(horaExtra.num_hora, 'HH:mm').format('HH:mm') +
            '<br> <b>Num. horas ' + estado_n + ':</b> ' + moment(valor, 'HH:mm').format('HH:mm') + ' <br>',
          observacion: horaExtra.descripcion,
          estado_h: estado_h,
          proceso: estado_h.toLowerCase(),
          asunto: 'SOLICITUD DE HORAS EXTRAS ' + estado_c.toUpperCase(),
          id_dep: e.id_dep,
          id_suc: e.id_suc,
          correo: correo_usuarios,
          id: horaExtra.id,
          id_empl_contrato: this.data.horaExtra.id_contrato,
          solicitado_por: localStorage.getItem('fullname_print')
        }
        console.log('ver horas extras ....   ', datosHoraExtraCreada)
        if (correo_usuarios != '') {
          this.restPH.EnviarCorreo(datosHoraExtraCreada).subscribe(
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


  // METODO PARA ENVIAR NOTIIFICACIONES AL SISTEMA
  EnviarNotificacion(horaExtra: any, estado_h: string, valor: any, estado_n: string) {

    // METODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE HORA EXTRA
    let desde = this.validar.FormatearFecha(horaExtra.fec_inicio, this.formato_fecha, this.validar.dia_completo);
    let hasta = this.validar.FormatearFecha(horaExtra.fec_final, this.formato_fecha, this.validar.dia_completo);

    let h_inicio = this.validar.FormatearHora(horaExtra.fec_inicio, this.formato_hora)
    let h_final = this.validar.FormatearHora(horaExtra.fec_final, this.formato_hora);

    let mensaje = {
      id_empl_envia: this.idEmpleado,
      id_empl_recive: '',
      mensaje: 'Ha ' + estado_h.toLowerCase() + ' la solicitud de horas extras para ' +
        this.solInfo.fullname + ' desde ' +
        desde + ' hasta ' +
        hasta +
        ' horario de ' + h_inicio + ' a ' + h_final +
        ' estado ' + estado_n + ' horas ' + moment(valor, 'HH:mm').format('HH:mm'),
      tipo: 12,  // APROBACIONES DE SOLICITUD DE HORAS EXTRAS
    }

    //Listado para eliminar el usuario duplicado
    var allNotificaciones: any = [];

    //Ciclo por cada elemento del catalogo
    horaExtra.EmpleadosSendNotiEmail.forEach(function(elemento, indice, array) {
      // Discriminación de elementos iguales
      if(allNotificaciones.find(p=>p.fullname == elemento.fullname) == undefined)
      {
        // Nueva lista de empleados que reciben la notificacion
        allNotificaciones.push(elemento);
      }
    });

    //ForEach para enviar la notificacion a cada usuario dentro de la nueva lista filtrada
    allNotificaciones.forEach(e => {
      mensaje.id_empl_recive = e.empleado;
      if (e.hora_extra_noti) {
        this.realTime.EnviarMensajeGeneral(mensaje).subscribe(
          resp => {
            this.realTime.RecibirNuevosAvisos(resp.respuesta);
            // this.restPH.EnviarNotificacionRealTime(resp.respuesta);
          },
          err => {
            this.toastr.error(err.error.message, '', {
              timeOut: 6000,
            });
          },
          () => { },
        )
      }
    })
  }


  /** ****************************************************************************************************** **
   ** **           NOTIFICACIONES PARA SOLICITAR JUSTIFICACIÓN DE SOLICITUD DE HORA EXTRA                 ** **
   ** ****************************************************************************************************** **/

  EnviarCorreoJustificacion(horaExtra: any, mensaje: string) {
    console.log('ver horas extras ....   ', horaExtra)

    var correo_usuarios = this.solInfo.correo;
    var estado_h: string = '';

    if (this.data.horaExtra.estado === 1) {
      estado_h = 'Pendiente de autorización'
    }
    else if (this.data.horaExtra.estado === 2) {
      estado_h = 'Preautorizada'
    }
    else if (this.data.horaExtra.estado === 3) {
      estado_h = 'Autorizada'
    }
    else if (this.data.horaExtra.estado === 4) {
      estado_h = 'Negada'
    }

    // METODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE HORA EXTRA
    let solicitud = this.validar.FormatearFecha(horaExtra.fec_solicita, this.formato_fecha, this.validar.dia_completo);
    let desde = this.validar.FormatearFecha(horaExtra.fec_inicio, this.formato_fecha, this.validar.dia_completo);
    let hasta = this.validar.FormatearFecha(horaExtra.fec_final, this.formato_fecha, this.validar.dia_completo);

    let datosHoraExtraCreada = {
      tipo_solicitud: 'Solicitud de Justificación de Hora Extra por',
      solicitud: solicitud,
      desde: desde,
      hasta: hasta,
      h_inicio: this.validar.FormatearHora(horaExtra.fec_inicio, this.formato_hora),
      h_final: this.validar.FormatearHora(horaExtra.fec_final, this.formato_hora),
      num_horas: moment(horaExtra.num_hora, 'HH:mm').format('HH:mm'),
      observacion: horaExtra.descripcion,
      estado_h: estado_h + '<br><br> <b>Mensaje:</b> ' + mensaje,
      proceso: 'pedido justificar',
      asunto: 'SUBIR JUSTIFICACION DE SOLICITUD DE HORAS EXTRAS',
      correo: correo_usuarios,
      id: horaExtra.id,
      id_empl_contrato: this.data.horaExtra.id_contrato,
      solicitado_por: localStorage.getItem('fullname_print')
    }
    console.log('ver horas extras ....   ', datosHoraExtraCreada)

    this.restPH.EnviarCorreo(datosHoraExtraCreada).subscribe(
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

  // METODO PARA NOTIFICACION DE COMUNICADO
  NotificarJustificacion(horaExtra: any, valor: string) {

    // METODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE HORA EXTRA
    let desde = this.validar.FormatearFecha(horaExtra.fec_inicio, this.formato_fecha, this.validar.dia_completo);
    let hasta = this.validar.FormatearFecha(horaExtra.fec_final, this.formato_fecha, this.validar.dia_completo);

    let h_inicio = this.validar.FormatearHora(horaExtra.fec_inicio, this.formato_hora)
    let h_final = this.validar.FormatearHora(horaExtra.fec_final, this.formato_hora);

    let mensaje = {
      id_empl_envia: this.idEmpleado,
      id_empl_recive: parseInt(this.solInfo.empleado),
      mensaje: 'Solicita justificar la solicitud de horas extras de ' +
        this.solInfo.fullname + ' desde ' +
        desde + ' ' + moment(horaExtra.fec_inicio).format('DD/MM/YYYY') + ' hasta ' +
        hasta + ' ' + moment(horaExtra.fec_final).format('DD/MM/YYYY') +
        ' horario de ' + h_inicio + ' a ' + h_final +
        ' horas ' + moment(valor, 'HH:mm').format('HH:mm'),
      tipo: 11,  // JUSTIFICACION DE SOLICITUD DE HORAS EXTRAS
    }
    this.realTime.EnviarMensajeGeneral(mensaje).subscribe(res => {
      this.realTime.RecibirNuevosAvisos(res.respuesta);
    })
  }

  IngresarSoloNumeros(evt) {
    if (window.event) {
      var keynum = evt.keyCode;
    }
    else {
      keynum = evt.which;
    }
    // COMPROBAMOS SI SE ENCUENTRA EN EL RANGO NUMERICO Y QUE TECLAS NO RECIBIRA.
    if ((keynum > 47 && keynum < 58) || keynum == 8 || keynum == 13 || keynum == 6) {
      return true;
    }
    else {
      this.toastr.info('No se admite el ingreso de letras', 'Usar solo números', {
        timeOut: 6000,
      })
      return false;
    }
  }

  LimpiarCampoHoras() {
    this.TiempoHoraExtraForm.patchValue({ timerForm: '' })
  }


}
