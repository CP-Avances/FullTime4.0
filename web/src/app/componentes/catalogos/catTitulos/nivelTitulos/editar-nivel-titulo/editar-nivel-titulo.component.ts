import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { NivelTitulosService } from 'src/app/servicios/nivelTitulos/nivel-titulos.service';

@Component({
  selector: 'app-editar-nivel-titulo',
  templateUrl: './editar-nivel-titulo.component.html',
  styleUrls: ['./editar-nivel-titulo.component.css']
})

export class EditarNivelTituloComponent implements OnInit {

  nombre = new FormControl('', Validators.required)

  public formulario = new FormGroup({
    nombreForm: this.nombre
  });

  constructor(
    private nivel: NivelTitulosService,
    private toastr: ToastrService,
    public ventana: MatDialogRef<EditarNivelTituloComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit(): void {
    this.ImprimirDatos();
  }

  // METODO PARA ACTUALIZAR NIVEL DE TITULO
  InsertarNivelTitulo(form: any) {
    let nivel = {
      id: this.data.id,
      nombre: form.nombreForm,
    };
    this.nivel.ActualizarNivelTitulo(nivel).subscribe(response => {
      this.toastr.success('Operación exitosa.', 'Registro actualizado.', {
        timeOut: 6000,
      });
      this.CerrarVentana();
    }, error => {
    });
  }

  // METODO PARA MOSTRAR DATOS EN FORMULARIO
  ImprimirDatos() {
    this.formulario.setValue({
      nombreForm: this.data.nombre
    })
  }

  // METODO PARA LIMPIAR DATOS DE FORMULARIO
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
