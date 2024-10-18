// SECCION DE LIBRERIAS
import { FormControl } from '@angular/forms';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

// SECCION DE SERVICIOS
import { ToastrService } from 'ngx-toastr';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';

@Component({
  selector: 'app-logos',
  templateUrl: './logos.component.html',
  styleUrls: ['./logos.component.css']
})

export class LogosComponent implements OnInit {

  logo: string;
  textoBoton: string = 'Editar';

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    public restE: EmpresaService,
    public ventana: MatDialogRef<LogosComponent>,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

    this.MostrarImagen();
  }

  // METODO PARA MOSTRAR LOGOS
  MostrarImagen() {
    if (this.data.pagina === 'empresa') {
      this.VerLogoEmpresa();
    } else if (this.data.pagina === 'header') {
      this.VerCabeceraCorreo();
    } else if (this.data.pagina === 'footer') {
      this.VerPieCorreo();
    }
  }

  // METODO PARA SELECCIONAR LOGO DE EQUIPO
  archivoSubido: Array<File>;
  archivoForm = new FormControl('');
  fileChange(element: any) {
    this.archivoSubido = element.target.files;
    if (this.archivoSubido.length != 0) {
      const name = this.archivoSubido[0].name;
      let arrayItems = name.split(".");
      let itemExtencion = arrayItems[arrayItems.length - 1];
      if (this.archivoSubido[0].size <= 2e+6) {
        if (itemExtencion == 'png' || itemExtencion == 'jpg' ||
          itemExtencion == 'jpeg' || itemExtencion == 'gif') {
          if (this.data.pagina === 'empresa') {
            this.ActualizarLogoEmpresa();
          } else if (this.data.pagina === 'header') {
            this.ActualizarCabeceraCorreo();
          } else if (this.data.pagina === 'footer') {
            this.ActualizarPieCorreo();
          }
        }
        else {
          this.toastr.warning('Formatos aceptados .png, .jpg, .gif y .jpeg.', 'Error formato del archivo.', {
            timeOut: 6000,
          });
        }
      }
      else {
        this.toastr.info('El archivo ha excedido el tamaño permitido.', 'Tamaño de archivos permitido máximo 2MB.', {
          timeOut: 6000,
        });
      }
    }
  }

  /** ************************************************************************************** **
   ** **              METODOS PARA CONSULTAR Y ACTUALIZAR LOGO DE EMPRESA                 ** **
   ** ************************************************************************************** **/

  ActualizarLogoEmpresa() {
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("image", this.archivoSubido[i], this.archivoSubido[i].name);
    }

    formData.append("user_name", this.user_name as string);
    formData.append("ip", this.ip as string);

    this.restE.EditarLogoEmpresa(this.data.empresa, formData).subscribe(res => {
      this.logo = 'data:image/jpeg;base64,' + res.imagen;
      if (res.imagen != 0) { this.textoBoton = 'Editar' };
      this.toastr.success('Operación exitosa.', 'Logotipo actualizado.', {
        timeOut: 6000,
      });
      this.archivoForm.reset();
      this.ventana.close({ actualizar: true });
    });
  }

  imagen_default: boolean = true;
  VerLogoEmpresa() {
    this.restE.LogoEmpresaImagenBase64(this.data.empresa).subscribe(res => {
      if (res.imagen === 0) {
        this.textoBoton = 'Añadir';
        this.imagen_default = true
      }
      else {
        this.logo = 'data:image/jpeg;base64,' + res.imagen;
        this.imagen_default = false;
      };
    });
  }

  /** ************************************************************************************** **
   ** **             METODOS PARA CONSULTAR Y ACTUALIZAR CABECERA DE CORREO               ** **
   ** ************************************************************************************** **/

  ActualizarCabeceraCorreo() {
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("image", this.archivoSubido[i], this.archivoSubido[i].name);
    }

    formData.append("user_name", this.user_name as string);
    formData.append("ip", this.ip as string);

    this.restE.EditarCabeceraCorreo(this.data.empresa, formData).subscribe(res => {
      this.logo = 'data:image/jpeg;base64,' + res.imagen;
      if (res.imagen != 0) { this.textoBoton = 'Editar' };
      this.toastr.success('Operación exitosa.', 'Logotipo actualizado.', {
        timeOut: 6000,
      });
      this.archivoForm.reset();
      this.ventana.close({ actualizar: true });
    });
  }

  VerCabeceraCorreo() {
    this.restE.ObtenerCabeceraCorreo(this.data.empresa).subscribe(res => {
      if (res.imagen === 0) {
        this.textoBoton = 'Añadir';
        this.imagen_default = true;
      }
      else {
        this.logo = 'data:image/jpeg;base64,' + res.imagen;
        this.imagen_default = false;
      }
    });
  }

  /** ************************************************************************************** **
   ** **             METODOS PARA CONSULTAR Y ACTUALIZAR PIE DE CORREO                    ** **
   ** ************************************************************************************** **/

  ActualizarPieCorreo() {
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("image", this.archivoSubido[i], this.archivoSubido[i].name);
    }

    formData.append("user_name", this.user_name as string);
    formData.append("ip", this.ip as string);

    this.restE.EditarPieCorreo(this.data.empresa, formData).subscribe(res => {
      this.logo = 'data:image/jpeg;base64,' + res.imagen;
      if (res.imagen != 0) { this.textoBoton = 'Editar' };
      this.toastr.success('Operación exitosa.', 'Logotipo actualizado.', {
        timeOut: 6000,
      });
      this.archivoForm.reset();
      this.ventana.close({ actualizar: true });
    });
  }

  VerPieCorreo() {
    this.restE.ObtenerPieCorreo(this.data.empresa).subscribe(res => {
      if (res.imagen === 0) {
        this.textoBoton = 'Añadir';
        this.imagen_default = true;
      } else {
        this.logo = 'data:image/jpeg;base64,' + res.imagen;
        this.imagen_default = false;
      }
    });
  }

}
