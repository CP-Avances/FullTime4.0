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

  // METODO PARA BUSCAR TIPO DE CARGO POR SU NOMBRE
  BuscarTipoCargoNombre(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/tipoCargos/buscar/tipo_cargo/nombre`, datos);
  }

  listaCargos() {
    return this.http.get<any>((localStorage.getItem('empresaURL') as string) + '/tipoCargos');
  }

  CrearCargo(cargo: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/tipoCargos/crearCargo`, cargo)
      .pipe(catchError(cargo));
  }

  ActualizarCargo(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/tipoCargos`, datos)
      .pipe(catchError(datos));
  }
  Eliminar(id: any, datos: any) {
    const url = `${(localStorage.getItem('empresaURL') as string)}/tipoCargos/eliminar/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
  }

  RevisarFormato(formData: any) {
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/tipoCargos/upload/revision', formData);
  }
  SubirArchivoExcel(formData: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/tipoCargos/cargar_plantilla`, formData);
  }

}
