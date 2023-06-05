import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'
import { rango, checkOptions, FormCriteriosBusqueda } from "src/app/model/reportes.model";

@Injectable({
  providedIn: 'root'
})

export class ReportesService {

  constructor(
    private http: HttpClient,
  ) { }

  ObtenerTimbres(empleado_id: any, data: any) {
    return this.http.post(`${environment.url}/reporte/reporteTimbres/listaTimbres/${empleado_id}`, data);
  }

  ObtenerPermisosHorarios(empleado_id: any) {
    return this.http.get(`${environment.url}/reporte/reportePermisos/horarios/${empleado_id}`);
  }

  ObtenerPermisosPlanificacion(empleado_id: any) {
    return this.http.get(`${environment.url}/reporte/reportePermisos/planificacion/${empleado_id}`);
  }

  ObtenerAutorizacionPermiso(empleado_id: any) {
    return this.http.get(`${environment.url}/reporte/reportePermisos/autorizaciones/${empleado_id}`);
  }

  ObtenerTimbresAtrasosHorario(empleado_id: any, data: any) {
    return this.http.post(`${environment.url}/reporte/reporteAtrasos/horarios/${empleado_id}`, data);
  }

  ObtenerTimbresAtrasosPlanificacion(empleado_id: any, data: any) {
    return this.http.post(`${environment.url}/reporte/reporteAtrasos/planificacion/${empleado_id}`, data);
  }

  ObtenerEntradaSalidaHorario(codigo: any, data: any) {
    return this.http.post(`${environment.url}/reporte/reporteEntradaSalida/horarios/${codigo}`, data);
  }

  ObtenerEntradaSalidaPlanificacion(codigo: any, data: any) {
    return this.http.post(`${environment.url}/reporte/reporteEntradaSalida/planificacion/${codigo}`, data);
  }

  ObtenerPermisosHorariosFechas(empleado_id: any, data: any) {
    return this.http.post(`${environment.url}/reporte/reportePermisos/fechas/horarios/${empleado_id}`, data);
  }

  ObtenerPermisosPlanificacionFechas(empleado_id: any, data: any) {
    return this.http.post(`${environment.url}/reporte/reportePermisos/fechas/planificacion/${empleado_id}`, data);
  }

  ObtenerPlanificacionEmpleado(empleado_id: any, data: any) {
    return this.http.post(`${environment.url}/reporte/reporteTimbres/buscarPlan/${empleado_id}`, data);
  }

  /**
   * SERVICIOS CENTRALIZADOS RANGO DE FECHAS
   */

  private _fechas: rango = {
    fec_inico: '',
    fec_final: ''
  };

  get rangoFechas() {
    return this._fechas
  }

  guardarRangoFechas(inicio: string, final: string) {
    this._fechas = { fec_inico: inicio, fec_final: final }
  }

  /**
   * LOS CHECKS DE LOS CRITERIOS DE BUSQUEDA
   */

  private _check: checkOptions[] = [
    { opcion: 's', valor: 'Sucursal' },
    { opcion: 'c', valor: 'Cargo' },
    { opcion: 'd', valor: 'Departamento' },
    { opcion: 'e', valor: 'Empleado' },
    { opcion: 't', valor: 'Tabulado' },
    { opcion: 'i', valor: 'Incompletos' },
  ];

  checkOptions(num_items: any): checkOptions[] {
    let valores: any = []
    this._check.forEach(obj => {
      num_items.forEach(a => {
        if (obj.opcion === a.opcion) {
          valores = valores.concat(obj)
        }
      })
    })
    return valores;
  }

  /**
   * EL NUMERO DE LA OPCION ESCOGIDA YA SEA (SUCURSAL, DEPARTAMENTO, EMPLEADO, TABULADO ?, INCOMPLETO ?)
   */

  private _opcion = '';

  GuardarCheckOpcion(o: string): void {
    this._opcion = o;
  }

  get opcion() {
    return this._opcion
  }

  /**
   * PARA MOSTRAR LOS FORMS DE ACUERDO A LA OPCION SELECCIONADA
   */
  private _formCriteriosBusqueda: FormCriteriosBusqueda = {
    bool_suc: false,
    bool_dep: false,
    bool_emp: false,
    bool_tab: false,
    bool_inc: false,
    bool_cargo: false,
  }

  GuardarFormCriteriosBusqueda(bool: FormCriteriosBusqueda): void {
    this._formCriteriosBusqueda = bool;
  }

  get criteriosBusqueda() {
    return this._formCriteriosBusqueda
  }

  DefaultFormCriterios() {
    this._formCriteriosBusqueda.bool_suc = false;
    this._formCriteriosBusqueda.bool_dep = false;
    this._formCriteriosBusqueda.bool_emp = false;
    this._formCriteriosBusqueda.bool_tab = false;
    this._formCriteriosBusqueda.bool_inc = false;
    this._formCriteriosBusqueda.bool_cargo = false;
  }

  /********************************
   * 
   * Get y Set filtros de los formularios componentes de reportes multiples
   * 
   ********************************/
  // Filtro formulario nombre de sucursal
  private _filtroNombreSuc: string = '';

  get filtroNombreSuc() { return this._filtroNombreSuc; }
  setFiltroNombreSuc(arr) { this._filtroNombreSuc = arr }


  // FILTRO FORMULARIO NOMBRE DEL CARGO
  private _filtroNombreCarg: string = '';

  get filtroNombreCarg() { return this._filtroNombreCarg; }
  setFiltroNombreCarg(arr) { this._filtroNombreCarg = arr }


  // Filtro formulario nombre de departamento
  private _filtroNombreDep: string = '';

  get filtroNombreDep() { return this._filtroNombreDep; }
  setFiltroNombreDep(arr) { this._filtroNombreDep = arr }

  // Filtro formulario del empleado 
  private _filtroCodigo: any;
  private _filtroCedula: string = '';
  private _filtroNombreEmp: string = '';

  get filtroCodigo() { return this._filtroCodigo; }
  setFiltroCodigo(arr) { this._filtroCodigo = arr; }

  get filtroCedula() { return this._filtroCedula; }
  setFiltroCedula(arr) { this._filtroCedula = arr; }

  get filtroNombreEmp() { return this._filtroNombreEmp; }
  setFiltroNombreEmp(arr) { this._filtroNombreEmp = arr; }

  // Filtro formulario de tabulacion
  private _filtroCodigo_tab: number = 0;
  private _filtroCedula_tab: string = '';
  private _filtroNombreTab: string = '';

  get filtroCodigo_tab() { return this._filtroCodigo_tab; }
  setFiltroCodigo_tab(arr) { this._filtroCodigo_tab = arr; }

  get filtroCedula_tab() { return this._filtroCedula_tab; }
  setFiltroCedula_tab(arr) { this._filtroCedula_tab = arr; }

  get filtroNombreTab() { return this._filtroNombreTab; }
  setFiltroNombreTab(arr) { this._filtroNombreTab = arr; }

  // Filtro formulario de incompletos
  private _filtroCodigo_inc: number = 0;
  private _filtroCedula_inc: string = '';
  private _filtroNombreInc: string = '';

  get filtroCodigo_inc() { return this._filtroCodigo_inc; }
  setFiltroCodigo_inc(arr) { this._filtroCodigo_inc = arr; }

  get filtroCedula_inc() { return this._filtroCedula_inc; }
  setFiltroCedula_inc(arr) { this._filtroCedula_inc = arr; }

  get filtroNombreInc() { return this._filtroNombreInc; }
  setFiltroNombreInc(arr) { this._filtroNombreInc = arr; }


  DefaultValoresFiltros() {
    this._filtroNombreSuc = '';
    this._filtroNombreDep = '';
    this._filtroNombreEmp = '';
    this._filtroNombreTab = '';
    this._filtroNombreInc = '';
    this._filtroCedula = '';
    this._filtroCedula_tab = '';
    this._filtroCedula_inc = '';
    this._filtroCodigo = 0;
    this._filtroCodigo_tab = 0;
    this._filtroCodigo_inc = 0;
  }


  /**********************************************************************
   * 
   * VALIDACION DE FUNCIONALIDAD DE MOSTRAR O NO EL CAMPO DE LOS TIMBRES DEL SERVIDOR.
   * 
   **********************************************************************/

  private _valueTimbreServidor: Boolean = false;

  get mostrarTimbreServidor() { return this._valueTimbreServidor }
  setMostrarTimbreServidor(value) { this._valueTimbreServidor = value; }

  DefaultTimbreServidor() { this._valueTimbreServidor = false; }


}