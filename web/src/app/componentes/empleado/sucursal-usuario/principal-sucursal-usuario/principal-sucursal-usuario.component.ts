// IMPORTACION DE LIBRERIAS
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';

import { RegistrarSucursalesComponent } from 'src/app/componentes/catalogos/catSucursal/registrar-sucursales/registrar-sucursales.component';
import { EditarSucursalComponent } from 'src/app/componentes/catalogos/catSucursal/editar-sucursal/editar-sucursal.component';

import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { SucursalService } from 'src/app/servicios/sucursales/sucursal.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';

import { ITableEmpleados } from 'src/app/model/reportes.model';

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
    private toastr: ToastrService,
    private router: Router,
    public ventana: MatDialog,
    public validar: ValidacionesService,
    public restE: EmpleadoService,
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.ObtenerEmpleados(this.idEmpleado);
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

  // METODO PARA ACTIVAR SELECCION MULTIPLE
  plan_multiple: boolean = false;
  plan_multiple_: boolean = false;
  activar_seleccion: boolean = true;
  auto_individual: boolean = true;
  HabilitarSeleccion() {
    this.plan_multiple = true;
    this.plan_multiple_ = true;
    this.auto_individual = false;
    this.activar_seleccion = false;
  }

  /** ************************************************************************************** **
   ** **                   METODOS DE SELECCION DE DATOS DE USUARIOS                      ** **
   ** ************************************************************************************** **/

  selectionSuc = new SelectionModel<ITableEmpleados>(true, []);

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


  // METODO INDIVIDUAL - METODO PARA VER LA INFORMACION DEL EMPLEADO 
  ObtenerEmpleados(idemploy: any) {
    this.empleado = [];
    this.restE.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleado = data;
    })
  }

  // METODO PARA MOSTRAR LISTA - ICONO INDIVIDUAL
  MostrarLista() {
    this.selectionSuc.clear();
    this.formulario.setValue({
      buscarNombreForm: '',
      buscarCiudadForm: '',
    });
    this.ObtenerSucursal();
    this.activar_seleccion = true;
    this.auto_individual = true;
    this.plan_multiple_ = false;
    this.plan_multiple = false;
  }
























  // METODO PARA REGISTRAR SUCURSAL
  AbrirVentanaRegistrar() {
    this.ventana.open(RegistrarSucursalesComponent, { width: '650px' })
      .afterClosed().subscribe(items => {
        if (items) {
          if (items > 0) {
            this.VerDepartamentos(items);
          }
        }
      });
  }

  // METODO PARA EDITAR SUCURSAL
  AbrirVentanaEditar(datosSeleccionados: any): void {
    this.ventana.open(EditarSucursalComponent, { width: '650px', data: datosSeleccionados })
      .afterClosed().subscribe(items => {
        if (items) {
          if (items > 0) {
            this.VerDepartamentos(items);
          }
        }
      });
  }


  // METODO PARA VALIDAR SOLO LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }


  // METODO PARA VER DATOS DE DEPARTAMENTOS DE SUCURSAL
  ver_departamentos: boolean = false;
  sucursal_id: number;
  ver_lista: boolean = true;
  pagina: string = '';
  VerDepartamentos(id: number) {
    this.pagina = 'lista-sucursal';
    this.ver_lista = false;
    this.sucursal_id = id;
    this.ver_departamentos = true;
  }

}
