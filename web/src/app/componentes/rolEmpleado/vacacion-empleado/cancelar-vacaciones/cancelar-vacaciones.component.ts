import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { VacacionesService } from 'src/app/servicios/vacaciones/vacaciones.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';

@Component({
  selector: 'app-cancelar-vacaciones',
  templateUrl: './cancelar-vacaciones.component.html',
  styleUrls: ['./cancelar-vacaciones.component.css']
})

export class CancelarVacacionesComponent implements OnInit {

  // DATOS DEL EMPLEADO QUE INICIA SESION
  idEmpleadoIngresa: number;
  nota = 'su solicitud';
  user = '';

  constructor(
    private informacion: DatosGeneralesService,
    private realTime: RealTimeService,
    private toastr: ToastrService,
    private restV: VacacionesService,
    public ventana: MatDialogRef<CancelarVacacionesComponent>,
    public validar: ValidacionesService,
    public parametro: ParametrosService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.idEmpleadoIngresa = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    console.log(this.data);
    this.obtenerInformacionEmpleado();
    this.BuscarParametro();
  }

  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** ** 
   ** **************************************************************************************** **/

  formato_fecha: string = 'DD/MM/YYYY';

  // METODO PARA BUSCAR PARAMETRO DE FORMATO DE FECHA
  BuscarParametro() {
    // id_tipo_parametro Formato fecha = 25
    this.parametro.ListarDetalleParametros(25).subscribe(
      res => {
        this.formato_fecha = res[0].descripcion;
      });
  }

  // METODO PARA OBTENER CONFIGURACION DE NOTIFICACIONES
  solInfo: any;
  obtenerInformacionEmpleado() {
    var estado: boolean;
    this.informacion.ObtenerInfoConfiguracion(this.data.id_empleado).subscribe(
      res => {
        if (res.estado === 1) {
          estado = true;
        }
        this.solInfo = [];
        this.solInfo = {
          vaca_mail: res.vacacion_mail,
          vaca_noti: res.vacacion_notificacion,
          empleado: res.id_empleado,
          id_dep: res.id_departamento,
          id_suc: res.id_sucursal,
          estado: estado,
          correo: res.correo,
          fullname: res.fullname,
        }
        if (this.data.id_empleado != this.idEmpleadoIngresa) {
          this.nota = 'la solicitud';
          this.user = 'para ' + this.solInfo.fullname;
        }
      })
  }

  aceptarAdvertencia() {
    this.restV.EliminarVacacion(this.data.id).subscribe(res => {
      console.log(res);
      var datos = {
        depa_user_loggin: this.solInfo.id_dep,
        objeto: res,
      }
      console.log(datos);
      this.informacion.BuscarJefes(datos).subscribe(vacacion => {
        console.log(vacacion);
        vacacion.EmpleadosSendNotiEmail.push(this.solInfo);
        this.EnviarNotificacion(vacacion);
        this.EnviarCorreoEmpleados(vacacion);
        this.toastr.error('Solicitud de vacaciones eliminada.', '', {
          timeOut: 6000,
        });
        this.ventana.close(true);
      });
    });
  }

  // METODO PARA ENVIO DE NOTIFICACIONES DE VACACIONES
  EnviarCorreoEmpleados(vacacion: any) {

    console.log('ver vacaciones..   ', vacacion)

    var cont = 0;
    var correo_usuarios = '';
    var estado_v: string = '';

    vacacion.EmpleadosSendNotiEmail.forEach(e => {
      // LECTURA DE DATOS LEIDOS
      cont = cont + 1;

      // METODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE VACACIÓN
      let desde = this.validar.FormatearFecha(vacacion.fec_inicio, this.formato_fecha, this.validar.dia_completo);
      let hasta = this.validar.FormatearFecha(vacacion.fec_final, this.formato_fecha, this.validar.dia_completo);

      // CAPTURANDO ESTADO DE LA SOLICITUD DE VACACIÓN
      if (vacacion.estado === 1) {
        estado_v = 'Pendiente de autorización';
      }

      // SI EL USUARIO SE ENCUENTRA ACTIVO Y TIENEN CONFIGURACIÓN RECIBIRA CORREO DE SOLICITUD DE VACACIÓN
      if (e.vaca_mail) {
        if (e.estado === true) {
          if (correo_usuarios === '') {
            correo_usuarios = e.correo;
          }
          else {
            correo_usuarios = correo_usuarios + ', ' + e.correo
          }
        }
      }

      console.log('ver contadores..   ', cont + '   ' + vacacion.EmpleadosSendNotiEmail.length)
      // VERIFICACIÓN QUE TODOS LOS DATOS HAYAN SIDO LEIDOS PARA ENVIAR CORREO
      if (cont === vacacion.EmpleadosSendNotiEmail.length) {
        let datosVacacionCreada = {
          tipo_solicitud: 'Solicitud de vacaciones eliminada por',
          idContrato: this.data.id_contrato,
          estado_v: estado_v,
          proceso: 'eliminado',
          desde: desde,
          hasta: hasta,
          id_dep: e.id_dep, // VERIFICAR
          id_suc: e.id_suc, // VERIFICAR
          correo: correo_usuarios,
          asunto: 'ELIMINACION DE SOLICITUD DE VACACIONES',
          id: vacacion.id,
          solicitado_por: localStorage.getItem('fullname_print'),
        }
        console.log('ver correos..   ', correo_usuarios)
        if (correo_usuarios != '') {
          this.restV.EnviarCorreoVacaciones(datosVacacionCreada).subscribe(
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

  EnviarNotificacion(vacaciones: any) {

    // METODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE VACACIÓN
    let desde = this.validar.FormatearFecha(vacaciones.fec_inicio, this.formato_fecha, this.validar.dia_completo);
    let hasta = this.validar.FormatearFecha(vacaciones.fec_final, this.formato_fecha, this.validar.dia_completo);

    let notificacion = {
      id_send_empl: this.idEmpleadoIngresa,
      id_receives_empl: '',
      id_receives_depa: '',
      estado: 'Pendiente',
      id_permiso: null,
      id_vacaciones: vacaciones.id,
      id_hora_extra: null,
      tipo: 3,
      mensaje: 'Ha eliminado ' + this.nota + ' de vacaciones ' + this.user + ' desde ' +
        desde + ' hasta ' + hasta,
    }

    //Listado para eliminar el usuario duplicado
    var allNotificaciones: any = [];

    //Ciclo por cada elemento del catalogo
    vacaciones.EmpleadosSendNotiEmail.forEach(function(elemento, indice, array) {
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
      console.log("Empleados enviados: ",allNotificaciones);
      if (e.vaca_noti) {
        this.realTime.IngresarNotificacionEmpleado(notificacion).subscribe(
          resp => {
            console.log('ver data de notificacion', resp.respuesta)
            this.restV.EnviarNotificacionRealTime(resp.respuesta);
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
