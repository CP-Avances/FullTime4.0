// IMPORTACION DE LIBRERIAS
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef } from '@angular/material/dialog';

// IMPORTACION DE SERVICIOS
import { UsuarioService } from 'src/app/servicios/usuarios/usuario/usuario.service';
import { LoginService } from 'src/app/servicios/login/login.service';
import { Router } from '@angular/router';
import { use } from 'echarts';


@Component({
  selector: 'app-cambiar-frase',
  templateUrl: './cambiar-frase.component.html',
  styleUrls: ['./cambiar-frase.component.css']
})

export class CambiarFraseComponent implements OnInit {

  usuario: string; // VARIABLE DE ALMACENAMIENTO DE ID DE USUARIO
  datosUser: any = []; // VARIABLE DE ALMACENAMIENTO DE DATOS DE USUARIO

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // CAMPOS DEL FORMULARIO
  ActualFrase = new FormControl('', Validators.maxLength(100));
  NuevaFrase = new FormControl('', Validators.maxLength(100));

  // CAMPOS DEL FORMULARIO EN UN GRUPO
  public formulario = new FormGroup({
    nFrase: this.NuevaFrase,
    aFrase: this.ActualFrase
  });

  constructor(
    public loginService: LoginService,
    public ventana: MatDialogRef<CambiarFraseComponent>,
    public router: Router,
    private restUser: UsuarioService,
    private toastr: ToastrService,
  ) {
    this.usuario = localStorage.getItem('empleado') as string;
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
  }

  // METODO PARA COMPARAR FRASE ACTUAL CON LA INGRESADA POR EL USUARIO
  CompararFrase(form: any) {
    this.datosUser = [];
    this.restUser.BuscarDatosUser(parseInt(this.usuario)).subscribe(data => {
      this.datosUser = data;
      if (form.aFrase === this.datosUser[0].frase) {
        this.IngresarFrase(form);
      }
      else {
        this.toastr.error('Incorrecto.', 'Frase actual no es la correcta.', {
          timeOut: 6000,
        });
      }
    });
  }

  // METODO PARA CERRAR REGISTRO
  CerrarRegistro() {
    this.ventana.close();
  }

  // METODO PARA GUARDAR NUEVA FRASE
  IngresarFrase(form: any) {
    let data = {
      frase: form.nFrase,
      id_empleado: parseInt(this.usuario),
      user_name: this.user_name,
      ip: this.ip
    }
    this.restUser.ActualizarFrase(data).subscribe(data => {
      this.toastr.success('Frase ingresada exitosamente.', '', {
        timeOut: 6000,
      });
    });
    this.CerrarRegistro();
  }

  // METODO PARA ABRIR PANTALLA RECUPERAR FRASE
  RecuperarFrase() {
    this.loginService.logout();
    this.ventana.close();
    this.router.navigate(['/frase-olvidar']);
  }

}
