import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class VacunacionService {

  constructor(
    private http: HttpClient,

  ) { }

  // METODO PARA BUSCAR REGISTROS DE VACUNA DE UN EMPLEADO   **USADO
  ObtenerVacunaEmpleado(id_empleado: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/vacunas/${id_empleado}`);
  }

  // LISTAR TIPO DE VACUNAS    **USADO
  ListarTiposVacuna() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/vacunas/lista/tipo_vacuna`);
  }

  // SERVICIO REGISTROS DE VACUNACION   **USADO
  RegistrarVacunacion(data: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/vacunas`, data);
  }

  // SERVICIO PARA BUSCAR VACUNA FECHA - TIPO   **USADO
  BuscarVacunaFechaTipo(data: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/vacunas/fecha_nombre/tipo_vacuna`, data);
  }

  // METODO PARA SUBIR UN DOCUMENTO    **USADO
  SubirDocumento(formData: any, id: number, id_empleado: any) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/vacunas/${id}/documento/${id_empleado}`, formData)
  }

  // METODO PARA ACTUALIZAR REGISTRO   **USADO
  ActualizarVacunacion(id: number, data: any) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/vacunas/${id}`, data);
  }

  // ELIMINAR CARNET DE VACUNA DEL SERVIDOR    **USADO
  EliminarArchivoServidor(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/vacunas/eliminar_carnet/servidor`, datos)
  }

  // ELIMINAR CARNET DE VACUNA    **USADO
  EliminarArchivo(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/vacunas/eliminar_carnet/base_servidor`, datos)
  }

  // METODO PARA ELIMINAR REGISTRO VACUNA EMPLEADO    **USADO
  EliminarRegistroVacuna(id: number, documento: string, datos: any) {
    const url = `${(localStorage.getItem('empresaURL') as string)}/vacunas/eliminar/${id}/${documento}`;
    const httpOptions = {
      body: datos
    };
    return this.http.request('delete', url, httpOptions);
  }

}
