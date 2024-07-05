import { MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

import { PlanHoraExtraService } from 'src/app/servicios/planHoraExtra/plan-hora-extra.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { EmplCargosService } from 'src/app/servicios/empleado/empleadoCargo/empl-cargos.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';

import { ListaPlanificacionesComponent } from '../lista-planificaciones/lista-planificaciones.component';

@Component({
  selector: 'app-editar-plan-hora-extra',
  templateUrl: './editar-plan-hora-extra.component.html',
  styleUrls: ['./editar-plan-hora-extra.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
  ]
})

export class EditarPlanHoraExtraComponent implements OnInit {

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  @Input() data: any;
  @Input() pagina: string = '';

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  fechaSolicitudF = new FormControl('', [Validators.required]);
  descripcionF = new FormControl('', [Validators.required]);
  fechaInicioF = new FormControl('', [Validators.required]);
  horaInicioF = new FormControl('');
  FechaFinF = new FormControl('', [Validators.required]);
  horaFinF = new FormControl('', [Validators.required]);
  horasF = new FormControl('', [Validators.required]);

  public formulario = new FormGroup({
    fechaSolicitudForm: this.fechaSolicitudF,
    descripcionForm: this.descripcionF,
    fechaInicioForm: this.fechaInicioF,
    horaInicioForm: this.horaInicioF,
    fechaFinForm: this.FechaFinF,
    horaFinForm: this.horaFinF,
    horasForm: this.horasF,
  });

  FechaActual: any;
  id_user_loggin: number;
  id_cargo_loggin: number;

  constructor(
    private restPE: PlanHoraExtraService,
    private toastr: ToastrService,
    private restP: ParametrosService,
    public restEmpleado: EmpleadoService,
    public componentel: ListaPlanificacionesComponent,
    public restCargo: EmplCargosService,
    public parametro: ParametrosService,
    public validar: ValidacionesService,
    public aviso: RealTimeService,
  ) { }

  ngOnInit(): void {

    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

    var f = moment();
    this.FechaActual = f.format('YYYY-MM-DD');

    this.id_user_loggin = parseInt(localStorage.getItem("empleado") as string);
    this.id_cargo_loggin = parseInt(localStorage.getItem("ultimoCargo") as string);

    this.CargarDatos();
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

  leer_datos: any;
  CargarDatos() {
    if (this.data.modo === 'individual') {
      this.leer_datos = this.data.planifica;
    } else {
      this.leer_datos = this.data.planifica[0];
    }
    this.formulario.patchValue({
      fechaSolicitudForm: this.FechaActual,
      descripcionForm: this.leer_datos.descripcion,
      fechaInicioForm: this.leer_datos.fecha_desde,
      fechaFinForm: this.leer_datos.fecha_hasta,
      horaInicioForm: this.leer_datos.hora_inicio,
      horaFinForm: this.leer_datos.hora_fin,
      horasForm: this.leer_datos.horas_totales,
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


  // METODO PARA ACTUALIZAR UNA PLANIFICACIÓN, ELIMINAR LA ANTERIOR Y CREAR UNA NUEVA
  InsertarPlanificacion(form: any) {
    const datos = {
      user_name: this.user_name,
      ip: this.ip,
    }
    // METODO PARA ELIMINAR PLANIFICACIÓN ANTERIOR
    this.restPE.EliminarPlanEmpleado(this.leer_datos.id_plan, this.leer_datos.id_empleado, datos)
      .subscribe(eliminar => {
        // CREACIÓN DE LA PLANIFICACIÓN PARA UN EMPLEADO
        let planificacion = {
          id_empl_planifica: this.id_user_loggin,
          horas_totales: form.horasForm,
          fecha_desde: form.fechaInicioForm,
          fecha_hasta: form.fechaFinForm,
          hora_inicio: form.horaInicioForm,
          descripcion: form.descripcionForm,
          hora_fin: form.horaFinForm,
          user_name: this.user_name,
          ip: this.ip,
        }
        // INSERCIÓN DE PLANIFICACIÓN
        this.restPE.CrearPlanificacionHoraExtra(planificacion).subscribe(res => {

          if (res.message != 'error') {
            var plan = res.info;
            console.log('res info ... ', plan)
            // LECTURA DE DATOS DE USUARIO
            let usuario = '<tr><th>' + this.leer_datos.nombre +
              '</th><th>' + this.leer_datos.cedula + '</th></tr>';
            let cuenta_correo = this.leer_datos.correo;

            // LECTURA DE DATOS DE LA PLANIFICACIÓN
            let desde = this.validar.FormatearFecha(plan.fecha_desde, this.formato_fecha, this.validar.dia_completo);
            let hasta = this.validar.FormatearFecha(plan.fecha_hasta, this.formato_fecha, this.validar.dia_completo);

            let h_inicio = this.validar.FormatearHora(plan.hora_inicio, this.formato_hora)
            let h_fin = this.validar.FormatearHora(plan.hora_fin, this.formato_hora);

            // DATOS DE ASIGNACIÓN DE PLANIFICACIÓN A EMPLEADOS
            let planEmpleado = {
              estado: 1,
              codigo: this.leer_datos.codigo,
              observacion: false,
              id_plan_hora: plan.id,
              id_empl_cargo: this.leer_datos.id_cargo,
              id_empl_realiza: this.leer_datos.id_empleado,
              id_empl_contrato: this.leer_datos.id_contrato,
              user_name: this.user_name,
              ip: this.ip,
            }

            // VALIDAR SI LA PLANIFICACIÓN ES DE VARIOS USUARIOS
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
            this.CerrarVentana(1, plan.id);
          }
        })
      });
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
      planEmpleado.id_empl_realiza = obj.id_empleado;
      planEmpleado.id_empl_cargo = obj.id_cargo;
      planEmpleado.id_plan_hora = plan.id;
      planEmpleado.codigo = obj.codigo;

      // INSERTAR PLANIFICACIÓN POR EMPLEADO
      this.restPE.CrearPlanHoraExtraEmpleado(planEmpleado).subscribe(response => {

        if (response.message != 'error') {
          // ENVIAR NOTIFICACION DE PLANIFICACION HE
          this.NotificarPlanificacion(plan, desde, hasta, h_inicio, h_fin, obj.id)

          // CONTAR DATOS PROCESADOS
          cont = cont + 1;
          contPlan = contPlan + 1;

          // SI TODOS LOS DATOS HAN SIDO PROCESADOS ENVIAR CORREO
          if (cont === this.data.planifica.length) {
            this.EnviarCorreo(plan, this.info_correo, usuario, desde, hasta, h_inicio, h_fin);
            this.MostrarMensaje(contPlan, plan.id);
          }
        } else {
          // CONTAR DATOS PROCESADOS
          cont = cont + 1;

          // SI TODOS LOS DATOS HAN SIDO PROCESADOS ENVIAR CORREO
          if (cont === this.data.planifica.length) {
            this.EnviarCorreo(plan, this.info_correo, usuario, desde, hasta, h_inicio, h_fin);
            this.MostrarMensaje(contPlan, plan.id);
          }
        }
      });
    });
  }

  // METODO PARA MOSTRAR MENSAJE PARA SELECCION MULTIPLE
  MostrarMensaje(contador: any, id_plan: number) {
    this.toastr.success('Se registra planificación a ' + contador + ' colaboradores.', 'Planificación de Horas Extras.', {
      timeOut: 6000,
    });
    this.CerrarVentana(2, id_plan);
  }

  // CREAR PLANIFICACIÓN DE UN SOLO USUARIO
  CrearPlanificacion(plan: any, planEmpleado: any, cuenta_correo: any, usuarios: any, desde: any, hasta: any, h_inicio: any, h_fin: any) {
    this.restPE.CrearPlanHoraExtraEmpleado(planEmpleado).subscribe(response => {

      if (response.message != 'error') {
        this.NotificarPlanificacion(plan, desde, hasta, h_inicio, h_fin, this.leer_datos.id_empleado)

        this.EnviarCorreo(plan, cuenta_correo, usuarios, desde, hasta, h_inicio, h_fin);

        this.toastr.success('', 'Planificación de Horas Extras registrada.', {
          timeOut: 6000,
        });
        this.CerrarVentana(2, plan.id);
      }
      else {
        this.toastr.warning('Ups algo salio mal !!!', 'Proceso no registrado.', {
          timeOut: 6000,
        });
        this.CerrarVentana(1, plan.id);
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
  NotificarPlanificacion(datos: any, desde: any, hasta: any, h_inicio: any, h_fin: any, recibe: number) {
    let mensaje = {
      id_empl_envia: this.id_user_loggin,
      id_empl_recive: recibe,
      tipo: 10, // PLANIFICACIÓN DE HORAS EXTRAS
      mensaje: 'Planificación de horas extras actualizada desde ' +
        desde + ' hasta ' + hasta +
        ' horario de ' + h_inicio + ' a ' + h_fin,
      user_name: this.user_name,
      ip: this.ip,
    }
    this.restPE.EnviarNotiPlanificacion(mensaje).subscribe(res => {
      this.aviso.RecibirNuevosAvisos(res.respuesta);
    });
  }

  // METODO DE ENVIO DE CORREO DE PLANIFICACIÓN DE HORAS EXTRAS
  EnviarCorreo(datos: any, cuenta_correo: any, usuario: any, desde: any, hasta: any, h_inicio: any, h_fin: any) {

    // DATOS DE ESTRUCTURA DEL CORREO
    let DataCorreo = {
      tipo_solicitud: 'ACTUALIZA',
      id_empl_envia: this.id_user_loggin,
      observacion: datos.descripcion,
      proceso: 'actualizado',
      correos: cuenta_correo,
      nombres: usuario,
      asunto: 'ACTUALIZACION DE PLANIFICACION DE HORAS EXTRAS',
      inicio: h_inicio,
      desde: desde,
      hasta: hasta,
      horas: moment(datos.horas_totales, 'HH:mm').format('HH:mm'),
      fin: h_fin,
    }

    // METODO ENVIO DE CORREO DE PLANIFICACIÓN DE HE
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
    // id_tipo_parametro LIMITE DE CORREOS = 24
    let datos: any = [];
    this.restP.ListarDetalleParametros(24).subscribe(
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

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampoHoras() {
    this.formulario.patchValue({ horasForm: '' })
  }

  // METODO PARA CERRAR VENTANA
  CerrarVentana(opcion: number, id_plan: number) {
    this.formulario.reset();
    this.componentel.ver_form_editar = false;
    if (opcion === 1 && this.pagina === 'lista-planificaciones') {
      this.componentel.ver_listas = true;
    }
    else if (opcion === 2 && this.pagina === 'lista-planificaciones') {
      this.componentel.ver_listas = true;
      this.componentel.VerificarPlanificacion(id_plan, '1', true, false);
    }
  }

  // METODO PARA INGRESAR SOLO LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  // METODO PARA INGRESAR SOLO NUMEROS
  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

}
