import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class MensajesNotificacionesService {

  constructor(
    private http: HttpClient,
  ) { }

  // METODO PARA VER MENSAJE DE NOTIFICACIONES    **USADO
  VerMensajeNotificaciones(id_empresa: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/mensajes_notificaciones/${id_empresa}`);
  }

  // METODO PARA REGISTRAR MENSAJE DE NOTIFICACIONES    **USADO
  CrearMensajeNotificaciones(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/mensajes_notificaciones`, data);
  }

  // METODO PARA CARGAR IMAGEN DE NOTIFICACIONESS   **USADO
  SubirImagenNotificaciones(formData: any, id_empresa: number) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/mensajes_notificaciones/${id_empresa}/uploadImage`, formData)
  }

  // METODO PARA ACTUALIZAR MENSAJE DE NOTIFICACIONES    **USADO
  EditarMensajeNotificaciones(id_notificacion: number, data: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/mensajes_notificaciones/editar/${id_notificacion}`, data)
  }
}
