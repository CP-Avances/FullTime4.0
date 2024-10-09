import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})

export class AutorizaDepartamentoService {

  constructor(
    private http: HttpClient,
  ) { }


  // METODO PARA BUSCAR USUARIO AUTORIZA    **USADO
  BuscarAutoridadEmpleado(id: any) {
    return this.http.get(`${environment.url}/autorizaDepartamento/autoriza/${id}`);
  }

  // METODO PARA BUSCAR USUARIO AUTORIZA
  BuscarAutoridadUsuarioDepa(id: any) {
    return this.http.get(`${environment.url}/autorizaDepartamento/autorizaUsuarioDepa/${id}`);
  }

  // METODO PARA REGISTRAR AUTORIZACION
  IngresarAutorizaDepartamento(datos: any) {
    return this.http.post(`${environment.url}/autorizaDepartamento`, datos);
  }

  // METODO PARA ACTUALIZAR REGISTRO
  ActualizarDatos(datos: any) {
    return this.http.put(`${environment.url}/autorizaDepartamento/actualizar`, datos);
  }

  // METODO PARA ELIMINAR REGISTRO   **USADO
  EliminarRegistro(id: number, datos: any) {
    const url = `${environment.url}/autorizaDepartamento/eliminar/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
  }


  // METODO PARA LISTAR USUARIOS QUE APRUEBAN EN UN DEPARTAMENTO    **USADO
  BuscarListaEmpleadosAutorizan(id: any) {
    return this.http.get(`${environment.url}/autorizaDepartamento/listaempleadosAutorizan/${id}`);
  }

  BuscarListaAutorizaDepa(id_depar: any) {
    return this.http.get(`${environment.url}/autorizaDepartamento/listaDepaAutoriza/${id_depar}`);
  }


}
