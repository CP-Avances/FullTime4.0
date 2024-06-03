import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-visualizar-asignaciones',
  templateUrl: './visualizar-asignaciones.component.html',
  styleUrls: ['./visualizar-asignaciones.component.css']
})
export class VisualizarAsignacionesComponent {

  asignaciones: any = [];
  nombre: string;

  // ITEMS DE PAGINACION DE LA TABLA
  numero_pagina: number = 1;
  tamanio_pagina: number = 5;
  pageSizeOptions = [5, 10, 20, 50];

  constructor(
    public ventana: MatDialogRef<VisualizarAsignacionesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log('data', this.data);
    this.asignaciones = this.data.asignaciones;
    this.nombre = this.data.nombre;
  }

   // METODO PARA MANEJAR LA PAGINACION
   ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina= e.pageIndex + 1;
  }

  CerrarVentana() {
    this.ventana.close();
  }
}
