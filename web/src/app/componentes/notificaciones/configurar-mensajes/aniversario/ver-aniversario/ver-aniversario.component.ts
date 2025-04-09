import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { MensajesNotificacionesService } from 'src/app/servicios/notificaciones/mensajesNotificaciones/mensajes-notificaciones.service';

import { RegistrarAniversarioComponent } from '../registrar-aniversario/registrar-aniversario.component';
import { EditarAniversarioComponent } from '../editar-aniversario/editar-aniversario.component';

@Component({
  selector: 'app-ver-aniversario',
  templateUrl: './ver-aniversario.component.html',
  styleUrl: './ver-aniversario.component.css'
})

export class VerAniversarioComponent implements OnInit {

  HabilitarBtn: boolean = false;
  API_URL: string = (localStorage.getItem('empresaURL') as string);
  aniversario: any = [];

  constructor(
    private restB: MensajesNotificacionesService,
    private ventana: MatDialog
  ) { }

  ngOnInit(): void {
    this.ObtenerMensajeAniversario();
  }

  // METODO PARA BUSCAR MENSAJE DE ANIVERSARIO
  ObtenerMensajeAniversario() {
    let id_empresa = parseInt(localStorage.getItem('empresa') as string);
    this.restB.VerMensajeNotificaciones(id_empresa).subscribe(res => {
      //console.log('ver aniversario ', res)
      let datos: any = res;
      this.aniversario = datos.filter((item: any) => item.tipo_notificacion === 'aniversario');
      //console.log('ver aniversario ', this.aniversario)
      if (this.aniversario.length != 0) {
        this.HabilitarBtn = false;
      }
      else {
        this.HabilitarBtn = true;
      }
      //console.log('ver habilitar ', this.HabilitarBtn)
    }, error => {
      this.HabilitarBtn = true;
    });
  }

  // METODO PARA REGISTRAR MENSAJE DE ANIVERSARIO
  AbrirRegistrarMensaje() {
    this.ventana.open(RegistrarAniversarioComponent, { width: '500px' })
      .afterClosed().subscribe(items => {
        this.ObtenerMensajeAniversario();
      })
  }

  // METODO PARA EDITAR MENSAJE DE ANIVERSARIO
  EditarMensaje(dataSelect: any) {
    this.ventana.open(EditarAniversarioComponent, { width: '500px', data: dataSelect })
      .afterClosed().subscribe(items => {
        this.ObtenerMensajeAniversario();
      })
  }

}
