import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class DepartamentosService {

  constructor(
    private http: HttpClient,
  ) { }


  // REGISTRAR DEPARTAMENTO
  RegistrarDepartamento(data: any) {
    return this.http.post(`${environment.url}/departamento`, data).pipe(
      catchError(data)
    );
  }

  // BUSCAR DEPARTAMENTOS POR ID SUCURSAL 
  BuscarDepartamentoSucursal(id: number) {
    return this.http.get(`${environment.url}/departamento/sucursal-departamento/${id}`);
  }

  // BUSCAR DEPARTAMENTOS POR ID SUCURSAL EXCLUYENDO REGISTRO A EDITAR
  BuscarDepartamentoSucursal_(id_sucursal: number, id: number) {
    return this.http.get(`${environment.url}/departamento/sucursal-departamento-edicion/${id_sucursal}/${id}`);
  }

  // BUSCAR DEPARTAMENTOS POR ID SUCURSAL EXCLUYENDO REGISTRO A EDITAR
  BuscarDepartamento(id: number) {
    return this.http.get(`${environment.url}/departamento/infodepartamento/${id}`);
  }

  // REGISTRAR ACTUALIZACION DE DEPARTAMENTO
  ActualizarDepartamento(idDepartamento: number, data: any) {
    return this.http.put(`${environment.url}/departamento/${idDepartamento}`, data).pipe(
      catchError(data)
    );
  }

  // METODO PARA LISTAR INFORMACION DE DEPARTAMENTOS POR ID DE SUCURSAL
  BuscarInformacionDepartamento(id_sucursal: number) {
    return this.http.get(`${environment.url}/departamento/buscar/datosDepartamento/${id_sucursal}`);
  }

  // METODO PARA BUSCAR DEPARTAMENTOS
  ConsultarDepartamentos() {
    return this.http.get(`${environment.url}/departamento`);
  }

  // METODO PARA ELIMINAR REGISTRO
  EliminarRegistro(id: number) {
    return this.http.delete(`${environment.url}/departamento/eliminar/${id}`);
  }

  // METODO PARA CREAR ARCHIVO XML
  CrearXML(data: any) {
    return this.http.post(`${environment.url}/departamento/xmlDownload`, data);
  }


  // REGISTRAR NIVELDEPARTAMENTO
  RegistrarNivelDepartamento(data: any) {
    return this.http.post(`${environment.url}/departamento/crearnivel`, data).pipe(
      catchError(data)
    );
  }

  // METODO PARA BUSCAR NIVELDEPARTAMENTOS
  ConsultarNivelDepartamento(id_departamento: number, id_establecimiento: number) {
    return this.http.get(`${environment.url}/departamento/infoniveldepa/${id_departamento}/${id_establecimiento}`);
  }

  // REGISTRAR ACTUALIZACION DE NIVEL DEPARTAMENTO
  ActualizarNivelDepartamento(idDepartamento: number, data: any) {
    return this.http.put(`${environment.url}/departamento/actualizanivel/${idDepartamento}`, data).pipe(
      catchError(data)
    );
  }

  // REGISTRAR ACTUALIZACION DE NIVEL DEPARTAMENTO
  ActualizarNivelDepa(id: number, data: any) {
    return this.http.put(`${environment.url}/departamento/nivelactualizar/${id}`, data).pipe(
      catchError(data)
    );
  }

  // METODO PARA ELIMINAR REGISTRO NIVEL DEPARTAMENTO
  EliminarRegistroNivelDepa(id: number) {
    return this.http.delete(`${environment.url}/departamento/eliminarniveldepa/${id}`);
  }

  
  





  // catalogo de departamentos
  ConsultarDepartamentoPorContrato(id_cargo: number) {
    return this.http.get(`${environment.url}/departamento/busqueda-cargo/${id_cargo}`);
  }

  ConsultarNombreDepartamentos() {
    return this.http.get(`${environment.url}/departamento/nombreDepartamento`);
  }

  ConsultarIdNombreDepartamentos(nombreDepartamento: string) {
    return this.http.get(`${environment.url}/departamento/idDepartamento/${nombreDepartamento}`);
  }



  getIdDepartamentoPadre(departamentoPadre: string) {
    return this.http.get(`${environment.url}/departamento/busqueda/${departamentoPadre}`);
  }



  EncontrarUnDepartamento(id: number) {
    return this.http.get(`${environment.url}/departamento/${id}`);
  }








  BuscarDepartamentoRegimen(id: number) {
    return this.http.get(`${environment.url}/departamento/buscar/regimen-departamento/${id}`);
  }

}
