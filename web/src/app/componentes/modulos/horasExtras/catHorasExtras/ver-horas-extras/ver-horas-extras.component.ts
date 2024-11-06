import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { ParametrosService } from 'src/app/servicios/configuracion/parametrizacion/parametrosGenerales/parametros.service';
import { HorasExtrasService } from 'src/app/servicios/modulos/modulo-horas-extras/catHorasExtras/horas-extras.service';
import { ValidacionesService } from '../../../../../servicios/generales/validaciones/validaciones.service';

import { ListaHorasExtrasComponent } from '../lista-horas-extras/lista-horas-extras.component';

@Component({
  selector: 'app-ver-horas-extras',
  templateUrl: './ver-horas-extras.component.html',
  styleUrls: ['./ver-horas-extras.component.css']
})

export class VerHorasExtrasComponent implements OnInit {

  @Input() idHora: number;

  datosHoraExtra: any = [];

  constructor(
    public componentel: ListaHorasExtrasComponent,
    public parametro: ParametrosService,
    public ventana: MatDialog,
    public router: Router,
    public rest: HorasExtrasService,
    private validar: ValidacionesService,
  ) { }

  ngOnInit(): void {
    this.BuscarHora();
  }

  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** ** 
   ** **************************************************************************************** **/

  formato_hora: string = 'HH:mm:ss';

  BuscarHora() {
    // id_tipo_parametro Formato hora = 2
    this.parametro.ListarDetalleParametros(2).subscribe(
      res => {
        this.formato_hora = res[0].descripcion;
        this.CargarDatosHoraExtra(this.formato_hora);
      },
      vacio => {
        this.CargarDatosHoraExtra(this.formato_hora);
      });
  }

  // METODO PARA MOSTRAR DATOS DE CONFIGURACION
  CargarDatosHoraExtra(formato_hora: string) {
    this.datosHoraExtra = [];
    this.rest.ObtenerUnaHoraExtra(this.idHora).subscribe(datos => {
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

    }, err => {
      return this.validar.RedireccionarHomeAdmin(err.error)
    })
  }

  // VENTANA PARA EDITAR DATOS DE HORA EXTRA SELECCIONADO 
  EditarDatos(datosSeleccionados: any): void {
    this.componentel.ver_datos = false;
    this.componentel.ver_editar = true;
    this.componentel.hora_id = datosSeleccionados;
    this.componentel.pagina = 'ver-configuracion';
  }

  // METODO PARA VER LISTA DE CONFIGURACIONES
  VerListaConfiguraciones() {
    this.componentel.ver_lista = true;
    this.componentel.ver_datos = false;
    this.componentel.BuscarHora();
  }

}
