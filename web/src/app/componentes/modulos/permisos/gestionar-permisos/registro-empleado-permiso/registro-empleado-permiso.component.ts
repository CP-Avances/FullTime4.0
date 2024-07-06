// IMPORTAR LIBRERIAS
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';

// INVOCACION DE SERVICIOS
import { PeriodoVacacionesService } from 'src/app/servicios/periodoVacaciones/periodo-vacaciones.service';
import { EmpleadoHorariosService } from 'src/app/servicios/horarios/empleadoHorarios/empleado-horarios.service';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { TipoPermisosService } from 'src/app/servicios/catalogos/catTipoPermisos/tipo-permisos.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { AutorizacionService } from 'src/app/servicios/autorizacion/autorizacion.service';
import { PlanGeneralService } from 'src/app/servicios/planGeneral/plan-general.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';
import { PermisosService } from 'src/app/servicios/permisos/permisos.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { FeriadosService } from 'src/app/servicios/catalogos/catFeriados/feriados.service';
import { LoginService } from 'src/app/servicios/login/login.service';

import { PermisosMultiplesEmpleadosComponent } from '../../multiples/permisos-multiples-empleados/permisos-multiples-empleados.component';
import { VerEmpleadoComponent } from 'src/app/componentes/empleado/ver-empleado/ver-empleado.component';
import { SettingsComponent } from 'src/app/componentes/administracionGeneral/configuracion-notificaciones/settings/settings.component';

interface opcionesDiasHoras {
  valor: string;
  nombre: string
}

@Component({
  selector: 'app-registro-empleado-permiso',
  templateUrl: './registro-empleado-permiso.component.html',
  styleUrls: ['./registro-empleado-permiso.component.css'],

})

export class RegistroEmpleadoPermisoComponent implements OnInit {

  @Input() solicita_permiso: any;

  // VARIABLES DE ALMACENAMIENTO
  datos: any = [];
  permiso: any = [];

  // DATOS DEL EMPLEADO QUE INICIA SESION
  idEmpleadoIngresa: number;
  nota = 'una solicitud';
  user = '';
  codigo: number;

  // USADO PARA IMPRIMIR DATOS
  datosPermiso: any = [];
  numero_permiso: any = [];
  tipoPermisos: any = [];

  diasHoras: opcionesDiasHoras[] = [
    { valor: 'Dias', nombre: 'Dias' },
    { valor: 'Horas', nombre: 'Horas' },
  ];

  // TOTAL DE DIAS SEGUN EL TIPO DE PERMISO
  Tdias = 0;
  // TOTAL DE HORAS SEGUN EL TIPO DE PERMISO
  Thoras: any;

  // NUMERO DEL PERMISO
  num: number;
  configuracion_permiso: string;
  // VARIABLE PARA GUARDAR FECHA ACTUAL TOMADA DEL SISTEMA
  FechaActual: any;
  horasTrabajo: any = [];

  // VARIABLES PARA OCULTAR O VISIBILIZAR INGRESO DE DATOS DIAS, HORAS, DIAS LIBRES
  habilitarDias: boolean = false;

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
    private tipoPermiso: TipoPermisosService,
    private realTime: RealTimeService,
    private toastr: ToastrService,
    private restP: PermisosService,
    private restH: EmpleadoHorariosService,
    public restE: EmpleadoService,
    public feriado: FeriadosService,
    public ventana: MatDialog,
    public validar: ValidacionesService,
    public restPerV: PeriodoVacacionesService,
    public parametro: ParametrosService,
    public informacion_: DatosGeneralesService,
    public componente1: VerEmpleadoComponent,
    public componente2: PermisosMultiplesEmpleadosComponent,
    public planificar: PlanGeneralService,
    public restAutoriza: AutorizacionService,

  ) {
    this.idEmpleadoIngresa = parseInt(localStorage.getItem('empleado') as string);
  }

  public datosEmple: any = []
  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

    this.datos = this.solicita_permiso[0];
    var f = moment();
    this.FechaActual = f.format('YYYY-MM-DD');
    this.ObtenerInformacionEmpleado();
    this.ImprimirNumeroPermiso();
    this.ObtenerTiposPermiso();
    this.ObtenerEmpleado();
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

  // METODO PARA VER LA INFORMACION DEL EMPLEADO
  empleado: any = [];
  ObtenerEmpleado() {
    this.empleado = [];
    this.restE.BuscarUnEmpleado(parseInt(this.datos.id_empleado)).subscribe(data => {
      this.empleado = data[0];
    })
  }

  // BUSQUEDA DE TIPOS DE PERMISOS DE ACUERDO AL ROL DEL USUARIO
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

  // IMPRIMIR DATOS DEL TIPO DE PERMISO SELECCIONADO
  activar_comida: boolean = false;
  activar_hora: boolean = false;
  informacion: boolean = false;
  legalizado: boolean = false;
  certificado: boolean = false;
  ImprimirDatos(form: any) {
    this.LimpiarComida(false);
    this.datosPermiso = [];
    this.tipoPermiso.BuscarUnTipoPermiso(form.idPermisoForm).subscribe(datos => {
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
      if (this.datosPermiso.num_dia_maximo === 0) {
        this.LimpiarFormulario('');
        this.informacion1 = `Horas máximas de permiso: ${this.datosPermiso.num_hora_maximo} horas.`;
        this.habilitarDias = false;
        this.activar_hora = true;
        this.formulario.patchValue({
          solicitarForm: 'Horas',
        });
        this.Thoras = this.datosPermiso.num_hora_maximo;
        this.configuracion_permiso = 'Horas';
      }
      // SOLICITUD POR DIAS
      else if (this.datosPermiso.num_hora_maximo === '00:00:00') {
        this.LimpiarFormulario('00:00');
        this.informacion1 = `Días máximos de permiso: ${this.datosPermiso.num_dia_maximo} días.`;
        this.habilitarDias = true;
        this.activar_hora = false;
        this.formulario.patchValue({
          solicitarForm: 'Dias',
        });
        this.Tdias = this.datosPermiso.num_dia_maximo;
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
      if (this.datosPermiso.almu_incluir === true) {
        this.informacion3 = `Aplica descuento de minutos de alimentación si el permiso es solicitado por horas y se encuentra dentro del horario de alimentación.`;
      }
      else {
        this.informacion3 = '';
      }

      // MENSAJE DIAS PREVIOS DE SOLICITUD
      this.informacion4 = `Número de días previos para cargar solicitud: ${this.datosPermiso.num_dia_anticipo} días.`;
    })
  }

  // METODO PARA BUSCAR PERIODO DE VACACIONES
  periodo_vacaciones: number = 0;
  BuscarPeriodoVacaciones() {
    this.restPerV.BuscarIDPerVacaciones(parseInt(this.datos.id_empleado)).subscribe(datos => {
      this.periodo_vacaciones = datos[0].id;
    }, error => {
      this.toastr.info('No tiene registrado un periodo de vacaciones.',
        'Está solicitando un permiso con descuento a vacaciones.', {
        timeOut: 6000,
      });
      this.formulario.reset();
    });
  }

  // METODO PARA IMPRIMIR NUMERO DE PERMISO
  ImprimirNumeroPermiso() {
    this.numero_permiso = [];
    this.restP.BuscarNumPermiso(this.datos.id_empleado).subscribe(datos => {
      this.numero_permiso = datos[0];
      if (this.numero_permiso.max === null) {
        this.num = 1;
      }
      else {
        this.num = this.numero_permiso.max + 1;
      }
    })
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
      var fecha = new Date(String(moment(leer_fecha)));
      var inicio = String(moment(fecha, "YYYY/MM/DD").format("YYYY-MM-DD"));

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
    if (moment(inicio).format('YYYY') < moment(this.FechaActual).format('YYYY')) {
      this.ValidarAñosAnteriores(inicio);
    }
    else {
      this.ValidarDiasPrevios(inicio);
    }
  }

  // METODO PARA VALIDAR FECHAS DE AÑOS PASADOS
  ValidarAñosAnteriores(inicio: any) {
    var mes_inicial = moment().format('YYYY/01/01');
    var dias = this.datosPermiso.num_dia_anterior;
    if (dias > 0) {
      var restar = moment(mes_inicial, 'YYYY/MM/DD').subtract(dias, 'days').format('YYYY/MM/DD');

      if (Date.parse(inicio) >= Date.parse(restar)) {
      }
      else {
        this.toastr.warning('Ups!!! ha superado el limite de días permitidos para cargar solicitudes.', '', {
          timeOut: 4000,
        });
        this.fechaInicioF.setValue('');
      }
    }
  }

  // METODO PARA VALIDAR DIAS PREVIOS DE PERMISO
  ValidarDiasPrevios(inicio: any) {
    var dias = this.datosPermiso.num_dia_anticipo;
    var restar = moment(inicio, 'YYYY/MM/DD').subtract(dias, 'days').format('YYYY/MM/DD');
    if (dias > 0) {
      if (Date.parse(this.FechaActual) <= Date.parse(restar)) {
      }
      else {
        this.toastr.warning('Ups!!! el permiso debio ser solicitado con ' + this.datosPermiso.num_dia_anticipo + ' días previos.',
          '', {
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
        var fecha = moment(form.fechaInicioForm, 'YYYY-MM-DD').add(1, 'days').format('YYYY-MM-DD');
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
      var inicio = String(moment(this.dSalida, "YYYY/MM/DD").format("YYYY-MM-DD"));
      var final = String(moment(this.dIngreso, "YYYY/MM/DD").format("YYYY-MM-DD"));

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
      fecha_inicio = String(moment(this.dSalida, "YYYY/MM/DD").format("YYYY-MM-DD"));
      fecha_final = String(moment(form.fechaFinalForm, "YYYY/MM/DD").format("YYYY-MM-DD"));
      hora_inicio_ = moment(form.horaSalidaForm, "HH:mm:ss").format('HH:mm:ss');
      hora_final_ = moment(form.horasIngresoForm, "HH:mm:ss").format('HH:mm:ss');

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
          codigo: this.empleado.codigo
        }
        console.log('ver data ', solicitud)
        this.restP.BuscarPermisosSolicitadosHoras(solicitud).subscribe(solicitados => {
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
      console.log('informacion ----- ', informacion)
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
              if (this.datosPermiso.almu_incluir === true) {
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
          var entrada = String(moment(datos[i].fecha_entrada, "YYYY/MM/DD").format("YYYY-MM-DD"));
          var salida = String(moment(datos[i].fecha_salida, "YYYY/MM/DD").format("YYYY-MM-DD"));

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
                  // EN EL CASO DE SER NECESARIO VERIFICAR DIA LIBRE * COLOCAR AQUI
                  verificador = 1;
                  if (this.datosPermiso.almu_incluir === true) {
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
                  if (this.datosPermiso.almu_incluir === true) {
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
                    // EN EL CASO DE SER NECESARIO VERIFICAR DIA LIBRE * COLOCAR AQUI
                    verificador = 1;
                    if (this.datosPermiso.almu_incluir === true) {
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
          var entrada = String(moment(datos[i].fecha_entrada, "YYYY/MM/DD").format("YYYY-MM-DD"));
          var intermedio = String(moment(datos[i].fecha_entrada, "YYYY/MM/DD").add(1, 'days').format("YYYY-MM-DD"))
          var salida = String(moment(datos[i].fecha_salida, "YYYY/MM/DD").format("YYYY-MM-DD"));

          // CONDICION UNO: FECHA INGRESADA = A LA FECHA DE INGRESO DEL USUARIO
          if (entrada === fecha_inicio) {
            // LA HORA INGRESADA DE INICIO DEDE SER >= QUE LA HORA DE INICIO DE JORNADA
            if (hora_inicio_ >= datos[i].hora_inicio) {
              // CONDICIONES QUE DEBEN CUMPLIR
              // LA HORA FINAL ES 24:00:00 (HORA DE FINALIZACION DE DIA)
              if (hora_final_ === '00:00:00') {
                // EN EL CASO DE SER NECESARIO VERIFICAR DIA LIBRE * COLOCAR AQUI
                verificador = 1;
                this.CalcularHoras(form, fecha_inicio, fecha_final, hora_inicio_, hora_final_, 0);
                break;
              }
              else {
                // LA HORA FINAL ES <= '23:59:00' Y LA HORA FINAL ES > QUE LA HORA DE INICIO
                if (hora_final_ <= '23:59:00' && hora_final_ > datos[i].hora_inicio) {
                  // EN EL CASO DE SER NECESARIO VERIFICAR DIA LIBRE * COLOCAR AQUI
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
                // EN EL CASO DE SER NECESARIO VERIFICAR DIA LIBRE * COLOCAR AQUI
                verificador = 1;
                this.CalcularHoras(form, fecha_inicio, fecha_final, hora_inicio_, hora_final_, 0);
                break;
              }
              else {
                // LA HORA DE INICIO DEBE SER >= 00:01:00 Y LA HORA DE INICIO DEBE SER < QUE LA HORA DE SALIDA DEL USUARIO
                if (hora_inicio_ >= '00:01:00' && hora_inicio_ < datos[i].hora_final) {
                  // EN EL CASO DE SER NECESARIO VERIFICAR DIA LIBRE * COLOCAR AQUI
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
            // EN EL CASO DE SER NECESARIO VERIFICAR DIA LIBRE * COLOCAR AQUI
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
            if (this.datosPermiso.almu_incluir === true) {
              this.VerificarFechasDiferentesComida(form, fecha_inicio, fecha_final, hora_inicio_, hora_final_);
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
          var entrada = String(moment(datos[i].fecha_entrada, "YYYY/MM/DD").format("YYYY-MM-DD"));
          var intermedio = String(moment(datos[i].fecha_entrada, "YYYY/MM/DD").add(1, 'days').format("YYYY-MM-DD"))

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
          this.CalcularHoras(form, fecha_inicio, fecha_final, hora_inicio_, hora_final_, datos[i].min_almuerzo);
        }
      }
      // HORARIOS CON FINALIZACION DE JORNADA AL SIGUIENTE DIA
      else if (informacion.message === 'CASO_2') {
        // RECORRER TODOS LOS DATOS DE HORARIOS EXISTENTES
        for (let i = 0; i < datos.length; i++) {
          // FORMATEAR FECHAS
          var entrada = String(moment(datos[i].fecha_entrada, "YYYY/MM/DD").format("YYYY-MM-DD"));
          var salida = String(moment(datos[i].fecha_salida, "YYYY/MM/DD").format("YYYY-MM-DD"));
          // CONDICION UNO: FECHA INGRESADA = A LA FECHA DE INGRESO DEL USUARIO
          if (entrada === fecha_inicio) {

            if ((hora_final_ <= '23:59:00' && hora_final_ > datos[i].hora_inicio) &&
              ((hora_inicio_ <= datos[i].hora_inicio || hora_inicio_ >= datos[i].hora_inicio) &&
                hora_inicio_ >= horario_.hora_inicio)) {
              console.log('entra if entrada = fecha_inicio')
              verificador = 1;
              this.CalcularHoras(form, fecha_inicio, fecha_final, hora_inicio_, hora_final_, datos[i].min_almuerzo);
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
                verificador = 1;
                this.CalcularHoras(form, fecha_inicio, fecha_final, hora_inicio_, hora_final_, datos[i].min_almuerzo);
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
  VerificarFechasDiferentesComida(form: any, fecha_inicio: any, fecha_final: any, hora_inicio_: any, hora_final_: any) {
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

    this.horasF.setValue('');

    // METODO PARA BUSCAR PERMISOS SOLICITADOS POR HORAS
    let solicitud = {
      fec_inicio: fecha_inicio,
      fec_final: fecha_final,
      hora_inicio: form.horaSalidaForm,
      hora_final: form.horasIngresoForm,
      codigo: this.empleado.codigo
    }
    this.restP.BuscarPermisosSolicitadosHoras(solicitud).subscribe(solicitados => {
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
          var inicio = moment.duration(hora_inicio);
          var fin = moment.duration(hora_final);

          if (form.especialForm === false) {
            // RESTAR HORAS
            var resta = fin.subtract(inicio);
          }
          else {
            var media_noche = moment.duration('24:00:00');
            var inicio_dia = moment.duration('00:00:00');

            // RESTAR HORAS
            var entrada = media_noche.subtract(inicio);
            var salida = fin.subtract(inicio_dia);

            var resta = entrada.add(salida);
          }

          // COLOCAR FORMATO DE HORAS EN FORMULARIO
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

    var descuento_comida = moment.duration(descuento);
    var tiempo_solicitado = moment.duration((tiempoTotal + ':00'));

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
    this.toastr.warning('No tiene asignada una planificación horaria en las horas ingresadas.', 'Ups!!! algo salio mal.', {
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
      fecha_inicio: moment(form.fechaInicioForm).format('YYYY-MM-DD'),
      fecha_final: moment(form.fechaFinalForm).format('YYYY-MM-DD'),
      id_empleado: parseInt(this.empleado.id)
    }
    if (form.solicitarForm === 'Horas' && form.especialForm === false) {
      datos.fecha_final = moment(form.fechaInicioForm).format('YYYY-MM-DD');
    }
    this.feriado.ListarFeriadosCiudad(datos).subscribe(data => {
      this.feriados = data;
      console.log('feriados ver ***** ', this.feriados)
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
      console.log('recuperar feriados ver ***** ', this.recuperar)
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
    let inicio = moment(form.fechaInicioForm).format('YYYY-MM-DD');
    let inicio_ = moment(form.fechaInicioForm).format('YYYY-MM-DD');
    let final = moment(form.fechaFinalForm).format('YYYY-MM-DD');

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
      var newDate = moment(inicio_).add(1, 'd').format('YYYY-MM-DD')
      inicio_ = newDate;
    }

    let datos = {
      lista_fechas: this.fechasHorario,
      codigo: this.empleado.codigo
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
          codigo: this.empleado.codigo
        }

        this.restP.BuscarPermisosSolicitadosTotales(solicitud).subscribe(solicitados => {
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

    let inicio = moment(form.fechaInicioForm).format('YYYY-MM-DD');
    let final = '';
    // SI CASO ESPECIAL SELECCIONADO
    if (form.especialForm === true) {
      // SUMAR UN DIA A LA FECHA
      final = moment(form.fechaInicioForm, 'YYYY-MM-DD').add(1, 'days').format('YYYY-MM-DD');
    } else {
      // MENTENER FECHA IGUAL
      final = moment(form.fechaInicioForm).format('YYYY-MM-DD');
    }

    // METODO PARA BUSCAR PERMISOS SOLICITADOS POR DIAS
    let solicitud = {
      fec_inicio: inicio,
      fec_final: final,
      codigo: this.empleado.codigo
    }
    this.restP.BuscarPermisosSolicitadosDias(solicitud).subscribe(solicitados => {
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
    var inicio = moment(this.dSalida, "YYYY/MM/DD").format("YYYY-MM-DD");
    var fin = moment(this.dIngreso, "YYYY/MM/DD").format("YYYY-MM-DD");

    // LOGICA PARA OBTENER EL NOMBRE DE CADA UNO DE LOS DIA DEL PERIODO INDICADO
    while (inicio <= fin) {
      this.fechas_solicitud.push(inicio);
      var newDate = moment(inicio).add(1, 'd').format('YYYY-MM-DD')
      inicio = newDate;
    }
    //console.log('fechas form ---- ', this.fechas_solicitud)
    //console.log('feriados form ---- ', this.feriados)

    // BUSCAR FERIADOS
    if (this.feriados.length != 0) {
      this.fechas_solicitud.map((obj: any) => {
        for (let i = 0; i < this.feriados.length; i++) {
          if (moment(this.feriados[i].fecha, 'YYYY-MM-DD').format('YYYY-MM-DD') === obj) {
            this.contar_feriados = this.contar_feriados + 1;
            break;
          }
        }
      })
    }
    //console.log('ver feriados ', this.contar_feriados)

    // BUSCAR FECHAS DE RECUPERACION DE FERIADOS
    if (this.recuperar.length != 0) {
      this.fechas_solicitud.map((obj: any) => {
        for (let j = 0; j < this.recuperar.length; j++) {
          if (moment(this.recuperar[j].fecha_recuperacion, 'YYYY-MM-DD').format('YYYY-MM-DD') === obj) {
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

  // GUARDAR DATOS DE PERMISO
  InsertarPermiso(form: any) {
    let datosPermiso = {
      id_empl_contrato: this.datos.id_contrato,
      id_peri_vacacion: this.periodo_vacaciones,
      depa_user_loggin: this.solInfo.id_dep,
      id_tipo_permiso: form.idPermisoForm,
      id_empl_cargo: this.datos.id_cargo,
      fec_creacion: this.FechaActual,
      hora_ingreso: form.horasIngresoForm,
      descripcion: form.descripcionForm,
      hora_numero: form.horasForm,
      num_permiso: this.num,
      hora_salida: form.horaSalidaForm,
      legalizado: this.legalizado,
      fec_inicio: form.fechaInicioForm,
      fec_final: form.fechaFinalForm,
      dia_libre: form.diaLibreForm,
      codigo: this.empleado.codigo,
      estado: 1,
      dia: parseInt(form.diasForm),
      user_name: this.user_name,
      ip: this.ip,
    }
    this.CambiarValoresDiasHoras(form, datosPermiso);
    this.CambiarValorDiaLibre(datosPermiso, form);
    console.log(datosPermiso);
  }

  // SETEAR VALORES DE DIAS Y HORAS
  CambiarValoresDiasHoras(form: any, datos: any) {
    if (form.solicitarForm === 'Dias') {
      datos.hora_numero = '00:00:00';
      datos.hora_salida = '00:00:00';
      datos.hora_ingreso = '00:00:00';
    }
    else if (form.solicitarForm === 'Horas') {
      datos.dia = 0;
    }
  }

  // SETEAR VALOR DE DIAS LIBRES
  CambiarValorDiaLibre(datos: any, form: any) {
    if (datos.dia_libre === '') {
      datos.dia_libre = 0;
      this.GuardarDatos(datos, form);
    }
    else {
      this.GuardarDatos(datos, form);
    }
  }

  // VALIDACIONES DE DATOS DE SOLICITUD
  GuardarDatos(datos: any, form: any) {
    this.restP.IngresarEmpleadoPermisos(datos).subscribe(permiso => {
      console.log('ver datos permiso ', permiso)
      this.toastr.success('Operación exitosa.', 'Permiso registrado.', {
        timeOut: 6000,
      });
      permiso.EmpleadosSendNotiEmail.push(this.solInfo);
      this.ImprimirNumeroPermiso();
      if (this.datosPermiso.documento === true) {
        this.SubirRespaldo(permiso, permiso.codigo);
      }
      else {
        if (this.archivoSubido != undefined) {
          this.SubirRespaldo(permiso, permiso.codigo);
        }
      }
      this.IngresarAutorizacion(permiso);
      if (this.datosPermiso.correo_crear === true) {
        this.EnviarCorreoPermiso(permiso);
        this.EnviarNotificacion(permiso);
      }
      this.CerrarVentana();
    });

  }


  /** ********************************************************************************** **
   ** **                       SUBIR ARCHIVO DE SOLICITUD DE PERMISO                  ** **
   ** ********************************************************************************** **/

  // SELECCIONAR ARCHIVO
  nameFile: string;
  archivoSubido: Array<File>;

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
  SubirRespaldo(permiso: any, codigo: any) {
    var id = permiso.id;
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads", this.archivoSubido[i], this.archivoSubido[i].name);
    }

    formData.append('user_name', this.user_name as string);
    formData.append('ip', this.ip as string);

    this.restP.SubirArchivoRespaldo(formData, id, codigo, null).subscribe(res => {
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


  /** ***************************************************************************************** **
   ** **                   INGRESO DE REGISTRO DE AUTORIZACION DE PERMISO                    ** **
   ** ***************************************************************************************** **/

  IngresarAutorizacion(permiso: any) {
    //console.log('this.departamento: ', this.departamento);
    // ARREGLO DE DATOS PARA INGRESAR UNA AUTORIZACION
    let newAutorizaciones = {
      orden: 1, // ORDEN DE LA AUTORIZACIÓN
      estado: 1, // ESTADO PENDIENTE
      id_departamento: this.departamento,
      id_permiso: permiso.id,
      id_vacacion: null,
      id_hora_extra: null,
      id_documento: '',
      id_plan_hora_extra: null,
      user_name: this.user_name,
      ip: this.ip,
    }
    //console.log('this.departamento: ', newAutorizaciones);
    this.restAutoriza.postAutorizacionesRest(newAutorizaciones).subscribe(res => {
    })
  }


  /** *************************************************************************************** **
   ** **                   METODOS ENVIO DE NOTIFICACIONES DE PERMISOS                     ** **
   ** *************************************************************************************** **/

  // METODO PARA OBTENER CONFIGURACION DE NOTIFICACIONES
  solInfo: any;
  departamento: any;
  ObtenerInformacionEmpleado() {
    var estado: boolean;
    this.informacion_.ObtenerInfoConfiguracion(this.datos.id_empleado).subscribe(
      res => {
        if (res) {
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
          this.departamento = res.id_departamento;
          if (this.datos.id_empleado != this.idEmpleadoIngresa) {
            this.nota = 'la solicitud';
            this.user = 'para ' + this.solInfo.fullname;
          }
        }
        else {
          this.toastr.info(
            'De clic aquí para configurar envio y recepción de notficaciones y avisos al correo electrónico.',
            'Faltan ajustes del sistema.',
            { timeOut: 9000 }).onTap.subscribe(items => {
              this.ConfigurarNotificaciones();
            });
          this.CerrarVentana();
        }
      })
  }

  // METODO PARA ABRIR CONFIGURACION DE NOTIFICACIONES
  ConfigurarNotificaciones() {
    const id_empleado = parseInt(this.datos.id_empleado);
    this.ventana.open(SettingsComponent, { width: '350px', data: { id_empleado } });
  }

  // METODO PARA ENVIAR CORREO ELECTRONICO
  EnviarCorreoPermiso(permiso: any) {

    var cont = 0;
    var correo_usuarios = '';

    // METODO PARA OBTENER NOMBRE DEL DIA EN EL CUAL SE REALIZA LA SOLICITUD DE PERMISO
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

    // VERIFICACION QUE TODOS LOS DATOS HAYAN SIDO LEIDOS PARA ENVIAR CORREO
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
      console.log('ver correos ', correo_usuarios)
      if (cont === permiso.EmpleadosSendNotiEmail.length) {

        let datosPermisoCreado = {
          tipo_solicitud: 'Permiso solicitado por',
          id_empl_contrato: permiso.id_empl_contrato,
          horas_permiso: permiso.hora_numero,
          tipo_permiso: tipo_permiso,
          dias_permiso: permiso.dia,
          observacion: permiso.descripcion,
          solicitud: solicitud,
          desde: desde,
          hasta: hasta,
          h_inicio: this.validar.FormatearHora(permiso.hora_salida, this.formato_hora),
          h_fin: this.validar.FormatearHora(permiso.hora_ingreso, this.formato_hora),
          estado_p: estado_p,
          proceso: 'creado',
          id_dep: e.id_dep,
          id_suc: e.id_suc,
          correo: correo_usuarios,
          asunto: 'SOLICITUD DE PERMISO',
          id: permiso.id,
          solicitado_por: localStorage.getItem('fullname_print'),
        }
        if (correo_usuarios != '') {

          this.restP.EnviarCorreoWeb(datosPermisoCreado).subscribe(
            resp => {
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
      tipo: 1,
      estado: 'Pendiente',
      mensaje: 'Ha realizado ' + this.nota + ' de permiso ' + this.user + ' desde ' +
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
      if (allNotificaciones.find(p => p.fullname == elemento.fullname) == undefined) {
        // NUEVA LISTA DE EMPLEADOS QUE RECIBEN LA NOTIFICACION
        allNotificaciones.push(elemento);
      }
    });

    // FOREACH PARA ENVIAR LA NOTIFICACION A CADA USUARIO DENTRO DE LA NUEVA LISTA FILTRADA
    allNotificaciones.forEach(e => {
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

  // LIMPIAR CAMPOS DEL FORMULARIO
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
    this.LimpiarCampos();
    if (this.datos.ventana === 'empleado') {
      this.componente1.formulario_permiso = false;
      this.componente1.solicitudes_permiso = true;
      this.componente1.ObtenerPermisos(this.componente1.formato_fecha, this.componente1.formato_hora);
    }
    else {
      this.componente2.activar_busqueda = true;
      this.componente2.permiso_individual = false;
    }
  }

  // VALIDACIONES INGRESAR SOLO NUMEROS
  IngresarSoloNumeros(evt: any) {
    this.horasF.setValue('');
    return this.validar.IngresarSoloNumeros(evt);
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

}
