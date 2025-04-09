import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class KardexService {

  constructor(
    private http: HttpClient
  ) { }

  /**
   * METODOS QUE OBTIENEN LA INFORMACION DEL KARDEX DE VACACIONES DIAS CALENDARIO.
   */
  
  ObtenerKardexVacacionDiasCalendarioByIdEmpleado(id_empleado: number, desde: string, hasta: string) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/reportes/vacacion/${id_empleado}/${desde}/${hasta}`);
  }

  /**
   * Metodo para traer la informacion de datos consolidados
   * @param id_empleado id del empleado que desea obtener su asistencia
   * @param desde fecha inicia el mes o cualquier inicio de fecha
   * @param hasta fecha finaliza el mes
   */
  ReporteAsistenciaDetalleConsolidado (id_empleado: number, desde: string, hasta: string) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/asistencia/${id_empleado}/${desde}/${hasta}`)
  }

  /**
   * Metodo para listar a los empleados con su cargo, departamento y regimen laboral
   * @param id_empresa Id de la empresa que pertenecen los empleados
   */
  ReporteHorasExtras(id_empleado: number, desde: string, hasta: string) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/reportes/hora-extra/${id_empleado}/${desde}/${hasta}`)
    // ${(localStorage.getItem('empresaURL') as string)}/reportes/hora-extra/2/2020-12-01/2020-12-31
  }

}
