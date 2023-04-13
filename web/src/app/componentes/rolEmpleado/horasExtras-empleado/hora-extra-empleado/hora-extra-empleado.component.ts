import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import * as moment from 'moment';

import { EditarHoraExtraEmpleadoComponent } from '../editar-hora-extra-empleado/editar-hora-extra-empleado.component';
import { CancelarHoraExtraComponent } from '../cancelar-hora-extra/cancelar-hora-extra.component';
import { PedHoraExtraService } from 'src/app/servicios/horaExtra/ped-hora-extra.service';
import { ValidacionesService } from '../../../../servicios/validaciones/validaciones.service';
import { PedidoHoraExtraComponent } from 'src/app/componentes/modulos/horasExtras/pedido-hora-extra/pedido-hora-extra.component';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-hora-extra-empleado',
  templateUrl: './hora-extra-empleado.component.html',
  styleUrls: ['./hora-extra-empleado.component.css']
})

export class HoraExtraEmpleadoComponent implements OnInit {

  idEmpleado: number;
  // ITEMS DE PAGINACIÓN DE LA TABLA 
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  hipervinculo: string = environment.url

  constructor(
    private restHE: PedHoraExtraService,
    private ventana: MatDialog,
    private validar: ValidacionesService,
    public parametro: ParametrosService,
    public informacion: DatosGeneralesService,
  ) {
    this.idEmpleado = parseInt(localStorage.getItem("empleado") as string);
  }

  ngOnInit(): void {
    this.BuscarParametro();
  }

  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** ** 
   ** **************************************************************************************** **/

  formato_fecha: string = 'DD/MM/YYYY';
  formato_hora: string = 'HH:mm:ss';

  // METODO PARA BUSCAR PARÁMETRO DE FORMATO DE FECHA
  BuscarParametro() {
    // id_tipo_parametro Formato fecha = 25
    this.parametro.ListarDetalleParametros(25).subscribe(
      res => {
        this.formato_fecha = res[0].descripcion;
        this.BuscarHora(this.formato_fecha);
      },
      vacio => {
        this.BuscarHora(this.formato_fecha);
      });
  }

  BuscarHora(fecha: string) {
    // id_tipo_parametro Formato hora = 26
    this.parametro.ListarDetalleParametros(26).subscribe(
      res => {
        this.formato_hora = res[0].descripcion;
        // LLAMADO A PRESENTACION DE DATOS
        this.LlamarMetodos(fecha, this.formato_hora);
      },
      vacio => {
        this.LlamarMetodos(fecha, this.formato_hora);
      });
  }

  // LLAMAR METODOS DE PRESENTACION DE INFORMACION
  LlamarMetodos(formato_fecha: string, formato_hora: string) {
    this.ObtenerListaHorasExtras(formato_fecha, formato_hora);
  }

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  /** *************************************************************************************** **
   ** **                 METODO PARA MOSTRAR DATOS DE HORAS EXTRAS                         ** ** 
   ** *************************************************************************************** **/

  // METODO DE BUSQUEDA DE HORAS EXTRAS
  hora_extra: any = [];
  ObtenerListaHorasExtras(formato_fecha: string, formato_hora: string) {
    this.hora_extra = [];
    this.restHE.ObtenerListaEmpleado(this.idEmpleado).subscribe(res => {
      this.hora_extra = res;
      this.hora_extra.forEach(h => {
        if (h.estado === 1) {
          h.estado = 'Pendiente';
        }
        else if (h.estado === 2) {
          h.estado = 'Pre-autorizado';
        }
        else if (h.estado === 3) {
          h.estado = 'Autorizado';
        }
        else if (h.estado === 4) {
          h.estado = 'Negado';
        }

        h.fecha_inicio_ = this.validar.FormatearFecha(moment(h.fec_inicio).format('YYYY-MM-DD'), formato_fecha, this.validar.dia_completo);
        h.hora_inicio_ = this.validar.FormatearHora(moment(h.fec_inicio).format('HH:mm:ss'), formato_hora);

        h.fecha_fin_ = this.validar.FormatearFecha(moment(h.fec_final).format('YYYY-MM-DD'), formato_fecha, this.validar.dia_completo);;
        h.hora_fin_ = this.validar.FormatearHora(moment(h.fec_final).format('HH:mm:ss'), formato_hora);

        h.fec_solicita_ = this.validar.FormatearFecha(h.fec_solicita, formato_fecha, this.validar.dia_completo);
      })

    }, err => {
      return this.validar.RedireccionarEstadisticas(err.error);
    });
  }

  CancelarHoraExtra(h: any) {
    this.ventana.open(CancelarHoraExtraComponent,
      { width: '450px', data: h }).afterClosed().subscribe(items => {
        console.log(items);
        this.ObtenerListaHorasExtras(this.formato_fecha, this.formato_hora);
      });
  }

  AbrirVentanaHoraExtra() {
    this.ventana.open(PedidoHoraExtraComponent,
      { width: '900px' }).afterClosed().subscribe(items => {
        this.ObtenerListaHorasExtras(this.formato_fecha, this.formato_hora);
      });
  }

  EditarHoraExtra(h) {
    this.ventana.open(EditarHoraExtraEmpleadoComponent,
      { width: '900px', data: h }).afterClosed().subscribe(items => {
        console.log(items);
        this.ObtenerListaHorasExtras(this.formato_fecha, this.formato_hora);
      });
  }

}
