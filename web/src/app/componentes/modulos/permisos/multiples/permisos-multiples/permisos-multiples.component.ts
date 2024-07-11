// IMPORTAR LIBRERIAS
import * as moment from 'moment';
import { PageEvent } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

// IMPORTAR SERVICIOS
import { PeriodoVacacionesService } from 'src/app/servicios/periodoVacaciones/periodo-vacaciones.service';
import { EmpleadoHorariosService } from 'src/app/servicios/horarios/empleadoHorarios/empleado-horarios.service';
import { TipoPermisosService } from 'src/app/servicios/catalogos/catTipoPermisos/tipo-permisos.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { AutorizacionService } from 'src/app/servicios/autorizacion/autorizacion.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';
import { PermisosService } from 'src/app/servicios/permisos/permisos.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { LoginService } from 'src/app/servicios/login/login.service';

import { PermisosMultiplesEmpleadosComponent } from '../permisos-multiples-empleados/permisos-multiples-empleados.component';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { PlanGeneralService } from 'src/app/servicios/planGeneral/plan-general.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { FeriadosService } from 'src/app/servicios/catalogos/catFeriados/feriados.service';
import { use } from 'echarts';

interface opcionesDiasHoras {
  valor: string;
  nombre: string
}

@Component({
  selector: 'app-permisos-multiples',
  templateUrl: './permisos-multiples.component.html',
  styleUrls: ['./permisos-multiples.component.css'],
})

export class PermisosMultiplesComponent implements OnInit {

  @Input() data: any;

  // ITEMS DE PAGINACION DE LA TABLA
  numero_pagina: number = 1;
  tamanio_pagina: number = 5;
  pageSizeOptions = [5, 10, 20, 50];

  // VARIABLES DE ALMACENAMIENTO
  usuarios: any = [];
  invalido: any = [];
  valido: any = [];

  // VER TABLA DE VALIDACIONES
  verificar: boolean = false;

  // USADO PARA IMPRIMIR DATOS
  datosPermiso: any = [];
  tipoPermisos: any = [];

  diasHoras: opcionesDiasHoras[] = [
    { valor: 'Dias', nombre: 'Dias' },
    { valor: 'Horas', nombre: 'Horas' },
  ];

  // TOTAL DE DIAS SEGUN EL TIPO DE PERMISO
  Tdias = 0;
  // TOTAL DE HORAS SEGUN EL TIPO DE PERMISO
  Thoras: any;

  // CONFIGURACION PERMISOS
  configuracion_permiso: string;

  // VARIABLE PARA GUARDAR FECHA ACTUAL TOMADA DEL SISTEMA
  FechaActual: any;
  horasTrabajo: any = [];

  // VARIABLES PARA OCULTAR O VISIBILIZAR INGRESO DE DATOS DIAS, HORAS, DIAS LIBRES
  habilitarDias: boolean = false;

  // VARIABLES PARA VER INFORMACION DEL PERMISO
  informacion1: string = '';
  informacion2: string = '';
  informacion3: string = '';
  informacion4: string = '';
  ver_informacion: boolean = false;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  nombreCertificadoF = new FormControl('');
  descripcionF = new FormControl('');
  fechaInicioF = new FormControl('', [Validators.required]);
  horaIngresoF = new FormControl('');
  fechaFinalF = new FormControl('', [Validators.required]);
  horaSalidaF = new FormControl('');
  archivoForm = new FormControl('');
  idPermisoF = new FormControl('', [Validators.required]);
  solicitarF = new FormControl('', [Validators.required]);
  especialF = new FormControl(false);
  horasF = new FormControl('');
  diasF = new FormControl('');

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    nombreCertificadoForm: this.nombreCertificadoF,
    horasIngresoForm: this.horaIngresoF,
    descripcionForm: this.descripcionF,
    fechaInicioForm: this.fechaInicioF,
    fechaFinalForm: this.fechaFinalF,
    horaSalidaForm: this.horaSalidaF,
    idPermisoForm: this.idPermisoF,
    solicitarForm: this.solicitarF,
    especialForm: this.especialF,
    horasForm: this.horasF,
    diasForm: this.diasF,
  });

  constructor(
    private loginServise: LoginService,
    private restTipoP: TipoPermisosService,
    private realTime: RealTimeService,
    private toastr: ToastrService,
    private restP: PermisosService,
    private restH: EmpleadoHorariosService,
    public restAutoriza: AutorizacionService,
    public informacion_: DatosGeneralesService,
    public componente: PermisosMultiplesEmpleadosComponent,
    public planificar: PlanGeneralService,
    public parametro: ParametrosService,
    public restPerV: PeriodoVacacionesService,
    public validar: ValidacionesService,
    public feriado: FeriadosService,
    public restE: EmpleadoService,
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

    var f = moment();
    this.FechaActual = f.format('YYYY-MM-DD');
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

  // EVENTOS DE PAGINACION
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // METODO PARA VER LA INFORMACION DEL EMPLEADO
  empleado: any = [];
  ObtenerEmpleado(idemploy: any) {
    this.empleado = [];
    this.restE.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleado = data;
    })
  }

  // METODO PARA LISTAR TIPO DE PERMISOS DE ACUERDO AL ROL DEL USUARIO
  ObtenerTiposPermiso() {
    this.tipoPermisos = [];
    let rol = this.loginServise.getRol();
    if (rol >= 2) {
      this.restTipoP.ListarTipoPermisoRol(1).subscribe(res => {
        this.tipoPermisos = res;
      });
    } else {
      this.restTipoP.BuscarTipoPermiso().subscribe(datos => {
        this.tipoPermisos = datos;
      });
    }
  }

  // METODO PARA MOSTRAR INFORMACION DEL TIPO DE PERMISO
  legalizar: boolean = false;
  descuento: boolean = false;
  activar_hora: boolean = false;
  periodo_vacaciones: number = 0;
  ImprimirDatos(form: any) {
    this.datosPermiso = [];
    this.restTipoP.BuscarUnTipoPermiso(form.idPermisoForm).subscribe(datos => {

      // VARIABLES GLOBALES SETEADAS EN 0
      this.Tdias = 0;
      this.Thoras = 0;

      // ALMACENAMIENTO DE DATOS DE PERMISO
      this.ver_informacion = true;
      this.datosPermiso = datos[0];
      //console.log('ver datos ', this.datosPermiso)

      // PERMISO LEGALIZADO
      this.legalizar = this.datosPermiso.legalizar;

      // PERMISO POR HORAS
      if (this.datosPermiso.num_dia_maximo === 0) {
        this.LimpiarFormulario('');
        this.informacion2 = '';
        this.informacion1 = `Horas máximas de permiso: ${this.datosPermiso.num_hora_maximo}`;
        this.activar_hora = true;
        this.habilitarDias = false;
        this.formulario.patchValue({
          solicitarForm: 'Horas',
        });
        this.Thoras = this.datosPermiso.num_hora_maximo;
        this.configuracion_permiso = 'Horas';
      }
      // PERMISO POR DIAS
      else if (this.datosPermiso.num_hora_maximo === '00:00:00') {
        this.LimpiarFormulario('00:00');
        this.informacion2 = '';
        this.informacion1 = `Días máximos de permiso: ${this.datosPermiso.num_dia_maximo}`;
        this.activar_hora = false;
        this.habilitarDias = true;
        this.formulario.patchValue({
          solicitarForm: 'Dias',
        });
        this.Tdias = this.datosPermiso.num_dia_maximo;
        this.configuracion_permiso = 'Dias';
      }

      // TIPO DE DESCUENTO
      if (this.datosPermiso.tipo_descuento === '1') {
        this.descuento = true;
      }
      else {
        this.descuento = false;
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

  // METODO PARA VALIDAR TIPO DE SOLICITUD
  ActivarDiasHoras(form: any) {
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

  // METODO PARA VALIDAR SI EL PERMISO TIENE RESTRICCIONES POR FECHA
  dSalida: any;
  ValidarFechaSalida(event: any, form: any) {

    // LIMPIAR CAMPOS DE FECHAS
    if (form.solicitarForm === 'Dias') {
      this.LimpiarInformacion('00:00');
    }
    else if (form.solicitarForm === 'Horas') {
      this.LimpiarInformacion('');
    }

    // VALIDACION SELECCION DE UN TIPO DE PERMISO
    if (form.idPermisoForm != '') {

      // CAPTURAR FECHA INGRESADA
      this.dSalida = event.value;
      var leer_fecha = event.value._i;
      var fecha = new Date(String(moment(leer_fecha)));
      var salida = String(moment(fecha, "YYYY/MM/DD").format("YYYY-MM-DD"));

      // VALIDAR SI EXISTE RESTRICCION DE FECHAS
      if (this.datosPermiso.fec_validar === true) {
        var fecha_negada_inicio = this.datosPermiso.fecha_inicio.split('T')[0];
        var fecha_negada_fin = this.datosPermiso.fecha_fin.split('T')[0];

        // VALIDAR FECHAS SIMILARES CON LA SOLICITUD
        if (Date.parse(salida) >= Date.parse(fecha_negada_inicio) && Date.parse(salida) <= Date.parse(fecha_negada_fin)) {
          this.toastr.warning('En la fecha ingresada no es posible otorgar este tipo de permiso.', 'VERIFICAR', {
            timeOut: 6000,
          });
          this.fechaInicioF.setValue('');
        }
        else {
          this.ValidarRestricionesFechas(salida, form);
        }
      }
      else {
        this.ValidarRestricionesFechas(salida, form);
      }
    }
    else {
      this.toastr.warning('Ups!!! no ha seleccionado ningún tipo de permiso.', '', {
        timeOut: 6000,
      });
      this.fechaInicioF.setValue('');
    }
  }


  // METODO DE TRATAMIENTO DE CONFIGURACIONES DE FECHAS DE TIPO DE PERMISOS
  ValidarRestricionesFechas(inicio: any, form: any) {
    if (moment(inicio).format('YYYY') < moment(this.FechaActual).format('YYYY')) {
      this.ValidarAñosAnteriores(inicio, form);
    }
    else {
      this.ValidarDiasPrevios(inicio, form);
    }
  }

  // METODO PARA VALIDAR FECHAS DE AÑOS PASADOS
  ValidarAñosAnteriores(inicio: any, form: any) {
    var mes_inicial = moment().format('YYYY/01/01');
    var dias = this.datosPermiso.num_dia_anterior;
    if (dias > 0) {
      var restar = moment(mes_inicial, 'YYYY/MM/DD').subtract(dias, 'days').format('YYYY/MM/DD');

      if (Date.parse(inicio) >= Date.parse(restar)) {
        this.ImprimirFecha(form);
      }
      else {
        this.toastr.warning('Ups!!! ha superado el limite de días permitido para cargar solicitudes.', '', {
          timeOut: 4000,
        });
        this.fechaInicioF.setValue('');
      }
    }
  }

  // METODO PARA VALIDAR DIAS PREVIOS DE PERMISO
  ValidarDiasPrevios(inicio: any, form: any) {
    var dias = this.datosPermiso.num_dia_anticipo;
    var restar = moment(inicio, 'YYYY/MM/DD').subtract(dias, 'days').format('YYYY/MM/DD');
    if (dias > 0) {
      if (Date.parse(this.FechaActual) <= Date.parse(restar)) {
        this.ImprimirFecha(form);
      }
      else {
        this.toastr.warning('Ups!!! el permiso debio ser solicitado con ' + this.datosPermiso.num_dia_anticipo + ' días previos.',
          '', {
          timeOut: 4000,
        });
        this.fechaInicioF.setValue('');
      }
    }
    else {
      this.ImprimirFecha(form);
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

  // METODO PARA VERIFICAR FECHA DE INGRESO
  dIngreso: any;
  ValidarFechaIngreso(event: any, form: any) {

    if (form.fechaInicioForm != '' && form.idPermisoForm != '') {

      this.dIngreso = event.value;

      // SI EL PERMISO ES POR HORAS SE IMPRIME FECHA DESDE = HASTA
      if (form.solicitarForm === 'Horas') {
        this.ImprimirFecha(form);
      }
      else {
        // CAPTURAR FECHA INGRESADA
        var fecha = new Date(String(moment(event.value._i)));
        var inicio = String(moment(form.fechaInicioForm, "YYYY/MM/DD").format("YYYY-MM-DD"));
        var fin = String(moment(fecha, "YYYY/MM/DD").format("YYYY-MM-DD"));

        // VERIFICAR QUE LA FECHA INGRESADA SEA CORRECTA
        if (Date.parse(inicio) <= Date.parse(fin)) {

          if (this.datosPermiso.fec_validar === true) {
            var fecha_negada_inicio = this.datosPermiso.fecha_inicio.split('T')[0];
            var fecha_negada_fin = this.datosPermiso.fecha_fin.split('T')[0];

            // VERIFICACION DE FECHA NO VALIDA CON LA SALIDA DE PERMISO
            if ((Date.parse(fecha_negada_inicio) >= Date.parse(inicio) && Date.parse(fecha_negada_inicio) <= Date.parse(fin)) ||
              (Date.parse(fecha_negada_fin) >= Date.parse(inicio) && Date.parse(fecha_negada_fin) <= Date.parse(fin))) {
              this.toastr.warning('En la fecha ingresada no es posible otorgar este tipo de permiso.', 'VERIFICAR', {
                timeOut: 4000,
              });
              this.fechaFinalF.setValue('');
            }
            else {
              this.ValidarConfiguracionDias();
            }
          }
          else {
            this.ValidarConfiguracionDias();
          }
        }
        else {
          this.toastr.warning('Las fechas ingresadas no son correctas.', 'VERIFICAR', {
            timeOut: 6000,
          });
          this.fechaInicioF.setValue('');
        }
      }
    }
    else {
      this.toastr.warning('Aún no selecciona un tipo de permiso o aún no ingresa fecha hasta.', 'VERIFICAR', {
        timeOut: 6000,
      });
      this.LimpiarInformacion('');
    }
  }

  // METODO PARA VERIFICAR INGRESO DE DIAS DE ACUERDO A LA CONFIGURACION DEL PERMISO
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
    }
  }

  // METODO PARA CALCULAR HORAS DE PERMISO
  CalcularHoras(form: any) {
    this.horasF.setValue('');
    // VALIDAR HORAS INGRESDAS
    if (form.horaSalidaForm != '' && form.horasIngresoForm != '') {
      //FORMATO DE HORAS
      var inicio = moment.duration(moment(form.horaSalidaForm, 'HH:mm:ss').format('HH:mm:ss'));
      var fin = moment.duration(moment(form.horasIngresoForm, 'HH:mm:ss').format('HH:mm:ss'));
      var resta: any;

      // FECHAS EN UN MISMO DIA
      if (form.especialForm === false) {
        if (inicio < fin) {
          // RESTAR HORAS
          resta = fin.subtract(inicio);
          this.CalcularTiempo(resta);
        }
        else {
          return this.toastr.warning('Horas ingresadas no son correctas.', 'VERIFICAR', {
            timeOut: 6000,
          })
        }

      }
      else {
        // FECHAS DIAS DIFERENTES
        var media_noche = moment.duration('24:00:00');
        var inicio_dia = moment.duration('00:00:00');

        // SI LAS HORA DESDE ES MAYOR A LA HORA HASTA
        if (inicio.hours() > fin.hours()) {

          // SI LA HORA DESDE ESTA DENTRO DEL RAGO ESTABLECIDO MOSTRAR HORAS
          if (inicio.hours() >= 17 && inicio.hours() <= moment.duration('23:59:00').hours()) {
            // RESTAR HORAS
            var entrada = media_noche.subtract(inicio);
            var salida = fin.subtract(inicio_dia);
            resta = entrada.add(salida);
            this.CalcularTiempo(resta);
          }
          // SI LA HORA DESDE NO ESTA DENTRO DEL RANGO SUMAR LAS HORAS DE LOS DOS DIAS
          else {
            var entrada = media_noche.subtract(inicio);
            resta = entrada.add(fin);
            this.CalcularTiempo(resta);
          }
        }
        else if (inicio.hours() < fin.hours()) {
          var entrada = media_noche.subtract(inicio);
          resta = entrada.add(fin);
          this.CalcularTiempo(resta);
        }
        else {
          // RESTAR HORAS
          var entrada = media_noche.subtract(inicio);
          var salida = fin.subtract(inicio_dia);
          resta = entrada.add(salida);
          this.CalcularTiempo(resta);
        }
      }

    }
    else {
      this.toastr.info('Debe ingresar hora desde y hora hasta, para realizar el cálculo.', 'VERIFICAR', {
        timeOut: 6000,
      })
    }
  }

  // METODO PARA CALCULAR TIEMPO SOLICITADO
  tiempoTotal: string;
  CalcularTiempo(resta: any) {
    // COLOCAR FORMATO DE HORAS EN FORMULARIO
    var horas = String(resta.hours());
    var minutos = String(resta.minutes());

    if (resta.days() === 0) {
      if (resta.hours() < 10) {
        horas = '0' + resta.hours();
      }
      if (resta.minutes() < 10) {
        minutos = '0' + resta.minutes();
      }
      // COLOCAR FORMATO DE HORAS EN FORMULARIO
      this.tiempoTotal = horas + ':' + minutos;

      // VALIDAR NUMERO DE HORAS SOLICITADAS
      this.ValidarConfiguracionHoras(this.tiempoTotal);
    }
    else {
      this.toastr.warning(
        `El tiempo solicitado es mayor a 24:00 horas.`,
        `Ups!!! algo salio mal.`, {
        timeOut: 6000,
      });
    }
  }

  // METODO PARA VERIFICAR INGRESO DE HORAS DE ACUERDO A LA CONFIGURACION DEL PERMISO
  ValidarConfiguracionHoras(valor: any) {
    if (valor === '00:00') {
      this.toastr.warning(
        `Ha solicitado ${valor} horas de permiso.`,
        `Ups!!! algo salio mal.`, {
        timeOut: 6000,
      });
      this.LimpiarInformacion('');
    }
    else {
      if (this.configuracion_permiso === 'Dias') {
        if (valor > '07:00') {
          this.MensajeIngresoHoras(8, valor);
        }
        else {
          this.horasF.setValue(valor);
        }
      }
      else if (this.configuracion_permiso === 'Horas') {
        if (valor.split(":") > this.Thoras) {
          this.MensajeIngresoHoras(8, valor);
        }
        else {
          this.horasF.setValue(valor);
        }
      }
    }
  }

  // MENSAJES DE ERRORES EN INGRESO DE HORAS
  MensajeIngresoHoras(hora_empleado: any, valor: any) {
    if (this.configuracion_permiso === 'Dias') {
      this.toastr.warning(
        `Si solicita un permiso por horas recuerde que estás deben ser menor a ${hora_empleado} horas.
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


  /** ********************************************************************************* **
   ** **                    LIMPIAR CAMPOS DEL FORMULARIO                            ** **
   ** ********************************************************************************* **/

  // METODO PARA LIMPIAR CAMPOS DEL FORMULARIO
  LimpiarCampos() {
    this.formulario.reset();
    this.HabilitarBtn = false;
  }

  // METODO PARA LIMPIAR DATOS DE ESPECIFICOS DE FORMULARIO
  LimpiarFormulario(valor: string) {
    this.formulario.patchValue({
      horasIngresoForm: '',
      fechaInicioForm: '',
      fechaFinalForm: '',
      horaSalidaForm: '',
      horasForm: valor,
      diasForm: '',
    });
  }

  // METODO PARA LIMPIAR CAMPOS FORMULARIO
  LimpiarInformacion(valor: string) {
    this.formulario.patchValue({
      horasIngresoForm: '',
      horaSalidaForm: '',
      fechaFinalForm: '',
      horasForm: valor,
      diasForm: '',
    });
  }

  // METODO PARA CERRAR FORMULARIO DE PERMISOS
  CerrarVentana() {
    this.LimpiarCampos();
    this.componente.activar_busqueda = true;
    this.componente.activar_permisos = false;
    this.componente.auto_individual = true;
    this.componente.LimpiarFormulario();
  }

  // METODO PARA VALIDAR INGRESO DE NUMEROS
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


  /** ******************************************************************************************************************* **
   ** **                                   PROCESO DE VALIDACIONES DE USUARIO                                          ** **
   ** ******************************************************************************************************************* **/

  // VARIABLES DE GESTION DE FECHAS
  fechasHorario: any;
  totalFechas: any = [];
  // METODO PARA VALIDAR REGISTRO DE PERMISO
  ValidarRegistroPermiso(form: any) {

    // VARIABLES DE ALMACENAMIENTO
    this.valido = [];
    this.usuarios = [];
    this.registrados = [];
    this.totalCorreos = [];
    this.correos_destino = '';
    this.verificar = false;
    this.verificar_ = false;

    // FECHAS TOMADAS DEL FORMULARIO
    var fecha_inicio = String(moment(this.dSalida, "YYYY/MM/DD").format("YYYY-MM-DD"));
    var fecha_inicio_ = String(moment(this.dSalida, "YYYY/MM/DD").format("YYYY-MM-DD"));
    var fecha_final = String(moment(form.fechaFinalForm, "YYYY/MM/DD").format("YYYY-MM-DD"));

    this.fechasHorario = '';
    this.totalFechas = [];
    // LOGICA PARA OBTENER CADA UNA DE LAS FECHAS INGRESADAS
    while (fecha_inicio <= fecha_final) {
      if (this.fechasHorario === '') {
        this.fechasHorario = '\'' + fecha_inicio + '\'';
      }
      else {
        this.fechasHorario = this.fechasHorario + ', \'' + fecha_inicio + '\'';
      }
      this.totalFechas.push(fecha_inicio);
      var newDate = moment(fecha_inicio).add(1, 'd').format('YYYY-MM-DD')
      fecha_inicio = newDate;
    }

    // PERMISO APLICA DESCUENTO
    if (this.descuento === true) {
      this.BuscarPeriodoVacaciones(this.data, form, this.data.length, fecha_inicio_, fecha_final)
    }
    else {
      // PERMISO NO APLICA DESCUENTOS
      if (form.solicitarForm === 'Dias') {
        //console.log('entra dias - sin descuento')
        // this.data = USUARIOS SELECCIONADOS
        this.ValidarPlanificacionDias(this.data, fecha_inicio_, fecha_final, form);
      }
      else {
        //console.log('entra horas - sin descuento')
        if (form.especialForm === false) {
          this.VerificarFeriados(this.data, form, fecha_inicio_, fecha_final);
        }
        else {
          this.ValidarSolictudesPermisosDias(this.data, form, fecha_inicio_, fecha_final);
        }
      }
    }
  }

  // METODO PARA BUSCAR PERIODO DE VACACIONES
  contar_periodo: number = 0;
  sin_periodo: number = 0;
  con_periodo: any = [];
  BuscarPeriodoVacaciones(data_usuarios: any, form: any, tamaño: any, inicio: any, final: any,) {
    this.contar_periodo = 0;
    this.sin_periodo = 0;
    this.con_periodo = [];
    data_usuarios.forEach(valor => {
      valor.dias_libres = '';
      valor.dias_laborables = '';
      valor.tiempo_solicitado = '';
      this.restPerV.BuscarIDPerVacaciones(valor.id).subscribe(datos => {
        this.contar_periodo = this.contar_periodo + 1;
        valor.observacion = 'OK';
        valor.periodo = datos[0].id;
        this.con_periodo = this.con_periodo.concat(valor);
        if (this.contar_periodo === tamaño) {
          if (form.solicitarForm === 'Dias') {
            //console.log('entra dias - sin descuento')
            // this.data = USUARIOS SELECCIONADOS
            this.ValidarPlanificacionDias(this.con_periodo, inicio, final, form);
          }
          else {
            //console.log('entra horas - sin descuento')
            if (form.especialForm === false) {
              this.VerificarFeriados(this.con_periodo, form, inicio, final);
            }
            else {
              this.ValidarSolictudesPermisosDias(this.con_periodo, form, inicio, final);
            }
          }
        }
      }, vacio => {
        this.contar_periodo = this.contar_periodo + 1;
        this.sin_periodo = this.sin_periodo + 1;
        valor.observacion = 'Usuarios no tienen registro de periodo de vacaciones.';
        this.usuarios = this.usuarios.concat(valor);
        if (this.contar_periodo === tamaño) {
          if (this.sin_periodo === tamaño) {
            this.usuarios = this.usuarios.concat(this.con_periodo);
            this.verificar = true;
          }
          else {
            if (form.solicitarForm === 'Dias') {
              //console.log('entra dias - sin descuento')
              // this.data = USUARIOS SELECCIONADOS
              this.ValidarPlanificacionDias(this.con_periodo, inicio, final, form);
            }
            else {
              //console.log('entra horas - sin descuento')
              if (form.especialForm === false) {
                this.VerificarFeriados(this.con_periodo, form, inicio, final);
              }
              else {
                this.ValidarSolictudesPermisosDias(this.con_periodo, form, inicio, final);
              }
            }
          }
        }
      });
    })
  }


  /** *********************************************************************************************************** **
   ** **                   METODOS DE VALIDACIONES PARA SOLICITUDES DE PERMISOS POR DIAS                       ** **
   ** *********************************************************************************************************** **/

  // METODO PARA VALIDAR PLANIFICACION HORARIA
  con_horario: any = [];
  sin_horario: number = 0;
  contar_horario: number = 0;
  ValidarPlanificacionDias(data_usuarios: any, inicio: any, final: any, form: any) {
    this.contar_horario = 0;
    this.sin_horario = 0
    this.con_horario = [];
    let busqueda = {
      id_empleado: '',
      lista_fechas: this.fechasHorario
    }
    data_usuarios.forEach((valor: any) => {
      valor.dias_libres = '';
      valor.dias_laborables = '';
      valor.tiempo_solicitado = '';
      this.BuscarPlanificacionDias(valor, busqueda, data_usuarios.length, inicio, final, form);
    })
  }

  // METODO PARA BUSCAR PLANIFICACION
  BuscarPlanificacionDias(valor: any, busqueda: any, tamaño: any, inicio: any, final: any, form: any) {
    busqueda.id_empleado = valor.id;
    this.planificar.BuscarHorarioFechas(busqueda).subscribe(horas => {
      let horario: any = horas;
      this.contar_horario = this.contar_horario + 1;
      // SE VERIFICA SI EL USUARIO TIENE PLANIFICADO EN TODOS LOS DIAS SOLICITADOS
      if (horario.length === (this.totalFechas.length * 2)) {
        valor.observacion = 'OK';
        valor.horario = horas;
        this.con_horario = this.con_horario.concat(valor);
        // UNA VEZ QUE LOS DATOS HAN SIDO LEIDOS PASA A VALIDACION DE PERMISOS SOLICITADOS
        if (this.contar_horario === tamaño) {
          this.ValidarPermisosSolicitados(this.con_horario, inicio, final, form);
        }
      }
      else {
        // EL USUARIO NO TIENE PLANIFICADO EN TODOS LOS DIAS SOLICITADOS
        this.sin_horario = this.sin_horario + 1;
        valor.observacion = 'Verificar planificación.';
        this.usuarios = this.usuarios.concat(valor);
        // UNA VEZ QUE LOS DATOS HAN SIDO LEIDOS PASA A VALIDACION DE PERMISOS SOLICITADOS
        if (this.contar_horario === tamaño) {
          if (this.sin_horario === tamaño) {
            this.usuarios = this.usuarios.concat(this.con_horario);
            this.verificar_ = true;
          }
          else {
            this.ValidarPermisosSolicitados(this.con_horario, inicio, final, form);
          }
        }
      }
    }, error => {
      // EL USUARIO NO TIENE REGISTRADA PLANIFICACION
      this.contar_horario = this.contar_horario + 1;
      this.sin_horario = this.sin_horario + 1;
      valor.observacion = 'Verificar planificación.';
      this.usuarios = this.usuarios.concat(valor);
      // UNA VEZ QUE LOS DATOS HAN SIDO LEIDOS PASA A VALIDACION DE PERMISOS SOLICITADOS
      if (this.contar_horario === tamaño) {
        if (this.sin_horario === tamaño) {
          this.usuarios = this.usuarios.concat(this.con_horario);
          this.verificar_ = true;
        }
        else {
          this.ValidarPermisosSolicitados(this.con_horario, inicio, final, form);
        }
      }
    });
  }

  // METODO PARA VALIDAR REGISTROS DE PERMISOS SOLICITADOS
  sin_permisos: any = [];
  con_permisos: number = 0;
  contar_permisos: number = 0;
  ValidarPermisosSolicitados(data_usuarios: any, inicio: any, final: any, form: any) {
    this.contar_permisos = 0;
    this.con_permisos = 0;
    this.sin_permisos = [];
    let busqueda = {
      codigo: '',
      fec_inicio: inicio,
      fec_final: final
    }
    data_usuarios.forEach(valor => {
      this.BuscarPermisosSolicitados(valor, busqueda, data_usuarios.length, form);
    })
  }

  // METODO PARA BUSCAR TODOS LOS PERMISOS SOLICITADOS
  ciclo_final: number = 0;
  verificar_: boolean = false;
  BuscarPermisosSolicitados(valor: any, busqueda: any, tamaño: any, form: any) {
    busqueda.codigo = valor.codigo
    this.restP.BuscarPermisosSolicitadosTotales(busqueda).subscribe(solicitados => {
      this.contar_permisos = this.contar_permisos + 1;
      // EXISTEN REGISTROS DE PERMISOS POR DIAS
      if (solicitados.length != 0) {
        valor.observacion = 'En las fechas registradas ya existe una solicitud de permiso.';
        this.con_permisos = this.con_permisos + 1;
        this.usuarios = this.usuarios.concat(valor);
        // UNA VEZ QUE SE HAN LEIDOS LOS DATOS SE MUESTRA LA DATA Y PERMITE REGISTRAR PERMISO
        if (this.contar_permisos === tamaño) {
          if (this.con_permisos === tamaño) {
            this.verificar_ = true;
          }
          else {
            this.ciclo_final = 0;
            this.sin_permisos.forEach((obj: any) => {
              this.ciclo_final = this.ciclo_final + 1;
              this.BuscarFeriados(form, obj);
            })

            if (this.ciclo_final === this.sin_permisos.length) {
              this.verificar_ = true;
            }
          }
        }
      }
      else {
        // NO EXISTEN PERMISOS SOLICITADOS POR DIAS
        valor.observacion = 'OK';
        this.sin_permisos = this.sin_permisos.concat(valor);
        // UNA VEZ QUE SE HAN LEIDOS LOS DATOS SE MUESTRA LA DATA Y PERMITE REGISTRAR PERMISO
        if (this.contar_permisos === tamaño) {
          this.ciclo_final = 0;
          //console.log('ver datos sin permisos ', this.sin_permisos)
          this.sin_permisos.forEach((obj: any) => {
            this.ciclo_final = this.ciclo_final + 1;
            this.BuscarFeriados(form, obj);
          })

          if (this.ciclo_final === this.sin_permisos.length) {
            this.verificar_ = true;
          }
        }
      }
    })
  }

  // METODO PARA BUSCAR FERIADOS
  feriados: any = [];
  BuscarFeriados(form: any, valor: any) {
    this.feriados = [];
    let datos = {
      fecha_inicio: moment(form.fechaInicioForm).format('YYYY-MM-DD'),
      fecha_final: moment(form.fechaFinalForm).format('YYYY-MM-DD'),
      id_empleado: valor.id
    }
    this.feriado.ListarFeriadosCiudad(datos).subscribe(data => {
      this.feriados = data;
      this.BuscarFeriadosRecuperar(form, valor);
    }, vacio => {
      this.BuscarFeriadosRecuperar(form, valor);
    })
  }

  // METODO PARA BUSCAR FECHAS DE RECUPERACION DE FERIADOS
  recuperar: any = [];
  BuscarFeriadosRecuperar(form: any, valor: any) {
    this.recuperar = [];
    let datos = {
      fecha_inicio: moment(form.fechaInicioForm).format('YYYY-MM-DD'),
      fecha_final: moment(form.fechaFinalForm).format('YYYY-MM-DD'),
      id_empleado: valor.id
    }
    this.feriado.ListarFeriadosRecuperarCiudad(datos).subscribe(data => {
      this.recuperar = data;
      this.ContarDiasSolicitados(valor)
    }, vacio => {
      this.ContarDiasSolicitados(valor)
    })
  }

  // CONTAR DIAS DE FERIADO EXISTENTES
  fechas_solicitud: any = [];
  contar_libres: number = 0;
  contar_feriados: number = 0;
  contar_recuperables: number = 0;
  contar_laborables: number = 0;
  ContarDiasSolicitados(valor: any) {
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
    //console.log('ver feriados -- ', this.contar_feriados)

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
    //console.log('ver recuperacion -- ', this.contar_recuperables)

    if (valor.horario.length != 0) {
      for (let k = 0; k < valor.horario.length; k++) {
        if (valor.horario[k].estado_origen === 'L' && valor.horario[k].tipo_accion === 'E') {
          this.contar_libres = this.contar_libres + 1;
        }
        if (valor.horario[k].estado_origen === 'N' && valor.horario[k].tipo_accion === 'E') {
          this.contar_laborables = this.contar_laborables + 1;
        }
      }
    }

    //console.log('ver LIBRES -- ', this.contar_libres)
    //console.log('ver LABORABLES  -- ', this.contar_laborables)

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

    if (total_laborables === 0) {
      valor.observacion = 'Solicitud de permiso en días libres o días configurados como feriados.';
      this.usuarios = this.usuarios.concat(valor);
    }
    else {
      valor.observacion = 'OK';
      valor.dias_libres = total_libres;
      valor.dias_laborables = total_laborables;
      this.usuarios = this.usuarios.concat(valor);
      this.valido = this.valido.concat(valor);
    }

    if (this.ciclo_final === this.sin_permisos.length) {
      this.BuscarNumeroPermiso(this.valido);
    }
  }


  /** *********************************************************************************************************** **
   ** **                  METODOS DE VALIDACIONES PARA SOLICITUDES DE PERMISOS POR HORAS                       ** **
   ** *********************************************************************************************************** **/

  // METODO PARA VERIFICAR SI EXISTEN FERIADOS
  contar_feriado: number = 0;
  dia_si_feriado: number = 0;
  sin_feriado: any = [];
  VerificarFeriados(data_usuarios: any, form: any, inicio: any, final: any) {
    this.contar_feriado = 0;
    this.dia_si_feriado = 0;
    this.sin_feriado = [];
    data_usuarios.forEach(valor => {
      valor.tiempo_solicitado = '';
      this.BuscarFeriadosHoras(form, valor, data_usuarios.length, inicio, final)
    })
  }

  // METODO PARA BUSCAR FERIADOS
  BuscarFeriadosHoras(form: any, valor: any, tamaño: any, inicio: any, final: any) {
    // console.log('ver datos de valor ', valor)
    this.feriados = [];
    let datos = {
      fecha_inicio: inicio,
      fecha_final: final,
      id_empleado: valor.id
    }
    this.feriado.ListarFeriadosCiudad(datos).subscribe(data => {
      this.feriados = data;
      this.contar_feriado = this.contar_feriado + 1;
      this.dia_si_feriado = this.dia_si_feriado + 1;
      valor.observacion = 'El día solicitado como permiso se encuentra configurado como feriado.';
      this.usuarios = this.usuarios.concat(valor);
      if (this.contar_feriado === tamaño) {
        if (this.dia_si_feriado === tamaño) {
          this.usuarios = this.usuarios.concat(this.sin_feriado);
          this.verificar = true;
        }
        else {
          this.ValidarSolictudesPermisosDias(this.sin_feriado, form, inicio, final);
        }
      }
    }, vacio => {
      this.contar_feriado = this.contar_feriado + 1;
      valor.observacion = 'OK';
      this.sin_feriado = this.sin_feriado.concat(valor);
      if (this.contar_feriado === tamaño) {
        this.ValidarSolictudesPermisosDias(this.sin_feriado, form, inicio, final);
      }
    })
  }

  // METODO PARA VALIDAR EXISTENCIA DE SOLICITUDES DE PERMISOS POR DIAS
  contar_permisos_dias: number = 0;
  con_permisos_dias: number = 0;
  sin_permisos_dias: any = [];
  ValidarSolictudesPermisosDias(data_usuarios: any, form: any, inicio: any, final: any) {
    this.contar_permisos_dias = 0;
    this.sin_permisos_dias = [];
    let busqueda = {
      codigo: '',
      fec_inicio: inicio,
      fec_final: final,
    }
    data_usuarios.forEach(valor => {
      valor.dias_libres = '';
      valor.dias_laborables = '';
      valor.tiempo_solicitado = '';
      this.BuscarPermisosDias(valor, busqueda, form, data_usuarios.length, inicio, final);
    })
  }

  // METODO PARA BUSCAR SOLICITUDES DE PERMISOS POR DIAS
  BuscarPermisosDias(valor: any, busqueda: any, form: any, tamaño: any, inicio: any, final: any) {
    busqueda.codigo = valor.codigo;
    this.restP.BuscarPermisosSolicitadosDias(busqueda).subscribe(solicitados => {
      //console.log('ver solicitados horas ', solicitados)
      this.contar_permisos_dias = this.contar_permisos_dias + 1;
      // EXISTEN REGISTROS DE PERMISOS POR DIAS
      if (solicitados.length != 0) {
        this.con_permisos_dias = this.con_permisos_dias + 1;
        valor.observacion = 'En las fechas registradas ya existe un permiso registrado.';
        this.usuarios = this.usuarios.concat(valor);
        if (this.contar_permisos_dias === tamaño) {
          if (this.con_permisos_dias === tamaño) {
            this.usuarios = this.usuarios.concat(this.sin_permisos_dias);
            this.verificar = true;
          }
          else {
            this.ValidarSolictudesPermisosHoras(this.sin_permisos_dias, form, inicio, final);
          }
        }
      }
      else {
        // NO EXISTEN PERMISOS SOLICITADOS POR DIAS
        valor.observacion = 'OK';
        this.sin_permisos_dias = this.sin_permisos_dias.concat(valor);
        if (this.contar_permisos_dias === tamaño) {
          this.ValidarSolictudesPermisosHoras(this.sin_permisos_dias, form, inicio, final);
        }
      }
    })
  }

  // METODO PARA VALIDAR EXISTENCIA DE SOLICITUDES DE PERMISOS POR HORAS
  finaliza_ciclo: number = 0;
  ValidarSolictudesPermisosHoras(data_usuarios: any, form: any, inicio: any, final: any) {
    var hora_inicio = moment(form.horaSalidaForm, "HH:mm:ss").format('HH:mm:ss');
    var hora_final = moment(form.horasIngresoForm, "HH:mm:ss").format('HH:mm:ss');
    let busqueda = {
      codigo: '',
      fec_inicio: inicio,
      fec_final: final,
      hora_inicio: hora_inicio,
      hora_final: hora_final,
    }
    data_usuarios.forEach(valor => {
      this.finaliza_ciclo = this.finaliza_ciclo + 1;
      this.BuscarPermisosHoras(valor, busqueda, data_usuarios.length, inicio, final, hora_inicio, hora_final, form);
    })

    if (this.finaliza_ciclo === data_usuarios.length) {
      this.verificar = true;
    }
  }

  // METODO PARA BUSCAR SOLICITUDES DE PERMISOS POR HORAS
  BuscarPermisosHoras(valor: any, busqueda: any, tamaño: any, fecha_inicio: any, fecha_final: any, hora_inicio: any, hora_final: any, form: any) {
    busqueda.codigo = valor.codigo;
    this.restP.BuscarPermisosSolicitadosHoras(busqueda).subscribe(solicitados => {
      // EXISTEN REGISTROS DE PERMISOS POR HORAS
      if (solicitados.length != 0) {
        valor.observacion = 'En las fechas ingresadas ya existe un registro de permiso.'
        this.usuarios = this.usuarios.concat(valor);
      }
      else {
        // NO EXISTEN PERMISOS SOLICITADOS POR HORAS
        if (form.especialForm === false) {
          this.VerificarFechasIguales(form, valor, fecha_inicio, fecha_final, hora_inicio, hora_final, tamaño);
        } else {
          this.VerificarFechasDiferentes(valor, fecha_inicio, fecha_final, hora_inicio, hora_final, tamaño);
        }
      }
    })
  }

  // METODO PARA LEER DATOS DE HORAS EN EL MISMO DIA
  VerificarFechasIguales(form: any, valor: any, fecha_inicio: any, fecha_final: any, hora_inicio_: any, hora_final_: any, tamaño: any) {
    let datos: any = [];
    // METODO PARA BUSCAR PERMISOS SOLICITADOS POR DIAS
    let horario = {
      fecha_inicio: fecha_inicio,
      hora_inicio: hora_inicio_,
      hora_final: hora_final_,
      codigo: valor.codigo
    }
    // BUSQUEDA DE HORARIOS EN UN MISMO DIA Y HORAS
    this.restH.BuscarHorarioHorasMD(horario).subscribe(informacion => {
      //console.log('informacion', informacion)
      datos = informacion.respuesta;
      // HORARIOS CON FINALIZACION DE JORNADA EN UN MISMO DIA
      if (informacion.message === 'CASO_1') {
        for (let i = 0; i < datos.length; i++) {
          if (hora_inicio_ >= datos[i].hora_inicio && hora_final_ <= datos[i].hora_final) {
            if (datos[i].tipo_dia_entrada === 'L') {
              // FINALIZA EL CICLO
              this.EnviarNovedadesLibres(valor);
            }
            else {
              if (this.datosPermiso.almu_incluir === true) {
                //console.log('entra almuerzo ')
                this.VerificarFechasIgualesComida(form, fecha_inicio, fecha_final, hora_inicio_, hora_final_, datos[i], valor, tamaño);
              }
              else {
                // FINALIZA EL CICLO
                this.EnviarSinNovedades(this.tiempoTotal, valor, tamaño);
              }
              break;
            }
          }
          else {
            // FINALIZA EL CICLO
            this.EnviarNovedades(valor);
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
                // FINALIZA EL CICLO
                this.EnviarNovedades(valor);
              }
              else {
                // LA HORA FINAL ES <= '23:59:00' Y LA HORA FINAL ES > QUE LA HORA DE INICIO
                if (hora_final_ <= '23:59:00' && hora_final_ > datos[i].hora_inicio) {
                  if (this.datosPermiso.almu_incluir === true) {
                    this.VerificarFechasIgualesComida(form, fecha_inicio, fecha_final, hora_inicio_, hora_final_, datos[i], valor, tamaño);
                  }
                  else {
                    // FINALIZA EL CICLO
                    this.EnviarSinNovedades(this.tiempoTotal, valor, tamaño);
                  }
                  break;
                }
                else {
                  // FINALIZA EL CICLO
                  this.EnviarNovedades(valor);
                }
              }
            }
            else {
              // FINALIZA EL CICLO
              this.EnviarNovedades(valor);
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
                  if (this.datosPermiso.almu_incluir === true) {
                    this.VerificarFechasIgualesComida(form, fecha_inicio, fecha_final, hora_inicio_, hora_final_, datos[i], valor, tamaño);
                  }
                  else {
                    // FINALIZA EL CICLO
                    this.EnviarSinNovedades(this.tiempoTotal, valor, tamaño);
                  }
                  break;
                }
                else {
                  // LA HORA DE INICIO DEBE SER >= 00:01:00 Y LA HORA DE INICIO DEBE SER < QUE LA HORA DE SALIDA DEL USUARIO
                  if (hora_inicio_ >= '00:01:00' && hora_inicio_ < datos[i].hora_final) {
                    if (this.datosPermiso.almu_incluir === true) {
                      this.VerificarFechasIgualesComida(form, fecha_inicio, fecha_final, hora_inicio_, hora_final_, datos[i], valor, tamaño);
                    }
                    else {
                      // FINALIZA EL CICLO
                      this.EnviarSinNovedades(this.tiempoTotal, valor, tamaño);
                    }
                    break;
                  }
                  else {
                    // FINALIZA EL CICLO
                    this.EnviarNovedades(valor);
                  }
                }
              }
              else {
                // FINALIZA EL CICLO
                this.EnviarNovedades(valor);
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
                // FINALIZA EL CICLO
                this.EnviarSinNovedades(this.tiempoTotal, valor, tamaño);
                break;
              }
              else {
                // LA HORA FINAL ES <= '23:59:00' Y LA HORA FINAL ES > QUE LA HORA DE INICIO
                if (hora_final_ <= '23:59:00' && hora_final_ > datos[i].hora_inicio) {
                  // FINALIZA EL CICLO
                  this.EnviarSinNovedades(this.tiempoTotal, valor, tamaño);
                  break;
                }
                else {
                  // FINALIZA EL CICLO
                  this.EnviarNovedades(valor);
                }
              }
            }
            else {
              // FINALIZA EL CICLO
              this.EnviarNovedades(valor);
            }
          }
          // CONDICION DOS: FECHA INGRESADA = A LA FECHA DE SALIDA DEL USUARIO
          else if (salida === fecha_inicio) {

            // LA HORA FINAL DEBE SER <= A LA HORA DE SALIDA DEL USUARIO
            if (hora_final_ <= datos[i].hora_final) {
              // CONDICIONES QUE SE DEBE CUMPLIR
              // SI LA HORA DE INICIO ES 00:00:00 (INICIO DE UN NUEVO DIA)
              if (hora_inicio_ === '00:00:00') {
                // FINALIZA EL CICLO
                this.EnviarSinNovedades(this.tiempoTotal, valor, tamaño);
                break;
              }
              else {
                // LA HORA DE INICIO DEBE SER >= 00:01:00 Y LA HORA DE INICIO DEBE SER < QUE LA HORA DE SALIDA DEL USUARIO
                if (hora_inicio_ >= '00:01:00' && hora_inicio_ < datos[i].hora_final) {
                  // FINALIZA EL CICLO
                  this.EnviarSinNovedades(this.tiempoTotal, valor, tamaño);
                  break;
                }
                else {
                  // FINALIZA EL CICLO
                  this.EnviarNovedades(valor);
                }
              }
            }
            else {
              // FINALIZA EL CICLO
              this.EnviarNovedades(valor);
            }
          }
          else if (intermedio === fecha_inicio) {
            // FINALIZA EL CICLO
            this.EnviarSinNovedades(this.tiempoTotal, valor, tamaño);
            break;
          }
        }
      }
    }, vacio => {
      // FINALIZA EL CICLO
      this.EnviarNovedades(valor);
    })
  }

  // METODO PARA LEER DATOS DE HORAS - ALIMENTACION EN EL MISMO DIA
  VerificarFechasIgualesComida(form: any, fecha_inicio: any, fecha_final: any, hora_inicio_: any, hora_final_: any, horario_: any, valor: any, tamaño) {
    let datos: any = [];
    // METODO PARA BUSCAR PERMISOS SOLICITADOS POR DIAS
    let horario = {
      fecha_inicio: fecha_inicio,
      hora_inicio: form.horaSalidaForm,
      hora_final: form.horasIngresoForm,
      codigo: valor.codigo
    }
    // BUSQUEDA DE HORARIOS EN UN DIA Y HORAS
    this.restH.BuscarComidaHorarioHorasMD(horario).subscribe(informacion => {
      //console.log('informacion comida', informacion)
      datos = informacion.respuesta;
      // HORARIOS CON FINALIZACION DE JORNADA EN UN MISMO DIA
      if (informacion.message === 'CASO_1') {
        for (let i = 0; i < datos.length; i++) {
          // FINALIZA EL CICLO
          this.CalcularAlimentacion(datos[i].min_almuerzo, valor, tamaño);
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
              //console.log('entra if entrada = fecha_inicio')
              // FINALIZA EL CICLO
              this.CalcularAlimentacion(datos[i].min_almuerzo, valor, tamaño);
              break;
            }
            else {
              // FINALIZA EL CICLO
              this.EnviarNovedades(valor);
            }
          }
          else {
            // CONDICION DOS: FECHA INGRESADA = A LA FECHA DE SALIDA DEL USUARIO
            if (salida === fecha_inicio) {
              if ((hora_inicio_ >= '00:00:00' && hora_inicio_ < datos[i].hora_final) &&
                ((hora_final_ >= datos[i].hora_final || hora_final_ <= datos[i].hora_final) &&
                  hora_final_ <= horario_.hora_final)) {
                //console.log('entra if salida = fecha_inicio')
                // FINALIZA EL CICLO
                this.CalcularAlimentacion(datos[i].min_almuerzo, valor, tamaño);
                break;
              }
              else {
                // FINALIZA EL CICLO
                this.EnviarNovedades(valor);
              }
            }
          }
        }
      }
    }, vacio => {
      // FINALIZA EL CICLO
      this.EnviarNovedades(valor);
    })
  }

  // METODO PARA LEER DATOS DE HORAS EN DIAS DIFERENTES
  VerificarFechasDiferentes(valor: any, fecha_inicio: any, fecha_final: any, hora_inicio_: any, hora_final_: any, tamaño: any) {
    let datos: any = [];
    // METODO PARA BUSCAR PERMISOS SOLICITADOS POR DIAS
    let horario = {
      fecha_inicio: fecha_inicio,
      fecha_final: fecha_final,
      codigo: valor.codigo
    }
    // BUSQUEDA DE HORARIOS EN UN DIA Y HORAS
    this.restH.BuscarHorarioHorasDD(horario).subscribe(informacion => {
      datos = informacion.respuesta;
      //console.log('ver informacion ', informacion)
      // HORARIOS CON FINALIZACION DE JORNADA EN DIAS DIFERENTES (SEGUNDO DIA)
      if (informacion.message === 'CASO_4') {
        // RECORRER TODOS LOS DATOS DE HORARIOS EXISTENTES
        for (let i = 0; i < datos.length; i++) {
          if (hora_inicio_ >= datos[i].hora_inicio && hora_final_ <= datos[i].hora_final) {
            if (this.datosPermiso.almu_incluir === true) {
              this.VerificarFechasDiferentesComida(fecha_inicio, fecha_final, hora_inicio_, hora_final_, valor, tamaño);
            }
            else {
              // FINALIZA EL CICLO
              this.EnviarSinNovedades(this.tiempoTotal, valor, tamaño);
            }
            break;
          }
          else {
            // FINALIZA EL CICLO
            this.EnviarNovedades(valor);
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
              // FINALIZA EL CICLO
              this.EnviarSinNovedades(this.tiempoTotal, valor, tamaño);
              break;
            }
            else {
              // FINALIZA EL CICLO
              this.EnviarNovedades(valor);
            }
          }
          else if (intermedio === fecha_inicio) {
            if (hora_final_ <= datos[i].hora_final) {
              // FINALIZA EL CICLO
              this.EnviarSinNovedades(this.tiempoTotal, valor, tamaño);
              break;
            }
            else {
              // FINALIZA EL CICLO
              this.EnviarNovedades(valor);
            }
          }
        }
      }
    }, vacio => {
      // FINALIZA EL CICLO
      this.EnviarNovedades(valor);
    })
  }

  // METODO PARA LEER DATOS DE HORAS - ALIMENTACION EN DIAS DIFERENTES
  VerificarFechasDiferentesComida(fecha_inicio: any, fecha_final: any, hora_inicio_: any, hora_final_: any, valor: any, tamaño: any) {
    let datos_: any = [];
    // METODO PARA BUSCAR PERMISOS SOLICITADOS POR DIAS
    let horario = {
      fecha_inicio: fecha_inicio,
      fecha_final: fecha_final,
      codigo: valor.codigo
    }
    // BUSQUEDA DE HORARIOS EN UN DIA Y HORAS
    this.restH.BuscarComidaHorarioHorasDD(horario).subscribe(informacion => {
      datos_ = informacion.respuesta;
      //console.log('ver informacion comida caso 4', informacion)
      // HORARIOS CON FINALIZACION DE JORNADA EN DIAS DIFERENTES (SEGUNDO DIA)
      if (informacion.message === 'CASO_4') {
        // RECORRER TODOS LOS DATOS DE HORARIOS EXISTENTES
        for (let i = 0; i < datos_.length; i++) {
          if (hora_inicio_ >= datos_[i].hora_inicio && hora_final_ <= datos_[i].hora_final) {
            // FINALIZA EL CICLO
            this.CalcularAlimentacion(datos_[i].min_almuerzo, valor, tamaño);
          }
          else {
            // FINALIZA EL CICLO
            this.EnviarNovedades(valor);
          }
        }
      }
    }, vacio => {
      // FINALIZA EL CICLO
      this.EnviarNovedades(valor);
    })
  }

  // METODO PARA CALCULAR DESCUENTO POR ALIMENTACION
  CalcularAlimentacion(comida: any, valor: any, tamaño: any) {
    let descuento = this.TransformarSegundoHoras(comida * 60);

    var descuento_comida = moment.duration(descuento);
    var tiempo_solicitado = moment.duration((this.tiempoTotal + ':00'));

    if (descuento_comida >= tiempo_solicitado) {
      valor.observacion = 'Revisar descuento de minutos de alimentación. Permiso solicitado de 00:00:00 horas.';
      valor.tiempo_solicitado = '';
      this.usuarios = this.usuarios.concat(valor);
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

      this.EnviarSinNovedades(valorTotal, valor, tamaño);
    }
  }

  // METODO PARA NOTIFICAR NOVEDADES EN EL REGISTRO
  EnviarNovedades(valor: any) {
    valor.observacion = 'El usuario no tiene registrado planificación horaria en las horas ingresadas.';
    valor.tiempo_solicitado = '';
    this.usuarios = this.usuarios.concat(valor);
  }

  // METODO PARA NOTIFICAR NOVEDADES EN EL REGISTRO
  EnviarNovedadesLibres(valor: any) {
    valor.observacion = 'El día solicitado como permiso se encuentra configurado como libre.';
    valor.tiempo_solicitado = '';
    this.usuarios = this.usuarios.concat(valor);
  }

  // METODO PARA NOTIFICAR NOVEDADES EN EL REGISTRO
  EnviarSinNovedades(tiempo: any, valor: any, tamaño: any) {
    valor.observacion = 'OK';
    valor.tiempo_solicitado = tiempo;
    this.valido = this.valido.concat(valor);
    this.usuarios = this.usuarios.concat(valor);
    if (this.finaliza_ciclo === tamaño) {
      this.BuscarNumeroPermiso(this.valido);
    }
  }

  // METODO PARA BUSCAR NUMERO DE PERMISOS
  BuscarNumeroPermiso(data_usuarios: any) {
    data_usuarios.forEach(valor => {
      // METODO BUSQUEDA NUMERO DE PERMISO
      this.restP.BuscarNumPermiso(valor.id).subscribe(num => {
        // CONTABILIZAR NUMERO DE PERMISO
        if (num[0].max === null) {
          valor.numero_permiso = 1;
          this.ObtenerInformacionEmpleado(valor);
        }
        else {
          valor.numero_permiso = num[0].max + 1;
          this.ObtenerInformacionEmpleado(valor);
        }
      })
    })
  }

  // METODO PARA OBTENER CONFIGURACION DE NOTIFICACIONES
  ObtenerInformacionEmpleado(valor: any) {
    console.log('verificar valor de notificacion valor ', valor)
    this.informacion_.ObtenerInfoConfiguracion(valor.id).subscribe(
      res => {
        if (res) {
          valor.configurado = true;
          valor.id_sucursal = res.id_sucursal;
          valor.permiso_mail = res.permiso_mail;
          valor.permiso_noti = res.permiso_notificacion;
          valor.id_departamento = res.id_departamento;
        }
        else {
          valor.configurado = false;
        }
      })
  }

  /** *************************************************************************************************** **
   ** **                              SUBIR ARCHIVO DE SOLICITUD DE PERMISO                            ** **
   ** *************************************************************************************************** **/

  // METODO PARA SELECCIONAR UN ARCHIVO
  nameFile: string;
  archivoSubido: Array<File>;
  fileChange(element: any) {
    this.archivoSubido = element.target.files;
    if (this.archivoSubido.length != 0) {
      // VALIDAR QUE EL DOCUMENTO SUBIDO CUMPLA CON EL TAMAÑO ESPECIFICADO
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

  // METODO PARA REGISTRAR ARCHIVO DE PERMISO
  SubirRespaldo(id: number, codigo: any) {
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads", this.archivoSubido[i], this.archivoSubido[i].name);
    }

    formData.append('user_name', this.user_name as string);
    formData.append('ip', this.ip as string);

    this.restP.SubirArchivoRespaldo(formData, id, codigo, null).subscribe(res => {
      this.archivoForm.reset();
      this.nameFile = '';
    });
  }

  // METODO PARA LIMPIAR FORMULARIO DEL ARCHIVO
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
    this.nombreCertificadoF.patchValue('');
  }


  /**  *********************************************************************************************** **
   **  **                           REGISTRAR PERMISO MULTIPLE                                      ** **
   **  *********************************************************************************************** **/

  // METODO PARA CAMBIAR VALOR DE
  CambiarValoresDiasHoras(form: any, datos: any) {
    if (form.solicitarForm === 'Dias') {
      datos.hora_numero = '00:00:00';
      datos.hora_salida = '00:00:00';
      datos.hora_ingreso = '00:00:00';
    }
    else if (form.solicitarForm === 'Horas') {
      datos.dia = 0;
      this.CambiarValorDiaLibre(datos);
    }
  }

  // METODO PARA CAMBIAR FORMATO DE DIAS LIBRES
  CambiarValorDiaLibre(datos: any) {
    if (datos.dia_libre === '') {
      datos.dia_libre = 0;
    }
  }

  // METODO PARA LEER DATOS DE USUARIOS VALIDOS
  RegistrarPermisos(form: any) {
    console.log('ver usuarios ', this.usuarios);
    console.log('ver validos ', this.valido);
    this.notifica_registros = [];
    this.totalNotifica_aprueba = [];
    this.InsertarPermiso(form);

  }

  // METODO INGRESO DE DATOS DE PERMISO
  contador: number = 0;
  InsertarPermiso(form: any) {

    this.contador = 0;

    // LECTURA DE DATOS DE USUARIOS SELECCIONADOS
    this.valido.forEach(valor => {

      // DATOS DE PERMISO
      let datosPermiso = {

        // VALORES GENERALES
        estado: 1,
        fec_final: form.fechaFinalForm,
        fec_inicio: form.fechaInicioForm,
        legalizado: this.datosPermiso.legalizar,
        hora_salida: form.horaSalidaForm,
        descripcion: form.descripcionForm,
        docu_nombre: form.nombreCertificadoForm,
        fec_creacion: this.FechaActual,
        hora_ingreso: form.horasIngresoForm,
        id_tipo_permiso: form.idPermisoForm,
        depa_user_loggin: valor.id_departamento,

        // VALORES SEGUN USUARIO
        codigo: valor.codigo,
        id_empl: valor.id,
        num_permiso: valor.numero_permiso,
        id_empl_cargo: valor.id_cargo,
        id_empl_contrato: valor.id_contrato,

        // VALORES OBTENIDOS CON VALIDACIONES
        dia: 0,
        dia_libre: 0,
        hora_numero: 0,
        id_peri_vacacion: 0,
        user_name: this.user_name,
        ip: this.ip,
      }

      this.CambiarValoresDiasHoras(form, datosPermiso);

      // TIPO DE DESCUENTO
      if (this.datosPermiso.tipo_descuento === '1') {
        datosPermiso.id_peri_vacacion = valor.periodo;
      }
      else {
        this.descuento = false;
        datosPermiso.id_peri_vacacion = 0;
      }

      // TIEMPO SOLICITADO
      if (form.solicitarForm === 'Dias') {
        datosPermiso.dia = valor.dias_laborables;
        datosPermiso.dia_libre = valor.dias_libres;
      }
      else if (form.solicitarForm === 'Horas') {
        datosPermiso.hora_numero = valor.tiempo_solicitado;
      }

      this.GuardarDatos(datosPermiso, form, valor);

    });

  }

  // METODO PARA GUARDAR DATOS DE SOLICITUD DE PERMISO
  GuardarDatos(datos: any, form: any, valor: any) {
    // VALIDAR QUE SE HA SUBIDO UN DOCUMENTO AL SISTEMA
    if (form.nombreCertificadoForm != '' && form.nombreCertificadoForm != null) {
      this.RegistrarPermiso_Documento(datos, form, valor);

    } else {
      this.RegistrarPermiso(datos, valor, form);
    }
  }

  // METODO PARA REGISTRAR PERMISO CON DOCUMENTO
  RegistrarPermiso_Documento(datos: any, form: any, valor: any) {

    this.restP.IngresarEmpleadoPermisos(datos).subscribe(response => {
      //console.log('ver permiso registrado ', response)
      var usuarios: any = [];
      this.contador = this.contador + 1;
      this.correctos = this.correctos + 1;

      // METODO PARA SUBIR DOCUMENTO
      this.SubirRespaldo(response.id, response.codigo);

      // METODO PARA REGISTRO DE AUTORIZACION
      this.IngresarAutorizacion(response.id);

      // LECTURA DE CORREOS
      this.LeerCorreos(response.EmpleadosSendNotiEmail);
      // LECTURA DE NOTIFICACIONES
      this.LeerNotificacion(response.EmpleadosSendNotiEmail, valor.id);
      if (valor.configurado === true) {
        if (valor.permiso_mail === true) {
          this.totalCorreos = this.totalCorreos.concat(valor.correo);
        }
        if (valor.permiso_noti === true) {
          let aprobar = {
            id_empl_recive: valor.id,
            envia_usuario: valor.id,
          }
          this.notifica_registros = this.notifica_registros.concat(aprobar);
        }
      }

      // DATOS DE USUARIOS REGISTRADOS PERMISO
      usuarios = {
        estado: 'Pendiente',
        codigo: valor.codigo,
        cedula: valor.cedula,
        empleado: valor.nombre,
        dias_libres: valor.dias_libres,
        departamento: valor.name_departamento,
        dias_laborables: valor.dias_laborables,
        tiempo_solicitado: valor.tiempo_solicitado,
        id_permiso: response.num_permiso,
      }

      this.registrados = this.registrados.concat(usuarios);

      // FINALIZACION DE CICLO
      if (this.contador === this.valido.length) {
        this.ProcesarFunciones(datos, form);
      }

    }, error => {
      this.contador = this.contador + 1;
      this.errores = this.errores + 1;
      // FINALIZACION DE CICLO
      if (this.contador === this.valido.length) {
        if (this.errores === this.valido.length) {
          this.toastr.warning('Ups!!! algo salio mal.', 'No fue posible registrar solicitudes de permiso.', {
            timeOut: 6000,
          });
        }
        else {
          this.ProcesarFunciones(datos, form);
        }
      }
    });
  }

  // METODO PARA INGRESAR SOLICITUD DE PERMISO
  registrados: any = [];
  correctos: number = 0;
  errores: number = 0;
  notifica_registros: any = []
  RegistrarPermiso(datos: any, valor: any, form: any) {

    this.restP.IngresarEmpleadoPermisos(datos).subscribe(response => {
      //console.log('ver permiso registrado ', response)
      // METODO PARA REGISTRO DE AUTORIZACION
      this.IngresarAutorizacion(response.id);

      var usuarios: any = [];
      this.contador = this.contador + 1;
      this.correctos = this.correctos + 1;

      // LECTURA DE CORREOS
      this.LeerCorreos(response.EmpleadosSendNotiEmail);
      // LECTURA DE NOTIFICACIONES
      this.LeerNotificacion(response.EmpleadosSendNotiEmail, valor.id);
      if (valor.configurado === true) {
        if (valor.permiso_mail === true) {
          this.totalCorreos = this.totalCorreos.concat(valor.correo);
        }
        if (valor.permiso_noti === true) {
          let aprobar = {
            id_empl_recive: valor.id,
            envia_usuario: valor.id,
          }
          this.notifica_registros = this.notifica_registros.concat(aprobar);
        }
      }

      //console.log('ver notifica usua ', this.notifica_registros)

      // DATOS DE USUARIOS REGISTRADOS PERMISO
      usuarios = {
        estado: 'Pendiente',
        codigo: valor.codigo,
        cedula: valor.cedula,
        empleado: valor.nombre,
        dias_libres: valor.dias_libres,
        departamento: valor.name_departamento,
        dias_laborables: valor.dias_laborables,
        tiempo_solicitado: valor.tiempo_solicitado,
        id_permiso: response.num_permiso
      }

      this.registrados = this.registrados.concat(usuarios);

      // FINALIZACION DE CICLO
      if (this.contador === this.valido.length) {
        this.ProcesarFunciones(datos, form);
      }

    }, err => {
      this.contador = this.contador + 1;
      this.errores = this.errores + 1;
      // FINALIZACION DE CICLO
      if (this.contador === this.valido.length) {
        if (this.errores === this.valido.length) {
          this.toastr.warning('Ups!!! algo salio mal.', 'No fue posible registrar solicitudes de permiso.', {
            timeOut: 6000,
          });
        }
        else {
          this.ProcesarFunciones(datos, form);
        }
      }
    });
  }

  // METODO PARA LEER CORREOS DESTINOS
  correos_destino: string = '';
  totalCorreos: any = [];
  LeerCorreos(datos_usuario: any) {
    datos_usuario.forEach(valor => {
      if (valor.permiso_mail === true) {
        this.totalCorreos = this.totalCorreos.concat(valor.correo);
      }
    })
  }

  // METODO PARA ELIMINAR CORREOS DUPLICADOS
  EliminarDuplicados() {
    this.totalCorreos = this.totalCorreos.filter((item, index) => this.totalCorreos.indexOf(item) === index);
    this.totalCorreos.forEach(valor => {
      if (this.correos_destino === '') {
        this.correos_destino = valor;
      }
      else {
        this.correos_destino = this.correos_destino + ', ' + valor;
      }
    })
  }

  // METODO PARA LEER DATOS DE ENVÍO DE EMAIL
  LeerDatosMail(datos: any, form: any) {
    // LEYENDO DATOS DE TIPO DE PERMISO
    var tipo_permiso = '';
    this.tipoPermisos.filter((o: any) => {
      if (o.id === datos.id_tipo_permiso) {
        tipo_permiso = o.descripcion
      }
      return tipo_permiso;
    })
    // METODO PARA OBTENER NOMBRE DEL DIA EN EL CUAL SE REALIZA LA SOLICITUD DE PERMISO
    let solicitud = this.validar.FormatearFecha(datos.fec_creacion, this.formato_fecha, this.validar.dia_completo);
    let desde = this.validar.FormatearFecha(datos.fec_inicio, this.formato_fecha, this.validar.dia_completo);
    let hasta = this.validar.FormatearFecha(datos.fec_final, this.formato_fecha, this.validar.dia_completo);
    let mail = {
      correo: this.correos_destino,
      desde: desde,
      hasta: hasta,
      h_inicio: this.validar.FormatearHora(datos.hora_salida, this.formato_hora),
      h_fin: this.validar.FormatearHora(datos.hora_ingreso, this.formato_hora),
      observacion: datos.descripcion,
      estado_p: 'Pendiente',
      proceso: 'creado',
      solicitud: solicitud,
      asunto: 'SOLICITUD MULTIPLE DE PERMISO',
      tipo_solicitud: 'Permiso registrado por',
      usuario_solicita: parseInt(localStorage.getItem('empleado') as string),
      usuarios: this.registrados,
      tipo: form.solicitarForm,
      tipo_permiso: tipo_permiso,
    }
    return mail;
  }

  // METODO PARA CREAR AUTORIZACION DE SOLICITUD DE PERMISO
  IngresarAutorizacion(id_permiso: number) {
    // ARREGLO DE DATOS PARA INGRESAR UNA AUTORIZACION
    let newAutorizaciones = {
      orden: 1, // ORDEN DE LA AUTORIZACION
      estado: 1, // ESTADO PENDIENTE
      id_departamento: parseInt(localStorage.getItem('departamento') as string),
      id_permiso: id_permiso,
      id_vacacion: null,
      id_hora_extra: null,
      id_documento: '',
      id_plan_hora_extra: null,
      user_name: this.user_name,
      ip: this.ip,
    }
    this.restAutoriza.postAutorizacionesRest(newAutorizaciones).subscribe(res => {
    })
  }

  // METODO DE PROCESAMIENTO DE FUNCIONES FINALES
  ProcesarFunciones(datos: any, form: any) {
    // ELIMINAR DUPLICADOS DE CORREOS
    this.EliminarDuplicados();

    // ELIMINAR DUPLICADOS DE USUARIOS QUE APRUEBAN Y ENVIAR NOTIFICACION
    this.EliminarDuplicadosNotificacion();

    // ENVIAR NOTIFICACIONES A USUARIOS REGISTRADOS PERMISOS
    this.EnviarNotificaciones(this.notifica_registros);

    // LECTURA DE DATOS DE NOTIFICACION CORREO
    let datos_mail = this.LeerDatosMail(datos, form);

    // METODO PARA ENVIO DE CORREOS
    this.restP.EnviarCorreoWebMultiple(datos_mail).subscribe(mail => {
      if (mail.message === 'ok') {
        //console.log('ver verificado ', this.verificador)
        if (this.verificador === true) {
          this.toastr.success('Se ha registrado ' + this.correctos + ' solictudes de permiso.',
            'Correo de solicitud enviado exitosamente.', {
            timeOut: 6000,
          });
          this.verificar = false;
          this.verificar_ = false;
        }
      }
      else {
        //console.log('ver verificador ', this.verificador)
        if (this.verificador === true) {
          this.toastr.warning('Ups!!! algo salio mal.', 'No fue posible enviar correo de solicitud.', {
            timeOut: 6000,
          });
          this.verificar = false;
          this.verificar_ = false;
        }
      }
    });
  }

  // METODO PARA LEER CORREOS DESTINOS
  totalNotifica_aprueba: any = [];
  LeerNotificacion(datos_usuario: any, usuario_envia: number) {
    datos_usuario.forEach(valor => {
      if (valor.permiso_noti === true) {
        let aprobar = {
          id_empl_recive: valor.id_aprueba,
          envia_usuario: usuario_envia,
        }
        this.totalNotifica_aprueba = this.totalNotifica_aprueba.concat(aprobar);
      }
    })
  }

  // METODO PARA ELIMINAR CORREOS DUPLICADOS
  EliminarDuplicadosNotificacion() {
    this.totalNotifica_aprueba = this.totalNotifica_aprueba.filter((obj, index, self) =>
      index === self.findIndex((o) => o.id_empl_recive === obj.id_empl_recive)
    );
    // LECTURA DE DATOS Y ENVIO DE NOTIFICACION SISTEMA
    this.EnviarNotificaciones(this.totalNotifica_aprueba);
  }

  // METODO PARA LEER DATOS DE NOTIIFCACION SISTEMA
  verificador: boolean = false;
  EnviarNotificaciones(datos_usuario: any) {
    let contador = 0;
    this.verificador = false;
    datos_usuario.forEach(valor => {
      contador = contador + 1;
      let mensaje = {
        id_empl_envia: valor.envia_usuario,
        id_empl_recive: valor.id_empl_recive,
        mensaje: 'Se ha realizado un solicitud múltiple de permisos. Por favor revisar solicitudes pendientes de aprobación. Para mayor información revisar su correo.',
        tipo: 7,  // ES EL TIPO DE NOTIFICACION - PERMISOS MULTIPLES
        user_name: this.user_name,
        ip: this.ip,
      }
      this.realTime.EnviarMensajeGeneral(mensaje).subscribe(res => {
        this.realTime.RecibirNuevosAvisos(res.respuesta);
      })
    })

    if (contador === datos_usuario.length) {
      this.verificador = true;
    }
  }

}
