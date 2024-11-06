import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

import { ParametrosService } from 'src/app/servicios/configuracion/parametrizacion/parametrosGenerales/parametros.service';

@Component({
  selector: 'app-analisis-datos',
  templateUrl: './analisis-datos.component.html',
  styleUrls: ['./analisis-datos.component.css']
})

export class AnalisisDatosComponent implements OnInit {

  //URL HERRAMIENTA DE ANALISIS DE DATOS
  cargarHerramienta: boolean = false;
  urlHerramienta: string;
  urlSafe: SafeUrl;

  constructor(private sanitized: DomSanitizer, private parametro: ParametrosService) { }

  ngOnInit(): void {
    this.BuscarURL();
  }

  // METODO PARA BUSCAR PARAMETRO DE URL DE LA HERRAMIENTA DE ANALISIS
  BuscarURL() {
    this.parametro.ListarDetalleParametros(16).subscribe(
      res => {
        this.urlHerramienta = res[0].descripcion;
        this.urlSafe = this.sanitized.bypassSecurityTrustResourceUrl(this.urlHerramienta);
        this.cargarHerramienta = true;
      }
    )
  }
}
