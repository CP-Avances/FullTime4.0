import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VacunacionService {

  constructor(
    private http: HttpClient,

  ) { }

  // METODO PARA BUSCAR REGISTROS DE VACUNA DE UN EMPLEADO
  ObtenerVacunaEmpleado(id_empleado: number) {
    return this.http.get(`${environment.url}/vacunas/${id_empleado}`);
  }

  // LISTAR TIPO DE VACUNAS
  ListarTiposVacuna() {
    return this.http.get(`${environment.url}/vacunas/lista/tipo_vacuna`);
  }

  // SERVICIO REGISTROS DE VACUNACION
  RegistrarVacunacion(data: any) {
    return this.http.post<any>(`${environment.url}/vacunas`, data);
  }

  // SERVICIO PARA BUSCAR VACUNA FECHA - TIPO
  BuscarVacunaFechaTipo(data: any) {
    return this.http.post<any>(`${environment.url}/vacunas/fecha_nombre/tipo_vacuna`, data);
  }

  // METODO PARA SUBIR UN DOCUMENTO
  SubirDocumento(formData: any, id: number, nombre: string) {
    return this.http.put(`${environment.url}/vacunas/${id}/documento/${nombre}`, formData)
  }

  // METODO PARA ACTUALIZAR REGISTRO
  ActualizarVacunacion(id: number, data: any) {
    return this.http.put(`${environment.url}/vacunas/${id}`, data);
  }

  // ELIMINAR CARNET DE VACUNA DEL SERVIDOR
  EliminarArchivoServidor(datos: any) {
    return this.http.put(`${environment.url}/vacunas/eliminar_carnet/servidor`, datos)
  }

  // ELIMINAR CARNET DE VACUNA
  EliminarArchivo(datos: any) {
    return this.http.put(`${environment.url}/vacunas/eliminar_carnet/base_servidor`, datos)
  }

  // METODO PARA ELIMINAR REGISTRO VACUNA EMPLEADO
  EliminarRegistroVacuna(id: number, documento: string) {
    return this.http.delete(`${environment.url}/vacunas/eliminar/${id}/${documento}`);
  }

  // METODO DE REGISTROS DE TIPO DE VACUNACION
  CrearTipoVacuna(data: any) {
    return this.http.post<any>(`${environment.url}/vacunas/tipo_vacuna`, data).pipe(catchError(data));
  }

  // METODO DE REGISTROS DE TIPO DE VACUNACION
  BuscarVacunaNombre(data: any) {
    return this.http.post<any>(`${environment.url}/vacunas/tipo_vacuna/nombre`, data);
  }

}
