import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef } from '@angular/material/dialog';

import { PlanComidasService } from 'src/app/servicios/modulos/modulo-alimentacion/planComidas/plan-comidas.service';
import { TipoComidasService } from 'src/app/servicios/modulos/modulo-alimentacion/catTipoComidas/tipo-comidas.service';

@Component({
  selector: 'app-tipo-comidas',
  templateUrl: './tipo-comidas.component.html',
  styleUrls: ['./tipo-comidas.component.css'],
})

export class TipoComidasComponent implements OnInit {

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  tipoF = new FormControl('');
  nombreF = new FormControl('', [Validators.required, Validators.minLength(4)]);
  horaFinF = new FormControl('', [Validators.required]);
  servicioF = new FormControl('', [Validators.minLength(3)]);
  horaInicioF = new FormControl('', [Validators.required]);

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    horaInicioForm: this.horaInicioF,
    servicioForm: this.servicioF,
    horaFinForm: this.horaFinF,
    nombreForm: this.nombreF,
    tipoForm: this.tipoF,
  });

  constructor(
    private rest: TipoComidasService,
    private toastr: ToastrService,
    public ventana: MatDialogRef<TipoComidasComponent>,
    public restPlan: PlanComidasService,
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

    this.ObtenerServicios();
    this.servicios[this.servicios.length] = { nombre: "OTRO" };
  }

  // METODO PARA BUSCAR TIPOS DE SERVICIOS
  servicios: any = [];
  ObtenerServicios() {
    this.servicios = [];
    this.restPlan.ObtenerTipoComidas().subscribe(datos => {
      this.servicios = datos;
      this.servicios[this.servicios.length] = { nombre: "OTRO" };
    })
  }

  // METODO PARA GUARDAR DATOS
  GuardarDatos(datos: any) {
    this.rest.CrearNuevoTipoComida(datos).subscribe(response => {
      this.toastr.success('Operación exitosa.', 'Registro guardado.', {
        timeOut: 6000,
      })
      this.CerrarVentana(response.info.id);
    }, error => {
      this.toastr.error('Ups!!! algo salio mal.', 'No se guardo el registro.', {
        timeOut: 6000,
      })
    });
  }

  // METODO PARA BUSCAR LOS MENUS REGISTRADOS EN EL SERVICIO SELECCIONADO
  tipoComidas: any = [];
  duplicidad: number = 0;
  InsertarTipoComida(form: any) {
    let datosTipoComida = {
      nombre: form.nombreForm,
      tipo_comida: form.tipoForm,
      hora_inicio: form.horaInicioForm,
      hora_fin: form.horaFinForm,
      user_name: this.user_name,
      ip: this.ip,
    };
    if (form.tipoForm === '') {
      this.toastr.info('Por favor seleccionar un tipo de servicio.', '', {
        timeOut: 6000,
      })
    }
    else if (form.tipoForm === undefined) {
      this.RegistrarServicio(form, datosTipoComida);
    }
    else {
      this.duplicidad = 0;
      this.tipoComidas = [];
      this.rest.ConsultarUnServicio(form.tipoForm).subscribe(datos => {
        this.tipoComidas = datos;
        this.tipoComidas.map((obj: any) => {
          if (obj.nombre.toUpperCase() === form.nombreForm.toUpperCase()) {
            this.duplicidad = this.duplicidad + 1;
          }
        });
        if (this.duplicidad === 0) {
          this.GuardarDatos(datosTipoComida);
        }
        else {
          this.toastr.info('Nombre de Menú ingresado ya se encuentra registrado en este tipo de servicio.', 'Ingresar un nombre de Menú válido.', {
            timeOut: 6000,
          })
        }
      })
    }
  }

  // METODO PARA ACTIVAR CAMPO NOMBRE DE SERVICIO
  habilitarServicio: boolean = false;
  IngresarServicio(form: any) {
    if (form.tipoForm === undefined) {
      this.formulario.patchValue({
        servicioForm: '',
      });
      this.habilitarServicio = true;
      this.toastr.info('Ingresar nombre del nuevo tipo de servicio.', 'Etiqueta Ingresar Servicio activa.', {
        timeOut: 6000,
      })
      this.habilitarSeleccion = false;
    }
  }

  // METODO PARA VER LISTA DE SERVICIOS
  habilitarSeleccion: boolean = true;
  VerTiposServicios() {
    this.formulario.patchValue({
      servicioForm: '',
    });
    this.habilitarServicio = false;
    this.habilitarSeleccion = true;
  }

  // METODO PARA REGISTRAR NUEVO SERVICII
  RegistrarServicio(form: any, datos: any) {
    if (form.servicioForm != '') {
      let tipo_servicio = {
        nombre: form.servicioForm,
        user_name: this.user_name,
        ip: this.ip,
      }
      this.restPlan.CrearTipoComidas(tipo_servicio).subscribe(res => {
        datos.tipo_comida = res.id;
        this.GuardarDatos(datos);
      });
    }
    else {
      this.toastr.warning('Ingresar el tipo de servicio.', 'Ups!!! algo salio mal.', {
        timeOut: 6000,
      });
    }
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.formulario.reset();
  }

  // METODO PARA CERRAR VENTANA
  CerrarVentana(id: number) {
    this.LimpiarCampos();
    this.ventana.close(id);
  }

}
