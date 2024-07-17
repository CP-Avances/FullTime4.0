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

  listaModalidad_laboral(){
    return this.http.get<any>((localStorage.getItem('empresaURL') as string) + '/modalidadLaboral');
  }
  
  CrearModalidadLaboral(modalidad: any){
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/modalidadLaboral/crearModalidad`, modalidad).pipe(
      catchError(modalidad)
    );
  }
  // METODO PARA ACTUALIZAR REGISTRO
  ActualizarModalidadLab(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/modalidadLaboral`, datos)
    .pipe(catchError(datos));
  }
  
  Eliminar(id: any, datos: any){
    const url = `${(localStorage.getItem('empresaURL') as string)}/modalidadLaboral/eliminar/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
  }

  RevisarFormato(formData) {
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/modalidadLaboral/upload/revision', formData);
  }

  SubirArchivoExcel(formData) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/modalidadLaboral/cargar_plantilla`, formData);
  }

}
