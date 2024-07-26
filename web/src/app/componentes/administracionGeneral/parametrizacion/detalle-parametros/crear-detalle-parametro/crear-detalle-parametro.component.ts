// SECCION DE LIBRERIAS
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

// SECCION SERVICIOS
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';

@Component({
  selector: 'app-crear-detalle-parametro',
  templateUrl: './crear-detalle-parametro.component.html',
  styleUrls: ['./crear-detalle-parametro.component.css']
})

export class CrearDetalleParametroComponent implements OnInit {

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // CONTROL DE LOS CAMPOS DEL FORMULARIO
  descripcion = new FormControl('', [Validators.required]);

  // ASIGNAR LOS CAMPOS EN UN FORMULARIO EN GRUPO
  public formulario = new FormGroup({
    descripcionForm: this.descripcion,
  });

  constructor(
    private rest: ParametrosService,
    private toastr: ToastrService,
    public ventana: MatDialogRef<CrearDetalleParametroComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  nota: string = '';
  especificacion: string = '';

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    // PARAMETRO TOLERANCIA UBICACION
    if (this.data.parametros.id === 4) {
      this.nota = 'NOTA: Por favor llenar todos los campos obligatorios (*) del formulario para activar el botón ' +
        'Guardar.'
      this.especificacion = 'Rango de perímetro en metros.';
    }
    // PARAMETRO LIMITE CORREO
    else if (this.data.parametros.id === 33) {
      this.nota = 'NOTA: Por favor llenar todos los campos obligatorios (*) del formulario para activar el botón ' +
        'Guardar.'
      this.especificacion = 'Ingrese el número máximo de correos permitidos.';
    }
    else {
      this.nota = 'NOTA: Por favor llenar todos los campos obligatorios (*) del formulario para activar el botón ' +
        'Guardar.'
      this.especificacion = '';
    }
  }

  // METODO PARA REGISTRAR NUEVO PARÁMETRO
  GuardarDatos(form: any) {
    let datos = {
      id_tipo: this.data.parametros.id,
      descripcion: form.descripcionForm,
      user_name: this.user_name,
      ip: this.ip,
    };
    this.rest.IngresarDetalleParametro(datos).subscribe(response => {
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
