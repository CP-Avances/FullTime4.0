import { ConteoDiasSemana } from './../../../../interfaces/ConteoDiasSemana';
import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { Subject, takeUntil } from "rxjs";
import { SolicitudVacacion } from "src/app/interfaces/SolicitudesVacacion";
import { VacacionesService } from "src/app/servicios/modulos/modulo-vacaciones/vacaciones/vacaciones.service";


@Component({
  selector: 'app-solicitudes-vacaciones',
  standalone: false,
  templateUrl: './solicitudes-vacaciones.component.html',
  styleUrls: ['./solicitudes-vacaciones.component.css']
})


export class SolicitudesVacacionesComponent implements OnInit, OnDestroy {

  solicitudService = inject(VacacionesService);
  solicitudes: SolicitudVacacion[] = [];

  conteoDiasSemana: ConteoDiasSemana = {
    L: 0, M: 0, X: 0, J: 0, V: 0, S: 0, D: 0
  }
  permiteHoras: boolean = false
  diasTotales: number = 0;
  horasTotales: string = '00:00';

  campos: string[] = [
    'fecha_inicio',
    'fecha_final',
    'numero_dias_totales',
    'incluir_feriados',
    'fecha_registro',
    'fecha_actualizacion',
    'documento'
  ]

  private destroy$ = new Subject<void>;

  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  validarFeriados(value: boolean): string {
    return value ? "SI" : "NO";
  }


  cargarSolicitudes() {
    this.solicitudService.ObtenerSolicitudes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => this.solicitudes = data,
        error: (err) => {
          console.error('Error al cargar solicitudes', err);
        }
      })
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
