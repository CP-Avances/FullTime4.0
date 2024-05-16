import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { CatModalidadLaboralService } from 'src/app/servicios/catalogos/catModalidadLaboral/cat-modalidad-laboral.service';

@Component({
  selector: 'app-editar-modalidad',
  templateUrl: './editar-modalidad.component.html',
  styleUrls: ['./editar-modalidad.component.css']
})
export class EditarModalidadComponent implements OnInit {

  modalidad = new FormControl('', Validators.required)

  public formulario = new FormGroup({
    modalidad: this.modalidad
  });

  constructor(
    private _ModalidaLaboral: CatModalidadLaboralService,
    public ventana: MatDialogRef<EditarModalidadComponent>, // VARIABLE DE MANEJO DE VENTANAS
    private toastr: ToastrService, // VARIABLE DE MENSAJES DE NOTIFICACIONES
    @Inject(MAT_DIALOG_DATA) public data: any,
  ){}

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
      modalidad: this.data.descripcion
    })
  }

  // METODO PARA ACTUALIZAR MODALIDAD LABORAL
  EditarModalidadLaboral(form: any) {
    let modalidad = {
      id: this.data.id,
      modalidad: form.modalidad,
    };
    this._ModalidaLaboral.ActualizarModalidadLab(modalidad).subscribe(response => {
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
    });
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
