import { FormControl, Validators } from '@angular/forms';
import { Component, Input } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';

import { SucursalService } from 'src/app/servicios/configuracion/localizacion/sucursales/sucursal.service';
import { ProcesoService } from 'src/app/servicios/modulos/modulo-acciones-personal/catProcesos/proceso.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { DepartamentosService } from 'src/app/servicios/configuracion/localizacion/catDepartamentos/departamentos.service';
import { DatosGeneralesService } from 'src/app/servicios/generales/datosGenerales/datos-generales.service';
import { EmpleadoProcesosService } from 'src/app/servicios/modulos/modulo-acciones-personal/empleadoProcesos/empleado-procesos.service';

import { ITableEmpleados } from 'src/app/model/reportes.model';
import { MetodosComponent } from 'src/app/componentes/generales/metodoEliminar/metodos.component';
import { EditarRegistroComponent } from '../../../asignar-registros-usuarios/editar-registro/editar-registro.component';

@Component({
  selector: 'app-empleado-proceso',
  standalone: false,
  templateUrl: './empleado-proceso.component.html',
  styleUrl: './empleado-proceso.component.css'
})

export class EmpleadoProcesoComponent {

  @Input() data: any;
    
  ips_locales: any = '';
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

  rol = new FormControl('', [Validators.minLength(2)]);
  nombre = new FormControl('', [Validators.minLength(2)]);
  departamento = new FormControl('', [Validators.minLength(2)]);

  // VARIABLE PARA SELECCION MULTIPLE USUARIOS
  usuariosSeleccionados = new SelectionModel<any>(true, []);

  //VARIABLE PARA MOSTRAR EL COMPONENTE DE INFORMACION DE PROCESO DEL EMPLEADO Y OCULTAR LA TABLA
  infoEmpleProceso: boolean = false
  nombreUsuarioSelect: string = ''
  idEmpleadoSelec: any;
  listaEmpleProce: any = []
  listaProcesos: any = []

  constructor(
    public departamentoService: DepartamentosService,
    public sucursal: SucursalService,
    public ventana: MatDialog,
    public general: DatosGeneralesService,
    public validar: ValidacionesService,
    public toastr: ToastrService,
    private rest: EmpleadoProcesosService,
    private restPro: ProcesoService
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');  
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    }); 
    this.name_sucursal = this.data.nombre
    this.BuscarUsuariosSucursal();
    this.infoEmpleProceso = false;
    this.OptenerListProcesos();
  }

  OptenerListProcesos(){
    this.listaProcesos = []
    this.restPro.ConsultarProcesos().subscribe({
      next:(respuesta: any) => {
        this.listaProcesos = respuesta
      }
    })
  }

  // METODO PARA BUSCAR DATOS DE USUARIOS ADMINISTRADORES Y JEFES
  asignados: any = [];
  usuarios: any = [];
  ver_principal: boolean = false;
  ver_asignados: boolean = false;
  BuscarUsuariosSucursal() {
     this.usuarios = [];
     this.asignados = [];
     this.general.ObtenerInformacionGeneral(1).subscribe(res => {
       this.usuarios = res.filter((item: any) => item.id_suc === this.data.id);
       if(this.usuarios.length != 0){
         this.ver_principal = true;
       }
     });
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

  // // METODO DE GUARDADO EN UNA LISTA LOS ELEMENTOS SELECCIONADOS
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
     return numSelected === this.usuarios.length
  }
  
  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS
  masterToggleU() {
    this.isAllSelectedU() ?
    this.usuariosSeleccionados.clear() :
    this.usuarios.forEach((row: any) => this.usuariosSeleccionados.select(row));
  }
  
  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelU(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedU() ? 'select' : 'deselect'} all`;
    }
    return `${this.usuariosSeleccionados.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  Visualizar(valor: any){
    this.listaEmpleProce = []
    this.rest.ObtenerProcesoUsuario(valor.id).subscribe({
      next: (respuesta: any) => {
        if(respuesta.status == 200){
          this.nombreUsuarioSelect = valor.apellido +' '+ valor.nombre
          this.idEmpleadoSelec = valor.id
          this.listaEmpleProce = respuesta.procesos
          this.infoEmpleProceso = true;
        }else{
          this.infoEmpleProceso = false;
        }
      },error: (err: any) => {
        this.listaEmpleProce = []
        this.infoEmpleProceso = false;
        this.toastr.warning(err.error.text, 'Advertencia.', {
          timeOut: 4500,
        });
      },
    })
  }

  AbrirVentanaEditar(pro: any){
    const datos = {
      tipo: 'proceso',
      info: pro,
      listAccion: this.listaProcesos,
      id_empleado: this.idEmpleadoSelec
    }

    this.ventana.open(EditarRegistroComponent, { width: '450px', data: datos }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.ngOnInit();
        }
      });
  }

  ConfirmarDelete(pro){
    const mensaje = 'eliminar';
    (document.activeElement as HTMLElement)?.blur();
    this.ventana.open(MetodosComponent, { width: '450px', data: mensaje }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarRegistro(pro);
        }
      });
  }

  EliminarRegistro(pro: any){
    const data = {
      user_name: this.user_name,
      ip: this.ip,
      ip_local: this.ips_locales,
      id_empleado: this.idEmpleadoSelec
    }
    this.rest.EliminarRegistro(pro.id, data).subscribe({
      next: (respuesta: any) => {
        this.toastr.error(respuesta.message, 'Correcto.', {
          timeOut: 4500,
        });
        this.ngOnInit();
      },error: (err: any) => {
        this.toastr.error(err.error.message, 'Error.', {
          timeOut: 4500,
        });
      },
    })
  }

  regresar(){
    this.ngOnInit();
  }

  //CONTROL BOTONES
  private tienePermiso(accion: string): boolean {
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      try {
        const datos = JSON.parse(datosRecuperados);
        return datos.some((item: any) => item.accion === accion);
      } catch {
        return false;
      }
    } else {
      // SI NO HAY DATOS, SE PERMITE SI EL ROL ES 1 (ADMIN)
      return parseInt(localStorage.getItem('rol') || '0') === 1;
    }
  }

  getEditarAsignacionProceso(): boolean {
    return this.tienePermiso('Editar Asignación Proceso');
  }

  getEliminarAsignacionProceso(): boolean {
    return this.tienePermiso('Eliminar Asignación Proceso');
  }

}
