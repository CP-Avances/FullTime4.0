import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-configurar-atrasos',
  templateUrl: './configurar-atrasos.component.html',
  styleUrls: ['./configurar-atrasos.component.css']
})
export class ConfigurarAtrasosComponent implements OnInit {

  tolerancia: string = 'no_considerar';
  tipoTolerancia: string = '';

  constructor(
    public dialogo: MatDialogRef<ConfigurarAtrasosComponent>,
    @Inject(MAT_DIALOG_DATA) public mensaje: string) { }

  cerrarDialogo(): void {
    this.dialogo.close('cancelar');
  }
  
  aceptar(): void {
    const result = {
      tolerancia: this.tolerancia,
      tipoTolerancia: this.tipoTolerancia
   };
   this.dialogo.close(result);
  }

  ngOnInit(): void {

  }

}
