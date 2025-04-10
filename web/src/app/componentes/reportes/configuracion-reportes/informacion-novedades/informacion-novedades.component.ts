import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-informacion-novedades',
  standalone: false,
  templateUrl: './informacion-novedades.component.html',
  styleUrl: './informacion-novedades.component.css'
})

export class InformacionNovedadesComponent implements OnInit {

  constructor(
    public ventana: MatDialogRef<InformacionNovedadesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

  }

  ngOnInit(): void {
    console.log('data ', this.data)
    this.VerificarTipo();
  }

  /** ************************************************************************************************** **
   ** **                          INFORMACION RESPECTO A LA ZONA HORARIA                              ** **
   ** ************************************************************************************************** **/
  zona_horaria: boolean = false;
  hora_diferente: boolean = false;
  VerificarTipo() {
    if (this.data.informacion.zona_servidor != this.data.informacion.zona_dispositivo) {
      this.zona_horaria = true;
    }

    if (this.data.informacion.hora_diferente === true) {
      this.hora_diferente = true;
    }
  }

  // METODO PARA CERRAR EL MODAL
  CerrarVentana() {
    this.ventana.close();
  }

}
