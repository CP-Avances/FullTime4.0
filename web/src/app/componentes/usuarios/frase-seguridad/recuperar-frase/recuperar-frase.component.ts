import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { UsuarioService } from 'src/app/servicios/usuarios/usuario/usuario.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';

@Component({
  selector: 'app-recuperar-frase',
  templateUrl: './recuperar-frase.component.html',
  styleUrls: ['./recuperar-frase.component.css']
})

export class RecuperarFraseComponent implements OnInit {

  token: string;

  mensaje: any = [];

   // VARIABLES PARA AUDITORIA
   user_name: string | null;
   ip: string | null;

  // CAMPOS DEL FORMULARIO
  NuevaFrase = new FormControl('', Validators.maxLength(100));

  // CAMPOS DEL FORMULARIO EN UN GRUPO
  public formulario = new FormGroup({
    nFrase: this.NuevaFrase,
  });

  constructor(
    private rest: UsuarioService,
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
  }

  IngresarFrase(form: any) {
    let data = {
      token: this.token,
      frase: form.nFrase,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
    }
    this.rest.CambiarFrase(data).subscribe(res => {
      this.mensaje = res;
      if (this.mensaje.expiro === 'si') {
        this.router.navigate(['/frase-olvidar']);
        this.toastr.error(this.mensaje.message, 'Ups!!! Algo a salido mal.', {
          timeOut: 6000,
        });
      } else {
        this.router.navigate(['/login']);
        this.toastr.success('Operación exitosa.', this.mensaje.message, {
          timeOut: 6000,
        });
      }
    });
  }

}
