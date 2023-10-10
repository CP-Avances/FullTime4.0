import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';

import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { PlanHoraExtraService } from 'src/app/servicios/planHoraExtra/plan-hora-extra.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';

@Component({
  selector: 'app-horas-planificadas-empleado',
  templateUrl: './horas-planificadas-empleado.component.html',
  styleUrls: ['./horas-planificadas-empleado.component.css']
})

export class HorasPlanificadasEmpleadoComponent implements OnInit {

  idEmpleado: number = 0;
  // ITEMS DE PAGINACION DE LA TABLA 
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  constructor(
    private plan: PlanHoraExtraService,
    private validar: ValidacionesService,
    public parametro: ParametrosService,
    public informacion: DatosGeneralesService,
  ) {
    // LEER ID DE USUARIO QUE INICIA SESION
    var item = localStorage.getItem("empleado");
    if (item) {
      this.idEmpleado = parseInt(item);
    }
  }

  ngOnInit(): void {
    this.BuscarParametro();
  }

  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** ** 
   ** **************************************************************************************** **/

  formato_fecha: string = 'DD/MM/YYYY';
  formato_hora: string = 'HH:mm:ss';

  // METODO PARA BUSCAR PARAMETRO DE FORMATO DE FECHA
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
    this.plan.ListarPlanificacionUsuario(this.idEmpleado).subscribe(res => {
      this.hora_extra = res;
      this.hora_extra.forEach((h: any) => {
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

        h.fecha_inicio_ = this.validar.FormatearFecha(h.fecha_desde, formato_fecha, this.validar.dia_completo);
        h.hora_inicio_ = this.validar.FormatearHora(h.hora_inicio, formato_hora);

        h.fecha_fin_ = this.validar.FormatearFecha(h.fecha_hasta, formato_fecha, this.validar.dia_completo);;
        h.hora_fin_ = this.validar.FormatearHora(h.hora_fin, formato_hora);
      })

    }, err => {
      return this.validar.RedireccionarHomeEmpleado(err.error);
    });
  }

}
