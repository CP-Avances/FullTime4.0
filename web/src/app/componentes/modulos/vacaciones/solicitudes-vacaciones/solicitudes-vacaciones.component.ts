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
