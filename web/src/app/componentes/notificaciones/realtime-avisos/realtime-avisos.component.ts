import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { TimbresService } from 'src/app/servicios/timbres/timbres.service';
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

  buscador !: FormGroup;

  id_empleado_logueado: number;
  timbres_noti: any = [];

  filtroTimbreEmpl: '';
  filtroTimbreDesc: '';
  filtroTimbreFech: '';

  // items de paginacion de la tabla
  tamanio_pagina: number = 10;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  nom_empleado = new FormControl('', [Validators.minLength(2)]);
  descripcion = new FormControl('', [Validators.minLength(2)]);
  fecha = new FormControl('', [Validators.minLength(2)]);

  selectionUno = new SelectionModel<TimbresAvisos>(true, []);


  constructor(
    private timbresNoti: TimbresService,
    private toastr: ToastrService,
    public vistaRegistrarDatos: MatDialog
  ) { }

  ngOnInit(): void {
    this.id_empleado_logueado = parseInt(localStorage.getItem('empleado') as string);
    this.LlamarNotificacionesTimbres(this.id_empleado_logueado);
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selectionUno.selected.length;
    const numRows = this.timbres_noti.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
    this.selectionUno.clear() :
    this.timbres_noti.forEach(row => this.selectionUno.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: TimbresAvisos): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionUno.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  btnCheckHabilitar: boolean = false;
  HabilitarSeleccion(){
    if (this.btnCheckHabilitar === false) {
      this.btnCheckHabilitar = true;
    } else if(this.btnCheckHabilitar === true) {
      this.btnCheckHabilitar = false;
    }
  }

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  LlamarNotificacionesTimbres(id: number) {
    this.timbres_noti = [];
    this.timbresNoti.AvisosTimbresRealtime(id).subscribe(res => {
      this.timbres_noti = res;
      console.log(this.timbres_noti);
      if (!this.timbres_noti.message) {
        if (this.timbres_noti.length > 0) {
          console.log('mayor a cero');
          
        }
      }
    });
  }

  Deshabilitar(opcion: number){
    let EmpleadosSeleccionados = this.selectionUno.selected.map(obj => {
        return {
          id: obj.id,
          empleado: obj.empleado
        }
      })
    console.log(EmpleadosSeleccionados);
    this.vistaRegistrarDatos.open(EliminarRealtimeComponent, { width: '500px', data: {opcion: opcion, lista: EmpleadosSeleccionados} }).afterClosed().subscribe(item => {
      console.log(item);
      if (item === true) {
        this.LlamarNotificacionesTimbres(this.id_empleado_logueado);
        this.btnCheckHabilitar = false;
        this.selectionUno.clear();
      };
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
    this.descripcion.reset();
    this.fecha.reset();
  }

}
