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

}
