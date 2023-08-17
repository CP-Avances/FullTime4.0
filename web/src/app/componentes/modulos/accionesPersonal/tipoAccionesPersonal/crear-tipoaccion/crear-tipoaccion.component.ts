import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { AccionPersonalService } from 'src/app/servicios/accionPersonal/accion-personal.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { ListarTipoAccionComponent } from '../listar-tipo-accion/listar-tipo-accion.component';

@Component({
  selector: 'app-crear-tipoaccion',
  templateUrl: './crear-tipoaccion.component.html',
  styleUrls: ['./crear-tipoaccion.component.css']
})

export class CrearTipoaccionComponent implements OnInit {

  selec1: boolean = false;
  selec2: boolean = false;
  selec3: boolean = false;

  // EVENTOS RELACIONADOS A SELECCION E INGRESO DE PROCESOS PROPUESTOS
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
    tipoAccionForm: this.tipoAccionF,
    otroTipoForm: this.otroTipoF,
    tipoForm: this.tipoF,
  });

  constructor(
    private rest: AccionPersonalService,
    private toastr: ToastrService,
    public validar: ValidacionesService,
    public compnentel: ListarTipoAccionComponent,
  ) { }

  ngOnInit(): void {
    this.ObtenerTiposAccionPersonal();
    this.ObtenerTiposAccion();
    this.tipos[this.tipos.length] = { descripcion: "OTRO" };
  }

  // METODO PARA CREAR TIPO DE ACCION
  InsertarAccion(form: any) {
    let datosAccion = {
      id_tipo: form.tipoAccionForm,
      descripcion: form.descripcionForm,
      base_legal: form.baseLegalForm,
      tipo_permiso: this.selec1,
      tipo_vacacion: this.selec2,
      tipo_situacion_propuesta: this.selec3
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
      this.rest.IngresarTipoAccionPersonal(datosAccion).subscribe(response => {
        this.toastr.success('Operación exitosa.', 'Registro guardado.', {
          timeOut: 6000,
        })
        this.CerrarVentana(2, response.id);
      }, error => {
        this.toastr.error('Revisar los datos',
          'Ups!!! algo salio mal.', {
          timeOut: 6000,
        })
      });
    }
  }

  // METODO PARA CAMBIAR ESTADO PERMISO
  CambiarEstadosPermisos() {
    this.selec2 = false;
    this.selec3 = false;
  }


  // METODO PARA CAMBIAR ESTADO VACACIONES
  CambiarEstadosVacaciones() {
    this.selec1 = false;
    this.selec3 = false;
  }

  // METODO PARA CAMBIAR ESTADO SITUACION PROPUESTA
  CambiarEstadosSituacion() {
    this.selec1 = false;
    this.selec2 = false;
  }

  // METODO PARA BUSQUEDA DE DATOS DE LA TABLA TIPO_ACCION_PERSONAL
  tipos_acciones: any = [];
  ObtenerTiposAccionPersonal() {
    this.tipos_acciones = [];
    this.rest.ConsultarTipoAccionPersonal().subscribe(datos => {
      this.tipos_acciones = datos;
    })
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

  // METODO PARA INGRESAR NUEVO TIPO_ACCION
  IngresarNuevoTipo(form: any, datos: any) {
    if (form.otroTipoForm != '') {
      let tipo = {
        descripcion: form.otroTipoForm
      }
      this.VerificarDuplicidad(form, tipo, datos);
    }
    else {
      this.toastr.info('Ingresar una nueva opción o seleccionar una de la lista.', 'Ups!!! algo salio mal.', {
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

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.formulario.reset();
  }

  // METODO PARA CERRAR VENTANA
  CerrarVentana(opcion: number, datos: any) {
    this.LimpiarCampos();
    this.compnentel.ver_registrar = false;
    if (opcion === 2) {
      this.compnentel.AbrirDatosAccion(datos);
    }
    else if (opcion === 1) {
      this.compnentel.ver_lista = true;
    }
  }

  // METODO PARA VALIDAR INGRESO DE LETRAS
  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloLetras(evt);
  }

}
