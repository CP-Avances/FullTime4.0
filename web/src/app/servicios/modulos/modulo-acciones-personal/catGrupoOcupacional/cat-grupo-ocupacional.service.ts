import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CatGrupoOcupacionalService {

  constructor(
    private http: HttpClient,
  ) { }

// catalogo de Grupo Ocupacional
  ConsultarGrupoOcupacion() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/grupoOcupacional`);
  }

  // METODO PARA OBTENER GRUPO OCUPACIONAL DEL USUARIO   **USADO
  ObtenerGrupoUsuario(id_empl: number) {
    console.log('id_empleado: ',id_empl)
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/grupoOcupacional/infoGrupo/${id_empl}`);
  }

  // METODO PARA INGRESAR REGISTRO  **USADO
  IngresarGrupoOcupacion(form: any){
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/grupoOcupacional`, form)
  }

  // METODO PARA EDITAR REGISTRO  **USADO
  EditarGrupoOcupacion(form: any){
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/grupoOcupacional/update`, form)
  }

  // METODO PARA ElIMINAR REGISTRO  **USADO
  ElminarGrupoOcupacion(form: any){
    const httpOtions = {
      body: form
    };
    return this.http.delete(`${(localStorage.getItem('empresaURL') as string)}/grupoOcupacional/delete`, httpOtions)
  }

  // METODO PARA ELIMINAR GRUPO OCUPACIONAL POR EMPLEADO **USADO
  EliminarGrupoOcupaEmple(id: number, datos: any){
    const url = `${(localStorage.getItem('empresaURL') as string)}/grupoOcupacional/deleteGrupoOcupacional/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
  }

  // METODO PARA VERIIFCAR DATOS DE PLANTILLA   **USADO
  RevisarFormato(formData: any) {
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/grupoOcupacional/upload/revision', formData);
  }

  // METODO PARA REGISTAR LA PLANTILLA   **USADO
  RegistrarPlantilla(data: any) {
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/grupoOcupacional/cargar_plantilla', data);
  }

  RegistroGrupo(data: any){
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/grupoOcupacional/registrarGrupo', data)
  }

  // METODO PARA VERIIFCAR DATOS DE PLANTILLA   **USADO
  RevisarFormatoEmpleGrupoOcu(formData: any) {
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/grupoOcupacional/upload/revision_empleadoGrupoOcupacional', formData);
  }

  RegistrarPlantillaEmpleGrupoOcu(data: any) {
    console.log('data a enviar: ', data)
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/grupoOcupacional/cargar_plantilla/registro_empleadoGrupoOcupacional', data)
  }

  // METODO PARA VERIIFCAR DATOS DE PLANTILLA   **USADO
  ActualizarGrupoEmple(formData: any) {
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/grupoOcupacional/actualizacionGrupo', formData);
  }

  // METODO PARA ELIMINAR GRUPOS OCUPACIONALES MULTIPLES
  EliminarGrupoMult(data: any){
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/grupoOcupacional/eliminarGrupoOcuMult', data);
  }

}
