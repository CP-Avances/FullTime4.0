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

  ObtenerDatosContratoA() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/reporte/horasExtrasReales`);
  }

  ObtenerDatosCargoA(empleado_id: any) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/reporte/horasExtrasReales/${empleado_id}`).pipe(
      catchError(empleado_id));
  }

  ObtenerEntradaSalida(empleado_id: any, data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/reporte/horasExtrasReales/entradaSalida/${empleado_id}`, data)
  }

  ObtenerPedidos(empleado_id: any, data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/reporte/horasExtrasReales/listaPedidos/${empleado_id}`, data)
  }

  ObtenerEntradaSalidaTodos(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/reporte/horasExtrasReales/entradaSalida/total/timbres`, data)
  }

  ObtenerPedidosTodos(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/reporte/horasExtrasReales/listaPedidos/total/solicitudes`, data)
  }

  ObtenerTimbres(empleado_id: any) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/reporte/horasExtrasReales/listaTimbres/${empleado_id}`)
  }

}
