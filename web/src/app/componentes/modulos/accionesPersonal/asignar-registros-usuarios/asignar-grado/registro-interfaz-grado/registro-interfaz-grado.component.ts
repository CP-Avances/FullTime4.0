import { SelectionModel } from '@angular/cdk/collections';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatRadioChange } from '@angular/material/radio';
import { ToastrService } from 'ngx-toastr';
import { Observable, map, startWith } from 'rxjs';
import { checkOptions, FormCriteriosBusqueda, ITableEmpleados } from 'src/app/model/reportes.model';
import { DepartamentosService } from 'src/app/servicios/configuracion/localizacion/catDepartamentos/departamentos.service';
import { SucursalService } from 'src/app/servicios/configuracion/localizacion/sucursales/sucursal.service';
import { RolesService } from 'src/app/servicios/configuracion/parametrizacion/catRoles/roles.service';
import { DatosGeneralesService } from 'src/app/servicios/generales/datosGenerales/datos-generales.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { PlanGeneralService } from 'src/app/servicios/horarios/planGeneral/plan-general.service';
import { CatGradoService } from 'src/app/servicios/modulos/modulo-acciones-personal/catGrado/cat-grado.service';
import { ReportesService } from 'src/app/servicios/reportes/reportes.service';
import { AsignacionesService } from 'src/app/servicios/usuarios/asignaciones/asignaciones.service';
import { EmplCargosService } from 'src/app/servicios/usuarios/empleado/empleadoCargo/empl-cargos.service';

@Component({
  selector: 'app-registro-interfaz-grado',
  standalone: false,
  templateUrl: './registro-interfaz-grado.component.html',
  styleUrl: './registro-interfaz-grado.component.css'
})

export class RegistroInterfazGradoComponent {

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
  
    // FILTROS SUCURSALES
    get filtroNombreSucDep() { return this.restR.filtroNombreSuc }
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
    get filtroRolEmpDep() { return this.restR.filtroRolEmp };
  
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
        private asignaciones: AsignacionesService,
        private resGrados: CatGradoService,
        private restSuc: SucursalService,//SERVICIO DE DATOS PARA OBTENER EL LISTADO DE LAS SUCURSALES
        private restDep: DepartamentosService,//SERVICIO DE DATOS PARA OBTENER EL DEPA POR EL ID DE LA SUCURSAL
        private restRol: RolesService, //SERVICIO DE DATOS PARA OBTENER EL ROL DEL USUARIO
        private toastr: ToastrService, // VARIABLE PARA MANEJO DE NOTIFICACIONES
        public informacion: DatosGeneralesService, // SERVICIO DE DATOS INFORMATIVOS DE USUARIOS
        public restCargo: EmplCargosService,
        public validar: ValidacionesService, // VARIABLE USADA PARA VALIDACIONES DE INGRESO DE LETRAS - NUMEROS
        public ventana: MatDialog, // VARIABLE DE MANEJO DE VENTANAS
        public restR: ReportesService,
        public plan: PlanGeneralService,
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
          })
      
          this.BuscarInformacionGeneralDepa();
          this.ObtenerSucursales();
          this.ObtenerSucursalesPorEmpresa();
        }
      
        Lgrados: any;
        ObtenerSucursalesPorEmpresa() {
          this.Lgrados = []
          this.resGrados.ConsultarGrados().subscribe(datos => {
            this.Lgrados = datos;
          });
        }
        
        Ldepatamentos: any;
        selecctGrado(id: any) {
          this.Ldepatamentos = []
          console.log('grado selecionado: ',id)
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
      
        BuscarInformacionGeneralDepa() {
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
          this.cargosDep = this.validar.ProcesarDatosCargos(informacion);
          this.regimenDep = this.validar.ProcesarDatosRegimen(informacion);
          this.empleadosDep = this.validar.ProcesarDatosEmpleados(informacion);
          this.sucursalesDep = this.validar.ProcesarDatosSucursales(informacion);
          this.departamentosDep = this.validar.ProcesarDatosDepartamentos(informacion);
          //console.log('regimen ---', this.regimenDep)
      
          // FILTRO POR ASIGNACION USUARIO - DEPARTAMENTO
          // SI ES SUPERADMINISTRADOR NO FILTRAR
          //console.log('id rol ', this.rolEmpleado)
          if (this.rolEmpleado !== 1) {
            //console.log('ingresa')
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
            case 8: this.restR.setFiltroRolEmp(e); break;
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
        MostrarListaDep() {
          if (this.opcion === 's') {
            this.nombre_regDep.reset();
            this.nombre_sucDep.reset();
            this.selectionDepDep.clear();
            this.selectionCargDep.clear();
            this.selectionEmpDep.clear();
            this.FiltrarDep('', 1);
          }
          else if (this.opcion === 'r') {
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
      
        // METODO PARA PROCESAR DATOS
        SeleccionarProcesoDep(tipo: string, datos: any) {
          if (tipo === 'p') {
            this.AbrirEditarDepaUser(datos);
          }
          else if (tipo === 'b') {
            this.AbrirEditarDepaUser(datos);
          }
          else if (tipo === 'e') {
            this.AbrirEditarDepaUser(datos);
          }
          else if (tipo === 'm') {
            this.AbrirEditarDepaUser(datos);
          }
          else if (tipo === 't') {
            this.AbrirEditarDepaUser(datos);
          }
          else if (tipo === 'c') {
            this.AbrirEditarDepaUser(datos);
          }
        }
      
        // METODO PARA TOMAR DATOS SELECCIONADOS ACTUALIZAR DEPARTAMENTO
        MetodosFiltroDep(valor: any, tipo: string) {
          let usuarios = [];
          if (this.opcion === 's') {
            usuarios = this.validar.ModelarSucursal_(this.empleadosDep, this.selectionSucDep, valor.id);
          }
          else if (this.opcion === 'c') {
            usuarios = this.validar.ModelarCargo_(this.empleadosDep, this.selectionCargDep, valor.id, valor.id_suc);
          }
          else if (this.opcion === 'd') {
            usuarios = this.validar.ModelarDepartamento_(this.empleadosDep, this.selectionDepDep, valor.id, valor.id_suc);
          }
          else if (this.opcion === 'r') {
            usuarios = this.validar.ModelarRegimen_(this.empleadosDep, this.selectionRegDep, valor.id, valor.id_suc);
          }
          else {
            usuarios = this.validar.ModelarEmpleados_(this.empleadosDep, this.selectionEmpDep);
          }
          this.SeleccionarProcesoDep(tipo, usuarios);
      
        }
      
        // METODO PARA EDITAR EL DEPARTAMENTO DEL USUARIO SELECCIONADO
        AbrirEditarDepaUser(datos: any) {
          console.log('datos: ', datos)
          
          if (datos.length > 0) {
            const data = {
              id_grado: this.formularioDep.get('sucursal')?.value,
              listaUsuarios: datos
            }

            console.log('Datos a enviar grado: ',data)

            if (data.id_grado == '') {
              this.toastr.warning('Seleccione el grado.', '', {
                timeOut: 4000,
              });
            } else {

              this.resGrados.RegistroGrado(data).subscribe((res: any) => {
                this.toastr.success(res.message, 'Correcto.', {
                  timeOut: 4000,
                });
                this.LimpiarFormularioDep();
                this.BuscarInformacionGeneralDepa();
                this.formularioDep.reset();
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
