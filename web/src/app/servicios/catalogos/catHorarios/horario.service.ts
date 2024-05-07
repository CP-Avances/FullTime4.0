import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment'
import { catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class HorarioService {

  constructor(
    private http: HttpClient,
  ) { }

  // REGISTRAR HORARIO
  RegistrarHorario(data: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/horario`, data);
  }

  // BUSCAR HORARIO POR EL NOMBRE
  BuscarHorarioNombre(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/horario/buscar-horario/nombre`, datos);
  }

  // CARGAR ARCHIVO DE RESPALDO   --**VERIFICADO
  SubirArchivo(formData: any, id: number, archivo: any, codigo: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/horario/${id}/documento/${archivo}/verificar/${codigo}`, formData)
  }

  // ACTUALIZACION DE HORARIO
  ActualizarHorario(id: number, data: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/horario/editar/${id}`, data);
  }

  // ELIMINAR DOCUMENTO DE CONTRATO
  EliminarArchivo(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/horario/eliminar_horario/base_servidor`, datos)
  }

  // ELIMINAR DOCUMENTO DE CONTRATO DEL SERVIDOR
  EliminarArchivoServidor(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/horario/eliminar_horario/servidor`, datos)
  }

  // BUSCAR LISTA DE CATALOGO DE HORARIOS         --** VERIFICADO
  BuscarListaHorarios() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/horario`);
  }

  // BUSCAR HORARIOS SIN CONSIDERAR UN HORARIO EN ESPECIFICO
  BuscarHorarioNombre_(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/horario/buscar_horario/edicion`, datos);
  }

  // METODO PARA ELIMINAR REGISTRO
  EliminarRegistro(id: any) {
    return this.http.delete(`${(localStorage.getItem('empresaURL') as string)}/horario/eliminar/${id}`).pipe(catchError(id));
  }

  // METODO PARA CREAR ARCHIVO XML
  CrearXML(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/horario/xmlDownload`, data);
  }

  // BUSCAR DATOS DE UN HORARIO
  BuscarUnHorario(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/horario/${id}`);
  }

  // METODO PARA ACTUALIZAR HORAS DE TRABAJO
  ActualizarHorasTrabaja(id: number, data: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/horario/update-horas-trabaja/${id}`, data);
  }











  // VERIFICAR DATOS DE LA PLANTILLA DE CATÁLOGO HORARIO Y CARGAR AL SISTEMA
  VerificarDatosHorario(formData) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/horario/cargarHorario/verificarDatos/upload`, formData);
  }
  VerificarPlantillaHorario(formData) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/horario/cargarHorario/verificarPlantilla/upload`, formData);
  }
  CargarHorariosMultiples(formData) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/horario/cargarHorario/upload`, formData);
  }

}
