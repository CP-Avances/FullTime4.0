import { FormGroup, FormControl, FormBuilder, FormArray, Validators } from '@angular/forms';
import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
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
  selector: 'app-regimen',
  standalone: false,
  templateUrl: './regimen.component.html',
  styleUrls: ['./regimen.component.css'],
})

export class RegimenComponent implements AfterViewInit, OnInit {
  ips_locales: any = '';

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
  horaEstandarF = new FormControl('');
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
  antiguedadActivaF = new FormControl(false);
  aniosAntiguedadF = new FormControl('');
  maximoAntiguedadF = new FormControl(0);
  diasAdicionalesF = new FormControl('');
  meses_calculoF = new FormControl('');
  antiguedadF = new FormControl('');
  calculoF = new FormControl(false);
  variableF: boolean = false;

  // CALCULOS DE VACACIONES
  diasMesCalendarioF = new FormControl('');
  diasMesLaborableF = new FormControl('');
  dias_CalendarioF = new FormControl('');
  dias_LaborableF = new FormControl('');

  // TRATAMIENTO DE FORMULARIO DE ANTIGUEDAD
  antiguedadFormu: FormGroup;
  get rangosAntiguedad(): FormArray {
    return this.antiguedadFormu.get('rangosAntiguedad') as FormArray;
  }

  constructor(
    private rest: RegimenService,
    private pais: ProvinciaService,
    private toastr: ToastrService,
    private formulario: FormBuilder,
    private antiguedadFormulario: FormBuilder,
    public cambio: ChangeDetectorRef,
    public validar: ValidacionesService,
    public componentl: ListarRegimenComponent,
  ) {


  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });

    this.ObtenerPaises();
    this.ObtenerRegimen();
    this.ValidarFormulario();
  }

  ngAfterViewInit() {
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
      horaEstandarForm: this.horaEstandarF,
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
      antiguedadActivaForm: this.antiguedadActivaF,
      maximoAntiguedadForm: this.maximoAntiguedadF,
      aniosAntiguedadForm: this.aniosAntiguedadF,
      diasAdicionalesForm: this.diasAdicionalesF,
      meses_calculoForm: this.meses_calculoF,
      antiguedadForm: this.antiguedadF,
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

  // METODO PARA VALIDAR INGRESO DE MESES
  validarMeses(formulario: any) {
    var valor: any = '1';

    if (formulario === 1) {
      valor = this.mesesF.value;
    }
    else {
      valor = this.meses_calculoF.value;
    }

    if (valor == null) return; // NO HACE NADA SI NO HAY VALOR AUN
    if (parseInt(valor) < 1) {
      if (formulario === 1) {
        this.mesesF.setValue('1');
      }
      else {
        this.meses_calculoF.setValue('1');
      }
    }
    else if (parseInt(valor) > 12) {
      if (formulario === 1) {
        this.mesesF.setValue('12');
      }
      else {
        this.meses_calculoF.setValue('12');
      }
    }
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
    var valor = event.target as HTMLInputElement;
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

  // METODO PARA CREAR INPUTS PARA INGRESAR ANTIGUEDAD
  CrearRango(): FormGroup {
    return this.antiguedadFormulario.group({
      anio_desde: [null, Validators.required],
      anio_hasta: [null, Validators.required],
      dias_adicionales: [null, Validators.required]
    });
  }

  // METODO PARA AGREGAR UN NUEVO REGISTRO DE ANTIGUEDAD VARIABLE
  AgregarRango(): void {
    this.rangosAntiguedad.push(this.CrearRango());
  }

  // METODO PARA ELIMINAR UNO DE LOS RANGOS DE ANTIGUEDAD INGRESADOS
  eliminarRango(index: number): void {
    this.correcto_antiguo = false;
    this.escritura_antiguo = false;
    this.rangosAntiguedad.removeAt(index);
  }

  // METODO PARA VERIFICAR RANGOS DE ANTIGUEDAD
  verificarRangos(): boolean {
    const rangos = this.rangosAntiguedad.controls.map(control => control.value);

    for (let i = 0; i < rangos.length; i++) {
      const r = {
        anio_desde: Number(rangos[i].anio_desde),
        anio_hasta: Number(rangos[i].anio_hasta),
        dias_adicionales: Number(rangos[i].dias_adicionales)
      };

      if (
        isNaN(r.anio_desde) || isNaN(r.anio_hasta) || isNaN(r.dias_adicionales)
      ) {
        this.toastr.warning(`Completa todos los campos en el rango ${i + 1}.`);
        return false;
      }

      if (r.anio_hasta <= r.anio_desde) {
        this.toastr.warning(`"Años hasta" debe ser mayor que "desde" en el rango ${i + 1}.`);
        return false;
      }

      // VERIFICAR CRUCE CON OTROS RANGOS
      for (let j = 0; j < rangos.length; j++) {
        if (i === j) continue;

        const otro = {
          anio_desde: Number(rangos[j].anio_desde),
          anio_hasta: Number(rangos[j].anio_hasta)
        };

        // SI SE CRUZAN LOS RANGOS
        const seCruzan =
          (r.anio_desde >= otro.anio_desde && r.anio_desde <= otro.anio_hasta) ||
          (r.anio_hasta >= otro.anio_desde && r.anio_hasta <= otro.anio_hasta) ||
          (r.anio_desde <= otro.anio_desde && r.anio_hasta >= otro.anio_hasta);

        if (seCruzan) {
          this.toastr.warning(`El rango ${i + 1} se cruza con el rango ${j + 1}.`);
          return false;
        }
      }
    }
    return true;
  }

  // METODO PARA VALIDAR LA INFORMACION INGRESADA
  datosAntiguedad: any = [];
  ValidarAntiguedad(): void {
    this.validar_antiguo = true;
    this.correcto_antiguo = false;
    this.escritura_antiguo = false;
    if (this.verificarRangos()) {
      this.datosAntiguedad = this.antiguedadFormu.value.rangosAntiguedad;
      //console.log('Datos válidos:', this.datosAntiguedad);
      this.AgregarRango();
    }
  }

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
      this.antiguedadFormu = this.antiguedadFormulario.group({
        rangosAntiguedad: this.antiguedadFormulario.array([this.CrearRango()])
      });
      this.variable = true;
      this.variableF = true;
      this.validar_antiguo = true;
      this.escritura_antiguo = false;
      this.LimpiarAntiguedad();
    }
  }

  // METODO PARA RESTABLECER SELECCION DE ANTIGUEDAD
  LimpiarAntiguedad() {
    this.datosAntiguedad = [];
  }

  // METODO PARA EDITAR REGISTRO DE ANTIGUEDAD
  EditarAntiguedad() {
    this.correcto_antiguo = false;
    this.validar_antiguo = true;
    this.escritura_antiguo = false;
  }

  // VERIFICAR QUE LOS REGISTROS DE ANTIGUEDAD CUMPLAN CON LAS CONDICIONES
  VerificarAntiguedad(form3: any) {
    if (this.verificarRangos()) {
      this.datosAntiguedad = this.antiguedadFormu.value.rangosAntiguedad;
      //console.log('Datos válidos:', this.datosAntiguedad);
      this.AsignarValidaciones(form3);
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

  // VALIDAR DATOS INGRESADOS
  ValidarDatos(form1: any, form2: any, form3: any) {
    if (form3.antiguedadActivaForm === true && form3.antiguedadForm === 'fija') {
      if (form3.aniosAntiguedadForm != '' && form3.diasAdicionalesForm != '') {
        this.InsertarRegimen(form1, form2, form3);
      }
    }
    else {
      this.InsertarRegimen(form1, form2, form3);
    }
  }

  // METODO PARA LEER DATOS DE REGIMEN LABORAL
  InsertarRegimen(form1: any, form2: any, form3: any) {
    // OBTENER ID DEL PAIS SELECCIONADO
    let pais: number = 0;
    this.paises.forEach((obj: any) => {
      if (obj.nombre === form1.nombrePaisForm.toUpperCase()) {
        pais = obj.id;
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
        id_pais: pais,
        descripcion: form1.nombreForm,
        mes_periodo: parseFloat(form1.mesesForm),
        dias_mes: parseFloat(form1.diasForm),
        trabajo_minimo_mes: 0,
        trabajo_minimo_horas: 0,
        continuidad_laboral: form1.continuidadForm,
        horaEstandar: form1.horaEstandarForm,

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
        maximo_antiguedad: 0,
        antiguedad_variable: this.variableF,

        vacacion_dias_calendario_mes: form3.diasMesCalendarioForm,
        vacacion_dias_laboral_mes: form3.diasMesLaborableForm,
        calendario_dias: form3.dias_CalendarioForm,
        laboral_dias: form3.dias_LaborableForm,
        meses_calculo: form3.meses_calculoForm,

        user_name: this.user_name,
        ip: this.ip,
        ip_local: this.ips_locales
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
      regimen.maximo_antiguedad = parseInt(form3.maximoAntiguedadForm);
    }

  }

  // METODO PARA GUARDAR DATOS DE REGISTRO DE REGIMEN EN BASE DE DATOS
  FuncionInsertarDatos(regimen: any, form2: any, form3: any) {
    this.rest.CrearNuevoRegimen(regimen).subscribe(registro => {
      // VALIDAR SI EXISTEN ERRORES EN LOS DATOS
      if (registro.message === 'error') {
        this.toastr.error('Verificar que el nombre de regimen no se encuentre ya registrado o verificar que los datos numéricos no contengan letras.', '', {
          timeOut: 6000,
        });
      }
      // REGISTROS GUARDADO
      else {
        this.toastr.success('Operación exitosa. Registro guardado.', '', {
          timeOut: 6000,
        });
        // VALIDAR INGRESO DE DATOS DE PERIODO DE VACACIONES
        if (this.correcto_periodo === true) {
          this.LeerDatosPeriodo(form2, registro.id);
        }
        // VALIDAR INGRESO DE DATOS DE ANTIGUEDAD DE VACACIONES
        if (this.correcto_antiguo === true) {
          this.LeerDatosAntiguedad(registro.id);
        }
        this.CerrarVentana(2, registro.id);
      }
    }, error => {
      this.toastr.error('Ups! algo salio mal.', '', {
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
      ip: this.ip,
      ip_local: this.ips_locales
    }

    if (this.periodo_uno === true) {
      periodo.descripcion = 'Primer periodo';
      periodo.dias_vacacion = parseFloat(form2.periodoUnoForm);
      this.GuardarPeriodo(periodo);
    }

    if (this.periodo_dos === true) {
      periodo.descripcion = 'Segundo periodo';
      periodo.dias_vacacion = parseFloat(form2.periodoDosForm);
      this.GuardarPeriodo(periodo);
    }

    if (this.periodo_tres === true) {
      periodo.descripcion = 'Tercer periodo';
      periodo.dias_vacacion = parseFloat(form2.periodoTresForm);
      this.GuardarPeriodo(periodo);
    }
  }

  // METODO PARA GUARDAR EN BASE DE DATOS REGISTRO DE PERIODOS DE VACACIONES
  GuardarPeriodo(periodo: any) {
    this.rest.CrearNuevoPeriodo(periodo).subscribe(registro => {
    }, error => {
      this.toastr.error('Ups! algo salio mal en periodo de vacaciones.', '', {
        timeOut: 6000,
      })
    });
  }

  /** ***************************************************************************************************** **
   ** **                           REGISTRAR ANTIGUEDAD EN VACACIONES                                    ** **
   ** ***************************************************************************************************** **/

  // METODO PARA LEER DATOS DE ANTIGUEDAD DE VACACIONES
  LeerDatosAntiguedad(regimen: number) {
    var antiguedad = {
      anio_desde: 0,
      anio_hasta: 0,
      dias_antiguedad: 0,
      id_regimen: regimen,
      user_name: this.user_name,
      ip: this.ip,
      ip_local: this.ips_locales
    }
    this.datosAntiguedad.forEach((a: any) => {
      //console.log('ver -- ', a.anio_desde)
      antiguedad.anio_desde = parseInt(a.anio_desde);
      antiguedad.anio_hasta = parseInt(a.anio_hasta);
      antiguedad.dias_antiguedad = parseInt(a.dias_adicionales);
      this.GuardarAntiguedad(antiguedad);
    })
  }

  // METODO PARA GUARDAR EN BASE DE DATOS REGISTRO DE ANTIGUEDAD DE VACACIONES
  GuardarAntiguedad(antiguedad: any) {
    this.rest.CrearNuevaAntiguedad(antiguedad).subscribe(registro => {
    }, error => {
      this.toastr.error('Ups! algo salio mal en antiguedad de vacaciones.', '', {
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
  CerrarVentana(opcion: number, datos: any) {
    this.componentl.ver_registrar = false;
    if (opcion === 1) {
      this.componentl.ver_lista = true;
    }
    else {
      this.componentl.VerDatosRegimen(datos);
    }
  }

}
