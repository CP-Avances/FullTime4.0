import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class CatTipoCargosService {

  constructor(
    private http: HttpClient,
  ) { }

  // METODO PARA BUSCAR TIPO DE CARGO POR SU NOMBRE    **USADO**
  BuscarTipoCargoNombre(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/tipoCargos/buscar/tipo_cargo/nombre`, datos);
  }

  // METODO PARA LISTAR TIPO DE CARGOS   **USADO**
  ListaCargos() {
    return this.http.get<any>((localStorage.getItem('empresaURL') as string) + '/tipoCargos');
  }

  // METODO DE CEACION DE TIPO DE CARGOS   **USADO**
  CrearCargo(cargo: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/tipoCargos/crearCargo`, cargo)
      .pipe(catchError(cargo));
  }

  // METODO PARA ACTUALIZAR REGISTRO DE TIPO DE CARGO    **USADO**
  ActualizarCargo(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/tipoCargos`, datos)
      .pipe(catchError(datos));
  }

  // METODO PARA EIMINAR REGISTROS    **USADO**
  Eliminar(id: any, datos: any) {
    const url = `${(localStorage.getItem('empresaURL') as string)}/tipoCargos/eliminar/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
  }

  // METODO PARA REVISAR DATOS DE PLANTILLA   **USADO**
  RevisarFormato(formData: any) {
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/tipoCargos/upload/revision', formData);
  }

  // METODO PARA SUBIR DATOS AL SISTEMA   **USADO**
  SubirArchivoExcel(formData: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/tipoCargos/cargar_plantilla`, formData);
  }

}
