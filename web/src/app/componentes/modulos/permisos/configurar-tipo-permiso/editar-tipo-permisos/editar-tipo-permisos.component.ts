import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { DateTime } from 'luxon';
import { Router } from '@angular/router';

import { TipoPermisosService } from 'src/app/servicios/modulos/modulo-permisos/catTipoPermisos/tipo-permisos.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';

import { VistaElementosComponent } from '../listarTipoPermisos/vista-elementos.component';

interface TipoDescuentos {
  value: string;
  viewValue: string;
}

interface opcionesSolicitud {
  valor: number;
  nombre: string
}

interface opcionesDiasHoras {
  valor: string;
  nombre: string
}

@Component({
  selector: 'app-editar-tipo-permisos',
  standalone: false,
  templateUrl: './editar-tipo-permisos.component.html',
  styleUrls: ['./editar-tipo-permisos.component.css'],
})

export class EditarTipoPermisosComponent implements OnInit {
  ips_locales: any = '';

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // TIPOS DE DESCUENTO
  descuentos: TipoDescuentos[] = [
    { value: '1', viewValue: 'Vacaciones' },
    { value: '2', viewValue: 'Ninguno' },
  ];

  // ACCESO EMPLEADOS
  solicitudes: opcionesSolicitud[] = [
    { valor: 1, nombre: 'Si' },
    { valor: 2, nombre: 'No' },
  ];

  // TIPO DE SOLICITUD
  diasHoras: opcionesDiasHoras[] = [
    { valor: 'Dias', nombre: 'Dias' },
    { valor: 'Horas', nombre: 'Horas' },
  ];

  validarGuardar: boolean = false;

  // FORMULARIO
  isLinear = true;
  primeroFormGroup: FormGroup;
  segundoFormGroup: FormGroup;
  tercerFormGroup: FormGroup;

  // VARIABLES DE CONTROL
  HabilitarJustifica: boolean = true;

  @Input() idPermiso: number;
  @Input() pagina: string = '';

  constructor(
    private rest: TipoPermisosService,
    private toastr: ToastrService,
    private _formBuilder: FormBuilder,
    public router: Router,
    public validar: ValidacionesService,
    public componentel: VistaElementosComponent,
  ) { }

  ngOnInit(): void {

    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');  this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });

    this.ValidarFormulario();
    this.CargarDatosPermiso();
    this.ObtenerTipoPermiso();
  }

  // METODO PARA VALIDAR FORMULARIOS
  ValidarFormulario() {
    this.primeroFormGroup = this._formBuilder.group({
      diasHorasForm: ['', Validators.required],
      descripcionForm: ['', Validators.required],
      acceEmpleadoForm: ['', Validators.required],
      numDiaMaximoForm: [''],
      numHoraMaximoForm: [''],
      numDiaIngresoForm: ['', Validators.required],
      numDiasAtrasForm: ['', Validators.required],
      tipoDescuentoForm: ['', Validators.required],
    });
    this.segundoFormGroup = this._formBuilder.group({
      feriadosForm: [false],
      documentoForm: [''],
      legalizarForm: ['', Validators.required],
      fecValidarForm: ['', Validators.required],
      almuIncluirForm: ['', Validators.required],
      numDiaJustificaForm: [''],
      geneJustificacionForm: ['', Validators.required],
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

  // RANGO DE FECHAS
  rango = new FormGroup({
    start: new FormControl(''),
    end: new FormControl(''),
  });

  // METODO DE BUSQUEDA DE TIPOS DE PERMISOS
  permisos: any = [];
  ObtenerTipoPermiso() {
    this.permisos = [];
    this.rest.BuscarTipoPermiso().subscribe(datos => {
      this.permisos = datos;
    });
  }

  // METODO PARA LISTAR DATOS DE PERMISO
  tipoPermiso: any = [];
  CargarDatosPermiso() {
    this.tipoPermiso = [];
    this.rest.BuscarUnTipoPermiso(this.idPermiso).subscribe(datos => {
      this.tipoPermiso = datos[0];
      this.ImprimirDatos();
    })
  }

  // METODO PARA IMPRIMIR DATOS EN FORMULARIO
  ImprimirDatos() {
    // TIPO PERMISO HORAS - DIAS
    this.ActivarDiasHorasSet();
    //console.log(' ver ', this.tipoPermiso)
    // PRIMER FORMULARIO
    this.primeroFormGroup.patchValue({
      descripcionForm: this.tipoPermiso.descripcion,
      numDiaIngresoForm: this.tipoPermiso.dias_anticipar_permiso,
      numDiasAtrasForm: this.tipoPermiso.crear_dias_anteriores,
      numDiaMaximoForm: this.tipoPermiso.dias_maximo_permiso,
      numHoraMaximoForm: this.tipoPermiso.horas_maximo_permiso,
      acceEmpleadoForm: this.tipoPermiso.solicita_empleado,
      tipoDescuentoForm: this.tipoPermiso.tipo_descuento,
    });
    // SEGUNDO FORMULARIO
    this.segundoFormGroup.patchValue({
      feriadosForm: this.tipoPermiso.contar_feriados,
      documentoForm: this.tipoPermiso.documento,
      legalizarForm: this.tipoPermiso.legalizar,
      fecValidarForm: this.tipoPermiso.fecha_restriccion,
      almuIncluirForm: this.tipoPermiso.incluir_minutos_comida,
      numDiaJustificaForm: this.tipoPermiso.dias_justificar,
      geneJustificacionForm: this.tipoPermiso.justificar,
    });
    this.tercerFormGroup.patchValue({
      correo_crearForm: this.tipoPermiso.correo_crear,
      correo_editarForm: this.tipoPermiso.correo_editar,
      correo_eliminarForm: this.tipoPermiso.correo_eliminar,
      correo_negarForm: this.tipoPermiso.correo_negar,
      correo_autorizarForm: this.tipoPermiso.correo_autorizar,
      correo_preautorizarForm: this.tipoPermiso.correo_preautorizar,
      correo_legalizarForm: this.tipoPermiso.correo_legalizar,
    });
    // JUSTIFICACION DE PERMISO
    this.ActivarJustificacionSet(this.tipoPermiso.justificar);

    if (this.tipoPermiso.fecha_inicio != '' && this.tipoPermiso.fecha_inicio != null &&
      this.tipoPermiso.fecha_fin != '' && this.tipoPermiso.fecha_fin != null) {
      this.calendario = true;
      this.rango.patchValue({
        start: DateTime.fromFormat(this.tipoPermiso.fecha_inicio, 'yyyy-MM-dd').toFormat("YYYY-MM-DD"),
        end: DateTime.fromFormat(this.tipoPermiso.fecha_fin, 'yyyy-MM-dd').toFormat("YYYY-MM-DD")
      });
    } else {
      this.calendario = false;
    }
  }

  // METODO PARA CONTROLAR DIAS - HORAS
  ActivarDiasHoras(form: any) {
    if (form.diasHorasForm === 'Dias') {
      this.primeroFormGroup.patchValue({ numDiaMaximoForm: this.tipoPermiso.dias_maximo_permiso });
      this.primeroFormGroup.patchValue({ numHoraMaximoForm: '00:00' });
      this.HabilitarDias = false;
      this.HabilitarHoras = true;
      this.toastr.info('Ingresar número de días máximos de permiso.', '', {
        timeOut: 4000,
      });
    }
    else if (form.diasHorasForm === 'Horas') {
      this.primeroFormGroup.patchValue({ numHoraMaximoForm: this.tipoPermiso.horas_maximo_permiso });
      this.primeroFormGroup.patchValue({ numDiaMaximoForm: 0 });
      this.HabilitarDias = true;
      this.HabilitarHoras = false;
      this.toastr.info('Ingresar número de horas y minutos máximos de permiso.', '', {
        timeOut: 4000,
      });
    }
  }

  // METODO PARA IMPRIMIR DATOS DE HORAS - DIAS DE PERMISO
  HabilitarDias: boolean = false;
  HabilitarHoras: boolean = false;
  ActivarDiasHorasSet() {
    if (this.tipoPermiso.dias_maximo_permiso === 0) {
      this.primeroFormGroup.patchValue({
        diasHorasForm: this.diasHoras[1].valor
      })
      this.HabilitarDias = true;
      this.HabilitarHoras = false;
    } else if (this.tipoPermiso.horas_maximo_permiso === '00:00:00') {
      this.primeroFormGroup.patchValue({
        diasHorasForm: this.diasHoras[0].valor
      })
      this.HabilitarDias = false;
      this.HabilitarHoras = true;
    }
  }

  // METODO PARA IMPRIMIR DATOS DE JUSTIFICACION
  ActivarJustificacionSet(generarJustificacion: boolean) {
    if (generarJustificacion === true) {
      this.HabilitarJustifica = false;
      this.segundoFormGroup.patchValue({
        numDiaJustificaForm: this.tipoPermiso.dias_justificar
      });
    } else if (generarJustificacion === false) {
      this.HabilitarJustifica = true;
      this.segundoFormGroup.patchValue({
        numDiaJustificaForm: 0
      });
    }
  }

  // METODO PARA CONTROLAR INGRESO DE DIAS DE JUSTIFICACION
  ActivarJustificacion() {
    if ((<HTMLInputElement>document.getElementById('si')).value = 'true') {
      this.HabilitarJustifica = false;
      this.toastr.info('Ingresar número de días para presentar justificación', '', {
        timeOut: 6000,
      })
    }
  }

  // METODO PARA OCULTAR INGRESO DE DIAS DE JUSTIFICACION
  DesactivarJustificacion() {
    if ((<HTMLInputElement>document.getElementById('no')).value = 'false') {
      this.HabilitarJustifica = true;
      this.segundoFormGroup.patchValue({
        numDiaJustificaForm: '',
      })
    }
  }

  // METODO PARA ACTIVAR INGRESO DE FECHA
  calendario: boolean = false;
  VerCalendario() {
    this.calendario = true;
  }

  // METODO PARA OCULTAR INGRESO DE FECHA
  OcultarCalendario() {
    this.calendario = false;
    this.rango.patchValue({
      start: '',
      end: ''
    })
  }


  // METODO PARA VERIFICAR QUE NO ESTE VACIO EL CAMPO FECHA
  VerificarIngresoFecha(datos: any) {
    if (this.calendario === true) {
      if (this.rango.value.start === '' || this.rango.value.end === '') {
        this.toastr.info('Ingresar fecha en la que no podrá solicitar permisos.', 'Verificar Fecha.', {
          timeOut: 6000,
        });
      }
      else {
        this.Actualizar(this.tipoPermiso.id, datos);
      }
    }
    else {
      if (this.rango.value.start === '') {
        datos.fecha_inicio = null;
      }
      if (this.rango.value.end === '') {
        datos.fecha_fin = null;
      }
      this.Actualizar(this.tipoPermiso.id, datos);
    }
  }

  // METODO PARA CAPTURAR DATOS DE FORMULARIO
  contador: number = 0;
  ModificarTipoPermiso(form1: any, form2: any, form3: any) {
    this.contador = 0;
    let permiso = {
      // FORMULARIO UNO
      descripcion: form1.descripcionForm,
      acce_empleado: form1.acceEmpleadoForm,
      num_dia_maximo: form1.numDiaMaximoForm,
      tipo_descuento: form1.tipoDescuentoForm,
      num_dia_anticipo: form1.numDiaIngresoForm,
      num_dia_anterior: form1.numDiasAtrasForm,
      num_hora_maximo: form1.numHoraMaximoForm,

      // FORMULARIO DOS
      documento: form2.documentoForm,
      legalizar: form2.legalizarForm,
      fec_validar: this.calendario,
      almu_incluir: form2.almuIncluirForm,
      contar_feriados: form2.feriadosForm,
      num_dia_justifica: form2.numDiaJustificaForm,
      gene_justificacion: form2.geneJustificacionForm,
      fecha_inicio: this.rango.value.start ? DateTime.fromISO(this.rango.value.start).toFormat('yyyy-MM-dd') : null,
      fecha_fin: this.rango.value.end ? DateTime.fromISO(this.rango.value.end).toFormat('yyyy-MM-dd') : null,

      // FORMULARIO TRES
      correo_crear: form3.correo_crearForm,
      correo_editar: form3.correo_editarForm,
      correo_eliminar: form3.correo_eliminarForm,
      correo_preautorizar: form3.correo_preautorizarForm,
      correo_autorizar: form3.correo_autorizarForm,
      correo_negar: form3.correo_negarForm,
      correo_legalizar: form3.correo_legalizarForm,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
    }

    if (this.tipoPermiso.descripcion.toUpperCase() === permiso.descripcion.toUpperCase()) {
      this.VerificarIngresoFecha(permiso);
    }
    else {
      this.permisos.forEach((obj: any) => {
        if (obj.descripcion.toUpperCase() === permiso.descripcion.toUpperCase()) {
          this.contador = 1;
        }
      })
      if (this.contador === 0) {
        this.VerificarIngresoFecha(permiso);
      }
      else {
        this.toastr.warning('Tipo de permiso ya se encuentra registrado.', 'Ups! algo salio mal.', {
          timeOut: 6000,
        });
      }
    }
  }

  // METODO PARA ACTUALIZAR REGISTRO
  Actualizar(id: number, datos: any) {
    this.rest.ActualizarTipoPermiso(id, datos).subscribe(res => {
      this.toastr.success('Operación exitosa.', 'Registro actualizado.', {
        timeOut: 6000,
      });
      this.CerrarVentana(2);
    });
  }

  // METODO PARA VALIDAR INGRESO DE LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  // METODO PARA VALIDAR INGRESO DE NUMEROS
  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

  // METODO PARA CERRAR VENTANA
  CerrarVentana(opcion: number) {
    this.componentel.ver_editar = false;
    if (opcion === 1 && this.pagina === 'lista-permisos') {
      this.componentel.ver_lista = true;
    }
    else if (opcion === 2 && this.pagina === 'lista-permisos') {
      this.componentel.VerDatosPermiso(this.idPermiso);
    }
    else if (opcion === 1 && this.pagina === 'ver-datos') {
      this.componentel.ver_datos = true;
    }
    else if (opcion === 2 && this.pagina === 'ver-datos') {
      this.componentel.VerDatosPermiso(this.idPermiso);
    }
  }

}
