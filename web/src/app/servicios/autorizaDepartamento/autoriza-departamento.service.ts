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
  BuscarAutoridadUsuario(id: any) {
    return this.http.get(`${environment.url}/autorizaDepartamento/autoriza/${id}`);
  }

  // METODO PARA REGISTRAR AUTORIZACION
  IngresarAutorizaDepartamento(datos: any) {
    return this.http.post(`${environment.url}/autorizaDepartamento`, datos);
  }

  // METODO PARA ACTUALIZAR REGISTRO
  ActualizarDatos(datos: any) {
    return this.http.put(`${environment.url}/autorizaDepartamento`, datos);
  }

  // METODO PARA ELIMINAR REGISTRO
  EliminarRegistro(id: number) {
    return this.http.delete(`${environment.url}/autorizaDepartamento/eliminar/${id}`);
  }











  //Empleado que autoriza en un departamento

  ConsultarAutorizaDepartamento() {
    return this.http.get(`${environment.url}/autorizaDepartamento`);
  }


  BuscarEmpleadosAutorizan(id: any) {
    return this.http.get(`${environment.url}/autorizaDepartamento/empleadosAutorizan/${id}`);
  }

  BuscarListaEmpleadosAutorizan(id: any) {
    console.log('id: ',id)
    return this.http.get(`${environment.url}/autorizaDepartamento/listaempleadosAutorizan/${id}`);
  }


}
