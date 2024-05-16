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
    return this.http.get<any>((localStorage.getItem('empresaURL') as string) + '/modalidadLaboral');
  }
  // METODO PARA REGISTRAR NIVEL DE TITULO
  RegistrarNivel(data: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/nivel-titulo`, data);
  }
  CrearModalidadLaboral(modalidad: any){
    console.log('modalidad: ',modalidad)
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/modalidadLaboral/crearModalidad`, modalidad).pipe(
      catchError(modalidad)
    );
  }
  // METODO PARA ACTUALIZAR REGISTRO
  ActualizarModalidadLab(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/modalidadLaboral`, datos)
    .pipe(catchError(datos));
  }
  eliminar(id: any){
    return this.http.delete<any>(`${(localStorage.getItem('empresaURL') as string)}/modalidadLaboral/eliminar/${id}`).pipe( catchError(id));
  }
  RevisarFormato(formData) {
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/modalidadLaboral/upload/revision', formData);
  }
  subirArchivoExcel(formData) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/modalidadLaboral/cargar_plantilla`, formData);
  }

}
