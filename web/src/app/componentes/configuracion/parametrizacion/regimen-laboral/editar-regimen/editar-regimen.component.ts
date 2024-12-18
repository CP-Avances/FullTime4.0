import { AfterViewInit, Component, OnInit, ChangeDetectorRef, AfterContentChecked, Input } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatRadioChange } from '@angular/material/radio';
import { startWith, map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';

import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { ProvinciaService } from 'src/app/servicios/configuracion/localizacion/catProvincias/provincia.service';
import { RegimenService } from 'src/app/servicios/configuracion/parametrizacion/catRegimen/regimen.service';
import { ListarRegimenComponent } from '../listar-regimen/listar-regimen.component';


@Component({
  selector: 'app-editar-regimen',
  templateUrl: './editar-regimen.component.html',
  styleUrls: ['./editar-regimen.component.css']
})

export class EditarRegimenComponent implements AfterViewInit, OnInit, AfterContentChecked {

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // CONTROL DE FORMULARIOS
  isLinear = true;
  primerFormulario: FormGroup;
  segundoFormulario: FormGroup;
  tercerFormulario: FormGroup;

  // BUSQUEDA DE PAISES AL INGRESAR INFORMACION
  filtro: Observable<any[]>;


  /** *************************************************************************************************** **
   ** **                               VALIDACIONES DE FORMULARIOS                                     ** **
   ** *************************************************************************************************** **/

  // PRIMER FORMULARIO
  diasF = new FormControl('');
  mesesF = new FormControl('');
  nombreF = new FormControl('');
  servicioF = new FormControl('');
  minimoMesF = new FormControl('');
  nombrePaisF = new FormControl('');
  minimoHorasF = new FormControl('');
  continuidadF = new FormControl(false);

  // SEGUNDO FORMULARIO
  diasAcumulacionF = new FormControl('');
  diasLaborablesF = new FormControl('');
  diasCalendarioF = new FormControl('');
  periodoTresF = new FormControl('');
  periodoUnoF = new FormControl('');
  periodoDosF = new FormControl('');
  diasLibresF = new FormControl('');
  periodosF = new FormControl(false);
  acumularF = new FormControl(false);

  // TERCER FORMULARIO
  vacaciones_cuatroF = new FormControl('');
  antiguedadActivaF = new FormControl(false);
  aniosAntiguedadF = new FormControl('');
  vacaciones_tresF = new FormControl('');
  diasAdicionalesF = new FormControl('');
  vacaciones_dosF = new FormControl('');
  vacaciones_unoF = new FormControl('');
  meses_calculoF = new FormControl('');
  desde_cuatroF = new FormControl('');
  hasta_cuatroF = new FormControl('');
  antiguedadF = new FormControl('');
  hasta_tresF = new FormControl('');
  desde_tresF = new FormControl('');
  desde_unoF = new FormControl('');
  desde_dosF = new FormControl('');
  hasta_unoF = new FormControl('');
  hasta_dosF = new FormControl('');
  calculoF = new FormControl(false);
  variableF: boolean = false;

  // CALCULOS DE VACACIONES
  diasMesCalendarioF = new FormControl('');
  diasMesLaborableF = new FormControl('');
  dias_CalendarioF = new FormControl('');
  dias_LaborableF = new FormControl('');

  @Input() idRegimen: number;
  @Input() pagina: string = '';

  constructor(
    private rest: RegimenService,
    private pais: ProvinciaService,
    private toastr: ToastrService,
    private formulario: FormBuilder,
    public cambio: ChangeDetectorRef,
    public validar: ValidacionesService,
    public componentel: ListarRegimenComponent,
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

    this.ObtenerPaises();
    this.ObtenerRegimen();
    this.ValidarFormulario();
    this.ObtenerRegimenEditar();
  }

  ngAfterViewInit() {
    this.cambio.detectChanges();
  }

  ngAfterContentChecked(): void {
    this.cambio.detectChanges();
  }

  // VALIDACIONES DE FORMULARIO
  ValidarFormulario() {

    this.primerFormulario = this.formulario.group({
      diasForm: this.diasF,
      mesesForm: this.mesesF,
      nombreForm: this.nombreF,
      servicioForm: this.servicioF,
      minimoMesForm: this.minimoMesF,
      nombrePaisForm: this.nombrePaisF,
      minimoHorasForm: this.minimoHorasF,
      continuidadForm: this.continuidadF,
    });

    this.segundoFormulario = this.formulario.group({
      diasAcumulacionForm: this.diasAcumulacionF,
      diasLaborablesForm: this.diasLaborablesF,
      diasCalendarioForm: this.diasCalendarioF,
      periodoTresForm: this.periodoTresF,
      periodoUnoForm: this.periodoUnoF,
      periodoDosForm: this.periodoDosF,
      diasLibresForm: this.diasLibresF,
      periodosForm: this.periodosF,
      acumularForm: this.acumularF,
    });

    this.tercerFormulario = this.formulario.group({
      vacaciones_cuatroForm: this.vacaciones_cuatroF,
      antiguedadActivaForm: this.antiguedadActivaF,
      vacaciones_tresForm: this.vacaciones_tresF,
      aniosAntiguedadForm: this.aniosAntiguedadF,
      diasAdicionalesForm: this.diasAdicionalesF,
      vacaciones_dosForm: this.vacaciones_dosF,
      vacaciones_unoForm: this.vacaciones_unoF,
      meses_calculoForm: this.meses_calculoF,
      desde_cuatroForm: this.desde_cuatroF,
      hasta_cuatroForm: this.hasta_cuatroF,
      antiguedadForm: this.antiguedadF,
      hasta_tresForm: this.hasta_tresF,
      desde_tresForm: this.desde_tresF,
      desde_unoForm: this.desde_unoF,
      desde_dosForm: this.desde_dosF,
      hasta_unoForm: this.hasta_unoF,
      hasta_dosForm: this.hasta_dosF,
      calculoForm: this.calculoF,

      diasMesCalendarioForm: this.diasMesCalendarioF,
      diasMesLaborableForm: this.diasMesLaborableF,
      dias_CalendarioForm: this.dias_CalendarioF,
      dias_LaborableForm: this.dias_LaborableF,
    });
  }

  // APLICAR FILTROS DE BUSQUEDA DE PAISES
  private _filter(value: string): any {
    if (value != null) {
      const filterValue = value.toLowerCase();
      return this.paises.filter((pais: any) => pais.nombre.toLowerCase().includes(filterValue));
    }
  }

  // BUSQUEDA DE LISTA DE PAISES
  paises: any = [];
  ObtenerPaises() {
    this.paises = [];
    this.pais.BuscarPais('AMERICA').subscribe(datos => {
      this.paises = datos;
      this.filtro = this.nombrePaisF.valueChanges
        .pipe(
          startWith(''),
          map((value: any) => this._filter(value))
        );
    })
  }

  // BUSCAR REGISTROS DE REGIMEN LABORAL
  regimen: any = [];
  ObtenerRegimen() {
    this.regimen = [];
    this.rest.ConsultarNombresRegimen().subscribe(datos => {
      this.regimen = datos;
    })
  }

  // BUSCAR DATOS DE REGIMEN LABORAL A EDITAR
  data: any = [];
  ObtenerRegimenEditar() {
    this.data = [];
    this.rest.ConsultarUnRegimen(this.idRegimen).subscribe(datos => {
      this.data = datos;
      this.ImprimirDatos();
    })
  }

  // OBTENER DATOS DE PERIODO DE VACACIONES
  periodo: any = [];
  ObtenerPeriodos() {
    this.periodo = [];
    this.rest.ConsultarUnPeriodo(this.idRegimen).subscribe(dato => {
      this.periodo = dato;
      if (this.periodo.length === 3) {
        this.delete_tres = true;
        this.MostrarPeriodos(true, true, true);
        this.periodoUnoF.setValue(this.periodo[0].dias_vacacion);
        this.periodoDosF.setValue(this.periodo[1].dias_vacacion);
        this.periodoTresF.setValue(this.periodo[2].dias_vacacion);
      }
      if (this.periodo.length === 2) {
        this.delete_dos = true;
        this.nuevo_periodo = true;
        this.MostrarPeriodos(true, true, false);
        this.periodoUnoF.setValue(this.periodo[0].dias_vacacion);
        this.periodoDosF.setValue(this.periodo[1].dias_vacacion);
      }
      if (this.periodo.length === 1) {
        this.delete_uno = true;
        this.nuevo_periodo = true;
        this.MostrarPeriodos(true, false, false);
        this.periodoUnoF.setValue(this.periodo[0].dias_vacacion);
      }
    })
  }

  // MOSTRAR CAMPOS DE PERIODOS
  MostrarPeriodos(primero: boolean, segundo: boolean, tercer: boolean) {
    this.periodo_uno = primero;
    this.periodo_dos = segundo;
    this.periodo_tres = tercer;
  }

  // OBETENER ANTIGUEDAD
  data_antiguo: any = [];
  ObtenerAntiguedad() {
    this.data_antiguo = [];
    this.rest.ConsultarAntiguedad(this.idRegimen).subscribe(datos => {
      this.data_antiguo = datos;
      if (this.data_antiguo.length === 4) {
        this.delete_antiguo_cuatro = true;
        this.MostrarAntiguedad(true, true, true, true);
        this.SetearAntiguedad(this.desde_unoF, this.hasta_unoF, this.vacaciones_unoF, this.data_antiguo[0].anio_desde, this.data_antiguo[0].anio_hasta, this.data_antiguo[0].dias_antiguedad);
        this.SetearAntiguedad(this.desde_dosF, this.hasta_dosF, this.vacaciones_dosF, this.data_antiguo[1].anio_desde, this.data_antiguo[1].anio_hasta, this.data_antiguo[1].dias_antiguedad);
        this.SetearAntiguedad(this.desde_tresF, this.hasta_tresF, this.vacaciones_tresF, this.data_antiguo[2].anio_desde, this.data_antiguo[2].anio_hasta, this.data_antiguo[2].dias_antiguedad);
        this.SetearAntiguedad(this.desde_cuatroF, this.hasta_cuatroF, this.vacaciones_cuatroF, this.data_antiguo[3].anio_desde, this.data_antiguo[3].anio_hasta, this.data_antiguo[3].dias_antiguedad);
      }
      if (this.data_antiguo.length === 3) {
        this.variable = true;
        this.delete_antiguo_tres = true;
        this.MostrarAntiguedad(true, true, true, false);
        this.SetearAntiguedad(this.desde_unoF, this.hasta_unoF, this.vacaciones_unoF, this.data_antiguo[0].anio_desde, this.data_antiguo[0].anio_hasta, this.data_antiguo[0].dias_antiguedad);
        this.SetearAntiguedad(this.desde_dosF, this.hasta_dosF, this.vacaciones_dosF, this.data_antiguo[1].anio_desde, this.data_antiguo[1].anio_hasta, this.data_antiguo[1].dias_antiguedad);
        this.SetearAntiguedad(this.desde_tresF, this.hasta_tresF, this.vacaciones_tresF, this.data_antiguo[2].anio_desde, this.data_antiguo[2].anio_hasta, this.data_antiguo[2].dias_antiguedad);
      }
      if (this.data_antiguo.length === 2) {
        this.variable = true;
        this.delete_antiguo_dos = true;
        this.MostrarAntiguedad(true, true, false, false);
        this.SetearAntiguedad(this.desde_unoF, this.hasta_unoF, this.vacaciones_unoF, this.data_antiguo[0].anio_desde, this.data_antiguo[0].anio_hasta, this.data_antiguo[0].dias_antiguedad);
        this.SetearAntiguedad(this.desde_dosF, this.hasta_dosF, this.vacaciones_dosF, this.data_antiguo[1].anio_desde, this.data_antiguo[1].anio_hasta, this.data_antiguo[1].dias_antiguedad);
      }
      if (this.data_antiguo.length === 1) {
        this.variable = true;
        this.delete_antiguo_uno = true;
        this.MostrarAntiguedad(true, false, false, false);
        this.SetearAntiguedad(this.desde_unoF, this.hasta_unoF, this.vacaciones_unoF, this.data_antiguo[0].anio_desde, this.data_antiguo[0].anio_hasta, this.data_antiguo[0].dias_antiguedad);
      }
    })
  }

  // METODO PARA COLOCAR VALORES DE ANTIGUEDAD
  SetearAntiguedad(campo1: any, campo2: any, campo3: any, valor1: any, valor2: any, valor3: any) {
    campo1.setValue(valor1);
    campo2.setValue(valor2);
    campo3.setValue(valor3);
  }

  // METODO PARA MOSTRAR CAMPOS DE REGISTRO DE ANTIGUEDAD
  MostrarAntiguedad(valor1: boolean, valor2: boolean, valor3: boolean, valor4: boolean) {
    this.antiguo_uno = valor1;
    this.antiguo_dos = valor2;
    this.antiguo_tres = valor3;
    this.antiguo_cuatro = valor4;
  }

  // METODO PARA LEER DATOS REGISTRADOS
  ImprimirDatos() {
    // PRIMER FORMULARIO
    this.diasF.setValue(this.data.dias_mes);
    this.mesesF.setValue(this.data.mes_periodo);
    this.nombreF.setValue(this.data.descripcion);
    this.continuidadF.setValue(this.data.continuidad_laboral);
    // OBTENER NOMBRE DEL PAIS REGISTRADO
    this.paises.forEach((obj: any) => {
      if (obj.id === this.data.id_pais) {
        this.nombrePaisF.setValue(obj.nombre);
      }
    });
    // TIEMPO LIMITE DE SERVICIO
    if (this.data.trabajo_minimo_mes != 0) {
      this.meses_ = true;
      this.cancelar = true;
      this.servicioF.setValue('meses');
      this.minimoMesF.setValue(this.data.trabajo_minimo_mes);
    }
    if (this.data.trabajo_minimo_horas != 0) {
      this.horas_ = true;
      this.cancelar = true;
      this.servicioF.setValue('horas');
      this.minimoHorasF.setValue(this.data.trabajo_minimo_horas);
    }

    // SEGUNDO FORMULARIO
    this.diasLaborablesF.setValue(this.data.vacacion_dias_laboral);
    this.diasLibresF.setValue(this.data.vacacion_dias_libre);
    this.diasCalendarioF.setValue(this.data.vacacion_dias_calendario);
    this.validar_dias = false;
    this.correcto_dias = true;
    this.escritura_dias = true;

    // ACUMULACION DE VACACIONES
    if (this.data.acumular === true) {
      this.acumular = true;
      this.acumularF.setValue(this.data.acumular);
      this.diasAcumulacionF.setValue(this.data.dias_maximo_acumulacion);
    }
    // PERIODOS DE VACACIONES
    if (this.data.vacacion_divisible === true) {
      this.periodosF.setValue(this.data.vacacion_divisible);
      this.correcto_periodo = true;
      this.escritura_periodo = true;
      this.ObtenerPeriodos();
    }
    // ACTIVAR FORMULARIO
    this.siguiente = false;

    // TERCER FORMULARIO
    this.calculoF.setValue(true);
    this.limpiar_calcular = true;
    this.diasMesCalendarioF.setValue(this.data.vacacion_dias_calendario_mes);
    this.diasMesLaborableF.setValue(this.data.vacacion_dias_laboral_mes);
    this.dias_CalendarioF.setValue(this.data.calendario_dias);
    this.dias_LaborableF.setValue(this.data.laboral_dias);
    this.meses_calculoF.setValue(this.data.meses_calculo);
    // ANTIGUEDAD DE VACACIONES
    if (this.data.antiguedad === true) {
      this.antiguedad = true;
      this.antiguedadActivaF.setValue(true);
      if (this.data.antiguedad_fija === true) {
        this.fija = true;
        this.antiguedadF.setValue('fija');
        this.aniosAntiguedadF.setValue(this.data.anio_antiguedad);
        this.diasAdicionalesF.setValue(this.data.dias_antiguedad);
      }
      else {
        this.variableF = true;
        this.correcto_antiguo = true;
        this.escritura_antiguo = true;
        this.antiguedadF.setValue('variable');
        this.ObtenerAntiguedad();
      }
    }
    // ACTIVAR FORMULARIO
    this.activar_guardar = false;

  }

  /** *********************************************************************************************** **
   ** **                              TIEMPO LIMITE DE SERVICIOS                                   ** **
   ** *********************************************************************************************** **/

  // BOTON CERRAR REGISTRO DE TIEMPO MINIMO DE SERVICIO
  cancelar: boolean = false;
  // HABILITAR CAMPO TIEMPO MINIMO EN MESES Y HORAS
  meses_: boolean = false; // ----------------------------- Botones inhabilitados (false)
  horas_: boolean = false;
  // METODO PARA HABILITAR INGRESO DE TIEMPO EN MESES U HORAS
  SelecionarLimite(event: MatRadioChange) {
    var opcion_limite = event.value;
    this.cancelar = true;
    if (opcion_limite === 'meses') {
      this.meses_ = true; // ------------------------------- Boton habilitado (true)
      this.horas_ = false;
      this.LimpiarFormulario(this.minimoMesF, '');
      this.LimpiarFormulario(this.minimoHorasF, ' ');
    }
    else {
      this.meses_ = false;
      this.horas_ = true; // ------------------------------- Boton habilitado (true)
      this.LimpiarFormulario(this.minimoMesF, ' ');
      this.LimpiarFormulario(this.minimoHorasF, '');
    }
  }

  // CANCELAR REGISTRO DE TIEMPO LIMITE DE SERVICIO
  CancelarLimite() {
    this.cancelar = false;
    this.meses_ = false;
    this.horas_ = false;
    // LIMPIAR SELECCION DE TIEMPO MINIMO DE SERVICIO
    this.servicioF.reset();
    this.LimpiarFormulario(this.minimoMesF, ' ');
    this.LimpiarFormulario(this.minimoHorasF, ' ');
  }


  /** *********************************************************************************************** **
   ** **                          VALIDACIONES DE DIAS DE VACACIONES                               ** **
   ** *********************************************************************************************** **/

  // BOTONES DE VALIDACION DE DIAS INGRESADOS
  validar_dias: boolean = true;
  correcto_dias: boolean = false;
  escritura_dias: boolean = false; // ------------------------------- Parametro readonly inhabilitado (false)
  // VALIDAR DIAS DE VACACIONES INGRESADAS
  ValidarVacaciones(form2: any) {
    this.LimpiarCalcular();
    // VERIFICAR QUE LOS DATOS NO SEAN VACIOS
    if (form2.diasCalendarioForm === '' && form2.diasLaborablesForm === '' && form2.diasLibresForm === '') {
      this.toastr.warning('No ha ingresado días de vacaciones.', '', {
        timeOut: 6000
      })
    }

    // VERIFICAR QUE SE INGRESE DIAS REQUERIDOS CALENDARIO O LIBRES
    else if (form2.diasCalendarioForm === '' && form2.diasLaborablesForm != '' && form2.diasLibresForm === '') {
      this.toastr.warning('Se requiere ingresar vacaciones en días calendario o número de días libres.', '', {
        timeOut: 6000
      })
    }

    // VERIFICAR QUE SE INGRESE DIAS REQUERIDOS CALENDARIO O HABILES
    else if (form2.diasCalendarioForm === '' && form2.diasLaborablesForm === '' && form2.diasLibresForm != '') {
      this.toastr.warning('Se requiere ingresar vacaciones en días calendario o número de días hábiles.', '', {
        timeOut: 6000
      })
    }

    // VERIFICAR QUE SE INGRESE DIAS REQUERIDO HABILES O LIBRES
    else if (form2.diasCalendarioForm != '' && form2.diasLaborablesForm === '' && form2.diasLibresForm === '') {
      this.toastr.warning('Se requiere ingresar días hábiles de vacaciones o número de días libres.', '', {
        timeOut: 6000
      })
    }

    // VERIFICAR DATOS INGRESADOS Y CALCULAR DIAS LIBRES
    else if (form2.diasCalendarioForm != '' && form2.diasLaborablesForm != '' && form2.diasLibresForm === '') {
      // VERIFICAR QUE LOS DIAS CALENDARIO SEAN MAYORES A LOS DIAS HABILES
      if (parseFloat(form2.diasCalendarioForm) > parseFloat(form2.diasLaborablesForm)) {
        var libres = Number((parseFloat(form2.diasCalendarioForm) - parseFloat(form2.diasLaborablesForm)).toFixed(10));
        this.diasLibresF.setValue(String(libres));
        // VERIFICAR QUE LOS DIAS HABILES SEAN MAYORES A LOS DIAS LIBRES
        if (parseFloat(form2.diasLaborablesForm) > libres) {
          this.validar_dias = false;
          this.correcto_dias = true; // --------------------------- Registros validados (true)
          this.escritura_dias = true; // -------------------------- Parametro readonly habilitado (true)
          this.ActivarFormularioDos(form2);
        }
        else {
          this.toastr.warning('Número de días libres no debe ser mayor a los días hábiles de vacaciones.', '', {
            timeOut: 6000
          })
        }
      }
      else {
        this.toastr.warning('Vacaciones en días calendario deben ser mayores al total de vacaciones en días hábiles.', '', {
          timeOut: 6000
        })
      }
    }

    // VERIFICAR DATOS INGRESADOS Y CALCULAR DIAS HABILES
    else if (form2.diasCalendarioForm != '' && form2.diasLaborablesForm === '' && form2.diasLibresForm != '') {
      // VERIFICAR QUE LOS DIAS CALENDARIO SEAN MAYORES A LOS DIAS LIBRES
      if (parseFloat(form2.diasCalendarioForm) > parseFloat(form2.diasLibresForm)) {
        var habiles = Number((parseFloat(form2.diasCalendarioForm) - parseFloat(form2.diasLibresForm)).toFixed(10));
        this.diasLaborablesF.setValue(String(habiles));
        // VERIFICAR QUE LOS DIAS HABILES SEAN MAYORES A LOS DIAS LIBRES
        if (habiles > parseFloat(form2.diasLibresForm)) {
          this.validar_dias = false;
          this.correcto_dias = true;
          this.escritura_dias = true;
          this.ActivarFormularioDos(form2);
        }
        else {
          this.toastr.warning('Número de días libres no debe ser mayor a los días hábiles de vacaciones.', '', {
            timeOut: 6000
          })
        }
      }
      else {
        this.toastr.warning('Vacaciones en días calendario deben ser mayores al total de vacaciones en días libres.', '', {
          timeOut: 6000
        })
      }
    }

    // VERIFICAR SI LOS DATOS INGRESADOS SON CORRECTOS
    else if (form2.diasCalendarioForm != '' && form2.diasLaborablesForm != '' && form2.diasLibresForm != '') {
      // VERIFICAR QUE LOS DIAS HABILES SEAN MAYORES A LOS DIAS LIBRES
      if (parseFloat(form2.diasLaborablesForm) > parseFloat(form2.diasLibresForm)) {
        var calendario = Number((parseFloat(form2.diasLaborablesForm) + parseFloat(form2.diasLibresForm)).toFixed(10));
        // VERIFICAR QUE EL CALCULO DE DIAS CALENDARIO SEAN IGUALES A LOS INGRESADOS
        if (calendario === parseFloat(form2.diasCalendarioForm)) {
          this.validar_dias = false;
          this.correcto_dias = true;
          this.escritura_dias = true;
          this.ActivarFormularioDos(form2);
        }
        else {
          this.toastr.warning('Vacaciones en días calendario no corresponde a los datos ingresados.', '', {
            timeOut: 6000
          })
        }
      }
      else {
        this.toastr.warning('Número de días libres no debe ser mayor a los días hábiles de vacaciones.', '', {
          timeOut: 6000
        })
      }
    }

    // VERIFICAR LOS DATOS Y CALCULAR DIAS CALENDARIO
    else if (form2.diasCalendarioForm === '' && form2.diasLaborablesForm != '' && form2.diasLibresForm != '') {
      // VERIFICAR QUE LOS DIAS HABILES SEAN MAYORES A LOS DIAS LIBRES
      if (parseFloat(form2.diasLaborablesForm) > parseFloat(form2.diasLibresForm)) {
        var calendario = Number((parseFloat(form2.diasLaborablesForm) + parseFloat(form2.diasLibresForm)).toFixed(10));
        this.diasCalendarioF.setValue(String(calendario));
        this.validar_dias = false;
        this.correcto_dias = true;
        this.escritura_dias = true;
        this.ActivarFormularioDos(form2);
      }
      else {
        this.toastr.warning('Número de días libres no debe ser mayor a los días hábiles de vacaciones.', '', {
          timeOut: 6000
        })
      }
    }
  }

  // METODO USADO PARA EDITAR DIAS DE VACACIONES
  EditarVacaciones() {
    this.validar_dias = true;
    this.correcto_dias = false;
    this.escritura_dias = false;
    this.siguiente = true;

    // VERIFICACION DE REGISTRO DE PERIODOS
    if (this.periodo_uno === true) {
      this.validar_periodo = true;
      this.correcto_periodo = false;
      this.escritura_periodo = false;
    }
  }

  // ACTIVAR BOTON SIGUIENTE DE FORMULARIO VACACIONES
  siguiente: boolean = true;   // ------------------------ Boton inhabilitado (true)
  ActivarFormularioDos(form2: any) {
    this.siguiente = true;
    if (form2.periodosForm === false) {
      if (this.validar_dias === false) {
        this.siguiente = false; // ----------------------- Boton habilitado (false)
      }
    }
    else {
      if (this.validar_dias === false && this.validar_periodo === false) {
        this.siguiente = false;
      }
    }
  }


  /** *********************************************************************************************** **
   ** **                              ACUMULACION DE VACACIONES                                    ** **
   ** *********************************************************************************************** **/

  // ACTIVAR ACUMULACION DE VACACIONES
  acumular: boolean = false; // ------------------------- Parametro acumular inactivo (false)
  ActivarAcumular(ob: MatCheckboxChange) {
    if (ob.checked === true) {
      this.acumular = true; // -------------------------- Parametro acumular activo (true)
      this.LimpiarFormulario(this.diasAcumulacionF, '');
    }
    else {
      this.acumular = false;
      this.LimpiarFormulario(this.diasAcumulacionF, ' ');
    }
  }


  /** *********************************************************************************************** **
   ** **                               PERIODOS DE VACACIONES                                      ** **
   ** *********************************************************************************************** **/

  nuevo_periodo: boolean = false; // ------------------------ Booton crear registro periodo inactivo (false)
  // BOTONES PARA HABILITAR VALIDACIONES DE REGISTRO DE PERIODO
  validar_periodo: boolean = false; // ---------------------- Botones para validar registros inactivos (false)
  correcto_periodo: boolean = false;
  escritura_periodo: boolean = false; // --------------------  Parametro readonly inhabilitado (false)

  // METODO PARA ACTIVAR REGISTRO DE PERIODOS DE VACACIONES
  ActivarPeriodos(ob: MatCheckboxChange) {
    if (ob.checked === true) {
      this.siguiente = true; // inactivo
      // BOTONES REGISTRAR PERIODO
      this.nuevo_periodo = true;
      this.periodo_uno = true;
      this.delete_uno = true;
      // BOTONES VALIDACION
      this.validar_periodo = true;
      this.correcto_periodo = false;
      this.escritura_periodo = false;
      this.LimpiarFormulario(this.periodoUnoF, '');
    }
    else {
      // INACTIVAR REGISTROS DE PERIODOS
      this.nuevo_periodo = false;
      this.periodo_tres = false;
      this.periodo_uno = false;
      this.periodo_dos = false;

      // INACTIVAR VALIDACIONES DE REGISTROS
      this.validar_periodo = false;
      this.correcto_periodo = false;

      // INACTIVAR MENSAJES DE ERRORES
      this.mensaje1_ = false;
      this.mensaje2_ = false;
      this.mensaje3_ = false;

      // LIMPIAR FORMULARIO DE REGISTRO DE PERIODOS
      this.LimpiarFormulario(this.periodoUnoF, ' ');
      this.LimpiarFormulario(this.periodoDosF, ' ');
      this.LimpiarFormulario(this.periodoTresF, ' ');

      // VALIDACIONES ACTIVAR BOTON DE FORMULARIO
      if (this.validar_dias === false) {
        this.siguiente = false;
      }
      else {
        this.siguiente = true;
      }
    }
  }

  // METODO PARA MOSTRAR CAMPOS DE REGISTROS DE PERIODOS
  periodo_uno: boolean = false; // ------------------------- Botones inactivos (false)
  periodo_dos: boolean = false;
  periodo_tres: boolean = false;
  RegistrarPeriodo() {
    this.validar_periodo = true; // ------------------------ Activar boton de validaciones (true)
    this.correcto_periodo = false;
    this.escritura_periodo = false;

    if (this.periodo_uno === false) {
      this.periodo_uno = true;
      this.delete_uno = true;
      // LIMPIAR FORMULARIO DE REGISTRO DE PERIODO
      this.LimpiarFormulario(this.periodoUnoF, '');
    }
    else if (this.periodo_dos === false) {
      this.periodo_dos = true;
      this.delete_dos = true;
      this.delete_uno = false;
      // LIMPIAR FORMULARIO DE REGISTRO DE PERIODO
      this.LimpiarFormulario(this.periodoDosF, '');
    }
    else if (this.periodo_tres === false) {
      this.periodo_tres = true;
      this.delete_tres = true;
      this.delete_dos = false;
      this.nuevo_periodo = false; // --------------- Inactivar boton crear registro (permitido 3 registros)
      // LIMPIAR FORMULARIO DE REGISTRO DE PERIODO
      this.LimpiarFormulario(this.periodoTresF, '');
    }
  }

  // OCULTAR CAMPO DE REGISTRO DE PERIODO DE VACACIONES
  delete_uno: boolean = false;
  delete_dos: boolean = false;
  delete_tres: boolean = false;
  EliminarPeriodo(opcion: number) {
    if (opcion === 1) {
      // HABILITAR BOTON DE FORMULARIO
      this.siguiente = false;

      // INACTIVAR BOTONES DE REGISTRO DE PERIODO
      this.nuevo_periodo = false;
      this.periodo_uno = false;
      this.delete_uno = false;

      // INACTIVAR MENSAJES DE ERRORES
      this.mensaje1_ = false;

      // INACTIVAR BOTONES DE VALIDACION
      this.validar_periodo = false;
      this.correcto_periodo = false;
      this.escritura_periodo = false;

      // LIMPIAR FORMULARIO DE REGISTRO DE PERIODO
      this.periodosF.setValue(false);
      this.LimpiarFormulario(this.periodoUnoF, ' ');
    }
    if (opcion === 2) {
      this.periodo_dos = false;
      this.delete_dos = false;
      this.delete_uno = true;

      this.mensaje2_ = false;

      this.validar_periodo = true;
      this.correcto_periodo = false;
      this.escritura_periodo = false;

      this.siguiente = true;
      this.LimpiarFormulario(this.periodoDosF, ' ');
    }
    if (opcion === 3) {
      this.nuevo_periodo = true;
      this.periodo_tres = false;
      this.delete_tres = false;
      this.delete_dos = true;

      this.mensaje3_ = false;

      this.validar_periodo = true;
      this.correcto_periodo = false;
      this.escritura_periodo = false;

      this.siguiente = true;
      this.LimpiarFormulario(this.periodoTresF, ' ');
    }
  }

  // VALIDAR QUE LOS DIAS DE VACACIONES SEAN SUPERIORES A 5 DIAS
  mensaje1_: boolean = false; // ------------------------- Mensaje de errores inactivos (false)
  mensaje2_: boolean = false;
  mensaje3_: boolean = false;
  VerificarPeriodos(event: Event, opcion: number): void {
    var valor = event.target as HTMLInputElement;;
    if (parseFloat(valor.value) >= 5) {
      if (opcion === 1) {
        this.mensaje1_ = false;
      }
      else if (opcion === 2) {
        this.mensaje2_ = false;
      }
      else if (opcion === 3) {
        this.mensaje3_ = false;
      }
    }
    else {
      if (opcion === 1) {
        this.mensaje1_ = true; // ------------------------- Mensajes de errores activos (true)
      }
      else if (opcion === 2) {
        this.mensaje2_ = true;
      }
      else if (opcion === 3) {
        this.mensaje3_ = true;
      }
    }
  }

  // METODO PARA VALIDAR QUE LOS DIAS DE VACACIONES POR PERIODOS NO EXCEDA LA CARGA DE VACACIONES
  VacacionesVerificadas(form2: any, total: any) {
    if (this.correcto_dias === true) {
      if (total === parseFloat(form2.diasLaborablesForm)) {
        this.validar_periodo = false;
        this.correcto_periodo = true;
        this.escritura_periodo = true;
        this.siguiente = false;
      }
      else {
        this.toastr.warning('Los días de vacaciones ingresados, al ser totalizados no son iguales a los días hábiles de vacaciones asignados al usuario.', '', {
          timeOut: 6000
        })
      }
    }
    else {
      this.toastr.warning('Verificar días de vacaciones que serán asignadas a los usuarios.', '', {
        timeOut: 6000
      })
    }
  }

  // METODO PARA VALIDAR REGISTRO DE PERIODOS DE VACACIONES
  ValidarDiasPeriodo(form2: any) {
    if (this.mensaje1_ === false && this.mensaje2_ === false && this.mensaje3_ === false) {
      // SI TODOS LOS CAMPOS DE PERIODOS ESTAN HABILITADOS
      if (this.periodo_uno === true && this.periodo_dos === true && this.periodo_tres === true) {
        if (form2.periodoUnoForm != '' && form2.periodoDosForm != '' && form2.periodoTresForm != '') {
          var total = Number((parseFloat(form2.periodoUnoForm) + parseFloat(form2.periodoDosForm) + parseFloat(form2.periodoTresForm)).toFixed(10));
          this.VacacionesVerificadas(form2, total);
        }
        else {
          this.toastr.warning('Ingresar días de vacaciones en los registros de periodos habilitados.', '', {
            timeOut: 6000
          })
        }
      }
      // SI ESTAN HABIITADOS SOLO DOS CAMPOS DE PERIODOS
      else if (this.periodo_uno === true && this.periodo_dos === true && this.periodo_tres === false) {
        if (form2.periodoUnoForm != '' && form2.periodoDosForm != '') {
          var total = Number((parseFloat(form2.periodoUnoForm) + parseFloat(form2.periodoDosForm)).toFixed(10));
          this.VacacionesVerificadas(form2, total);
        }
        else {
          this.toastr.warning('Ingresar días de vacaciones en los registros de periodos habilitados.', '', {
            timeOut: 6000
          })
        }
      }
      // SI ESTAN HABIITADOS SOLO UN CAMPO DE PERIODOS
      else if (this.periodo_uno === true && this.periodo_dos === false && this.periodo_tres === false) {
        if (form2.periodoUnoForm != '') {
          this.VacacionesVerificadas(form2, parseFloat(form2.periodoUnoForm));
        }
        else {
          this.toastr.warning('Ingresar días de vacaciones en los registros de periodos habilitados.', '', {
            timeOut: 6000
          })
        }
      }
    }
    else {
      this.toastr.warning('Dias de vacaciones ingresados no son correctos.', '', {
        timeOut: 6000
      })
    }
  }

  // METODO PARA EDITAR VALORES DE PERIODOS REGISTRADOS
  EditarPeriodo() {
    this.siguiente = true;
    this.validar_periodo = true;
    this.correcto_periodo = false;
    this.escritura_periodo = false;
  }


  /** *********************************************************************************************** **
   ** **                              ANTIGUEDAD DE VACACIONES                                     ** **
   ** *********************************************************************************************** **/

  // BOTONES DE ACTIVACION DE REGISTRO DE ANTIGUEDAD
  fija: boolean = false; // ----------------------- Botones inactivos de registro de antiguedad (false)
  variable: boolean = false;
  antiguedad: boolean = false;
  // BOTONES DE VALIDACIONES DE REGISTRO DE ANTIGUEDAD
  validar_antiguo: boolean = false; // ----------------- Botones inactivos de validaciones (false)
  correcto_antiguo: boolean = false;
  escritura_antiguo: boolean = false;
  // BOTON GUARDAR DE FROMULARIO ANTIGUEDAD
  activar_guardar: boolean = true; // ------------------ Boton inactivo (true)

  // METODO DE ACTIVACION DE REGISTRO DE ANTIGUEDDA
  ActivarAntiguedad(ob: MatCheckboxChange, form3: any) {
    if (ob.checked === true) {
      this.antiguedad = true;
      this.activar_guardar = true;
    }
    else {
      // INACTIVAR OPCIONES DE ANTIGUEDAD
      this.fija = false;
      this.antiguedad = false;
      this.variable = false;
      this.variableF = true;

      // INACTIVAR BOTONES DE VALIDACIONES
      this.validar_antiguo = false;
      this.correcto_antiguo = false;

      // LIMPIAR FORMULARIO REGISTRO DE ANTIGUEDAD
      this.antiguedadF.reset();
      this.LimpiarAntiguedad();

      // METODO PARA VERIFICAR SI SE HABILITA O NO EL BOTON GUARDAR
      if (form3.calculoForm === true) {
        this.activar_guardar = false;
      }
      else {
        this.activar_guardar = true;
      }
    }
  }

  // METODO PARA SELECCIONAR TIPO DE ANTIGUEDAD
  SelecionarAntiguo(event: MatRadioChange, form3: any) {
    var opcion_antiguo = event.value;
    this.activar_guardar = true;
    if (opcion_antiguo === 'fija') {
      this.fija = true;
      this.variable = false;
      this.variableF = false;
      this.validar_antiguo = false;
      this.correcto_antiguo = false;
      this.LimpiarAntiguedad();
      if (form3.calculoForm === true) {
        this.activar_guardar = false;
      }
      else {
        this.activar_guardar = true;
      }
    }
    else {
      this.fija = false;
      this.variable = true;
      this.variableF = true;
      this.antiguo_uno = true;
      this.delete_antiguo_uno = true;
      this.validar_antiguo = true;
      this.escritura_antiguo = false;
      this.LimpiarFormAntiguedad(this.desde_unoF, this.hasta_unoF, this.vacaciones_unoF, '');
    }
  }

  // CAMPOS DE REGISTRO DE ANTIGUEDAD
  antiguo_uno: boolean = false; // --------------------- Campos de formulario inactivos (false)
  antiguo_dos: boolean = false;
  antiguo_tres: boolean = false;
  antiguo_cuatro: boolean = false;
  // METODO PARA MOSTRAR CAMPOS DE REGISTRO DE ANTIGUEDAD
  RegistrarAntiguedad(fomr3: any) {
    this.activar_guardar = true;
    // BOTONES DE VALIDACION DE REGISTROS
    this.validar_antiguo = true;
    this.correcto_antiguo = false;
    this.escritura_antiguo = false;

    if (this.antiguo_uno === false) {
      this.antiguo_uno = true;
      this.delete_antiguo_uno = true;
      this.LimpiarFormAntiguedad(this.desde_unoF, this.hasta_unoF, this.vacaciones_unoF, '');
    }

    else if (this.antiguo_dos === false) {
      // VALIDAR QUE LA INFORMACIÓN REQUERIDA SEA INGRESADA
      if (fomr3.desde_unoForm != '' && fomr3.hasta_unoForm != '' && fomr3.vacaciones_unoForm != '') {
        this.antiguo_dos = true;
        this.delete_antiguo_dos = true;
        this.delete_antiguo_uno = false;
        this.LimpiarFormAntiguedad(this.desde_dosF, this.hasta_dosF, this.vacaciones_dosF, '');
      }
      else {
        this.toastr.warning('Primero registrar datos de antiguedad de vacaciones solicitados.', '', {
          timeOut: 6000
        })
      }
    }

    else if (this.antiguo_tres === false) {
      if (fomr3.desde_dosForm != '' && fomr3.hasta_dosForm != '' && fomr3.vacaciones_dosForm != '') {
        this.antiguo_tres = true;
        this.delete_antiguo_tres = true;
        this.delete_antiguo_dos = false;
        this.LimpiarFormAntiguedad(this.desde_tresF, this.hasta_tresF, this.vacaciones_tresF, '');
      }
      else {
        this.toastr.warning('Primero registrar datos de antiguedad de vacaciones solicitados.', '', {
          timeOut: 6000
        })
      }
    }

    else if (this.antiguo_cuatro === false) {
      if (fomr3.desde_tresForm != '' && fomr3.hasta_tresForm != '' && fomr3.vacaciones_tresForm != '') {
        this.variable = false;
        this.antiguo_cuatro = true;
        this.delete_antiguo_tres = false;
        this.delete_antiguo_cuatro = true;
        this.LimpiarFormAntiguedad(this.desde_cuatroF, this.hasta_cuatroF, this.vacaciones_cuatroF, '');
      }
      else {
        this.toastr.warning('Primero registrar datos de antiguedad de vacaciones solicitados.', '', {
          timeOut: 6000
        })
      }
    }
  }

  // BOTONES DE ELIMINACION DE REGISTRO DE ANTIGUEDAD
  delete_antiguo_uno: boolean = false; // ------------------ Botones de eliminar registro inactivo (false)
  delete_antiguo_dos: boolean = false;
  delete_antiguo_tres: boolean = false;
  delete_antiguo_cuatro: boolean = false;
  // METODO PARA OCULTAR CAMPOS DE REGISTRO DE ANTIGUEDAD
  EliminarAntiguedad(opcion: number) {
    this.correcto_antiguo = false;
    this.escritura_antiguo = false;
    if (opcion === 1) {

      this.activar_guardar = true;
      this.antiguedad = true;
      this.fija = false;
      this.variable = false;
      this.variableF = false;

      this.antiguo_uno = false;
      this.validar_antiguo = false;

      this.antiguedadF.reset();
      this.LimpiarFormAntiguedad(this.desde_unoF, this.hasta_unoF, this.vacaciones_unoF, ' ');
    }
    if (opcion === 2) {
      this.delete_antiguo_uno = true;
      this.antiguo_dos = false;
      this.validar_antiguo = true;
      this.LimpiarFormAntiguedad(this.desde_dosF, this.hasta_dosF, this.vacaciones_dosF, ' ');
    }
    if (opcion === 3) {
      this.delete_antiguo_dos = true;
      this.antiguo_tres = false;
      this.validar_antiguo = true;
      this.LimpiarFormAntiguedad(this.desde_tresF, this.hasta_tresF, this.vacaciones_tresF, ' ');
    }
    if (opcion === 4) {
      this.delete_antiguo_tres = true;
      this.antiguo_cuatro = false;
      this.variable = true;
      this.validar_antiguo = true;
      this.LimpiarFormAntiguedad(this.desde_cuatroF, this.hasta_cuatroF, this.vacaciones_cuatroF, ' ');
    }
  }

  // METODO PARA RESTABLECER SELECCION DE ANTIGUEDAD
  LimpiarAntiguedad() {
    this.antiguo_uno = false;
    this.antiguo_dos = false;
    this.antiguo_tres = false;
    this.antiguo_cuatro = false;
    this.LimpiarFormAntiguedad(this.desde_unoF, this.hasta_unoF, this.vacaciones_unoF, ' ');
    this.LimpiarFormAntiguedad(this.desde_dosF, this.hasta_dosF, this.vacaciones_dosF, ' ');
    this.LimpiarFormAntiguedad(this.desde_tresF, this.hasta_tresF, this.vacaciones_tresF, ' ');
    this.LimpiarFormAntiguedad(this.desde_cuatroF, this.hasta_cuatroF, this.vacaciones_cuatroF, ' ');
  }

  // METODO PARA LIMPIAR CAMPOS DE FORMULARIO DE ANTIGUEDAD DE VACACIONES
  LimpiarFormAntiguedad(campo1: any, campo2: any, campo3: any, limpiar: string) {
    campo1.setValue(limpiar);
    campo2.setValue(limpiar);
    campo3.setValue(limpiar);
  }

  // MENSAJES DE ERRORES
  hasta_uno: boolean = false; // ----------------------- Mensajes de error inactivos (false)
  hasta_dos: boolean = false;
  hasta_tres: boolean = false;
  hasta_cuatro: boolean = false;

  // VALIDACIONES DE REGISTROS DE ANTIGUEDAD
  ValidarRegistrosAntiguedad(desde: any, hasta: any, vacaciones: any, mensaje: boolean) {
    if (desde != '' && hasta != '' && vacaciones != '') {
      if (parseFloat(hasta) > parseFloat(desde)) {
        mensaje = false;
        return true; // ------ Si cumple las condiciones retorna true
      }
      else {
        mensaje = true; // --------------------- Mensajes de error activos (true)
      }
    }
    else {
      return ''; // ------ Si los campos estan vacios retorna vacio
    }
  }

  // METODO PARA EDITAR REGISTRO DE ANTIGUEDAD
  EditarAntiguedad() {
    this.correcto_antiguo = false;
    this.validar_antiguo = true;
    this.escritura_antiguo = false;
  }

  // VERIFICAR QUE LOS REGISTROS DE ANTIGUEDAD CUMPLAN CON LAS CONDICIONES
  VerificarAntiguedad(form3: any) {
    var uno = this.ValidarRegistrosAntiguedad(form3.desde_unoForm, form3.hasta_unoForm, form3.vacaciones_unoForm, this.hasta_uno);
    var dos = this.ValidarRegistrosAntiguedad(form3.desde_dosForm, form3.hasta_dosForm, form3.vacaciones_dosForm, this.hasta_dos);
    var tres = this.ValidarRegistrosAntiguedad(form3.desde_tresForm, form3.hasta_tresForm, form3.vacaciones_tresForm, this.hasta_tres);
    var cuatro = this.ValidarRegistrosAntiguedad(form3.desde_cuatroForm, form3.hasta_cuatroForm, form3.vacaciones_cuatroForm, this.hasta_cuatro);

    if (this.antiguo_uno === true && this.antiguo_dos === false &&
      this.antiguo_tres === false && this.antiguo_cuatro === false) {
      if (uno === '') {
        this.toastr.warning('Ingresar la información requerida.', '', {
          timeOut: 6000
        });
      }
      else if (uno === true) {
        this.AsignarValidaciones(form3);
      }
      else {
        this.toastr.warning('Datos ingresados presentan errores.', '', {
          timeOut: 6000
        });
      }
    }
    else if (this.antiguo_uno === true && this.antiguo_dos === true &&
      this.antiguo_tres === false && this.antiguo_cuatro === false) {
      if (uno === '') {
        this.toastr.warning('Ingresar la información requerida.', '', {
          timeOut: 6000
        });
      }
      else if (uno === true) {
        if (dos === '') {
          this.toastr.warning('Ingresar la información requerida.', '', {
            timeOut: 6000
          });
        }
        else if (dos === true) {
          this.AsignarValidaciones(form3);
        }
        else {
          this.toastr.warning('Datos ingresados presentan errores.', '', {
            timeOut: 6000
          });
        }
      }
      else {
        this.toastr.warning('Datos ingresados presentan errores.', '', {
          timeOut: 6000
        });
      }
    }
    else if (this.antiguo_uno === true && this.antiguo_dos === true &&
      this.antiguo_tres === true && this.antiguo_cuatro === false) {
      if (uno === '') {
        this.toastr.warning('Ingresar la información requerida.', '', {
          timeOut: 6000
        });
      }
      else if (uno === true) {

        if (dos === '') {
          this.toastr.warning('Ingresar la información requerida.', '', {
            timeOut: 6000
          });
        }
        else if (dos === true) {

          if (tres === '') {
            this.toastr.warning('Ingresar la información requerida.', '', {
              timeOut: 6000
            });
          }
          else if (tres === true) {
            this.AsignarValidaciones(form3);
          }
          else {
            this.toastr.warning('Datos ingresados presentan errores.', '', {
              timeOut: 6000
            });
          }

        }
        else {
          this.toastr.warning('Datos ingresados presentan errores.', '', {
            timeOut: 6000
          });
        }

      }
      else {
        this.toastr.warning('Datos ingresados presentan errores.', '', {
          timeOut: 6000
        });
      }

    }
    else if (this.antiguo_uno === true && this.antiguo_dos === true &&
      this.antiguo_tres === true && this.antiguo_cuatro === true) {
      if (uno === '') {
        this.toastr.warning('Ingresar la información requerida.', '', {
          timeOut: 6000
        });
      }
      else if (uno === true) {

        if (dos === '') {
          this.toastr.warning('Ingresar la información requerida.', '', {
            timeOut: 6000
          });
        }
        else if (dos === true) {

          if (tres === '') {
            this.toastr.warning('Ingresar la información requerida.', '', {
              timeOut: 6000
            });
          }
          else if (tres === true) {

            if (cuatro === '') {
              this.toastr.warning('Ingresar la información requerida.', '', {
                timeOut: 6000
              });
            }
            else if (cuatro === true) {
              this.AsignarValidaciones(form3);
            }
            else {
              this.toastr.warning('Datos ingresados presentan errores.', '', {
                timeOut: 6000
              });
            }

          }
          else {
            this.toastr.warning('Datos ingresados presentan errores.', '', {
              timeOut: 6000
            });
          }

        }
        else {
          this.toastr.warning('Datos ingresados presentan errores.', '', {
            timeOut: 6000
          });
        }

      }
      else {
        this.toastr.warning('Datos ingresados presentan errores.', '', {
          timeOut: 6000
        });
      }
    }
  }

  // METODO PARA ASIGNAR VALORES DE VALIDACIONES AL CUMPLIR CONDICIONES
  AsignarValidaciones(form3: any) {
    this.validar_antiguo = false;
    this.correcto_antiguo = true;
    this.escritura_antiguo = true;
    if (form3.calculoForm === true) {
      this.activar_guardar = false;
    }
    else {
      this.activar_guardar = true;
    }
  }


  /** ************************************************************************************************* **
   ** **                     REALIZAR CALCULOS DE DIAS DE VACACIONES                                 ** **
   ** ************************************************************************************************* **/

  limpiar_calcular: boolean = false; // --------------------- Boton para limpiar formulario inactivo (false)
  // METODO PARA VALIDAR REALIZACION DE CALCULOS
  ValidarRequerido(event: MatCheckboxChange, form1: any, form2: any, form3: any) {
    if (event.checked === true) {
      if (form3.meses_calculoForm != '') {
        this.limpiar_calcular = true; // --------------------- Activar boton limpiar formulario (true)
        this.CalcularDiasMeses(form1, form2, form3);
        if (form3.antiguedadActivaForm === true && form3.antiguedadForm === 'variable') {
          if (this.correcto_antiguo === true) {
            this.activar_guardar = false;
          } else {
            this.activar_guardar = true;
          }
        }
        else {
          this.activar_guardar = false;
        }
      }
      else {
        this.calculoF.setValue(false);
        this.toastr.warning('Registrar número de meses de periodo considerados en el cálculo.', '', {
          timeOut: 6000
        })
      }
    }
    else {
      this.LimpiarCalcular();
    }
  }

  // METODO PARA CALCULAR VACACIONES GANADAS AL MES
  CalcularDiasMeses(form1: any, form2: any, form3: any) {
    // EJEMPLO:
    // 12 --> 11
    //  1 --> x
    // CALCULO DE DIAS GANADOS AL MES
    var dias_laborables_mes = Number((parseFloat(form2.diasLaborablesForm) / parseFloat(form3.meses_calculoForm)).toFixed(10));
    var dias_calendario_mes = Number((parseFloat(form2.diasCalendarioForm) / parseFloat(form3.meses_calculoForm)).toFixed(10));

    this.diasMesLaborableF.setValue(String(dias_laborables_mes));
    this.diasMesCalendarioF.setValue(String(dias_calendario_mes));

    // EJEMPLO:
    // 30 --> dias_laborables_mes
    //  1 --> x
    // CALCULO DE DIAS GANADOS POR DIA
    var dias_laborables = Number((dias_laborables_mes / parseFloat(form1.diasForm)).toFixed(10));
    var dias_calendario = Number((dias_calendario_mes / parseFloat(form1.diasForm)).toFixed(10));

    this.dias_LaborableF.setValue(String(dias_laborables));
    this.dias_CalendarioF.setValue(String(dias_calendario));

  }


  LimpiarCalcular() {
    this.limpiar_calcular = false;
    this.activar_guardar = true;
    this.calculoF.setValue(false);
    this.diasMesLaborableF.setValue('');
    this.diasMesCalendarioF.setValue('');
    this.dias_LaborableF.setValue('');
    this.dias_CalendarioF.setValue('');
  }


  /** *********************************************************************************************** **
   ** **                       INSERCION DE DATOS DE REGIMEN LABORAL                               ** **
   ** *********************************************************************************************** **/

  // VERIFICAR NOMBRES DUPLICADOS
  VerificarRegistro(form1: any, form2: any, form3: any) {
    // SI EL NOMBRE NO FUE EDITADO NO SE VALIDA DUPLICADO
    if (form1.nombreForm.toUpperCase() === this.data.descripcion.toUpperCase()) {
      this.ValidarDatos(form1, form2, form3);
    }

    else {
      var nombre = 0;
      this.regimen.forEach((obj: any) => {
        if (obj.descripcion.toUpperCase() === form1.nombreForm.toUpperCase()) {
          nombre = 1;
        }
      })
      if (nombre === 1) {
        this.toastr.error('Nombre de Regimen Laboral ya se encuentra registrado.', '', {
          timeOut: 6000
        })
      }
      else {
        this.ValidarDatos(form1, form2, form3);
      }
    }
  }

  // VALIDAR DATOS INGRESADOS
  ValidarDatos(form1: any, form2: any, form3: any) {
    if (form3.antiguedadActivaForm === true && form3.antiguedadForm === 'fija') {
      if (form3.aniosAntiguedadForm != '' && form3.diasAdicionalesForm != '') {
        this.InsertarRegimen(form1, form2, form3)
      }
    }
    else {
      this.InsertarRegimen(form1, form2, form3)
    }
  }

  // METODO PARA LEER DATOS DE REGIMEN LABORAL
  InsertarRegimen(form1: any, form2: any, form3: any) {

    // OBTENER ID DEL PAIS SELECCIONADO
    let pais: number = 0;
    this.paises.forEach((obj: any) => {
      if (obj.nombre === form1.nombrePaisForm.toUpperCase()) {
        pais = obj.id
      }
    });

    if (pais === undefined) {
      this.toastr.warning('País ingresado no es correcto. Verificar selección.', '', {
        timeOut: 6000
      })
    }
    else {
      // LECTURA PARA INGRESAR DATOS
      let regimen = {
        id: this.idRegimen,
        id_pais: pais,
        descripcion: form1.nombreForm,
        mes_periodo: parseFloat(form1.mesesForm),
        dias_mes: parseFloat(form1.diasForm),
        trabajo_minimo_mes: 0,
        trabajo_minimo_horas: 0,
        continuidad_laboral: form1.continuidadForm,

        vacacion_dias_laboral: parseFloat(form2.diasLaborablesForm),
        vacacion_dias_libre: parseFloat(form2.diasLibresForm),
        vacacion_dias_calendario: parseFloat(form2.diasCalendarioForm),
        acumular: form2.acumularForm,
        dias_max_acumulacion: 0,
        vacacion_divisible: form2.periodosForm,

        antiguedad: form3.antiguedadActivaForm,
        antiguedad_fija: this.fija,
        anio_antiguedad: 0,
        dias_antiguedad: 0,
        antiguedad_variable: this.variableF,

        vacacion_dias_calendario_mes: form3.diasMesCalendarioForm,
        vacacion_dias_laboral_mes: form3.diasMesLaborableForm,
        calendario_dias: form3.dias_CalendarioForm,
        laboral_dias: form3.dias_LaborableForm,
        meses_calculo: form3.meses_calculoForm,
        user_name: this.user_name,
        ip: this.ip, ip_local: this.ips_locales,
      };

      this.ValidarInformacion(form1, form2, form3, regimen);
      this.FuncionInsertarDatos(regimen, form2, form3);
    }

  }

  ValidarInformacion(form1: any, form2: any, form3: any, regimen: any) {
    if (form1.mesesForm === '') {
      regimen.mes_periodo = 0;
    }
    if (this.meses_ === true) {
      regimen.trabajo_minimo_mes = parseFloat(form1.minimoMesForm);
    }
    if (this.horas_ === true) {
      regimen.trabajo_minimo_horas = parseFloat(form1.minimoHorasForm);
    }

    if (form2.diasLaborablesForm === '') {
      regimen.vacacion_dias_laboral = 0;
    }
    if (form2.diasLibresForm === '') {
      regimen.vacacion_dias_libre = 0;
    }
    if (form2.diasCalendarioForm === '') {
      regimen.vacacion_dias_calendario = 0;
    }
    if (regimen.acumular === true) {
      regimen.dias_max_acumulacion = parseFloat(form2.diasAcumulacionForm);
    }

    if (this.fija === true) {
      regimen.anio_antiguedad = parseFloat(form3.aniosAntiguedadForm);
      regimen.dias_antiguedad = parseFloat(form3.diasAdicionalesForm);
    }

  }

  // METODO PARA GUARDAR DATOS DE REGISTRO DE REGIMEN EN BASE DE DATOS
  FuncionInsertarDatos(regimen: any, form2: any, form3: any) {
    this.rest.ActualizarRegimen(regimen).subscribe(registro => {
      this.toastr.success('Operación exitosa. Registro guardado.', '', {
        timeOut: 6000,
      });
      // VALIDAR INGRESO DE DATOS DE PERIODO DE VACACIONES
      this.LeerDatosPeriodo(form2, this.idRegimen);

      // VALIDAR INGRESO DE DATOS DE ANTIGUEDAD DE VACACIONES
      this.LeerDatosAntiguedad(form3, this.idRegimen);

      this.CerrarVentana(2);

    }, error => {
      this.toastr.error('Ups!!! algo salio mal.', '', {
        timeOut: 6000,
      })
    });
  }


  /** ***************************************************************************************************** **
   ** **                         REGISTRAR VACACIONES POR PERIODOS                                       ** **
   ** ***************************************************************************************************** **/

  // LEER DATOS DE REGISTRO DE PERIODO DE VACACIONES
  LeerDatosPeriodo(form2: any, regimen: number) {
    let periodo = {
      id_regimen: regimen,
      descripcion: '',
      dias_vacacion: 0,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
    }
    this.GuardarBDDPeriodo(periodo, form2);
  }

  // VALIDACIONES DE INGRESO, ACTUALIZACION O ELIMINACION DE REGISTRO DE PERIODO DE VACACIONES
  GuardarBDDPeriodo(periodo: any, form2: any) {
    // VALIDAR EXISTENCIA DE DATOS CONSULTADOS DEL REGISTRO
    // -------------------------------------------------- SIN REGISTROS PREVIOS
    if (this.periodo.length === 0) {
      // VALIDAR SI EXISTEN REGISTROS O NO DE PERIODO DE VACACIONES
      if (this.periodo_uno === true) {
        // SI EL REGISTRO NO EXISTE GUARDAR EL REGISTRO
        this.GuardarPeriodo(periodo, form2.periodoUnoForm, 'Primer periodo');
      }

      if (this.periodo_dos === true) {
        this.GuardarPeriodo(periodo, form2.periodoDosForm, 'Segundo periodo');
      }

      if (this.periodo_tres === true) {
        this.GuardarPeriodo(periodo, form2.periodoTresForm, 'Tercer periodo');
      }
    }

    // -------------------------------------------------- UN REGISTRO PREVIO
    if (this.periodo.length === 1) {
      if (this.periodo_uno === true) {
        // SI EL REGISTRO SI EXISTIA SE ACTUALIZA EL REGISTRO
        this.ActualizarPeriodo(periodo, form2.periodoUnoForm, 'Primer periodo', this.periodo[0].id);
      }
      else {
        // SI EL REGISTRO EXISTIA PERO FUE RETIRADO ELIMINAR DE LA BASE DE DATOS
        this.EliminarBDDPeriodo(this.periodo[0].id)
      }

      if (this.periodo_dos === true) {
        this.GuardarPeriodo(periodo, form2.periodoDosForm, 'Segundo periodo');
      }

      if (this.periodo_tres === true) {
        this.GuardarPeriodo(periodo, form2.periodoTresForm, 'Tercer periodo');
      }
    }

    // -------------------------------------------------- DOS REGISTROS PREVIOS
    if (this.periodo.length === 2) {
      if (this.periodo_uno === true) {
        this.ActualizarPeriodo(periodo, form2.periodoUnoForm, 'Primer periodo', this.periodo[0].id);
      }
      else {
        this.EliminarBDDPeriodo(this.periodo[0].id)
      }

      if (this.periodo_dos === true) {
        this.ActualizarPeriodo(periodo, form2.periodoDosForm, 'Segundo periodo', this.periodo[1].id);
      }
      else {
        this.EliminarBDDPeriodo(this.periodo[1].id)
      }

      if (this.periodo_tres === true) {
        this.GuardarPeriodo(periodo, form2.periodoTresForm, 'Tercer periodo');
      }
    }

    // -------------------------------------------------- TRES REGISTROS PREVIOS
    if (this.periodo.length === 3) {
      if (this.periodo_uno === true) {
        this.ActualizarPeriodo(periodo, form2.periodoUnoForm, 'Primer periodo', this.periodo[0].id);
      }
      else {
        this.EliminarBDDPeriodo(this.periodo[0].id)
      }

      if (this.periodo_dos === true) {
        this.ActualizarPeriodo(periodo, form2.periodoDosForm, 'Segundo periodo', this.periodo[1].id);
      }
      else {
        this.EliminarBDDPeriodo(this.periodo[1].id)
      }

      if (this.periodo_tres === true) {
        this.ActualizarPeriodo(periodo, form2.periodoTresForm, 'Tercer periodo', this.periodo[2].id);
      }
      else {
        this.EliminarBDDPeriodo(this.periodo[2].id)
      }
    }
  }

  // METODO PARA GUARDAR EN BASE DE DATOS REGISTRO DE PERIODOS DE VACACIONES
  GuardarPeriodo(periodo: any, form2: any, descripcion: string) {
    periodo.descripcion = descripcion;
    periodo.dias_vacacion = parseFloat(form2);
    this.rest.CrearNuevoPeriodo(periodo).subscribe(registro => {
    }, error => {
      this.toastr.error('Ups!!! algo salio mal en periodo de vacaciones.', '', {
        timeOut: 6000,
      })
    });
  }

  // METODO PARA GUARDAR EN BASE DE DATOS REGISTRO DE PERIODOS DE VACACIONES
  ActualizarPeriodo(periodo: any, form2: any, descripcion: string, id: number) {
    periodo.id = id;
    periodo.descripcion = descripcion;
    periodo.dias_vacacion = parseFloat(form2);
    this.rest.ActualizarPeriodo(periodo).subscribe(registro => {
    }, error => {
      this.toastr.error('Ups!!! algo salio mal en periodo de vacaciones.', '', {
        timeOut: 6000,
      })
    });
  }

  // METODO PARA ELIMINAR DE BASE DE DATOS REGISTRO DE PERIODOS DE VACACIONES
  EliminarBDDPeriodo(id: number) {
    const datos = {
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
    };

    this.rest.EliminarPeriodo(id, datos).subscribe(registro => {
    }, error => {
      this.toastr.error('Ups!!! algo salio mal en periodo de vacaciones.', '', {
        timeOut: 6000,
      })
    });
  }

  /** ***************************************************************************************************** **
   ** **                           REGISTRAR ANTIGUEDAD EN VACACIONES                                    ** **
   ** ***************************************************************************************************** **/

  // METODO PARA LEER DATOS DE ANTIGUEDAD DE VACACIONES
  LeerDatosAntiguedad(form3: any, regimen: number) {
    var antiguedad = {
      anio_desde: 0,
      anio_hasta: 0,
      dias_antiguedad: 0,
      id_regimen: regimen,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
    }
    this.RegistrarBDDAntiguedad(antiguedad, form3);
  }

  // VERIFICAR SI SE REGISTRA, ACTUALIZA O ELIMINA UN REGISTRO DE ANTIGUEDAD
  RegistrarBDDAntiguedad(antiguedad: any, form3: any) {
    // VERIFICAR SI EXISTE REGISTROS DE ANTIGUEDAD
    // -------------------------------------------------- SIN REGISTROS PREVIOS
    if (this.data_antiguo.length === 0) {
      // VERIFICAR SI SE REGISTRA ANTIGUEDAD DE VACACIONES
      if (this.antiguo_uno === true) {
        // SI EL REGISTRO NO EXISTIA SE GUARDA REGISTRO
        this.GuardarAntiguedad(antiguedad, form3.desde_unoForm, form3.hasta_unoForm, form3.vacaciones_unoForm);
      }

      if (this.antiguo_dos === true) {
        this.GuardarAntiguedad(antiguedad, form3.desde_dosForm, form3.hasta_dosForm, form3.vacaciones_dosForm);
      }

      if (this.antiguo_tres === true) {
        this.GuardarAntiguedad(antiguedad, form3.desde_tresForm, form3.vacaciones_tresForm, form3.hasta_tresForm);
      }

      if (this.antiguo_cuatro === true) {
        this.GuardarAntiguedad(antiguedad, form3.desde_cuatroForm, form3.hasta_cuatroForm, form3.vacaciones_cuatroForm);
      }
    }

    // -------------------------------------------------- UN REGISTRO PREVIO
    if (this.data_antiguo.length === 1) {
      if (this.antiguo_uno === true) {
        // SI EL REGISTRO EXISTE SE ACTUALIZA EL REGISTRO
        this.ActualizarAntiguedad(antiguedad, form3.desde_unoForm, form3.hasta_unoForm, form3.vacaciones_unoForm, this.data_antiguo[0].id);
      }
      else {
        // SI EL REGISTRO FUE RETIRADO SE ELIMINA DE LA BASE DE DATOS
        this.EliminarBDDAntiguedad(this.data_antiguo[0].id)
      }

      if (this.antiguo_dos === true) {
        this.GuardarAntiguedad(antiguedad, form3.desde_dosForm, form3.hasta_dosForm, form3.vacaciones_dosForm);
      }

      if (this.antiguo_tres === true) {
        this.GuardarAntiguedad(antiguedad, form3.desde_tresForm, form3.hasta_tresForm, form3.vacaciones_tresForm,);
      }

      if (this.antiguo_cuatro === true) {
        this.GuardarAntiguedad(antiguedad, form3.desde_cuatroForm, form3.hasta_cuatroForm, form3.vacaciones_cuatroForm);
      }
    }

    // -------------------------------------------------- DOS REGISTROS PREVIOS
    if (this.data_antiguo.length === 2) {
      if (this.antiguo_uno === true) {
        this.ActualizarAntiguedad(antiguedad, form3.desde_unoForm, form3.hasta_unoForm, form3.vacaciones_unoForm, this.data_antiguo[0].id);
      }
      else {
        this.EliminarBDDAntiguedad(this.data_antiguo[0].id)
      }

      if (this.antiguo_dos === true) {
        this.ActualizarAntiguedad(antiguedad, form3.desde_dosForm, form3.hasta_dosForm, form3.vacaciones_dosForm, this.data_antiguo[1].id);
      } else {
        this.EliminarBDDAntiguedad(this.data_antiguo[1].id)
      }

      if (this.antiguo_tres === true) {
        this.GuardarAntiguedad(antiguedad, form3.desde_tresForm, form3.hasta_tresForm, form3.vacaciones_tresForm,);
      }

      if (this.antiguo_cuatro === true) {
        this.GuardarAntiguedad(antiguedad, form3.desde_cuatroForm, form3.hasta_cuatroForm, form3.vacaciones_cuatroForm);
      }
    }

    // -------------------------------------------------- TRES REGISTROS PREVIOS
    if (this.data_antiguo.length === 3) {
      if (this.antiguo_uno === true) {
        this.ActualizarAntiguedad(antiguedad, form3.desde_unoForm, form3.hasta_unoForm, form3.vacaciones_unoForm, this.data_antiguo[0].id);
      }
      else {
        this.EliminarBDDAntiguedad(this.data_antiguo[0].id)
      }

      if (this.antiguo_dos === true) {
        this.ActualizarAntiguedad(antiguedad, form3.desde_dosForm, form3.hasta_dosForm, form3.vacaciones_dosForm, this.data_antiguo[1].id);
      } else {
        this.EliminarBDDAntiguedad(this.data_antiguo[1].id)
      }

      if (this.antiguo_tres === true) {
        this.ActualizarAntiguedad(antiguedad, form3.desde_tresForm, form3.hasta_tresForm, form3.vacaciones_tresForm, this.data_antiguo[2].id);
      }
      else {
        this.EliminarBDDAntiguedad(this.data_antiguo[2].id)
      }

      if (this.antiguo_cuatro === true) {
        this.GuardarAntiguedad(antiguedad, form3.desde_cuatroForm, form3.hasta_cuatroForm, form3.vacaciones_cuatroForm);
      }
    }

    // -------------------------------------------------- CUATRO REGISTROS PREVIOS
    if (this.data_antiguo.length === 4) {
      if (this.antiguo_uno === true) {
        this.ActualizarAntiguedad(antiguedad, form3.desde_unoForm, form3.hasta_unoForm, form3.vacaciones_unoForm, this.data_antiguo[0].id);
      }
      else {
        this.EliminarBDDAntiguedad(this.data_antiguo[0].id)
      }

      if (this.antiguo_dos === true) {
        this.ActualizarAntiguedad(antiguedad, form3.desde_dosForm, form3.hasta_dosForm, form3.vacaciones_dosForm, this.data_antiguo[1].id);
      } else {
        this.EliminarBDDAntiguedad(this.data_antiguo[1].id)
      }

      if (this.antiguo_tres === true) {
        this.ActualizarAntiguedad(antiguedad, form3.desde_tresForm, form3.hasta_tresForm, form3.vacaciones_tresForm, this.data_antiguo[2].id);
      }
      else {
        this.EliminarBDDAntiguedad(this.data_antiguo[2].id)
      }

      if (this.antiguo_cuatro === true) {
        this.ActualizarAntiguedad(antiguedad, form3.desde_cuatroForm, form3.hasta_cuatroForm, form3.vacaciones_cuatroForm, this.data_antiguo[3].id);
      }
      else {
        this.EliminarBDDAntiguedad(this.data_antiguo[3].id)
      }
    }
  }

  // METODO PARA GUARDAR EN BASE DE DATOS REGISTRO DE ANTIGUEDAD DE VACACIONES
  GuardarAntiguedad(antiguedad: any, desde: any, hasta: any, vacacion: any) {
    antiguedad.anio_desde = parseFloat(desde);
    antiguedad.anio_hasta = parseFloat(hasta);
    antiguedad.dias_antiguedad = parseFloat(vacacion);
    this.rest.CrearNuevaAntiguedad(antiguedad).subscribe(registro => {
    }, error => {
      this.toastr.error('Ups!!! algo salio mal en antiguedad de vacaciones.', '', {
        timeOut: 6000,
      })
    });
  }

  // METODO PARA ACTUALIZAR EN BASE DE DATOS REGISTRO DE ANTIGUEDAD DE VACACIONES
  ActualizarAntiguedad(antiguedad: any, desde: any, hasta: any, vacacion: any, id: number) {
    antiguedad.id = id;
    antiguedad.anio_desde = parseFloat(desde);
    antiguedad.anio_hasta = parseFloat(hasta);
    antiguedad.dias_antiguedad = parseFloat(vacacion);
    this.rest.ActualizarAntiguedad(antiguedad).subscribe(registro => {
    }, error => {
      this.toastr.error('Ups!!! algo salio mal en antiguedad de vacaciones.', '', {
        timeOut: 6000,
      })
    });
  }

  // METODO PARA ELIMINAR DE BASE DE DATOS REGISTRO DE ANTIGUEDAD DE VACACIONES
  EliminarBDDAntiguedad(id: number) {
    const datos = {
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
    };

    this.rest.EliminarAntiguedad(id, datos).subscribe(registro => {
    }, error => {
      this.toastr.error('Ups!!! algo salio mal en antiguedad de vacaciones.', '', {
        timeOut: 6000,
      })
    });
  }


  // METODO PARA VALIDAR INGRESO DE NUMEROS
  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

  // METODO PARA LIMPIAR CAMPOS DE FORMULARIO
  LimpiarFormulario(campo: any, limpiar: string) {
    campo.setValue(limpiar);
  }

  // CERRAR VENTANA DE REGISTRO
  CerrarVentana(opcion: number) {
    this.componentel.ver_editar = false;
    if (opcion === 1 && this.pagina === 'lista-regimen') {
      this.componentel.ver_lista = true;
    }
    else if (opcion === 2 && this.pagina === 'lista-regimen') {
      this.componentel.VerDatosRegimen(this.idRegimen);
    }
    else if (opcion === 1 && this.pagina === 'ver-regimen') {
      this.componentel.ver_datos = true;
    }
    else if (opcion === 2 && this.pagina === 'ver-regimen') {
      this.componentel.VerDatosRegimen(this.idRegimen);
    }
  }
}
