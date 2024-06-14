import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { PlanComidasService } from 'src/app/servicios/planComidas/plan-comidas.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { use } from 'echarts';

@Component({
  selector: 'app-autoriza-solicitud',
  templateUrl: './autoriza-solicitud.component.html',
  styleUrls: ['./autoriza-solicitud.component.css']
})

export class AutorizaSolicitudComponent implements OnInit {

  // DATOS DEL EMPLEADO QUE INICIA SESION
  idEmpleadoIngresa: number;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    public parametro: ParametrosService,
    public restPlan: PlanComidasService,
    public validar: ValidacionesService,
    public ventana: MatDialogRef<AutorizaSolicitudComponent>,
    public aviso: RealTimeService,
    private informacion: DatosGeneralesService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.idEmpleadoIngresa = parseInt(localStorage.getItem('empleado') as string);
  }

  multiple: boolean = false;
  individual: boolean = false;
  boton_autorizar: boolean = true;
  boton_negar: boolean = true;

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

    this.obtenerInformacionEmpleado();
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
        this.MostrarDatos(fecha);
      },
      vacio => {
        this.MostrarDatos(fecha);
      });
  }

  MostrarDatos(formato_fecha: string) {
    if (this.data.carga === 'multiple') {
      this.multiple = true;
    }
    else {
      this.individual = true;
      var info = this.data.datosMultiple;
      info.fecha_comida_ = this.validar.FormatearFecha(info.fec_comida, formato_fecha, this.validar.dia_completo);
      info.hora_inicio_ = this.validar.FormatearHora(info.hora_inicio, this.formato_hora);
      info.hora_fin_ = this.validar.FormatearHora(info.hora_fin, this.formato_hora);

      if (info.aprobada === 'AUTORIZADO') {
        this.boton_autorizar = false;
        this.boton_negar = true;
      }
      else if (info.aprobada === 'NEGADO') {
        this.boton_autorizar = true;
        this.boton_negar = false;
      }
      else {
        this.boton_autorizar = true;
        this.boton_negar = true;
      }
    }
  }

  // METODO PARA OBTENER CONFIGURACION DE NOTIFICACIONES
  solInfo: any;
  obtenerInformacionEmpleado() {
    var estado: boolean;
    this.informacion.ObtenerInfoConfiguracion(this.data.datosMultiple.id_empleado).subscribe(
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
      })
  }

  ActualizarEstado(estado: boolean) {
    var datos = this.data.datosMultiple;
    let datosEstado = {
      verificar: 'Si',
      aprobada: estado,
      id: datos.id,
      user_name: this.user_name,
      ip: this.ip,
    }
    this.restPlan.AprobarComida(datosEstado).subscribe(alimentacion => {
      if (estado === true) {
        this.AprobarComida(alimentacion, estado);
      } else {
        if (this.data.datosMultiple.aprobada === null) {
          this.AprobarComida(alimentacion, estado);
        }
        else {
          this.restPlan.EliminarComidaAprobada(datos.id, datos.fec_comida.split('T')[0], datos.id_empleado, datos)
            .subscribe(res => {
              this.AprobarComida(alimentacion, estado);
            })
        }
      }
    })
  }

  // METODO DE APROBACIÓN DE SOLICITUDES DE ALIMENTACIÓN
  AprobarComida(alimentacion: any, estado: boolean) {
    let datosPlanEmpleado = {
      id_sol_comida: this.data.datosMultiple.id,
      id_empleado: this.data.datosMultiple.id_empleado,
      hora_inicio: this.data.datosMultiple.hora_inicio,
      consumido: false,
      hora_fin: this.data.datosMultiple.hora_fin,
      codigo: this.data.datosMultiple.codigo,
      fecha: this.data.datosMultiple.fec_comida,
      user_name: this.user_name,
      ip: this.ip,
    }
    this.restPlan.CrearComidaAprobada(datosPlanEmpleado).subscribe(res => {
      this.NotificarAprobacion(estado, alimentacion);
    });
  }

  ActualizarEstadoMultiple(estado: boolean) {
    var nombre_estado = '';
    var contador = 0;
    var contador_plan = 0;
    this.data.datosMultiple.map((obj: any) => {
      let datosEstado = {
        aprobada: estado,
        verificar: 'Si',
        id: obj.id,
        user_name: this.user_name,
        ip: this.ip,
      }
      this.restPlan.AprobarComida(datosEstado).subscribe(alimentacion => {
        contador = contador + 1;
        if (estado === true) {
          nombre_estado = 'APROBADO';
          let datosPlanEmpleado = {
            codigo: obj.codigo,
            id_empleado: obj.id_empleado,
            id_sol_comida: obj.id,
            fecha: obj.fecha,
            hora_inicio: obj.hora_inicio,
            hora_fin: obj.hora_fin,
            consumido: false,
            user_name: this.user_name,
            ip: this.ip,
          }
          this.restPlan.CrearComidaAprobada(datosPlanEmpleado).subscribe(res => {
            contador_plan = contador_plan + 1;
            // this.EnviarNotificaciones(obj.fecha, obj.hora_inicio, obj.hora_fin, this.idEmpleadoLogueado, obj.id_empleado, nombre_estado);
            if (contador_plan === this.data.datosMultiple.length) {
              this.toastr.success('Operación exitosa.', 'Se notifica que ' + this.data.datosMultiple.length + ' Servicios de Alimentación han sido APROBADOS.', {
                timeOut: 6000,
              })
              this.Cerrar();
            }

          });
        } else {
          nombre_estado = 'NEGADO';
          //this.EnviarNotificaciones(obj.fecha, obj.hora_inicio, obj.hora_fin, this.idEmpleadoLogueado, obj.id_empleado, nombre_estado);
          if (contador === this.data.datosMultiple.length) {
            this.toastr.success('Operación exitosa.', 'Se notifica que ' + this.data.datosMultiple.length + ' Servicios de Alimentación han sido NEGADOS.', {
              timeOut: 6000,
            })
            this.Cerrar();
          }
        }
      })
    })
  }


  // METODO DE ENVIO DE NOTIFICACIONES RESPECTO A LA APROBACION
  NotificarAprobacion(estado: boolean, datos_a: any) {
    var datos = {
      depa_user_loggin: this.solInfo.id_dep,
      objeto: datos_a,
    }

    // CAPTURANDO ESTADO DE LA SOLICITUD DE PERMISO
    if (estado === true) {
      var estado_a = 'Autorizado';
      var estado_c = 'Autorizada';
    }
    else {
      var estado_a = 'Negado';
      var estado_c = 'Negada';
    }
    this.informacion.BuscarJefes(datos).subscribe(alimentacion => {
      console.log(alimentacion);
      alimentacion.EmpleadosSendNotiEmail.push(this.solInfo);
      this.EnviarCorreo(alimentacion, estado_a, estado_c);
      this.NotificarEvento(alimentacion, estado_a);
      this.toastr.success('', 'Proceso realizado exitosamente.', {
        timeOut: 6000,
      });
      this.Cerrar();
    });
  }

  // METODO PARA ENVIO DE CORREO
  EnviarCorreo(alimentacion: any, estado_a: string, estado_c: string) {
    var cont = 0;
    var correo_usuarios = '';

    // METODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE ALIMENTACIÓN
    let solicitud = this.validar.FormatearFecha(alimentacion.fec_comida, this.formato_fecha, this.validar.dia_completo);

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
          tipo_solicitud: 'Servicio de alimentación ' + estado_a.toLowerCase() + ' por',
          fec_solicitud: solicitud,
          observacion: alimentacion.observacion,
          id_comida: alimentacion.id_comida,
          proceso: estado_a.toLowerCase(),
          estadoc: estado_a,
          correo: correo_usuarios,
          asunto: 'SOLICITUD DE SERVICIO DE ALIMENTACION ' + estado_c.toUpperCase(),
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
  NotificarEvento(alimentacion: any, estado_a: string) {

    // METODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE ALIMENTACIÓN
    let desde = this.validar.FormatearFecha(alimentacion.fec_comida, this.formato_fecha, this.validar.dia_completo);

    let inicio = this.validar.FormatearHora(alimentacion.hora_inicio, this.formato_hora);
    let final = this.validar.FormatearHora(alimentacion.hora_fin, this.formato_hora);

    let mensaje = {
      id_empl_envia: this.idEmpleadoIngresa,
      id_empl_recive: '',
      tipo: 2, // SOLICITUD SERVICIO DE ALIMENTACIÓN REVISADAS
      mensaje: 'Ha ' + estado_a.toLowerCase() + ' la solicitud de alimentación para ' +
        this.solInfo.fullname + ' desde ' +
        desde +
        ' horario de ' + inicio + ' a ' + final + ' servicio ',
      id_comida: alimentacion.id_comida,
      user_name: this.user_name,
      ip: this.ip,
    }

    //Listado para eliminar el usuario duplicado
    var allNotificaciones: any = [];
    //Ciclo por cada elemento del catalogo
    alimentacion.EmpleadosSendNotiEmail.forEach(function(elemento, indice, array) {
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
      if (e.comida_noti) {
        this.restPlan.EnviarMensajePlanComida(mensaje).subscribe(res => {
          this.aviso.RecibirNuevosAvisos(res.respuesta);
          console.log(res.message);
        })
      }
    })

  }

  Cerrar() {
    this.ventana.close();
  }

}
