import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DiscapacidadService {

  constructor(
    private http: HttpClient,

  ) { }

  // METODO PARA BUSCAR DATOS DE UN USUARIO   **USADO
  BuscarDiscapacidadUsuario(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/discapacidad/${id}`);
  }

  // METODO PARA REGISTRAR DISCAPACIDAD    **USADO
  RegistroDiscapacidad(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/discapacidad`, data);
  }

  // METODO PARA ACTUALIZACION DE REGISTRO   **USADO
  ActualizarDiscapacidad(id: number, data: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/discapacidad/${id}`, data);
  }

  // METODO PARA ELIMINAR REGISTRO   **USADO
  EliminarDiscapacidad(id: number, datos: any) {
    const url = `${(localStorage.getItem('empresaURL') as string)}/discapacidad/eliminar/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
  }

  /** *************************************************************************************** **
   ** **                METODO PARA MANEJO DE DATOS DE TIPO DISCAPACIDAD                   ** **
   ** *************************************************************************************** **/

  // METODO PARA REGISTRAR TIPO DE DISCAPACIDAD    **USADO
  RegistrarTipo(data: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/discapacidad/buscarTipo`, data);
  }

  // BUSCAR TIPO DE DISCAPACIDAD    **USADO
  ListarTipoDiscapacidad() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/discapacidad/buscarTipo/tipo`);
  }

  // METODO PARA BUSCAR DISCAPACIDAD POR SU NOMBRE    **USADO
  BuscarDiscapacidadNombre(data: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/discapacidad/buscarTipo/nombre`, data);
  }

}
