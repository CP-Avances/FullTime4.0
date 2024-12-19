import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { RealTimeService } from 'src/app/servicios/notificaciones/avisos/real-time.service';
import { TimbresService } from 'src/app/servicios/timbres/timbrar/timbres.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';

@Component({
  selector: 'app-eliminar-realtime',
  templateUrl: './eliminar-realtime.component.html',
  styleUrls: ['./eliminar-realtime.component.css']
})

export class EliminarRealtimeComponent implements OnInit {
  ips_locales: any = '';

  ids: any = [];
  contenidoSolicitudes: boolean = false;
  contenidoAvisos: boolean = false;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    private toastr: ToastrService,
    private realtime: RealTimeService,
    private restAvisos: TimbresService,
    public ventana: MatDialogRef<EliminarRealtimeComponent>,
    public validar: ValidacionesService,
    @Inject(MAT_DIALOG_DATA) public Notificaciones: any,
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');  
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    }); 

    this.MostrarInformacion();
  }

  MostrarInformacion() {
    this.ids = this.Notificaciones.lista.map((obj: any) => {
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


  // ELIMINAR NOTIFICACIONES
  ConfirmarListaNotificaciones() {
    const datos = {
      arregloNotificaciones: this.ids,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales
    }

    const datosAvisos = {
      arregloAvisos: this.ids,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales
    }
    // ELIMINACION DE NOTIFICACIONES DE AVISOS
    if (this.Notificaciones.opcion === 1) {
      this.restAvisos.EliminarAvisos(datosAvisos).subscribe(res => {
        console.log(res);
        if (res.message === 'OK') {
          this.toastr.error('Registros eliminados correctamente.', '', {
            timeOut: 6000,
          })
          this.ventana.close(true);
        }
        else {
          this.toastr.info('Ups algo ha salido mal.', 'Notificaciones no seleccionadas.', {
            timeOut: 6000,
          })
          this.ventana.close(true);
        }
      });

      // ELIMINACION DE NOTIFICACIONES DE PERMISOS, HORAS EXTRAS Y VACACIONES
    } else if (this.Notificaciones.opcion === 2) {
      this.realtime.EliminarNotificaciones(datos).subscribe(res => {
        console.log(res);
        if (res.message === 'OK') {
          this.toastr.error('Registros eliminados correctamente.', '', {
            timeOut: 6000,
          })
          this.ventana.close(true);
        }
        else {
          this.toastr.info('Ups algo ha salido mal.', 'Notificaciones no seleccionadas.', {
            timeOut: 6000,
          })
          this.ventana.close(true);
        }
      });
    }
  }

}
