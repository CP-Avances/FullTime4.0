import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { TipoComidasService } from 'src/app/servicios/catalogos/catTipoComidas/tipo-comidas.service';
import { PlanComidasService } from 'src/app/servicios/planComidas/plan-comidas.service';

@Component({
  selector: 'app-tipo-comidas',
  templateUrl: './tipo-comidas.component.html',
  styleUrls: ['./tipo-comidas.component.css'],
})

export class TipoComidasComponent implements OnInit {

  // Control de campos y validaciones del formulario
  nombreF = new FormControl('', [Validators.required, Validators.minLength(4)]);
  tipoF = new FormControl('');
  servicioF = new FormControl('', [Validators.minLength(3)]);
  horaInicioF = new FormControl('', [Validators.required]);
  horaFinF = new FormControl('', [Validators.required]);

  // Asignación de validaciones a inputs del formulario
  public TipoComidaForm = new FormGroup({
    nombreForm: this.nombreF,
    servicioForm: this.servicioF,
    tipoForm: this.tipoF,
    horaInicioForm: this.horaInicioF,
    horaFinForm: this.horaFinF
  });

  constructor(
    private rest: TipoComidasService,
    public restPlan: PlanComidasService,
    private toastr: ToastrService,
    private router: Router,
    public dialogRef: MatDialogRef<TipoComidasComponent>,
  ) { }

  ngOnInit(): void {
    this.ObtenerServicios();
    this.servicios[this.servicios.length] = { nombre: "OTRO" };
  }

  GuardarDatos(datos: any) {
    this.rest.CrearNuevoTipoComida(datos).subscribe(response => {
      this.toastr.success('Operación Exitosa', 'Menú registrado', {
        timeOut: 6000,
      })
      this.rest.ObtenerUltimoId().subscribe(ultimo => {
        this.CerrarVentanaRegistroTipoComidas();
        this.router.navigate(['/verMenu/', ultimo[0].max]);
      });
    }, error => {
      this.toastr.error('Operación Fallida', 'Menú no registrado', {
        timeOut: 6000,
      })
    });
  }

  /** METODO PARA BUSCAR LOS MENÚS REGISTRADOS EN EL SERVICIO SELECCIONADO */
  tipoComidas: any = [];
  duplicidad: number = 0;
  InsertarTipoComida(form) {
    let datosTipoComida = {
      nombre: form.nombreForm,
      tipo_comida: form.tipoForm,
      hora_inicio: form.horaInicioForm,
      hora_fin: form.horaFinForm
    };
    console.log('prueba', form.tipoForm)
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
        console.log('tipo_comidas', this.tipoComidas)
        this.tipoComidas.map(obj => {
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

  ObtenerMensajeErrorNombreRequerido() {
    if (this.nombreF.hasError('required')) {
      return 'Campo obligatorio';
    }
  }

  LimpiarCampos() {
    this.TipoComidaForm.reset();
  }

  CerrarVentanaRegistroTipoComidas() {
    this.LimpiarCampos();
    this.dialogRef.close();
  }

  estilo: any;
  habilitarServicio: boolean = false;
  IngresarServicio(form) {
    if (form.tipoForm === undefined) {
      this.TipoComidaForm.patchValue({
        servicioForm: '',
      });
      this.estilo = { 'visibility': 'visible' }; this.habilitarServicio = true;
      this.toastr.info('Ingresar nombre del nuevo tipo de servicio.', 'Etiqueta Ingresar Servicio activa', {
        timeOut: 6000,
      })
      this.habilitarSeleccion = false;
    }
  }

  habilitarSeleccion: boolean = true;
  VerTiposServicios() {
    this.TipoComidaForm.patchValue({
      servicioForm: '',
    });
    this.estilo = { 'visibility': 'hidden' }; this.habilitarServicio = false;
    this.habilitarSeleccion = true;
  }

  servicios: any = [];
  ObtenerServicios() {
    this.servicios = [];
    this.restPlan.ObtenerTipoComidas().subscribe(datos => {
      this.servicios = datos;
      this.servicios[this.servicios.length] = { nombre: "OTRO" };
    })
  }

  RegistrarServicio(form, datos: any) {
    if (form.servicioForm != '') {
      let tipo_servicio = {
        nombre: form.servicioForm,
      }
      this.restPlan.CrearTipoComidas(tipo_servicio).subscribe(res => {
        // Buscar id de último tipo de servicio ingresado
        this.restPlan.ObtenerUltimoTipoComidas().subscribe(data => {
          datos.tipo_comida = data[0].max;
          this.GuardarDatos(datos);
        });
      });
    }
    else {
      this.toastr.info('Ingresar el tipo de servicio', 'Verificar datos', {
        timeOut: 6000,
      });
    }
  }

}
