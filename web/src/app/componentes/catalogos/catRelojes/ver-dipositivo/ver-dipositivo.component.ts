import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { RelojesService } from 'src/app/servicios/catalogos/catRelojes/relojes.service'

@Component({
  selector: 'app-ver-dipositivo',
  templateUrl: './ver-dipositivo.component.html',
  styleUrls: ['./ver-dipositivo.component.css']
})

export class VerDipositivoComponent implements OnInit {

  idReloj: string;
  datosReloj: any = [];

  constructor(
    public router: Router,
    public rest: RelojesService,
  ) {
    var cadena = this.router.url;
    var aux = cadena.split("/");
    this.idReloj = aux[2];
  }

  ngOnInit(): void {
    this.CargarDatosReloj();
  }

  // METODO PARA CARGAR DATOS DE DISPOSITIVO
  CargarDatosReloj() {
    this.datosReloj = [];
    this.rest.ConsultarDatosId(parseInt(this.idReloj)).subscribe(datos => {
      this.datosReloj = datos;
    })
  }

}
