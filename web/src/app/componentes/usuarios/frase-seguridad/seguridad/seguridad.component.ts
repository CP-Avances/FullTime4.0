import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
// import { Md5 } from 'ts-md5';

import { UsuarioService } from 'src/app/servicios/usuarios/usuario/usuario.service';
import { EmpresaService } from 'src/app/servicios/configuracion/parametrizacion/catEmpresa/empresa.service';
import { LoginService } from 'src/app/servicios/login/login.service';

@Component({
  selector: 'app-seguridad',
  templateUrl: './seguridad.component.html',
  styleUrls: ['./seguridad.component.css']
})

export class SeguridadComponent implements OnInit {

  // VER PAGINA SEGUN CONFIGURACION
  contrasena: boolean = false;
  frase: boolean = false;

  hide1 = true;
  hide2 = true;
  hide3 = true;
  usuario: string;
  intentos: number = 0;
  datosUser: any = [];

  // VARIABLES DE FORMULARIOS
  ActualContrasena = new FormControl('', Validators.maxLength(12));
  ActualFrase = new FormControl('', Validators.maxLength(100));

  public formulario = new FormGroup({
    aPass: this.ActualContrasena
  });

  public fraseForm = new FormGroup({
    aFrase: this.ActualFrase
  });

  constructor(
    private restUser: UsuarioService,
    private restEmpr: EmpresaService,
    private toastr: ToastrService,
    public router: Router,
    public ventana: MatDialogRef<SeguridadComponent>,
    public location: Location,
    public loginService: LoginService,
  ) {
    this.usuario = localStorage.getItem('empleado') as string;
  }

  ngOnInit(): void {
    this.VerEmpresa();
    this.intentos = 0;
  }

  // METODO DE CONSULTA DE DATOS DE EMPRESA
  empresa: any = [];
  VerEmpresa() {
    this.empresa = [];
    this.restEmpr.ConsultarDatosEmpresa(parseInt(localStorage.getItem('empresa') as string)).subscribe(data => {
      this.empresa = data;
      if (this.empresa[0].seguridad_contrasena === true) {
        this.contrasena = true;
      }
      else {
        this.frase = true;
      }
    });
  }

  // METODO PARA COMPARAR CONTRASENIA
  CompararContrasenia(form: any) {
    // CIFRADO DE CONTRASEÑA
    // const md5 = new Md5();
    // let pass = md5.appendStr(form.aPass).end();
    let pass = '';
    this.datosUser = [];
    this.restUser.BuscarDatosUser(parseInt(this.usuario)).subscribe(data => {
      this.datosUser = data;
      if (pass === this.datosUser[0].contrasena) {
        this.ventana.close('true');
      }
      else {
        this.intentos = this.intentos + 1;
        if (this.intentos === 4) {
          this.loginService.logout();
          this.toastr.error('Intente más tarde.', 'Ha exedido el número de intentos.', {
            timeOut: 3000,
          });
          this.ventana.close('false');
        }
        else {
          this.toastr.error('Incorrecto.', 'La contraseña actual no es la correcta.', {
            timeOut: 3000,
          });
        }
      }
    });
  }

  // METODO PARA COMPARAR FRASE DE SEGURIDAD
  CompararFrase(form: any) {
    this.restUser.BuscarDatosUser(parseInt(this.usuario)).subscribe(data => {
      if (form.aFrase === data[0].frase) {
        this.ventana.close('true');
      }
      else {
        this.intentos = this.intentos + 1;
        if (this.intentos === 4) {
          this.loginService.logout();
          this.toastr.error('Intente más tarde.', 'Ha exedido el número de intentos.', {
            timeOut: 3000,
          });
          this.ventana.close('false');
        }
        else {
          this.toastr.error('La Frase ingresada no es la correcta.', 'Incorrecto.', {
            timeOut: 3000,
          });
        }
      }
    });
  }

  // CERRAR VENTANA
  CerrarRegistro() {
    this.ventana.close('false');
  }

  // METODO PARA RECUPERAR FRASE
  RecuperarFrase() {
    this.loginService.logout();
    this.ventana.close('olvidar');
  }
}
