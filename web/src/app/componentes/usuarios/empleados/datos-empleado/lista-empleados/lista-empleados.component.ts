// IMPORTACION DE LIBRERIAS
import { firstValueFrom, forkJoin, map, Observable } from 'rxjs';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Validators, FormControl } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';
import { ThemePalette } from '@angular/material/core';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as xlsx from 'xlsx';
import * as xml2js from 'xml2js';
import * as moment from 'moment';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
import * as FileSaver from 'file-saver';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// IMPORTAR COMPONENTES
import { ConfirmarDesactivadosComponent } from '../../confirmar-desactivados/confirmar-desactivados.component';
import { ConfirmarCrearCarpetaComponent } from '../../confirmar-crearCarpeta/confirmar-crearCarpeta.component';
import { MetodosComponent } from 'src/app/componentes/generales/metodoEliminar/metodos.component';

// IMPORTAR SERVICIOS
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { AsignacionesService } from 'src/app/servicios/asignaciones/asignaciones.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { MainNavService } from 'src/app/componentes/generales/main-nav/main-nav.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { LoginService } from 'src/app/servicios/login/login.service';

import { EmpleadoElemento } from 'src/app/model/empleado.model';

@Component({
  selector: 'app-lista-empleados',
  templateUrl: './lista-empleados.component.html',
  styleUrls: ['./lista-empleados.component.css']
})

export class ListaEmpleadosComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;

  empleadosEliminarActivos: any = [];
  empleadosEliminarInactivos: any = [];

  // VARIABLES DE ALMACENAMIENTO DE DATOS
  nacionalidades: any = [];
  empleadoD: any = [];
  empleado: any = [];
  idUsuariosAcceso: Set<any> = new Set();// VARIABLE DE ALMACENAMIENTO DE IDs DE USUARIOS A LOS QUE TIENE ACCESO EL USURIO QUE INICIO SESION
  idDepartamentosAcceso: Set<any> = new Set();// VARIABLE DE ALMACENAMIENTO DE IDs DE DEPARTAMENTOS A LOS QUE TIENE ACCESO EL USURIO QUE INICIO SESION

  mostarTabla: boolean = false;
  mostrarCrearCarpeta: boolean = false;

  // BUSQUEDA DE MODULOS ACTIVOS
  get habilitarPermisos(): boolean { return this.funciones.permisos; }
  get habilitarVacaciones(): boolean { return this.funciones.vacaciones; }
  get habilitarHorasExtras(): boolean { return this.funciones.horasExtras; }

  // CAMPOS DEL FORMULARIO
  codigo = new FormControl('');
  cedula = new FormControl('', [Validators.minLength(2)]);
  nombre = new FormControl('', [Validators.minLength(2)]);

  // ITEMS DE PAGINACION DE LA TABLA
  pageSizeOptions = [5, 10, 20, 50];
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;

  // ITEMS DE PAGINACION DE LA TABLA DESHABILITADOS
  pageSizeOptionsDes = [5, 10, 20, 50];
  tamanio_paginaDes: number = 5;
  numero_paginaDes: number = 1;

  tamanio_paginaMul: number = 5;
  numero_paginaMul: number = 1;

  idEmpleado: number; // VARIABLE DE ALMACENAMIENTO DE ID DE EMPLEADO QUE INICIA SESION
  rolEmpleado: number; // VARIABLE DE ALMACENAMIENTO DE ROL DE EMPLEADO QUE INICIA SESION

  // VARAIBLES DE SELECCION DE DATOS DE UNA TABLA
  selectionUno = new SelectionModel<EmpleadoElemento>(true, []);
  selectionDos = new SelectionModel<EmpleadoElemento>(true, []);

  // ACTIVAR BOTONES DE LISTAS DE USUARIOS
  lista_activos: boolean = false;
  tabla_activos: boolean = true;
  lista_inactivos: boolean = true;

  // VARIABLES PROGRESS SPINNER
  progreso: boolean = false;
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 10;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  usuariosCorrectos: number = 0;

  constructor(
    public loginService: LoginService,
    public restEmpre: EmpresaService, // SERVICIO DATOS DE EMPRESA
    public ventana: MatDialog, // VARIABLE MANEJO DE VENTANAS DE DIÁLOGO
    public router: Router, // VARIABLE DE USO DE PÁGINAS CON URL
    public rest: EmpleadoService, // SERVICIO DATOS DE EMPLEADO
    private toastr: ToastrService, // VARIABLE DE MANEJO DE MENSAJES DE NOTIFICACIONES
    private validar: ValidacionesService,
    private funciones: MainNavService,
    private asignaciones: AsignacionesService,
    private datosGenerales: DatosGeneralesService,
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.rolEmpleado = parseInt(localStorage.getItem('rol') as string);

    this.idUsuariosAcceso = this.asignaciones.idUsuariosAcceso;
    this.idDepartamentosAcceso = this.asignaciones.idDepartamentosAcceso;

    this.GetEmpleados();
    this.ObtenerEmpleados(this.idEmpleado);
    this.VerificarModulosActivos();
    this.ObtenerNacionalidades();
    this.DescargarPlantilla();
    this.ObtenerColores();
    this.ObtenerLogo();
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelected() {
    const numSelected = this.selectionUno.selected.length;
    const numRows = this.empleado.length;
    return numSelected === numRows;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTÁN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggle() {
    this.isAllSelected() ?
      this.selectionUno.clear() :
      this.empleado.forEach((row: any) => this.selectionUno.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabel(row?: EmpleadoElemento): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionUno.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // METODO PARA DESACTIVAR O ACTIVAR CHECK LIST DE EMPLEADOS ACTIVOS
  btnCheckHabilitar: boolean = false;
  HabilitarSeleccion() {
    if (this.btnCheckHabilitar === false) {
      this.btnCheckHabilitar = true;
    } else if (this.btnCheckHabilitar === true) {
      this.btnCheckHabilitar = false;
      this.selectionUno.clear();
      this.selectionDos.clear();
    }
  }

  // METODO PARA MOSTRAR LISTA DE USUARIOS INACTIVOS
  desactivados: any = [];
  ListarInactivos() {
    this.tabla_activos = false;
    this.lista_activos = true;
    this.lista_inactivos = false;
    this.Hab_Deshabilitados = true;
  }

  // METODO PARA MOSTRAR LISTA DE USUARIOS ACTIVOS
  ListarActivos() {
    this.tabla_activos = true;
    this.lista_activos = false;
    this.lista_inactivos = true;
    this.Hab_Deshabilitados = false;
  }

  VerificarModulosActivos() {
    this.mostrarCrearCarpeta = this.habilitarPermisos || this.habilitarVacaciones || this.habilitarHorasExtras;
  }

  // METODO PARA ACTIVAR O DESACTIVAR CHECK LIST DE TABLA EMPLEADOS DESACTIVADOS
  Hab_Deshabilitados: boolean = false;
  btnCheckDeshabilitado: boolean = false;
  HabilitarSeleccionDesactivados() {
    if (this.btnCheckDeshabilitado === false) {
      this.btnCheckDeshabilitado = true;
    } else if (this.btnCheckDeshabilitado === true) {
      this.btnCheckDeshabilitado = false;
      this.selectionUno.clear();
      this.selectionDos.clear();
    }
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedDos() {
    const numSelected = this.selectionDos.selected.length;
    const numRows = this.desactivados.length;
    return numSelected === numRows;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleDos() {
    this.isAllSelectedDos() ?
      this.selectionDos.clear() :
      this.desactivados.forEach((row: any) => this.selectionDos.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelDos(row?: EmpleadoElemento): string {
    if (!row) {
      return `${this.isAllSelectedDos() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionDos.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // METODO PARA CREAR LA CARPETA DEL USUARIO
  CrearCarpeta(opcion: number) {
    let seleccion = opcion === 1 ? this.selectionUno.selected : (opcion === 2 || opcion === 3) ? this.selectionDos.selected : [];
    let empleadosSeleccionados = seleccion.map((obj: any) => ({
      id: obj.id,
      codigo: obj.codigo,
      empleado: `${obj.nombre} ${obj.apellido}`,
      cedula: obj.cedula,
    }));

    // VERIFICAR QUE EXISTAN USUARIOS SELECCIONADOS
    empleadosSeleccionados.length > 0 ? this.ventana.open(ConfirmarCrearCarpetaComponent, {
      width: '500px',
      data: {
        empleados: empleadosSeleccionados,
        vacaciones: this.habilitarVacaciones,
        permisos: this.habilitarPermisos,
        horasExtras: this.habilitarHorasExtras
      }
    }).afterClosed().subscribe(item => {
      if (item) {
        this.GetEmpleados();
        this.btnCheckHabilitar = false;
        this.btnCheckDeshabilitado = false;
        this.selectionUno.clear();
        this.selectionDos.clear();
        empleadosSeleccionados = [];
      }
    }) : this.toastr.info('No ha seleccionado usuarios.', '', { timeOut: 6000 });
  }

  // METODO PARA DESHABILITAR USUARIOS
  Deshabilitar(opcion: number) {
    let EmpleadosSeleccionados: any;
    if (opcion === 1) {
      EmpleadosSeleccionados = this.selectionUno.selected.map((obj: any) => {
        return {
          id: obj.id,
          empleado: obj.nombre + ' ' + obj.apellido
        }
      })
    } else if (opcion === 2 || opcion === 3) {
      EmpleadosSeleccionados = this.selectionDos.selected.map((obj: any) => {
        return {
          id: obj.id,
          empleado: obj.nombre + ' ' + obj.apellido
        }
      })
    }

    // VERIFICAR QUE EXISTAN USUARIOS SELECCIONADOS
    if (EmpleadosSeleccionados.length != 0) {
      const dialogRef = this.ventana.open(ConfirmarDesactivadosComponent, {
        width: '500px',
        data: { opcion: opcion, lista: EmpleadosSeleccionados }
      });
      dialogRef.afterClosed().subscribe(async item => {
        if (item) {
          try {
            const datos = {
              arrayIdsEmpleados: EmpleadosSeleccionados.map((obj: any) => obj.id),
              user_name: this.user_name,
              ip: this.ip
            }

            let res: { message: string | undefined; } = { message: undefined };

            // INACTIVAR EMPLEADOS
            if (opcion === 1) {
              res = await this.rest.DesactivarVariosUsuarios(datos);
            }
            // ACTIVAR EMPLEADOS
            else if (opcion === 2) {
              res = await this.rest.ActivarVariosUsuarios(datos);
            }
            // REACTIVAR EMPLEADOS
            else if (opcion === 3) {
              res = await this.rest.ReActivarVariosUsuarios(datos);
            }
            this.toastr.success(res.message, '', {
              timeOut: 6000,
            });
            if (res.message === 'Usuarios inhabilitados exitosamente.' && opcion === 1) {
              const objetoEncontrado = EmpleadosSeleccionados.find((objeto: any) => objeto.id === this.idEmpleado);
              console.log('verificar ', objetoEncontrado);
              if (objetoEncontrado) {
                this.loginService.logout();
              }
            }
            this.GetEmpleados();
          } catch (error) {
            this.toastr.error('Error al actualizar usuarios.', '', {
              timeOut: 6000,
            });
          }
        };
        this.btnCheckHabilitar = false;
        this.btnCheckDeshabilitado = false;
        this.selectionUno.clear();
        this.selectionDos.clear();
        EmpleadosSeleccionados = [];
      });
    }
    else {
      this.toastr.info('No ha seleccionado usuarios.', '', {
        timeOut: 6000,
      })
    }
  }

  // METODO PARA VER LA INFORMACION DEL EMPLEADO
  ObtenerEmpleados(idemploy: any) {
    this.empleadoD = [];
    this.rest.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleadoD = data;
    })
  }

  // METODO PARA OBTENER LOGO DE EMPRESA
  logo: any = String;
  ObtenerLogo() {
    this.restEmpre.LogoEmpresaImagenBase64(localStorage.getItem('empresa') as string).subscribe(res => {
      this.logo = 'data:image/jpeg;base64,' + res.imagen;
    });
  }

  // METODO PARA OBTENER COLORES Y MARCA DE AGUA DE EMPRESA
  p_color: any;
  s_color: any;
  frase: any;
  ObtenerColores() {
    this.restEmpre.ConsultarDatosEmpresa(parseInt(localStorage.getItem('empresa') as string)).subscribe(res => {
      this.p_color = res[0].color_principal;
      this.s_color = res[0].color_secundario;
      this.frase = res[0].marca_agua;
    });
  }

  // METODO PARA MANEJAR PAGINACION
  ManejarPagina(e: PageEvent) {
    this.numero_pagina = e.pageIndex + 1;
    this.tamanio_pagina = e.pageSize;
  }

  // EVENTO PARA MOSTRAR FILAS DETERMINADAS EN LA TABLA
  ManejarPaginaMulti(e: PageEvent) {
    this.tamanio_paginaMul = e.pageSize;
    this.numero_paginaMul = e.pageIndex + 1
  }

  // METODO PARA MANEJAR PAGINACION INACTIVOS
  ManejarPaginaDes(e: PageEvent) {
    this.numero_paginaDes = e.pageIndex + 1;
    this.tamanio_paginaDes = e.pageSize;
  }

  // METODO PARA VALIDAR INGRESO DE LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  //  METODO PARA VALIDAR INGRESO DE NUMEROS
  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

  // METODO PARA LISTAR USUARIOS
  async GetEmpleados() {
    let empleadosActivos$ = this.rest.ListarEmpleadosActivos();
    let empleadosDesactivados$ = this.rest.ListaEmpleadosDesactivados();

    if (this.rolEmpleado !== 1) {
      const idsEmpleadosActuales = await this.ObtenerIdsEmpleadosActuales();
      empleadosActivos$ = this.FiltrarEmpleados(empleadosActivos$, idsEmpleadosActuales);
      empleadosDesactivados$ = this.FiltrarEmpleados(empleadosDesactivados$, idsEmpleadosActuales);
    }

    forkJoin([empleadosActivos$, empleadosDesactivados$]).subscribe(([empleados, desactivados]) => {
      //console.log('empleados', empleados);
      //console.log('desactivados', desactivados);
      this.ProcesarEmpleados(empleados, desactivados);
    });
  }

  async ObtenerIdsEmpleadosActuales(): Promise<Set<unknown>> {
    try {
      const res: any = await firstValueFrom(this.datosGenerales.ListarIdInformacionActual());
      return new Set(res.map((empleado: any) => empleado.id));
    } catch (error) {
      return new Set();
    }
  }

  FiltrarEmpleados(empleados$: Observable<any>, idsEmpleadosActuales: Set<unknown>): Observable<any> {
    return empleados$.pipe(
      map((data: any) => data.filter((empleado: any) =>
        this.idUsuariosAcceso.has(empleado.id) || (this.idDepartamentosAcceso.size > 0 && !idsEmpleadosActuales.has(empleado.id))
      ))
    );
  }

  ProcesarEmpleados(empleados: any, desactivados: any) {
    this.empleado = empleados;
    this.OrdenarDatos(this.empleado);
    this.desactivados = desactivados;
    this.OrdenarDatos(this.desactivados);
    this.mostarTabla = true;
  }

  // ORDENAR LOS DATOS SEGUN EL CODIGO
  OrdenarDatos(array: any) {
    console.log('ordenar datos')
    function compare(a: any, b: any) {
      if (parseInt(a.codigo) < parseInt(b.codigo)) {
        return -1;
      }
      if (parseInt(a.codigo) > parseInt(b.codigo)) {
        return 1;
      }
      return 0;
    }
    array.sort(compare);
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.codigo.reset();
    this.cedula.reset();
    this.nombre.reset();
    this.DataEmpleados = null;
    this.archivoSubido = [];
    this.nameFile = '';
    this.archivoForm.reset();
    this.mostrarbtnsubir = false;
    this.messajeExcel = '';

  }

  // METODO PARA LISTAR NACIONALIDADES
  ObtenerNacionalidades() {
    this.rest.BuscarNacionalidades().subscribe(res => {
      this.nacionalidades = res;
    });
  }

  /** ************************************************************************* **
   ** **               METODOS Y VARIABLES PARA SUBIR PLANTILLA              ** **
   ** ************************************************************************* **/

  nameFile: string;
  archivoSubido: Array<File>;
  archivoForm = new FormControl('', Validators.required);
  mostrarbtnsubir: boolean = false;
  FileChange(element: any) {
    this.numero_paginaMul = 1;
    this.tamanio_paginaMul = 5;
    this.paginator.firstPage();
    this.archivoSubido = [];
    this.nameFile = '';
    this.archivoSubido = element.target.files;
    this.nameFile = this.archivoSubido[0].name;
    let arrayItems = this.nameFile.split(".");
    let itemExtencion = arrayItems[arrayItems.length - 1];
    let itemName = arrayItems[0];
    if (itemExtencion == 'xlsx' || itemExtencion == 'xls') {
      if (this.datosCodigo[0].automatico === true || this.datosCodigo[0].cedula === true) {
        if (itemName.toLowerCase().startsWith('plantillaconfiguraciongeneral')) {
          this.numero_paginaMul = 1;
          this.tamanio_paginaMul = 5;
          this.VerificarPlantillaAutomatico();
        } else {
          this.toastr.error('Cargar la plantilla con nombre plantillaconfiguraciongeneral.', 'Plantilla seleccionada incorrecta.', {
            timeOut: 6000,
          });
          this.archivoForm.reset();
          this.nameFile = '';
          this.LimpiarCampos();
          this.mostrarbtnsubir = false;
        }
      }
      else {
        if (itemName.toLowerCase().startsWith('plantillaconfiguraciongeneral')) {
          this.numero_paginaMul = 1;
          this.tamanio_paginaMul = 5;
          this.VerificarPlantillaManual();
        } else {
          this.toastr.error('Cargar la plantilla con nombre plantillaconfiguraciongeneral.', 'Plantilla seleccionada incorrecta.', {
            timeOut: 6000,
          });
          this.archivoForm.reset();
          this.nameFile = '';
          this.LimpiarCampos();
          this.mostrarbtnsubir = false;
        }
      }
    } else {
      this.toastr.error('Error en el formato del documento.', 'Plantilla no aceptada.', {
        timeOut: 6000,
      });
      this.archivoForm.reset();
      this.nameFile = '';
    }
    this.archivoForm.reset();
    this.mostrarbtnsubir = true;
  }

  // METODO PARA VERIFICAR PLANTILLA MODO CODIGO AUTOMATICO
  DataEmpleados: any;
  listUsuariosCorrectas: any = [];
  messajeExcel: string = '';
  VerificarPlantillaAutomatico() {
    this.listUsuariosCorrectas = [];
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads", this.archivoSubido[i], this.archivoSubido[i].name);
    }
    this.progreso = true;
    this.rest.VerificarArchivoExcel_Automatico(formData).subscribe(res => {
      this.DataEmpleados = res.data;
      this.messajeExcel = res.message;

      this.DataEmpleados.sort((a: any, b: any) => {
        if (a.observacion !== 'ok' && b.observacion === 'ok') {
          return -1;
        }
        if (a.observacion === 'ok' && b.observacion !== 'ok') {
          return 1;
        }
        return 0;
      });

      if (this.messajeExcel == 'error') {
        this.toastr.error('Revisar que la numeración de la columna "item" sea correcta.', 'Plantilla no aceptada.', {
          timeOut: 4500,
        });
        this.mostrarbtnsubir = false;
      } else {
        this.DataEmpleados.forEach((item: any) => {
          if (item.observacion.toLowerCase() == 'ok' || item.observacion.toLowerCase() == 'ok (verificar ubicación)') {
            this.listUsuariosCorrectas.push(item);
          }
        });

        this.usuariosCorrectos = this.listUsuariosCorrectas.length;
      }
    }, error => {
      this.toastr.error('Error al cargar los datos.', 'Plantilla no aceptada.', {
        timeOut: 4000,
      });
      this.progreso = false;
    }, () => {
      this.progreso = false;
    });
  }

  // METODO PARA VERIFICAR LA PLANTILLA CON CODIGO MODO MANUAL
  datosManuales: boolean = false;
  VerificarPlantillaManual() {
    this.listUsuariosCorrectas = [];
    this.datosManuales = false;
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads", this.archivoSubido[i], this.archivoSubido[i].name);
    }
    this.progreso = true;
    this.rest.VerificarArchivoExcel_Manual(formData).subscribe(res => {
      this.DataEmpleados = res.data;
      this.messajeExcel = res.message;
      this.DataEmpleados.sort((a: any, b: any) => {
        if (a.observacion !== 'ok' && b.observacion === 'ok') {
          return -1;
        }
        if (a.observacion === 'ok' && b.observacion !== 'ok') {
          return 1;
        }
        return 0;
      });

      if (this.messajeExcel == 'error') {
        this.toastr.error('Revisar que la numeración de la columna "item" sea correcta.', 'Plantilla no aceptada.', {
          timeOut: 4500,
        });
        this.mostrarbtnsubir = false;
      } else {
        this.DataEmpleados.forEach((item: any) => {
          if (item.observacion.toLowerCase() == 'ok' || item.observacion.toLowerCase() == 'ok (verificar ubicación)') {
            this.listUsuariosCorrectas.push(item);
          }
        });
        this.datosManuales = true;
        this.usuariosCorrectos = this.listUsuariosCorrectas.length;
      }
    }, error => {
      this.toastr.error('Error al cargar los datos', 'Plantilla no aceptada', {
        timeOut: 4000,
      });
      this.progreso = false;
      this.datosManuales = false;
    }, () => {
      this.progreso = false;
    });
  }

  // FUNCION PARA CONFIRMAR EL REGISTRO MULTIPLE DE DATOS DEL ARCHIVO EXCEL
  ConfirmarRegistroMultiple() {
    const mensaje = 'registro';
    this.ventana.open(MetodosComponent, { width: '450px', data: mensaje }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.RegistrarUsuariosMultiple();
        }
      });
  }

  // METODO PARA REGISTRAR LOS DATOS EL SISTEMA
  RegistrarUsuariosMultiple() {
    if (this.listUsuariosCorrectas.length > 0) {
      const datos = {
        plantilla: this.listUsuariosCorrectas,
        user_name: this.user_name,
        ip: this.ip
      };
      if (this.datosCodigo[0].automatico === true || this.datosCodigo[0].cedula === true) {
        this.rest.SubirArchivoExcel_Automatico(datos).subscribe(datos_archivo => {
          this.toastr.success('Operación exitosa.', 'Plantilla de Empleados importada.', {
            timeOut: 3000,
          });
          window.location.reload();
          this.archivoForm.reset();
          this.nameFile = '';

        });
      } else {
        this.rest.SubirArchivoExcel_Manual(datos).subscribe(datos_archivo => {
          this.toastr.success('Operación exitosa.', 'Plantilla de Empleados importada.', {
            timeOut: 3000,
          });
          window.location.reload();
          this.archivoForm.reset();
          this.nameFile = '';
        })
      }
    } else {
      this.toastr.error('No se ha encontrado datos para su registro.', 'Plantilla procesada.', {
        timeOut: 4000,
      });
      this.archivoForm.reset();
      this.nameFile = '';
    }
  }

  // METODO PARA DAR COLOR A LAS CELDAS Y REPRESENTAR LAS VALIDACIONES
  colorCelda: string = ''
  EstiloCelda(observacion: string): string {
    let arrayObservacion = observacion.split(" ");
    if (observacion == 'ok' || observacion == 'ok (Verificar ubicación)') {
      return 'rgb(159, 221, 154)';
    }
    else if (observacion == 'Ya existe en el sistema') {
      return 'rgb(239, 203, 106)';
    }
    else if ((arrayObservacion[0] + ' ' + arrayObservacion[1]) == 'Cédula ya' ||
      (arrayObservacion[0] + ' ' + arrayObservacion[1]) == 'Usuario ya' ||
      (arrayObservacion[0] + ' ' + arrayObservacion[1]) == 'Código ya') {
      return 'rgb(239, 203, 106)';
    }
    else if (arrayObservacion[0] == 'Cédula' || arrayObservacion[0] == 'Usuario') {
      return 'rgb(251, 73, 18)';
    }
    else if ((arrayObservacion[0] + ' ' + arrayObservacion[1]) == 'Registro duplicado') {
      return 'rgb(156, 214, 255)';
    }
    else if ((observacion == 'Código ingresado no válido') ||
      (observacion == 'El teléfono ingresado no es válido') ||
      (observacion == 'La cédula ingresada no es válida') ||
      (observacion == 'Género no es válido') ||
      (observacion == 'Estado civil no es válido') ||
      (observacion == 'Verificar ubicación')) {
      return 'rgb(222, 162, 73)';
    }
    else if ((observacion == 'Rol no existe en el sistema') ||
      (observacion == 'Nacionalidad no existe en el sistema')) {
      return 'rgb(255, 192, 203)';
    }
    else if ((observacion == 'La contraseña debe tener máximo 10 caracteres') || (observacion == 'El código debe tener máximo 10 caracteres')) {
      return 'rgb(238, 34, 207)';
    }
    else if (arrayObservacion[0] == 'Formato') {
      return 'rgb(222, 162, 73)';
    }
    else {
      return 'rgb(251, 73, 18)';
    }
  }

  // METODO DE ESTILO DE COLORES EN CELDAS
  colorTexto: string = '';
  EstiloTextoCelda(texto: string): string {
    if (texto == 'No registrado') {
      return 'rgb(255, 80, 80)';
    }
    else {
      return 'black';
    }
  }

  // METODO PARA VERIFICAR LA CONFIGURACION DEL CODIGO DEL EMPLEADO
  link: string = '';
  datosCodigo: any = [];
  DescargarPlantilla() {
    this.datosCodigo = [];
    this.rest.ObtenerCodigo().subscribe(datos => {
      this.datosCodigo = datos;
      this.link = `${environment.url}/plantillaD/documento/plantillaConfiguracionGeneral.xlsx`;
    }, error => {
      this.toastr.info('Para el correcto funcionamiento del sistema debe realizar la configuración del código de empleado.', '', {
        timeOut: 6000,
      });
      this.router.navigate(['/codigo/']);
    });
  }


  /** ************************************************************************************************* **
   ** **                             PARA LA EXPORTACION DE ARCHIVOS PDF                             ** **
   ** ************************************************************************************************* **/

  GenerarPdf(action = 'open', numero: any) {
    const documentDefinition = this.DefinirInformacionPDF(numero);
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download('Empleados.pdf'); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  DefinirInformacionPDF(numero: any) {
    return {
      // ENCABEZADO DE LA PAGINA
      pageOrientation: 'landscape',
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleadoD[0].nombre + ' ' + this.empleadoD[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },
      // PIE DE LA PAGINA
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
          ],
          fontSize: 10
        }
      },
      content: [
        { image: this.logo, width: 150, margin: [10, -25, 0, 5] },
        { text: 'Lista de Empleados', bold: true, fontSize: 20, alignment: 'center', margin: [0, -20, 0, 10] },
        this.PresentarDataPDFEmpleados(numero),
      ],
      styles: {
        tableHeader: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 9 },
        itemsTableD: { fontSize: 9, alignment: 'center' }
      }
    };
  }

  EstadoCivilSelect: any = ['Soltero/a', 'Casado/a', 'Viudo/a', 'Divorciado/a', 'Unión de Hecho',];
  GeneroSelect: any = ['Masculino', 'Femenino'];
  EstadoSelect: any = ['Activo', 'Inactivo'];
  PresentarDataPDFEmpleados(numero: any) {
    if (numero === 1) {
      var arreglo = this.empleado
    }
    else {
      arreglo = this.desactivados
    }
    return {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          table: {
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Código', style: 'tableHeader' },
                { text: 'Nombre', style: 'tableHeader' },
                { text: 'Apellido', style: 'tableHeader' },
                { text: 'Cedula', style: 'tableHeader' },
                { text: 'Fecha Nacimiento', style: 'tableHeader' },
                { text: 'Correo', style: 'tableHeader' },
                { text: 'Género', style: 'tableHeader' },
                { text: 'Estado Civil', style: 'tableHeader' },
                { text: 'Domicilio', style: 'tableHeader' },
                { text: 'Teléfono', style: 'tableHeader' },
                { text: 'Estado', style: 'tableHeader' },
                { text: 'Nacionalidad', style: 'tableHeader' },
              ],
              ...arreglo.map((obj: any) => {
                var estadoCivil = this.EstadoCivilSelect[obj.estado_civil - 1];
                var genero = this.GeneroSelect[obj.genero - 1];
                var estado = this.EstadoSelect[obj.estado - 1];
                let nacionalidad: any;
                this.nacionalidades.forEach((element: any) => {
                  if (obj.id_nacionalidad == element.id) {
                    nacionalidad = element.nombre;
                  }
                });
                return [
                  { text: obj.codigo, style: 'itemsTableD' },
                  { text: obj.nombre, style: 'itemsTable' },
                  { text: obj.apellido, style: 'itemsTable' },
                  { text: obj.cedula, style: 'itemsTableD' },
                  { text: obj.fecha_nacimiento.split("T")[0], style: 'itemsTableD' },
                  { text: obj.correo, style: 'itemsTableD' },
                  { text: genero, style: 'itemsTableD' },
                  { text: estadoCivil, style: 'itemsTableD' },
                  { text: obj.domicilio, style: 'itemsTableD' },
                  { text: obj.telefono, style: 'itemsTableD' },
                  { text: estado, style: 'itemsTableD' },
                  { text: nacionalidad, style: 'itemsTableD' }
                ];
              })
            ]
          },
          // ESTILO DE COLORES FORMATO ZEBRA
          layout: {
            fillColor: function (i: any) {
              return (i % 2 === 0) ? '#CCD1D1' : null;
            }
          }
        },
        { width: '*', text: '' },
      ]
    };
  }

  /** ************************************************************************************************* **
   ** **                            PARA LA EXPORTACION DE ARCHIVOS EXCEL                            ** **
   ** ************************************************************************************************* **/

  ExportToExcel(numero: any) {
    if (numero === 1) {
      var arreglo = this.empleado
    }
    else {
      arreglo = this.desactivados
    }
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(arreglo.map((obj: any) => {
      let nacionalidad: any;
      this.nacionalidades.forEach((element: any) => {
        if (obj.id_nacionalidad == element.id) {
          nacionalidad = element.nombre;
        }
      });
      return {
        CODIGO: obj.codigo,
        CEDULA: obj.cedula,
        APELLIDO: obj.apellido,
        NOMBRE: obj.nombre,
        FECHA_NACIMIENTO: obj.fecha_nacimiento.split("T")[0],
        ESTADO_CIVIL: this.EstadoCivilSelect[obj.estado_civil - 1],
        GENERO: this.GeneroSelect[obj.genero - 1],
        CORREO: obj.correo,
        ESTADO: this.EstadoSelect[obj.estado - 1],
        DOMICILIO: obj.domicilio,
        TELEFONO: obj.telefono,
        NACIONALIDAD: nacionalidad,
      }
    }));
    // METODO PARA DEFINIR TAMAÑO DE LAS COLUMNAS DEL REPORTE
    const header = Object.keys(arreglo[0]); // NOMBRE DE CABECERAS DE COLUMNAS
    var wscols: any = [];
    for (var i = 0; i < header.length; i++) {  // CABECERAS AÑADIDAS CON ESPACIOS
      wscols.push({ wpx: 100 })
    }
    wse["!cols"] = wscols;
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wse, 'LISTA EMPLEADOS');
    xlsx.writeFile(wb, "EmpleadosEXCEL" + '.xlsx');
  }

  /** ************************************************************************************************* **
   ** **                              PARA LA EXPORTACION DE ARCHIVOS XML                            ** **
   ** ************************************************************************************************* **/
  urlxml: string;
  data: any = [];
  ExportToXML(numero: any) {
    if (numero === 1) {
      var arreglo = this.empleado
    }
    else {
      arreglo = this.desactivados
    }
    var objeto: any;
    var arregloEmpleado: any = [];
    arreglo.forEach((obj: any) => {
      var estadoCivil = this.EstadoCivilSelect[obj.estado_civil - 1];
      var genero = this.GeneroSelect[obj.genero - 1];
      var estado = this.EstadoSelect[obj.estado - 1];
      let nacionalidad: any;
      this.nacionalidades.forEach((element: any) => {
        if (obj.id_nacionalidad == element.id) {
          nacionalidad = element.nombre;
        }
      });
      objeto = {
        "empleado": {
          "$": { "codigo": obj.codigo },
          "cedula": obj.cedula,
          "apellido": obj.apellido,
          "nombre": obj.nombre,
          "estadoCivil": estadoCivil,
          "genero": genero,
          "correo": obj.correo,
          "fechaNacimiento": obj.fecha_nacimiento.split("T")[0],
          "estado": estado,
          "domicilio": obj.domicilio,
          "telefono": obj.telefono,
          "nacionalidad": nacionalidad,
          "imagen": obj.imagen
        }
      }
      arregloEmpleado.push(objeto)
    });
    const xmlBuilder = new xml2js.Builder({ rootName: 'Empleados' });
    const xml = xmlBuilder.buildObject(arregloEmpleado);

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
    a.download = 'Empleados.xml';
    // SIMULAR UN CLIC EN EL ENLACE PARA INICIAR LA DESCARGA
    a.click();
  }

  /** ************************************************************************************************** **
   ** **                                 METODO PARA EXPORTAR A CSV                                   ** **
   ** ************************************************************************************************** **/

  ExportToCVS(numero: any) {
    if (numero === 1) {
      var arreglo = this.empleado;
    }
    else {
      arreglo = this.desactivados;
    }

    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(arreglo.map((obj: any) => {
      let nacionalidad: any;
      this.nacionalidades.forEach((element: any) => {
        if (obj.id_nacionalidad == element.id) {
          nacionalidad = element.nombre;
        }
      });
      return {
        CODIGO: obj.codigo,
        CEDULA: obj.cedula,
        APELLIDO: obj.apellido,
        NOMBRE: obj.nombre,
        FECHA_NACIMIENTO: obj.fecha_nacimiento.split("T")[0],
        ESTADO_CIVIL: this.EstadoCivilSelect[obj.estado_civil - 1],
        GENERO: this.GeneroSelect[obj.genero - 1],
        CORREO: obj.correo,
        ESTADO: this.EstadoSelect[obj.estado - 1],
        DOMICILIO: obj.domicilio,
        TELEFONO: obj.telefono,
        NACIONALIDAD: nacionalidad,
      }
    }));
    const csvDataC = xlsx.utils.sheet_to_csv(wse);
    const data: Blob = new Blob([csvDataC], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, "EmpleadosCSV" + '.csv');
  }

  // METODO PARA CONFIRMAR ELIMINACION MULTIPLE
  // 1 = ACTIVOS | 2 = INACTIVOS
  ConfirmarDeleteMultiple(opcion: number) {
    let seleccion = opcion === 1 ? this.selectionUno.selected : (opcion === 2 || opcion === 3) ? this.selectionDos.selected : [];
    let empleadosSeleccionados = seleccion.filter((obj: any) => obj.id !== this.idEmpleado)
      .map((obj: any) => ({
        id: obj.id,
      }));

    const datos = {
      empleados: empleadosSeleccionados,
      user_name: this.user_name,
      ip: this.ip
    };

    // VERIFICAR QUE EXISTAN USUARIOS SELECCIONADOS
    empleadosSeleccionados.length > 0 ? this.ventana.open(MetodosComponent, { width: '450px' })
      .afterClosed().subscribe((confirmado: Boolean) => {
        if (confirmado) {

          this.rest.EliminarEmpleados(datos).subscribe((res: any) => {
            if (res.error) {
              const metodo = res.status === 500 ? 'error' : 'warning';
              const titulo = res.status === 500 ? 'Ups!!! algo salio mal.' : '';
              this.toastr[metodo](res.message, titulo, { timeOut: 6000 });
            } else {
              this.toastr.success(res.message, '', { timeOut: 6000 });
            }
            empleadosSeleccionados = [];
            this.btnCheckHabilitar = false;
            this.btnCheckDeshabilitado = false;
            this.selectionUno.clear();
            this.selectionDos.clear();
            this.GetEmpleados();
          });
        };
      }) : this.toastr.info('No ha seleccionado usuarios.', '', {
        timeOut: 6000,
      });
  }

}
