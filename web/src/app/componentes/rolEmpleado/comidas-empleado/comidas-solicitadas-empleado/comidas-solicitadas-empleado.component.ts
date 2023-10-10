import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import * as moment from 'moment';

import { EditarSolicitudComidaComponent } from 'src/app/componentes/modulos/alimentacion/solicitar-comida/editar-solicitud-comida/editar-solicitud-comida.component';
import { SolicitaComidaComponent } from 'src/app/componentes/modulos/alimentacion/solicitar-comida/solicita-comida/solicita-comida.component';
import { CancelarComidaComponent } from '../cancelar-comida/cancelar-comida.component';

import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { PlanComidasService } from 'src/app/servicios/planComidas/plan-comidas.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { MainNavService } from 'src/app/componentes/administracionGeneral/main-nav/main-nav.service';

@Component({
  selector: 'app-comidas-solicitadas-empleado',
  templateUrl: './comidas-solicitadas-empleado.component.html',
  styleUrls: ['./comidas-solicitadas-empleado.component.css']
})

export class ComidasSolicitadasEmpleadoComponent implements OnInit {

  get habilitarComida(): boolean { return this.funciones.alimentacion; }

  departamento: any; // VARIABLE DE ALMACENAMIENTO DE ID DE DEPARTAMENTO DE EMPLEADO QUE INICIO SESIÓN
  idEmpleado: string = ''; // VARIABLE QUE ALMACENA ID DEL EMPLEADO QUE INICIA SESIÓN
  FechaActual: string = '';

  // ITEMS DE PAGINACION DE LA TABLA 
  pageSizeOptions = [5, 10, 20, 50];
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;

  constructor(
    public parametro: ParametrosService,
    public funciones: MainNavService,
    public ventana: MatDialog, // VARIABLE DE VENTANA DE DIÁLOGO
    public validar: ValidacionesService,
    public router: Router, // VARIABLE PARA NAVEGAR ENTRE PÁGINAS
    public restP: PlanComidasService, // SERVICIO DE DATOS PLAN COMIDAS

  ) {
    // LEER ID DE USUARIO QUE INICIA SESION
    var item = localStorage.getItem('empleado');
    if (item) {
      this.idEmpleado = item;
    }

    // LEER ID DE DEPARTAMENTO QUE INICIA SESION
    var depa = localStorage.getItem("departamento");
    if (depa) {
      this.departamento = parseInt(depa);
    }
  }

  ngOnInit(): void {
    if (this.habilitarComida === false) {
      let mensaje = {
        access: false,
        title: `Ups!!! al parecer no tienes activado en tu plan el Módulo de Alimentación. \n`,
        message: '¿Te gustaría activarlo? Comunícate con nosotros.',
        url: 'www.casapazmino.com.ec'
      }
      return this.validar.RedireccionarHomeEmpleado(mensaje);
    }
    else {
      var f = moment();
      this.FechaActual = f.format('YYYY-MM-DD');
      this.BuscarParametro();
    }
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
    this.restP.ObtenerSolComidaPorIdEmpleado(parseInt(this.idEmpleado)).subscribe(sol => {
      this.planComidas = sol;
      console.log('comidas ... ', this.planComidas)
      this.FormatearFechas(this.planComidas, formato_fecha, formato_hora);
    });

  }

  // METODO PARA FORMATEAR FECHAS Y HORAS 
  FormatearFechas(datos: any, formato_fecha: string, formato_hora: string) {
    datos.forEach((c: any) => {
      // TRATAMIENTO DE FECHAS Y HORAS
      c.fecha_ = this.validar.FormatearFecha(c.fecha, formato_fecha, this.validar.dia_completo);
      c.fec_comida_ = this.validar.FormatearFecha(c.fec_comida, formato_fecha, this.validar.dia_completo);
      c.hora_inicio_ = this.validar.FormatearHora(c.hora_inicio, formato_hora);
      c.hora_fin_ = this.validar.FormatearHora(c.hora_fin, formato_hora);

    })
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
  ConfirmarEliminar(datos: any) {
    console.log('datos comida ...', datos);
    this.ventana.open(CancelarComidaComponent, { width: '450px', data: datos }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.ObtenerPlanComidasEmpleado(this.formato_fecha, this.formato_hora);
        } else {
          this.router.navigate(['/comidasPlanEmpleado/']);
        }
      });
  }

  // VENTANA PARA INGRESAR SOLICITUD DE COMIDAS 
  AbrirVentanaSolicitar(): void {
    console.log(this.idEmpleado);
    this.ventana.open(SolicitaComidaComponent, {
      width: '1200px',
      data: { idEmpleado: this.idEmpleado, modo: 'solicitud' }
    })
      .afterClosed().subscribe(item => {
        this.ObtenerPlanComidasEmpleado(this.formato_fecha, this.formato_hora);
      });
  }

  // VENTANA PARA EDITAR PLANIFICACIÓN DE COMIDAS 
  AbrirVentanaEditar(datoSeleccionado: any): void {
    console.log(datoSeleccionado);
    this.VentanaEditar(datoSeleccionado, EditarSolicitudComidaComponent)
  }

  // VENTANA PARA ABRIR LA VENTANA DE SOLICITUD DE COMIDAS
  VentanaEditar(datoSeleccionado: any, componente: any) {
    this.ventana.open(componente, {
      width: '600px',
      data: { solicitud: datoSeleccionado }
    })
      .afterClosed().subscribe(item => {
        this.ObtenerPlanComidasEmpleado(this.formato_fecha, this.formato_hora);
      });
  }

}
