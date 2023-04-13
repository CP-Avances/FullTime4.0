import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { TipoPermisosService } from 'src/app/servicios/catalogos/catTipoPermisos/tipo-permisos.service'
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';

@Component({
  selector: 'app-ver-tipo-permiso',
  templateUrl: './ver-tipo-permiso.component.html',
  styleUrls: ['./ver-tipo-permiso.component.css']
})

export class VerTipoPermisoComponent implements OnInit {

  idPermiso: string;
  datosPermiso: any = [];

  constructor(
    public rest: TipoPermisosService,
    public router: Router,
    public ventana: MatDialog,
    public validar: ValidacionesService,
    public parametro: ParametrosService,
  ) {
    var cadena = this.router.url;
    var aux = cadena.split("/");
    this.idPermiso = aux[2];
  }

  ngOnInit(): void {
    this.BuscarParametro();
  }

  /** **************************************************************************************** **
   ** **                          BUSQUEDA DE FORMATOS DE FECHAS                            ** ** 
   ** **************************************************************************************** **/

   formato_fecha: string = 'DD/MM/YYYY';

   // METODO PARA BUSCAR PARÁMETRO DE FORMATO DE FECHA
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
    this.rest.BuscarUnTipoPermiso(parseInt(this.idPermiso)).subscribe(datos => {
      this.datosPermiso = datos;
      this.datosPermiso.forEach(data => {
        data.fecha_ = this.validar.FormatearFecha(data.fecha, formato, this.validar.dia_abreviado);
      })
    })
  }

}
