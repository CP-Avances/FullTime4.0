import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

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
  
  // METODO PARA REGISTRAR UNA MODALIDAD LABORAL   **USADO
  CrearModalidadLaboral(modalidad: any){
    return this.http.post(`${environment.url}/modalidadLaboral/crearModalidad`, modalidad).pipe(
      catchError(modalidad)
    );
  }
  
  // METODO PARA ACTUALIZAR REGISTRO    **USADO
  ActualizarModalidadLab(datos: any) {
    return this.http.put(`${environment.url}/modalidadLaboral`, datos)
    .pipe(catchError(datos));
  }
  
  // METODO PARA ELIMINAR DATOS
  Eliminar(id: any, datos: any){
    const url = `${environment.url}/modalidadLaboral/eliminar/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
  }

  // METODO PARA REVISAR DATOS DE PLANTILLA  **USADO
  RevisarFormato(formData: any) {
    return this.http.post<any>(environment.url + '/modalidadLaboral/upload/revision', formData);
  }
Ç
// METODO PARA SUBR DATOS AL SISTEMA    **USADO
  SubirArchivoExcel(formData: any) {
    return this.http.post<any>(`${environment.url}/modalidadLaboral/cargar_plantilla`, formData);
  }

}
