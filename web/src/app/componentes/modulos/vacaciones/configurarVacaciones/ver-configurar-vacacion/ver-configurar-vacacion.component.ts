import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { ConfigurarVacacionesService } from 'src/app/servicios/modulos/modulo-vacaciones/configurar-vacaciones/configurar-vacaciones.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/configuracion/parametrizacion/parametrosGenerales/parametros.service';

import { ListarConfigurarVacacionComponent } from '../listar-configurar-vacacion/listar-configurar-vacacion.component';

@Component({
  selector: 'app-ver-configurar-vacacion',
  standalone: false,
  templateUrl: './ver-configurar-vacacion.component.html',
  styleUrl: './ver-configurar-vacacion.component.css'
})

export class VerConfigurarVacacionComponent implements OnInit {

  @Input() idConfiguracion: number;
  datosConfiguracion: any = [];

  constructor(
    public rest: ConfigurarVacacionesService,
    public router: Router,
    public validar: ValidacionesService,
    public ventana: MatDialog,
    public parametro: ParametrosService,
    public componentl: ListarConfigurarVacacionComponent,
  ) { }

  ngOnInit(): void {
    this.CargarDatosPermiso();
  }

  // METODO PARA LISTAR DATOS DE PERMISO
  CargarDatosPermiso() {
    this.datosConfiguracion = [];
    this.rest.BuscarUnaConfiguracion(this.idConfiguracion).subscribe(datos => {
      this.datosConfiguracion = datos;
    })
  }

  // METODO PARA VER LISTA DE TIPOS DE PERMISOS
  VerListaConfiguracion() {
    this.componentl.ver_lista = true;
    this.componentl.ver_datos = false;
    this.componentl.ObtenerConfiguraciones();
  }

  // METODO PARA VER FORMUALRIO EDITAR
  VerFormularioEditar(id: number) {
    this.componentl.ver_datos = false;
    this.componentl.VerFormularioEditar(id);
    this.componentl.pagina = 'ver-datos';
  }

}
