import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class CatVacunasService {

  constructor(
    private http: HttpClient,
  ) { }

  listaVacuna(){
    return this.http.get<any>(environment.url + '/vacunasTipos');
  }
  // METODO PARA ACTUALIZAR REGISTRO
  ActualizarVacuna(datos: any) {
    return this.http.put(`${environment.url}/vacunasTipos`, datos)
    .pipe(catchError(datos));
  }
  eliminar(id: any){
    return this.http.delete<any>(`${environment.url}/vacunasTipos/eliminar/${id}`).pipe( catchError(id));
  }
 
   // METODO PARA LEER LOS DATOS DE LA PLANTILLA DE EXCEL
   RevisarFormato(formData) {
    return this.http.post<any>(environment.url + '/vacunasTipos/upload/revision', formData);
  }

  // METODO PARA INGRESAR O GUARDAR LOS DATOS OK EN LA BASE DE DATOS
  subirArchivoExcel(formData) {
    return this.http.post<any>(`${environment.url}/vacunasTipos/cargar_plantilla`, formData);
  }

}
