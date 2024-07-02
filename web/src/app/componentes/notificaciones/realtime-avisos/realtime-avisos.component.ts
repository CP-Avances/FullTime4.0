import { FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';

import { TimbresService } from 'src/app/servicios/timbres/timbres.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';

import { EliminarRealtimeComponent } from '../eliminar-realtime/eliminar-realtime.component';

export interface TimbresAvisos {
  create_at: string,
  descripcion: string,
  visto: boolean,
  id_timbre: number,
  empleado: string,
  id: number
}

@Component({
  selector: 'app-realtime-avisos',
  templateUrl: './realtime-avisos.component.html',
  styleUrls: ['./realtime-avisos.component.css']
})

export class RealtimeAvisosComponent implements OnInit {

  id_empleado_logueado: number;
  timbres_noti: any = [];

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 10;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  nom_empleado = new FormControl('', [Validators.minLength(2)]);
  descripcion = new FormControl('', [Validators.minLength(2)]);
  fecha = new FormControl('', [Validators.minLength(2)]);

  selectionUno = new SelectionModel<TimbresAvisos>(true, []);

  constructor(
    private avisos: TimbresService,
    public ventana: MatDialog,
    public validar: ValidacionesService,
  ) { }

  ngOnInit(): void {
    this.id_empleado_logueado = parseInt(localStorage.getItem('empleado') as string);
    this.LlamarNotificacionesTimbres(this.id_empleado_logueado);
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelected() {
    const numSelected = this.selectionUno.selected.length;
    const numRows = this.timbres_noti.length;
    return numSelected === numRows;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTÁN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggle() {
    this.isAllSelected() ?
      this.selectionUno.clear() :
      this.timbres_noti.forEach((row: any) => this.selectionUno.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabel(row?: TimbresAvisos): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionUno.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // METODO PARA HABILITAR SELECCION MULTIPLE
  btnCheckHabilitar: boolean = false;
  HabilitarSeleccion() {
    if (this.btnCheckHabilitar === false) {
      this.btnCheckHabilitar = true;
    } else if (this.btnCheckHabilitar === true) {
      this.btnCheckHabilitar = false;
    }
  }

  // METODO DE PAGINACION
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // METODO PARA BUSCAR NOTIFICACIONES DE AVISOS
  LlamarNotificacionesTimbres(id: number) {
    this.timbres_noti = [];
    this.avisos.AvisosTimbresRealtime(id).subscribe(res => {
      this.timbres_noti = res;
    });
  }

  // METODO PARA ABRIR VENTANA DE ELIMINACION DE NOTIFICACIONES
  EliminarNotificaciones(opcion: number) {
    let EmpleadosSeleccionados = this.selectionUno.selected.map((obj: any) => {
      return {
        id: obj.id,
        empleado: obj.empleado
      }
    })
    this.ventana.open(EliminarRealtimeComponent,
      { width: '500px', data: { opcion: opcion, lista: EmpleadosSeleccionados } }).afterClosed().subscribe(item => {
        if (item === true) {
          this.LlamarNotificacionesTimbres(this.id_empleado_logueado);
          this.btnCheckHabilitar = false;
          this.selectionUno.clear();
        };
      });
  }

  // METODO PARA INGRESAR SOLO LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.nom_empleado.reset();
    this.descripcion.reset();
    this.fecha.reset();
  }

}
