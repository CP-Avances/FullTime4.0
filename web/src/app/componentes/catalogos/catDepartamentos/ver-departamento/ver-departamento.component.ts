import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
import { ThemePalette } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';

import { AutorizaDepartamentoService } from 'src/app/servicios/autorizaDepartamento/autoriza-departamento.service';
import { DepartamentosService } from 'src/app/servicios/catalogos/catDepartamentos/departamentos.service';

import { RegistrarNivelDepartamentoComponent } from 'src/app/componentes/catalogos/catDepartamentos/registro-nivel-departamento/registrar-nivel-departamento.component';
import { PrincipalDepartamentoComponent } from '../listar-departamento/principal-departamento.component';
import { VerSucursalComponent } from '../../catSucursal/ver-sucursal/ver-sucursal.component';
import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';

import { SelectionModel } from '@angular/cdk/collections';
import { ITableNivel } from 'src/app/model/reportes.model';

interface Nivel {
  valor: number;
  nombre: string
}

@Component({
  selector: 'app-ver-departamento',
  templateUrl: './ver-departamento.component.html',
  styleUrls: ['./ver-departamento.component.css']
})

export class VerDepartamentoComponent implements OnInit {

  nivelesEliminar: any = [];


  @Input() id_departamento: number;
  @Input() pagina: string;

  // CONTROL DE LOS CAMPOS DEL FORMULARIO
  idSucursal = new FormControl('');
  depaPadre = new FormControl('');
  nombre = new FormControl('', Validators.required);
  nivel = new FormControl('', Validators.required);

  // DATOS DEPARTAMENTO
  sucursales: any = [];
  departamentos: any = [];
  Habilitar: boolean = false;

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 6;
  numero_pagina: number = 1;
  pageSizeOptions = [6, 10, 20, 50];

  // ASIGNAR LOS CAMPOS EN UN FORMULARIO EN GRUPO
  public formulario = new FormGroup({
    nivelForm: this.nivel,
    nombreForm: this.nombre,
    depaPadreForm: this.depaPadre,
    idSucursalForm: this.idSucursal,
  });

  // ARREGLO DE NIVELES EXISTENTES
  niveles: Nivel[] = [
    { valor: 1, nombre: '1' },
    { valor: 2, nombre: '2' },
    { valor: 3, nombre: '3' },
    { valor: 4, nombre: '4' },
    { valor: 5, nombre: '5' }
  ];

  /**
   * VARIABLES PROGRESS SPINNER
   */
  habilitarprogress: boolean = false;
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 10;

  info: any = [];
  nombre_sucursal: string = '';
  mostrar: boolean = true;

  constructor(
    public componented: PrincipalDepartamentoComponent,
    public componentes: VerSucursalComponent,
    public ventana: MatDialog,
    public router: Router,
    public auto: AutorizaDepartamentoService,
    public rest: DepartamentosService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    if (this.id_departamento) {
      this.rest.BuscarDepartamento(this.id_departamento).subscribe(dato => {
        this.info = dato[0];
        this.nombre_sucursal = this.info.sucursal.toUpperCase();
        this.CargarDatos(this.info);
      })
    }
    console.log('pagina', this.pagina);
  }

  // METODO PARA IMPRIMIR DATOS EN FORMULARIO
  CargarDatos(info: any) {
    this.departamentos = [];
    var id_departamento = info.id;
    var id_establecimiento = info.id_sucursal;
    this.rest.ConsultarNivelDepartamento(id_departamento, id_establecimiento).subscribe(datos => {
      this.departamentos = datos;
      console.log('ver data de departamentos ', this.departamentos)
    })
  }

  // METODO PARA BUSCAR DEPARTAMENTOS
  ListaDepartamentos() {
    this.departamentos = []
    this.rest.ConsultarDepartamentos().subscribe(datos => {
      this.departamentos = datos;
      this.OrdenarDatos(this.departamentos);
    })
  }

  // CONTROL DE PAGINACION
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1
  }



  // METODO PARA ACTUALIZAR NIVELES DE APROBACION
  ActualizarRegistros(datos: any) {
    var data = { nivel: 0 };
    var arreglo: any = [];
    var contador = 0;
    var actualiza = 0;
    arreglo = this.departamentos;
    arreglo.forEach(item => {
      contador = contador + 1;
      if (datos.nivel < item.nivel) {
        data.nivel = item.nivel - 1;
        item.nivel = data.nivel;
        this.rest.ActualizarNivelDepa(item.id, data).subscribe(res => {
          actualiza = actualiza + 1;
          if (res.message === 'error') {
            if (actualiza === arreglo.length) {
              this.toastr.error('No se logro actualizar la tabla niveles de autorizacion. Revisar la configuración.',
                'Ups!!! algo salio mal.', {
                timeOut: 1000,
              });
              this.CargarDatos(this.info);
            }
          }
          else {
            if (actualiza === arreglo.length) {
              this.CargarDatos(this.info);
            }
          }
        })
      }
      else {
        this.CargarDatos(this.info);
      }
    });
    if (contador === arreglo.length) {
      this.CargarDatos(this.info);
    }
  }


  // ORDENAR LOS DATOS SEGUN EL ID 
  OrdenarDatos(array: any) {
    function compare(a: any, b: any) {
      if (a.id < b.id) {
        return -1;
      }
      if (a.id > b.id) {
        return 1;
      }
      return 0;
    }
    array.sort(compare);
  }

  // METODO PARA REGISTRAR NIVEL DE AUTORIZACION
  AbrirRegistrarNiveles() {
    this.ventana.open(RegistrarNivelDepartamentoComponent,
      { width: '500px', data: this.info }).afterClosed()
      .subscribe(() => {
        this.CargarDatos(this.info);
      }
      );
    this.activar_seleccion = true;
    this.plan_multiple = false;
    this.plan_multiple_ = false;
    this.selectionNivel.clear();
    this.nivelesEliminar = [];

  }

  // METODO PARA VISUALIZAR LISTA DE USUARIOS QUE AUTORIZAN
  empleados: any = [];
  depa: string;
  AbrirVentanaVerListadoEmpleados(departamento: any) {
    this.habilitarprogress = true;
    var id_depa = departamento.id_departamento_nivel;
    this.depa = departamento.departamento_nombre_nivel;
    this.auto.BuscarListaEmpleadosAutorizan(id_depa).subscribe(datos => {
      this.empleados = datos;
      this.habilitarprogress = false;
      this.mostrar = false;
    }, error => {
      this.mostrar = true;
      this.habilitarprogress = false;
      this.toastr.error('No se ha encontrado usuarios que autoricen en este departamento.', '', {
        timeOut: 4000,
      });
    })
  }

  // METODO PARA CERRAR TABLA DE USUARIOS AUTORIZA
  CerrarTabla() {
    this.mostrar = true;
  }

  // METODO PARA VER PANTALLAS
  VerDepartamentos() {
    if (this.pagina === 'ver-departamento') {
      this.componented.ver_nivel = false;
      this.componented.ver_departamentos = true;
      this.componented.ListaDepartamentos();
    }
    else {
      this.componentes.ver_nivel = false;
      this.componentes.ver_sucursal = true;
      this.componentes.ListaDepartamentos();
    }
  }



  // METODOS PARA LA SELECCION MULTIPLE

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

  selectionNivel = new SelectionModel<ITableNivel>(true, []);



  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedPag() {
    const numSelected = this.selectionNivel.selected.length;
    return numSelected === this.departamentos.length
  }


  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterTogglePag() {
    this.isAllSelectedPag() ?
      this.selectionNivel.clear() :
      this.departamentos.forEach((row: any) => this.selectionNivel.select(row));
  }


  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelPag(row?: ITableNivel): string {
    if (!row) {
      return `${this.isAllSelectedPag() ? 'select' : 'deselect'} all`;
    }
    this.nivelesEliminar = this.selectionNivel.selected;
    //console.log('paginas para Eliminar',this.paginasEliminar);

    //console.log(this.selectionPaginas.selected)
    return `${this.selectionNivel.isSelected(row) ? 'deselect' : 'select'} row ${row.nivel + 1}`;

  }

  contador: number = 0;
  ingresar: boolean = false;

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO
  Eliminar(id_dep: number, datos: any) {


    this.rest.EliminarRegistroNivelDepa(id_dep).subscribe(res => {

      if (res.message === 'error') {
        this.toastr.error('No se puede eliminar.', '', {
          timeOut: 6000,
        });
      } else {

        this.toastr.error('Registro eliminado.', '', {
          timeOut: 6000,
        });

        this.ActualizarRegistros(datos);
      }
    });
  }


  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
  ConfirmarDelete(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Eliminar(datos.id, datos);
        } else {
          this.router.navigate(['/departamento']);

        }
      });

    this.ActualizarRegistros(datos);

  }



  EliminarMultiple() {


    this.ingresar = false;
    this.contador = 0;

    this.nivelesEliminar = this.selectionNivel.selected;
    this.nivelesEliminar.forEach((datos: any) => {

      this.departamentos = this.departamentos.filter(item => item.id !== datos.id);

      this.contador = this.contador + 1;


      this.rest.EliminarRegistroNivelDepa(datos.id).subscribe(res => {


        if (res.message === 'error') {

          this.toastr.error('No se puede eliminar ', datos.nombre, {
            timeOut: 6000,
          });
          this.contador = this.contador - 1;
        } else {
          if (!this.ingresar) {
            this.toastr.error('Se ha eliminado ' + this.contador + ' registros.', '', {
              timeOut: 6000,
            });
            this.ingresar = true;
          }
          this.ActualizarRegistros(datos);
          // this.ListaDepartamentos();

        }
      });
      this.ActualizarRegistros(datos);

    }
    )
  }


  ConfirmarDeleteMultiple() {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {

          if (this.nivelesEliminar.length != 0) {
            this.EliminarMultiple();
            this.activar_seleccion = true;

            this.plan_multiple = false;
            this.plan_multiple_ = false;
            this.nivelesEliminar = [];
            this.selectionNivel.clear();

          } else {
            this.toastr.warning('No ha seleccionado NIVEL.', 'Ups!!! algo salio mal.', {
              timeOut: 6000,
            })

          }
        } else {
          this.router.navigate(['/departamento']);

        }
      });
  }

  //Control Botones
  getVerDepartamentoVerNiveles() {
    var datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      var encontrado = false;

      const currentUrl: string = window.location.href;
      const ultimaBarraIndex: number = currentUrl.lastIndexOf("/");
      let contenidoDerecha: string = ''; 
      if (ultimaBarraIndex !== -1) {
        contenidoDerecha = currentUrl.substring(ultimaBarraIndex + 1);
      }

      if(contenidoDerecha === 'vistaEmpresa'){
        const index = datos.findIndex(item => item.accion === 'Ver Departamento - Ver Niveles - Añadir Nivel' && item.id_funcion === 1);
        if (index !== -1) {
          encontrado = true;
        }
      }else if (contenidoDerecha === 'sucursales'){
        const index = datos.findIndex(item => item.accion === 'Ver Departamento - Ver Niveles - Añadir Nivel' && item.id_funcion === 10);
        if (index !== -1) {
          encontrado = true;
        }
      }else if (contenidoDerecha === 'departamento'){
        const index = datos.findIndex(item => item.accion === 'Ver Niveles - Añadir Nivel');
        if (index !== -1) {
          encontrado = true;
        }
      }
      return encontrado;
    } else {
      if (parseInt(localStorage.getItem('rol') as string) != 1) {
        return false;
      } else {
        return true;
      }
    }
  }

  getVerDepartamentoEliminarNiveles() {
    var datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      var encontrado = false;
      
      const currentUrl: string = window.location.href;
      const ultimaBarraIndex: number = currentUrl.lastIndexOf("/");
      let contenidoDerecha: string = ''; 
      if (ultimaBarraIndex !== -1) {
        contenidoDerecha = currentUrl.substring(ultimaBarraIndex + 1);
      }

      if(contenidoDerecha === 'vistaEmpresa'){
        const index = datos.findIndex(item => item.accion === 'Ver Departamento - Ver Niveles - Eliminar Nivel' && item.id_funcion === 1);
        if (index !== -1) {
          encontrado = true;
        }
      }else if (contenidoDerecha === 'sucursales'){
        const index = datos.findIndex(item => item.accion === 'Ver Departamento - Ver Niveles - Eliminar Nivel' && item.id_funcion === 10);
        if (index !== -1) {
          encontrado = true;
        }
      }else if (contenidoDerecha === 'departamento'){
        const index = datos.findIndex(item => item.accion === 'Ver Niveles - Eliminar Nivel');
        if (index !== -1) {
          encontrado = true;
        }
      }

      return encontrado;
    } else {
      if (parseInt(localStorage.getItem('rol') as string) != 1) {
        return false;
      } else {
        return true;
      }
    }
  }

  getVerDepartamentoVerAutoridades() {
    var datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      var encontrado = false;
      
      const currentUrl: string = window.location.href;
      const ultimaBarraIndex: number = currentUrl.lastIndexOf("/");
      let contenidoDerecha: string = ''; 
      if (ultimaBarraIndex !== -1) {
        contenidoDerecha = currentUrl.substring(ultimaBarraIndex + 1);
      }

      if(contenidoDerecha === 'vistaEmpresa'){
        const index = datos.findIndex(item => item.accion === 'Ver Departamento - Ver Niveles - Ver Autoridades' && item.id_funcion === 1);
        if (index !== -1) {
          encontrado = true;
        }
      }else if (contenidoDerecha === 'sucursales'){
        const index = datos.findIndex(item => item.accion === 'Ver Departamento - Ver Niveles - Ver Autoridades' && item.id_funcion === 10);
        if (index !== -1) {
          encontrado = true;
        }
      }else if (contenidoDerecha === 'departamento'){
        const index = datos.findIndex(item => item.accion === 'Ver Niveles - Ver Autoridades');
        if (index !== -1) {
          encontrado = true;
        }
      }
      return encontrado;
    } else {
      if (parseInt(localStorage.getItem('rol') as string) != 1) {
        return false;
      } else {
        return true;
      }
    }
  }

}
