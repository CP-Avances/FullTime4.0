import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MainNavService {

  private consultarFuncionalidad: any;
 
  constructor(
    private http: HttpClient,
  ) {}

  // CONSULTAS DE FUNCIONES
  LogicaFunciones() {
    this.consultarFuncionalidad = sessionStorage.getItem('queryFuncionalidad');
    if (this.consultarFuncionalidad === null) {
      this.http.get<any>(`${environment.url}/administracion/funcionalidad`).subscribe((res: any) => {
        const [result] = res;
        sessionStorage.setItem('queryFuncionalidad', JSON.stringify(result));
        this.ValueFuncionalidad(result);
      }, error => {
        this.DefaultFuncionalidad();
      })

    } else {
      const result = JSON.parse(this.consultarFuncionalidad);
      this.ValueFuncionalidad(result);
    }
  }

  // CONTROL DE FUNCIONES DEL SISTEMA
  private _AccionesPersonal: boolean = false;
  private _Geolocalizacion: boolean = false;
  private _Alimentacion: boolean = false;
  private _Vacaciones: boolean = false;
  private _HoraExtra: boolean = false;
  private _TimbreWeb: boolean = false;
  private _Permisos: boolean = false;
  private _Movil: boolean = false;

  get accionesPersonal() { return this._AccionesPersonal; }
  setAccionesPersonal(arg: boolean) { this._AccionesPersonal = arg; }

  get horasExtras() { return this._HoraExtra; }
  setHoraExtra(arg: boolean) { this._HoraExtra = arg; }

  get alimentacion() { return this._Alimentacion; }
  setAlimentacion(arg: boolean) { this._Alimentacion = arg; }

  get permisos() { return this._Permisos; }
  setPermisos(arg: boolean) { this._Permisos = arg; }

  get geolocalizacion() { return this._Geolocalizacion; }
  setGeolocalizacion(arg: boolean) { this._Geolocalizacion = arg; }

  get vacaciones() { return this._Vacaciones; }
  setVacaciones(arg: boolean) { this._Vacaciones = arg; }

  get app_movil() { return this._Movil; }
  setAppMovil(arg: boolean) { this._Movil = arg; }

  get timbre_web() { return this._TimbreWeb; }
  setTimbreWeb(arg: boolean) { this._TimbreWeb = arg; }

  // METODO PARA COLOCAR VALORES POR DEFECTO
  private DefaultFuncionalidad(value = false) {
    this.setAccionesPersonal(value);
    this.setGeolocalizacion(value);
    this.setAlimentacion(value);
    this.setVacaciones(value);
    this.setHoraExtra(value);
    this.setTimbreWeb(value);
    this.setPermisos(value);
    this.setAppMovil(value);
  }

  // METODO PARA SETEAR VALORES DE FUNCIONES
  public ValueFuncionalidad(value: any) {
    const { accion_personal, alimentacion, hora_extra, permisos, reportes, vacaciones,
      geolocalizacion, app_movil, timbre_web } = value
    this.setAccionesPersonal(accion_personal);
    this.setGeolocalizacion(geolocalizacion);
    this.setAlimentacion(alimentacion);
    this.setVacaciones(vacaciones);
    this.setHoraExtra(hora_extra);
    this.setTimbreWeb(timbre_web);
    this.setPermisos(permisos);
    this.setAppMovil(app_movil);
  }

}
