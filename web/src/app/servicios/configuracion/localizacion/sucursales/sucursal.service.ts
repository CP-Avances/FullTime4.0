import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SucursalService {

  constructor(
    private http: HttpClient,
  ) { }

  // BUSCAR SUCURSALES POR EL NOMBRE   **USADO
  BuscarNombreSucursal(nombre: any) {
    return this.http.post(`${environment.url}/sucursales/nombre-sucursal`, nombre);
  }

  // GUARDAR DATOS DE REGISTRO  **USADO
  RegistrarSucursal(data: any) {
    return this.http.post<any>(`${environment.url}/sucursales`, data);
  }

  // ACTUALIZAR REGISTRO   **USADO
  ActualizarSucursal(datos: any) {
    return this.http.put(`${environment.url}/sucursales`, datos);
  }

  // BUSCAR SUCURSAL POR ID DE EMPRESA   **USADO
  BuscarSucursalEmpresa(id_empresa: number) {
    return this.http.get(`${environment.url}/sucursales/empresa-sucursal/${id_empresa}`);
  }

  // BUSCAR LISTA DE SUCURSALES **USADO
  BuscarSucursal() {
    return this.http.get(`${environment.url}/sucursales`);
  }

  // METODO PARA ELIMINAR REGISTRO **USADO
  EliminarRegistro(id: any, datos: any) {
    const url = `${environment.url}/sucursales/eliminar/${id}`;
    const httpOptions = {
      body: datos
    };
    return this.http.request('delete', url, httpOptions).pipe(catchError(id));
  }

  // METODO PARA BUSCAR DATOS DE UNA SUCURSAL  **USADO
  BuscarUnaSucursal(id: number) {
    return this.http.get(`${environment.url}/sucursales/unaSucursal/${id}`);
  }

  // METODO PARA VERIFICAR LA INFORMACION DE LA PLANTILLA  **USADO
  RevisarFormato(formData: any) {
    return this.http.post<any>(environment.url + '/sucursales/upload/revision', formData);
  }


  // METODO PARA REGISTRAR SUCURSALES DE PLANTILLA  **USADO
  RegistrarSucursales(data: any) {
    return this.http.post<any>(environment.url + '/sucursales/registraSucursales', data);
  }


}
