import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class ParametrosService {

  url: string;

  constructor(
    private http: HttpClient
  ) {     
    // CARGA DE URL POR DEFECTO PARA EVITAR ERRORES EN CONSOLA, SE ACTUALIZA AL YA EXISTIR EMPRESAURL
    this.url = localStorage.getItem('empresaURL') ? localStorage.getItem('empresaURL') as string : environment.url as string;
  }

  // BUSCAR LISTA DE PARAMETROS  **USADO
  ListarParametros() {
    let urlPrueba = localStorage.getItem('empresaURL') ? localStorage.getItem('empresaURL') as string : environment.url as string;
    return this.http.get<any>(`${(urlPrueba as string)}/parametrizacion`);
  }

  // BUSCAR LISTA DE DETALLE DE PARAMETROS  **USADO
  BuscarDetallesParametros() {
    let urlPrueba = localStorage.getItem('empresaURL') ? localStorage.getItem('empresaURL') as string : environment.url as string;
    return this.http.get<any>(`${(urlPrueba as string)}/parametrizacion/detalle-parametros/buscar`);
  }

  // METODO PARA BUSCAR DATOS DE UN PARAMETRO  **USADO
  ListarUnParametro(id: number) {
    let urlPrueba = localStorage.getItem('empresaURL') ? localStorage.getItem('empresaURL') as string : environment.url as string;
    return this.http.get<any>(`${(urlPrueba as string)}/parametrizacion/ver-parametro/${id}`);
  }

  // METODO PARA LISTAR DETALLES DE PARAMETRO   **USADO
  ListarDetalleParametros(id: number) {
    let urlPrueba = localStorage.getItem('empresaURL') ? localStorage.getItem('empresaURL') as string : environment.url as string;
    return this.http.get<any>(`${(urlPrueba as string)}/parametrizacion/${id}`);
  }

  // METODO PARA ELIMINAR DETALLE DE PARAMETRO **USADO
  EliminarDetalleParametro(id: number, datos: any) {
    let urlPrueba = localStorage.getItem('empresaURL') ? localStorage.getItem('empresaURL') as string : environment.url as string;
    const url = `${(urlPrueba as string)}/parametrizacion/eliminar-detalle/${id}`;
    const httpOptions = {
      body: datos
    };
    return this.http.request('delete', url, httpOptions);
  }

  // METODO PARA REGISTRAR DETALLE DE PARAMETRO **USADO
  IngresarDetalleParametro(data: any) {
    let urlPrueba = localStorage.getItem('empresaURL') ? localStorage.getItem('empresaURL') as string : environment.url as string;
    return this.http.post(`${(urlPrueba as string)}/parametrizacion/detalle`, data);
  }

  // METODO PARA ACTUALIZAR DETALLE DE PARAMETRO  **USADO
  ActualizarDetalleParametro(datos: any) {
    let urlPrueba = localStorage.getItem('empresaURL') ? localStorage.getItem('empresaURL') as string : environment.url as string;
    return this.http.put(`${(urlPrueba as string)}/parametrizacion/actual-detalle`, datos);
  }

  // METODO PARA COMPARAR CORDENADAS    **USADO
  ObtenerCoordenadas(data: any) {
    let urlPrueba = localStorage.getItem('empresaURL') ? localStorage.getItem('empresaURL') as string : environment.url as string;
    return this.http.post<any>(`${(urlPrueba as string)}/parametrizacion/coordenadas`, data);;
  }

  // METODO PARA LISTAR VARIOS DETALLES DE PARAMETRO   **USADO
  ListarVariosDetallesParametros(data: any) {
    let urlPrueba = localStorage.getItem('empresaURL') ? localStorage.getItem('empresaURL') as string : environment.url as string;
    return this.http.post<any>(`${urlPrueba as string}/parametrizacion/buscar/detalle-parametros`, data);
  }
}
