import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { TipoPermisosService } from 'src/app/servicios/catalogos/catTipoPermisos/tipo-permisos.service'
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { VistaElementosComponent } from '../listarTipoPermisos/vista-elementos.component';

@Component({
  selector: 'app-ver-tipo-permiso',
  templateUrl: './ver-tipo-permiso.component.html',
  styleUrls: ['./ver-tipo-permiso.component.css']
})

export class VerTipoPermisoComponent implements OnInit {

  @Input() idPermiso: number;
  datosPermiso: any = [];

  constructor(
    public rest: TipoPermisosService,
    public router: Router,
    public validar: ValidacionesService,
    public ventana: MatDialog,
    public parametro: ParametrosService,
    public componentl: VistaElementosComponent,
  ) { }

  ngOnInit(): void {
    this.BuscarParametro();
  }

  /** **************************************************************************************** **
   ** **                          BUSQUEDA DE FORMATOS DE FECHAS                            ** ** 
   ** **************************************************************************************** **/

  formato_fecha: string = 'DD/MM/YYYY';

  // METODO PARA BUSCAR PARAMETRO DE FORMATO DE FECHA
  BuscarParametro() {
    // id_tipo_parametro Formato fecha = 25
    this.parametro.ListarDetalleParametros(25).subscribe(
      res => {
        this.formato_fecha = res[0].descripcion;
        this.CargarDatosPermiso(this.formato_fecha);
      },
      vacio => {
        this.CargarDatosPermiso(this.formato_fecha);
      });
  }

  // METODO PARA LISTAR DATOS DE PERMISO
  CargarDatosPermiso(formato: string) {
    this.datosPermiso = [];
    this.rest.BuscarUnTipoPermiso(this.idPermiso).subscribe(datos => {
      this.datosPermiso = datos;
      console.log('ver datos de permiso', datos)
      this.datosPermiso.forEach(data => {
        data.fecha_inicio_ = this.validar.FormatearFecha(data.fecha_inicio, formato, this.validar.dia_abreviado);
        data.fecha_fin_ = this.validar.FormatearFecha(data.fecha_fin, formato, this.validar.dia_abreviado);
      })
    })
  }

  // METODO PARA VER LISTA DE TIPOS DE PERMISOS
  VerListaPermisos() {
    this.componentl.ver_lista = true;
    this.componentl.ver_datos = false;
    this.componentl.ObtenerTipoPermiso();
  }

  // METODO PARA VER FORMUALRIO EDITAR
  VerFormularioEditar(id: number) {
    this.componentl.ver_datos = false;
    this.componentl.VerFormularioEditar(id);
    this.componentl.pagina = 'ver-datos';
  }

}
