import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
moment.locale('es');

import { LoginService } from '../../../servicios/login/login.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';
import { RsaKeysService } from 'src/app/servicios/llaves/rsa-keys.service';//Importacion de llaves

@Component({
  selector: 'app-login',
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

  // VALIDACIONES DE CAMPOS DE FORMULARIO
  userMail = new FormControl('', Validators.required);
  pass = new FormControl('', Validators.required);
  //Empresa
  empresaSel = new FormControl('', Validators.required);
  //Valor para encriptar codigo empresarial de la vista
  datoEncriptado: string;

  //Se aumenta el valor capturado de la vista para el codigo empresarial
  public formulario = new FormGroup({
    usuarioF: this.userMail,
    passwordF: this.pass,
    empresaF: this.empresaSel
  });

  constructor(
    public rest: LoginService,
    public restU: UsuarioService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private rsaKeysService: RsaKeysService) {
    this.formulario.setValue({
      usuarioF: '',
      passwordF: '',
      empresaF: ''
    });
  }

  latitud: number = -0.1918213;
  longitud: number = -78.4875258;

  private options = {
    enableHighAccuracy: false,
    maximumAge: 30000,
    timeout: 15000
  };

  ngOnInit(): void {
    this.url = this.router.url;
    this.Geolocalizar();
  }

  // METODO QUE PERMITE ACCEDER A UBICACION DEL USUARIO
  Geolocalizar() {
    if (navigator.geolocation) {

      navigator.geolocation.getCurrentPosition(
        (objPosition) => {
          this.latitud = objPosition.coords.latitude;
          this.longitud = objPosition.coords.longitude;
        }, (objPositionError) => {

          switch (objPositionError.code) {
            case objPositionError.PERMISSION_DENIED:
              // NO ES POSIBLE ACCEDER A LA POSICION DEL USUARIO
              break;
            case objPositionError.POSITION_UNAVAILABLE:
              // NO SE HA PODIDO ACCEDER A LA INFORMACION DE SU POSICION
              break;
            case objPositionError.TIMEOUT:
              // EL SERVICIO HA TARDADO DEMASIADO TIEMPO EN RESPONDER
              break;
            default:
            // ERROR DESCONOCIDO
          }
        }, this.options);
    }
    else {
      // EL NAVEGADOR NO SOPORTA LA API DE GEOLOCALIZACION
    }
  }

  // MENSAJE DE ERROR AL INGRESAR INFORMACION
  ObtenerMensajeCampoUsuarioError() {
    if (this.userMail.hasError('required')) {
      return 'Ingresar nombre de usuario.';
    }
  }

  ObtenerMensajeCampoContraseniaError() {
    if (this.pass.hasError('required')) {
      return 'Ingresar contraseña.';
    }
  }

  // VALIDACION DE INGRESO DE DATOS DE USUARIO - INTENTOS LIMITADOS
  ValidarUsuario(form: any) {
    var f = moment();
    if (form.usuarioF.trim().length === 0) return;
    if (form.passwordF.trim().length === 0) return;
    if (form.empresaF.trim().length === 0) return;

    //Inicio Encriptacion codigo empresarial
    console.log('Encriptando IP: ', form.empresaF, ' ', form.empresaF.length);
    this.datoEncriptado = this.rsaKeysService.encriptarLogin(form.empresaF.toString());
    console.log('Encrypted Data:', this.datoEncriptado, ' ', this.datoEncriptado.length);
    //Fin Encriptacion codigo empresarial

    //Codigo empresarial encriptado a JSON para uso con servicio
    let empresas = {
      "codigo_empresa": this.datoEncriptado
    };

    //Validacion de empresa para direccionamiento
    this.rest.getEmpresa(empresas).subscribe(
      {
        next: (v) => 
        {
          //Segun el valor de la respuesta guardamos la IP o devolvemos error.
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
        error: (e) => 
        {
          //En caso de error, devolvemos error
          this.toastr.error('Verifique codigo empresarial', 'Error.', {
            timeOut: 3000,
          });
        },
        complete: () => 
        {
          //Tras la validacion correcta de empresa, continuamos con el proceso normal de login
          console.log('CONTINUAR LOGIN');          
          ////login
          var local: boolean;
          this.intentos = this.intentos + 1;

          var hora = localStorage.getItem('time_wait');

          if (hora != undefined) {
            if (f.format('HH:mm:ss') > hora) {
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
          ////fin login
        }
      }
    );
  }

  // METODO PARA INICIAR SESION
  IniciarSesion(form: any) {
    // CIFRADO DE CONTRASEÑA
    let clave = this.rsaKeysService.encriptarLogin(form.passwordF.toString());
    
    let dataUsuario = {
      nombre_usuario: form.usuarioF,
      pass: clave,
    };

    if (this.latitud === undefined) {
      this.Geolocalizar();
      return this.toastr.error('Es necesario permitir el acceso a la ubicación del usuario.');
    }

    // VALIDACION DEL LOGIN
    this.rest.ValidarCredenciales(dataUsuario).subscribe(datos => {
      if (datos.message === 'error') {
        var f = moment();
        var espera = '00:01:00';
        if (this.intentos === 3) {
          var verificar = f.add(moment.duration(espera)).format('HH:mm:ss');
          localStorage.setItem('time_wait', verificar);
          this.toastr.error('Intentelo más tarde.', 'Ha exedido el número de intentos.', {
            timeOut: 3000,
          });
        }
        else {
          this.toastr.error('Usuario o contraseña no son correctos.', 'Ups!!! algo ha salido mal.', {
            timeOut: 6000,
          })
        }
        this.IngresoSistema(form.usuarioF, 'Fallido', datos.text);
      }

      else if (datos.message === 'error_') {
        this.toastr.error('Usuario no cumple con todos los requerimientos necesarios para acceder al sistema.', 'Oops!', {
          timeOut: 6000,
        })
      }

      else if (datos.message === 'inactivo') {
        this.toastr.error('Usuario no se encuentra activo en el sistema.', 'Oops!', {
          timeOut: 6000,
        })
      }

      else if (datos.message === 'licencia_expirada') {
        this.toastr.error('Licencia del sistema ha expirado.', 'Oops!', {
          timeOut: 6000,
        })
      }

      else if (datos.message === 'sin_permiso_acceso') {
        this.toastr.error('Usuario no tiene permisos de acceso al sistema.', 'Oops!', {
          timeOut: 6000,
        })
      }

      else if (datos.message === 'licencia_no_existe') {
        this.toastr.error('No se ha encontrado registro de licencia del sistema.', 'Oops!', {
          timeOut: 6000,
        })
      }
      else {
        localStorage.setItem('rol', datos.rol);
        localStorage.setItem('token', datos.token);
        localStorage.setItem('ip', datos.ip_adress);
        localStorage.setItem('usuario', datos.usuario);
        localStorage.setItem('empresa', datos.empresa);
        localStorage.setItem('autoriza', datos.estado);
        localStorage.setItem('sucursal', datos.sucursal);
        localStorage.setItem('ultimoCargo', datos.cargo);
        localStorage.setItem('empleado', datos.empleado);
        localStorage.setItem('departamento', datos.departamento);
        localStorage.setItem('ultimoContrato', datos.id_contrato);
        localStorage.setItem('bool_timbres', datos.acciones_timbres);
        localStorage.setItem('fec_caducidad_licencia', datos.caducidad_licencia);

        this.toastr.success('Ingreso Existoso! ' + datos.usuario + ' ' + datos.ip_adress, 'Usuario y contraseña válidos', {
          timeOut: 6000,
        });
        console.log('datos.rol ', datos.rol);
        if (!!localStorage.getItem("redireccionar")) {
          let redi = localStorage.getItem("redireccionar");
          this.router.navigate([redi], { relativeTo: this.route, skipLocationChange: false });
          localStorage.removeItem("redireccionar");
        } else {
          this.router.navigate(['/home'])
        };
        //REDIRECCIONAMIENTO A /home Y RECARGA TRAS LOGIN
        /*
        if (datos.rol === 1) { // ADMIN
          console.log('ver redireccionar ', localStorage.getItem("redireccionar"));
          if (!!localStorage.getItem("redireccionar")) {
            let redi = localStorage.getItem("redireccionar");
            this.router.navigate([redi], { relativeTo: this.route, skipLocationChange: false });
            localStorage.removeItem("redireccionar");
          } else {
            this.router.navigate(['/home'])
          };
        }else{
          // EMPLEADO
          this.router.navigate(['/home']);
          //this.router.navigate(['/estadisticas']);
        }
        */
        //this.IngresoSistema(form.usuarioF, 'Exitoso', datos.ip_adress);

        /*
        //inicio recarga pagina al inicio, recarga valores iniciales por defecto
        const paginaRecargada = sessionStorage.getItem('paginaRecargada');
        if (!paginaRecargada) {
          sessionStorage.setItem('paginaRecargada', 'true');
          location.reload();
        }
        //fin recarga pagina al inicio, recarga valores iniciales por defecto
        */
      }
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  // METODO PARA AUDITAR INICIOS DE SESION
  IngresoSistema(user: any, acceso: string, dir_ip: any) {
    var f = moment();
    var fecha = f.format('YYYY-MM-DD');
    var time = f.format('HH:mm:ss');
    let dataAcceso = {
      ip_address: dir_ip,
      user_name: user,
      modulo: 'login',
      acceso: acceso,
      fecha: fecha,
      hora: time,
    }
    this.restU.CrearAccesosSistema(dataAcceso).subscribe(datos => { })
  }

}
