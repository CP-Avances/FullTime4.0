import { Component, OnInit, Inject } from '@angular/core';
import { NotiAutorizacionesService } from 'src/app/servicios/catalogos/catNotiAutorizaciones/noti-autorizaciones.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { NotiAutorizacionesComponent } from "../../Registro/noti-autorizaciones/noti-autorizaciones.component";

@Component({
  selector: 'app-listar-noti-autorizaciones',
  templateUrl: './listar-noti-autorizaciones.component.html',
  styleUrls: ['./listar-noti-autorizaciones.component.css']
})
export class ListarNotiAutorizacionesComponent implements OnInit {

  noti_autorizacion: any = [];
  habilitarA: boolean = false;
  constructor(
    private restN: NotiAutorizacionesService,
    public vistaRegistrarDatos: MatDialog,
    public dialogRef: MatDialogRef<ListarNotiAutorizacionesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    console.log(this.data);
    this.noti_autorizacion = [];
    this.restN.getListaNotiAutorioRest(this.data.id).subscribe(res => {
      console.log(res);
      this.noti_autorizacion = res;
    }, error => {
      this.habilitarA = true;
    });
  }

  AbrirNotificacionAutorizacion(datosSeleccionados: any): void {
    this.vistaRegistrarDatos.open(NotiAutorizacionesComponent, { width: '400px', data: datosSeleccionados }).disableClose = true;
  }
}
