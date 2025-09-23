import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SocketService } from 'src/app/servicios/socket/socket.service';
import { Socket } from 'socket.io-client';
import { SolicitudVacacion } from 'src/app/interfaces/SolicitudesVacacion';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VacacionesService {

  socket: Socket | null = null;

  constructor(
    private http: HttpClient,
    private socketService: SocketService,
  ) {
    this.socket = this.socketService.getSocket();
  }

  // METODO PARA LISTAR TIPOS DE VACACIONES   ** VERIFICAR **USADO**
  ListarTodasConfiguraciones() {
    return this.http.get(`${localStorage.getItem('empresaURL') as string}/vacaciones/lista-todas-configuraciones`);
  }

  // METODO PARA VERIFICAR VACACIONES MULTIPLE   **USADO**
  VerificarVacacionesMultiples(datosVerificacion: { empleados: number[], fechaInicio: string, fechaFin: string, incluirFeriados: boolean }) {
    const url = `${localStorage.getItem('empresaURL') as string}/vacaciones/verificar-empleados`;
    return this.http.post(url, datosVerificacion);
  }

  // SERVICIO PARA BUSCAR VACACIONES POR ID_EMPELADO Y FECHAS    **USADO**
  BuscarSolicitudExistente(verificacion: any) {
    const url = `${(localStorage.getItem('empresaURL') as string)}/vacaciones/verificar-solicitud/${verificacion.id_empleado}/${verificacion.fecha_inicio}/${verificacion.fecha_final}`;
    return this.http.get<any>(url);
  }

  // METODO PARA SUBIR UN DOCUMENTO  **USADO**
  SubirDocumento(formData: FormData, id_solicitud: number, id_empleado: number) {
    const url = `${(localStorage.getItem('empresaURL') as string)}/vacaciones/${id_solicitud}/documento/${id_empleado}`;
    return this.http.put<any>(url, formData);
  }

  // CREAR SOLICITUD DE VACACIONES    **USADO**
  RegistrarVacaciones(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/vacaciones`, datos);
  }

  // METODO EDITAR SOLICITUD DE VACACIONES
  EditarSolicitudesVacaciones(id: number, data: SolicitudVacacion): Observable<SolicitudVacacion> {
    return this.http.put<SolicitudVacacion>(`${(localStorage.getItem('empresaURL') as string)}/vacacion-solicitada/${id}`, data);
  }

  ObtenerSolicitudes(): Observable<SolicitudVacacion[]> {
    return this.http.get<SolicitudVacacion[]>(`${(localStorage.getItem('empresaURL') as string)}/vacaciones/solicitudes-vacaciones`)
  }

}
