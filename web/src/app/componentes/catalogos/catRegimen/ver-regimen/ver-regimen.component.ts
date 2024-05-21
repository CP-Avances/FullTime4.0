import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { ProvinciaService } from 'src/app/servicios/catalogos/catProvincias/provincia.service';
import { RegimenService } from 'src/app/servicios/catalogos/catRegimen/regimen.service'
import { ListarRegimenComponent } from '../listar-regimen/listar-regimen.component';

@Component({
  selector: 'app-ver-regimen',
  templateUrl: './ver-regimen.component.html',
  styleUrls: ['./ver-regimen.component.css']
})

export class VerRegimenComponent implements OnInit {

  @Input() idRegimen: number;
  regimen: any = [];

  constructor(
    public pais: ProvinciaService,
    public rest: RegimenService,
    public router: Router,
    public componentl: ListarRegimenComponent,
  ) { }

  ngOnInit(): void {
    this.ObtenerPaises();
  }

  // METODO PARA CONSULTAR DATOS DE REGIMEN
  CargarDatosRegimen() {
    this.regimen = [];
    this.rest.ConsultarUnRegimen(this.idRegimen).subscribe(datos => {
      this.regimen = datos;
      this.regimen.descripcion = this.regimen.descripcion.toUpperCase();
      // OBTENER NOMBRE DEL PAIS REGISTRADO
      this.paises.forEach((obj: any) => {
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
    this.rest.ConsultarUnPeriodo(this.idRegimen).subscribe(dato => {
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
      this.rest.ConsultarAntiguedad(this.idRegimen).subscribe(dato => {
        this.antiguedad = dato;
        this.ver_antiguedad_variable = true;
      })
    }
  }

  // METODO PARA VER LISTA DE REGIMEN
  VerListaRegimen() {
    this.componentl.ver_lista = true;
    this.componentl.ver_datos = false;
    this.componentl.ObtenerRegimen();
  }

  // METODO PARA ABRIR FORMULARIO EDITAR
  AbrirEditar(id: number) {
    this.componentl.ver_datos = false;
    this.componentl.ver_editar = true;
    this.componentl.pagina = 'ver-regimen';
    this.componentl.regimen_id = id;
  }

}
