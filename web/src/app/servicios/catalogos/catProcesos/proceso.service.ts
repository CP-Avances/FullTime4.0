import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class ProcesoService {

  constructor(
    private http: HttpClient,
  ) { }

  // catalogo de Procesos

  getProcesosRest() {
    return this.http.get(`${environment.url}/proceso`);
  }

  getOneProcesoRest(id: number) {
    return this.http.get(`${environment.url}/proceso/${id}`);
  }

  postProcesoRest(data: any) {
    return this.http.post(`${environment.url}/proceso`, data);
  }

  deleteProcesoRest(id: number){
    return this.http.delete(`${environment.url}/proceso/eliminar/${id}`);
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
