import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class TipoPermisosService {

  constructor(
    private http: HttpClient
  ) { }

  // METODO PARA BUSCAR TIPOS DE PERMISOS
  BuscarTipoPermiso() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/tipoPermisos`);
  }

  // ELIMINAR REGISTRO
  EliminarRegistro(id: number) {
    return this.http.delete(`${(localStorage.getItem('empresaURL') as string)}/tipoPermisos/eliminar/${id}`);
  }

  // METODO PARA CREAR ARCHIVO XML
  CrearXML(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/tipoPermisos/xmlDownload`, data);
  }

  // METODO PARA LISTAR DATOS DE UN TIPO DE PERMISO
  BuscarUnTipoPermiso(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/tipoPermisos/${id}`);
  }

  // METODO PARA REGISTRAR TIPO PERMISO
  RegistrarTipoPermiso(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/tipoPermisos`, data).pipe(
      catchError(data));
  }

  // ACTUALIZAR REGISTRO TIPO PERMISO
  ActualizarTipoPermiso(id: number, data: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/tipoPermisos/editar/${id}`, data);
  }


  // LISTAR PERMISOS DE ACUERDO AL ROL
  ListarTipoPermisoRol(access: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/tipoPermisos ${access}`);
  }

}
