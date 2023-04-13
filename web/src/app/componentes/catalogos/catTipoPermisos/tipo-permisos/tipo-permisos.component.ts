import { Validators, FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

import { TipoPermisosService } from 'src/app/servicios/catalogos/catTipoPermisos/tipo-permisos.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { Router } from '@angular/router';

// TIPO DE DESCUENTO
interface TipoDescuentos {
  value: string;
  viewValue: string;
}

// TIPOS DE PERMISOS
interface opcionesPermisos {
  valor: string;
  nombre: string
}

// SOLICITAR USUARIO
interface opcionesSolicitud {
  valor: number;
  nombre: string
}

// PERMISO POR HORAS - DIAS
interface opcionesDiasHoras {
  valor: string;
  nombre: string
}

@Component({
  selector: 'app-tipo-permisos',
  templateUrl: './tipo-permisos.component.html',
  styleUrls: ['./tipo-permisos.component.css'],
})

export class TipoPermisosComponent implements OnInit {

  // DEFINIR TIPO DE DESCUENTOS
  descuentos: TipoDescuentos[] = [
    { value: '1', viewValue: 'Vacaciones' },
    { value: '2', viewValue: 'Ninguno' },
  ];

  // DEFINIR ACCESO USUARIO
  solicitudes: opcionesSolicitud[] = [
    { valor: 1, nombre: 'Si' },
    { valor: 2, nombre: 'No' },
  ];

  // DEFINIR DIAS - HORAS
  diasHoras: opcionesDiasHoras[] = [
    { valor: 'Dias', nombre: 'Dias' },
    { valor: 'Horas', nombre: 'Horas' },
  ];

  validarGuardar: boolean = false;

  // ARREGLO DE OPCIONES DE PERMISOS EXISTENTES
  permisos: opcionesPermisos[] = [
    { valor: 'Seleccionar', nombre: 'Seleccionar' },
    { valor: 'Asuntos Personales', nombre: 'Asuntos Personales' },
    { valor: 'Calamidad Doméstica', nombre: 'Calamidad Doméstica' },
    { valor: 'Cita Médica', nombre: 'Cita Médica' },
    { valor: 'Enfermedad', nombre: 'Enfermedad' },
    { valor: 'Estudios', nombre: 'Estudios' },
    { valor: 'Maternidad', nombre: 'Maternidad' },
    { valor: 'Paternidad', nombre: 'Paternidad' },
    { valor: 'Sufragio', nombre: 'Sufragio' },
    { valor: 'OTRO', nombre: 'OTRO' },
  ];
  seleccionarPermiso: string = this.permisos[0].valor;

  // FORMULARIOS
  isLinear = true;
  primeroFormGroup: FormGroup;
  segundoFormGroup: FormGroup;
  tercerFormGroup: FormGroup;

  constructor(
    private rest: TipoPermisosService,
    private toastr: ToastrService,
    private validar: ValidacionesService,
    private _formBuilder: FormBuilder,
    public router: Router,
  ) { }

  // CONTROLES DE CAMPOS OCULTOS
  HabilitarJustifica: boolean = true;
  HabilitarHoras: boolean = true;
  HabilitarOtro: boolean = true;
  HabilitarDias: boolean = true;

  ngOnInit(): void {
    this.ValidarFormulario();
  }

  // METODO PARA VALIDAR FORMULARIO
  ValidarFormulario() {
    this.primeroFormGroup = this._formBuilder.group({
      nombreForm: [''],
      diasHorasForm: ['', Validators.required],
      descripcionForm: ['', Validators.required],
      acceEmpleadoForm: ['', Validators.required],
      numDiaMaximoForm: [''],
      numHoraMaximoForm: [''],
      numDiaIngresoForm: ['', Validators.required],
      tipoDescuentoForm: ['', Validators.required],
    });
    this.segundoFormGroup = this._formBuilder.group({
      fechaForm: [''],
      feriadosForm: [false],
      documentoForm: [''],
      legalizarForm: ['', Validators.required],
      fecValidarForm: ['', Validators.required],
      almuIncluirForm: ['', Validators.required],
      numDiaJustificaForm: [''],
      geneJustificacionForm: ['', Validators.required],
      /**
         start: [null],
      end: [null],
       */
    });
    this.tercerFormGroup = this._formBuilder.group({
      correo_crearForm: [false],
      correo_editarForm: [false],
      correo_eliminarForm: [false],
      correo_negarForm: [false],
      correo_autorizarForm: [false],
      correo_preautorizarForm: [false],
      correo_legalizarForm: [false],
    });
  }

  /*  range = new FormGroup({
      start: new FormControl(null),
      end: new FormControl(null),
    });
  */
 
  // METODO PARA ACTIVAR CAMPO NOMBRE
  ActivarDesactivarNombre(form1: any) {
    var nombreTipoPermiso = form1.descripcionForm;
    if (nombreTipoPermiso === 'OTRO') {
      this.HabilitarOtro = false;
      this.toastr.info('Ingresar nombre del nuevo tipo de permiso.', 'Etiqueta Descripción activa.', {
        timeOut: 6000,
      })
    }
    else if (nombreTipoPermiso === 'Seleccionar') {
      this.LimpiarCampoNombre();
      this.HabilitarOtro = true;
      this.toastr.info('No ha seleccionado ninguna opción.', '', {
        timeOut: 6000,
      });
    }
    else {
      this.LimpiarCampoNombre();
      this.HabilitarOtro = true;
    }
  }

  // METODO PARA LIMPIAR CAMPO NOMBRE
  LimpiarCampoNombre() {
    this.primeroFormGroup.patchValue({
      nombreForm: '',
    });
  }

  // METODO PARA CONTROLAR ACTIVACION DE INGRESO DE JUSTIFICACION
  ActivarJustificacion() {
    if ((<HTMLInputElement>document.getElementById('si')).value = 'true') {
      this.HabilitarJustifica = false;
      this.toastr.info('Ingresar número de días para presentar justificación', '', {
        timeOut: 6000,
      })
    }
  }

  // METODO PARA CONTROLAR DESACTIVACION DE INGRESO DE JUSTIFICACION
  DesactivarJustificacion() {
    if ((<HTMLInputElement>document.getElementById('no')).value = 'false') {
      this.HabilitarJustifica = true;
      this.segundoFormGroup.patchValue({
        numDiaJustificaForm: '',
      })
    }
  }

  // METODO PARA SOLICITAR INGRESO DE JUSTIFICACION
  VerificarJustificacion(form1: any, datos: any, form2: any) {
    if (datos.num_dia_justifica === '' && datos.gene_justificacion === 'true') {
      this.toastr.info('Ingresar número de días para presentar justificación.', '', {
        timeOut: 6000,
      })
    }
    else if (datos.num_dia_justifica != '' && datos.gene_justificacion === 'true') {
      this.VerificarIngresoFecha(form2, datos, form1);
    }
    else if (datos.num_dia_justifica === '' && datos.gene_justificacion === 'false') {
      datos.num_dia_justifica = 0;
      this.VerificarIngresoFecha(form2, datos, form1);
    }
  }

  // METODO PARA ACTIVAR DIAS - HORAS
  ActivarDiasHoras(form: any) {
    if (form.diasHorasForm === 'Dias') {
      this.primeroFormGroup.patchValue({
        numDiaMaximoForm: '',
      });
      this.HabilitarDias = false;
      this.HabilitarHoras = true;
      this.toastr.info('Ingresar número de días máximos de permiso.', '', {
        timeOut: 6000,
      });
    }
    else if (form.diasHorasForm === 'Horas') {
      this.primeroFormGroup.patchValue({
        numHoraMaximoForm: '',
      });
      this.HabilitarHoras = false;
      this.HabilitarDias = true;
      this.toastr.info('Ingresar número de horas y minutos máximos de permiso.', '', {
        timeOut: 6000,
      });
    }
  }

  // METODO PARA CAMBIAR VALORES DIAS - HORAS
  CambiarValoresDiasHoras(form: any, datos: any) {
    if (form.diasHorasForm === 'Dias') {
      if (datos.num_dia_maximo === '') {
        this.toastr.info('Ingresar número de días máximos de permiso.', '', {
          timeOut: 6000,
        });
      }
      else {
        datos.num_hora_maximo = '00:00';
        this.IngresarDatos(datos);
      }
    }
    else if (form.diasHorasForm === 'Horas') {
      if (datos.num_hora_maximo === '') {
        this.toastr.info('Ingresar número de horas y minutos máximos de permiso.', '', {
          timeOut: 6000,
        });
      }
      else {
        datos.num_dia_maximo = 0;
        this.IngresarDatos(datos);
      }
    }
  }

  // METODO PARA ACTIVAR CALENDARIO
  calendario: boolean = false;
  VerCalendario() {
    this.calendario = true;
  }

  // METODO PARA OCULTAR CALENDARIO
  OcultarCalendario() {
    this.calendario = false;
    this.segundoFormGroup.patchValue({
      fechaForm: ''
    })
  }

  // METODO PARA VERIFICAR QUE LA FECHA SEA CORRECTA
  VerificarFecha(event: any) {
    var f = moment();
    var FechaActual = f.format('YYYY-MM-DD');
    var leer_fecha = event.value._i;
    var fecha = new Date(String(moment(leer_fecha)));
    var ingreso = String(moment(fecha, "YYYY/MM/DD").format("YYYY-MM-DD"));
    if (Date.parse(ingreso) >= Date.parse(FechaActual)) {
    }
    else {
      this.toastr.info('La fecha ingresada no puede ser anterior a la fecha actual.', 'Verificar fecha.', {
        timeOut: 6000,
      });
      this.segundoFormGroup.patchValue({
        fechaForm: ''
      })
    }
  }

  // METODO PARA VERIFICAR QUE FECHA NO ESTE VACIA
  VerificarIngresoFecha(form2: any, datos: any, form1: any) {
    if (form2.fecValidarForm === 'true') {
      if (form2.fechaForm === '') {
        this.toastr.info('Ingresar fecha en la que no podrá solicitar permisos.', 'Verificar fecha.', {
          timeOut: 6000,
        });
      }
      else {
        this.CambiarValoresDiasHoras(form1, datos);
      }
    }
    else {
      if (form2.fechaForm === '') {
        datos.fecha = null;
      }
      this.CambiarValoresDiasHoras(form1, datos);
    }
  }

  // METODO PARA CAPTURAR DATOS DE FORMULARIO
  InsertarTipoPermiso(form1: any, form2: any, form3: any) {
    var nombrePermiso = form1.descripcionForm;
    var nuevoPermiso = form1.nombreForm;
    let permiso = {
      // FORMULARIO UNO
      descripcion: form1.descripcionForm,
      acce_empleado: form1.acceEmpleadoForm,
      tipo_descuento: form1.tipoDescuentoForm,
      num_dia_maximo: form1.numDiaMaximoForm,
      num_dia_ingreso: form1.numDiaIngresoForm,
      num_hora_maximo: form1.numHoraMaximoForm,

      // FORMULARIO DOS
      fecha: form2.fechaForm,
      legalizar: form2.legalizarForm,
      documento: form2.documentoForm,
      fec_validar: form2.fecValidarForm,
      almu_incluir: form2.almuIncluirForm,
      contar_feriados: form2.feriadosForm,
      num_dia_justifica: form2.numDiaJustificaForm,
      gene_justificacion: form2.geneJustificacionForm,

      // FORMULARIO TRES
      correo_crear: form3.correo_crearForm,
      correo_editar: form3.correo_editarForm,
      correo_eliminar: form3.correo_eliminarForm,
      correo_preautorizar: form3.correo_preautorizarForm,
      correo_autorizar: form3.correo_autorizarForm,
      correo_negar: form3.correo_negarForm,
      correo_legalizar: form3.correo_legalizarForm,
    }
    console.log('ver permiso ', permiso)
    if (nombrePermiso === 'OTRO') {
      if (nuevoPermiso === '') {
        this.toastr.info('Ingresar nombre del nuevo tipo de permiso.', '', {
          timeOut: 6000,
        });
      }
      else {
        permiso.descripcion = nuevoPermiso;
        this.VerificarJustificacion(form1, permiso, form2);
      }
    }
    else if (nombrePermiso === 'Seleccionar') {
      this.toastr.info('Seleccionar o definir una descripción del nuevo tipo de permiso.', '', {
        timeOut: 6000,
      });
    }
    else {
      this.VerificarJustificacion(form1, permiso, form2);
    }
  }

  // METODO PARA CREAR REGISTRO
  IngresarDatos(datos: any) {
    this.validarGuardar = true;
    this.rest.RegistrarTipoPermiso(datos).subscribe(res => {
      if (res.message === 'error') {
        this.toastr.warning('Tipo de permiso ya se encuentra registrado.', 'Ups!!! algo salio mal.', {
          timeOut: 6000,
        });
      }
      else {
        this.toastr.success('Operación exitosa.', 'Registro guardado.', {
          timeOut: 6000,
        });
        this.router.navigate(['/vistaPermiso/', res.id]);
      }
    });
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
