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

  // METODO PARA INGRESAR REGISTRO  **USADO
  IngresarGrupoOcupacion(form: any){
    return this.http.post(`${environment.url}/grupoOcupacional`, form)
  }

  // METODO PARA EDITAR REGISTRO  **USADO
  EditarGrupoOcupacion(form: any){
    return this.http.put(`${environment.url}/grupoOcupacional/update`, form)
  }

  // METODO PARA ElIMINAR REGISTRO  **USADO
  ElminarGrupoOcupacion(form: any){
    const httpOtions = {
      body: form
    };
    return this.http.delete(`${environment.url}/grupoOcupacional/delete`, httpOtions)
  }

  // METODO PARA VERIIFCAR DATOS DE PLANTILLA   **USADO
  RevisarFormato(formData: any) {
    return this.http.post<any>(environment.url + '/grupoOcupacional/upload/revision', formData);
  }

  // METODO PARA REGISTAR LA PLANTILLA   **USADO
  RegistrarPlantilla(data: any) {
    return this.http.post<any>(environment.url + '/grupoOcupacional/cargar_plantilla', data);
  }

  RegistroGrupo(data: any){
    return this.http.post<any>(environment.url + '/grupoOcupacional/registrarGrupo', data)
  }

  // METODO PARA VERIIFCAR DATOS DE PLANTILLA   **USADO
  RevisarFormatoEmpleGrupoOcu(formData: any) {
    return this.http.post<any>(environment.url + '/grupoOcupacional/upload/revision_empleadoGrupoOcupacional', formData);
  }

  RegistrarPlantillaEmpleGrupoOcu(data: any) {
    console.log('data a enviar: ', data)
    return this.http.post<any>(environment.url + '/grupoOcupacional/cargar_plantilla/registro_empleadoGrupoOcupacional', data)
  }

}
