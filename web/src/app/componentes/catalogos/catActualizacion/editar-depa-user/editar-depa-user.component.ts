import { checkOptions, FormCriteriosBusqueda, ITableEmpleados } from 'src/app/model/reportes.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AsignacionesService } from 'src/app/servicios/asignaciones/asignaciones.service';
import { Component, OnInit } from '@angular/core';
import { MatRadioChange } from '@angular/material/radio';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';

import { ReportesService } from 'src/app/servicios/reportes/reportes.service';
import { EmplCargosService } from 'src/app/servicios/empleado/empleadoCargo/empl-cargos.service';
import { PlanGeneralService } from 'src/app/servicios/planGeneral/plan-general.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';

import { RolesService } from 'src/app/servicios/catalogos/catRoles/roles.service';
import { SucursalService } from 'src/app/servicios/sucursales/sucursal.service';
import { Observable, map, startWith } from 'rxjs';
import { DepartamentosService } from 'src/app/servicios/catalogos/catDepartamentos/departamentos.service';

@Component({
  selector: 'app-editar-depa-user',
  templateUrl: './editar-depa-user.component.html',
  styleUrl: './editar-depa-user.component.css'
})
export class EditarDepaUserComponent implements OnInit {

  listaUsuariosRol: any = []

  // VARIABLES VISTA DE PANTALLAS DEPA
  seleccionarDepa: boolean = true;
  asignarDepa: boolean = false;
  ventana_Depa: boolean = false;
  ventana_busquedaDepa: boolean = false;

  idEmpleadoLogueado: any;
  rolEmpleado: number; // VARIABLE DE ALMACENAMIENTO DE ROL DE EMPLEADO QUE INICIA SESION

  idCargosAcceso: Set<any> = new Set();
  idUsuariosAcceso: Set<any> = new Set();
  idSucursalesAcceso: Set<any> = new Set();
  idDepartamentosAcceso: Set<any> = new Set();

  // CONTROL DE CRITERIOS DE BUSQUEDA DEPARTAMENTO
  codigoDep = new FormControl('');
  cedulaDep = new FormControl('', [Validators.minLength(2)]);
  nombre_empDep = new FormControl('', [Validators.minLength(2)]);
  nombre_depDep = new FormControl('', [Validators.minLength(2)]);
  nombre_sucDep = new FormControl('', [Validators.minLength(2)]);
  nombre_regDep = new FormControl('', [Validators.minLength(2)]);
  nombre_cargDep = new FormControl('', [Validators.minLength(2)]);
  nombre_rolDep = new FormControl('', [Validators.minLength(2)])
  seleccionDep = new FormControl('');

  filtro_sucursal: any;

  //FILTRO DEPARTAMENTOS
  // FILTROS SUCURSALES
  get filtroNombreSucDep() {return this.restR.filtroNombreSuc}
  // FILTROS DEPARTAMENTOS
  get filtroNombreDepDep() { return this.restR.filtroNombreDep }
  // FILTROS EMPLEADO
  get filtroNombreEmpDep() { return this.restR.filtroNombreEmp };
  get filtroCodigoDep() { return this.restR.filtroCodigo };
  get filtroCedulaDep() { return this.restR.filtroCedula };
  get filtroNombreRolDep() { return this.restR.filtroNombreReg };
  // FILTRO CARGOS
  get filtroNombreCargDep() { return this.restR.filtroNombreCarg };
  // FILTRO REGIMEN
  get filtroNombreRegDep() { return this.restR.filtroNombreReg };
   // FILTRO REOL
  get filtroRolEmpDep() { return this.restR.filtroRolEmp};

  public _booleanOptionsDep: FormCriteriosBusqueda = {
    bool_dep: false,
    bool_emp: false,
    bool_reg: false,
    bool_cargo: false,
    bool_rol: true
  };

  mostrarTablas: boolean = false;

  departamentosDep: any = [];
  sucursalesDep: any = [];
  empleadosDep: any = [];
  regimenDep: any = [];
  cargosDep: any = [];

  lissucursale: any = [];

  selectionSucDep = new SelectionModel<ITableEmpleados>(true, []);
  selectionRolDep = new SelectionModel<ITableEmpleados>(true, []);
  selectionCargDep = new SelectionModel<ITableEmpleados>(true, []);
  selectionDepDep = new SelectionModel<ITableEmpleados>(true, []);
  selectionEmpDep = new SelectionModel<ITableEmpleados>(true, []);
  selectionRegDep = new SelectionModel<ITableEmpleados>(true, []);

  //PAGINACION DEPARTAMENTO
   // ITEMS DE PAGINACION DE LA TABLA SUCURSAL
   pageSizeOptions_sucDep = [5, 10, 20, 50];
   tamanio_pagina_sucDep: number = 5;
   numero_pagina_sucDep: number = 1;
 
   // ITEMS DE PAGINACION DE LA TABLA CARGO
   pageSizeOptions_carDep = [5, 10, 20, 50];
   tamanio_pagina_carDep: number = 5;
   numero_pagina_carDep: number = 1;
 
   // ITEMS DE PAGINACION DE LA TABLA DEPARTAMENTO
   pageSizeOptions_depDep = [5, 10, 20, 50];
   tamanio_pagina_depDep: number = 5;
   numero_pagina_depDep: number = 1;
 
   // ITEMS DE PAGINACION DE LA TABLA EMPLEADOS
   pageSizeOptions_empDep = [5, 10, 20, 50];
   tamanio_pagina_empDep: number = 5;
   numero_pagina_empDep: number = 1;
 
   // ITEMS DE PAGINACION DE LA TABLA REGIMEN
   pageSizeOptions_regDep = [5, 10, 20, 50];
   tamanio_pagina_regDep: number = 5;
   numero_pagina_regDep: number = 1;
 
   // ITEMS DE PAGINACION DE LA TABLA USUARIO ROL
   pageSizeOptions_rolDep = [5, 10, 20, 50];
   tamanio_pagina_rolDep: number = 5;
   numero_pagina_rolDep: number = 1;

   public check: checkOptions[];
   public checkDep: checkOptions[];

  idsucursal = new FormControl('', [Validators.required]);
  idDepa = new FormControl('', [Validators.required]);
  nombreRolDepF = new FormControl('', [Validators.required]);

  public formularioDep = new FormGroup({
    sucursal: this.idsucursal,
    idDepa: this.idDepa,
    nombreRolDepF: this.nombreRolDepF
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

    this,this.restRol.BuscarRoles().subscribe((respuesta: any) => {
      this.listaRoles = respuesta
      console.log('this.listaRoles: ',this.listaRoles)
    })

    this.BuscarInformacionGeneralDepa();
    this.ObtenerSucursales();
    this.ObtenerSucursalesPorEmpresa();
  }

  Lsucursales: any;
  ObtenerSucursalesPorEmpresa(){
    this.Lsucursales = []
    this.restSuc.BuscarSucursalEmpresa(this.idEmpresa).subscribe(datos => {
      this.Lsucursales = datos;
    });
  }
  Ldepatamentos: any;
  selecctSucu(id: any){
    this.Ldepatamentos = []
    if(id){
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

  BuscarInformacionGeneralDepa(){
    // LIMPIAR DATOS DE ALMACENAMIENTO
    this.departamentosDep = [];
    this.sucursalesDep = [];
    this.empleadosDep = [];
    this.regimenDep = [];
    this.cargosDep = [];
    this.informacion.ObtenerInformacionGeneralDep(1).subscribe((res: any[]) => {
      this.ProcesarDatosDep(res);
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
  LimpiarFormularioDep() {
    if (this._booleanOptionsDep.bool_emp) {
      this.codigoDep.reset();
      this.cedulaDep.reset();
      this.nombre_empDep.reset();
      this._booleanOptionsDep.bool_emp = false;
      this.selectionEmpDep.deselect();
      this.selectionEmpDep.clear();
    }

    if (this._booleanOptionsDep.bool_dep) {
      this.nombre_depDep.reset();
      this.nombre_sucDep.reset();
      this._booleanOptionsDep.bool_dep = false;
      this.selectionDepDep.deselect();
      this.selectionDepDep.clear();
    }

    if (this._booleanOptionsDep.bool_suc) {
      this.nombre_sucDep.reset();
      this._booleanOptionsDep.bool_suc = false;
      this.selectionSucDep.deselect();
      this.selectionSucDep.clear();
    }

    if (this._booleanOptionsDep.bool_reg) {
      this.nombre_regDep.reset();
      this._booleanOptionsDep.bool_reg = false;
      this.selectionRegDep.deselect();
      this.selectionRegDep.clear();
    }

    if (this._booleanOptionsDep.bool_cargo) {
      this._booleanOptionsDep.bool_cargo = false;
      this.selectionCargDep.deselect();
      this.selectionCargDep.clear();
    }

    this.seleccionDep.reset();
    this.activar_boton = false;
  }

  ProcesarDatosDep(informacion: any) {
    informacion.forEach((obj: any) => {
      //console.log('ver obj ', obj)
      this.sucursalesDep.push({
        id: obj.id_suc,
        sucursal: obj.name_suc
      })
  
      this.regimenDep.push({
        id: obj.id_regimen,
        nombre: obj.name_regimen,
        sucursal: obj.name_suc,
        id_suc: obj.id_suc
      })
  
      this.departamentosDep.push({
        id: obj.id_depa,
        departamento: obj.name_dep,
        sucursal: obj.name_suc,
        id_suc: obj.id_suc,
        id_regimen: obj.id_regimen,
      })
  
      this.cargosDep.push({
        id: obj.id_cargo_,
        nombre: obj.name_cargo,
        sucursal: obj.name_suc,
        id_suc: obj.id_suc
      })
  
      this.empleadosDep.push({
        id: obj.id_empleado,
        nombre: (obj.nombre).toUpperCase() + ' ' + (obj.apellido).toUpperCase(),
        codigo: obj.codigo,
        cedula: obj.cedula,
        correo: obj.correo,
        id_cargo: obj.id_cargo,
        id_contrato: obj.id_contrato,
        sucursal: obj.name_suc,
        id_suc: obj.id_suc,
        id_regimen: obj.id_regimen,
        id_depa: obj.id_depa,
        id_cargo_: obj.id_cargo_, // TIPO DE CARGO
        hora_trabaja: obj.hora_trabaja,
        rol: obj.name_rol
      })
    })
  
    this.OmitirDuplicadosDep();
    console.log('regimen ---', this.regimenDep)
  
    // FILTRO POR ASIGNACION USUARIO - DEPARTAMENTO
    // SI ES SUPERADMINISTRADOR NO FILTRAR
    console.log('id rol ', this.rolEmpleado)
    if (this.rolEmpleado !== 1) {
      console.log('ingresa')
      this.empleadosDep = this.empleadosDep.filter((empleado: any) => this.idUsuariosAcceso.has(empleado.id));
      this.departamentosDep = this.departamentosDep.filter((departamento: any) => this.idDepartamentosAcceso.has(departamento.id));
      this.sucursalesDep = this.sucursalesDep.filter((sucursal: any) => this.idSucursalesAcceso.has(sucursal.id));
      this.regimenDep = this.regimenDep.filter((regimen: any) => this.idSucursalesAcceso.has(regimen.id_suc));
  
      this.empleadosDep.forEach((empleado: any) => {
        this.idCargosAcceso.add(empleado.id_cargo_);
      });
  
      this.cargosDep = this.cargosDep.filter((cargo: any) =>
        this.idSucursalesAcceso.has(cargo.id_suc) && this.idCargosAcceso.has(cargo.id)
      );
    }
  
    this.mostrarTablas = true;
    console.log('regimen ', this.regimenDep)
  }

  OmitirDuplicadosDep() {
    // OMITIR DATOS DUPLICADOS EN LA VISTA DE SELECCION SUCURSALES
    let verificados_suc = this.sucursalesDep.filter((objeto: any, indice: any, valor: any) => {
      // COMPARA EL OBJETO ACTUAL CON LOS OBJETOS ANTERIORES EN EL ARRAY
      for (let i = 0; i < indice; i++) {
        if (valor[i].id === objeto.id) {
          return false; // SI ES UN DUPLICADO, RETORNA FALSO PARA EXCLUIRLO DEL RESULTADO
        }
      }
      return true; // SI ES UNICO, RETORNA VERDADERO PARA INCLUIRLO EN EL RESULTADO
    });
    this.sucursalesDep = verificados_suc;

    // OMITIR DATOS DUPLICADOS EN LA VISTA DE SELECCION REGIMEN
    let verificados_reg = this.regimenDep.filter((objeto: any, indice: any, valor: any) => {
      // COMPARA EL OBJETO ACTUAL CON LOS OBJETOS ANTERIORES EN EL ARRAY
      for (let i = 0; i < indice; i++) {
        if (valor[i].id === objeto.id && valor[i].id_suc === objeto.id_suc) {
          return false; // SI ES UN DUPLICADO, RETORNA FALSO PARA EXCLUIRLO DEL RESULTADO
        }
      }
      return true; // SI ES UNICO, RETORNA VERDADERO PARA INCLUIRLO EN EL RESULTADO
    });
    this.regimenDep = verificados_reg;

    // OMITIR DATOS DUPLICADOS EN LA VISTA DE SELECCION DEPARTAMENTOS
    let verificados_dep = this.departamentosDep.filter((objeto: any, indice: any, valor: any) => {
      // COMPARA EL OBJETO ACTUAL CON LOS OBJETOS ANTERIORES EN EL ARRAY
      for (let i = 0; i < indice; i++) {
        if (valor[i].id === objeto.id && valor[i].id_suc === objeto.id_suc) {
          return false; // SI ES UN DUPLICADO, RETORNA FALSO PARA EXCLUIRLO DEL RESULTADO
        }
      }
      return true; // SI ES UNICO, RETORNA VERDADERO PARA INCLUIRLO EN EL RESULTADO
    });
    this.departamentosDep = verificados_dep;

    // OMITIR DATOS DUPLICADOS EN LA VISTA DE SELECCION CARGOS
    let verificados_car = this.cargosDep.filter((objeto: any, indice: any, valor: any) => {
      // COMPARA EL OBJETO ACTUAL CON LOS OBJETOS ANTERIORES EN EL ARRAY
      for (let i = 0; i < indice; i++) {
        if (valor[i].id === objeto.id && valor[i].id_suc === objeto.id_suc) {
          return false; // SI ES UN DUPLICADO, RETORNA FALSO PARA EXCLUIRLO DEL RESULTADO
        }
      }
      return true; // SI ES UNICO, RETORNA VERDADERO PARA INCLUIRLO EN EL RESULTADO
    });
    this.cargosDep = verificados_car;
  }

  // HABILITAR O DESHABILITAR EL ICONO DE AUTORIZACION INDIVIDUAL
  auto_individualDep: boolean = true;
  activar_seleccionDep: boolean = true;
  // METODO PARA ACTIVAR SELECCION MULTIPLE
  plan_multipleDep: boolean = false;
  plan_multiple_Dep: boolean = false;
  HabilitarSeleccionDep() {
    this.plan_multipleDep = true;
    this.plan_multiple_Dep = true;
    this.auto_individualDep = false;
    this.activar_seleccionDep = false;
  }

  FiltrarDep(e: any, orden: number) {
    this.ControlarFiltradoDep(e);
    switch (orden) {
      case 1: this.restR.setFiltroNombreCarg(e); break;
      case 2: this.restR.setFiltroNombreDep(e); break;
      case 3: this.restR.setFiltroCodigo(e); break;
      case 4: this.restR.setFiltroCedula(e); break;
      case 5: this.restR.setFiltroNombreEmp(e); break;
      case 6: this.restR.setFiltroNombreSuc(e); break;
      case 7: this.restR.setFiltroNombreReg(e); break;
      case 8: this.restR.setFiltroRolEmp(e);break;
      default:
        break;
    }
  }

  // METODO PARA CONTROLAR FILTROS DE BUSQUEDA DEPARTAMENTOS
  ControlarFiltradoDep(e: any) {
    if (e === '') {
      if (this.plan_multipleDep === true) {
        this.activar_seleccionDep = false;
      }
      else {
        if (this.activar_seleccionDep === false) {
          this.plan_multipleDep = true;
          this.auto_individualDep = false;
        }
      }
    }
    else {
      if (this.activar_seleccionDep === true) {
        this.activar_seleccionDep = false;
        this.plan_multiple_Dep = true;
        this.auto_individualDep = false;
      }
      else {
        this.plan_multipleDep = false;
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
      this.MostrarListaDep();
      switch (this.opcion) {
        case 's':
          this.ControlarOpcionesDep(true, false, false, false, false);
          this.ControlarBotonesDep(true, false, true);
          break;
        case 'c':
          this.ControlarOpcionesDep(false, true, false, false, false);
          this.ControlarBotonesDep(true, false, true);
          break;
        case 'd':
          this.ControlarOpcionesDep(false, false, true, false, false);
          this.ControlarBotonesDep(true, false, true);
          break;
        case 'e':
          this.ControlarOpcionesDep(false, false, false, true, false);
          this.ControlarBotonesDep(true, false, true);
          break;
        case 'r':
          this.ControlarOpcionesDep(false, false, false, false, true);
          this.ControlarBotonesDep(true, false, true);
          break;
        default:
          this.ControlarOpcionesDep(false, false, false, false, false);
          this.ControlarBotonesDep(true, false, true);
          break;
      
    }
    
    this.restR.GuardarFormCriteriosBusqueda(this._booleanOptionsDep);
    this.restR.GuardarCheckOpcion(this.opcion)

  }

  // METODO PARA MOSTRAR METODOS DE CONSULTAS DEPA
  MostrarListaDep(){
    if (this.opcion === 'r') {
      this.nombre_regDep.reset();
      this.nombre_sucDep.reset();
      this.selectionDepDep.clear();
      this.selectionCargDep.clear();
      this.selectionEmpDep.clear();
      this.FiltrarDep('', 7);
      this.FiltrarDep('', 6);
    }
    else if (this.opcion === 'c') {
      this.nombre_cargDep.reset();
      this.nombre_sucDep.reset();
      this.selectionEmpDep.clear();
      this.selectionDepDep.clear();
      this.FiltrarDep('', 1);
      this.FiltrarDep('', 6);
    }
    else if (this.opcion === 'd') {
      this.nombre_depDep.reset();
      this.nombre_sucDep.reset();
      this.selectionEmpDep.clear();
      this.selectionCargDep.clear();
      this.FiltrarDep('', 2);
      this.FiltrarDep('', 6);
    }
    else if (this.opcion === 'e') {
      this.codigoDep.reset();
      this.cedulaDep.reset();
      this.nombre_empDep.reset();
      this.nombre_sucDep.reset();
      this.selectionDepDep.clear();
      this.selectionCargDep.clear();
      this.FiltrarDep('', 3);
      this.FiltrarDep('', 4);
      this.FiltrarDep('', 5);
      this.FiltrarDep('', 6);
    }
  }

  // METODO PARA CONTROLAR OPCIONES DE BUSQUEDA DEPA
  ControlarOpcionesDep(sucursal: boolean, cargo: boolean, departamento: boolean, empleado: boolean, regimen: boolean) {
    this._booleanOptionsDep.bool_suc = sucursal;
    this._booleanOptionsDep.bool_cargo = cargo;
    this._booleanOptionsDep.bool_dep = departamento;
    this._booleanOptionsDep.bool_emp = empleado;
    this._booleanOptionsDep.bool_reg = regimen;
  }

  // METODO PARA CONTROLAR VISTA DE BOTONES
  ControlarBotonesDep(seleccion: boolean, multiple: boolean, individual: boolean) {
    this.plan_multipleDep = multiple;
    this.plan_multiple_Dep = multiple;
    this.auto_individualDep = individual;
    this.activar_seleccionDep = seleccion;
  }

  /** ************************************************************************************** **
   ** **                   METODOS DE SELECCION DE DATOS DE USUARIOS                      ** **
   ** ************************************************************************************** **/
  //MANEJO DE CHECKBOX PARA LA TABLA DE DEPARTAMENTOS
  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedSucDep() {
    const numSelected = this.selectionSucDep.selected.length;
    return numSelected === this.sucursalesDep.length
  }
  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
 masterToggleSucDep() {
   this.isAllSelectedSucDep() ?
     this.selectionSucDep.clear() :
     this.sucursalesDep.forEach((row: any) => this.selectionSucDep.select(row));
 }
  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelSucDep(row?: ITableEmpleados): string {
   if (!row) {
     return `${this.isAllSelectedSucDep() ? 'select' : 'deselect'} all`;
   }
   return `${this.selectionSucDep.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
 }

  isAllSelectedRolDep() {
    const numSelected = this.selectionRolDep.selected.length;
    return numSelected === this.listaUsuariosRol.length
  }
  masterToggleRolDep() {
    this.isAllSelectedRolDep() ?
      this.selectionRolDep.clear() :
      this.listaUsuariosRol.forEach((row: any) => this.selectionRolDep.select(row));
  }
  checkboxLabelRolDep(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedRolDep() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionRolDep.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedRegDep() {
      const numSelected = this.selectionRegDep.selected.length;
      return numSelected === this.regimenDep.length
  }
  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleRegDep() {
      this.isAllSelectedRegDep() ?
        this.selectionRegDep.clear() :
        this.regimenDep.forEach((row: any) => this.selectionRegDep.select(row));
  }
  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelRegDep(row?: ITableEmpleados): string {
      if (!row) {
        return `${this.isAllSelectedRegDep() ? 'select' : 'deselect'} all`;
      }
      return `${this.selectionRegDep.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedCargDep() {
    const numSelected = this.selectionCargDep.selected.length;
    return numSelected === this.cargosDep.length
  }
  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleCargDep() {
    this.isAllSelectedCargDep() ?
      this.selectionCargDep.clear() :
      this.cargosDep.forEach((row: any) => this.selectionCargDep.select(row));
  }
  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelCargDep(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedCargDep() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionCargDep.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedDepDep() {
    const numSelected = this.selectionDepDep.selected.length;
    return numSelected === this.departamentosDep.length
  }
  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleDepDep() {
    this.isAllSelectedDepDep() ?
      this.selectionDepDep.clear() :
      this.departamentosDep.forEach((row: any) => this.selectionDepDep.select(row));
  }
  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelDepDep(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedDepDep() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionDepDep.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedEmpDep() {
    const numSelected = this.selectionEmpDep.selected.length;
    return numSelected === this.empleadosDep.length
  }
  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleEmpDep() {
    this.isAllSelectedEmpDep() ?
      this.selectionEmpDep.clear() :
      this.empleadosDep.forEach((row: any) => this.selectionEmpDep.select(row));
  }
  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelEmpDep(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedEmpDep() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionEmpDep.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;

  }

  // EVENTO DE PAGINACION DE TABLAS
  ManejarPaginaResultadosDep(e: PageEvent) {
    if (this._booleanOptionsDep.bool_suc === true) {
      this.tamanio_pagina_sucDep = e.pageSize;
      this.numero_pagina_sucDep = e.pageIndex + 1;
    }
    if (this._booleanOptionsDep.bool_cargo === true) {
      this.tamanio_pagina_carDep = e.pageSize;
      this.numero_pagina_carDep = e.pageIndex + 1;
    }
    else if (this._booleanOptionsDep.bool_dep === true) {
      this.tamanio_pagina_depDep = e.pageSize;
      this.numero_pagina_depDep = e.pageIndex + 1;
    }
    else if (this._booleanOptionsDep.bool_emp === true) {
      this.tamanio_pagina_empDep = e.pageSize;
      this.numero_pagina_empDep = e.pageIndex + 1;
    }
    else if (this._booleanOptionsDep.bool_reg === true) {
      this.tamanio_pagina_regDep = e.pageSize;
      this.numero_pagina_regDep = e.pageIndex + 1;
    }
    else if (this._booleanOptionsDep.bool_rol === true) {
      this.tamanio_pagina_rolDep = e.pageSize;
      this.numero_pagina_rolDep = e.pageIndex + 1;
    }
  }

     // CONSULTA DE LOS DATOS REGIMEN DEP
     ModelarRegimenDep(id: number, tipo: string, sucursal: any) {
      let usuarios: any = [];
      if (id === 0 || id === undefined) {
        this.empleadosDep.forEach((empl: any) => {
          this.selectionRegDep.selected.find(selec => {
            if (empl.id_regimen === selec.id && empl.id_suc === selec.id_suc) {
              usuarios.push(empl)
            }
          })
        })
      }
      else {
        this.empleadosDep.forEach((empl: any) => {
          if (empl.id_regimen === id && empl.id_suc === sucursal) {
            usuarios.push(empl)
          }
        })
      }
      this.SeleccionarProcesoDep(tipo, usuarios);
    }
  
    // METODO PARA MOSTRAR DATOS DE CARGOS DEP
    ModelarCargoDep(id: number, tipo: string, sucursal: number) {
      let usuarios: any = [];
      if (id === 0 || id === undefined) {
        this.empleadosDep.forEach((empl: any) => {
          this.selectionCargDep.selected.find(selec => {
            if (empl.id_cargo_ === selec.id && empl.id_suc === selec.id_suc) {
              usuarios.push(empl)
            }
          })
        })
      }
      else {
        this.empleadosDep.forEach((empl: any) => {
          if (empl.id_cargo_ === id && empl.id_suc === sucursal) {
            usuarios.push(empl)
          }
        })
      }
  
      this.SeleccionarProcesoDep(tipo, usuarios);
    }
  
    // METODO PARA MOSTRAR DATOS DE DEPARTAMENTOS DEP
    ModelarDepartamentosDep(id: number, tipo: string, sucursal: number) {
      let usuarios: any = [];
      if (id === 0 || id === undefined) {
        this.empleadosDep.forEach((empl: any) => {
          this.selectionDepDep.selected.find(selec => {
            if (empl.id_depa === selec.id && empl.id_suc === selec.id_suc) {
              usuarios.push(empl)
            }
          })
        })
      }
      else {
        this.empleadosDep.forEach((empl: any) => {
          if (empl.id_depa === id && empl.id_suc === sucursal) {
            usuarios.push(empl)
          }
        })
      }
  
      console.log('ver usuarios ', usuarios);
  
      this.SeleccionarProcesoDep(tipo, usuarios);
    }
  
    // METODO PARA MOSTRAR DATOS DE EMPLEADOS DEP
    ModelarEmpleadosDep(tipo: string) {
      let respuesta: any = [];
      this.empleadosDep.forEach((obj: any) => {
        this.selectionEmpDep.selected.find(obj1 => {
          if (obj1.id === obj.id) {
            respuesta.push(obj)
          }
        })
      })
  
      this.SeleccionarProcesoDep(tipo, respuesta);
    }


    SeleccionarProcesoDep(tipo: string, datos: any) {
      if (tipo === 'p') {
        this.abriEditarDepaUser(datos);
      }
      else if (tipo === 'b') {
        this.abriEditarDepaUser(datos);
      }
      else if (tipo === 'e') {
        this.abriEditarDepaUser(datos);
      }
      else if (tipo === 'm') {
        this.abriEditarDepaUser(datos);
      }
      else if (tipo === 't') {
        this.abriEditarDepaUser(datos);
      }
      else if (tipo === 'c') {
        this.abriEditarDepaUser(datos);
      }
    }

    // METODO PARA TOMAR DATOS SELECCIONADOS DEP
  MetodosFiltroDep(valor: any, tipo: string) {
    if (this.opcion === 'c') {
      this.ModelarCargoDep(valor.id, tipo, valor.id_suc);
    }
    else if (this.opcion === 'd') {
      this.ModelarDepartamentosDep(valor.id, tipo, valor.id_suc);
    }
    else if (this.opcion === 'r') {
      this.ModelarRegimenDep(valor.id, tipo, valor.id_suc);
    }
    else {
      this.ModelarEmpleadosDep(tipo);
    }

  }

  abriEditarDepaUser(datos: any) {    
    if (datos.length > 0) {
      const data = {
        idSucursal: this.formularioDep.get('sucursal')?.value,
        idDepartamento: this.formularioDep.get('idDepa')?.value,
        idRol: this.formularioDep.get('nombreRolDepF')?.value,
        listaUsuarios: datos
      }

      if(data.idSucursal == ''){
        this.toastr.warning('Seleccione la sucursal.', '', {
          timeOut: 4000,
        });
      }else if(data.idDepartamento == '' ){
        this.toastr.warning('Seleccione el departamento.', '', {
          timeOut: 4000,
        });
      }else if(data.idRol == ''){
        this.toastr.warning('Seleccione el rol.', '', {
          timeOut: 4000,
        });
      }else{
        this.restDep.ActualizarUserDepa(data).subscribe((res: any) => {
          this.toastr.success(res.message, '', {
            timeOut: 4000,
          });
          this.LimpiarFormularioDep();
        }, (error: any) => {
          this.toastr.error(error, '', {
            timeOut: 4000,
          });
        })
      }
      
    } else {
      this.toastr.warning('Seleccione usuarios para actualizar.', '', {
        timeOut: 4000,
      });
    }
  }


}
