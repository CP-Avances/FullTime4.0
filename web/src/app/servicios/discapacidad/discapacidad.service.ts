import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class DiscapacidadService {

  constructor(
    private http: HttpClient,

  ) { }

  // METODO PARA BUSCAR DATOS DE UN USUARIO   **USADO
  BuscarDiscapacidadUsuario(id: number) {
    return this.http.get(`${environment.url}/discapacidad/${id}`);
  }

  // METODO PARA REGISTRAR DISCAPACIDAD    **USADO
  RegistroDiscapacidad(data: any) {
    return this.http.post(`${environment.url}/discapacidad`, data);
  }

  // METODO PARA ACTUALIZACION DE REGISTRO   **USADO
  ActualizarDiscapacidad(id: number, data: any) {
    return this.http.put(`${environment.url}/discapacidad/${id}`, data);
  }

  // METODO PARA ELIMINAR REGISTRO   **USADO
  EliminarDiscapacidad(id: number, datos: any) {
    const url = `${environment.url}/discapacidad/eliminar/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
  }

  /** *************************************************************************************** **
   ** **                METODO PARA MANEJO DE DATOS DE TIPO DISCAPACIDAD                   ** **
   ** *************************************************************************************** **/

  // METODO PARA REGISTRAR TIPO DE DISCAPACIDAD
  RegistrarTipo(data: any) {
    return this.http.post<any>(`${environment.url}/discapacidad/buscarTipo`, data);
  }

  // BUSCAR TIPO DE DISCAPACIDAD    **USADO
  ListarTipoDiscapacidad() {
    return this.http.get(`${environment.url}/discapacidad/buscarTipo/tipo`);
  }

  // METODO PARA BUSCAR DISCAPACIDAD POR SU NOMBRE    **USADO
  BuscarDiscapacidadNombre(data: any) {
    return this.http.post<any>(`${environment.url}/discapacidad/buscarTipo/nombre`, data);
  }

}
