import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { firstValueFrom, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmpleadoService {

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

  // METODO PARA BUSCAR CONFIGURACION DE CODIGO DE USUARIO   **USADO
  ObtenerCodigo() {
    return this.http.get(`${environment.url}/empleado/encontrarDato/codigo`);
  }

  // METODO PRA REGISTRAR CODIGO DE USUARIO    **USADO
  CrearCodigo(datos: any) {
    return this.http.post(`${environment.url}/empleado/crearCodigo`, datos);
  }

  // METODO DE BUSQUEDA DEL ULTIMO CODIGO REGISTRADO EN EL SISTEMA   **USADO
  ObtenerCodigoMAX() {
    return this.http.get(`${environment.url}/empleado/encontrarDato/codigo/empleado`);
  }

  // METODO PARA ACTUALIZAR VALOR DE CODIGO    **USADO
  ActualizarCodigoTotal(datos: any) {
    return this.http.put(`${environment.url}/empleado/cambiarValores`, datos);
  }

  // METODO DE ACTUALIZACION DE CODIGO DE USUARIO    **USADO
  ActualizarCodigo(datos: any) {
    return this.http.put(`${environment.url}/empleado/cambiarCodigo`, datos);
  }


  /** ********************************************************************************************** **
   ** **                     METODO PARA MANEJAR DATOS DE EMPLEADO                                ** **
   ** ********************************************************************************************** **/

  // BUSCAR UN REGISTRO DE USUARIO  **USADO
  BuscarUnEmpleado(id: number) {
    return this.http.get<any>(`${environment.url}/empleado/${id}`);
  }

  // BUSCAR LISTA DE EMPLEADOS
  BuscarListaEmpleados() {
    return this.http.get<any>(`${environment.url}/empleado/buscador/empleado`);
  }

  // REGISTRAR EMPLEADOS    **USADO
  RegistrarEmpleados(data: any) {
    return this.http.post(`${environment.url}/empleado`, data).pipe(
      catchError(data));
  }

  // ACTUALIZAR EMPLEADOS    **USADO
  ActualizarEmpleados(data: any, id: number) {
    return this.http.put(`${environment.url}/empleado/${id}/usuario`, data).pipe(
      catchError(error => {
        throw error;
      })
    );
  }

  // SERVICIO PARA OBTENER LISTA DE NACIONALIDADES    **USADO
  BuscarNacionalidades() {
    return this.http.get<any>(`${environment.url}/nacionalidades`)
  }

  // METODO PARA LISTAR EMPLEADOS ACTIVOS    **USADO
  ListarEmpleadosActivos() {
    const headers = new HttpHeaders({
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    return this.http.get<any>(`${environment.url}/empleado`, { headers });
  }

  // METODO PARA LISTAR EMPLEADOS DESACTIVADOS    **USADO
  ListaEmpleadosDesactivados() {
    const headers = new HttpHeaders({
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    return this.http.get<any>(`${environment.url}/empleado/desactivados/empleados`, { headers });
  }

  // DESACTIVAR VARIOS EMPLEADOS SELECCIONADOS   **USADO
  async DesactivarVariosUsuarios(data: any): Promise<any> {
    return firstValueFrom(this.http.put<any>(`${environment.url}/empleado/desactivar/masivo`, data));
  }

  // ACTIVAR VARIOS EMPLEADOS    **USADO
  async ActivarVariosUsuarios(data: any): Promise<any> {
    return firstValueFrom(this.http.put<any>(`${environment.url}/empleado/activar/masivo`, data));
  }

  // METODO PARA REACTIVAR USUARIOS   **USADO VERIFICAR FUNCIONAMIENTO
  async ReActivarVariosUsuarios(data: any): Promise<any> {
    return firstValueFrom(this.http.put<any>(`${environment.url}/empleado/re-activar/masivo`, data));
  }

  // METODO PARA CARGAR IMAGEN DEL USUARIO   **USADO
  SubirImagen(formData: any, idEmpleado: number) {
    return this.http.put(`${environment.url}/empleado/${idEmpleado}/uploadImage`, formData)
  }

  // METODO PARA MOSTRAR IMAGEN DEL EMPLEADO **USADO
  ObtenerImagen(id: any, imagen: any) {
    return this.http.get<any>(`${environment.url}/empleado/img/codificado/${id}/${imagen}`)
  }

  // METODO PARA ELIMINAR REGISTRO    **USADO
  EliminarEmpleados(empleados: any) {
    const url = `${environment.url}/empleado/eliminar`;
    const httpOtions = {
      body: empleados
    };
    return this.http.request('delete', url, httpOtions).pipe(
      catchError(error => {
        return of({ error: true, message: error.error.message, status: error.status });
      })
    );
  }


  /** *********************************************************************** **
   ** **       METODOS PARA MANEJO DE DATOS DE TITULO PROFESIONAL             **
   ** *********************************************************************** **/

  // METODO PARA BUSCAR TITULO DE EMPLEADO    **USADO
  BuscarTituloUsuario(id: number) {
    return this.http.get(`${environment.url}/empleado/emplTitulos/${id}`);
  }

  // METODO PARA REGISTRAR TITULO PROFESIONAL    **USADO
  RegistrarTitulo(data: any) {
    return this.http.post(`${environment.url}/empleado/emplTitulos`, data);
  }

  // METODO PARA BUSCAR TITULO ESPECIFICO DEL USUARIO   **USADO
  BuscarTituloEspecifico(data: any) {
    return this.http.post(`${environment.url}/empleado/emplTitulos/usuario`, data);
  }

  // METODO PARA ACTUALIZAR TITULO DEL USUARIO   **USADO
  ActualizarTitulo(id: number, data: any) {
    return this.http.put(`${environment.url}/empleado/${id}/titulo`, data);
  }

  // METODO DE ELIMINACION DE TITULO DE EMPLEADO   **USADO
  EliminarTitulo(id: number, datos: any) {
    const url = `${environment.url}/empleado/eliminar/titulo/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
  }


  /** *********************************************************************** **
   ** **         CONTROL DE GEOLOCALIZACION EN EL SISTEMA                     **
   ** *********************************************************************** **/

  // METODO PARA ACTUALIZAR UBICACION DE DOMICILIO   **USADO
  ActualizarDomicilio(id: number, data: any) {
    return this.http.put<any>(`${environment.url}/empleado/geolocalizacion/${id}`, data)
  }

  // METODO PARA OBTENER LA UBICACION DE DOMICILIO DEL USUARIO    **USADO
  BuscarUbicacion(id: number) {
    return this.http.get<any>(`${environment.url}/empleado/ubicacion/${id}`);
  }


  /** **************************************************************************************** **
   ** **                 METODOS MODALIDAD DE TRABAJO O TIPO DE CONTRATOS                   ** **
   ** **************************************************************************************** **/

  // BUSCAR LISTA MODALIDAD DE TRABAJO O TIPO DE CONTRATOS   **USADO
  BuscarTiposContratos() {
    return this.http.get<any>(`${environment.url}/contratoEmpleado/modalidad/trabajo`);
  }

  // REGISTRAR MODALIDAD DE TRABAJO   **USADO
  CrearTiposContrato(datos: any) {
    return this.http.post<any>(`${environment.url}/contratoEmpleado/modalidad/trabajo`, datos);
  }

  // BUSCAR MODALIDAD DE TRABAJO POR SU NOMBRE    **USADO
  BuscarModalidadLaboralNombre(datos: any) {
    return this.http.post<any>(`${environment.url}/contratoEmpleado/modalidad/trabajo/nombre`, datos);
  }

  /** ***************************************************************************************** **
   ** **                        MANEJO DE DATOS DE CONTRATOS                                 ** **
   ** ***************************************************************************************** **/

  // REGISTRO DE DATOS DE CONTRATO   **USADO
  CrearContratoEmpleado(datos: any) {
    return this.http.post<any>(`${environment.url}/contratoEmpleado`, datos);
  }

  // CARGAR DOCUMENTO CONTRATO    **USADO
  SubirContrato(formData: any, id: number) {
    return this.http.put(`${environment.url}/contratoEmpleado/${id}/documento-contrato`, formData)
  }

  // BUSCAR CONTRATOS POR ID DE EMPLEADO   **USADO
  BuscarContratosEmpleado(id: number) {
    return this.http.get<any>(`${environment.url}/contratoEmpleado/contrato-empleado/${id}`);
  }

  // BUSCAR CONTRATOS POR ID DE EMPLEADO EXCLUYENDO CONTRATO A EDITAR    **USADO
  BuscarContratosEmpleadoEditar(data: any) {
    return this.http.post<any>(`${environment.url}/contratoEmpleado/contrato-empleado-editar`, data);
  }

  // EDITAR DATOS DE CONTRATO     **USADO
  ActualizarContratoEmpleado(id: number, data: any) {
    return this.http.put<any>(`${environment.url}/contratoEmpleado/${id}/actualizar/`, data);
  }

  // ELIMINAR DOCUMENTO DE CONTRATO   **USADO
  EliminarArchivo(datos: any) {
    return this.http.put(`${environment.url}/contratoEmpleado/eliminar_contrato/base_servidor`, datos)
  }

  // ELIMINAR DOCUMENTO DE CONTRATO DEL SERVIDOR   **USADO
  EliminarArchivoServidor(datos: any) {
    return this.http.put(`${environment.url}/contratoEmpleado/eliminar_contrato/servidor`, datos)
  }

  // METODO PARA BUSCAR ID DE CONTRATO ACTUAL   **USADO
  BuscarIDContratoActual(id: number) {
    return this.http.get(`${environment.url}/contratoEmpleado/contratoActual/${id}`);
  }

  // METODO PARA BUSCAR DATOS DE CONTRATO POR ID   **USADO
  BuscarDatosContrato(id: number) {
    return this.http.get<any>(`${environment.url}/contratoEmpleado/contrato/${id}`);
  }

  // METODO PARA ELIMINAR EL CONTRATO POR EL ID         **USADO
  EliminarContrato(id: any, data: any) {
    return this.http.post<any>(`${environment.url}/contratoEmpleado/eliminarContrato/${id}`, data);
  }

  // METODO PARA BUSCAR FECHA DE CONTRATOS  **USADO
  BuscarFechaContrato(datos: any) {
    return this.http.post(`${environment.url}/contratoEmpleado/buscarFecha`, datos);
  }

  // BUSQUEDA DE EMPLEADOS INGRESANDO NOMBRE Y APELLIDO
  BuscarEmpleadoNombre(data: any) {
    return this.http.post(`${environment.url}/empleado/buscar/informacion`, data);
  }

  // VERIFICAR DATOS DE LA PLANTILLA DE DATOS CON CODIGO GENERADO DE FORMA AUTOMATICA    **USADO
  VerificarArchivoExcel_Automatico(formData: any) {
    return this.http.post<any>(`${environment.url}/empleado/verificar/automatico/plantillaExcel/`, formData);
  }

  // METODO PARA REGISTRAR DATOS DE LA PLANTILLA CODIGO AUTOMATICO   **USADO
  SubirArchivoExcel_Automatico(formData: any) {
    return this.http.post<any>(`${environment.url}/empleado/cargar_automatico/plantillaExcel/`, formData);
  }

  // VERIFICAR DATOS DE LA PLANTILLA DE DATOS CON CODIGO GENERADO DE FORMA MANUAL    **USADO
  VerificarArchivoExcel_Manual(formData: any) {
    return this.http.post<any>(`${environment.url}/empleado/verificar/manual/plantillaExcel/`, formData);
  }

  // METODO PARA REGISTRAR DATOS DE LA PLANTILLA CODIGO MANUAL   **USADO
  SubirArchivoExcel_Manual(formData: any) {
    return this.http.post<any>(`${environment.url}/empleado/cargar_manual/plantillaExcel/`, formData);
  }

  // METODO PARA BUSCAR FECHA DE CONTRATO SEGUN ID    **USADO
  BuscarFechaIdContrato(datos: any) {
    return this.http.post(`${environment.url}/contratoEmpleado/buscarFecha/contrato`, datos);
  }

  // METODO PARA REVISAR DATOS DE PLANTILLA CONTRATOS   **USADO
  RevisarFormato(formData: any) {
    return this.http.post<any>(`${environment.url}/contratoEmpleado/upload/revision`, formData);
  }

  // METODO PARA SUBIR DATOS DE CONTRATOS   **USADO
  SubirArchivoExcelContrato(formData: any) {
    return this.http.post<any>(`${environment.url}/contratoEmpleado/cargar_plantilla/`, formData);
  }

  BuscarDepartamentoEmpleado(datos: any) {
    return this.http.post(`${environment.url}/empleado/buscarDepartamento`, datos);
  }


  // CREAR CARPETA PARA EMPLEADOS SELECCIONADOS    **USADO
  CrearCarpetasUsuarios(data: any) {
    return this.http.post<any>(`${environment.url}/empleado/crear_carpetas`, data).pipe(
      catchError(error => {
        return of({ error: true, message: error.error.message });
      })
    );
  }

  ObtenerContratosCargos(data: any){
    return this.http.post<any>(`${environment.url}/empleado/infoContratoCargos`, data).pipe(
      catchError(error => {
        return of({ error: true, message: error.error.message });
      })
    );
    
  }



}
