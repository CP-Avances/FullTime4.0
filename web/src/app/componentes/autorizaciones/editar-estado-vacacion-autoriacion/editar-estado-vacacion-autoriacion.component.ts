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

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  public InfoListaAutoriza: any = [];
  public ArrayAutorizacionTipos: any = [];
  public autorizacion: any []
  public gerencia: boolean = false;
  public autorizaDirecto: boolean = false;
  public lectura: any;
  public estado_auto: any;
  public empleado_estado: any = [];
  public listaEnvioCorreo: any = [];

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
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

    if (this.data.auto.estado === 1) {
      this.toastr.info('Solicitud pendiente de aprobación.', '', {
        timeOut: 6000,
      })
    } else {
      this.estadoAutorizacionesForm.patchValue({
        estadoF: ''
      });
    }

    this.restAutoriza.BuscarAutoridadUsuarioDepa(this.id_empleado_loggin).subscribe(
      (res) => {
        this.ArrayAutorizacionTipos = res;
        this.ArrayAutorizacionTipos.filter(x => {
          if(x.nombre == 'GERENCIA' && x.estado == true){
            this.gerencia = true;
            this.autorizaDirecto = false;
            this.InfoListaAutoriza = x;
            if(x.autorizar == true){
              this.estados = [
                { id: 3, nombre: 'Autorizado' },
                { id: 4, nombre: 'Negado' }
              ];
            }else if(x.preautorizar == true){
              this.estados = [
                { id: 2, nombre: 'Pre-autorizado' },
                { id: 4, nombre: 'Negado'}
              ];
            }
          }
          else if((this.gerencia == false) && (this.data.auto.id_departamento == x.id_departamento && x.estado == true)){
            this.autorizaDirecto = true;
            this.InfoListaAutoriza = x;
            if(x.autorizar == true){
              this.estados = [
                { id: 3, nombre: 'Autorizado' },
                { id: 4, nombre: 'Negado' }
              ];
            }else if(x.preautorizar == true){
              this.estados = [
                { id: 2, nombre: 'Pre-autorizado' },
                { id: 4, nombre: 'Negado'}
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
      }
    )

  }

  // METODO DE APROBACION DE SOLICITUD DE VACACIONES
  ActualizarEstadoAprobacion(form: any) {
    let aprobacion = {
      id_documento: this.data.auto.id_documento + localStorage.getItem('empleado') as string + '_' + form.estadoF + ',',
      estado: form.estadoF,
      user_name: this.user_name,
      ip: this.ip,
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
      this.EnviarNotificacion(vacacion, estado_v);
      this.ConfiguracionCorreoEmpleados(vacacion, estado_v, estado_c);
      this.toastr.success('', 'Proceso realizado exitosamente.', {
        timeOut: 6000,
      });
      this.ventana.close(true);
    });
  }


  listadoDepaAutoriza: any = [];
  id_departamento: any;
  // METODO PARA ENVIO DE NOTIFICACIONES DE VACACIONES
  ConfiguracionCorreoEmpleados(vacacion: any, estado_v: string, estado_c: string) {
    console.log('entro ha configuracion correo..')
    // METODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE VACACIÓN
    let desde = moment.weekdays(moment(vacacion.fec_inicio).day()).charAt(0).toUpperCase() + moment.weekdays(moment(vacacion.fec_inicio).day()).slice(1);
    let hasta = moment.weekdays(moment(vacacion.fec_final).day()).charAt(0).toUpperCase() + moment.weekdays(moment(vacacion.fec_final).day()).slice(1);
    this.listaEnvioCorreo = [];
    this.id_departamento = this.solInfo.id_dep;
    this.lectura = 1;
    this.restA.getUnaAutorizacionByVacacionRest(this.data.vacacion.id).subscribe(res1 => {
      this.autorizacion = res1;
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
                console.log('listaEnvioCorreo 1: ',this.listaEnvioCorreo );
                this.EnviarCorreo(this.listaEnvioCorreo, vacacion, estado_v, estado_c, desde, hasta);
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

                console.log('listaEnvioCorreo 2: ',this.listaEnvioCorreo );
                this.EnviarCorreo(this.listaEnvioCorreo, vacacion, estado_v, estado_c, desde, hasta);
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

            console.log('listaEnvioCorreo 3: ',this.listaEnvioCorreo );
            this.EnviarCorreo(this.listaEnvioCorreo, vacacion, estado_v, estado_c, desde, hasta);
          });
        }
      })
    });



  }

  EnviarCorreo(listaEnvioCorreo: any, vacacion: any, estado_v: string, estado_c: string, desde: any, hasta: any){
    var cont = 0;
    var correo_usuarios = '';
    vacacion.EmpleadosSendNotiEmail = listaEnvioCorreo;
    vacacion.EmpleadosSendNotiEmail.push(this.solInfo);
    console.log('nueva lista: ',vacacion.EmpleadosSendNotiEmail);

    vacacion.EmpleadosSendNotiEmail.forEach(e => {
      // LECTURA DE DATOS LEIDOS
      cont = cont + 1;

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
    vacaciones.EmpleadosSendNotiEmail.push(this.solInfo);
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
