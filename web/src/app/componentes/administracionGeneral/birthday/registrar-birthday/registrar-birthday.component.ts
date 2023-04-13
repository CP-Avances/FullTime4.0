import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef } from '@angular/material/dialog';

import { BirthdayService } from 'src/app/servicios/birthday/birthday.service';

@Component({
  selector: 'app-registrar-birthday',
  templateUrl: './registrar-birthday.component.html',
  styleUrls: ['./registrar-birthday.component.css']
})

export class RegistrarBirthdayComponent implements OnInit {

  archivoForm = new FormControl('');
  mensajeF = new FormControl('', [Validators.required]);
  imagenF = new FormControl('');
  tituloF = new FormControl('', [Validators.required]);
  linkF = new FormControl('');

  public formulario = new FormGroup({
    mensajeForm: this.mensajeF,
    imagenForm: this.imagenF,
    tituloForm: this.tituloF,
    linkForm: this.linkF,
  })

  id_empresa: number = parseInt(localStorage.getItem('empresa') as string);

  constructor(
    private toastr: ToastrService,
    private restB: BirthdayService,
    public ventana: MatDialogRef<RegistrarBirthdayComponent>
  ) { }

  ngOnInit(): void {
  }

  // GUARDAR DATOS DE MENSAJE
  InsertarMensajeBirthday(form: any) {
    let dataMensaje = {
      id_empresa: this.id_empresa,
      mensaje: form.mensajeForm,
      titulo: form.tituloForm,
      link: form.linkForm,
    }
    this.restB.CrearMensajeCumpleanios(dataMensaje).subscribe(res => {
      this.ventana.close(true);
      this.SubirRespaldo(res[0].id)
    })
  }

  // CERRAR VENTANA DE REGISTRO
  cerrarVentana() {
    this.ventana.close(false);
  }

  // LIMPIAR CAMPO DE NOMBRE DE ARCHIVO
  LimpiarNombreArchivo() {
    this.formulario.patchValue({
      imagenForm: '',
    });
  }

  /** *********************************************************************************** **
   ** **                       TRATAMIENTO DE ARCHIVO                                  ** **
   ** *********************************************************************************** **/

  // CARGAR ARCHIVO
  nameFile: string;
  archivoSubido: Array<File>;

  fileChange(element: any) {
    this.archivoSubido = element.target.files;
    if (this.archivoSubido.length != 0) {
      const name = this.archivoSubido[0].name;
      let arrayItems = name.split(".");
      let itemExtencion = arrayItems[arrayItems.length - 1];
      if (this.archivoSubido[0].size <= 2e+6) {
        if (itemExtencion == 'png' || itemExtencion == 'jpg' ||
          itemExtencion == 'jpeg' || itemExtencion == 'gif') {
          this.formulario.patchValue({ imagenForm: name });
        }
        else {
          this.toastr.warning('Formatos aceptados .png, .jpg, .gif y .jpeg.', 'Error formato del archivo.', {
            timeOut: 6000,
          });
          this.ResetearDatos();
        }
      }
      else {
        this.toastr.info('El archivo ha excedido el tamaño permitido.', 'Tamaño de archivos permitido máximo 2MB.', {
          timeOut: 6000,
        });
        this.ResetearDatos();
      }
    }
  }

  // GUARDAR DATOS DE IMAGEN
  SubirRespaldo(id: number) {
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads[]", this.archivoSubido[i], this.archivoSubido[i].name);
    }
    this.restB.SubirImagenBirthday(formData, id).subscribe(res => {
      this.toastr.success('Operación Exitosa.', 'Imagen subida con éxito.', {
        timeOut: 6000,
      });
      this.ResetearDatos();
    });
  }

  // METODO PARA LIMPIAR FORMULARIO
  ResetearDatos() {
    this.archivoForm.reset();
    this.nameFile = '';
  }

}
