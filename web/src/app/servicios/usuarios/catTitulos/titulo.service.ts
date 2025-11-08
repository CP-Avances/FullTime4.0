import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TituloService {

  constructor(
    private http: HttpClient
  ) { }


  // METODO PARA LISTAR TITULOS   **USADO**
  ListarTitulos() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/titulo/`);
  }

  // METODO PARA BUSCAR EL NOMBRE DE UN TITULO PROFESIONAL   **USADO**
  BuscarTituloNombre(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/titulo/titulo-nombre`, data);
  }

  // METODO PARA ELIMINAR REGISTRO   **USADO**
  EliminarRegistro(id: any, datos: any) {
    const url = `${(localStorage.getItem('empresaURL') as string)}/titulo/eliminar/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions).pipe(catchError(id));
  }

  // METODO PARA REGISTRAR TITULO    **USADO**
  RegistrarTitulo(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/titulo`, data);
  }

  // METODO PARA ACTUALIZAR REGISTRO DE TITULO   **USADO**
  ActualizarUnTitulo(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/titulo`, datos);
  }

  // METODO DE VALIDACION DE DATOS DE PLANTILLA  **USADO**
  RevisarFormato(formData: any) {
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/titulo/upload/revision', formData);
  }

  // METODO PARA REGISTRAR TITULOS DE LA PLANTILLA   **USADO**
  RegistrarTitulosPlantilla(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/titulo/registrarTitulos`, data);
  }

}
