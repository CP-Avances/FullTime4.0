import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RegistrarBirthdayComponent } from '../registrar-birthday/registrar-birthday.component';
import { EditarBirthdayComponent } from '../editar-birthday/editar-birthday.component';
import { MensajesNotificacionesService } from 'src/app/servicios/notificaciones/mensajesNotificaciones/mensajes-notificaciones.service';

@Component({
  selector: 'app-ver-birthday',
  standalone: false,
  templateUrl: './ver-birthday.component.html',
  styleUrls: ['./ver-birthday.component.css']
})

export class VerBirthdayComponent implements OnInit {

  HabilitarBtn: boolean = false;
  API_URL: string = (localStorage.getItem('empresaURL') as string);
  cumple: any = [];

  constructor(
    private restB: MensajesNotificacionesService,
    private ventana: MatDialog
  ) { }

  ngOnInit(): void {
    this.ObtenerMensajeCumple();
  }

  // METODO PARA BUSCAR MENSAJE DE CUMPLEAÑOS
  ObtenerMensajeCumple() {
    let id_empresa = parseInt(localStorage.getItem('empresa') as string);
    this.restB.VerMensajeNotificaciones(id_empresa).subscribe(res => {
      //console.log('ver cumple ', res)
      let datos: any = res;
      this.cumple = datos.filter((item: any) => item.tipo_notificacion === 'cumpleanios');
      if (this.cumple != 0) {
        this.HabilitarBtn = false;
      }
      else {
        this.HabilitarBtn = true;
      }
    }, error => {
      this.HabilitarBtn = true;
    });
  }

  // METODO PARA REGISTRAR MENSAJE DE CUMPLEAÑOS
  AbrirRegistrarMensaje() {
    this.ventana.open(RegistrarBirthdayComponent, { width: '500px' })
      .afterClosed().subscribe(items => {
        this.ObtenerMensajeCumple();
      })
  }

  // METODO PARA EDITAR MENSAJE DE CUMPELAÑOS
  EditarMensaje(dataSelect: any) {
    this.ventana.open(EditarBirthdayComponent, { width: '500px', data: dataSelect })
      .afterClosed().subscribe(items => {
        this.ObtenerMensajeCumple();
      })
  }

  //CONTROL BOTONES
  private tienePermiso(accion: string, idFuncion?: number): boolean {
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      try {
        const datos = JSON.parse(datosRecuperados);
        return datos.some((item: any) =>
          item.accion === accion && (idFuncion === undefined || item.id_funcion === idFuncion)
        );
      } catch {
        return false;
      }
    } else {
      return parseInt(localStorage.getItem('rol') || '0') === 1;
    }
  }

  getEditarCumpleanos(){
    return this.tienePermiso('Gestionar mensajes cumpleaños');
  }

}
