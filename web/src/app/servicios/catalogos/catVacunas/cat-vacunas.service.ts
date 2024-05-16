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
    return this.http.get<any>((localStorage.getItem('empresaURL') as string) + '/vacunasTipos');
  }
  CrearVacuna(Vacuna: any){
    console.log('Vacuna: ',Vacuna)
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/vacunasTipos/crearVacunas`, Vacuna).pipe(
      catchError(Vacuna)
    );
  }
  // METODO PARA ACTUALIZAR REGISTRO
  ActualizarVacuna(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/vacunasTipos`, datos)
    .pipe(catchError(datos));
  }
  eliminar(id: any){
    return this.http.delete<any>(`${(localStorage.getItem('empresaURL') as string)}/vacunasTipos/eliminar/${id}`).pipe( catchError(id));
  }
 

}
