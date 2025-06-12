import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class DetalleCatHorariosService {

  constructor(
    private http: HttpClient,
  ) { }

  // METODO PARA BUSCAR DETALLES DE UN HORARIO   **USADO
  ConsultarUnDetalleHorario(id: number) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/detalleHorario/${id}`);
  }

  // METODO PARA BUSCAR DETALLES DE LOS HORARIOS EN EL ARREGLO COMO PARAMETRO   **USADO
  ConsultarUnDetalleHorarioMultiple(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/detalleHorario/todos_horario`, datos);
  }

  // METODO PARA ELIMINAR REGISTRO    **USADO
  EliminarRegistro(id: number, datos: any) {
    const url = `${(localStorage.getItem('empresaURL') as string)}/detalleHorario/eliminar/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
  }

  // METODO PARA REGISTRAR DETALLE DE HORARIO    **USADO
  IngresarDetalleHorarios(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/detalleHorario`, datos);
  }

  // METODO PARA ACTUALIZAR REGISTRO   **USADO
  ActualizarRegistro(data: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/detalleHorario`, data);
  }

  // METODO PARA BUSCAR DETALLES DE VARIOS HORARIOS     **USADO
  ConsultarDetalleHorarios(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/detalleHorario/lista`, datos);
  }


}
