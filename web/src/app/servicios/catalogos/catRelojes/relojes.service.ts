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
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/relojes`);
  }

  // METODO PARA ELIMINAR REGISTRO
  EliminarRegistro(id: any) {
    return this.http.delete(`${(localStorage.getItem('empresaURL') as string)}/relojes/eliminar/${id}`).pipe(catchError(id));
  }

  // METODO PARA CREAR ARCHIVO XML
  CrearXML(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/relojes/xmlDownload`, data);
  }

  // METODO PARA REGISTRAR DISPOSITIVO
  CrearNuevoReloj(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/relojes`, datos);
  }

  // METODO PARA ACTUALIZAR REGISTRO
  ActualizarDispositivo(datos: any) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/relojes`, datos);
  }

  // METODO PARA CONSULTAR DATOS GENERALES DE DISPOSITIVO
  ConsultarDatosId(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/relojes/datosReloj/${id}`);
  }

  // METODO PARA CREAR ARCHIVO XML
  CrearXMLIdDispositivos(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/relojes/xmlDownloadIdDispositivos`, data);
  }










  ConsultarUnReloj(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/relojes/${id}`);
  }













  // METODOs para verificar datos de plantilla antes de registralos en el sistema
  subirArchivoExcel(formData) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/relojes/plantillaExcel/`, formData);
  }

  Verificar_Datos_ArchivoExcel(formData) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/relojes/verificar_datos/plantillaExcel/`, formData);
  }

  VerificarArchivoExcel(formData) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/relojes/verificar_plantilla/plantillaExcel/`, formData);
  }
}
