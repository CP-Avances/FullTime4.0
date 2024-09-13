import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-informacion-novedades',
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
    if (this.data.tipo === 'zona_horaria') {
      this.zona_horaria = true;
    }
    else if(this.data.tipo === 'hora_diferente'){
      this.hora_diferente = true;
    }
  }

  // METODO PARA CERRAR EL MODAL
  CerrarVentana() {
    this.ventana.close();
  }

}
