import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CatModalidadLaboralService {

  constructor(
    private http: HttpClient,
  ) { }

  // METODO PARA LISTAR REGISTROS DE MODALIDAD LABORAL   **USADO**
  listaModalidad_laboral(){
    return this.http.get<any>((localStorage.getItem('empresaURL') as string) + '/modalidadLaboral');
  }

  // METODO PARA REGISTRAR UNA MODALIDAD LABORAL   **USADO**
  CrearModalidadLaboral(modalidad: any){
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/modalidadLaboral/crearModalidad`, modalidad).pipe(
      catchError(modalidad)
    );
  }

  // METODO PARA ACTUALIZAR REGISTRO    **USADO**
  ActualizarModalidadLab(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/modalidadLaboral`, datos)
    .pipe(catchError(datos));
  }

  // METODO PARA ELIMINAR DATOS DE MODALIDAD LABORAL  **USADO**
  Eliminar(id: any, datos: any){
    const url = `${(localStorage.getItem('empresaURL') as string)}/modalidadLaboral/eliminar/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
  }

  // METODO PARA REVISAR DATOS DE PLANTILLA  **USADO**
  RevisarFormato(formData: any) {
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/modalidadLaboral/upload/revision', formData);
  }

  // METODO PARA SUBR DATOS AL SISTEMA    **USADO**
  SubirArchivoExcel(formData: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/modalidadLaboral/cargar_plantilla`, formData);
  }

}
