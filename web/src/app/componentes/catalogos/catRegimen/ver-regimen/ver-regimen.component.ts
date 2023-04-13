import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ProvinciaService } from 'src/app/servicios/catalogos/catProvincias/provincia.service';
import { RegimenService } from 'src/app/servicios/catalogos/catRegimen/regimen.service'

@Component({
  selector: 'app-ver-regimen',
  templateUrl: './ver-regimen.component.html',
  styleUrls: ['./ver-regimen.component.css']
})

export class VerRegimenComponent implements OnInit {

  idRegimen: string;
  regimen: any = [];

  constructor(
    public pais: ProvinciaService,
    public rest: RegimenService,
    public router: Router,
  ) {
    var cadena = this.router.url;
    var aux = cadena.split("/");
    this.idRegimen = aux[2];
  }

  ngOnInit(): void {
    this.ObtenerPaises();
  }

  // METODO PARA CONSULTAR DATOS DE REGIMEN
  CargarDatosRegimen() {
    this.regimen = [];
    this.rest.ConsultarUnRegimen(parseInt(this.idRegimen)).subscribe(datos => {
      this.regimen = datos;
      this.regimen.descripcion = this.regimen.descripcion.toUpperCase();
      // OBTENER NOMBRE DEL PAIS REGISTRADO
      this.paises.forEach(obj => {
        if (obj.id === this.regimen.id_pais) {
          this.regimen.pais = obj.nombre;
        }
      });

      this.VerTiempoLimite();
      this.ObtenerPeriodos();
      this.ObtenerAntiguedad();
    })
  }

  // BUSQUEDA DE LISTA DE PAISES
  paises: any = [];
  ObtenerPaises() {
    this.paises = [];
    this.pais.BuscarPais('AMERICA').subscribe(datos => {
      this.paises = datos;
      this.CargarDatosRegimen();
    })
  }

  // METODO PARA VER TIEMPO LIMITE DE SERVICIOS
  VerTiempoLimite() {
    this.regimen.tiempo = false;
    if (this.regimen.trabajo_minimo_mes != 0) {
      this.regimen.tiempo = this.regimen.trabajo_minimo_mes + ' meses';
    }

    if (this.regimen.trabajo_minimo_horas != 0) {
      this.regimen.tiempo = this.regimen.trabajo_minimo_horas + ' horas';
    }
  }

  // OBTENER DATOS DE PERIODO DE VACACIONES
  periodo: any = [];
  ver_periodo: boolean = false;
  ObtenerPeriodos() {
    this.periodo = [];
    this.rest.ConsultarUnPeriodo(parseInt(this.idRegimen)).subscribe(dato => {
      this.periodo = dato;
      this.ver_periodo = true;
    })
  }

  // OBTENER DATOS DE ANTIGUEDAD DE VACACIONES
  antiguedad: any = [];
  ver_antiguedad_variable: boolean = false;
  ver_antiguedad_fija: boolean = false;
  ObtenerAntiguedad() {

    if (this.regimen.antiguedad_fija === true) {
      this.ver_antiguedad_fija = true;
    }
    else {
      this.antiguedad = [];
      this.rest.ConsultarAntiguedad(parseInt(this.idRegimen)).subscribe(dato => {
        this.antiguedad = dato;
        this.ver_antiguedad_variable = true;
      })
    }
  }

}
