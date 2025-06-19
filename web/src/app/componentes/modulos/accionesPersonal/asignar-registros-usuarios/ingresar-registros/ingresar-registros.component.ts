import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { SucursalService } from 'src/app/servicios/configuracion/localizacion/sucursales/sucursal.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';

@Component({
  selector: 'app-ingresar-registros',
  standalone: false,
  templateUrl: './ingresar-registros.component.html',
  styleUrl: './ingresar-registros.component.css'
})

export class IngresarRegistrosComponent {

  buscarNombre = new FormControl('', [Validators.minLength(2)]);
  buscarCiudad = new FormControl('', [Validators.minLength(2)]);
  filtroNombreSuc = '';
  filtroCiudadSuc = '';

  public formulario = new FormGroup({
    buscarNombreForm: this.buscarNombre,
    buscarCiudadForm: this.buscarCiudad,
  });

  sucursales: any = [];

  // ITEMS DE PAGINACION DE LA TABLA
  numero_pagina: number = 1;
  tamanio_pagina: number = 5;
  pageSizeOptions = [5, 10, 20, 50];

  @ViewChild(MatPaginator) paginator: MatPaginator;

  DatosProcesos: any
  DatosGrado: any

  MostrarListaProcesos: boolean = true;
  RegistroInterfazProcesos: boolean = false;
  RegistroMultipleProcesos: boolean = false;

  MostrarListaGrado: boolean = true;
  RegistroInterfazGrado: boolean = false;
  RegistroMultipleGrado: boolean = false;

  MostrarListaGrupoOcupacional: boolean = true;
  RegistroInterfazGrupoOcupacional: boolean = false;
  RegistroMultipleGrupoOcupacional: boolean = false;

  empleado: any = [];
  idEmpleado: number;

  constructor(
    public ventana: MatDialog, // VARIABLE DE MANEJO DE VENTANAS
    public validar: ValidacionesService,
    public restE: EmpleadoService,
    private rest: SucursalService,
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  // METODO PARA ACTIVAR EL REGISTRO POR INTERFAZ O MULTIPLE
  PantallaRegistros(pantalla: any, tipo_registro: string) {
    this.listadoUsuariosProceso = false;
    this.listadoUsuariosGrado = false;
    this.listadoUsuariosGrupoOcupa = false;

    if (pantalla == 'proceso') {
      if (tipo_registro == 'interfaz') {
        this.MostrarListaProcesos = false;
        this.RegistroInterfazProcesos = true;
        this.RegistroMultipleProcesos = false;
      }
      else if (tipo_registro == 'multiple') {
        this.MostrarListaProcesos = false;
        this.RegistroInterfazProcesos = false;
        this.RegistroMultipleProcesos = true;
      }
      else if (tipo_registro == 'registros') {
        this.MostrarListaProcesos = true;
        this.RegistroInterfazProcesos = false;
        this.RegistroMultipleProcesos = false;
      }
    }

    if (pantalla == 'grado') {
      if (tipo_registro == 'interfaz') {
        this.MostrarListaGrado = false;
        this.RegistroInterfazGrado = true;
        this.RegistroMultipleGrado = false;
      }
      else if (tipo_registro == 'multiple') {
        this.MostrarListaGrado = false;
        this.RegistroInterfazGrado = false;
        this.RegistroMultipleGrado = true;
      }
      else if (tipo_registro == 'registros') {
        this.MostrarListaGrado = true;
        this.RegistroInterfazGrado = false;
        this.RegistroMultipleGrado = false;
      }
    }

    if (pantalla == 'grupo') {
      if (tipo_registro == 'interfaz') {
        this.MostrarListaGrupoOcupacional = false;
        this.RegistroInterfazGrupoOcupacional = true;
        this.RegistroMultipleGrupoOcupacional = false;
      }
      else if (tipo_registro == 'multiple') {
        this.MostrarListaGrupoOcupacional = false;
        this.RegistroInterfazGrupoOcupacional = false;
        this.RegistroMultipleGrupoOcupacional = true;
      }
      else if (tipo_registro == 'registros') {
        this.MostrarListaGrupoOcupacional = true;
        this.RegistroInterfazGrupoOcupacional = false;
        this.RegistroMultipleGrupoOcupacional = false;
      }
    }
  }

  ngOnInit(): void {
    this.ObtenerSucursal();
  }

  // METODO PARA MANEJAR LA PAGINACION
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // METODO PARA BUSCAR SUCURSALES
  ObtenerSucursal() {
    this.rest.BuscarSucursal().subscribe(data => {
      this.sucursales = data;
    });
  }

  // METODO PARA VALIDAR SOLO LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  listadoUsuariosProceso: boolean = false;
  listadoUsuariosGrado: boolean = false;
  listadoUsuariosGrupoOcupa: boolean = false;

  dataList: any;
  VerUsuarioAsignado(datos: any, tipo: string) {
    this.dataList = datos
    if (tipo == 'procesos') {
      this.listadoUsuariosProceso = true;
      this.listadoUsuariosGrado = false;
      this.listadoUsuariosGrupoOcupa = false;
    } 
    else if (tipo == 'grado') {
      this.listadoUsuariosProceso = false;
      this.listadoUsuariosGrado = true;
      this.listadoUsuariosGrupoOcupa = false;
    } 
    else if (tipo == 'grupo') {
      this.listadoUsuariosProceso = false;
      this.listadoUsuariosGrado = false;
      this.listadoUsuariosGrupoOcupa = true;
    }
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.MostrarListaProcesos = true;
    this.RegistroInterfazProcesos = false;
    this.RegistroMultipleProcesos = false;

    this.MostrarListaGrado = true;
    this.RegistroInterfazGrado = false;
    this.RegistroMultipleGrado = false;

    this.MostrarListaGrupoOcupacional = true;
    this.RegistroInterfazGrupoOcupacional = false;
    this.RegistroMultipleGrupoOcupacional = false;
  }

  ocultarRegistroGrado(valor: boolean) {
    this.MostrarListaGrado = !valor;
    this.RegistroMultipleGrado = valor;
    this.RegistroInterfazGrado = false;
  }

  ocultarRegistroProceso(valor: boolean) {
    this.MostrarListaProcesos = !valor;
    this.RegistroMultipleProcesos = valor;
    this.RegistroInterfazProcesos = false;
  }

  ocultarRegistroGrupo(valor: boolean) {
    this.MostrarListaGrupoOcupacional = !valor;
    this.RegistroMultipleGrupoOcupacional = valor;
    this.RegistroInterfazGrupoOcupacional = false;
  }

  //CONTROL BOTONES
  private tienePermiso(accion: string): boolean {
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      try {
        const datos = JSON.parse(datosRecuperados);
        return datos.some((item: any) => item.accion === accion);
      } catch {
        return false;
      }
    } else {
      // SI NO HAY DATOS, SE PERMITE SI EL ROL ES 1 (ADMIN)
      return parseInt(localStorage.getItem('rol') || '0') === 1;
    }
  }

  getVerAsignacionGrado(): boolean {
    return this.tienePermiso('Ver Asignación Grado');
  }

  getAsignarGradoInterfaz(): boolean {
    return this.tienePermiso('Asignar Grado Interfaz');
  }

  getAsignarGradoPlantilla(): boolean {
    return this.tienePermiso('Asignar Grado Plantilla');
  }

  getVerAsignacionProceso(): boolean {
    return this.tienePermiso('Ver Asignación Proceso');
  }

  getAsignarProcesoInterfaz(): boolean {
    return this.tienePermiso('Asignar Proceso Interfaz');
  }

  getAsignarProcesoPlantilla(): boolean {
    return this.tienePermiso('Asignar Proceso Plantilla');
  }

  getVerAsignacionGrupoOcupacional(): boolean {
    return this.tienePermiso('Ver Asignación Grupo Ocupacional');
  }

  getAsignarGrupoOcupacionalInterfaz(): boolean {
    return this.tienePermiso('Asignar Grupo Ocupacional Interfaz');
  }

  getAsignarGrupoOcupacionalPlantilla(): boolean {
    return this.tienePermiso('Asignar Grupo Ocupacional Plantilla');
  }

}