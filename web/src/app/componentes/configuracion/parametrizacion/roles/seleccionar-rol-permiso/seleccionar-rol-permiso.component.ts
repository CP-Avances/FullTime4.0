import { Component, OnInit, Input } from '@angular/core';
import { Validators, FormControl } from '@angular/forms';
import { ITableFuncionesRoles } from 'src/app/model/reportes.model';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import * as xlsx from 'xlsx';
import * as moment from 'moment';
import * as xml2js from 'xml2js';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
import * as FileSaver from 'file-saver';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

import { MetodosComponent } from 'src/app/componentes/generales/metodoEliminar/metodos.component';
import { VistaRolesComponent } from '../vista-roles/vista-roles.component';

import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { RolPermisosService } from 'src/app/servicios/catalogos/catRolPermisos/rol-permisos.service';
import { MainNavService } from 'src/app/componentes/generales/main-nav/main-nav.service';
import { RolesService } from '../../../../../servicios/catalogos/catRoles/roles.service';
import { PlantillaReportesService } from 'src/app/componentes/reportes/plantilla-reportes.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';

@Component({
  selector: 'app-seleccionar-rol-permiso',
  templateUrl: './seleccionar-rol-permiso.component.html',
  styleUrls: ['./seleccionar-rol-permiso.component.css'],
})

export class SeleccionarRolPermisoComponent implements OnInit {

  @Input() id_rol: number;

  // METODO DE LLAMADO DE DATOS DE EMPRESA COLORES - LOGO - MARCA DE AGUA
  get s_color(): string { return this.plantilla.color_Secundary }
  get p_color(): string { return this.plantilla.color_Primary }
  get logoE(): string { return this.plantilla.logoBase64 }
  get frase(): string { return this.plantilla.marca_Agua }

  // BUSQUEDA DE FUNCIONES ACTIVAS
  get acciones_personal(): boolean { return this.varificarFunciones.accionesPersonal; }
  get geolocalizacion(): boolean { return this.varificarFunciones.geolocalizacion; }
  get timbre_virtual(): boolean { return this.varificarFunciones.timbre_web; }
  get reloj_virtual(): boolean { return this.varificarFunciones.app_movil; }
  get alimentacion(): boolean { return this.varificarFunciones.alimentacion; }
  get horas_extras(): boolean { return this.varificarFunciones.horasExtras; }
  get vacaciones(): boolean { return this.varificarFunciones.vacaciones; }
  get permisos(): boolean { return this.varificarFunciones.permisos; }

  funcion = new FormControl('', [Validators.minLength(2)]);

  // DICCIONARIO DE MODULOS
  diccionarioFuncionesActivas: { [id_funcion: string]: boolean } = {
    "permisos": this.permisos,
    "geolocalizacion": this.geolocalizacion,
    "alimentacion": this.alimentacion,
    "horas_extras": this.horas_extras,
    "timbre_virtual": this.timbre_virtual,
    "vacaciones": this.vacaciones,
    "acciones_personal": this.acciones_personal,
    "reloj_virtual": this.reloj_virtual,
  };

  nombreRol: string;

  // ITEMS PAGINAS
  paginas: any = [];
  paginasRol: any = [];
  nombresMenu: any = [];
  nombrePaginas: any = [];
  paginasEliminar: any = [];
  paginasSeleccionadas: any = [];
  paginasSeleccionadasM: any = [];
  nombreModulosAsignados: any = [];
  paginasModulos: { [modulos: string]: any } = {};
  paginasSeleccionadasModulos: { [modulos: string]: any } = {};
  habilitarprogress: boolean = false;

  // ITEMS ACCIONES DE PAGINAS
  acciones: any = [];
  nombresAcciones: any = [];
  accionesPaginas: any = [];
  accionesSeleccionadasPorPagina: { [id_funcion: number]: any } = {};
  nombresAccionesPorPagina: { [id_funcion: number]: any[] } = {};
  todasPaginasAcciones: { [id_funcion: number]: any } = {};
  todosModulosAcciones: { [id_funcion: number]: any } = {};
  todasAcciones: { [id_funcion: number]: any } = {};

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  expansion: boolean = false;
  plataforma: boolean = false;  // FALSE --> APLICACION WEB
  idEmpleado: number;
  empleado: any = [];

  constructor(
    private varificarFunciones: MainNavService,
    private plantilla: PlantillaReportesService, // SERVICIO DATOS DE EMPRESA
    private validar: ValidacionesService,
    private toastr: ToastrService,
    private restE: EmpleadoService,
    private rol: RolesService,
    public rest: RolPermisosService,
    public ventana: MatDialog,
    public componenter: VistaRolesComponent,
  ) {
  }

  ngOnInit(): void {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.rol.BuscarUnRol(this.id_rol).subscribe(data => {
      this.nombreRol = data[0].nombre.toUpperCase();
    })
    this.ObtenerEmpleados(this.idEmpleado);
    this.ObtenerRoles();
    this.ObtenerMenu();
    this.MostrarPaginasRol();
    this.nombresMenu.forEach((pagina: any) => {
      this.nombresAccionesPorPagina[pagina.id] = [[]];
      this.accionesSeleccionadasPorPagina[pagina.id] = [];
    })
    this.ObtenerTodasAcciones();
    this.ObtenerMenuModulos();
    this.nombreModulos.map((x: any) => {
      this.paginasSeleccionadasModulos[x] = []
    })
    this.ObtenerTodasPaginasAcciones();
    this.ObtenerModulos();
    this.ObtenerTodasModulosAcciones();
    this.VerModulos();
  }

  // METODO PARA OBTENER ROLES
  roles: any = [];
  ObtenerRoles() {
    this.roles = [];
    this.rol.BuscarRoles().subscribe(res => {
      this.roles = res;
      this.ObtenerFuncionesRoles();
    });
  }

  // METODO PARA BUSCAR FUNCIONES DE LOS ROLES
  funciones: any = [];
  data_general: any = [];
  ObtenerFuncionesRoles() {
    this.funciones = [];
    let datos = [];
    this.rest.BuscarFuncionesRoles().subscribe(res => {
      this.funciones = res;
      datos = this.roles;
      datos.forEach((rol: any) => {
        rol.funciones = this.funciones.filter((funcion: any) => funcion.id_rol === rol.id);
      });
      datos.sort((a: any, b: any) => a.id - b.id);
      this.data_general = datos.filter((item: any) => item.id === this.id_rol);
      console.log('funciones ', this.data_general);
    });
  }

  // METODO PARA VER LA INFORMACION DEL EMPLEADO
  ObtenerEmpleados(idemploy: any) {
    this.empleado = [];
    this.restE.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleado = data;
    })
  }

  // METODO PARA VER LISTA DE ROLES DEL SISTEMA
  VerRoles() {
    this.componenter.ver_funciones = false;
    this.componenter.ver_roles = true;
    this.componenter.ObtenerRoles();
  }

  // METODO PARA MOSTRAR FUNCIONES CON MODULOS DEL SISTEMA
  ver_modulo: boolean = false;
  VerModulos() {
    if (this.permisos === false && this.vacaciones === false && this.horas_extras === false &&
      this.acciones_personal === false && this.timbre_virtual === false && this.reloj_virtual === false &&
      this.geolocalizacion === false
    ) {
      this.ver_modulo = false;
    }
    else {
      this.ver_modulo = true;
    }
  }

  // METODO PARA MAJERAR LAS PAGINAS DE LA TABLA QUE MUESTRA LAS FUNCIONES QUE TIENE EL ROL
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1
  }

  // METODO PARA BUSCAR LOS PAGINAS DEL MENU DEL SISTEMA 
  ObtenerMenu() {
    this.nombresMenu = [];
    this.rest.ObtenerMenu(this.plataforma).subscribe(res => {
      this.nombresMenu = res;
      this.nombrePaginas = res;
    });
  }

  // METODO PARA BUSCAR LOS MODULOS
  ObtenerModulos() {
    this.rest.ObtenerModulos(this.plataforma).subscribe(res => {
      this.nombreModulosAsignados = res;
    });
  }

  // METODO PARA BUSCAR LAS PAGINAS SEGUN EL NOMBRE DE SU MODULO Y ALMACENARLAS EN UN OBJETO
  nombreModulos: string[] = [
    'permisos',
    'vacaciones',
    'horas_extras',
    'alimentacion',
    'acciones_personal',
    'geolocalizacion',
    'timbre_virtual',
    'reloj_virtual',
  ]

  // METODO PARA BUSCAR PAGINAS QUE PERTENECEN A MODULOS
  ObtenerMenuModulos() {
    this.nombreModulos.map(nombre => {
      var nombre_modulo = {
        nombre_modulo: nombre,
        tipo: this.plataforma,
      }
      this.rest.ObtenerMenuModulos(nombre_modulo).subscribe(res => {
        this.paginasModulos[nombre] = res;
      })
    }
    )
  }

  // METODO PARA AGREGAR PAGINAS
  AgregarPagina(data: any) {
    if (this.paginasSeleccionadas.some((subArreglo: any) => JSON.stringify(subArreglo) === JSON.stringify(data))) {
    } else {
      this.paginasSeleccionadas.push(data);
    }
    this.accionesSeleccionadasPorPagina[data.id] = [];
  }

  // METDO PARA AGREGAR PAGINAS MODULOS
  AgregarPaginaModulo(data: any, modulo: string) {
    if (!this.paginasSeleccionadasModulos[modulo]) {
      this.paginasSeleccionadasModulos[modulo] = [];
      this.paginasSeleccionadasModulos[modulo].push(data);
    } else {
      this.paginasSeleccionadasModulos[modulo].push(data);
    }
    if (this.paginasSeleccionadasM.some((subArreglo: any) => JSON.stringify(subArreglo) === JSON.stringify(data))) {
    } else {
      this.paginasSeleccionadasM.push(data);
    }
    this.accionesSeleccionadasPorPagina[data.id] = [];
  }

  // METODO PARA AGREGAR ACCIONES
  AgregarAccion(id: any, data: any) {
    if (!this.accionesSeleccionadasPorPagina[id]) {
      this.accionesSeleccionadasPorPagina[id] = [];
      this.accionesSeleccionadasPorPagina[id].push(data);
    } else {
      this.accionesSeleccionadasPorPagina[id].push(data);
    }
  }

  // METODO PARA RETIRAR PAGINAS
  QuitarPagina(data: any) {
    this.paginasSeleccionadas = this.paginasSeleccionadas.filter((subArreglo: any) => JSON.stringify(subArreglo) !== JSON.stringify(data));
    (<HTMLInputElement>document.getElementById('seleccionar')).checked = false;
  }

  // METODO PARA RETIRAR PAGINAS DE MODULOS
  QuitarPaginaModulo(data: string, modulo: string) {
    this.paginasSeleccionadasModulos[modulo] = this.paginasSeleccionadasModulos[modulo].filter((s: any) => s !== data);
    this.paginasSeleccionadasM = this.paginasSeleccionadasM.filter((subArreglo: any) => JSON.stringify(subArreglo) !== JSON.stringify(data));
    (<HTMLInputElement>document.getElementById('seleccionarmodulo' + modulo)).checked = false;
  }

  // METODO PARA RETIRAR ACCIONES
  QuitarAccion(id: any, data: any) {
    this.accionesSeleccionadasPorPagina[id] = this.accionesSeleccionadasPorPagina[id].filter((s: any) => s !== data);
    (<HTMLInputElement>document.getElementById('seleccionarAccion' + id)).checked = false;
  }

  // METODO PARA AGREGAR TODAS LAS PAGINAS
  AgregarTodos() {
    this.nombrePaginas.map((x: any) => {
      if (this.paginasSeleccionadas.includes(x)) {
      } else {
        this.paginasSeleccionadas.push(x)
      }
    }
    )
    for (var i = 0; i <= this.nombrePaginas.length - 1; i++) {
      (<HTMLInputElement>document.getElementById('paginasSeleccionadas' + i)).checked = true;
    }
    this.paginasSeleccionadas.map((pagina: any) => {
      this.ObtenerAcciones(pagina.id);
      this.accionesSeleccionadasPorPagina[pagina.id] = [];
    })
  }

  // METODO PARA AGREGAR TODAS LAS PAGINAS DE LOS MODULOS
  AgregarTodosModulos(modulo: string) {
    this.paginasSeleccionadasModulos[modulo] = this.paginasModulos[modulo];
    this.paginasModulos[modulo].map((x: any) => {
      this.paginasSeleccionadasM.push(x);
    })
    for (var i = 0; i <= this.paginasModulos[modulo].length - 1; i++) {
      (<HTMLInputElement>document.getElementById('paginasSeleccionadasModulos' + i + modulo)).checked = true;
    }
    this.paginasSeleccionadasModulos[modulo].map(pagina => {
      this.ObtenerAcciones(pagina.id);
      this.accionesSeleccionadasPorPagina[pagina.id] = [];
    })
  }

  // METODO PARA AGREGAR TODAS LAS ACCIONES POR PAGINA
  AgregarTodosAcciones(id: any) {
    this.nombresAccionesPorPagina[id].map((x: any) => {
      this.accionesSeleccionadasPorPagina[id] = x;
    })
    for (var i = 0; i <= this.accionesSeleccionadasPorPagina[id].length - 1; i++) {
      (<HTMLInputElement>document.getElementById(id + 'accionesSeleccionadasPorPagina' + i)).checked = true;
    }
  }

  // METODO PARA QUITAR TODAS LAS PAGINAS
  limpiarData: any = [];
  QuitarTodos() {
    this.limpiarData = this.nombrePaginas;
    for (var i = 0; i <= this.limpiarData.length - 1; i++) {
      (<HTMLInputElement>document.getElementById('paginasSeleccionadas' + i)).checked = false;
      this.paginasSeleccionadas = this.paginasSeleccionadas.filter((s: any) => s !== this.nombrePaginas[i]);
    }
  }

  // METODO PARA QUITAR TODAS LAS PAGINAS
  limpiarDataModulos: any = [];
  QuitarTodosModulos(modulo: string) {
    this.limpiarDataModulos = this.paginasModulos[modulo];
    for (var i = 0; i <= this.limpiarDataModulos.length - 1; i++) {
      (<HTMLInputElement>document.getElementById('paginasSeleccionadasModulos' + i + modulo)).checked = false;
      this.paginasSeleccionadasModulos[modulo] = this.paginasSeleccionadasModulos[modulo].filter((s: any) => s !== this.paginasModulos[modulo][i]);
      this.paginasSeleccionadasM = this.paginasSeleccionadasM.filter((s: any) => s !== this.paginasModulos[modulo][i]);
    }
  }

  // METODO PARA QUITAR TODAS LAS ACCIONES POR PAGINA
  limpiarDataAcciones: any = [];
  QuitarTodosAccion(id: any) {
    this.limpiarDataAcciones = this.nombresAccionesPorPagina[id][0];
    for (var i = 0; i <= this.limpiarDataAcciones.length - 1; i++) {
      (<HTMLInputElement>document.getElementById(id + 'accionesSeleccionadasPorPagina' + i)).checked = false;
      this.accionesSeleccionadasPorPagina[id] = [];
    }
  }

  // METODO PARA VERIFICAR SELECCION DE OPCION "Todas"
  isChecked: boolean = false;
  SeleccionarTodas(event: any) {
    //console.log(event)
    if (event === true) {
      this.AgregarTodos();
    }
    else {
      this.QuitarTodos();
      this.nombresAccionesPorPagina = {};
    }
  }

  // METODO PARA VERIFICAR SELECCION DE OPCION "Todas" EN MODULOS
  isCheckedModulos: boolean = false;
  SeleccionarTodasModulos(event: any, modulo: string) {
    const target = event.target as HTMLInputElement;
    if (target.checked === true) {
      this.AgregarTodosModulos(modulo);
    }
    else {
      this.QuitarTodosModulos(modulo);
      this.nombresAccionesPorPagina = {};
    }
  }

  // METODO PARA VERIFICAR SELECCION DE OPCION "Todas" EN LAS ACCIONES POR PAGINA
  isCheckedAccion: boolean = false;
  SeleccionarTodasAcciones(event: any, id: any) {
    const target = event.target as HTMLInputElement;
    if (target.checked === true) {
      this.AgregarTodosAcciones(id);
    }
    else {
      this.QuitarTodosAccion(id);
    }
  }

  // METODO PARA VERIFICAR SELECCION DE PAGINAS
  isChecked_: boolean = false;
  SeleccionarIndividual(event: any, valor: any) {
    const target = event.target as HTMLInputElement;
    if (target.checked === true) {
      this.AgregarPagina(valor);
      if (this.paginasSeleccionadas.length == this.nombrePaginas.length) {
        (<HTMLInputElement>document.getElementById('seleccionar')).checked = true;
      } else {
        (<HTMLInputElement>document.getElementById('seleccionar')).checked = false;
      }
      this.ObtenerAcciones(valor.id);
    }
    else {
      this.QuitarPagina(valor);
      this.nombresAccionesPorPagina[valor.id] = [];
    }
  }

  // METODO PARA VERIFICAR SELECCION DE PAGINAS DE LOS MODULOS
  SeleccionarIndividualModulos(event: any, valor: any, modulo: string) {
    const target = event.target as HTMLInputElement;
    if (target.checked === true) {
      this.AgregarPaginaModulo(valor, modulo);
      if (this.paginasSeleccionadasModulos[modulo].length == this.paginasModulos[modulo].length) {
        (<HTMLInputElement>document.getElementById('seleccionarmodulo' + modulo)).checked = true;
      } else {
        (<HTMLInputElement>document.getElementById('seleccionarmodulo' + modulo)).checked = false;
      }
      this.ObtenerAcciones(valor.id);
    }
    else {
      this.QuitarPaginaModulo(valor, modulo);
      this.nombresAccionesPorPagina[valor.id] = [];
    }
  }

  // METODO PARA VERIFICAR SELECCION DE ACCIONES
  isCheckedAccion_: boolean = false;
  SeleccionarIndividualAccion(event: any, id: any, valor: any) {
    const target = event.target as HTMLInputElement;
    if (target.checked === true) {
      this.AgregarAccion(id, valor);
      if (this.accionesSeleccionadasPorPagina[id].length == this.nombresAccionesPorPagina[id][0].length) {
        (<HTMLInputElement>document.getElementById('seleccionarAccion' + id)).checked = true;
      }
    }
    else {
      this.QuitarAccion(id, valor);
    }
  }

  // METODO PARA ASIGNAR PAGINAS A ESTE ROL
  contador: number = 0;
  ingresar: boolean = false;
  //INSERTAR PAGINA
  InsertarPaginaRol() {
    this.ingresar = false;
    this.contador = 0;
    // VALIDAR SI SE HA SELECCIONADO PAGINAS
    if (this.paginasSeleccionadas.length != 0) {
      this.habilitarprogress = true;
      // RECORRER LA LISTA DE PAGINAS SELECCIONADAS
      this.paginasSeleccionadas.map((obj: any) => {
        // VERIFICAR SI LA PAGINA TIENE ACCIONES
        if (this.ObtenerTodasPaginasAcciones()[obj.id].length != 0) {
          if (this.accionesSeleccionadasPorPagina[obj.id].length > 0) {
            this.accionesSeleccionadasPorPagina[obj.id].map((accion: any) => {
              var buscarPagina = {
                funcion: obj.nombre,
                id_rol: this.id_rol,
                id_accion: accion.id
              };

              // BUSCAR SI LAS PAGINAS YA FUERON ASIGNADAS AL ROL
              this.paginasRol = [];
              this.rest.BuscarIdPaginasConAcciones(buscarPagina).subscribe(
                datos => {
                  this.contador = this.contador + 1;
                  this.paginasRol = datos;
                  this.habilitarprogress = false;
                  this.toastr.info('Se indica que ' + obj.nombre + ' con accion ' + this.MetodoParaMostrarAccion(accion.id) + ' ya fue asignada a este Rol.', '', {
                    timeOut: 7000,
                  })
                }, error => {
                  // INSERTAR PAGINA Y ACCION
                  var rolPermisosbody = {
                    funcion: obj.nombre,
                    link: obj.link,
                    id_rol: this.id_rol,
                    id_accion: accion.id,
                    movil: this.plataforma,
                    user_name: this.user_name,
                    ip: this.ip,
                  }
                  this.contador = this.contador + 1;
                  this.rest.CrearPaginaRol(rolPermisosbody).subscribe(response => {
                    if (!this.ingresar) {
                      this.toastr.success('Operación exitosa.', 'Se ha guardado ' + this.contador + ' registros.', {
                        timeOut: 6000,
                      })
                      this.ObtenerRoles();
                      this.ingresar = true;
                    }
                    this.rest.BuscarPaginasRol(rol).subscribe(datos => {
                      this.paginas = datos;
                    })
                  }, error => {
                    this.contador = this.contador + 1;
                    this.toastr.error('Ups!!! algo salio mal.', 'VERIFICAR.', {
                      timeOut: 6000,
                    })
                  });
                }
              );
            })
          } else {
            this.toastr.warning('No ha seleccionado ACCIONES en ' + obj.nombre + '.', 'Ups!!! algo salio mal.', {
              timeOut: 6000,
            })
          }
        } else {
          var buscarPagina = {
            funcion: obj.nombre,
            id_rol: this.id_rol
          };
          var rolPermisosbody = {
            funcion: obj.nombre,
            link: obj.link,
            id_rol: this.id_rol,
            id_accion: null,
            movil: this.plataforma,
            user_name: this.user_name,
            ip: this.ip,
          }
          // BUSCAR SI LAS PAGINAS YA FUERON ASIGNADAS AL ROL
          this.rest.BuscarIdPaginas(buscarPagina).subscribe(datos => {
            this.contador = this.contador + 1;
            this.habilitarprogress = false;
            this.toastr.info('Se indica que ' + obj.nombre + ' ya fue asignada a este Rol.', '', {
              timeOut: 7000,
            })
          }, error => {
            // INSERTAR PAGINA
            this.contador = this.contador + 1;
            this.rest.CrearPaginaRol(rolPermisosbody).subscribe(response => {
              if (!this.ingresar) {
                this.toastr.success('Operación exitosa.', 'Se ha guardado ' + this.contador + ' registros.', {
                  timeOut: 6000,
                })
                this.ObtenerRoles();
                this.ingresar = true;
              }
              this.rest.BuscarPaginasRol(rol).subscribe(datos => {
                this.paginas = datos;
              })
            }, error => {
              this.toastr.error('Ups!!! algo salio mal..', 'Ups!!! algo salio mal.', {
                timeOut: 6000,
              })
            });
          }
          );
        }
        (<HTMLInputElement>document.getElementById('seleccionar')).checked = false;
        for (var i = 0; i <= this.nombresMenu.length - 1; i++) {
          (<HTMLInputElement>document.getElementById('paginasSeleccionadas' + i)).checked = false;
        }
        delete this.nombresAccionesPorPagina[obj.id];
        this.accionesSeleccionadasPorPagina[obj.id] = [];
        this.paginasSeleccionadas = [];
      }
      );
      var rol = {
        id_rol: this.id_rol,
        tipo: this.plataforma
      };
    }
    else {
      this.toastr.warning('No ha seleccionado PÁGINAS.', 'Ups!!! algo salio mal.', {
        timeOut: 6000,
      })
    }
  }

  //INSERTAR PAGINA DE LOS MODULOS
  InsertarPaginaModulosRol() {
    this.ingresar = false;
    this.contador = 0;
    // VALIDAR SI SE HA SELECCIONADO PAGINAS
    if (this.paginasSeleccionadasM.length != 0) {
      this.habilitarprogress = true;
      // RECORRER LA LISTA DE PAGINAS DE LOS MODULOS SELECCIONADAS
      this.paginasSeleccionadasM.map((obj: any) => {
        // VERIFICAR SI LA PAGINA DE LOS MODULOS TIENE ACCIONES
        if ((this.ObtenerTodasModulosAcciones()[obj.id]).length != 0) {
          if (this.accionesSeleccionadasPorPagina[obj.id].length > 0) {
            this.accionesSeleccionadasPorPagina[obj.id].map((accion: any) => {
              var buscarPagina = {
                funcion: obj.nombre,
                id_rol: this.id_rol,
                id_accion: accion.id
              };
              // BUSCAR SI LAS PAGINAS YA FUERON ASIGNADAS AL ROL
              this.paginasRol = [];
              this.rest.BuscarIdPaginasConAcciones(buscarPagina).subscribe(
                datos => {
                  this.contador = this.contador + 1;
                  this.paginasRol = datos;
                  this.habilitarprogress = false;
                  this.toastr.info('Se indica que ' + obj.nombre + 'con acción ' + this.MetodoParaMostrarAccion(accion.id) + ' ya fue asignada a este Rol.', '', {
                    timeOut: 7000,
                  })
                }, error => {
                  // INSERTAR PAGINA
                  var rolPermisosbody = {
                    funcion: obj.nombre,
                    link: obj.link,
                    id_rol: this.id_rol,
                    id_accion: accion.id,
                    movil: this.plataforma,
                    user_name: this.user_name,
                    ip: this.ip,
                  }
                  this.contador = this.contador + 1;
                  this.rest.CrearPaginaRol(rolPermisosbody).subscribe(response => {
                    if (!this.ingresar) {
                      this.toastr.success('Operación exitosa.', 'Se ha guardado ' + this.contador + ' registros.', {
                        timeOut: 6000,
                      })
                      this.ObtenerRoles();
                      this.ingresar = true;
                    }
                    this.rest.BuscarPaginasRol(rol).subscribe(datos => {
                      this.paginas = datos;
                    })
                  }, error => {
                    this.contador = this.contador + 1;
                    this.toastr.error('Ups!!! algo salio mal.', 'VERIFICAR', {
                      timeOut: 6000,
                    })
                  });
                }
              );
            });
          } else {
            this.toastr.warning('No ha seleccionado ACCIONES en ' + obj.nombre + '.', 'Ups!!! algo salio mal.', {
              timeOut: 6000,
            })
          }
        } else {
          // BUSCAR SI LAS PAGINAS YA FUERON ASIGNADAS AL ROL
          var buscarPagina = {
            funcion: obj.nombre,
            id_rol: this.id_rol
          };
          var rolPermisosbody = {
            funcion: obj.nombre,
            link: obj.link,
            id_rol: this.id_rol,
            id_accion: null,
            movil: this.plataforma,
            user_name: this.user_name,
            ip: this.ip,
          }
          this.rest.BuscarIdPaginas(buscarPagina).subscribe(datos => {
            this.contador = this.contador + 1;
            this.habilitarprogress = false;
            this.toastr.info('Se indica que ' + obj.nombre + ' ya fue asignada a este Rol.', '', {
              timeOut: 7000,
            })
          }, error => {
            // INSERTAR PAGINA
            this.contador = this.contador + 1;
            this.rest.CrearPaginaRol(rolPermisosbody).subscribe(response => {
              if (!this.ingresar) {
                this.toastr.success('Operación exitosa.', 'Se ha guardado ' + this.contador + ' registros.', {
                  timeOut: 6000,
                })
                this.ObtenerRoles();
                this.ingresar = true;
              }
              (<HTMLInputElement>document.getElementById('seleccionarmodulo' + obj.nombre_modulo)).checked = false;
              this.rest.BuscarPaginasRol(rol).subscribe(datos => {
                this.paginas = datos;
              })
              this.ObtenerMenuModulos();
            }, error => {
              this.contador = this.contador + 1;
              this.toastr.error('Ups!!! algo salio mal..', 'Ups!!! algo salio mal.', {
                timeOut: 6000,
              })
            });
          }
          );
        }
        this.nombresAccionesPorPagina[obj.id] = [];
        this.accionesSeleccionadasPorPagina[obj.id] = [];
        this.paginasSeleccionadasM = [];
        this.paginasSeleccionadasModulos[obj.nombre_modulo] = [];
        this.ObtenerMenuModulos();
        (<HTMLInputElement>document.getElementById('seleccionarmodulo' + obj.nombre_modulo)).checked = false;
      })
      var rol = {
        id_rol: this.id_rol,
        tipo: this.plataforma,
      }
    } else {
      this.toastr.warning('No ha seleccionado PAGINAS.', 'Ups!!! algo salio mal.', {
        timeOut: 6000,
      })
    }
  }

  // METODO PARA BUSCAR LAS PAGINAS QUE FUERON ASIGNADAS A ESE ROL
  MostrarPaginasRol() {
    this.paginas = [];
    var buscarPagina = {
      id_rol: this.id_rol,
      tipo: this.plataforma
    };
    this.rest.BuscarPaginasRol(buscarPagina).subscribe(datos => {
      this.paginas = datos;
    })
  }

  // METODO PARA ACTIVAR SELECCION MULTIPLE
  plan_multiple: boolean = false;
  plan_multiple_: boolean = false;
  auto_individual: boolean = true;
  activar_seleccion: boolean = true;
  seleccion_vacia: boolean = true;
  HabilitarSeleccion() {
    this.plan_multiple = true;
    this.plan_multiple_ = true;
    this.auto_individual = false;
    this.activar_seleccion = false;
  }

  // CHECK PAGINAS - ACCIONES
  selectionPaginas = new SelectionModel<ITableFuncionesRoles>(true, []);
  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedPag() {
    const numSelected = this.selectionPaginas.selected.length;
    return numSelected === this.paginas.length
  }
  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterTogglePag() {
    this.isAllSelectedPag() ?
      this.selectionPaginas.clear() :
      this.paginas.forEach((row: any) => this.selectionPaginas.select(row));
  }
  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelPag(row?: ITableFuncionesRoles): string {
    if (!row) {
      return `${this.isAllSelectedPag() ? 'select' : 'deselect'} all`;
    }
    this.paginasEliminar = this.selectionPaginas.selected;
    return `${this.selectionPaginas.isSelected(row) ? 'deselect' : 'select'} row ${row.funcion + 1}`;
  }

  // ELIMINAR PAGINAS SELECCIONADAS POR EL ROL
  EliminarPaginaRol() {
    this.ingresar = false;
    this.contador = 0;
    this.paginasEliminar = this.selectionPaginas.selected;
    this.paginasEliminar.forEach((datos: any) => {
      this.paginas = this.paginas.filter((item: any) => item.id !== datos.id);
      var buscarPagina = {
        id: datos.id,
        user_name: this.user_name,
        ip: this.ip
      };
      this.contador = this.contador + 1;
      this.rest.EliminarPaginasRol(buscarPagina).subscribe(
        res => {
          if (res.message === 'error') {
            this.toastr.error('No se puede eliminar.', 'la: ' + datos.nombre, {
              timeOut: 6000,
            });
          } else {
            if (!this.ingresar) {
              this.toastr.error('Se ha eliminado ' + this.contador + ' registros.', '', {
                timeOut: 6000,
              });
              this.ObtenerRoles();
              this.ingresar = true;
            }
            this.MostrarPaginasRol();
          }
        }
      )
    }
    )
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  ConfirmarDelete() {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          if (this.paginasEliminar.length != 0) {
            this.EliminarPaginaRol();
            this.activar_seleccion = true;
            this.plan_multiple = false;
            this.plan_multiple_ = false;
            this.selectionPaginas.clear();
          } else {
            this.toastr.warning('No ha seleccionado PÁGINAS.', 'Ups!!! algo salio mal.', {
              timeOut: 6000,
            })
          }
        }
      });
  }

  // FUNCION PARA BUSCAR LAS ACCIONES DE LAS PAGINAS
  ObtenerTodasPaginasAcciones(): any {
    this.rest.ObtenerMenu(this.plataforma).subscribe(res => {
      this.nombrePaginas = res;
      this.nombrePaginas.map((pagina: any) => {
        var buscarAcciones = {
          id_funcion: pagina.id,
          tipo: this.plataforma
        };
        this.rest.BuscarAccionesPaginas(buscarAcciones).subscribe(res => {
          this.todasPaginasAcciones[pagina.id] = res
        })
      })
    }
    )
    return this.todasPaginasAcciones;
  }

  // FUNCION PARA BUSCAR LAS ACCIONES DE LAS PAGINAS DE LOS MODULOS
  ObtenerTodasModulosAcciones(): any {
    this.rest.ObtenerModulos(this.plataforma).subscribe(res => {
      this.nombreModulosAsignados = res;
      this.nombreModulosAsignados.map((pagina: any) => {
        var buscarAcciones = {
          id_funcion: pagina.id,
          tipo: this.plataforma
        };
        this.rest.BuscarAccionesPaginas(buscarAcciones).subscribe(res => {
          this.todosModulosAcciones[pagina.id] = res
        })
      })
    }
    )
    return this.todosModulosAcciones;
  }


  // OBTENER LAS ACCIONES QUE EXISTEN EN CADA PAGINA
  ObtenerAcciones(id: any) {
    this.nombresAcciones = [];
    var buscarAcciones = {
      id_funcion: id
    };
    this.rest.BuscarAccionesExistentesPaginas(buscarAcciones).subscribe(res => {
      this.nombresAcciones = res;
      this.nombresAccionesPorPagina[id] = [res];
    });

  }

  // METODO PARA OBTENER TODAS LAS ACCIONES
  ObtenerTodasAcciones() {
    this.acciones = [];
    this.rest.ObtenerAcciones().subscribe(res => {
      this.acciones = res;
      this.acciones.map((x: any) => {
        this.todasAcciones[x.id] = x;
      })
    });
  }


  // METODO PARA OBTENER EL NOMBRE DE LA ACCION POR SU ID
  MetodoParaMostrarAccion(id: any): any {
    if (id != null) {
      if (this.todasAcciones[id]) {
        return this.todasAcciones[id].accion;
      }
    } else {
      return null;
    }
  }

  // METODO PARA VALIDAR INGRESO DE LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  /** ************************************************************************************************* **
   ** **                            PARA LA EXPORTACION DE ARCHIVOS PDF                              ** **
   ** ************************************************************************************************* **/

  // METODO PARA CREAR ARCHIVO PDF

  GenerarPdf(action = 'open') {
    //console.log('data ', this.data_general)
    const documentDefinition = this.DefinirInformacionPDF();
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download('Roles' + '.pdf'); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  DefinirInformacionPDF() {
    return {
      // ENCABEZADO DE PÁGINA
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [40, 50, 40, 50],
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleado[0].nombre + ' ' + this.empleado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },
      // PIE DE PAGINA
      footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
        var f = moment();
        fecha = f.format('YYYY-MM-DD');
        hora = f.format('HH:mm:ss');
        return {
          margin: 10,
          columns: [
            { text: 'Fecha: ' + fecha + ' Hora: ' + hora, opacity: 0.3 },
            {
              text: [
                {
                  text: '© Pag ' + currentPage.toString() + ' of ' + pageCount,
                  alignment: 'right', opacity: 0.3
                }
              ],
            }
          ], fontSize: 10
        }
      },
      content: [
        { image: this.logoE, width: 100, margin: [10, -25, 0, 5] },
        { text: localStorage.getItem('name_empresa')?.toUpperCase(), bold: true, fontSize: 14, alignment: 'center', margin: [0, -30, 0, 5] },
        { text: 'PERMISOS O FUNCIONALIDADES DEL ROL', bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 0] },
        ...this.PresentarDataPDF(),
      ],
      styles: {
        tableHeader: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.s_color },
        itemsTableInfo: { fontSize: 9, margin: [0, -1, 0, -1], fillColor: this.p_color },
        itemsTableCentrado: { fontSize: 8, alignment: 'center' },
        tableMargin: { margin: [0, 0, 0, 0] },
        tableMarginCabecera: { margin: [0, 10, 0, 0] },
      }
    };
  }

  // METODO PARA PRESENTAR DATOS DEL DOCUMENTO PDF
  PresentarDataPDF(): Array<any> {
    let n: any = []
    this.data_general.forEach((obj: any) => {
      n.push({
        style: 'tableMarginCabecera',
        table: {
          widths: ['*'],
          headerRows: 1,
          body: [
            [
              { text: `ROL: ${obj.nombre}`, style: 'itemsTableInfo', border: [true, true, true, true] },],
          ]
        },
      });

      if (obj.funciones.length > 0) {
        n.push({
          style: 'tableMargin',
          table: {
            widths: ['*'],
            headerRows: 1,
            body: [
              [{ rowSpan: 1, text: 'FUNCIONES DEL SISTEMA ASIGNADAS', style: 'tableHeader', border: [true, true, true, false] }],
            ]
          }
        });
        n.push({
          style: 'tableMargin',
          table: {
            widths: ['*', '*', 'auto', 'auto', 'auto'],
            headerRows: 1,
            body: [
              [
                { text: 'PÁGINA', style: 'tableHeader' },
                { text: 'FUNCIÓN', style: 'tableHeader' },
                { text: 'MÓDULO', style: 'tableHeader' },
                { text: 'APLICACIÓN WEB', style: 'tableHeader' },
                { text: 'APLICACIÓN MÓVIL', style: 'tableHeader' },
              ],
              ...obj.funciones.map((detalle: any) => {
                return [
                  { text: detalle.pagina, style: 'itemsTableCentrado' },
                  { text: detalle.accion, style: 'itemsTableCentrado' },
                  {
                    text: detalle.nombre_modulo === 'permisos'
                      ? 'Módulo de Permisos'
                      : detalle.nombre_modulo === 'vacaciones'
                        ? 'Módulo de Vacaciones'
                        : detalle.nombre_modulo === 'horas_extras'
                          ? 'Módulo de Horas Extras'
                          : detalle.nombre_modulo === 'alimentacion'
                            ? 'Módulo de Alimentación'
                            : detalle.nombre_modulo === 'acciones_personal'
                              ? 'Módulo de Acciones de Personal'
                              : detalle.nombre_modulo === 'geolocalizacion'
                                ? 'Módulo de Geolocalización'
                                : detalle.nombre_modulo === 'timbre_virtual'
                                  ? 'Módulo de Timbre Virtual'
                                  : detalle.nombre_modulo === 'reloj_virtual'
                                    ? 'Aplicación Móvil'
                                    : detalle.nombre_modulo === 'aprobar'
                                      ? 'Aprobaciones Solicitudes'
                                      : detalle.nombre_modulo, style: 'itemsTableCentrado'
                  },
                  { text: detalle.movil == false ? 'Sí' : '', style: 'itemsTableCentrado' },
                  { text: detalle.movil == true ? 'Sí' : '', style: 'itemsTableCentrado' },
                ];
              })
            ]
          },
          layout: {
            fillColor: function (rowIndex: any) {
              return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
            }
          }
        });
      }
    });
    return n;
  }


  /** ************************************************************************************************* **
   ** **                             PARA LA EXPORTACION DE ARCHIVOS EXCEL                           ** **
   ** ************************************************************************************************* **/

  ExportToExcel() {
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.EstructurarDatosExcel());
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'Roles');
    xlsx.writeFile(wb, "RolesEXCEL" + '.xlsx');
  }

  EstructurarDatosExcel() {
    let datos: any = [];
    let n: number = 1;
    this.data_general.forEach((obj: any) => {
      obj.funciones.forEach((det: any) => {
        datos.push({
          'N°': n++,
          'ROL': obj.nombre,
          'PÁGINA': det.pagina,
          'FUNCIÓN': det.accion,
          'MÓDULO': det.nombre_modulo === 'permisos'
            ? 'Módulo de Permisos'
            : det.nombre_modulo === 'vacaciones'
              ? 'Módulo de Vacaciones'
              : det.nombre_modulo === 'horas_extras'
                ? 'Módulo de Horas Extras'
                : det.nombre_modulo === 'alimentacion'
                  ? 'Módulo de Alimentación'
                  : det.nombre_modulo === 'acciones_personal'
                    ? 'Módulo de Acciones de Personal'
                    : det.nombre_modulo === 'geolocalizacion'
                      ? 'Módulo de Geolocalización'
                      : det.nombre_modulo === 'timbre_virtual'
                        ? 'Módulo de Timbre Virtual'
                        : det.nombre_modulo === 'reloj_virtual'
                          ? 'Aplicación Móvil'
                          : det.nombre_modulo === 'aprobar'
                            ? 'Aprobaciones Solicitudes'
                            : det.nombre_modulo,
          'APLICACIÓN WEB': det.movil == false ? 'Sí' : '',
          'APLICACIÓN MÓVIL': det.movil == true ? 'Sí' : '',
        });
      });
    });

    return datos;
  }

  /** ************************************************************************************************* **
   ** **                               PARA LA EXPORTACION DE ARCHIVOS XML                           ** **
   ** ************************************************************************************************* **/

  urlxml: string;
  data: any = [];
  ExportToXML() {
    var objeto: any;
    var arregloRoles: any = [];
    this.data_general.forEach((obj: any) => {
      let detalles: any = [];
      obj.funciones.forEach((det: any) => {
        detalles.push({
          "pagina": det.pagina,
          "funcion": det.accion,
          "modulo": det.nombre_modulo === 'permisos'
            ? 'Módulo de Permisos'
            : det.nombre_modulo === 'vacaciones'
              ? 'Módulo de Vacaciones'
              : det.nombre_modulo === 'horas_extras'
                ? 'Módulo de Horas Extras'
                : det.nombre_modulo === 'alimentacion'
                  ? 'Módulo de Alimentación'
                  : det.nombre_modulo === 'acciones_personal'
                    ? 'Módulo de Acciones de Personal'
                    : det.nombre_modulo === 'geolocalizacion'
                      ? 'Módulo de Geolocalización'
                      : det.nombre_modulo === 'timbre_virtual'
                        ? 'Módulo de Timbre Virtual'
                        : det.nombre_modulo === 'reloj_virtual'
                          ? 'Aplicación Móvil'
                          : det.nombre_modulo === 'aprobar'
                            ? 'Aprobaciones Solicitudes'
                            : det.nombre_modulo,
          "aplicacion_web": det.movil == false ? 'Sí' : '',
          "aplicacion_movil": det.movil == true ? 'Sí' : '',
        });
      });

      objeto = {
        "rol": {
          "$": { "id": obj.id },
          "nombre": obj.nombre,
          "funciones": { "detalle": detalles }
        }
      }
      arregloRoles.push(objeto)
    });

    const xmlBuilder = new xml2js.Builder({ rootName: 'Roles' });
    const xml = xmlBuilder.buildObject(arregloRoles);

    if (xml === undefined) {
      return;
    }

    const blob = new Blob([xml], { type: 'application/xml' });
    const xmlUrl = URL.createObjectURL(blob);

    // ABRIR UNA NUEVA PESTAÑA O VENTANA CON EL CONTENIDO XML
    const newTab = window.open(xmlUrl, '_blank');
    if (newTab) {
      newTab.opener = null; // EVITAR QUE LA NUEVA PESTAÑA TENGA ACCESO A LA VENTANA PADRE
      newTab.focus(); // DAR FOCO A LA NUEVA PESTAÑA
    } else {
      alert('No se pudo abrir una nueva pestaña. Asegúrese de permitir ventanas emergentes.');
    }

    const a = document.createElement('a');
    a.href = xmlUrl;
    a.download = 'Roles.xml';
    // SIMULAR UN CLIC EN EL ENLACE PARA INICIAR LA DESCARGA
    a.click();
  }

  /** ************************************************************************************************** **
   ** **                                     METODO PARA EXPORTAR A CSV                               ** **
   ** ************************************************************************************************** **/

  ExportToCVS() {
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.EstructurarDatosCSV());
    const csvDataH = xlsx.utils.sheet_to_csv(wse);
    const data: Blob = new Blob([csvDataH], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, "RolesCSV" + '.csv');
  }

  EstructurarDatosCSV() {
    let datos: any = [];
    let n: number = 1;
    this.data_general.forEach((obj: any) => {
      obj.funciones.forEach((det: any) => {
        datos.push({
          'n': n++,
          'rol': obj.nombre,
          'pagina': det.pagina,
          'funcion': det.accion,
          'modulo': det.nombre_modulo === 'permisos'
            ? 'Módulo de Permisos'
            : det.nombre_modulo === 'vacaciones'
              ? 'Módulo de Vacaciones'
              : det.nombre_modulo === 'horas_extras'
                ? 'Módulo de Horas Extras'
                : det.nombre_modulo === 'alimentacion'
                  ? 'Módulo de Alimentación'
                  : det.nombre_modulo === 'acciones_personal'
                    ? 'Módulo de Acciones de Personal'
                    : det.nombre_modulo === 'geolocalizacion'
                      ? 'Módulo de Geolocalización'
                      : det.nombre_modulo === 'timbre_virtual'
                        ? 'Módulo de Timbre Virtual'
                        : det.nombre_modulo === 'reloj_virtual'
                          ? 'Aplicación Móvil'
                          : det.nombre_modulo === 'aprobar'
                            ? 'Aprobaciones Solicitudes'
                            : det.nombre_modulo,
          'aplicacion_web': det.movil == false ? 'Sí' : '',
          'aplicacion_movil': det.movil == true ? 'Sí' : '',
        });
      });
    });
    return datos;
  }


}
