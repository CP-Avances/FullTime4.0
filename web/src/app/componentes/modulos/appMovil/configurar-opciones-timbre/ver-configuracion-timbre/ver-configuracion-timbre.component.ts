import { Component, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';

import { TimbresService } from 'src/app/servicios/timbres/timbres.service';

import { ConfigurarOpcionesTimbresComponent } from '../configurar-opciones-timbres/configurar-opciones-timbres.component';

@Component({
  selector: 'app-ver-configuracion-timbre',
  templateUrl: './ver-configuracion-timbre.component.html',
  styleUrl: './ver-configuracion-timbre.component.css'
})

export class VerConfiguracionTimbreComponent implements OnInit {

  @Input() informacion: any;

  configuracion: any = [];
  idEmpleadoLogueado: any;
  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // ITEMS DE PAGINACION DE LA TABLA
  pageSizeOptions = [5, 10, 20, 50];
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;

  constructor(
    public ventana: ConfigurarOpcionesTimbresComponent,
    public opciones: TimbresService,
    private toastr: ToastrService,
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    //console.log('ver info ', this.informacion)
    this.RevisarEmpleados();
  }


  // METODO PARA OBTENER IDs DE EMPLEADOS
  RevisarEmpleados() {
    let id = '';
    this.informacion.forEach((empl: any) => {
      if (id === '') {
        id = empl.id;
      }
      else {
        id = id + ', ' + empl.id;
      }
    })
    let buscar = {
      id_empleado: id,
    }
    //console.log('ver id ', buscar)
    this.ActualizarOpcionMarcacion(buscar);
  }

  // METODO PARA ACTUALIZAR OPCION DE MARCACION
  ActualizarOpcionMarcacion(informacion: any) {
    this.configuracion = [];
    let numero = 0;
    this.opciones.BuscarVariasOpcionesMarcacion(informacion).subscribe((a) => {
      //console.log('ver datos ', a)
      this.configuracion = a.respuesta;
      this.configuracion.forEach((c: any) => {
        numero = numero + 1;
        c.n = numero;
      })
    }, (vacio: any) => {
      //console.log('vacio ')
      this.toastr.info('No se han encontrado registros.', '', {
        timeOut: 6000,
      });
      this.Regresar();
    });
  }

  // METODO PARA SALIR DE LA PANTALLA
  Regresar() {
    this.ventana.configurar = true;
    this.ventana.ver_configurar = false;
  }

  // METODO PARA MANEJAR PAGINACION 
  ManejarPagina(e: PageEvent) {
    this.numero_pagina = e.pageIndex + 1;
    this.tamanio_pagina = e.pageSize;
  }
}
