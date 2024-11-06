import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { UsuarioService } from 'src/app/servicios/usuarios/usuario/usuario.service';
import { use } from 'echarts';

@Component({
  selector: 'app-frase-seguridad',
  templateUrl: './frase-seguridad.component.html',
  styleUrls: ['./frase-seguridad.component.css']
})

export class FraseSeguridadComponent implements OnInit {

  usuario: string;
  ActualFrase = new FormControl('', Validators.maxLength(100));

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // VARIABLES DE FORMULARIO
  public formulario = new FormGroup({
    aFrase: this.ActualFrase
  });

  constructor(
    private restUser: UsuarioService,
    private toastr: ToastrService,
    public router: Router,
    public ventana: MatDialogRef<FraseSeguridadComponent>,
    public location: Location,
  ) {
    this.usuario = localStorage.getItem('empleado') as string;
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
  }

  // METODO PARA REGISTRAR FRASE DE SEGURIDAD
  IngresarFrase(form: any) {
    let data = {
      frase: form.aFrase,
      id_empleado: parseInt(this.usuario),
      user_name: this.user_name,
      ip: this.ip,
    }
    this.restUser.ActualizarFrase(data).subscribe(data => {
      this.toastr.success('Registro guardado.', '', {
        timeOut: 6000,
      });
    });
    this.CerrarRegistro(true);
  }

  // METODO PARA CERRAR VENTANA
  CerrarRegistro(evento: boolean) {
    this.ventana.close(evento);
  }

}
