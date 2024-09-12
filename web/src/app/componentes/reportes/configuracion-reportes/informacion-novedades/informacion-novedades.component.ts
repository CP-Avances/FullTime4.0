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

  }

  // METODO PARA CERRAR EL MODAL
  CerrarVentana() {
    this.ventana.close();
  }

}
