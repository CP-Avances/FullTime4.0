import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { PedHoraExtraService } from 'src/app/servicios/horaExtra/ped-hora-extra.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';

@Component({
  selector: 'app-cancelar-hora-extra',
  templateUrl: './cancelar-hora-extra.component.html',
  styleUrls: ['./cancelar-hora-extra.component.css']
})

export class CancelarHoraExtraComponent implements OnInit {

  // DATOS DEL EMPLEADO QUE INICIA SESION
  idEmpleadoIngresa: number;
  nota = 'su solicitud';
  user = '';

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    private informacion: DatosGeneralesService,
    private realTime: RealTimeService,
    private restHE: PedHoraExtraService,
    private toastr: ToastrService,
    public ventana: MatDialogRef<CancelarHoraExtraComponent>,
    public validar: ValidacionesService,
    public parametro: ParametrosService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // VARIABLES DEL EMPLEADO QUE SOLICITA
    this.idEmpleadoIngresa = parseInt(localStorage.getItem("empleado") as string);
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

    this.obtenerInformacionEmpleado();
    this.BuscarParametro();
    this.BuscarHora();
  }

  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** **
   ** **************************************************************************************** **/

  formato_fecha: string = 'DD/MM/YYYY';
  formato_hora: string = 'HH:mm:ss';

  // METODO PARA BUSCAR PARAMETRO DE FORMATO DE FECHA
  BuscarParametro() {
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

  // METODO PARA OBTENER CONFIGURACION DE NOTIFICACIONES
  solInfo: any;
  obtenerInformacionEmpleado() {
    var estado: boolean;
    this.informacion.ObtenerInfoConfiguracion(this.data.id_usua_solicita).subscribe(
      res => {
        if (res.estado === 1) {
          estado = true;
        }
        this.solInfo = [];
        this.solInfo = {
          hora_extra_mail: res.hora_extra_mail,
          hora_extra_noti: res.hora_extra_notificacion,
          empleado: res.id_empleado,
          id_dep: res.id_departamento,
          id_suc: res.id_sucursal,
          estado: estado,
          correo: res.correo,
          fullname: res.fullname,
          id_contrato: res.id_contrato,
        }
        if (this.data.id_usua_solicita != this.idEmpleadoIngresa) {
          this.nota = 'la solicitud';
          this.user = 'para ' + this.solInfo.fullname;
        }
      })
  }

  aceptarAdvertencia() {
    const datos = {
      user_name: this.user_name,
      ip: this.ip,
    };
    this.restHE.EliminarHoraExtra(this.data.id, this.data.documento, datos).subscribe(res => {
      console.log('advertencia', res);
      var datos = {
        depa_user_loggin: this.solInfo.id_dep,
        objeto: res,
      }
      this.informacion.BuscarJefes(datos).subscribe(horaExtra => {
        console.log(horaExtra);
        horaExtra.EmpleadosSendNotiEmail.push(this.solInfo);
        this.EnviarCorreo(horaExtra);
        this.EnviarNotificacion(horaExtra);
        this.toastr.error('Solicitud de Horas Extras eliminada.', '', {
          timeOut: 6000,
        });
        this.ventana.close(true);
      });
    }, err => {
      const { access, message } = err.error.message;
      if (access === false) {
        this.toastr.error(message)
        this.ventana.close(false);
      }
    });
  }

  /** ******************************************************************************************* **
   ** **                METODO DE ENVIO DE NOTIFICACIONES DE HORAS EXTRAS                      ** **
   ** ******************************************************************************************* **/

  // METODO PARA ENVIAR NOTIFICACIONES DE CORREO
  EnviarCorreo(horaExtra: any) {

    console.log('ver horas extras ....   ', horaExtra)

    var cont = 0;
    var correo_usuarios = '';

    // METODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE HORA EXTRA
    let solicitud = this.validar.FormatearFecha(horaExtra.fec_solicita, this.formato_fecha, this.validar.dia_completo);
    let desde = this.validar.FormatearFecha(moment(horaExtra.fec_inicio).format('YYYY-MM-DD'), this.formato_fecha, this.validar.dia_completo);
    let hasta = this.validar.FormatearFecha(moment(horaExtra.fec_final).format('YYYY-MM-DD'), this.formato_fecha, this.validar.dia_completo);

    if (horaExtra.estado === 1) {
      var estado_h = 'Pendiente de autorización';
    }
    else if (horaExtra.estado === 2) {
      var estado_h = 'Preautorizado';
    }
    else if (horaExtra.estado === 3) {
      var estado_h = 'Autorizado';
    }
    else if (horaExtra.estado === 4) {
      var estado_h = 'Negado';
    }

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
          tipo_solicitud: 'Eliminación de solicitud de Horas Extras por',
          solicitud: solicitud,
          desde: desde,
          hasta: hasta,
          h_inicio: this.validar.FormatearHora(moment(horaExtra.fec_inicio).format('HH:mm:ss'), this.formato_hora),
          h_final: this.validar.FormatearHora(moment(horaExtra.fec_final).format('HH:mm:ss'), this.formato_hora),
          num_horas: moment(horaExtra.num_hora, 'HH:mm').format('HH:mm'),
          observacion: horaExtra.descripcion,
          estado_h: estado_h,
          proceso: 'eliminado',
          asunto: 'ELIMINACION DE SOLICITUD DE HORAS EXTRAS',
          id_dep: e.id_dep,
          id_suc: e.id_suc,
          correo: correo_usuarios,
          id: horaExtra.id,
          id_empl_contrato: this.solInfo.id_contrato,
          solicitado_por: localStorage.getItem('fullname_print')
        }
        console.log('ver horas extras ....   ', datosHoraExtraCreada)
        if (correo_usuarios != '') {
          this.restHE.EnviarCorreo(datosHoraExtraCreada).subscribe(
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
  EnviarNotificacion(horaExtra: any) {

    // METODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE HORA EXTRA
    let desde = this.validar.FormatearFecha(moment(horaExtra.fec_inicio).format('YYYY-MM-DD'), this.formato_fecha, this.validar.dia_completo);
    let hasta = this.validar.FormatearFecha(moment(horaExtra.fec_final).format('YYYY-MM-DD'), this.formato_fecha, this.validar.dia_completo);

    let h_inicio = this.validar.FormatearHora(moment(horaExtra.fec_inicio).format('HH:mm:ss'), this.formato_hora)
    let h_final = this.validar.FormatearHora(moment(horaExtra.fec_final).format('HH:mm:ss'), this.formato_hora);

    let notificacion = {
      id_send_empl: this.idEmpleadoIngresa,
      id_receives_empl: '',
      id_receives_depa: '',
      estado: 'Pendiente',
      id_permiso: null,
      id_vacaciones: null,
      id_hora_extra: horaExtra.id,
      tipo: 3,
      mensaje: 'Ha eliminado ' + this.nota + ' de horas extras ' + this.user + ' desde ' +
        desde + ' hasta ' +
        hasta +
        ' horario de ' + h_inicio + ' a ' + h_final,
      user_name: this.user_name,
      ip: this.ip,
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
      notificacion.id_receives_depa = e.id_dep;
      notificacion.id_receives_empl = e.empleado;
      if (e.hora_extra_noti) {
        this.realTime.IngresarNotificacionEmpleado(notificacion).subscribe(
          resp => {
            this.restHE.EnviarNotificacionRealTime(resp.respuesta);
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
}
