import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatRadioChange } from '@angular/material/radio';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';

// IMPORTAR PLANTILLA DE MODELO DE DATOS
import { checkOptions, FormCriteriosBusqueda } from 'src/app/model/reportes.model';
import { ITableEmpleados } from 'src/app/model/reportes.model';

// IMPORTAR SERVICIOS
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { ReportesService } from 'src/app/servicios/reportes/reportes.service';
import { MainNavService } from 'src/app/componentes/administracionGeneral/main-nav/main-nav.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';

@Component({
  selector: 'app-lista-app',
  templateUrl: './lista-app.component.html',
  styleUrls: ['./lista-app.component.css']
})

export class ListaAppComponent implements OnInit {

  buscador !: FormGroup;

  // CONTROL DE CRITERIOS DE BUSQUEDA
  codigo = new FormControl('');
  cedula = new FormControl('', [Validators.minLength(2)]);
  nombre_emp = new FormControl('', [Validators.minLength(2)]);
  nombre_dep = new FormControl('', [Validators.minLength(2)]);
  nombre_suc = new FormControl('', [Validators.minLength(2)]);
  seleccion = new FormControl('');

  public _booleanOptions: FormCriteriosBusqueda = {
    bool_suc: false,
    bool_dep: false,
    bool_emp: false,
  };

  public check: checkOptions[];

  // PRESENTACION DE INFORMACION DE ACUERDO AL CRITERIO DE BUSQUEDA HABILITADOS
  departamentos: any = [];
  sucursales: any = [];
  respuesta: any[];
  empleados: any = [];
  habilitados: any = [];

  selectionSuc = new SelectionModel<ITableEmpleados>(true, []);
  selectionDep = new SelectionModel<ITableEmpleados>(true, []);
  selectionEmp = new SelectionModel<ITableEmpleados>(true, []);

  // ITEMS DE PAGINACION DE LA TABLA SUCURSAL
  pageSizeOptions_suc = [5, 10, 20, 50];
  tamanio_pagina_suc: number = 5;
  numero_pagina_suc: number = 1;

  // ITEMS DE PAGINACION DE LA TABLA DEPARTAMENTO
  pageSizeOptions_dep = [5, 10, 20, 50];
  tamanio_pagina_dep: number = 5;
  numero_pagina_dep: number = 1;

  // ITEMS DE PAGINACION DE LA TABLA EMPLEADOS
  pageSizeOptions_emp = [5, 10, 20, 50];
  tamanio_pagina_emp: number = 5;
  numero_pagina_emp: number = 1;

  // FILTROS SUCURSALES
  filtroNombreSuc_: string = '';
  get filtroNombreSuc() { return this.restR.filtroNombreSuc }

  // FILTROS DEPARTAMENTOS
  filtroNombreDep_: string = '';
  get filtroNombreDep() { return this.restR.filtroNombreDep }

  // FILTROS EMPLEADO
  filtroCodigo_: number;
  filtroCedula_: string = '';
  filtroNombreEmp_: string = '';
  get filtroNombreEmp() { return this.restR.filtroNombreEmp };
  get filtroCodigo() { return this.restR.filtroCodigo };
  get filtroCedula() { return this.restR.filtroCedula };


  /** ********************************************************************************************************************** **
   ** **                         INICIALIZAR VARIABLES DE USUARIOS DESHABILITADOS TIMBRE WEB                              ** ** 
   ** ********************************************************************************************************************** **/

  // CONTROL DE CRITERIOS DE BUSQUEDA
  codigo_dh = new FormControl('');
  cedula_dh = new FormControl('', [Validators.minLength(2)]);
  nombre_emp_dh = new FormControl('', [Validators.minLength(2)]);
  nombre_dep_dh = new FormControl('', [Validators.minLength(2)]);
  nombre_suc_dh = new FormControl('', [Validators.minLength(2)]);
  seleccion_dh = new FormControl('');

  public _booleanOptions_dh: FormCriteriosBusqueda = {
    bool_suc: false,
    bool_dep: false,
    bool_emp: false,
  };

  public check_dh: checkOptions[];

  // PRESENTACION DE INFORMACION DE ACUERDO AL CRITERIO DE BUSQUEDA DESHABILITADOS
  departamentos_dh: any = [];
  sucursales_dh: any = [];
  respuesta_dh: any[];
  empleados_dh: any = [];
  deshabilitados: any = [];

  selectionSuc_dh = new SelectionModel<ITableEmpleados>(true, []);
  selectionDep_dh = new SelectionModel<ITableEmpleados>(true, []);
  selectionEmp_dh = new SelectionModel<ITableEmpleados>(true, []);

  // ITEMS DE PAGINACION DE LA TABLA SUCURSAL
  pageSizeOptions_suc_dh = [5, 10, 20, 50];
  tamanio_pagina_suc_dh: number = 5;
  numero_pagina_suc_dh: number = 1;

  // ITEMS DE PAGINACION DE LA TABLA DEPARTAMENTO
  pageSizeOptions_dep_dh = [5, 10, 20, 50];
  tamanio_pagina_dep_dh: number = 5;
  numero_pagina_dep_dh: number = 1;

  // ITEMS DE PAGINACION DE LA TABLA EMPLEADOS
  pageSizeOptions_emp_dh = [5, 10, 20, 50];
  tamanio_pagina_emp_dh: number = 5;
  numero_pagina_emp_dh: number = 1;

  // FILTROS SUCURSALES
  dh_filtroNombreSuc_: string = '';
  get dh_filtroNombreSuc() { return this.restR.filtroNombreSuc }

  // FILTROS DEPARTAMENTOS
  dh_filtroNombreDep_: string = '';
  get dh_filtroNombreDep() { return this.restR.filtroNombreDep }

  // FILTROS EMPLEADO
  dh_filtroCodigo_: number;
  dh_filtroCedula_: string = '';
  dh_filtroNombreEmp_: string = '';
  get dh_filtroNombreEmp() { return this.restR.filtroNombreEmp };
  get dh_filtroCodigo() { return this.restR.filtroCodigo };
  get dh_filtroCedula() { return this.restR.filtroCedula };

  // HABILITAR O DESHABILITAR EL ICONO DE PROCESO INDIVIDUAL
  individual: boolean = true;
  individual_dh: boolean = true;

  get habilitarMovil(): boolean { return this.funciones.app_movil; }

  constructor(
    private toastr: ToastrService,
    private validar: ValidacionesService,
    private funciones: MainNavService,
    public informacion: UsuarioService,
    public restR: ReportesService,
  ) { }

  ngOnInit(): void {
    if (this.habilitarMovil === false) {
      let mensaje = {
        access: false,
        title: `Ups!!! al parecer no tienes activado en tu plan el Módulo de Aplicación Móvil. \n`,
        message: '¿Te gustaría activarlo? Comunícate con nosotros.',
        url: 'www.casapazmino.com.ec'
      }
      return this.validar.RedireccionarHomeAdmin(mensaje);
    }
    else {
      this.check = this.restR.checkOptions([{ opcion: 's' }, { opcion: 'd' }, { opcion: 'e' }]);
      this.check_dh = this.restR.checkOptions(3);
      this.BuscarInformacionHabilitados();
      this.BuscarInformacioDeshabilitados();
    }
  }

  ngOnDestroy() {
    this.restR.GuardarCheckOpcion('');
    this.restR.DefaultFormCriterios();
    this.restR.DefaultValoresFiltros();
    this.habilitados = [];
    this.deshabilitados = [];
  }


  /** ************************************************************************************************************** **
   ** **                        MANEJO DE DATOS DE USUARIOS DESHABILITADOS TIMBRE MOVIL                           ** **
   ** ************************************************************************************************************** **/

  // METODO PARA BUSCAR DATOS DE EMPRESA
  activar_deshabilitados: boolean = true;
  BuscarInformacioDeshabilitados() {
    this.departamentos_dh = [];
    this.deshabilitados = [];
    this.sucursales_dh = [];
    this.empleados_dh = [];
    this.informacion.UsuariosTimbreMovil(false).subscribe((res: any[]) => {
      this.activar_deshabilitados = true;
      this.deshabilitados = JSON.stringify(res);

      res.forEach(obj => {
        this.sucursales_dh.push({
          id: obj.id_suc,
          nombre: obj.name_suc
        })
      })

      res.forEach(obj => {
        obj.departamentos.forEach(ele => {
          this.departamentos_dh.push({
            id: ele.id_depa,
            nombre: ele.name_dep,
            sucursal: ele.sucursal
          })
        })
      })

      res.forEach(obj => {
        obj.departamentos.forEach(ele => {
          ele.empleado.forEach(r => {
            let elemento = {
              id: r.id,
              nombre: r.nombre,
              codigo: r.codigo,
              cedula: r.cedula,
              web_habilita: r.web_habilita,
              userid: r.userid,
            }
            this.empleados_dh.push(elemento)
          })
        })
      })
      console.log('SUCURSALES', this.sucursales_dh);
      console.log('DEPARTAMENTOS', this.departamentos_dh);
      console.log('EMPLEADOS', this.empleados_dh);

    }, err => {
      this.activar_deshabilitados = false;
    })
  }

  // METODO PARA ACTIVAR SELECCION MULTIPLE
  multiple_dh: boolean = false;
  HabilitarSeleccion_dh() {
    this.multiple_dh = true;
    this.individual_dh = false;
    this.activar_seleccion_dh = false;
  }

  // METODO PARA MOSTRAR DATOS DE BUSQUEDA
  opcion_dh: number;
  activar_boton_dh: boolean = false;
  activar_seleccion_dh: boolean = true;
  BuscarPorTipo_dh(e: MatRadioChange) {
    this.opcion_dh = e.value;
    this.activar_boton_dh = true;
    this.activar_habilitados = false;
    switch (this.opcion_dh) {
      case 1:
        this._booleanOptions_dh.bool_suc = true;
        this._booleanOptions_dh.bool_dep = false;
        this._booleanOptions_dh.bool_emp = false;
        this.activar_seleccion_dh = true;
        this.multiple_dh = false;
        this.individual_dh = true;
        break;
      case 2:
        this._booleanOptions_dh.bool_suc = false;
        this._booleanOptions_dh.bool_dep = true;
        this._booleanOptions_dh.bool_emp = false;
        this.activar_seleccion_dh = true;
        this.multiple_dh = false;
        this.individual_dh = true;
        break;
      case 3:
        this._booleanOptions_dh.bool_suc = false;
        this._booleanOptions_dh.bool_dep = false;
        this._booleanOptions_dh.bool_emp = true;
        this.activar_seleccion_dh = true;
        this.multiple_dh = false;
        this.individual_dh = true;
        break;
      default:
        this._booleanOptions_dh.bool_suc = false;
        this._booleanOptions_dh.bool_dep = false;
        this._booleanOptions_dh.bool_emp = false;
        this.activar_seleccion_dh = true;
        this.multiple_dh = false;
        this.individual_dh = true;
        break;
    }
    this.restR.GuardarFormCriteriosBusqueda(this._booleanOptions_dh);
    //this.restR.GuardarCheckOpcion(this.opcion_dh)
  }

  // METODO PARA TOMAR DATOS SELECCIONADOS
  GuardarRegistros_DH(id: number) {
    console.log('ver opcion .. ', this.opcion_dh)
    if (this.opcion_dh === 1) {
      this.ModelarSucursal_DH(id);
    }
    else if (this.opcion_dh === 2) {
      this.ModelarDepartamentos_DH(id);
    }
    else {
      this.ModelarEmpleados_DH();
    }
  }

  // METODO PARA PRESENTAR DATOS DE SUCURSALES
  ModelarSucursal_DH(id: number) {
    let usuarios: any = [];
    let respuesta = JSON.parse(this.deshabilitados)
    if (id === 0) {
      respuesta.forEach((obj: any) => {
        this.selectionSuc_dh.selected.find(obj1 => {
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

    this.RegistrarMultiple(usuarios, 1);
  }

  // METODO PARA PRESENTAR DATOS DE DEPARTAMENTOS
  ModelarDepartamentos_DH(id: number) {
    let usuarios: any = [];
    let respuesta = JSON.parse(this.deshabilitados)

    if (id === 0) {
      respuesta.forEach((obj: any) => {
        obj.departamentos.forEach((obj1: any) => {
          this.selectionDep_dh.selected.find(obj2 => {
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

    this.RegistrarMultiple(usuarios, 1);
  }

  // METODO PARA PRESENTAR DATOS DE EMPLEADO
  ModelarEmpleados_DH() {
    let respuesta: any = [];
    this.empleados_dh.forEach((obj: any) => {
      this.selectionEmp_dh.selected.find(obj1 => {
        if (obj1.id === obj.id) {
          respuesta.push(obj)
        }
      })
    })
    this.RegistrarMultiple(respuesta, 1);
  }

  // MOSTRAR DATOS DE EMPRESA
  MostrarLista_DH() {
    if (this.opcion_dh === 1) {
      this.nombre_suc_dh.reset();
      this.Filtrar_DH('', 1)
    }
    else if (this.opcion_dh === 2) {
      this.nombre_dep_dh.reset();
      this.Filtrar_DH('', 2)
    }
    else if (this.opcion_dh === 3) {
      this.codigo_dh.reset();
      this.cedula_dh.reset();
      this.nombre_emp_dh.reset();
      this.Filtrar_DH('', 3)
      this.Filtrar_DH('', 4)
      this.Filtrar_DH('', 5)
    }
  }

  // METODO PARA FILTRAR DATOS DE BUSQUEDA
  Filtrar_DH(e: any, orden: number) {
    switch (orden) {
      case 1: this.restR.setFiltroNombreSuc(e); break;
      case 2: this.restR.setFiltroNombreDep(e); break;
      case 3: this.restR.setFiltroCodigo(e); break;
      case 4: this.restR.setFiltroCedula(e); break;
      case 5: this.restR.setFiltroNombreEmp(e); break;
      default:
        break;
    }
  }

  /** ************************************************************************************** **
   ** **            METODOS DE SELECCION DE DATOS DE USUARIOS DESHABILITADOS              ** **
   ** ************************************************************************************** **/

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS. 
  isAllSelectedSuc_DH() {
    const numSelected = this.selectionSuc_dh.selected.length;
    return numSelected === this.sucursales_dh.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA. 
  masterToggleSuc_DH() {
    this.isAllSelectedSuc_DH() ?
      this.selectionSuc_dh.clear() :
      this.sucursales_dh.forEach(row => this.selectionSuc_dh.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelSuc_DH(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedSuc_DH() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionSuc_dh.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS. 
  isAllSelectedDep_DH() {
    const numSelected = this.selectionDep_dh.selected.length;
    return numSelected === this.departamentos_dh.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA. 
  masterToggleDep_DH() {
    this.isAllSelectedDep_DH() ?
      this.selectionDep_dh.clear() :
      this.departamentos_dh.forEach(row => this.selectionDep_dh.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelDep_DH(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedDep_DH() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionDep_dh.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS. 
  isAllSelectedEmp_DH() {
    const numSelected = this.selectionEmp_dh.selected.length;
    return numSelected === this.empleados_dh.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA. 
  masterToggleEmp_DH() {
    this.isAllSelectedEmp_DH() ?
      this.selectionEmp_dh.clear() :
      this.empleados_dh.forEach(row => this.selectionEmp_dh.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelEmp_DH(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedEmp_DH() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionEmp_dh.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // METODO DE PAGINACION DE DATOS
  ManejarPaginaResultados_DH(e: PageEvent) {
    if (this._booleanOptions_dh.bool_suc === true) {
      this.tamanio_pagina_suc_dh = e.pageSize;
      this.numero_pagina_suc_dh = e.pageIndex + 1;
    } else if (this._booleanOptions_dh.bool_dep === true) {
      this.tamanio_pagina_dep_dh = e.pageSize;
      this.numero_pagina_dep_dh = e.pageIndex + 1;
    } else if (this._booleanOptions_dh.bool_emp === true) {
      this.tamanio_pagina_emp_dh = e.pageSize;
      this.numero_pagina_emp_dh = e.pageIndex + 1;
    }
  }


  /** ************************************************************************************************************** **
   ** **                         MANEJO DE DATOS DE USUARIOS HABILITADOS TIMBRE MOVIL                             ** **
   ** ************************************************************************************************************** **/

  // METODO PARA BUSCAR DATOS DE EMPRESA
  activar_habilitados: boolean = true;
  BuscarInformacionHabilitados() {
    this.departamentos = [];
    this.habilitados = [];
    this.sucursales = [];
    this.empleados = [];
    this.informacion.UsuariosTimbreMovil(true).subscribe((res: any[]) => {
      this.activar_habilitados = true;
      this.habilitados = JSON.stringify(res);

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
            nombre: ele.name_dep,
            sucursal: ele.sucursal
          })
        })
      })

      res.forEach(obj => {
        obj.departamentos.forEach(ele => {
          ele.empleado.forEach(r => {
            let elemento = {
              id: r.id,
              nombre: r.nombre,
              codigo: r.codigo,
              cedula: r.cedula,
              app_habilita: r.app_habilita,
              userid: r.userid,
            }
            this.empleados.push(elemento)
          })
        })
      })
      console.log('SUCURSALES', this.sucursales);
      console.log('DEPARTAMENTOS', this.departamentos);
      console.log('EMPLEADOS', this.empleados);

    }, err => {
      this.activar_habilitados = false;
    })
  }

  // METODO PARA ACTIVAR SELECCION MULTIPLE
  multiple: boolean = false;
  HabilitarSeleccion() {
    this.multiple = true;
    this.individual = false;
    this.activar_seleccion = false;
  }

  // METODO PARA MOSTRAR DATOS DE BUSQUEDA
  opcion: number;
  activar_boton: boolean = false;
  activar_seleccion: boolean = true;
  BuscarPorTipo(e: MatRadioChange) {
    this.opcion = e.value;
    this.activar_boton = true;
    this.activar_deshabilitados = false;
    switch (this.opcion) {
      case 1:
        this._booleanOptions.bool_suc = true;
        this._booleanOptions.bool_dep = false;
        this._booleanOptions.bool_emp = false;
        this.activar_seleccion = true;
        this.multiple = false;
        this.individual = true;
        break;
      case 2:
        this._booleanOptions.bool_suc = false;
        this._booleanOptions.bool_dep = true;
        this._booleanOptions.bool_emp = false;
        this.activar_seleccion = true;
        this.multiple = false;
        this.individual = true;
        break;
      case 3:
        this._booleanOptions.bool_suc = false;
        this._booleanOptions.bool_dep = false;
        this._booleanOptions.bool_emp = true;
        this.activar_seleccion = true;
        this.multiple = false;
        this.individual = true;
        break;
      default:
        this._booleanOptions.bool_suc = false;
        this._booleanOptions.bool_dep = false;
        this._booleanOptions.bool_emp = false;
        this.activar_seleccion = true;
        this.multiple = false;
        this.individual = true;
        break;
    }
    this.restR.GuardarFormCriteriosBusqueda(this._booleanOptions);
    //this.restR.GuardarCheckOpcion(this.opcion)

  }

  // METODO PARA FILTRAR DATOS DE BUSQUEDA
  Filtrar(e: any, orden: number) {
    switch (orden) {
      case 6: this.restR.setFiltroNombreSuc(e); break;
      case 7: this.restR.setFiltroNombreDep(e); break;
      case 8: this.restR.setFiltroCodigo(e); break;
      case 9: this.restR.setFiltroCedula(e); break;
      case 10: this.restR.setFiltroNombreEmp(e); break;
      default:
        break;
    }
  }

  /** ************************************************************************************** **
   ** **            METODOS DE SELECCION DE DATOS DE USUARIOS HABILITADOS                 ** **
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
  isAllSelectedDep() {
    const numSelected = this.selectionDep.selected.length;
    return numSelected === this.departamentos.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA. 
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

  // METODO DE PAGINACION DE DATOS
  ManejarPaginaResultados(e: PageEvent) {
    if (this._booleanOptions.bool_suc === true) {
      this.tamanio_pagina_suc = e.pageSize;
      this.numero_pagina_suc = e.pageIndex + 1;
    } else if (this._booleanOptions.bool_dep === true) {
      this.tamanio_pagina_dep = e.pageSize;
      this.numero_pagina_dep = e.pageIndex + 1;
    } else if (this._booleanOptions.bool_emp === true) {
      this.tamanio_pagina_emp = e.pageSize;
      this.numero_pagina_emp = e.pageIndex + 1;
    }
  }

  // METODO PARA PRESENTAR DATOS DE SUCURSALES
  ModelarSucursal(id: number) {
    let usuarios: any = [];
    let respuesta = JSON.parse(this.habilitados)
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

    this.RegistrarMultiple(usuarios, 2);
  }

  // METODO PARA PRESENTAR DATOS DE DEPARTAMENTOS
  ModelarDepartamentos(id: number) {
    let usuarios: any = [];
    let respuesta = JSON.parse(this.habilitados)

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

    this.RegistrarMultiple(usuarios, 2);
  }

  // METODO PARA PRESENTAR DATOS DE EMPLEADO
  ModelarEmpleados() {
    let respuesta: any = [];
    this.empleados.forEach((obj: any) => {
      this.selectionEmp.selected.find(obj1 => {
        if (obj1.id === obj.id) {
          respuesta.push(obj)
        }
      })
    })
    this.RegistrarMultiple(respuesta, 2);
  }


  /** ************************************************************************************** **
   ** **               METODOS DE ACTUALIZACION DE ESTADO DE TIMBRE WEB                   ** ** 
   ** ************************************************************************************** **/

  RegistrarConfiguracion(usuario: any, tipo: number) {
    this.Registrar(usuario, tipo);
  }

  // METODO DE VALIDACION DE SELECCION MULTIPLE
  RegistrarMultiple(data: any, tipo: number) {
    if (data.length > 0) {
      this.Registrar(data, tipo);
    }
    else {
      this.toastr.warning('No ha seleccionado usuarios.', '', {
        timeOut: 6000,
      });
    }
  }

  // METODO PARA CONFIGURAR DATOS
  Registrar(seleccionados: any, tipo: number) {
    if (seleccionados.length === undefined) {
      seleccionados = [seleccionados];
    }
    this.informacion.ActualizarEstadoTimbreMovil(seleccionados).subscribe(res => {
      this.toastr.success(res.message)
      this.individual = true;
      this.individual_dh = true;
      this.LimpiarFormulario(tipo);
      this.BuscarInformacionHabilitados();
      this.BuscarInformacioDeshabilitados();
    }, err => {
      this.toastr.error(err.error.message)
    })
  }


  // METODO PARA TOMAR DATOS SELECCIONADOS
  GuardarRegistros(id: number) {
    if (this.opcion === 1) {
      this.ModelarSucursal(id);
    }
    else if (this.opcion === 2) {
      this.ModelarDepartamentos(id);
    }
    else {
      this.ModelarEmpleados();
    }
  }

  // METODO PARA LIMPIAR FORMULARIOS
  LimpiarFormulario(tipo: number) {
    if (this.sucursales.length > 0) {
      this.activar_habilitados = true;
    }
    if (this.sucursales_dh.length > 0) {
      this.activar_deshabilitados = true;
    }
    if (tipo === 2) {
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

      this.seleccion.reset();
      this.activar_boton = false;
    }
    else {
      if (this._booleanOptions_dh.bool_emp === true) {
        this.codigo_dh.reset();
        this.cedula_dh.reset();
        this.nombre_emp_dh.reset();
        this._booleanOptions_dh.bool_emp = false;
        this.selectionEmp_dh.clear();
      }

      if (this._booleanOptions_dh.bool_dep) {
        this.nombre_dep_dh.reset();
        this._booleanOptions_dh.bool_dep = false;
        this.selectionDep_dh.clear();
      }

      if (this._booleanOptions_dh.bool_suc) {
        this.nombre_suc_dh.reset();
        this._booleanOptions_dh.bool_suc = false;
        this.selectionSuc_dh.clear();
      }

      this.seleccion_dh.reset();
      this.activar_boton_dh = false;
    }
  }

  // MOSTRAR DATOS DE EMPRESA
  MostrarLista() {
    if (this.opcion === 1) {
      this.nombre_suc.reset();
      this.Filtrar('', 6)
    }
    else if (this.opcion === 2) {
      this.nombre_dep.reset();
      this.Filtrar('', 7)
    }
    else if (this.opcion === 3) {
      this.codigo.reset();
      this.cedula.reset();
      this.nombre_emp.reset();
      this.Filtrar('', 8)
      this.Filtrar('', 9)
      this.Filtrar('', 10)
    }
  }

  // METODO PARA VALIDAR INGRESO DE LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  // METODO PARA VALIDAR INGRESO DE NUMEROS
  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

}