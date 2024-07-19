import { MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Validators, FormGroup, FormControl } from '@angular/forms';;
import { Component, OnInit, Input, Optional, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

import { PlanHoraExtraService } from 'src/app/servicios/planHoraExtra/plan-hora-extra.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';

import { ListaEmplePlanHoraEComponent } from '../empleados-planificar/lista-emple-plan-hora-e.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

interface Estado {
  id: number,
  nombre: string
}

@Component({
  selector: 'app-plan-hora-extra',
  templateUrl: './plan-hora-extra.component.html',
  styleUrls: ['./plan-hora-extra.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
  ]
})

export class PlanHoraExtraComponent implements OnInit {

  @Input() data: any;

  estados: Estado[] = [
    { id: 1, nombre: 'Pendiente' },
    { id: 2, nombre: 'Pre-autorizado' },
    { id: 3, nombre: 'Autorizado' },
    { id: 4, nombre: 'Negado' },
  ];

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  fechaSolicitudF = new FormControl('', [Validators.required]);
  descripcionF = new FormControl('', [Validators.required]);
  fechaInicioF = new FormControl('', [Validators.required]);
  horaInicioF = new FormControl('');
  fechaFinF = new FormControl('', [Validators.required]);
  horaFinF = new FormControl('', [Validators.required]);
  horasF = new FormControl('', [Validators.required]);

  public formulario = new FormGroup({
    fechaSolicitudForm: this.fechaSolicitudF,
    descripcionForm: this.descripcionF,
    fechaInicioForm: this.fechaInicioF,
    horaInicioForm: this.horaInicioF,
    fechaFinForm: this.fechaFinF,
    horaFinForm: this.horaFinF,
    horasForm: this.horasF,
  });

  FechaActual: any;
  id_user_loggin: number;
  id_cargo_loggin: number;

  constructor(
    public restEmpleado: EmpleadoService,
    public componenteb: ListaEmplePlanHoraEComponent,
    public validar: ValidacionesService,
    public aviso: RealTimeService,
    public ventana: MatDialogRef<PlanHoraExtraComponent>,
    private restPE: PlanHoraExtraService,
    private toastr: ToastrService,
    private parametro: ParametrosService,
    @Optional() @Inject(MAT_DIALOG_DATA) public datos: any
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

    if (this.datos) {
      this.data = this.datos;
    }

    var f = moment();
    this.FechaActual = f.format('YYYY-MM-DD');

    this.id_user_loggin = parseInt(localStorage.getItem("empleado") as string);
    this.id_cargo_loggin = parseInt(localStorage.getItem("ultimoCargo") as string);

    this.formulario.patchValue({
      fechaSolicitudForm: this.FechaActual,
    });

    this.BuscarParametro();
    this.BuscarFecha();
    this.BuscarHora();
  }

  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** **
   ** **************************************************************************************** **/

  formato_fecha: string = 'DD/MM/YYYY';
  formato_hora: string = 'HH:mm:ss';

  // METODO PARA BUSCAR PARAMETRO DE FORMATO DE FECHA
  BuscarFecha() {
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

  // METODO DE VALIDACION DE INGRESO CORRECTO DE FECHAS
  ValidarFechas(form: any) {
    if (Date.parse(form.fechaInicioForm) <= Date.parse(form.fechaFinForm)) {
      this.InsertarPlanificacion(form);
    }
    else {
      this.toastr.info('Las fechas no se encuentran registradas correctamente.', 'VERIFICAR FECHAS', {
        timeOut: 6000,
      })
    }
  }

  // METODO PARA VALIDAR NUMERO DE CORREOS
  ValidarProceso(form: any) {
    console.log("this.data", this.data);
    if (this.data.planifica.length != undefined) {
      this.ContarCorreos(this.data.planifica);
      if (this.cont_correo <= this.correos) {
        this.ValidarFechas(form);
      }
      else {
        this.toastr.warning('Trata de enviar correo de un total de ' + this.cont_correo + ' colaboradores, sin embargo solo tiene permitido enviar un total de ' + this.correos + ' correos.', 'ACCIÓN NO PERMITIDA.', {
          timeOut: 6000,
        });
      }
    }
    else {
      this.ValidarFechas(form);
    }
  }

  // METODO DE PLANIFICACION DE HORAS EXTRAS
  InsertarPlanificacion(form: any) {
    // DATOS DE PLANIFICACION
    let planificacion = {
      id_empl_planifica: this.id_user_loggin,
      horas_totales: form.horasForm,
      fecha_desde: form.fechaInicioForm,
      hora_inicio: form.horaInicioForm,
      descripcion: form.descripcionForm,
      fecha_hasta: form.fechaFinForm,
      hora_fin: form.horaFinForm,
      user_name: this.user_name,
      ip: this.ip,
    }

    // INSERCIÓN DE PLANIFICACION
    this.restPE.CrearPlanificacionHoraExtra(planificacion).subscribe(res => {

      if (res.message != 'error') {
        var plan = res.info;

        // LECTURA DE DATOS DE USUARIO
        let usuario = '<tr><th>' + this.data.planifica.nombre +
          '</th><th>' + this.data.planifica.cedula + '</th></tr>';
        let cuenta_correo = this.data.planifica.correo;

        // LECTURA DE DATOS DE LA PLANIFICACION
        let desde = this.validar.FormatearFecha(plan.fecha_desde, this.formato_fecha, this.validar.dia_completo);
        let hasta = this.validar.FormatearFecha(plan.fecha_hasta, this.formato_fecha, this.validar.dia_completo);

        let h_inicio = this.validar.FormatearHora(plan.hora_inicio, this.formato_hora)
        let h_fin = this.validar.FormatearHora(plan.hora_fin, this.formato_hora);

        // DATOS DE ASIGNACIÓN DE PLANIFICACION A EMPLEADOS
        let planEmpleado = {
          estado: 1,
          observacion: false,
          id_plan_hora: plan.id,
          id_empl_cargo: this.data.planifica.id_cargo,
          id_empl_realiza: this.data.planifica.id,
          id_empl_contrato: this.data.planifica.id_contrato,
          user_name: this.user_name,
          ip: this.ip,
        }

        // VALIDAR SI LA PLANIFICACION ES DE VARIOS USUARIOS
        if (this.data.planifica.length != undefined) {
          this.CrearPlanSeleccionados(plan, planEmpleado, desde, hasta, h_inicio, h_fin);
        }
        else {
          this.CrearPlanificacion(plan, planEmpleado, cuenta_correo, usuario, desde, hasta, h_inicio, h_fin);
        }
      }
      else {
        this.toastr.warning('Ups algo salio mal !!!', 'Proceso no registrado.', {
          timeOut: 6000,
        });
        this.CerrarVentana();
      }
    })
  }

  // CREAR PLANIFICACION DE USUARIOS SELECCIONADOS
  CrearPlanSeleccionados(plan: any, planEmpleado: any, desde: any, hasta: any, h_inicio: any, h_fin: any) {
    var usuario = '';
    var cont = 0;
    var contPlan = 0;
    this.data.planifica.map((obj: any) => {

      // LECTURA DE NOMBRES DE USUARIOS
      usuario = usuario + '<tr><th>' + obj.nombre + '</th><th>' + obj.cedula + '</th></tr>';

      // LECTURA DE DATOS DE TODOS LOS USUARIOS SELECCIONADOS
      planEmpleado.id_empl_contrato = obj.id_contrato;
      planEmpleado.id_empl_realiza = obj.id;
      planEmpleado.id_empl_cargo = obj.id_cargo;
      planEmpleado.id_plan_hora = plan.id;

      // INSERTAR PLANIFICACIÓN POR EMPLEADO
      this.restPE.CrearPlanHoraExtraEmpleado(planEmpleado).subscribe(response => {

        if (response.message != 'error') {
          // ENVIAR NOTIFICACION DE PLANIFICACION HE
          this.NotificarPlanificacion(desde, hasta, h_inicio, h_fin, obj.id)

          // CONTAR DATOS PROCESADOS
          cont = cont + 1;
          contPlan = contPlan + 1;

          // SI TODOS LOS DATOS HAN SIDO PROCESADOS ENVIAR CORREO
          if (cont === this.data.planifica.length) {
            this.EnviarCorreo(plan, this.info_correo, usuario, desde, hasta, h_inicio, h_fin);
            this.MostrarMensaje(contPlan);
          }
        } else {
          // CONTAR DATOS PROCESADOS
          cont = cont + 1;

          // SI TODOS LOS DATOS HAN SIDO PROCESADOS ENVIAR CORREO
          if (cont === this.data.planifica.length) {
            this.EnviarCorreo(plan, this.info_correo, usuario, desde, hasta, h_inicio, h_fin);
            this.MostrarMensaje(contPlan);
          }
        }
      });
    });
  }

  // METODO PARA MOSTRAR MENSAJE PARA SELECCION MULTIPLE
  MostrarMensaje(contador: any) {
    this.toastr.success('Se registra planificación a ' + contador + ' colaboradores.', 'Planificación de Horas Extras.', {
      timeOut: 6000,
    });
    this.CerrarVentana();
  }

  // CREAR PLANIFICACIÓN DE UN SOLO USUARIO
  CrearPlanificacion(plan: any, planEmpleado: any, cuenta_correo: any, usuarios: any, desde: any, hasta: any, h_inicio: any, h_fin: any) {
    this.restPE.CrearPlanHoraExtraEmpleado(planEmpleado).subscribe(response => {

      if (response.message != 'error') {
        this.NotificarPlanificacion(desde, hasta, h_inicio, h_fin, this.data.planifica.id)

        this.EnviarCorreo(plan, cuenta_correo, usuarios, desde, hasta, h_inicio, h_fin);

        this.toastr.success('', 'Planificación de Horas Extras registrada.', {
          timeOut: 6000,
        });
        this.CerrarVentana();
      }
      else {
        this.toastr.warning('Ups algo salio mal !!!', 'Proceso no registrado.', {
          timeOut: 6000,
        });
        this.CerrarVentana();
      }
    })
  }

  // METODO PARA CALCULAR HORAS SOLICITADAS
  CalcularTiempo(form: any) {
    // LIMPIAR CAMPO NÚMERO DE HORAS
    this.formulario.patchValue({ horasForm: '' })

    // VALIDAR HORAS INGRESDAS
    if (form.horaInicioForm != '' && form.horaFinForm != '') {

      //FORMATO DE HORAS
      var inicio = moment.duration(moment(form.horaInicioForm, 'HH:mm:ss').format('HH:mm:ss'));
      var fin = moment.duration(moment(form.horaFinForm, 'HH:mm:ss').format('HH:mm:ss'));
      // RESTAR HORAS
      var resta = fin.subtract(inicio);
      var horas = String(resta.hours());
      var minutos = String(resta.minutes());

      if (resta.hours() < 10) {
        horas = '0' + resta.hours();
      }
      if (resta.minutes() < 10) {
        minutos = '0' + resta.minutes();
      }
      // COLOCAR FORMATO DE HORAS EN FORMULARIO
      var tiempoTotal: string = horas + ':' + minutos;
      this.formulario.patchValue({ horasForm: tiempoTotal })
    }
    else {
      this.toastr.info('Debe ingresar la hora de inicio y la hora de fin de actividades.', 'VERIFICAR', {
        timeOut: 6000,
      })
    }
  }

  // METODO DE ENVIO DE NOTIFICACIONES DE PLANIFICACION DE HORAS EXTRAS
  NotificarPlanificacion(desde: any, hasta: any, h_inicio: any, h_fin: any, recibe: number) {
    let mensaje = {
      id_empl_envia: this.id_user_loggin,
      id_empl_recive: recibe,
      tipo: 10, // PLANIFICACION DE HORAS EXTRAS
      mensaje: 'Planificación de horas extras desde ' +
        desde + ' hasta ' +
        hasta +
        ' horario de ' + h_inicio + ' a ' + h_fin,
      user_name: this.user_name,
      ip: this.ip,
    }
    this.restPE.EnviarNotiPlanificacion(mensaje).subscribe(res => {
      this.aviso.RecibirNuevosAvisos(res.respuesta);
    });
  }

  // METODO DE ENVIO DE CORREO DE PLANIFICACION DE HORAS EXTRAS
  EnviarCorreo(datos: any, cuenta_correo: any, usuario: any, desde: any, hasta: any, h_inicio: any, h_fin: any) {

    // DATOS DE ESTRUCTURA DEL CORREO
    let DataCorreo = {
      tipo_solicitud: 'REALIZA',
      id_empl_envia: this.id_user_loggin,
      observacion: datos.descripcion,
      proceso: 'creado',
      correos: cuenta_correo,
      nombres: usuario,
      asunto: 'PLANIFICACION DE HORAS EXTRAS',
      inicio: h_inicio,
      desde: desde,
      hasta: hasta,
      horas: moment(datos.horas_totales, 'HH:mm').format('HH:mm'),
      fin: h_fin,
    }

    // METODO ENVIO DE CORREO DE PLANIFICACION DE HE
    this.restPE.EnviarCorreoPlanificacion(DataCorreo).subscribe(res => {
      if (res.message === 'ok') {
        this.toastr.success('Correo de planificación enviado exitosamente.', '', {
          timeOut: 6000,
        });
      }
      else {
        this.toastr.warning('Ups algo salio mal !!!', 'No fue posible enviar correo de planificación.', {
          timeOut: 6000,
        });
      }
    })
  }

  // METODO DE BUSQUEDA DE NUMERO PERMITIDO DE CORREOS
  correos: number;
  BuscarParametro() {
    // id_tipo_parametro LIMITE DE CORREOS = 33
    let datos: any = [];
    this.parametro.ListarDetalleParametros(33).subscribe(
      res => {
        datos = res;
        if (datos.length != 0) {
          this.correos = parseInt(datos[0].descripcion)
        }
        else {
          this.correos = 0
        }
      });
  }

  // METODO PARA CONTAR NUMERO DE CORREOS A ENVIAR
  cont_correo: number = 0;
  info_correo: string = '';
  ContarCorreos(data: any) {
    this.cont_correo = 0;
    this.info_correo = '';
    data.forEach((obj: any) => {
      this.cont_correo = this.cont_correo + 1
      if (this.info_correo === '') {
        this.info_correo = obj.correo;
      }
      else {
        this.info_correo = this.info_correo + ', ' + obj.correo;
      }
    })
  }

  // METODOS DE VALIDACION DE INGRESO DE LETRAS Y NUMEROS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

  // METODOS DE LIMIEZA DE FORMULARIOS Y CERRAR COMPONENTE
  LimpiarCampoHoras() {
    this.formulario.patchValue({ horasForm: '' })
  }

  // METODO PARA CERRAR REGISTRO
  CerrarVentana() {
    this.formulario.reset();
    this.componenteb.ver_busqueda = true;
    this.componenteb.ver_planificar = false;
    this.componenteb.LimpiarFormulario();
    this.ventana.close();
  }

}
