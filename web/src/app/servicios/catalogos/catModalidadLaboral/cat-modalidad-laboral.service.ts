import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class CatModalidadLaboralService {

  constructor(
    private http: HttpClient,
  ) { }

  listaModalidad_laboral(){
    return this.http.get<any>(environment.url + '/modalidadLaboral');
  }
  CrearModalidadLaboral(modalidad: any){
    console.log('modalidad: ',modalidad)
    return this.http.post(`${environment.url}/modalidadLaboral/crearModalidad`, modalidad).pipe(
      catchError(modalidad)
    );
  }
  eliminar(id: any){
    return this.http.delete<any>(`${environment.url}/modalidadLaboral/eliminar/${id}`)
  }
  RevisarFormato(formData) {
    return this.http.post<any>(environment.url + '/modalidadLaboral/upload/revision', formData);
  }
  subirArchivoExcel(formData) {
    return this.http.post<any>(`${environment.url}/modalidadLaboral/cargar_plantilla`, formData);
  }

}
