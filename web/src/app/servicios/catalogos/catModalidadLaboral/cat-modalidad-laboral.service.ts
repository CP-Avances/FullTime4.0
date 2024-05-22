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
  // METODO PARA REGISTRAR NIVEL DE TITULO
  RegistrarNivel(data: any) {
    return this.http.post<any>(`${environment.url}/nivel-titulo`, data);
  }
  CrearModalidadLaboral(modalidad: any){
    console.log('modalidad: ',modalidad)
    return this.http.post(`${environment.url}/modalidadLaboral/crearModalidad`, modalidad).pipe(
      catchError(modalidad)
    );
  }
  // METODO PARA ACTUALIZAR REGISTRO
  ActualizarModalidadLab(datos: any) {
    return this.http.put(`${environment.url}/modalidadLaboral`, datos)
    .pipe(catchError(datos));
  }
  eliminar(id: any){
    return this.http.delete<any>(`${environment.url}/modalidadLaboral/eliminar/${id}`).pipe( catchError(id));
  }
  RevisarFormato(formData) {
    return this.http.post<any>(environment.url + '/modalidadLaboral/upload/revision', formData);
  }
  subirArchivoExcel(formData) {
    return this.http.post<any>(`${environment.url}/modalidadLaboral/cargar_plantilla`, formData);
  }

}