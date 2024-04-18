import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})

export class AlimentacionService {

  constructor(
    private http: HttpClient,
  ) { }

  ObtenerPlanificadosConsumidos(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/alimentacion/planificados`, datos);
  }

  ObtenerSolicitadosConsumidos(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/alimentacion/solicitados`, datos);
  }

  ObtenerExtrasPlanConsumidos(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/alimentacion/extras/plan`, data)
  }

  ObtenerExtrasSolConsumidos(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/alimentacion/extras/solicita`, data)
  }

  ObtenerDetallesPlanificadosConsumidos(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/alimentacion/planificados/detalle`, datos);
  }

  ObtenerDetallesSolicitadosConsumidos(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/alimentacion/solicitados/detalle`, datos);
  }

  ObtenerDetallesExtrasPlanConsumidos(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/alimentacion/extras/detalle/plan`, data)
  }

  ObtenerDetallesExtrasSolConsumidos(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/alimentacion/extras/detalle/solicita`, data)
  }

  ObtenerDetallesInvitados(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/alimentacion/servicios/invitados`, data)
  }

  BuscarTimbresAlimentacion(data: any, inicio: string, fin: string) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/alimentacion/timbres-alimentacion/${inicio}/${fin}`, data);
  }

  BuscarTimbresAlimentacionRegimenCargo(data: any, inicio: string, fin: string) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/alimentacion/timbres-alimentacion-regimen-cargo/${inicio}/${fin}`, data);
  }

}
