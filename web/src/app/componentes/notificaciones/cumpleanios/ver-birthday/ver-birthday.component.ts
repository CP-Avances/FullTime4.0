import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { RegistrarBirthdayComponent } from '../../../notificaciones/cumpleanios/registrar-birthday/registrar-birthday.component';
import { EditarBirthdayComponent } from '../../../notificaciones/cumpleanios/editar-birthday/editar-birthday.component';

import { BirthdayService } from 'src/app/servicios/notificaciones/birthday/birthday.service';

@Component({
  selector: 'app-ver-birthday',
  templateUrl: './ver-birthday.component.html',
  styleUrls: ['./ver-birthday.component.css']
})

export class VerBirthdayComponent implements OnInit {

  HabilitarBtn: boolean = false;
  API_URL: string = (localStorage.getItem('empresaURL') as string);
  cumple: any = [];

  constructor(
    private restB: BirthdayService,
    private ventana: MatDialog
  ) { }

  ngOnInit(): void {
    this.ObtenerMensajeCumple();
  }

  // METODO PARA BUSCAR MENSAJE DE CUMPLEAÑOS
  ObtenerMensajeCumple() {
    let id_empresa = parseInt(localStorage.getItem('empresa') as string);
    this.restB.VerMensajeCumpleanios(id_empresa).subscribe(res => {
      this.cumple = res;
      this.HabilitarBtn = false;
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
  getEditarCumpleanos(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Gestionar mensajes cumpleaños');
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 1);
    }
  }

}
