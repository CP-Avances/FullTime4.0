import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-cargar-plantilla',
  templateUrl: './cargar-plantilla.component.html',
  styleUrls: ['./cargar-plantilla.component.css']
})
export class CargarPlantillaComponent {

  archivoForm = new FormControl('', Validators.required);
  // VARIABLE PARA TOMAR RUTA DEL SISTEMA
  hipervinculo: string = environment.url

  // ITEMS DE PAGINACION DE LA TABLA
  pageSizeOptions = [5, 10, 20, 50];
  tamanio_paginaMul: number = 5;
  numero_paginaMul: number = 1;

   // EVENTO PARA MOSTRAR FILAS DETERMINADAS EN LA TABLA
  ManejarPaginaMulti(e: PageEvent) {
    this.tamanio_paginaMul = e.pageSize;
    this.numero_paginaMul = e.pageIndex + 1
  }


}
