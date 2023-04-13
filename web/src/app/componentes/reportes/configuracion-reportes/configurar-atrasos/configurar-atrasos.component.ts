import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-configurar-atrasos',
  templateUrl: './configurar-atrasos.component.html',
  styleUrls: ['./configurar-atrasos.component.css']
})
export class ConfigurarAtrasosComponent implements OnInit {

  constructor(
    public dialogo: MatDialogRef<ConfigurarAtrasosComponent>,
    @Inject(MAT_DIALOG_DATA) public mensaje: string) { }

  cerrarDialogo(): void {
    this.dialogo.close('cerrar');
  }
  
  confirmadoCon(): void {
    this.dialogo.close('con');
  }

  confirmadoSin(): void {
    this.dialogo.close('sin');
  }

  ngOnInit(): void {

  }

}
