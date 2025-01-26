import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CatGrupoOcupacionalService {

  constructor(
    private http: HttpClient,
  ) { }

// catalogo de Grupo Ocupacional
  ConsultarGrupoOcupacion() {
    return this.http.get(`${environment.url}/grupoOcupacional`);
  }

  IngresarGrupoOcupacion(form: any){
    return this.http.post(`${environment.url}/grupoOcupacional`, form)
  }

  EditarGrupoOcupacion(form: any){
    return this.http.put(`${environment.url}/grupoOcupacional/update`, form)
  }

  ElminarGrupoOcupacion(form: any){
    const httpOtions = {
      body: form
    };
    return this.http.delete(`${environment.url}/grupoOcupacional/delete`, httpOtions)
  }

}
