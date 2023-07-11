import { Component, OnInit } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Router } from '@angular/router';
import * as moment from 'moment';

import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { TimbresService } from 'src/app/servicios/timbres/timbres.service';
import { LoginService } from 'src/app/servicios/login/login.service';

@Component({
  selector: 'app-button-avisos',
  templateUrl: './button-avisos.component.html',
  styleUrls: ['../main-nav.component.css']
})

export class ButtonAvisosComponent implements OnInit {

  estado: boolean = true;

  estadoTimbres: boolean = true;
  num_timbre_false: number = 0;
  avisos: any = [];
  id_empleado_logueado: number;

  constructor(
    public loginService: LoginService,
    public parametro: ParametrosService,
    public validar: ValidacionesService,
    private socket: Socket,
    private aviso: TimbresService,
    private router: Router,
  ) {
    // VERIFICAR QUE EL USUARIO TIENEN INICIO DE SESION
    if (this.loginService.loggedIn()) {
      // METODO DE ESCUCHA DE EVENTOS DE NOTIFICACIONES
      this.socket.on('recibir_aviso', (data) => {
        // VERIFICACION DE USUARIO QUE RECIBE NOTIFICACION
        if (parseInt(data.id_receives_empl) === this.id_empleado_logueado) {
          // BUSQUEDA DE LOS DATOS DE LA NOTIFICACION RECIBIDA
          this.aviso.ObtenerUnAviso(data.id).subscribe(res => {
            // TRATAMIENTO DE LOS DATOS DE LA NOTIFICACION
            res.fecha_ = this.validar.FormatearFecha(moment(res.create_at).format('YYYY-MM-DD'), this.formato_fecha, this.validar.dia_abreviado);
            res.hora_ = this.validar.FormatearHora(moment(res.create_at).format('HH:mm:ss'), this.formato_hora);
            if (res.descripcion.split('para')[0] != undefined && res.descripcion.split('para')[1] != undefined) {
              res.aviso = res.descripcion.split('para')[0];;
              res.usuario = 'del usuario ' + res.descripcion.split('para')[1].split('desde')[0];
            }
            else {
              res.aviso = res.descripcion.split('desde')[0];
              res.usuario = '';
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
          })
        }
      });
    }
  }

  ngOnInit(): void {
    this.id_empleado_logueado = parseInt(localStorage.getItem('empleado') as string);
    this.BuscarParametro();
  }

  /** **************************************************************************************** **
  ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** ** 
  ** **************************************************************************************** **/

  formato_fecha: string = 'DD/MM/YYYY';
  formato_hora: string = 'HH:mm:ss';

  // METODO PARA BUSCAR PARAMETRO DE FORMATO DE FECHA
  BuscarParametro() {
    // id_tipo_parametro Formato fecha = 25
    this.parametro.ListarDetalleParametros(25).subscribe(
      res => {
        this.formato_fecha = res[0].descripcion;
        this.BuscarHora(this.formato_fecha)
      },
      vacio => {
        this.BuscarHora(this.formato_fecha)
      });
  }

  BuscarHora(fecha: string) {
    // id_tipo_parametro Formato hora = 26
    this.parametro.ListarDetalleParametros(26).subscribe(
      res => {
        this.formato_hora = res[0].descripcion;
        this.LlamarNotificacionesAvisos(fecha, this.formato_hora);
      },
      vacio => {
        this.LlamarNotificacionesAvisos(fecha, this.formato_hora);
      });
  }

  numeroTimbres() {
    if (this.num_timbre_false > 0) {
      this.num_timbre_false = 0;
      this.estadoTimbres = !this.estadoTimbres;
    }
  }

  LlamarNotificacionesAvisos(formato_fecha: string, formato_hora: string) {
    this.aviso.BuscarAvisosGenerales(this.id_empleado_logueado).subscribe(res => {
      this.avisos = res;
      if (!this.avisos.message) {
        if (this.avisos.length > 0) {
          this.avisos.forEach(obj => {

            if (obj.visto === false) {
              this.num_timbre_false = this.num_timbre_false + 1;
              this.estadoTimbres = false;
            }
            obj.fecha_ = this.validar.FormatearFecha(moment(obj.create_at).format('YYYY-MM-DD'), formato_fecha, this.validar.dia_abreviado);
            obj.hora_ = this.validar.FormatearHora(moment(obj.create_at).format('HH:mm:ss'), formato_hora);
            if (obj.descripcion.split('para')[0] != undefined && obj.descripcion.split('para')[1] != undefined) {
              obj.aviso = obj.descripcion.split('para')[0];;
              obj.usuario = 'del usuario ' + obj.descripcion.split('para')[1].split('desde')[0];
            }
            else {
              obj.aviso = obj.descripcion.split('desde')[0];
              obj.usuario = '';
            }
          });
        }
      }
    });
  }


  ActualizarVista(data: any) {
    this.aviso.PutVistaTimbre(data.id).subscribe(res => {
      this.LlamarNotificacionesAvisos(this.formato_fecha, this.formato_hora);
    });

    const rol = parseInt(localStorage.getItem('rol') as string);

    if (data.tipo === 6) {
      this.router.navigate(['/lista-avisos']);
    }

    if (rol === 1) {
      if (data.tipo === 1) {
        this.router.navigate(['/listaSolicitaComida']);
      }
      if (data.tipo === 2) {
        this.router.navigate(['/listaSolicitaComida']);
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
