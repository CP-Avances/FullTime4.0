import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'
import { catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SucursalService {

  constructor(
    private http: HttpClient,
  ) { }

  // BUSCAR SUCURSALES POR EL NOMBRE
  BuscarNombreSucursal(nombre: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/sucursales/nombre-sucursal`, nombre);
  }

  // GUARDAR DATOS DE REGISTRO
  RegistrarSucursal(data: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/sucursales`, data);
  }

  // ACTUALIZAR REGISTRO
  ActualizarSucursal(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/sucursales`, datos);
  }

  // BUSCAR SUCURSAL POR ID DE EMPRESA
  BuscarSucursalEmpresa(id_empresa: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/sucursales/empresa-sucursal/${id_empresa}`);
  }

  // BUSCAR LISTA DE SUCURSALES
  BuscarSucursal() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/sucursales`);
  }

  // METODO PARA ELIMINAR REGISTRO 
  EliminarRegistro(id: any) {
    return this.http.delete(`${(localStorage.getItem('empresaURL') as string)}/sucursales/eliminar/${id}`).pipe(catchError(id));
  }

  // METODO PARA CREAR ARCHIVO XML
  CrearXML(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/sucursales/xmlDownload`, data);
  }

  // METODO PARA BUSCAR DATOS DE UNA SUCURSAL
  BuscarUnaSucursal(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/sucursales/unaSucursal/${id}`);
  }

  
  RevisarFormato(formData) {
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/sucursales/upload/revision', formData);
  }


}
