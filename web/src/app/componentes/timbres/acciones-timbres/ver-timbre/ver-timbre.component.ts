import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';

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
  idioma_fechas: string = 'es';

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

  constructor(
    public parametro: ParametrosService,
    public ventana: MatDialogRef<VerTimbreComponent>,
    private validar: ValidacionesService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  accion: string = '';
  ngOnInit() {
    this.timbre = [];
    this.accion = '';
    this.timbre = this.data.timbre
    this.accion = this.data.timbre.accion
    this.acciones.filter((elemento: any) => {
      if (elemento.item == this.timbre.accion) {
        this.accion = elemento.text
      }
    })
    this.BuscarParametro();
  }
  fecha_timbre: any;
  hora_timbre: any;
  ObtenerTimbre(formato_fecha: string, formato_hora: string) {
    this.fecha_timbre = this.validar.FormatearFecha(this.timbre.fecha_hora_timbre_validado, formato_fecha, this.validar.dia_completo, this.idioma_fechas);
    this.hora_timbre = this.validar.FormatearHora(this.timbre.fecha_hora_timbre_validado.split(' ')[1], formato_hora);
  }

  // METODO PARA BUSCAR DATOS DE PARAMETROS
  BuscarParametro() {
    let datos: any = [];
    let detalles = { parametros: '1, 2' };
    this.parametro.ListarVariosDetallesParametros(detalles).subscribe(
      res => {
        datos = res;
        //console.log('datos ', datos)
        datos.forEach((p: any) => {
          // id_tipo_parametro Formato fecha = 1
          if (p.id_parametro === 1) {
            this.formato_fecha = p.descripcion;
          }
          // id_tipo_parametro Formato hora = 2
          else if (p.id_parametro === 2) {
            this.formato_hora = p.descripcion;
          }
        })
        this.ObtenerTimbre(this.formato_fecha, this.formato_hora);
      }, vacio => {
        this.ObtenerTimbre(this.formato_fecha, this.formato_hora);
      });
  }

}
