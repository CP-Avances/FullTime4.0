import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { PermisosService } from 'src/app/servicios/permisos/permisos.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { TipoPermisosService } from 'src/app/servicios/catalogos/catTipoPermisos/tipo-permisos.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';

@Component({
  selector: 'app-cancelar-permiso',
  templateUrl: './cancelar-permiso.component.html',
  styleUrls: ['./cancelar-permiso.component.css']
})

export class CancelarPermisoComponent implements OnInit {

  idEmpleadoIngresa: number;
  nota = 'su solicitud';
  user = '';

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    private restP: PermisosService,
    private toastr: ToastrService,
    private realTime: RealTimeService,
    private restTipoP: TipoPermisosService,
    public ventana: MatDialogRef<CancelarPermisoComponent>,
    public validar: ValidacionesService,
    public parametro: ParametrosService,
    public informacion: DatosGeneralesService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.idEmpleadoIngresa = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

    this.ObtenerInformacionEmpleado();
    this.ObtenerTiposPermiso();
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

  // METODO PARA MOSTRAR LISTA DE PERMISOS DE ACUERDO AL ROL
  tipoPermisos: any = [];
  ObtenerTiposPermiso() {
    this.tipoPermisos = [];
    this.restTipoP.BuscarTipoPermiso().subscribe(datos => {
      this.tipoPermisos = datos;
    });
  }

  // METODO PARA OBTENER CONFIGURACION DE NOTIFICACIONES
  solInfo: any;
  ObtenerInformacionEmpleado() {
    var estado: boolean;
    this.informacion.ObtenerInfoConfiguracion(this.data.id_empleado).subscribe(
      res => {
        if (res.estado === 1) {
          estado = true;
        }
        this.solInfo = [];
        this.solInfo = {
          permiso_mail: res.permiso_mail,
          permiso_noti: res.permiso_notificacion,
          empleado: res.id_empleado,
          id_dep: res.id_departamento,
          id_suc: res.id_sucursal,
          estado: estado,
          correo: res.correo,
          fullname: res.fullname,
          id_contrato: res.id_contrato,
        }

        if (this.data.id_empleado != this.idEmpleadoIngresa) {
          this.nota = 'la solicitud';
          this.user = 'para ' + this.solInfo.fullname;
        }
      })
  }

  AceptarAdvertencia() {
    let correo = 0;

    const datos = {
      id_permiso: this.data.info.id,
      doc: this.data.info.documento,
      codigo: this.data.info.codigo,
      user_name: this.user_name,
      ip: this.ip,
    }

    this.restP.EliminarPermiso(datos).subscribe((res: any) => {

      // VALIDAR ENVIO DE CORREO SEGUN CONFIGURACION
      this.tipoPermisos.filter((o: any) => {
        if (o.id === res.id_tipo_permiso) {
          if (o.correo_eliminar === true) {
            correo = 1;
          }
          else {
            correo = 2;
          }
        }
      })

      // SI CUMPLE LA CONDICION 1 ENVIA CORREO
      if (correo === 1) {
        var datos = {
          depa_user_loggin: parseInt(this.solInfo.id_dep),
          objeto: res,
        }
        this.informacion.BuscarJefes(datos).subscribe({
          next: (permiso: any) => {
            console.log(permiso);
            permiso.EmpleadosSendNotiEmail.push(this.solInfo);
            this.EnviarCorreo(permiso);
            this.EnviarNotificacion(permiso);
            this.toastr.error('Solicitud de permiso eliminada.', '', {
              timeOut: 6000,
            });
            this.ventana.close(true);
          },
          error: (err) => {
            if (err.status === 400) {
              this.toastr.warning(err.error.message, 'Solicitud de permiso eliminada.', {
                timeOut: 6000,
              });
              this.ventana.close(true);
            }
          }
        });
      }
      // SI NO CUMPLE LA CONDICION 2 NO SE ENVIA CORREOS
      else {
        this.toastr.error('Solicitud de permiso eliminada.', '', {
          timeOut: 6000,
        });
        this.ventana.close(true);
      }
    });
  }

  /** ******************************************************************************************* **
   ** **                   METODO DE ENVIO DE NOTIFICACIONES DE PERMISOS                       ** **
   ** ******************************************************************************************* **/

  EnviarCorreo(permiso: any) {

    console.log('entra correo')
    var cont = 0;
    var correo_usuarios = '';

    // METODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE PERMISO
    let solicitud = this.validar.FormatearFecha(permiso.fec_creacion, this.formato_fecha, this.validar.dia_completo);
    let desde = this.validar.FormatearFecha(permiso.fec_inicio, this.formato_fecha, this.validar.dia_completo);
    let hasta = this.validar.FormatearFecha(permiso.fec_final, this.formato_fecha, this.validar.dia_completo);

    // CAPTURANDO ESTADO DE LA SOLICITUD DE PERMISO
    if (permiso.estado === 1) {
      var estado_p = 'Pendiente de autorización';
    }

    // LEYENDO DATOS DE TIPO DE PERMISO
    var tipo_permiso = '';
    this.tipoPermisos.filter((o: any) => {
      if (o.id === permiso.id_tipo_permiso) {
        tipo_permiso = o.descripcion
      }
      return tipo_permiso;
    })

    // VERIFICACIÓN QUE TODOS LOS DATOS HAYAN SIDO LEIDOS PARA ENVIAR CORREO
    permiso.EmpleadosSendNotiEmail.forEach(e => {

      console.log('for each', e)

      // LECTURA DE DATOS LEIDOS
      cont = cont + 1;

      // SI EL USUARIO SE ENCUENTRA ACTIVO Y TIENEN CONFIGURACIÓN RECIBIRA CORREO DE SOLICITUD DE VACACIÓN
      if (e.permiso_mail) {
        if (e.estado === true) {
          if (correo_usuarios === '') {
            correo_usuarios = e.correo;
          }
          else {
            correo_usuarios = correo_usuarios + ', ' + e.correo
          }
        }
      }

      console.log('contadores', permiso.EmpleadosSendNotiEmail.length + ' cont ' + cont)

      if (cont === permiso.EmpleadosSendNotiEmail.length) {

        console.log('data entra correo usuarios', correo_usuarios)

        let datosPermisoCreado = {
          solicitud: solicitud,
          desde: desde,
          hasta: hasta,
          h_inicio: this.validar.FormatearHora(permiso.hora_salida, this.formato_hora),
          h_fin: this.validar.FormatearHora(permiso.hora_ingreso, this.formato_hora),
          id_empl_contrato: permiso.id_empl_contrato,
          tipo_solicitud: 'Permiso eliminado por',
          horas_permiso: permiso.hora_numero,
          observacion: permiso.descripcion,
          tipo_permiso: tipo_permiso,
          dias_permiso: permiso.dia,
          estado_p: estado_p,
          proceso: 'eliminado',
          id_dep: e.id_dep,
          id_suc: e.id_suc,
          correo: correo_usuarios,
          asunto: 'ELIMINACION DE SOLICITUD DE PERMISO',
          id: permiso.id,
          solicitado_por: localStorage.getItem('fullname_print'),
        }
        if (correo_usuarios != '') {
          console.log('data entra enviar correo')

          this.restP.EnviarCorreoWeb(datosPermisoCreado).subscribe(
            resp => {
              console.log('data entra enviar correo', resp)
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
            }, err => {
              this.toastr.error(err.error.message, '', {
                timeOut: 6000,
              });
            }
          )
        }
      }
    })
  }

  EnviarNotificacion(permiso: any) {

    // METODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE PERMISO
    let desde = this.validar.FormatearFecha(permiso.fec_inicio, this.formato_fecha, this.validar.dia_completo);
    let hasta = this.validar.FormatearFecha(permiso.fec_final, this.formato_fecha, this.validar.dia_completo);

    let h_inicio = this.validar.FormatearHora(permiso.hora_salida, this.formato_hora);
    let h_fin = this.validar.FormatearHora(permiso.hora_ingreso, this.formato_hora);

    if (h_inicio === '00:00') {
      h_inicio = '';
    }

    if (h_fin === '00:00') {
      h_fin = '';
    }

    let notificacion = {
      id_send_empl: this.idEmpleadoIngresa,
      id_receives_empl: '',
      id_receives_depa: '',
      estado: 'Pendiente',
      id_permiso: permiso.id,
      id_vacaciones: null,
      id_hora_extra: null,
      tipo: 3,
      mensaje: 'Ha eliminado ' + this.nota + ' de permiso ' + this.user + ' desde ' +
        desde + ' ' + h_inicio + ' hasta ' +
        hasta + ' ' + h_fin,
      user_name: this.user_name,
      ip: this.ip,
    }

    //Listado para eliminar el usuario duplicado
    var allNotificaciones: any = [];
    //Ciclo por cada elemento del catalogo
    permiso.EmpleadosSendNotiEmail.forEach(function (elemento, indice, array) {
      // Discriminación de elementos iguales
      if (allNotificaciones.find(p => p.fullname == elemento.fullname) == undefined) {
        // Nueva lista de empleados que reciben la notificacion
        allNotificaciones.push(elemento);
      }
    });

    //ForEach para enviar la notificacion a cada usuario dentro de la nueva lista filtrada
    allNotificaciones.forEach(e => {
      notificacion.id_receives_depa = e.id_dep;
      notificacion.id_receives_empl = e.empleado;
      if (e.permiso_noti) {
        this.realTime.IngresarNotificacionEmpleado(notificacion).subscribe(
          resp => {
            this.restP.EnviarNotificacionRealTime(resp.respuesta);
          }, err => {
            this.toastr.error(err.error.message, '', {
              timeOut: 6000,
            });
          }
        )
      }
    })
  }

}
