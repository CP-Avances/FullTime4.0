import { LoginService } from './servicios/login/login.service';
import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'Full Time';
  ruta: string = '';

  constructor(
    public router: Router,
    public location: Location,
    public loginServices: LoginService
  ) 
  { }

  // METODO PARA RETIRAR VENTANA OLVIDAR CONTRASEÑA
  removerForget() {
    var tituloPestania = this.location.prepareExternalUrl(this.location.path());
    tituloPestania = tituloPestania.slice(1);
    if (tituloPestania === 'olvidar-contrasenia') {
      return false;
    } else {
      return true;
    };
  }

  // METODO PARA RETIRAR VENTANA OLVIDAR FRASE
  removerForgetFrase() {
    var tituloPestania = this.location.prepareExternalUrl(this.location.path());
    tituloPestania = tituloPestania.slice(1);
    if (tituloPestania === 'frase-olvidar') {
      return false;
    } else {
      return true;
    };
  }

  // METODO PARA RETIRAR VENTANA DE INICIO DE SESION
  removerLogin() {
    var tituloPestania = this.location.prepareExternalUrl(this.location.path());
    tituloPestania = tituloPestania.slice(1);
    if (tituloPestania === 'login') {
      return false;
    } else {
      return true;
    }
  }

  // METODO PARA RETIRAR VENTANA DE CONFIRMA CONTRASEÑA
  removerConfirmet() {
    var tituloPestania = this.location.prepareExternalUrl(this.location.path());
    tituloPestania = tituloPestania.slice(1).split("/")[0];
    if (tituloPestania === 'confirmar-contrasenia') {
      return false;
    } else {
      return true;
    }
  }

  // METODO PARA RETIRAR VENTANA DE RECUPERAR FRASE
  removerConfirmeFrase() {
    var tituloPestania = this.location.prepareExternalUrl(this.location.path());
    tituloPestania = tituloPestania.slice(1).split("/")[0];
    if (tituloPestania === 'recuperar-frase') {
      return false;
    } else {
      return true;
    }
  }

  // METODO PARA RETIRAR VENTANA PRINCIPAL
  removerMain() {
    var tituloPestania = this.location.prepareExternalUrl(this.location.path());
    tituloPestania = tituloPestania.slice(1).split("/")[0];
    if (tituloPestania === 'confirmar-contrasenia' || tituloPestania === 'login' ||
      tituloPestania === 'olvidar-contrasenia' || tituloPestania === 'frase-olvidar' ||
      tituloPestania === 'recuperar-frase') {
      return true;
    } else {
      return false;
    }
  }

}
