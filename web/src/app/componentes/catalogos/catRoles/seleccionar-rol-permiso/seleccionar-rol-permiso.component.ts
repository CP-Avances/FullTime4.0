import { Component, OnInit, ViewEncapsulation } from '@angular/core';
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
import { timeout } from 'rxjs';
import { number } from 'echarts';


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

  funcion = new FormControl('', Validators.required);
  link = new FormControl('', Validators.required);
  etiqueta = new FormControl('', Validators.required);

  public nuevoRolPermisoForm = new FormGroup({
    funcionForm: this.funcion,
    linkForm: this.link,
    etiquetaForm: this.etiqueta
  });

  // MENU PARA ROLES
  nombresMenu: any = [];

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

  idRol: string;
  idPermiso: string;
  guardarRol: any = [];
  guardarRoles: any = [];
  tableRoles: any = [];
  tablePermios: any = [];
  nombreRol: string;



  // ITEMS PAGINAS
  paginas: any = [];
  paginasEliminar: any = [];


  // ITEMS ACCIONES DE PAGINAS

  accionesPaginas: any = [];

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;

  pageSizeOptions = [5, 10, 20, 50];
  espera: boolean = false;

  constructor(
    public location: Location,
    public rest: RolPermisosService,
    private toastr: ToastrService,
    private rol: RolesService,
    private router: Router,

    public ventana: MatDialog,



    //this.nombresMenu.forEach()

    // this.nombresMenu.forEach(padre => {
    //this.itemsHijoPorPadre[padre.id] = [];
    // });





  ) {
    // codigo para obtner el id del rol seleccionado
    var url = this.location.prepareExternalUrl(this.location.path());
    this.idRol = url.split('/')[2];
    // codigo para obtener el nombre del rol
    this.rol.getOneRol(parseInt(this.idRol)).subscribe(data => {
      this.nombreRol = data[0].nombre.toUpperCase();
    })
  }

  ngOnInit(): void {
    this.limpliarCampos();
    this.obtenerPermisosRolUsuario();
    this.ObtenerNombreMenu();
    this.MostrarPaginasRol();

    this.nombresMenu.forEach((pagina: any) => {

      this.nombresAccionesPorPagina[pagina.id] = [];

    })


  }

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1
  }

  limpliarCampos() {
    this.nuevoRolPermisoForm.reset();
  }

  obtenerMensajeErrorFuncion() {
    if (this.funcion.hasError('required')) {
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
        id_rol: this.idRol,
        id_permiso: this.idPermiso
      };

      // insertar id del cg_roles y cg_rol_permiso a la tabla rol_perm_denegado
      this.rest.postPermisoDenegadoRest(dataPermisoDenegado).subscribe(respon => {
        this.obtenerPermisosRolUsuario();
      });
    });

    this.limpliarCampos();
  }

  obtenerPermisosRolUsuario() {
    this.guardarRoles = [];

    this.rest.getPermisosUsuarioRolRest(parseInt(this.idRol)).subscribe(res => {
      this.guardarRoles = res;
    }, error => {
      console.log(error);
    });
  }
  ///////////////////////////////////////////////   ROLES

  nombrePaginas: any = [];

  // METODO PARA BUSCAR LOS NOMBRES DEL MENU DEL SISTEMA 
  ObtenerNombreMenu() {
    this.nombresMenu = [];
    this.rest.getMenu().subscribe(res => {
      this.nombresMenu = res;
      this.nombrePaginas = res;

      console.log(res.toString)
    }, error => {
      console.log(error);
    });
  }




  // METODO PARA BUSCAR LAS ACCIONES DEL SISTEMA

  ObtenerAccionesPaginas() {
    this.nombresMenu = [];
    this.rest.getMenu().subscribe(res => {
      this.nombresMenu = res;
      this.nombrePaginas = res;

      console.log(res.toString)
    }, error => {
      console.log(error);
    });
  }





  //

  ///aqui todos los metodos


  paginasRol: any = [];

  habilitarprogress: boolean = false;


  // METODO PARA SELECCIONAR AGREGAR PAGINAS
  paginasSeleccionadas: any = [];
  // ARREGLO PARA ALMACENAR LAS ACCIONES SELECCIONADAS


  accionesSeleccionadas: any = [];

  AgregarPagina(data: string) {
    this.paginasSeleccionadas.push(data);
  }


  // metodo para llenar el arreglo de las acciones seleccionadas

  AgregarAccion(data: string) {
    this.accionesSeleccionadas.push(data);
  }




  // METODO PARA RETIRAR PAGINAS
  QuitarPagina(data: any) {
    this.paginasSeleccionadas = this.paginasSeleccionadas.filter(s => s !== data);
  }

  // METODO PARA RETIRAR ACCIONES

  QuitarAccion(data: any) {
    this.accionesSeleccionadas = this.accionesSeleccionadas.filter(s => s !== data);
  }


  AgregarTodos() {
    this.paginasSeleccionadas = this.nombrePaginas;
    for (var i = 0; i <= this.nombrePaginas.length - 1; i++) {
      (<HTMLInputElement>document.getElementById('paginasSeleccionadas' + i)).checked = true;
    }
  }


  AgregarTodosAcciones() {
    this.accionesSeleccionadas = this.nombrePaginas;
    for (var i = 0; i <= this.nombrePaginas.length - 1; i++) {
      (<HTMLInputElement>document.getElementById('paginasSeleccionadas' + i)).checked = true;
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

  // METODO PARA VERIFICAR SELECCION DE OPCION "Todas"
  isChecked: boolean = false;
  SeleccionarTodas(event: any) {
    console.log(event)

    if (event === true) {
      this.AgregarTodos();
    }
    else {
      this.QuitarTodos();
    }
  }



  // METODO PARA VERIFICAR SELECCION DE CIUDADES
  isChecked_: boolean = false;

  SeleccionarIndividual(event: any, valor: any) {
    const target = event.target as HTMLInputElement;
    if (target.checked === true) {
      this.AgregarPagina(valor);

      //aqui tengo que poner agrgar accion

      this.ObtenerAcciones(valor.id);
    }
    else {
      this.QuitarPagina(valor);

      console.log("valor de id ", valor.id);
      this.nombresAccionesPorPagina[valor.id] = [];



    }
  }




  // METODO PARA ASIGNAR PAGINAS A ESTE ROL

  contador: number = 0;
  ingresar: number = 0;


  //INSERTAR PAGINA
  InsertarPaginaRol() {
    this.ingresar = 0;
    this.contador = 0;
    // VALIDAR SI SE HA SELECCIONADO PAGINAS
    if (this.paginasSeleccionadas.length != 0) {
      this.habilitarprogress = true;
      // RECORRER LA LISTA DE CIUDADES SELECCIONADAS
      this.paginasSeleccionadas.map(obj => {
        var buscarPagina = {
          funcion: obj.nombre,
          id_rol: this.idRol
        };
        var rolPermisosbody = {

          funcion: obj.nombre,
          link: obj.link,
          id_rol: this.idRol,

          id_accion: this.idRol
        }

        // BUSCAR ID DE PAGINAS EXISTENTES

        this.paginasRol = [];
        this.rest.BuscarIdPaginas(buscarPagina).subscribe(datos => {
          this.contador = this.contador + 1;
          this.paginasRol = datos;
          this.habilitarprogress = false;
          //this.VerMensaje();
          this.toastr.info('Se indica que ' + obj.nombre + ' ya fue asignada a este Rol.', '', {
            timeOut: 7000,
          })
        }, error => {
          //this.habilitarprogress = false;
          this.rest.crearPaginaRol(rolPermisosbody).subscribe(response => {
            this.contador = this.contador + 1;
            this.ingresar = this.ingresar + 1;
            this.toastr.success('Operación exitosa.', 'Registro guardado.', {
              timeOut: 6000,
            });


            setTimeout(() => {
              window.location.reload();
            }, 2000);



            //this.VerMensaje();
          }, error => {
            this.contador = this.contador + 1;
            //this.VerMensaje();
            this.toastr.error('Ups!!! algo salio mal..', 'Ups!!! algo salio mal.', {
              timeOut: 6000,
            })
          });
        }
        );
      });
    }
    else {
      this.toastr.warning('No ha seleccionado PAGINAS.', 'Ups!!! algo salio mal.', {
        timeOut: 6000,
      })
    }
  }

  MostrarPaginasRol() {

    var buscarPagina = {
      id_rol: this.idRol
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

  HabilitarSeleccionCheck() {
    //this.auto_individual = false;
    this.activar_seleccion_ckeck = true;
  }

  auto_individual: boolean = true;
  activar_seleccion: boolean = true;
  seleccion_vacia: boolean = true;


  //CHECK PAGINAS - ACCIONES
  activar_seleccion_ckeck: boolean = false;
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

    this.paginasEliminar = this.selectionPaginas.selected;
    this.paginasEliminar.forEach((datos: any) => {
      console.log("Paginas eliminadas", this.paginasEliminar);
      console.log("Paginas eliminadas", datos.id_rol);
      console.log("Paginas eliminadas", datos.funcion);
      var buscarPagina = {
        funcion: datos.funcion,
        id_rol: datos.id_rol
      };
      this.rest.EliminarPaginasRol(buscarPagina).subscribe(

        res => {
          this.toastr.error('Registro eliminado.', '', {
            timeOut: 6000,
          });
        }
      )
    })
  }


  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
  ConfirmarDelete() {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {

          if (this.paginasEliminar.length != 0) {
            this.EliminarPaginaRol();




            setTimeout(() => {
              window.location.reload();
            }, 2000);


          } else {
            this.toastr.warning('No ha seleccionado PAGINAS.', 'Ups!!! algo salio mal.', {
              timeOut: 6000,
            })

          }
        } else {
          this.router.navigate(['/seleccionarPermisos', this.idRol]);
        }
      });
  }


  //FUNCION PARA BUSCAR LAS ACCIONES DE LAS PAGINAS 


  //guardar en n vector grande las acciones que stoy señallando con el checkbox


  nombresAccionesPorPagina: { [id_funcion: number]: any[] } = {};


  //this.nombresMenu.forEach()

  // this.nombresMenu.forEach(padre => {
  //this.itemsHijoPorPadre[padre.id] = [];
  // });

  ObtenerAcciones(id: any) {
    this.nombresAcciones = [];
    var buscarAcciones = {
      id_funcion: id
    };
    this.rest.BuscarAccionesPaginas(buscarAcciones).subscribe(res => {
      this.nombresAcciones = res;
      //console.log("acciones", this.nombresAcciones)
      this.nombresAccionesPorPagina[id] = [res];
      console.log("acciones", this.nombresAccionesPorPagina)
      console.log("acciones 2 ", this.nombresAcciones)

    }, error => {
      console.log(error);
    });

  }

}
