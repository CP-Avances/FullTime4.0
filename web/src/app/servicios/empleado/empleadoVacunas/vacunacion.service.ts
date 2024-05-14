import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

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

  // SERVICIO REGISTROS DE VACUNACIÓN
  RegistrarVacunacion(data: any) {
    return this.http.post<any>(`${environment.url}/vacunas`, data);
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
  EliminarRegistroVacuna(id: number, documento: string, datos: any) {
    const url = `${environment.url}/vacunas/eliminar/${id}/${documento}`;
    const httpOptions = {
      body: datos
    };
    return this.http.request('delete', url, httpOptions);
  }

  // METODO DE REGISTROS DE TIPO DE VACUNACION
  CrearTipoVacuna(data: any) {
    return this.http.post<any>(`${environment.url}/vacunas/tipo_vacuna`, data);
  }


}
