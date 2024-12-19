// IMPORTAR LIBRERIAS
import { Validators, FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatRadioChange } from '@angular/material/radio';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';

// IMPORTAR PLANTILLA DE MODELO DE DATOS
import { ITableEmpleados } from 'src/app/model/reportes.model';
import { checkOptions, FormCriteriosBusqueda, } from 'src/app/model/reportes.model';

// IMPORTAR SERVICIOS
import { AsignacionesService } from 'src/app/servicios/usuarios/asignaciones/asignaciones.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { ReportesService } from 'src/app/servicios/reportes/reportes.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario/usuario.service';
import { TimbresService } from 'src/app/servicios/timbres/timbrar/timbres.service';

@Component({
  selector: 'app-opciones-timbre-web',
  templateUrl: './opciones-timbre-web.component.html',
  styleUrl: './opciones-timbre-web.component.css'
})

export class OpcionesTimbreWebComponent implements OnInit {
  ips_locales: any = '';

  idEmpleadoLogueado: any;
  rolEmpleado: number; // VARIABLE DE ALMACENAMIENTO DE ROL DE EMPLEADO QUE INICIA SESION
  mostrarTablas: boolean = false;
  opciones_timbre: any = [];
  configurar: boolean = true;
  ver_configurar: boolean = false;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // VARIABLES DE ASIGNACIONES DE INFORMACION
  idCargosAcceso: Set<any> = new Set();
  idUsuariosAcceso: Set<any> = new Set();
  idSucursalesAcceso: Set<any> = new Set();
  idDepartamentosAcceso: Set<any> = new Set();

  // PRESENTACION DE INFORMACION DE ACUERDO AL CRITERIO DE BUSQUEDA
  departamentos: any = [];
  sucursales: any = [];
  empleados: any = [];
  regimen: any = [];
  cargos: any = [];

  // CONTROL DE CRITERIOS DE BUSQUEDA
  codigo = new FormControl('');
  cedula = new FormControl('', [Validators.minLength(2)]);
  seleccion = new FormControl('');
  seleccion_foto = new FormControl('');
  seleccion_opcion = new FormControl('');
  seleccion_especial = new FormControl('');
  seleccion_ubicacion = new FormControl('');
  nombre_emp = new FormControl('', [Validators.minLength(2)]);
  nombre_dep = new FormControl('', [Validators.minLength(2)]);
  nombre_suc = new FormControl('', [Validators.minLength(2)]);
  nombre_reg = new FormControl('', [Validators.minLength(2)]);
  nombre_carg = new FormControl('', [Validators.minLength(2)]);

  public _booleanOptions: FormCriteriosBusqueda = {
    bool_suc: false,
    bool_dep: false,
    bool_emp: false,
    bool_reg: false,
    bool_cargo: false,
  };
  public check: checkOptions[];

  selectionSuc = new SelectionModel<ITableEmpleados>(true, []);
  selectionCarg = new SelectionModel<ITableEmpleados>(true, []);
  selectionDep = new SelectionModel<ITableEmpleados>(true, []);
  selectionEmp = new SelectionModel<ITableEmpleados>(true, []);
  selectionReg = new SelectionModel<ITableEmpleados>(true, []);

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
  get filtroNombreSuc() {
    return this.restR.filtroNombreSuc;
  }

  // FILTROS DEPARTAMENTOS
  get filtroNombreDep() {
    return this.restR.filtroNombreDep;
  }

  // FILTROS EMPLEADO
  get filtroNombreEmp() {
    return this.restR.filtroNombreEmp;
  }
  get filtroCodigo() {
    return this.restR.filtroCodigo;
  }
  get filtroCedula() {
    return this.restR.filtroCedula;
  }

  // FILTRO CARGOS
  get filtroNombreCarg() {
    return this.restR.filtroNombreCarg;
  }

  // FILTRO REGIMEN
  get filtroNombreReg() {
    return this.restR.filtroNombreReg;
  }

  constructor(
    private asignaciones: AsignacionesService,
    private restTimbres: TimbresService,
    private restUsuario: UsuarioService,
    private validar: ValidacionesService,
    private toastr: ToastrService,
    private restR: ReportesService
  ) {
    this.idEmpleadoLogueado = parseInt(
      localStorage.getItem('empleado') as string
    );
  }

  ngOnInit(): void {
    this.rolEmpleado = parseInt(localStorage.getItem('rol') as string);
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');  
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    }); 
    this.idDepartamentosAcceso = this.asignaciones.idDepartamentosAcceso;
    this.idSucursalesAcceso = this.asignaciones.idSucursalesAcceso;
    this.idUsuariosAcceso = this.asignaciones.idUsuariosAcceso;
    this.check = this.restR.checkOptions([
      { opcion: 's' },
      { opcion: 'r' },
      { opcion: 'd' },
      { opcion: 'c' },
      { opcion: 'e' },
    ]);
    this.opciones_timbre = [
      { opcion: 'Enviar Foto' },
      { opcion: 'Internet Requerido' },
      { opcion: 'Timbre Especial' },
      { opcion: 'Timbre Ubicación Desconocida' },
    ];
    this.BuscarInformacionGeneral();
  }

  // METODO DE BUSQUEDA DE DATOS GENERALES DEL EMPLEADO
  BuscarInformacionGeneral() {
    // LIMPIAR DATOS DE ALMACENAMIENTO
    this.departamentos = [];
    this.sucursales = [];
    this.empleados = [];
    this.regimen = [];
    this.cargos = [];
    this.restUsuario.UsuariosTimbreWebGeneral(1, true).subscribe(
      (res: any[]) => {
        this.ProcesarDatos(res);
      },
      (err) => {
        this.toastr.error(err.error.message);
      }
    );
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
      this.empleados = this.empleados.filter((empleado: any) =>
        this.idUsuariosAcceso.has(empleado.id)
      );

      // SI EL EMPLEADO TIENE ACCESO PERSONAL AÑADIR LOS DATOS A LOS ACCESOS CORRESPONDIENTES PARA VISUALIZAR
      const empleadoSesion = this.empleados.find(
        (empleado: any) => empleado.id === this.idEmpleadoLogueado
      );
      if (empleadoSesion) {
        this.idSucursalesAcceso.add(empleadoSesion.id_suc);
        this.idDepartamentosAcceso.add(empleadoSesion.id_depa);
        this.idCargosAcceso.add(empleadoSesion.id_cargo_);
      }

      this.departamentos = this.departamentos.filter((departamento: any) =>
        this.idDepartamentosAcceso.has(departamento.id)
      );
      this.sucursales = this.sucursales.filter((sucursal: any) =>
        this.idSucursalesAcceso.has(sucursal.id)
      );
      this.regimen = this.regimen.filter((regimen: any) =>
        this.idSucursalesAcceso.has(regimen.id_suc)
      );

      this.empleados.forEach((empleado: any) => {
        this.idCargosAcceso.add(empleado.id_cargo_);
      });

      this.cargos = this.cargos.filter(
        (cargo: any) =>
          this.idSucursalesAcceso.has(cargo.id_suc) &&
          this.idCargosAcceso.has(cargo.id)
      );
    }
    this.mostrarTablas = true;
  }

  // METODO PARA ACTIVAR SELECCION MULTIPLE
  plan_multiple: boolean = false;
  plan_multiple_: boolean = false;
  auto_individual: boolean = true;
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
    this.opcion = e.value;
    this.activar_boton = true;
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
    this.restR.GuardarFormCriteriosBusqueda(this._booleanOptions);
    this.restR.GuardarCheckOpcion(this.opcion);
  }

  // METODO PARA CONTROLAR OPCIONES DE BUSQUEDA
  ControlarOpciones(
    sucursal: boolean,
    cargo: boolean,
    departamento: boolean,
    empleado: boolean,
    regimen: boolean
  ) {
    this._booleanOptions.bool_suc = sucursal;
    this._booleanOptions.bool_cargo = cargo;
    this._booleanOptions.bool_dep = departamento;
    this._booleanOptions.bool_emp = empleado;
    this._booleanOptions.bool_reg = regimen;
  }

  // METODO PARA CONTROLAR VISTA DE BOTONES
  ControlarBotones(seleccion: boolean, multiple: boolean, individual: boolean) {
    this.activar_seleccion = seleccion;
    this.plan_multiple = multiple;
    this.plan_multiple_ = multiple;
    this.auto_individual = individual;
  }

  // METODO PARA FILTRAR DATOS DE BUSQUEDA
  Filtrar(e: any, orden: number) {
    this.ControlarFiltrado(e);
    switch (orden) {
      case 1:
        this.restR.setFiltroNombreSuc(e);
        break;
      case 2:
        this.restR.setFiltroNombreCarg(e);
        break;
      case 3:
        this.restR.setFiltroNombreDep(e);
        break;
      case 4:
        this.restR.setFiltroCodigo(e);
        break;
      case 5:
        this.restR.setFiltroCedula(e);
        break;
      case 6:
        this.restR.setFiltroNombreEmp(e);
        break;
      case 7:
        this.restR.setFiltroNombreReg(e);
        break;
      default:
        break;
    }
  }

  // METODO PARA CONTROLAR FILTROS DE BUSQUEDA
  ControlarFiltrado(e: any) {
    if (e === '') {
      if (this.plan_multiple === true) {
        this.activar_seleccion = false;
      } else {
        if (this.activar_seleccion === false) {
          this.plan_multiple = true;
          this.auto_individual = false;
        }
      }
    } else {
      if (this.activar_seleccion === true) {
        this.activar_seleccion = false;
        this.plan_multiple_ = true;
        this.auto_individual = false;
      } else {
        this.plan_multiple = false;
      }
    }
  }

  /** ************************************************************************************** **
   ** **                   METODOS DE SELECCION DE DATOS DE USUARIOS                      ** **
   ** ************************************************************************************** **/

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedSuc() {
    const numSelected = this.selectionSuc.selected.length;
    return numSelected === this.sucursales.length;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleSuc() {
    this.isAllSelectedSuc()
      ? this.selectionSuc.clear()
      : this.sucursales.forEach((row: any) => this.selectionSuc.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelSuc(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedSuc() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionSuc.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1
      }`;
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedReg() {
    const numSelected = this.selectionReg.selected.length;
    return numSelected === this.regimen.length;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleReg() {
    this.isAllSelectedReg()
      ? this.selectionReg.clear()
      : this.regimen.forEach((row: any) => this.selectionReg.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelReg(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedReg() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionReg.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1
      }`;
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedCarg() {
    const numSelected = this.selectionCarg.selected.length;
    return numSelected === this.cargos.length;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleCarg() {
    this.isAllSelectedCarg()
      ? this.selectionCarg.clear()
      : this.cargos.forEach((row: any) => this.selectionCarg.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelCarg(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedCarg() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionCarg.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1
      }`;
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedDep() {
    const numSelected = this.selectionDep.selected.length;
    return numSelected === this.departamentos.length;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleDep() {
    this.isAllSelectedDep()
      ? this.selectionDep.clear()
      : this.departamentos.forEach((row: any) => this.selectionDep.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelDep(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedDep() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionDep.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1
      }`;
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedEmp() {
    const numSelected = this.selectionEmp.selected.length;
    return numSelected === this.empleados.length;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleEmp() {
    this.isAllSelectedEmp()
      ? this.selectionEmp.clear()
      : this.empleados.forEach((row: any) => this.selectionEmp.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelEmp(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedEmp() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionEmp.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1
      }`;
  }

  // METODO PARA MANEJAR PAGINACION DE LOS DATOS
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

  // METODO PARA TOMAR DATOS SELECCIONADOS
  GuardarRegistros(valor: any, tipo: any) {
    let usuarios = [];
    if (this.opcion === 's') {
      usuarios = this.validar.ModelarSucursal_(
        this.empleados,
        this.selectionSuc,
        valor.id
      );
    } else if (this.opcion === 'c') {
      usuarios = this.validar.ModelarCargo_(
        this.empleados,
        this.selectionCarg,
        valor.id,
        valor.id_suc
      );
    } else if (this.opcion === 'd') {
      usuarios = this.validar.ModelarDepartamento_(
        this.empleados,
        this.selectionDep,
        valor.id,
        valor.id_suc
      );
    } else if (this.opcion === 'r') {
      usuarios = this.validar.ModelarRegimen_(
        this.empleados,
        this.selectionReg,
        valor.id,
        valor.id_suc
      );
    } else {
      usuarios = this.validar.ModelarEmpleados_(
        this.empleados,
        this.selectionEmp
      );
    }
    if (tipo === 'ver') {
      this.VerOpciones(usuarios, this.opcion);
    }
    else {
      this.RegistrarMultiple(usuarios);
    }
  }

  // METODO PARA LIMPIAR FORMULARIOS
  LimpiarFormulario() {
    if (this._booleanOptions.bool_emp) {
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
      this.selectionDep.deselect();
      this.selectionDep.clear();
    }

    if (this._booleanOptions.bool_suc) {
      this.nombre_suc.reset();
      this._booleanOptions.bool_suc = false;
      this.selectionSuc.deselect();
      this.selectionSuc.clear();
    }

    if (this._booleanOptions.bool_reg) {
      this.nombre_reg.reset();
      this._booleanOptions.bool_reg = false;
      this.selectionReg.deselect();
      this.selectionReg.clear();
    }

    if (this._booleanOptions.bool_cargo) {
      this._booleanOptions.bool_cargo = false;
      this.selectionCarg.deselect();
      this.selectionCarg.clear();
    }

    this.activar_boton = false;
    this.seleccion_ubicacion.reset();
    this.seleccion_especial.reset();
    this.seleccion_foto.reset();
    this.seleccion.reset();
  }

  // METODO PARA MOSTRAR LISTA DE DATOS
  MostrarLista() {
    if (this.opcion === 's') {
      this.nombre_suc.reset();
      this.selectionDep.clear();
      this.selectionCarg.clear();
      this.selectionEmp.clear();
      this.selectionReg.clear();
      this.Filtrar('', 1);
    }
    else if (this.opcion === 'r') {
      this.nombre_reg.reset();
      this.nombre_suc.reset();
      this.selectionDep.clear();
      this.selectionCarg.clear();
      this.selectionEmp.clear();
      this.selectionSuc.clear();
      this.Filtrar('', 1);
      this.Filtrar('', 7);
    }
    else if (this.opcion === 'c') {
      this.nombre_carg.reset();
      this.nombre_suc.reset();
      this.selectionEmp.clear();
      this.selectionDep.clear();
      this.selectionSuc.clear();
      this.selectionReg.clear();
      this.Filtrar('', 1);
      this.Filtrar('', 2);
    }
    else if (this.opcion === 'd') {
      this.nombre_dep.reset();
      this.nombre_suc.reset();
      this.selectionEmp.clear();
      this.selectionCarg.clear();
      this.selectionSuc.clear();
      this.selectionReg.clear();
      this.Filtrar('', 1);
      this.Filtrar('', 3);
    }
    else if (this.opcion === 'e') {
      this.codigo.reset();
      this.cedula.reset();
      this.nombre_emp.reset();
      this.nombre_suc.reset();
      this.selectionDep.clear();
      this.selectionCarg.clear();
      this.selectionSuc.clear();
      this.selectionReg.clear();
      this.Filtrar('', 1);
      this.Filtrar('', 4);
      this.Filtrar('', 5);
      this.Filtrar('', 6);
    }
    this.seleccion_especial.reset();
    this.seleccion_foto.reset();
    this.seleccion_ubicacion.reset();
  }

  // METODO DE VALIDACION DE SELECCION MULTIPLE
  contador: number = 0;
  RegistrarMultiple(data: any) {
    
    this.contador = 0;
    var info = {
      id_empleado: '',
      timbre_foto: this.seleccion_foto.value,
      timbre_especial: this.seleccion_especial.value,
      timbre_ubicacion_desconocida: this.seleccion_ubicacion.value,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
    };
    var infoActualizar = {
      id_empleado: '',
      timbre_foto: this.seleccion_foto.value,
      timbre_especial: this.seleccion_especial.value,
      timbre_ubicacion_desconocida: this.seleccion_ubicacion.value,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
    };

    if (
      this.seleccion_especial.value === null &&
      this.seleccion_foto.value === null && this.seleccion_ubicacion.value === null
    ) {
      this.toastr.warning('No ha seleccionado ninguna opción para la marcación', '',
        { timeOut: 6000 }
      );
      //console.log('ingresa en null')
    } else {
      //console.log('ingresa en data')
      if (data.length > 0) {

        const ids_empleados = data.map((empl: any) => empl.id);

        this.restTimbres.BuscarVariasOpcionesMarcacionWebMultiple({ ids_empleados }).subscribe(
          async res => {
            if (res && res.respuesta) {
              // Almacenar los datos encontrados en un array
              const datosEncontrados = res.respuesta; // Array con los objetos devueltos por el backend
              // Extraer los IDs devueltos por la respuesta
              const idsEncontrados = datosEncontrados.map((item: any) => item.id_empleado);
              const idsFaltantes = ids_empleados.filter((id: number) => !idsEncontrados.includes(id));

              console.log("ver idsEncontrados", idsEncontrados )
              console.log("ver idsFaltantes", idsFaltantes )

              if (idsEncontrados.length != 0) {
                infoActualizar.id_empleado = idsEncontrados;
                await this.ActualizarOpcionMarcacion(infoActualizar, idsFaltantes);

              }
              // Comparar los IDs iniciales con los devueltos y obtener los faltantes
              if (idsFaltantes.length != 0) {
                info.id_empleado = idsFaltantes;
                await this.IngresarOpcionMarcacion(info);
              }
            } else {
              console.log('No se encontraron datos en la respuesta.');
            }
          },
          async error => {
            if (error.status === 404) {
              console.log('El backend devolvió un 404: No se encontraron datos.');
              // Realizar acciones específicas para el caso de 404
              info.id_empleado = ids_empleados;
              await this.IngresarOpcionMarcacion(info)
            } else {
              console.error('Error inesperado:', error);
            }
          }
        )
      } else {
        this.toastr.warning('No ha seleccionado usuarios.', '', {
          timeOut: 6000,
        });
      }
    }
  }

  // METODO PARA INGRESAR OPCION DE MARCACION
  IngresarOpcionMarcacion(informacion: any) {
    if (this.seleccion_especial.value === null) {
      informacion.timbre_especial = false;
    }
    if (this.seleccion_foto.value === null) {
      informacion.timbre_foto = false;
    }
    if (this.seleccion_ubicacion.value === null) {
      informacion.timbre_ubicacion_desconocida = false;
    }
    this.restTimbres.IngresarOpcionesMarcacionWeb(informacion).subscribe((i) => {
      this.MostrarMensaje();
    });
  }

  // METODO PARA ACTUALIZAR OPCION DE MARCACION
  ActualizarOpcionMarcacion(informacion: any, arregloIngreso) {
    console.log("ver arregloIngreso: ", arregloIngreso)
    this.restTimbres.ActualizarOpcionesMarcacionWeb(informacion).subscribe((a) => {
      if (arregloIngreso.length  == 0) {
        this.MostrarMensaje();
      }
    });
  }

  // METODO DE ALMACENAMIENTO DE DATOS
  MostrarMensaje() {
    this.toastr.success('Registros ingresados exitosamente.', '', {
      timeOut: 6000,
    });
    this.LimpiarFormulario();
  }

  // METODO PARA VER INFORMACION DE OPCIONES MARCACION
  ver_informacion: any;
  tipo_opcion: any;
  VerOpciones(seleccionados: any, opcion: any) {
    if (seleccionados.length > 0) {
      this.configurar = false;
      this.ver_configurar = true;
      this.ver_informacion = seleccionados;
      this.tipo_opcion = opcion;
    } else {
      this.toastr.warning('No ha seleccionado usuarios.', '', {
        timeOut: 6000,
      });
    }
  }

  // VALIDAR INGRESO DE LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  // VALIDAR INGRESO DE NUMEROS
  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

}
