// IMPORTACION DE LIBRERIAS
import { Validators, FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { firstValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as FileSaver from 'file-saver';
import * as moment from 'moment';
import * as xlsx from 'xlsx';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as xml2js from 'xml2js';

// IMPORTAR COMPONENTES
import { ConfirmarDesactivadosComponent } from '../confirmar-desactivados/confirmar-desactivados.component';
import { ConfirmarCrearCarpetaComponent } from '../confirmar-crearCarpeta/confirmar-crearCarpeta.component';


// IMPORTAR SERVICIOS
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { EmpleadoElemento } from '../../../../model/empleado.model'
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { ThemePalette } from '@angular/material/core';
import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';

@Component({
  selector: 'app-lista-empleados',
  templateUrl: './lista-empleados.component.html',
  styleUrls: ['./lista-empleados.component.css']
})

export class ListaEmpleadosComponent implements OnInit {

  empleadosEliminarActivos: any = [];
  empleadosEliminarInactivos: any = [];

  // VARIABLES DE ALMACENAMIENTO DE DATOS
  nacionalidades: any = [];
  empleadoD: any = [];
  empleado: any = [];
  idUsuariosAcceso: any = [];  // VARIABLE DE ALMACENAMIENTO DE IDs DE USUARIOS A LOS QUE TIENE ACCESO EL USURIO QUE INICIO SESION

  // CAMPOS DEL FORMULARIO
  apellido = new FormControl('', [Validators.minLength(2)]);
  codigo = new FormControl('');
  cedula = new FormControl('', [Validators.minLength(2)]);
  nombre = new FormControl('', [Validators.minLength(2)]);

  // VARIABLES USADAS EN BUSQUEDA DE FILTRO DE DATOS
  filtroCodigo: number;
  filtroApellido: '';
  filtroCedula: '';
  filtroNombre: '';

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

  constructor(
    public restEmpre: EmpresaService, // SERVICIO DATOS DE EMPRESA
    public ventana: MatDialog, // VARIABLE MANEJO DE VENTANAS DE DIÁLOGO
    public router: Router, // VARIABLE DE USO DE PÁGINAS CON URL
    public rest: EmpleadoService, // SERVICIO DATOS DE EMPLEADO
    private toastr: ToastrService, // VARIABLE DE MANEJO DE MENSAJES DE NOTIFICACIONES
    private validar: ValidacionesService,
    private usuario: UsuarioService
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

    this.ObtenerAsignacionesUsuario(this.idEmpleado);
    this.ObtenerEmpleados(this.idEmpleado);
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

  CrearCarpeta(opcion: number) {
    let EmpleadosSeleccionados: any;

    if (opcion === 1) {

      EmpleadosSeleccionados = this.selectionUno.selected.map(obj => {
        return {
          id: obj.id,
          codigo: obj.codigo,
          empleado: obj.nombre + ' ' + obj.apellido
        }
      })
    } else if (opcion === 2 || opcion === 3) {
      EmpleadosSeleccionados = this.selectionDos.selected.map(obj => {
        return {
          id: obj.id,
          codigo: obj.codigo,
          empleado: obj.nombre + ' ' + obj.apellido
        }
      })
    }

    // VERIFICAR QUE EXISTAN USUARIOS SELECCIONADOS
    if (EmpleadosSeleccionados.length != 0) {
      this.ventana.open(ConfirmarCrearCarpetaComponent, {
        width: '500px',
        data: { opcion: opcion, lista: EmpleadosSeleccionados }
      })
        .afterClosed().subscribe(item => {
          if (item === true) {
            this.GetEmpleados();
            this.btnCheckHabilitar = false;
            this.btnCheckDeshabilitado = false;
            this.selectionUno.clear();
            this.selectionDos.clear();
            EmpleadosSeleccionados = [];
          };
        });
    }
    else {
      this.toastr.info('No ha seleccionado usuarios.', '', {
        timeOut: 6000,
      })
    }



  }

  // METODO PARA DESHABILITAR USUARIOS
  Deshabilitar(opcion: number) {
    let EmpleadosSeleccionados: any;
    if (opcion === 1) {
      EmpleadosSeleccionados = this.selectionUno.selected.map(obj => {
        return {
          id: obj.id,
          empleado: obj.nombre + ' ' + obj.apellido
        }
      })
    } else if (opcion === 2 || opcion === 3) {
      EmpleadosSeleccionados = this.selectionDos.selected.map(obj => {
        return {
          id: obj.id,
          empleado: obj.nombre + ' ' + obj.apellido
        }
      })
    }

    // VERIFICAR QUE EXISTAN USUARIOS SELECCIONADOS
    if (EmpleadosSeleccionados.length != 0) {
      this.ventana.open(ConfirmarDesactivadosComponent, {
        width: '500px',
        data: { opcion: opcion, lista: EmpleadosSeleccionados }
      })
        .afterClosed().subscribe(item => {
          if (item === true) {
            this.GetEmpleados();
            this.btnCheckHabilitar = false;
            this.btnCheckDeshabilitado = false;
            this.selectionUno.clear();
            this.selectionDos.clear();
            EmpleadosSeleccionados = [];
          };
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

  async ObtenerAsignacionesUsuario(idEmpleado: any) {
    const data = {
      id_empleado: Number(idEmpleado)
    }

    const res = await firstValueFrom(this.usuario.BuscarUsuarioDepartamento(data));
    this.empleadoD.asignaciones = res;

    const promises = this.empleadoD.asignaciones.map((asignacion: any) => {
      const data = {
        id_departamento: asignacion.id_departamento
      }
      return firstValueFrom(this.usuario.ObtenerIdUsuariosDepartamento(data));
    });

    const results = await Promise.all(promises);

    const ids = results.flat().map((res: any) => res.id);
    this.idUsuariosAcceso.push(...ids);

    this.GetEmpleados();

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

  //  METODO PARA VALIDAR INGRESO DE NUMEROSO
  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

  // METODO PARA LISTAR USUARIOS
  GetEmpleados() {
    this.empleado = [];
    this.rest.ListarEmpleadosActivos().subscribe(data => {
      this.empleado = data;

      // TODO: ANALIZAR QUE SUCEDE CON LOS ROLES ADMINISTRADOR Y SUPERADMINISTRADOR
      this.empleado = this.empleado.filter((empleado: any) => this.idUsuariosAcceso.includes(empleado.id));
      this.OrdenarDatos(this.empleado);
    })
    this.desactivados = [];
    this.rest.ListaEmpleadosDesactivados().subscribe(res => {
      this.desactivados = res;
      this.desactivados = this.desactivados.filter((empleado: any) => this.idUsuariosAcceso.includes(empleado.id));
      this.OrdenarDatos(this.desactivados);
    });
  }

  // ORDENAR LOS DATOS SEGUN EL  CODIGO
  OrdenarDatos(array: any) {
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
    this.apellido.reset();
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
    this.archivoSubido = [];
    this.nameFile = '';
    this.archivoSubido = element.target.files;
    this.nameFile = this.archivoSubido[0].name;
    let arrayItems = this.nameFile.split(".");
    let itemExtencion = arrayItems[arrayItems.length - 1];
    if (itemExtencion == 'xlsx' || itemExtencion == 'xls') {
      if (this.datosCodigo[0].automatico === true || this.datosCodigo[0].cedula === true) {
        var itemName = arrayItems[0].slice(0, 18);
        if (itemName.toLowerCase() == 'empleadoautomatico') {
          this.numero_paginaMul = 1;
          this.tamanio_paginaMul = 5;
          this.VerificarPlantillaAutomatico();
        } else {
          this.toastr.error('Cargar la plantilla con nombre EmpleadoAutomatico.', 'Plantilla seleccionada incorrecta.', {
            timeOut: 6000,
          });
          this.archivoForm.reset();
          this.nameFile = '';
          this.LimpiarCampos();
          this.mostrarbtnsubir = false;
        }
      }
      else {
        itemName = arrayItems[0].slice(0, 14);
        if (itemName.toLowerCase() == 'empleadomanual') {
          console.log('entra_manual');
          this.numero_paginaMul = 1;
          this.tamanio_paginaMul = 5;
          this.VerificarPlantillaManual();
        } else {
          this.toastr.error('Cargar la plantilla con nombre EmpleadoManual.', 'Plantilla seleccionada incorrecta.', {
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

    this.rest.verificarArchivoExcel_Automatico(formData).subscribe(res => {
      console.log('plantilla 1', res);
      this.DataEmpleados = res.data;
      this.messajeExcel = res.message;

      if (this.messajeExcel == 'error') {
        this.toastr.error('Revisar que la numeración de la columna "item" sea correcta.', 'Plantilla no aceptada.', {
          timeOut: 4500,
        });
        this.mostrarbtnsubir = false;
      } else {
        this.DataEmpleados.forEach((item: any) => {
          if (item.observacion.toLowerCase() == 'ok') {
            this.listUsuariosCorrectas.push(item);
          }
        });
      }
    }, error => {
      console.log('Serivicio rest -> metodo verificarArchivoExcel_Automatico - ', error);
      this.toastr.error('Error al cargar los datos.', 'Plantilla no aceptada.', {
        timeOut: 4000,
      });
      this.progreso = false;
    }, () => {
      this.progreso = false;
    });

    /*
    if (this.datosCodigo[0].automatico === true) {
      this.ArchivoAutomatico(formData);
    }
    else {
      this.ArchivoManual(formData);
    }
    */
  }

  datosManuales: boolean = false;
  VerificarPlantillaManual() {
    this.listUsuariosCorrectas = [];
    this.datosManuales = false;
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads", this.archivoSubido[i], this.archivoSubido[i].name);
    }

    this.progreso = true;

    this.rest.verificarArchivoExcel_Manual(formData).subscribe(res => {
      console.log('plantilla manual', res);
      this.DataEmpleados = res.data;
      this.messajeExcel = res.message;
      if (this.messajeExcel == 'error') {
        this.toastr.error('Revisar que la numeración de la columna "item" sea correcta.', 'Plantilla no aceptada.', {
          timeOut: 4500,
        });
        this.mostrarbtnsubir = false;
      } else {
        this.DataEmpleados.forEach((item: any) => {
          if (item.observacion.toLowerCase() == 'ok') {
            this.listUsuariosCorrectas.push(item);
          }
        });
        this.datosManuales = true;
      }

    }, error => {
      console.log('Serivicio rest -> metodo verificarArchivoExcel_Automatico - ', error);
      this.toastr.error('Error al cargar los datos', 'Plantilla no aceptada', {
        timeOut: 4000,
      });
      this.progreso = false;
      this.datosManuales = false;
    }, () => {
      this.progreso = false;
    });

  }

  //FUNCION PARA CONFIRMAR EL REGISTRO MULTIPLE DE LOS FERIADOS DEL ARCHIVO EXCEL
  ConfirmarRegistroMultiple() {
    const mensaje = 'registro';
    console.log('this.listUsuariosCorrectas: ', this.listUsuariosCorrectas.length);
    this.ventana.open(MetodosComponent, { width: '450px', data: mensaje }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.registrarUsuariosMultiple();
        }
      });
  }

  registrarUsuariosMultiple() {
    if (this.listUsuariosCorrectas.length > 0) {
      const datos = {
        plantilla: this.listUsuariosCorrectas,
        user_name: this.user_name,
        ip: this.ip
      };

      if (this.datosCodigo[0].automatico === true || this.datosCodigo[0].cedula === true) {

        this.rest.subirArchivoExcel_Automatico(datos).subscribe(datos_archivo => {
          this.toastr.success('Operación exitosa.', 'Plantilla de Empleados importada.', {
            timeOut: 3000,
          });
          window.location.reload();
          this.archivoForm.reset();
          this.nameFile = '';

        });
      } else {
        this.rest.subirArchivoExcel_Manual(datos).subscribe(datos_archivo => {
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
  stiloCelda(observacion: string): string {
    let arrayObservacion = observacion.split(" ");
    if (observacion == 'ok') {
      return 'rgb(159, 221, 154)';
    } else if (observacion == 'Ya esta registrado en base') {
      return 'rgb(239, 203, 106)';
    } else if ((arrayObservacion[0] + ' ' + arrayObservacion[1]) == 'Cédula ya' ||
      (arrayObservacion[0] + ' ' + arrayObservacion[1]) == 'Usuario ya' ||
      (arrayObservacion[0] + ' ' + arrayObservacion[1]) == 'Codigo ya') {
      return 'rgb(239, 203, 106)';
    } else if (arrayObservacion[0] == 'Cédula' || arrayObservacion[0] == 'Usuario') {
      return 'rgb(251, 73, 18)';
    } else if ((arrayObservacion[0] + ' ' + arrayObservacion[1]) == 'Registro duplicado') {
      return 'rgb(156, 214, 255)';
    } else if ((observacion == 'Código ingresado no válido') ||
      (observacion == 'Teléfono ingresado no es válido') ||
      (observacion == 'Cédula ingresada no es válida')
    ) {
      return 'rgb(222, 162, 73)';
    } else if ((observacion == 'Rol no existe en el sistema') ||
      (observacion == 'Nacionalidad no existe en el sistema')) {
      return 'rgb(255, 192, 203)';
    } else if (arrayObservacion[0] == 'Formato') {
      return 'rgb(222, 162, 73)';
    } else {
      return 'rgb(251, 73, 18)';
    }

  }

  colorTexto: string = '';
  stiloTextoCelda(texto: string): string {
    if (texto == 'No registrado') {
      return 'rgb(255, 80, 80)';
    } else {
      return 'black'
    }
  }

  ArchivoAutomatico(datosArchivo) {
    this.rest.verificarArchivoExcel_Automatico(datosArchivo).subscribe(res => {
      console.log('plantilla 1', res);
      if (res.message === "error") {
        this.toastr.error('Para el buen funcionamiento del sistema verifique los datos de su plantilla, ' +
          'recuerde que la cédula, código y nombre de usuario son datos únicos por ende no deben constar ' +
          'en otros registros. Asegurese de que el rol ingresado exista en el sistema.',
          'Registro Fallido. Verificar Plantilla', {
          timeOut: 6000,
        });
        this.archivoForm.reset();
        this.nameFile = '';
      } else {
        this.rest.verificarArchivoExcel_DatosAutomatico(datosArchivo).subscribe(response => {
          console.log('plantilla 2', response);
          if (response.message === "error") {
            this.toastr.error('Para el buen funcionamiento del sistema verifique los datos de su plantilla, ' +
              'recuerde que la cédula, código y nombre de usuario son datos únicos por ende no deben constar ' +
              'en otros registros. Asegurese de que el rol ingresado exista en el sistema.',
              'Registro Fallido. Verificar Plantilla', {
              timeOut: 6000,
            });
            this.archivoForm.reset();
            this.nameFile = '';
          } else {
            this.rest.subirArchivoExcel_Automatico(datosArchivo).subscribe(datos_archivo => {
              console.log('plantilla 3', datos_archivo);
              this.toastr.success('Operación exitosa.', 'Plantilla de Empleados importada.', {
                timeOut: 6000,
              });
              window.location.reload();
            });
          }
        });
      }
    });
  }

  ArchivoManual(datosArchivo) {
    this.rest.verificarArchivoExcel_Manual(datosArchivo).subscribe(res => {
      console.log('plantilla 1', res);
      if (res.message === "error") {
        this.toastr.error('Para el buen funcionamiento del sistema verifique los datos de su plantilla, ' +
          'recuerde que la cédula, código y nombre de usuario son datos únicos por ende no deben constar ' +
          'en otros registros. Asegurese de que el rol ingresado exista en el sistema.',
          'Registro Fallido. Verificar Plantilla.', {
          timeOut: 6000,
        });
        this.archivoForm.reset();
        this.nameFile = '';
      } else {
        this.rest.verificarArchivoExcel_DatosManual(datosArchivo).subscribe(response => {
          console.log('plantilla 2', response);
          if (response.message === "error") {
            this.toastr.error('Para el buen funcionamiento del sistema verifique los datos de su plantilla, ' +
              'recuerde que la cédula, código y nombre de usuario son datos únicos por ende no deben constar ' +
              'en otros registros. Asegurese de que el rol ingresado exista en el sistema.',
              'Registro Fallido. Verificar Plantilla.', {
              timeOut: 6000,
            });
            this.archivoForm.reset();
            this.nameFile = '';
          } else {
            this.rest.subirArchivoExcel_Manual(datosArchivo).subscribe(datos_archivo => {
              console.log('plantilla 3', datos_archivo);
              this.toastr.success('Operación exitosa.', 'Plantilla de Empleados importada.', {
                timeOut: 6000,
              });
              window.location.reload();
            });
          }
        });
      }
    });
  }

  link: string = '';
  datosCodigo: any = [];
  DescargarPlantilla() {
    this.datosCodigo = [];
    this.rest.ObtenerCodigo().subscribe(datos => {
      this.datosCodigo = datos;
      if (datos[0].automatico === true || datos[0].cedula === true) {
        this.link = `${environment.url}/plantillaD/documento/EmpleadoAutomatico.xlsx`
      } else {
        this.link = `${environment.url}/plantillaD/documento/EmpleadoManual.xlsx`
      }
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
    const documentDefinition = this.GetDocumentDefinicion(numero);
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download('Empleados.pdf'); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  GetDocumentDefinicion(numero: any) {
    sessionStorage.setItem('Empleados', this.empleado);
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
        this.presentarDataPDFEmpleados(numero),
      ],
      styles: {
        tableHeader: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 9 },
        itemsTableD: { fontSize: 9, alignment: 'center' }
      }
    };
  }

  EstadoCivilSelect: any = ['Soltero/a', 'Unión de Hecho', 'Casado/a', 'Divorciado/a', 'Viudo/a'];
  GeneroSelect: any = ['Masculino', 'Femenino'];
  EstadoSelect: any = ['Activo', 'Inactivo'];
  presentarDataPDFEmpleados(numero: any) {
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
              ...arreglo.map(obj => {
                var estadoCivil = this.EstadoCivilSelect[obj.estado_civil - 1];
                var genero = this.GeneroSelect[obj.genero - 1];
                var estado = this.EstadoSelect[obj.estado - 1];
                let nacionalidad;
                this.nacionalidades.forEach(element => {
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
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(arreglo.map(obj => {
      let nacionalidad: any;
      this.nacionalidades.forEach(element => {
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
      this.nacionalidades.forEach(element => {
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
      console.error('Error al construir el objeto XML.');
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
      var arreglo = this.empleado
    }
    else {
      arreglo = this.desactivados
    }
    // const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(arreglo);
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(arreglo.map(obj => {
      let nacionalidad: any;
      this.nacionalidades.forEach(element => {
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

  // Metodos para la eliminacion de empleados activos e inactivos

  // METODOS PARA LA SELECCION MULTIPLE






  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO
  Eliminar(id_empleado: number) {
    this.rest.EliminarEmpleados(id_empleado).subscribe(res => {
      if (res.message === 'error') {
        this.toastr.error('No se puede eliminar.', '', {
          timeOut: 6000,
        });
      } else {
        this.toastr.error('Registro eliminado.', '', {
          timeOut: 6000,
        });
        this.GetEmpleados();
      }

    });
  }


  contador: number = 0;
  ingresar: boolean = false;

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  ConfirmarDelete(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Eliminar(datos.id);
        } else {
          this.router.navigate(['/empleados']);
        }
      });

    this.GetEmpleados();

  }

  ConfirmarDeleteMultipleActivos() {

    this.ingresar = false;
    this.contador = 0;


    let EliminarActivos = this.selectionUno.selected.map(obj => {
      return {
        id: obj.id,
        empleado: obj.nombre + ' ' + obj.apellido
      }
    })


    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          if (EliminarActivos.length != 0) {

            //ELIMINAR EMPLEADO

            EliminarActivos.forEach((datos: any) => {

              this.empleado = this.empleado.filter(item => item.id !== datos.id);
              this.contador = this.contador + 1;

              this.rest.EliminarEmpleados(datos.id).subscribe(res => {
                if (res.message === 'error') {
                  this.toastr.error('Existen datos relacionados con ' + datos.empleado + '.', 'No fue posible eliminar.', {
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
                  this.GetEmpleados();
                }
              });
            }
            )
            this.btnCheckHabilitar = false;
            this.empleadosEliminarActivos = [];
            this.selectionUno.clear();
            this.GetEmpleados();
          } else {
            this.toastr.warning('No ha seleccionado USUARIOS.', 'Ups!!! algo salio mal.', {
              timeOut: 6000,
            })
          }
          this.selectionUno.clear();
        } else {
          this.router.navigate(['/empleados']);
        }
      }
      );
    //this.GetEmpleados();

  }






  ConfirmarDeleteMultipleInactivos() {
    this.ingresar = false;
    this.contador = 0;
    let EliminarInactivos = this.selectionDos.selected.map(obj => {
      return {
        id: obj.id,
        empleado: obj.nombre + ' ' + obj.apellido
      }
    })
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          if (EliminarInactivos.length != 0) {
            EliminarInactivos.forEach((datos: any) => {
              this.empleado = this.empleado.filter(item => item.id !== datos.id);
              this.contador = this.contador + 1;
              this.rest.EliminarEmpleados(datos.id).subscribe(res => {
                if (res.message === 'error') {
                  this.toastr.error('Existen datos relacionados con ' + datos.empleado + '.', 'No fue posible eliminar.', {
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
                  this.GetEmpleados();
                }
              });
            }
            )
            this.btnCheckDeshabilitado = false;
            this.empleadosEliminarActivos = [];
            this.selectionUno.clear();
            this.GetEmpleados();
          } else {
            this.toastr.warning('No ha seleccionado USUARIOS.', 'Ups!!! algo salio mal.', {
              timeOut: 6000,
            })
          }
          this.selectionDos.clear();
        } else {
          this.router.navigate(['/empleados']);
        }
      }
      );
  }




}
