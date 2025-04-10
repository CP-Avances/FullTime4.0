import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from 'src/app/servicios/login/login.service';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
// import { Md5 } from 'ts-md5';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';

@Component({
  selector: 'app-confirmar-contrasenia',
  standalone: false,
  templateUrl: './confirmar-contrasenia.component.html',
  styleUrls: ['./confirmar-contrasenia.component.css']
})

export class ConfirmarContraseniaComponent implements OnInit {
  ips_locales: any = '';

  hide1 = true;
  hide2 = true;
  token: string;
  mensaje: any = [];
  NuevaContrasenia = new FormControl('', Validators.maxLength(12));
  ConfirmarContrasenia = new FormControl('', Validators.maxLength(12));
  CodigoEmpresa = new FormControl('');
  mensajeURL: any = [];

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

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
    public validar: ValidacionesService,
  ) {
    var urlToken = this.location.prepareExternalUrl(this.location.path());
    this.token = urlToken.slice(1).split("/")[1];
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });
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
    let data = {
      token: this.token,
      contrasena: form.cPass,
      user_name: this.user_name,
      ip: this.ip, 
      ip_local: this.ips_locales
    };

    //JSON CON CODIGO EMPRESARIAL ENCRIPTADO
    let empresas = {
      "codigo_empresa": form.empresaPass.toString()
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
          this.toastr.error('Verifique codigo empresarial', 'Error.', {
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
