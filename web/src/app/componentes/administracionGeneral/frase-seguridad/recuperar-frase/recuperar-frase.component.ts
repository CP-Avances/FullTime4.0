import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';
import { LoginService } from 'src/app/servicios/login/login.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';

@Component({
  selector: 'app-recuperar-frase',
  templateUrl: './recuperar-frase.component.html',
  styleUrls: ['./recuperar-frase.component.css']
})

export class RecuperarFraseComponent implements OnInit {

  token: string;

  cadena: string;
  mensajeEmpresa: any = [];
  mensaje: any = [];//Almacenamiento de codigo empresarial encriptado

  // CAMPOS DEL FORMULARIO
  NuevaFrase = new FormControl('', Validators.maxLength(100));
  empresa = new FormControl('', [Validators.required]);

  // CAMPOS DEL FORMULARIO EN UN GRUPO
  public formulario = new FormGroup({
    nFrase: this.NuevaFrase,
    nEmpresa: this.empresa,
  });

  constructor(
    private rest: UsuarioService,
    private toastr: ToastrService,
    private restLogin: LoginService,
    private restEmpresa: EmpresaService,
    public router: Router,
    public location: Location
  ) {
    var urlToken = this.location.prepareExternalUrl(this.location.path());
    this.token = urlToken.slice(1).split("/")[1];
  }

  ngOnInit(): void {
    this.VerRuta();
  }

  IngresarFrase(form: any) {
    //JSON con codigo empresarial encriptado
    let empresas = {
      "codigo_empresa": form.nEmpresa.toString()
    };
    //Validacion de codigo empresarial.
    this.restLogin.getEmpresa(empresas).subscribe(
      {
        next: (v) =>
          {
            //Almacenamiento de ip dependiendo el resultado de la validacion
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
            this.toastr.error('Verifique codigo empresarial', 'Error.', {
              timeOut: 3000,
            });
          },
        complete: () =>
          {
            console.log('CONTINUAR RECU FRASE');
            //Consulta cadena IP para armar url
            this.VerRuta();
            //inicio recuperacion Frase proceso normal
            let data = {
              token: this.token,
              frase: form.nFrase
            };
        
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
            //fin recuperacion Frase
          }
      }
    );
  }

  VerRuta() {
    this.restEmpresa.ConsultarEmpresaCadena().subscribe(res => {
      this.cadena = res[0].cadena
    })
  }

}
