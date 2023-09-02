// IMPORTAR LIBRERIAS
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

// IMPORTAR SERVICIOS
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';

@Component({
  selector: 'app-olvidar-frase',
  templateUrl: './olvidar-frase.component.html',
  styleUrls: ['./olvidar-frase.component.css']
})

export class OlvidarFraseComponent implements OnInit {

  // VARIABLES DE FORMULARIO
  cadena: string;
  correo = new FormControl('', [Validators.required, Validators.email]);

  // FORMULARIO
  public formulario = new FormGroup({
    usuarioF: this.correo,
  });

  constructor(
    private toastr: ToastrService,
    public restE: EmpresaService,
    public rest: UsuarioService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.VerRuta();
  }

  // MENSAJES DE ERROR PARA EL USUARIO
  ObtenerMensajeError() {
    if (this.correo.hasError('required')) {
      return 'Ingresar correo de usuario.';
    }
    if (this.correo.hasError('email')) {
      return 'No es un correo electrónico.';
    }
  }

  // METODO PARA ENVIAR CORREO ELECTRONICO
  respuesta: any = [];
  EnviarCorreoConfirmacion(form: any) {
    let dataPass = {
      correo: form.usuarioF,
      url_page: this.cadena
    }
    this.rest.RecuperarFraseSeguridad(dataPass).subscribe(res => {
      this.respuesta = res;
      if (this.respuesta.message === 'ok') {
        this.toastr.success('Operación exitosa.', 'Un link para cambiar su frase de seguridad fue enviado a su correo electrónico.', {
          timeOut: 6000,
        });
        this.router.navigate(['/login']);
      }
      else {
        this.toastr.error('Revisar la configuración de correo electrónico.', 'Ups!!! algo salio mal.', {
          timeOut: 6000,
        });
        this.correo.reset();
        this.router.navigate(['/login']);
      }
    }, error => {
      this.toastr.error('El correo electrónico ingresado no consta en los registros.', 'Ups!!! algo salio mal.', {
        timeOut: 6000,
      });
      this.correo.reset();
    })
  }

  // METODO PARA CANCELAR REGISTRO
  Cancelar() {
    this.router.navigate(['/login']);
  }

  // METODO PARA BUSCAR RUTA DEL SISTEMA
  VerRuta() {
    this.restE.ConsultarEmpresaCadena().subscribe(res => {
      this.cadena = res[0].cadena
    })
  }

}
