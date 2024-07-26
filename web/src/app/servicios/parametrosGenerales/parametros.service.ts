import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ParametrosService {

  url: string;

  constructor(
    private http: HttpClient
  ) { 
    //CARGA DE URL POR DEFECTO PARA EVITAR ERRORES EN CONSOLA, SE ACTUALIZA AL YA EXISTIR EMPRESAURL
    this.url = localStorage.getItem('empresaURL') ? localStorage.getItem('empresaURL') as string : environment.url as string;
  }

  // BUSCAR LISTA DE PARAMETROS  **USADO
  ListarParametros() {
    return this.http.get<any>(`${(this.url as string)}/parametrizacion`);
  }


  // ACTUALIZAR REGISTRO PARAMETRO  **USADO
  ActualizarTipoParametro(datos: any) {
    return this.http.put(`${(this.url as string)}/parametrizacion/actual-tipo`, datos);
  }

  // METODO PARA BUSCAR DATOS DE UN PARAMETRO  **USADO
  ListarUnParametro(id: number) {
    return this.http.get<any>(`${(this.url as string)}/parametrizacion/ver-parametro/${id}`);
  }

  // METODO PARA LISTAR DETALLES DE PARAMETRO **USADO
  ListarDetalleParametros(id: number) {
    return this.http.get<any>(`${(this.url as string)}/parametrizacion/${id}`);
  }

  // METODO PARA ELIMINAR DETALLE DE PARAMETRO **USADO
  EliminarDetalleParametro(id: number, datos: any) {
    const url = `${(this.url as string)}/parametrizacion/eliminar-detalle/${id}`;
    const httpOptions = {
      body: datos
    };
    return this.http.request('delete', url, httpOptions);
  }

  // METODO PARA REGISTRAR DETALLE DE PARAMETRO **USADO
  IngresarDetalleParametro(data: any) {
    return this.http.post(`${(this.url as string)}/parametrizacion/detalle`, data);
  }

  // METODO PARA ACTUALIZAR DETALLE DE PARAMETRO  **USADO
  ActualizarDetalleParametro(datos: any) {
    return this.http.put(`${(this.url as string)}/parametrizacion/actual-detalle`, datos);
  }

  // METODO PARA COMPARAR CORDENADAS
  ObtenerCoordenadas(data: any) {
    return this.http.post<any>(`${(this.url as string)}/parametrizacion/coordenadas`, data);;
  }

}
