import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';

@Component({
  selector: 'app-delete-registro-dispositivo',
  standalone: false,
  templateUrl: './delete-registro-dispositivo.component.html',
  styleUrls: ['./delete-registro-dispositivo.component.css']
})

export class DeleteRegistroDispositivoComponent implements OnInit {

  BooleanAppMap: any = { 'true': 'Si', 'false': 'No' };
  usuarios: any = [];

  constructor(
    public ventana: MatDialogRef<DeleteRegistroDispositivoComponent>,
    @Inject(MAT_DIALOG_DATA) public dispositivos: any
  ) { }

  ngOnInit(): void {
    this.usuarios = this.dispositivos;
  }

}