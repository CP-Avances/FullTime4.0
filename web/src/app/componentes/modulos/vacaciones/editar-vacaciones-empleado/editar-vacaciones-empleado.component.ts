import { Validators, FormControl, FormGroup } from '@angular/forms';
import { Component, OnInit, Input, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { DateTime } from 'luxon';

import { DatosGeneralesService } from 'src/app/servicios/generales/datosGenerales/datos-generales.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/configuracion/parametrizacion/parametrosGenerales/parametros.service';
import { VacacionesService } from 'src/app/servicios/modulos/modulo-vacaciones/vacaciones/vacaciones.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/avisos/real-time.service';

import { ListarVacacionesComponent } from 'src/app/componentes/modulos/vacaciones/listar-vacaciones/listar-vacaciones.component';

@Component({
  selector: 'app-editar-vacaciones-empleado',
  standalone: false,
  templateUrl: './editar-vacaciones-empleado.component.html',
  styleUrls: ['./editar-vacaciones-empleado.component.css'],
})

export class EditarVacacionesEmpleadoComponent implements OnInit {
  ips_locales: any = '';

  @Input() dato: any;
  @Input() pagina: string = '';

  // DATOS DEL EMPLEADO QUE INICIA SESION
  idEmpleadoIngresa: number = 0;
  nota = 'su solicitud';
  user = '';

  calcular = false;
  habilitarCalculados: boolean = false;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  dialaborableF = new FormControl(0, [Validators.required]);
  fechaIngreso = new FormControl(Validators.required);
  fechaInicio = new FormControl('', Validators.required);
  fechaFinal = new FormControl('', Validators.required);
  dialibreF = new FormControl(0, [Validators.required]);
  calcularF = new FormControl(false);
  totalF = new FormControl();
  diasTF = new FormControl();

  public formulario = new FormGroup({
    fechaIngresoForm: this.fechaIngreso,
    dialaborableForm: this.dialaborableF,
    fecInicioForm: this.fechaInicio,
    fecFinalForm: this.fechaFinal,
    diaLibreForm: this.dialibreF,
    calcularForm: this.calcularF,
    totalForm: this.totalF,
    diasTForm: this.diasTF
  });

  constructor(
    private restV: VacacionesService,
    private toastr: ToastrService,
    private realTime: RealTimeService,
    private informacion: DatosGeneralesService,
    public parametro: ParametrosService,
    public validar: ValidacionesService,
    public componentel: ListarVacacionesComponent,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    var id = localStorage.getItem('empleado') as string
    if (id) {
      this.idEmpleadoIngresa = parseInt(id);
    }
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');  
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    }); 
    if (this.data) {
      this.dato = this.data || this.dato; // Usa `info` o un nombre de propiedad adecuado
    }

    this.formulario.patchValue({
      fechaIngresoForm: this.dato.info.fecha_ingreso,
      dialaborableForm: this.dato.info.dia_laborable,
      fecInicioForm: this.dato.info.fecha_inicio,
      fecFinalForm: this.dato.info.fecha_final,
      diaLibreForm: this.dato.info.dia_libre,
      calcularForm: true
    });
    this.obtenerInformacionEmpleado();
    this.BuscarParametro();
  }

  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** **
   ** **************************************************************************************** **/

  formato_fecha: string = 'dd/MM/yyyy';
  idioma_fechas: string = 'es';
  // METODO PARA BUSCAR PARAMETRO DE FORMATO DE FECHA
  BuscarParametro() {
    // id_tipo_parametro Formato fecha = 1
    this.parametro.ListarDetalleParametros(1).subscribe(
      res => {
        this.formato_fecha = res[0].descripcion;
      });
  }

  // METODO PARA OBTENER CONFIGURACION DE NOTIFICACIONES
  solInfo: any;
  obtenerInformacionEmpleado() {
    var estado: boolean;
    this.informacion.ObtenerInfoConfiguracion(this.dato.id_empleado).subscribe(
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
        if (this.dato.id_empleado != this.idEmpleadoIngresa) {
          this.nota = 'la solicitud';
          this.user = 'para ' + this.solInfo.fullname;
        }
      })
  }

  fechasTotales: any = [];
  VerificarFeriado(form: any) {
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
        //let diasF = this.ContarDiasHabiles(fechaF, fechaF);
        let diasF = 5;
        console.log('total de fechas', diasF);
        if (diasF != 0) {
          diasFeriado = diasFeriado + 1;
        }
        else {
          diasL = diasL + 1;
        }
      }

      //var habil = this.ContarDiasHabiles(form.fecInicioForm, form.fecFinalForm);
      // var libre = this.ContarDiasLibres(form.fecInicioForm, form.fecFinalForm);
      var habil = 5;
      var libre = 2;

      var totalH = habil - diasFeriado;
      var totalL = libre - diasL;
      const totalDias = totalH + totalL + totalF;

      this.formulario.patchValue({
        diaLibreForm: totalL,
        dialaborableForm: totalH,
        totalForm: totalDias,
        diasTForm: totalF
      });
      this.habilitarCalculados = true;

    }, error => {
      // var habil = this.ContarDiasHabiles(form.fecInicioForm, form.fecFinalForm);
      // var libre = this.ContarDiasLibres(form.fecInicioForm, form.fecFinalForm);
      var habil = 5;
      var libre = 2;
      const totalDias = habil + libre;
      this.formulario.patchValue({
        diaLibreForm: libre,
        dialaborableForm: habil,
        totalForm: totalDias,
        diasTForm: 0
      });
      this.habilitarCalculados = true;
    })
  }

  ContarDiasHabiles(dateFrom: any, dateTo: any): any {
    let from = DateTime.fromISO(dateFrom);
    let to = DateTime.fromISO(dateTo);
    let days = 0;

    while (from <= to) {
      // SI NO ES SABADO (6) NI DOMINGO (7)
      if (from.weekday !== 6 && from.weekday !== 7) {
        days++;
      }
      from = from.plus({ days: 1 });  // SUMAR UN DIA
    }

    return days;
  }

  ContarDiasLibres(dateFrom: any, dateTo: any) {
    let from = DateTime.fromFormat(dateFrom, 'dd/MM/yyyy');
    let to = DateTime.fromFormat(dateTo, 'dd/MM/yyyy'); 
    let sa = 0;

    while (from <= to) {
      // SI ES SABADO (6) O DOMINGO (7)
      if (from.weekday === 6 || from.weekday === 7) {
        sa++;
      }
      from = from.plus({ days: 1 });  // SUMAR UN DIA
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
        this.formulario.patchValue({
          diaLibreForm: 0,
          dialaborableForm: 0,
          totalForm: ''
        });
      }
    }
  }

  LimpiarCalculo() {
    (<HTMLInputElement>document.getElementById('activo')).checked = false;
    this.formulario.patchValue({
      diaLibreForm: 0,
      dialaborableForm: 0,
      totalForm: ''
    });
  }

  ValidarDatosVacacion(form: any) {
    const fechaInicio = DateTime.fromISO(form.fecInicioForm);
    const fechaFinal = DateTime.fromISO(form.fecFinalForm);   
    const fechaIngreso = DateTime.fromISO(form.fechaIngresoForm); 
    if (fechaInicio < fechaFinal && fechaInicio < fechaIngreso) {
      const ingreso = fechaIngreso.diff(fechaFinal, 'days').days; // DIFERENCIA EN DIAS
      console.log(ingreso);
      if (ingreso <= 1) {
        this.InsertarVacaciones(form);
      } else {
        this.toastr.info('La fecha de ingreso a laborar no es la adecuada', '', {
          timeOut: 6000,
        });
      }
    } else {
      this.toastr.info('La fecha de ingreso a trabajar y de finalización de vacaciones deben ser mayores a la fecha de salida a vacaciones', '', {
        timeOut: 6000,
      });
    }
  }

  InsertarVacaciones(form: any) {
    let datosVacaciones = {
      depa_user_loggin: this.solInfo.id_dep,
      dia_laborable: form.dialaborableForm,
      fec_ingreso: form.fechaIngresoForm,
      fec_inicio: form.fecInicioForm,
      fec_final: form.fecFinalForm,
      dia_libre: form.diaLibreForm + form.diasTForm,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
    };
    this.restV.EditarVacacion(this.dato.info.id, datosVacaciones).subscribe(vacaciones => {
      this.toastr.success('Operación exitosa.', 'Vacaciones del Empleado registradas', {
        timeOut: 6000,
      })
      const notificacion: any = [];
      notificacion.push(this.solInfo);
      vacaciones.EmpleadosSendNotiEmail = notificacion;
      this.EnviarCorreoEmpleados(vacaciones);
      this.EnviarNotificacion(vacaciones);
      this.CerrarVentana(2);
    }, error => {
      this.toastr.error('Ups!!! algo salio mal.', 'Registro Inválido', {
        timeOut: 6000,
      })
    });
  }

  /** ******************************************************************************************* **
   ** **                   METODO DE ENVIO DE NOTIFICACIONES DE VACACIONES                     ** **
   ** ******************************************************************************************* **/

  // METODO PARA ENVIO DE NOTIFICACIONES DE VACACIONES
  EnviarCorreoEmpleados(vacacion: any) {

    console.log('ver vacaciones..   ', vacacion)

    var cont = 0;
    var correo_usuarios = '';
    var estado_v = '';

    vacacion.EmpleadosSendNotiEmail.forEach((e: any) => {
      // LECTURA DE DATOS LEIDOS
      cont = cont + 1;

      // METODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE VACACIÓN
      let desde = this.validar.FormatearFecha(vacacion.fec_inicio, this.formato_fecha, this.validar.dia_completo, this.idioma_fechas);
      let hasta = this.validar.FormatearFecha(vacacion.fec_final, this.formato_fecha, this.validar.dia_completo, this.idioma_fechas);

      // CAPTURANDO ESTADO DE LA SOLICITUD DE VACACIÓN
      if (vacacion.estado === 1) {
        estado_v = 'Pendiente de autorización';
      }
      else if (vacacion.estado === 2) {
        estado_v = 'Preautorizada';
      }
      else if (vacacion.estado === 3) {
        estado_v = 'Autorizada';
      }
      else if (vacacion.estado === 1) {
        estado_v = 'Negada';
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
          tipo_solicitud: 'Solicitud de vacaciones actualizada por',
          idContrato: this.dato.id_contrato,
          estado_v: estado_v,
          proceso: 'actualizado',
          desde: desde,
          hasta: hasta,
          id_dep: e.id_dep, // VERIFICAR
          id_suc: e.id_suc, // VERIFICAR
          correo: correo_usuarios,
          asunto: 'ACTUALIZACION DE SOLICITUD DE VACACIONES',
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

    // METODO PARA OBTENER NOMBRE DEL DIA EN EL CUAL SE REALIZA LA SOLICITUD DE VACACION
    let desde = this.validar.FormatearFecha(vacaciones.fecha_inicio, this.formato_fecha, this.validar.dia_completo, this.idioma_fechas);
    let hasta = this.validar.FormatearFecha(vacaciones.fecha_final, this.formato_fecha, this.validar.dia_completo, this.idioma_fechas);

    let notificacion = {
      id_send_empl: this.idEmpleadoIngresa,
      id_receives_empl: '',
      id_receives_depa: '',
      estado: 'Pendiente',
      id_permiso: null,
      id_vacaciones: vacaciones.id,
      id_hora_extra: null,
      tipo: 1,
      mensaje: 'Ha actualizado ' + this.nota + ' de vacaciones ' + this.user + ' desde ' +
        desde + ' hasta ' + hasta,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
    }

    // LISTADO PARA ELIMINAR EL USUARIO DUPLICADO
    var allNotificaciones: any = [];

    // CICLO POR CADA ELEMENTO DEL CATALOGO
    vacaciones.EmpleadosSendNotiEmail.forEach(function (elemento: any, indice: any, array: any) {
      // DISCRIMINACION DE ELEMENTOS IGUALES
      if (allNotificaciones.find((p: any) => p.fullname == elemento.fullname) == undefined) {
        // NUEVA LISTA DE EMPLEADOS QUE RECIBEN LA NOTIFICACION
        allNotificaciones.push(elemento);
      }
    });

    // FOREACH PARA ENVIAR LA NOTIFICACION A CADA USUARIO DENTRO DE LA NUEVA LISTA FILTRADA
    allNotificaciones.forEach((e: any) => {
      notificacion.id_receives_depa = e.id_dep;
      notificacion.id_receives_empl = e.empleado;
      console.log("Empleados enviados: ", allNotificaciones);
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

  // METODO DE VALIDACION DE INGRESO DE NUMEROS
  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

  LimpiarCampos() {
    this.formulario.reset();
  }

  // METODO PARA CERRAR REGISTRO
  CerrarVentana(opcion: number) {
    this.LimpiarCampos();
    this.componentel.ver_form_editar = false;
    if (opcion === 1 && this.pagina === 'ver-listas') {
      this.componentel.ver_listas = true;
    }
    else if (opcion === 2 && this.pagina === 'ver-listas') {
      this.componentel.ver_listas = true;
      this.componentel.BuscarParametro();
    }
  }

}
