import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NivelTitulosService {

  constructor(
    private http: HttpClient
  ) { }

  // METODO PARA LISTAR NIVEL DE TITULO PROFESIONAL   **USADO
  ListarNiveles() {
    return this.http.get<any>(`${environment.url}/nivel-titulo/`);
  }

  // ELIMIAR REGISTRO   **USADO
  EliminarNivel(id: any, datos: any) {
    const url = `${environment.url}/nivel-titulo/eliminar/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions).pipe(catchError(id));
  }
  // METODO PARA REGISTRAR NIVEL DE TITULO    **USADO
  RegistrarNivel(data: any) {
    return this.http.post<any>(`${environment.url}/nivel-titulo`, data);
  }

  // METODO PARA ACTUALIZAR REGISTRO DE NIVEL   **USADO
  ActualizarNivelTitulo(datos: any) {
    return this.http.put(`${environment.url}/nivel-titulo`, datos);
  }

  // METODO PARA BUSCAR NIVEL POR SU NOMBRE   **USADO
  BuscarNivelNombre(nombre: string) {
    return this.http.get<any>(`${environment.url}/nivel-titulo/buscar/${nombre}`);
  }

  // METODO PARA VERIIFCAR DATOS DE PLANTILLA   **USADO
  RevisarFormato(formData: any) {
    return this.http.post<any>(environment.url + '/nivel-titulo/upload/revision', formData);
  }

  // METODO PARA REGISTAR LOS NIVELES DE TITULO DE LA PLANTILLA   **USADO
  RegistrarNivelesPlantilla(data: any) {
    return this.http.post<any>(environment.url + '/nivel-titulo/registrarNiveles', data);
  }

}
