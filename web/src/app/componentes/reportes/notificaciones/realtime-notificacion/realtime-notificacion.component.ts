import { FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import { RealTimeService } from 'src/app/servicios/notificaciones/avisos/real-time.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';

import { EliminarRealtimeComponent } from '../eliminar-realtime/eliminar-realtime.component';

export interface NotiRealtime {
  apellido: string,
  create_at: string,
  estado: string,
  id: number,
  id_hora_extra: number | null,
  id_permiso: number | null,
  id_receives_depa: number,
  id_receives_empl: number,
  id_send_empl: number,
  id_vacaciones: number | null,
  nombre: string,
  visto: boolean
}

@Component({
  selector: 'app-realtime-notificacion',
  templateUrl: './realtime-notificacion.component.html',
  styleUrls: ['./realtime-notificacion.component.css']
})

export class RealtimeNotificacionComponent implements OnInit {

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 10;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  nom_empleado = new FormControl('', [Validators.minLength(2)]);
  estado = new FormControl('', [Validators.minLength(2)]);
  fecha = new FormControl('', [Validators.minLength(2)]);

  notificaciones: any = [];
  selectionUno = new SelectionModel<NotiRealtime>(true, []);
  id_loggin: number;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    private realtime: RealTimeService,
    public ventana: MatDialog,
    public validar: ValidacionesService,
  ) { }

  ngOnInit(): void {
    this.id_loggin = parseInt(localStorage.getItem("empleado") as string);
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.ObtenerNotificaciones(this.id_loggin);
  }

  // METODO DE BUSQUEDA DE NOTIFICACIONES
  ObtenerNotificaciones(id_empleado: number) {
    this.notificaciones = [];
    this.realtime.ObtenerNotificacionesAllReceives(id_empleado).subscribe(res => {
      this.notificaciones = res;
    });
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelected() {
    const numSelected = this.selectionUno.selected.length;
    const numRows = this.notificaciones.length;
    return numSelected === numRows;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTÁN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggle() {
    this.isAllSelected() ?
      this.selectionUno.clear() :
      this.notificaciones.forEach((row: any) => this.selectionUno.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabel(row?: NotiRealtime): string {
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

  // METODO PARA ELIMINAR NOTIFICACIONES
  EliminarNotificaciones(opcion: number) {
    let EmpleadosSeleccionados = this.selectionUno.selected.map((obj: any) => {
      return {
        id: obj.id,
        empleado: obj.nombre + ' ' + obj.apellido
      }
    })
    this.ventana.open(EliminarRealtimeComponent,
      { width: '500px', data: { opcion: opcion, lista: EmpleadosSeleccionados } })
      .afterClosed().subscribe(item => {
        if (item === true) {
          this.ObtenerNotificaciones(this.id_loggin);
          this.btnCheckHabilitar = false;
          this.selectionUno.clear();
        };
      });
  }

  // METODO PARA MANEJAR LA PAGINACION
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // METODO PARA IDENTIFICAR SI LAS NOTIFICACIONES SON VISTAS
  CambiarVistaNotificacion(id_realtime: number) {
    const datos = {
      user_name: this.user_name,
      ip: this.ip
    };
    this.realtime.ActualizarVistaNotificacion(id_realtime, datos).subscribe(res => {
    });
  }

  // METODO PARA INGRESAR SOLO LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.nom_empleado.reset();
    this.estado.reset();
    this.fecha.reset();
  }
}
