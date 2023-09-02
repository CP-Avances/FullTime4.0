import { MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { AutorizacionService } from 'src/app/servicios/autorizacion/autorizacion.service';
import { VacacionesService } from 'src/app/servicios/vacaciones/vacaciones.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';

@Component({
  selector: 'app-registrar-vacaciones',
  templateUrl: './registrar-vacaciones.component.html',
  styleUrls: ['./registrar-vacaciones.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
  ]
})

export class RegistrarVacacionesComponent implements OnInit {

  empleados: any = [];
  calcular = false;
  FechaActual: any;

  // DATOS DEL EMPLEADO QUE INICIA SESION
  idEmpleadoIngresa: number;
  nota = 'una solicitud';
  user = '';

  nombreEmpleado = new FormControl('', [Validators.required]);
  fechaInicio = new FormControl('', Validators.required);
  fechaFinal = new FormControl('', Validators.required);
  fechaIngreso = new FormControl('', Validators.required);
  dialibreF = new FormControl(0, [Validators.required]);
  dialaborableF = new FormControl(0, [Validators.required]);
  legalizadoF = new FormControl('', [Validators.required]);
  calcularF = new FormControl('');
  totalF = new FormControl('');
  diasTF = new FormControl();

  public VacacionesForm = new FormGroup({
    nombreEmpleadoForm: this.nombreEmpleado,
    fechaIngresoForm: this.fechaIngreso,
    dialaborableForm: this.dialaborableF,
    legalizadoForm: this.legalizadoF,
    fecInicioForm: this.fechaInicio,
    fecFinalForm: this.fechaFinal,
    diaLibreForm: this.dialibreF,
    calcularForm: this.calcularF,
    totalForm: this.totalF,
    diasTForm: this.diasTF
  });

  constructor(
    private rest: EmpleadoService,
    private restV: VacacionesService,
    private toastr: ToastrService,
    private realTime: RealTimeService,
    private informacion: DatosGeneralesService,
    public restAutoriza: AutorizacionService,
    public ventana: MatDialogRef<RegistrarVacacionesComponent>,
    public validar: ValidacionesService,
    public parametro: ParametrosService,
    @Inject(MAT_DIALOG_DATA) public datoEmpleado: any
  ) {
    this.idEmpleadoIngresa = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    console.log(this.datoEmpleado);
    var f = moment();
    this.FechaActual = f.format('YYYY-MM-DD');

    this.obtenerInformacionEmpleado();
    this.ObtenerEmpleados(this.datoEmpleado.idEmpleado);
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
    this.informacion.ObtenerInfoConfiguracion(this.datoEmpleado.idEmpleado).subscribe(
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
        if (this.datoEmpleado.idEmpleado != this.idEmpleadoIngresa) {
          this.nota = 'la solicitud';
          this.user = 'para ' + this.solInfo.fullname;
        }
      })
  }

  fechasTotales: any = [];
  VerificarFeriado(form): any {
    var diasFeriado = 0;
    var diasL = 0;
    let dataFechas = {
      fechaSalida: form.fecInicioForm,
      fechaIngreso: form.fecFinalForm
    }
    this.restV.BuscarFechasFeriado(dataFechas).subscribe(data => {
      this.fechasTotales = [];
      this.fechasTotales = data;
      console.log('fechas feriados', this.fechasTotales);
      var totalF = this.fechasTotales.length;
      console.log('total de fechas', totalF);

      for (let i = 0; i <= this.fechasTotales.length - 1; i++) {
        let fechaF = this.fechasTotales[i].fecha.split('T')[0];
        let diasF = this.ContarDiasHabiles(fechaF, fechaF);
        console.log('total de fechas', diasF);
        if (diasF != 0) {
          diasFeriado = diasFeriado + 1;
        }
        else {
          diasL = diasL + 1;
        }
      }

      var habil = this.ContarDiasHabiles(form.fecInicioForm, form.fecFinalForm);
      var libre = this.ContarDiasLibres(form.fecInicioForm, form.fecFinalForm);

      var totalH = habil - diasFeriado;
      var totalL = libre - diasL;
      const totalDias = totalH + totalL + totalF;

      this.VacacionesForm.patchValue({
        diaLibreForm: totalL,
        dialaborableForm: totalH,
        totalForm: totalDias,
        diasTForm: totalF
      });

    }, error => {
      var habil = this.ContarDiasHabiles(form.fecInicioForm, form.fecFinalForm);
      var libre = this.ContarDiasLibres(form.fecInicioForm, form.fecFinalForm);
      const totalDias = habil + libre;
      this.VacacionesForm.patchValue({
        diaLibreForm: libre,
        dialaborableForm: habil,
        totalForm: totalDias,
        diasTForm: 0
      });
    })
  }

  ContarDiasHabiles(dateFrom, dateTo): any {
    var from = moment(dateFrom),
      to = moment(dateTo),
      days = 0;
    console.log('visualizar', from);
    while (!from.isAfter(to)) {
      /** Si no es sabado ni domingo */
      if (from.isoWeekday() !== 6 && from.isoWeekday() !== 7) {
        days++;;
      }
      from.add(1, 'days');
    }
    return days;
  }

  ContarDiasLibres(dateFrom, dateTo) {
    var from = moment(dateFrom, 'DD/MM/YYY'),
      to = moment(dateTo, 'DD/MM/YYY'),
      days = 0,
      sa = 0;
    while (!from.isAfter(to)) {
      /** Si no es sabado ni domingo */
      if (from.isoWeekday() !== 6 && from.isoWeekday() !== 7) {
        days++;
      }
      else {
        sa++
      }
      from.add(1, 'days');
    }
    return sa;
  }

  ImprimirCalculos(form: any) {
    console.log(form.calcularForm);
    if (form.fecInicioForm === '' || form.fecFinalForm === '') {
      this.toastr.info('Aún no ha ingresado fecha de inicio o fin de vacaciones', '', {
        timeOut: 6000,
      })
      this.LimpiarCalculo();
    }
    else {
      if ((<HTMLInputElement>document.getElementById('activo')).checked) {
        if (Date.parse(form.fecInicioForm) < Date.parse(form.fecFinalForm) && Date.parse(form.fecInicioForm) < Date.parse(form.fechaIngresoForm)) {
          this.VerificarFeriado(form);
        }
        else {
          this.toastr.info('La fecha de ingreso a trabajar y de finalización de vacaciones deben ser mayores a la fecha de salida a vacaciones', '', {
            timeOut: 6000,
          });
          (<HTMLInputElement>document.getElementById('activo')).checked = false;
        }
      } else {
        this.VacacionesForm.patchValue({
          diaLibreForm: 0,
          dialaborableForm: 0,
          totalForm: ''
        });
      }
    }
  }

  LimpiarCalculo() {
    (<HTMLInputElement>document.getElementById('activo')).checked = false;
    this.VacacionesForm.patchValue({
      diaLibreForm: 0,
      dialaborableForm: 0,
      totalForm: ''
    });
  }

  /** METODO para ver la información del empleado */
  ObtenerEmpleados(idemploy: any) {
    this.empleados = [];
    this.rest.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleados = data;
      console.log(this.empleados)
      this.VacacionesForm.patchValue({
        nombreEmpleadoForm: this.empleados[0].nombre + ' ' + this.empleados[0].apellido,
      })
    })
  }

  ValidarDatosVacacion(form: any) {
    if (Date.parse(form.fecInicioForm) < Date.parse(form.fecFinalForm) && Date.parse(form.fecInicioForm) < Date.parse(form.fechaIngresoForm)) {
      const ingreso = moment(form.fechaIngresoForm).diff(moment(form.fecFinalForm), 'days');
      console.log(ingreso);
      if (ingreso <= 1) {
        this.InsertarVacaciones(form);
      }
      else {
        this.toastr.info('La fecha de ingreso a laborar no es la adecuada', '', {
          timeOut: 6000,
        })
      }
    }
    else {
      this.toastr.info('La fecha de ingreso a trabajar y de finalización de vacaciones deben ser mayores a la fecha de salida a vacaciones', '', {
        timeOut: 6000,
      });
    }
  }

  responseVacacion: any = [];
  NotifiRes: any;
  arrayNivelesDepa: any = [];
  InsertarVacaciones(form: any) {
    let datosVacaciones = {
      id_peri_vacacion: this.datoEmpleado.idPerVacacion,
      depa_user_loggin: this.solInfo.id_dep,
      dia_laborable: form.dialaborableForm,
      id_empl_cargo: this.datoEmpleado.idCargo,
      fec_ingreso: form.fechaIngresoForm,
      legalizado: form.legalizadoForm,
      fec_inicio: form.fecInicioForm,
      dia_libre: form.diaLibreForm + form.diasTForm,
      fec_final: form.fecFinalForm,
      codigo: parseInt(this.empleados[0].codigo),
      estado: 1,
    };
    console.log(datosVacaciones);
    this.restV.RegistrarVacaciones(datosVacaciones).subscribe(vacacion => {
      vacacion.EmpleadosSendNotiEmail.push(this.solInfo);
      this.IngresarAutorizacion(vacacion);
      this.EnviarNotificacion(vacacion);
      this.EnviarCorreoEmpleados(vacacion);
      this.toastr.success('Operación exitosa.', 'Solicitud registrada.', {
        timeOut: 6000,
      })
      this.CerrarVentanaRegistroVacaciones();
    }, error => {
      this.toastr.error('Ups!!! algo salio mal.', 'Registro Inválido', {
        timeOut: 6000,
      })
    });
  }

  LimpiarCampos() {
    this.VacacionesForm.reset();
  }

  CerrarVentanaRegistroVacaciones() {
    this.LimpiarCampos();
    this.ventana.close();
  }

  IngresarSoloNumeros(evt) {
    if (window.event) {
      var keynum = evt.keyCode;
    }
    else {
      keynum = evt.which;
    }
    // COMPROBAMOS SI SE ENCUENTRA EN EL RANGO NUMERICO Y QUE TECLAS NO RECIBIRA.
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

      // VERIFICACIÓN QUE TODOS LOS DATOS HAYAN SIDO LEIDOS PARA ENVIAR CORREO
      if (cont === vacacion.EmpleadosSendNotiEmail.length) {
        let datosVacacionCreada = {
          tipo_solicitud: 'Vacaciones solicitadas por',
          idContrato: this.datoEmpleado.idContratoActual,
          estado_v: estado_v,
          proceso: 'creado',
          desde: desde,
          hasta: hasta,
          id_dep: e.id_dep, // VERIFICAR
          id_suc: e.id_suc, // VERIFICAR
          correo: correo_usuarios,
          asunto: 'SOLICITUD DE VACACIONES',
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

  EnviarNotificacion(vacaciones: any) {

    // METODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE VACACIÓN
    let desde = this.validar.FormatearFecha(vacaciones.fec_inicio, this.formato_fecha, this.validar.dia_completo);
    let hasta = this.validar.FormatearFecha(vacaciones.fec_final, this.formato_fecha, this.validar.dia_completo);

    let notificacion = {
      id_receives_empl: '',
      id_receives_depa: '',
      id_vacaciones: vacaciones.id,
      id_hora_extra: null,
      id_send_empl: this.idEmpleadoIngresa,
      id_permiso: null,
      tipo: 1,
      estado: 'Pendiente',
      mensaje: 'Ha realizado ' + this.nota + ' de vacaciones ' + this.user + ' desde ' +
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

  IngresarAutorizacion(vacacion: any) {
    // ARREGLO DE DATOS PARA INGRESAR UNA AUTORIZACIÓN
    let newAutorizaciones = {
      orden: 1, // ORDEN DE LA AUTORIZACIÓN 
      estado: 1, // ESTADO PENDIENTE
      id_departamento: parseInt(localStorage.getItem('departamento') as string),
      id_permiso: null,
      id_vacacion: vacacion.id,
      id_hora_extra: null,
      id_documento: '',
      id_plan_hora_extra: null,
    }
    this.restAutoriza.postAutorizacionesRest(newAutorizaciones).subscribe(res => {
    }, error => { })
  }

}
