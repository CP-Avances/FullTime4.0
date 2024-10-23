import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { Socket } from 'ngx-socket-io';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';

import { LoginService } from 'src/app/servicios/login/login.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';

import { SettingsComponent } from 'src/app/componentes/notificaciones/configurar-notificaciones/settings/settings.component';

@Component({
  selector: 'app-button-notificacion',
  templateUrl: './button-notificacion.component.html',
  styleUrls: ['../main-nav.component.css']
})

export class ButtonNotificacionComponent implements OnInit {

  estado: boolean = true;

  num_noti_false: number = 0;
  noti_real_time: any = [];
  idEmpleadoIngresa: number;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    public loginService: LoginService,
    public parametro: ParametrosService,
    public ventana: MatDialog,
    public validar: ValidacionesService,
    private realTime: RealTimeService,
    private toaster: ToastrService,
    private socket: Socket,
    private router: Router,
  ) {
    /** ********************************************************************************** **
     ** **               METODO DE ESCUCHA A NOTIFICACIONES EN TIEMPO REAL              ** **
     ** ********************************************************************************** **/

    // VERIFICAR QUE EL USUARIO TIENEN INICIO DE SESION
    if (this.loginService.loggedIn()) {
      // METODO DE ESCUCHA DE EVENTOS DE NOTIFICACIONES
      this.socket.on('recibir_notificacion', (data: any) => {
        // VERIFICACION DE USUARIO QUE RECIBE NOTIFICACION
        if (parseInt(data.id_receives_empl) === this.idEmpleadoIngresa) {
          // BUSQUEDA DE LOS DATOS DE LA NOTIFICACION RECIBIDA
          this.realTime.ObtenerUnaNotificacion(data.id).subscribe(res => {
            // TRATAMIENTO DE LOS DATOS DE LA NOTIFICACION
            res.fecha_ = this.validar.FormatearFecha(DateTime.fromISO(res.create_at).toFormat('yyyy-MM-dd'), this.formato_fecha, this.validar.dia_abreviado, this.idioma_fechas);
            res.hora_ = this.validar.FormatearHora(DateTime.fromISO(res.create_at).toFormat('HH:mm:ss'), this.formato_hora);

            if (res.mensaje.split('para')[0] != undefined && res.mensaje.split('para')[1] != undefined) {
              res.aviso = res.mensaje.split('para')[0];;
              res.usuario = 'del usuario ' + res.mensaje.split('para')[1].split('desde')[0];
            }
            else {
              res.aviso = res.mensaje.split('desde')[0];
              res.usuario = '';
            }
            this.estadoNotificacion = false;
            if (this.avisos.length < 10) {
              // METODO QUE AGREGA NOTIFICACION AL INICIO DE LA LISTA
              this.avisos.unshift(res);
            } else if (this.avisos.length >= 10) {
              // METODO QUE AGREGA NOTIFICACION AL INICIO DE LA LISTA
              this.avisos.unshift(res);
              // METODO QUE ELIMINA ULTIMA NOTIFICACION
              this.avisos.pop();
            }
            this.num_noti_false = this.num_noti_false + 1;
          })
        }
      });
    }
  }

  ngOnInit(): void {
    this.idEmpleadoIngresa = parseInt(localStorage.getItem('empleado') as string);
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.BuscarParametro();
    this.VerificarConfiguracion(this.idEmpleadoIngresa);

  }

  /** **************************************************************************************** **
  ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** **
  ** **************************************************************************************** **/

  formato_fecha: string = 'DD/MM/YYYY';
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
        this.LlamarNotificaciones(this.formato_fecha, this.formato_hora);
      }, vacio => {
        this.LlamarNotificaciones(this.formato_fecha, this.formato_hora);
      });
  }

  // METOD PARA MOSTRAR NUMERO DE NOTIFICACIONES
  estadoNotificacion: boolean = true;
  MostarNumeroNotificacion() {
    if (this.num_noti_false > 0) {
      this.num_noti_false = 0;
      this.estadoNotificacion = !this.estadoNotificacion;
    }
  }

  // METODO DE BUSQUEDA DE NOTIFICACIONES
  avisos: any = [];
  nota: string = '';
  LlamarNotificaciones(formato_fecha: string, formato_hora: string) {
    this.realTime.ObtenerNotasUsuario(this.idEmpleadoIngresa).subscribe(res => {
      this.avisos = res;
      if (!this.avisos.text) {
        if (this.avisos.length > 0) {
          this.avisos.forEach((obj: any) => {
            obj.fecha_ = this.validar.FormatearFecha(DateTime.fromISO(obj.create_at).toFormat('yyyy-MM-dd'), formato_fecha, this.validar.dia_abreviado, this.idioma_fechas);
            obj.hora_ = this.validar.FormatearHora(DateTime.fromISO(obj.create_at).toFormat('HH:mm:ss'), formato_hora);
            if (obj.visto === false) {
              this.num_noti_false = this.num_noti_false + 1;
              this.estadoNotificacion = false
            }
            if (obj.mensaje.split('para')[0] != undefined && obj.mensaje.split('para')[1] != undefined) {
              obj.aviso = obj.mensaje.split('para')[0];;
              obj.usuario = 'del usuario ' + obj.mensaje.split('para')[1].split('desde')[0];
            }
            else {
              obj.aviso = obj.mensaje.split('desde')[0];
              obj.usuario = '';
            }
          });
        }
      }
    });
  }

  // METODO DE VERIFICACION DE CONFIGURACIONES DEL USUARIO
  VerificarConfiguracion(id: number) {
    this.realTime.ObtenerConfiguracionEmpleado(id).subscribe(res => {
      if (!res.text) {
        if (res[0].vacacion_notificacion === false || res[0].permiso_notificacion === false || res[0].hora_extra_notificacion === false) {
          this.num_noti_false = 0;
          this.estadoNotificacion = true
        }
      }
    }, error => {
      this.router.url
      if (this.router.url !== '/login') {
        this.toaster.info(
          'De clic aquí para configurar envio y recepción de notficaciones y avisos al correo electrónico.',
          'Faltan ajustes del sistema.',
          { timeOut: 9000 }).onTap.subscribe(items => {
            this.ConfigurarNotificaciones();
          });
      }
    });
  }

  // METODO PARA ACTUALIZAR VISTA DE NOTIFICACIONES
  ActualizarVista(data: any) {
    data.append('user_name', this.user_name);
    data.append('ip', this.ip);
    this.realTime.ActualizarVistaNotificacion(data.id, data).subscribe(res => {
      this.LlamarNotificaciones(this.formato_fecha, this.formato_hora);
    });



    // REVISAR NAVEGABILIDAD
    const rol = parseInt(localStorage.getItem('rol') as string);
    if (data.tipo != 3) {
      if (rol === 1) {
        if (data.id_permiso != null) {
          return this.router.navigate(['/ver-permiso/', data.id_permiso]);
        }
        if (data.id_vacaciones != null) {
          return this.router.navigate(['/ver-vacacion/', data.id_vacaciones]);
        }
        if (data.id_hora_extra != null) {
          return this.router.navigate(['/ver-hora-extra/', data.id_hora_extra]);
        }
      }

      if (rol != 1) {
        if (data.id_permiso != null) {
          return this.router.navigate(['/solicitarPermiso']);
        }
        if (data.id_vacaciones != null) {
          return this.router.navigate(['/vacacionesEmpleado']);
        }
        if (data.id_hora_extra != null) {
          return this.router.navigate(['/horaExtraEmpleado/']);
        }
      }
    }
    else {
      if (rol === 1) {
        this.router.navigate(['/home']);
      }
      else {
        this.router.navigate(['/estadisticas']);
      }
    }
  }

  // METODO PARA CONFIGURAR NOTIFICACIONES
  ConfigurarNotificaciones() {
    const id_empleado = parseInt(localStorage.getItem('empleado') as string);
    this.ventana.open(SettingsComponent, { width: '350px', data: { id_empleado } });
  }
}
