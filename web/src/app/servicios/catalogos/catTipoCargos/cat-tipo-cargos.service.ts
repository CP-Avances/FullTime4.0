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

  // METODO PARA LISTAR TIPO DE CARGOS   **USADO
  ListaCargos() {
    return this.http.get<any>(environment.url + '/tipoCargos');
  }

  // METODO DE CEACION DE TIPO DE CARGOS   **USADO
  CrearCargo(cargo: any) {
    return this.http.post(`${environment.url}/tipoCargos/crearCargo`, cargo)
      .pipe(catchError(cargo));
  }

  // METODO PARA ACTUALIZAR REGISTRO DE TIPO DE CARGO    **USADO
  ActualizarCargo(datos: any) {
    return this.http.put(`${environment.url}/tipoCargos`, datos)
      .pipe(catchError(datos));
  }

  // METODO PARA EIMINAR REGISTROS    **USADO
  Eliminar(id: any, datos: any) {
    const url = `${environment.url}/tipoCargos/eliminar/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
  }

  // METODO PARA REVISAR DATOS DE PLANTILLA   **USADO
  RevisarFormato(formData: any) {
    return this.http.post<any>(environment.url + '/tipoCargos/upload/revision', formData);
  }

  // METODO PARA SUBOR DATOS AL SISTEMA   **USADO
  SubirArchivoExcel(formData: any) {
    return this.http.post<any>(`${environment.url}/tipoCargos/cargar_plantilla`, formData);
  }

}
