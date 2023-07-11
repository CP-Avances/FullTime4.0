import { Validators, FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatRadioChange } from '@angular/material/radio';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';

// IMPORTAR PLANTILLA DE MODELO DE DATOS
import { checkOptions, FormCriteriosBusqueda } from 'src/app/model/reportes.model';
import { ITableEmpleados } from 'src/app/model/reportes.model';

import { PeriodoVacacionesService } from 'src/app/servicios/periodoVacaciones/periodo-vacaciones.service';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { ReportesService } from 'src/app/servicios/reportes/reportes.service';
import { MainNavService } from 'src/app/componentes/administracionGeneral/main-nav/main-nav.service';

@Component({
  selector: 'app-permisos-multiples-empleados',
  templateUrl: './permisos-multiples-empleados.component.html',
  styleUrls: ['./permisos-multiples-empleados.component.css']
})

export class PermisosMultiplesEmpleadosComponent implements OnInit {

  idEmpleadoLogueado: any;

  // CONTROL DE CRITERIOS DE BUSQUEDA
  codigo = new FormControl('');
  cedula = new FormControl('', [Validators.minLength(2)]);
  nombre_emp = new FormControl('', [Validators.minLength(2)]);
  nombre_dep = new FormControl('', [Validators.minLength(2)]);
  nombre_suc = new FormControl('', [Validators.minLength(2)]);
  nombre_carg = new FormControl('', [Validators.minLength(2)]);
  seleccion = new FormControl('');

  // VARIABLES DE FILTROS DE BUSQUEDA
  filtroNombreSuc_: string = '';
  get filtroNombreSuc() { return this.restR.filtroNombreSuc }

  filtroNombreCarg_: string = '';
  get filtroNombreCarg() { return this.restR.filtroNombreCarg };

  filtroNombreDep_: string = '';
  get filtroNombreDep() { return this.restR.filtroNombreDep }

  filtroCodigo_: any;
  filtroCedula_: string = '';
  filtroNombreEmp_: string = '';
  get filtroNombreEmp() { return this.restR.filtroNombreEmp };
  get filtroCodigo() { return this.restR.filtroCodigo };
  get filtroCedula() { return this.restR.filtroCedula };


  public _booleanOptions: FormCriteriosBusqueda = {
    bool_suc: false,
    bool_dep: false,
    bool_emp: false,
    bool_cargo: false,
  };

  public check: checkOptions[];
  habilitado: any;

  // PRESENTACION DE INFORMACION DE ACUERDO AL CRITERIO DE BUSQUEDA
  departamentos: any = [];
  sucursales: any = [];
  respuesta: any[];
  empleados: any = [];
  origen: any = [];

  selectionSuc = new SelectionModel<ITableEmpleados>(true, []);
  selectionCarg = new SelectionModel<ITableEmpleados>(true, []);
  selectionDep = new SelectionModel<ITableEmpleados>(true, []);
  selectionEmp = new SelectionModel<ITableEmpleados>(true, []);

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

  // HABILITAR O DESHABILITAR EL ICONO DE AUTORIZACION INDIVIDUAL
  auto_individual: boolean = true;

  // BUSQUEDA DE MODULOS ACTIVOS
  get habilitarPermiso(): boolean { return this.funciones.permisos; }

  // ACTIVAR VISTA DE REGISTRO DE PERMISOS
  activar_permisos: boolean = false;
  activar_busqueda: boolean = true;
  data: any = [];

  constructor(
    public informacion: DatosGeneralesService,
    public restPerV: PeriodoVacacionesService,
    public restR: ReportesService,
    private toastr: ToastrService,
    private validar: ValidacionesService,
    private funciones: MainNavService,
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    if (this.habilitarPermiso === false) {
      let mensaje = {
        access: false,
        message: `Ups!!! al parecer no tienes activado en tu plan el Módulo de Permisos. \n
        ¿Te gustaría activarlo? Comunícate con nosotros. \n`,
        url: 'www.casapazmino.com.ec'
      }
      return this.validar.RedireccionarHomeAdmin(mensaje);
    }
    else {
      this.check = this.restR.checkOptions([{ opcion: 'c' }, { opcion: 's' }, { opcion: 'd' }, { opcion: 'e' }]);
      this.BuscarInformacion();
      this.BuscarCargos();
    }
  }

  // METODO PARA DESTRUIR PROCESOS
  ngOnDestroy() {
    this.restR.GuardarCheckOpcion('');
    this.restR.DefaultFormCriterios();
    this.restR.DefaultValoresFiltros();
    this.origen = [];
  }

  // METODO PARA FILTRAR POR CARGOS
  empleados_cargos: any = [];
  origen_cargo: any = [];
  cargos: any = [];
  BuscarCargos() {
    this.informacion.ObtenerInformacionCargo().subscribe((res: any[]) => {
      this.origen_cargo = JSON.stringify(res);

      res.forEach(obj => {
        this.cargos.push({
          id: obj.id_cargo,
          nombre: obj.name_cargo
        })
      })

      res.forEach(obj => {
        obj.empleados.forEach(r => {
          this.empleados_cargos.push({
            id: r.id,
            nombre: r.name_empleado,
            codigo: r.codigo,
            cedula: r.cedula,
            correo: r.correo,
            id_cargo: r.id_cargo,
            id_contrato: r.id_contrato,
            hora_trabaja: r.hora_trabaja
          })
        })
      })
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  // BUSCAR DATOS DE USUARIOS
  BuscarInformacion() {
    this.origen = [];
    this.informacion.ObtenerInformacion().subscribe((res: any[]) => {
      this.origen = JSON.stringify(res);

      res.forEach(obj => {
        this.sucursales.push({
          id: obj.id_suc,
          nombre: obj.name_suc
        })
      })

      res.forEach(obj => {
        obj.departamentos.forEach(ele => {
          this.departamentos.push({
            id: ele.id_depa,
            departamento: ele.name_dep,
            nombre: ele.sucursal,
          })
        })
      })

      res.forEach(obj => {
        obj.departamentos.forEach(ele => {
          ele.empleado.forEach(r => {
            let elemento = {
              id: r.id,
              nombre: r.name_empleado,
              codigo: r.codigo,
              cedula: r.cedula,
              correo: r.correo,
              id_cargo: r.id_cargo,
              id_contrato: r.id_contrato,
            }
            this.empleados.push(elemento)
          })
        })
      })
    }, err => {
      this.toastr.info(err.error.message);
    })
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
    this.opcion = e.value;
    this.activar_boton = true;
    this.MostrarLista();
    switch (this.opcion) {
      case 's':
        this.ControlarOpciones(true, false, false, false);
        this.ControlarBotones(true, false, true);
        break;
      case 'c':
        this.ControlarOpciones(false, true, false, false);
        this.ControlarBotones(true, false, true);
        break;
      case 'd':
        this.ControlarOpciones(false, false, true, false);
        this.ControlarBotones(true, false, true);
        break;
      case 'e':
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

  // METODO PARA CONTROLAR OPCIONES DE BUSQUEDA
  ControlarOpciones(sucursal: boolean, cargo: boolean, departamento: boolean, empleado: boolean,) {
    this._booleanOptions.bool_suc = sucursal;
    this._booleanOptions.bool_cargo = cargo;
    this._booleanOptions.bool_dep = departamento;
    this._booleanOptions.bool_emp = empleado;
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
      case 1: this.restR.setFiltroNombreSuc(e); break;
      case 2: this.restR.setFiltroNombreCarg(e); break;
      case 3: this.restR.setFiltroNombreDep(e); break;
      case 4: this.restR.setFiltroCodigo(e); break;
      case 5: this.restR.setFiltroCedula(e); break;
      case 6: this.restR.setFiltroNombreEmp(e); break;
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

  /** ************************************************************************************** **
   ** **                   METODOS DE SELECCION DE DATOS DE USUARIOS                      ** **
   ** ************************************************************************************** **/

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS. 
  isAllSelectedSuc() {
    const numSelected = this.selectionSuc.selected.length;
    return numSelected === this.sucursales.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA. 
  masterToggleSuc() {
    this.isAllSelectedSuc() ?
      this.selectionSuc.clear() :
      this.sucursales.forEach(row => this.selectionSuc.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelSuc(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedSuc() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionSuc.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
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
      this.cargos.forEach(row => this.selectionCarg.select(row));
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

  // SELECCIONA TODAS LAS FILAS SI NO ESTÁN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA. 
  masterToggleDep() {
    this.isAllSelectedDep() ?
      this.selectionDep.clear() :
      this.departamentos.forEach(row => this.selectionDep.select(row));
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
      this.empleados.forEach(row => this.selectionEmp.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelEmp(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedEmp() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionEmp.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  //EVENTO DE PAGINACION
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
  }

  // MODELO PARA MOSTRAR DATOS DE SUCURSALES
  ModelarSucursal(id: number) {
    let usuarios: any = [];
    let respuesta = JSON.parse(this.origen)
    if (id === 0) {
      respuesta.forEach((obj: any) => {
        this.selectionSuc.selected.find(obj1 => {
          if (obj.id_suc === obj1.id) {
            obj.departamentos.forEach((obj2: any) => {
              obj2.empleado.forEach((obj3: any) => {
                usuarios.push(obj3)
              })
            })
          }
        })
      })
    }
    else {
      respuesta.forEach((obj: any) => {
        if (obj.id_suc === id) {
          obj.departamentos.forEach((obj2: any) => {
            obj2.empleado.forEach((obj3: any) => {
              usuarios.push(obj3)
            })
          })
        }
      })
    }

    if (usuarios.length === 1) {
      this.RegistrarPermiso(usuarios[0]);
    } else {
      this.RegistrarMultiple(usuarios);
    }
  }

  // METODO PARA MOSTRAR DATOS DE CARGOS
  ModelarCargo(id: number) {
    let usuarios: any = [];
    let respuesta = JSON.parse(this.origen_cargo)
    if (id === 0) {
      respuesta.forEach((obj: any) => {
        this.selectionCarg.selected.find(obj1 => {
          if (obj.id_cargo === obj1.id) {
            obj.empleados.forEach((obj3: any) => {
              usuarios.push(obj3)
            })
          }
        })
      })
    }
    else {
      respuesta.forEach((obj: any) => {
        if (obj.id_cargo === id) {
          obj.empleados.forEach((obj3: any) => {
            usuarios.push(obj3)
          })
        }
      })
    }

    if (usuarios.length === 1) {
      this.RegistrarPermiso(usuarios[0]);
    } else {
      this.RegistrarMultiple(usuarios);
    }
  }

  // METODO PARA MOSTRAR DATOS DE DEPARTAMENTOS
  ModelarDepartamentos(id: number) {
    let usuarios: any = [];
    let respuesta = JSON.parse(this.origen)

    if (id === 0) {
      respuesta.forEach((obj: any) => {
        obj.departamentos.forEach((obj1: any) => {
          this.selectionDep.selected.find(obj2 => {
            if (obj1.id_depa === obj2.id) {
              obj1.empleado.forEach((obj3: any) => {
                usuarios.push(obj3)
              })
            }
          })
        })
      })
    }
    else {
      respuesta.forEach((obj: any) => {
        obj.departamentos.forEach((obj1: any) => {
          if (obj1.id_depa === id) {
            obj1.empleado.forEach((obj3: any) => {
              usuarios.push(obj3)
            })
          }
        })
      })
    }

    if (usuarios.length === 1) {
      this.RegistrarPermiso(usuarios[0]);
    } else {
      this.RegistrarMultiple(usuarios);
    }
  }

  // METODO PARA MOSTRAR DATOS DE EMPLEADO
  ModelarEmpleados() {
    let respuesta: any = [];
    this.empleados.forEach((obj: any) => {
      this.selectionEmp.selected.find(obj1 => {
        if (obj1.id === obj.id) {
          respuesta.push(obj)
        }
      })
    })

    if (respuesta.length === 1) {
      this.RegistrarPermiso(respuesta[0]);
    } else {
      this.RegistrarMultiple(respuesta);
    }
  }


  /** ************************************************************************************** **
   ** **                       METODOS DE REGISTRO DE PERMISOS                            ** ** 
   ** ************************************************************************************** **/

  // METODO PARA ABRIR FORMULARIO DE PERMISO
  permiso_individual: boolean = false;
  solicita_permiso: any = [];
  RegistrarPermiso(usuario: any) {
    console.log('usuario ', usuario)
    this.data = [usuario];
    this.activar_busqueda = false;
    this.activar_permisos = false;
    this.permiso_individual = true;
    this.solicita_permiso = [];

    this.solicita_permiso = [
      {
        id_empleado: usuario.id,
        id_contrato: usuario.id_contrato,
        id_cargo: usuario.id_cargo,
        ventana: 'multiples'
      }
    ]
  }

  // METODO DE VALIDACION DE SELECCION MULTIPLE
  RegistrarMultiple(data: any) {
    if (data.length > 0) {
      this.Registrar(data);
    }
    else {
      this.toastr.warning('No ha seleccionado usuarios.', '', {
        timeOut: 6000,
      });
    }
  }

  // METODO PARA ABRIR FORMULARIO DE REGISTRO MULTIPLE DE PERMISOS
  Registrar(seleccionados: any) {
    this.data = seleccionados;
    this.activar_busqueda = false;
    this.activar_permisos = true;
  }

  // METODO PARA TOMAR DATOS SELECCIONADOS
  GuardarRegistros(id: number) {
    if (this.opcion === 's') {
      this.ModelarSucursal(id);
    }
    else if (this.opcion === 'c') {
      this.ModelarCargo(id);
    }
    else if (this.opcion === 'd') {
      this.ModelarDepartamentos(id);
    }
    else {
      this.ModelarEmpleados();
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

    if (this._booleanOptions.bool_cargo) {
      this._booleanOptions.bool_cargo = false;
      this.selectionCarg.deselect();
      this.selectionCarg.clear();
    }

    this.seleccion.reset();
    this.activar_boton = false;
  }

  // METODO PARA MOSTRAR LISTA DE DATOS
  MostrarLista() {
    if (this.opcion === 's') {
      this.nombre_suc.reset();
      this.filtroNombreSuc_ = '';
      this.selectionDep.clear();
      this.selectionCarg.clear();
      this.selectionEmp.clear();
      this.Filtrar('', 1)
    }
    else if (this.opcion === 'c') {
      this.nombre_carg.reset();
      this.filtroNombreCarg_ = '';
      this.selectionEmp.clear();
      this.selectionDep.clear();
      this.selectionSuc.clear();
      this.Filtrar('', 2)
    }
    else if (this.opcion === 'd') {
      this.nombre_dep.reset();
      this.filtroNombreDep_ = '';
      this.nombre_suc.reset();
      this.filtroNombreSuc_ = '';
      this.selectionEmp.clear();
      this.selectionCarg.clear();
      this.selectionSuc.clear();
      this.Filtrar('', 1)
      this.Filtrar('', 3)
    }
    else if (this.opcion === 'e') {
      this.codigo.reset();
      this.cedula.reset();
      this.nombre_emp.reset();
      this.filtroCodigo_ = '';
      this.filtroCedula_ = '';
      this.filtroNombreEmp_ = '';
      this.selectionDep.clear();
      this.selectionCarg.clear();
      this.selectionSuc.clear();
      this.Filtrar('', 4)
      this.Filtrar('', 5)
      this.Filtrar('', 6)
    }
  }

  // METODO PARA INGRESAR SOLO LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  // METODO PARA INGRESAR SOLO NUMEROS
  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

}
