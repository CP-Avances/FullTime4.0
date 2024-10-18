import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { LoginService } from 'src/app/servicios/login/login.service';

import { AccionesTimbresComponent } from 'src/app/componentes/generales/preferencias/acciones-timbres/acciones-timbres.component';
import { SettingsComponent } from 'src/app/componentes/notificaciones/configurar-notificaciones/settings/settings.component';
import { AyudaComponent } from '../../preferencias/ayuda/ayuda.component';

@Component({
  selector: 'app-button-opciones',
  templateUrl: './button-opciones.component.html',
  styleUrls: ['../main-nav.component.css']
})

export class ButtonOpcionesComponent implements OnInit {

  constructor(
    public ventana: MatDialog,
    public loginService: LoginService,
  ) { }

  ngOnInit(): void {
  }

  AbrirSettings() {
    const id_empleado = parseInt(localStorage.getItem('empleado') as string);
    this.ventana.open(SettingsComponent, { width: '350px', data: { id_empleado } });
  }

  AbrirAccionesTimbres() {
    const id_empresa = parseInt(localStorage.getItem('empresa') as string);
    this.ventana.open(AccionesTimbresComponent, { width: '350px', data: { id_empresa } });
  }

  AbrirVentanaAyuda() {
    this.ventana.open(AyudaComponent, { width: '500px' })
  }

}
