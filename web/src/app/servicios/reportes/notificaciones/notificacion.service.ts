import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class NotificacionService {

  constructor(
    private http: HttpClient,
  ) { }

  ObtenerPermisosEnviados(id: number) {
    return this.http.get(`${environment.url}/notificacionSistema/permisos_enviados/${id}`);
  }

  ObtenerPermisosRecibidos(id: number) {
    return this.http.get(`${environment.url}/notificacionSistema/permisos_recibidos/${id}`);
  }

  ObtenerHorasExtrasEnviados(id: number) {
    return this.http.get(`${environment.url}/notificacionSistema/solicita_extra_enviados/${id}`);
  }

  ObtenerHorasExtrasRecibidas(id: number) {
    return this.http.get(`${environment.url}/notificacionSistema/solicita_extra_recibidos/${id}`);
  }

  ObtenerVacacionesEnviadas(id: number) {
    return this.http.get(`${environment.url}/notificacionSistema/vacaciones_enviados/${id}`);
  }

  ObtenerVacacionesRecibidas(id: number) {
    return this.http.get(`${environment.url}/notificacionSistema/vacaciones_recibidos/${id}`);
  }

  ObtenerPalnificacionesEnviadas(id: number) {
    return this.http.get(`${environment.url}/notificacionSistema/planificaciones_enviadas/${id}`);
  }

  ObtenerPlanificacionesEliminadas(id: number) {
    return this.http.get(`${environment.url}/notificacionSistema/planificaciones_eliminadas/${id}`);
  }

  // USUARIOS
  ObtenerUsuariosPermisosEnviados(id: number) {
    return this.http.get(`${environment.url}/notificacionSistema/usuario_permisos_enviados/${id}`);
  }

  ObtenerUsuariosPermisosRecibidos(id: number) {
    return this.http.get(`${environment.url}/notificacionSistema/usuario_permisos_recibidos/${id}`);
  }

  ObtenerUsuariosVacionesEnviados(id: number) {
    return this.http.get(`${environment.url}/notificacionSistema/usuario_vacaciones_enviados/${id}`);
  }

  ObtenerUsuariosVacacionesRecibidos(id: number) {
    return this.http.get(`${environment.url}/notificacionSistema/usuario_vacaciones_recibidos/${id}`);
  }

  ObtenerUsuariosExtrasEnviados(id: number) {
    return this.http.get(`${environment.url}/notificacionSistema/usuario_extras_enviados/${id}`);
  }

  ObtenerUsuariosExtrasRecibidos(id: number) {
    return this.http.get(`${environment.url}/notificacionSistema/usuario_extras_recibidos/${id}`);
  }

  ObtenerUsuariosComidasEnviados(id: number) {
    return this.http.get(`${environment.url}/notificacionSistema/usuario_comidas_enviados/${id}`);
  }

  ObtenerUsuariosComidasRecibidos(id: number) {
    return this.http.get(`${environment.url}/notificacionSistema/usuario_comidas_recibidos/${id}`);
  }

  // TOTALES POR USUARIO
  ObtenerUsuariosPermisosEnviados_Todas(id: number, id_empleado: number) {
    return this.http.get(`${environment.url}/notificacionSistema/usuario_permisos_enviados_todas/${id}/${id_empleado}`);
  }

  ObtenerUsuariosPermisosRecibidos_Todas(id: number, id_empleado: number) {
    return this.http.get(`${environment.url}/notificacionSistema/usuario_permisos_recibidos_todas/${id}/${id_empleado}`);
  }

  ObtenerUsuariosVacionesEnviados_Todas(id: number, id_empleado: number) {
    return this.http.get(`${environment.url}/notificacionSistema/usuario_vacaciones_enviados_todas/${id}/${id_empleado}`);
  }

  ObtenerUsuariosVacacionesRecibidos_Todas(id: number, id_empleado: number) {
    return this.http.get(`${environment.url}/notificacionSistema/usuario_vacaciones_recibidos_todas/${id}/${id_empleado}`);
  }

  ObtenerUsuariosExtrasEnviados_Todas(id: number, id_empleado: number) {
    return this.http.get(`${environment.url}/notificacionSistema/usuario_extras_enviados_todas/${id}/${id_empleado}`);
  }

  ObtenerUsuariosComidasEnviados_Todas(id: number, id_empleado: number) {
    return this.http.get(`${environment.url}/notificacionSistema/usuario_comidas_enviados_todas/${id}/${id_empleado}`);
  }

  ObtenerUsuariosComidasRecibidos_Todas(id: number, id_empleado: number) {
    return this.http.get(`${environment.url}/notificacionSistema/usuario_comidas_recibidos_todas/${id}/${id_empleado}`);
  }

  // FECHA POR USUARIO
  ObtenerUsuariosPermisosEnviados_Fecha(id: number, id_empleado: number, inicio: string, final: string) {
    return this.http.get(`${environment.url}/notificacionSistema/usuario_permisos_enviados_fecha/${id}/${id_empleado}/${inicio}/${final}`);
  }

  ObtenerUsuariosPermisosRecibidos_Fecha(id: number, id_empleado: number, inicio: string, final: string) {
    return this.http.get(`${environment.url}/notificacionSistema/usuario_permisos_recibidos_fecha/${id}/${id_empleado}/${inicio}/${final}`);
  }

  ObtenerUsuariosVacionesEnviados_Fecha(id: number, id_empleado: number, inicio: string, final: string) {
    return this.http.get(`${environment.url}/notificacionSistema/usuario_vacaciones_enviados_fecha/${id}/${id_empleado}/${inicio}/${final}`);
  }

  ObtenerUsuariosVacacionesRecibidos_Fecha(id: number, id_empleado: number, inicio: string, final: string) {
    return this.http.get(`${environment.url}/notificacionSistema/usuario_vacaciones_recibidos_fecha/${id}/${id_empleado}/${inicio}/${final}`);
  }

  ObtenerUsuariosExtrasEnviados_Fecha(id: number, id_empleado: number, inicio: string, final: string) {
    return this.http.get(`${environment.url}/notificacionSistema/usuario_extras_enviados_fecha/${id}/${id_empleado}/${inicio}/${final}`);
  }

  ObtenerUsuariosComidasEnviados_Fecha(id: number, id_empleado: number, inicio: string, final: string) {
    return this.http.get(`${environment.url}/notificacionSistema/usuario_comidas_enviados_fecha/${id}/${id_empleado}/${inicio}/${final}`);
  }

  ObtenerUsuariosComidasRecibidos_Fecha(id: number, id_empleado: number, inicio: string, final: string) {
    return this.http.get(`${environment.url}/notificacionSistema/usuario_comidas_recibidos_fecha/${id}/${id_empleado}/${inicio}/${final}`);
  }
}
