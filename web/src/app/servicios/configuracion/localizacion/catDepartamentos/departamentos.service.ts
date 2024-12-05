import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DepartamentosService {

  constructor(
    private http: HttpClient,
  ) { }


  // REGISTRAR DEPARTAMENTO    **USADO
  RegistrarDepartamento(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/departamento`, data).pipe(
      catchError(data)
    );
  }

  // BUSCAR DEPARTAMENTOS POR ID SUCURSAL  **USADO
  BuscarDepartamentoSucursal(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/departamento/sucursal-departamento/${id}`);
  }

  // BUSCAR DEPARTAMENTOS POR ID SUCURSAL EXCLUYENDO REGISTRO A EDITAR  ** USADO
  BuscarDepartamentoSucursal_(id_sucursal: number, id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/departamento/sucursal-departamento-edicion/${id_sucursal}/${id}`);
  }

  // BUSCAR DEPARTAMENTOS POR ID SUCURSAL   **USADO
  BuscarDepartamento(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/departamento/infodepartamento/${id}`);
  }

  // REGISTRAR ACTUALIZACION DE DEPARTAMENTO  **USADO
  ActualizarDepartamento(idDepartamento: number, data: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/departamento/${idDepartamento}`, data).pipe(
      catchError(data)
    );
  }

  // METODO PARA LISTAR INFORMACION DE DEPARTAMENTOS POR ID DE SUCURSAL   **USADO
  BuscarInformacionDepartamento(id_sucursal: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/departamento/buscar/datosDepartamento/${id_sucursal}`);
  }

  // METODO PARA BUSCAR DEPARTAMENTOS   **USADO
  ConsultarDepartamentos() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/departamento/listarDepartamentos`);
  }

  // METODO PARA ELIMINAR REGISTRO  **USADO
  EliminarRegistro(id: any, datos: any) {
    const url = `${(localStorage.getItem('empresaURL') as string)}/departamento/eliminar/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions).pipe(catchError(id));
  }

  // REGISTRAR NIVELDEPARTAMENTO  **USADO
  RegistrarNivelDepartamento(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/departamento/crearnivel`, data).pipe(
      catchError(data)
    );
  }

  // METODO PARA BUSCAR NIVELDEPARTAMENTOS   **USADO
  ConsultarNivelDepartamento(id_departamento: number, id_establecimiento: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/departamento/infoniveldepa/${id_departamento}/${id_establecimiento}`);
  }

  // REGISTRAR ACTUALIZACION DE NIVEL DEPARTAMENTO   **USADO
  ActualizarNivelDepa(id: number, data: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/departamento/nivelactualizar/${id}`, data).pipe(
      catchError(data)
    );
  }

  // METODO PARA ELIMINAR REGISTRO NIVEL DEPARTAMENTO   **USADO
  EliminarRegistroNivelDepa(id: number, datos: any) {
    const url = `${(localStorage.getItem('empresaURL') as string)}/departamento/eliminarniveldepa/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
  }

  // REGISTRAR NIVELDEPARTAMENTO  **USADO
  ActualizarNombreNivel(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/departamento/actualizarNombrenivel`, data).pipe(
      catchError(data)
    );
  }
  // catalogo de departamentos
  ConsultarDepartamentoPorContrato(id_cargo: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/departamento/busqueda-cargo/${id_cargo}`);
  }

  RevisarFormato(formData) {
    console.log('formDataDepartamentos: ',formData);
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/departamento/upload/revision', formData);
  }
  subirArchivoExcel(formData) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/departamento/cargar_plantilla/`, formData);
  }

  BuscarDepartamentoRegimen(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/departamento/buscar/regimen-departamento/${id}`);
  }

  // METODO PARA VALIDAR DATOS DE PLANTILLA DE NIVELES DE DEPARTAMENTO   **USADO
  RevisarFormatoNivelDep(formData: any){
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/departamento/upload/revisionNivel', formData);
  }

  // METODO PARA SUBIR DATOS DE PLANTILLA DE NIVELES DE DEPARTAMENTO  **USADO
  SubirDepaNivel(formData: any){
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/departamento/cargar_plantillaNivel/`, formData);
  }

  // METODO PARA ACTUALIZAR EL DEPARTAMENTO DEL USUARIO  **USADO
  ActualizarUserDepa(Data: any){
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/departamento/actualizarUserDepa`, Data);
  }

}
