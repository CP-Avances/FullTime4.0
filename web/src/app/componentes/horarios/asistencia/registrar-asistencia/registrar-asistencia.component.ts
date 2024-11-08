import { Component, OnInit, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { DateTime } from 'luxon';

import { BuscarAsistenciaComponent } from '../buscar-asistencia/buscar-asistencia.component';
import { MetodosComponent } from 'src/app/componentes/generales/metodoEliminar/metodos.component';

import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { PlanGeneralService } from 'src/app/servicios/horarios/planGeneral/plan-general.service';
import { ParametrosService } from 'src/app/servicios/configuracion/parametrizacion/parametrosGenerales/parametros.service';
import { TimbresService } from 'src/app/servicios/timbres/timbrar/timbres.service';

@Component({
  selector: 'app-registrar-asistencia',
  templateUrl: './registrar-asistencia.component.html',
  styleUrls: ['./registrar-asistencia.component.css']
})

export class RegistrarAsistenciaComponent implements OnInit {

  @Input() informacion: any;

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    public componneteb: BuscarAsistenciaComponent,
    public parametro: ParametrosService,
    public ventana_: MatDialog, // VARIABLE MANEJO DE VENTANAS
    public validar: ValidacionesService,
    public asistir: PlanGeneralService,
    public timbre: TimbresService,
    public toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.BuscarParametro();
  }

  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** **
   ** **************************************************************************************** **/

  formato_fecha: string = 'dd/MM/yyyy';
  formato_hora: string = 'HH:mm:ss';
  idioma_fechas: string = 'es';
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
    funcion = this.VerificarFuncion();
    let datos = {
      codigo: this.informacion.detalle.codigo,
      funcion: funcion,
      fecha: this.informacion.detalle.fecha_horario
    }
    this.timbre.BuscarTimbresAsistencia(datos).subscribe(data => {
      if (data.message === 'OK') {
        this.timbres = data.respuesta;
        this.timbres.forEach((obj: any) => {
          obj.fecha = this.validar.FormatearFecha(obj.t_fec_timbre, this.formato_fecha, this.validar.dia_abreviado, this.idioma_fechas);
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
    let datos = {
      id: this.informacion.detalle.id,
      fecha: this.validar.DarFormatoFecha(seleccionado.fecha_hora_timbre_validado, 'yyyy-MM-dd HH:mm:ss'),
      accion: this.informacion.detalle.tipo_accion,
      id_timbre: seleccionado.id,
      codigo: this.informacion.detalle.codigo,
      user_name: this.user_name,
      ip: this.ip
    }
    //console.log('ver ', datos)
    this.asistir.ActualizarAsistenciaManual(datos).subscribe(data => {
      if (data.message === 'OK') {
        this.toastr.success('Registro asignado a la asistencia.', '', {
          timeOut: 6000,
        });
        this.CerrarVentana(2);
      }
      else {
        this.toastr.warning('Ups!!! algo salio mal.', '', {
          timeOut: 6000,
        });
      }
    }, vacio => {
      this.toastr.warning('Ups!!! algo salio mal.', '', {
        timeOut: 6000,
      });
    })
  }

  // METODO PARA CERRAR VENTANA
  CerrarVentana(opcion: number) {
    if (this.informacion.pagina === 'buscar-asistencia') {
      this.componneteb.ver_detalle = false;
      this.componneteb.ver_asistencia = true;
      if (opcion === 2) {
        this.componneteb.BuscarDatosAsistencia(this.componneteb.formulario.value);
      }
    }
  }

  // METODO PARA ASIGNACION DESDE EL SISTEMA
  ReasignarSistema() {
    console.log('info ', this.informacion)
    this.timbres = [];
    var funcion = '';
    funcion = this.VerificarFuncion();
    let datos = {
      codigo: this.informacion.detalle.codigo,
      funcion: funcion,
      fecha: this.informacion.detalle.fecha_horario
    }
    let diferencias: any = [];
    this.timbre.BuscarTimbresAsistencia(datos).subscribe(data => {
      if (data.message === 'OK') {
        this.timbres = data.respuesta;
        this.timbres.forEach((obj: any) => {
          //console.log('obj ', this.informacion)
          var h_horario = DateTime.fromFormat(obj.t_hora_timbre, 'HH:mm:ss');
          var h_timbre = DateTime.fromFormat(this.informacion.detalle.hora_horario, 'HH:mm:ss');
          if (this.informacion.detalle.hora_horario < obj.t_hora_timbre) {
            var duration = h_horario.diff(h_timbre, 'hours').hours;
          }
          else {
            var duration = h_timbre.diff(h_horario, 'hours').hours;
          }
          let proceso = {
            duracion: duration,
            fec_hora_timbre_servidor: obj.fecha_hora_timbre_validado,
            fecha: obj.t_fec_timbre,
            hora: obj.t_hora_timbre,
            id: obj.id
          }
          //console.log('proceso ', proceso)
          diferencias = diferencias.concat(proceso);
        })
        // ENCUENTRA EL VALOR MINIMO
        var minValue = Math.min(...diferencias.map((x: any) => x.duracion))
        // FILTRA EL OBJETO TAL QUE LOS VALORES SEAN IGUAL AL MINIMO
        var resultado = diferencias.filter((x: any) => x.duracion == minValue)
        // IMPRIME EL RESULTADO
         this.ReasignarTimbre(resultado[0]);
      }
      else {
        this.toastr.warning('No se han encontrado registros.', '', {
          timeOut: 6000,
        });
      }
    }, vacio => {
      this.toastr.warning('No se han encontrado registros.', '', {
        timeOut: 6000,
      });
    })
  }

  // METODO PARA VERIFICAR FUNCION
  VerificarFuncion() {
    var funcion = '';
    if (this.informacion.detalle.tipo_accion === 'E') {
      funcion = '0';
    }
    else if (this.informacion.detalle.tipo_accion === 'S') {
      funcion = '1';
    }
    else if (this.informacion.detalle.tipo_accion === 'I/A') {
      funcion = '2';
    }
    else if (this.informacion.detalle.tipo_accion === 'F/A') {
      funcion = '3';
    }
    else if (this.informacion.detalle.tipo_accion === 'I/P') {
      funcion = '4';
    }
    else if (this.informacion.detalle.tipo_accion === 'F/P') {
      funcion = '5';
    }
    else if (this.informacion.detalle.tipo_accion === 'HA') {
      funcion = '7';
    }
    return funcion;
  }

  // FUNCION PARA CONFIRMAR REASIGNACION DE TIMBRES
  ConfirmarReasignacion() {
    this.ventana_.open(MetodosComponent, { width: '450px', data: 'asistencia' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.ReasignarSistema();
        }
      });
  }
}
