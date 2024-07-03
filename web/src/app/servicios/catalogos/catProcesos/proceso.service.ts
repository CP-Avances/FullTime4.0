import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpRequest } from '@angular/common/http';
import { environment } from '../../../../environments/environment'
import { catchError } from 'rxjs';

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

}
