import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef } from '@angular/material/dialog';

import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { MensajesNotificacionesService } from 'src/app/servicios/notificaciones/mensajesNotificaciones/mensajes-notificaciones.service';

@Component({
  selector: 'app-registrar-birthday',
  standalone: false,
  templateUrl: './registrar-birthday.component.html',
  styleUrls: ['./registrar-birthday.component.css']
})

export class RegistrarBirthdayComponent implements OnInit {
  ips_locales: any = '';

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

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    private toastr: ToastrService,
    private restB: MensajesNotificacionesService,
    public ventana: MatDialogRef<RegistrarBirthdayComponent>,
    public validar: ValidacionesService,
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });
  }

  // GUARDAR DATOS DE MENSAJE
  InsertarMensajeBirthday(form: any) {
    let dataMensaje = {
      id_empresa: this.id_empresa,
      mensaje: form.mensajeForm,
      titulo: form.tituloForm,
      link: form.linkForm,
      tipo: 'cumpleanios',
      user_name: this.user_name,
      ip: this.ip,
      ip_local: 
      this.ips_locales
    }
    this.restB.CrearMensajeNotificaciones(dataMensaje).subscribe(res => {
      this.SubirRespaldo(res[0].id)
      this.ventana.close(true);
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
        if (itemExtencion === 'png' || itemExtencion === 'jpg' ||
          itemExtencion === 'jpeg' || itemExtencion === 'gif') {
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
      formData.append("uploads", this.archivoSubido[i], this.archivoSubido[i].name);
    }
    formData.append('user_name', this.user_name as string);
    formData.append('ip', this.ip as string);
    formData.append('ip_local', this.ips_locales);

    this.restB.SubirImagenNotificaciones(formData, id).subscribe(res => {
      this.toastr.success('Operación exitosa.', 'Imagen subida con éxito.', {
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
