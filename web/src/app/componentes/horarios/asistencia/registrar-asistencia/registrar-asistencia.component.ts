import { Validators, FormGroup, FormControl } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { AsistenciaService } from 'src/app/servicios/asistencia/asistencia.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import moment from 'moment';
import { PageEvent } from '@angular/material/paginator';
import { BuscarAsistenciaComponent } from '../buscar-asistencia/buscar-asistencia.component';

@Component({
  selector: 'app-registrar-asistencia',
  templateUrl: './registrar-asistencia.component.html',
  styleUrls: ['./registrar-asistencia.component.css']
})

export class RegistrarAsistenciaComponent implements OnInit {

  @Input() informacion: any;

  constructor(
    public componneteb: BuscarAsistenciaComponent,
  ) { }

  ngOnInit(): void {
    console.log('ver seleccion ', this.informacion);
  }


  // METODO PARA CERRAR VENTANA
  CerrarVentana() {
    if (this.informacion.pagina === 'buscar-asistencia') {
      this.componneteb.ver_detalle = false;
      this.componneteb.ver_asistencia = true;
    }
  }

}
