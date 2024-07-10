import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

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

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

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
    public location: Location
  ) {
    this.usuario = localStorage.getItem('empleado') as string;
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
  }

  CompararContrasenia(form: any) {
    //TODO CAMBIO PARA NO ENCRIPTAR EN FRONTEND
    // CIFRADO DE CONTRASEÑA?
    let pass = form.aPass.toString();
    let passEncriptado = null;
    let datos = {
      "contrasena": pass
    };
    console.log('pass_' + pass);

    this.restUser.getTextoEncriptado(datos).subscribe(
      {
        next: (v) => {
          passEncriptado = v.message;
          console.log('passEncriptado_' + passEncriptado);
        },
        error: (e) => {
          this.toastr.error('Error al obtener datos', 'Error.', {
            timeOut: 3000,
          });
        },
        complete: () => {
          //INICIO CONTINUACION
          this.datosUser = [];
          this.restUser.BuscarDatosUser(parseInt(this.usuario)).subscribe(data => {
            this.datosUser = data;
            //FIXME pass => passEncriptado
            if (passEncriptado === this.datosUser[0].contrasena) {
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
          //FIN CONTINUACION
        }
      }
    );
  }

  // METODO PARA ACTUALIZAR CONTRASEÑA
  EnviarContraseniaConfirmacion(form: any) {
    // CIFRADO DE CONTRASEÑA?
    let clave = form.cPass.toString();

    let datos = {
      id_empleado: parseInt(this.usuario),
      contrasena: clave,
      user_name: this.user_name,
      ip: this.ip,
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
