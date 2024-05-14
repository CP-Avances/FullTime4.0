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

  

  listaDiscapacidad(){
    return this.http.get<any>(environment.url + '/discapacidades');
  }
  CrearDiscapacidad(discapacidad: any){
    console.log('discapacidad: ',discapacidad)
    return this.http.post(`${environment.url}/discapacidades/crearDiscapacidad`, discapacidad).pipe(
      catchError(discapacidad)
    );
  }
  // METODO PARA ACTUALIZAR REGISTRO
  ActualizarDiscapacidad(datos: any) {
    return this.http.put(`${environment.url}/discapacidades`, datos)
    .pipe(catchError(datos));
  }
  eliminar(id: any){
    return this.http.delete<any>(`${environment.url}/discapacidades/eliminar/${id}`).pipe( catchError(id));
  }
 

}
