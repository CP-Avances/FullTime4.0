import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProcesoService {

  constructor(
    private http: HttpClient,
  ) { }

  // catalogo de Procesos

  ConsultarProcesos() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/proceso`);
  }

  getOneProcesoRest(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/proceso/${id}`);
  }

  postProcesoRest(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/proceso`, data);
  }

  EliminarProceso(id: number, data: any){
    const url= `${(localStorage.getItem('empresaURL') as string)}/proceso/eliminar/${id}`;
    const httpOtions = {
      body: data
    };
    return this.http.request('delete',url,httpOtions);
}

  getIdProcesoPadre(procesoPadre: string) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/proceso/busqueda/${procesoPadre}`);
  }

  ActualizarUnProceso(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/proceso`, datos);
  }

  CrearXML(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/proceso/xmlDownload`, data);
  }

  // METODO PARA VERIIFCAR DATOS DE PLANTILLA   **USADO
  RevisarFormato(formData: any) {
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/proceso/upload/revision', formData);
  }

  // METODO PARA REGISTAR LOS NIVELES DE TITULO DE LA PLANTILLA   **USADO
  RegistrarPlantilla(data: any) {
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/proceso/cargar_plantilla', data);
  }

  RegistroProcesos(data: any){
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/proceso/registrarProcesos', data)
  }

  // METODO PARA VERIIFCAR DATOS DE PLANTILLA   **USADO
  RevisarFormatoEMPLEPROCESO(formData: any) {
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/proceso/upload/revision_epleadoProceso', formData);
  }

  RegistrarPlantillaEmpleProce(data: any){
    console.log('data a enviar: ',data)
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/proceso/cargar_plantilla/registro_epleadoProceso', data)
  }

  // METODO PARA VERIIFCAR DATOS DE PLANTILLA   **USADO
  ActualizarProcesoEmple(formData: any) {
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/proceso/actualizacionProceso', formData);
  }

  // METODO PARA ELIMINAR GRUPOS OCUPACIONALES MULTIPLES
  EliminarProcesoMult(data: any) {
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/proceso/eliminarProcesoMult', data);
  }
  
}
