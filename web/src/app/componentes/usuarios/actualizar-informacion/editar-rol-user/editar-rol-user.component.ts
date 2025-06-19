import { checkOptions, FormCriteriosBusqueda, ITableEmpleados } from 'src/app/model/reportes.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, map, startWith } from 'rxjs';
import { AsignacionesService } from 'src/app/servicios/usuarios/asignaciones/asignaciones.service';
import { Component, OnInit } from '@angular/core';
import { MatRadioChange } from '@angular/material/radio';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';

import { RolesService } from 'src/app/servicios/configuracion/parametrizacion/catRoles/roles.service';
import { LoginService } from 'src/app/servicios/login/login.service';
import { SucursalService } from 'src/app/servicios/configuracion/localizacion/sucursales/sucursal.service';
import { ReportesService } from 'src/app/servicios/reportes/opcionesReportes/reportes.service';
import { EmplCargosService } from 'src/app/servicios/usuarios/empleado/empleadoCargo/empl-cargos.service';
import { PlanGeneralService } from 'src/app/servicios/horarios/planGeneral/plan-general.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { DepartamentosService } from 'src/app/servicios/configuracion/localizacion/catDepartamentos/departamentos.service';
import { DatosGeneralesService } from 'src/app/servicios/generales/datosGenerales/datos-generales.service';

@Component({
  selector: 'app-editar-rol-user',
  standalone: false,
  templateUrl: './editar-rol-user.component.html',
  styleUrl: './editar-rol-user.component.css'
})
export class EditarRolUserComponent implements OnInit {

  listaUsuariosRol: any = []

  // VARIABLES VISTA DE PANTALLAS ROLES
  seleccionarRol: boolean = true;
  asignarRol: boolean = false;
  ventana_roles: boolean = false;
  ventana_busquedaRol: boolean = false;

  idEmpleadoLogueado: any;
  rolEmpleado: number; // VARIABLE DE ALMACENAMIENTO DE ROL DE EMPLEADO QUE INICIA SESION

  idCargosAcceso: Set<any> = new Set();
  idUsuariosAcceso: Set<any> = new Set();
  idSucursalesAcceso: Set<any> = new Set();
  idDepartamentosAcceso: Set<any> = new Set();

  // CONTROL DE CRITERIOS DE BUSQUEDA ROL
  codigoRol = new FormControl('');
  cedulaRol = new FormControl('', [Validators.minLength(2)]);
  nombre_empRol = new FormControl('', [Validators.minLength(2)]);
  nombre_depRol = new FormControl('', [Validators.minLength(2)]);
  nombre_sucRol = new FormControl('', [Validators.minLength(2)]);
  nombre_regRol = new FormControl('', [Validators.minLength(2)]);
  nombre_cargRol = new FormControl('', [Validators.minLength(2)]);
  nombre_rolRol = new FormControl('', [Validators.minLength(2)])
  seleccionRol = new FormControl('');


  filtro_sucursal: any;
  filteredRoles!: Observable<any[]>;

  //FILTRO ROLES
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
  // FILTRO REOL
  get filtroRolEmp() { return this.restR.filtroRolEmp };


  public _booleanOptions: FormCriteriosBusqueda = {
    bool_dep: false,
    bool_emp: false,
    bool_reg: false,
    bool_cargo: false,
    bool_rol: true
  };

  mostrarTablas: boolean = false;

  // PRESENTACION DE INFORMACION DE ACUERDO AL CRITERIO DE BUSQUEDA
  departamentos: any = [];
  sucursales: any = [];
  empleados: any = [];
  regimen: any = [];
  cargos: any = [];

  selectionSucRol = new SelectionModel<ITableEmpleados>(true, []);
  selectionRol = new SelectionModel<ITableEmpleados>(true, []);
  selectionCarg = new SelectionModel<ITableEmpleados>(true, []);
  selectionDep = new SelectionModel<ITableEmpleados>(true, []);
  selectionEmp = new SelectionModel<ITableEmpleados>(true, []);
  selectionReg = new SelectionModel<ITableEmpleados>(true, []);

  lissucursale: any = [];

  // ITEMS DE PAGINACION DE LA TABLA SUCURSAL
  pageSizeOptions_suc = [5, 10, 20, 50];
  tamanio_pagina_suc: number = 5;
  numero_pagina_suc: number = 1;

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

  // ITEMS DE PAGINACION DE LA TABLA USUARIO ROL
  pageSizeOptions_rol = [5, 10, 20, 50];
  tamanio_pagina_rol: number = 5;
  numero_pagina_rol: number = 1;

  public check: checkOptions[];
  public checkDep: checkOptions[];

  nombreRolF = new FormControl('', [Validators.required]);

  public formulario = new FormGroup({
    nombreRolF: this.nombreRolF
  });

  listaRoles: any = [];
  idEmpresa: any;

  constructor(
    private restSuc: SucursalService,//SERVICIO DE DATOS PARA OBTENER EL LISTADO DE LAS SUCURSALES
    private restDep: DepartamentosService,//SERVICIO DE DATOS PARA OBTENER EL DEPA POR EL ID DE LA SUCURSAL
    private restRol: RolesService, //SERVICIO DE DATOS PARA OBTENER EL ROL DEL USUARIO
    public informacion: DatosGeneralesService, // SERVICIO DE DATOS INFORMATIVOS DE USUARIOS
    public restCargo: EmplCargosService,
    public validar: ValidacionesService, // VARIABLE USADA PARA VALIDACIONES DE INGRESO DE LETRAS - NUMEROS
    public restR: ReportesService,
    public plan: PlanGeneralService,
    private toastr: ToastrService, // VARIABLE PARA MANEJO DE NOTIFICACIONES
    private asignaciones: AsignacionesService,
    public ventana: MatDialog, // VARIABLE DE MANEJO DE VENTANAS
    public loginService: LoginService,
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado') as string);
    this.idEmpresa = parseInt(localStorage.getItem('empresa') as string);
  }

  ngOnInit(): void {
    this.rolEmpleado = parseInt(localStorage.getItem('rol') as string);
    this.check = this.restR.checkOptions([{ opcion: 's' }, { opcion: 'r' }, { opcion: 'd' }, { opcion: 'c' }, { opcion: 'e' }]);
    this.checkDep = this.restR.checkOptions([{ opcion: 's' }, { opcion: 'r' }, { opcion: 'd' }, { opcion: 'c' }, { opcion: 'e' }]);
    this.idUsuariosAcceso = this.asignaciones.idUsuariosAcceso;
    this.idDepartamentosAcceso = this.asignaciones.idDepartamentosAcceso;
    this.idSucursalesAcceso = this.asignaciones.idSucursalesAcceso;

    this, this.restRol.BuscarRoles().subscribe((respuesta: any) => {
      this.listaRoles = respuesta
      console.log('this.listaRoles: ', this.listaRoles)
    });

    this.filteredRoles = this.nombre_rolRol.valueChanges.pipe(
      startWith(''),
      map(value => this.filtrarRoles(value || ''))
    );

    this.nombre_rolRol.valueChanges.subscribe(valor => {
      this.Filtrar(valor, 8);
    });
    

    this.BuscarInformacionGeneral();
    this.ObtenerSucursales();
    this.ObtenerSucursalesPorEmpresa();
  }

  Lsucursales: any;
  ObtenerSucursalesPorEmpresa() {
    this.Lsucursales = []
    this.restSuc.BuscarSucursalEmpresa(this.idEmpresa).subscribe(datos => {
      this.Lsucursales = datos;
    });
  }

  filtrarRoles(valor: string): any[] {
    const filtro = valor.toLowerCase();
    return this.listaRoles.filter(rol =>
      rol.nombre.toLowerCase().includes(filtro)
    );
  }

  Ldepatamentos: any;
  selecctSucu(id: any) {
    this.Ldepatamentos = []
    if (id) {
      this.restDep.BuscarDepartamentoSucursal(id).subscribe(datos => {
        this.Ldepatamentos = datos;
      }, (error: any) => {
        this.toastr.error('No se encontraron departamentos en esa sucursal')
      })
    }
  }

  sucursalForm = new FormControl('', Validators.required);
  filteredOptions: Observable<any[]>;
  sucursal: any = [];
  // METODO DE FILTRACION DE DATOS DE SUCURSALES
  private _filter(value: string): any {
    if (value != null) {
      const filterValue = value.toLowerCase();
      return this.sucursal.filter((sucursal: any) => sucursal.nombre.toLowerCase().includes(filterValue));
    }
  }
  // METODO PARA BUSCAR SUCURSALES
  ObtenerSucursales() {
    this.restSuc.BuscarSucursal().subscribe(res => {
      this.lissucursale = res;
      this.filteredOptions = this.sucursalForm.valueChanges
        .pipe(
          startWith(''),
          map((value: any) => this._filter(value))
        );
    });
  }
  // QUITAR TODOS LOS DATOS SELECCIONADOS DE LA PROVINCIA INDICADA
  limpiarData: any = [];
  QuitarTodos() {

  }
  // METODO PARA OBTENER DEPARTAMENTOS DEL ESTABLECIMIENTO SELECCIONADO
  Listdepartamentos: any = [];
  ObtenerDepartamentos() {
    this.QuitarTodos();
  }

  // METODO DE BUSQUEDA DE DATOS GENERALES DEL EMPLEADO
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

  // METODO DE VALIDACION DE INGRESO DE LETRAS Y NUMEROS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

  // METODO PARA LIMPIAR FORMULARIOS
  LimpiarFormulario() {
    if (this._booleanOptions.bool_emp) {
      this.codigoRol.reset();
      this.cedulaRol.reset();
      this.nombre_empRol.reset();
      this._booleanOptions.bool_emp = false;
      this.selectionEmp.deselect();
      this.selectionEmp.clear();
    }

    if (this._booleanOptions.bool_dep) {
      this.nombre_depRol.reset();
      this.nombre_sucRol.reset();
      this._booleanOptions.bool_dep = false;
      this.selectionDep.deselect();
      this.selectionDep.clear();
    }

    if (this._booleanOptions.bool_suc) {
      this.nombre_sucRol.reset();
      this._booleanOptions.bool_suc = false;
      this.selectionSucRol.deselect();
      this.selectionSucRol.clear();
    }

    if (this._booleanOptions.bool_reg) {
      this.nombre_regRol.reset();
      this._booleanOptions.bool_reg = false;
      this.selectionReg.deselect();
      this.selectionReg.clear();
    }

    if (this._booleanOptions.bool_cargo) {
      this._booleanOptions.bool_cargo = false;
      this.selectionCarg.deselect();
      this.selectionCarg.clear();
    }

    this.seleccionRol.reset();
    this.activar_boton = false;
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

  // HABILITAR O DESHABILITAR EL ICONO DE AUTORIZACION INDIVIDUAL
  auto_individual: boolean = true;

  // METODO PARA ACTIVAR SELECCION MULTIPLE
  plan_multiple: boolean = false;
  plan_multiple_: boolean = false;
  HabilitarSeleccion() {
    this.plan_multiple = true;
    this.plan_multiple_ = true;
    this.auto_individual = false;
    this.activar_seleccion = false;
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


  // METODO PARA MOSTRAR DATOS DE BUSQUEDA
  opcion: string;
  activar_boton: boolean = false;
  activar_seleccion: boolean = true;
  BuscarPorTipo(e: MatRadioChange, tipo: string) {
    this.opcion = e.value;
    this.activar_boton = true;
    if (tipo == 'rol') {
      this.MostrarLista();
      switch (this.opcion) {
        case 's':
          this.ControlarOpciones(true, false, false, false, false);
          this.ControlarBotones(true, false, true);
          break;
        case 'c':
          this.ControlarOpciones(false, true, false, false, false);
          this.ControlarBotones(true, false, true);
          break;
        case 'd':
          this.ControlarOpciones(false, false, true, false, false);
          this.ControlarBotones(true, false, true);
          break;
        case 'e':
          this.ControlarOpciones(false, false, false, true, false);
          this.ControlarBotones(true, false, true);
          break;
        case 'r':
          this.ControlarOpciones(false, false, false, false, true);
          this.ControlarBotones(true, false, true);
          break;
        default:
          this.ControlarOpciones(false, false, false, false, false);
          this.ControlarBotones(true, false, true);
          break;
      }
    }

    this.restR.GuardarFormCriteriosBusqueda(this._booleanOptions);
    this.restR.GuardarCheckOpcion(this.opcion)

  }

  // METODO PARA MOSTRAR METODOS DE CONSULTAS ROL
  MostrarLista() {
    if (this.opcion === 's') {
      this.nombre_regRol.reset();
      this.nombre_sucRol.reset();
      this.selectionDep.clear();
      this.selectionCarg.clear();
      this.selectionEmp.clear();
      this.Filtrar('', 1);
    }
    else if (this.opcion === 'r') {
      this.nombre_regRol.reset();
      this.nombre_sucRol.reset();
      this.selectionDep.clear();
      this.selectionCarg.clear();
      this.selectionEmp.clear();
      this.Filtrar('', 7);
      this.Filtrar('', 6);
    }
    else if (this.opcion === 'c') {
      this.nombre_cargRol.reset();
      this.nombre_sucRol.reset();
      this.selectionEmp.clear();
      this.selectionDep.clear();
      this.Filtrar('', 1);
      this.Filtrar('', 6);
    }
    else if (this.opcion === 'd') {
      this.nombre_depRol.reset();
      this.nombre_sucRol.reset();
      this.selectionEmp.clear();
      this.selectionCarg.clear();
      this.Filtrar('', 2);
      this.Filtrar('', 6);
    }
    else if (this.opcion === 'e') {
      this.codigoRol.reset();
      this.cedulaRol.reset();
      this.nombre_empRol.reset();
      this.nombre_sucRol.reset();
      this.selectionDep.clear();
      this.selectionCarg.clear();
      this.Filtrar('', 3);
      this.Filtrar('', 4);
      this.Filtrar('', 5);
      this.Filtrar('', 6);
    }
  }

  // METODO PARA CONTROLAR OPCIONES DE BUSQUEDA ROL
  ControlarOpciones(sucursal: boolean, cargo: boolean, departamento: boolean, empleado: boolean, regimen: boolean) {
    this._booleanOptions.bool_suc = sucursal;
    this._booleanOptions.bool_cargo = cargo;
    this._booleanOptions.bool_dep = departamento;
    this._booleanOptions.bool_emp = empleado;
    this._booleanOptions.bool_reg = regimen;
  }

  // METODO PARA CONTROLAR VISTA DE BOTONES
  ControlarBotones(seleccion: boolean, multiple: boolean, individual: boolean) {
    this.plan_multiple = multiple;
    this.plan_multiple_ = multiple;
    this.auto_individual = individual;
    this.activar_seleccion = seleccion;
  }


  /** ************************************************************************************** **
   ** **                   METODOS DE SELECCION DE DATOS DE USUARIOS                      ** **
   ** ************************************************************************************** **/

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedSuc() {
    const numSelected = this.selectionSucRol.selected.length;
    return numSelected === this.sucursales.length
  }
  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleSuc() {
    this.isAllSelectedSuc() ?
      this.selectionSucRol.clear() :
      this.sucursales.forEach((row: any) => this.selectionSucRol.select(row));
  }
  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelSuc(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedSuc() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionSucRol.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  isAllSelectedRol() {
    const numSelected = this.selectionRol.selected.length;
    return numSelected === this.listaUsuariosRol.length
  }
  masterToggleRol() {
    this.isAllSelectedRol() ?
      this.selectionRol.clear() :
      this.listaUsuariosRol.forEach((row: any) => this.selectionRol.select(row));
  }
  checkboxLabelRol(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedRol() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionRol.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }


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
    if (this._booleanOptions.bool_suc === true) {
      this.tamanio_pagina_suc = e.pageSize;
      this.numero_pagina_suc = e.pageIndex + 1;
    }
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
    else if (this._booleanOptions.bool_rol === true) {
      this.tamanio_pagina_rol = e.pageSize;
      this.numero_pagina_rol = e.pageIndex + 1;
    }
  }

  // METODO DE SELECCTION DE TIPO DE PROCESO DEP
  SeleccionarProceso(tipo: string, datos: any) {
    if (tipo === 'p') {
      this.AbrirEditarRolUser(datos);
    }
    else if (tipo === 'b') {
      this.AbrirEditarRolUser(datos);
    }
    else if (tipo === 'e') {
      this.AbrirEditarRolUser(datos);
    }
    else if (tipo === 'm') {
      this.AbrirEditarRolUser(datos);
    }
    else if (tipo === 't') {
      this.AbrirEditarRolUser(datos);
    }
    else if (tipo === 'c') {
      this.AbrirEditarRolUser(datos);
    }
  }

  // METODO PARA TOMAR DATOS SELECCIONADOS
  MetodosFiltro(valor: any, tipo: string) {
    let usuarios = [];
    if (this.opcion === 's') {
      usuarios = this.validar.ModelarSucursal_(this.empleados, this.selectionSucRol, valor.id);
    }
    else if (this.opcion === 'c') {
      usuarios = this.validar.ModelarCargo_(this.empleados, this.selectionCarg, valor.id, valor.id_suc);
    }
    else if (this.opcion === 'd') {
      usuarios = this.validar.ModelarDepartamento_(this.empleados, this.selectionDep, valor.id, valor.id_suc);
    }
    else if (this.opcion === 'r') {
      usuarios = this.validar.ModelarRegimen_(this.empleados, this.selectionReg, valor.id, valor.id_suc);
    }
    else {
      usuarios = this.validar.ModelarEmpleados_(this.empleados, this.selectionEmp);
    }
    this.SeleccionarProceso(tipo, usuarios);
  }

  // METODO PARA EDITAR ROL DEL USUARIO SELECCIONADO
  AbrirEditarRolUser(datos: any) {
    if (datos.length > 0) {
      const data = {
        idRol: this.formulario.get('nombreRolF')?.value,
        listaUsuarios: datos
      }

      if (data.idRol == '') {
        this.toastr.warning('Seleccione el rol.', '', {
          timeOut: 4000,
        });
      } else {
        var existeUserLogueado = false;
        datos.forEach((item: any) => {
          if (item.id == this.idEmpleadoLogueado) {
            existeUserLogueado = true;
          }
        })

        this.restRol.ActualizarRoles(data).subscribe((res: any) => {
          this.toastr.success(res.message, '', {
            timeOut: 4000,
          });
          this.LimpiarFormulario();
          this.BuscarInformacionGeneral();
          if (res.status == 200 && existeUserLogueado == true) {
            this.loginService.logout()
          };
        })
      }
    } else {
      this.toastr.warning('Seleccione usuarios para actualizar.', '', {
        timeOut: 4000,
      });
    }
  }

}
