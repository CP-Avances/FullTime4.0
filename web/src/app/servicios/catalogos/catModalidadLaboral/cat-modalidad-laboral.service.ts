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

  RevisarFormato(formData) {
    console.log('formDataDepartamentos: ',formData);
    return this.http.post<any>(environment.url + '/modalidadLaboral/upload/revision', formData);
  }
  subirArchivoExcel(formData) {
    return this.http.post<any>(`${environment.url}/modalidadLaboral/cargar_plantilla/`, formData);
  }

}
