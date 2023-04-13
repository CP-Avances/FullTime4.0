//LLAMADO A LAS LIBRERIAS
import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import * as moment from 'moment';

// LLAMADO A LOS SERVICIOS
import { PlanComidasService } from 'src/app/servicios/planComidas/plan-comidas.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';

@Component({
  selector: 'app-planificacion-comidas-empleado',
  templateUrl: './planificacion-comidas-empleado.component.html',
  styleUrls: ['./planificacion-comidas-empleado.component.css']
})

export class PlanificacionComidasEmpleadoComponent implements OnInit {

  departamento: any; // VARIABLE DE ALMACENAMIENTO DE ID DE DEPARTAMENTO DE EMPLEADO QUE INICIO SESION
  idEmpleado: string = ''; // VARIABLE QUE ALMACENA ID DEL EMPLEADO QUE INICIA SESION
  FechaActual: string = '';

  // ITEMS DE PAGINACIÓN DE LA TABLA 
  pageSizeOptions = [5, 10, 20, 50];
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;

  constructor(
    public parametro: ParametrosService,
    public validar: ValidacionesService,
    public router: Router, // VARIABLE PARA NAVEGAR ENTRE PAGINAS
    public restP: PlanComidasService, // SERVICIO DE DATOS PLAN COMIDAS

  ) {
    // LEER ID DE USUARIO QUE INICIA SESION
    var item = localStorage.getItem('empleado');
    if (item) {
      this.idEmpleado = item;
    }

    // LEER DEPARTAMENTO DE USUARIO QUE INICIA SESION
    var depa = localStorage.getItem("departamento");
    if (depa) {
      this.departamento = parseInt(depa);
    }
  }

  ngOnInit(): void {
    var f = moment();
    this.FechaActual = f.format('YYYY-MM-DD');
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
    this.ObtenerPlanComidasEmpleado(formato_fecha, formato_hora);
  }

  // METODO PARA MOSTRAR DETERMINADO NÚMERO DE FILAS DE LA TABLA
  ManejarPagina(e: PageEvent) {
    this.numero_pagina = e.pageIndex + 1;
    this.tamanio_pagina = e.pageSize;
  }

  /** *************************************************************************************** **
   ** **          METODO DE PRESENTACION DE DATOS DE SERVICIO DE ALIMENTACION              ** **
   ** *************************************************************************************** **/

  // METODO PARA MOSTRAR DATOS DE PLANIFICACIÓN DE ALMUERZOS 
  planComidas: any = [];
  ObtenerPlanComidasEmpleado(formato_fecha: string, formato_hora: string) {
    this.planComidas = [];
    this.restP.ObtenerPlanComidaPorIdEmpleado(parseInt(this.idEmpleado)).subscribe(res => {
      this.planComidas = res;
      this.FormatearFechas(this.planComidas, formato_fecha, formato_hora);
    });
  }

  // METODO PARA FORMATEAR FECHAS Y HORAS 
  FormatearFechas(datos: any, formato_fecha: string, formato_hora: string) {
    datos.forEach((c: any) => {
      // TRATAMIENTO DE FECHAS Y HORAS
      c.fecha_ = this.validar.FormatearFecha(c.fecha, formato_fecha, this.validar.dia_completo);

      if (c.fec_comida != undefined) {
        c.fec_comida_ = this.validar.FormatearFecha(c.fec_comida, formato_fecha, this.validar.dia_completo);
      }
      else {
        c.fec_inicio_ = this.validar.FormatearFecha(c.fec_inicio, formato_fecha, this.validar.dia_completo);
        c.fec_final_ = this.validar.FormatearFecha(c.fec_final, formato_fecha, this.validar.dia_completo);
      }

      c.hora_inicio_ = this.validar.FormatearHora(c.hora_inicio, formato_hora);
      c.hora_fin_ = this.validar.FormatearHora(c.hora_fin, formato_hora);

    })
  }

}
