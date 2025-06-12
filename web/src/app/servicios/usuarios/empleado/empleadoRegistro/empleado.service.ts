import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';;
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { firstValueFrom, of } from 'rxjs';

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

  // METODO PARA BUSCAR CONFIGURACION DE CODIGO DE USUARIO   **USADO
  ObtenerCodigo() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/empleado/encontrarDato/codigo`);
  }

  // METODO PRA REGISTRAR CODIGO DE USUARIO    **USADO
  CrearCodigo(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/empleado/crearCodigo`, datos);
  }

  // METODO DE BUSQUEDA DEL ULTIMO CODIGO REGISTRADO EN EL SISTEMA   **USADO
  ObtenerCodigoMAX() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/empleado/encontrarDato/codigo/empleado`);
  }

  // METODO PARA ACTUALIZAR VALOR DE CODIGO    **USADO
  ActualizarCodigoTotal(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/empleado/cambiarValores`, datos);
  }

  // METODO DE ACTUALIZACION DE CODIGO DE USUARIO    **USADO
  ActualizarCodigo(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/empleado/cambiarCodigo`, datos);
  }


  /** ********************************************************************************************** **
   ** **                     METODO PARA MANEJAR DATOS DE EMPLEADO                                ** **
   ** ********************************************************************************************** **/

  // BUSCAR UN REGISTRO DE USUARIO  **USADO
  BuscarUnEmpleado(id: number) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/empleado/${id}`);
  }

  // REGISTRAR EMPLEADOS    **USADO
  RegistrarEmpleados(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/empleado`, data).pipe(
      catchError(data));
  }

  // ACTUALIZAR EMPLEADOS    **USADO
  ActualizarEmpleados(data: any, id: number) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/empleado/${id}/usuario`, data).pipe(
      catchError(error => {
        throw error;
      })
    );
  }

  // SERVICIO PARA OBTENER LISTA DE NACIONALIDADES    **USADO
  BuscarNacionalidades() {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/nacionalidades`)
  }

  //METODO PARA OBTENER LISTA DE GENERO
  BuscarGeneros() {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/generos`);
  }

  //METODO PARA OBTENER LISTA DE ESTADOS CIVILES
  BuscarEstadoCivil() {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/estados-civiles`);
  }

  // METODO PARA LISTAR EMPLEADOS ACTIVOS    **USADO
  ListarEmpleadosActivos() {
    const headers = new HttpHeaders({
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/empleado`, { headers });
  }

  // METODO PARA LISTAR EMPLEADOS DESACTIVADOS    **USADO
  ListaEmpleadosDesactivados() {
    const headers = new HttpHeaders({
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/empleado/desactivados/empleados`, { headers });
  }

  // DESACTIVAR VARIOS EMPLEADOS SELECCIONADOS   **USADO
  async DesactivarVariosUsuarios(data: any): Promise<any> {
    return firstValueFrom(this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/empleado/desactivar/masivo`, data));
  }

  // ACTIVAR VARIOS EMPLEADOS    **USADO
  async ActivarVariosUsuarios(data: any): Promise<any> {
    return firstValueFrom(this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/empleado/activar/masivo`, data));
  }

  // METODO PARA REACTIVAR USUARIOS   **USADO VERIFICAR FUNCIONAMIENTO
  async ReActivarVariosUsuarios(data: any): Promise<any> {
    return firstValueFrom(this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/empleado/re-activar/masivo`, data));
  }

  // METODO PARA CARGAR IMAGEN DEL USUARIO   **USADO
  SubirImagen(formData: any, idEmpleado: number) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/empleado/${idEmpleado}/uploadImage`, formData)
  }

  // METODO PARA MOSTRAR IMAGEN DEL EMPLEADO **USADO
  ObtenerImagen(id: any, imagen: any) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/empleado/img/codificado/${id}/${imagen}`)
  }

  // METODO PARA ELIMINAR REGISTRO    **USADO
  EliminarEmpleados(empleados: any) {
    const url = `${(localStorage.getItem('empresaURL') as string)}/empleado/eliminar`;
    const httpOtions = {
      body: empleados
    };
    return this.http.request('delete', url, httpOtions).pipe(
      catchError(error => {
        return of({ error: true, message: error.error.message, status: error.status });
      })
    );
  }

  // BUSCAR LISTA DE EMPLEADOS QUE SE MUESTRAN EN LA BUSQUEDA   ** USADO
  BuscarListaEmpleados() {
    this.url = localStorage.getItem('empresaURL') ? localStorage.getItem('empresaURL') as string : environment.url as string;
    return this.http.get<any>(`${(this.url as string)}/empleado/buscador/empleado`);
  }

  /** *********************************************************************** **
   ** **       METODOS PARA MANEJO DE DATOS DE TITULO PROFESIONAL             **
   ** *********************************************************************** **/

  // METODO PARA BUSCAR TITULO DE EMPLEADO    **USADO
  BuscarTituloUsuario(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/empleado/emplTitulos/${id}`);
  }

  // METODO PARA REGISTRAR TITULO PROFESIONAL    **USADO
  RegistrarTitulo(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/empleado/emplTitulos`, data);
  }

  // METODO PARA BUSCAR TITULO ESPECIFICO DEL USUARIO   **USADO
  BuscarTituloEspecifico(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/empleado/emplTitulos/usuario`, data);
  }

  // METODO PARA ACTUALIZAR TITULO DEL USUARIO   **USADO
  ActualizarTitulo(id: number, data: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/empleado/${id}/titulo`, data);
  }

  // METODO DE ELIMINACION DE TITULO DE EMPLEADO   **USADO
  EliminarTitulo(id: number, datos: any) {
    const url = `${(localStorage.getItem('empresaURL') as string)}/empleado/eliminar/titulo/${id}`;
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
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/empleado/geolocalizacion/${id}`, data)
  }

  // METODO PARA OBTENER LA UBICACION DE DOMICILIO DEL USUARIO    **USADO
  BuscarUbicacion(id: number) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/empleado/ubicacion/${id}`);
  }


  /** **************************************************************************************** **
   ** **                 METODOS MODALIDAD DE TRABAJO O TIPO DE CONTRATOS                   ** **
   ** **************************************************************************************** **/

  // BUSCAR LISTA MODALIDAD DE TRABAJO O TIPO DE CONTRATOS   **USADO
  BuscarTiposContratos() {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/contratoEmpleado/modalidad/trabajo`);
  }

  // REGISTRAR MODALIDAD DE TRABAJO   **USADO
  CrearTiposContrato(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/contratoEmpleado/modalidad/trabajo`, datos);
  }

  // BUSCAR MODALIDAD DE TRABAJO POR SU NOMBRE    **USADO
  BuscarModalidadLaboralNombre(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/contratoEmpleado/modalidad/trabajo/nombre`, datos);
  }

  /** ***************************************************************************************** **
   ** **                        MANEJO DE DATOS DE CONTRATOS                                 ** **
   ** ***************************************************************************************** **/

  // REGISTRO DE DATOS DE CONTRATO   **USADO
  CrearContratoEmpleado(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/contratoEmpleado`, datos);
  }

  // CARGAR DOCUMENTO CONTRATO    **USADO
  SubirContrato(formData: any, id: number) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/contratoEmpleado/${id}/documento-contrato`, formData)
  }

  // BUSCAR CONTRATOS POR ID DE EMPLEADO   **USADO
  BuscarContratosEmpleado(id: number) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/contratoEmpleado/contrato-empleado/${id}`);
  }

  // BUSCAR CONTRATOS POR ID DE EMPLEADO EXCLUYENDO CONTRATO A EDITAR    **USADO
  BuscarContratosEmpleadoEditar(data: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/contratoEmpleado/contrato-empleado-editar`, data);
  }

  // EDITAR DATOS DE CONTRATO     **USADO
  ActualizarContratoEmpleado(id: number, data: any) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/contratoEmpleado/${id}/actualizar/`, data);
  }

  // ELIMINAR DOCUMENTO DE CONTRATO   **USADO
  EliminarArchivo(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/contratoEmpleado/eliminar_contrato/base_servidor`, datos)
  }

  // ELIMINAR DOCUMENTO DE CONTRATO DEL SERVIDOR   **USADO
  EliminarArchivoServidor(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/contratoEmpleado/eliminar_contrato/servidor`, datos)
  }

  // METODO PARA BUSCAR ID DE CONTRATO ACTUAL   **USADO
  BuscarIDContratoActual(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/contratoEmpleado/contratoActual/${id}`);
  }

  // METODO PARA BUSCAR DATOS DE CONTRATO POR ID   **USADO
  BuscarDatosContrato(id: number) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/contratoEmpleado/contrato/${id}`);
  }

  // METODO PARA ELIMINAR EL CONTRATO POR EL ID         **USADO
  EliminarContrato(data: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/contratoEmpleado/eliminarContrato`, data);
  }

  // METODO PARA BUSCAR FECHA DE CONTRATOS  **USADO
  BuscarFechaContrato(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/contratoEmpleado/buscarFecha`, datos);
  }
  // METODO PARA BUSCAR FECHA DE CONTRATOS  **USADO
  BuscarFechaContratoUsuarios(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/contratoEmpleado/buscarFechaUsuarios`, datos);
  }

  // BUSQUEDA DE EMPLEADOS INGRESANDO NOMBRE Y APELLIDO     **USADO
  BuscarEmpleadoNombre(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/empleado/buscar/informacion`, data);
  }

  // VERIFICAR DATOS DE LA PLANTILLA DE DATOS CON CODIGO GENERADO DE FORMA AUTOMATICA    **USADO
  VerificarArchivoExcel_Automatico(formData: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/empleado/verificar/automatico/plantillaExcel/`, formData);
  }

  // METODO PARA REGISTRAR DATOS DE LA PLANTILLA CODIGO AUTOMATICO   **USADO
  SubirArchivoExcel_Automatico(formData: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/empleado/cargar_automatico/plantillaExcel/`, formData);
  }

  // VERIFICAR DATOS DE LA PLANTILLA DE DATOS CON CODIGO GENERADO DE FORMA MANUAL    **USADO
  VerificarArchivoExcel_Manual(formData: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/empleado/verificar/manual/plantillaExcel/`, formData);
  }

  // METODO PARA REGISTRAR DATOS DE LA PLANTILLA CODIGO MANUAL   **USADO
  SubirArchivoExcel_Manual(formData: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/empleado/cargar_manual/plantillaExcel/`, formData);
  }

  // METODO PARA BUSCAR FECHA DE CONTRATO SEGUN ID    **USADO
  BuscarFechaIdContrato(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/contratoEmpleado/buscarFecha/contrato`, datos);
  }

  // METODO PARA REVISAR DATOS DE PLANTILLA CONTRATOS   **USADO
  RevisarFormato(formData: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/contratoEmpleado/upload/revision`, formData);
  }

  // METODO PARA SUBIR DATOS DE CONTRATOS   **USADO
  SubirArchivoExcelContrato(formData: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/contratoEmpleado/cargar_plantilla/`, formData);
  }

  // CREAR CARPETA PARA EMPLEADOS SELECCIONADOS    **USADO
  CrearCarpetasUsuarios(data: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/empleado/crear_carpetas`, data).pipe(
      catchError(error => {
        return of({ error: true, message: error.error.message });
      })
    );
  }

  ObtenerContratosCargos(data: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/empleado/infoContratoCargos`, data).pipe(
      catchError(error => {
        return of({ error: true, message: error.error.message });
      })
    );

  }

}
