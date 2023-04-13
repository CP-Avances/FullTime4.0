import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { EditarHorasExtrasComponent } from 'src/app/componentes/catalogos/catHorasExtras/editar-horas-extras/editar-horas-extras.component';

import { HorasExtrasService } from 'src/app/servicios/catalogos/catHorasExtras/horas-extras.service'
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { ValidacionesService } from '../../../../servicios/validaciones/validaciones.service';

@Component({
  selector: 'app-ver-horas-extras',
  templateUrl: './ver-horas-extras.component.html',
  styleUrls: ['./ver-horas-extras.component.css']
})

export class VerHorasExtrasComponent implements OnInit {

  idHora: string;
  datosHoraExtra: any = [];

  constructor(
    public parametro: ParametrosService,
    public ventana: MatDialog,
    public router: Router,
    public rest: HorasExtrasService,
    private validar: ValidacionesService,
  ) {
    var cadena = this.router.url;
    var aux = cadena.split("/");
    this.idHora = aux[2];
  }

  ngOnInit(): void {
    this.BuscarHora();
  }

  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** ** 
   ** **************************************************************************************** **/

  formato_hora: string = 'HH:mm:ss';

  BuscarHora() {
    // id_tipo_parametro Formato hora = 26
    this.parametro.ListarDetalleParametros(26).subscribe(
      res => {
        this.formato_hora = res[0].descripcion;
        this.CargarDatosHoraExtra(this.formato_hora);
      },
      vacio => {
        this.CargarDatosHoraExtra(this.formato_hora);
      });
  }

  CargarDatosHoraExtra(formato_hora: string) {
    this.datosHoraExtra = [];
    this.rest.ObtenerUnaHoraExtra(parseInt(this.idHora)).subscribe(datos => {
      this.datosHoraExtra = datos;
      if (this.datosHoraExtra[0].tipo_descuento === 1) {
        this.datosHoraExtra[0].tipo_descuento = 'Horas Extras';
      }
      else {
        this.datosHoraExtra[0].tipo_descuento = 'Recargo Nocturno';
      }
      if (this.datosHoraExtra[0].hora_jornada === 1) {
        this.datosHoraExtra[0].hora_jornada = 'Matutina';
      }
      else if (this.datosHoraExtra[0].hora_jornada === 2) {
        this.datosHoraExtra[0].hora_jornada = 'Vespertina';
      }
      else if (this.datosHoraExtra[0].hora_jornada === 3) {
        this.datosHoraExtra[0].hora_jornada = 'Nocturna';
      }
      if (this.datosHoraExtra[0].tipo_dia === 1) {
        this.datosHoraExtra[0].tipo_dia = 'Libre';
      }
      else if (this.datosHoraExtra[0].tipo_dia === 2) {
        this.datosHoraExtra[0].tipo_dia = 'Feriado';
      }
      else {
        this.datosHoraExtra[0].tipo_dia = 'Normal';
      }

      this.datosHoraExtra[0].hora_inicio_ = this.validar.FormatearHora(this.datosHoraExtra[0].hora_inicio, formato_hora);
      this.datosHoraExtra[0].hora_final_ = this.validar.FormatearHora(this.datosHoraExtra[0].hora_final, formato_hora);
      
      console.log(this.datosHoraExtra)
    }, err => {
      return this.validar.RedireccionarHomeAdmin(err.error)
    })
  }

  /* Ventana para editar datos de hora extra seleccionado */
  EditarDatos(datosSeleccionados: any): void {
    console.log(datosSeleccionados);
    this.ventana.open(EditarHorasExtrasComponent, { width: '900px', data: datosSeleccionados })
      .afterClosed().subscribe(item => {
        this.CargarDatosHoraExtra(this.formato_hora);
      });
  }


}
