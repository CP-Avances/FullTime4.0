import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';;

@Injectable({
  providedIn: 'root'
})

export class HorarioService {

  constructor(
    private http: HttpClient,
  ) { }

  // REGISTRAR HORARIO     **USADO
  RegistrarHorario(data: any) {
    return this.http.post<any>(`${environment.url}/horario`, data);
  }

  // BUSCAR HORARIO POR EL NOMBRE    **USADO
  BuscarHorarioNombre(datos: any) {
    return this.http.post(`${environment.url}/horario/buscar-horario/nombre`, datos);
  }

  // CARGAR ARCHIVO DE RESPALDO     **USADO
  SubirArchivo(formData: any, id: number, archivo: any, codigo: any) {
    return this.http.put(`${environment.url}/horario/${id}/documento/${archivo}/verificar/${codigo}`, formData)
  }

  // ACTUALIZACION DE HORARIO    **USADO
  ActualizarHorario(id: number, data: any) {
    return this.http.put(`${environment.url}/horario/editar/${id}`, data);
  }

  // ELIMINAR DOCUMENTO DE HORARIO   **USADO
  EliminarArchivo(datos: any) {
    return this.http.put(`${environment.url}/horario/eliminar_horario/base_servidor`, datos)
  }

  // ELIMINAR DOCUMENTO DE CONTRATO DEL SERVIDOR    **USADO
  EliminarArchivoServidor(datos: any) {
    return this.http.put(`${environment.url}/horario/eliminar_horario/servidor`, datos)
  }

  // BUSCAR LISTA DE CATALOGO DE HORARIOS        **USADO
  BuscarListaHorarios() {
    return this.http.get(`${environment.url}/horario`);
  }

  // BUSCAR HORARIOS SIN CONSIDERAR UN HORARIO EN ESPECIFICO    **USADO
  BuscarHorarioNombre_(datos: any) {
    return this.http.post<any>(`${environment.url}/horario/buscar_horario/edicion`, datos);
  }

  // METODO PARA ELIMINAR REGISTRO     **USADO
  EliminarRegistro(id: number, datos: any) {
    const url = `${environment.url}/horario/eliminar/${id}`;
    const httpOptions = {
      body: datos
    };
    return this.http.delete(url, httpOptions);
  }

  // BUSCAR DATOS DE UN HORARIO    **USADO
  BuscarUnHorario(id: number) {
    return this.http.get(`${environment.url}/horario/${id}`);
  }

  // METODO PARA ACTUALIZAR HORAS DE TRABAJO   **USADO
  ActualizarHorasTrabaja(id: number, data: any) {
    return this.http.put(`${environment.url}/horario/update-horas-trabaja/${id}`, data);
  }

  // VERIFICAR DATOS DE LA PLANTILLA DE CATALOGO HORARIO Y CARGAR AL SISTEMA   **USADO
  VerificarDatosHorario(formData: any) {
    return this.http.post<any>(`${environment.url}/horario/cargarHorario/verificarDatos/upload`, formData);
  }

  // REGISTRAR DATOS DE PLANTILLA EN EL SISTEMA   **USADO
  CargarHorariosMultiples(formData: any) {
    return this.http.post<any>(`${environment.url}/horario/cargarHorario/upload`, formData);
  }

}
