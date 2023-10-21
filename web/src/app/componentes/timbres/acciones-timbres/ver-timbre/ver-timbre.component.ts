import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import moment from 'moment';

import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';

@Component({
  selector: 'app-ver-timbre',
  templateUrl: './ver-timbre.component.html',
  styleUrls: ['./ver-timbre.component.css']
})

export class VerTimbreComponent implements OnInit {

  timbre: any = [];
  formato_fecha: string = 'DD/MM/YYYY';
  formato_hora: string = 'HH:mm:ss';

  // LISTA DE ACCIONES DE TIMBRES
  acciones: any = [
    { item: 'E', text: 'Entrada' },
    { item: 'S', text: 'Salida' },
    { item: 'I/A', text: 'Inicio alimentación' },
    { item: 'F/A', text: 'Fin alimentación' },
    { item: 'I/P', text: 'Inicio permiso' },
    { item: 'F/P', text: 'Fin permiso' },
    { item: 'HA', text: 'Timbre libre' },
    { item: 'D', text: 'Desconocido' }
  ]

  rolEmpleado: any;

  constructor(
    public ventana: MatDialogRef<VerTimbreComponent>,
    private validar: ValidacionesService,
    public parametro: ParametrosService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.rolEmpleado = localStorage.getItem('rol');
  }

  accion: string = ''
  ngOnInit() {
    this.timbre = [];
    this.accion = '';
    this.timbre = this.data.timbre
    this.accion = this.data.timbre.accion
    this.acciones.filter(elemento => {
      if (elemento.item == this.timbre.accion) {
        this.accion = elemento.text
      }
    })
    this.BuscarParametro();
  }

  fecha_timbre: any;
  hora_timbre: any;
  ObtenerTimbre(formato_fecha: string, formato_hora: string) {
    this.fecha_timbre = this.validar.FormatearFecha(this.timbre.fec_hora_timbre_servidor, formato_fecha, this.validar.dia_completo);
    this.hora_timbre = this.validar.FormatearHora(this.timbre.fec_hora_timbre_servidor.split(' ')[1], formato_hora);
  }

  // METODO PARA BUSCAR PARAMETRO DE FORMATO DE FECHA
  BuscarParametro() {
    // id_tipo_parametro Formato fecha = 25
    this.parametro.ListarDetalleParametros(25).subscribe(
      res => {
        this.formato_fecha = res[0].descripcion;
        this.BuscarHora(this.formato_fecha)
      },
      vacio => {
        this.BuscarHora(this.formato_fecha)
      });
  }

  BuscarHora(fecha: string) {
    // id_tipo_parametro Formato hora = 26
    this.parametro.ListarDetalleParametros(26).subscribe(
      res => {
        this.formato_hora = res[0].descripcion;
        this.ObtenerTimbre(fecha, this.formato_hora);
      },
      vacio => {
        this.ObtenerTimbre(fecha, this.formato_hora);
      });
  }



}
