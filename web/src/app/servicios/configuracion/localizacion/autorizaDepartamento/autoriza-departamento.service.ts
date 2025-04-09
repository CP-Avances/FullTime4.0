import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class AutorizaDepartamentoService {

  constructor(
    private http: HttpClient,
  ) { }


  // METODO PARA BUSCAR USUARIO AUTORIZA    **USADO
  BuscarAutoridadEmpleado(id: any) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/autorizaDepartamento/autoriza/${id}`);
  }

  // METODO PARA BUSCAR USUARIO AUTORIZA
  BuscarAutoridadUsuarioDepa(id: any) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/autorizaDepartamento/autorizaUsuarioDepa/${id}`);
  }

  // METODO PARA REGISTRAR AUTORIZACION
  IngresarAutorizaDepartamento(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/autorizaDepartamento`, datos);
  }

  // METODO PARA ACTUALIZAR REGISTRO
  ActualizarDatos(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/autorizaDepartamento/actualizar`, datos);
  }

  // METODO PARA ELIMINAR REGISTRO   **USADO
  EliminarRegistro(id: number, datos: any) {
    const url = `${(localStorage.getItem('empresaURL') as string)}/autorizaDepartamento/eliminar/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
  }


  // METODO PARA LISTAR USUARIOS QUE APRUEBAN EN UN DEPARTAMENTO    **USADO
  BuscarListaEmpleadosAutorizan(id: any) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/autorizaDepartamento/listaempleadosAutorizan/${id}`);
  }

  BuscarListaAutorizaDepa(id_depar: any) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/autorizaDepartamento/listaDepaAutoriza/${id_depar}`);
  }


}
