import { Observable, map, startWith } from 'rxjs';
import { Component, OnInit, Input } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { DepartamentosService } from 'src/app/servicios/catalogos/catDepartamentos/departamentos.service';
import { SucursalService } from 'src/app/servicios/sucursales/sucursal.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';

import { ITableEmpleados } from 'src/app/model/reportes.model';

import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';
import { PrincipalSucursalUsuarioComponent } from '../principal-sucursal-usuario/principal-sucursal-usuario.component';
import { firstValueFrom } from 'rxjs';
import { VisualizarAsignacionesComponent } from '../visualizar-asignaciones/visualizar-asignaciones.component';

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

  filtroRol = '';
  filtroNombre = '';
  filtroDepartamento = '';

  rol = new FormControl('', [Validators.minLength(2)]);
  nombre = new FormControl('', [Validators.minLength(2)]);
  departamento = new FormControl('', [Validators.minLength(2)]);

  // VARIABLE PARA SELECCION MULTIPLE USUARIOS
  usuariosSeleccionados = new SelectionModel<any>(true, []);

  // VARIABLE PARA SELECCION MULTIPLE DE DEPARTAMENTOS
  departamentosSeleccionados: any = [];
  deshabilitar: boolean = false;
  deshabilitarTodos: boolean = false;

  // VARIABLES PARA VISUALIZAR DATOS
  ver_guardar: boolean = false;
  ver_departamentos: boolean = false;
  ver_personal: boolean = false;
  isPersonal: boolean = false;


  constructor(
    public ventanasu: PrincipalSucursalUsuarioComponent,
    public sucursal: SucursalService,
    public departamentoService: DepartamentosService,
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
    console.log('ver datos ', this.data)
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
      lista_sucursales:  this.data.id,
      estado: 1
    }
    //console.log('ver datos ', data)
    this.usuarios = [];
    this.asignados = [];
    this.principales = [];
    this.general.ObtenerAdminJefes(data).subscribe(res => {
      this.usuarios = res;
      if (this.usuarios.length != 0) {
        this.usuarios.forEach((elemento: any) => {
          const data = {
            id_empleado: elemento.id,
          }
          this.usuario.BuscarUsuarioDepartamento(data).subscribe(datos => {
            elemento.asignaciones = datos;
          });
        });
      }

      this.ver_principal = true;

      console.log('ver sucursal ', this.usuarios)
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
      //TODO: CONSULTAR SI SE DEBE O NO MOSTAR SUCURSAL SELECCIONADA
      // LA LINEA A CONTINUACION OMITIRA LA SUCURSAL SELECCIONADA
      //this.sucursales = this.sucursales.filter(elemento => elemento.id !== this.data.id);
      // APLICACION DE BUSQUEDA CON FILTROS
      this.filteredOptions = this.sucursalForm.valueChanges
        .pipe(
          startWith(''),
          map((value: any) => this._filter(value))
        );
    });
  }

  // METODO PARA OBTENER DEPARTAMENTOS DEL ESTABLECIMIENTO SELECCIONADO
  departamentos: any = [];
  ObtenerDepartamentos() {
    this.QuitarTodos();
    this.ver_seleccion = true;
    this.isChecked = false;
    this.isPersonal = false;
    this.deshabilitar = false;
    this.deshabilitarTodos = false;
    //console.log('ver datos ', this.sucursalForm.value)
    const [elemento] = this.sucursales.filter((o: any) => {
      return o.nombre === this.sucursalForm.value
    })
    console.log('ver elementos ', elemento)
    this.departamentos = [];
    const id_sucursal = elemento.id;
    this.departamentoService.BuscarDepartamentoSucursal(id_sucursal).subscribe(datos => {
      this.departamentos = datos;
      this.ver_departamentos = true;
    });

    // GREGAR PROPIEDAD SELECCIONADO A TODOS LOS DEPARTAMENTOS
    this.departamentos.forEach((obj: any) => {
      obj.seleccionado = false;
    });

    if (elemento.nombre.toLowerCase() === this.name_sucursal.toLowerCase()) {
      this.ver_personal = true;
    }
    else {
      this.ver_personal = false;
    }


  }

  // VARIABLES DE ACTIVACION DE FUNCIONES
  ver_seleccion: boolean = false;
  administradores: any = [];
  ver_administradores: boolean = false;

  // METODO PARA LISTAR USUARIOS
  adminSeleccionados: any = [];

  // METODO PARA SELECCIONAR DEPARTAMENTOS
  SeleccionarDepartamento(data: any) {
    this.departamentosSeleccionados.push(data);
  }

  // METODO PARA RETIRAR DEPARTAMENTOS
  QuitarDepartamento(data: any) {
    this.departamentosSeleccionados = this.departamentosSeleccionados.filter((d: any) => d !== data);
  }

  // AGREGAR DATOS MULTIPLES DE CIUDADES DE LA PROVINCIA INDICADA
  AgregarTodos() {
    this.departamentosSeleccionados = this.departamentos;
    for (var i = 0; i <= this.administradores.length - 1; i++) {
      (<HTMLInputElement>document.getElementById('departamentosSeleccionados' + i)).checked = true;
    }
  }

  // QUITAR TODOS LOS DATOS SELECCIONADOS DE LA PROVINCIA INDICADA
  limpiarData: any = [];
  QuitarTodos() {
    this.limpiarData = this.departamentos;
    for (var i = 0; i <= this.limpiarData.length - 1; i++) {
      (<HTMLInputElement>document.getElementById('departamentosSeleccionados' + i)).checked = false;
      this.departamentosSeleccionados = this.departamentosSeleccionados.filter((d:any) => d !== this.departamentos[i]);
    }
  }

  // METODO PARA VERIFICAR SELECCION DE OPCION "Todas"
  isChecked: boolean = false;
  SeleccionarTodas(event: any) {
    this.deshabilitarTodos = !this.deshabilitarTodos;
    if (event === true) {
      this.AgregarTodos();
      this.ver_guardar = true;
    }
    else {
      this.QuitarTodos();
      this.ver_guardar = false;
    }

  }

  // METODO PARA VERIFICAR SELECCION DE CIUDADES
  SeleccionarIndividual(event: any, valor: any) {
    const target = event.target as HTMLInputElement;
    if (target.checked === true) {
      this.SeleccionarDepartamento(valor);
    }
    else {
      this.QuitarDepartamento(valor);
    }
    if (this.departamentosSeleccionados.length != 0) {
      this.ver_guardar = true;
    } else {
      this.ver_guardar = false;
    }
  }

  // METODO PARA DESHABILITAR OPCIONES DEPARTAMENTOS
  DeshabilitarOpciones(event: any) {
    this.deshabilitar = !this.deshabilitar;
    this.departamentos.forEach((obj: any) => {
      obj.seleccionado = false;
    });

    this.departamentosSeleccionados = [];
    const target = event.target as HTMLInputElement;
    this.isPersonal = target.checked;

    if (this.isPersonal === true) {
      this.ver_guardar = true;
    } else {
      this.ver_guardar = false;
    }

  }

  // METODO PARA RETIRAR DE LISTA DE SELECCIONADOS
  RetirarLista(seleccionado: any) {
    this.departamentosSeleccionados = this.departamentosSeleccionados.filter(elemento => elemento.id !== seleccionado);

    const departamento = this.departamentos.find((departamento: any) => departamento.id === seleccionado);
    if (departamento) {
      departamento.seleccionado = false;
    }
    if (this.departamentosSeleccionados.length === 0) {
      this.ver_guardar = false;
      this.isChecked = false;
    }
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

  // METODO PARA ASIGNAR ADMINISTRACION DE DATOS A OTROS USUARIOS - DEPARTAMENTOS
  IngresarUsuarioDepartamento() {
    let datos: any = {
      id_empleado: '',
      id_departamento: '',
      principal: false,
      user_name: this.user_name,
      ip: this.ip,
    };

    if (this.usuariosSeleccionados.selected.length === 0) {
      this.toastr.warning('No se han seleccionado usuarios.', 'VERIFICAR PROCESO.', {
        timeOut: 6000,
      });
      return;
    }

    const requests: Promise<any>[] = [];

    this.usuariosSeleccionados.selected.forEach((objeto: any) => {
      datos.id_empleado = objeto.id;
      if (this.isPersonal) {
        datos.id_departamento = objeto.id_departamento;
        requests.push(firstValueFrom(this.usuario.RegistrarUsuarioDepartamento(datos)));
      } else {
        this.departamentosSeleccionados.forEach((departamento: any) => {
          datos.id_departamento = departamento.id;
          requests.push(firstValueFrom(this.usuario.RegistrarUsuarioDepartamento(datos)));
        });
      }
    });

    Promise.all(requests).then(() => {
      this.toastr.success('Registros guardados exitosamente.', 'PROCESO EXITOSO.', {
        timeOut: 6000,
      });
      // LIMPIAR DATOS Y REFRESCAR LAS CONSULTAS
      this.LimpiarDatos();
      this.usuariosSeleccionados.clear();
      this.departamentosSeleccionados = [];
      this.adminSeleccionados = [];
      this.ver_guardar = false;
      this.ver_administradores = false;
      this.ver_departamentos = false;
      this.BuscarAdministradoresJefes();
    }).catch(() => {
      this.toastr.error('Error al guardar registros.', 'Ups!!! algo salio mal.', {
        timeOut: 6000,
      });
    });
  }

  // METODO PARA LIMPIAR SELECCION DE USUARIOS
  LimpiarDatos() {
    this.sucursalForm.setValue('');
    this.administradores = [];
    this.departamentos = [];
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
      this.asignados.forEach((row: any) => this.selectionAsignados.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelDep(row?: any): string {
    if (!row) {
      return `${this.isAllSelectedDep() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionAsignados.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  isAllSelectedU() {
    const numSelected = this.usuariosSeleccionados.selected.length;
    return numSelected === this.principales.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS
  masterToggleU() {
    this.isAllSelectedU() ?
      this.usuariosSeleccionados.clear() :
      this.principales.forEach((row: any) => this.usuariosSeleccionados.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelU(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedU() ? 'select' : 'deselect'} all`;
    }
    return `${this.usuariosSeleccionados.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
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

  VisualizarAsignaciones(usuario: any) {
    const datos = {
      nombre: `${usuario.nombre} ${usuario.apellido}`,
      asignaciones: usuario.asignaciones,
      user_name: this.user_name,
      ip: this.ip,
      id: usuario.id
    }
    this.ventana.open(VisualizarAsignacionesComponent, {
      data: datos,
      width: '700px',
      height: 'auto',
    }).afterClosed().subscribe((datos: any) => {
      if (datos) {
        const usuarioIndex = this.usuarios.findIndex((u: any) => u.id === datos.id);
        if (usuarioIndex !== -1) {
          this.usuarios[usuarioIndex].asignaciones = datos.asignaciones;
        }
      }
    }
    );
  }


  // METODO PARA LIMPOIAR DATOS DE SELECCION MULTIPLE
  LimpiarAsignados() {
    this.selectionAsignados.clear();
    this.InhabilitarSeleccion();
    this.BuscarAdministradoresJefes();
  }
}
