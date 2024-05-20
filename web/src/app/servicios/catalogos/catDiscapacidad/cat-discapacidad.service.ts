import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class CatDiscapacidadService {

  constructor(
    private http: HttpClient,
  ) { }

  // METODO PARA LISTAR TIPOS DE DISCAPACIDAD
  ListarDiscapacidad() {
    return this.http.get<any>(environment.url + '/discapacidades');
  }

  // METODO PARA CREAR UN TIPO DE DISCAPACIDAD
  CrearDiscapacidad(discapacidad: any) {
    return this.http.post(`${environment.url}/discapacidades/crearDiscapacidad`, discapacidad).pipe(
      catchError(discapacidad)
    );
  }

  // METODO PARA ACTUALIZAR REGISTRO
  ActualizarDiscapacidad(datos: any) {
    return this.http.put(`${environment.url}/discapacidades`, datos)
      .pipe(catchError(datos));
  }

  // METODO PARA ELIMINAR UN TIPO DE DISCAPACIDAD
  Eliminar(id: any) {
    return this.http.delete<any>(`${environment.url}/discapacidades/eliminar/${id}`).pipe(catchError(id));
  }

  // METODO PARA LEER LOS DATOS DE LA PLANTILLA DE EXCEL
  RevisarFormato(formData) {
    return this.http.post<any>(environment.url + '/discapacidades/upload/revision', formData);
  }

  // METODO PARA INGRESAR O GUARDAR LOS DATOS OK EN LA BASE DE DATOS
  subirArchivoExcel(formData) {
    return this.http.post<any>(`${environment.url}/discapacidades/cargar_plantilla`, formData);
  }


}
