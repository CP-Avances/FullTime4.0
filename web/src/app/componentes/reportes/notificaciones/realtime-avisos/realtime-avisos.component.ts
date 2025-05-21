import { FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';

import { TimbresService } from 'src/app/servicios/timbres/timbrar/timbres.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';

import { EliminarRealtimeComponent } from '../eliminar-realtime/eliminar-realtime.component';
import { ParametrosService } from '../../../../servicios/configuracion/parametrizacion/parametrosGenerales/parametros.service';
import { DateTime } from 'luxon';
import { SpinnerModule } from '../../../generales/spinner/spinner.module';

export interface TimbresAvisos {
  create_at: string,
  descripcion: string,
  visto: boolean,
  id_timbre: number,
  empleado: string,
  id: number
}

@Component({
  selector: 'app-realtime-avisos',
  standalone: false,
  templateUrl: './realtime-avisos.component.html',
  styleUrls: ['./realtime-avisos.component.css']
})

export class RealtimeAvisosComponent implements OnInit {

  id_empleado_logueado: number;
  lista_avisos: any = [];

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 10;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  nom_empleado = new FormControl('', [Validators.minLength(2)]);
  descripcion = new FormControl('', [Validators.minLength(2)]);
  fecha = new FormControl('', [Validators.minLength(2)]);

  selectionUno = new SelectionModel<TimbresAvisos>(true, []);

  constructor(
    private avisos: TimbresService,
    public ventana: MatDialog,
    public validar: ValidacionesService,
    public parametro: ParametrosService,
  ) { }

  ngOnInit(): void {
    this.id_empleado_logueado = parseInt(localStorage.getItem('empleado') as string);
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
        this.LlamarNotificacionesTimbres(this.formato_fecha, this.formato_hora, this.id_empleado_logueado);
      }, vacio => {
        this.LlamarNotificacionesTimbres(this.formato_fecha, this.formato_hora, this.id_empleado_logueado);
      });
  }

  // METODO PARA BUSCAR NOTIFICACIONES DE AVISOS
  LlamarNotificacionesTimbres(fecha: any, hora: any, id: number) {
    this.lista_avisos = [];
    this.avisos.ListarAvisos(id).subscribe(res => {
      this.lista_avisos = res;
      console.log("ver avisos: ", this.lista_avisos)
      this.lista_avisos.forEach((aviso: any) => {
        let fecha_registro = this.validar.DarFormatoFecha(aviso.create_at.split(' ')[0], 'yyyy-MM-dd');
        // FORMATEAR DATOS DE FECHA Y HORA
        aviso.fecha = this.validar.FormatearFecha(fecha_registro || '', fecha, this.validar.dia_completo, this.idioma_fechas);
        aviso.hora_registro = this.validar.FormatearHora(aviso.create_at.split(' ')[1], hora);
        if (aviso.tipo === 100) {
          aviso.notificacion = aviso.mensaje.split('//')[4];
          let fechaHorario = (aviso.mensaje.split('//')[0]).split(' ')[0];
          aviso.horario_fecha = this.validar.FormatearFecha(fechaHorario, fecha, this.validar.dia_completo, this.idioma_fechas);
          aviso.horario_hora = this.validar.FormatearHora((aviso.mensaje.split('//')[0]).split(' ')[1], hora);
          aviso.timbre_fecha = this.validar.FormatearFecha((aviso.mensaje.split('//')[1]).split(' ')[0], fecha, this.validar.dia_completo, this.idioma_fechas);
          aviso.timbre_hora = this.validar.FormatearHora((aviso.mensaje.split('//')[1]).split(' ')[1], hora);
          aviso.tolerancia = aviso.mensaje.split('//')[2];
          aviso.atraso = aviso.mensaje.split('//')[3];
        }

        // NOTIFICACION DE FALTA
        if (aviso.tipo === 101) {
          aviso.notificacion = aviso.mensaje.split('//')[1];
          aviso.horario_fecha = this.validar.FormatearFecha(aviso.mensaje.split('//')[0], fecha, this.validar.dia_completo, this.idioma_fechas);
        }

        // NOTIFICACION DE SALIDA ANTICIPADA
        if (aviso.tipo === 102) {
          aviso.notificacion = aviso.mensaje.split('//')[3];
          let fechaHorario = (aviso.mensaje.split('//')[0]).split(' ')[0];
          aviso.horario_fecha = this.validar.FormatearFecha(fechaHorario, fecha, this.validar.dia_completo, this.idioma_fechas);
          aviso.horario_hora = this.validar.FormatearHora((aviso.mensaje.split('//')[0]).split(' ')[1], this.formato_hora);
          aviso.timbre_fecha = this.validar.FormatearFecha((aviso.mensaje.split('//')[1]).split(' ')[0], fecha, this.validar.dia_completo, this.idioma_fechas);
          aviso.timbre_hora = this.validar.FormatearHora((aviso.mensaje.split('//')[1]).split(' ')[1], this.formato_hora);
          aviso.salida = aviso.mensaje.split('//')[2];
        }

        if (aviso.tipo === 6) {
          aviso.notificacion = aviso.mensaje;
        }

      })
    });
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelected() {
    const numSelected = this.selectionUno.selected.length;
    const numRows = this.lista_avisos.length;
    return numSelected === numRows;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTÁN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggle() {
    this.isAllSelected() ?
      this.selectionUno.clear() :
      this.lista_avisos.forEach((row: any) => this.selectionUno.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabel(row?: TimbresAvisos): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionUno.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // METODO PARA HABILITAR SELECCION MULTIPLE
  btnCheckHabilitar: boolean = false;
  HabilitarSeleccion() {
    if (this.btnCheckHabilitar === false) {
      this.btnCheckHabilitar = true;
    } else if (this.btnCheckHabilitar === true) {
      this.btnCheckHabilitar = false;
    }
  }

  // METODO DE PAGINACION
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }


  // METODO PARA ABRIR VENTANA DE ELIMINACION DE NOTIFICACIONES
  EliminarNotificaciones(opcion: number) {
    let EmpleadosSeleccionados = this.selectionUno.selected.map((obj: any) => {
      return {
        id: obj.id,
        empleado: obj.empleado
      }
    })
    this.ventana.open(EliminarRealtimeComponent,
      { width: '500px', data: { opcion: opcion, lista: EmpleadosSeleccionados } }).afterClosed().subscribe(item => {
        if (item === true) {
          this.LlamarNotificacionesTimbres(this.formato_fecha, this.formato_fecha, this.id_empleado_logueado);
          this.btnCheckHabilitar = false;
          this.selectionUno.clear();
        };
      });
  }

  // METODO PARA INGRESAR SOLO LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.nom_empleado.reset();
    this.descripcion.reset();
    this.fecha.reset();
  }

  // METODO PARA CAMBIAR EL ICONO SEGUN EL TIPO DE NOTIFICACION
  CambiarIcono(tipo: number): string {
    switch (tipo) {
      case 6: return 'mark_email_read';
      case 100: return 'watch_later';
      case 101: return 'event_busy';
      case 102: return 'directions_run';
      default: return 'help_outline';
    }
  }

  // CAMBIAR COLOR DEL ICONO
  CambiarEstiloIcono(tipo: number): string {
    switch (tipo) {
      case 6: return 'ncomunicados';
      case 100: return 'natrasos';
      case 101: return 'nfaltas';
      case 102: return 'nsalidasAnticipadas';
      default: return '';
    }
  }



}
