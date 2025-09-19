import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProcesoService {

  constructor(
    private http: HttpClient,
  ) { }

  // METODO DE CONSULTA DE PROCESOS    **USADO**
  ConsultarProcesos() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/proceso`);
  }

  // METODO PARA REGISTRAR UN PROCESO   **USADO**
  RegistrarProceso(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/proceso`, data);
  }

  // METODO DE ELIMINACION DE REGISTROS DE PROCESOS   **USADO**
  EliminarProceso(id: number, data: any) {
    const url = `${(localStorage.getItem('empresaURL') as string)}/proceso/eliminar/${id}`;
    const httpOtions = {
      body: data
    };
    return this.http.request('delete', url, httpOtions);
  }

  // METODO PARA OBTENER EL ID DEL PROCESO SUPERIOR   **USADO**
  ObtenerIDProcesoSuperior(procesoPadre: string) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/proceso/busqueda/${procesoPadre}`);
  }

  // METODO PARA ACTUALIZAR UN PROCESO    **USADO**
  ActualizarUnProceso(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/proceso`, datos);
  }

  // METODO PARA VERIIFCAR DATOS DE PLANTILLA   **USADO**
  RevisarFormato(formData: any) {
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/proceso/upload/revision', formData);
  }

  // METODO PARA REGISTAR LOS NIVELES DE TITULO DE LA PLANTILLA   **USADO**
  RegistrarPlantilla(data: any) {
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/proceso/cargar_plantilla', data);
  }

  // METODO DE REGISTRO DE EMPLEADO - PROCESOS    **USADO**
  RegistroProcesos(data: any) {
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/proceso/registrarProcesos', data)
  }

  // METODO PARA VERIFICAR DATOS DE PLANTILLA   **USADO**
  RevisarFormatoEMPLEPROCESO(formData: any) {
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/proceso/upload/revision_empleadoProceso', formData);
  }

  // METODO DE REGISTRO DE PLANTILLA DE PROCESOS    **USADO**
  RegistrarPlantillaEmpleProceso(data: any) {
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/proceso/cargar_plantilla/registro_empleadoProceso', data)
  }

  // METODO PARA ACTUALIZAR REGISTROS DE PROCESOS   **USADO**
  ActualizarProcesoEmple(formData: any) {
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/proceso/actualizacionProceso', formData);
  }

  // METODO PARA ELIMINAR PROCESOS MULTIPLES    **USADO**
  EliminarProcesoMultiple(data: any) {
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/proceso/eliminarProcesoMultiple', data);
  }

}
