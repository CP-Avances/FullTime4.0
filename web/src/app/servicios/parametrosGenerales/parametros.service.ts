import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ParametrosService {

  constructor(
    private http: HttpClient
  ) { }

  // BUSCAR LISTA DE PARAMETROS  **USADO
  ListarParametros() {
    return this.http.get<any>(`${environment.url}/parametrizacion`);
  }


  // ACTUALIZAR REGISTRO PARAMETRO  **USADO
  ActualizarTipoParametro(datos: any) {
    return this.http.put(`${environment.url}/parametrizacion/actual-tipo`, datos);
  }

  // METODO PARA BUSCAR DATOS DE UN PARAMETRO  **USADO
  ListarUnParametro(id: number) {
    return this.http.get<any>(`${environment.url}/parametrizacion/ver-parametro/${id}`);
  }

  // METODO PARA LISTAR DETALLES DE PARAMETRO   **USADO
  ListarDetalleParametros(id: number) {
    return this.http.get<any>(`${environment.url}/parametrizacion/${id}`);
  }

  // METODO PARA ELIMINAR DETALLE DE PARAMETRO **USADO
  EliminarDetalleParametro(id: number, datos: any) {
    const url = `${environment.url}/parametrizacion/eliminar-detalle/${id}`;
    const httpOptions = {
      body: datos
    };
    return this.http.request('delete', url, httpOptions);
  }

  // METODO PARA REGISTRAR DETALLE DE PARAMETRO **USADO
  IngresarDetalleParametro(data: any) {
    return this.http.post(`${environment.url}/parametrizacion/detalle`, data);
  }

  // METODO PARA ACTUALIZAR DETALLE DE PARAMETRO  **USADO
  ActualizarDetalleParametro(datos: any) {
    return this.http.put(`${environment.url}/parametrizacion/actual-detalle`, datos);
  }

  // METODO PARA COMPARAR CORDENADAS
  ObtenerCoordenadas(data: any) {
    return this.http.post<any>(`${environment.url}/parametrizacion/coordenadas`, data);;
  }

}
