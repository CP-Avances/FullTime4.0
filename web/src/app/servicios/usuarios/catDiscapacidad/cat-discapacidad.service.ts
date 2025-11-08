import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class CatDiscapacidadService {

  constructor(
    private http: HttpClient,
  ) { }

  // METODO PARA LISTAR TIPOS DE DISCAPACIDAD   **USADO**
  ListarDiscapacidad() {
    return this.http.get<any>((localStorage.getItem('empresaURL') as string)+ '/discapacidades');
  }

  // METODO PARA CREAR UN TIPO DE DISCAPACIDAD    **USADO**
  CrearDiscapacidad(discapacidad: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/discapacidades/crearDiscapacidad`, discapacidad).pipe(
      catchError(discapacidad)
    );
  }

  // METODO PARA ACTUALIZAR REGISTRO    **USADO**
  ActualizarDiscapacidad(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/discapacidades`, datos)
      .pipe(catchError(datos));
  }

  // METODO PARA ELIMINAR UN TIPO DE DISCAPACIDAD   **USADO**
  Eliminar(id: any, datos: any) {
    const url = `${(localStorage.getItem('empresaURL') as string)}/discapacidades/eliminar/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
  }

  // METODO PARA LEER LOS DATOS DE LA PLANTILLA DE EXCEL   **USADO**
  RevisarFormato(formData: any) {
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/discapacidades/upload/revision', formData);
  }

  // METODO PARA INGRESAR O GUARDAR LOS DATOS OK EN LA BASE DE DATOS    **USADO**
  SubirArchivoExcel(formData: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/discapacidades/cargar_plantilla`, formData);
  }


}
