import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { LoginService } from 'src/app/servicios/login/login.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';

import { AyudaComponent } from '../../ayuda/ayuda.component';

@Component({
  selector: 'app-button-opciones',
  standalone: false,
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
  }

  AbrirVentanaAyuda() {
    this.ventana.open(AyudaComponent, { width: '500px' })
  }

}
