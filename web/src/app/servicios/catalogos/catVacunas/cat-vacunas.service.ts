import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class CatVacunasService {

  constructor(
    private http: HttpClient,
  ) { }

  

  listaVacuna(){
    return this.http.get<any>(environment.url + '/vacunasTipos');
  }
  CrearVacuna(Vacuna: any){
    console.log('Vacuna: ',Vacuna)
    return this.http.post(`${environment.url}/vacunasTipos/crearVacunas`, Vacuna).pipe(
      catchError(Vacuna)
    );
  }
  // METODO PARA ACTUALIZAR REGISTRO
  ActualizarVacuna(datos: any) {
    return this.http.put(`${environment.url}/vacunasTipos`, datos)
    .pipe(catchError(datos));
  }
  eliminar(id: any){
    return this.http.delete<any>(`${environment.url}/vacunasTipos/eliminar/${id}`).pipe( catchError(id));
  }
 

}
