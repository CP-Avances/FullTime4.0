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

  // METODO PARA INGRESAR REGISTRO  **USADO
  IngresarGrado(form: any){
    return this.http.post(`${environment.url}/grado`, form)
  }

  // METODO PARA EDITAR REGISTRO  **USADO
  EditarGrado(form: any){
    return this.http.put(`${environment.url}/grado/update`, form)
  }

  // METODO PARA ElIMINAR REGISTRO  **USADO
  ElminarGrado(form: any){
    const httpOtions = {
      body: form
    };
    return this.http.delete(`${environment.url}/grado/delete`, httpOtions)
  }

   // METODO PARA VERIIFCAR DATOS DE PLANTILLA   **USADO
   RevisarFormato(formData: any) {
    return this.http.post<any>(environment.url + '/grado/upload/revision', formData);
  }

  // METODO PARA REGISTAR LA PLANTILLA   **USADO
  RegistrarPlantilla(data: any) {
    return this.http.post<any>(environment.url + '/grado/cargar_plantilla', data);
  }

  RegistroGrado(data: any){
    return this.http.post<any>(environment.url + '/grado/registrarGrados', data)
  }

  // METODO PARA VERIIFCAR DATOS DE PLANTILLA   **USADO
  RevisarFormatoEmpleGrado(formData: any) {
    return this.http.post<any>(environment.url + '/grado/upload/revision_epleadoGrado', formData);
  }

  RegistrarPlantillaEmpleGrado(data: any) {
    console.log('data a enviar: ', data)
    return this.http.post<any>(environment.url + '/grado/cargar_plantilla/registro_epleadoGrado', data)
  }

}
