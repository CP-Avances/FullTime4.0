import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

import { LoginService } from 'src/app/servicios/login/login.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';

@Component({
  selector: 'app-olvidar-contrasenia',
  templateUrl: './olvidar-contrasenia.component.html',
  styleUrls: ['./olvidar-contrasenia.component.css']
})

export class OlvidarContraseniaComponent implements OnInit {

  cadena: string;

  correo = new FormControl('', [Validators.required, Validators.email]);

  public formulario = new FormGroup({
    usuarioF: this.correo,
  });

  constructor(
    public rest: LoginService,
    public restE: EmpresaService,
    private router: Router,
    private toastr: ToastrService) { }

  ngOnInit(): void {
    this.VerRuta();
  }

  // MENSAJES DE ERRORES EN FORMULARIO
  ObtenerMensajeCampoUsuarioError() {
    if (this.correo.hasError('required')) {
      return 'Ingresar correo de usuario';
    }
    if (this.correo.hasError('email')) {
      return 'No es un correo electrónico';
    }
  }

  // METODO DE ENVIO DE CORREO ELECTRONICO PARA RECUPERAR CUENTA
  respuesta: any = [];
  EnviarCorreoConfirmacion(form: any) {
    let dataPass = {
      correo: form.usuarioF,
      url_page: this.cadena
    }
    this.rest.EnviarCorreoContrasena(dataPass).subscribe(res => {
      this.respuesta = res;
      if (this.respuesta.message === 'ok') {
        this.toastr.success('Operación Exitosa.', 'Un link para cambiar la contraseña fue enviado a su correo electrónico.', {
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

  // CERRAR VENTANA DE RECUPERACION DE CUENTA
  Cancelar() {
    this.router.navigate(['/login']);
  }

  // CONSULTAR DATOS DE EMPRESA
  VerRuta() {
    this.restE.ConsultarEmpresaCadena().subscribe(res => {
      this.cadena = res[0].cadena
    })
  }

}
