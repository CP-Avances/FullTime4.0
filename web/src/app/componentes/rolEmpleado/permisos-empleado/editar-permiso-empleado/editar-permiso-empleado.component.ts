// IMPORTACION LIBRERIAS 
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit, Input, Inject } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

// IMPORTACION DE SERVICIOS 
import { LoginService } from 'src/app/servicios/login/login.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';
import { PermisosService } from 'src/app/servicios/permisos/permisos.service';
import { FeriadosService } from 'src/app/servicios/catalogos/catFeriados/feriados.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { PlanGeneralService } from 'src/app/servicios/planGeneral/plan-general.service';
import { TipoPermisosService } from 'src/app/servicios/catalogos/catTipoPermisos/tipo-permisos.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { VerEmpleadoComponent } from 'src/app/componentes/empleado/ver-empleado/ver-empleado.component';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { EmpleadoHorariosService } from 'src/app/servicios/horarios/empleadoHorarios/empleado-horarios.service';
import { PeriodoVacacionesService } from 'src/app/servicios/periodoVacaciones/periodo-vacaciones.service';

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
  @Input() id_empleado: any;

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
  informacion2: string = '';
  informacion3: string = '';

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
    public ventana: MatDialogRef<EditarPermisoEmpleadoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // LEER ID DE USUARIO QUE INICIA SESION
    var item = localStorage.getItem('empleado');
    if (item) {
      this.idEmpleadoIngresa = parseInt(item);
    }
  }

  info: any = [];
  ngOnInit(): void {
    if(this.solicita_permiso == undefined){
      this.info = this.data.dataPermiso;
    }else{
      this.info = this.solicita_permiso;
    }

    if(this.id_empleado == undefined){
      this.id_empleado = this.data.id_empleado;
    }

    var f = moment();
    this.FechaActual = f.format('YYYY-MM-DD');
    this.num = this.info.num_permiso
    this.ObtenerInformacionEmpleado();
    this.ObtenerTiposPermiso();
    this.ObtenerEmpleado();
    this.BuscarParametro();
    this.ObtenerDatos();
    this.MostrarDatos();
    this.BuscarHora();
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

  // METODO PARA IMPRIMIR EN EL FORMULARIO LA INFORMACION DEL PERMISO SOLICITADO 
  documento: boolean = false;
  documento_editar: boolean = false;
  MostrarDatos() {
    this.dSalida = String(moment(this.info.fec_inicio).format('YYYY-MM-DD'));
    this.dIngreso = String(moment(this.info.fec_final).format('YYYY-MM-DD'));

    this.formulario.patchValue({
      horasIngresoForm: this.info.hora_ingreso,
      fechaInicioForm: String(moment(this.info.fec_inicio).format('YYYY-MM-DD')),
      descripcionForm: this.info.descripcion,
      horaSalidaForm: this.info.hora_salida,
      fechaFinalForm: String(moment(this.info.fec_final).format('YYYY-MM-DD')),
      idPermisoForm: this.info.id_tipo_permiso,
      diaLibreForm: this.info.dia_libre,
      horasForm: this.info.hora_numero,
      diasForm: this.info.dia,
    });
    if (this.info.dia === 0) {
      this.habilitarDias = false;
      this.activar_hora = true;
      this.configuracion_permiso = 'Horas';
      this.solicitarF.setValue('Horas');
      if (this.dSalida != this.dIngreso) {
        this.especialF.setValue(true);
      }
    }
    else if (this.info.hora_numero === '00:00:00') {
      this.habilitarDias = true;
      this.activar_hora = false;
      this.configuracion_permiso = 'Dias';
      this.solicitarF.setValue('Dias');
      this.LeerFeriadosPermiso();
    }

    // MOSTRAR INFORMACION DEL PERMISO
    this.BuscarTipoPermiso();
  }


  // BUSCAR FERIADOS FECHAS DEL PERMISO
  LeerFeriadosPermiso() {
    this.feriados = [];
    let datos = {
      fecha_inicio: moment(this.info.fec_inicio).format('YYYY-MM-DD'),
      fecha_final: moment(this.info.fec_final).format('YYYY-MM-DD'),
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
      fecha_inicio: moment(this.info.fec_inicio).format('YYYY-MM-DD'),
      fecha_final: moment(this.info.fec_final).format('YYYY-MM-DD'),
      codigo: this.empleado.codigo
    }

    this.planificar.BuscarHorarioFechas(datos).subscribe(data => {
      this.horario = data;
      this.ContarDiasSolicitados();
    }, vacio => {
      this.ContarDiasSolicitados();
    })
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
      if (this.datosPermiso.num_dia_maximo === 0) {
        this.informacion2 = '';
        this.informacion1 = `Horas máximas de permiso: ${this.datosPermiso.num_hora_maximo}`;
        this.Thoras = this.datosPermiso.num_hora_maximo;
        this.configuracion_permiso = 'Horas';
      }
      // SOLICITUD POR DIAS
      else if (this.datosPermiso.num_hora_maximo === '00:00:00') {
        this.informacion2 = '';
        this.informacion1 = `Días máximos de permiso: ${this.datosPermiso.num_dia_maximo}`;
        this.Tdias = this.datosPermiso.num_dia_maximo;
        this.configuracion_permiso = 'Dias';
      }

      // MENSAJE DESCUENTO ALIMENTACION
      if (this.datosPermiso.almu_incluir === true) {
        this.informacion3 = `Aplica descuento de minutos de alimentación si el permisos solicitado se encuentra dentro del horario de alimentación.`;
      }
      else {
        this.informacion3 = '';
      }

      // DOCUMENTO CARGADO EN EL SISTEMA
      if (this.info.docu_nombre != null && this.info.docu_nombre != '') {
        this.documento_editar = true;
        this.documento = false;
      }
      else {
        this.documento = true;
        this.documento_editar = false;
        // DOCUMENTO REQUERIDO
        this.certificado = this.datosPermiso.documento;
      }
    })
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
      if (this.datosPermiso.num_dia_maximo === 0) {
        this.LimpiarFormulario('');
        this.informacion2 = '';
        this.informacion1 = `Horas máximas de permiso: ${this.datosPermiso.num_hora_maximo}`;
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
        this.informacion2 = '';
        this.informacion1 = `Días máximos de permiso: ${this.datosPermiso.num_dia_maximo}`;
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
        this.informacion3 = `Aplica descuento de minutos de alimentación si el permisos solicitado se encuentra dentro del horario de alimentación.`;
      }
      else {
        this.informacion3 = '';
      }
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

    // LIMPIAR CAMPOS DE FECHAS
    if (form.solicitarForm === 'Dias') {
      this.LimpiarInformacion('00:00');
      this.LimpiarComida(false);
    }
    else if (form.solicitarForm === 'Horas') {
      this.LimpiarInformacion('');
      this.LimpiarComida(false);
    }

    // VALIDACION DE SELECCION DE TIPO DE PERMISOS
    if (form.idPermisoForm != '') {

      // LECTURA DE FECHAS
      this.dSalida = event.value;
      var leer_fecha = event.value._i;
      var fecha = new Date(String(moment(leer_fecha)));
      var inicio = String(moment(fecha, "YYYY/MM/DD").format("YYYY-MM-DD"));

      // VERIFICACION DE RESTRICCION DE FECHAS
      if (this.datosPermiso.fecha != '' && this.datosPermiso.fecha != null) {
        var fecha_negada = this.datosPermiso.fecha.split('T')[0];

        // VERIFICACION DE FECHA NO VALIDA CON LA SALIDA DE PERMISO
        if (Date.parse(inicio) === Date.parse(fecha_negada)) {
          this.toastr.warning('En la fecha ingresada no es posible otorgar este tipo de permiso.', 'VERIFICAR', {
            timeOut: 4000,
          });
          this.fechaInicioF.setValue('');
        }
      }
    }
    else {
      this.toastr.warning('Ups!!! no ha seleccionado ningún tipo de permiso.', '', {
        timeOut: 4000,
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
        // BUSCAR FECHAS HORARIO
        this.BuscarFechasHorario(form);

        // BUSQUEDA DE FERIADOS 
        this.BuscarFeriados(form);
        this.BuscarFeriadosRecuperar(form);

        // PERMISO SOLICITADO POR DIAS
        if (form.solicitarForm === 'Dias') {
          this.horas = [];
          // BUSQUEDA DE PLANIFICACION DEL USUARIO
          let datosFechas = {
            codigo: this.empleado.codigo,
            fecha_inicio: form.fechaInicioForm,
            fecha_final: form.fechaFinalForm,
          }
          this.restH.BuscarHorarioDias(datosFechas).subscribe((horas: any) => {
            this.horas = horas[0];
            console.log('horas horario ', this.horas)
            // METODO PARA BUSCAR PERMISOS SOLICITADOS POR DIAS
            let solicitud = {
              fec_inicio: inicio,
              fec_final: final,
              codigo: this.empleado.codigo,
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
          }, error => {
            this.toastr.warning('No tiene asignada una planificación horaria en las fechas ingresadas.', 'Ups!!! algo salio mal.', {
              timeOut: 6000,
            });
            this.fechaInicioF.setValue('');
            this.LimpiarInformacion('00:00');
          });
        }
        else if (form.solicitarForm === 'Horas') {
          this.LimpiarComida(false);
          // METODO PARA BUSCAR PERMISOS SOLICITADOS POR DIAS
          let solicitud = {
            fec_inicio: inicio,
            fec_final: final,
            codigo: this.empleado.codigo,
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

  // METODO PARA BUSCAR FERIADOS
  feriados: any = [];
  BuscarFeriados(form: any) {
    this.feriados = [];
    let datos = {
      fecha_inicio: moment(form.fechaInicioForm).format('YYYY-MM-DD'),
      fecha_final: moment(form.fechaFinalForm).format('YYYY-MM-DD'),
      id_empleado: parseInt(this.empleado.id)
    }
    this.feriado.ListarFeriadosCiudad(datos).subscribe(data => {
      this.feriados = data;
    })
  }

  // METODO PARA BUSCAR FECHAS DE RECUPERACION DE FERIADOS
  recuperar: any = [];
  BuscarFeriadosRecuperar(form: any) {
    this.recuperar = [];
    let datos = {
      fecha_inicio: moment(form.fechaInicioForm).format('YYYY-MM-DD'),
      fecha_final: moment(form.fechaFinalForm).format('YYYY-MM-DD'),
      id_empleado: parseInt(this.empleado.id)
    }
    this.feriado.ListarFeriadosRecuperarCiudad(datos).subscribe(data => {
      this.recuperar = data;
    })
  }

  // METODO PARA BUSCAR FECHAS DE UNA PLANIFICACION HORARIA
  horario: any = [];
  BuscarFechasHorario(form: any) {
    this.horario = [];
    let datos = {
      fecha_inicio: moment(form.fechaInicioForm).format('YYYY-MM-DD'),
      fecha_final: moment(form.fechaFinalForm).format('YYYY-MM-DD'),
      codigo: this.empleado.codigo
    }
    this.planificar.BuscarHorarioFechas(datos).subscribe(data => {
      this.horario = data;
    })
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
          codigo: this.empleado.codigo,
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

    this.horasF.setValue('');

    // METODO PARA BUSCAR PERMISOS SOLICITADOS POR HORAS
    let solicitud = {
      fec_inicio: fecha_inicio,
      fec_final: fecha_final,
      hora_inicio: form.horaSalidaForm,
      hora_final: form.horasIngresoForm,
      codigo: this.empleado.codigo,
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
    this.toastr.warning('No tiene asignada una planificación horaria en las fechas y horas ingresadas.', 'Ups!!! algo salio mal.', {
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
    var inicio = String(moment(this.dSalida, "YYYY/MM/DD").format("YYYY-MM-DD"));
    var fin = String(moment(this.dIngreso, "YYYY/MM/DD").format("YYYY-MM-DD"));
    // INICIALIZAR DATOS DE FECHA
    var start = new Date(inicio);
    var end = new Date(fin);
    // LOGICA PARA OBTENER EL NOMBRE DE CADA UNO DE LOS DIA DEL PERIODO INDICADO
    while (start <= end) {
      this.fechas_solicitud.push(moment(start).format('YYYY-MM-DD'));
      var newDate = start.setDate(start.getDate() + 1);
      start = new Date(newDate);
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

    // BUSCAR FECHAS DE RECUPERACION DE FERIADOS
    if (this.recuperar.length != 0) {
      this.fechas_solicitud.map((obj: any) => {
        for (let j = 0; j < this.recuperar.length; j++) {
          if (moment(this.recuperar[j].fec_recuperacion, 'YYYY-MM-DD').format('YYYY-MM-DD') === obj) {
            this.contar_recuperables = this.contar_recuperables + 1;
            break;
          }
        }
      })
    }


    if (this.horario.length != 0) {
      for (let k = 0; k < this.horario.length; k++) {
        if (this.horario[k].tipo === 'L') {
          this.contar_libres = this.contar_libres + 1;
        }
        if (this.horario[k].tipo === 'N') {
          this.contar_laborables = this.contar_laborables + 1;
        }
      }
    }

    // COLOCAR EN EL FORMULARIO CALCULO DE DIAS
    var total_libres = 0;
    var total_laborables = 0;

    console.log('this.contar_laborables: ',this.contar_laborables);
    console.log('this.contar_recuperables: ',this.contar_recuperables);

    if (this.datosPermiso.contar_feriados === true) {
      total_laborables = this.contar_laborables + this.contar_feriados;
      total_libres = this.contar_libres;
    }
    else {
      total_libres = this.contar_libres + this.contar_feriados;
      total_laborables = this.contar_laborables + this.contar_recuperables;
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

  // METODO PARA CAPTURAR DATOS DE PERMISO
  InsertarPermiso(form: any) {
    let datosPermiso = {
      depa_user_loggin: parseInt(this.actuales.id_departamento),
      id_tipo_permiso: form.idPermisoForm,
      hora_ingreso: form.horasIngresoForm,
      descripcion: form.descripcionForm,
      hora_numero: form.horasForm,
      num_permiso: this.num,
      hora_salida: form.horaSalidaForm,
      fec_inicio: String(moment(form.fechaInicioForm).format('YYYY-MM-DD')),
      fec_final: String(moment(form.fechaFinalForm).format('YYYY-MM-DD')),
      dia_libre: form.diaLibreForm,
      dia: parseInt(form.diasForm),
    }
    this.CambiarValoresDiasHoras(form, datosPermiso);
    if (this.documento_editar === true && this.eliminar === false && this.editar === false) {
      this.ActualizarRegistro(datosPermiso);
      this.CerrarVentana();
    }
    else if (this.editar === true) {
      if (this.archivoSubido != undefined) {
        this.ActualizarRegistro(datosPermiso);
        this.SubirRespaldo(this.info.id, form);
        this.CerrarVentana();
      } else {
        this.toastr.warning('Debe cargar un documento.', '', {
          timeOut: 6000,
        });
      }
    }
    else if (this.eliminar === true) {
      this.ActualizarRegistro(datosPermiso);
      this.EliminarDocumentoBDD();
      this.CerrarVentana();
    }
    else if (this.documento === true) {
      if (this.certificado === true) {
        if (this.archivoSubido != undefined) {
          this.ActualizarRegistro(datosPermiso);
          this.SubirRespaldo(this.info.id, form);
          this.CerrarVentana();
        } else {
          this.toastr.warning('Debe cargar un documento.', '', {
            timeOut: 6000,
          });
        }
      }
      else {
        this.ActualizarRegistro(datosPermiso);
        if (this.archivoSubido != undefined) {
          this.SubirRespaldo(this.info.id, form);
        }
        this.CerrarVentana();
      }
    }
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
      datos.dia_libre = 0;
    }
  }

  // METODO PARA ACTUALIZAR REGISTRO
  ActualizarRegistro(datos: any) {
    this.restP.EditarPermiso(this.info.id, datos).subscribe(permiso => {
      this.toastr.success('Operación exitosa.', 'Registro actualizado.', {
        timeOut: 6000,
      });
      if (this.datosPermiso.correo_editar === true) {
        permiso.EmpleadosSendNotiEmail.push(this.solInfo);
        this.EnviarCorreo(permiso);
        this.EnviarNotificacion(permiso);
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
  SubirRespaldo(id: number, form: any) {
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads[]", this.archivoSubido[i], this.archivoSubido[i].name);
    }
    this.restP.SubirArchivoRespaldo(formData, id, form.nombreCertificadoForm, this.info.documento).subscribe(res => {
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
      id: this.info.id
    }
    this.restP.EliminarDocumentoPermiso(datos).subscribe(res => {
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
          permiso_noti: res.permiso_noti,
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

    console.log('entra correo')
    var cont = 0;
    var correo_usuarios = '';

    // METODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE PERMISO
    let solicitud = this.validar.FormatearFecha(permiso.fec_creacion, this.formato_fecha, this.validar.dia_completo);
    let desde = this.validar.FormatearFecha(permiso.fec_inicio, this.formato_fecha, this.validar.dia_completo);
    let hasta = this.validar.FormatearFecha(permiso.fec_final, this.formato_fecha, this.validar.dia_completo);

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

    // LEYENDO DATOS DE TIPO DE PERMISO
    var tipo_permiso = '';
    this.tipoPermisos.filter((o: any) => {
      if (o.id === permiso.id_tipo_permiso) {
        tipo_permiso = o.descripcion
      }
      return tipo_permiso;
    })

    // VERIFICACIÓN QUE TODOS LOS DATOS HAYAN SIDO LEIDOS PARA ENVIAR CORREO
    permiso.EmpleadosSendNotiEmail.forEach((e: any) => {

      console.log('for each', e)

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

      console.log('contadores', permiso.EmpleadosSendNotiEmail.length + ' cont ' + cont)

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
        }
        if (correo_usuarios != '') {
          console.log('data entra enviar correo')

          this.restP.EnviarCorreoWeb(datosPermisoCreado).subscribe(
            resp => {
              console.log('data entra enviar correo', resp)
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
    }

    // LISTADO PARA ELIMINAR EL USUARIO DUPLICADO
    var allNotificaciones: any = [];
    // CICLO POR CADA ELEMENTO DEL CATALOGO
    permiso.EmpleadosSendNotiEmail.forEach(function (elemento: any, indice: any, array: any) {
      // Discriminación de elementos iguales
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
    this.LimpiarCampos();
    this.componente.formulario_editar_permiso = false;
    this.componente.solicitudes_permiso = true;
    this.componente.ObtenerPermisos(this.componente.formato_fecha, this.componente.formato_hora);
    this.ventana.close(true);
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
