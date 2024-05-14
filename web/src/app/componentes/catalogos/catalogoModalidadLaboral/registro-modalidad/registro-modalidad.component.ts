import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { CatModalidadLaboralService } from 'src/app/servicios/catalogos/catModalidadLaboral/cat-modalidad-laboral.service';

@Component({
  selector: 'app-registro-modalidad',
  templateUrl: './registro-modalidad.component.html',
  styleUrls: ['./registro-modalidad.component.css']
})
export class RegistroModalidadComponent {

  modalidad = new FormControl('', Validators.required)

  public formulario = new FormGroup({
    modalidad: this.modalidad
  });

  constructor(
    private toastr: ToastrService,
    private modalidad_: CatModalidadLaboralService,
    public ventana: MatDialogRef<RegistroModalidadComponent>,
  ){}

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.formulario.reset();
  }

  // METODO PARA GUARDAR DATOS DE NIVELES DE TITULO
  InsertarModalidadLaboral(form: any) {
    let modalidadLaboral = {
      modalidad: form.modalidad,
    };
    this.modalidad_.CrearModalidadLaboral(modalidadLaboral).subscribe(response => {
      console.log('response: ',response);
      if(response.status == '200'){
        this.toastr.success(response.message, 'Operación exitosa.', {
          timeOut: 4000,
        });
        this.CerrarVentana();
      }else if(response.status == '300'){
        this.toastr.warning(response.message, 'Operación fallida.', {
          timeOut: 4000,
        });
      }else{
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
