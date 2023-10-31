import { Component, OnInit, Input } from '@angular/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
import { ThemePalette } from '@angular/material/core';
import { PageEvent } from '@angular/material/paginator';
import moment from 'moment';

import { BuscarAsistenciaComponent } from '../buscar-asistencia/buscar-asistencia.component';

import { TimbresService } from 'src/app/servicios/timbres/timbres.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { PlanGeneralService } from 'src/app/servicios/planGeneral/plan-general.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';

@Component({
  selector: 'app-registrar-asistencia',
  templateUrl: './registrar-asistencia.component.html',
  styleUrls: ['./registrar-asistencia.component.css']
})

export class RegistrarAsistenciaComponent implements OnInit {

  @Input() informacion: any;

  // VARIABLES PROGRESS SPINNER
  progreso: boolean = false;
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 10;

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  constructor(
    public componneteb: BuscarAsistenciaComponent,
    public parametro: ParametrosService,
    public validar: ValidacionesService,
    public asistir: PlanGeneralService,
    public timbre: TimbresService,
    public toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    console.log('ver seleccion ', this.informacion);
    this.BuscarFecha();
    this.BuscarHora();
  }

  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** ** 
   ** **************************************************************************************** **/

  formato_fecha: string = 'DD/MM/YYYY';
  formato_hora: string = 'HH:mm:ss';

  // METODO PARA BUSCAR PARAMETRO DE FORMATO DE FECHA
  BuscarFecha() {
    // id_tipo_parametro Formato fecha = 25
    this.parametro.ListarDetalleParametros(25).subscribe(
      res => {
        this.formato_fecha = res[0].descripcion;
        this.BuscarHora();
      });
  }

  BuscarHora() {
    // id_tipo_parametro Formato hora = 26
    this.parametro.ListarDetalleParametros(26).subscribe(
      res => {
        this.formato_hora = res[0].descripcion;
      });
  }

  // CONTROL DE PAGINACION
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1
  }

  // METODO PARA BUSCAR TIMBRES
  timbres: any = [];
  ver_timbres: boolean = false;
  sistema: boolean = false;
  manual: boolean = false;
  VerificarManual() {
    this.timbres = [];
    var funcion = '';

    if (this.informacion.detalle.tipo_entr_salida === 'E') {
      funcion = '0';
    }
    else if (this.informacion.detalle.tipo_entr_salida === 'S') {
      funcion = '1';
    }
    else if (this.informacion.detalle.tipo_entr_salida === 'I/A') {
      funcion = '2';
    }
    else if (this.informacion.detalle.tipo_entr_salida === 'F/A') {
      funcion = '3';
    }
    else if (this.informacion.detalle.tipo_entr_salida === 'I/P') {
      funcion = '4';
    }
    else if (this.informacion.detalle.tipo_entr_salida === 'F/P') {
      funcion = '5';
    }
    else if (this.informacion.detalle.tipo_entr_salida === 'HA') {
      funcion = '7';
    }

    let datos = {
      codigo: this.informacion.detalle.codigo,
      funcion: funcion,
      fecha: this.informacion.detalle.fecha_horario
    }

    this.timbre.BuscarTimbresAsistencia(datos).subscribe(data => {
      console.log('ver datos ', data)
      if (data.message === 'OK') {
        console.log('ver respuesta ', data.respuesta)
        this.timbres = data.respuesta;
        this.timbres.forEach((obj: any) => {
          //console.log('ver fecha ', moment(obj.t_fec_timbre).format('YYYY-MM-DD'))
          //console.log('ver hora ', moment(obj.t_hora_timbre).format('HH:mm:ss'))
          obj.fecha = this.validar.FormatearFecha(moment(obj.t_fec_timbre).format('YYYY-MM-DD'), this.formato_fecha, this.validar.dia_abreviado);
          obj.hora = this.validar.FormatearHora(obj.t_hora_timbre, this.formato_hora);
        })
        this.ControlarBotones(true, true, true);
      }
      else {
        this.toastr.warning('No se han encontrado registros.', '', {
          timeOut: 6000,
        });
        this.ControlarBotones(false, false, false);
      }
    }, vacio => {
      this.toastr.warning('No se han encontrado registros.', '', {
        timeOut: 6000,
      });
      this.ControlarBotones(false, false, false);
    })
  }

  // METODO PARA VER BOTONES
  ControlarBotones(sistema: boolean, manual: boolean, timbres: boolean) {
    this.sistema = sistema;
    this.manual = manual;
    this.ver_timbres = timbres;
  }

  // METODO POARA CERRAR TABLA DE TIMBRES
  CerrarTimbres() {
    this.ControlarBotones(false, false, false);
  }

  // METODO PARA REASIGNAR TIMBRE
  ReasignarTimbre(seleccionado: any) {
    //console.log('ver datos timbres ', moment(seleccionado.fec_hora_timbre_servidor).format('YYYY-MM-DD HH:mm:ss'))
    this.progreso = true;
    let datos = {
      id: this.informacion.detalle.id,
      codigo: this.informacion.detalle.codigo,
      fecha: moment(seleccionado.fec_hora_timbre_servidor).format('YYYY-MM-DD HH:mm:ss'),
      accion: this.informacion.detalle.tipo_entr_salida,
      id_timbre: seleccionado.id
    }
    //console.log('datos enviados ', datos)
    this.asistir.ActualizarAsistenciaManual(datos).subscribe(data => {
      console.log('ver datos ', data)
      if (data.message === 'OK') {
        this.progreso = false;
        console.log('ver respuesta ', data.respuesta);
        this.toastr.success('Registro asignado a la asistencia.', '', {
          timeOut: 6000,
        });
        this.CerrarVentana(2);
      }
      else {
        this.progreso = false;
        this.toastr.warning('Ups!!! algo salio mal.', '', {
          timeOut: 6000,
        });
      }
    }, vacio => {
      this.toastr.warning('Ups!!! algo salio mal.', '', {
        timeOut: 6000,
      });
      this.progreso = false;
    })


  }
  // METODO PARA CERRAR VENTANA
  CerrarVentana(opcion: number) {
    if (this.informacion.pagina === 'buscar-asistencia') {
      this.componneteb.ver_detalle = false;
      this.componneteb.ver_asistencia = true;
      if(opcion === 2){
        this.componneteb.BuscarDatosAsistencia(this.componneteb.formulario.value);
      }
    }
  }

}
