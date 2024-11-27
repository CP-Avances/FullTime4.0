import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

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

  // METODO PARA LISTAR COORDENADAS DE UN USUARIO    **USADO
  ListarCoordenadasUsuario(id_empl: number) {
    return this.http.get(`${environment.url}/ubicacion/coordenadas-usuario/${id_empl}`);
  }

  // METODO PARA REGISTRAR COORDENADAS DE UBICACION AL USUARIO   **USADO
  RegistrarCoordenadasUsuario(data: any) {
    return this.http.post<any>(`${environment.url}/ubicacion/coordenadas-usuario`, data);
  }

  // METODO PARA LISTAR DATOS DE UBICACIONES DE USUARIO       **USADO
  ListarCoordenadasUsuarioU(id_ubicacion: number) {
    return this.http.get(`${environment.url}/ubicacion/coordenadas-usuarios/general/${id_ubicacion}`);
  }

  // METODO PARA ELIMINAR REGISTROS   **USADO
  EliminarCoordenadasUsuario( datos: any) {
    const url = `${environment.url}/ubicacion/eliminar-coordenadas-usuario`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
  }


  /** ***************************************************************************************** **
   ** **             ACCESO A RUTAS DE COORDENADAS GENERALES DE UBICACION                     ** **
   ** ***************************************************************************************** **/

  // METODO PARA REGISTRAR UNA UBICACION   **USADO
  RegistrarCoordenadas(data: any) {
    return this.http.post<any>(`${environment.url}/ubicacion`, data);
  }

  // METODO PARA ACTUALIZAR COORDENADAS DE UBICACION    **USADO
  ActualizarCoordenadas(data: any) {
    return this.http.put(`${environment.url}/ubicacion`, data);
  }

  // METODO PARA LISTAR COORDENADAS   **USADO
  ListarCoordenadas() {
    return this.http.get(`${environment.url}/ubicacion`);
  }

  // METODO PARA BUSCAR UNA UBICACIONES CON EXCEPCION    **USADO
  ListarCoordenadasEspecificas(id: number) {
    return this.http.get(`${environment.url}/ubicacion/especifico/${id}`);
  }


  // METODO PARA LISTAR DATOS DE UNA UBICACION ESPECIFICA  **USADO
  ListarUnaCoordenada(id: number) {
    return this.http.get<any>(`${environment.url}/ubicacion/determinada/${id}`);
  }

  // METODO PARA ELIMINAR REGISTROS    **USADO
  EliminarCoordenadas(id: number, datos: any) {
    const url = `${environment.url}/ubicacion/eliminar/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
  }

}
