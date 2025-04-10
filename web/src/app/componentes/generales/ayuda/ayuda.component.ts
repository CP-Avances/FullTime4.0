import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-ayuda',
  standalone: false,
  templateUrl: './ayuda.component.html',
  styleUrls: ['./ayuda.component.css']
})
export class AyudaComponent implements OnInit {

  constructor(
    public ventana: MatDialogRef<AyudaComponent>,
  ) { }

  ngOnInit(): void {
  }

  cerrarVentana() {
    this.ventana.close();
  }

}
