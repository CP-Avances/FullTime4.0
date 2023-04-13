import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class EnroladoService {

  constructor(
    private http: HttpClient,
  ) { }

  // catalogo de enrolados

  getEnroladosRest() {
    return this.http.get(`${environment.url}/enrolados`);
  }

  ListarUnEnrolado(id: number) {
    return this.http.get(`${environment.url}/enrolados/${id}`);
  }

  postEnroladosRest(data: any) {
    console.log(data)
    return this.http.post(`${environment.url}/enrolados`, data);
  }

  BuscarUltimoId() {
    return this.http.get(`${environment.url}/enrolados/buscar/ultimoId`);
  }

  BuscarRegistroUsuario(id_usuario: number) {
    return this.http.get(`${environment.url}/enrolados/busqueda/${id_usuario}`);
  }

  ActualizarUnEnrolado(datos: any) {
    return this.http.put(`${environment.url}/enrolados`, datos);
  }

  EliminarRegistro(id: number) {
    return this.http.delete(`${environment.url}/enrolados/eliminar/${id}`);
  }

  subirArchivoExcel(formData) {
    return this.http.post(`${environment.url}/enrolados/plantillaExcel/`, formData);
  }

  CrearXML(data: any) {
    return this.http.post(`${environment.url}/enrolados/xmlDownload`, data);
  }

  BuscarDatosEmpleado(usuario: string) {
    return this.http.get(`${environment.url}/enrolados/cargarDatos/${usuario}`);
  }

}