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

  // METODO PARA LISTAR TIPOS DE DISCAPACIDAD   **USADO
  ListarDiscapacidad() {
    return this.http.get<any>(environment.url + '/discapacidades');
  }

  // METODO PARA CREAR UN TIPO DE DISCAPACIDAD    **USADO
  CrearDiscapacidad(discapacidad: any) {
    return this.http.post(`${environment.url}/discapacidades/crearDiscapacidad`, discapacidad).pipe(
      catchError(discapacidad)
    );
  }

  // METODO PARA ACTUALIZAR REGISTRO    **USADO
  ActualizarDiscapacidad(datos: any) {
    return this.http.put(`${environment.url}/discapacidades`, datos)
      .pipe(catchError(datos));
  }

  // METODO PARA ELIMINAR UN TIPO DE DISCAPACIDAD   **USADO
  Eliminar(id: any, datos: any) {
    const url = `${environment.url}/discapacidades/eliminar/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
  }

  // METODO PARA LEER LOS DATOS DE LA PLANTILLA DE EXCEL   **USADO
  RevisarFormato(formData: any) {
    return this.http.post<any>(environment.url + '/discapacidades/upload/revision', formData);
  }

  // METODO PARA INGRESAR O GUARDAR LOS DATOS OK EN LA BASE DE DATOS    **USADO
  SubirArchivoExcel(formData: any) {
    return this.http.post<any>(`${environment.url}/discapacidades/cargar_plantilla`, formData);
  }


}
