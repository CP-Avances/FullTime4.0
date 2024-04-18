import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EmpleadoService {

  url: string;

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  }

  constructor(
    private http: HttpClient
  ) { }


  /** ** ********************************************************************************************* **
   ** ** **                        MANEJO DE CODIGOS DE USUARIOS                                    ** **
   ** ** ********************************************************************************************* **/

  // METODO PARA BUSCAR CONFIGURACION DE CODIGO DE USUARIO
  ObtenerCodigo() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/empleado/encontrarDato/codigo`);
  }

  // METODO PRA REGISTRAR CODIGO DE USUARIO
  CrearCodigo(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/empleado/crearCodigo`, datos);
  }

  // METODO DE BUSQUEDA DEL ULTIMO CODIGO REGISTRADO EN EL SISTEMA
  ObtenerCodigoMAX() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/empleado/encontrarDato/codigo/empleado`);
  }

  // METODO PARA ACTUALIZAR VALOR DE CODIGO
  ActualizarCodigoTotal(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/empleado/cambiarValores`, datos);
  }

  // METODO DE ACTUALIZACION DE CODIGO DE USUARIO
  ActualizarCodigo(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/empleado/cambiarCodigo`, datos);
  }


  /** ********************************************************************************************** **
   ** **                     METODO PARA MANEJAR DATOS DE EMPLEADO                                ** ** 
   ** ********************************************************************************************** **/

  // BUSCAR UN REGISTRO DE USUARIO  --**VERIFICADO
  BuscarUnEmpleado(id: number) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/empleado/${id}`);
  }

  // BUSCAR LISTA DE EMPLEADOS
  BuscarListaEmpleados() {
    //Verificacion inicial de url por defecto y actualizacion del mismo, depende de empresaURL
    this.url = localStorage.getItem('empresaURL') ? localStorage.getItem('empresaURL') as string: environment.url as string;
    return this.http.get<any>(`${( this.url as string)}/empleado/buscador/empleado`);
  }

  // REGISTRAR EMPLEADOS
  RegistrarEmpleados(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/empleado`, data).pipe(
      catchError(data));
  }

  // ACTUALIZAR EMPLEADOS
  ActualizarEmpleados(data: any, id: number) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/empleado/${id}/usuario`, data).pipe(
      catchError(data));
  }

  // SERVICIO PARA OBTENER LISTA DE NACIONALIDADES
  BuscarNacionalidades() {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/nacionalidades`)
  }

  // METODO PARA LISTAR EMPLEADOS ACTIVOS
  ListarEmpleadosActivos() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/empleado`);
  }

  // METODO PARA LISTAR EMPLEADOS DESACTIVADOS
  ListaEmpleadosDesactivados() {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/empleado/desactivados/empleados`);
  }

  // METODO PARA CREAR ARCHIVO XML
  CrearXML(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/empleado/xmlDownload`, data);
  }

  // DESACTIVAR VARIOS EMPLEADOS SELECCIONADOS
  DesactivarVariosUsuarios(data: any[]) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/empleado/desactivar/masivo`, data)
  }

  // ACTIVAR VARIOS EMPLEADOS
  ActivarVariosUsuarios(data: any[]) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/empleado/activar/masivo`, data)
  }

  // METODO PARA REACTIVAR USUARIOS
  ReActivarVariosUsuarios(data: any[]) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/empleado/re-activar/masivo`, data)
  }

  // METODO PARA CARGAR IMAGEN DEL USUARIO
  SubirImagen(formData: any, idEmpleado: number) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/empleado/${idEmpleado}/uploadImage`, formData)
  }

  obtenerImagen(id: any, imagen: any) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/empleado/img/codificado/${id}/${imagen}`)
  }


  /** *********************************************************************** **
   ** **       METODOS PARA MANEJO DE DATOS DE TITULO PROFESIONAL             **
   ** *********************************************************************** **/

  // METODO PARA BUSCAR TITULO DE EMPLEADO
  BuscarTituloUsuario(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/empleado/emplTitulos/${id}`);
  }

  // METODO PARA REGISTRAR TITULO PROFESIONAL
  RegistrarTitulo(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/empleado/emplTitulos`, data);
  }

  ActualizarTitulo(id: number, data: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/empleado/${id}/titulo`, data);
  }

  // METODO DE ELIMINACION DE TITULO DE EMPLEADO
  EliminarTitulo(id: number) {
    return this.http.delete(`${(localStorage.getItem('empresaURL') as string)}/empleado/eliminar/titulo/${id}`);
  }


  /** *********************************************************************** **
   ** **         CONTROL DE GEOLOCALIZACION EN EL SISTEMA                     **
   ** *********************************************************************** **/

  // METODO PARA ACTUALIZAR UBICACION DE DOMICILIO
  ActualizarDomicilio(id: number, data: any) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/empleado/geolocalizacion/${id}`, data)
  }

  // METODO PARA OBTENER LA UBICACION DE DOMICILIO DEL USUARIO
  BuscarUbicacion(id: number) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/empleado/ubicacion/${id}`);
  }


  /** **************************************************************************************** **
   ** **                 METODOS MODALIDAD DE TRABAJO O TIPO DE CONTRATOS                   ** **
   ** **************************************************************************************** **/

  // BUSCAR LISTA MODALIDAD DE TRABAJO
  BuscarTiposContratos() {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/contratoEmpleado/modalidad/trabajo`);
  }

  // REGISTRAR MODALIDAD DE TRABAJO
  CrearTiposContrato(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/contratoEmpleado/modalidad/trabajo`, datos);
  }


  /** ***************************************************************************************** ** 
   ** **                        MANEJO DE DATOS DE CONTRATOS                                 ** ** 
   ** ***************************************************************************************** **/

  // REGISTRO DE DATOS DE CONTRATO
  CrearContratoEmpleado(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/contratoEmpleado`, datos);
  }

  // CARGAR DOCUMENTO CONTRATO
  SubirContrato(formData: any, id: number) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/contratoEmpleado/${id}/documento-contrato`, formData)
  }

  // BUSCAR CONTRATOS POR ID DE EMPLEADO
  BuscarContratosEmpleado(id: number) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/contratoEmpleado/contrato-empleado/${id}`);
  }

  // EDITAR DATOS DE CONTRATO
  ActualizarContratoEmpleado(id: number, data: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/contratoEmpleado/${id}/actualizar/`, data);
  }

  // ELIMINAR DOCUMENTO DE CONTRATO
  EliminarArchivo(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/contratoEmpleado/eliminar_contrato/base_servidor`, datos)
  }

  // ELIMINAR DOCUMENTO DE CONTRATO DEL SERVIDOR
  EliminarArchivoServidor(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/contratoEmpleado/eliminar_contrato/servidor`, datos)
  }

  // VISUALIZAR DOCUMENTO CONTRATO
  ObtenerUnContrato(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/contratoEmpleado/${id}/get`);
  }

  // METODO PARA BUSCAR ID DE CONTRATO ACTUAL
  BuscarIDContratoActual(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/contratoEmpleado/contratoActual/${id}`);
  }

  // METODO PARA BUSCAR DATOS DE CONTRATO POR ID
  BuscarDatosContrato(id: number) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/contratoEmpleado/contrato/${id}`);
  }

  // METODO PARA BUSCAR FECHA DE CONTRATOS   --**VERIFICADO
  BuscarFechaContrato(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/contratoEmpleado/buscarFecha`, datos);
  }
















  // BUSQUEDA DE EMPLEADOS INGRESANDO NOMBRE Y APELLIDO 
  BuscarEmpleadoNombre(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/empleado/buscar/informacion`, data);
  }







  /** Verificar datos de la plantilla de datos con código generado de forma automática */
  verificarArchivoExcel_Automatico(formData) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/empleado/verificar/automatico/plantillaExcel/`, formData);
  }

  verificarArchivoExcel_DatosAutomatico(formData) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/empleado/verificar/datos/automatico/plantillaExcel/`, formData);
  }

  subirArchivoExcel_Automatico(formData) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/empleado/cargar_automatico/plantillaExcel/`, formData);
  }

  /** Verifcar datos de la plantilla de datos con código generado de forma automática */
  verificarArchivoExcel_Manual(formData) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/empleado/verificar/manual/plantillaExcel/`, formData);
  }

  verificarArchivoExcel_DatosManual(formData) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/empleado/verificar/datos/manual/plantillaExcel/`, formData);
  }

  subirArchivoExcel_Manual(formData) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/empleado/cargar_manual/plantillaExcel/`, formData);
  }





















  BuscarIDContrato(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/contratoEmpleado/${id}`);
  }











  BuscarFechaIdContrato(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/contratoEmpleado/buscarFecha/contrato`, datos);
  }

  ObtenerContratos() {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/contratoEmpleado`);
  }








  BuscarUltimoTiposContratos() {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/contratoEmpleado/modalidad/trabajo/ultimo`);
  }













































  BuscarDepartamentoEmpleado(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/empleado/buscarDepartamento`, datos);
  }
















  InsertarUbicacion(id: number, codigo: number, data: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/empleado/geolocalizacion-domicilio/${id}/${codigo}`, data)
  }

  ActualizarUbicacionTrabajo(id: number, data: any) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/empleado/geolocalizacion-trabajo/${id}`, data)
  }

  ActualizarUbicacionDomicilio(id: number, data: any) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/empleado/geolocalizacion-nuevo-domicilio/${id}`, data)
  }



  ActualizarUbicacion(id: number, data: any) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/empleado/actualizar-geolocalizacion/${id}`, data);
  }

}
