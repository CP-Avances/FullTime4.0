import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

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

  buscador !: FormGroup;

  filtroTimbreEmpl: '';
  filtroTimbreEsta: '';
  filtroTimbreFech: '';

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
  
  constructor(
    private realtime: RealTimeService,
    private toastr: ToastrService,
    public ventana: MatDialog
  ) { }

  ngOnInit(): void {
    this.id_loggin = parseInt(localStorage.getItem("empleado") as string);
    this.ObtenerNotificaciones(this.id_loggin);
  }

  ObtenerNotificaciones(id_empleado: number) {
    this.notificaciones = [];
    this.realtime.ObtenerNotificacionesAllReceives(id_empleado).subscribe(res => {
      this.notificaciones = res;
      console.log('notificacioneshhjjkkk', res)

    });
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selectionUno.selected.length;
    const numRows = this.notificaciones.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selectionUno.clear() :
      this.notificaciones.forEach(row => this.selectionUno.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: NotiRealtime): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionUno.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  btnCheckHabilitar: boolean = false;
  HabilitarSeleccion() {
    if (this.btnCheckHabilitar === false) {
      this.btnCheckHabilitar = true;
    } else if (this.btnCheckHabilitar === true) {
      this.btnCheckHabilitar = false;
    }
  }

  Deshabilitar(opcion: number) {
    let EmpleadosSeleccionados = this.selectionUno.selected.map(obj => {
      return {
        id: obj.id,
        empleado: obj.nombre + ' ' + obj.apellido
      }
    })
    console.log(EmpleadosSeleccionados);
    this.ventana.open(EliminarRealtimeComponent,
      { width: '500px', data: { opcion: opcion, lista: EmpleadosSeleccionados } })
      .afterClosed().subscribe(item => {
        console.log(item);
        if (item === true) {
          this.ObtenerNotificaciones(this.id_loggin);
          this.btnCheckHabilitar = false;
          this.selectionUno.clear();
        };
      });
  }

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  CambiarVistaNotificacion(id_realtime: number) {
    this.realtime.PutVistaNotificacion(id_realtime).subscribe(res => {
      console.log(res);
    });
  }

  IngresarSoloLetras(e) {
    let key = e.keyCode || e.which;
    let tecla = String.fromCharCode(key).toString();
    // SE DEFINE TODO EL ABECEDARIO QUE SE VA A USAR.
    let letras = " áéíóúabcdefghijklmnñopqrstuvwxyzÁÉÍÓÚABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    // ES LA VALIDACIÓN DEL KEYCODES, QUE TECLAS RECIBE EL CAMPO DE TEXTO.
    let especiales = [8, 37, 39, 46, 6, 13];
    let tecla_especial = false
    for (var i in especiales) {
      if (key == especiales[i]) {
        tecla_especial = true;
        break;
      }
    }
    if (letras.indexOf(tecla) == -1 && !tecla_especial) {
      this.toastr.info('No se admite datos numéricos', 'Usar solo letras', {
        timeOut: 6000,
      })
      return false;
    }
  }

  limpiarCampos() {
    this.nom_empleado.reset();
    this.estado.reset();
    this.fecha.reset();
  }
}
