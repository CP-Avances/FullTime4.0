import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { DiscapacidadService } from 'src/app/servicios/discapacidad/discapacidad.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';

@Component({
  selector: 'app-discapacidad',
  templateUrl: './discapacidad.component.html',
  styleUrls: ['./discapacidad.component.css']
})

export class DiscapacidadComponent implements OnInit {

  idEmploy: string;
  editar: string;

  userDiscapacidad: any = [];
  tipoDiscapacidad: any = [];

  HabilitarDescrip: boolean = true;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  porcentaje = new FormControl('', Validators.required);
  nombreF = new FormControl('', [Validators.minLength(5)])
  carnet = new FormControl('', [Validators.required, Validators.maxLength(8)]);
  tipo = new FormControl('', [Validators.maxLength(10)])

  public formulario = new FormGroup({
    porcentajeForm: this.porcentaje,
    carnetForm: this.carnet,
    nombreForm: this.nombreF,
    tipoForm: this.tipo,
  });

  constructor(
    private rest: DiscapacidadService,
    private toastr: ToastrService,
    private ventana: MatDialogRef<DiscapacidadComponent>,
    private validar: ValidacionesService,
    @Inject(MAT_DIALOG_DATA) public datos: any
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

    this.editar = this.datos.metodo;
    this.idEmploy = this.datos.idEmpleado;
    this.EditarFormulario();
    this.ObtenerTiposDiscapacidad();
    this.tipoDiscapacidad[this.tipoDiscapacidad.length] = { nombre: "OTRO" };
  }

  // METODO PARA EDITAR FORMULARIO
  texto: string = 'REGISTRAR'
  EditarFormulario() {
    if (this.editar == 'editar') {
      this.rest.BuscarDiscapacidadUsuario(parseInt(this.idEmploy)).subscribe(data => {
        this.userDiscapacidad = data;
        this.carnet.setValue(this.userDiscapacidad[0].carnet_conadis);
        this.porcentaje.setValue(this.userDiscapacidad[0].porcentaje);
        this.tipo.setValue(this.userDiscapacidad[0].id_discapacidad);
        this.texto = 'MODIFICAR'
      });
    }
  }

  // METODO PARA GUARDAR DATOS DE DISCAPACIDAD
  InsertarCarnet(form: any) {
    if (this.editar != 'editar') {
      this.GuardarDiscapacidad(form);
    }
    else {
      this.CambiarDiscapacidad(form);
    }
  }

  // METODO PARA REGISTRAR DISCAPACIDAD EN BASE DE DATOS
  GuardarDiscapacidad(form: any) {
    if (form.tipoForm === undefined) {
      if (form.nombreForm != '') {
        this.GuardarTipoRegistro(form);
      }
      else {
        this.toastr.info('Ingresar tipo de discapacidad.', '', {
          timeOut: 6000,
        })
      }
    }
    else {
      if (form.tipoForm === null) {
        this.toastr.info('Favor seleccionar tipo de discapacidad.', '', {
          timeOut: 6000,
        })
      }
      else {
        this.RegistarDatos(form, form.tipoForm);
      }
    }
  }

  // METODO PARA ACTUALIZAR DATOS EN BASE DE DATOS
  CambiarDiscapacidad(form: any) {
    if (form.tipoForm === undefined) {
      if (form.nombreForm != '') {
        this.GuardarTipoActualizacion(form);
      }
      else {
        this.toastr.info('Ingresar tipo de discapacidad.', '', {
          timeOut: 6000,
        })
      }
    }
    else {
      this.ActualizarDatos(form, form.tipoForm);
    }
  }

  // METODO PARA CAPTURAR DATOS
  RegistarDatos(form: any, idTipoD: number) {
    let carnet = {
      carn_conadis: form.carnetForm,
      id_empleado: parseInt(this.idEmploy),
      porcentaje: form.porcentajeForm,
      tipo: idTipoD,
      user_name: this.user_name,
      ip: this.ip,
    }
    this.rest.RegistroDiscapacidad(carnet).subscribe(response => {
      this.toastr.success('Operación exitosa.', 'Registro actualizado.', {
        timeOut: 6000,
      });
      this.LimpiarCampos();
      this.texto = 'REGISTRAR';
      this.CerrarRegistro();
    });
  }

  // METODO PARA CAPTURAR DATOS PARA ACTUALIZACION
  ActualizarDatos(form: any, idTipoD: any) {
    let carnet = {
      carn_conadis: form.carnetForm,
      porcentaje: form.porcentajeForm,
      tipo: idTipoD,
      user_name: this.user_name,
      ip: this.ip,
    }
    this.rest.ActualizarDiscapacidad(parseInt(this.idEmploy), carnet).subscribe(res => {
      this.toastr.success('Operación exitosa.', 'Registro actualizado.', {
        timeOut: 6000,
      });
      this.CerrarRegistro();
    });
  }

  // METODO PARA REGISTRAR TIPO DE DISCAPACIDAD - METODO ACTUALIZACION
  GuardarTipoActualizacion(form: any) {
    let tipo = {
      nombre: form.nombreForm,
      user_name: this.user_name,
      ip: this.ip,
    }
    // VERIFICAR EXISTENCIA DE DISCAPACIDAD
    let discapacidad = {
      nombre: (tipo.nombre).toUpperCase()
    }
    this.rest.BuscarDiscapacidadNombre(discapacidad).subscribe(response => {
      this.toastr.warning('Tipo discapacidad ingresado ya existe en el sistema.', 'Ups!!! algo salio mal.', {
        timeOut: 4000,
      })
    }, vacio => {
      this.rest.RegistrarTipo(tipo).subscribe(response => {
        this.ActualizarDatos(form, response.id);
      });
    });
  }

  // METODO PARA REGISTRO DE TIPO DE DISCAPACIDAD - METODO REGISTRO
  GuardarTipoRegistro(form: any) {
    let tipo = {
      nombre: form.nombreForm,
      user_name: this.user_name,
      ip: this.ip,
    }
    // VERIFICAR EXISTENCIA DE DISCAPACIDAD
    let discapacidad = {
      nombre: (tipo.nombre).toUpperCase()
    }
    this.rest.BuscarDiscapacidadNombre(discapacidad).subscribe(response => {
      this.toastr.warning('Tipo discapacidad ingresado ya existe en el sistema.', 'Ups!!! algo salio mal.', {
        timeOut: 4000,
      })
    }, vacio => {
      this.rest.RegistrarTipo(tipo).subscribe(response => {
        this.RegistarDatos(form, response.id);
      });
    });
  }

  // METODO PARA VALIDAR SOLO INGRESO DE LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  // METODO PARA VALIDAR SOLO INGRESO DE NUMEROS
  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

  // MENSAJES DE ERROR
  ObtenerMensajeErrorCarnet() {
    if (this.carnet.hasError('required')) {
      return 'Debe ingresar N° de carnet.';
    }
    return this.carnet.hasError('maxLength') ? 'Ingresar hasta 7 caracteres.' : '';
  }

  // METODO PARA VALIDAR PORCENTAJES
  formatLabel(value: number) {
    return value + '%';
  }

  // METODO PARA LIMPIAR FORMULARIOS
  LimpiarCampos() {
    this.formulario.reset();
  }

  // METODO PARA CERRAR VENTANA DE REGISTROS
  CerrarRegistro() {
    this.ventana.close();
  }

  // TIPO DE DESCAPACIDAD
  seleccionarTipo: any;
  ObtenerTiposDiscapacidad() {
    this.rest.ListarTipoDiscapacidad().subscribe(data => {
      this.tipoDiscapacidad = data;
      this.tipoDiscapacidad[this.tipoDiscapacidad.length] = { nombre: "OTRO" };
    });
  }

  // METODO PARA MOSTRAR U OCULTAR REGISTRO DE TIPO DE DISCAPACIDAD
  ActivarDesactivarNombre(form: any) {
    if (form.tipoForm === undefined) {
      this.formulario.patchValue({
        nombreForm: '',
      });
      this.HabilitarDescrip = false;
      this.toastr.info('Ingresar tipo de discapacidad.', '', {
        timeOut: 4000,
      })
    }
    else {
      this.formulario.patchValue({
        nombreForm: '',
      });
      this.HabilitarDescrip = true;
    }
  }

}
