// SECCIÓN DE LIBRERIAS
import { MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Component, OnInit } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';

// SECCIÓN SERVICIOS
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';

@Component({
  selector: 'app-crear-parametro',
  templateUrl: './crear-parametro.component.html',
  styleUrls: ['./crear-parametro.component.css']
})

export class CrearParametroComponent implements OnInit {

  // CONTROL DE LOS CAMPOS DEL FORMULARIO
  descripcion = new FormControl('', Validators.required);

  // ASIGNAR LOS CAMPOS EN UN FORMULARIO EN GRUPO
  public formulario = new FormGroup({
    descripcionForm: this.descripcion,
  });

  constructor(
    private rest: ParametrosService,
    private toastr: ToastrService,
    public ventana: MatDialogRef<CrearParametroComponent>
  ) { }

  ngOnInit(): void { }

  // METODO PARA REGISTRAR NUEVO PARÁMETRO
  GuardarDatos(form: any) {
    let datos = {
      descripcion: form.descripcionForm
    };
    this.rest.IngresarTipoParametro(datos).subscribe(response => {
      this.toastr.success('Registro guardado exitosamente.',
        '', {
        timeOut: 2000,
      })
      this.CerrarVentana(response.respuesta.id);
    });
  }

  // METODO PARA CERRAR VENTANA
  CerrarVentana(id: number) {
    this.ventana.close(id);
  }

}
