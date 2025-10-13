import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output, signal } from "@angular/core";
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

  @Output() editarSolicitud = new EventEmitter<any>();

  solicitudService = inject(VacacionesService);

  solicitudes = signal<SolicitudVacacion[]>([]);

  permiteHoras: boolean = false;


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
        next: (data) => this.solicitudes.set(data),
        error: (err) => {
          console.error('Error al cargar solicitudes', err);
        }
      })
  }

  onEditarSolicitudes(solicitud: any) {
    this.editarSolicitud.emit(solicitud);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
