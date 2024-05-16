import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { AccionPersonalService } from 'src/app/servicios/accionPersonal/accion-personal.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { ListarTipoAccionComponent } from '../listar-tipo-accion/listar-tipo-accion.component';

@Component({
  selector: 'app-editar-tipo-accion',
  templateUrl: './editar-tipo-accion.component.html',
  styleUrls: ['./editar-tipo-accion.component.css']
})

export class EditarTipoAccionComponent implements OnInit {

  @Input() data: any;
  @Input() pagina: any;

  selec1: boolean = false;
  selec2: boolean = false;
  selec3: boolean = false;

  // EVENTOS RELACIONADOS A SELECCIÓN E INGRESO DE PROCESOS PROPUESTOS
  ingresoTipo: boolean = false;
  vistaTipo: boolean = true;

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  otroTipoF = new FormControl('', [Validators.minLength(3)]);
  descripcionF = new FormControl('', [Validators.required]);
  baseLegalF = new FormControl('', [Validators.required]);
  tipoAccionF = new FormControl('');
  tipoF = new FormControl('');

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    descripcionForm: this.descripcionF,
    baseLegalForm: this.baseLegalF,
    tipoForm: this.tipoF,
    tipoAccionForm: this.tipoAccionF,
    otroTipoForm: this.otroTipoF,
  });

  constructor(
    private rest: AccionPersonalService,
    private toastr: ToastrService,
    public validar: ValidacionesService,
    public componentel: ListarTipoAccionComponent,
  ) { }

  ngOnInit(): void {
    this.ObtenerTiposAccionPersonal();
    this.ObtenerTiposAccion();
    this.tipos[this.tipos.length] = { descripcion: "OTRO" };
    this.CargarDatos();
  }

  // METODO PARA MOSTRAR DATOS
  CargarDatos() {
    this.selec1 = false;
    this.selec2 = false;
    this.selec3 = false;
    this.formulario.patchValue({
      tipoAccionForm: this.data.id_tipo_accion_personal ,
      descripcionForm: this.data.descripcion,
      baseLegalForm: this.data.base_legal,
    })
    if (this.data.tipo_permiso === true) {
      this.selec1 = true;
      this.CambiarEstadosPermisos();
    }
    if (this.data.tipo_vacacion === true) {
      this.selec2 = true;
      this.CambiarEstadosVacaciones();
    }
    if (this.data.tipo_situacion_propuesta === true) {
      this.selec3 = true;
      this.CambiarEstadosSituacion();
    }
  }

  // METODO PARA CAPTURAR DATOS DEL FORMULARIO
  InsertarAccion(form: any) {
    let datosAccion = {
      id_tipo: form.tipoAccionForm,
      descripcion: form.descripcionForm,
      base_legal: form.baseLegalForm,
      tipo_permiso: this.selec1,
      tipo_vacacion: this.selec2,
      tipo_situacion_propuesta: this.selec3,
      id: this.data.id
    };
    if (form.tipoAccionForm != undefined) {
      this.GuardarInformacion(datosAccion);
    }
    else {
      this.IngresarNuevoTipo(form, datosAccion);
    }
  }

  // METODO PARA GUARDAR DATOS
  contador: number = 0;
  GuardarInformacion(datosAccion: any) {
    this.contador = 0;
    this.tipos_acciones.map(obj => {
      if (obj.id_tipo === datosAccion.id_tipo) {
        this.contador = this.contador + 1;
      }
    });
    if (this.contador != 0) {
      this.toastr.error('El tipo de acción de personal seleccionado ya se encuentra registrado.',
        'Ups!!! algo salio mal.', {
        timeOut: 6000,
      })
    } else {
      this.rest.ActualizarDatos(datosAccion).subscribe(response => {
        this.toastr.success('Operación exitosa.', 'Registro guardado.', {
          timeOut: 6000,
        })
        this.CerrarVentana(2, this.data.id);
      }, error => {
        this.toastr.error('Revisar los datos',
          'Ups!!! algo salio mal.', {
          timeOut: 6000,
        })
      });
    }
  }

  // METODO PARA BUSQUEDA DE DATOS DE LA TABLA TIPO_ACCION_PERSONAL
  tipos_acciones: any = [];
  ObtenerTiposAccionPersonal() {
    this.tipos_acciones = [];
    this.rest.BuscarDatosTipoEdicion(this.data.id_tipo_accion_personal ).subscribe(datos => {
      this.tipos_acciones = datos;
    })
  }

  // METODO PARA VALIDAR INGRESO DE NUMEROS
  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.formulario.reset();
  }

  // METODO PARA CERRAR VENTANA
  CerrarVentana(opcion: number, datos: any) {
    this.LimpiarCampos();
    this.componentel.ver_editar = false;
    if (opcion === 1 && this.pagina === 'listar-tipos-acciones') {
      this.componentel.ver_lista = true;
    }
    else if (opcion === 2 && this.pagina === 'listar-tipos-acciones') {
      this.componentel.AbrirDatosAccion(datos);
    }
    else if (opcion === 1 && this.pagina === 'datos-tipo-accion') {
      this.componentel.ver_datos = true;
    }
    else if (opcion === 2 && this.pagina === 'datos-tipo-accion') {
      this.componentel.AbrirDatosAccion(datos);
    }
  }

  // METODO PARA CAMBIAR ESTADO PERMISOS
  CambiarEstadosPermisos() {
    this.selec2 = false;
    this.selec3 = false;
    this.selec1 = true;
  }

  // METODO PARA CAMBIAR ESTADO VACACIONES
  CambiarEstadosVacaciones() {
    this.selec1 = false;
    this.selec3 = false;
    this.selec2 = true;
  }

  // METODO PARA CAMBIAR ESTADO SITUACION PROPUESTA
  CambiarEstadosSituacion() {
    this.selec1 = false;
    this.selec2 = false;
    this.selec3 = true;
  }

  // METODO PARA BUSQUEDA DE DATOS DE LA TABLA TIPO_ACCION
  tipos: any = [];
  ObtenerTiposAccion() {
    this.tipos = [];
    this.rest.ConsultarTipoAccion().subscribe(datos => {
      this.tipos = datos;
      this.tipos[this.tipos.length] = { descripcion: "OTRO" };
    })
  }

  // METODO PARA ACTIVAR FORMULARIO DE INGRESO DE UN NUEVO TIPO_ACCION
  IngresarTipoAccion(form: any) {
    if (form.tipoAccionForm === undefined) {
      this.formulario.patchValue({
        otroTipoForm: '',
      });
      this.ingresoTipo = true;
      this.toastr.info('Ingresar nombre de un nuevo tipo de acción personal.', '', {
        timeOut: 6000,
      })
      this.vistaTipo = false;
    }
  }

  // METODO PARA VER LA LISTA DE TIPOS_ACCION
  VerTiposAccion() {
    this.formulario.patchValue({
      otroTipoForm: '',
    });
    this.ingresoTipo = false;
    this.vistaTipo = true;
  }

  // METODO PARA INGRESAR NUEVO PROCESO PROPUESTO
  IngresarNuevoTipo(form: any, datos: any) {
    if (form.otroTipoForm != '') {
      let tipo = {
        descripcion: form.otroTipoForm
      }
      this.VerificarDuplicidad(form, tipo, datos);
    }
    else {
      this.toastr.info('Ingresar una nueva opción o seleccionar una de la lista.', 'Verificar datos.', {
        timeOut: 6000,
      });
    }
  }

  // METODO PARA VERIFICAR DUPLICIDAD
  contar: number = 0;
  VerificarDuplicidad(form: any, tipo: any, datos: any) {
    this.contar = 0;
    this.tipos.map(obj => {
      if (obj.descripcion.toUpperCase() === form.otroTipoForm.toUpperCase()) {
        this.contar = this.contar + 1;
      }
    });
    if (this.contar != 0) {
      this.toastr.error('El nombre de tipo de acción personal ingresado ya se encuentra dentro de la lista de tipos de acciones de personal.',
        'Ups!!! algo salio mal.', {
        timeOut: 6000,
      })
    } else {
      this.rest.IngresarTipoAccion(tipo).subscribe(resol => {
        datos.id_tipo = resol.id;
        // INGRESAR DATOS DE REGISTRO LEGAL DE TIPO DE ACCIONES DE PERSONAL
        this.GuardarInformacion(datos);
      });
    }
  }
}
