import { Observable, map, startWith } from 'rxjs';
import { Component, OnInit, Input } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { SucursalService } from 'src/app/servicios/sucursales/sucursal.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';

import { ITableEmpleados } from 'src/app/model/reportes.model';

import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';
import { PrincipalSucursalUsuarioComponent } from '../principal-sucursal-usuario/principal-sucursal-usuario.component';
import { use } from 'echarts';

@Component({
  selector: 'app-asignar-usuario',
  templateUrl: './asignar-usuario.component.html',
  styleUrls: ['./asignar-usuario.component.css']
})

export class AsignarUsuarioComponent implements OnInit {

  @Input() pagina_: string;
  @Input() data: any;

  idEmpleado: number;
  name_sucursal: string = '';

  // ITEMS DE PAGINACION DE LA TABLA PRINCIPAL
  numero_pagina_p: number = 1;
  tamanio_pagina_p: number = 5;
  pageSizeOptions_p = [5, 10, 20, 50];

  // ITEMS DE PAGINACION DE LA TABLA ASIGNADOS
  numero_pagina_a: number = 1;
  tamanio_pagina_a: number = 5;
  pageSizeOptions_a = [5, 10, 20, 50];

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    public ventanasu: PrincipalSucursalUsuarioComponent,
    public sucursal: SucursalService,
    public ventana: MatDialog,
    public general: DatosGeneralesService,
    public toastr: ToastrService,
    public usuario: UsuarioService,

  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

    this.name_sucursal = this.data.nombre.toUpperCase();
    this.BuscarAdministradoresJefes();
    this.ObtenerSucursales();
  }

  // METODO PARA VER PANTALLA PRINCIPAL SUCURSAL USUARIO
  pagina: string = '';
  VerUsuarioAsignado() {
    this.pagina = 'asignar-usuario';
    this.ventanasu.ver_principal = true;
    this.ventanasu.ver_informacion = false;
  }

  // METODO PARA MANEJAR LA PAGINACION
  ManejarPaginaPrincipal(e: PageEvent) {
    this.tamanio_pagina_p = e.pageSize;
    this.numero_pagina_p = e.pageIndex + 1;
  }

  // METODO PARA MANEJAR LA PAGINACION
  ManejarPaginaAsignados(e: PageEvent) {
    this.tamanio_pagina_a = e.pageSize;
    this.numero_pagina_a = e.pageIndex + 1;
  }

  // METODO PARA BUSCAR DATOS DE USUARIOS ADMINISTRADORES Y JEFES
  principales: any = [];
  asignados: any = [];
  usuarios: any = [];
  ver_principal: boolean = false;
  ver_asignados: boolean = false;
  BuscarAdministradoresJefes() {
    let data = {
      lista_sucursales: '\'' + this.data.id + '\'',
      estado: 1
    }
    //console.log('ver datos ', data)
    this.usuarios = [];
    this.asignados = [];
    this.principales = [];
    this.general.ObtenerAdminJefes(data).subscribe(res => {
      this.usuarios = res;
      if (this.usuarios.length != 0) {
        this.usuarios.forEach(elemento => {
          if (elemento.principal !== false) {
            this.principales.push(elemento);
          }
          else {
            this.asignados.push(elemento);
          }
        });
      }
      // METODO PARA VER TABLAS DE USUARIOS
      if (this.principales.length != 0) {
        this.ver_principal = true;
      }
      else {
        this.ver_principal = false;
      }

      if (this.asignados.length != 0) {
        this.ver_asignados = true;
      }
      else {
        this.ver_asignados = false;
      }
      //console.log('ver sucursal ', this.usuarios)
    });

  }


  /** ********************************************************************************************************* **
   ** **                        METODO PARA VER ADMINISTRADORES Y JEFES DE OTRAS SUCURSALES                   ** **
   ** ********************************************************************************************************* **/

  sucursalForm = new FormControl('', Validators.required);
  filteredOptions: Observable<any[]>;

  sucursales: any = [];
  // METODO DE FILTRACION DE DATOS DE SUCURSALES
  private _filter(value: string): any {
    if (value != null) {
      const filterValue = value.toLowerCase();
      return this.sucursales.filter(sucursal => sucursal.nombre.toLowerCase().includes(filterValue));
    }
  }

  // METODO PARA BUSCAR SUCURSALES
  ObtenerSucursales() {
    this.sucursal.BuscarSucursal().subscribe(res => {
      this.sucursales = res;
      // OMITIR SUCURSAL SELECCIONADA
      this.sucursales = this.sucursales.filter(elemento => elemento.id !== this.data.id);
      // APLICACION DE BUSQUEDA CON FILTROS
      this.filteredOptions = this.sucursalForm.valueChanges
        .pipe(
          startWith(''),
          map((value: any) => this._filter(value))
        );
    });
  }

  // VARIABLES DE ACTIVACION DE FUNCIONES
  ver_seleccion: boolean = false;
  administradores: any = [];
  ver_administradores: boolean = false;

  // METODO PARA LISTAR USUARIOS
  adminSeleccionados: any = [];
  ObtenerUsuarios() {
    this.ver_seleccion = true;
    //console.log('ver datos ', this.sucursalForm.value)
    // RETORNAR DATOS DE SUCURSAL SELECCIONADA
    const [elemento] = this.sucursales.filter(o => {
      return o.nombre === this.sucursalForm.value
    })
    //console.log('ver elementos ', elemento)
    this.administradores = [];
    let data = {
      lista_sucursales: '\'' + elemento.id + '\'',
      estado: 1
    }
    this.general.ObtenerAdminJefes(data).subscribe(datos => {
      let respuesta: any = [];
      respuesta = datos;
      respuesta.forEach(obj => {
        if (obj.jefe === false) {
          this.administradores.push(obj);
        }
      })
      this.ver_administradores = true;
      this.ver_guardar = false;
      if (this.administradores.length != 0) {
        (<HTMLInputElement>document.getElementById('seleccionar')).checked = false;
      }

    }, error => {
      this.toastr.info('No se han encontrado registros.', '', {
        timeOut: 6000,
      });
      this.ver_seleccion = false
    })
  }

  // METODO PARA SELECCIONAR AGREGAR CIUDADES
  AgregarCiudad(data: string) {
    this.adminSeleccionados.push(data);
  }

  // METODO PARA RETIRAR CIUDADES
  QuitarCiudad(data: any) {
    this.adminSeleccionados = this.adminSeleccionados.filter(s => s !== data);
  }

  // AGREGAR DATOS MULTIPLES DE CIUDADES DE LA PROVINCIA INDICADA
  AgregarTodos() {
    this.adminSeleccionados = this.administradores;
    for (var i = 0; i <= this.administradores.length - 1; i++) {
      (<HTMLInputElement>document.getElementById('adminSeleccionados' + i)).checked = true;
    }
  }

  // QUITAR TODOS LOS DATOS SELECCIONADOS DE LA PROVINCIA INDICADA
  limpiarData: any = [];
  QuitarTodos() {
    this.limpiarData = this.administradores;
    for (var i = 0; i <= this.limpiarData.length - 1; i++) {
      (<HTMLInputElement>document.getElementById('adminSeleccionados' + i)).checked = false;
      this.adminSeleccionados = this.adminSeleccionados.filter(s => s !== this.administradores[i]);
    }
  }

  // METODO PARA VERIFICAR SELECCION DE OPCION "Todas"
  isChecked: boolean = false;
  SeleccionarTodas(event: any) {
    if (event === true) {
      this.AgregarTodos();
    }
    else {
      this.QuitarTodos();
    }
  }

  // METODO PARA VERIFICAR SELECCION DE CIUDADES
  SeleccionarIndividual(event: any, valor: any) {
    const target = event.target as HTMLInputElement;
    if (target.checked === true) {
      this.AgregarCiudad(valor);
    }
    else {
      this.QuitarCiudad(valor);
    }
  }

  // METODO PARA RETIRAR DE LISTA DE SELECCIONADOS
  RetirarLista(seleccionado: any) {
    this.adminSeleccionados = this.adminSeleccionados.filter(elemento => elemento.id !== seleccionado);
    //console.log('ver seleccionados ', this.adminSeleccionados)
  }

  // METODO PARA VERIFICAR QUE NO SE ENCUENTREN DATOS DUPLICADOS
  VerificarDatos() {
    // FILTRA LOS ARRAYS PARA ELIMINAR OBJETOS DUPLICADOS
    let verificados = this.adminSeleccionados.filter((objeto, indice, valor) => {
      // COMPARA EL OBJETO ACTUAL CON LOS OBJETOS ANTERIORES EN EL ARRAY
      for (let i = 0; i < indice; i++) {
        if (valor[i].id === objeto.id) {
          return false; // SI ES UN DUPLICADO, RETORNA FALSO PARA EXCLUIRLO DEL RESULTADO
        }
      }
      return true; // SI ES UNICO, RETORNA VERDADERO PARA INCLUIRLO EN EL RESULTADO
    });
    // VERIFICAMOS QUE EXISTAN DATOS PARA VERIFICAR EXISTENCIAS EN LA BASE DE DATOS
    if (verificados != 0) {
      if (this.asignados != 0) {
        // FILTRA LOS ELEMENTOS DEL PRIMER ARRAY QUE NO SE REPITEN EN EL SEGUNDO ARRAY
        let noRegistradoas = verificados.filter(elemento => !this.asignados.find(item => item.id === elemento.id));
        this.adminSeleccionados = noRegistradoas;
      }
      else {
        // AHORA 'verificados' CONTIENE SOLO OBJETOS UNICOS
        this.adminSeleccionados = verificados;
      }
    }
    // ACTIVAR BOTON GUARDAR DATOS Y LIMPIAR LISTA SELECCION DE USUARIOS
    if (this.adminSeleccionados.length != 0) {
      this.ver_guardar = true;
    }
    else {
      this.ver_guardar = false;
      this.toastr.warning('Usuarios seleccionados ya se encuentran registrados en el sistema.', 'VERIFICAR PROCESO.', {
        timeOut: 6000,
      });
    }
    this.LimpiarDatos();
    console.log('ver admin ', this.adminSeleccionados)
  }

  // METODO PARA ASIGNAR ADMINISTRACION DE DATOS A OTROS USUARIOS
  ver_guardar: boolean = false;
  IngresarUsuarioSucursal() {
    let cont = 0;
    let datos = {
      id_empleado: '',
      id_sucursal: this.data.id,
      principal: false,
      user_name: this.user_name,
      ip: this.ip,
    }
    this.adminSeleccionados.forEach(objeto => {
      datos.id_empleado = objeto.id;
      this.usuario.RegistrarUsuarioSucursal(datos).subscribe(res => {
        //console.log('res', res)
        cont = cont + 1;
        if (cont === this.adminSeleccionados.length) {
          this.toastr.success('Registros guardados exitosamente.', 'PROCESO EXITOSO.', {
            timeOut: 6000,
          });
          // LIMPIAR DATOS Y REFRESCAR LAS CONSULTAS
          this.LimpiarDatos();
          this.adminSeleccionados = [];
          this.ver_guardar = false;
          this.ver_administradores = false;
          this.BuscarAdministradoresJefes();
        }
      });
    })
  }

  // METODO PARA LIMPIAR SELECCION DE USUARIOS
  LimpiarDatos() {
    this.sucursalForm.setValue('');
    this.administradores = [];
    this.ver_seleccion = false;
  }

  // METODO DE GUARDADO EN UNA LISTA LOS ELEMENTOS SELECCIONADOS
  selectionAsignados = new SelectionModel<ITableEmpleados>(true, []);

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedDep() {
    const numSelected = this.selectionAsignados.selected.length;
    return numSelected === this.asignados.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleDep() {
    this.isAllSelectedDep() ?
      this.selectionAsignados.clear() :
      this.asignados.forEach(row => this.selectionAsignados.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelDep(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedDep() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionAsignados.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // METODO PARA ACTIVAR SELECCION MULTIPLE
  plan_multiple: boolean = false;
  plan_multiple_: boolean = false;
  activar_seleccion: boolean = true;
  HabilitarSeleccion() {
    this.plan_multiple = true;
    this.plan_multiple_ = true;
    this.activar_seleccion = false;
    //console.log('ver datos seleccionados,,, ', this.selectionAsignados.selected.length)
  }

  // METODO PARA NO MOSTRAR ITEMS DE SELECCION
  InhabilitarSeleccion() {
    if (this.selectionAsignados.selected.length === 0) {
      this.activar_seleccion = true;
      this.plan_multiple = false;
      this.plan_multiple_ = false;
    }
    //console.log('ver datos seleccionados ', this.selectionAsignados.selected.length)
  }


  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  ConfirmarDeleteProceso() {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.MetodoEliminar()
        }
      });
  }

  // METODO PARA ELIMINAR DATOS ASIGNADOS
  MetodoEliminar() {
    let cont = 0;

    const datos = {
      user_name: this.user_name,
      ip: this.ip
    }
    let lista_eliminar = this.selectionAsignados.selected.map(obj => {
      return {
        id_usucursal: obj.id_usucursal
      }
    })
    // PROCESO PARA ELIMINAR LOS REGISTROS SELECCIONADOS
    lista_eliminar.forEach(obj => {
      this.usuario.EliminarUsuarioSucursal(obj.id_usucursal, datos).subscribe(res => {
        cont = cont + 1;

        if (cont === lista_eliminar.length) {
          this.toastr.error('Registros eliminados.', 'PROCESO EXITOSO.', {
            timeOut: 6000,
          });
          this.LimpiarAsignados();
        }
      });
    })
    //console.log('ver datos ', lista_eliminar)
  }

  // METODO PARA LIMPOIAR DATOS DE SELECCION MULTIPLE
  LimpiarAsignados() {
    this.selectionAsignados.clear();
    this.InhabilitarSeleccion();
    this.BuscarAdministradoresJefes();
  }

}
