import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

import { LoginService } from 'src/app/servicios/login/login.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { RsaKeysService } from 'src/app/servicios/llaves/rsa-keys.service';//Importacion de encriptacion

@Component({
  selector: 'app-olvidar-contrasenia',
  templateUrl: './olvidar-contrasenia.component.html',
  styleUrls: ['./olvidar-contrasenia.component.css']
})

export class OlvidarContraseniaComponent implements OnInit {
  cadena: string;
  mensaje: any = [];//Almacenamiento de respuesta de validacion de codigo empresarial

  correo = new FormControl('', [Validators.required, Validators.email]);
  empresa = new FormControl('', [Validators.required]);

  public formulario = new FormGroup({
    usuarioF: this.correo,
    empresaF: this.empresa,
  });

  constructor(
    public rest: LoginService,
    public restE: EmpresaService,
    private router: Router,
    private toastr: ToastrService,
    private rsaKeysService: RsaKeysService) { }

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
    if (this.empresa.toString().trim().length === 0) {
      return 'Ingrese codigo empresarial';
    }
  }

  // METODO DE ENVIO DE CORREO ELECTRONICO PARA RECUPERAR CUENTA
  respuesta: any = [];
  EnviarCorreoConfirmacion(form: any) {
    //Codigo empresarial encriptado, para validar con servicio
    let empresas = {
      "codigo_empresa": this.rsaKeysService.encriptarLogin(form.empresaF.toString())
    };

    //Validacion de codigo empresarial
    this.rest.getEmpresa(empresas).subscribe(
      {
        next: (v) => 
          {
            //Almacenamiento de ip dependiendo el resultado de la validacion
            this.mensaje = v;
            if (this.mensaje.message === 'ok') {
              localStorage.setItem("empresaURL", this.mensaje.empresas[0].empresa_direccion);
            }
            else if (this.mensaje.message === 'vacio') {
              this.toastr.error('Verifique codigo empresarial', 'Error', {
                timeOut: 3000,
              });
            }
          },
        error: (e) => 
          {
            this.toastr.error('Verifique codigo empresarial', 'Error', {
              timeOut: 3000,
            });
          },
        complete: () => 
          {
            //Consulta cadena IP para armar url en correo
            console.log('CONTINUAR RECU - SETEO RUTA');
            this.restE.ConsultarEmpresaCadena().subscribe(
              {
                next: (v) => 
                  {
                    this.cadena = v[0].cadena;
                  },
                error: (e) => 
                  {
                    this.toastr.error('No se ha definido ruta de instalación.', 'Ups!!! algo salio mal.', {
                      timeOut: 6000,
                    });
                  },
                complete: () => 
                  {
                    //Continua proceso normal envio correo
                    //inicio recuperacion
                    let dataPass = {
                      correo: form.usuarioF,
                      url_page: this.cadena
                    };
                    this.rest.EnviarCorreoContrasena(dataPass).subscribe(res => {
                      this.respuesta = res;
                      if (this.respuesta.message === 'ok') {
                        this.toastr.success('Operación exitosa.', 'Un link para cambiar la contraseña fue enviado a su correo electrónico.', {
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
                    });
                    //fin recuperacion
                  }
              }
            );
          }
      }
    );
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
