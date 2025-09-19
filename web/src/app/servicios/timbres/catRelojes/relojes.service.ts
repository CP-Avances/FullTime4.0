import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RelojesService {

  constructor(
    private http: HttpClient
  ) { }

  // METODO PARA LISTAR DISPOSITIVOS   **USADO**
  ConsultarRelojes() {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/relojes`);
  }

  // METODO PARA ELIMINAR REGISTRO   **USADO**
  EliminarRegistro(id: number, datos: any) {
    const url = `${(localStorage.getItem('empresaURL') as string)}/relojes/eliminar/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
  }

  // METODO PARA REGISTRAR DISPOSITIVO   **USADO**
  CrearNuevoReloj(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/relojes`, datos);
  }

  // METODO PARA ACTUALIZAR REGISTRO    **USADO**
  ActualizarDispositivo(datos: any) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/relojes`, datos);
  }

  // METODO PARA CONSULTAR DATOS GENERALES DE DISPOSITIVO   **USADO**
  ConsultarDatosId(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/relojes/datosReloj/${id}`);
  }

  // METODO PARA CONSULTAR DATOS DE UN BIOMETRICO   **USADO**
  ConsultarUnReloj(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/relojes/${id}`);
  }

  // METODO PARA CONTAR RELOJES   **USADO**
  ContarRelojes() {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/relojes/contar/biometricos`);
  }

  // METODO PARA REGISTRAR DATOS DE PLANTILLA    **USADO**
  SubirArchivoExcel(formData: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/relojes/plantillaExcel/`, formData);
  }

  // METODO PARA VERIFICAR DATOS DE PLANTILLA    **USADO**
  VerificarArchivoExcel(formData: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/relojes/upload/revision/`, formData);
  }

  // METODO PARA LISTAR ZONAS HORARIAS   **USADO**
  ConsultarZonasHorarias() {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/relojes/zonas_horarias/buscar`);
  }
}
