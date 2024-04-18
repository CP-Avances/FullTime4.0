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

  // METODO PARA BUSCAR DETALLES DE UN HORARIO    --**VERIFICADO
  ConsultarUnDetalleHorario(id: number) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/detalleHorario/${id}`);
  }

  // METODO PARA ELIMINAR REGISTRO  
  EliminarRegistro(id: number) {
    return this.http.delete(`${(localStorage.getItem('empresaURL') as string)}/detalleHorario/eliminar/${id}`);
  }

  // METODO PARA REGISTRAR DETALLE DE HORARIO
  IngresarDetalleHorarios(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/detalleHorario`, datos);
  }

  // METODO PARA ACTUALIZAR REGISTRO
  ActualizarRegistro(data: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/detalleHorario`, data);
  }






  // VERIFICAR DATOS DE LA PLANTILLA DE DETALLES DE HORRAIO Y CARGARLOS AL SISTEMA
  CargarPlantillaDetalles(formData) {
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/detalleHorario/upload', formData)
  }

  VerificarDatosDetalles(formData) {
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/detalleHorario/verificarDatos/upload', formData)
  }
}
