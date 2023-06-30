import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef } from '@angular/material/dialog';

import { NivelTitulosService } from 'src/app/servicios/nivelTitulos/nivel-titulos.service';

@Component({
  selector: 'app-registrar-nivel-titulos',
  templateUrl: './registrar-nivel-titulos.component.html',
  styleUrls: ['./registrar-nivel-titulos.component.css']
})

export class RegistrarNivelTitulosComponent implements OnInit {

  nombre = new FormControl('', Validators.required)

  public formulario = new FormGroup({
    nombreForm: this.nombre
  });

  constructor(
    private toastr: ToastrService,
    private nivel: NivelTitulosService,
    public ventana: MatDialogRef<RegistrarNivelTitulosComponent>,
  ) { }

  ngOnInit(): void {
  }


  // METODO PARA GUARDAR DATOS DE NIVELES DE TITULO
  InsertarNivelTitulo(form: any) {
    let nivel = {
      nombre: form.nombreForm,
    };
    this.nivel.RegistrarNivel(nivel).subscribe(response => {
      this.toastr.success('Operación exitosa.', 'Registro guardado.', {
        timeOut: 6000,
      });
      this.CerrarVentana();
    }, error => {
    });;
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.formulario.reset();
  }

  // METODO PARA VALIDAR INGRESO DE LETRAS
  IngresarSoloLetras(e: any) {
    let key = e.keyCode || e.which;
    let tecla = String.fromCharCode(key).toString();
    // SE DEFINE TODO EL ABECEDARIO QUE SE VA A USAR.
    let letras = " áéíóúabcdefghijklmnñopqrstuvwxyzÁÉÍÓÚABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    // ES LA VALIDACIÓN DEL KEYCODES, QUE TECLAS RECIBE EL CAMPO DE TEXTO.
    let especiales = [8, 37, 39, 46, 6, 13];
    let tecla_especial = false
    for (var i in especiales) {
      if (key == especiales[i]) {
        tecla_especial = true;
        break;
      }
    }
    if (letras.indexOf(tecla) == -1 && !tecla_especial) {
      this.toastr.info('No se admite datos numéricos', 'Usar solo letras', {
        timeOut: 6000,
      })
      return false;
    }
  }

  // METODO PARA CERRAR VENTANA DE REGISTRO
  CerrarVentana() {
    this.LimpiarCampos();
    this.ventana.close();
  }

}
