import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatRadioChange } from '@angular/material/radio';
import { ToastrService } from 'ngx-toastr';
import { checkOptions, FormCriteriosBusqueda, ITableEmpleados } from 'src/app/model/reportes.model';
import { AsignacionesService } from 'src/app/servicios/asignaciones/asignaciones.service';
import { RolesService } from 'src/app/servicios/catalogos/catRoles/roles.service';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { EmplCargosService } from 'src/app/servicios/empleado/empleadoCargo/empl-cargos.service';
import { PeriodoVacacionesService } from 'src/app/servicios/periodoVacaciones/periodo-vacaciones.service';
import { PlanGeneralService } from 'src/app/servicios/planGeneral/plan-general.service';
import { ReportesService } from 'src/app/servicios/reportes/reportes.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { EditarRolUserComponent } from './editar-rol-user/editar-rol-user.component';
import { EditarDepaUserComponent } from './editar-depa-user/editar-depa-user.component';

@Component({
  selector: 'app-actualizacion-informacion',
  templateUrl: './actualizacion-informacion.component.html',
  styleUrls: ['./actualizacion-informacion.component.css']
})
export class ActualizacionInformacionComponent implements OnInit {

  listaUsuariosRol: any = []

   // VARIABLES VISTA DE PANTALLAS ROLES
   seleccionarRol: boolean = true;
   asignarRol: boolean = false;
   ventana_roles: boolean = false;
   ventana_busquedaRol: boolean = false;

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

    // CONTROL DE CRITERIOS DE BUSQUEDA ROL
    codigoRol = new FormControl('');
    cedulaRol = new FormControl('', [Validators.minLength(2)]);
    nombre_empRol = new FormControl('', [Validators.minLength(2)]);
    nombre_depRol = new FormControl('', [Validators.minLength(2)]);
    nombre_sucRol = new FormControl('', [Validators.minLength(2)]);
    nombre_regRol = new FormControl('', [Validators.minLength(2)]);
    nombre_cargRol = new FormControl('', [Validators.minLength(2)]);
    seleccionRol = new FormControl('');

  filtro_sucursal: any;

  // FILTROS SUCURSALES
 get filtroNombreSuc() { 
  return this.restR.filtroNombreSuc 
}

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

  selectionRol = new SelectionModel<ITableEmpleados>(true, []);
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

  // ITEMS DE PAGINACION DE LA TABLA USUARIO ROL
  pageSizeOptions_rol = [5, 10, 20, 50];
  tamanio_pagina_rol: number = 5;
  numero_pagina_rol: number = 1;

   public check: checkOptions[];

  constructor(
    public informacion: DatosGeneralesService, // SERVICIO DE DATOS INFORMATIVOS DE USUARIOS
    public restCargo: EmplCargosService,
    public validar: ValidacionesService, // VARIABLE USADA PARA VALIDACIONES DE INGRESO DE LETRAS - NUMEROS
    public restR: ReportesService,
    public plan: PlanGeneralService,
    private toastr: ToastrService, // VARIABLE PARA MANEJO DE NOTIFICACIONES
    private restUsuario: UsuarioService,
    private asignaciones: AsignacionesService,
    private restRoles: RolesService,
    public ventana: MatDialog, // VARIABLE DE MANEJO DE VENTANAS
  ){
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.check = this.restR.checkOptions([{ opcion: 'r' }, { opcion: 'd' }, { opcion: 'c' }, { opcion: 'e' }]);
    this.idUsuariosAcceso = this.asignaciones.idUsuariosAcceso;
    this.idDepartamentosAcceso = this.asignaciones.idDepartamentosAcceso;
    this.idSucursalesAcceso = this.asignaciones.idSucursalesAcceso;

    this.PresentarInformacion(); 
  }

   // BUSQUEDA DE DATOS ACTUALES DEL USUARIO
   PresentarInformacion() {
    let informacion = { id_empleado: this.idEmpleadoLogueado };
    let respuesta: any = [];

    this.restRoles.listaUsuariosRoles().subscribe((res: any) => {
      this.listaUsuariosRol = res.lista
    }, error => {
      this.toastr.info('Tenemos problemas para listar los roles.', '', {
        timeOut: 4000,
      });
    })

    this.informacion.ObtenerInformacionUserRol(informacion).subscribe(res => {
      respuesta = res[0];
      this.AdministrarInformacion(respuesta, informacion);
    }, vacio => {
      this.toastr.info('No se han encontrado registros.', '', {
        timeOut: 4000,
      });
    });
  }

  // METODO PARA BUSCAR SUCURSALES QUE ADMINSITRA EL USUARIO
  usua_sucursales: any = [];
  AdministrarInformacion(usuario: any, empleado: any) {
    // LIMPIAR DATOS DE ALMACENAMIENTO
    this.departamentos = [];
    this.sucursales = [];
    this.empleados = [];
    this.regimen = [];
    this.cargos = [];

    this.usua_sucursales = [];
    //console.log('empleado ', empleado)
    this.restUsuario.BuscarUsuarioSucursal(empleado).subscribe((data: any) => {
      const codigos = data.map((obj: any) => `'${obj.id_sucursal}'`).join(', ');

      // VERIFICACION DE BUSQUEDA DE INFORMACION SEGUN PRIVILEGIOS DE USUARIO
      if (usuario.id_rol === 1 && usuario.jefe === false) {
        this.usua_sucursales = { id_sucursal: codigos };
        this.BuscarInformacionAdministrador(this.usua_sucursales);
      }
      else if (usuario.id_rol === 1 && usuario.jefe === true) {
        this.usua_sucursales = { id_sucursal: codigos, id_departamento: usuario.id_departamento };
        this.BuscarInformacionJefe(this.usua_sucursales);
      }
      else if (usuario.id_rol === 3) {
        this.BuscarInformacionSuperAdministrador();
      }
    });
  }

   // METODO DE BUSQUEDA DE DATOS QUE VISUALIZA EL SUPERADMINISTRADOR
   BuscarInformacionSuperAdministrador() {
    this.informacion.ObtenerInformacion_SUPERADMIN(1).subscribe((res: any[]) => {
      this.ProcesarDatos(res);
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  // METODO DE BUSQUEDA DE DATOS QUE VISUALIZA EL ADMINISTRADOR
  BuscarInformacionAdministrador(buscar: string) {
    this.informacion.ObtenerInformacion_ADMIN(1, buscar).subscribe((res: any[]) => {
      this.ProcesarDatos(res);
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  // METODO DE BUSQUEDA DE DATOS QUE VISUALIZA EL ADMINISTRADOR - JEFE
  BuscarInformacionJefe(buscar: string) {
    this.informacion.ObtenerInformacion_JEFE(1, buscar).subscribe((res: any[]) => {
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

  // METODO PARA PROCESAR LA INFORMACION DE LOS EMPLEADOS
  ProcesarDatos(informacion: any) {
    informacion.forEach((obj: any) => {
      //console.log('ver obj ', obj)
      this.sucursales.push({
        id: obj.id_suc,
        sucursal: obj.name_suc
      })
    })

    informacion.forEach((reg: any) => {
      reg.regimenes.forEach((obj: any) => {
        this.regimen.push({
          id: obj.id_regimen,
          nombre: obj.name_regimen,
          sucursal: obj.name_suc,
          id_suc: reg.id_suc
        })
      })
    })

    informacion.forEach((reg: any) => {
      reg.regimenes.forEach((dep: any) => {
        dep.departamentos.forEach((obj: any) => {
          this.departamentos.push({
            id: obj.id_depa,
            departamento: obj.name_dep,
            sucursal: obj.name_suc,
            id_suc: reg.id_suc,
            id_regimen: obj.id_regimen,
          })
        })
      })
    })

    informacion.forEach((reg: any) => {
      reg.regimenes.forEach((dep: any) => {
        dep.departamentos.forEach((car: any) => {
          car.cargos.forEach((obj: any) => {
            this.cargos.push({
              id: obj.id_cargo_,
              nombre: obj.name_cargo,
              sucursal: obj.name_suc,
              id_suc: reg.id_suc
            })
          })
        })
      })
    })

    informacion.forEach((reg: any) => {
      reg.regimenes.forEach((dep: any) => {
        dep.departamentos.forEach((car: any) => {
          car.cargos.forEach((empl: any) => {
            empl.empleado.forEach((obj: any) => {
              let elemento = {
                id: obj.id,
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
              }
              this.empleados.push(elemento)
            })
          })
        })
      })
    })

    this.OmitirDuplicados();

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

  // METODO PARA RETIRAR DUPLICADOS SOLO EN LA VISTA DE DATOS
  OmitirDuplicados() {
    // OMITIR DATOS DUPLICADOS EN LA VISTA DE SELECCION DEPARTAMENTOS
    let verificados_dep = this.departamentos.filter((objeto: any, indice: any, valor: any) => {
      // COMPARA EL OBJETO ACTUAL CON LOS OBJETOS ANTERIORES EN EL ARRAY
      for (let i = 0; i < indice; i++) {
        if (valor[i].id === objeto.id && valor[i].id_suc === objeto.id_suc) {
          return false; // SI ES UN DUPLICADO, RETORNA FALSO PARA EXCLUIRLO DEL RESULTADO
        }
      }
      return true; // SI ES UNICO, RETORNA VERDADERO PARA INCLUIRLO EN EL RESULTADO
    });
    this.departamentos = verificados_dep;

    // OMITIR DATOS DUPLICADOS EN LA VISTA DE SELECCION CARGOS
    let verificados_car = this.cargos.filter((objeto: any, indice: any, valor: any) => {
      // COMPARA EL OBJETO ACTUAL CON LOS OBJETOS ANTERIORES EN EL ARRAY
      for (let i = 0; i < indice; i++) {
        if (valor[i].id === objeto.id && valor[i].id_suc === objeto.id_suc) {
          return false; // SI ES UN DUPLICADO, RETORNA FALSO PARA EXCLUIRLO DEL RESULTADO
        }
      }
      return true; // SI ES UNICO, RETORNA VERDADERO PARA INCLUIRLO EN EL RESULTADO
    });
    this.cargos = verificados_car;
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
  BuscarPorTipo(e: MatRadioChange) {
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

  // METODO PARA MOSTRAR METODOS DE CONSULTAS
  MostrarLista() {
    if (this.opcion === 'r') {
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
  ControlarOpciones(cargo: boolean, departamento: boolean, empleado: boolean, regimen: boolean) {
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

   isAllSelectedRol(){
    const numSelected = this.selectionRol.selected.length;
    return numSelected === this.listaUsuariosRol.length
   }
   masterToggleRol(){
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
    else if(this._booleanOptions.bool_rol === true) {
      this.tamanio_pagina_rol = e.pageSize;
      this.numero_pagina_rol = e.pageIndex + 1;
    }
  }

  // CONSULTA DE LOS DATOS REGIMEN
  ModelarRegimen(id: number, tipo: string, sucursal: any) {
    let usuarios: any = [];
    if (id === 0 || id === undefined) {
      this.empleados.forEach((empl: any) => {
        this.selectionReg.selected.find(selec => {
          if (empl.id_regimen === selec.id && empl.id_suc === selec.id_suc) {
            usuarios.push(empl)
          }
        })
      })
    }
    else {
      this.empleados.forEach((empl: any) => {
        if (empl.id_regimen === id && empl.id_suc === sucursal) {
          usuarios.push(empl)
        }
      })
    }
    this.SeleccionarProceso(tipo, usuarios);
  }

  // METODO PARA MOSTRAR DATOS DE CARGOS
  ModelarCargo(id: number, tipo: string, sucursal: number) {
    let usuarios: any = [];
    if (id === 0 || id === undefined) {
      this.empleados.forEach((empl: any) => {
        this.selectionCarg.selected.find(selec => {
          if (empl.id_cargo_ === selec.id && empl.id_suc === selec.id_suc) {
            usuarios.push(empl)
          }
        })
      })
    }
    else {
      this.empleados.forEach((empl: any) => {
        if (empl.id_cargo_ === id && empl.id_suc === sucursal) {
          usuarios.push(empl)
        }
      })
    }

    this.SeleccionarProceso(tipo, usuarios);
  }

  // METODO PARA MOSTRAR DATOS DE DEPARTAMENTOS
  ModelarDepartamentos(id: number, tipo: string, sucursal: number) {
    let usuarios: any = [];
    if (id === 0 || id === undefined) {
      this.empleados.forEach((empl: any) => {
        this.selectionDep.selected.find(selec => {
          if (empl.id_depa === selec.id && empl.id_suc === selec.id_suc) {
            usuarios.push(empl)
          }
        })
      })
    }
    else {
      this.empleados.forEach((empl: any) => {
        if (empl.id_depa === id && empl.id_suc === sucursal) {
          usuarios.push(empl)
        }
      })
    }

    console.log('ver usuarios ', usuarios);

    this.SeleccionarProceso(tipo, usuarios);
  }

  // METODO PARA MOSTRAR DATOS DE EMPLEADOS
  ModelarEmpleados(tipo: string) {
    let respuesta: any = [];
    this.empleados.forEach((obj: any) => {
      this.selectionEmp.selected.find(obj1 => {
        if (obj1.id === obj.id) {
          respuesta.push(obj)
        }
      })
    })

    this.SeleccionarProceso(tipo, respuesta);
  }

  // METODO DE SELECCTION DE TIPO DE PROCESO
  SeleccionarProceso(tipo: string, datos: any) {
    if (tipo === 'p') {
      this.abriEditarRolUser(datos);
    }
    else if (tipo === 'b') {
      this.abriEditarRolUser(datos);
    }
    else if (tipo === 'e') {
      this.abriEditarRolUser(datos);
    }
    else if (tipo === 'm') {
      this.abriEditarRolUser(datos);
    }
    else if (tipo === 't') {
      this.abriEditarRolUser(datos);
    }
    else if (tipo === 'c') {
      this.abriEditarRolUser(datos);
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
      this.seleccionarRol = false;
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
      this.seleccionarRol = false;
      this.asignarRol = true;
    }
  }

  // METODO DE VALIDACION DE SELECCION MULTIPLE - ROTATIVOS
  plan_rotativo: boolean = false;
  data_rotativo: any = []
  PlanificarRotativos(data: any) {
    console.log('data rotativos ', data)
    this.data_horario = [];
    if (data.length > 0) {
      this.data_horario = {
        usuarios: data,
        pagina: 'multiple-empleado',
      }
      this.seleccionarRol = false;
      this.plan_rotativo = true;
    }
    else {
      this.toastr.warning('No ha seleccionado usuarios.', '', {
        timeOut: 6000,
      });
    }
  }

  // METODO PARA VER PLANIFICACION
  resultados: any = [];
  VerPlanificacion(data: any) {
    console.log('VerPlanificacion', data);
    if (data.length > 0) {
      this.resultados = data;
      this.seleccionarRol = false;
      this.ventana_busquedaRol = true;
    }
    else {
      this.toastr.warning('No ha seleccionado usuarios.', '', {
        timeOut: 6000,
      });
    }
  }

    // METODO PARA TOMAR DATOS SELECCIONADOS
    MetodosFiltro(valor: any, tipo: string) {
      if (this.opcion === 'c') {
        this.ModelarCargo(valor.id, tipo, valor.id_suc);
      }
      else if (this.opcion === 'd') {
        this.ModelarDepartamentos(valor.id, tipo, valor.id_suc);
      }
      else if (this.opcion === 'r') {
        this.ModelarRegimen(valor.id, tipo, valor.id_suc);
      }
      else {
        this.ModelarEmpleados(tipo);
      }
      
    }
  

  abriEditarRolUser(datos: any){
    console.log('roles seleccionados: ',datos)
    if(datos.length > 0){
      this.ventana.open(EditarRolUserComponent, { width: '600px', data: datos }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          
        }
      });
    }else{
      this.toastr.warning('Seleccione usuarios para actualizar.', '', {
        timeOut: 4000,
      });
    }
    
  }

  abriEditarDepaUser(){
    this.ventana.open(EditarDepaUserComponent, { width: '600px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          
        }
      });
  }


}
