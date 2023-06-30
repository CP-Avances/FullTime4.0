import { MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { checkOptions, FormCriteriosBusqueda } from 'src/app/model/reportes.model';
import { Validators, FormControl, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatRadioChange } from '@angular/material/radio';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
import * as moment from 'moment';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
moment.locale('es');

import { ReportesService } from 'src/app/servicios/reportes/reportes.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';

import { ITableEmpleados } from 'src/app/model/reportes.model';
import { PlanHoraExtraComponent } from '../plan-hora-extra/plan-hora-extra.component';
import { MainNavService } from 'src/app/componentes/administracionGeneral/main-nav/main-nav.service';

@Component({
  selector: 'app-lista-emple-plan-hora-e',
  templateUrl: './lista-emple-plan-hora-e.component.html',
  styleUrls: ['./lista-emple-plan-hora-e.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
  ]
})

export class ListaEmplePlanHoraEComponent implements OnInit {

  buscador !: FormGroup;

  codigo = new FormControl('');
  cedula = new FormControl('', [Validators.minLength(2)]);
  nombre_emp = new FormControl('', [Validators.minLength(2)]);
  nombre_dep = new FormControl('', [Validators.minLength(2)]);
  nombre_suc = new FormControl('', [Validators.minLength(2)]);
  seleccion = new FormControl('');

  filtroNombreSuc_: string = '';

  filtroNombreDep_: string = '';

  filtroCodigo_: number;
  filtroCedula_: string = '';
  filtroNombreEmp_: string = '';

  habilitado: any;

  public _booleanOptions: FormCriteriosBusqueda = {
    bool_suc: false,
    bool_dep: false,
    bool_emp: false,
  };

  public check: checkOptions[];

  get habilitarHorasE(): boolean { return this.funciones.horasExtras; }

  constructor(
    public restD: DatosGeneralesService,
    public restR: ReportesService,
    public router: Router,
    public ventana: MatDialog,
    public validar: ValidacionesService,
    private toastr: ToastrService,
    public informacion: DatosGeneralesService,
    private funciones: MainNavService
  ) { }

  ngOnInit(): void {
    if (this.habilitarHorasE === false) {
      let mensaje = {
        access: false,
        title: `Ups!!! al parecer no tienes activado en tu plan el Módulo de Horas Extras. \n`,
        message: '¿Te gustaría activarlo? Comunícate con nosotros.',
        url: 'www.casapazmino.com.ec'
      }
      return this.validar.RedireccionarHomeAdmin(mensaje);
    }
    else {
      this.check = this.restR.checkOptions([{ opcion: 's' }, { opcion: 'd' }, { opcion: 'e' }]);
      this.BuscarInformacion();
    }
  }

  ngOnDestroy() {
    this.restR.GuardarCheckOpcion('');
    this.restR.DefaultFormCriterios();
    this.restR.DefaultValoresFiltros();
    this.origen = [];
  }

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
            nombre: ele.name_dep
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
              id_contrato: r.id_contrato
            }
            this.empleados.push(elemento)
          })
        })
      })
      console.log('SUCURSALES', this.sucursales);
      console.log('DEPARTAMENTOS', this.departamentos);
      console.log('EMPLEADOS', this.empleados);

    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  // METODO PARA MOSTRAR DATOS DE BUSQUEDA
  opcion: number;
  activar_boton: boolean = false;
  activar_seleccion: boolean = true;
  BuscarPorTipo(e: MatRadioChange) {
    console.log('CHECK ', e.value);
    this.opcion = e.value;
    this.activar_boton = true;
    switch (this.opcion) {
      case 1:
        this._booleanOptions.bool_suc = true;
        this._booleanOptions.bool_dep = false;
        this._booleanOptions.bool_emp = false;
        this.activar_seleccion = true;
        this.plan_multiple = false;
        this.auto_individual = true;
        break;
      case 2:
        this._booleanOptions.bool_suc = false;
        this._booleanOptions.bool_dep = true;
        this._booleanOptions.bool_emp = false;
        this.activar_seleccion = true;
        this.plan_multiple = false;
        this.auto_individual = true;
        break;
      case 3:
        this._booleanOptions.bool_suc = false;
        this._booleanOptions.bool_dep = false;
        this._booleanOptions.bool_emp = true;
        this.activar_seleccion = true;
        this.plan_multiple = false;
        this.auto_individual = true;
        break;
      default:
        this._booleanOptions.bool_suc = false;
        this._booleanOptions.bool_dep = false;
        this._booleanOptions.bool_emp = false;
        this.activar_seleccion = true;
        this.plan_multiple = false;
        this.auto_individual = true;
        break;
    }
    this.restR.GuardarFormCriteriosBusqueda(this._booleanOptions);
    //this.restR.GuardarCheckOpcion(this.opcion)

  }

  // METODO PARA FILTRAR DATOS DE BUSQUEDA
  Filtrar(e, orden: number) {
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

  departamentos: any = [];
  sucursales: any = [];
  respuesta: any[];
  empleados: any = [];
  origen: any = [];

  selectionSuc = new SelectionModel<ITableEmpleados>(true, []);
  selectionDep = new SelectionModel<ITableEmpleados>(true, []);
  selectionEmp = new SelectionModel<ITableEmpleados>(true, []);

  // ITEMS DE PAGINACIÓN DE LA TABLA SUCURSAL
  pageSizeOptions_suc = [5, 10, 20, 50];
  tamanio_pagina_suc: number = 5;
  numero_pagina_suc: number = 1;

  // ITEMS DE PAGINACIÓN DE LA TABLA DEPARTAMENTO
  pageSizeOptions_dep = [5, 10, 20, 50];
  tamanio_pagina_dep: number = 5;
  numero_pagina_dep: number = 1;

  // ITEMS DE PAGINACIÓN DE LA TABLA EMPLEADOS
  pageSizeOptions_emp = [5, 10, 20, 50];
  tamanio_pagina_emp: number = 5;
  numero_pagina_emp: number = 1;

  get filtroNombreSuc() { return this.restR.filtroNombreSuc }

  get filtroNombreDep() { return this.restR.filtroNombreDep }

  get filtroNombreEmp() { return this.restR.filtroNombreEmp };
  get filtroCodigo() { return this.restR.filtroCodigo };
  get filtroCedula() { return this.restR.filtroCedula };


  /** ************************************************************************************** **
   ** **                   METODOS DE SELECCION DE DATOS DE USUARIOS                      ** **
   ** ************************************************************************************** **/

  // SI EL NÚMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NÚMERO TOTAL DE FILAS. 
  isAllSelectedSuc() {
    const numSelected = this.selectionSuc.selected.length;
    return numSelected === this.sucursales.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTÁN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCIÓN CLARA. 
  masterToggleSuc() {
    this.isAllSelectedSuc() ?
      this.selectionSuc.clear() :
      this.sucursales.forEach(row => this.selectionSuc.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACIÓN EN LA FILA PASADA
  checkboxLabelSuc(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedSuc() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionSuc.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // SI EL NÚMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NÚMERO TOTAL DE FILAS. 
  isAllSelectedDep() {
    const numSelected = this.selectionDep.selected.length;
    return numSelected === this.departamentos.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTÁN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCIÓN CLARA. 
  masterToggleDep() {
    this.isAllSelectedDep() ?
      this.selectionDep.clear() :
      this.departamentos.forEach(row => this.selectionDep.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACIÓN EN LA FILA PASADA
  checkboxLabelDep(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedDep() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionDep.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // SI EL NÚMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NÚMERO TOTAL DE FILAS. 
  isAllSelectedEmp() {
    const numSelected = this.selectionEmp.selected.length;
    return numSelected === this.empleados.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTÁN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCIÓN CLARA. 
  masterToggleEmp() {
    this.isAllSelectedEmp() ?
      this.selectionEmp.clear() :
      this.empleados.forEach(row => this.selectionEmp.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACIÓN EN LA FILA PASADA
  checkboxLabelEmp(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedEmp() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionEmp.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

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

    this.PlanificarMultiple(usuarios);
  }

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

    this.PlanificarMultiple(usuarios);
  }

  ModelarEmpleados() {
    let respuesta: any = [];
    this.empleados.forEach((obj: any) => {
      this.selectionEmp.selected.find(obj1 => {
        if (obj1.id === obj.id) {
          respuesta.push(obj)
        }
      })
    })
    this.PlanificarMultiple(respuesta);
  }

  // HABILITAR O DESHABILITAR EL ICONO DE AUTORIZACIÓN INDIVIDUAL
  auto_individual: boolean = true;

  // METODO PARA ABRIR FORMULARIO DE INGRESO DE PLANIFICACION DE HE
  Planificar(seleccionados: any) {
    this.ventana.open(
      PlanHoraExtraComponent,
      {
        width: '800px',
        data: { planifica: seleccionados, actualizar: false }
      })
      .afterClosed().subscribe(item => {
        this.auto_individual = true;
        this.LimpiarFormulario();
      });
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

  MostrarLista() {
    if (this.opcion === 1) {
      this.nombre_suc.reset();
      this.Filtrar('', 1)
    }
    else if (this.opcion === 2) {
      this.nombre_dep.reset();
      this.Filtrar('', 2)
    }
    else if (this.opcion === 3) {
      this.codigo.reset();
      this.cedula.reset();
      this.nombre_emp.reset();
      this.Filtrar('', 3)
      this.Filtrar('', 4)
      this.Filtrar('', 5)
    }
  }

  // METODO PARA ACTIVAR SELECCION MULTIPLE
  plan_multiple: boolean = false;
  HabilitarSeleccion() {
    this.plan_multiple = true;
    this.auto_individual = false;
    this.activar_seleccion = false;
  }

  // VALIDACIONES DE INGRESO DE LETRAS DE 
  IngresarSoloLetras(e) {
    this.validar.IngresarSoloLetras(e);
  }

  IngresarSoloNumeros(evt) {
    this.validar.IngresarSoloNumeros(evt)
  }


}
