import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class HorasExtrasRealesService {

  constructor(
    private http: HttpClient,
  ) { }

  ObtenerEntradaSalida(empleado_id: any, data: any) {
    return this.http.post(`${environment.url}/reporte/horasExtrasReales/entradaSalida/${empleado_id}`, data)
  }

  ObtenerPedidos(empleado_id: any, data: any) {
    return this.http.post(`${environment.url}/reporte/horasExtrasReales/listaPedidos/${empleado_id}`, data)
  }

  ObtenerEntradaSalidaTodos(data: any) {
    return this.http.post(`${environment.url}/reporte/horasExtrasReales/entradaSalida/total/timbres`, data)
  }

  ObtenerPedidosTodos(data: any) {
    return this.http.post(`${environment.url}/reporte/horasExtrasReales/listaPedidos/total/solicitudes`, data)
  }

  ObtenerTimbres(empleado_id: any) {
    return this.http.get(`${environment.url}/reporte/horasExtrasReales/listaTimbres/${empleado_id}`)
  }

}
