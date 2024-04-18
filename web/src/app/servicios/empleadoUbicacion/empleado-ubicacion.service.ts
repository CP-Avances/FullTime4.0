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
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/ubicacion/coordenadas-usuario/${id_empl}`);
  }

  RegistrarCoordenadasUsuario(data: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/ubicacion/coordenadas-usuario`, data);
  }

  ListarCoordenadasUsuarioU(id_ubicacion: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/ubicacion/coordenadas-usuarios/general/${id_ubicacion}`);
  }

  EliminarCoordenadasUsuario(id: number) {
    return this.http.delete<any>(`${(localStorage.getItem('empresaURL') as string)}/ubicacion/eliminar-coordenadas-usuario/${id}`);
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

  ConsultarUltimoRegistro() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/ubicacion/ultimo-registro`);
  }

  EliminarCoordenadas(id: number) {
    return this.http.delete<any>(`${(localStorage.getItem('empresaURL') as string)}/ubicacion/eliminar/${id}`);
  }

  // METODO PARA CREAR ARCHIVO XML
  CrearXML(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/ubicacion/xmlDownload`, data);
  }
}
