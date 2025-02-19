import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GenerosService {

  constructor(
    private http: HttpClient
  ) { }

   // METODO PARA LISTAR TITULOS   **USADO
   ListarGeneros() {
    return this.http.get(`${environment.url}/generos/`);
  }
}
