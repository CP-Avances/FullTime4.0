import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DateTime } from 'luxon';
import { ToastrService } from 'ngx-toastr';
import { PeriodoVacacionesService } from 'src/app/servicios/modulos/modulo-vacaciones/periodoVacaciones/periodo-vacaciones.service';
import { error } from 'console';

@Component({
  selector: 'app-generar-periodo-manual',
  standalone: false,
  templateUrl: './generar-periodo-manual.component.html',
  styleUrl: './generar-periodo-manual.component.css'
})

export class GenerarPeriodoManualComponent {

  fechaInicialF = new FormControl();
  fechaFinalF = new FormControl();

  fechaActual: DateTime = DateTime.now();
  fechaMaximaHasta: DateTime = this.fechaActual;

  constructor(
    private toastr: ToastrService,
    public periodo: PeriodoVacacionesService,
  ) { }

  // METODO DE VALIDACION DE FECHA DESDE SELECCIONADA
  onFechaDesdeSeleccionada() {
    const desde = this.fechaInicialF.value ? DateTime.fromISO(this.fechaInicialF.value) : null;

    if (desde) {
      if (desde > this.fechaActual) {
        this.toastr.info('La fecha desde no puede ser futura.', '', {
          timeOut: 6000,
        });
        this.fechaInicialF.setValue(null);
        this.fechaFinalF.setValue(null);
        return;
      }

      const diferencia = this.fechaActual.diff(desde, 'days').days;

      const fechaHastaCalculada = diferencia >= 30
        ? desde.plus({ days: 30 })
        : this.fechaActual;

      this.fechaMaximaHasta = fechaHastaCalculada;

      // SI YA HABÍA UNA FECHA FINAL SELECCIONADA, VOLVER A VALIDAR
      const hasta = this.fechaFinalF.value ? DateTime.fromISO(this.fechaFinalF.value) : null;
      if (!hasta || hasta < desde || hasta > fechaHastaCalculada) {
        this.fechaFinalF.setValue(fechaHastaCalculada.toISODate());
      }

    } else {
      this.fechaFinalF.setValue(null);
      this.fechaMaximaHasta = this.fechaActual;
    }
  }

  // METODO DE VALIDACION DE FECHA HASTA SELECCIONADA
  onFechaHastaSeleccionada() {
    const desde = this.fechaInicialF.value ? DateTime.fromISO(this.fechaInicialF.value) : null;
    const hasta = this.fechaFinalF.value ? DateTime.fromISO(this.fechaFinalF.value) : null;

    if (!desde) {
      this.toastr.info('Debe seleccionar primero la fecha desde.', '', {
        timeOut: 6000,
      });
      this.fechaFinalF.setValue(null);
      return;
    }

    if (hasta < desde) {
      this.toastr.info('La fecha hasta no puede ser menor a la fecha desde.', '', {
        timeOut: 6000,
      });
      this.fechaFinalF.setValue(null);
      return;
    }

    if (hasta > this.fechaMaximaHasta) {
      this.toastr.info(`La fecha hasta no puede superar el límite permitido (${this.fechaMaximaHasta.toFormat('dd/MM/yyyy')}).`, '', {
        timeOut: 6000,
      });
      this.fechaFinalF.setValue(this.fechaMaximaHasta.toISODate());
    }
  }


  // METODO PARA GENERAR PERIODO DE VACACIONES DESDE EL SISTEMA
  GenerarPeriodo() {
    if (!this.fechaInicialF || !this.fechaFinalF) {
      this.toastr.warning('Debes seleccionar ambas fechas');
      return;
    }

    let datos = {
      fecha_inicio: this.fechaInicialF,
      fecha_fin: this.fechaFinalF
    }

    this.periodo.GenerarPeriodoManual(datos).subscribe(res => {
      console.log('respuesta ', res)

    }, error => {
      console.log('respuesta ', error)
      this.toastr.error('Intente más tarde.', 'Ups! algo salio mal.', {
        timeOut: 6000,
      });
    });

  }


}