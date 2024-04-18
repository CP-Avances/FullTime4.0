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

  // METODO PARA ELIMINAR REGISTRO
  EliminarRegistro(id: number) {
    return this.http.delete(`${(localStorage.getItem('empresaURL') as string)}/autorizaDepartamento/eliminar/${id}`);
  }












  //Empleado que autoriza en un departamento

  ConsultarAutorizaDepartamento() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/autorizaDepartamento`);
  }


  BuscarEmpleadosAutorizan(id: any) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/autorizaDepartamento/empleadosAutorizan/${id}`);
  }


  // METODO PARA LISTAR USUARIOS QUE APRUEBAN EN UN DEPARTAMENTO    --**VERIFICADO
  BuscarListaEmpleadosAutorizan(id: any) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/autorizaDepartamento/listaempleadosAutorizan/${id}`);
  }

  BuscarListaAutorizaDepa(id_depar: any) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/autorizaDepartamento/listaDepaAutoriza/${id_depar}`);
  }


}
