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


  // METODO PARA BUSCAR USUARIO AUTORIZA
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

  // METODO PARA ELIMINAR REGISTRO
  EliminarRegistro(id: number) {
    return this.http.delete(`${environment.url}/autorizaDepartamento/eliminar/${id}`);
  }


  BuscarEmpleadosAutorizan(id: any) {
    return this.http.get(`${environment.url}/autorizaDepartamento/empleadosAutorizan/${id}`);
  }

  // METODO PARA LISTAR USUARIOS QUE APRUEBAN EN UN DEPARTAMENTO    --**VERIFICADO
  BuscarListaEmpleadosAutorizan(id: any) {
    return this.http.get(`${environment.url}/autorizaDepartamento/listaempleadosAutorizan/${id}`);
  }

  BuscarListaAutorizaDepa(id_depar: any) {
    return this.http.get(`${environment.url}/autorizaDepartamento/listaDepaAutoriza/${id_depar}`);
  }


}
