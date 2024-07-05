import { Component, EventEmitter, Output } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { ITableAccionesPaginas } from 'src/app/model/reportes.model';

@Component({
    selector: 'app-opcion-accion',
    templateUrl: './opcion-accion.component.html',
    styleUrls: ['./opcion-accion.component.css']
})
export class OpcionAccionComponent {

    accionesSeleccionadas: any = [];
    accionesEnviar: any = [];

    acciones: any = [
        { nombre: 'I' },
        { nombre: 'U' },
        { nombre: 'D' }
    ]

    // CHECK PAGINAS - ACCIONES
    selectionAcciones = new SelectionModel<ITableAccionesPaginas>(true, []);
    @Output() accionesSeleccionas = new EventEmitter<any>();


    constructor() {
    }


    // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
    checkboxLabelPag(row?: ITableAccionesPaginas): string {
        let accionesEnviar: any = [];

        if (!row) {
            return `${this.isAllSelectedPag() ? 'select' : 'deselect'} all`;
        }
        this.accionesSeleccionadas = this.selectionAcciones.selected;
        this.accionesSeleccionadas.map((a:any) => {
            accionesEnviar.push(a.nombre);
        })
        this.accionesSeleccionas.emit(accionesEnviar);

        return `${this.selectionAcciones.isSelected(row) ? 'deselect' : 'select'} row ${row.nombre + 1}`;
    }

    // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
    isAllSelectedPag() {
        const numSelected = this.selectionAcciones.selected.length;
        return numSelected === this.acciones.length;
    }

}
