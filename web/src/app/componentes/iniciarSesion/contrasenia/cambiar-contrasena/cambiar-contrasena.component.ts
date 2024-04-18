import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { RsaKeysService } from 'src/app/servicios/llaves/rsa-keys.service';//Servicio para encriptar

import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';

@Component({
  selector: 'app-cambiar-contrasena',
  templateUrl: './cambiar-contrasena.component.html',
  styleUrls: ['./cambiar-contrasena.component.css']
})

export class CambiarContrasenaComponent implements OnInit {

  hide1 = true;
  hide2 = true;
  hide3 = true;
  usuario: string;
  datosUser: any = [];
  ActualContrasena = new FormControl('', Validators.maxLength(12));
  NuevaContrasenia = new FormControl('', Validators.maxLength(12));
  ConfirmarContrasenia = new FormControl('', Validators.maxLength(12));

  public formulario = new FormGroup({
    nPass: this.NuevaContrasenia,
    cPass: this.ConfirmarContrasenia,
    aPass: this.ActualContrasena
  });

  constructor(
    private restUser: UsuarioService,
    private toastr: ToastrService,
    public router: Router,
    public ventana: MatDialogRef<CambiarContrasenaComponent>,
    public location: Location,
    private rsaKeysService: RsaKeysService
  ) {
    this.usuario = localStorage.getItem('empleado') as string;
  }

  ngOnInit(): void {
  }

  CompararContrasenia(form: any) {
    // CIFRADO DE CONTRASEÑA
    let pass = this.rsaKeysService.encriptarLogin(form.aPass.toString());

    this.datosUser = [];
    this.restUser.BuscarDatosUser(parseInt(this.usuario)).subscribe(data => {
      this.datosUser = data;
      if (pass === this.datosUser[0].contrasena) {
        if (form.nPass != form.cPass) {
          this.toastr.error('Incorrecto.', 'Las contraseñas no coinciden.', {
            timeOut: 6000,
          });
        }
        else {
          this.EnviarContraseniaConfirmacion(form);
        }
      }
      else {
        this.toastr.error('Incorrecto.', 'La contraseña actual no es la correcta.', {
          timeOut: 6000,
        });
      }
    });
  }

  // METODO PARA ACTUALIZAR CONTRASEÑA
  EnviarContraseniaConfirmacion(form: any) {
    // CIFRADO DE CONTRASEÑA
    let clave = this.rsaKeysService.encriptarLogin(form.cPass.toString());

    let datos = {
      id_empleado: parseInt(this.usuario),
      contrasena: clave
    }
    this.restUser.ActualizarPassword(datos).subscribe(data => {
      this.toastr.success('Operación exitosa.', 'Registro actualizado.', {
        timeOut: 6000,
      });
      this.CerrarRegistro(true);
    });
  }

  // METODO PARA CERRAR VENTANA
  CerrarRegistro(valor: boolean) {
    this.ventana.close(valor);
  }

}
