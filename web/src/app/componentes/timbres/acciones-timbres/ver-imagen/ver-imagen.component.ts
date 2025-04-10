import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-ver-imagen',
  standalone: false,
  templateUrl: './ver-imagen.component.html',
  styleUrl: './ver-imagen.component.css'
})

export class VerImagenComponent implements OnInit {

  constructor(
    public ventana: MatDialogRef<VerImagenComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    //console.log(this.data)
  }

  CerrarVentana() {
    this.ventana.close();
  }

}
