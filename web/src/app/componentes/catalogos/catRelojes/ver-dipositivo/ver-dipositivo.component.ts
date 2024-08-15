import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { RelojesService } from 'src/app/servicios/catalogos/catRelojes/relojes.service';

import { ListarRelojesComponent } from '../listar-relojes/listar-relojes.component';

@Component({
  selector: 'app-ver-dipositivo',
  templateUrl: './ver-dipositivo.component.html',
  styleUrls: ['./ver-dipositivo.component.css']
})

export class VerDipositivoComponent implements OnInit {

  @Input() idReloj: number;
  @Input() pagina: string;

  datosReloj: any = [];

  constructor(
    public componentel: ListarRelojesComponent,
    public router: Router,
    public rest: RelojesService,
  ) { }

  ngOnInit(): void {
    this.CargarDatosReloj();
  }

  // METODO PARA CARGAR DATOS DE DISPOSITIVO
  CargarDatosReloj() {
    this.datosReloj = [];
    this.rest.ConsultarDatosId(this.idReloj).subscribe(datos => {
      this.datosReloj = datos;
    })
  }

  // METODO DE DIRECCIONAMIENTO A LA PAGINA D ELISTA DE RELOJES
  VerListaReloj() {
    if (this.pagina === 'listar-relojes') {
      this.componentel.ver_datos = false;
      this.componentel.ver_editar = false;
      this.componentel.listar_relojes = true;
      this.componentel.ObtenerReloj();
    }
    else if (this.pagina === 'registrar-reloj') {
      this.router.navigate(['/listarRelojes']);
    }
  }

  // METODO PARA ABRIR EDITAR RELOJ
  ver_editar: boolean = false;
  ver_datos: boolean = true;
  reloj_id: number;
  pagina_: string = '';
  VerEditarReloj(id: number) {
    this.reloj_id = id;
    this.ver_editar = true;
    this.ver_datos = false;
    if (this.pagina === 'listar-relojes') {
      this.pagina_ = 'ver-editar-listar';
    }
    else if (this.pagina === 'registrar-reloj') {
      this.pagina_ = 'ver-editar-registrar';
    }

  }

  getEditarDispositivo(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Editar Dispositivos');
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 1);
    }
  }

}
