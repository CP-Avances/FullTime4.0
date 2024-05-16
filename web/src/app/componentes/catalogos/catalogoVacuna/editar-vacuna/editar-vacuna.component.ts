import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { CatVacunasService } from 'src/app/servicios/catalogos/catVacunas/cat-vacunas.service';

@Component({
  selector: 'app-editar-vacuna',
  templateUrl: './editar-vacuna.component.html',
  styleUrls: ['./editar-vacuna.component.css']
})
export class EditarVacunasComponent implements OnInit {

  vacuna = new FormControl('', Validators.required)

  public formulario = new FormGroup({
    vacuna: this.vacuna
  });

  constructor(
    private rest: CatVacunasService,
    public ventana: MatDialogRef<EditarVacunasComponent>, // VARIABLE DE MANEJO DE VENTANAS
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
      vacuna: this.data.nombre
    })
  }

  // METODO PARA ACTUALIZAR vacuna LABORAL
  EditarVacuna(form: any) {
    let vacuna = {
      id: this.data.id,
      nombre: form.vacuna,
    };
    this.rest.ActualizarVacuna(vacuna).subscribe(response => {
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
