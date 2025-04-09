import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { LoginService } from 'src/app/servicios/login/login.service';

import { SettingsComponent } from 'src/app/componentes/notificaciones/configurar-notificaciones/settings/settings.component';
import { AyudaComponent } from '../../ayuda/ayuda.component';
import { Router } from '@angular/router';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';

@Component({
  selector: 'app-button-opciones',
  templateUrl: './button-opciones.component.html',
  styleUrls: ['../main-nav.component.css']
})

export class ButtonOpcionesComponent implements OnInit {

  constructor(
    public router: Router,
    public ventana: MatDialog,
    public validar: ValidacionesService,
    public loginService: LoginService,
  ) { }

  ngOnInit(): void {
  }

  AbrirSettings() {

    let dato = this.validar.EncriptarDato(localStorage.getItem('empleado') as string);
    return this.router.navigate(['/configuraciones-alertas/', dato]);
    //this.ventana.open(SettingsComponent, { width: '650px', data: { id_empleado } });
  }

  AbrirVentanaAyuda() {
    this.ventana.open(AyudaComponent, { width: '500px' })
  }

}
