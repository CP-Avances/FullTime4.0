// IMPORTAR LIBRERIAS
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

// IMPORTAR SERVICIOS
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { LoginService } from 'src/app/servicios/login/login.service';

@Component({
  selector: 'app-olvidar-frase',
  templateUrl: './olvidar-frase.component.html',
  styleUrls: ['./olvidar-frase.component.css']
})

export class OlvidarFraseComponent implements OnInit {

  // VARIABLES DE FORMULARIO
  cadena: string;
  mensaje: any = [];//ALMACENAMIENTO DE CODIGO EMPRESARIAL

  correo = new FormControl('', [Validators.required, Validators.email]);
  empresa = new FormControl('', [Validators.required]);
  cedula = new FormControl('', [Validators.required]);

  // FORMULARIO
  public formulario = new FormGroup({
    usuarioF: this.correo,
    empresaF: this.empresa,
    cedulaF: this.cedula
  });

  constructor(
    public restLogin: LoginService,
    private toastr: ToastrService,
    public restE: EmpresaService,
    public rest: UsuarioService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  // MENSAJES DE ERROR PARA EL USUARIO
  ObtenerMensajeError() {
    if (this.correo.hasError('required')) {
      return 'Ingresar correo de usuario.';
    }
    if (this.correo.hasError('email')) {
      return 'No es un correo electrónico.';
    }
    if (this.empresa.toString().trim().length === 0) {
      return 'Ingrese código empresarial';
    }
    if (this.cedula.toString().trim().length === 0) {
      return 'Ingrese cédula';
    }
  }

  // METODO PARA ENVIAR CORREO ELECTRONICO
  respuesta: any = [];
  EnviarCorreoConfirmacion(form: any) {
    //JSON CON CODIGO EMPRESARIAL ENCRIPTADO
    let empresas = {
      "codigo_empresa": form.empresaF.toString()
    };
    //VALIDACION DE CODIGO EMPRESARIAL
    this.restLogin.getEmpresa(empresas).subscribe(
      {
        next: (v) => {
          //ALMACENAMIENTO DE IP DEPENDIENDO EL RESULTADO DE LA VALIDACION
          this.mensaje = v;
          if (this.mensaje.message === 'ok') {
            localStorage.setItem("empresaURL", this.mensaje.empresas[0].empresa_direccion);
          }
          else if (this.mensaje.message === 'vacio') {
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
          console.log('CONTINUAR RUTA');
          //CONSULTA CADENA IP PARA ARMAR URL EN CORREO
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
                  //CONTINUA PROCESO NORMAL
                  console.log('CONTINUAR FRASE');
                  //INICIO FRASE
                  let dataPass = {
                    correo: form.usuarioF,
                    url_page: this.cadena,
                    cedula: form.cedulaF
                  };

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
                      this.empresa.reset();
                      this.cedula.reset();
                      this.router.navigate(['/login']);
                    }
                  }, error => {
                    this.toastr.error('El correo electrónico o cédula o frase ingresado no consta en los registros.', 'Ups!!! algo salio mal.', {
                      timeOut: 6000,
                    });
                    this.correo.reset();
                    this.empresa.reset();
                    this.cedula.reset();
                  });
                  //FIN FRASE
                }
            }  
          );
        }
      }
    );
  }

  // METODO PARA CANCELAR REGISTRO
  Cancelar() {
    this.router.navigate(['/login']);
  }

  // METODO PARA BUSCAR RUTA DEL SISTEMA
  VerRuta() {
    this.restE.ConsultarEmpresaCadena().subscribe(res => {
      this.cadena = res[0].cadena;
      console.log(this.cadena);
    });
  }

}
