import { Component, OnInit } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
const { DateTime } = require("luxon");

import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/configuracion/parametrizacion/parametrosGenerales/parametros.service';
import { TimbresService } from 'src/app/servicios/timbres/timbrar/timbres.service';
import { SocketService } from 'src/app/servicios/socket/socket.service';
import { LoginService } from 'src/app/servicios/login/login.service';

@Component({
  selector: 'app-button-avisos',
  standalone: false,
  templateUrl: './button-avisos.component.html',
  styleUrls: ['../main-nav.component.css']
})

export class ButtonAvisosComponent implements OnInit {
  ips_locales: any = '';

  estado: boolean = true;
  avisos: any = [];
  socket: any;

  estadoTimbres: boolean = true;
  num_timbre_false: number = 0;
  id_empleado_logueado: number;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    public loginService: LoginService,
    public parametro: ParametrosService,
    public validar: ValidacionesService,
    private socketService: SocketService,
    private aviso: TimbresService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) { }

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
    //console.log('ingresa aqui en escuchar', this.socket)
    if (!this.socket) return;
    //console.log('ingresa despues del socket')
    // VERIFICAR QUE EL USUARIO TIENE INICIO DE SESION
    if (this.loginService.loggedIn()) {
      // METODO DE ESCUCHA DE EVENTOS DE NOTIFICACIONES
      this.socket.on('recibir_aviso', (data: any) => {
        // VERIFICACION DE USUARIO QUE RECIBE NOTIFICACION
        if (parseInt(data.id_receives_empl) === this.id_empleado_logueado) {
          // BUSQUEDA DE LOS DATOS DE LA NOTIFICACION RECIBIDA
          this.aviso.ObtenerUnAviso(data.id).subscribe(res => {
            //console.log('ver datos avisos socket ', res)
            let avisos: any = [];
            avisos.push(res);
            // METODO PARA FORMATEAR LOS DATOS
            this.FormatearInformacionAvisos(avisos, this.formato_fecha, this.formato_hora, 2);
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
          this.FormatearInformacionAvisos(this.avisos, formato_fecha, formato_hora, 1);
        }
      }
    });
  }

  // METODO PARA FORMATEAR LOS DATOS SEGUN EL TIPO DE NOTIFICACION
  FormatearInformacionAvisos(informacion: any, fecha: any, hora: any, opcion: any) {
    // LISTA DE AVISOS
    informacion.forEach((aviso: any) => {
      // OPCION DE LECTURA DE TODAS LAS NOTIFICACIONES 1 // ESCUCHAR SOCKET 2
      if (opcion === 1) {
        // AVISOS QUE NO SEN HAN ABIERTO
        if (aviso.visto === false) {
          this.num_timbre_false = this.num_timbre_false + 1;
          this.estadoTimbres = false;
        }
      }
      let fecha_registro = this.validar.DarFormatoFecha(aviso.create_at.split(' ')[0], 'yyyy-MM-dd');
      // FORMATEAR DATOS DE FECHA Y HORA
      aviso.fecha_ = this.validar.FormatearFecha(fecha_registro || '', fecha, this.validar.dia_abreviado, this.idioma_fechas);
      aviso.hora_ = this.validar.FormatearHora(aviso.create_at.split(' ')[1], hora);
      // NOTIFICACION DE ATRASOS
      if (aviso.tipo === 100) {
        aviso.notificacion = aviso.mensaje.split('//')[4];
        let fechaHorario = (aviso.mensaje.split('//')[0]).split(' ')[0];
        aviso.horario_fecha = this.validar.FormatearFecha(fechaHorario, fecha, this.validar.dia_completo, this.idioma_fechas);
        aviso.horario_hora = this.validar.FormatearHora((aviso.mensaje.split('//')[0]).split(' ')[1], hora);
        aviso.timbre_fecha = this.validar.FormatearFecha((aviso.mensaje.split('//')[1]).split(' ')[0], fecha, this.validar.dia_completo, this.idioma_fechas);
        aviso.timbre_hora = this.validar.FormatearHora((aviso.mensaje.split('//')[1]).split(' ')[1], hora);
        aviso.tolerancia = aviso.mensaje.split('//')[2];
        aviso.atraso = aviso.mensaje.split('//')[3];
      }
      // NOTIFICACION DE FALTA
      else if
        (aviso.tipo === 101) {
        aviso.notificacion = aviso.mensaje.split('//')[1];
        aviso.horario_fecha = this.validar.FormatearFecha(aviso.mensaje.split('//')[0], fecha, this.validar.dia_completo, this.idioma_fechas);
      }
      // NOTIFICACION DE SALIDA ANTICIPADA
      else if (aviso.tipo === 102) {
        aviso.notificacion = aviso.mensaje.split('//')[3];
        let fechaHorario = (aviso.mensaje.split('//')[0]).split(' ')[0];
        aviso.horario_fecha = this.validar.FormatearFecha(fechaHorario, fecha, this.validar.dia_completo, this.idioma_fechas);
        aviso.horario_hora = this.validar.FormatearHora((aviso.mensaje.split('//')[0]).split(' ')[1], hora);
        aviso.timbre_fecha = this.validar.FormatearFecha((aviso.mensaje.split('//')[1]).split(' ')[0], fecha, this.validar.dia_completo, this.idioma_fechas);
        aviso.timbre_hora = this.validar.FormatearHora((aviso.mensaje.split('//')[1]).split(' ')[1], hora);
        aviso.salida = aviso.mensaje.split('//')[2];
      }
      // NOTIFICACIONES DE COMUNICADOS
      else if (aviso.tipo === 6) {
        aviso.notificacion = aviso.mensaje;
      }
      // VERIFICAR EL RESTO DE NOTIFICACIONES
      else {
        if (aviso.descripcion.split('para')[0] != undefined && aviso.descripcion.split('para')[1] != undefined) {
          aviso.aviso = aviso.descripcion.split('para')[0];;
          aviso.usuario = 'del usuario ' + aviso.descripcion.split('para')[1].split('desde')[0];
        }
        else {
          aviso.aviso = aviso.descripcion.split('desde')[0];
          aviso.usuario = '';
        }
      }
    })
  }

  // METODO PARA CAMBIAR ESTILOS
  CambiarEstiloNotificacion = {
    // NOTIIFCACION DE ATRASOS ---> 100
    100: { color: '#fff9c4', icon: 'fa fa-clock-o', iconColor: '#260DE6' },
    // NOTIFICACION DE FALTAS ---> 101
    101: { color: '#f8d7da', icon: 'fa fa-user-times', iconColor: '#260DE6' },
    // NOTIFICACION DE SALIDAS ANTICIPADAS ---> 102
    102: { color: '#bbdefb', icon: 'fa fa-sign-out', iconColor: '#260DE6' },
  };

  // METODO PARA ACTUALIZAR LA VISTA DE AVISOS
  ActualizarVista(data: any) {
    const datos = {
      visto: true,
      user_name: this.user_name,
      ip: this.ip,
      ip_local: this.ips_locales
    }
    this.aviso.ActualizarVistaAvisos(data.id, datos).subscribe(res => {
      this.LeerAvisos(this.formato_fecha, this.formato_hora);
    });

    this.router.navigate(['/lista-avisos']);

    // REVISAR NAVEGABILIDAD EN PANTALLAS DE NOTIFICACIONES
    const rol = parseInt(localStorage.getItem('rol') as string);

  }

}
