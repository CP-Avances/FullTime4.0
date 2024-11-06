import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { AccionPersonalService } from 'src/app/servicios/modulos/modulo-acciones-personal/accionPersonal/accion-personal.service';

import { ListarTipoAccionComponent } from '../listar-tipo-accion/listar-tipo-accion.component';

@Component({
  selector: 'app-ver-tipo-accion',
  templateUrl: './ver-tipo-accion.component.html',
  styleUrls: ['./ver-tipo-accion.component.css']
})
export class VerTipoAccionComponent implements OnInit {

  @Input() idAccion: number;

  datosTipos: any = [];

  constructor(
    public router: Router,
    public rest: AccionPersonalService,
    public componentel: ListarTipoAccionComponent,
  ) { }

  ngOnInit(): void {
    this.CargarDatosPermiso();
  }

  // METODO PARA BUSCAR DATOS DE TIPO DE ACCION
  CargarDatosPermiso() {
    this.datosTipos = [];
    this.rest.BuscarTipoAccionPersonalId(this.idAccion).subscribe(datos => {
      this.datosTipos = datos;
    })
  }

  // METODO PARA VER LISTA DE ACCIONES DE PERSONAL
  VerListaAcciones() {
    this.componentel.ver_lista = true;
    this.componentel.ver_datos = false;
    this.componentel.ObtenerTipoAccionesPersonal();
  }

  // METODO PARA ABRIR EL FORMULARIO EDITAR
  AbrirEditar(datos: any) {
    this.componentel.ver_datos = false;
    this.componentel.ver_editar = true;
    this.componentel.accion = datos;
    this.componentel.pagina = 'datos-tipo-accion';
  }
}
