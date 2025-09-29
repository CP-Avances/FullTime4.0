import { Component, inject, OnDestroy, OnInit, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
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

  private destroy$ = new Subject<void>;

  solicitudService = inject(VacacionesService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  solicitudes = signal<SolicitudVacacion[]>([]);

  campos: string[] = [
    'fecha_inicio',
    'fecha_final',
    'numero_dias_totales',
    'incluir_feriados',
    'fecha_registro',
    'fecha_actualizacion',
    'documento'
  ]


  ngOnInit(): void {
    this.cargarSolicitudes();
  }


  cargarSolicitudes() {
    this.solicitudService.ObtenerSolicitudes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => this.solicitudes.set(data),
        error: (err) => {
          console.error('Error al cargar solicitudes', err);
        }
      })
  }

  validarFeriados(valor: boolean): string {
    return valor ? "Sí" : "No";
  }

  irRegistrar(): void {
    this.router.navigate(['registrar'], { relativeTo: this.route });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
