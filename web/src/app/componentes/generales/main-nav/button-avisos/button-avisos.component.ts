import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/configuracion/parametrizacion/parametrosGenerales/parametros.service';
import { TimbresService } from 'src/app/servicios/timbres/timbrar/timbres.service';
import { LoginService } from 'src/app/servicios/login/login.service';
import { SocketService } from 'src/app/servicios/socket/socket.service';

import { ChangeDetectorRef } from '@angular/core';
const { DateTime } = require("luxon");

@Component({
  selector: 'app-button-avisos',
  standalone: false,
  templateUrl: './button-avisos.component.html',
  styleUrls: ['../main-nav.component.css']
})

export class ButtonAvisosComponent implements OnInit {
  ips_locales: any = '';

  estado: boolean = true;

  estadoTimbres: boolean = true;
  num_timbre_false: number = 0;
  avisos: any = [];
  id_empleado_logueado: number;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  socket: any;

  constructor(
    public loginService: LoginService,
    public parametro: ParametrosService,
    public validar: ValidacionesService,
    private aviso: TimbresService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private socketService: SocketService,
  ) {}

  ngOnInit(): void {
    this.id_empleado_logueado = parseInt(localStorage.getItem('empleado') as string);
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });
    this.BuscarParametro();
    this.EscucharNotificaciones();
  }

  /** ********************************************************************************** **
  ** **               METODO DE ESCUCHA A NOTIFICACIONES EN TIEMPO REAL              ** **
  ** ********************************************************************************** **/
  EscucharNotificaciones() {
    this.socket = this.socketService.getSocket();

    if (!this.socket) return;

    // VERIFICAR QUE EL USUARIO TIENEN INICIO DE SESION
    if (this.loginService.loggedIn()) {
      // METODO DE ESCUCHA DE EVENTOS DE NOTIFICACIONES
      this.socket.on('recibir_aviso', (data: any) => {

        // VERIFICACION DE USUARIO QUE RECIBE NOTIFICACION
        if (parseInt(data.id_receives_empl) === this.id_empleado_logueado) {

          // BUSQUEDA DE LOS DATOS DE LA NOTIFICACION RECIBIDA
          this.aviso.ObtenerUnAviso(data.id).subscribe(res => {

            let fecha = this.validar.DarFormatoFecha(res.fecha_hora.split('T')[0], 'yyyy-MM-dd');
            // TRATAMIENTO DE LOS DATOS DE LA NOTIFICACION
            res.fecha_ = this.validar.FormatearFecha(fecha || '', this.formato_fecha, this.validar.dia_abreviado, this.idioma_fechas);


            res.hora_ = this.validar.FormatearHora( DateTime.fromISO(res.fecha_hora).toFormat("HH:mm:ss"), this.formato_hora);

            if (res.tipo != 6) {
              if (res.descripcion.split('para')[0] != undefined && res.descripcion.split('para')[1] != undefined) {
                res.aviso = res.descripcion.split('para')[0];;
                res.usuario = 'del usuario ' + res.descripcion.split('para')[1].split('desde')[0];
              }
              else {
                res.aviso = res.descripcion.split('desde')[0];
                res.usuario = '';
              }
            }

            this.estadoTimbres = false;
            if (this.avisos.length < 10) {
              // METODO QUE AGREGA NOTIFICACION AL INICIO DE LA LISTA
              this.avisos.unshift(res);
            } else if (this.avisos.length >= 10) {
              // METODO QUE AGREGA NOTIFICACION AL INICIO DE LA LISTA
              this.avisos.unshift(res);
              // METODO QUE ELIMINA ULTIMA NOTIFICACION
              this.avisos.pop();
            }
            this.num_timbre_false = this.num_timbre_false + 1;

            this.cdr.detectChanges()
          })
        }
      });
    }
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
        this.LeerAvisos(this.formato_fecha, this.formato_hora);
      }, vacio => {
        this.LeerAvisos(this.formato_fecha, this.formato_hora);
      });
  }

  // METODO PARA MOSTRAR EL NUMERO DE AVISOS
  MostarNumeroAvisos() {
    if (this.num_timbre_false > 0) {
      this.num_timbre_false = 0;
      this.estadoTimbres = !this.estadoTimbres;
    }
  }

  // METODO PARA LEER AVISOS
  LeerAvisos(formato_fecha: string, formato_hora: string) {
    this.aviso.BuscarAvisosGenerales(this.id_empleado_logueado).subscribe(res => {
      this.avisos = res;
      //console.log('ver avisos leidos ', this.avisos)
      if (!this.avisos.message) {
        if (this.avisos.length > 0) {
          // LEER TODOS LOS AVISOS
          this.avisos.forEach((obj: any) => {
            // AVISOS QUE NO SEN HAN ABIERTO
            if (obj.visto === false) {
              this.num_timbre_false = this.num_timbre_false + 1;
              this.estadoTimbres = false;
            }
            let fecha = this.validar.DarFormatoFecha(obj.create_at.split(' ')[0], 'yyyy-MM-dd');
            // FORMATEAR DATOS DE FECHA Y HORA
            obj.fecha_ = this.validar.FormatearFecha(fecha || '', formato_fecha, this.validar.dia_abreviado, this.idioma_fechas);
            obj.hora_ = this.validar.FormatearHora(obj.create_at.split(' ')[1], formato_hora);
            // VERIFICAR DESCRIPCIONES DE AVISOS
            if (obj.tipo != 6) {
              if (obj.descripcion.split('para')[0] != undefined && obj.descripcion.split('para')[1] != undefined) {
                obj.aviso = obj.descripcion.split('para')[0];;
                obj.usuario = 'del usuario ' + obj.descripcion.split('para')[1].split('desde')[0];
              }
              else {
                obj.aviso = obj.descripcion.split('desde')[0];
                obj.usuario = '';
              }
            }
          });
        }
      }
    });
  }

  // METODO PARA ACTUALIZAR LA VISTA DE AVISOS
  ActualizarVista(data: any) {
    const datos = {
      visto: true,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales
    }
    this.aviso.ActualizarVistaAvisos(data.id, datos).subscribe(res => {
      this.LeerAvisos(this.formato_fecha, this.formato_hora);
    });
    // NAVEGABILIDAD COMUNICADOS
    if (data.tipo === 6) {
      this.router.navigate(['/lista-avisos']);
    }

    // REVISAR NAVEGABILIDAD EN PANTALLAS DE NOTIFICACIONES
    const rol = parseInt(localStorage.getItem('rol') as string);
    if (rol === 1) {
      if (data.tipo === 1) {
        this.router.navigate(['/listaSolicitaComida']);
      }
      if (data.tipo === 2) {
        this.router.navigate(['/listaSolicitaComida']);
      }
      if (data.tipo === 7) {
        this.router.navigate(['/permisos-solicitados']);
      }
      if (data.tipo === 20) {
        this.router.navigate(['/listaPlanComidas']);
      }
      if (data.tipo === 10) {
        this.router.navigate(['/listadoPlanificaciones']);
      }
      if (data.tipo === 12) {
        this.router.navigate(['/ver-hora-extra/52']);
      }
      if (data.tipo === 11) {
        this.router.navigate(['/ver-hora-extra/52']);
      }
    }

    if (rol != 1) {
      if (data.tipo === 1) {
        this.router.navigate(['/comidasPlanEmpleado']);
      }
      if (data.tipo === 2) {
        this.router.navigate(['/comidasPlanEmpleado']);
      }
      if (data.tipo === 20) {
        this.router.navigate(['/comidasPlanEmpleado']);
      }
      if (data.tipo === 10) {
        this.router.navigate(['/horaExtraEmpleado']);
      }
      if (data.tipo === 12) {
        this.router.navigate(['/horaExtraEmpleado']);
      }
      if (data.tipo === 11) {
        this.router.navigate(['/horaExtraEmpleado']);
      }
    }

  }

}
