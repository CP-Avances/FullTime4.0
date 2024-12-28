import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProcesoService {

  constructor(
    private http: HttpClient,
  ) { }

  // catalogo de Procesos

  ConsultarProcesos() {
    return this.http.get(`${environment.url}/proceso`);
  }

  getOneProcesoRest(id: number) {
    return this.http.get(`${environment.url}/proceso/${id}`);
  }

  postProcesoRest(data: any) {
    return this.http.post(`${environment.url}/proceso`, data);
  }

  EliminarProceso(id: number, data: any){
    const url= `${environment.url}/proceso/eliminar/${id}`;
    const httpOtions = {
      body: data
    };
    return this.http.request('delete',url,httpOtions);
}

  getIdProcesoPadre(procesoPadre: string) {
    return this.http.get(`${environment.url}/proceso/busqueda/${procesoPadre}`);
  }

  ActualizarUnProceso(datos: any) {
    return this.http.put(`${environment.url}/proceso`, datos);
  }

  CrearXML(data: any) {
    return this.http.post(`${environment.url}/proceso/xmlDownload`, data);
  }

  // METODO PARA VERIIFCAR DATOS DE PLANTILLA   **USADO
  RevisarFormato(formData: any) {
    console.log('enro aqui ',formData)
    return this.http.post<any>(environment.url + '/proceso/upload/revision', formData);
  }

  // METODO PARA REGISTAR LOS NIVELES DE TITULO DE LA PLANTILLA   **USADO
  RegistrarPlantilla(data: any) {
    return this.http.post<any>(environment.url + '/proceso/cargar_plantilla', data);
  }

}
