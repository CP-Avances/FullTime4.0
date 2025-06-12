import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class HorarioService {

  constructor(
    private http: HttpClient,
  ) { }

  // REGISTRAR HORARIO     **USADO
  RegistrarHorario(data: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/horario`, data);
  }

  // BUSCAR HORARIO POR EL NOMBRE    **USADO
  BuscarHorarioNombre(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/horario/buscar-horario/nombre`, datos);
  }

  // CARGAR ARCHIVO DE RESPALDO     **USADO
  SubirArchivo(formData: any, id: number, archivo: any, codigo: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/horario/${id}/documento/${archivo}/verificar/${codigo}`, formData)
  }

  // ACTUALIZACION DE HORARIO    **USADO
  ActualizarHorario(id: number, data: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/horario/editar/${id}`, data);
  }

  // ELIMINAR DOCUMENTO DE HORARIO   **USADO
  EliminarArchivo(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/horario/eliminar_horario/base_servidor`, datos)
  }

  // ELIMINAR DOCUMENTO DE CONTRATO DEL SERVIDOR    **USADO
  EliminarArchivoServidor(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/horario/eliminar_horario/servidor`, datos)
  }

  // BUSCAR LISTA DE CATALOGO DE HORARIOS   **USADO
  BuscarListaHorarios() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/horario`);
  }

  // BUSCAR HORARIOS SIN CONSIDERAR UN HORARIO EN ESPECIFICO    **USADO
  BuscarHorarioNombre_(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/horario/buscar_horario/edicion`, datos);
  }

  // METODO PARA ELIMINAR REGISTRO     **USADO
  EliminarRegistro(id: number, datos: any) {
    const url = `${(localStorage.getItem('empresaURL') as string)}/horario/eliminar/${id}`;
    const httpOptions = {
      body: datos
    };
    return this.http.delete(url, httpOptions);
  }

  // BUSCAR DATOS DE UN HORARIO    **USADO
  BuscarUnHorario(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/horario/${id}`);
  }

  // METODO PARA ACTUALIZAR HORAS DE TRABAJO   **USADO
  ActualizarHorasTrabaja(id: number, data: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/horario/update-horas-trabaja/${id}`, data);
  }

  // VERIFICAR DATOS DE LA PLANTILLA DE CATALOGO HORARIO Y CARGAR AL SISTEMA   **USADO
  VerificarDatosHorario(formData: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/horario/cargarHorario/verificarDatos/upload`, formData);
  }

  // REGISTRAR DATOS DE PLANTILLA EN EL SISTEMA   **USADO
  CargarHorariosMultiples(formData: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/horario/cargarHorario/upload`, formData);
  }

}
