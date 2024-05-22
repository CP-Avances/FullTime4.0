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
    return this.http.post(`${environment.url}/modalidadLaboral/crearModalidad`, modalidad).pipe(
      catchError(modalidad)
    );
  }
  // METODO PARA ACTUALIZAR REGISTRO
  ActualizarModalidadLab(datos: any) {
    return this.http.put(`${environment.url}/modalidadLaboral`, datos)
    .pipe(catchError(datos));
  }
  Eliminar(id: any, datos: any){
    const url = `${environment.url}/modalidadLaboral/eliminar/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
  }

  RevisarFormato(formData) {
    return this.http.post<any>(environment.url + '/modalidadLaboral/upload/revision', formData);
  }

  SubirArchivoExcel(formData) {
    return this.http.post<any>(`${environment.url}/modalidadLaboral/cargar_plantilla`, formData);
  }

}
