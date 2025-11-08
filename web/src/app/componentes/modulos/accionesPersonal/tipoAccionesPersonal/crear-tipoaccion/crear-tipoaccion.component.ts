import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { AccionPersonalService } from 'src/app/servicios/modulos/modulo-acciones-personal/accionPersonal/accion-personal.service';

import { ListarTipoAccionComponent } from '../listar-tipo-accion/listar-tipo-accion.component';

@Component({
  selector: 'app-crear-tipoaccion',
  standalone: false,
  templateUrl: './crear-tipoaccion.component.html',
  styleUrls: ['./crear-tipoaccion.component.css']
})

export class CrearTipoaccionComponent implements OnInit {
  ips_locales: any = '';

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;


  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  otroTipoF = new FormControl('', [Validators.minLength(3)]);
  descripcionF = new FormControl('', [Validators.required]);
  baseLegalF = new FormControl('');
  tipoAccionF = new FormControl('', [Validators.required]);
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
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });
  }

  // METODO PARA CREAR TIPO DE ACCION
  InsertarAccion(form: any) {
    let datosAccion = {
      id_tipo: form.tipoAccionForm,
      descripcion: form.descripcionForm,
      base_legal: form.baseLegalForm,
      user_name: this.user_name,
      ip: this.ip,
      ip_local: this.ips_locales,
    };
    this.GuardarInformacion(datosAccion);
  }

  // METODO PARA GUARDAR DATOS
  contador: number = 0;
  GuardarInformacion(datosAccion: any) {
    this.rest.IngresarTipoAccionPersonal(datosAccion).subscribe(response => {
      this.toastr.success('Operación exitosa.', 'Registro guardado.', {
        timeOut: 6000,
      })
      this.CerrarVentana(2, response.id);
    }, error => {
      this.toastr.error('Revisar los datos',
        'Ups! algo salio mal.', {
        timeOut: 6000,
      })
    });
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
    })
  }

  // METODO PARA INGRESAR NUEVO TIPO_ACCION
  IngresarNuevoTipo(form: any, datos: any) {
    let tipo = {
      descripcion: form.descripcionForm,
      user_name: this.user_name,
      ip: this.ip,
      ip_local: this.ips_locales,
    }
    this.VerificarDuplicidad(form, tipo, datos);
  }

  // METODO PARA VERIFICAR DUPLICIDAD
  contar: number = 0;
  VerificarDuplicidad(form: any, tipo: any, datos: any) {
    this.contar = 0;
    this.tipos.map((obj: any) => {
      if (obj.descripcion.toUpperCase() === form.descripcionForm.toUpperCase()) {
        this.contar = this.contar + 1;
      }
    });
    if (this.contar != 0) {
      this.toastr.error('El nombre de tipo de acción personal ingresado ya se encuentra dentro de la lista de tipos de acciones de personal.',
        'Ups! algo salio mal.', {
        timeOut: 6000,
      })
    } else {
      console.log('tipo data: ', tipo)
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
