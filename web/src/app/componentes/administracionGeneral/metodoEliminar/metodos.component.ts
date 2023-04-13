import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';

@Component({
  selector: 'app-metodos',
  templateUrl: './metodos.component.html',
  styleUrls: ['./metodos.component.css']
})


export class MetodosComponent implements OnInit {

  constructor(
    public ventana: MatDialogRef<MetodosComponent>,
    @Inject(MAT_DIALOG_DATA) public mensaje: string) { }

  CerrarVentana(): void {
    this.ventana.close(false);
  }

  Confirmar(): void {
    this.ventana.close(true);
  }

  ngOnInit(): void {

  }

}
