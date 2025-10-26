// src/app/servicios/reportes/reportes.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

export type ReportFormat = 'pdf' | 'xlsx' | 'csv' | 'xml' | 'excel';
export type ReportModule =
  | 'parametros' | 'generos' | 'roles' | 'regimen' | 'modalidad-laboral' | 'cargos'
  | 'provincias' | 'ciudades' | 'sucursales' | 'departamentos' | 'estado-civil'
  | 'nacionalidades' | 'niveles-titulos' | 'titulos' | 'discapacidades' | 'vacunas'
  | 'empleados' | 'feriados' | 'horarios' | 'coordenadas' | 'relojes'
  | 'vacunacion-usuarios' | 'usuarios' | 'planificacion' | 'asistencia' | 'faltas'
  | 'timbres-incompletos' | 'timbres-usuarios' | 'timbres-virtuales-movil'
  | 'timbres-virtuales' | 'auditoria' | 'salidas-anticipadas' | 'tiempo-alimentacion'
  | 'tiempo-laborado' | 'atrasos' | 'timbres-libres';

@Injectable({ providedIn: 'root' })
export class ReportesMicroService {
  private readonly base = environment.reportesURL;
  constructor(private http: HttpClient) {}


  // ======== NUEVO: respeta el nombre enviado por el backend ========
  generarReporte(
    modulo: ReportModule,
    formato: ReportFormat,
    payload: any
  ): Observable<{ blob: Blob; filename: string }> {
    const fmt = (formato === 'excel') ? 'xlsx' : formato;
    const url = `${this.base}/${modulo}/${fmt}`;

    return this.http.post(url, payload, {
      observe: 'response',
      responseType: 'blob'
    }).pipe(
      map((resp: HttpResponse<Blob>) => {
        const cd = resp.headers.get('Content-Disposition') || '';
        const filename = this.extraerNombreDeContentDisposition(cd) || `reporte_${modulo}.${fmt}`;
        return { blob: resp.body as Blob, filename };
      })
    );
  }

  // Helper para Content-Disposition (soporta filename* UTF-8 y filename)
  private extraerNombreDeContentDisposition(cd: string): string | null {
    // filename*=UTF-8''Nombre%20con%20espacios.xlsx
    const star = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(cd);
    if (star && star[1]) {
      try { return decodeURIComponent(star[1]); } catch { /* ignore */ }
    }
    // filename="Nombre.xlsx" o filename=Nombre.xlsx
    const normal = /filename\s*=\s*("?)([^";]+)\1/i.exec(cd);
    return normal ? normal[2] : null;
  }
}
