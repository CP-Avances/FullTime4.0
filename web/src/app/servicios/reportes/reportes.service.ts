import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { rango, checkOptions, FormCriteriosBusqueda } from "src/app/model/reportes.model";

@Injectable({
  providedIn: 'root'
})

export class ReportesService {

  constructor(
    private http: HttpClient,
  ) { }

  ObtenerPermisosHorarios(codigo: any) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/reporte/reportePermisos/horarios/${codigo}`);
  }

  ObtenerEntradaSalidaHorario(codigo: any, data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/reporte/reporteEntradaSalida/horarios/${codigo}`, data);
  }

  ObtenerEntradaSalidaPlanificacion(codigo: any, data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/reporte/reporteEntradaSalida/planificacion/${codigo}`, data);
  }

  ObtenerPermisosHorariosFechas(codigo: any, data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/reporte/reportePermisos/fechas/horarios/${codigo}`, data);
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
    { opcion: 'r', valor: 'Régimen Laboral' },
    { opcion: 'd', valor: 'Departamento' },
    { opcion: 'c', valor: 'Cargo' },
    { opcion: 'e', valor: 'Empleado' },
    { opcion: 't', valor: 'Tabulado' },
    { opcion: 'i', valor: 'Incompletos' },
  ];

  checkOptions(num_items: any): checkOptions[] {
    let valores: any = []
    this._check.forEach((obj: any) => {
      num_items.forEach(a => {
        if (obj.opcion === a.opcion) {
          valores = valores.concat(obj)
        }
      })
    })
    return valores;
  }

  checkOptionsN(num_items: number): checkOptions[] {
    const valores: checkOptions[] = this._check.slice(0, num_items);
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
    bool_reg: false,
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
    this._formCriteriosBusqueda.bool_reg = false;
  }

  /***************************************************************************
   ** 
   ** GET Y SET FILTROS DE LOS FORMULARIOS COMPONENTES DE REPORTES MULTIPLES
   ** 
   ***************************************************************************/

  // FILTRO FORMULARIO NOMBRE DE SUCURSAL
  private _filtroNombreSuc: string = '';

  get filtroNombreSuc() { return this._filtroNombreSuc; }
  setFiltroNombreSuc(arr: any) { this._filtroNombreSuc = arr }

  // FILTRO FORMULARIO NOMBRE DE REGIMEN LABORAL
  private _filtroNombreReg: string = '';

  get filtroNombreReg() { return this._filtroNombreReg; }
  setFiltroNombreReg(arr: any) { this._filtroNombreReg = arr }


  // FILTRO FORMULARIO NOMBRE DEL CARGO
  private _filtroNombreCarg: string = '';

  get filtroNombreCarg() { return this._filtroNombreCarg; }
  setFiltroNombreCarg(arr: any) { this._filtroNombreCarg = arr }


  // FILTRO FORMULARIO NOMBRE DE DEPARTAMENTO
  private _filtroNombreDep: string = '';

  get filtroNombreDep() { return this._filtroNombreDep; }
  setFiltroNombreDep(arr: any) { this._filtroNombreDep = arr }

  // FILTRO FORMULARIO DEL EMPLEADO 
  private _filtroCodigo: string = '';
  private _filtroCedula: string = '';
  private _filtroNombreEmp: string = '';
  private _filtroRolEmp: string = '';

  get filtroCodigo() { return this._filtroCodigo; }
  setFiltroCodigo(arr: any) { this._filtroCodigo = arr; }

  get filtroCedula() { return this._filtroCedula; }
  setFiltroCedula(arr: any) { this._filtroCedula = arr; }

  get filtroNombreEmp() { return this._filtroNombreEmp; }
  setFiltroNombreEmp(arr: any) { this._filtroNombreEmp = arr; }

  get filtroRolEmp(){return this._filtroRolEmp;}
  setFiltroRolEmp(arr: any){this._filtroRolEmp = arr; }

  // FILTRO FORMULARIO DE TABULACION
  private _filtroCodigo_tab: number = 0;
  private _filtroCedula_tab: string = '';
  private _filtroNombreTab: string = '';

  get filtroCodigo_tab() { return this._filtroCodigo_tab; }
  setFiltroCodigo_tab(arr: any) { this._filtroCodigo_tab = arr; }

  get filtroCedula_tab() { return this._filtroCedula_tab; }
  setFiltroCedula_tab(arr: any) { this._filtroCedula_tab = arr; }

  get filtroNombreTab() { return this._filtroNombreTab; }
  setFiltroNombreTab(arr: any) { this._filtroNombreTab = arr; }

  // FILTRO FORMULARIO DE INCOMPLETOS
  private _filtroCodigo_inc: number = 0;
  private _filtroCedula_inc: string = '';
  private _filtroNombreInc: string = '';

  get filtroCodigo_inc() { return this._filtroCodigo_inc; }
  setFiltroCodigo_inc(arr: any) { this._filtroCodigo_inc = arr; }

  get filtroCedula_inc() { return this._filtroCedula_inc; }
  setFiltroCedula_inc(arr: any) { this._filtroCedula_inc = arr; }

  get filtroNombreInc() { return this._filtroNombreInc; }
  setFiltroNombreInc(arr: any) { this._filtroNombreInc = arr; }


  DefaultValoresFiltros() {
    this._filtroNombreSuc = '';
    this._filtroNombreReg = '';
    this._filtroNombreCarg = '';
    this._filtroNombreDep = '';
    this._filtroNombreEmp = '';
    this._filtroNombreTab = '';
    this._filtroNombreInc = '';
    this._filtroCedula = '';
    this._filtroCedula_tab = '';
    this._filtroCedula_inc = '';
    this._filtroCodigo = '';
    this._filtroRolEmp = '';
    this._filtroCodigo_tab = 0;
    this._filtroCodigo_inc = 0;
  }


  /***************************************************************************************
   *                                                                                     *
   * VALIDACION DE FUNCIONALIDAD DE MOSTRAR O NO EL CAMPO DE LOS TIMBRES DEL DISPOSITIVO *
   *                                                                                     *
   ***************************************************************************************/

  private _valueTimbreDispositivo: Boolean = false;

  get mostrarTimbreDispositivo() { return this._valueTimbreDispositivo }
  setMostrarTimbreDispositivo(value: any) { this._valueTimbreDispositivo = value; }

  DefaultTimbreDispositivo() { this._valueTimbreDispositivo = false; }


}