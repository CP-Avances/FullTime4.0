// SECCION DE LIBRERIAS
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatRadioChange } from '@angular/material/radio';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';

// IMPORTAR MODELOS
import { checkOptions, FormCriteriosBusqueda } from 'src/app/model/reportes.model';
import { ITableEmpleados } from 'src/app/model/reportes.model';

// SECCION DE SERVICIOS
import { EmpleadoUbicacionService } from 'src/app/servicios/modulos/empleadoUbicacion/empleado-ubicacion.service';
import { DatosGeneralesService } from 'src/app/servicios/generales/datosGenerales/datos-generales.service';
import { AsignacionesService } from 'src/app/servicios/usuarios/asignaciones/asignaciones.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/configuracion/parametrizacion/parametrosGenerales/parametros.service';
import { ReportesService } from 'src/app/servicios/reportes/reportes.service';

import { EditarCoordenadasComponent } from '../editar-coordenadas/editar-coordenadas.component';
import { ListarCoordenadasComponent } from '../listar-coordenadas/listar-coordenadas.component';
import { MetodosComponent } from 'src/app/componentes/generales/metodoEliminar/metodos.component';
import { Observable, map, startWith  } from 'rxjs';
import { RolesService } from 'src/app/servicios/configuracion/parametrizacion/catRoles/roles.service';


export interface EmpleadoElemento {
  id_emplu: number;
  nombre: string;
  apellido: string;
  codigo: number;
  id_ubicacion: number;
}

@Component({
  selector: 'app-ver-coordenadas',
  standalone: false,
  templateUrl: './ver-coordenadas.component.html',
  styleUrls: ['./ver-coordenadas.component.css']
})

export class VerCoordenadasComponent implements OnInit {
  ips_locales: any = '';

  @Input() idUbicacion: number;

  asignar: boolean = false;

  codigo = new FormControl('');
  cedula = new FormControl('', [Validators.minLength(2)]);
  nombre_emp = new FormControl('', [Validators.minLength(2)]);
  nombre_dep = new FormControl('', [Validators.minLength(2)]);
  nombre_suc = new FormControl('', [Validators.minLength(2)]);
  nombre_carg = new FormControl('', [Validators.minLength(2)]);
  nombre_reg = new FormControl('', [Validators.minLength(2)]);
  nombre_rol = new FormControl('', [Validators.minLength(2)]);
  seleccion = new FormControl('');

  filteredRoles!: Observable<any[]>;
  roles: any = [];

  public _booleanOptions: FormCriteriosBusqueda = {
    bool_suc: false,
    bool_dep: false,
    bool_emp: false,
    bool_reg: false,
    bool_cargo: false,
  };

  // PRESENTACION DE INFORMACION DE ACUERDO AL CRITERIO DE BUSQUEDA
  selectionSuc = new SelectionModel<ITableEmpleados>(true, []);
  selectionCarg = new SelectionModel<ITableEmpleados>(true, []);
  selectionDep = new SelectionModel<ITableEmpleados>(true, []);
  selectionEmp = new SelectionModel<ITableEmpleados>(true, []);
  selectionReg = new SelectionModel<ITableEmpleados>(true, []);

  public check: checkOptions[];

  departamentos: any = [];
  sucursales: any = [];
  empleados: any = [];
  respuesta: any = [];
  regimen: any = [];
  cargos: any = [];

  idEmpleadoLogueado: any;
  rolEmpleado: number; // VARIABLE DE ALMACENAMIENTO DE ROL DE EMPLEADO QUE INICIA SESION

  idCargosAcceso: Set<any> = new Set();
  idUsuariosAcceso: Set<any> = new Set();
  idSucursalesAcceso: Set<any> = new Set();
  idDepartamentosAcceso: Set<any> = new Set();

  // ITEMS DE PAGINACION DE LA TABLA SUCURSAL
  pageSizeOptions_suc = [5, 10, 20, 50];
  tamanio_pagina_suc: number = 5;
  numero_pagina_suc: number = 1;

  // ITEMS DE PAGINACION DE LA TABLA REGIMEN
  pageSizeOptions_reg = [5, 10, 20, 50];
  tamanio_pagina_reg: number = 5;
  numero_pagina_reg: number = 1;

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

  // FILTROS SUCURSALES
  get filtroNombreSuc() { return this.filtros.filtroNombreSuc }

  // FILTROS DEPARTAMENTOS
  get filtroNombreDep() { return this.filtros.filtroNombreDep }

  // FILTROS EMPLEADO
  get filtroNombreEmp() { return this.filtros.filtroNombreEmp };
  get filtroCodigo() { return this.filtros.filtroCodigo };
  get filtroCedula() { return this.filtros.filtroCedula };

  // FILTRO CARGOS
  get filtroNombreCarg() { return this.filtros.filtroNombreCarg };

  // FILTRO REGIMEN
  get filtroNombreReg() { return this.filtros.filtroNombreReg };

  //FILTRO ROL
  get filtroRolEmp() { return this.filtros.filtroRolEmp };  

  coordenadas: any = [];
  datosUsuarios: any = [];

  // ITEMS DE PAGINACION DE LA TABLA
  numero_pagina: number = 1;
  tamanio_pagina: number = 5;
  pageSizeOptions = [5, 10, 20, 50];

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    private toastr: ToastrService,
    public restU: EmpleadoUbicacionService,
    public restP: ParametrosService,
    public router: Router,
    public ventana: MatDialog,
    private filtros: ReportesService,
    private validar: ValidacionesService,
    public informacion: DatosGeneralesService,
    public componentec: ListarCoordenadasComponent,
    private asignaciones: AsignacionesService,
    private restRoles: RolesService
  ) { }

  ngOnInit(): void {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado') as string);
    this.rolEmpleado = parseInt(localStorage.getItem('rol') as string);

    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip'); 
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });

    this.check = this.filtros.checkOptions([{ opcion: 's' }, { opcion: 'r' }, { opcion: 'c' }, { opcion: 'd' }, { opcion: 'e' }]);
    this.idUsuariosAcceso = this.asignaciones.idUsuariosAcceso;
    this.idDepartamentosAcceso = this.asignaciones.idDepartamentosAcceso;
    this.idSucursalesAcceso = this.asignaciones.idSucursalesAcceso;
    this.ConsultarDatos();

    this, this.restRoles.BuscarRoles().subscribe((respuesta: any) => {
      this.roles = respuesta
      console.log('this.listaRoles: ', this.roles)
    });

        this.filteredRoles = this.nombre_rol.valueChanges.pipe(
          startWith(''),
          map(value => this.filtrarRoles(value || ''))
        );


    this.nombre_rol.valueChanges.subscribe(valor => {
      this.Filtrar(valor, 8);
    });



  }

  // METODO PARA CONSULTAR INFORMACION
  ConsultarDatos() {
    this.BuscarUbicacion(this.idUbicacion);
    this.ListarUsuarios(this.idUbicacion);
    this.BuscarInformacion();
  }

  ngOnDestroy() {
    this.filtros.GuardarCheckOpcion('');
    this.filtros.DefaultFormCriterios();
    this.filtros.DefaultValoresFiltros();
  }

  // METODO PARA ACTIVAR SELECCION MULTIPLE PARA ELIMINAR
  btnCheckHabilitar: boolean = false;
  auto_individual: boolean = true;
  HabilitarSeleccion() {
    if (this.btnCheckHabilitar === false) {
      this.btnCheckHabilitar = true;
      this.auto_individual = false;
    }
    else if (this.btnCheckHabilitar === true) {
      this.btnCheckHabilitar = false;
      this.auto_individual = true;
    }
  }


  filtrarRoles(valor: string): any[] {
    const filtro = valor.toLowerCase();
    return this.roles.filter(rol =>
      rol.nombre.toLowerCase().includes(filtro)
    );
  }

  // METODO PARA MANEJAR PAGINACION DE TABLAS
  ManejarPagina(e: PageEvent) {
    this.numero_pagina = e.pageIndex + 1
    this.tamanio_pagina = e.pageSize;
  }

  // METODO PARA BUSCAR DATOS DE UBICACION GEOGRAFICA
  BuscarUbicacion(id: any) {
    this.coordenadas = [];
    this.restU.ListarUnaCoordenada(id).subscribe(data => {
      this.coordenadas = data;
    })
  }

  // METODO PARA BUSCAR COORDENADAS DE UBICACION DE USUARIO
  ListarUsuarios(id: number) {
    this.datosUsuarios = [];
    this.restU.ListarCoordenadasUsuarioU(id).subscribe((datos: any) => {
      this.datosUsuarios = datos;
      if (this.rolEmpleado !== 1) {
        // FILTRAR SOLO LOS USUARIOS QUE TIENEN ACCESO
        this.datosUsuarios = datos.filter((usuario: any) => this.idUsuariosAcceso.has(usuario.id_empleado));
      }
    })
  }

  // METODO PARA ASIGNAR UBICACION A USUARIOS
  AbrirVentanaBusqueda(): void {
    if (this.asignar === true) {
      this.asignar = false;
      this.filtros.DefaultFormCriterios();
      this.filtros.DefaultValoresFiltros();
      this.seleccion.reset();
    } else {
      this.asignar = true;
    }
  }

  // METODO PARA EDITAR COORDENADAS
  AbrirVentanaEditar(datos: any): void {
    this.ventana.open(EditarCoordenadasComponent,
      { width: '400px', data: { ubicacion: datos, actualizar: true } }).afterClosed().subscribe(item => {
        this.BuscarUbicacion(this.idUbicacion);
        this.ListarUsuarios(this.idUbicacion);
      });
  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO
  EliminarRegistro(id_emplu: number) {
    const datos = {
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
      ids: [id_emplu]
    }
    this.restU.EliminarCoordenadasUsuario(datos).subscribe(res => {
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
      this.ConsultarDatos();
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  ConfirmarDelete(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarRegistro(datos.id_emplu);
        }
      });
  }

  // BUSCAR DATOS DE USUARIOS
  BuscarInformacion() {
    this.departamentos = [];
    this.sucursales = [];
    this.empleados = [];
    this.regimen = [];
    this.cargos = [];
    let ubicacion = {
      ubicacion: this.idUbicacion
    }
    console.log("ver ubicacion: ", ubicacion)
    this.informacion.ObtenerInformacionUbicacion(1, ubicacion).subscribe((res: any[]) => {
      this.ProcesarDatos(res);
    })
  }

  //METODO PARA PROCESAR DATOS
  ProcesarDatos(informacion: any) {
    this.cargos = this.validar.ProcesarDatosCargos(informacion);
    this.regimen = this.validar.ProcesarDatosRegimen(informacion);
    this.empleados = this.validar.ProcesarDatosEmpleados(informacion);
    this.sucursales = this.validar.ProcesarDatosSucursales(informacion);
    this.departamentos = this.validar.ProcesarDatosDepartamentos(informacion);

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

  }

  // METODO PARA ACTIVAR SELECCION MULTIPLE
  multiple: boolean = false;
  multiple_: boolean = false;
  activar_seleccion: boolean = true;
  HabilitarSeleccion_() {
    this.multiple = true;
    this.multiple_ = true;
    this.activar_seleccion = false;
  }

  // METODO PARA MOSTRAR DATOS DE BUSQUEDA
  opcion: string;
  BuscarPorTipo(e: MatRadioChange) {
    this.opcion = e.value;
    this.MostrarLista();
    switch (this.opcion) {
      case 's':
        this.ControlarOpciones(true, false, false, false, false);
        this.ControlarBotones(true, false);
        break;
      case 'r':
        this.ControlarOpciones(false, false, false, false, true);
        this.ControlarBotones(true, false);
        break;
      case 'c':
        this.ControlarOpciones(false, true, false, false, false);
        this.ControlarBotones(true, false);
        break;
      case 'd':
        this.ControlarOpciones(false, false, true, false, false);
        this.ControlarBotones(true, false);
        break;
      case 'e':
        this.ControlarOpciones(false, false, false, true, false);
        this.ControlarBotones(true, false);
        break;
      default:
        this.ControlarOpciones(false, false, false, false, false);
        this.ControlarBotones(true, false);
        break;
    }
    this.filtros.GuardarFormCriteriosBusqueda(this._booleanOptions);
    this.filtros.GuardarCheckOpcion(this.opcion)
  }

  // METODO PARA CONTROLAR OPCIONES DE BUSQUEDA
  ControlarOpciones(sucursal: boolean, cargo: boolean, departamento: boolean, empleado: boolean, regimen: boolean) {
    this._booleanOptions.bool_suc = sucursal;
    this._booleanOptions.bool_cargo = cargo;
    this._booleanOptions.bool_dep = departamento;
    this._booleanOptions.bool_emp = empleado;
    this._booleanOptions.bool_reg = regimen;
  }

  // METODO PARA CONTROLAR VISTA DE BOTONES
  ControlarBotones(seleccion: boolean, multiple: boolean) {
    this.activar_seleccion = seleccion;
    this.multiple = multiple;
    this.multiple_ = multiple;
  }

  // METODO PARA FILTRAR DATOS DE BUSQUEDA
  Filtrar(e: any, orden: number) {
    this.ControlarFiltrado(e);
    switch (orden) {
      case 1: this.filtros.setFiltroNombreSuc(e); break;
      case 2: this.filtros.setFiltroNombreCarg(e); break;
      case 3: this.filtros.setFiltroNombreDep(e); break;
      case 4: this.filtros.setFiltroCodigo(e); break;
      case 5: this.filtros.setFiltroCedula(e); break;
      case 6: this.filtros.setFiltroNombreEmp(e); break;
      case 7: this.filtros.setFiltroNombreReg(e); break;
      case 8: this.filtros.setFiltroRolEmp(e); break;
      default:
        break;
    }
  }

  // METODO PARA CONTROLAR FILTROS DE BUSQUEDA
  ControlarFiltrado(e: any) {
    if (e === '') {
      if (this.multiple === true) {
        this.activar_seleccion = false;
      }
      else {
        if (this.activar_seleccion === false) {
          this.multiple = true;
        }
      }
    }
    else {
      if (this.activar_seleccion === true) {
        this.activar_seleccion = false;
        this.multiple_ = true;
      }
      else {
        this.multiple = false;
      }
    }
  }

  // METODOS DE VALIDACION DE INGRESO DE LETRAS Y NUMEROS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

  // METODO PARA LIMPIAR FORMULARIOS
  LimpiarCampos() {
    if (this._booleanOptions.bool_emp) {
      this.codigo.reset();
      this.cedula.reset();
      this.nombre_emp.reset();
      this._booleanOptions.bool_emp = false;
      this.selectionEmp.deselect();
      this.selectionEmp.clear();
    }

    if (this._booleanOptions.bool_reg) {
      this.nombre_reg.reset();
      this._booleanOptions.bool_reg = false;
      this.selectionReg.deselect();
      this.selectionReg.clear();
    }

    if (this._booleanOptions.bool_dep) {
      this.nombre_dep.reset();
      this._booleanOptions.bool_dep = false;
      this.selectionDep.clear();
      this.selectionDep.deselect();
    }

    if (this._booleanOptions.bool_suc) {
      this.nombre_suc.reset();
      this._booleanOptions.bool_suc = false;
      this.selectionSuc.deselect();
      this.selectionSuc.clear();
    }

    if (this._booleanOptions.bool_cargo) {
      this._booleanOptions.bool_cargo = false;
      this.selectionCarg.deselect();
      this.selectionCarg.clear();
    }

    this.seleccion.reset();
    this.asignar = false;
  }

  // MOSTRAR DATOS DE EMPRESA
  MostrarLista() {
    if (this.opcion === 's') {
      this.nombre_suc.reset();
      this.selectionDep.clear();
      this.selectionCarg.clear();
      this.selectionEmp.clear();
      this.selectionReg.clear();
      this.Filtrar('', 1)
    }
    else if (this.opcion === 'r') {
      this.nombre_reg.reset();
      this.selectionDep.clear();
      this.selectionCarg.clear();
      this.selectionEmp.clear();
      this.selectionSuc.clear();
      this.Filtrar('', 7)
    }
    else if (this.opcion === 'c') {
      this.nombre_carg.reset();
      this.selectionEmp.clear();
      this.selectionDep.clear();
      this.selectionSuc.clear();
      this.selectionReg.clear();
      this.Filtrar('', 2)
    }
    else if (this.opcion === 'd') {
      this.nombre_dep.reset();
      this.nombre_suc.reset();
      this.selectionEmp.clear();
      this.selectionCarg.clear();
      this.selectionSuc.clear();
      this.selectionReg.clear();
      this.Filtrar('', 1)
      this.Filtrar('', 3)
    }
    else if (this.opcion === 'e') {
      this.codigo.reset();
      this.cedula.reset();
      this.nombre_emp.reset();
      this.selectionDep.clear();
      this.selectionCarg.clear();
      this.selectionSuc.clear();
      this.selectionReg.clear();
      this.Filtrar('', 4)
      this.Filtrar('', 5)
      this.Filtrar('', 6)
    }
  }

  /** ************************************************************************************** **
   ** **                   METODOS DE SELECCION DE DATOS DE USUARIOS                      ** **
   ** ************************************************************************************** **/

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
  isAllSelectedSuc() {
    const numSelected = this.selectionSuc.selected.length;
    return numSelected === this.sucursales.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleSuc() {
    this.isAllSelectedSuc() ?
      this.selectionSuc.clear() :
      this.sucursales.forEach((row: any) => this.selectionSuc.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelSuc(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedSuc() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionSuc.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
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

  // METODO DE PAGINACION DE DATOS
  ManejarPaginaResultados(e: PageEvent) {
    if (this._booleanOptions.bool_suc === true) {
      this.tamanio_pagina_suc = e.pageSize;
      this.numero_pagina_suc = e.pageIndex + 1;
    }
    else if (this._booleanOptions.bool_dep === true) {
      this.tamanio_pagina_dep = e.pageSize;
      this.numero_pagina_dep = e.pageIndex + 1;
    }
    else if (this._booleanOptions.bool_emp === true) {
      this.tamanio_pagina_emp = e.pageSize;
      this.numero_pagina_emp = e.pageIndex + 1;
    }
    else if (this._booleanOptions.bool_cargo === true) {
      this.tamanio_pagina_car = e.pageSize;
      this.numero_pagina_car = e.pageIndex + 1;
    }
    else if (this._booleanOptions.bool_reg === true) {
      this.tamanio_pagina_reg = e.pageSize;
      this.numero_pagina_reg = e.pageIndex + 1;
    }
  }

  // METODO PARA PRESENTAR DATOS DE SUCURSALES
  ModelarSucursal() {
    let usuarios: any = [];
    this.empleados.forEach((empl: any) => {
      this.selectionSuc.selected.find((selec: any) => {
        if (empl.id_suc === selec.id) {
          usuarios.push(empl)
        }
      })
    })
    this.RegistrarUbicacionUsuario(usuarios);
  }

  // CONSULTA DE LOS DATOS REGIMEN
  ModelarRegimen() {
    let usuarios: any = [];
    this.empleados.forEach((empl: any) => {
      this.selectionReg.selected.find((selec: any) => {
        if (empl.id_regimen === selec.id && empl.id_suc === selec.id_suc) {
          usuarios.push(empl)
        }
      })
    })

    this.RegistrarUbicacionUsuario(usuarios);
  }

  // METODO PARA MOSTRAR DATOS DE CARGOS
  ModelarCargo() {
    let usuarios: any = [];
    this.empleados.forEach((empl: any) => {
      this.selectionCarg.selected.find((selec: any) => {
        if (empl.id_cargo_ === selec.id && empl.id_suc === selec.id_suc) {
          usuarios.push(empl)
        }
      })
    })
    this.RegistrarUbicacionUsuario(usuarios);
  }

  // METODO PARA PRESENTAR DATOS DE EMPLEADO
  ModelarEmpleados() {
    let respuesta: any = [];
    this.empleados.forEach((empl: any) => {
      this.selectionEmp.selected.find((selec: any) => {
        if (selec.id === empl.id) {
          respuesta.push(empl)
        }
      })
    })
    this.RegistrarUbicacionUsuario(respuesta);
  }

  // METODO PARA PRESENTAR DATOS DE DEPARTAMENTOS
  ModelarDepartamentos() {
    let usuarios: any = [];
    this.empleados.forEach((empl: any) => {
      this.selectionDep.selected.find((selec: any) => {
        if (empl.id_depa === selec.id && empl.id_suc === selec.id_suc) {
          usuarios.push(empl)
        }
      })
    })
    this.RegistrarUbicacionUsuario(usuarios);
  }

  /** ************************************************************************************** **
   ** **                       METODOS DE REGISTRO DE UBICACIONES                         ** **
   ** ************************************************************************************** **/

  // METODO PARA REGISTRAR UBICACIONES
  cont: number = 0;
  error: number = 0;
  RegistrarUbicacionUsuario(data: any) {
    if (data.length > 0) {
      const arrayIds = data.map((obj: any) => obj.id);
      var datos = {
        id_empl: arrayIds,
        id_ubicacion: this.idUbicacion,
        user_name: this.user_name,
        ip: this.ip, ip_local: this.ips_locales
      }
      this.restU.RegistrarCoordenadasUsuario(datos).subscribe(res => {
        this.cont = this.cont + 1;
        console.log('ver ', res)
        if (res.message == 'Con duplicados') {
          this.toastr.success('Algunos registros ya existen en el sistema.', 'Registros de ubicación asignados exitosamente.', {
            timeOut: 6000,
          });
        } else if (res.message == 'Sin duplicados') {
          this.toastr.success('Registros de ubicación asignados exitosamente.', '', {
            timeOut: 6000,
          });
        } else if (res.message == 'No hay nuevos registros para insertar.') {
          this.toastr.warning('Los registros de ubicación ya existen en el sistema.', '', {
            timeOut: 6000,
          });
        }
        this.ConsultarDatos();
        this.AbrirVentanaBusqueda();
      });
    }
    else {
      this.toastr.warning('No ha seleccionado usuarios.', '', {
        timeOut: 6000,
      });
    }

  }

  // METODO PARA TOMAR DATOS SELECCIONADOS
  GuardarRegistros() {
    if (this.opcion === 's') {
      this.ModelarSucursal();
    }
    else if (this.opcion === 'r') {
      this.ModelarRegimen();
    }
    else if (this.opcion === 'c') {
      this.ModelarCargo();
    }
    else if (this.opcion === 'd') {
      this.ModelarDepartamentos();
    }
    else {
      this.ModelarEmpleados();
    }
  }


  /** ************************************************************************************** **
   ** **           METODOS DE SELECCION DE DATOS DE USUARIOS ELIMINAR UBICACION           ** **
   ** ************************************************************************************** **/

  selectionUno = new SelectionModel<EmpleadoElemento>(true, []);

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelected() {
    const numSelected = this.selectionUno.selected.length;
    const numRows = this.datosUsuarios.length;
    return numSelected === numRows;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggle() {
    this.isAllSelected() ?
      this.selectionUno.clear() :
      this.datosUsuarios.forEach((row: any) => this.selectionUno.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabel(row?: EmpleadoElemento): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionUno.isSelected(row) ? 'deselect' : 'select'} row ${row.id_emplu + 1}`;
  }

  // METODO PARA ELIMNAR REGISTROS DE UBICACION
  Remover() {

    if (this.selectionUno.selected.length > 0) {

      const ids: number[] = this.selectionUno.selected.map((obj: any) => obj.id_emplu).filter((id) => id !== undefined);

      const datos = {
        user_name: this.user_name,
        ip: this.ip, ip_local: this.ips_locales,
        ids: ids
      };
      this.restU.EliminarCoordenadasUsuario(datos).subscribe(res => {
        this.ConsultarDatos();
        this.toastr.error('Registros removidos de la lista.', '', {
          timeOut: 6000,
        });
      });

      this.HabilitarSeleccion();
      this.selectionUno.clear();
    }
  }


  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  ConfirmarDeleteVarios() {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Remover();
        }
      });
  }

  // METODO PARA LISTAR COORDENADAS
  ListarCoordenadas() {
    this.componentec.ver_lista = true;
    this.componentec.ver_detalles = false;
    this.componentec.ObtenerCoordenadas();
  }

  //CONTROL BOTONES
  getEditarUbicacion(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Editar Ubicación');
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 1);
    }
  }

  getVerAsignarUsuario(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Ver Ubicación - Asignar Usuario');
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 1);
    }
  }

  getVerEliminarAsignacionUsuario(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Ver Ubicación - Eliminar Asignación Usuario');
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 1);
    }
  }


}
