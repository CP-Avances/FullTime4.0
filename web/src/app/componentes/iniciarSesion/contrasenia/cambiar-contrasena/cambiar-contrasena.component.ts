import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Md5 } from 'ts-md5';

import { UsuarioService } from 'src/app/servicios/usuarios/usuario/usuario.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';

@Component({
  selector: 'app-cambiar-contrasena',
  templateUrl: './cambiar-contrasena.component.html',
  styleUrls: ['./cambiar-contrasena.component.css']
})

export class CambiarContrasenaComponent implements OnInit {
  ips_locales: any = '';

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
    public location: Location,
    public validar: ValidacionesService,
  ) {
    this.usuario = localStorage.getItem('empleado') as string;
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');  
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    }); 
  }

  // METODO PARA CONPARAR CONTRASEÑAS
  CompararContrasenia(form: any) {
    // CIFRADO DE CONTRASEÑA
    const md5 = new Md5();
    let pass = md5.appendStr(form.aPass).end();
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
    const md5 = new Md5();
    let clave = md5.appendStr(form.cPass).end();
    let datos = {
      id_empleado: parseInt(this.usuario),
      contrasena: clave,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
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
