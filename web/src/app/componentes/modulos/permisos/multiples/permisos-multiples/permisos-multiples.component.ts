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
  datoNumPermiso: any = [];
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

  // NUMERO DEL PERMISO
  num: number;
  configuracion_permiso: string;

  // VARIABLE PARA GUARDAR FECHA ACTUAL TOMADA DEL SISTEMA
  FechaActual: any;
  horasTrabajo: any = [];

  // VARIABLES PARA OCULTAR O VISIBILIZAR INGRESO DE DATOS DIAS, HORAS, DIAS LIBRES
  habilitarDias: boolean = false;

  // VARIABLES PARA VER INFORMACION DEL PERMISO
  informacion1: string = '';
  informacion2: string = '';
  ver_informacion: boolean = false;

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
    public restPerV: PeriodoVacacionesService,
    public validar: ValidacionesService,
    public restE: EmpleadoService,
    public componente: PermisosMultiplesEmpleadosComponent,
  ) { }

  ngOnInit(): void {
    console.log('ver data ', this.data)
    var f = moment();
    this.FechaActual = f.format('YYYY-MM-DD');
    this.ObtenerTiposPermiso();
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
      console.log('ver datos ', this.datosPermiso)
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
      // TIPO DE DESCUENTO
      if (this.datosPermiso.tipo_descuento === '1') {
        this.descuento = true;
      }
      else {
        this.descuento = false;
        this.periodo_vacaciones = 0;
      }
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
      if (this.datosPermiso.fecha != '' && this.datosPermiso.fecha != null) {
        var fecha_negada = this.datosPermiso.fecha.split('T')[0];

        // VALIDAR FECHAS SIMILARES CON LA SOLICITUD
        if (Date.parse(salida) === Date.parse(fecha_negada)) {
          this.toastr.info('En la fecha ingresada no es posible otorgar este tipo de permiso.', 'VERIFICAR', {
            timeOut: 6000,
          });
          this.fechaInicioF.setValue('');
        }
        else {
          this.ImprimirFecha(form);
        }
      }
      else {
        this.ImprimirFecha(form);
      }
    }
    else {
      this.toastr.warning('Ups!!! no ha seleccionado ningún tipo de permiso.', '', {
        timeOut: 6000,
      });
      this.fechaInicioF.setValue('');
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
          this.ValidarConfiguracionDias();
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

      // FECHAS EN UN MISMO DIA
      if (form.especialForm === false) {
        if (inicio < fin) {
          // RESTAR HORAS
          var resta = fin.subtract(inicio);
        }
        else {
          return this.toastr.warning('Horas ingresadas no son correctas.', 'VERIFICAR', {
            timeOut: 6000,
          })
        }
        // FECHAS DIAS DIFERENTES
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

      this.horasF.setValue(tiempoTotal);

      // VALIDAR NUMERO DE HORAS SOLICITADAS
      this.ValidarConfiguracionHoras(tiempoTotal);
    }
    else {
      this.toastr.info('Debe ingresar hora desde y hora hasta, para realizar el cálculo.', 'VERIFICAR', {
        timeOut: 6000,
      })
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
      }
      else if (this.configuracion_permiso === 'Horas') {
        if (valor.split(":") > this.Thoras) {
          this.MensajeIngresoHoras(8, valor);
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
  SubirRespaldo(id: number, form: any) {
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads[]", this.archivoSubido[i], this.archivoSubido[i].name);
    }
    this.restP.SubirArchivoRespaldo(formData, id, form.nombreCertificadoForm, null).subscribe(res => {
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

  // METODO PARA VALIDAR PERIODO DE VACACIONES
  contar_vacacion: any = 0;
  ValidarRegistroPermiso(form: any) {
    this.usuarios = [];
    this.invalido = [];
    this.valido = [];
    if (this.descuento === true) {
      this.contar_vacacion = 0;
      this.data.forEach(valor => {
        let informacion = {
          nombre: '',
          codigo: '',
        }
        this.BuscarPeriodoVacaciones(valor, informacion, form, this.data)
      })
    }
    else {

    }
  }

  // METODO PARA BUSCAR PERIODO DE VACACIONES
  BuscarPeriodoVacaciones(valores: any, arreglo: any, form: any, data_general: any) {
    // TOMAR DATOS DE LA DATA PRINCIPAL
    if (valores.name_empleado) {
      arreglo.nombre = valores.name_empleado;
    }
    else {
      arreglo.nombre = valores.nombre;
    }
    arreglo.codigo = valores.codigo;
    // METODO PARA BUSCAR PERIODO DE VACACIONES
    this.restPerV.BuscarIDPerVacaciones(valores.id).subscribe(datos => {
      this.contar_vacacion = this.contar_vacacion + 1;
      arreglo.vacaciones = datos[0].id;
      arreglo.observacion = 'OK';
      this.valido = this.valido.concat(arreglo);
      // UNA VEZ QUE SON LEIDOS LOS DATOS DE PERIODO PASA A VALIDACION DE PLANIFICACIONES
      console.log('ver contadores vacaciones 1', this.contar_vacacion, ' datos totales ', this.data.length)
      if (this.contar_vacacion === data_general.length) {
        if (form.solicitarForm === 'Dias') {
          console.log('entra vacaciones 1 dias')
          this.ValidarPlanificacionDias(this.valido);
        }
        else {
          console.log('entra vacaciones 1 horas')
          this.ValidarSolictudesPermisosDias(this.valido, form);
        }
      }
      // SI NO EXISTE PERIODO DE VACACIONES
    }, error => {
      this.contar_vacacion = this.contar_vacacion + 1;
      arreglo.observacion = 'Verificar periodo de vacaciones.';
      this.invalido = this.invalido.concat(arreglo);
      // SI LOS DATOS HAN SIDO LEIDOS PASA A VALIDACION DE PLANIFICACION
      console.log('ver contadores vacaciones 2', this.contar_vacacion, ' datos totales ', this.data.length)
      if (this.contar_vacacion === data_general.length) {
        if (this.valido.length != 0) {
          if (form.solicitarForm === 'Dias') {
            console.log('entra vacaciones 2 dias')
            this.ValidarPlanificacionDias(this.valido);
          }
          else {
            console.log('entra vacaciones 2 horas')
            this.ValidarSolictudesPermisosDias(this.valido, form);
          }
        }
        else {
          this.usuarios = this.usuarios.concat(this.invalido);
          this.verificar = true;
        }
      }
    });
  }

  /** *********************************************************************************************************** **
   ** **                   METODOS DE VALIDACIONES PARA SOLICITUDES DE PERMISOS POR DIAS                       ** **
   ** *********************************************************************************************************** **/

  // METODO PARA VALIDAR PLANIFICACION HORARIA
  valido_horario: any = [];
  contar_horario: any = 0;
  ValidarPlanificacionDias(data_usuarios: any) {
    this.contar_horario = 0;
    this.valido_horario = [];
    var fecha_inicio = String(moment(this.dSalida, "YYYY/MM/DD").format("YYYY-MM-DD"));
    var fecha_final = String(moment(this.dIngreso, "YYYY/MM/DD").format("YYYY-MM-DD"));
    data_usuarios.forEach(valor => {
      let informacion = {
        nombre: '',
        codigo: '',
      }
      let busqueda = {
        codigo: '',
        fecha_inicio: fecha_inicio,
        fecha_final: fecha_final
      }
      this.BuscarPlanificacionDias(valor, informacion, busqueda, data_usuarios);
    })
  }

  // METODO PARA BSUCAR PLANIFICACION
  BuscarPlanificacionDias(valores: any, arreglo: any, busqueda: any, data_general: any) {
    arreglo.nombre = valores.nombre;
    arreglo.codigo = valores.codigo;
    busqueda.codigo = valores.codigo
    this.restH.BuscarHorarioDias(busqueda).subscribe(horas => {
      this.contar_horario = this.contar_horario + 1;
      arreglo.horas = horas[0];
      arreglo.observacion = 'OK';
      this.valido_horario = this.valido_horario.concat(arreglo);
      // UNA VEZ QUE LOS DATOS HAN SIDO LEIDOS PASA A VALIDACION DE PERMISOS SOLICITADOS
      console.log('dias ver contadores planificacion 1', this.contar_horario, ' datos totales ', data_general.length)
      if (this.contar_horario === data_general.length) {
        console.log('dias entra planificacion 1')
        this.ValidarPermisosSolicitados(this.valido_horario);
      }
      // SI NO EXISTE PLANIFICACION HORARIA
    }, error => {
      this.contar_horario = this.contar_horario + 1;
      arreglo.observacion = 'Verificar planificación.';
      this.invalido = this.invalido.concat(arreglo);
      // UNA VEZ QUE LOS DATOS HAN SIDO LEIDOS PASA A VALIDACION DE PERMISOS SOLICITADOS
      console.log('dias ver contadores planificacion 2', this.contar_horario, ' datos totales ', data_general.length)
      if (this.contar_horario === data_general.length) {
        if (this.valido_horario.length != 0) {
          console.log('dias entra planificacion 2')
          this.ValidarPermisosSolicitados(this.valido_horario);
        }
        else {
          this.usuarios = this.usuarios.concat(this.invalido);
          this.verificar = true;
        }
      }
    });
  }

  // METODO PARA VALIDAR REGISTROS DE PERMISOS SOLICITADOS
  valido_solicitados: any = [];
  contar_solicitados: number = 0;
  ValidarPermisosSolicitados(data_usuarios: any) {
    this.contar_solicitados = 0;
    this.valido_solicitados = [];
    var fecha_inicio = String(moment(this.dSalida, "YYYY/MM/DD").format("YYYY-MM-DD"));
    var fecha_final = String(moment(this.dIngreso, "YYYY/MM/DD").format("YYYY-MM-DD"));
    data_usuarios.forEach(valor => {
      let informacion = {
        nombre: '',
        codigo: '',
      }
      let busqueda = {
        codigo: '',
        fec_inicio: fecha_inicio,
        fec_final: fecha_final
      }
      this.BuscarPermisosSolicitados(valor, informacion, busqueda, data_usuarios);
    })
  }

  // METODO PARA BUSCAR TODOS LOS PERMISOS SOLICITADOS
  BuscarPermisosSolicitados(valores: any, arreglo: any, busqueda: any, data_general: any) {
    arreglo.nombre = valores.nombre;
    arreglo.codigo = valores.codigo;
    arreglo.horas = valores.horas;
    busqueda.codigo = valores.codigo
    this.restP.BuscarPermisosSolicitadosTotales(busqueda).subscribe(solicitados => {
      this.contar_solicitados = this.contar_solicitados + 1;
      // EXISTEN REGISTROS DE PERMISOS POR DIAS
      if (solicitados.length != 0) {
        arreglo.observacion = 'Ya existe un registro de permiso.';
        this.invalido = this.invalido.concat(arreglo);
        // UNA VEZ QUE SE HAN LEIDOS LOS DATOS MUESTRA LA DATA Y PERMITE REGISTRAR PERMISO
        console.log('dias ver contadores permisos solicitados 1', this.contar_solicitados, ' datos totales ', data_general.length)
        if (this.contar_solicitados === data_general.length) {
          console.log('dias permisos solicitados 1')
          this.usuarios = this.invalido.concat(this.valido_solicitados);
          this.verificar = true;
        }
        // NO EXISTEN PERMISOS SOLICITADOS POR DIAS
      } else {
        arreglo.observacion = 'OK';
        this.valido_solicitados = this.valido_solicitados.concat(arreglo);
        // UNA VEZ QUE SE HAN LEIDOS LOS DATOS MUESTRA LA DATA Y PERMITE REGISTRAR PERMISO
        console.log('dias ver contadores permisos solicitados 2', this.contar_solicitados, ' datos totales ', data_general.length)
        if (this.contar_solicitados === data_general.length) {
          console.log('dias permisos solicitados 2')
          this.usuarios = this.valido_solicitados.concat(this.invalido);
          this.verificar = true;
        }
      }
    })
  }


  /** *********************************************************************************************************** **
   ** **                  METODOS DE VALIDACIONES PARA SOLICITUDES DE PERMISOS POR HORAS                       ** **
   ** *********************************************************************************************************** **/

  // METODO PARA VALIDAR EXISTENCIA DE SOLICITUDES DE PERMISOS POR DIAS
  contar_permisos_dias: number = 0;
  permisos_dias: any = [];
  ValidarSolictudesPermisosDias(data_usuarios: any, form: any) {
    this.contar_permisos_dias = 0;
    this.permisos_dias = [];
    var fecha_inicio = String(moment(this.dSalida, "YYYY/MM/DD").format("YYYY-MM-DD"));
    var fecha_final = String(moment(form.fechaFinalForm, "YYYY/MM/DD").format("YYYY-MM-DD"));
    data_usuarios.forEach(valor => {
      let informacion = {
        nombre: '',
        codigo: '',
      }
      let busqueda = {
        codigo: '',
        fec_inicio: fecha_inicio,
        fec_final: fecha_final,
      }
      this.BuscarPermisosDias(valor, informacion, busqueda, form, data_usuarios);
    })
  }

  // METODO PARA BUSCAR SOLICITUDES DE PERMISOS POR DIAS
  BuscarPermisosDias(valores: any, arreglo: any, busqueda: any, form: any, data_general: any) {
    arreglo.nombre = valores.nombre;
    arreglo.codigo = valores.codigo;
    busqueda.codigo = valores.codigo;
    console.log('ver data busqueda ', busqueda)
    this.restP.BuscarPermisosSolicitadosDias(busqueda).subscribe(solicitados => {
      console.log('ver data ', solicitados)
      this.contar_permisos_dias = this.contar_permisos_dias + 1;
      // EXISTEN REGISTROS DE PERMISOS POR DIAS
      if (solicitados.length != 0) {
        arreglo.observacion = 'Ya existe un registro de permiso HORAS.';
        this.invalido = this.invalido.concat(arreglo);
        // UNA VEZ QUE SE HAN LEIDOS LOS DATOS MUESTRA LA DATA Y PERMITE REGISTRAR PERMISO
        console.log('horas ver contadores permisos dias 1', this.contar_permisos_dias, ' datos totales ', data_general.length)
        if (this.contar_permisos_dias === data_general.length) {
          console.log('horas entra permisos dias 1')
          if (this.permisos_dias.length != 0) {
            this.ValidarSolictudesPermisosHoras(this.permisos_dias, form);
          }
          else {
            this.usuarios = this.usuarios.concat(this.invalido);
            this.verificar = true;
          }
        }
        // NO EXISTEN PERMISOS SOLICITADOS POR DIAS
      } else {
        arreglo.observacion = 'OK';
        this.permisos_dias = this.permisos_dias.concat(arreglo);
        // UNA VEZ QUE SE HAN LEIDOS LOS DATOS MUESTRA LA DATA Y PERMITE REGISTRAR PERMISO
        console.log('horas ver contadores permisos dias 2', this.contar_permisos_dias, ' datos totales ', data_general.length)
        if (this.contar_permisos_dias === data_general.length) {
          console.log('horas entra permisos dias 2')
          this.ValidarSolictudesPermisosHoras(this.permisos_dias, form);
        }
      }
    })
  }

  // METODO PARA VALIDAR EXISTENCIA DE SOLICITUDES DE PERMISOS POR HORAS
  contar_permisos_horas: number = 0;
  permisos_horas: any = [];
  ValidarSolictudesPermisosHoras(data_usuarios: any, form: any) {
    console.log('ingresa permisos horas ', data_usuarios)
    this.contar_permisos_horas = 0;
    this.permisos_horas = [];
    var fecha_inicio = String(moment(this.dSalida, "YYYY/MM/DD").format("YYYY-MM-DD"));
    var fecha_final = String(moment(form.fechaFinalForm, "YYYY/MM/DD").format("YYYY-MM-DD"));
    var hora_inicio = moment(form.horaSalidaForm, "HH:mm:ss").format('HH:mm:ss');
    var hora_final = moment(form.horasIngresoForm, "HH:mm:ss").format('HH:mm:ss');
    data_usuarios.forEach(valor => {
      let informacion = {
        nombre: '',
        codigo: '',
      }
      let busqueda = {
        codigo: '',
        fec_inicio: fecha_inicio,
        fec_final: fecha_final,
        hora_inicio: hora_inicio,
        hora_final: hora_final,
      }
      this.BuscarPermisosHoras(valor, informacion, busqueda, data_usuarios, fecha_inicio, fecha_final, hora_inicio, hora_final, form);
    })
  }

  // METODO PARA BUSCAR SOLICITUDES DE PERMISOS POR HORAS
  BuscarPermisosHoras(valores: any, arreglo: any, busqueda: any, data_general: any, fecha_inicio: any, fecha_final: any, hora_inicio: any, hora_final: any, form: any) {
    arreglo.nombre = valores.nombre;
    arreglo.codigo = valores.codigo;
    busqueda.codigo = valores.codigo
    this.restP.BuscarPermisosSolicitadosHoras(busqueda).subscribe(solicitados => {
      console.log('solicitados ', solicitados)
      this.contar_permisos_horas = this.contar_permisos_horas + 1;
      // EXISTEN REGISTROS DE PERMISOS POR HORAS
      if (solicitados.length != 0) {
        arreglo.observacion = 'Ya existe un registro de permiso.';
        this.invalido = this.invalido.concat(arreglo);
        // UNA VEZ QUE SE HAN LEIDOS LOS DATOS MUESTRA LA DATA Y PERMITE REGISTRAR PERMISO
        console.log('horas ver contadores permisos horas 1', this.contar_permisos_horas, ' datos totales ', data_general.length)
        if (this.contar_permisos_horas === data_general.length) {
          console.log('horas entra permisos horas 1')
          this.usuarios = this.invalido.concat(this.permisos_horas);
          this.verificar = true;
        }
        // NO EXISTEN PERMISOS SOLICITADOS POR HORAS
      } else {
        arreglo.observacion = 'OK';
        this.permisos_horas = this.permisos_horas.concat(arreglo);
        // UNA VEZ QUE SEAN LEIDOS LOS DATOS MUESTRA LA DATA Y PERMITE REGISTRAR PERMISO
        console.log('horas ver contadores permisos horas 2', this.contar_permisos_horas, ' datos totales ', data_general.length)
        if (this.contar_permisos_horas === data_general.length) {
          console.log('horas entra permisos horas 2')
          this.usuarios = this.permisos_horas.concat(this.invalido);
          this.verificar = true;
          if (form.especialForm === false) {
            this.VerificarFechasIguales(form, this.permisos_horas, fecha_inicio, fecha_final, hora_inicio, hora_final);
          } else {
            //this.VerificarFechasDiferentes(form, datos, verificador, fecha_inicio, fecha_final, hora_inicio_, hora_final_);
          }
        }
      }
    })
  }

  // METODO PARA LEER DATOS DE HORAS EN EL MISMO DIA
  VerificarFechasIguales(form: any, arreglo: any, fecha_inicio: any, fecha_final: any, hora_inicio_: any, hora_final_: any) {
    let datos: any = [];
    let verificador = 0;
    // METODO PARA BUSCAR PERMISOS SOLICITADOS POR DIAS
    let horario = {
      fecha_inicio: fecha_inicio,
      hora_inicio: hora_inicio_,
      hora_final: hora_final_,
      codigo: arreglo.codigo
    }
    // BUSQUEDA DE HORARIOS EN UN MISMO DIA Y HORAS
    this.restH.BuscarHorarioHorasMD(horario).subscribe(informacion => {
      console.log('informacion', informacion)
      datos = informacion.respuesta;
      // HORARIOS CON FINALIZACION DE JORNADA EN UN MISMO DIA
      if (informacion.message === 'CASO_1') {
        for (let i = 0; i < datos.length; i++) {
          if (hora_inicio_ >= datos[i].hora_inicio && hora_final_ <= datos[i].hora_final) {
            verificador = 1;
            if (this.datosPermiso.almu_incluir === true) {
              console.log('entra almuerzo ')
              //this.VerificarFechasIgualesComida(form, fecha_inicio, fecha_final, hora_inicio_, hora_final_, datos[i]);
            }
            else {
              console.log('entra sin almuerzo ')
              // this.CalcularHoras(form, fecha_inicio, fecha_final, hora_inicio_, hora_final_, 0);
            }
            break;
          }
          else {
            verificador = 2;
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
                  verificador = 1;
                  if (this.datosPermiso.almu_incluir === true) {
                    //this.VerificarFechasIgualesComida(form, fecha_inicio, fecha_final, hora_inicio_, hora_final_, datos[i]);
                  }
                  else {
                    //this.CalcularHoras(form, fecha_inicio, fecha_final, hora_inicio_, hora_final_, 0);
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
                    //this.VerificarFechasIgualesComida(form, fecha_inicio, fecha_final, hora_inicio_, hora_final_, datos[i]);
                  }
                  else {
                    //this.CalcularHoras(form, fecha_inicio, fecha_final, hora_inicio_, hora_final_, 0);
                  }
                  break;
                }
                else {
                  // LA HORA DE INICIO DEBE SER >= 00:01:00 Y LA HORA DE INICIO DEBE SER < QUE LA HORA DE SALIDA DEL USUARIO
                  if (hora_inicio_ >= '00:01:00' && hora_inicio_ < datos[i].hora_final) {
                    verificador = 1;
                    if (this.datosPermiso.almu_incluir === true) {
                      //this.VerificarFechasIgualesComida(form, fecha_inicio, fecha_final, hora_inicio_, hora_final_, datos[i]);
                    }
                    else {
                      //this.CalcularHoras(form, fecha_inicio, fecha_final, hora_inicio_, hora_final_, 0);
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
                verificador = 1;
                //this.CalcularHoras(form, fecha_inicio, fecha_final, hora_inicio_, hora_final_, 0);
                break;
              }
              else {
                // LA HORA FINAL ES <= '23:59:00' Y LA HORA FINAL ES > QUE LA HORA DE INICIO
                if (hora_final_ <= '23:59:00' && hora_final_ > datos[i].hora_inicio) {
                  verificador = 1;
                  //this.CalcularHoras(form, fecha_inicio, fecha_final, hora_inicio_, hora_final_, 0);
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
                //this.CalcularHoras(form, fecha_inicio, fecha_final, hora_inicio_, hora_final_, 0);
                break;
              }
              else {
                // LA HORA DE INICIO DEBE SER >= 00:01:00 Y LA HORA DE INICIO DEBE SER < QUE LA HORA DE SALIDA DEL USUARIO
                if (hora_inicio_ >= '00:01:00' && hora_inicio_ < datos[i].hora_final) {
                  verificador = 1;
                  //this.CalcularHoras(form, fecha_inicio, fecha_final, hora_inicio_, hora_final_, 0);
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
            //this.CalcularHoras(form, fecha_inicio, fecha_final, hora_inicio_, hora_final_, 0);
            break;
          }
        }
      }

      // SI NO CUMPLE CON LAS CONDICIONES
      if (verificador === 2) {
        //this.EmitirMensajeError();
        console.log('no cumple validaciones')
      }
      else {
        console.log('si cumple validaciones')
      }
    }, vacio => {
      //this.EmitirMensajeError();
      console.log('todo vacio')
    })
  }












































  CambiarValoresDiasHoras(form, datos) {
    if (form.solicitarForm === 'Días') {
      datos.hora_numero = '00:00';
    }
    else if (form.solicitarForm === 'Horas') {
      datos.dia = 0;
    }
  }

  // METODO PARA VALIDAR DATOS DE SOLICITUD DE PERMISO
  ValidarPermiso(form) {

    this.InsertarPermiso(form);


  }

  // METODO INGRESO DE DATOS DE PERMISO
  contador: number = 0;
  InsertarPermiso(form) {
    this.contador = 0;
    // LECTURA DE DATOS DE USUARIOS SELECCIONADOS
    this.data.datos.map(obj => {

      // METODO BUSQUEDA DE PERIODO DE VACACIONES
      this.restPerV.BuscarIDPerVacaciones(parseInt(obj.id)).subscribe(res => {

        // METODO BUSQUEDA NÚMERO DE PERMISO
        this.restP.BuscarNumPermiso(obj.id).subscribe(datosn => {

          // CONTABILIZAR NÚMERO DE PERMISO
          this.datoNumPermiso = datosn;
          if (this.datoNumPermiso[0].max === null) {
            this.num = 1;
          }
          else {
            this.num = this.datoNumPermiso[0].max + 1;
          }

          // DATOS DE PERMISO
          let datosPermiso = {
            id_empl: obj.id,
            dia: parseInt(form.diasForm),
            codigo: obj.codigo,
            estado: 1,
            dia_libre: 0,
            fec_final: form.fechaFinalForm,
            fec_inicio: form.fechaInicioForm,
            legalizado: this.datosPermiso.legalizar,
            hora_salida: form.horaSalidaForm,
            descripcion: form.descripcionForm,
            docu_nombre: form.nombreCertificadoForm,
            hora_numero: form.horasForm,
            num_permiso: this.num,
            hora_ingreso: form.horasIngresoForm,
            fec_creacion: this.FechaActual,
            id_empl_cargo: obj.id_cargo,
            id_tipo_permiso: form.idPermisoForm,
            id_peri_vacacion: res[0].id,
            id_empl_contrato: obj.id_contrato,
            depa_user_loggin: parseInt(localStorage.getItem('departamento') as string),
          }

          // METODO PARA CAMBIAR VALOR DE DÍAS - HORAS
          this.CambiarValoresDiasHoras(form, datosPermiso);

          // METODO PARA CAMBIAR DÍA LIBRE
          this.CambiarValorDiaLibre(datosPermiso);

          // METODO PARA LEER DATOS DE LA SOLICITUD
          this.GuardarDatos(datosPermiso, form);
        })
      })
    });
  }

  // METODO PARA CAMBIAR FORMATO DE DÍAS LIBRES
  CambiarValorDiaLibre(datos) {
    if (datos.dia_libre === '') {
      datos.dia_libre = 0;
    }
  }















  // METODO PARA GUARDAR DATOS DE SOLICITUD DE PERMISO
  idPermisoRes: any;
  NotifiRes: any;
  arrayNivelesDepa: any = [];
  GuardarDatos(datos: any, form: any) {


    // VALIDAR QUE SE HA SUBIDO UN DOCUMENTO AL SISTEMA
    if (form.nombreCertificadoForm != '' && form.nombreCertificadoForm != null) {
      this.RegistrarPermiso_Documento(datos, form);

    } else {
      this.RegistrarPermiso(datos);
    }


    this.LimpiarCampos();
  }


  RegistrarPermiso(datos) {
    // METODO PARA INGRESAR SOLICITUD DE PERMISO
    this.restP.IngresarEmpleadoPermisos(datos).subscribe(response => {

      this.arrayNivelesDepa = response;
      console.log('response 1.. ', response)

      this.arrayNivelesDepa.forEach(obj => {

        // LECTURA DE DATOS DE NOTIFICACIÓN CORREO
        let datosPermisoCreado = this.LeerDatosMail(obj, datos);

        // METODO PARA ENVÍO DE CORREOS
        this.restP.EnviarCorreoWeb(datosPermisoCreado).subscribe(res => {
          this.idPermisoRes = res;

          // METODO PARA REGISTRO DE AUTORIZACIÓN
          this.IngresarAutorizacion(this.idPermisoRes.id);

          // LECTURA DE DATOS Y ENVIO DE NOTIFICACIÓN SISTEMA
          this.LeerDatosNotificacion(datos.id_empl);

        });
      }, err => {
        // this.ValidarAcceso(err);
      });

      this.contador = this.contador + 1;
      this.MostrarMensaje();

    }, err => {
      this.contador = this.contador + 1;
      this.MostrarMensaje();
      //this.ValidarAcceso(err);
    });
  }

  RegistrarPermiso_Documento(datos: any, form: any) {
    // METODO PARA INGRESAR SOLICITUD DE PERMISO
    this.restP.IngresarEmpleadoPermisos(datos).subscribe(response => {

      this.arrayNivelesDepa = response;

      console.log('response 2.. ', response)

      this.arrayNivelesDepa.forEach(obj => {

        // LECTURA DE DATOS DE NOTIFICACIÓN CORREO
        let datosPermisoCreado = this.LeerDatosMail(obj, datos);

        // METODO PARA ENVÍO DE CORREOS
        this.restP.EnviarCorreoWeb(datosPermisoCreado).subscribe(res => {
          this.idPermisoRes = res;

          this.SubirRespaldo(this.idPermisoRes.id, form);

          // METODO PARA REGISTRO DE AUTORIZACIÓN
          this.IngresarAutorizacion(this.idPermisoRes.id);

          // LECTURA DE DATOS Y ENVIO DE NOTIFICACIÓN SISTEMA
          this.LeerDatosNotificacion(datos.id_empl);
        });
      });
      this.contador = this.contador + 1;
      this.MostrarMensaje();
    }, error => {
      this.contador = this.contador + 1;
      this.MostrarMensaje();
    });
  }

  //MENSAJE DE REGISTRO DE SOLICITUD DE PERMISO
  MostrarMensaje() {
    if (this.contador === this.data.datos.length) {
      this.toastr.success('Operación exitosa.', this.contador + ' Permisos registrados', {
        timeOut: 6000,
      });
    }

  }

  // METODO PARA LEER DATOS DE ENVÍO DE EMAIL
  LeerDatosMail(obj: any, datos: any) {
    let datosPermisoCreado = {
      id: obj.id,
      nivel: obj.nivel,
      cargo: obj.cargo,
      id_dep: obj.id_dep,
      id_suc: obj.id_suc,
      estado: obj.estado,
      nombre: obj.nombre,
      cedula: obj.cedula,
      correo: obj.correo,
      contrato: obj.contrato,
      apellido: obj.apellido,
      sucursal: obj.sucursal,
      empleado: obj.empleado,
      depa_padre: obj.depa_padre,
      fec_creacion: datos.fec_creacion,
      departamento: obj.departamento,
      permiso_mail: obj.permiso_mail,
      permiso_noti: obj.permiso_noti,
      id_tipo_permiso: datos.id_tipo_permiso,
      id_empl_contrato: datos.id_empl_contrato,
    }
    return datosPermisoCreado;
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
    }
    this.restAutoriza.postAutorizacionesRest(newAutorizaciones).subscribe(res => {
    })
  }















































  // METODO PARA LEER DATOS DE NOTIIFCACIÓN SISTEMA 
  LeerDatosNotificacion(id_empl: any) {
    var f = new Date();
    let notificacion = {
      id: null,
      id_send_empl: id_empl,
      id_receives_empl: this.idPermisoRes.id_empleado_autoriza,
      id_receives_depa: this.idPermisoRes.id_departamento_autoriza,
      estado: this.idPermisoRes.estado,
      create_at: `${this.FechaActual}T${f.toLocaleTimeString()}.000Z`,
      id_permiso: this.idPermisoRes.id,
      id_vacaciones: null,
      id_hora_extra: null
    }

    // METODO PARA ENVÍO DE NOTIFICACIONES EN EL SISTEMA
    this.realTime.IngresarNotificacionEmpleado(notificacion).subscribe(resN => {
      this.NotifiRes = resN;
      notificacion.id = this.NotifiRes._id;
      if (this.NotifiRes._id > 0 && this.idPermisoRes.notificacion === true) {
        this.restP.EnviarNotificacionRealTime(notificacion);
      }
    });
  }





}
