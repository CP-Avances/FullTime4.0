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
    return this.http.get<any>((localStorage.getItem('empresaURL') as string) + '/tipoCargos');
  }
  
  CrearCargo(cargo: any){
    console.log('cargo: ',cargo)
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/tipoCargos/crearCargo`, cargo)
    .pipe(catchError(cargo));
  }

  ActualizarCargo(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/tipoCargos`, datos)
    .pipe(catchError(datos));
  }
  eliminar(id: any){
    return this.http.delete<any>(`${(localStorage.getItem('empresaURL') as string)}/tipoCargos/eliminar/${id}`)
  }

  RevisarFormato(formData) {
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/tipoCargos/upload/revision', formData);
  }
  subirArchivoExcel(formData) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/tipoCargos/cargar_plantilla`, formData);
  }

}
