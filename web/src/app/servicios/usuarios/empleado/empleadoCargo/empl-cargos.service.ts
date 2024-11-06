import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmplCargosService {

  constructor(private http: HttpClient) { }

  /** ****************************************************************************************** **
   ** **                      METODO DE CONSULTA DE TIPOS DE CARGOS                           ** **
   ** ****************************************************************************************** **/

  // METODO DE BUSQUEDA DE TIPO DE CARGOS    **USADO
  ObtenerTipoCargos() {
    return this.http.get(`${environment.url}/empleadoCargos/listar/tiposCargo`);
  }

  // METODO PARA REGISTRAR TIPO DE CARGO    **USADO
  CrearTipoCargo(data: any) {
    return this.http.post<any>(`${environment.url}/empleadoCargos/tipo_cargo`, data);
  }



  /** ***************************************************************************************** **
   ** **                METODO DE CONSULTA DE CARGOS DEL USUARIO                             ** ** 
   ** ***************************************************************************************** **/

  // METODO PARA EDITAR ESTADO DEL CARGO   **USADO
  EditarEstadoCargo(data: any) {
    return this.http.post(`${environment.url}/empleadoCargos/estado-cargo`, data);
  }

  // METODO PARA BUSCAR CARGOS ACTIVOS   **USADO
  BuscarCargoActivo(data: any) {
    return this.http.post<any>(`${environment.url}/empleadoCargos/cargo-activo`, data);
  }

  // METODO PARA ELIMINAR EL CARGO POR EL ID **USADO
  EliminarCargo(data: any) {
    return this.http.post<any>(`${environment.url}/empleadoCargos/eliminarCargo`, data);
  }



  // METODO PARA REGISTRAR CARGO   **USADO
  RegistrarCargo(data: any) {
    return this.http.post(`${environment.url}/empleadoCargos`, data);
  }

  // METODO PARA BUSCAR DATOS DE CARGO POR ID   **USADO
  BuscarCargoID(id: number) {
    return this.http.get<any>(`${environment.url}/empleadoCargos/${id}`);
  }

  // METODO DE ACTUALIZACION DE CARGO    **USADO
  ActualizarCargoEmpleado(id: number, id_empl_contrato: number, data: any) {
    return this.http.put(`${environment.url}/empleadoCargos/${id_empl_contrato}/${id}/actualizar`, data);
  }

  // METODO PARA BUSCAR DATOS DE CARGO POR ID CONTRATO   **USADO
  BuscarCargoIDContrato(id_empl_contrato: number) {
    return this.http.get<any>(`${environment.url}/empleadoCargos/cargoInfo/${id_empl_contrato}`);
  }

  // METODO PARA BUSCAR CARGOS POR FECHA    **USADO
  BuscarCargoFecha(data: any) {
    return this.http.post(`${environment.url}/empleadoCargos/fecha_cargo`, data);
  }

  // METODO PARA BUSCAR CARGOS POR FECHA EDITAR    **USADO
  BuscarCargoFechaEditar(data: any) {
    return this.http.post(`${environment.url}/empleadoCargos/fecha_cargo/editar`, data);
  }

  BuscarIDCargo(id: number) {
    return this.http.get(`${environment.url}/empleadoCargos/buscar/${id}`);
  }

  BuscarIDCargoActual(id: number) {
    return this.http.get(`${environment.url}/empleadoCargos/buscar/cargoActual/${id}`);
  }

  ObtenerCargoDepartamento(id: number) {
    return this.http.get(`${environment.url}/empleadoCargos/buscar/cargo-departamento/${id}`);
  }

  ObtenerCargoSucursal(id: number) {
    return this.http.get(`${environment.url}/empleadoCargos/buscar/cargo-sucursal/${id}`);
  }

  ObtenerCargoRegimen(id: number) {
    return this.http.get(`${environment.url}/empleadoCargos/buscar/cargo-regimen/${id}`);
  }

  // METODO PARA VERIFICAR DATOS DE PLANTILLA DE CARGOS  **USADO
  RevisarFormato(formData: any) {
    return this.http.post<any>(`${environment.url}/empleadoCargos/upload/revision`, formData);
  }

  // METODO PARA REGISTRAR DATOS DE CARGOS  **USADO
  SubirArchivoExcelCargo(formData: any) {
    return this.http.post<any>(`${environment.url}/empleadoCargos/cargar_plantilla/`, formData);
  }

}
