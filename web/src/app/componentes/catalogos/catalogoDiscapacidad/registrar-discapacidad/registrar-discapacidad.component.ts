import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef } from '@angular/material/dialog';
import { Component, OnInit } from '@angular/core';

import { CatDiscapacidadService } from 'src/app/servicios/catalogos/catDiscapacidad/cat-discapacidad.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';

@Component({
  selector: 'app-registrar-discapacidad',
  templateUrl: './registrar-discapacidad.component.html',
  styleUrls: ['./registrar-discapacidad.component.css']
})

export class RegistroDiscapacidadComponent implements OnInit{

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  discapacidad = new FormControl('', Validators.required)

  public formulario = new FormGroup({
    discapacidad: this.discapacidad
  });

  constructor(
    private toastr: ToastrService,
    private rest: CatDiscapacidadService,
    public ventana: MatDialogRef<RegistroDiscapacidadComponent>,
    public validar: ValidacionesService,
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.formulario.reset();
  }

  // METODO PARA GUARDAR DATOS DE NIVELES DE TITULO
  InsertarDiscapacidad(form: any) {
    let discapacidad = {
      discapacidad: form.discapacidad,
      user_name: this.user_name,
      ip: this.ip
    };
    this.rest.CrearDiscapacidad(discapacidad).subscribe(response => {
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
