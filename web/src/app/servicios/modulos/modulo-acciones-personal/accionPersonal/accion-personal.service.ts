import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class AccionPersonalService {

  constructor(
    private http: HttpClient,
  ) { }

  // METODO PARA CONSULTAR TIPO DE ACCION DE PERSONAL   **USADO**
  ConsultarTipoAccionPersonal() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/accionPersonal`);
  }

  // METODO PARA REGISTRAR DETALLE DE TIPOS DE ACCIONES DE PERSONAL   **USADO**
  IngresarTipoAccionPersonal(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/accionPersonal`, datos);
  }

  // METODO PARA ELIMINAR REGISTROS DE DETALLES DE TIPO DE ACCION DE PERSONAL  *USADO**
  EliminarRegistro(id: number, datos: any) {
    const url = `${(localStorage.getItem('empresaURL') as string)}/accionPersonal/eliminar/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
  }

  // METODO PARA CONSULTAR TIPOS DE ACCION PERSONAL   **USADO**
  ConsultarTipoAccion() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/accionPersonal/accion/tipo`);
  }

  // METODO PARA REGISTRAR UN TIPO DE ACCION DE PERSONAL   **USADO**
  IngresarTipoAccion(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/accionPersonal/accion/tipo`, datos);
  }

  // METODO DE REGISTRO DE DOCUMENTO ACCION DE PERSONAL     **USADO**
  IngresarPedidoAccion(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/accionPersonal/pedido/accion`, datos);
  }

  // METODO PARA VERIIFCAR DATOS DE PLANTILLA   **USADO**
  RevisarFormato(formData: any) {
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/accionPersonal/upload/revision', formData);
  }

  // METODO PARA REGISTAR LOS NIVELES DE TITULO DE LA PLANTILLA   **USADO**
  RegistrarPlantilla(data: any) {
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/accionPersonal/cargar_plantilla', data);
  }

  // METODO PARA ELIMINAR DE MANERA MULTIPLE EL REGISTR DE DETALLE DE TIPO ACCION PERSONAL   **USADO**
  EliminarDetalleTipoAccionMult(data: any) {
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/accionPersonal/eliminarMultiple', data);
  }

  // METODO DE ACTUALIZACION DEL DETALLE DE LA ACCION DE PERSONAL    **USADO**
  ActualizarDatos(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/accionPersonal`, datos);
  }

  // METODO PARA BUSCAR UN DETALLE DE TIPO DE ACCION DE PERSONAL POR ID    **USADO**
  BuscarTipoAccionPersonalId(id: any) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/accionPersonal/tipo/accion/${id}`);
  }

  // METODO PARA BUSCAR DATOS DEL DETALLE DE ACCION DE PERSONAL PARA EDICION   **USADO**
  BuscarDatosTipoEdicion(id: any) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/accionPersonal/editar/accion/tipo/${id}`);
  }

  // METODO DE BUSQUEDA DE DATOS DE DOCUMENTOS DE ACCION DE PERSONAL    **USADO**
  BuscarDatosPedidoId(id: any) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/accionPersonal/pedido/informacion/${id}`);
  }

  // METODO PARA ACTUALIZAR DATOS DEL DOCUMENTO DE ACCION DE PERSONAL   **USADO**
  ActualizarPedidoAccion(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/accionPersonal/pedido/accion/editar`, datos);
  }

  // METODO PARA VER IMAGEN DEL MINISTERIO DE TRABAJO     **USADO**
  LogoImagenBase64() {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/accionPersonal/logo/ministerio/codificado`);
  }

  // METODO PARA LISTAR LOS DOCUMENTOS DE ACCIONES DE PERSONAL    **USADO**
  BuscarDatosPedido() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/accionPersonal/pedidos/accion`);
  }

  // METODO PARA BUSCAR UN DOCUMENTO DE ACCION DE PERSONAL    **USADO**
  BuscarDatosPedidoEmpleados(id: any) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/accionPersonal/pedidos/datos/${id}`);
  }

  // METODO PARA BUSCAR LISTA DE PROCESOS   **USADO**
  Buscarprocesos(id: any) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/accionPersonal/lista/procesos/${id}`);
  }


}
