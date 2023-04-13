// SECCIÓN DE LIBRERIAS
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';
import { checkOptions, FormCriteriosBusqueda } from 'src/app/model/reportes.model';

import { SelectionModel } from '@angular/cdk/collections';


// IMPORTAR MODELOS
import { ITableEmpleados } from 'src/app/model/reportes.model';


// SECCIÓN DE SERVICIOS
import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { EmpleadoUbicacionService } from 'src/app/servicios/empleadoUbicacion/empleado-ubicacion.service';
import { ReportesService } from 'src/app/servicios/reportes/reportes.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { ReportesAsistenciasService } from 'src/app/servicios/reportes/reportes-asistencias.service';
import { EditarCoordenadasComponent } from '../editar-coordenadas/editar-coordenadas.component';

export interface EmpleadoElemento {
  id_emplu: number;
  nombre: string;
  apellido: string;
  codigo: number;
  id_ubicacion: number;
}

@Component({
  selector: 'app-ver-coordenadas',
  templateUrl: './ver-coordenadas.component.html',
  styleUrls: ['./ver-coordenadas.component.css']
})

export class VerCoordenadasComponent implements OnInit {

  buscador !: FormGroup;

  asignar: boolean = false;

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


  public _booleanOptions: FormCriteriosBusqueda = {
    bool_suc: false,
    bool_dep: false,
    bool_emp: false,
  };

  public check: checkOptions[];









  idUbicacion: string;
  coordenadas: any = [];
  datosUsuarios: any = [];

  // ITEMS DE PAGINACIÓN DE LA TABLA
  numero_pagina: number = 1;
  tamanio_pagina: number = 5;
  pageSizeOptions = [5, 10, 20, 50];

  constructor(
    private toastr: ToastrService,
    public restU: EmpleadoUbicacionService,
    public restP: ParametrosService,
    public router: Router,
    public ventana: MatDialog,


    private reporteService: ReportesService,
    private validacionService: ValidacionesService,

    private R_asistencias: ReportesAsistenciasService,


  ) {
    var cadena = this.router.url;
    var aux = cadena.split("/");
    this.idUbicacion = aux[2];
  }

  ngOnInit(): void {
    this.BuscarUbicacion(this.idUbicacion);
    this.ListarUsuarios(parseInt(this.idUbicacion));





    this.check = this.reporteService.checkOptions(3);
    console.log('CHECK ', this.check);









    sessionStorage.removeItem('reporte_timbres_multiple');
    this.R_asistencias.DatosGeneralesUsuarios().subscribe((res: any[]) => {
      sessionStorage.setItem('reporte_timbres_multiple', JSON.stringify(res))

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
              cedula: r.cedula
            }
            this.empleados.push(elemento)
          })
        })
      })
      console.log('SUCURSALES', this.sucursales);
      console.log('DEPARTAMENTOS', this.departamentos);
      console.log('EMPLEADOS', this.empleados);
      // console.log('TABULADO',this.tabulado);
      // console.log('INCOMPLETOS',this.incompletos);

    }, err => {
      this.toastr.error(err.error.message)
    })



  }

  // METODO PARA MANEJAR PAGINACIÓN DE TABLAS
  ManejarPagina(e: PageEvent) {
    this.numero_pagina = e.pageIndex + 1
    this.tamanio_pagina = e.pageSize;
  }

  // METODO PARA BUSCAR DATOS DE UBICACIÓN GEOGRÁFICA
  BuscarUbicacion(id: any) {
    this.coordenadas = [];
    this.restU.ListarUnaCoordenada(id).subscribe(data => {
      this.coordenadas = data;
    })
  }

  // METODO PARA BUSCAR DETALLES DE PARAMÉTRO GENERAL
  ListarUsuarios(id: number) {
    this.datosUsuarios = [];
    this.restU.ListarCoordenadasUsuarioU(id).subscribe(datos => {
      this.datosUsuarios = datos;
    })
  }

  // METODO PARA INGRESAR DETALLE DE PARÁMETRO
  AbrirVentanaBusqueda(): void {
    if (this.asignar === true) {
      this.asignar = false;
      this.reporteService.DefaultFormCriterios();
      this.reporteService.DefaultValoresFiltros();
      this.seleccion.reset();
    } else {
      this.asignar = true;
    }
  }

  // METODO PARA EDITAR PARÁMETRO
  AbrirVentanaEditar(datos: any): void {
    this.ventana.open(EditarCoordenadasComponent,
      { width: '400px', data: { ubicacion: datos, actualizar: true } }).afterClosed().subscribe(item => {
        this.BuscarUbicacion(this.idUbicacion);
        this.ListarUsuarios(parseInt(this.idUbicacion));
      });
  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO 
  EliminarRegistro(id_emplu: number) {
    this.restU.EliminarCoordenadasUsuario(id_emplu).subscribe(res => {
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
      this.BuscarUbicacion(this.idUbicacion);
      this.ListarUsuarios(parseInt(this.idUbicacion));
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
  ConfirmarDelete(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarRegistro(datos.id_emplu);
        } else {
          this.router.navigate(['/detalle-coordenadas/', this.idUbicacion]);
        }
      });
  }




  ngOnDestroy() {
    this.reporteService.GuardarCheckOpcion(0);
    this.reporteService.DefaultFormCriterios();
    this.reporteService.DefaultValoresFiltros();
    console.log('Componenete destruido');
  }

  opcion: number;
  BuscarPorTipo(e: MatRadioChange) {
    console.log('CHECK ', e.value);
    this.opcion = e.value;
    switch (this.opcion) {
      case 1:
        this._booleanOptions.bool_suc = true;
        this._booleanOptions.bool_dep = false;
        this._booleanOptions.bool_emp = false;
        break;
      case 2:
        this._booleanOptions.bool_suc = false;
        this._booleanOptions.bool_dep = true;
        this._booleanOptions.bool_emp = false;
        break;
      case 3:
        this._booleanOptions.bool_suc = false;
        this._booleanOptions.bool_dep = false;
        this._booleanOptions.bool_emp = true;
        break;
      case 4:
        this._booleanOptions.bool_suc = false;
        this._booleanOptions.bool_dep = false;
        this._booleanOptions.bool_emp = false;
        break;
      case 5:
        this._booleanOptions.bool_suc = false;
        this._booleanOptions.bool_dep = false;
        this._booleanOptions.bool_emp = false;
        break;
      default:
        this._booleanOptions.bool_suc = false;
        this._booleanOptions.bool_dep = false;
        this._booleanOptions.bool_emp = false;
        break;
    }
    this.reporteService.GuardarFormCriteriosBusqueda(this._booleanOptions);
    this.reporteService.GuardarCheckOpcion(this.opcion)

  }

  Filtrar(e, orden: number) {
    switch (orden) {
      case 1: this.reporteService.setFiltroNombreSuc(e); break;
      case 2: this.reporteService.setFiltroNombreDep(e); break;
      case 3: this.reporteService.setFiltroCodigo(e); break;
      case 4: this.reporteService.setFiltroCedula(e); break;
      case 5: this.reporteService.setFiltroNombreEmp(e); break;
      default:
        break;
    }
  }

  IngresarSoloLetras(e) {
    return this.validacionService.IngresarSoloLetras(e);
  }

  IngresarSoloNumeros(evt) {
    return this.validacionService.IngresarSoloNumeros(evt);
  }

  limpiarCampos() {
    if (this._booleanOptions.bool_emp === true || this._booleanOptions.bool_tab === true || this._booleanOptions.bool_inc === true) {
      this.codigo.reset();
      this.cedula.reset();
      this.nombre_emp.reset();
      this._booleanOptions.bool_emp = false;
      this._booleanOptions.bool_tab = false;
      this._booleanOptions.bool_inc = false;
    }
    if (this._booleanOptions.bool_dep) {
      this.nombre_dep.reset();
      this._booleanOptions.bool_dep = false;
    }
    if (this._booleanOptions.bool_suc) {
      this.nombre_suc.reset();
      this._booleanOptions.bool_suc = false;
    }
    this.seleccion.reset();
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

  departamentos: any = [];
  sucursales: any = [];
  respuesta: any[];
  empleados: any = [];
  tabulado: any = [];

  data_pdf: any = [];

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


  get filtroNombreSuc() { return this.reporteService.filtroNombreSuc }

  get filtroNombreDep() { return this.reporteService.filtroNombreDep }

  get filtroNombreEmp() { return this.reporteService.filtroNombreEmp };
  get filtroCodigo() { return this.reporteService.filtroCodigo };
  get filtroCedula() { return this.reporteService.filtroCedula };


  /*****************************************************************************
  * 
  * 
  * Varios Metodos Complementarios al funcionamiento. 
  * 
  * 
  **************************************************************************/

  /** Si el número de elementos seleccionados coincide con el número total de filas. */
  isAllSelectedSuc() {
    const numSelected = this.selectionSuc.selected.length;
    return numSelected === this.sucursales.length
  }

  /** Selecciona todas las filas si no están todas seleccionadas; de lo contrario, selección clara. */
  masterToggleSuc() {
    this.isAllSelectedSuc() ?
      this.selectionSuc.clear() :
      this.sucursales.forEach(row => this.selectionSuc.select(row));
  }

  /** La etiqueta de la casilla de verificación en la fila pasada*/
  checkboxLabelSuc(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedSuc() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionSuc.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  /** Si el número de elementos seleccionados coincide con el número total de filas. */
  isAllSelectedDep() {
    const numSelected = this.selectionDep.selected.length;
    return numSelected === this.departamentos.length
  }

  /** Selecciona todas las filas si no están todas seleccionadas; de lo contrario, selección clara. */
  masterToggleDep() {
    this.isAllSelectedDep() ?
      this.selectionDep.clear() :
      this.departamentos.forEach(row => this.selectionDep.select(row));
  }

  /** La etiqueta de la casilla de verificación en la fila pasada*/
  checkboxLabelDep(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedDep() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionDep.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  /** Si el número de elementos seleccionados coincide con el número total de filas. */
  isAllSelectedEmp() {
    const numSelected = this.selectionEmp.selected.length;
    return numSelected === this.empleados.length
  }

  /** Selecciona todas las filas si no están todas seleccionadas; de lo contrario, selección clara. */
  masterToggleEmp() {
    this.isAllSelectedEmp() ?
      this.selectionEmp.clear() :
      this.empleados.forEach(row => this.selectionEmp.select(row));
  }

  /** La etiqueta de la casilla de verificación en la fila pasada*/
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



  ModelarSucursal() {
    let usuarios: any = [];
    let respuesta = JSON.parse(sessionStorage.getItem('reporte_timbres_multiple') as any)
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

    this.RegistrarUbicacionUsuario(usuarios);
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
    this.RegistrarUbicacionUsuario(respuesta);
  }

  ModelarDepartamentos() {
    let usuarios: any = [];
    let respuesta = JSON.parse(sessionStorage.getItem('reporte_timbres_multiple') as any)
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
    this.RegistrarUbicacionUsuario(usuarios);
  }

  cont: number = 0;
  RegistrarUbicacionUsuario(data: any) {

    this.cont = 0;
    data.forEach((obj: any) => {
      var datos = {
        id_empl: obj.id,
        codigo: obj.codigo,
        id_ubicacion: this.idUbicacion
      }
      this.restU.RegistrarCoordenadasUsuario(datos).subscribe(res => {
        this.cont = this.cont + 1;

        if (this.cont === data.length) {
          this.toastr.success('Registros de ubicación asignados exitosamente.', '', {
            timeOut: 6000,
          });
          this.ListarUsuarios(parseInt(this.idUbicacion));
        }
      });
    })
  }

  GuardarRegistros() {
    // console.log('ver seleccion', this.opcion)
    if (this.opcion === 1) {
      this.ModelarSucursal();
      this.AbrirVentanaBusqueda();
    }
    else if (this.opcion === 2) {
      this.ModelarDepartamentos();
      this.AbrirVentanaBusqueda();
    }
    else {
      this.ModelarEmpleados();
      this.AbrirVentanaBusqueda();
    }
  }




  selectionUno = new SelectionModel<EmpleadoElemento>(true, []);
  btnCheckHabilitar: boolean = false;
  auto_individual: boolean = true;
  HabilitarSeleccion() {
    if (this.btnCheckHabilitar === false) {
      this.btnCheckHabilitar = true;
      this.auto_individual = false;
    } else if (this.btnCheckHabilitar === true) {
      this.btnCheckHabilitar = false;
      this.auto_individual = true;
    }
  }

  /** Si el número de elementos seleccionados coincide con el número total de filas. */
  isAllSelected() {
    const numSelected = this.selectionUno.selected.length;
    const numRows = this.datosUsuarios.length;
    return numSelected === numRows;
  }

  /** Selecciona todas las filas si no están todas seleccionadas; de lo contrario, selección clara. */
  masterToggle() {
    this.isAllSelected() ?
      this.selectionUno.clear() :
      this.datosUsuarios.forEach(row => this.selectionUno.select(row));
  }

  /** La etiqueta de la casilla de verificación en la fila pasada*/
  checkboxLabel(row?: EmpleadoElemento): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionUno.isSelected(row) ? 'deselect' : 'select'} row ${row.id_emplu + 1}`;
  }

  Remover() {
    let EmpleadosSeleccionados;
    EmpleadosSeleccionados = this.selectionUno.selected.map(obj => {
      return {
        id_emplu: obj.id_emplu,
        empleado: obj.nombre + ' ' + obj.apellido,
        codigo: obj.codigo,
        id_ubicacion: obj.id_ubicacion
      }
    })
    if (EmpleadosSeleccionados.length > 0) {
      console.log('ver eliminar................', EmpleadosSeleccionados)
      EmpleadosSeleccionados.forEach((obj: any) => {
        this.restU.EliminarCoordenadasUsuario(obj.id_emplu).subscribe(res => {
          this.BuscarUbicacion(this.idUbicacion);
          this.ListarUsuarios(parseInt(this.idUbicacion));
        });
      })
      this.toastr.error('Registros removidos de la lista.', '', {
        timeOut: 6000,
      });
      this.HabilitarSeleccion();
      this.selectionUno.clear();
      EmpleadosSeleccionados = [];
    }

  }


  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
  ConfirmarDeleteVarios() {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Remover();
        } else {
          this.router.navigate(['/detalle-coordenadas/', this.idUbicacion]);
        }
      });
  }


}
