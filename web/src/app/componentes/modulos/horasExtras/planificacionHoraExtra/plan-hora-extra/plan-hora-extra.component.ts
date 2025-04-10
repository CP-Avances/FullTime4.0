import { Validators, FormGroup, FormControl } from '@angular/forms';;
import { Component, OnInit, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { DateTime } from 'luxon'

import { PlanHoraExtraService } from 'src/app/servicios/modulos/modulo-horas-extras/planHoraExtra/plan-hora-extra.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/configuracion/parametrizacion/parametrosGenerales/parametros.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/avisos/real-time.service';

import { ListaEmplePlanHoraEComponent } from '../empleados-planificar/lista-emple-plan-hora-e.component';

interface Estado {
  id: number,
  nombre: string
}

@Component({
  selector: 'app-plan-hora-extra',
  standalone: false,
  templateUrl: './plan-hora-extra.component.html',
  styleUrls: ['./plan-hora-extra.component.css'],
})

export class PlanHoraExtraComponent implements OnInit {
  ips_locales: any = '';

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

    private restPE: PlanHoraExtraService,
    private toastr: ToastrService,
    private parametro: ParametrosService,

  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');  
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    }); 

    var f = DateTime.now();
    this.FechaActual = f.toFormat('yyyy-MM-dd');

    this.id_user_loggin = parseInt(localStorage.getItem("empleado") as string);
    this.id_cargo_loggin = parseInt(localStorage.getItem("ultimoCargo") as string);

    this.formulario.patchValue({
      fechaSolicitudForm: this.FechaActual,
    });

    this.BuscarParametro();
  }

  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** **
   ** **************************************************************************************** **/

  formato_fecha: string = 'dd/MM/yyyy';
  formato_hora: string = 'HH:mm:ss';
  idioma_fechas: string = 'es';
  // METODO PARA BUSCAR DATOS DE PARAMETROS
  BuscarParametro() {
    let datos: any = [];
    let detalles = { parametros: '1, 2' };
    this.parametro.ListarVariosDetallesParametros(detalles).subscribe(
      res => {
        datos = res;
        //console.log('datos ', datos)
        datos.forEach((p: any) => {
          // id_tipo_parametro Formato fecha = 1
          if (p.id_parametro === 1) {
            this.formato_fecha = p.descripcion;
          }
          // id_tipo_parametro Formato hora = 2
          else if (p.id_parametro === 2) {
            this.formato_hora = p.descripcion;
          }
        })
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
      this.LeerCorreos(this.data.planifica);
      this.ValidarFechas(form);
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
      ip: this.ip, ip_local: this.ips_locales,
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
        let desde = this.validar.FormatearFecha(plan.fecha_desde, this.formato_fecha, this.validar.dia_completo, this.idioma_fechas);
        let hasta = this.validar.FormatearFecha(plan.fecha_hasta, this.formato_fecha, this.validar.dia_completo, this.idioma_fechas);

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
          ip: this.ip, ip_local: this.ips_locales,
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
      // CREAR OBJETOS DATETIME A PARTIR DE LAS CADENAS
      const inicio = DateTime.fromFormat(form.horaInicioForm, 'HH:mm:ss');
      const fin = DateTime.fromFormat(form.horaFinForm, 'HH:mm:ss');

      // CALCULAR LA DIFERENCIA
      const diferencia = fin.diff(inicio, ['hours', 'minutes']).toObject();

      // FORMATEAR HORAS Y MINUTOS, AÑADIENDO CEROS A LA IZQUIERDA SI ES NECESARIO
      const horas = String(diferencia.hours || 0).padStart(2, '0');
      const minutos = String(diferencia.minutes || 0).padStart(2, '0');

      // COLOCAR FORMATO DE HORAS EN FORMULARIO
      const tiempoTotal = `${horas}:${minutos}`;
      this.formulario.patchValue({ horasForm: tiempoTotal });
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
      ip: this.ip, ip_local: this.ips_locales,
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
      horas: DateTime.fromISO(datos.horas_totales, 'HH:mm').toFormat('HH:mm'),
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

  // METODO PARA CONTAR NUMERO DE CORREOS A ENVIAR
  info_correo: string = '';
  LeerCorreos(data: any) {
    this.info_correo = '';
    data.forEach((obj: any) => {
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
    // this.ventana.close();
  }

}
