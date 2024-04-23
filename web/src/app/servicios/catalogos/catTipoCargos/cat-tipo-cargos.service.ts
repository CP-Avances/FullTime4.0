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

  listaCargos(){
    return this.http.get<any>(environment.url + '/tipoCargos');
  }


  ActualizarCargo(datos: any) {
    return this.http.put(`${environment.url}/tipoCargos`, datos)
    .pipe(catchError(datos));
  }
  eliminar(id: any){
    return this.http.delete<any>(`${environment.url}/tipoCargos/eliminar/${id}`)
  }

  RevisarFormato(formData) {
    return this.http.post<any>(environment.url + '/tipoCargos/upload/revision', formData);
  }
  subirArchivoExcel(formData) {
    return this.http.post<any>(`${environment.url}/tipoCargos/cargar_plantilla`, formData);
  }

}
