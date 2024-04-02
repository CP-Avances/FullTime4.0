import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class EmplCargosService {

  constructor(private http: HttpClient) { }

  /** ****************************************************************************************** **
   ** **                      METODO DE CONSULTA DE TIPOS DE CARGOS                           ** **
   ** ****************************************************************************************** **/

  // METODO DE BUSQUEDA DE TIPO DE CONTRATOS
  ObtenerTipoCargos() {
    return this.http.get(`${environment.url}/empleadoCargos/listar/tiposCargo`);
  }

  // METODO PARA REGISTRAR TIPO DE CARGO
  CrearTipoCargo(data: any) {
    return this.http.post<any>(`${environment.url}/empleadoCargos/tipo_cargo`, data);
  }



  /** ***************************************************************************************** **
   ** **                METODO DE CONSULTA DE CARGOS DEL USUARIO                             ** ** 
   ** ***************************************************************************************** **/

  // METODO PARA REGISTRAR CARGO
  RegistrarCargo(data: any) {
    return this.http.post(`${environment.url}/empleadoCargos`, data);
  }

  // METODO PARA BUSCAR DATOS DE CARGO POR ID
  BuscarCargoID(id: number) {
    return this.http.get<any>(`${environment.url}/empleadoCargos/${id}`);
  }

  // METODO DE ACTUALIZACION DE CARGO
  ActualizarContratoEmpleado(id: number, id_empl_contrato: number, data: any) {
    return this.http.put(`${environment.url}/empleadoCargos/${id_empl_contrato}/${id}/actualizar`, data);
  }

  // METODO PARA BUSCAR DATOS DE CARGO POR ID CONTRATO
  BuscarCargoIDContrato(id_empl_contrato: number) {
    return this.http.get<any>(`${environment.url}/empleadoCargos/cargoInfo/${id_empl_contrato}`);
  }











  getEmpleadoCargosRest() {
    return this.http.get(`${environment.url}/empleadoCargos`);
  }

  getListaEmpleadoCargosRest() {
    return this.http.get(`${environment.url}/empleadoCargos/lista-empleados`);
  }






  BuscarIDCargo(id: number) {
    return this.http.get(`${environment.url}/empleadoCargos/buscar/${id}`);
  }

  BuscarIDCargoActual(id: number) {
    return this.http.get(`${environment.url}/empleadoCargos/buscar/cargoActual/${id}`);
  }



  ListarEmpleadosAutorizacion(id: number) {
    return this.http.get(`${environment.url}/empleadoCargos/empleadosAutorizan/${id}`);
  }


  ObtenerUnTipoCargo(id: number) {
    return this.http.get(`${environment.url}/empleadoCargos/buscar/ultimoTipo/nombreCargo/${id}`);
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


  RevisarFormato(formData) {
    return this.http.post<any>(`${environment.url}/empleadoCargos/upload/revision`, formData);
  }

}
