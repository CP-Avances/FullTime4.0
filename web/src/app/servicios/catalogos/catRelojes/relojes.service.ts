import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment'
import { catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RelojesService {

  constructor(
    private http: HttpClient
  ) { }

  // METODO PARA LISTAR DISPOSITIVOS
  ConsultarRelojes() {
    return this.http.get(`${environment.url}/relojes`);
  }

  // METODO PARA ELIMINAR REGISTRO
  EliminarRegistro(id: any) {
    return this.http.delete(`${environment.url}/relojes/eliminar/${id}`).pipe(catchError(id));
  }

  // METODO PARA REGISTRAR DISPOSITIVO
  CrearNuevoReloj(datos: any) {
    return this.http.post<any>(`${environment.url}/relojes`, datos);
  }

  // METODO PARA ACTUALIZAR REGISTRO
  ActualizarDispositivo(datos: any) {
    return this.http.put<any>(`${environment.url}/relojes`, datos);
  }

  // METODO PARA CONSULTAR DATOS GENERALES DE DISPOSITIVO
  ConsultarDatosId(id: number) {
    return this.http.get(`${environment.url}/relojes/datosReloj/${id}`);
  }

  // METODO PARA CREAR ARCHIVO XML
  CrearXMLIdDispositivos(data: any) {
    return this.http.post(`${environment.url}/relojes/xmlDownloadIdDispositivos`, data);
  }

  ConsultarUnReloj(id: number) {
    return this.http.get(`${environment.url}/relojes/${id}`);
  }

  // METODOs para verificar datos de plantilla antes de registralos en el sistema
  subirArchivoExcel(formData) {
    return this.http.post<any>(`${environment.url}/relojes/plantillaExcel/`, formData);
  }

  Verificar_Datos_ArchivoExcel(formData) {
    return this.http.post<any>(`${environment.url}/relojes/verificar_datos/plantillaExcel/`, formData);
  }

  VerificarArchivoExcel(formData) {
    return this.http.post<any>(`${environment.url}/relojes/verificar_plantilla/plantillaExcel/`, formData);
  }
}
