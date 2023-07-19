// SECCIÓN DE LIBRERIAS
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

// SECCIÓN SERVICIOS
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';

@Component({
  selector: 'app-editar-detalle-parametro',
  templateUrl: './editar-detalle-parametro.component.html',
  styleUrls: ['./editar-detalle-parametro.component.css']
})

export class EditarDetalleParametroComponent implements OnInit {

  // CONTROL DE LOS CAMPOS DEL FORMULARIO
  descripcion = new FormControl('', [Validators.required]);

  // ASIGNAR LOS CAMPOS EN UN FORMULARIO EN GRUPO
  public formulario = new FormGroup({
    descripcionForm: this.descripcion,
  });

  nota: string = '';
  constructor(
    private rest: ParametrosService,
    private toastr: ToastrService,
    private router: Router,
    public ventana: MatDialogRef<EditarDetalleParametroComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.MostrarDatos();
    if (this.data.parametros.id_tipo === 22) {
      this.nota = 'NOTA: Por favor llenar todos los campos obligatorios (*) del formulario para activar el botón ' +
        'Guardar. Rango de perímetro en metros.'
    }
    else if (this.data.parametros.id_tipo === 24) {
      this.nota = 'NOTA: Por favor llenar todos los campos obligatorios (*) del formulario para activar el botón ' +
        'Guardar. Ingrese el número máximo de correos permitidos.'
    }
    else {
      this.nota = 'NOTA: Por favor llenar todos los campos obligatorios (*) del formulario para activar el botón ' +
        'Guardar.'
    }
  }

  // MÉTIODO PARA MOSTRAR DETALLE DE PARÁMETRO
  MostrarDatos() {
    this.formulario.patchValue({
      descripcionForm: this.data.parametros.descripcion
    })
  }

  // METODO PARA REGISTRAR NUEVO PARÁMETRO
  GuardarDatos(form: any) {
    let datos = {
      id: this.data.parametros.id_detalle,
      descripcion: form.descripcionForm
    };
    this.rest.ActualizarDetalleParametro(datos).subscribe(response => {
      this.toastr.success('Detalle registrado exitosamente.',
        '', {
        timeOut: 2000,
      })
      this.CerrarVentana();
    });
  }

  // METODO PARA CERRAR VENTANA
  CerrarVentana() {
    this.ventana.close();
  }

}
