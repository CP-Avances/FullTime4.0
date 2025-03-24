// IMPORTAR LIBRERIAS
import { PageEvent } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { SelectionModel } from '@angular/cdk/collections';
import { MatRadioChange } from '@angular/material/radio';
import { Component, OnInit } from '@angular/core';
import { Validators, FormControl, FormGroup } from '@angular/forms';
// IMPORTAR PLANTILLA DE MODELO DE DATOS
import { ITableEmpleados } from 'src/app/model/reportes.model';
import { checkOptions, FormCriteriosBusqueda } from 'src/app/model/reportes.model';
// IMPORTAR SERVICIOS
import { PeriodoVacacionesService } from 'src/app/servicios/modulos/modulo-vacaciones/periodoVacaciones/periodo-vacaciones.service';
import { DatosGeneralesService } from 'src/app/servicios/generales/datosGenerales/datos-generales.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { AsignacionesService } from 'src/app/servicios/usuarios/asignaciones/asignaciones.service';
import { PlanGeneralService } from 'src/app/servicios/horarios/planGeneral/plan-general.service';
import { EmplCargosService } from 'src/app/servicios/usuarios/empleado/empleadoCargo/empl-cargos.service';
import { ReportesService } from 'src/app/servicios/reportes/reportes.service';
import { TimbresService } from 'src/app/servicios/timbres/timbrar/timbres.service';
import { Observable } from 'rxjs';
import { RolesService } from 'src/app/servicios/configuracion/parametrizacion/catRoles/roles.service';
@Component({
  selector: 'app-horario-multiple-empleado',
  templateUrl: './horario-multiple-empleado.component.html',
  styleUrls: ['./horario-multiple-empleado.component.css']
})

export class HorarioMultipleEmpleadoComponent implements OnInit {

  // VARIABLES VISTA DE PANTALLAS
  seleccionar: boolean = true;
  asignar: boolean = false;
  ventana_horario: boolean = false;
  ventana_busqueda: boolean = false;

  idEmpleadoLogueado: any;
  rolEmpleado: number; // VARIABLE DE ALMACENAMIENTO DE ROL DE EMPLEADO QUE INICIA SESION

  idCargosAcceso: Set<any> = new Set();
  idUsuariosAcceso: Set<any> = new Set();
  idSucursalesAcceso: Set<any> = new Set();
  idDepartamentosAcceso: Set<any> = new Set();

  // CONTROL DE CRITERIOS DE BUSQUEDA
  codigo = new FormControl('');
  cedula = new FormControl('', [Validators.minLength(2)]);
  nombre_emp = new FormControl('', [Validators.minLength(2)]);
  nombre_dep = new FormControl('', [Validators.minLength(2)]);
  nombre_suc = new FormControl('', [Validators.minLength(2)]);
  nombre_reg = new FormControl('', [Validators.minLength(2)]);
  nombre_carg = new FormControl('', [Validators.minLength(2)]);
  nombre_rol = new FormControl('', [Validators.minLength(2)]);
  seleccion = new FormControl('');

  // FILTROS SUCURSALES
  get filtroNombreSuc() { return this.restR.filtroNombreSuc }

  // FILTROS DEPARTAMENTOS
  get filtroNombreDep() { return this.restR.filtroNombreDep }

  // FILTROS EMPLEADO
  get filtroNombreEmp() { return this.restR.filtroNombreEmp };
  get filtroCodigo() { return this.restR.filtroCodigo };
  get filtroCedula() { return this.restR.filtroCedula };

  // FILTRO CARGOS
  get filtroNombreCarg() { return this.restR.filtroNombreCarg };

  // FILTRO REGIMEN
  get filtroNombreReg() { return this.restR.filtroNombreReg };

  //FILTRO ROL
  get filtroRolEmp() { return this.restR.filtroRolEmp };


  public _booleanOptions: FormCriteriosBusqueda = {
    bool_dep: false,
    bool_emp: false,
    bool_reg: false,
    bool_cargo: false,
  };

  mostrarTablas: boolean = false;

  // PRESENTACION DE INFORMACION DE ACUERDO AL CRITERIO DE BUSQUEDA
  departamentos: any = [];
  sucursales: any = [];
  empleados: any = [];
  regimen: any = [];
  cargos: any = [];

  selectionCarg = new SelectionModel<ITableEmpleados>(true, []);
  selectionDep = new SelectionModel<ITableEmpleados>(true, []);
  selectionEmp = new SelectionModel<ITableEmpleados>(true, []);
  selectionReg = new SelectionModel<ITableEmpleados>(true, []);

  // ITEMS DE PAGINACION DE LA TABLA CARGO
  pageSizeOptions_car = [5, 10, 20, 50];
  tamanio_pagina_car: number = 5;
  numero_pagina_car: number = 1;

  // ITEMS DE PAGINACION DE LA TABLA DEPARTAMENTO
  pageSizeOptions_dep = [5, 10, 20, 50];
  tamanio_pagina_dep: number = 5;
  numero_pagina_dep: number = 1;

  // ITEMS DE PAGINACION DE LA TABLA EMPLEADOS
  pageSizeOptions_emp = [5, 10, 20, 50];
  tamanio_pagina_emp: number = 5;
  numero_pagina_emp: number = 1;

  // ITEMS DE PAGINACION DE LA TABLA REGIMEN
  pageSizeOptions_reg = [5, 10, 20, 50];
  tamanio_pagina_reg: number = 5;
  numero_pagina_reg: number = 1;

  public check: checkOptions[];

  filteredOptProv: Observable<any[]>;
  roles: any = [];

  constructor(
    public informacion: DatosGeneralesService, // SERVICIO DE DATOS INFORMATIVOS DE USUARIOS
    public restCargo: EmplCargosService,
    public restPerV: PeriodoVacacionesService, // SERVICIO DATOS PERIODO DE VACACIONES
    public validar: ValidacionesService, // VARIABLE USADA PARA VALIDACIONES DE INGRESO DE LETRAS - NUMEROS
    public timbrar: TimbresService,
    public restR: ReportesService,
    public plan: PlanGeneralService,
    private toastr: ToastrService, // VARIABLE PARA MANEJO DE NOTIFICACIONES
    private asignaciones: AsignacionesService,
    private roleS: RolesService
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.rolEmpleado = parseInt(localStorage.getItem('rol') as string);

    this.check = this.restR.checkOptions([{ opcion: 'r' }, { opcion: 'd' }, { opcion: 'c' }, { opcion: 'e' }]);
    this.idUsuariosAcceso = this.asignaciones.idUsuariosAcceso;
    this.idDepartamentosAcceso = this.asignaciones.idDepartamentosAcceso;
    this.idSucursalesAcceso = this.asignaciones.idSucursalesAcceso;
    this.BuscarInformacionGeneral();
  }


  // METODO PARA DESTRUIR PROCESOS
  ngOnDestroy() {
    this.restR.GuardarCheckOpcion('');
    this.restR.DefaultFormCriterios();
    this.restR.DefaultValoresFiltros();
  }

  // METODO DE BUSQUEDA DE DATOS DE EMPLEADOS
  BuscarInformacionGeneral() {
    // LIMPIAR DATOS DE ALMACENAMIENTO
    this.departamentos = [];
    this.sucursales = [];
    this.empleados = [];
    this.regimen = [];
    this.cargos = [];
    this.informacion.ObtenerInformacionGeneral(1).subscribe((res: any[]) => {
      this.ProcesarDatos(res);
    }, err => {
      this.toastr.error(err.error.message)
    })
  }


  // METODO PARA PROCESAR LA INFORMACION DE LOS EMPLEADOS
  ProcesarDatos(informacion: any) {
    this.cargos = this.validar.ProcesarDatosCargos(informacion);
    this.regimen = this.validar.ProcesarDatosRegimen(informacion);
    this.empleados = this.validar.ProcesarDatosEmpleados(informacion);
    this.sucursales = this.validar.ProcesarDatosSucursales(informacion);
    this.departamentos = this.validar.ProcesarDatosDepartamentos(informacion);

    // FILTRO POR ASIGNACION USUARIO - DEPARTAMENTO
    // SI ES SUPERADMINISTRADOR NO FILTRAR
    if (this.rolEmpleado !== 1) {
      this.empleados = this.empleados.filter((empleado: any) => this.idUsuariosAcceso.has(empleado.id));

      // SI EL EMPLEADO TIENE ACCESO PERSONAL AÑADIR LOS DATOS A LOS ACCESOS CORRESPONDIENTES PARA VISUALIZAR
      const empleadoSesion = this.empleados.find((empleado: any) => empleado.id === this.idEmpleadoLogueado);
      if (empleadoSesion) {
        this.idSucursalesAcceso.add(empleadoSesion.id_suc);
        this.idDepartamentosAcceso.add(empleadoSesion.id_depa);
        this.idCargosAcceso.add(empleadoSesion.id_cargo_);
      }

      this.departamentos = this.departamentos.filter((departamento: any) => this.idDepartamentosAcceso.has(departamento.id));
      this.sucursales = this.sucursales.filter((sucursal: any) => this.idSucursalesAcceso.has(sucursal.id));
      this.regimen = this.regimen.filter((regimen: any) => this.idSucursalesAcceso.has(regimen.id_suc));

      this.empleados.forEach((empleado: any) => {
        this.idCargosAcceso.add(empleado.id_cargo_);
      });

      this.cargos = this.cargos.filter((cargo: any) =>
        this.idSucursalesAcceso.has(cargo.id_suc) && this.idCargosAcceso.has(cargo.id)
      );
    }

    this.mostrarTablas = true;
  }

  // METODO PARA ACTIVAR SELECCION MULTIPLE
  plan_multiple: boolean = false;
  plan_multiple_: boolean = false;
  HabilitarSeleccion() {
    this.plan_multiple = true;
    this.plan_multiple_ = true;
    this.auto_individual = false;
    this.activar_seleccion = false;
  }

  // METODO PARA MOSTRAR DATOS DE BUSQUEDA
  opcion: string;
  activar_boton: boolean = false;
  activar_seleccion: boolean = true;
  BuscarPorTipo(e: MatRadioChange) {
    console.log('ver opcion ', e.value)
    this.opcion = e.value;
    this.activar_boton = true;
    this.MostrarLista();
    switch (this.opcion) {
      case 'c':
        this.ControlarOpciones(true, false, false, false);
        this.ControlarBotones(true, false, true);
        break;
      case 'd':
        this.ControlarOpciones(false, true, false, false);
        this.ControlarBotones(true, false, true);
        break;
      case 'e':
        this.ControlarOpciones(false, false, true, false);
        this.ControlarBotones(true, false, true);
        break;
      case 'r':
        this.ControlarOpciones(false, false, false, true);
        this.ControlarBotones(true, false, true);
        break;
      default:
        this.ControlarOpciones(false, false, false, false);
        this.ControlarBotones(true, false, true);
        break;
    }
    this.restR.GuardarFormCriteriosBusqueda(this._booleanOptions);
    this.restR.GuardarCheckOpcion(this.opcion)

  }

  // METODO PARA CONTROLAR VISTA DE BOTONES
  ControlarBotones(seleccion: boolean, multiple: boolean, individual: boolean) {
    this.activar_seleccion = seleccion;
    this.plan_multiple = multiple;
    this.plan_multiple_ = multiple;
    this.auto_individual = individual;
  }

  ControlarOpciones(cargo: boolean, departamento: boolean, empleado: boolean, regimen: boolean) {
    this._booleanOptions.bool_cargo = cargo;
    this._booleanOptions.bool_dep = departamento;
    this._booleanOptions.bool_emp = empleado;
    this._booleanOptions.bool_reg = regimen;
  }

  // METODO PARA FILTRAR DATOS DE BUSQUEDA
  Filtrar(e: any, orden: number) {
    this.ControlarFiltrado(e);
    switch (orden) {
      case 1: this.restR.setFiltroNombreCarg(e); break;
      case 2: this.restR.setFiltroNombreDep(e); break;
      case 3: this.restR.setFiltroCodigo(e); break;
      case 4: this.restR.setFiltroCedula(e); break;
      case 5: this.restR.setFiltroNombreEmp(e); break;
      case 6: this.restR.setFiltroNombreSuc(e); break;
      case 7: this.restR.setFiltroNombreReg(e); break;
      case 8: this.restR.setFiltroRolEmp(e); break;
      default:
        break;
    }
  }

  // METODO PARA CONTROLAR FILTROS DE BUSQUEDA
  ControlarFiltrado(e: any) {
    if (e === '') {
      if (this.plan_multiple === true) {
        this.activar_seleccion = false;
      }
      else {
        if (this.activar_seleccion === false) {
          this.plan_multiple = true;
          this.auto_individual = false;
        }
      }
    }
    else {
      if (this.activar_seleccion === true) {
        this.activar_seleccion = false;
        this.plan_multiple_ = true;
        this.auto_individual = false;
      }
      else {
        this.plan_multiple = false;
      }
    }
  }

  // HABILITAR O DESHABILITAR EL ICONO DE AUTORIZACION INDIVIDUAL
  auto_individual: boolean = true;

  /** ************************************************************************************** **
   ** **                   METODOS DE SELECCION DE DATOS DE USUARIOS                      ** **
   ** ************************************************************************************** **/

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedReg() {
    const numSelected = this.selectionReg.selected.length;
    return numSelected === this.regimen.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleReg() {
    this.isAllSelectedReg() ?
      this.selectionReg.clear() :
      this.regimen.forEach((row: any) => this.selectionReg.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelReg(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedReg() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionReg.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedCarg() {
    const numSelected = this.selectionCarg.selected.length;
    return numSelected === this.cargos.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleCarg() {
    this.isAllSelectedCarg() ?
      this.selectionCarg.clear() :
      this.cargos.forEach((row: any) => this.selectionCarg.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelCarg(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedCarg() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionCarg.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedDep() {
    const numSelected = this.selectionDep.selected.length;
    return numSelected === this.departamentos.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleDep() {
    this.isAllSelectedDep() ?
      this.selectionDep.clear() :
      this.departamentos.forEach((row: any) => this.selectionDep.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelDep(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedDep() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionDep.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedEmp() {
    const numSelected = this.selectionEmp.selected.length;
    return numSelected === this.empleados.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleEmp() {
    this.isAllSelectedEmp() ?
      this.selectionEmp.clear() :
      this.empleados.forEach((row: any) => this.selectionEmp.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelEmp(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedEmp() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionEmp.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;

  }

  // EVENTO DE PAGINACION DE TABLAS
  ManejarPaginaResultados(e: PageEvent) {
    if (this._booleanOptions.bool_cargo === true) {
      this.tamanio_pagina_car = e.pageSize;
      this.numero_pagina_car = e.pageIndex + 1;
    }
    else if (this._booleanOptions.bool_dep === true) {
      this.tamanio_pagina_dep = e.pageSize;
      this.numero_pagina_dep = e.pageIndex + 1;
    }
    else if (this._booleanOptions.bool_emp === true) {
      this.tamanio_pagina_emp = e.pageSize;
      this.numero_pagina_emp = e.pageIndex + 1;
    }
    else if (this._booleanOptions.bool_reg === true) {
      this.tamanio_pagina_reg = e.pageSize;
      this.numero_pagina_reg = e.pageIndex + 1;
    }
  }

  // METODO DE SELECCTION DE TIPO DE PROCESO
  SeleccionarProceso(tipo: string, datos: any) {
    if (tipo === 'p') {
      this.PlanificarMultiple(datos);
    }
    else if (tipo === 'b') {
      this.VerPlanificacion(datos);
    }
    else if (tipo === 'e') {
      this.EliminarHorarios(datos);
    }
    else if (tipo === 'm') {
      this.PlanificarRotativos(datos);
    }
    else if (tipo === 't') {
      this.CargarTimbres(datos, this.timbre.value);
    }
    else if (tipo === 'c') {
      this.CargarPlantilla(datos);
    }
  }


  /** ************************************************************************************** **
   ** **                     METODOS DE PLANIFICACION DE HORARIOS                         ** **
   ** ************************************************************************************** **/

  // METODO PARA ABRI VENTANA DE ASIGNACION DE HORARIO
  idCargo: any;
  data_horario: any = [];
  PlanificarIndividual(usuario: any, tipo: string): void {
    if (tipo === 'p') {
      this.seleccionar = false;
      this.ventana_horario = true;
      this.data_horario = {
        pagina: 'rango_fecha',
        codigo: usuario.codigo,
        idCargo: usuario.id_cargo,
        idEmpleado: usuario.id,
        horas_trabaja: usuario.hora_trabaja,
      }
    }
    else {
      this.VerPlanificacion([usuario]);
    }
  }

  // METODO DE VALIDACION DE SELECCION MULTIPLE
  PlanificarMultiple(data: any) {
    if (data.length > 0) {
      this.Planificar(data);
    }
    else {
      this.toastr.warning('No ha seleccionado usuarios.', '', {
        timeOut: 6000,
      });
    }
  }

  // METODO PARA INGRESAR PLANIFICACION DE HORARIOS A VARIOS EMPLEADOS
  seleccionados: any = [];
  Planificar(seleccionados: any) {
    if (seleccionados.length === 1) {
      this.PlanificarIndividual(seleccionados[0], 'p');
    } else {
      this.seleccionados = seleccionados;
      this.seleccionar = false;
      this.asignar = true;
    }
  }

  // METODO DE VALIDACION DE SELECCION MULTIPLE - ROTATIVOS
  plan_rotativo: boolean = false;
  data_rotativo: any = []
  PlanificarRotativos(data: any) {
    this.data_horario = [];
    if (data.length > 0) {
      this.data_horario = {
        usuarios: data,
        pagina: 'multiple-empleado',
      }
      this.seleccionar = false;
      this.plan_rotativo = true;
    }
    else {
      this.toastr.warning('No ha seleccionado usuarios.', '', {
        timeOut: 6000,
      });
    }
  }

  cargar_plantilla: boolean = false;
  data_cargar: any = [];
  CargarPlantilla(data: any) {
    this.data_cargar = [];
    this.data_cargar = {
      usuariosSeleccionados: data,
      pagina: 'cargar-plantilla',
    }
    this.seleccionar = false;
    this.cargar_plantilla = true;
  }

  // METODO PARA TOMAR DATOS SELECCIONADOS
  GuardarRegistros(valor: any, tipo: string) {
    let usuarios = [];
    if (this.opcion === 'c') {
      usuarios = this.validar.ModelarCargo_(this.empleados, this.selectionCarg, valor.id, valor.id_suc)
    }
    else if (this.opcion === 'd') {
      usuarios = this.validar.ModelarDepartamento_(this.empleados, this.selectionDep, valor.id, valor.id_suc)
      console.log("ver usuarios", usuarios)
    }
    else if (this.opcion === 'r') {
      usuarios = this.validar.ModelarRegimen_(this.empleados, this.selectionReg, valor.id, valor.id_suc)
    }
    else {
      usuarios = this.validar.ModelarEmpleados_(this.empleados, this.selectionEmp);
      console.log("ver usuarios: ", usuarios)
    }
    this.SeleccionarProceso(tipo, usuarios);
  }

  // METODO PARA MOSTRAR METODOS DE CONSULTAS
  MostrarLista() {
    if (this.opcion === 'r') {
      this.nombre_reg.reset();
      this.nombre_suc.reset();
      this.selectionDep.clear();
      this.selectionCarg.clear();
      this.selectionEmp.clear();
      this.Filtrar('', 7);
      this.Filtrar('', 6);
    }
    else if (this.opcion === 'c') {
      this.nombre_carg.reset();
      this.nombre_suc.reset();
      this.selectionEmp.clear();
      this.selectionDep.clear();
      this.Filtrar('', 1);
      this.Filtrar('', 6);
    }
    else if (this.opcion === 'd') {
      this.nombre_dep.reset();
      this.nombre_suc.reset();
      this.selectionEmp.clear();
      this.selectionCarg.clear();
      this.Filtrar('', 2);
      this.Filtrar('', 6);
    }
    else if (this.opcion === 'e') {
      this.codigo.reset();
      this.cedula.reset();
      this.nombre_emp.reset();
      this.nombre_suc.reset();
      this.nombre_rol.reset();
      this.selectionDep.clear();
      this.selectionCarg.clear();
      this.Filtrar('', 3);
      this.Filtrar('', 4);
      this.Filtrar('', 5);
      this.Filtrar('', 6);
      this.Filtrar('', 8);
    }
  }

  // METODO PARA LIMPIAR FORMULARIOS
  LimpiarFormulario() {
    if (this._booleanOptions.bool_emp === true) {
      this.codigo.reset();
      this.cedula.reset();
      this.nombre_emp.reset();
      this._booleanOptions.bool_emp = false;
      this.selectionEmp.deselect();
      this.selectionEmp.clear();
    }

    if (this._booleanOptions.bool_dep) {
      this.nombre_dep.reset();
      this.nombre_suc.reset();
      this._booleanOptions.bool_dep = false;
      this.selectionDep.clear();
      this.selectionDep.deselect();
    }

    if (this._booleanOptions.bool_cargo) {
      this._booleanOptions.bool_cargo = false;
      this.selectionCarg.deselect();
      this.selectionCarg.clear();
    }

    if (this._booleanOptions.bool_reg) {
      this.nombre_reg.reset();
      this._booleanOptions.bool_reg = false;
      this.selectionReg.deselect();
      this.selectionReg.clear();
    }

    this.seleccion.reset();
    this.activar_boton = false;
  }

  // METODO DE VALIDACION DE INGRESO DE LETRAS Y NUMEROS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

  // METODO PARA VER PLANIFICACION
  resultados: any = [];
  VerPlanificacion(data: any) {
    if (data.length > 0) {
      this.resultados = data;
      this.seleccionar = false;
      this.ventana_busqueda = true;
    }
    else {
      this.toastr.warning('No ha seleccionado usuarios.', '', {
        timeOut: 6000,
      });
    }
  }

  // METODO PARA VER PANTALLA DETALLE HORARIO
  ver_horario: boolean = false;
  horario_id: number;
  pagina: string = '';
  VerDetalleHorario(id: number) {
    this.ver_horario = true;
    this.horario_id = id;
    this.pagina = 'planificar';
  }

  /** ********************************************************************************************* **
   ** **                               ELIMINAR PLANIFICACIONES HORARIAS                         ** **
   ** ********************************************************************************************* **/
  eliminar_plan: boolean = false;
  eliminar_horarios: any = [];
  EliminarHorarios(respuesta: any) {
    if (respuesta.length > 0) {
      this.eliminar_horarios = {
        pagina: 'planificar',
        usuario: respuesta
      }
      this.eliminar_plan = true;
      this.seleccionar = false;
    }
    else {
      this.toastr.warning('No ha seleccionado usuarios.', '', {
        timeOut: 6000,
      });
    }
  }

  /** **************************************************************************************** **
   ** **                          METODO DE REGISTRO DE HORARIOS ROTATIVOS                  ** **
   ** **************************************************************************************** **/

  // VENTANA PARA REGISTRAR PLANIFICACION DE HORARIOS DEL EMPLEADO
  rotativo: any = []
  registrar_rotativo: boolean = false;
  AbrirMultipleIndividual(usuario: any): void {
    this.rotativo = {
      idCargo: usuario.id_cargo,
      codigo: usuario.codigo,
      pagina: 'mutiple-horario',
      idEmpleado: usuario.id,
      horas_trabaja: usuario.hora_trabaja,
    }
    this.registrar_rotativo = true;
    this.seleccionar = false;
  }

  /** **************************************************************************************** **
   ** **                              METODO PARA CARGAR TIMBRE                             ** **
   ** **************************************************************************************** **/

  // METODO PARA CARGAR TIMBRES
  activar_cargar: boolean = false;

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO

  fechaInicioF = new FormControl('', Validators.required);
  fechaFinalF = new FormControl('', [Validators.required]);

  public timbre = new FormGroup({
    fechaInicioForm: this.fechaInicioF,
    fechaFinalForm: this.fechaFinalF,
  });

  // METODO PARA VER FORMULARIO PARA CARGAR TIMBRES
  VerCargarTimbres() {
    this.activar_boton = false;
    this.activar_cargar = true;
  }

  // METODO PARA CERRAR FORMULARIO PARA CARGAR TIMBRES
  CerrarCargarTimbres() {
    this.activar_boton = true;
    this.activar_cargar = false;
  }

  fechaInicioFormluxon: any;
  fechaFinFormluxon: any;

  // METODO PARA CARGAR TIMBRES EN LA ASISTENCIA DE LOS USUARIO
  CargarTimbres(data: any, timbre: any) {

    console.log("ver timbre", timbre)
    this.fechaInicioFormluxon = timbre.fechaInicioForm;
    console.log("fechaInicioFormluxon: ", this.fechaInicioFormluxon)
    this.fechaFinFormluxon = timbre.fechaFinalForm;
    console.log("ver data: ", data);
    if (data.length > 0) {
      var inicio = this.fechaInicioFormluxon.toFormat('yyyy-MM-dd');
      var fin = this.fechaFinFormluxon.toFormat('yyyy-MM-dd');

      console.log(" ver inicio: ", inicio)

      // VERIFICAR FECHAS INGRESADAS
      if (Date.parse(inicio) <= Date.parse(fin)) {

        // CONTROL DE ASIGNACION DE TIMBRES A LA ASISTENCIA
        var codigos = '';
        data.forEach((obj: any) => {
          if (codigos === '') {
            codigos = '\'' + obj.codigo + '\''
          }
          else {
            codigos = codigos + ', \'' + obj.codigo + '\''
          }
        })

        console.log("ver fin en metodo:", this.fechaFinFormluxon.plus({ days: 2 }).toFormat('yyyy-MM-dd'))
        console.log("ver inicio metodo ", this.fechaInicioFormluxon.toFormat('yyyy-MM-dd'))


        let usuarios = {
          codigo: codigos,
          fec_final: this.fechaFinFormluxon.plus({ days: 2 }).toFormat('yyyy-MM-dd'),
          fec_inicio: this.fechaInicioFormluxon.toFormat('yyyy-MM-dd'),
        };

        this.timbrar.BuscarTimbresPlanificacion(usuarios).subscribe(datos => {
          if (datos.message === 'vacio') {
            this.toastr.info(
              'No se han encontrado registros de marcaciones.', '', {
              timeOut: 6000,
            })
            this.CerrarCargarTimbres();
          }
          else if (datos.message === 'error') {
            this.toastr.info(
              'Ups!!! algo salio mal', 'No se cargaron todos los registros.', {
              timeOut: 6000,
            })
          }
          else {
            this.toastr.success(
              'Operación exitosa.', 'Registros cargados.', {
              timeOut: 6000,
            })
            this.CerrarCargarTimbres();
          }
        }, vacio => {
          this.toastr.info(
            'No se han encontrado registros de marcaciones.', '', {
            timeOut: 6000,
          })
        })
        this.CerrarCargarTimbres();
      }
      else {
        this.toastr.warning('Fecha hasta debe ser mayor a la fecha desde.', 'Verificar las fechas ingresadas.', {
          timeOut: 6000,
        });
      }
    }
    else {
      this.toastr.warning('No ha seleccionado usuarios.', '', {
        timeOut: 6000,
      });
    }
  }

}
