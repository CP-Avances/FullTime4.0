import { Component, Inject, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-visualizar-observacion',
  templateUrl: './visualizar-observacion.component.html',
  styleUrls: ['./visualizar-observacion.component.css']
})
export class VisualizarObservacionComponent {

  observaciones: string[] = [];
  dia: string = '';



  constructor(
    public ventana: MatDialogRef<VisualizarObservacionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.EstructurarObservaciones();
  }


  // METODO PARA ESTRUCTURAR OBSERVACIONES
  EstructurarObservaciones() {
    this.dia = this.data.fecha;
    this.observaciones.push(this.data.observacion);

    if (this.data.observacion2) {
      this.observaciones.push(this.data.observacion2);
      return;
    }

    if (this.data.observacion3) {
      this.observaciones.push(this.data.observacion3);
    }

    if (this.data.observacion4) {
      this.observaciones.push(this.data.observacion4);
    }

    this.data.horarios.forEach((horario:any) => {
      this.observaciones.push(`${horario.codigo}: ${horario.observacion}`);
    });

  }


  // METODO PARA CERRAR EL MODAL
  CerrarVentana() {
    this.observaciones = [];
    this.ventana.close();
  }


}
