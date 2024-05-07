import { Component, OnInit, Input } from '@angular/core';
import { Location } from '@angular/common';
import { RolPermisosService } from 'src/app/servicios/catalogos/catRolPermisos/rol-permisos.service';
import { Validators, FormControl, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { RolesService } from '../../../../servicios/catalogos/catRoles/roles.service';
import { PageEvent } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { ITableFuncionesRoles } from 'src/app/model/reportes.model';
import { MatDialog } from '@angular/material/dialog';
import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';

import { MainNavService } from 'src/app/componentes/administracionGeneral/main-nav/main-nav.service';
import { VistaRolesComponent } from '../vista-roles/vista-roles.component';


interface Funciones {
  value: string;
}

interface Links {
  value: string;
  viewValue: string;
}

interface Etiquetas {
  value: string;
}

@Component({
  selector: 'app-seleccionar-rol-permiso',
  templateUrl: './seleccionar-rol-permiso.component.html',
  styleUrls: ['./seleccionar-rol-permiso.component.css'],
  //encapsulation: ViewEncapsulation.None,
})

export class SeleccionarRolPermisoComponent implements OnInit {

  @Input() id_rol: number;

  // BUSQUEDA DE FUNCIONES ACTIVAS
  get geolocalizacion(): boolean { return this.varificarFunciones.geolocalizacion; }
  get alimentacion(): boolean { return this.varificarFunciones.alimentacion; }
  get horas_extras(): boolean { return this.varificarFunciones.horasExtras; }
  get timbre_virtual(): boolean { return this.varificarFunciones.timbre_web; }
  get vacaciones(): boolean { return this.varificarFunciones.vacaciones; }
  get permisos(): boolean { return this.varificarFunciones.permisos; }
  get acciones_personal(): boolean { return this.varificarFunciones.accionesPersonal; }
  get reloj_virtual(): boolean { return this.varificarFunciones.app_movil; }

  funcion = new FormControl('', [Validators.minLength(2)]);




  //funcionesActivas : any = [this.geolocalizacion];

  diccionarioFuncionesActivas: { [id_funcion: string]: boolean } = {
    "permisos": this.permisos,
    "geolocalizacion": this.geolocalizacion,
    "alimentacion": this.alimentacion,
    "horas_extras": this.horas_extras,
    "timbre_virtual": this.timbre_virtual,
    "vacaciones": this.vacaciones,
    "acciones_personal": this.acciones_personal,
    "reloj_virtual": this.reloj_virtual,

    // Otros valores...
  };


  //filtros
  filtrofuncion: '';


  funcion1 = new FormControl('', Validators.required);
  link = new FormControl('', Validators.required);
  etiqueta = new FormControl('', Validators.required);

  public nuevoRolPermisoForm = new FormGroup({
    funcionForm: this.funcion1,
    linkForm: this.link,
    etiquetaForm: this.etiqueta
  });




  public nuevoRolPermisoForm1 = new FormGroup({
    funcionForm: this.funcion1,
    linkForm: this.link,
    etiquetaForm: this.etiqueta
  });

  // MENU PARA PAGINAS
  nombresMenu: any = [];

  //MENU PARA PAGINAS MODULOS


  //MENU PAREA ACCIONES

  nombresAcciones: any = [];



  funciones: Funciones[] = [
    { value: 'Ver' },
    { value: 'Crear' },
    { value: 'Editar' },
    { value: 'Eliminar' }
  ];

  links: Links[] = [
    { value: '/home', viewValue: 'Home' },
    { value: '/horasExtras', viewValue: 'Horas Extras' },
    { value: '/notificaciones', viewValue: 'Notificaciones' },
    { value: '/tipoPermisos', viewValue: 'Tipo Permisos' },
    { value: '/empleado', viewValue: 'Empleado' },
    { value: '/departamento', viewValue: 'Departamento' },
  ];

  etiquetas: Etiquetas[] = [
    { value: 'para visualizar información' },
    { value: 'para crear nuevos registros' },
    { value: 'para editar información' },
    { value: 'para eliminar información' }
  ];


  idPermiso: string;
  guardarRol: any = [];
  guardarRoles: any = [];
  tableRoles: any = [];
  tablePermios: any = [];
  nombreRol: string;



  // ITEMS PAGINAS
  paginasEliminar: any = [];
  paginas: any = [];


  // ITEMS ACCIONES DE PAGINAS

  accionesPaginas: any = [];

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;

  pageSizeOptions = [5, 10, 20, 50];
  espera: boolean = false;

  constructor(
    private varificarFunciones: MainNavService,

    public location: Location,
    public rest: RolPermisosService,
    private toastr: ToastrService,
    private rol: RolesService,
    private router: Router,
    private validar: ValidacionesService,

    public ventana: MatDialog,
    public componenter: VistaRolesComponent,



    //this.nombresMenu.forEach()

    // this.nombresMenu.forEach(padre => {
    //this.itemsHijoPorPadre[padre.id] = [];
    // });





  ) {


  }

  ngOnInit(): void {
    console.log('id rol ---', this.id_rol)
    this.rol.getOneRol(this.id_rol).subscribe(data => {
      this.nombreRol = data[0].nombre.toUpperCase();
    })

    this.limpliarCampos();
    // this.obtenerPermisosRolUsuario();
    this.ObtenerMenu();

    //console.log("todas las paginas", this.nombresMenu);

    this.MostrarPaginasRol();

    this.nombresMenu.forEach((pagina: any) => {

      this.nombresAccionesPorPagina[pagina.id] = [[]];

      this.accionesSeleccionadasPorPagina[pagina.id] = [];

    })


    this.ObtenerTodasAcciones();




    console.log("todas las acciones", this.todasAcciones);

    this.ObtenerMenuModulos()


    this.nombreModulos.map(x => {

      this.paginasSeleccionadasModulos[x] = []
    })


    this.ObtenerTodasPaginasAcciones();
    this.ObtenerModulos();
    this.ObtenerTodasModulosAcciones();


  }

  // METODO PARA VER LISTA DE ROLES DEL SISTEMA
  VerRoles() {
    this.componenter.ver_funciones = false;
    this.componenter.ver_roles = true;
  }

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1
  }

  limpliarCampos() {
    this.nuevoRolPermisoForm.reset();
  }

  obtenerMensajeErrorFuncion() {
    if (this.funcion1.hasError('required')) {
      return 'Debe ingresar alguna Función';
    }
  }

  obtenerMensajeErrorLink() {
    if (this.link.hasError('required')) {
      return 'Debe ingresar alguna Url ';
    }
  }

  obtenerMensajeErrorEtiqueta() {
    if (this.etiqueta.hasError('required')) {
      return 'Debe ingresar alguna etiqueta';
    }
  }

  insertarRolPermiso(form) {
    let dataRol = {
      funcion: form.funcionForm,
      link: form.linkForm,
      etiqueta: form.etiquetaForm + ' ' + form.linkForm
    }

    this.rest.postRolPermisoRest(dataRol).subscribe(res => {

      this.toastr.success('Operacion exitosa.', 'Rol Permiso guardado', {
        timeOut: 6000,
      });

      // sacar id de la tabla rol permiso
      this.guardarRol = res;
      this.idPermiso = this.guardarRol.id;

      let dataPermisoDenegado = {
        id_rol: this.id_rol,
        id_permiso: this.idPermiso
      };

      /* // insertar id del cg_roles y cg_rol_permiso a la tabla rol_perm_denegado
       this.rest.postPermisoDenegadoRest(dataPermisoDenegado).subscribe(respon => {
         this.obtenerPermisosRolUsuario();
       });
       */
    });

    this.limpliarCampos();
  }

  obtenerPermisosRolUsuario() {
    this.guardarRoles = [];

    this.rest.getPermisosUsuarioRolRest(this.id_rol).subscribe(res => {
      this.guardarRoles = res;
    }, error => {
      console.log(error);
    });
  }
  ///////////////////////////////////////////////   ROLES
  // AQUI TODOS LOS METODOS

  nombrePaginas: any = [];
  nombreModulosAsignados: any = [];

  // METODO PARA BUSCAR LOS NOMBRES DEL MENU DEL SISTEMA 
  ObtenerMenu() {
    this.nombresMenu = [];
    this.rest.getMenu().subscribe(res => {
      this.nombresMenu = res;
      this.nombrePaginas = res;

      console.log("MENU paginas", res)
    }, error => {
      console.log(error);
    });
  }

  ObtenerModulos() {
    //this.nombresMenu = [];
    this.rest.getModulos().subscribe(res => {
      //this.nombresMenu = res;
      this.nombreModulosAsignados = res;

      console.log("MENU modulos", res)
    }, error => {
      console.log(error);
    });
  }



  // METODO PARA BUSCAR LOS NOMBRES DEL MENU QUE SON MODULOS



  paginasModulos: { [modulos: string]: any } = {};

  accionesSeleccionadasPorPagina: { [id_funcion: number]: any } = {};




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

  ObtenerMenuModulos() {
    this.nombreModulos.map(nombre => {
      var nombre_modulo = {
        nombre_modulo: nombre
      }
      this.rest.getMenuModulos(nombre_modulo).subscribe(res => {
        this.paginasModulos[nombre] = res;
      }, error => {
        console.log(error);
      })
    }
    )

    console.log("paginas con modulos", this.paginasModulos)
  }



  // METODO PARA BUSCAR LAS ACCIONES DEL SISTEMA




  paginasRol: any = [];

  habilitarprogress: boolean = false;


  // METODO PARA SELECCIONAR AGREGAR PAGINAS
  paginasSeleccionadas: any = [];


  //METODOP PARA SELÑECCIONAR AGREGAR PAGINAS MODULOS 



  paginasSeleccionadasModulos: { [modulos: string]: any } = {};

  paginasSeleccionadasM: any = [];




  // ARREGLO PARA ALMACENAR LAS ACCIONES SELECCIONADAS
  AgregarPagina(data: any) {


    if (this.paginasSeleccionadas.some(subArreglo => JSON.stringify(subArreglo) === JSON.stringify(data))) {
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



    if (this.paginasSeleccionadasM.some(subArreglo => JSON.stringify(subArreglo) === JSON.stringify(data))) {
    } else {
      this.paginasSeleccionadasM.push(data);

    }

    this.accionesSeleccionadasPorPagina[data.id] = [];

  }




  // metodo para llenar el arreglo de las acciones seleccionadas
  accionesSeleccionadas: any = [];

  AgregarAccion(id: any, data: any) {



    if (!this.accionesSeleccionadasPorPagina[id]) {

      this.accionesSeleccionadasPorPagina[id] = [];
      this.accionesSeleccionadasPorPagina[id].push(data);
      // nuevo  17/04
    } else {

      this.accionesSeleccionadasPorPagina[id].push(data);
    }

  }


  // METODO PARA RETIRAR PAGINAS

  QuitarPagina(data: any) {
    this.paginasSeleccionadas = this.paginasSeleccionadas.filter(subArreglo => JSON.stringify(subArreglo) !== JSON.stringify(data));



    (<HTMLInputElement>document.getElementById('seleccionar')).checked = false;

  }


  QuitarPaginaModulo(data: string, modulo: string) {
    this.paginasSeleccionadasModulos[modulo] = this.paginasSeleccionadasModulos[modulo].filter(s => s !== data);
    console.log("modulos", this.paginasSeleccionadasModulos)

    this.paginasSeleccionadasM = this.paginasSeleccionadasM.filter(subArreglo => JSON.stringify(subArreglo) !== JSON.stringify(data));

    (<HTMLInputElement>document.getElementById('seleccionarmodulo' + modulo)).checked = false;

  }




  // METODO PARA RETIRAR ACCIONES

  QuitarAccion(id: any, data: any) {


    this.accionesSeleccionadasPorPagina[id] = this.accionesSeleccionadasPorPagina[id].filter(s => s !== data);



    //nuevo codigo 17/04
    (<HTMLInputElement>document.getElementById('seleccionarAccion' + id)).checked = false;

  }


  AgregarTodos() {
    //this.paginasSeleccionadas = this.nombrePaginas;



    this.nombrePaginas.map(x => {
      if (this.paginasSeleccionadas.includes(x)) {
      } else {
        this.paginasSeleccionadas.push(x)

      }


    }
    )

    for (var i = 0; i <= this.nombrePaginas.length - 1; i++) {
      (<HTMLInputElement>document.getElementById('paginasSeleccionadas' + i)).checked = true;
    }

    this.paginasSeleccionadas.map(pagina => {
      this.ObtenerAcciones(pagina.id);
      this.accionesSeleccionadasPorPagina[pagina.id] = [];
    })
  }





  // con nombre del modulo
  AgregarTodosModulos(modulo: string) {

    this.paginasSeleccionadasModulos[modulo] = this.paginasModulos[modulo];


    this.paginasModulos[modulo].map(x => {

      this.paginasSeleccionadasM.push(x);

    })


    for (var i = 0; i <= this.paginasModulos[modulo].length - 1; i++) {
      //console.log("para saber si funciona", modulo + 'paginasSeleccionadasModulos');
      (<HTMLInputElement>document.getElementById('paginasSeleccionadasModulos' + i + modulo)).checked = true;
    }

    this.paginasSeleccionadasModulos[modulo].map(pagina => {
      this.ObtenerAcciones(pagina.id);
      this.accionesSeleccionadasPorPagina[pagina.id] = [];

    })


    //console.log("modulos", this.paginasSeleccionadasModulos)
  }



  AgregarTodosAcciones(id: any) {
    this.nombresAccionesPorPagina[id].map(x => {
      this.accionesSeleccionadasPorPagina[id] = x;

    })

    for (var i = 0; i <= this.accionesSeleccionadasPorPagina[id].length - 1; i++) {
      (<HTMLInputElement>document.getElementById(id + 'accionesSeleccionadasPorPagina' + i)).checked = true;
    }

  }



  limpiarData: any = [];
  QuitarTodos() {
    this.limpiarData = this.nombrePaginas;
    for (var i = 0; i <= this.limpiarData.length - 1; i++) {
      (<HTMLInputElement>document.getElementById('paginasSeleccionadas' + i)).checked = false;
      this.paginasSeleccionadas = this.paginasSeleccionadas.filter(s => s !== this.nombrePaginas[i]);
    }
  }






  limpiarDataModulos: any = [];
  QuitarTodosModulos(modulo: string) {
    this.limpiarDataModulos = this.paginasModulos[modulo];
    for (var i = 0; i <= this.limpiarDataModulos.length - 1; i++) {
      (<HTMLInputElement>document.getElementById('paginasSeleccionadasModulos' + i + modulo)).checked = false;
      this.paginasSeleccionadasModulos[modulo] = this.paginasSeleccionadasModulos[modulo].filter(s => s !== this.paginasModulos[modulo][i]);


      this.paginasSeleccionadasM = this.paginasSeleccionadasM.filter(s => s !== this.paginasModulos[modulo][i]);

      //this.paginasSeleccionadasM=[];


    }



    // console.log("modulos", this.paginasSeleccionadasModulos)

  }


  limpiarDataAcciones: any = [];
  QuitarTodosAccion(id: any) {
    this.limpiarDataAcciones = this.nombresAccionesPorPagina[id][0];
    for (var i = 0; i <= this.limpiarDataAcciones.length - 1; i++) {
      (<HTMLInputElement>document.getElementById(id + 'accionesSeleccionadasPorPagina' + i)).checked = false;
      //this.accionesSeleccionadasPorPagina[id] = this.accionesSeleccionadasPorPagina[id].filter(s => s !== this.nombresAccionesPorPagina[id][0]);
      this.accionesSeleccionadasPorPagina[id] = [];
    }
  }


  // METODO PARA VERIFICAR SELECCION DE OPCION "Todas"
  isChecked: boolean = false;
  SeleccionarTodas(event: any) {
    console.log(event)

    if (event === true) {
      this.AgregarTodos();



    }
    else {
      this.QuitarTodos();
      this.nombresAccionesPorPagina = {};

    }
    console.log("paginas seleccionado", this.paginasSeleccionadas);


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

    console.log("modulos seleccionado", this.paginasSeleccionadasM);

  }




  // METODO PARA VERIFICAR SELECCION DE OPCION "Todas"
  isCheckedAccion: boolean = false;
  SeleccionarTodasAcciones(event: any, id: any) {


    const target = event.target as HTMLInputElement;
    console.log(target.checked)


    if (target.checked === true) {
      this.AgregarTodosAcciones(id);

      // delete this.nombresAccionesPorPagina[id][0];
      ///target.checked == true;
    }
    else {
      this.QuitarTodosAccion(id);
      //this.nombresAccionesPorPagina[id]= this.accionesSeleccionadasPorPagina[id];

    }

    console.log("accionas al oprimir TODAS", this.accionesSeleccionadasPorPagina)

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
    console.log("pagina seleccionado", this.paginasSeleccionadas);

  }


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

      console.log("valor de id ", valor.id);
      this.nombresAccionesPorPagina[valor.id] = [];
    }
    console.log("modulos seleccionado", this.paginasSeleccionadasM);


  }






  isCheckedAccion_: boolean = false;

  SeleccionarIndividualAccion(event: any, id: any, valor: any) {
    const target = event.target as HTMLInputElement;
    if (target.checked === true) {
      this.AgregarAccion(id, valor);
      console.log("accion seleccionada", this.accionesSeleccionadasPorPagina);

      if (this.accionesSeleccionadasPorPagina[id].length == this.nombresAccionesPorPagina[id][0].length) {
        (<HTMLInputElement>document.getElementById('seleccionarAccion' + id)).checked = true;
      }
    }
    else {
      this.QuitarAccion(id, valor);
      console.log("accion seleccionada", this.accionesSeleccionadasPorPagina);
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
      this.paginasSeleccionadas.map(obj => {

        if (this.ObtenerTodasPaginasAcciones()[obj.id].length != 0) {

          if (this.accionesSeleccionadasPorPagina[obj.id].length > 0) {
            this.accionesSeleccionadasPorPagina[obj.id].map(accion => {
              var buscarPagina = {
                funcion: obj.nombre,
                id_rol: this.id_rol,
                id_accion: accion.id
              };

              // BUSCAR ID DE PAGINAS EXISTENTES
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
                    id_accion: accion.id
                  }
                  this.contador = this.contador + 1;

                  this.rest.crearPaginaRol(rolPermisosbody).subscribe(response => {
                    ///this.ingresar = this.ingresar + 1;

                    if (!this.ingresar) {
                      // this.contador = this.contador + 1;

                      this.toastr.success('Operación exitosa.', 'Se ha guardado ' + this.contador + ' registros.', {
                        timeOut: 6000,
                      })

                      this.ingresar = true;

                    }



                    this.rest.BuscarPaginasRol(rol).subscribe(datos => {
                      this.paginas = datos;
                    })

                  }, error => {
                    this.contador = this.contador + 1;
                    this.toastr.error('Ups!!! algo salio mal..', 'Ups!!! algo salio mal.', {
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
            id_accion: null
          }
          this.rest.BuscarIdPaginas(buscarPagina).subscribe(datos => {
            this.contador = this.contador + 1;
            this.habilitarprogress = false;

            this.toastr.info('Se indica que ' + obj.nombre + ' ya fue asignada a este Rol.', '', {
              timeOut: 7000,
            })


          }, error => {
            this.contador = this.contador + 1;

            this.rest.crearPaginaRol(rolPermisosbody).subscribe(response => {
              ///this.ingresar = this.ingresar + 1;

              if (!this.ingresar) {
                // this.contador = this.contador + 1;

                this.toastr.success('Operación exitosa.', 'Se ha guardado ' + this.contador + ' registros.', {
                  timeOut: 6000,
                })

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
        id_rol: this.id_rol
      };



    }
    else {
      this.toastr.warning('No ha seleccionado PAGINAS.', 'Ups!!! algo salio mal.', {
        timeOut: 6000,
      })
    }
  }








  //INSERTAR PAGINA
  InsertarPaginaModulosRol() {
    this.ingresar = false;
    this.contador = 0;


    // VALIDAR SI SE HA SELECCIONADO PAGINAS
    if (this.paginasSeleccionadasM.length != 0) {


      this.habilitarprogress = true;
      // RECORRER LA LISTA DE PAGINS-MODULOS SELECCIONADAS
      this.paginasSeleccionadasM.map(obj => {


        if ((this.ObtenerTodasModulosAcciones()[obj.id]).length != 0) {
          // en el caso de que existan acciones en esta pagina
          //this.accionesSeleccionadasPorPagina[obj.id]=[];

          if (this.accionesSeleccionadasPorPagina[obj.id].length > 0) {

            this.accionesSeleccionadasPorPagina[obj.id].map(accion => {

              var buscarPagina = {
                funcion: obj.nombre,
                id_rol: this.id_rol,
                id_accion: accion.id
              };

              // BUSCAR ID DE PAGINAS EXISTENTES
              this.paginasRol = [];

              this.rest.BuscarIdPaginasConAcciones(buscarPagina).subscribe(
                datos => {
                  this.contador = this.contador + 1;
                  this.paginasRol = datos;
                  this.habilitarprogress = false;


                  this.toastr.info('Se indica que ' + obj.nombre + 'con accion ' + this.MetodoParaMostrarAccion(accion.id) + ' ya fue asignada a este Rol.', '', {
                    timeOut: 7000,
                  })
                }, error => {

                  var rolPermisosbody = {
                    funcion: obj.nombre,
                    link: obj.link,
                    id_rol: this.id_rol,
                    id_accion: accion.id
                  }

                  this.contador = this.contador + 1;

                  this.rest.crearPaginaRol(rolPermisosbody).subscribe(response => {
                    ///this.ingresar = this.ingresar + 1;

                    if (!this.ingresar) {
                      // this.contador = this.contador + 1;

                      this.toastr.success('Operación exitosa.', 'Se ha guardado ' + this.contador + ' registros.', {
                        timeOut: 6000,
                      })

                      this.ingresar = true;

                    }

                    this.rest.BuscarPaginasRol(rol).subscribe(datos => {
                      this.paginas = datos;
                    })



                  }, error => {

                    this.contador = this.contador + 1;
                    this.toastr.error('Ups!!! algo salio mal..', 'Ups!!! algo salio mal.', {
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

          // si no exiten accionen seleccionadas

          var buscarPagina = {
            funcion: obj.nombre,
            id_rol: this.id_rol
          };

          var rolPermisosbody = {
            funcion: obj.nombre,
            link: obj.link,
            id_rol: this.id_rol,
            id_accion: null
          }

          this.rest.BuscarIdPaginas(buscarPagina).subscribe(datos => {
            this.contador = this.contador + 1;
            this.habilitarprogress = false;


            this.toastr.info('Se indica que ' + obj.nombre + ' ya fue asignada a este Rol.', '', {
              timeOut: 7000,
            })





          }, error => {
            this.contador = this.contador + 1;

            this.rest.crearPaginaRol(rolPermisosbody).subscribe(response => {
              ///this.ingresar = this.ingresar + 1;

              if (!this.ingresar) {
                // this.contador = this.contador + 1;

                this.toastr.success('Operación exitosa.', 'Se ha guardado ' + this.contador + ' registros.', {
                  timeOut: 6000,
                })

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
        id_rol: this.id_rol
      }

    } else {
      this.toastr.warning('No ha seleccionado PAGINAS.', 'Ups!!! algo salio mal.', {
        timeOut: 6000,
      })


    }


  }






  MostrarPaginasRol() {

    this.paginas = [];
    var buscarPagina = {
      id_rol: this.id_rol
    };
    this.rest.BuscarPaginasRol(buscarPagina).subscribe(datos => {
      this.paginas = datos;
    })
  }






  // METODO PARA ACTIVAR SELECCION MULTIPLE
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


  //CHECK PAGINAS - ACCIONES
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
    //console.log('paginas para Eliminar',this.paginasEliminar);

    //console.log(this.selectionPaginas.selected)
    return `${this.selectionPaginas.isSelected(row) ? 'deselect' : 'select'} row ${row.funcion + 1}`;

  }

  // ELIMINAR PAGINAS DE ROL SELECCIONADAS


  EliminarPaginaRol() {

    this.ingresar = false;
    this.contador = 0;


    this.paginasEliminar = this.selectionPaginas.selected;
    this.paginasEliminar.forEach((datos: any) => {

      this.paginas = this.paginas.filter(item => item.id !== datos.id);

      var buscarPagina = {
        id: datos.id

      };

      this.contador = this.contador + 1;
      this.rest.EliminarPaginasRol(buscarPagina).subscribe(
        res => {

          if (res.message === 'error') {

            this.toastr.error('No se puede elminar.', 'la: ' + datos.nombre, {
              timeOut: 6000,
            });

          } else {
            if (!this.ingresar) {

              this.toastr.error('Se ha Eliminado ' + this.contador + ' registros.', '', {
                timeOut: 6000,
              });
              this.ingresar = true;


              //this.MostrarPaginasRol();
            }

            this.MostrarPaginasRol();
          }
        }
      )
    }
    )


    // this.MostrarPaginasRol();

    console.log("Paginas eliminadas", this.paginasEliminar);

    //this.selectionPaginas.clear();

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
            this.toastr.warning('No ha seleccionado PAGINAS.', 'Ups!!! algo salio mal.', {
              timeOut: 6000,
            })

          }


        }
      });

    // this.MostrarPaginasRol();

  }


  //FUNCION PARA BUSCAR LAS ACCIONES DE LAS PAGINAS 


  //guardar en n vector grande las acciones que stoy señallando con el checkbox


  nombresAccionesPorPagina: { [id_funcion: number]: any[] } = {};
  todasPaginasAcciones: { [id_funcion: number]: any } = {};

  todosModulosAcciones: { [id_funcion: number]: any } = {};


  ObtenerTodasPaginasAcciones(): any {


    this.rest.getMenu().subscribe(res => {

      this.nombrePaginas = res;

      this.nombrePaginas.map(pagina => {

        var buscarAcciones = {
          id_funcion: pagina.id
        };
        this.rest.BuscarAccionesPaginas(buscarAcciones).subscribe(res => {
          this.todasPaginasAcciones[pagina.id] = res
        })
      })
    }
    )

    return this.todasPaginasAcciones;
  }

  ObtenerTodasModulosAcciones(): any {

    //this.todosModulosAcciones= [];
    this.rest.getModulos().subscribe(res => {

      this.nombreModulosAsignados = res;

      this.nombreModulosAsignados.map(pagina => {

        var buscarAcciones = {
          id_funcion: pagina.id
        };

        this.rest.BuscarAccionesPaginas(buscarAcciones).subscribe(res => {
          this.todosModulosAcciones[pagina.id] = res

        })
      })
    }
    )

    return this.todosModulosAcciones;
  }


  ObtenerAcciones(id: any) {
    this.nombresAcciones = [];
    var buscarAcciones = {
      id_funcion: id
    };
    this.rest.BuscarAccionesExistentesPaginas(buscarAcciones).subscribe(res => {
      this.nombresAcciones = res;


      // ojeto para almacenar todsa las acciones que tiene cada pagina
      this.nombresAccionesPorPagina[id] = [res];


      //console.log("existen estas acciones en estas paginas", this.nombresAccionesPorPagina)

    }, error => {
      console.log(error);
    });

  }


  // OBTENER ACCION POR ID

  ObtenerAccionPorId(id: any): Observable<any> {
    var buscarAcciones = {
      id: id
    };

    // Retorna el observable y utiliza el operador 'map' para transformar los datos emitidos
    return this.rest.BuscarAccionesPorId(buscarAcciones).pipe(
      map((accion: any) => {
        accion.accion

        console.log("quiero ver que muestra", accion);
      }) // Cambia 'nombre' por el nombre de la propiedad que contiene el valor de la acción
    );


  }

  todasAcciones: { [id_funcion: number]: any } = {};

  acciones: any = [];

  ObtenerTodasAcciones() {
    this.acciones = [];
    this.rest.ObtenerAcciones().subscribe(res => {
      this.acciones = res;

      console.log("ACCIONES", res)

      this.acciones.map(x => {
        this.todasAcciones[x.id] = x;

      })
      console.log(" Objeto de acciones", this.todasAcciones);
    }, error => {
      console.log(error);
    });
  }

  MetodoParaMostrarAccion(id: any): any {

    if (id != null) {
      return this.todasAcciones[id].accion;
    } else {
      return null;
    }
  }


  // METODO PARA VALIDAR INGRESO DE LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }



  // METODOS PARA MOSTRAR SOLO LAS PAGINAS QUE SON MODULO






}
