import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class DetalleCatHorariosService {

  constructor(
    private http: HttpClient,
  ) { }

  // METODO PARA BUSCAR DETALLES DE UN HORARIO   **USADO
  ConsultarUnDetalleHorario(id: number) {
    return this.http.get<any>(`${environment.url}/detalleHorario/${id}`);
  }

  // METODO PARA ELIMINAR REGISTRO    **USADO
  EliminarRegistro(id: number, datos: any) {
    const url = `${environment.url}/detalleHorario/eliminar/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
  }

  // METODO PARA REGISTRAR DETALLE DE HORARIO    **USADO
  IngresarDetalleHorarios(datos: any) {
    return this.http.post(`${environment.url}/detalleHorario`, datos);
  }

  // METODO PARA ACTUALIZAR REGISTRO   **USADO
  ActualizarRegistro(data: any) {
    return this.http.put(`${environment.url}/detalleHorario`, data);
  }

  // METODO PARA BUSCAR DETALLES DE VARIOS HORARIOS     **USADO
  ConsultarDetalleHorarios(datos: any) {
    return this.http.post(`${environment.url}/detalleHorario/lista`, datos);
  }


}
