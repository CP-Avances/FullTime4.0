import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CatGradoService {

  constructor(
    private http: HttpClient,
  ) { }

  // METODO DE CONSULTA DE GRADOS   **USADO
  ConsultarGrados() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/grado`);
  }

  // METODO PARA OBTENER GRADO DEL USUARIO   **USADO
  ObtenerGradoUsuario(id_empl: number) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/grado/infoGrado/${id_empl}`);
  }

  // METODO PARA INGRESAR REGISTRO  **USADO
  IngresarGrado(form: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/grado`, form)
  }

  // METODO PARA EDITAR REGISTRO  **USADO
  EditarGrado(form: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/grado/update`, form)
  }

  // METODO PARA ElIMINAR REGISTRO  **USADO
  ElminarGrado(form: any) {
    const httpOtions = {
      body: form
    };
    return this.http.delete(`${(localStorage.getItem('empresaURL') as string)}/grado/delete`, httpOtions)
  }

  // METODO PARA ELIMINAR GRADO POR EMPLEADO    **USADO
  EliminarGradoEmple(id: number, datos: any) {
    const url = `${(localStorage.getItem('empresaURL') as string)}/grado/deleteGradoEmple/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
  }

  // METODO PARA VERIIFCAR DATOS DE PLANTILLA   **USADO
  RevisarFormato(formData: any) {
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/grado/upload/revision', formData);
  }

  // METODO PARA REGISTAR LA PLANTILLA   **USADO
  RegistrarPlantilla(data: any) {
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/grado/cargar_plantilla', data);
  }

  // METODO PARA REGISTRAR EMPLEADOS - GRADOS   **USADO
  RegistroGrado(data: any) {
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/grado/registrarGrados', data)
  }

  // METODO PARA VERIIFCAR DATOS DE PLANTILLA   **USADO
  RevisarFormatoEmpleGrado(formData: any) {
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/grado/upload/revision_epleadoGrado', formData);
  }

  // METODO PARA REGISTRAR PLANTILLA DE EMPLEADO GRADOS   **USADO
  RegistrarPlantillaEmpleGrado(data: any) {
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/grado/cargar_plantilla/registro_epleadoGrado', data)
  }

  // METODO PARA VERIIFCAR DATOS DE PLANTILLA   **USADO
  ActualizarGradoEmple(formData: any) {
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/grado/actualizacionGrado', formData);
  }

  // METODO PARA ELIMINAR GRADO MULTIPLES     **USADO
  EliminarGradoMultiple(data: any) {
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/grado/eliminarGradoMult', data);
  }

}
