import { Component, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';

import { DepartamentosService } from 'src/app/servicios/catalogos/catDepartamentos/departamentos.service';
import { SucursalService } from 'src/app/servicios/sucursales/sucursal.service'

import { RegistroDepartamentoComponent } from 'src/app/componentes/catalogos/catDepartamentos/registro-departamento/registro-departamento.component';
import { EditarDepartamentoComponent } from 'src/app/componentes/catalogos/catDepartamentos/editar-departamento/editar-departamento.component';
import { ListaSucursalesComponent } from '../lista-sucursales/lista-sucursales.component';
import { EditarSucursalComponent } from 'src/app/componentes/catalogos/catSucursal/editar-sucursal/editar-sucursal.component';
import { VerEmpresaComponent } from '../../catEmpresa/ver-empresa/ver-empresa.component';
import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';


import { ITableDepartamentos } from 'src/app/model/reportes.model';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-ver-sucursal',
  templateUrl: './ver-sucursal.component.html',
  styleUrls: ['./ver-sucursal.component.css']
})

export class VerSucursalComponent implements OnInit {

  @Input() idSucursal: number;
  @Input() pagina_: string = '';

  datosSucursal: any = [];
  datosDepartamentos: any = [];
  departamentosEliminar: any = [];

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  constructor(
    public componentes: ListaSucursalesComponent,
    public componentee: VerEmpresaComponent,
    public ventana: MatDialog,
    public router: Router,
    public restD: DepartamentosService,
    public rest: SucursalService,
    private toastr: ToastrService,
  ) { }

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
    this.rest.BuscarUnaSucursal(this.idSucursal).subscribe(datos => {
      this.datosSucursal = datos;
    })
  }

  // METODO PARA LISTAR DEPARTAMENTOS
  ListaDepartamentos() {
    this.datosDepartamentos = []
    this.restD.BuscarInformacionDepartamento(this.idSucursal).subscribe(datos => {
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
        if (item) {
          if (item > 0) {
            this.CargarDatosSucursal();
          }
        }
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
      { width: '350px', data: this.idSucursal }).
      afterClosed().subscribe(item => {
        this.ListaDepartamentos();
      });
    this.activar_seleccion = true;
    this.plan_multiple = false;
    this.plan_multiple_ = false;
    this.selectionDepartamentos.clear();
    this.departamentosEliminar = [];
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

  // METODO PARA VER LISTA DE SUCURSALES
  VerSucursales() {
    if (this.pagina_ === 'lista-sucursal') {
      this.componentes.ver_lista = true;
      this.componentes.ver_departamentos = false;
      this.componentes.ObtenerSucursal();
    }
    else if (this.pagina_ === 'datos-empresa') {
      this.componentee.ver_informacion = true;
      this.componentee.ver_departamentos = false;
      this.componentee.ObtenerSucursal();
    }
  }

  // CHECK SUCURSALES
  plan_multiple: boolean = false;
  plan_multiple_: boolean = false;

  HabilitarSeleccion() {
    this.plan_multiple = true;
    this.plan_multiple_ = true;
    this.auto_individual = false;
    this.activar_seleccion = false;
  }

  auto_individual: boolean = true;
  activar_seleccion: boolean = true;
  seleccion_vacia: boolean = true;

  selectionDepartamentos = new SelectionModel<ITableDepartamentos>(true, []);

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedPag() {
    const numSelected = this.selectionDepartamentos.selected.length;
    return numSelected === this.datosDepartamentos.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterTogglePag() {
    this.isAllSelectedPag() ?
      this.selectionDepartamentos.clear() :
      this.datosDepartamentos.forEach((row: any) => this.selectionDepartamentos.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelPag(row?: ITableDepartamentos): string {
    if (!row) {
      return `${this.isAllSelectedPag() ? 'select' : 'deselect'} all`;
    }
    this.departamentosEliminar = this.selectionDepartamentos.selected;
    return `${this.selectionDepartamentos.isSelected(row) ? 'deselect' : 'select'} row ${row.nombre + 1}`;
  }

  public departamentosNiveles: any = [];

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO 
  Eliminar(id_dep: number, id_sucursal: number, nivel: number) {
    this.restD.EliminarRegistro(id_dep).subscribe(res => {
      if (res.message === 'error') {
        this.toastr.error('Existen datos relacionados con este registro.', 'No fue posible eliminar.', {
          timeOut: 6000,
        });
      } else {
        this.departamentosNiveles = [];
        var id_departamento = id_dep;
        var id_establecimiento = id_sucursal;
        if (nivel != 0) {
          this.restD.ConsultarNivelDepartamento(id_departamento, id_establecimiento).subscribe(datos => {
            this.departamentosNiveles = datos;
            this.departamentosNiveles.filter(item => {
              this.restD.EliminarRegistroNivelDepa(item.id).subscribe(
                res => {
                  if (res.message === 'error') {
                    this.toastr.error('No se puede eliminar.', '', {
                      timeOut: 6000,
                    });
                  } else {
                    this.toastr.error('Nivel eliminado de: ' + item.departamento, '', {
                      timeOut: 6000,
                    });
                    this.ListaDepartamentos();
                  }
                }
              );

            })
          })
          this.ListaDepartamentos();
        } else {
          this.ListaDepartamentos();
        }
        this.toastr.error('Registro eliminado.', '', {
          timeOut: 6000,
        });
        this.ListaDepartamentos();
      }
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  ConfirmarDelete(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Eliminar(datos.id, datos.id_sucursal, datos.nivel);
          this.activar_seleccion = true;
          this.plan_multiple = false;
          this.plan_multiple_ = false;
          this.departamentosEliminar = [];
          this.selectionDepartamentos.clear();
          this.ListaDepartamentos();
        }
      });
  }

  contador: number = 0;
  ingresar: boolean = false;
  EliminarMultiple() {
    this.ingresar = false;
    this.contador = 0;
    this.departamentosEliminar = this.selectionDepartamentos.selected;
    this.departamentosEliminar.forEach((datos: any) => {
      this.datosDepartamentos = this.datosDepartamentos.filter(item => item.id !== datos.id);
      //AQUI MODIFICAR EL METODO 
      this.contador = this.contador + 1;
      this.restD.EliminarRegistro(datos.id).subscribe(res => {
        if (res.message === 'error') {
          this.toastr.error('Existen datos relacionados con ' + datos.nombre + '.', 'No fue posible eliminar.',  {
            timeOut: 6000,
          });
          this.contador = this.contador - 1;
        } else {
          this.departamentosNiveles = [];
          var id_departamento = datos.id;
          var id_establecimiento = datos.id_sucursal;
          if (datos.nivel != 0) {
            this.restD.ConsultarNivelDepartamento(id_departamento, id_establecimiento).subscribe(datos => {
              this.departamentosNiveles = datos;
              this.departamentosNiveles.filter(item => {
                this.restD.EliminarRegistroNivelDepa(item.id).subscribe(
                  res => {
                    if (res.message === 'error') {
                      this.toastr.error('Existen datos relacionados con este registro.', 'No fue posible eliminar.', {
                        timeOut: 6000,
                      });
                    } else {
                      this.toastr.error('Nivel eliminado de: ' + item.departamento, '', {
                        timeOut: 6000,
                      });
                      this.ListaDepartamentos();
                    }
                  }
                )
                this.ListaDepartamentos();
              })
            })
            this.ListaDepartamentos();
          } else {
            this.ListaDepartamentos();
          }
          if (!this.ingresar) {
            this.toastr.error('Se ha eliminado ' + this.contador + ' registros.', '', {
              timeOut: 6000,
            });
            this.ingresar = true;
          }
          this.ListaDepartamentos();
        }
      });
    }
    )
  }

  ConfirmarDeleteMultiple() {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          if (this.departamentosEliminar.length != 0) {
            this.EliminarMultiple();
            this.activar_seleccion = true;
            this.plan_multiple = false;
            this.plan_multiple_ = false;
            this.departamentosEliminar = [];
            this.selectionDepartamentos.clear();
            this.ListaDepartamentos();
          } else {
            this.toastr.warning('No ha seleccionado PAGINAS.', 'Ups!!! algo salio mal.', {
              timeOut: 6000,
            })

          }
        }
      });
  }

}
