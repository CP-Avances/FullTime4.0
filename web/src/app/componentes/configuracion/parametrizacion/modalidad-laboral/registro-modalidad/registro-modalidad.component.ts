import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

import { CatModalidadLaboralService } from 'src/app/servicios/configuracion/parametrizacion/catModalidadLaboral/cat-modalidad-laboral.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';

@Component({
  selector: 'app-registro-modalidad',
  templateUrl: './registro-modalidad.component.html',
  styleUrls: ['./registro-modalidad.component.css']
})

export class RegistroModalidadComponent implements OnInit {

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  modalidad = new FormControl('', Validators.required)

  public formulario = new FormGroup({
    modalidad: this.modalidad
  });

  constructor(
    private toastr: ToastrService,
    private modalidad_: CatModalidadLaboralService,
    public validar: ValidacionesService,
    public ventana: MatDialogRef<RegistroModalidadComponent>,
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
  InsertarModalidadLaboral(form: any) {
    let modalidadLaboral = {
      modalidad: form.modalidad,
      user_name: this.user_name,
      ip: this.ip,
    };
    this.modalidad_.CrearModalidadLaboral(modalidadLaboral).subscribe(response => {
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
    });;
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
