import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AccionPersonalService {

  constructor(
    private http: HttpClient,
  ) { }

  /** SERVICIOS PARA TABLA TIPO_ACCION_PERSONAL */
  ConsultarTipoAccionPersonal() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/accionPersonal`);
  }

  IngresarTipoAccionPersonal(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/accionPersonal`, datos);
  }

  BuscarTipoAccionPersonalId(id: any) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/accionPersonal/tipo/accion/${id}`);
  }

  ActualizarDatos(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/accionPersonal`, datos);
  }

  EliminarRegistro(id: number, datos: any) {
    const url = `${(localStorage.getItem('empresaURL') as string)}/accionPersonal/eliminar/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
  }

  BuscarDatosTipoEdicion(id: any) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/accionPersonal/editar/accion/tipo/${id}`);
  }

  /** SERVICIOS PARA TABLA TIPO_ACCION*/
  ConsultarTipoAccion() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/accionPersonal/accion/tipo`);
  }

  IngresarTipoAccion(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/accionPersonal/accion/tipo`, datos);
  }

  /** SERVICIOS PARA TABLA PEDIDO_ACCION_EMPLEADO */
  IngresarPedidoAccion(datos: any) {
    console.log('datos a enviar: ',datos)
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/accionPersonal/pedido/accion`, datos);
  }

  ActualizarPedidoAccion(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/accionPersonal/pedido/accion/editar`, datos);
  }

  LogoImagenBase64() {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/accionPersonal/logo/ministerio/codificado`);
  }

  /** CONSULTA DE DATOS DE PEDIDOS DE ACCION DE PERSONAL */
  BuscarDatosPedido() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/accionPersonal/pedidos/accion`);
  }

  BuscarDatosPedidoEmpleados(id: any) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/accionPersonal/pedidos/datos/${id}`);
  }

  BuscarDatosPedidoCiudades(id: any){
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/accionPersonal/pedidos/ciudad/${id}`);
  }

  BuscarDatosPedidoId(id: any) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/accionPersonal/pedido/informacion/${id}`);
  }

  Buscarprocesos(id: any) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/accionPersonal/lista/procesos/${id}`);
  }

  // METODO PARA CREAR ARCHIVO XML
  CrearXML(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/accionPersonal/xmlDownload`, data);
  }

  // METODO PARA VERIIFCAR DATOS DE PLANTILLA   **USADO
  RevisarFormato(formData: any) {
      return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/accionPersonal/upload/revision', formData);
  }
  
  // METODO PARA REGISTAR LOS NIVELES DE TITULO DE LA PLANTILLA   **USADO
  RegistrarPlantilla(data: any) {
      return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/accionPersonal/cargar_plantilla', data);
  }
}
