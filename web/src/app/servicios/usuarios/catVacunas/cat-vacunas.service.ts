import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CatVacunasService {

  constructor(
    private http: HttpClient,
  ) { }

  // METODO PARA LISTAR TIPO DE VACUNA  **USADO**
  ListaVacuna() {
    return this.http.get<any>((localStorage.getItem('empresaURL') as string) + '/vacunasTipos');
  }

  // METODO PARA REGISTRAR UN TIPO DE VACUNA  **USADO**
  CrearVacuna(Vacuna: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/vacunasTipos/crearVacuna`, Vacuna).pipe(
      catchError(Vacuna)
    );
  }

  // METODO PARA ACTUALIZAR REGISTRO TIPO VACUNA  **USADO**
  ActualizarVacuna(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/vacunasTipos`, datos)
      .pipe(catchError(datos));
  }

  // METODO DE ELIMINACION DE REGISTROS  **USADO**
  Eliminar(id: any, datos: any) {
    const url = `${(localStorage.getItem('empresaURL') as string)}/vacunasTipos/eliminar/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
  }

  // METODO PARA LEER LOS DATOS DE LA PLANTILLA DE EXCEL   **USADO**
  RevisarFormato(formData: any) {
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/vacunasTipos/upload/revision', formData);
  }

  // METODO PARA INGRESAR O GUARDAR LOS DATOS OK EN LA BASE DE DATOS   **USADO**
  SubirArchivoExcel(formData: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/vacunasTipos/cargar_plantilla`, formData);
  }

}
