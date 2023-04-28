import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

import { VacacionesService } from 'src/app/servicios/vacaciones/vacaciones.service';
import { AutorizacionService } from 'src/app/servicios/autorizacion/autorizacion.service';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { AutorizaDepartamentoService } from 'src/app/servicios/autorizaDepartamento/autoriza-departamento.service';

interface Estado {
  id: number,
  nombre: string
}

@Component({
  selector: 'app-editar-estado-vacacion-autoriacion',
  templateUrl: './editar-estado-vacacion-autoriacion.component.html',
  styleUrls: ['./editar-estado-vacacion-autoriacion.component.css']
})

export class EditarEstadoVacacionAutoriacionComponent implements OnInit {

  estados: Estado[] = [];

  // DATOS DEL EMPLEADO QUE INICIA SESION
  idEmpleadoIngresa: number;

  estado = new FormControl('', Validators.required);

  public estadoAutorizacionesForm = new FormGroup({
    estadoF: this.estado
  });

  id_empleado_loggin: number;
  FechaActual: any;
  NotifiRes: any;

  ArrayAutorizacionTipos: any = [];
  gerencia: boolean = false;

  constructor(
    private informacion: DatosGeneralesService,
    private realTime: RealTimeService,
    private toastr: ToastrService,
    private restA: AutorizacionService,
    private restV: VacacionesService,
    public ventana: MatDialogRef<EditarEstadoVacacionAutoriacionComponent>,
    public restAutoriza: AutorizaDepartamentoService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.id_empleado_loggin = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    console.log(this.data, ' aprobar vacacion');

    if (this.data.auto.estado === 1) {
      this.toastr.info('Solicitud pendiente de aprobación.', '', {
        timeOut: 6000,
      })
    } else {
      this.estadoAutorizacionesForm.patchValue({
        estadoF: this.data.auto.estado
      });
    }

    this.restAutoriza.BuscarAutoridadUsuario(this.id_empleado_loggin).subscribe(
      (res) => {
        this.ArrayAutorizacionTipos = res;
        this.ArrayAutorizacionTipos.filter(x => {
          if(x.id_departamento == 1 && x.estado == true){
            this.gerencia = true;
            if(x.autorizar == true){
              this.estados = [
                { id: 3, nombre: 'Autorizado' },
                { id: 4, nombre: 'Negado' }
              ];
            }else if(x.preautorizar == true){
              this.estados = [
                { id: 2, nombre: 'Pre-autorizado' }
              ];
            }
          }
          else if((this.gerencia == false) && (this.data.auto.id_departamento == x.id_departamento && x.estado == true)){
            if(x.autorizar == true){
              this.estados = [
                { id: 3, nombre: 'Autorizado' },
                { id: 4, nombre: 'Negado' }
              ];
            }else if(x.preautorizar == true){
              this.estados = [
                { id: 2, nombre: 'Pre-autorizado' }
              ];
            }
          }
        });
      }
    );

    this.ObtenerTiempo();
    this.obtenerInformacionEmpleado();
  }

  ObtenerTiempo() {
    var f = moment();
    this.FechaActual = f.format('YYYY-MM-DD');
  }

  // METODO PARA OBTENER CONFIGURACION DE NOTIFICACIONES
  solInfo: any;
  obtenerInformacionEmpleado() {
    var estado: boolean;
    this.informacion.ObtenerInfoConfiguracion(this.data.vacacion.id_empleado).subscribe(
      res => {
        if (res.estado === 1) {
          estado = true;
        }
        this.solInfo = [];
        this.solInfo = {
          vaca_mail: res.vaca_mail,
          vaca_noti: res.vaca_noti,
          empleado: res.id_empleado,
          id_dep: res.id_departamento,
          id_suc: res.id_sucursal,
          estado: estado,
          correo: res.correo,
          fullname: res.fullname,
        }
      })
  }

  // METODO DE APROBACION DE SOLICITUD DE VACACIONES
  ActualizarEstadoAprobacion(form: any) {
    let aprobacion = {
      id_documento: this.data.auto.id_documento + localStorage.getItem('empleado') as string + '_' + form.estadoF + ',',
      estado: form.estadoF,
    }
    this.restA.ActualizarAprobacion(this.data.auto.id, aprobacion).subscribe(res => {
      this.EditarEstadoVacacion(this.data.auto.id_vacacion, form.estadoF);
      this.NotificarAprobacion(form.estadoF);
    })
  }

  // METODO DE ACTUALIZACION DE ESTADO DE VACACIONES
  EditarEstadoVacacion(id_vacacion: number, estado_vacacion: any) {
    let datosVacacion = {
      estado: estado_vacacion,
    }
    this.restV.ActualizarEstado(id_vacacion, datosVacacion).subscribe(respon => {
    });
  }

  // METODO DE ENVIO DE NOTIFICACIONES RESPECTO A LA APROBACION
  NotificarAprobacion(estado: number) {
    var datos = {
      depa_user_loggin: this.solInfo.id_dep,
      objeto: this.data.vacacion,
    }

    // CAPTURANDO ESTADO DE LA SOLICITUD DE PERMISO
    if (estado === 2) {
      var estado_v = 'Preautorizado';
      var estado_c = 'Preautorizada';
    }
    else if (estado === 3) {
      var estado_v = 'Autorizado';
      var estado_c = 'Autorizada';
    }
    else if (estado === 4) {
      var estado_v = 'Negado';
      var estado_c = 'Negada';
    }
    this.informacion.BuscarJefes(datos).subscribe(vacacion => {
      console.log(vacacion);
      vacacion.EmpleadosSendNotiEmail.push(this.solInfo);
      this.EnviarCorreoEmpleados(vacacion, estado_v, estado_c);
      this.EnviarNotificacion(vacacion, estado_v);
      this.toastr.success('', 'Proceso realizado exitosamente.', {
        timeOut: 6000,
      });
      this.ventana.close(true);
    });
  }

  // METODO PARA ENVIO DE NOTIFICACIONES DE VACACIONES
  EnviarCorreoEmpleados(vacacion: any, estado_v: string, estado_c: string) {

    console.log('ver vacaciones..   ', vacacion)

    var cont = 0;
    var correo_usuarios = '';

    vacacion.EmpleadosSendNotiEmail.forEach(e => {
      // LECTURA DE DATOS LEIDOS
      cont = cont + 1;

      // METODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE VACACIÓN
      let desde = moment.weekdays(moment(vacacion.fec_inicio).day()).charAt(0).toUpperCase() + moment.weekdays(moment(vacacion.fec_inicio).day()).slice(1);
      let hasta = moment.weekdays(moment(vacacion.fec_final).day()).charAt(0).toUpperCase() + moment.weekdays(moment(vacacion.fec_final).day()).slice(1);

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

      // VERIFICACIÓN QUE TODOS LOS DATOS HAYAN SIDO LEIDOS PARA ENVIAR CORREO
      if (cont === vacacion.EmpleadosSendNotiEmail.length) {
        let datosVacacionCreada = {
          tipo_solicitud: 'Vacaciones ' + estado_v.toLowerCase() + ' por',
          idContrato: vacacion.id_contrato,
          estado_v: estado_v,
          proceso: estado_v.toLowerCase(),
          desde: desde + ' ' + moment(vacacion.fec_inicio).format('DD/MM/YYYY'),
          hasta: hasta + ' ' + moment(vacacion.fec_final).format('DD/MM/YYYY'),
          id_dep: e.id_dep, // VERIFICAR
          id_suc: e.id_suc, // VERIFICAR
          correo: correo_usuarios,
          asunto: 'SOLICITUD DE VACACIONES ' + estado_c.toUpperCase(),
          id: vacacion.id,
          solicitado_por: localStorage.getItem('fullname_print'),
        }

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

  // METODO PARA ENVIAR NOTIFICACIONES
  EnviarNotificacion(vacaciones: any, estado_v: string) {

    let desde = moment.weekdays(moment(vacaciones.fec_inicio).day()).charAt(0).toUpperCase() + moment.weekdays(moment(vacaciones.fec_inicio).day()).slice(1);
    let hasta = moment.weekdays(moment(vacaciones.fec_final).day()).charAt(0).toUpperCase() + moment.weekdays(moment(vacaciones.fec_final).day()).slice(1);

    let notificacion = {
      id_receives_empl: '',
      id_receives_depa: '',
      id_vacaciones: vacaciones.id,
      id_hora_extra: null,
      id_send_empl: this.id_empleado_loggin,
      id_permiso: null,
      estado: estado_v,
      tipo: 2,
      mensaje: 'Ha ' + estado_v.toLowerCase() + ' la solicitud de vacaciones para ' +
        this.solInfo.fullname + ' desde ' +
        desde + ' ' + moment(vacaciones.fec_inicio).format('DD/MM/YYYY') + ' hasta ' +
        hasta + ' ' + moment(vacaciones.fec_final).format('DD/MM/YYYY'),
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
