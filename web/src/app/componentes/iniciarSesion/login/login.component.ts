import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DateTime, Duration } from 'luxon';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { LoginService } from '../../../servicios/login/login.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario/usuario.service';
import { AsignacionesService } from 'src/app/servicios/usuarios/asignaciones/asignaciones.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {

  intentos: number = 0;
  title = 'login';
  hide1 = true;
  url: string = '';
  mensaje: any = [];//Variable para almacenar valor de empresa consultado

  // ALMACENAMIENTO DATOS USUARIO INGRESADO
  datosUsuarioIngresado: any = [];

  ips_locales: any = '';

  // VALIDACIONES DE CAMPOS DE FORMULARIO
  userMail = new FormControl('', Validators.required);
  pass = new FormControl('', Validators.required);
  //EMPRESA
  empresaSel = new FormControl('', Validators.required);
  //Valor para encriptar código empresarial de la vista
  datoEncriptado: string;

  //Se aumenta el valor capturado de la vista para el código empresarial
  public formulario = new FormGroup({
    usuarioF: this.userMail,
    passwordF: this.pass,
    empresaF: this.empresaSel
  });

  constructor(
    public rest: LoginService,
    public restU: UsuarioService,
    public validar: ValidacionesService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private asignacionesService: AsignacionesService,
  ) {
    this.formulario.setValue({
      usuarioF: '',
      passwordF: '',
      empresaF: ''
    });
  }

  ngOnInit(): void {
    this.url = this.router.url;
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
      //console.log("IPs Locales del Cliente:", ips);
    });
  }

  // MENSAJE DE ERROR AL INGRESAR INFORMACION
  ObtenerMensajeCampoUsuarioError() {
    if (this.userMail.hasError('required')) {
      return 'Ingresar nombre de usuario.';
    }
  }

  // MENSAJE DE ERROR AL INGRESAR INFORMACION
  ObtenerMensajeCampoContraseniaError() {
    if (this.pass.hasError('required')) {
      return 'Ingresar contraseña.';
    }
  }

  // VALIDACION DE INGRESO DE DATOS DE USUARIO - INTENTOS LIMITADOS
  ValidarUsuario(form: any) {
    var f = DateTime.now();
    if (form.usuarioF.trim().length === 0) return;
    if (form.passwordF.trim().length === 0) return;
    if (form.empresaF.trim().length === 0) return;

    //Inicio Encriptacion código empresarial
    console.log('empresaF: ', form.empresaF, ' ', form.empresaF.length);
    //this.datoEncriptado = this.rsaKeysService.encriptarLogin(form.empresaF.toString());
    //console.log('Encrypted Data:', this.datoEncriptado, ' ', this.datoEncriptado.length);
    //Fin Encriptacion código empresarial

    //Codigo empresarial encriptado a JSON para uso con servicio
    let empresas = {
      "codigo_empresa": form.empresaF.toString()
    };

    //VALIDACION DE EMPRESA PARA DIRECCIONAMIENTO
    this.rest.getEmpresa(empresas).subscribe(
      {
        next: (v) => 
        {
          //GUARDAMOS IP O DEVOLVEMOS ERROR
          this.mensaje = v;
          if (this.mensaje.message === 'ok') {
            console.log("empresaURL: ", this.mensaje.empresas[0].empresa_direccion);
            localStorage.setItem("empresaURL", this.mensaje.empresas[0].empresa_direccion);
          }
          else if (this.mensaje.message === 'vacio') {
            this.toastr.error('Verifique código empresarial', 'Error.', {
              timeOut: 3000,
            });
          }
        },
        error: (e) => 
        {
          //En caso de error, devolvemos error
          this.toastr.error('Verifique código empresarial', 'Error.', {
            timeOut: 3000,
          });
        },
        complete: () => 
        {
          //TRAS VALIDACION CORRECTA DE EMPRESA, CONTINUA EL PROCESO NORMAL DE LOGIN
          console.log('CONTINUAR LOGIN');          
          //LOGIN
          var local: boolean;
          this.intentos = this.intentos + 1;

          var hora = localStorage.getItem('time_wait');

          if (hora != undefined) {
            if (f.toFormat('HH:mm:ss') > hora) {
              localStorage.removeItem('time_wait');
              this.intentos = 0;
              local = false;
            }
            else {
              local = true;
            }
          }
          else {
            local = false;
          }
          if (local === false) {
            this.IniciarSesion(form);
          }
          else {
            this.toastr.error('Intentelo más tarde.', 'Ha excedido el número de intentos.', {
              timeOut: 3000,
            });
          }
          //FIN LOGIN
        }
      }
    );
  }

  // METODO PARA INICIAR SESION
  async IniciarSesion(form: any) {
    console.log('IniciarSesion');
    // CIFRADO DE CONTRASENA
    let clave = form.passwordF.toString();

    let dataUsuario = {
      nombre_usuario: form.usuarioF,
      pass: clave,
      movil: false
    };
    console.log('dataUsuario', dataUsuario);

    try {
      const datos = await this.rest.ValidarCredenciales(dataUsuario);
      console.log('res login ', datos)

      if (datos.message === 'error') {
        const f = DateTime.now();

        if (this.intentos === 200) {
          const verificar = f.plus({ minutes: 1 }).toFormat('HH:mm:ss');
          localStorage.setItem('time_wait', verificar);

          this.toastr.error('Intentelo más tarde.', 'Ha exedido el número de intentos.', {
            timeOut: 3000,
          });

        } else {
          this.toastr.error('Usuario o contraseña no son correctos.', 'Ups!!! algo ha salido mal.', {
            timeOut: 6000,
          });
        }

        return;

      } else {
        const mensajesError: { [key: string]: string } = {
          error_: "Usuario no cumple con todos los requerimientos necesarios para acceder al sistema.",
          inactivo: "Usuario no se encuentra activo en el sistema.",
          licencia_expirada: "Licencia del sistema ha expirado.",
          sin_permiso_acceso: "Usuario no tiene permisos de acceso al sistema.",
          licencia_no_existe: "No se ha encontrado registro de licencia del sistema.",
          sin_permiso_acces_movil: "Usuario no habilitado para usar la aplicación móvil.",
        };

        if (mensajesError[datos.message]) {
          return this.toastr.error(mensajesError[datos.message], 'Oops!', {
            timeOut: 6000,
          });
        }

        localStorage.setItem('rol', datos.rol);
        localStorage.setItem('token', datos.token);
        localStorage.setItem('ip', datos.ip_adress);
        localStorage.setItem('usuario', datos.usuario);
        localStorage.setItem('empresa', datos.empresa);
        localStorage.setItem('sucursal', datos.sucursal);
        localStorage.setItem('ultimoCargo', datos.cargo);
        localStorage.setItem('empleado', datos.empleado);
        localStorage.setItem('departamento', datos.departamento);
        localStorage.setItem('ultimoContrato', datos.id_contrato);
        localStorage.setItem('bool_timbres', datos.acciones_timbres);
        localStorage.setItem('fec_caducidad_licencia', datos.caducidad_licencia);

        this.asignacionesService.ObtenerAsignacionesUsuario(datos.empleado);
        this.toastr.success('Ingreso Existoso! ' + datos.usuario + ' ' + datos.ip_adress, 'Usuario y contraseña válidos', {
          timeOut: 6000,
        });

        if (!!localStorage.getItem("redireccionar")) {
          let redi = localStorage.getItem("redireccionar");
          this.router.navigate([redi], { relativeTo: this.route, skipLocationChange: false });
          localStorage.removeItem("redireccionar");
        } else {
          this.router.navigate(['/home']);
        };

      }

    } catch (error: any) {
      this.toastr.error(error.error.message)
    }
  }

}
