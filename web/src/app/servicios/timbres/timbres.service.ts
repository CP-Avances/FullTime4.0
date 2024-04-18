import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class TimbresService {

  constructor(
    private http: HttpClient
  ) { }
  //Metodos aun en desarrollo

  // METODO PARA LISTAR MARCACIONES
  ObtenerTimbres() {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/timbres/`);
  }

  // METODO PARA REGISTRAR TIMBRE PERSONAL
  RegistrarTimbreWeb(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/timbres/`, datos);
  }

  // METODO PARA REGISTRAR TIMBRES ADMINISTRADOR
  RegistrarTimbreAdmin(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/timbres/admin/`, datos);
  }

  ObtenerTimbresFechaEmple(datos: any) {
    const params = new HttpParams()
      .set('codigo', datos.codigo)
      .set('cedula', datos.cedula)
      .set('fecha', datos.fecha)
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/timbres/timbresfechaemple`, { params });
  }


  EditarTimbreEmpleado(data: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/timbres/timbre/editar`, data);
  }


  // METODO PARA BUSCAR TIMBRES (ASISTENCIA)
  BuscarTimbresAsistencia(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/timbres/buscar/timbres-asistencia`, datos);
  }


  // METODO PARA BUSCAR TIMBRES (PLANIFICACION HORARIA)
  BuscarTimbresPlanificacion(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/timbres/buscar/timbres-planificacion`, datos);
  }


  /**
   * METODO PARA TRAER LAS NOTIFICACIONES DE ATRASOS O SALIDAS ANTES SOLO VIENEN 5 NOTIFICACIONES
   * @param id_empleado Id DEL EMPLEADO QUE INICIA SESION
   */

  // METODO DE CONSULTA DE AVISOS GENERALES
  BuscarAvisosGenerales(id_empleado: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/timbres/avisos-generales/${id_empleado}`);
  }

  // METODO DE CONSULTA DE AVISOS ESPECIFICOS
  ObtenerUnAviso(id: number) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/timbres/aviso-individual/${id}`);
  }

  PutVistaTimbre(id_noti_timbre: number) {
    let data = { visto: true };
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/timbres/noti-timbres/vista/${id_noti_timbre}`, data);
  }

  AvisosTimbresRealtime(id_empleado: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/timbres/noti-timbres/avisos/${id_empleado}`);
  }

  EliminarAvisos(Seleccionados: any[]) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/timbres/eliminar-multiples/avisos`, Seleccionados); //Eliminacion de datos seleccionados.
  }






  ObtenerTimbresEmpleado(id: number) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/timbres/ver/timbres/${id}`);
  }

  UltimoTimbreEmpleado() {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/timbres/ultimo-timbre`);
  }

}
