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
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/proceso`);
  }

  getOneProcesoRest(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/proceso/${id}`);
  }

  postProcesoRest(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/proceso`, data);
  }

  deleteProcesoRest(id: number){
    return this.http.delete(`${(localStorage.getItem('empresaURL') as string)}/proceso/eliminar/${id}`);
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

}
