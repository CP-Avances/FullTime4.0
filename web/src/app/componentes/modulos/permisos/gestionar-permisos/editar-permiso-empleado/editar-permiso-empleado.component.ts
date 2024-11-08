// IMPORTACION LIBRERIAS
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import { DateTime, Duration } from 'luxon';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ToastrService } from 'ngx-toastr';

// IMPORTACION DE SERVICIOS
import { LoginService } from 'src/app/servicios/login/login.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/avisos/real-time.service';
import { FeriadosService } from 'src/app/servicios/horarios/catFeriados/feriados.service';
import { PermisosService } from 'src/app/servicios/modulos/modulo-permisos/permisos/permisos.service';
import { ParametrosService } from 'src/app/servicios/configuracion/parametrizacion/parametrosGenerales/parametros.service';
import { PlanGeneralService } from 'src/app/servicios/horarios/planGeneral/plan-general.service';
import { TipoPermisosService } from 'src/app/servicios/modulos/modulo-permisos/catTipoPermisos/tipo-permisos.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { DatosGeneralesService } from 'src/app/servicios/generales/datosGenerales/datos-generales.service';
import { EmpleadoHorariosService } from 'src/app/servicios/horarios/empleadoHorarios/empleado-horarios.service';
import { PeriodoVacacionesService } from 'src/app/servicios/modulos/modulo-vacaciones/periodoVacaciones/periodo-vacaciones.service';

import { VerEmpleadoComponent } from 'src/app/componentes/usuarios/empleados/datos-empleado/ver-empleado/ver-empleado.component';

// CREACION DE LISTA DE OPCIONES DE SOLICITUD DE PERMISO
interface opcionesDiasHoras {
  valor: string;
  nombre: string
}

@Component({
  selector: 'app-editar-permiso-empleado',
  templateUrl: './editar-permiso-empleado.component.html',
  styleUrls: ['./editar-permiso-empleado.component.css'],
})

export class EditarPermisoEmpleadoComponent implements OnInit {

  @Input() solicita_permiso: any;

  id_empleado: number = 0;
  // DATOS DEL EMPLEADO QUE INICIA SESION
  idEmpleadoIngresa: number = 0;
  nota = 'su solicitud';
  user = '';

  datoNumPermiso: any = []; // ARREGLOS PARA GUARDAR ÚLTIMO NÚMERO DE PERMISOS REGISTRADO POR EMPLEADO
  tipoPermisos: any = []; // ARREGLOS PARA SELECCIONAR EL TIPO DE PERMISO DE ACUERDO AL PEDIDO EMPLEADO / ADMINISTRADOR
  datosPermiso: any = []; // ARREGLOS PARA GUARDAR DATOS DEL PERMISO SELECCIONADO
  permiso: any = []; // ARREGLO PARA GUARDAR LISTA DE PERMISOS REGISTRADOS

  // OPCIONES DE SOLICITUD DE PERMISOS
  diasHoras: opcionesDiasHoras[] = [
    { valor: 'Dias', nombre: 'Dias' },
    { valor: 'Horas', nombre: 'Horas' },
  ];

  num: number = 0; // VARIABLE QUEALMACENA EL NUMERO DE PERMISO SOLICITADO
  Tdias = 0; // VARIABLE QUE ALMACENA EL TOTAL DE DÍAS DE PERMISO
  Thoras: any; // VARIABLE QUE ALMACENA EL TOTAL DE HORAS DE PERMISO
  isChecked: boolean = false; // VARIABLE QUE INDICA SI SE VA A ACTUALIZAR EL ARCHIVO

  configuracion_permiso: string = ''; // VARIABLE QUE INDICA QUE TIPO DE PERMISOS SELECCIONO EL EMPLEADO
  horasTrabajo: any = []; // VARIABLE QUE ALMACENA EL TOTAL DE HORAS QUE TRABAJA EL EMPLEADO
  FechaActual: any; // VARIABLE QUE INIDCA LA FECHA ACTUAL EN LA QUE SE REGISTRA O PIDE EL PERMISO

  // EVENTOS PARA ACTIVAR O DESACTIVAR INGRESO DE DIAS- HORAS - DIAS/HORAS SEGUN SELECCIÓN DEL USUARIO
  habilitarDias: boolean = true;

  // INFORMACION DEL PERMISO
  informacion1: string = '';
  informacion3: string = '';
  informacion4: string = '';

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  horas_alimentacionF = new FormControl('');
  horas_solicitadasF = new FormControl('');
  nombreCertificadoF = new FormControl('');
  descripcionF = new FormControl('');
  fechaInicioF = new FormControl('', [Validators.required]);
  horaIngresoF = new FormControl('');
  archivoForm = new FormControl('');
  fechaFinalF = new FormControl('', [Validators.required]);
  horaSalidaF = new FormControl('');
  diaLaboralF = new FormControl();
  idPermisoF = new FormControl('', [Validators.required]);
  solicitarF = new FormControl('', [Validators.required]);
  especialF = new FormControl(false);
  diaLibreF = new FormControl();
  horasF = new FormControl('');
  diasF = new FormControl('');

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    horas_alimentacionForm: this.horas_alimentacionF,
    horas_solicitadasForm: this.horas_solicitadasF,
    nombreCertificadoForm: this.nombreCertificadoF,
    horasIngresoForm: this.horaIngresoF,
    descripcionForm: this.descripcionF,
    fechaInicioForm: this.fechaInicioF,
    fechaFinalForm: this.fechaFinalF,
    horaSalidaForm: this.horaSalidaF,
    diaLaboralForm: this.diaLaboralF,
    idPermisoForm: this.idPermisoF,
    solicitarForm: this.solicitarF,
    diaLibreForm: this.diaLibreF,
    especialForm: this.especialF,
    horasForm: this.horasF,
    diasForm: this.diasF,
  });

  constructor(
    private loginServise: LoginService,
    private informacion_: DatosGeneralesService,
    private tipoPermiso: TipoPermisosService,
    private realTime: RealTimeService,
    private toastr: ToastrService,
    private restP: PermisosService,
    private restH: EmpleadoHorariosService,
    private restE: EmpleadoService,
    public validar: ValidacionesService,
    public feriado: FeriadosService,
    public restPerV: PeriodoVacacionesService,
    public parametro: ParametrosService,
    public componente: VerEmpleadoComponent,
    public planificar: PlanGeneralService,
  ) {
    // LEER ID DE USUARIO QUE INICIA SESION
    var item = localStorage.getItem('empleado');
    if (item) {
      this.idEmpleadoIngresa = parseInt(item);
    }
  }

  // ALMACENAMIENTO DE INFORMACION DEL PERMISO
  info: any = [];

  ngOnInit(): void {
    console.log('datos permisos ', this.solicita_permiso[0])
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

    var f = DateTime.now();
    this.info = this.solicita_permiso[0].permiso;
    this.id_empleado = this.solicita_permiso[0].id_empleado;
    this.FechaActual = f.toFormat('yyyy-MM-dd');
    this.num = this.info.numero_permiso;
    this.ObtenerInformacionEmpleado();
    this.ObtenerTiposPermiso();
    this.ObtenerEmpleado();
    this.BuscarParametro();
    this.ObtenerDatos();
    this.MostrarDatos();
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


  // METODO PARA OBTENER DATOS DEL EMPLEADO
  empleado: any = [];
  ObtenerEmpleado() {
    this.empleado = [];
    this.restE.BuscarUnEmpleado(this.id_empleado).subscribe(data => {
      this.empleado = data[0];
    })
  }

  // METODO PARA MOSTRAR LISTA DE PERMISOS DE ACUERDO AL ROL
  ObtenerTiposPermiso() {
    this.tipoPermisos = [];
    let rol = this.loginServise.getRol();
    if (rol >= 2) {
      this.tipoPermiso.ListarTipoPermisoRol(1).subscribe(res => {
        this.tipoPermisos = res;
      });
    } else {
      this.tipoPermiso.BuscarTipoPermiso().subscribe(datos => {
        this.tipoPermisos = datos;
      });
    }
  }

  // METODO PARA OBTENER DATOS DEL USUARIO
  actuales: any = [];
  ObtenerDatos() {
    this.actuales = [];
    this.informacion_.ObtenerDatosActuales(this.id_empleado).subscribe((datos: any) => {
      this.actuales = datos[0];
    });
  }

  // METODO PARA IMPRIMIR DATOS DE TIPO DE PERMISO CREADO
  BuscarTipoPermiso() {
    this.datosPermiso = [];
    this.tipoPermiso.BuscarUnTipoPermiso(this.info.id_tipo_permiso).subscribe((datos: any) => {

      // VARIABLES GLOBALES SETEADAS EN 0
      this.Tdias = 0;
      this.Thoras = 0;

      // ALMACENAMIENTO DE DATOS DE PERMISO
      this.informacion = true;
      this.datosPermiso = datos[0];

      // PERMISO LEGALIZADO
      this.legalizado = this.datosPermiso.legalizar;

      // SOLICITUD POR HORAS
      if (this.datosPermiso.dias_maximo_permiso === 0) {
        this.informacion1 = `Horas máximas de permiso: ${this.datosPermiso.horas_maximo_permiso}`;
        this.Thoras = this.datosPermiso.horas_maximo_permiso;
        this.configuracion_permiso = 'Horas';
      }
      // SOLICITUD POR DIAS
      else if (this.datosPermiso.horas_maximo_permiso === '00:00:00') {
        this.informacion1 = `Días máximos de permiso: ${this.datosPermiso.dias_maximo_permiso}`;
        this.Tdias = this.datosPermiso.dias_maximo_permiso;
        this.configuracion_permiso = 'Dias';
      }

      // MENSAJE DESCUENTO ALIMENTACION
      if (this.datosPermiso.incluir_minutos_comida === true) {
        this.informacion3 = `Aplica descuento de minutos de alimentación si el permisos solicitado se encuentra dentro del horario de alimentación.`;
      }
      else {
        this.informacion3 = '';
      }

      // MENSAJE DIAS PREVIOS DE SOLICITUD
      this.informacion4 = `Número de días previos para cargar solicitud: ${this.datosPermiso.dias_anticipar_permiso} días.`;

      // DOCUMENTO REQUERIDO
      this.certificado = this.datosPermiso.documento;

      // DOCUMENTO CARGADO EN EL SISTEMA
      if (this.info.documento != null && this.info.documento != '') {
        this.documento_editar = true;
        this.documento = false;
      }
      else {
        this.documento = true;
        this.documento_editar = false;
      }

      // TIPO DESCUENTO
      if (this.datosPermiso.tipo_descuento === '1') {
        this.BuscarPeriodoVacaciones();
      }
      else {
        this.periodo_vacaciones = 0;
      }
    })
  }

  // METODO PARA IMPRIMIR EN EL FORMULARIO LA INFORMACION DEL PERMISO SOLICITADO
  documento: boolean = false;
  documento_editar: boolean = false;
  MostrarDatos() {
    // MOSTRAR INFORMACION DEL PERMISO
    this.BuscarTipoPermiso();

    this.dSalida = DateTime.fromISO(this.info.fecha_inicio).toFormat('yyyy-MM-dd');
    this.dIngreso = DateTime.fromISO(this.info.fecha_final).toFormat('yyyy-MM-dd');

    this.formulario.patchValue({
      horasIngresoForm: this.info.hora_ingreso,
      fechaInicioForm: DateTime.fromISO(this.info.fecha_inicio).toFormat('yyyy-MM-dd'),
      descripcionForm: this.info.descripcion,
      horaSalidaForm: this.info.hora_salida,
      fechaFinalForm: DateTime.fromISO(this.info.fecha_final).toFormat('yyyy-MM-dd'),
      idPermisoForm: this.info.id_tipo_permiso,
      diaLaboralForm: this.info.dias_permiso,
      diaLibreForm: this.info.dia_libre,
      horasForm: this.info.horas_permiso,
      diasForm: this.info.dias_permiso + this.info.dia_libre,
    });

    if (this.info.dias_permiso === 0) {
      this.habilitarDias = false;
      this.activar_hora = true;
      this.configuracion_permiso = 'Horas';
      this.solicitarF.setValue('Horas');
      if (this.dSalida != this.dIngreso) {
        this.especialF.setValue(true);
      }
    }
    else if (this.info.horas_permiso === '00:00:00') {
      this.habilitarDias = true;
      this.activar_hora = false;
      this.configuracion_permiso = 'Dias';
      this.solicitarF.setValue('Dias');
    }
  }

  // IMPRIMIR DATOS DEL TIPO DE PERMISO SELECCIONADO
  activar_comida: boolean = false;
  activar_hora: boolean = false;
  informacion: boolean = false;
  legalizado: boolean = false;
  certificado: boolean = false;
  ImprimirDatos(form: any) {
    this.LimpiarComida(false);
    this.datosPermiso = [];
    this.tipoPermiso.BuscarUnTipoPermiso(form.idPermisoForm).subscribe((datos: any) => {
      console.log('datos de tipo de permisos ', datos)
      // VARIABLES GLOBALES SETEADAS EN 0
      this.Tdias = 0;
      this.Thoras = 0;

      // ALMACENAMIENTO DE DATOS DE PERMISO
      this.informacion = true;
      this.datosPermiso = datos[0];

      // PERMISO LEGALIZADO
      this.legalizado = this.datosPermiso.legalizar;

      // DOCUMENTO REQUERIDO
      this.certificado = this.datosPermiso.documento;

      // SOLICITUD POR HORAS
      if (this.datosPermiso.dias_maximo_permiso === 0) {
        this.LimpiarFormulario('');
        this.informacion1 = `Horas máximas de permiso: ${this.datosPermiso.horas_maximo_permiso}`;
        this.habilitarDias = false;
        this.activar_hora = true;
        this.formulario.patchValue({
          solicitarForm: 'Horas',
        });
        this.Thoras = this.datosPermiso.horas_maximo_permiso;
        this.configuracion_permiso = 'Horas';
      }
      // SOLICITUD POR DIAS
      else if (this.datosPermiso.horas_maximo_permiso === '00:00:00') {
        this.LimpiarFormulario('00:00');
        this.informacion1 = `Días máximos de permiso: ${this.datosPermiso.dias_maximo_permiso}`;
        this.habilitarDias = true;
        this.activar_hora = false;
        this.formulario.patchValue({
          solicitarForm: 'Dias',
        });
        this.Tdias = this.datosPermiso.dias_maximo_permiso;
        this.configuracion_permiso = 'Dias';
      }

      // TIPO DESCUENTO
      if (this.datosPermiso.tipo_descuento === '1') {
        this.BuscarPeriodoVacaciones();
      }
      else {
        this.periodo_vacaciones = 0;
      }

      // MENSAJE DESCUENTO ALIMENTACION
      if (this.datosPermiso.incluir_minutos_comida === true) {
        this.informacion3 = `Aplica descuento de minutos de alimentación si el permisos solicitado se encuentra dentro del horario de alimentación.`;
      }
      else {
        this.informacion3 = '';
      }

      // MENSAJE DIAS PREVIOS DE SOLICITUD
      this.informacion4 = `Número de días previos para cargar solicitud: ${this.datosPermiso.dias_anticipar_permiso} días.`;
    })
  }

  // METODO PARA BUSCAR PERIODO DE VACACIONES
  periodo_vacaciones: number = 0;
  BuscarPeriodoVacaciones() {
    this.restPerV.BuscarIDPerVacaciones(this.id_empleado).subscribe((datos: any) => {
      this.periodo_vacaciones = datos[0].id;
    }, error => {
      this.toastr.info('No tiene registrado un periodo de vacaciones.',
        'Está solicitando un permiso con descuento a vacaciones.', {
        timeOut: 6000,
      });
      this.formulario.reset();
    });
  }

  // ACTIVAR FORMULARIO DE ACUERDO A SELECCION DE TIPO
  ActivarDiasHoras(form: any) {
    this.LimpiarComida(false);
    if (form.solicitarForm === 'Dias') {
      this.LimpiarFormulario('00:00');
      this.activar_hora = false;
      this.habilitarDias = true;
    }
    else if (form.solicitarForm === 'Horas') {
      this.LimpiarFormulario('');
      this.activar_hora = true;
      this.habilitarDias = false;
    }
  }

  // METODO DE VALIDACIONES DE FECHA DE INICIO
  dSalida: any;
  ValidarFechaSalida(event: any, form: any) {

    this.LimpiarComida(false);

    // LIMPIAR CAMPOS DE FECHAS
    if (form.solicitarForm === 'Dias') {
      this.LimpiarInformacion('00:00');
    }
    else if (form.solicitarForm === 'Horas') {
      this.LimpiarInformacion('');
    }

    // VALIDACION DE SELECCION DE TIPO DE PERMISOS
    if (form.idPermisoForm != '') {

      // LECTURA DE FECHAS
      this.dSalida = event.value;
      var leer_fecha = event.value._i;
      var fecha = leer_fecha.toISOString();
      var inicio = DateTime.fromFormat(fecha, 'yyyy-MM-dd').toFormat("yyyy-MM-dd");

      // VERIFICACION DE RESTRICCION DE FECHAS
      if (this.datosPermiso.fec_validar === true) {
        var fecha_negada_inicio = this.datosPermiso.fecha_inicio.split('T')[0];
        var fecha_negada_fin = this.datosPermiso.fecha_fin.split('T')[0];

        // VERIFICACION DE FECHA NO VALIDA CON LA SALIDA DE PERMISO
        if (Date.parse(inicio) >= Date.parse(fecha_negada_inicio) && Date.parse(inicio) <= Date.parse(fecha_negada_fin)) {
          this.toastr.warning('En la fecha ingresada no es posible otorgar este tipo de permiso.', 'VERIFICAR', {
            timeOut: 4000,
          });
          this.fechaInicioF.setValue('');
        }
        else {
          this.ValidarRestricionesFechas(inicio);
        }
      }
      else {
        this.ValidarRestricionesFechas(inicio);
      }
    }
    else {
      this.toastr.warning('Ups!!! no ha seleccionado ningún tipo de permiso.', '', {
        timeOut: 4000,
      });
      this.fechaInicioF.setValue('');
    }
  }

  // METODO DE TRATAMIENTO DE CONFIGURACIONES DE FECHAS DE TIPO DE PERMISOS
  ValidarRestricionesFechas(inicio: any) {
    if (DateTime.fromISO(inicio).toFormat('yyyy') < DateTime.fromISO(this.FechaActual).toFormat('yyyy')) {
      this.ValidarAñosAnteriores(inicio);
    }
  }

  // METODO PARA VALIDAR FECHAS DE AÑOS PASADOS
  ValidarAñosAnteriores(inicio: any) {
    const mesInicial = DateTime.now().startOf('year');
    var dias = this.datosPermiso.num_dia_anterior;
    if (dias > 0) {
      // RESTAR DIAS
      const restar = mesInicial.minus({ days: dias });

      if (DateTime.fromISO(inicio) >= restar) {
      }
      else {
        this.toastr.warning('Ups!!! ha superado el limite de días permitidos para actualizar solicitudes.', '', {
          timeOut: 4000,
        });
        this.fechaInicioF.setValue('');
      }
    }
  }

  // IMPRIMIR FECHA TIPO SOLICITUD HORAS
  ImprimirFecha(form: any) {
    if (form.solicitarForm === 'Horas') {
      // SI CASO ESPECIAL SELECCIONADO
      if (form.especialForm === true) {
        // SUMAR UN DIA A LA FECHA
        var fecha = DateTime.fromFormat(form.fechaInicioForm, 'yyyy-MM-dd').plus({ days: 1 }).toFormat('yyyy-MM-dd');
        this.fechaFinalF.setValue(fecha);
      } else {
        // MENTENER FECHA IGUAL
        this.fechaFinalF.setValue(form.fechaInicioForm);
      }
    }
  }

  // METODO PARA VALIDAR FECHA DE FINALIZACION DE PERMISO
  dIngreso: any;
  horas: any = [];
  ValidarFechaIngreso(event: any, form: any) {

    //VALIDAR INGRESO DE FECHA DE SALIDA Y SELECCION DE TIPO DE PERMISO
    if (form.fechaInicioForm != '' && form.idPermisoForm != '') {

      // CAPTURAR FECHA Y FORMATEAR A YYYY-MM-DD
      this.dIngreso = event.value;
      var inicio = DateTime.fromFormat(this.dSalida, 'yyyy-MM-dd').toFormat('yyyy-MM-dd');
      var final = DateTime.fromFormat(this.dIngreso, 'yyyy-MM-dd').toFormat('yyyy-MM-dd');

      // VERIFICAR QUE LAS FECHAS INGRESADAS DE FORMA CORRECTA
      if (Date.parse(inicio) > Date.parse(final)) {
        this.toastr.warning('Las fechas no han sido ingresadas de forma correcta.', 'VERIFICAR', {
          timeOut: 6000,
        });
        this.fechaInicioF.setValue('');
        this.fechaFinalF.setValue('');
      }
      // SI FECHAS INGRESADAS CORRECTAMENTE
      else {

        // VERIFICACION DE RESTRICCION DE FECHAS
        if (this.datosPermiso.fec_validar === true) {
          var fecha_negada_inicio = this.datosPermiso.fecha_inicio.split('T')[0];
          var fecha_negada_fin = this.datosPermiso.fecha_fin.split('T')[0];

          // VERIFICACION DE FECHA NO VALIDA CON LA SALIDA DE PERMISO
          if ((Date.parse(fecha_negada_inicio) >= Date.parse(inicio) && Date.parse(fecha_negada_inicio) <= Date.parse(final)) ||
            (Date.parse(fecha_negada_fin) >= Date.parse(inicio) && Date.parse(fecha_negada_fin) <= Date.parse(final))) {
            this.toastr.warning('En la fecha ingresada no es posible otorgar este tipo de permiso.', 'VERIFICAR', {
              timeOut: 4000,
            });
            this.fechaFinalF.setValue('');
          }
          else {
            // BUSQUEDA DE FERIADOS
            this.BuscarFeriados(form);
          }
        }
        else {
          // BUSQUEDA DE FERIADOS
          this.BuscarFeriados(form);
        }
      }
    }
    // MENSAJE NO HA SELECCIONADO TIPO DE PERMISO O NO HA INGRESADO FECHA
    else {
      this.toastr.warning('Seleccione un tipo de permiso e ingrese fecha de inicio de permiso.', 'Ups!!! algo salio mal.', {
        timeOut: 4000,
      });
      this.LimpiarInformacion('');
      this.LimpiarComida(false);
    }
  }

  // METODO PARA VALIDAR QUE SE INGRESE DIAS - HORAS DE SOLICITUD DE PERMISOS
  ValidarConfiguracionDias() {
    if (this.configuracion_permiso === 'Dias') {
      const resta = this.dIngreso.diff(this.dSalida, 'days');
      this.diasF.setValue(resta + 1);
      if ((resta + 1) > this.Tdias) {
        this.toastr.warning(
          `Sin embargo los dias máximos de permiso son ${this.Tdias}.`,
          `Ha solicitado ${resta + 1} días de permiso.`, {
          timeOut: 6000,
        });
        this.LimpiarInformacion('00:00');
        this.LimpiarComida(false);
      }
      else {
        this.ContarDiasSolicitados();
      }
    }
    else if (this.configuracion_permiso === 'Horas') {
      this.toastr.warning
        (`No puede solicitar días de permiso.
              Las horas de permiso que puede solicitar deben ser menores o iguales a: ${String(this.Thoras)} horas.`,
          'Este tipo de permiso esta configurado por horas.', {
          timeOut: 6000,
        })
      this.LimpiarInformacion('');
      this.LimpiarComida(false);
    }
  }

  // BUSCAR FERIADOS FECHAS DEL PERMISO
  LeerFeriadosPermiso() {
    this.feriados = [];
    let datos = {
      fecha_inicio: DateTime.fromISO(this.info.fecha_inicio).toFormat('yyyy-MM-dd'),
      fecha_final: DateTime.fromISO(this.info.fecha_final).toFormat('yyyy-MM-dd'),
      id_empleado: this.id_empleado
    }
    this.feriado.ListarFeriadosCiudad(datos).subscribe(data => {
      this.feriados = data;
      this.LeerRecuperacionFeriadosPermiso(datos);
    }, vacio => {
      this.LeerRecuperacionFeriadosPermiso(datos);
    })
  }


  // BUSCAR FERIADOS RECUPERACION FECHAS DEL PERMISO
  LeerRecuperacionFeriadosPermiso(datos: any) {
    this.recuperar = [];
    this.feriado.ListarFeriadosRecuperarCiudad(datos).subscribe(data => {
      this.recuperar = data;
      this.BuscarRegistroFechasHorario();
    }, vacio => {
      this.BuscarRegistroFechasHorario();
    })
  }

  // METODO PARA BUSCAR FECHAS DE UNA PLANIFICACION HORARIA
  BuscarRegistroFechasHorario() {
    this.horario = [];
    let datos = {
      fecha_inicio: DateTime.fromISO(this.info.fecha_inicio).toFormat('yyyy-MM-dd'),
      fecha_final: DateTime.fromISO(this.info.fecha_final).toFormat('yyyy-MM-dd'),
      id_empleado: this.empleado.id
    }
    this.planificar.BuscarHorarioFechas(datos).subscribe(data => {
      this.horario = data;
      this.ContarDiasSolicitados();
    }, vacio => {
      this.ContarDiasSolicitados();
    })
  }

  // METODO PARA VERIFICAR DATOS DE HORAS INGRESADAS
  VerificarHoras(form: any) {

    // ENCERAR VARIABLES
    var fecha_inicio: string = '';
    var fecha_final: string = '';
    var hora_inicio_: string = '';
    var hora_final_: string = '';
    var verificador: number = 0;
    var datos: any = [];
    this.horasF.setValue('');
    this.LimpiarComida(false);

    // VERIFICAR QUE SE HAYA INGRESADO HORAS
    if (form.horaSalidaForm != '' && form.horasIngresoForm != '') {

      // FORMATO DE FECHAS
      fecha_inicio = DateTime.fromFormat(this.dSalida, 'yyyy-MM-dd').toFormat('yyyy-MM-dd');
      fecha_final = DateTime.fromFormat(form.fechaFinalForm, 'yyyy-MM-dd').toFormat('yyyy-MM-dd');
      hora_inicio_ = DateTime.fromFormat(form.horaSalidaForm, "HH:mm:ss").toFormat('HH:mm:ss');
      hora_final_ = DateTime.fromFormat(form.horasIngresoForm, "HH:mm:ss").toFormat('HH:mm:ss');

      if (hora_inicio_ === '00:00:00' && hora_final_ === '00:00:00') {
        this.toastr.warning(
          `No es posible registrar un permiso de 0 horas.`,
          'Ups!!! algo salio mal.', {
          timeOut: 6000,
        });
      }
      else {
        // METODO PARA BUSCAR PERMISOS SOLICITADOS POR HORAS
        let solicitud = {
          fec_inicio: fecha_inicio,
          fec_final: fecha_final,
          hora_inicio: hora_inicio_,
          hora_final: hora_final_,
          id_empleado: this.empleado.id,
          id: this.info.id
        }
        this.restP.BuscarPermisosSolicitadosHorasEditar(solicitud).subscribe(solicitados => {
          // EXISTEN REGISTROS DE PERMISOS POR HORAS
          if (solicitados.length != 0) {
            this.toastr.info('En las fechas ingresadas existe una solicitud de permiso en estado PENDIENTE o APROBADA.',
              'VERIFICAR SOLICITUD DE PERMISO.', {
              timeOut: 6000,
            });
            this.fechaInicioF.setValue('');
            this.LimpiarInformacion('00:00');
            this.LimpiarComida(false);
            // NO EXISTEN PERMISOS SOLICITADOS POR HORAS
          } else {
            // SEE LEE METODOS DE ACUERDO A SELECCION DE USUARIO
            if (form.especialForm === false) {
              this.VerificarFechasIguales(form, datos, verificador, fecha_inicio, fecha_final, hora_inicio_, hora_final_);
            } else {
              this.VerificarFechasDiferentes(form, datos, verificador, fecha_inicio, fecha_final, hora_inicio_, hora_final_);
            }
          }
        })
      }
    }
    else {
      this.toastr.info('Debe ingresar hora desde y hora hasta para realizar el cálculo.', 'VERIFICAR', {
        timeOut: 6000,
      })
    }
  }

  // METODO PARA LEER DATOS DE HORAS EN EL MISMO DIA
  VerificarFechasIguales(form: any, datos: any, verificador: any, fecha_inicio: any, fecha_final: any, hora_inicio_: any, hora_final_: any) {
    datos = [];
    this.LimpiarComida(false);
    // METODO PARA BUSCAR PERMISOS SOLICITADOS POR DIAS
    let horario = {
      fecha_inicio: fecha_inicio,
      hora_inicio: form.horaSalidaForm,
      hora_final: form.horasIngresoForm,
      codigo: this.empleado.codigo
    }
    // BUSQUEDA DE HORARIOS EN UN DIA Y HORAS
    this.restH.BuscarHorarioHorasMD(horario).subscribe(informacion => {
      console.log('informacion', informacion)
      datos = informacion.respuesta;
      // HORARIOS CON FINALIZACION DE JORNADA EN UN MISMO DIA
      if (informacion.message === 'CASO_1') {
        for (let i = 0; i < datos.length; i++) {
          if (datos[i].tipo_dia_entrada === 'L') {
            verificador = 3;
          }
          else {
            if (hora_inicio_ >= datos[i].hora_inicio && hora_final_ <= datos[i].hora_final) {
              verificador = 1;
              if (this.datosPermiso.incluir_minutos_comida === true) {
                this.VerificarFechasIgualesComida(form, fecha_inicio, fecha_final, hora_inicio_, hora_final_, datos[i]);
              }
              else {
                this.CalcularHoras(form, fecha_inicio, fecha_final, hora_inicio_, hora_final_, 0);
              }
              break;
            }
            else {
              verificador = 2;
            }
          }
        }
      }
      // HORARIOS CON FINALIZACION DE JORNADA AL SIGUIENTE DIA
      else if (informacion.message === 'CASO_2') {
        // RECORRER TODOS LOS DATOS DE HORARIOS EXISTENTES
        for (let i = 0; i < datos.length; i++) {
          // FORMATEAR FECHAS
          var entrada = DateTime.fromFormat(datos[i].fecha_entrada, 'yyyy-MM-dd').toFormat('yyyy-MM-dd');
          var salida = DateTime.fromFormat(datos[i].fecha_salida, 'yyyy-MM-dd').toFormat('yyyy-MM-dd');

          // CONDICION UNO: FECHA INGRESADA = A LA FECHA DE INGRESO DEL USUARIO
          if (entrada === fecha_inicio) {
            // LA HORA INGRESADA DE INICIO DEDE SER >= QUE LA HORA DE INICIO DE JORNADA
            if (hora_inicio_ >= datos[i].hora_inicio) {
              // CONDICIONES QUE DEBEN CUMPLIR
              // LA HORA FINAL ES 00:00:00 (HORA DE FINALIZACION DE DIA SE TOMA COMO UN NUEVO DIA)
              if (hora_final_ === '00:00:00') {
                verificador = 2;
              }
              else {
                // LA HORA FINAL ES <= '23:59:00' Y LA HORA FINAL ES > QUE LA HORA DE INICIO
                if (hora_final_ <= '23:59:00' && hora_final_ > datos[i].hora_inicio) {
                  verificador = 1;
                  if (this.datosPermiso.incluir_minutos_comida === true) {
                    this.VerificarFechasIgualesComida(form, fecha_inicio, fecha_final, hora_inicio_, hora_final_, datos[i]);
                  }
                  else {
                    this.CalcularHoras(form, fecha_inicio, fecha_final, hora_inicio_, hora_final_, 0);
                  }
                  break;
                }
                else {
                  verificador = 2;
                }
              }
            }
            else {
              verificador = 2;
            }
          }
          else {
            // CONDICION DOS: FECHA INGRESADA = A LA FECHA DE SALIDA DEL USUARIO
            if (salida === fecha_inicio) {
              // LA HORA FINAL DEBE SER <= A LA HORA DE SALIDA DEL USUARIO
              if (hora_final_ <= datos[i].hora_final) {
                // CONDICIONES QUE SE DEBE CUMPLIR
                // SI LA HORA DE INICIO ES 00:00:00 (INICIO DE UN NUEVO DIA)
                if (hora_inicio_ === '00:00:00') {
                  verificador = 1;
                  if (this.datosPermiso.incluir_minutos_comida === true) {
                    this.VerificarFechasIgualesComida(form, fecha_inicio, fecha_final, hora_inicio_, hora_final_, datos[i]);
                  }
                  else {
                    this.CalcularHoras(form, fecha_inicio, fecha_final, hora_inicio_, hora_final_, 0);
                  }
                  break;
                }
                else {
                  // LA HORA DE INICIO DEBE SER >= 00:01:00 Y LA HORA DE INICIO DEBE SER < QUE LA HORA DE SALIDA DEL USUARIO
                  if (hora_inicio_ >= '00:01:00' && hora_inicio_ < datos[i].hora_final) {
                    verificador = 1;
                    if (this.datosPermiso.incluir_minutos_comida === true) {
                      this.VerificarFechasIgualesComida(form, fecha_inicio, fecha_final, hora_inicio_, hora_final_, datos[i]);
                    }
                    else {
                      this.CalcularHoras(form, fecha_inicio, fecha_final, hora_inicio_, hora_final_, 0);
                    }
                    break;
                  }
                  else {
                    verificador = 2;
                  }
                }
              }
              else {
                verificador = 2;
              }
            }
          }
        }
      }
      // HORARIOS CON FINALIZACION DE JORNADA AL TERCER DIA
      else if (informacion.message === 'CASO_3') {
        // RECORRER TODOS LOS DATOS DE HORARIOS EXISTENTES
        for (let i = 0; i < datos.length; i++) {
          // FORMATEAR FECHAS
          var entrada = DateTime.fromFormat(datos[i].fecha_entrada, "yyyy-MM-dd").toFormat("yyyy-MM-dd");
          var intermedio = DateTime.fromFormat(datos[i].fecha_entrada, 'yyyy-MM-dd').plus({ days: 1 }).toFormat('yyyy-MM-dd');
          var salida = DateTime.fromFormat(datos[i].fecha_salida, "yyyy-MM-dd").toFormat("yyyy-MM-dd");

          // CONDICION UNO: FECHA INGRESADA = A LA FECHA DE INGRESO DEL USUARIO
          if (entrada === fecha_inicio) {
            // LA HORA INGRESADA DE INICIO DEDE SER >= QUE LA HORA DE INICIO DE JORNADA
            if (hora_inicio_ >= datos[i].hora_inicio) {
              // CONDICIONES QUE DEBEN CUMPLIR
              // LA HORA FINAL ES 24:00:00 (HORA DE FINALIZACION DE DIA)
              if (hora_final_ === '00:00:00') {
                verificador = 1;
                this.CalcularHoras(form, fecha_inicio, fecha_final, hora_inicio_, hora_final_, 0);
                break;
              }
              else {
                // LA HORA FINAL ES <= '23:59:00' Y LA HORA FINAL ES > QUE LA HORA DE INICIO
                if (hora_final_ <= '23:59:00' && hora_final_ > datos[i].hora_inicio) {
                  verificador = 1;
                  this.CalcularHoras(form, fecha_inicio, fecha_final, hora_inicio_, hora_final_, 0);
                  break;
                }
                else {
                  verificador = 2;
                }
              }
            }
            else {
              verificador = 2;
            }
          }
          // CONDICION DOS: FECHA INGRESADA = A LA FECHA DE SALIDA DEL USUARIO
          else if (salida === fecha_inicio) {

            // LA HORA FINAL DEBE SER <= A LA HORA DE SALIDA DEL USUARIO
            if (hora_final_ <= datos[i].hora_final) {
              // CONDICIONES QUE SE DEBE CUMPLIR
              // SI LA HORA DE INICIO ES 00:00:00 (INICIO DE UN NUEVO DIA)
              if (hora_inicio_ === '00:00:00') {
                verificador = 1;
                this.CalcularHoras(form, fecha_inicio, fecha_final, hora_inicio_, hora_final_, 0);
                break;
              }
              else {
                // LA HORA DE INICIO DEBE SER >= 00:01:00 Y LA HORA DE INICIO DEBE SER < QUE LA HORA DE SALIDA DEL USUARIO
                if (hora_inicio_ >= '00:01:00' && hora_inicio_ < datos[i].hora_final) {
                  verificador = 1;
                  this.CalcularHoras(form, fecha_inicio, fecha_final, hora_inicio_, hora_final_, 0);
                  break;
                }
                else {
                  verificador = 2;
                }
              }
            }
            else {
              verificador = 2;
            }
          }
          else if (intermedio === fecha_inicio) {
            verificador = 1;
            this.CalcularHoras(form, fecha_inicio, fecha_final, hora_inicio_, hora_final_, 0);
            break;
          }
        }
      }

      // SI NO CUMPLE CON LAS CONDICIONES
      if (verificador === 2) {
        this.EmitirMensajeError();
      }
      else if (verificador === 3) {
        this.EmitirMensajeErrorLibre();
      }

    }, vacio => {
      this.EmitirMensajeError();
    })
  }

  // METODO PARA LEER DATOS DE HORAS EN DIAS DIFERENTES
  VerificarFechasDiferentes(form: any, datos: any, verificador: any, fecha_inicio: any, fecha_final: any, hora_inicio_: any, hora_final_: any) {
    this.LimpiarComida(false);
    // METODO PARA BUSCAR PERMISOS SOLICITADOS POR DIAS
    let horario = {
      fecha_inicio: fecha_inicio,
      fecha_final: fecha_final,
      codigo: this.empleado.codigo
    }
    // BUSQUEDA DE HORARIOS EN UN DIA Y HORAS
    this.restH.BuscarHorarioHorasDD(horario).subscribe(informacion => {
      datos = informacion.respuesta;
      console.log('ver informacion ', informacion)
      // HORARIOS CON FINALIZACION DE JORNADA EN DIAS DIFERENTES (SEGUNDO DIA)
      if (informacion.message === 'CASO_4') {
        // RECORRER TODOS LOS DATOS DE HORARIOS EXISTENTES
        for (let i = 0; i < datos.length; i++) {
          if (hora_inicio_ >= datos[i].hora_inicio && hora_final_ <= datos[i].hora_final) {
            verificador = 1;
            if (this.datosPermiso.incluir_minutos_comida === true) {
              this.VerificarFechasDiferentesComida(form, datos[i], fecha_inicio, fecha_final, hora_inicio_, hora_final_);
            }
            else {
              this.CalcularHoras(form, fecha_inicio, fecha_final, hora_inicio_, hora_final_, 0);
            }
            break;
          }
          else {
            verificador = 2;
          }
        }
      }
      // HORARIOS CON FINALIZACION DE JORNADA EN DIAS DIFERENTES (TERCER DIA)
      else if (informacion.message === 'CASO_5') {
        // RECORRER TODOS LOS DATOS DE HORARIOS EXISTENTES
        for (let i = 0; i < datos.length; i++) {
          // FORMATEAR FECHAS
          var entrada = DateTime.fromFormat(datos[i].fecha_entrada, "yyyy-MM-dd").toFormat("yyyy-MM-dd");
          var intermedio = DateTime.fromFormat(datos[i].fecha_entrada, "yyyy-MM-dd").plus({ days: 1 }).toFormat("yyyy-MM-dd");

          if (entrada === fecha_inicio) {
            if (hora_inicio_ >= datos[i].hora_inicio) {
              verificador = 1;
              this.CalcularHoras(form, fecha_inicio, fecha_final, hora_inicio_, hora_final_, 0);
              break;
            }
            else {
              verificador = 2;
            }
          }
          else if (intermedio === fecha_inicio) {
            if (hora_final_ <= datos[i].hora_final) {
              verificador = 1;
              this.CalcularHoras(form, fecha_inicio, fecha_final, hora_inicio_, hora_final_, 0);
              break;
            }
            else {
              verificador = 2;
            }
          }
        }
      }
      // SI NO CUMPLE CON LAS CONDICIONES
      if (verificador === 2) {
        this.EmitirMensajeError();
      }
    }, vacio => {
      this.EmitirMensajeError();
    })
  }

  // METODO PARA LEER DATOS DE HORAS - ALIMENTACION EN EL MISMO DIA
  VerificarFechasIgualesComida(form: any, fecha_inicio: any, fecha_final: any, hora_inicio_: any, hora_final_: any, horario_: any) {
    let verificador = 0;
    let datos: any = [];
    // METODO PARA BUSCAR PERMISOS SOLICITADOS POR DIAS
    let horario = {
      fecha_inicio: fecha_inicio,
      hora_inicio: form.horaSalidaForm,
      hora_final: form.horasIngresoForm,
      codigo: this.empleado.codigo
    }
    // BUSQUEDA DE HORARIOS EN UN DIA Y HORAS
    this.restH.BuscarComidaHorarioHorasMD(horario).subscribe(informacion => {
      console.log('informacion comida', informacion)
      datos = informacion.respuesta;
      // HORARIOS CON FINALIZACION DE JORNADA EN UN MISMO DIA
      if (informacion.message === 'CASO_1') {
        for (let i = 0; i < datos.length; i++) {
          this.CalcularHoras(form, fecha_inicio, fecha_final, hora_inicio_, hora_final_, datos[i].almuerzo_min);
        }
      }
      // HORARIOS CON FINALIZACION DE JORNADA AL SIGUIENTE DIA
      else if (informacion.message === 'CASO_2') {
        // RECORRER TODOS LOS DATOS DE HORARIOS EXISTENTES
        for (let i = 0; i < datos.length; i++) {
          // FORMATEAR FECHAS
          var entrada = DateTime.fromFormat(datos[i].fecha_entrada, "yyyy-MM-dd").toFormat("yyyy-MM-dd");
          var salida = DateTime.fromFormat(datos[i].fecha_salida, "yyyy-MM-dd").toFormat("yyyy-MM-dd");
          // CONDICION UNO: FECHA INGRESADA = A LA FECHA DE INGRESO DEL USUARIO
          if (entrada === fecha_inicio) {

            if ((hora_final_ <= '23:59:00' && hora_final_ > datos[i].hora_inicio) &&
              ((hora_inicio_ <= datos[i].hora_inicio || hora_inicio_ >= datos[i].hora_inicio) &&
                hora_inicio_ >= horario_.hora_inicio)) {
              console.log('entra if entrada = fecha_inicio')
              this.CalcularHoras(form, fecha_inicio, fecha_final, hora_inicio_, hora_final_, datos[i].almuerzo_min);
              break;
            }
            else {
              console.log('entra else entrada = fecha_inicio')
              verificador = 2;
            }
          }
          else {
            // CONDICION DOS: FECHA INGRESADA = A LA FECHA DE SALIDA DEL USUARIO
            if (salida === fecha_inicio) {
              if ((hora_inicio_ >= '00:00:00' && hora_inicio_ < datos[i].hora_final) &&
                ((hora_final_ >= datos[i].hora_final || hora_final_ <= datos[i].hora_final) &&
                  hora_final_ <= horario_.hora_final)) {
                console.log('entra if salida = fecha_inicio')
                this.CalcularHoras(form, fecha_inicio, fecha_final, hora_inicio_, hora_final_, datos[i].almuerzo_min);
                break;
              }
              else {
                console.log('entra else salida = fecha_inicio')
                verificador = 2;
              }
            }
          }
        }
      }
      if (verificador === 2) {
        this.CalcularHoras(form, fecha_inicio, fecha_final, hora_inicio_, hora_final_, 0);
      }
    }, vacio => {
      console.log('entra sin validaciones')
      this.CalcularHoras(form, fecha_inicio, fecha_final, hora_inicio_, hora_final_, 0);
    })
  }

  // METODO PARA LEER DATOS DE HORAS - ALIMENTACION EN DIAS DIFERENTES
  VerificarFechasDiferentesComida(form: any, horario_: any, fecha_inicio: any, fecha_final: any, hora_inicio_: any, hora_final_: any) {
    let datos_: any = [];
    let verificador = 0;
    // METODO PARA BUSCAR PERMISOS SOLICITADOS POR DIAS
    let horario = {
      fecha_inicio: fecha_inicio,
      fecha_final: fecha_final,
      codigo: this.empleado.codigo
    }
    // BUSQUEDA DE HORARIOS EN UN DIA Y HORAS
    this.restH.BuscarComidaHorarioHorasDD(horario).subscribe(informacion => {
      datos_ = informacion.respuesta;
      console.log('ver informacion comida caso 4', informacion)
      // HORARIOS CON FINALIZACION DE JORNADA EN DIAS DIFERENTES (SEGUNDO DIA)
      if (informacion.message === 'CASO_4') {
        // RECORRER TODOS LOS DATOS DE HORARIOS EXISTENTES
        for (let i = 0; i < datos_.length; i++) {
          if (hora_inicio_ >= datos_[i].hora_inicio && hora_final_ <= datos_[i].hora_final) {
            verificador = 1;
            this.CalcularHoras(form, fecha_inicio, fecha_final, hora_inicio_, hora_final_, datos_[i].min_almuerzo);
          }
          else {
            verificador = 2;
          }
        }
      }
      // SI NO CUMPLE CON LAS CONDICIONES
      if (verificador === 2) {
        this.EmitirMensajeError();
      }
    }, vacio => {
      this.EmitirMensajeError();
    })
  }

  // METODO PARA CALCULAR HORAS DE PERMISO
  CalcularHoras(form: any, fecha_inicio: string, fecha_final: string, hora_inicio: string, hora_final: string, comida: any) {
    let resta;
    this.horasF.setValue('');

    // METODO PARA BUSCAR PERMISOS SOLICITADOS POR HORAS
    let solicitud = {
      fec_inicio: fecha_inicio,
      fec_final: fecha_final,
      hora_inicio: form.horaSalidaForm,
      hora_final: form.horasIngresoForm,
      id_empleado: this.empleado.id,
      id: this.info.id
    }
    this.restP.BuscarPermisosSolicitadosHorasEditar(solicitud).subscribe(solicitados => {
      if (solicitados.message != 'error') {
        // EXISTEN REGISTROS DE PERMISOS POR HORAS
        if (solicitados.length != 0) {
          this.toastr.info('En las fechas ingresadas ya existe una solicitud de permiso registrada.', 'VERIFICAR', {
            timeOut: 6000,
          });
          this.fechaInicioF.setValue('');
          this.LimpiarInformacion('');

          // NO EXISTEN PERMISOS SOLICITADOS POR HORAS
        } else {

          if (hora_final === '00:00:00') {
            hora_final = '24:00:00'
          }

          // FORMATO DE HORAS
          var inicio = Duration.fromISOTime(hora_inicio);
          var fin = Duration.fromISOTime(hora_final);

          if (form.especialForm === false) {
            // RESTAR HORAS
            resta = fin.minus(inicio);
          }
          else {
            var media_noche = Duration.fromISOTime('24:00:00');
            var inicio_dia = Duration.fromISOTime('00:00:00');

            // RESTAR HORAS
            var entrada = media_noche.minus(inicio);
            var salida = fin.minus(inicio_dia);

            resta = entrada.plus(salida);
          }

          // FORMATEAR HORAS Y MINUTOS
          const horas = String(resta.hours).padStart(2, '0');
          const minutos = String(resta.minutes).padStart(2, '0');

          // COMBINAR HORAS Y MINUTOS EN EL FORMATO DESEADO
          const tiempoTotal = `${horas}:${minutos}`;

          // ACTIVAR ALIMENTACION
          if (comida != 0) {
            // VERIFICAR ALIMENTCION
            this.CalcularAlimentacion(comida, tiempoTotal);
          }
          else {
            this.activar_comida = false;
            this.horasF.setValue(tiempoTotal);
            // VALIDAR NUMERO DE HORAS SOLICITADAS
            this.ValidarConfiguracionHoras(tiempoTotal + ':00');
          }

        }
      }
      else {
        this.toastr.error('Verifica los datos ingresados y vuelve a intentar.', 'Ups!!! algo salio mal.', {
          timeOut: 6000,
        })
      }
    })
  }

  // METODO PARA CALCULAR DESCUENTO POR ALIMENTACION
  CalcularAlimentacion(comida: any, tiempoTotal: any) {
    this.activar_comida = true;
    let descuento = this.TransformarSegundoHoras(comida * 60);
    this.horas_alimentacionF.setValue(descuento);
    this.horas_solicitadasF.setValue(tiempoTotal);

    var descuento_comida = Duration.fromISOTime(descuento);
    var tiempo_solicitado = Duration.fromISOTime((tiempoTotal + ':00'));

    if (descuento_comida >= tiempo_solicitado) {
      this.toastr.warning(
        `Revisar descuento de minutos de alimentación.`,
        `Ha solicitado '00:00:00' horas de permiso.`, {
        timeOut: 6000,
      });
      this.horasF.setValue('');
    }
    else {
      var total = tiempo_solicitado.subtract(descuento_comida);

      // COLOCAR FORMATO DE HORAS EN FORMULARIO
      var horast = String(total.hours());
      var minutost = String(total.minutes());

      if (total.hours() < 10) {
        horast = '0' + total.hours();
      }
      if (total.minutes() < 10) {
        minutost = '0' + total.minutes();
      }
      // COLOCAR FORMATO DE HORAS EN FORMULARIO
      var valorTotal: string = horast + ':' + minutost;

      this.horasF.setValue(valorTotal);
      // VALIDAR NUMERO DE HORAS SOLICITADAS
      this.ValidarConfiguracionHoras(valorTotal + ':00');
    }
  }

  // MENSAJE PARA MOSTRAR QUE NO SE ENCUENTRA PLANIFICACION
  EmitirMensajeError() {
    this.toastr.warning('No tiene asignada una planificación horaria en las fechas y horas ingresadas.', 'Ups!!! algo salio mal.', {
      timeOut: 6000,
    });
    this.fechaInicioF.setValue('');
    this.LimpiarInformacion('');
  }

  // MENSAJE PARA MOSTRAR QUE EL DIA SELECCIONADO ES LIBRE
  EmitirMensajeErrorLibre() {
    this.toastr.warning('El día registrado esta configurado como día libre.', 'Ups!!! algo salio mal.', {
      timeOut: 6000,
    });
    this.fechaInicioF.setValue('');
    this.LimpiarInformacion('');
  }

  // METODO PARA VERIFICAR INGRESO DE HORAS DE ACUERDO A LA CONFIGURACION DEL PERMISO
  ValidarConfiguracionHoras(valor: any) {
    if (valor === '00:00:00') {
      this.toastr.warning(
        `Ha solicitado ${valor} horas de permiso.`,
        `Ups!!! algo salio mal.`, {
        timeOut: 6000,
      });
      this.LimpiarInformacion('');
    }
    else {
      if (this.configuracion_permiso === 'Dias') {
        if (valor > this.horas.hora_trabaja) {
          this.MensajeIngresoHoras(this.horas.hora_trabaja, valor);
        }
      }
      else if (this.configuracion_permiso === 'Horas') {
        if (valor > this.Thoras) {
          this.MensajeIngresoHoras(this.horas.hora_trabaja, valor);
        }
      }
    }
  }

  // MENSAJES DE ERRORES EN INGRESO DE HORAS
  MensajeIngresoHoras(hora_empleado: any, valor: any) {
    if (this.configuracion_permiso === 'Dias') {
      this.toastr.warning(
        `Si solicita un permiso por horas recuerde que estás deben ser menores a ${hora_empleado} horas.
                Podría solicitar el permiso por días, máximo hasta ${String(this.Tdias)} dias de permiso.`,
        `Ha solicitado ${valor} horas de permiso.`, {
        timeOut: 6000,
      });
      this.LimpiarInformacion('');
    }
    else if (this.configuracion_permiso === 'Horas') {
      this.toastr.warning(
        `Las horas de permiso que puede solicitar deben ser menores o iguales a ${String(this.Thoras)} horas.`,
        `Ha solicitado ${valor} horas de permiso.`, {
        timeOut: 6000,
      });
      this.LimpiarInformacion('');
    }
  }

  // METODO PARA BUSCAR FERIADOS
  feriados: any = [];
  BuscarFeriados(form: any) {
    this.feriados = [];
    let datos = {
      fecha_inicio: DateTime.fromISO(form.fechaInicioForm).toFormat('yyyy-MM-dd'),
      fecha_final: DateTime.fromISO(form.fechaFinalForm).toFormat('yyyy-MM-dd'),
      id_empleado: parseInt(this.empleado.id)
    }
    if (form.solicitarForm === 'Horas' && form.especialForm === false) {
      datos.fecha_final = DateTime.fromISO(form.fechaInicioForm).toFormat('yyyy-MM-dd');
    }
    this.feriado.ListarFeriadosCiudad(datos).subscribe(data => {
      this.feriados = data;
      this.BuscarFeriadosRecuperar(form, datos);
    }, vacio => {
      this.BuscarFeriadosRecuperar(form, datos);
    })
  }

  // METODO PARA BUSCAR FECHAS DE RECUPERACION DE FERIADOS
  recuperar: any = [];
  BuscarFeriadosRecuperar(form: any, busqueda: any) {
    this.recuperar = [];
    this.feriado.ListarFeriadosRecuperarCiudad(busqueda).subscribe(data => {
      this.recuperar = data;
      // REVISAR DATOS
      this.RevisarTipoSolicitud(form);
    }, vacio => {
      // REVISAR DATOS
      this.RevisarTipoSolicitud(form);
    })
  }

  // METODO PARA REVISAR DATOS SEGUN TIPO DE SOLICITUD
  RevisarTipoSolicitud(form: any) {
    if (form.solicitarForm === 'Dias') {
      // BUSCAR FECHAS HORARIO
      this.BuscarFechasHorario(form);
    }
    else {
      //console.log('ingresa horas ----------------------- ')
      this.LimpiarComida(false);

      // VERIFICAR SI EL DIA SELECCIONADO ES UN FERIADO
      if (this.feriados.length > 0) {

        if (form.especialForm === false) {
          this.toastr.warning(
            `No es posible registrar una solicitud de permiso en un día configurado como feriado.`,
            `Ups!!!`, {
            timeOut: 6000,
          });
          this.LimpiarInformacion('');
        }
        else {
          this.BuscarDatosHoras(form);
        }
      }
      else {
        this.BuscarDatosHoras(form);
      }
    }
  }

  // METODO PARA BUSCAR FECHAS DE UNA PLANIFICACION HORARIA
  horario: any = [];
  // VARIABLES DE GESTION DE FECHAS
  fechasHorario: any;
  totalFechas: any = [];
  BuscarFechasHorario(form: any) {
    this.horario = [];
    let inicio = DateTime.fromISO(form.fechaInicioForm).toFormat('yyyy-MM-dd');
    let inicio_ = DateTime.fromISO(form.fechaInicioForm).toFormat('yyyy-MM-dd');
    let final = DateTime.fromISO(form.fechaFinalForm).toFormat('yyyy-MM-dd');

    this.fechasHorario = '';
    this.totalFechas = [];
    // LOGICA PARA OBTENER CADA UNA DE LAS FECHAS INGRESADAS
    while (inicio_ <= final) {
      if (this.fechasHorario === '') {
        this.fechasHorario = '\'' + inicio_ + '\'';
      }
      else {
        this.fechasHorario = this.fechasHorario + ', \'' + inicio_ + '\'';
      }
      this.totalFechas.push(inicio_);
      var newDate = DateTime.fromISO.fromISO(inicio_).plus({ days: 1 }).toFormat('yyyy-MM-dd');
      inicio_ = newDate;
    }

    let datos = {
      lista_fechas: this.fechasHorario,
      id_empleado: this.empleado.id
    }

    this.planificar.BuscarHorarioFechas(datos).subscribe(data => {
      console.log('ingresa a consultar horarios ----------------------- ', data)
      this.horario = data;

      if (this.horario.length === (this.totalFechas.length * 2)) {
        // PERMISO SOLICITADO POR DIAS
        this.horas = [];
        this.horas = data[0];

        // METODO PARA BUSCAR PERMISOS SOLICITADOS POR DIAS
        let solicitud = {
          fec_inicio: inicio,
          fec_final: final,
          id_empleado: this.empleado.id,
          id: this.info.id
        }

        this.restP.BuscarPermisosSolicitadosTotalesEditar(solicitud).subscribe(solicitados => {
          // EXISTEN REGISTROS DE PERMISOS POR DIAS
          if (solicitados.length != 0) {
            this.toastr.info('En las fechas ingresadas existe una solicitud de permiso en estado PENDIENTE o APROBADA.',
              'VERIFICAR SOLICITUD DE PERMISO.', {
              timeOut: 6000,
            });
            this.fechaInicioF.setValue('');
            this.LimpiarInformacion('00:00');
            // NO EXISTEN PERMISOS SOLICITADOS POR DIAS
          } else {
            this.ValidarConfiguracionDias();
          }
        })
      }
      else {
        this.toastr.warning('No tiene asignada una planificación horaria en las fechas ingresadas.', 'Ups!!! algo salio mal.', {
          timeOut: 6000,
        });
        this.fechaInicioF.setValue('');
        this.LimpiarInformacion('00:00');
      }
    }, error => {
      this.toastr.warning('No tiene asignada una planificación horaria en las fechas ingresadas.', 'Ups!!! algo salio mal.', {
        timeOut: 6000,
      });
      this.fechaInicioF.setValue('');
      this.LimpiarInformacion('00:00');
    });
  }

  // METODO PARA VERIFICAR DATOS DE PERMISOS EN HORAS
  BuscarDatosHoras(form: any) {

    let inicio = DateTime.fromISO(form.fechaInicioForm).toFormat('yyyy-MM-dd');
    let final = '';
    // SI CASO ESPECIAL SELECCIONADO
    if (form.especialForm === true) {
      // SUMAR UN DIA A LA FECHA
      final = DateTime.fromFormat(form.fechaInicioForm, 'YYYY-MM-DD').plus({ days: 1 }).toFormat('yyyy-MM-dd');
    } else {
      // MENTENER FECHA IGUAL
      final = DateTime.fromISO(form.fechaInicioForm).toFormat('yyyy-MM-dd');
    }

    // METODO PARA BUSCAR PERMISOS SOLICITADOS POR DIAS
    let solicitud = {
      fec_inicio: inicio,
      fec_final: final,
      id_empleado: this.empleado.id,
      id: this.info.id
    }
    this.restP.BuscarPermisosSolicitadosDiasEditar(solicitud).subscribe(solicitados => {
      // EXISTEN REGISTROS DE PERMISOS POR DIAS
      if (solicitados.length != 0) {
        this.toastr.info('En las fechas ingresadas existe una solicitud de permiso en estado PENDIENTE o APROBADA.',
          'VERIFICAR SOLICITUD DE PERMISO.', {
          timeOut: 6000,
        });
        this.fechaInicioF.setValue('');
        this.LimpiarInformacion('00:00');
        this.LimpiarComida(false);
        // NO EXISTEN PERMISOS SOLICITADOS POR DIAS
      } else {
        this.ImprimirFecha(form);
      }
    })

  }

  // CONTAR DIAS DE FERIADO EXISTENTES
  fechas_solicitud: any = [];
  contar_libres: number = 0;
  contar_feriados: number = 0;
  contar_recuperables: number = 0;
  contar_laborables: number = 0;
  ContarDiasSolicitados() {
    // ENCERAR VARIABLES
    this.contar_libres = 0;
    this.contar_feriados = 0;
    this.contar_laborables = 0;
    this.contar_recuperables = 0;

    this.fechas_solicitud = []; // ARRAY QUE CONTIENE TODAS LAS FECHAS DEL MES INDICADO
    var inicio = DateTime.fromFormat(this.dSalida, "yyyy-MM-dd").toFormat('yyyy-MM-dd');
    var fin = DateTime.fromFormat(this.dIngreso, "yyyy-MM-dd").toFormat('yyyy-MM-dd');

    // LOGICA PARA OBTENER EL NOMBRE DE CADA UNO DE LOS DIA DEL PERIODO INDICADO
    while (inicio <= fin) {
      this.fechas_solicitud.push(inicio);
      var newDate = DateTime.fromISO(inicio).plus({ days: 1 }).toFormat('yyyy-MM-dd');
      inicio = newDate;
    }

    // BUSCAR FERIADOS
    if (this.feriados.length != 0) {
      this.fechas_solicitud.map((obj: any) => {
        for (let i = 0; i < this.feriados.length; i++) {
          if (DateTime.fromFormat(this.feriados[i].fecha, 'yyyy-MM-dd').toFormat('yyyy-MM-dd') === obj) {
            this.contar_feriados = this.contar_feriados + 1;
            break;
          }
        }
      })
    }

    // BUSCAR FECHAS DE RECUPERACION DE FERIADOS
    if (this.recuperar.length != 0) {
      this.fechas_solicitud.map((obj: any) => {
        for (let j = 0; j < this.recuperar.length; j++) {
          if (DateTime.fromFormat(this.recuperar[j].fecha_recuperacion, 'yyyy-MM-dd').toFormat('yyyy-MM-dd') === obj) {
            this.contar_recuperables = this.contar_recuperables + 1;
            break;
          }
        }
      })
    }

    if (this.horario.length != 0) {
      for (let k = 0; k < this.horario.length; k++) {
        if (this.horario[k].estado_origen === 'L' && this.horario[k].tipo_accion === 'E') {
          this.contar_libres = this.contar_libres + 1;
        }
        if (this.horario[k].estado_origen === 'N' && this.horario[k].tipo_accion === 'E') {
          this.contar_laborables = this.contar_laborables + 1;
        }
      }
    }

    // COLOCAR EN EL FORMULARIO CALCULO DE DIAS
    var total_libres = 0;
    var total_laborables = 0;

    if (this.feriados.length > 0) {
      var libre = this.contar_libres - this.contar_recuperables;
      var laborable = this.contar_laborables + this.contar_recuperables;

      //console.log('ver LIBRES T-- ', libre)
      //console.log('ver LABORABLES T -- ', laborable)

      if (this.datosPermiso.contar_feriados === false) {
        total_libres = libre + this.contar_feriados;
        total_laborables = laborable - this.contar_feriados;
      }
      else {
        total_libres = libre;
        total_laborables = laborable;
      }
    }
    else {
      total_libres = this.contar_libres;
      total_laborables = this.contar_laborables;
    }

    this.diaLaboralF.setValue(total_laborables);
    this.diaLibreF.setValue(total_libres);

    if (total_laborables === 0) {
      this.toastr.warning(
        `Esta realizando una solicitud de permiso en días libres o días configurados como feriados.`,
        `Ha solicitado ${total_laborables} días laborables y ${total_libres} días libres.`, {
        timeOut: 6000,
      });
      this.LimpiarInformacion('00:00');
    }
  }


  /** ********************************************************************************** **
   ** **                    TRATAMIENTO DE DATOS DE REGISTRO DE PERMISO               ** **
   ** ********************************************************************************** **/

  // SETEAR VALORES DE DIAS Y HORAS
  CambiarValoresDiasHoras(form: any, datos: any) {
    if (form.solicitarForm === 'Dias') {
      datos.hora_numero = '00:00:00';
      datos.hora_salida = '00:00:00';
      datos.hora_ingreso = '00:00:00';
    }
    else if (form.solicitarForm === 'Horas') {
      datos.dia = 0;
      datos.dia_libre = 0;
    }
  }

  // METODO PARA VALIDAR DIAS DE JUSTIFICACION
  ValidarDiasJustificacion(final: any, datos: any, form: any) {
    console.log('ver justifica')
    if (this.datosPermiso.gene_justificacion === true) {
      var dias = this.datosPermiso.num_dia_justifica;
      var sumar = DateTime.fromFormat(final, 'yyyy-MM-dd').plus({ days: 1 }).toFormat('yyyy-MM-dd');
      if (Date.parse(this.FechaActual) <= Date.parse(sumar)) {
        this.ActualizarRegistro(datos);
        this.SubirRespaldo(this.info.id, this.info.codigo);
        this.CerrarVentana();
      }
      else {
        let justifica = this.validar.FormatearFecha(sumar, this.formato_fecha, this.validar.dia_completo, this.idioma_fechas);
        this.toastr.warning('Ups!!! el permiso debio ser justificado hasta el ' + justifica + '.',
          '', {
          timeOut: 4000,
        });
      }
    }
    else {
      this.ActualizarRegistro(datos);
      this.SubirRespaldo(this.info.id, this.info.codigo);
      this.CerrarVentana();
    }
  }

  VerificarActualizacion(form: any) {
    let datosPermiso = {
      depa_user_loggin: parseInt(this.actuales.id_departamento),// verificar este dato en la consulta no se encuentra
      id_tipo_permiso: form.idPermisoForm,
      hora_ingreso: form.horasIngresoForm,
      descripcion: form.descripcionForm,
      hora_numero: form.horasForm,
      num_permiso: this.num,
      hora_salida: form.horaSalidaForm,
      fec_inicio: DateTime.fromISO(form.fechaInicioForm).toFormat('yyyy-MM-dd'),
      fec_final: DateTime.fromISO(form.fechaFinalForm).toFormat('yyyy-MM-dd'),
      dia_libre: form.diaLibreForm,
      dia: parseInt(form.diasForm),
      id_peri_vacacion: this.periodo_vacaciones,
      fec_edicion: this.FechaActual,
      user_name: this.user_name,
      ip: this.ip,
    }

    if (this.info.id_tipo_permiso != datosPermiso.id_tipo_permiso) {
      console.log('ingresa tipo ', this.info.id_tipo_permiso, ' ', datosPermiso.id_tipo_permiso)
      this.InsertarPermiso(form, datosPermiso);
    }
    else if (DateTime.fromISO(this.info.fecha_inicio).toFormat('yyyy-MM-dd') != datosPermiso.fec_inicio) {
      console.log('ingresa inicio ', this.info.fecha_inicio, ' ', datosPermiso.fec_inicio)
      this.InsertarPermiso(form, datosPermiso);
    }
    else if (DateTime.fromISO(this.info.fecha_final).toFormat('yyyy-MM-dd') != datosPermiso.fec_final) {
      console.log('ingresa final ', this.info.fecha_final, ' ', datosPermiso.fec_final)
      this.InsertarPermiso(form, datosPermiso);
    }
    else if (this.info.descripcion != datosPermiso.descripcion) {
      console.log('ingresa descripcion ', this.info.descripcion, ' ', datosPermiso.descripcion)
      this.InsertarPermiso(form, datosPermiso);
    }
    else if (this.info.horas_permiso != datosPermiso.hora_numero) {
      console.log('ingresa horas ', this.info.horas_permiso, ' ', datosPermiso.hora_numero)
      this.InsertarPermiso(form, datosPermiso);
    }
    else if (this.archivoSubido != undefined && this.archivoSubido.length != 0) {
      console.log('ingresa archivo ', this.archivoSubido, ' ', this.archivoSubido.length)
      this.InsertarPermiso(form, datosPermiso);
    } else if (this.eliminar) {
      if (this.certificado === false) {
        this.EliminarDocumentoBDD();
        this.CerrarVentana();
      } else {
        this.toastr.warning('Documento de respaldo es requerido, no es posible eliminarlo.', 'Ups!!! no fue posible actualizar el registro.', {
          timeOut: 6000,
        });
      }
    }
    else {
      this.CerrarVentana();
    }

  }

  // METODO PARA CAPTURAR DATOS DE PERMISO
  InsertarPermiso(form: any, datosPermiso: any) {
    console.log('eñiminara ', this.eliminar, 'editar ', this.editar, 'documento ', this.documento, 'certificado ', this.certificado)
    this.CambiarValoresDiasHoras(form, datosPermiso);
    if (this.documento_editar === true && this.eliminar === false && this.editar === false) {
      console.log('ingresa todo false')
      this.ActualizarRegistro(datosPermiso);
      this.CerrarVentana();
    }
    else if (this.editar === true) {
      console.log('ingresa editar true')
      //console.log('ver editar ', this.editar, ' archivo ', this.archivoSubido)
      if (this.archivoSubido != undefined && this.archivoSubido.length != 0) {
        this.ValidarDiasJustificacion(datosPermiso.fec_final, datosPermiso, form);
      } else {
        this.toastr.warning('Por favor cargar el documento de permiso.', 'Ups!!! no ha seleccionado un archivo.', {
          timeOut: 6000,
        });
      }
    }
    else if (this.eliminar === true) {
      console.log('ingresa eliminar true')
      if (this.certificado === false) {
        this.ActualizarRegistro(datosPermiso);
        this.EliminarDocumentoBDD();
        this.CerrarVentana();
      }
      else {
        this.toastr.warning('Documento de respaldo es requerido, no es posible eliminarlo.', 'Ups!!! no fue posible actualizar el registro.', {
          timeOut: 6000,
        });
      }
    }
    else if (this.documento === true) {
      console.log('ingresa documento true')
      if (this.certificado === true) {
        if (this.archivoSubido != undefined && this.archivoSubido.length != 0) {
          this.ValidarDiasJustificacion(datosPermiso.fec_final, datosPermiso, form);
        } else {
          this.toastr.warning('Es requerido subir un documento de respaldo de la solicitud de permiso.', '', {
            timeOut: 6000,
          });
        }
      }
      else {
        if (this.archivoSubido != undefined && this.archivoSubido.length != 0) {
          this.ValidarDiasJustificacion(datosPermiso.fec_final, datosPermiso, form);
        }
        else {
          this.ActualizarRegistro(datosPermiso);
          this.CerrarVentana();
        }

      }
    }
  }

  // METODO PARA ACTUALIZAR REGISTRO
  ActualizarRegistro(datos: any) {
    this.restP.EditarPermiso(this.info.id, datos).subscribe({
      next: res => {
        let advertencia: boolean = false;

        if (res.message == 'ok') {
          this.toastr.success('Operación exitosa.', 'Registro actualizado.', {
            timeOut: 6000,
          });

        } else {
          advertencia = true;
          this.toastr.warning(res.message, 'Permisos registrados.', {
            timeOut: 6000,
          });
        }

        if (this.datosPermiso.correo_editar === true && advertencia === false) {
          this.EnviarCorreo(res.permiso);
          this.EnviarNotificacion(res.permiso);
        }
      },
      error: error => {
        this.toastr.error('Verifica los datos ingresados y vuelve a intentar.', 'Ups!!! algo salio mal.', {
          timeOut: 6000,
        })
      }
    });
  }


  /** ********************************************************************************** **
   ** **                       SUBIR ARCHIVO DE SOLICITUD DE PERMISO                  ** **
   ** ********************************************************************************** **/

  // SELECCIONAR ARCHIVO
  nameFile: string = '';
  archivoSubido: Array<File> = [];

  fileChange(element: any) {
    this.archivoSubido = element.target.files;
    if (this.archivoSubido.length != 0) {
      // VALIDAR QUE EL DOCUEMNTO SUBIDO CUMPLA CON EL TAMAÑO ESPECIFICADO
      if (this.archivoSubido[0].size <= 2e+6) {
        const name = this.archivoSubido[0].name;
        this.formulario.patchValue({ nombreCertificadoForm: name });
        this.HabilitarBtn = true;
      }
      else {
        this.toastr.info('El archivo ha excedido el tamaño permitido.', 'Tamaño de archivos permitido máximo 2MB.', {
          timeOut: 6000,
        });
      }
    }
  }

  // CARGAR DOCUMENTO
  SubirRespaldo(id: any, codigo: any) {
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads", this.archivoSubido[i], this.archivoSubido[i].name);
    }

    formData.append('user_name', this.user_name as string);
    formData.append('ip', this.ip as string);
    formData.append('id', id as string);
    formData.append('codigo', codigo as string);
    formData.append('eliminar', true as any);

    this.restP.SubirArchivoRespaldo(formData, id, codigo, this.info.documento).subscribe(res => {
      this.toastr.success('Operación exitosa.', 'Documento registrado.', {
        timeOut: 6000,
      });
      this.archivoForm.reset();
      this.nameFile = '';
    });
  }

  // LIMPIAR EL NOMBRE DEL ARCHIVO
  LimpiarNombreArchivo() {
    this.formulario.patchValue({
      nombreCertificadoForm: '',
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

  // METODO PARA ACTUALIZAR DEL REGISTRO EL ARCHIVO
  editar: boolean = false;
  EditarArchivo(evento: MatCheckboxChange) {
    this.editar = evento.checked
    this.eliminar = false;
    this.documento = true;
  }

  // METODO PARA ELIMINAR DEL REGISTRO EL ARCHIVO
  eliminar: boolean = false;
  EliminarArchivo(evento: MatCheckboxChange) {
    this.eliminar = evento.checked
    this.editar = false;
    this.documento = false;
    // DOCUMENTO REQUERIDO
    this.certificado = this.datosPermiso.documento;
  }


  // CARGAR DOCUMENTO
  EliminarDocumentoBDD() {
    let datos = {
      archivo: this.info.documento,
      id: this.info.id,
      codigo: this.empleado.codigo,
      user_name: this.user_name,
      ip: this.ip,
    }
    this.restP.EliminarDocumentoPermiso(datos).subscribe(res => {
      this.toastr.error('Operación exitosa.', 'Documento eliminado.', {
        timeOut: 6000,
      });
    });
  }


  /** ******************************************************************************************* **
   ** **                   METODO DE ENVIO DE NOTIFICACIONES DE PERMISOS                       ** **
   ** ******************************************************************************************* **/

  // METODO PARA OBTENER CONFIGURACION DE NOTIFICACIONES
  solInfo: any;
  ObtenerInformacionEmpleado() {
    var estado: boolean;
    this.informacion_.ObtenerInfoConfiguracion(this.id_empleado).subscribe(
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
        }
        if (this.id_empleado != this.idEmpleadoIngresa) {
          this.nota = 'la solicitud';
          this.user = 'para ' + this.solInfo.fullname;
        }
      })
  }

  // METODO PARA ENVIAR CORREO ELECTRONICO
  EnviarCorreo(permiso: any) {

    //console.log('entra correo')
    var cont = 0;
    var correo_usuarios = '';

    // METODO PARA OBTENER NOMBRE DEL DIA EN EL CUAL SE REALIZA LA SOLICITUD DE PERMISO
    let solicitud = this.validar.FormatearFecha(permiso.fec_edicion, this.formato_fecha, this.validar.dia_completo, this.idioma_fechas);
    let desde = this.validar.FormatearFecha(permiso.fec_inicio, this.formato_fecha, this.validar.dia_completo, this.idioma_fechas);
    let hasta = this.validar.FormatearFecha(permiso.fec_final, this.formato_fecha, this.validar.dia_completo, this.idioma_fechas);

    // METODO PARA OBTENER NOMBRE DEL DIA EN EL CUAL SE REALIZA LA SOLICITUD DE PERMISO INICIAL
    let asolicitud = this.validar.FormatearFecha(this.info.fecha_creacion, this.formato_fecha, this.validar.dia_completo, this.idioma_fechas);
    let adesde = this.validar.FormatearFecha(this.info.fecha_inicio, this.formato_fecha, this.validar.dia_completo, this.idioma_fechas);
    let ahasta = this.validar.FormatearFecha(this.info.fecha_final, this.formato_fecha, this.validar.dia_completo, this.idioma_fechas);

    // CAPTURANDO ESTADO DE LA SOLICITUD DE PERMISO
    if (permiso.estado === 1) {
      var estado_p = 'Pendiente de autorización';
    }
    else if (permiso.estado === 2) {
      var estado_p = 'Preautorizada';
    }
    else if (permiso.estado === 3) {
      var estado_p = 'Autorizada';
    }
    else if (permiso.estado === 1) {
      var estado_p = 'Negada';
    }

    // CAPTURANDO ESTADO DE LA SOLICITUD DE PERMISO INICIAL
    if (this.info.estado === 1) {
      var aestado_p = 'Pendiente de autorización';
    }
    else if (this.info.estado === 2) {
      var aestado_p = 'Preautorizada';
    }
    else if (this.info.estado === 3) {
      var aestado_p = 'Autorizada';
    }
    else if (this.info.estado === 1) {
      var aestado_p = 'Negada';
    }

    // LEYENDO DATOS DE TIPO DE PERMISO
    var tipo_permiso = '';
    this.tipoPermisos.filter((o: any) => {
      if (o.id === permiso.id_tipo_permiso) {
        tipo_permiso = o.descripcion
      }
      return tipo_permiso;
    })

    // LEYENDO DATOS DE TIPO DE PERMISO INICIA
    var atipo_permiso = '';
    this.tipoPermisos.filter((o: any) => {
      if (o.id === this.info.id_tipo_permiso) {
        atipo_permiso = o.descripcion
      }
      return atipo_permiso;
    })

    // VERIFICACIÓN QUE TODOS LOS DATOS HAYAN SIDO LEIDOS PARA ENVIAR CORREO
    permiso.EmpleadosSendNotiEmail.forEach((e: any) => {

      //console.log('for each', e)

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

      //console.log('contadores', permiso.EmpleadosSendNotiEmail.length + ' cont ' + cont)

      if (cont === permiso.EmpleadosSendNotiEmail.length) {

        console.log('data entra correo usuarios', correo_usuarios)

        let datosPermisoCreado = {
          solicitud: solicitud,
          desde: desde,
          hasta: hasta,
          h_inicio: this.validar.FormatearHora(permiso.hora_salida, this.formato_hora),
          h_fin: this.validar.FormatearHora(permiso.hora_ingreso, this.formato_hora),
          id_empl_contrato: permiso.id_empl_contrato,
          tipo_solicitud: 'Permiso actualizado por',
          horas_permiso: permiso.hora_numero,
          observacion: permiso.descripcion,
          tipo_permiso: tipo_permiso,
          dias_permiso: permiso.dia,
          estado_p: estado_p,
          proceso: 'actualizado',
          id_dep: e.id_dep,
          id_suc: e.id_suc,
          correo: correo_usuarios,
          asunto: 'ACTUALIZACION DE SOLICITUD DE PERMISO',
          id: permiso.id,
          solicitado_por: localStorage.getItem('fullname_print'),

          // DATOS DE PERMISO INICIAL
          asolicitud: asolicitud,
          adesde: adesde,
          ahasta: ahasta,
          ah_inicio: this.validar.FormatearHora(this.info.hora_salida, this.formato_hora),
          ah_fin: this.validar.FormatearHora(this.info.hora_ingreso, this.formato_hora),
          atipo_permiso: atipo_permiso,
          aobservacion: this.info.descripcion,
          aestado_p: aestado_p,
          adias_permiso: this.info.dia,
          ahoras_permiso: this.info.horas_permiso,
        }
        if (correo_usuarios != '') {
          //console.log('data entra enviar correo')

          this.restP.EnviarCorreoEditarWeb(datosPermisoCreado).subscribe(
            resp => {
              //console.log('data entra enviar correo', resp)
              if (resp.message === 'ok') {
                this.toastr.success('Correo de solicitud enviado exitosamente.', '', {
                  timeOut: 6000,
                });
              }
              else {
                this.toastr.warning('Ups!!! algo salio mal.', 'No fue posible enviar correo de solicitud.', {
                  timeOut: 6000,
                });
              }
            },
            err => {
              this.toastr.error(err.error.message, '', {
                timeOut: 6000,
              });
            },
          )
        }
      }
    })
  }

  // METODO PARA ENVIAR NOTIFICACION AL SISTEMA
  EnviarNotificacion(permiso: any) {

    // METODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE PERMISO
    let desde = this.validar.FormatearFecha(permiso.fec_inicio, this.formato_fecha, this.validar.dia_completo, this.idioma_fechas);
    let hasta = this.validar.FormatearFecha(permiso.fec_final, this.formato_fecha, this.validar.dia_completo, this.idioma_fechas);

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
      tipo: 1,
      mensaje: 'Ha actualizado ' + this.nota + ' de permiso ' + this.user + ' desde ' +
        desde + ' ' + h_inicio + ' hasta ' +
        hasta + ' ' + h_fin,
      user_name: this.user_name,
      ip: this.ip,
    }

    // LISTADO PARA ELIMINAR EL USUARIO DUPLICADO
    var allNotificaciones: any = [];
    // CICLO POR CADA ELEMENTO DEL CATALOGO
    permiso.EmpleadosSendNotiEmail.forEach(function (elemento: any, indice: any, array: any) {
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
      if (e.permiso_noti) {
        this.realTime.IngresarNotificacionEmpleado(notificacion).subscribe(
          resp => {
            this.restP.EnviarNotificacionRealTime(resp.respuesta);
          },
          err => {
            this.toastr.error(err.error.message, '', {
              timeOut: 6000,
            });
          },
        )
      }

    })

  }

  /** ********************************************************************************* **
   ** **                    LIMPIAR CAMPOS DEL FORMULARIO                            ** **
   ** ********************************************************************************* **/

  LimpiarCampos() {
    this.formulario.reset();
  }

  // LIMPIAR CAMPOS DE FECHAS y HORAS
  LimpiarInformacion(valor: string) {
    this.formulario.patchValue({
      horasIngresoForm: '',
      fechaFinalForm: '',
      diaLaboralForm: '',
      horaSalidaForm: '',
      diaLibreForm: '',
      horasForm: valor,
      diasForm: '',
    });
  }

  // METODO PARA LIMPIAR DATOS DE ESPECIFICOS DE FORMULARIO
  LimpiarFormulario(valor: string) {
    this.formulario.patchValue({
      horasIngresoForm: '',
      fechaInicioForm: '',
      fechaFinalForm: '',
      diaLaboralForm: '',
      horaSalidaForm: '',
      diaLibreForm: '',
      horasForm: valor,
      diasForm: '',
    });
  }

  // METODO PARA LIMPIAR HORAS ALIMENTACION
  LimpiarComida(valor: boolean) {
    this.activar_comida = valor;
    this.horas_solicitadasF.setValue('');
    this.horas_alimentacionF.setValue('');
  }

  // CERRAR VENTANA DE REGISTRO
  CerrarVentana() {
    if (this.solicita_permiso[0].ventana === 'empleado') {
      this.componente.permisosTotales = [];
      this.componente.ObtenerPermisos(this.componente.formato_fecha, this.componente.formato_hora);
      this.componente.formulario_editar_permiso = false;
      this.componente.solicitudes_permiso = true;
    }
    else {
    }
    this.LimpiarCampos();
  }

  // METODO PARA FORMATEAR HORAS
  TransformarSegundoHoras(segundos: number) {
    let h: string | number = Math.floor(segundos / 3600);
    h = (h < 10) ? '0' + h : h;
    let m: string | number = Math.floor((segundos / 60) % 60);
    m = (m < 10) ? '0' + m : m;
    let s: string | number = segundos % 60;
    s = (s < 10) ? '0' + s : s;
    return h + ':' + m + ':' + s;
  }

  // VALIDACIONES INGRESAR SOLO NUMEROS
  IngresarSoloNumeros(evt: any) {
    this.horasF.setValue('');
    return this.validar.IngresarSoloNumeros(evt);
  }
}
