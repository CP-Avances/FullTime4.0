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
  CrearVacuna(Vacuna: any){
    return this.http.post(`${environment.url}/vacunasTipos/crearVacuna`, Vacuna).pipe(
      catchError(Vacuna)
    );
  }
  // METODO PARA ACTUALIZAR REGISTRO
  ActualizarVacuna(datos: any) {
    return this.http.put(`${environment.url}/vacunasTipos`, datos)
    .pipe(catchError(datos));
  }

  Eliminar(id: any, datos: any) {
    const url = `${environment.url}/vacunasTipos/eliminar/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
  }

   // METODO PARA LEER LOS DATOS DE LA PLANTILLA DE EXCEL
   RevisarFormato(formData) {
    return this.http.post<any>(environment.url + '/vacunasTipos/upload/revision', formData);
  }

  // METODO PARA INGRESAR O GUARDAR LOS DATOS OK EN LA BASE DE DATOS
  SubirArchivoExcel(formData) {
    return this.http.post<any>(`${environment.url}/vacunasTipos/cargar_plantilla`, formData);
  }

}
