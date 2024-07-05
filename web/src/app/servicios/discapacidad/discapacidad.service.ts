import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DiscapacidadService {

  constructor(
    private http: HttpClient,

  ) { }

  // METODO PARA BUSCAR DATOS DE UN USUARIO
  BuscarDiscapacidadUsuario(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/discapacidad/${id}`);
  }

  // METODO PARA REGISTRAR DISCAPACIDAD
  RegistroDiscapacidad(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/discapacidad`, data);
  }

  // METODO PARA ACTUALIZACION DE REGISTRO
  ActualizarDiscapacidad(id: number, data: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/discapacidad/${id}`, data);
  }

  // METODO PARA ELIMINAR REGISTRO
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

  // METODO PARA REGISTRAR TIPO DE DISCAPACIDAD
  RegistrarTipo(data: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/discapacidad/buscarTipo`, data);
  }

  // BUSCAR TIPO DE DISCAPACIDAD
  ListarTipoDiscapacidad() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/discapacidad/buscarTipo/tipo`);
  }

  // METODO PARA BUSCAR DISCAPACIDAD POR SU NOMBRE
  BuscarDiscapacidadNombre(data: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/discapacidad/buscarTipo/nombre`, data);
  }

}
