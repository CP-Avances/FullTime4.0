import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';

import { DepartamentosService } from 'src/app/servicios/catalogos/catDepartamentos/departamentos.service';
import { SucursalService } from 'src/app/servicios/sucursales/sucursal.service'

import { RegistroDepartamentoComponent } from 'src/app/componentes/catalogos/catDepartamentos/registro-departamento/registro-departamento.component';
import { EditarDepartamentoComponent } from 'src/app/componentes/catalogos/catDepartamentos/editar-departamento/editar-departamento.component';
import { EditarSucursalComponent } from 'src/app/componentes/catalogos/catSucursal/editar-sucursal/editar-sucursal.component';
import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';

@Component({
  selector: 'app-ver-sucursal',
  templateUrl: './ver-sucursal.component.html',
  styleUrls: ['./ver-sucursal.component.css']
})

export class VerSucursalComponent implements OnInit {

  idSucursal: string;
  datosSucursal: any = [];
  datosDepartamentos: any = [];

  // ITEMS DE PAGINACIÓN DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  constructor(
    public ventana: MatDialog,
    public router: Router,
    public restD: DepartamentosService,
    public rest: SucursalService,
    private toastr: ToastrService,
  ) {
    var cadena = this.router.url;
    var aux = cadena.split("/");
    this.idSucursal = aux[2];
  }

  ngOnInit(): void {
    this.CargarDatosSucursal();
    this.ListaDepartamentos();
  }

  // METODO PARA MANEJAR PAGINACION
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1
  }

  // METODO PARA CARGAR DATOS DE ESTABLECIMIENTO
  CargarDatosSucursal() {
    this.datosSucursal = [];
    this.rest.BuscarUnaSucursal(parseInt(this.idSucursal)).subscribe(datos => {
      this.datosSucursal = datos;
    })
  }

  // METODO PARA LISTAR DEPARTAMENTOS
  ListaDepartamentos() {
    this.datosDepartamentos = []
    this.restD.BuscarInformacionDepartamento(parseInt(this.idSucursal)).subscribe(datos => {
      this.datosDepartamentos = datos;
      this.OrdenarDatos(this.datosDepartamentos);
    })
  }

  // ORDENAR LOS DATOS SEGÚN EL ID 
  OrdenarDatos(array: any) {
    function compare(a: any, b: any) {
      if (a.nombre < b.nombre) {
        return -1;
      }
      if (a.nombre > b.nombre) {
        return 1;
      }
      return 0;
    }
    array.sort(compare);
  }

  // VENTANA PARA EDITAR DATOS DE REGISTRO SELECCIONADO 
  EditarDatosSucursal(datosSeleccionados: any): void {
    console.log(datosSeleccionados);
    this.ventana.open(EditarSucursalComponent, { width: '650px', data: datosSeleccionados })
      .afterClosed().subscribe(item => {
        this.CargarDatosSucursal();
      });
  }

  // VENTANA PARA EDITAR DATOS DE DEPARTAMENTO 
  AbrirVentanaEditarDepartamento(departamento: any): void {
    this.ventana.open(EditarDepartamentoComponent,
      { width: '400px', data: { data: departamento, establecimiento: true } })
      .afterClosed().subscribe(item => {
        this.ListaDepartamentos();
      });
  }

  // VENTANA PARA REGISTRO DE DEPARTAMENTO 
  AbrirVentanaRegistrarDepartamento(): void {
    this.ventana.open(RegistroDepartamentoComponent,
      { width: '350px', data: parseInt(this.idSucursal) }).
      afterClosed().subscribe(item => {
        this.ListaDepartamentos();
      });
  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO 
  Eliminar(id_dep: number) {
    this.rest.EliminarRegistro(id_dep).subscribe(res => {
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
      this.ListaDepartamentos();
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  ConfirmarDelete(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Eliminar(datos.id);
        } else {
          this.router.navigate(['/vistaSucursales/', this.idSucursal]);
        }
      });
  }

  // METODO PARA NAVEGAR A PANTALLA DE NIVELES
  data_id: number = 0;
  ver_nivel: boolean = false;
  ver_sucursal: boolean = true;
  pagina: string = '';
  VerNiveles(id: number) {
    this.data_id = id;
    this.pagina = 'sucursal';
    this.ver_nivel = true;
    this.ver_sucursal = false;
  }

}
