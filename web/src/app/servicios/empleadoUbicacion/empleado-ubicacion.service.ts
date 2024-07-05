import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class EmpleadoUbicacionService {

  constructor(
    private http: HttpClient,

  ) { }

  /** ***************************************************************************************** **
   ** **              CONSULTAS DE COORDENADAS GENERALES DE UBICACION DE USUARIO             ** **
   ** ***************************************************************************************** **/

  // METODO PARA LISTAR COORDENADAS DE UN USUARIO
  ListarCoordenadasUsuario(id_empl: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/ubicacion/coordenadas-usuario/${id_empl}`);
  }

  RegistrarCoordenadasUsuario(data: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/ubicacion/coordenadas-usuario`, data);
  }

  ListarCoordenadasUsuarioU(id_ubicacion: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/ubicacion/coordenadas-usuarios/general/${id_ubicacion}`);
  }

  EliminarCoordenadasUsuario(id: number, datos: any) {
    const url = `${(localStorage.getItem('empresaURL') as string)}/ubicacion/eliminar-coordenadas-usuario/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
  }


  /** ***************************************************************************************** **
   ** **             ACCESO A RUTAS DE COORDENADAS GENERALES DE UBICACIÓN                     ** **
   ** ***************************************************************************************** **/

  RegistrarCoordenadas(data: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/ubicacion`, data);
  }

  ActualizarCoordenadas(data: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/ubicacion`, data);
  }

  ListarCoordenadas() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/ubicacion`);
  }

  ListarCoordenadasEspecificas(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/ubicacion/especifico/${id}`);
  }

  ListarUnaCoordenada(id: number) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/ubicacion/determinada/${id}`);
  }

  EliminarCoordenadas(id: number, datos: any) {
    const url = `${(localStorage.getItem('empresaURL') as string)}/ubicacion/eliminar/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
  }

  // METODO PARA CREAR ARCHIVO XML
  CrearXML(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/ubicacion/xmlDownload`, data);
  }

}
