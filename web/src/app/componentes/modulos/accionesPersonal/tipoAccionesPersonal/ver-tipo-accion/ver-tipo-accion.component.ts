import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { AccionPersonalService } from 'src/app/servicios/accionPersonal/accion-personal.service'
import { EditarTipoAccionComponent } from '../editar-tipo-accion/editar-tipo-accion.component';

@Component({
  selector: 'app-ver-tipo-accion',
  templateUrl: './ver-tipo-accion.component.html',
  styleUrls: ['./ver-tipo-accion.component.css']
})
export class VerTipoAccionComponent implements OnInit {

  idAccion: string;
  datosTipos: any = [];
  constructor(
    public router: Router,
    public vistaRegistrarDatos: MatDialog,
    public rest: AccionPersonalService,
  ) {
    var cadena = this.router.url;
    var aux = cadena.split("/");
    this.idAccion = aux[2];
  }

  ngOnInit(): void {
    this.CargarDatosPermiso();
  }

  CargarDatosPermiso() {
    this.datosTipos = [];
    this.rest.BuscarTipoAccionPersonalId(parseInt(this.idAccion)).subscribe(datos => {
      this.datosTipos = datos;
    })
  }

  /* Ventana para editar datos de dispositivo seleccionado */
  EditarDatosTipoAccion(datosSeleccionados: any): void {
    console.log(datosSeleccionados);
    this.vistaRegistrarDatos.open(EditarTipoAccionComponent, { width: '600px', data: datosSeleccionados })
      .afterClosed().subscribe(item => {
        this.CargarDatosPermiso();
      });
  }

}
