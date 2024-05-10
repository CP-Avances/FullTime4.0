import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from 'src/app/servicios/login/login.service';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { RsaKeysService } from 'src/app/servicios/llaves/rsa-keys.service';//Importacion encriptacion

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
  CodigoEmpresa = new FormControl('');
  mensaje: any = [];
  mensajeURL: any = [];

  public formulario = new FormGroup({
    nPass: this.NuevaContrasenia,
    cPass: this.ConfirmarContrasenia,
    empresaPass: this.CodigoEmpresa,
  });

  constructor(
    private restLogin: LoginService,
    private toastr: ToastrService,
    public router: Router,
    public location: Location,
    private rsaKeysService: RsaKeysService,
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
  EnviarContraseniaConfirmacion(form: any) {
    // CIFRADO DE CONTRASEÑA
    let clave = this.rsaKeysService.encriptarLogin(form.cPass.toString());

    let data = {
      token: this.token,
      contrasena: clave
    };

    //JSON CON CODIGO EMPRESARIAL ENCRIPTADO
    let empresas = {
      "codigo_empresa": this.rsaKeysService.encriptarLogin(form.empresaPass.toString())
    };

    //VALIDACION DE CODIGO EMPRESARIAL
    this.restLogin.getEmpresa(empresas).subscribe(
      {
        next: (v) => {
          //ALMACENAMIENTO DE IP DEPENDIENDO EL RESULTADO DE LA VALIDACION
          this.mensajeURL = v;
          if (this.mensajeURL.message === 'ok') {
            localStorage.setItem("empresaURL", this.mensajeURL.empresas[0].empresa_direccion);
          }
          else if (this.mensajeURL.message === 'vacio') {
            this.toastr.error('Verifique codigo empresarial', 'Error.', {
              timeOut: 3000,
            });
          }
        },
        error: (e) => {
          this.toastr.error('Verifique codigo empresarial', 'Error 2.', {
            timeOut: 3000,
          });
        },
        complete: () => {
          //EVENTO PARA RESULTADO SATISFACTORIO
          console.log('CONTINUAR RESTAURACION CONTRASENIA');
          ///CONFIRMAR CAMBIO
          this.restLogin.ActualizarContrasenia(data).subscribe(res => {
            this.mensaje = res;
            if (this.mensaje.expiro === 'si') {
              this.router.navigate(['/olvidar-contrasenia']);
              this.toastr.error(this.mensaje.message, 'Ups!!! algo a salido mal.', {
                timeOut: 6000,
              });
            } else {
              this.router.navigate(['/login']);
              this.toastr.success('Operación exitosa.', this.mensaje.message, {
                timeOut: 6000,
              });
            }
          });
          //FIN CONFIRMAR CAMBIO
        }
      }
    );
  }

}
