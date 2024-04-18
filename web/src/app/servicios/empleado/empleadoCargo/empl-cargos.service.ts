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
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/empleadoCargos/listar/tiposCargo`);
  }

  // METODO PARA REGISTRAR TIPO DE CARGO
  CrearTipoCargo(data: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/empleadoCargos/tipo_cargo`, data);
  }



  /** ***************************************************************************************** **
   ** **                METODO DE CONSULTA DE CARGOS DEL USUARIO                             ** ** 
   ** ***************************************************************************************** **/

  // METODO PARA REGISTRAR CARGO
  RegistrarCargo(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/empleadoCargos`, data);
  }

  // METODO PARA BUSCAR DATOS DE CARGO POR ID
  BuscarCargoID(id: number) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/empleadoCargos/${id}`);
  }

  // METODO DE ACTUALIZACION DE CARGO
  ActualizarContratoEmpleado(id: number, id_empl_contrato: number, data: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/empleadoCargos/${id_empl_contrato}/${id}/actualizar`, data);
  }

  // METODO PARA BUSCAR DATOS DE CARGO POR ID CONTRATO
  BuscarCargoIDContrato(id_empl_contrato: number) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/empleadoCargos/cargoInfo/${id_empl_contrato}`);
  }











  getEmpleadoCargosRest() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/empleadoCargos`);
  }

  getListaEmpleadoCargosRest() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/empleadoCargos/lista-empleados`);
  }






  BuscarIDCargo(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/empleadoCargos/buscar/${id}`);
  }

  BuscarIDCargoActual(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/empleadoCargos/buscar/cargoActual/${id}`);
  }



  ListarEmpleadosAutorizacion(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/empleadoCargos/empleadosAutorizan/${id}`);
  }


  ObtenerUnTipoCargo(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/empleadoCargos/buscar/ultimoTipo/nombreCargo/${id}`);
  }

  ObtenerCargoDepartamento(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/empleadoCargos/buscar/cargo-departamento/${id}`);
  }

  ObtenerCargoSucursal(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/empleadoCargos/buscar/cargo-sucursal/${id}`);
  }

  ObtenerCargoRegimen(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/empleadoCargos/buscar/cargo-regimen/${id}`);
  }

}
