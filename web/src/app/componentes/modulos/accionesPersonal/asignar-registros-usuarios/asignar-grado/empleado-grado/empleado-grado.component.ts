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
import { CatGradoService } from 'src/app/servicios/modulos/modulo-acciones-personal/catGrado/cat-grado.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario/usuario.service';
import { EditarRegistroComponent } from '../../editar-registro/editar-registro.component';

@Component({
  selector: 'app-empleado-grado',
  standalone: false,
  templateUrl: './empleado-grado.component.html',
  styleUrl: './empleado-grado.component.css'
})

export class EmpleadoGradoComponent {
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

    //VARIABLE PARA MOSTRAR EL COMPONENTE DE INFORMACION DE GRADO DEL EMPLEADO Y OCULTAR LA TABLA
    infoEmpleGrado: boolean = false
    nombreUsuarioSelect: string = ''
    idEmpleadoSelec: any;
    listaEmpleGrado: any = []
    listaGrados: any = []
  
    constructor(
      public departamentoService: DepartamentosService,
      public sucursal: SucursalService,
      public ventana: MatDialog,
      public general: DatosGeneralesService,
      public toastr: ToastrService,
      private usuario: UsuarioService,
      public validar: ValidacionesService,
      private rest: CatGradoService
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
      this.infoEmpleGrado = false;
      this.BuscarUsuariosSucursal();
      this.OptenerListGrados();
    }

    OptenerListGrados(){
      this.listaGrados = []
      this.rest.ConsultarGrados().subscribe({
        next:(respuesta: any) => {
          this.listaGrados = respuesta
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
    this.listaEmpleGrado = []
    this.rest.ObtenerGradoUsuario(valor.id).subscribe({
      next: (respuesta: any) => {
        if (respuesta.status == 200) {
          this.nombreUsuarioSelect = valor.apellido + ' ' + valor.nombre
          this.idEmpleadoSelec = valor.id
          this.listaEmpleGrado = respuesta.grados
          this.infoEmpleGrado = true;
        } else {
          this.infoEmpleGrado = false;
        }
      }, error: (err: any) => {
        this.listaEmpleGrado = []
        console.log('err: ', err)
        this.infoEmpleGrado = false;
        this.toastr.warning(err.error.text, 'Advertencia.', {
          timeOut: 4500,
        });
      },
    })
  }

  AbrirVentanaEditar(pro: any) {
    const datos = {
      tipo: 'grados',
      info: pro,
      listAccion: this.listaGrados,
      id_empleado: this.idEmpleadoSelec
    }

    this.ventana.open(EditarRegistroComponent, { width: '450px', data: datos }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.ngOnInit();
        }
      });
  }

  ConfirmarDelete(gra: any) {
    const mensaje = 'eliminar';
    this.ventana.open(MetodosComponent, { width: '450px', data: mensaje }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarRegistro(gra);
        }
      });
  }

  EliminarRegistro(grado: any) {
    const data = {
      user_name: this.user_name,
      ip: this.ip,
      ip_local: this.ips_locales
    }
    this.rest.EliminarGradoEmple(grado.id, data).subscribe({
      next: (respuesta: any) => {
        this.toastr.success(respuesta.message, 'Correcto.', {
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
}
