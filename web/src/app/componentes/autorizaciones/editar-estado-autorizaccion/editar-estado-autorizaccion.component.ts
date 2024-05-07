import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { AutorizacionService } from "src/app/servicios/autorizacion/autorizacion.service";
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';
import { PermisosService } from 'src/app/servicios/permisos/permisos.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { AutorizaDepartamentoService } from 'src/app/servicios/autorizaDepartamento/autoriza-departamento.service';

interface Estado {
  id: number,
  nombre: string
}

@Component({
  selector: 'app-editar-estado-autorizaccion',
  templateUrl: './editar-estado-autorizaccion.component.html',
  styleUrls: ['./editar-estado-autorizaccion.component.css']
})

export class EditarEstadoAutorizaccionComponent implements OnInit {

  estados: Estado[] = [];
  estado = new FormControl('', Validators.required);

  public estadoAutorizacionesForm = new FormGroup({
    estadoF: this.estado
  });

  idEmpleadoIngresa: number;

  NotifiRes: any;
  FechaActual: any;

  public ArrayAutorizacionTipos: any = []
  public autorizacion: any []
  public lectura: any;
  public estado_auto: any;
  public empleado_estado: any = [];
  public listaEnvioCorreo: any = [];
  
  constructor(
    public restA: AutorizacionService,
    private restP: PermisosService,
    private toastr: ToastrService,
    private realTime: RealTimeService,
    public informacion: DatosGeneralesService,
    public ventana: MatDialogRef<EditarEstadoAutorizaccionComponent>,
    public validar: ValidacionesService,
    public parametro: ParametrosService,
    public restAutoriza: AutorizaDepartamentoService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.idEmpleadoIngresa = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
   
    if (this.data.permiso.estado === 1) {
      this.toastr.info('Solicitud pendiente de aprobación.', '', {
        timeOut: 6000,
      })
    } else {
      this.estadoAutorizacionesForm.patchValue({
        estadoF: ''
      });
    }

    this.obtenerInformacionEmpleado();
    this.ObtenerTiempo();
    this.BuscarParametro();
    this.BuscarHora();
  }

  ObtenerTiempo() {
    var f = moment();
    this.FechaActual = f.format('YYYY-MM-DD');
  }   

  /** ***************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                          ** **
  ** ****************************************************************************************** **/
  InfoListaAutoriza: any = [];
  formato_fecha: string = 'DD/MM/YYYY';
  formato_hora: string = 'HH:mm:ss';
  gerencia: boolean = false;
  // METODO PARA BUSCAR PARAMETRO DE FORMATO DE FECHA
  BuscarParametro() {
    // id_tipo_parametro Formato fecha = 25
    this.parametro.ListarDetalleParametros(25).subscribe(
      res => {
        this.formato_fecha = res[0].descripcion;
      });

    this.restAutoriza.BuscarAutoridadUsuarioDepa(this.idEmpleadoIngresa).subscribe(
      (res) => {
        this.ArrayAutorizacionTipos = res;
        this.ArrayAutorizacionTipos.filter(x => {
          if(x.nombre == 'GERENCIA' && x.estado == true){
            this.gerencia = true;
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

    
  }

  BuscarHora() {
    // id_tipo_parametro Formato hora = 26
    this.parametro.ListarDetalleParametros(26).subscribe(
      res => {
        this.formato_hora = res[0].descripcion;
      });
  }

  // METODO PARA OBTENER CONFIGURACION DE NOTIFICACIONES
  solInfo: any;
  obtenerInformacionEmpleado() {
    var estado: boolean;
    this.informacion.ObtenerInfoConfiguracion(this.data.permiso.id_empleado).subscribe(
      res => {
        if (res.estado === 1) {
          estado = true;
        }
        this.solInfo = [];
        this.solInfo = {
          permiso_mail: res.permiso_mail,
          permiso_noti: res.permiso_notificacion,
          id_empleado: res.id_empleado,
          id_departamento: res.id_departamento,
          id_suc: res.id_sucursal,
          estado: estado,
          correo: res.correo,
          fullname: res.fullname,
          id_contrato: res.id_contrato,
        }

        this.BusquedayFiltroDepartamentos();
      }
    )
  } 

  /** ************************************************************************************************************************************** **
    ** **  BUSQUEDA DE LISTA DE LOS DEPARTAMENTOS CONFIGURADOS PARA REALIZAR LA APROBACION Y FILTRADO PARA TENER SOLO LOS DEPARTAMENTOS  ** ** 
  ** *************************************************************************************************************************************** **/
  FilDepartamentosAprueban: any = [];
  BusquedayFiltroDepartamentos(){
    this.FilDepartamentosAprueban = [];
    this.listadoDepaAutoriza = [];
    this.restAutoriza.BuscarListaAutorizaDepa(this.solInfo.id_departamento).subscribe(res => {
      this.listadoDepaAutoriza = res;
      //Listado para eliminar un usuario cuando hay mas de uno en un departamento esto con el fin de contabilizar los departamentos
      var cont = 0;
      var filtroArray: any = [];
      this.listadoDepaAutoriza.forEach(function(elemento, indice, array) {
        cont = cont + 1;
        if(filtroArray.find(p=>p.id_departamento_nivel == elemento.id_departamento_nivel) == undefined)
        {
          filtroArray.push(elemento);
        }
      });
      this.FilDepartamentosAprueban = filtroArray;
    });
  }

  // METODO DE APROBACION DE SOLICITUD DE PERMISO
  ActualizarEstadoAprobacion(form: any) {
    let aprobacion = {
      id_documento: this.data.auto.id_autoriza_estado + localStorage.getItem('empleado') as string + '_' + form.estadoF + ',',
      estado: form.estadoF,
    }

    this.restA.ActualizarAprobacion(this.data.auto.id, aprobacion).subscribe(res => {
      this.EditarEstadoPermiso(this.data.auto.id_permiso, form.estadoF);
      this.NotificarAprobacion(form.estadoF);
    })
    
  }

  // METODO DE ACTUALIZACION DE ESTADO DE PERMISO
  resEstado: any = [];
  EditarEstadoPermiso(id_permiso: number, estado_permiso: any) {
    let datosPermiso = {
      estado: estado_permiso,
    }
    this.restP.ActualizarEstado(id_permiso, datosPermiso).subscribe(res => {
    });
  }

  // METODO DE ENVIO DE NOTIFICACIONES RESPECTO A LA APROBACION
  NotificarAprobacion(estado: number) {
    var datos = {
      depa_user_loggin: this.solInfo.id_departamento,
      objeto: this.data.permiso,
    }

    // CAPTURANDO ESTADO DE LA SOLICITUD DE PERMISO
    if (estado === 2) {
      var estado_p = 'Preautorizado';
      var estado_c = 'Preautorizada';
    }
    else if (estado === 3) {
      var estado_p = 'Autorizado';
      var estado_c = 'Autorizada';
    }
    else if (estado === 4) {
      var estado_p = 'Negado';
      var estado_c = 'Negada';
    }

    this.informacion.BuscarJefes(datos).subscribe(permiso => {
      //permiso.EmpleadosSendNotiEmail.push(this.solInfo);
      this.ConfiguracionCorreoyNotifi(permiso, estado_p, estado_c);
      this.toastr.success('', 'Proceso realizado exitosamente.', {
        timeOut: 6000,
      });
      this.ventana.close(true);
    });
  }

  /** ******************************************************************************************* **
   ** **                   METODO DE ENVIO DE NOTIFICACIONES DE PERMISOS                       ** **
   ** ******************************************************************************************* **/
  listadoDepaAutoriza: any = [];
  id_departamento: any;
  ConfiguracionCorreoyNotifi(permiso: any, estado_p: string, estado_c: string) {
    console.log('entro ha configuracion correo y Notificacion..')
    // METODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE PERMISO
    let solicitud = this.validar.FormatearFecha(permiso.fec_creacion, this.formato_fecha, this.validar.dia_completo);
    let desde = this.validar.FormatearFecha(permiso.fec_inicio, this.formato_fecha, this.validar.dia_completo);
    let hasta = this.validar.FormatearFecha(permiso.fec_final, this.formato_fecha, this.validar.dia_completo);
    
    this.listaEnvioCorreo = [];
    this.id_departamento = this.solInfo.id_departamento;
    this.lectura = 1;
    this.restA.BuscarAutorizacionPermiso(this.data.permiso.id).subscribe(res1 => {
      this.autorizacion = res1;
      // METODO PARA OBTENER EMPLEADOS Y ESTADOS
      var autorizaciones = this.autorizacion[0].id_autoriza_estado.split(',');
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

          this.empleado_estado = this.empleado_estado.concat(data);
          // CUANDO TODOS LOS DATOS SE HAYAN REVISADO EJECUTAR METODO DE INFORMACIÓN DE AUTORIZACIÓN
          if (this.lectura === autorizaciones.length) {
            if((estado_p === 'Preautorizado')){
              this.listadoDepaAutoriza.forEach(item => {
                console.log(item.nivel === autorizaciones.length,' || ',item.nivel, ' === ',(autorizaciones.length + 1))
                if((item.nivel === autorizaciones.length) && (item.nivel === this.FilDepartamentosAprueban.length)){
                  return this.listaEnvioCorreo.push(item);
                }else if((item.nivel === autorizaciones.length) || (item.nivel === (autorizaciones.length + 1))){
                  return this.listaEnvioCorreo.push(item);
                }
              });

              console.log('this.listaEnvioCorreo PRE: ',this.listaEnvioCorreo);
              this.EnviarNotificacion(permiso, this.listaEnvioCorreo, estado_p);
              this.EnviarCorreo(permiso, this.listaEnvioCorreo, estado_p, estado_c, solicitud, desde, hasta);
              
            }else if(estado_p === 'Autorizado' || estado_p === 'Negado'){
              if(estado_p === 'Autorizado'){
                this.listadoDepaAutoriza.forEach(item => {
                  if((item.nivel === this.InfoListaAutoriza.nivel) && (item.nivel === this.FilDepartamentosAprueban.length)){
                    return this.listaEnvioCorreo.push(item);
                  }else if((item.nivel === this.InfoListaAutoriza.nivel) || (item.nivel === autorizaciones.length + 1)){
                    return this.listaEnvioCorreo.push(item);
                  }
                });
              }else{
                //Esta condicion es para enviar el correo a todos los usuraios que autorizan siempre y cuando la solicitud fue negada antes
                this.listaEnvioCorreo = this.listadoDepaAutoriza;
              }
              
              console.log('this.listaEnvioCorreo AUTO - Nega: ',this.listaEnvioCorreo);
              this.EnviarNotificacion(permiso, this.listaEnvioCorreo, estado_p);
              this.EnviarCorreo(permiso, this.listaEnvioCorreo, estado_p, estado_c, solicitud, desde, hasta);
              
            }
          }
        }else if(autorizaciones.length < 2){
          if(estado_p === 'Negado'){
            //Esta condicion es para enviar el correo a todos los usuraios que autorizan siempre y cuando la solicitud fue negada antes
            this.listaEnvioCorreo = this.listadoDepaAutoriza;
          }else{
            this.listadoDepaAutoriza.filter(item => {
              if(item.nivel < 3 ){
                return this.listaEnvioCorreo.push(item);  
              }
            });
          }
          
          console.log('this.listaEnvioCorreo PEND: ',this.listaEnvioCorreo);
          this.EnviarNotificacion(permiso, this.listaEnvioCorreo, estado_p);
          this.EnviarCorreo(permiso, this.listaEnvioCorreo, estado_p, estado_c, solicitud, desde, hasta);
        }
      })
    });   

  }

  EnviarCorreo(permiso: any, listaEnvioCorreo: any, estado_p: string, estado_c: string, solicitud: any, desde: any, hasta: any){
    var cont = 0;
    var correo_usuarios = '';
    permiso.EmpleadosSendNotiEmail = listaEnvioCorreo;
    permiso.EmpleadosSendNotiEmail.push(this.solInfo);
    console.log('nueva lista C: ',permiso.EmpleadosSendNotiEmail);

    
    // VERIFICACIÓN QUE TODOS LOS DATOS HAYAN SIDO LEIDOS PARA ENVIAR CORREO
    permiso.EmpleadosSendNotiEmail.forEach(e => {

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

      if (cont === permiso.EmpleadosSendNotiEmail.length) {
        let datosPermisoCreado = {
          solicitud: solicitud,
          desde: desde,
          hasta: hasta,
          h_inicio: this.validar.FormatearHora(permiso.hora_salida, this.formato_hora),
          h_fin: this.validar.FormatearHora(permiso.hora_ingreso, this.formato_hora),
          id_empl_contrato: permiso.id_contrato,
          tipo_solicitud: 'Permiso ' + estado_p.toLowerCase() + ' por',
          horas_permiso: permiso.hora_numero,
          observacion: permiso.descripcion,
          tipo_permiso: permiso.nom_permiso,
          dias_permiso: permiso.dia,
          estado_p: estado_p,
          proceso: estado_p.toLowerCase(),
          id_dep: e.id_departamento,
          id_suc: e.id_suc,
          correo: correo_usuarios,
          asunto: 'SOLICITUD DE PERMISO ' + estado_c.toUpperCase(),
          id: permiso.id,
          solicitado_por: localStorage.getItem('fullname_print'),
        }

        if (correo_usuarios != '') {
          this.restP.EnviarCorreoWeb(datosPermisoCreado).subscribe(
            resp => {
              console.log('data entra enviar correo', resp)
              if (resp.message === 'ok') {
                this.toastr.success('Correo de solicitud enviado exitosamente.', '', {
                  timeOut: 6000,
                });
              }else {
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

  EnviarNotificacion(permiso: any, listaEnvioCorreo: any, estado_p: string) {
    permiso.EmpleadosSendNotiEmail = listaEnvioCorreo;
    console.log('nueva lista N: ',permiso.EmpleadosSendNotiEmail);

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
      id_receives_empl: '',
      id_receives_depa: '',
      id_vacaciones: null,
      id_hora_extra: null,
      id_send_empl: this.idEmpleadoIngresa,
      id_permiso: permiso.id,
      estado: estado_p,
      tipo: 2,
      mensaje: 'Ha ' + estado_p.toLowerCase() + ' la solicitud de permiso para ' +
        this.solInfo.fullname + ' desde ' +
        desde + ' ' + h_inicio + ' hasta ' +
        hasta + ' ' + h_fin,
    }

    //ForEach para enviar la notificacion a cada usuario dentro de la nueva lista filtrada
    permiso.EmpleadosSendNotiEmail.forEach(e => {
      notificacion.id_receives_depa = e.id_departamento;
      notificacion.id_receives_empl = e.id_empleado;
      if (e.permiso_notificacion) {
        this.realTime.IngresarNotificacionEmpleado(notificacion).subscribe(
          resp => {
            this.restP.EnviarNotificacionRealTime(resp.respuesta);
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
