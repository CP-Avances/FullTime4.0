import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

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
    return this.http.get(`${environment.url}/ubicacion/coordenadas-usuario/${id_empl}`);
  }

  RegistrarCoordenadasUsuario(data: any) {
    return this.http.post<any>(`${environment.url}/ubicacion/coordenadas-usuario`, data);
  }

  ListarCoordenadasUsuarioU(id_ubicacion: number) {
    return this.http.get(`${environment.url}/ubicacion/coordenadas-usuarios/general/${id_ubicacion}`);
  }

  EliminarCoordenadasUsuario(id: number, datos: any) {
    const url = `${environment.url}/ubicacion/eliminar-coordenadas-usuario/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
  }


  /** ***************************************************************************************** **
   ** **             ACCESO A RUTAS DE COORDENADAS GENERALES DE UBICACIÓN                     ** **
   ** ***************************************************************************************** **/

  RegistrarCoordenadas(data: any) {
    return this.http.post<any>(`${environment.url}/ubicacion`, data);
  }

  ActualizarCoordenadas(data: any) {
    return this.http.put(`${environment.url}/ubicacion`, data);
  }

  ListarCoordenadas() {
    return this.http.get(`${environment.url}/ubicacion`);
  }

  ListarCoordenadasEspecificas(id: number) {
    return this.http.get(`${environment.url}/ubicacion/especifico/${id}`);
  }

  ListarUnaCoordenada(id: number) {
    return this.http.get<any>(`${environment.url}/ubicacion/determinada/${id}`);
  }

 
  EliminarCoordenadas(id: number) {
    return this.http.delete<any>(`${environment.url}/ubicacion/eliminar/${id}`);
  }

  // METODO PARA CREAR ARCHIVO XML
  CrearXML(data: any) {
    return this.http.post(`${environment.url}/ubicacion/xmlDownload`, data);
  }
}
