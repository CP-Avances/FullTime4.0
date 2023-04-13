import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from 'src/app/servicios/login/login.service';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Md5 } from 'ts-md5';

@Component({
  selector: 'app-confirmar-contrasenia',
  templateUrl: './confirmar-contrasenia.component.html',
  styleUrls: ['./confirmar-contrasenia.component.css']
})

export class ConfirmarContraseniaComponent implements OnInit {

  hide1 = true;
  hide2 = true;
  token: string;
  NuevaContrasenia = new FormControl('', Validators.maxLength(12));
  ConfirmarContrasenia = new FormControl('', Validators.maxLength(12));
  mensaje: any = [];

  public formulario = new FormGroup({
    nPass: this.NuevaContrasenia,
    cPass: this.ConfirmarContrasenia
  });

  constructor(
    private restLogin: LoginService,
    private toastr: ToastrService,
    public router: Router,
    public location: Location,
  ) {
    var urlToken = this.location.prepareExternalUrl(this.location.path());
    this.token = urlToken.slice(1).split("/")[1];
  }

  ngOnInit(): void {
  }

  // METODO PARA COMPARAR LAS CONTRASEÑAS
  CompararContrasenia(form: any) {
    if (form.nPass != form.cPass) {
      this.toastr.error('Incorrecto', 'Las constrasenias no coinciden.', {
        timeOut: 6000,
      });
    }
  }

  // NETODO PARA CAMBIAR CONTRASEÑA
  EnviarContraseniaConfirmacion(form) {

    // CIFRADO DE CONTRASEÑA
    const md5 = new Md5();
    let clave = md5.appendStr(form.cPass).end();

    let data = {
      token: this.token,
      contrasena: clave
    }
    this.restLogin.ActualizarContrasenia(data).subscribe(res => {
      this.mensaje = res;
      if (this.mensaje.expiro === 'si') {
        this.router.navigate(['/olvidar-contrasenia']);
        this.toastr.error(this.mensaje.message, 'Ups!!! algo a salido mal.', {
          timeOut: 6000,
        });
      } else {
        this.router.navigate(['/login']);
        this.toastr.success('Operación exitosa', this.mensaje.message, {
          timeOut: 6000,
        });
      }
    });
  }

}
