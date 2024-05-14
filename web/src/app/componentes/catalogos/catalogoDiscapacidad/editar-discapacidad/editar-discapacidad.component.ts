import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { CatDiscapacidadService } from 'src/app/servicios/catalogos/catDiscapacidad/cat-discapacidad.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';

@Component({
  selector: 'app-editar-discapacidad',
  templateUrl: './editar-discapacidad.component.html',
  styleUrls: ['./editar-discapacidad.component.css']
})

export class EditarDiscapacidadComponent implements OnInit {

  discapacidad = new FormControl('', Validators.required)

  public formulario = new FormGroup({
    discapacidad: this.discapacidad
  });

  constructor(
    private rest: CatDiscapacidadService,
    private toastr: ToastrService, // VARIABLE DE MENSAJES DE NOTIFICACIONES
    public ventana: MatDialogRef<EditarDiscapacidadComponent>, // VARIABLE DE MANEJO DE VENTANAS
    public validar: ValidacionesService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit(): void {
    this.ImprimirDatos();
  }

  // METODO PARA LIMPIAR DATOS DE FORMULARIO
  LimpiarCampos() {
    this.formulario.reset();
  }

  // METODO PARA MOSTRAR DATOS EN FORMULARIO
  ImprimirDatos() {
    this.formulario.setValue({
      discapacidad: this.data.nombre
    })
  }

  // METODO PARA ACTUALIZAR discapacidad LABORAL
  EditarDiscapacidad(form: any) {
    let discapacidad = {
      id: this.data.id,
      nombre: form.discapacidad,
    };
    this.rest.ActualizarDiscapacidad(discapacidad).subscribe(response => {
      if (response.status == '200') {
        this.toastr.success(response.message, 'Operación exitosa.', {
          timeOut: 4000,
        });
        this.CerrarVentana();
      } else if (response.status == '300') {
        this.toastr.warning(response.message, 'Operación fallida.', {
          timeOut: 4000,
        });
      } else {
        this.toastr.error(response.message, 'Error.', {
          timeOut: 4000,
        });
      }
    }, error => {
      this.toastr.info(error, 'Error', {
        timeOut: 4000,
      })
    });
  }

  // METODO PARA VALIDAR INGRESO DE LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  // METODO PARA CERRAR VENTANA DE REGISTRO
  CerrarVentana() {
    this.LimpiarCampos();
    this.ventana.close();
  }

}
