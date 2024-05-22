import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class CatTipoCargosService {

  constructor(
    private http: HttpClient,
  ) { }

  // METODO PARA BUSCAR TIPO DE CARGO POR SU NOMBRE
  BuscarTipoCargoNombre(datos: any) {
    return this.http.post<any>(`${environment.url}/tipoCargos/buscar/tipo_cargo/nombre`, datos);
  }



  listaCargos() {
    return this.http.get<any>(environment.url + '/tipoCargos');
  }

  CrearCargo(cargo: any) {
    return this.http.post(`${environment.url}/tipoCargos/crearCargo`, cargo)
      .pipe(catchError(cargo));
  }

  ActualizarCargo(datos: any) {
    return this.http.put(`${environment.url}/tipoCargos`, datos)
      .pipe(catchError(datos));
  }
  Eliminar(id: any, datos: any) {
    const url = `${environment.url}/tipoCargos/eliminar/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
  }

  RevisarFormato(formData: any) {
    return this.http.post<any>(environment.url + '/tipoCargos/upload/revision', formData);
  }
  SubirArchivoExcel(formData: any) {
    return this.http.post<any>(`${environment.url}/tipoCargos/cargar_plantilla`, formData);
  }




}
