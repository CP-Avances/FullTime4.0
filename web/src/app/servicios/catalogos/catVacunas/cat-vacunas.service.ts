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

  listaVacuna(){
    return this.http.get<any>((localStorage.getItem('empresaURL') as string) + '/vacunasTipos');
  }
  CrearVacuna(Vacuna: any){
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/vacunasTipos/crearVacuna`, Vacuna).pipe(
      catchError(Vacuna)
    );
  }
  // METODO PARA ACTUALIZAR REGISTRO
  ActualizarVacuna(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/vacunasTipos`, datos)
    .pipe(catchError(datos));
  }

  Eliminar(id: any, datos: any) {
    const url = `${(localStorage.getItem('empresaURL') as string)}/vacunasTipos/eliminar/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
  }

   // METODO PARA LEER LOS DATOS DE LA PLANTILLA DE EXCEL
   RevisarFormato(formData) {
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/vacunasTipos/upload/revision', formData);
  }

  // METODO PARA INGRESAR O GUARDAR LOS DATOS OK EN LA BASE DE DATOS
  SubirArchivoExcel(formData) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/vacunasTipos/cargar_plantilla`, formData);
  }

}
