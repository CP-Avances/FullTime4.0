import { Component, OnInit } from '@angular/core';

import { AutorizaDepartamentoService } from 'src/app/servicios/autorizaDepartamento/autoriza-departamento.service';

@Component({
  selector: 'app-autoriza-empleado',
  templateUrl: './autoriza-empleado.component.html',
  styleUrls: ['./autoriza-empleado.component.css']
})
export class AutorizaEmpleadoComponent implements OnInit {

  idEmpleado: string = '';
  idCargo: any = [];
  cont: number = 0;

  constructor(
    public restAutoridad: AutorizaDepartamentoService,
  ) {
    // LEER ID DE USUARIO QUE INICIA SESION
    var item = localStorage.getItem('empleado');
    if (item) {
      this.idEmpleado = item;
    }
  }

  ngOnInit(): void {
    this.ObtenerAutorizaciones();
  }

  /** ******************************************************************************************* **
   ** **                METODO DE PRESENTACION DE DATOS DE AUTORIZACION                        ** ** 
   ** ******************************************************************************************* **/

  // METODO PARA MOSTRAR DATOS DE AUTORIDAD DEPARTAMENTOS 
  autorizacionesTotales: any = [];
  ObtenerAutorizaciones() {
    this.autorizacionesTotales = [];
    this.restAutoridad.BuscarAutoridadEmpleado(parseInt(this.idEmpleado)).subscribe(datos => {
      this.autorizacionesTotales = datos;
      console.log('ver datos ', this.autorizacionesTotales)
    })
  }

  
}
