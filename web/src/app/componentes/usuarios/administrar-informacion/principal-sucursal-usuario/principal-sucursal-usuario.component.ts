// IMPORTACION DE LIBRERIAS
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';

import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { SucursalService } from 'src/app/servicios/sucursales/sucursal.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';

@Component({
  selector: 'app-principal-sucursal-usuario',
  templateUrl: './principal-sucursal-usuario.component.html',
  styleUrls: ['./principal-sucursal-usuario.component.css']
})

export class PrincipalSucursalUsuarioComponent implements OnInit {

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

  empleado: any = [];
  idEmpleado: number;

  constructor(
    private rest: SucursalService,
    public ventana: MatDialog,
    public validar: ValidacionesService,
    public restE: EmpleadoService,
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
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

  // METODO PARA VER DATOS DE USUARIOS ASIGNADOS AL ESTABLECIMIENTO
  ver_departamentos: boolean = false;
  datos_sucursal: any = [];
  ver_informacion: boolean = false;
  ver_principal: boolean = true;
  pagina: string = '';
  VerUsuarioAsignado(datos: any) {
    this.pagina = 'sucursal-usuario';
    this.ver_informacion = true;
    this.ver_principal = false;
    this.datos_sucursal = datos;
    this.ver_departamentos = true;
  }

  //CONTROL BOTONES
  getDatosAsignados(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Ver datos asignados');
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 1);
    }
  }

  getAsignar(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Asignar Datos');
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 1);
    }
  }

  getEliminarAsignacion(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Eliminar datos asignados');
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 1);
    }
  }

  getVerUsuariosEstablecimiento(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Ver Usuarios Establecimiento');
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 1);
    }
  }

}
