import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CatGradoService {

  constructor(
      private http: HttpClient,
    ) { }

  // catalogo de Grado
  ConsultarGrados() {
    return this.http.get(`${environment.url}/grado`);
  }

  IngresarGrado(form: any){
    return this.http.post(`${environment.url}/grado`, form)
  }

  EditarGrado(form: any){
    return this.http.put(`${environment.url}/grado/update`, form)
  }

  ElminarGrado(form: any){
    const httpOtions = {
      body: form
    };
    return this.http.delete(`${environment.url}/grado/delete`, httpOtions)
  }

   // METODO PARA VERIIFCAR DATOS DE PLANTILLA   **USADO
   RevisarFormato(formData: any) {
    console.log('enro aqui ',formData)
    return this.http.post<any>(environment.url + '/grado/upload/revision', formData);
  }

}
