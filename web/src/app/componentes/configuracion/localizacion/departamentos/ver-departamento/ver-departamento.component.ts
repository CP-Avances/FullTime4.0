import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { AutorizaDepartamentoService } from 'src/app/servicios/configuracion/localizacion/autorizaDepartamento/autoriza-departamento.service';
import { DepartamentosService } from 'src/app/servicios/configuracion/localizacion/catDepartamentos/departamentos.service';

import { RegistrarNivelDepartamentoComponent } from 'src/app/componentes/configuracion/localizacion/departamentos/registro-nivel-departamento/registrar-nivel-departamento.component';
import { PrincipalDepartamentoComponent } from '../listar-departamento/principal-departamento.component';
import { VerSucursalComponent } from 'src/app/componentes/configuracion/localizacion/sucursales/ver-sucursal/ver-sucursal.component';
import { MetodosComponent } from 'src/app/componentes/generales/metodoEliminar/metodos.component';

import { SelectionModel } from '@angular/cdk/collections';
import { ITableNivel } from 'src/app/model/reportes.model';

interface Nivel {
  valor: number;
  nombre: string
}

@Component({
  selector: 'app-ver-departamento',
  standalone: false,
  templateUrl: './ver-departamento.component.html',
  styleUrls: ['./ver-departamento.component.css']
})

export class VerDepartamentoComponent implements OnInit {
  ips_locales: any = '';

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
  nivelesEliminar: any = [];
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

  info: any = [];
  nombre_sucursal: string = '';
  mostrar: boolean = true;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    public componented: PrincipalDepartamentoComponent,
    public componentes: VerSucursalComponent,
    public ventana: MatDialog,
    public router: Router,
    public auto: AutorizaDepartamentoService,
    public rest: DepartamentosService,
    private toastr: ToastrService,
    public validar: ValidacionesService,
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');  
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });

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
    var data = {
      nivel: 0,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales
    };
    var arreglo: any = [];
    var contador = 0;
    var actualiza = 0;
    arreglo = this.departamentos;
    arreglo.forEach((item: any) => {
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
    var id_depa = departamento.id_departamento_nivel;
    this.depa = departamento.departamento_nombre_nivel;
    this.auto.BuscarListaEmpleadosAutorizan(id_depa).subscribe(datos => {
      //console.log('ver empleados ', datos)
      this.empleados = datos;
      this.mostrar = false;
    }, error => {
      this.mostrar = true;
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

    return `${this.selectionNivel.isSelected(row) ? 'deselect' : 'select'} row ${row.nivel + 1}`;

  }

  contador: number = 0;
  ingresar: boolean = false;

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO
  Eliminar(id_dep: number, datos: any) {
    const data = {
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales
    };
    this.rest.EliminarRegistroNivelDepa(id_dep, data).subscribe((res: any) => {
      if (res.message === 'error') {
        this.toastr.error('Existen datos relacionados con este registro.', 'No fue posible eliminar.', {
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


  // METODO DE ELIMINACION MULTIPLE
  EliminarMultiple() {
    const data = {
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales
    };
    this.ingresar = false;
    this.contador = 0;
    this.nivelesEliminar = this.selectionNivel.selected;
    this.nivelesEliminar.forEach((datos: any) => {
      this.departamentos = this.departamentos.filter(item => item.id !== datos.id);
      this.contador = this.contador + 1;
      this.rest.EliminarRegistroNivelDepa(datos.id, data).subscribe((res: any) => {
        if (res.message === 'error') {
          this.toastr.error('Existen datos relacionados con ' + datos.nivel + '.', 'No fue posible eliminar.', {
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
        }
      });
      this.ActualizarRegistros(datos);
    }
    )
  }

  // METODO DE CONFIRMACION DE ELIMINACION MULTIPLE
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

  //CONTROL BOTONES
  getVerDepartamentoVerNiveles(): boolean {
    const datosRecuperados = sessionStorage.getItem('paginaRol');
  
    if (!datosRecuperados) {
      return parseInt(localStorage.getItem('rol') || '0') === 1;
    }
  
    try {
      const datos = JSON.parse(datosRecuperados);
      const currentUrl = window.location.href;
      const contenidoDerecha = currentUrl.substring(currentUrl.lastIndexOf("/") + 1);
  
      const condiciones = new Map<string, (item: any) => boolean>([
        ['vistaEmpresa', item => item.accion === 'Ver Departamento - Ver Niveles - Añadir Nivel' && item.id_funcion === 1],
        ['sucursales', item => item.accion === 'Ver Departamento - Ver Niveles - Añadir Nivel' && item.id_funcion === 10],
        ['departamento', item => item.accion === 'Ver Niveles - Añadir Nivel']
      ]);
  
      const condicion = condiciones.get(contenidoDerecha);
      return condicion ? datos.some(condicion) : false;
  
    } catch {
      return false;
    }
  }  

  getVerDepartamentoEliminarNiveles() {
    const datosRecuperados = sessionStorage.getItem('paginaRol');

    if (!datosRecuperados) {
      return parseInt(localStorage.getItem('rol') || '0') === 1;
    }

    try {
      const datos = JSON.parse(datosRecuperados);
      const currentUrl = window.location.href;
      const contenidoDerecha = currentUrl.substring(currentUrl.lastIndexOf("/") + 1);
  
      const condiciones = new Map<string, (item: any) => boolean>([
        ['vistaEmpresa', item => item.accion === 'Ver Departamento - Ver Niveles - Eliminar Nivel' && item.id_funcion === 1],
        ['sucursales', item => item.accion === 'Ver Departamento - Ver Niveles - Eliminar Nivel' && item.id_funcion === 10],
        ['departamento', item => item.accion === 'Ver Niveles - Eliminar Nivel']
      ]);
  
      const condicion = condiciones.get(contenidoDerecha);
      return condicion ? datos.some(condicion) : false;
  
    } catch {
      return false;
    }
  }

  getVerDepartamentoVerAutoridades() {
    const datosRecuperados = sessionStorage.getItem('paginaRol');

    if (!datosRecuperados) {
      return parseInt(localStorage.getItem('rol') || '0') === 1;
    }

    try {
      const datos = JSON.parse(datosRecuperados);
      const currentUrl = window.location.href;
      const contenidoDerecha = currentUrl.substring(currentUrl.lastIndexOf("/") + 1);

      const condiciones = new Map<string, (item: any) => boolean>([
        ['vistaEmpresa', item => item.accion === 'Ver Departamento - Ver Niveles - Ver Autoridades' && item.id_funcion === 1],
        ['sucursales', item => item.accion === 'Ver Departamento - Ver Niveles - Ver Autoridades' && item.id_funcion === 10],
        ['departamento', item => item.accion === 'Ver Niveles - Ver Autoridades']
      ]);

      const condicion = condiciones.get(contenidoDerecha);
      return condicion ? datos.some(condicion) : false;

    } catch {
      return false;
    }
  }

}
