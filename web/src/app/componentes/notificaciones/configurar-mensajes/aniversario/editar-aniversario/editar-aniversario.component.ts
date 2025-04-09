import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { MensajesNotificacionesService } from 'src/app/servicios/notificaciones/mensajesNotificaciones/mensajes-notificaciones.service';

@Component({
  selector: 'app-editar-aniversario',
  standalone: false,
  templateUrl: './editar-aniversario.component.html',
  styleUrl: './editar-aniversario.component.css'
})

export class EditarAniversarioComponent implements OnInit {

  ips_locales: any = '';

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

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
    private restB: MensajesNotificacionesService,
    private toastr: ToastrService,
    public ventana: MatDialogRef<EditarAniversarioComponent>,
    public validar: ValidacionesService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });
    this.ImprimirDatos();
  }

  // MOSTRAR DATOS EN FORMULARIO
  ImprimirDatos() {
    this.formulario.patchValue({
      mensajeForm: this.data.mensaje,
      tituloForm: this.data.asunto,
      linkForm: this.data.link
    })
  }

  // ACTUALIZAR DATOS DE ANIVERSARIO
  ModificarMensajeAniversario(form: any) {
    let dataMensaje = {
      mensaje: form.mensajeForm,
      titulo: form.tituloForm,
      link: form.linkForm,
      tipo: 'aniversario',
      user_name: this.user_name,
      ip: this.ip,
      ip_local: this.ips_locales
    }
    if (form.imagenForm != undefined && form.imagenForm != '' && form.imagenForm != 'null') {
      this.VerificarArchivo(dataMensaje);
    }
    else {
      this.restB.EditarMensajeNotificaciones(this.data.id, dataMensaje).subscribe(res => {
        this.toastr.success('Operación exitosa.', 'Registro actualizado.', {
          timeOut: 6000,
        });
        this.ventana.close(true);
      })
    }
  }

  // CERRAR VENTANA DE REGISTRO
  CerrarVentana() {
    this.ventana.close(false);
  }

  // LIMPIAR CAMPO DE FORMATO ARCHIVO
  LimpiarNombreArchivo() {
    this.formulario.patchValue({
      imagenForm: '',
    });
  }

  /** ******************************************************************************** **
   ** **                             SUBIR IMAGEN DE CUMPLEÑOS                      ** **
   ** ******************************************************************************** **/

  // SELECCIONAR IMAGEN
  nameFile: string;
  archivoSubido: Array<File>;

  fileChange(element: any) {
    this.archivoSubido = element.target.files;
    if (this.archivoSubido.length != 0) {
      const name = this.archivoSubido[0].name;
      let arrayItems = name.split(".");
      let itemExtencion = arrayItems[arrayItems.length - 1];
      if (itemExtencion == 'png' || itemExtencion == 'jpg' ||
        itemExtencion == 'jpeg' || itemExtencion == 'gif') {
        this.formulario.patchValue({ imagenForm: name });
      }
      else {
        this.toastr.warning(
          'Formatos aceptados .png, .jpg, .gif y .jpeg.', 'Error formato del archivo.', {
          timeOut: 6000,
        });
        this.archivoForm.reset();
        this.nameFile = '';
      }
    }
  }

  // GUARDAR DATOS DE IMAGEN
  SubirImagen(id: number) {
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads", this.archivoSubido[i], this.archivoSubido[i].name);
    }
    formData.append('user_name', this.user_name as string);
    formData.append('ip', this.ip as string);
    formData.append('ip_local', this.ips_locales);

    this.restB.SubirImagenNotificaciones(formData, id).subscribe(res => {
      this.toastr.success('Operación exitosa.', 'Imagen subida con éxito.', {
        timeOut: 6000,
      });
      this.archivoForm.reset();
      this.nameFile = '';
    });
  }

  // METODO PARA VERIFICAR TAMAÑO DEL ARCHIVO
  VerificarArchivo(data: any) {
    if (this.archivoSubido[0].size <= 2e+6) {
      this.restB.EditarMensajeNotificaciones(this.data.id, data).subscribe(res => {
        this.toastr.success('Operación exitosa.', 'Registro actualizado.', {
          timeOut: 6000,
        });
        this.SubirImagen(this.data.id);
        this.ventana.close(true);
      })
    }
    else {
      this.toastr.info(
        'El archivo ha excedido el tamaño permitido.', 'Tamaño de archivos permitido máximo 2MB.', {
        timeOut: 6000,
      });
    }
  }

}
