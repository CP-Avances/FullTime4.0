import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { TipoComidasService } from 'src/app/servicios/catalogos/catTipoComidas/tipo-comidas.service';
import { PlanComidasService } from 'src/app/servicios/planComidas/plan-comidas.service';

@Component({
  selector: 'app-editar-tipo-comidas',
  templateUrl: './editar-tipo-comidas.component.html',
  styleUrls: ['./editar-tipo-comidas.component.css']
})
export class EditarTipoComidasComponent implements OnInit {

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
    private toastr: ToastrService,
    public restPlan: PlanComidasService,
    private router: Router,
    public dialogRef: MatDialogRef<EditarTipoComidasComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.ObtenerServicios();
    this.servicios[this.servicios.length] = { nombre: "OTRO" };
    this.ImprimirDatos();
  }

  GuardarDatos(datos: any) {
    this.rest.ActualizarUnAlmuerzo(datos).subscribe(response => {
      this.toastr.success('Operación Exitosa', 'Menú actualizado', {
        timeOut: 6000,
      })
      this.Salir();
      this.router.navigate(['/verMenu/', this.data.id]);
    }, error => {
      this.toastr.error('Operación Fallida', 'Ménu no registrado', {
        timeOut: 6000,
      })
    });
  }

  InsertarTipoComida(form) {
    let datosTipoComida = {
      id: this.data.id,
      nombre: form.nombreForm,
      tipo_comida: form.tipoForm,
      hora_inicio: form.horaInicioForm,
      hora_fin: form.horaFinForm
    };
    if (form.tipoForm === undefined) {
      this.RegistrarServicio(form, datosTipoComida);
    }
    else {
      this.GuardarDatos(datosTipoComida);
    }
  }

  ImprimirDatos() {
    this.TipoComidaForm.patchValue({
      nombreForm: this.data.nombre,
      tipoForm: this.data.tipo_comida,
      horaInicioForm: this.data.hora_inicio,
      horaFinForm: this.data.hora_fin
    })
  }

  ObtenerMensajeErrorNombreRequerido() {
    if (this.nombreF.hasError('required')) {
      return 'Campo obligatorio';
    }
  }

  LimpiarCampos() {
    this.TipoComidaForm.reset();
  }

  Salir() {
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
        nombre: form.servicioForm
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
