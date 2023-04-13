import { MomentDateAdapter, MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { PedHoraExtraService } from 'src/app/servicios/horaExtra/ped-hora-extra.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';

interface Estado {
  id: number,
  nombre: string
}

@Component({
  selector: 'app-editar-hora-extra-empleado',
  templateUrl: './editar-hora-extra-empleado.component.html',
  styleUrls: ['./editar-hora-extra-empleado.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
  ]
})

export class EditarHoraExtraEmpleadoComponent implements OnInit {

  estados: Estado[] = [
    { id: 1, nombre: 'Pendiente' },
    { id: 2, nombre: 'Pre-autorizado' },
    { id: 3, nombre: 'Autorizado' },
    { id: 4, nombre: 'Negado' },
  ];

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  descripcionF = new FormControl('', [Validators.required]);
  fechaInicioF = new FormControl('', [Validators.required]);
  horaInicioF = new FormControl('');
  FechaFinF = new FormControl('', [Validators.required]);
  horaFinF = new FormControl('', [Validators.required]);
  estadoF = new FormControl(0, [Validators.required]);
  horasF = new FormControl('', [Validators.required]);

  archivoForm = new FormControl('');
  respaldoF = new FormControl('');
  seleccion = new FormControl('');

  public PedirHoraExtraForm = new FormGroup({
    descripcionForm: this.descripcionF,
    fechaInicioForm: this.fechaInicioF,
    horaInicioForm: this.horaInicioF,
    FechaFinForm: this.FechaFinF,
    respaldoForm: this.respaldoF,
    horaFinForm: this.horaFinF,
    estadoForm: this.estadoF,
    horasForm: this.horasF,
  });

  id_user_loggin: number;
  id_cargo_loggin: number;
  id_contrato_loggin: number;

  constructor(
    private informacion: DatosGeneralesService,
    private realTime: RealTimeService,
    private restHE: PedHoraExtraService,
    private toastr: ToastrService,
    public ventana: MatDialogRef<EditarHoraExtraEmpleadoComponent>,
    public validar: ValidacionesService,
    public parametro: ParametrosService,
    @Inject(MAT_DIALOG_DATA) public datos: any
  ) {
    // VARIABLES DEL EMPLEADO QUE SOLICITA
    this.id_user_loggin = parseInt(localStorage.getItem("empleado") as string);
    this.id_cargo_loggin = parseInt(localStorage.getItem("ultimoCargo") as string);
    this.id_contrato_loggin = parseInt(localStorage.getItem("ultimoContrato") as string);
  }

  ngOnInit(): void {
    console.log(this.datos);

    this.estados.forEach(obj => {
      if (this.datos.estado === obj.nombre) {
        this.PedirHoraExtraForm.patchValue({ estadoForm: obj.id });
      }
    });
    this.PedirHoraExtraForm.patchValue({
      descripcionForm: this.datos.descripcion,
      fechaInicioForm: this.datos.fec_inicio,
      horaInicioForm: moment(this.datos.fec_inicio).format('HH:mm'),
      FechaFinForm: this.datos.fec_final,
      horaFinForm: moment(this.datos.fec_final).format('HH:mm'),
      horasForm: this.datos.num_hora.split(":")[0] + ":" + this.datos.num_hora.split(":")[1],
    });

    this.obtenerInformacionEmpleado();

    this.BuscarHora();
    this.BuscarParametro();
  }

  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** ** 
   ** **************************************************************************************** **/

  formato_fecha: string = 'DD/MM/YYYY';
  formato_hora: string = 'HH:mm:ss';

  // METODO PARA BUSCAR PARÁMETRO DE FORMATO DE FECHA
  BuscarParametro() {
    // id_tipo_parametro Formato fecha = 25
    this.parametro.ListarDetalleParametros(25).subscribe(
      res => {
        this.formato_fecha = res[0].descripcion;
      });
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
    this.informacion.ObtenerInfoConfiguracion(this.id_user_loggin).subscribe(
      res => {
        if (res.estado === 1) {
          estado = true;
        }
        this.solInfo = [];
        this.solInfo = {
          hora_extra_mail: res.hora_extra_mail,
          hora_extra_noti: res.hora_extra_noti,
          empleado: res.id_empleado,
          id_dep: res.id_departamento,
          id_suc: res.id_sucursal,
          estado: estado,
          correo: res.correo,
          fullname: res.fullname,
        }
      })
  }

  InsertarHoraExtra(form: any) {
    let data: any = {
      depa_user_loggin: localStorage.getItem('departamento'),
      tipo_funcion: 0,
      descripcion: form.descripcionForm,
      fec_inicio: null,
      fec_final: null,
      num_hora: form.horasForm + ":00",
      estado: form.estadoForm,
    }

    data.fec_inicio = this.ValidarFechas(form.fechaInicioForm, form.horaInicioForm);
    data.fec_final = this.ValidarFechas(form.FechaFinForm, form.horaFinForm);
    this.VerificarArchivo(data, form);
  }

  ValidarFechas(fecha, hora) {
    if (hora.split(":").length < 3) {
      hora = hora + ":00";
    }

    if (fecha._i != undefined) {
      fecha._i.month = fecha._i.month + 1;
      if (fecha._i.month < 10 && fecha._i.date < 10) {
        return fecha._i.year + "-0" + fecha._i.month + "-0" + fecha._i.date + "T" + hora + ".000Z"
      } else if (fecha._i.month >= 10 && fecha._i.date >= 10) {
        return fecha._i.year + "-" + fecha._i.month + "-" + fecha._i.date + "T" + hora + ".000Z"
      } else if (fecha._i.month < 10 && fecha._i.date >= 10) {
        return fecha._i.year + "-0" + fecha._i.month + "-" + fecha._i.date + "T" + hora + ".000Z"
      } else if (fecha._i.month >= 10 && fecha._i.date < 10) {
        return fecha._i.year + "-" + fecha._i.month + "-0" + fecha._i.date + "T" + hora + ".000Z"
      }
    } else {
      return fecha.split("T")[0] + "T" + hora + '.000Z'
    }

  }


  CalcularTiempo(form) {
    this.PedirHoraExtraForm.patchValue({ horasForm: '' })
    if (form.horaInicioForm != '' && form.horaFinForm != '') {
      console.log('revisando horas', form.horaInicioForm, form.horaFinForm)
      var hora1 = (String(form.horaInicioForm) + ':00').split(":"),
        hora2 = (String(form.horaFinForm) + ':00').split(":"),
        t1 = new Date(),
        t2 = new Date();
      t1.setHours(parseInt(hora1[0]), parseInt(hora1[1]), parseInt(hora1[2]));
      t2.setHours(parseInt(hora2[0]), parseInt(hora2[1]), parseInt(hora2[2]));
      //Aquí hago la resta
      t1.setHours(t2.getHours() - t1.getHours(), t2.getMinutes() - t1.getMinutes(), t2.getSeconds() - t1.getSeconds());
      if (t1.getHours() < 10 && t1.getMinutes() < 10) {
        var tiempoTotal: string = '0' + t1.getHours() + ':' + '0' + t1.getMinutes();
        this.PedirHoraExtraForm.patchValue({ horasForm: tiempoTotal })
      }
      else if (t1.getHours() < 10) {
        var tiempoTotal: string = '0' + t1.getHours() + ':' + t1.getMinutes();
        this.PedirHoraExtraForm.patchValue({ horasForm: tiempoTotal })
      }
      else if (t1.getMinutes() < 10) {
        var tiempoTotal: string = t1.getHours() + ':' + '0' + t1.getMinutes();
        this.PedirHoraExtraForm.patchValue({ horasForm: tiempoTotal })
      }
    }
    else {
      this.toastr.info('Debe ingresar la hora de inicio y la hora de fin de actividades.', 'VERIFICAR', {
        timeOut: 6000,
      })
    }
  }

  /** ******************************************************************************************* **
   ** **                   METODO DE ENVIO DE NOTIFICACIONES DE HORAS EXTRAS                      ** **
   ** ******************************************************************************************* **/

  // METODO PARA ENVIAR NOTIFICACIONES DE CORREO
  EnviarCorreo(horaExtra: any) {

    console.log('ver horas extras ....   ', horaExtra)

    var cont = 0;
    var correo_usuarios = '';

    // METODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE HORA EXTRA
    let solicitud = this.validar.FormatearFecha(horaExtra.fec_solicita, this.formato_fecha, this.validar.dia_completo);
    let desde = this.validar.FormatearFecha(moment(horaExtra.fec_inicio).format('YYYY-MM-DD'), this.formato_fecha, this.validar.dia_completo);
    let hasta = this.validar.FormatearFecha(moment(horaExtra.fec_final).format('YYYY-MM-DD'), this.formato_fecha, this.validar.dia_completo);

    // CAPTURANDO ESTADO DE LA SOLICITUD DE HORA EXTRA
    if (horaExtra.estado === 1) {
      var estado_h = 'Pendiente de autorización';
    }
    else if (horaExtra.estado === 1) {
      var estado_h = 'Preautorizada';
    }
    else if (horaExtra.estado === 1) {
      var estado_h = 'Autorizada';
    }
    else if (horaExtra.estado === 1) {
      var estado_h = 'Negada';
    }

    horaExtra.EmpleadosSendNotiEmail.forEach(e => {

      // LECTURA DE DATOS LEIDOS
      cont = cont + 1;

      if (e.hora_extra_mail) {
        if (e.estado === true) {
          if (correo_usuarios === '') {
            correo_usuarios = e.correo;
          }
          else {
            correo_usuarios = correo_usuarios + ', ' + e.correo
          }
        }
      }

      if (cont === horaExtra.EmpleadosSendNotiEmail.length) {

        let datosHoraExtraCreada = {
          tipo_solicitud: 'Realización de Horas Extras solicitadas por',
          solicitud: solicitud,
          desde: desde,
          hasta: hasta,
          h_inicio: this.validar.FormatearHora(moment(horaExtra.fec_inicio).format('HH:mm:ss'), this.formato_hora),
          h_final: this.validar.FormatearHora(moment(horaExtra.fec_final).format('HH:mm:ss'), this.formato_hora),
          num_horas: moment(horaExtra.num_hora, 'HH:mm').format('HH:mm'),
          observacion: horaExtra.descripcion,
          estado_h: estado_h,
          proceso: 'actualizado',
          asunto: 'ACTUALIZACION DE SOLICITUD DE REALIZACION DE HORAS EXTRAS',
          id_dep: e.id_dep,
          id_suc: e.id_suc,
          correo: correo_usuarios,
          id: horaExtra.id,
          id_empl_contrato: this.id_contrato_loggin,
          solicitado_por: localStorage.getItem('fullname_print')
        }
        console.log('ver horas extras ....   ', datosHoraExtraCreada)
        if (correo_usuarios != '') {
          this.restHE.EnviarCorreo(datosHoraExtraCreada).subscribe(
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

  // METODO PARA ENVIAR NOTIIFICACIONES AL SISTEMA
  EnviarNotificacion(horaExtra: any) {

    // METODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE HORA EXTRA
    let desde = this.validar.FormatearFecha(moment(horaExtra.fec_inicio).format('YYYY-MM-DD'), this.formato_fecha, this.validar.dia_completo);
    let hasta = this.validar.FormatearFecha(moment(horaExtra.fec_final).format('YYYY-MM-DD'), this.formato_fecha, this.validar.dia_completo);

    let h_inicio = this.validar.FormatearHora(moment(horaExtra.fec_inicio).format('HH:mm:ss'), this.formato_hora)
    let h_final = this.validar.FormatearHora(moment(horaExtra.fec_final).format('HH:mm:ss'), this.formato_hora);

    let notificacion = {
      id_send_empl: this.id_user_loggin,
      id_receives_empl: '',
      id_receives_depa: '',
      estado: 'Pendiente',
      id_permiso: null,
      id_vacaciones: null,
      id_hora_extra: horaExtra.id,
      tipo: 1,
      mensaje: 'Ha actualizado su solicitud de horas extras desde ' +
        desde + ' hasta ' +
        hasta + ' horario de ' + h_inicio + ' a ' + h_final,
    }

    //Listado para eliminar el usuario duplicado
    var allNotificaciones: any = [];
    //Ciclo por cada elemento del catalogo
    horaExtra.EmpleadosSendNotiEmail.forEach(function(elemento, indice, array) {
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
      if (e.hora_extra_noti) {
        this.realTime.IngresarNotificacionEmpleado(notificacion).subscribe(
          resp => {
            this.restHE.EnviarNotificacionRealTime(resp.respuesta);
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

  IngresarSoloLetras(e) {
    let key = e.keyCode || e.which;
    let tecla = String.fromCharCode(key).toString();
    // SE DEFINE TODO EL ABECEDARIO QUE SE VA A USAR.
    let letras = " áéíóúabcdefghijklmnñopqrstuvwxyzÁÉÍÓÚABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    // ES LA VALIDACIÓN DEL KEYCODES, QUE TECLAS RECIBE EL CAMPO DE TEXTO.
    let especiales = [8, 37, 39, 46, 6, 13];
    let tecla_especial = false
    for (var i in especiales) {
      if (key == especiales[i]) {
        tecla_especial = true;
        break;
      }
    }
    if (letras.indexOf(tecla) == -1 && !tecla_especial) {
      this.toastr.info('No se admite datos numéricos', 'Usar solo letras', {
        timeOut: 6000,
      })
      return false;
    }
  }

  IngresarSoloNumeros(evt) {
    if (window.event) {
      var keynum = evt.keyCode;
    }
    else {
      keynum = evt.which;
    }
    // COMPROBAMOS SI SE ENCUENTRA EN EL RANGO NUMÉRICO Y QUE TECLAS NO RECIBIRÁ.
    if ((keynum > 47 && keynum < 58) || keynum == 8 || keynum == 13 || keynum == 6) {
      return true;
    }
    else {
      this.toastr.info('No se admite el ingreso de letras', 'Usar solo números', {
        timeOut: 6000,
      })
      return false;
    }
  }

  LimpiarCampoHoras() {
    this.PedirHoraExtraForm.patchValue({ horasForm: '' })
  }

  /** ********************************************************************************** **
   ** **                       SUBIR ARCHIVO DE SOLICITUD DE PERMISO                  ** **
   ** ********************************************************************************** **/

  nameFile: string;
  archivoSubido: Array<File>;

  fileChange(element) {
    this.archivoSubido = element.target.files;
    if (this.archivoSubido.length != 0) {
      const name = this.archivoSubido[0].name;
      console.log(this.archivoSubido[0].name);
      this.PedirHoraExtraForm.patchValue({ respaldoForm: name });
      this.HabilitarBtn = true;
    }
  }

  SubirRespaldo(form: any) {
    var id = parseInt(this.datos.id);
    let formData = new FormData();
    console.log("tamaño", this.archivoSubido[0].size);
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads[]", this.archivoSubido[i], this.archivoSubido[i].name);
    }
    this.restHE.SubirArchivoRespaldo(formData, id, form.respaldoForm).subscribe(res => {
      this.archivoForm.reset();
      this.nameFile = '';
    });
  }

  LimpiarNombreArchivo() {
    this.PedirHoraExtraForm.patchValue({
      respaldoForm: '',
    });
  }

  // METODO PARA QUITAR ARCHIVO SELECCIONADO
  HabilitarBtn: boolean = false;
  RetirarArchivo() {
    this.archivoSubido = [];
    this.HabilitarBtn = false;
    this.LimpiarNombreArchivo();
    this.archivoForm.patchValue('');
  }

  activar: boolean = false;
  opcion: number = 0;
  ActivarArchivo() {
    this.acciones = true;
    this.activar = true;
    this.opcion = 2;
  }

  QuitarArchivo() {
    this.acciones = true;
    this.activar = false;
    this.opcion = 1;
    this.RetirarArchivo();
  }

  acciones: boolean = false;
  LimpiarAcciones() {
    this.seleccion.reset();
    this.acciones = false;
    this.activar = false;
    this.RetirarArchivo();
    this.opcion = 0;
  }

  VerificarArchivo(datos: any, form: any) {
    console.log('prueba ... ', this.opcion);
    if (this.opcion === 1) {
      let eliminar = {
        documento: this.datos.documento,
        id: parseInt(this.datos.id)
      }
      this.GuardarDatos(datos);
      this.restHE.EliminarArchivoRespaldo(eliminar).subscribe(res => {
        this.archivoForm.reset();
        this.nameFile = '';
      });
      this.ventana.close(true);
    }
    else if (this.opcion === 2) {
      if (form.respaldoForm != '' && form.respaldoForm != null) {
        if (this.archivoSubido[0].size <= 2e+6) {
          this.EliminarServidor();
          this.GuardarDatos(datos);
          this.SubirRespaldo(form);
          this.ventana.close(true);
        }
        else {
          this.toastr.info('El archivo ha excedido el tamaño permitido.', 'Tamaño de archivos permitido máximo 2MB.', {
            timeOut: 6000,
          });
        }
      }
      else {
        this.toastr.info('No ha seleccionado ningún archivo.', '', {
          timeOut: 6000,
        });
      }
    }
    else {
      this.GuardarDatos(datos);
      this.ventana.close(true);
    }
  }

  GuardarDatos(datos: any) {
    this.restHE.EditarHoraExtra(parseInt(this.datos.id), datos).subscribe(horaExtra => {
      console.log('ver horaE ---- ', horaExtra)
      this.toastr.success('Operación Exitosa', 'Hora extra solicitada', {
        timeOut: 6000,
      });
      horaExtra.EmpleadosSendNotiEmail.push(this.solInfo);
      this.EnviarCorreo(horaExtra);
      this.EnviarNotificacion(horaExtra);
    }, err => {
      const { access, message } = err.error.message;
      if (access === false) {
        this.toastr.error(message)
        this.ventana.close();
      }
    });
  }

  EliminarServidor() {
    console.log('ver doc..', this.datos.documento)
    this.restHE.EliminarArchivoServidor(this.datos.documento).subscribe(res => {
    });
  }


}
