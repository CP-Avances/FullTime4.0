import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RelojesService {

  constructor(
    private http: HttpClient
  ) { }

  // METODO PARA LISTAR DISPOSITIVOS   **USADO
  ConsultarRelojes() {
    return this.http.get<any>(`${environment.url}/relojes`);
  }

  // METODO PARA ELIMINAR REGISTRO   **USADO
  EliminarRegistro(id: number, datos: any) {
    const url = `${environment.url}/relojes/eliminar/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
  }

  // METODO PARA REGISTRAR DISPOSITIVO   **USADO
  CrearNuevoReloj(datos: any) {
    return this.http.post<any>(`${environment.url}/relojes`, datos);
  }

  // METODO PARA ACTUALIZAR REGISTRO    **USADO
  ActualizarDispositivo(datos: any) {
    return this.http.put<any>(`${environment.url}/relojes`, datos);
  }

  // METODO PARA CONSULTAR DATOS GENERALES DE DISPOSITIVO   **USADO
  ConsultarDatosId(id: number) {
    return this.http.get(`${environment.url}/relojes/datosReloj/${id}`);
  }

  // METODO PARA CONSULTAR DATOS DE UN BIOMETRICO   **USADO
  ConsultarUnReloj(id: number) {
    return this.http.get(`${environment.url}/relojes/${id}`);
  }

  // METODO PARA CONTAR RELOJES   **USADO
  ContarRelojes() {
    return this.http.get<any>(`${environment.url}/relojes/contar/biometricos`);
  }

  // METODO PARA REGISTRAR DATOS DE PLANTILLA    **USADO
  SubirArchivoExcel(formData: any) {
    return this.http.post<any>(`${environment.url}/relojes/plantillaExcel/`, formData);
  }

  // METODO PARA VERIFICAR DATOS DE PLANTILLA    **USADO
  VerificarArchivoExcel(formData: any) {
    return this.http.post<any>(`${environment.url}/relojes/upload/revision/`, formData);
  }

  // METODO PARA LISTAR ZONAS HORARIAS   **USADO
  ConsultarZonasHorarias() {
    return this.http.get<any>(`${environment.url}/relojes/zonas_horarias/buscar`);
  }
}
