// SECCION DE LIBRERIAS
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

// SECCION SERVICIOS
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
  especificacion: string = '';
  observacion: string = '';

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    private rest: ParametrosService,
    private toastr: ToastrService,
    public ventana: MatDialogRef<EditarDetalleParametroComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.nota = 'NOTA: Por favor llenar todos los campos obligatorios (*) del formulario para activar el botón ' +
      'Guardar.';
    this.MostrarDatos();
    if (this.data.parametros.id_tipo === 4) {
      this.especificacion = 'Rango de perímetro en metros.';
      this.observacion = 'Perímetro de ubicación permitido para realizar marcaciones (metros).';
    }
    else if (this.data.parametros.id_tipo === 33) {
      this.especificacion = 'Ingrese el número máximo de correos permitidos.';
      this.observacion = 'Número de correos electrónicos que se podrán enviar.';
    }
    // PARAMETRO DISPOSITIVOS MOVILES
    else if (this.data.parametros.id === 6) {
      this.especificacion = 'Definir el número de dispositivos que pueden usar los usuarios para registrar sus timbres en la aplicación móvil.';
      this.observacion = 'Número de dispositivos móviles en los que el usuario podrá iniciar sesión en la aplicación móvil.';
    }
    else {
      this.especificacion = '';
    }
  }

  // METODO PARA MOSTRAR DETALLE DE PARAMETRO
  MostrarDatos() {
    this.formulario.patchValue({
      descripcionForm: this.data.parametros.descripcion
    })
  }

  // METODO PARA REGISTRAR NUEVO PARÁMETRO
  GuardarDatos(form: any) {
    let datos = {
      id: this.data.parametros.id_detalle,
      descripcion: form.descripcionForm,
      observacion: this.observacion,
      user_name: this.user_name,
      ip: this.ip,
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
