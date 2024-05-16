import { ToastrService } from 'ngx-toastr';
import { LoginService } from '../login/login.service';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})

export class ValidacionesService {

  constructor(
    private toastr: ToastrService,
    private router: Router,
    private audit: LoginService,
  ) { }


  /** ********************************************************************************* **
   ** **                REDIRECCION POR ACCESO A MODULOS NO AUTORIZADOS              ** **
   ** ********************************************************************************* **/

  // REDIRECCIONAMIENTO A LA PAGINA PRINCIPAL DEL ADMINISTRADOR
  RedireccionarHomeAdmin(error: any) {
    const { access, message, url, title } = error;

    if (access === false) {
      this.toastr.info(message + ' ' + url, title, {
        timeOut: 6000,
        positionClass: 'toast-top-center',

      })
        .onTap.subscribe(items => {
          if (url) {
            window.open(`https://${url}`, "_blank");
          }
        });
      this.router.navigate(['/home']);
    }
  }

  // REDIRECCIONAMIENTO A LA PAGINA PRINCIPAL DEL EMPLEADO
  RedireccionarHomeEmpleado(error: any) {
    const { access, message, url, title } = error;
    if (access === false) {
      this.toastr.info(message + ' ' + url, title, {
        timeOut: 6000,
        positionClass: 'toast-top-center',

      })
        .onTap.subscribe(items => {
          if (url) {
            window.open(`https://${url}`, "_blank");
          }
        });
        this.router.navigate(['/home']);
      //this.router.navigate(['/estadisticas']);
    }
  }

  // REDIRECCIONAMIENTO AL HOME DE LA RUTA ACTUAL
  RedireccionarMixto(error: any) {
    const { access, message, url, title } = error;
    if (access === false) {
      this.toastr.info(message + ' ' + url, title, {
        timeOut: 6000,
        positionClass: 'toast-top-center',
      })
        .onTap.subscribe(items => {
          if (url) {
            window.open(`https://${url}`, "_blank");
          }
        });
      this.router.navigate(['/']);
      // this.router.navigate(['/', { relativeTo: this.route, skipLocationChange: false }]);
    }

  }

  /** ******************************************************************** *
   *                  METODO PARA CONTROLAR INGRESO DE LETRAS              *
   *  ******************************************************************** */
  IngresarSoloLetras(e: any) {
    let key = e.keyCode || e.which;
    let tecla = String.fromCharCode(key).toString();
    // SE DEFINE TODO EL ABECEDARIO QUE SE VA A USAR.
    let letras = " áéíóúabcdefghijklmnñopqrstuvwxyzÁÉÍÓÚABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    // ES LA VALIDACION DEL KEYCODES, QUE TECLAS RECIBE EL CAMPO DE TEXTO.
    let especiales = [8, 37, 39, 46, 6, 13];
    let tecla_especial = false
    for (var i in especiales) {
      if (key == especiales[i]) {
        tecla_especial = true;
        break;
      }
    }
    if (letras.indexOf(tecla) == -1 && !tecla_especial) {
      this.toastr.info('No se admite datos numéricos.', 'Usar solo letras.', {
        timeOut: 6000,
      })
      return false;
    }
  }

  /** ******************************************************************** **
   ** **                 METODO PARA CONTROLAR INGRESO DE NUMEROS          **
   ** ** ***************************************************************** **/
  IngresarSoloNumeros(evt: any) {
    if (window.event) {
      var keynum = evt.keyCode;
    }
    else {
      keynum = evt.which;
    }
    // COMPROBAMOS SI SE ENCUENTRA EN EL RANGO NUMERICO Y QUE TECLAS NO RECIBIRA.
    if ((keynum > 47 && keynum < 58) || keynum == 8 || keynum == 13 || keynum == 6) {
      return true;
    }
    else {
      this.toastr.info('No se admite el ingreso de letras.', 'Usar solo números.', {
        timeOut: 6000,
      })
      return false;
    }
  }

  // METODO PARA FORMATEAR FECHA
  dia_abreviado: string = 'ddd';
  dia_completo: string = 'dddd';

  FormatearFecha(fecha: string, formato: string, dia: string): string {
    let valor: string;
    if (dia === 'ddd') {
      valor = moment(fecha, 'YYYY/MM/DD').format(dia).charAt(0).toUpperCase() +
        moment(fecha, 'YYYY/MM/DD').format(dia).slice(1) +
        ' ' + moment(fecha, 'YYYY/MM/DD').format(formato);
    } else if (dia==='no') {
      valor = moment(fecha, 'YYYY/MM/DD').format(formato);
    } else {
      valor = moment(fecha, 'YYYY/MM/DD').format(dia).charAt(0).toUpperCase() +
        moment(fecha, 'YYYY/MM/DD').format(dia).slice(1) +
        ', ' + moment(fecha, 'YYYY/MM/DD').format(formato);
    }
    return valor;
  }

  FormatearHora(hora: string, formato: string) {
    let valor = moment(hora, 'HH:mm:ss').format(formato);
    return valor;
  }

}


