import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

import { LoginService } from 'src/app/servicios/login/login.service';
import { EmpresaService } from 'src/app/servicios/configuracion/parametrizacion/catEmpresa/empresa.service';

@Component({
  selector: 'app-olvidar-contrasenia',
  templateUrl: './olvidar-contrasenia.component.html',
  styleUrls: ['./olvidar-contrasenia.component.css']
})

export class OlvidarContraseniaComponent implements OnInit {
  cadena: string;
  mensaje: any = [];//Almacenamiento de respuesta de validacion de codigo empresarial

  correo = new FormControl('', [Validators.required, Validators.email]);
  cedula = new FormControl('', [Validators.required]);
  empresa = new FormControl('', [Validators.required]);

  public formulario = new FormGroup({
    usuarioF: this.correo,
    cedulaF: this.cedula,
    empresaF: this.empresa
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
    if (this.empresa.toString().trim().length === 0) {
      return 'Ingrese código empresarial';
    }
    if (this.cedula.toString().trim().length === 0) {
      return 'Ingrese cédula';
    }
  }

  // METODO DE ENVIO DE CORREO ELECTRONICO PARA RECUPERAR CUENTA
  respuesta: any = [];
  EnviarCorreoConfirmacion(form: any) {
    //CODIGO EMPRESARIAL ENCRIPTADO, PARA VALIDAR CON SERVICIO
    let empresas = {
      "codigo_empresa": form.empresaF.toString()
    };

    //VALIDACION DE CODIGO EMPRESARIAL
    this.rest.getEmpresa(empresas).subscribe(
      {
        next: (v) => 
          {
            //ALMACENAMIENTO DE IP DEPENDIENDO EL RESULTADO DE LA VALIDACION
            this.mensaje = v;
            if (this.mensaje.message === 'ok') {
              localStorage.setItem("empresaURL", this.mensaje.empresas[0].empresa_direccion);
            }
            else if (this.mensaje.message === 'vacio') {
              this.toastr.error('Verifique código empresarial', 'Error', {
                timeOut: 3000,
              });
            }
          },
        error: (e) => 
          {
            this.toastr.error('Verifique código empresarial', 'Error', {
              timeOut: 3000,
            });
          },
        complete: () => 
          {
            //CONSULTA CADENA IP PARA ARMAR URL ADJUNTADO EN CORREO
            console.log('CONTINUAR RECUPERACIÓN - SETEO RUTA');
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
                    //CONTINUA PROCESO NORMAL ENVIO CORREO
                    //INICIO RECUPERACION
                    let dataPass = {
                      correo: form.usuarioF,
                      url_page: this.cadena,
                      cedula: form.cedulaF
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
                        this.cedula.reset();
                        this.empresa.reset();
                        this.router.navigate(['/login']);
                      }
                    }, error => {
                      this.toastr.error('El correo electrónico o cédula ingresado no consta en los registros.', 'Ups!!! algo salio mal.', {
                        timeOut: 6000,
                      });
                      this.correo.reset();
                      this.cedula.reset();
                      this.empresa.reset();
                    });
                    //FIN RECUPERACION
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
