import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';

@Component({
  selector: 'app-visualizar-observacion',
  standalone: false,
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
    if (this.data.observacion !== 'OK' && this.data.observacion !== 'FD') {
      this.observaciones.push(this.data.observacion);
    }

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

    if (this.data.observacion6) {
      this.observaciones.push(this.data.observacion6);
      this.observaciones.push('Se eliminará la planificación existente');
    }

    this.data.horarios.forEach((horario: any) => {
      this.observaciones.push(`${horario.codigo}: ${horario.observacion}`);
    });
  }

  // METODO PARA CERRAR EL MODAL
  CerrarVentana() {
    this.observaciones = [];
    this.ventana.close();
  }


}
