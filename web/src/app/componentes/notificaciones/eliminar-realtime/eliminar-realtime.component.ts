import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';
import { TimbresService } from 'src/app/servicios/timbres/timbres.service';

@Component({
  selector: 'app-eliminar-realtime',
  templateUrl: './eliminar-realtime.component.html',
  styleUrls: ['./eliminar-realtime.component.css']
})

export class EliminarRealtimeComponent implements OnInit {

  ids: any = [];
  contenidoSolicitudes: boolean = false;
  contenidoAvisos: boolean = false;

  constructor(
    private toastr: ToastrService,
    private realtime: RealTimeService,
    private restAvisos: TimbresService,
    public ventana: MatDialogRef<EliminarRealtimeComponent>,
    @Inject(MAT_DIALOG_DATA) public Notificaciones: any,
  ) { }

  ngOnInit(): void {
    this.MostrarInformacion();
  }

  MostrarInformacion() {
    this.ids = this.Notificaciones.lista.map(obj => {
      return obj.id
    });
    this.Opcion();
  }

  Opcion() {
    if (this.Notificaciones.opcion === 1) {
      this.contenidoAvisos = true;
    } else if (this.Notificaciones.opcion === 2) {
      this.contenidoSolicitudes = true;
    }
  }

  ConfirmarListaNotificaciones() {
    // ELIMINACIÓN DE NOTIFICACIONES DE AVISOS
    if (this.Notificaciones.opcion === 1) {
      this.restAvisos.EliminarAvisos(this.ids).subscribe(res => {
        console.log(res);
        this.toastr.success(res.message, '', {
          timeOut: 6000,
        })
      });
      this.ventana.close(true);

      // ELIMINACIÓN DE NOTIFICACIONES DE PERMISOS, HORAS EXTRAS Y VACACIONES
    } else if (this.Notificaciones.opcion === 2) {
      this.realtime.EliminarNotificaciones(this.ids).subscribe(res => {
        console.log(res);
        this.toastr.success(res.message, '', {
          timeOut: 6000,
        })
      });
      this.ventana.close(true);
    }
  }

}
                                            