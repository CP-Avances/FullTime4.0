import { Validators, FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ITableEmpleados } from 'src/app/model/reportes.model';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';

import { PeriodoVacacionesService } from 'src/app/servicios/modulos/modulo-vacaciones/periodoVacaciones/periodo-vacaciones.service';
import { DatosGeneralesService } from 'src/app/servicios/generales/datosGenerales/datos-generales.service';
import { AsignacionesService } from 'src/app/servicios/usuarios/asignaciones/asignaciones.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { ReportesService } from 'src/app/servicios/reportes/opcionesReportes/reportes.service';
import { MainNavService } from 'src/app/componentes/generales/main-nav/main-nav.service';

@Component({
  selector: 'app-configurar-vacacion-multiple',
  standalone: false,
  templateUrl: './configurar-vacacion-multiple.component.html',
  styleUrl: './configurar-vacacion-multiple.component.css'
})

export class ConfigurarVacacionMultipleComponent implements OnInit {
  idUsuariosAcceso: Set<any> = new Set();
  idSucursalesAcceso: Set<any> = new Set();
  idDepartamentosAcceso: Set<any> = new Set();

  // CONTROL DE CRITERIOS DE BUSQUEDA
  codigo = new FormControl('');
  cedula = new FormControl('', [Validators.minLength(2)]);
  nombre_emp = new FormControl('', [Validators.minLength(2)]);
  nombre_suc = new FormControl('', [Validators.minLength(2)]);

  // VARIABLES DE FILTROS DE BUSQUEDA
  get filtroNombreSuc() { return this.restR.filtroNombreSuc }
  get filtroNombreEmp() { return this.restR.filtroNombreEmp };
  get filtroCodigo() { return this.restR.filtroCodigo };
  get filtroCedula() { return this.restR.filtroCedula };

  habilitado: any;
  idEmpleadoLogueado: any;
  rolEmpleado: number; // VARIABLE DE ALMACENAMIENTO DE ROL DE EMPLEADO QUE INICIA SESION

  // PRESENTACION DE INFORMACION DE ACUERDO AL CRITERIO DE BUSQUEDA
  sucursales: any = [];
  empleados: any = [];

  selectionSuc = new SelectionModel<ITableEmpleados>(true, []);
  selectionEmp = new SelectionModel<ITableEmpleados>(true, []);

  // ITEMS DE PAGINACION DE LA TABLA EMPLEADOS
  pageSizeOptions_emp = [5, 10, 20, 50];
  tamanio_pagina_emp: number = 5;
  numero_pagina_emp: number = 1;

  // BUSQUEDA DE MODULOS ACTIVOS
  get habilitarPermiso(): boolean { return this.funciones.vacaciones; }

  // ACTIVAR VISTA DE REGISTRO DE VACACIONES
  activar_vacacion: boolean = false;
  activar_busqueda: boolean = true;
  data: any = [];

  constructor(
    public informacion: DatosGeneralesService,
    public restPerV: PeriodoVacacionesService,
    public restR: ReportesService,
    private toastr: ToastrService,
    private validar: ValidacionesService,
    private funciones: MainNavService,
    private asignaciones: AsignacionesService,
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    if (this.habilitarPermiso === false) {
      let mensaje = {
        access: false,
        message: `Ups! al parecer no tienes activado en tu plan el Módulo de Vacaciones. \n
        ¿Te gustaría activarlo? Comunícate con nosotros. \n`,
        url: 'www.casapazmino.com.ec'
      }
      return this.validar.RedireccionarHomeAdmin(mensaje);
    }
    else {
      this.rolEmpleado = parseInt(localStorage.getItem('rol') as string);
      this.idUsuariosAcceso = this.asignaciones.idUsuariosAcceso;
      this.BuscarInformacionGeneral();
    }
  }

  // METODO PARA DESTRUIR PROCESOS
  ngOnDestroy() {
    this.restR.DefaultFormCriterios();
    this.restR.DefaultValoresFiltros();
  }

  // METODO DE BUSQUEDA DE DATOS GENERALES DEL EMPLEADO
  BuscarInformacionGeneral() {
    // LIMPIAR DATOS DE ALMACENAMIENTO
    this.empleados = [];
    this.informacion.ObtenerInformacionGeneral(1).subscribe((res: any[]) => {
      this.ProcesarDatos(res);
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  // METODO PARA PROCESAR LA INFORMACION DE LOS EMPLEADOS
  ProcesarDatos(informacion: any) {
    this.empleados = this.validar.ProcesarDatosEmpleados(informacion);
    this.sucursales = this.validar.ProcesarDatosSucursales(informacion);

    // FILTRO POR ASIGNACION USUARIO - DEPARTAMENTO
    // SI ES SUPERADMINISTRADOR NO FILTRAR
    if (this.rolEmpleado !== 1) {
      this.empleados = this.empleados.filter((empleado: any) => this.idUsuariosAcceso.has(empleado.id));

      // SI EL EMPLEADO TIENE ACCESO PERSONAL AÑADIR LOS DATOS A LOS ACCESOS CORRESPONDIENTES PARA VISUALIZAR
      const empleadoSesion = this.empleados.find((empleado: any) => empleado.id === this.idEmpleadoLogueado);
      if (empleadoSesion) {
        this.idSucursalesAcceso.add(empleadoSesion.id_suc);
        this.idDepartamentosAcceso.add(empleadoSesion.id_depa);
      }
      this.sucursales = this.sucursales.filter((sucursal: any) => this.idSucursalesAcceso.has(sucursal.id));
    }
  }

  // METODO PARA ACTIVAR SELECCION MULTIPLE
  plan_multiple: boolean = false;
  plan_multiple_: boolean = false;
  HabilitarSeleccion() {
    this.plan_multiple = true;
    this.plan_multiple_ = true;
    this.activar_seleccion = false;
  }

  // METODO PARA MOSTRAR DATOS DE BUSQUEDA
  activar_seleccion: boolean = true;

  // METODO PARA FILTRAR DATOS DE BUSQUEDA
  Filtrar(e: any, orden: number) {
    this.ControlarFiltrado(e);
    switch (orden) {
      case 1: this.restR.setFiltroNombreSuc(e); break;
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
        }
      }
    }
    else {
      if (this.activar_seleccion === true) {
        this.activar_seleccion = false;
        this.plan_multiple_ = true;
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

  //EVENTO DE PAGINACION
  ManejarPaginaResultados(e: PageEvent) {
    this.tamanio_pagina_emp = e.pageSize;
    this.numero_pagina_emp = e.pageIndex + 1;
  }

  /** ************************************************************************************** **
   ** **                       METODOS DE REGISTRO DE VACACIONES                          ** **
   ** ************************************************************************************** **/

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
    this.activar_vacacion = true;
  }

  // METODO PARA TOMAR DATOS SELECCIONADOS
  GuardarRegistros() {
    let usuarios = [];
    usuarios = this.validar.ModelarEmpleados_(this.empleados, this.selectionEmp);
    this.RegistrarMultiple(usuarios);
  }

  // METODO PARA LIMPIAR FORMULARIOS
  LimpiarFormulario() {
    this.codigo.reset();
    this.cedula.reset();
    this.nombre_emp.reset();
    this.nombre_suc.reset();
    this.selectionEmp.deselect();
    this.selectionEmp.clear();
    this.plan_multiple = false;
    this.plan_multiple_ = false;
    this.activar_seleccion = true;
    this.MostrarLista();

  }

  // METODO PARA MOSTRAR LISTA DE DATOS
  MostrarLista() {
    this.codigo.reset();
    this.cedula.reset();
    this.nombre_emp.reset();
    this.nombre_suc.reset();
    this.selectionSuc.clear();
    this.Filtrar('', 1);
    this.Filtrar('', 4)
    this.Filtrar('', 5)
    this.Filtrar('', 6)
  }

  // METODO PARA INGRESAR SOLO LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  // METODO PARA INGRESAR SOLO NUMEROS
  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

  //CONTROL BOTONES
  private tienePermiso(accion: string, idFuncion?: number): boolean {
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      try {
        const datos = JSON.parse(datosRecuperados);
        return datos.some((item: any) =>
          item.accion === accion && (idFuncion === undefined || item.id_funcion === idFuncion)
        );
      } catch {
        return false;
      }
    } else {
      return parseInt(localStorage.getItem('rol') || '0') === 1;
    }
  }

  getRegistrarVacacionessMultiples() {
    return this.tienePermiso('Registrar Permisos Múltiples');
  }

}
