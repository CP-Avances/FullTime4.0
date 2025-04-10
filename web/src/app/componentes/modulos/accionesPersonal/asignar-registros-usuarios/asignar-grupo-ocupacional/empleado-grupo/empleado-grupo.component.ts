import { SelectionModel } from '@angular/cdk/collections';
import { Component, Input } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { MetodosComponent } from 'src/app/componentes/generales/metodoEliminar/metodos.component';
import { ITableEmpleados } from 'src/app/model/reportes.model';
import { DepartamentosService } from 'src/app/servicios/configuracion/localizacion/catDepartamentos/departamentos.service';
import { SucursalService } from 'src/app/servicios/configuracion/localizacion/sucursales/sucursal.service';
import { DatosGeneralesService } from 'src/app/servicios/generales/datosGenerales/datos-generales.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { CatGrupoOcupacionalService } from 'src/app/servicios/modulos/modulo-acciones-personal/catGrupoOcupacional/cat-grupo-ocupacional.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario/usuario.service';
import { EditarRegistroComponent } from '../../editar-registro/editar-registro.component';

@Component({
  selector: 'app-empleado-grupo',
  standalone: false,
  templateUrl: './empleado-grupo.component.html',
  styleUrl: './empleado-grupo.component.css'
})

export class EmpleadoGrupoComponent {

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
  infoEmpleGrupo: boolean = false
  nombreUsuarioSelect: string = ''
  idEmpleadoSelec: any;
  listaEmpleGrupo: any = []
  listaGrupo: any = []

  constructor(
    public departamentoService: DepartamentosService,
    public sucursal: SucursalService,
    public ventana: MatDialog,
    public general: DatosGeneralesService,
    public toastr: ToastrService,
    private usuario: UsuarioService,
    public validar: ValidacionesService,
    private rest: CatGrupoOcupacionalService
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });

    console.log('dataList: ', this.data)
    this.name_sucursal = this.data.nombre
    this.infoEmpleGrupo = false;
    this.BuscarUsuariosSucursal();
    this.OptenerListGrupo();
  }

  OptenerListGrupo() {
    this.listaGrupo = []
    this.rest.ConsultarGrupoOcupacion().subscribe({
      next: (respuesta: any) => {
        this.listaGrupo = respuesta
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
      if (this.usuarios.length != 0) {
        this.ver_principal = true;
      }
    });
  }

  // METODO PARA VER PANTALLA PRINCIPAL SUCURSAL USUARIO
  pagina: string = '';
  VerUsuarioAsignado() {
    //     //console.log('ingresa')
    //     this.pagina = 'asignar-usuario';
    //     this.ventanasu.ver_principal = true;
    //     this.ventanasu.ver_informacion = false;
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

  AbrirVentanaEditar(gru: any) {
    const datos = {
      tipo: 'grupo',
      info: gru,
      listAccion: this.listaGrupo,
      id_empleado: this.idEmpleadoSelec
    }

    this.ventana.open(EditarRegistroComponent, { width: '450px', data: datos }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.ngOnInit();
        }
      });
  }

  ConfirmarDelete(gru: any) {
    const mensaje = 'eliminar';
    this.ventana.open(MetodosComponent, { width: '450px', data: mensaje }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarRegistro(gru);
        }
      });
  }

  EliminarRegistro(grup: any) {
    const data = {
      user_name: this.user_name,
      ip: this.ip,
      ip_local: this.ips_locales,
      id_empleado: this.idEmpleadoSelec
    }
    this.rest.EliminarGrupoOcupaEmple(grup.id, data).subscribe({
      next: (respuesta: any) => {
        this.toastr.success(respuesta.message, 'Correcto.', {
          timeOut: 4500,
        });
        this.ngOnInit();
      }, error: (err: any) => {
        this.toastr.error(err.error.message, 'Error.', {
          timeOut: 4500,
        });
      },
    })
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

  Visualizar(valor: any) {
    this.listaEmpleGrupo = []
    this.rest.ObtenerGrupoUsuario(valor.id).subscribe({
      next: (respuesta: any) => {
        if (respuesta.status == 200) {
          this.nombreUsuarioSelect = valor.apellido + ' ' + valor.nombre
          this.idEmpleadoSelec = valor.id
          this.listaEmpleGrupo = respuesta.grupo
          this.infoEmpleGrupo = true;
        } else {
          this.infoEmpleGrupo = false;
        }
      }, error: (err: any) => {
        this.listaEmpleGrupo = []
        console.log('err: ', err)
        this.infoEmpleGrupo = false;
        this.toastr.warning(err.error.text, 'Advertencia.', {
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
      // Si no hay datos, se permite si el rol es 1 (Admin)
      return parseInt(localStorage.getItem('rol') || '0') === 1;
    }
  }

  getEditarAsignacionGrupoOcupacional(): boolean {
    return this.tienePermiso('Editar Asignación Grupo Ocupacional');
  }

  getEliminarAsignacionGrupoOcupacional(): boolean {
    return this.tienePermiso('Eliminar Asignación Grupo Ocupacional');
  }

}
