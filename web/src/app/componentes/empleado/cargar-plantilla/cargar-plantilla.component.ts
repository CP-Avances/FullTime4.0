import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { FormControl, Validators } from '@angular/forms';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
import { ThemePalette } from '@angular/material/core';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';

import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { EmplCargosService } from 'src/app/servicios/empleado/empleadoCargo/empl-cargos.service';
import { DepartamentosService } from 'src/app/servicios/catalogos/catDepartamentos/departamentos.service';

import { MetodosComponent } from '../../administracionGeneral/metodoEliminar/metodos.component';

@Component({
  selector: 'app-cargar-plantilla',
  templateUrl: './cargar-plantilla.component.html',
  styleUrls: ['./cargar-plantilla.component.css']
})

export class CargarPlantillaComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;

  archivoForm = new FormControl('', Validators.required);
  // VARIABLE PARA TOMAR RUTA DEL SISTEMA
  hipervinculo: string = (localStorage.getItem('empresaURL') as string);

  // ITEMS DE PAGINACION DE LA TABLA
  pageSizeOptions = [5, 10, 20, 50];
  tamanio_paginaMul: number = 5;
  numero_paginaMul: number = 1;

  tamanio_paginaDepaNivel: number = 5;
  numero_paginaDepaNivel: number = 1;

  tamanio_paginaMulCargo: number = 5;
  numero_paginaMulCargo: number = 1;

  // VARIABLES PROGRESS SPINNER
  progreso: boolean = false;
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 10;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  nivelesDepartamentoCorrectos: number = 0;
  contratosCorrectos: number = 0;
  cargosCorrectos: number = 0;

  constructor(
    public restE: EmpleadoService, // SERVICIO DATOS DE EMPLEADO
    public restCa: EmplCargosService,
    public restDep: DepartamentosService, // SERVICIO DATOS DE DEPARTAMENTOS
    public ventana: MatDialog, // VARIABLE DE MANEJO DE VENTANAS
    private toastr: ToastrService, // VARIABLE DE MENSAJES DE NOTIFICACIONES
  ) {
    this.DatosContrato = [];
    this.DatosCargos = [];
    this.DatosNivelesDep = [];
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
  }

  // EVENTO PARA MOSTRAR FILAS DETERMINADAS EN LA TABLA
  ManejarPaginaMulti(e: PageEvent, tipo: string) {
    if (tipo == 'depaNivel') {
      this.tamanio_paginaDepaNivel = e.pageSize;
      this.numero_paginaDepaNivel = e.pageIndex + 1
    }
    else if (tipo == 'contrato') {
      this.tamanio_paginaMul = e.pageSize;
      this.numero_paginaMul = e.pageIndex + 1
    }
    else if (tipo == 'cargo') {
      this.tamanio_paginaMulCargo = e.pageSize;
      this.numero_paginaMulCargo = e.pageIndex + 1
    }
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    //NIVELES DEPARTAMENTO
    this.DatosNivelesDep = [];

    //CONTRATOS
    this.DatosContrato = [];
    this.archivoSubido = [];
    this.nameFile = '';
    this.archivoForm.reset();
    this.mostrarbtnsubir = false;
    this.messajeExcel = '';

    //CARGOS
    this.nameFileCargo = '';
    this.archivoSubidoCargo = [];
    this.DatosCargos = [];
    this.messajeExcelCargos = '';
  }

  // VARIABLES DE MANEJO DE PLANTILLA DE DATOS
  nameFile: string;
  archivoSubido: Array<File>;
  mostrarbtnsubir: boolean = false;


  /** ************************************************************************************************************* **
   ** **                       TRATAMIENTO DE PLANTILLA DE NIVELES DE DEPARTAMENTO                               ** **
   ** ************************************************************************************************************* **/
  // METODO PARA VALIDAR DATOS DE PLANTILLA
  DatosNivelesDep: any
  listaNivelesCorrectas: any = [];
  messajeExcel: string = '';
  RevisarplantillaNiveles() {
    this.listaNivelesCorrectas = [];
    this.DatosNivelesDep = [];
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads", this.archivoSubido[i], this.archivoSubido[i].name);
    }
    this.progreso = true;
    this.restDep.RevisarFormatoNivelDep(formData).subscribe(res => {
      this.DatosNivelesDep = res.data;
      this.messajeExcel = res.message;
      this.DatosNivelesDep.sort((a: any, b: any) => {
        if (a.observacion !== 'ok' && b.observacion === 'ok') {
          return -1;
        }
        if (a.observacion === 'ok' && b.observacion !== 'ok') {
          return 1;
        }
        return 0;
      });

      if (this.messajeExcel == 'error') {
        this.DatosNivelesDep = [];
        this.toastr.error('Revisar que la numeración de la columna "item" sea correcta.', 'Plantilla no aceptada.', {
          timeOut: 4500,
        });
        this.mostrarbtnsubir = false;
      }
      else if (this.messajeExcel == 'no_existe') {
        this.DatosNivelesDep = [];
        this.toastr.error('No se ha encontrado pestaña EMPLEADOS_CONTRATOS en la plantilla.', 'Plantilla no aceptada.', {
          timeOut: 4500,
        });
        this.mostrarbtnsubir = false;
      }
      else {
        this.DatosNivelesDep.forEach((item: any) => {
          if (item.observacion.toLowerCase() == 'ok') {
            this.listaNivelesCorrectas.push(item);
          }
        });
        this.nivelesDepartamentoCorrectos = this.listaNivelesCorrectas.length;
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

  // METODO PARA REGISTRAR NIVELES DE DEPARTAMENTOS
  RegistrarDepaNiveles() {
    if (this.listaNivelesCorrectas.length > 0) {
      const datos = {
        plantilla: this.listaNivelesCorrectas,
        user_name: this.user_name,
        ip: this.ip
      }
      this.restDep.SubirDepaNivel(datos).subscribe({
        next: (response) => {
          this.toastr.success('Plantilla de Nivel departamentos importada.', 'Operación exitosa.', {
            timeOut: 3000,
          });
          this.LimpiarCampos();
          this.ngOnInit();
          this.archivoForm.reset();
          this.nameFile = '';
        },
        error: (error) => {
          this.toastr.error('No se pudo cargar la plantilla.', 'Ups!!! algo salio mal.', {
            timeOut: 4000,
          });
          this.progreso = false;
        }
      });
    } else {
      this.toastr.error('No se ha encontrado datos para su registro.', 'Plantilla procesada.', {
        timeOut: 4000,
      });
      this.archivoForm.reset();
      this.nameFile = '';
    }
  }


  /** ************************************************************************************************************* **
   ** **                       TRATAMIENTO DE PLANTILLA DE CONTRATOS DE EMPLEADOS                                ** **
   ** ************************************************************************************************************* **/

  // METODO PARA SELECCIONAR PLANTILLA DE DATOS DE CONTRATOS EMPLEADOS
  FileChange(element: any, tipo: string) {
    this.numero_paginaMul = 1;
    this.tamanio_paginaMul = 5;
    this.numero_paginaDepaNivel = 1;
    this.tamanio_paginaDepaNivel = 5;
    this.archivoSubido = [];
    this.nameFile = '';
    this.archivoSubido = element.target.files;
    this.nameFile = this.archivoSubido[0].name;
    let arrayItems = this.nameFile.split(".");
    let itemExtencion = arrayItems[arrayItems.length - 1];
    let itemName = arrayItems[0];
    if (itemExtencion == 'xlsx' || itemExtencion == 'xls') {
      if (itemName.toLowerCase().startsWith('plantillaconfiguraciongeneral')) {
        this.numero_paginaMul = 1;
        this.tamanio_paginaMul = 5;
        if (tipo == 'niveles') {
          this.RevisarplantillaNiveles();
        } else {
          this.Revisarplantilla();
        }
      } else {
        this.toastr.error('Seleccione plantilla con nombre plantillaConfiguracionGeneral.', 'Plantilla seleccionada incorrecta', {
          timeOut: 6000,
        });

        this.nameFile = '';
      }
    } else {
      this.toastr.error('Error en el formato del documento.', 'Plantilla no aceptada.', {
        timeOut: 6000,
      });
      this.nameFile = '';
    }
    this.archivoForm.reset();
    this.mostrarbtnsubir = true;
  }

  // METODO PARA REVISAR DATOS DE PLANTILLA DE CONTRATOS
  DatosContrato: any
  listaContratosCorrectas: any = [];
  Revisarplantilla() {
    this.listaContratosCorrectas = [];
    this.DatosContrato = [];
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads", this.archivoSubido[i], this.archivoSubido[i].name);
    }
    this.progreso = true;
    this.restE.RevisarFormato(formData).subscribe(res => {
      this.DatosContrato = res.data;
      this.messajeExcel = res.message;
      this.DatosContrato.sort((a: any, b: any) => {
        if (a.observacion !== 'ok' && b.observacion === 'ok') {
          return -1;
        }
        if (a.observacion === 'ok' && b.observacion !== 'ok') {
          return 1;
        }
        return 0;
      });

      if (this.messajeExcel == 'error') {
        this.DatosContrato = [];
        this.toastr.error('Revisar que la numeración de la columna "item" sea correcta.', 'Plantilla no aceptada.', {
          timeOut: 4500,
        });
        this.mostrarbtnsubir = false;
      }
      else if (this.messajeExcel == 'no_existe') {
        this.DatosContrato = [];
        this.toastr.error('No se ha encontrado pestaña EMPLEADOS_CONTRATOS en la plantilla.', 'Plantilla no aceptada.', {
          timeOut: 4500,
        });
        this.mostrarbtnsubir = false;
      }
      else {
        this.DatosContrato.forEach((item: any) => {
          if (item.observacion.toLowerCase() == 'ok') {
            this.listaContratosCorrectas.push(item);
          }
        });
        this.contratosCorrectos = this.listaContratosCorrectas.length;
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

  // FUNCION PARA CONFIRMAR EL REGISTRO MULTIPLE DE DATOS DEL ARCHIVO EXCEL
  ConfirmarRegistroMultiple() {
    const mensaje = 'registro';
    this.ventana.open(MetodosComponent, { width: '450px', data: mensaje }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          if (this.listaContratosCorrectas.length > 0) {
            this.RegistroContratos();
          } else if (this.listaNivelesCorrectas.length > 0) {
            this.RegistrarDepaNiveles();
          }

        }
      });
  }

  // METODO PARA REGISTRAR DATOS DE CONTRATO
  RegistroContratos() {
    if (this.listaContratosCorrectas.length > 0) {
      const datos = {
        plantilla: this.listaContratosCorrectas,
        user_name: this.user_name,
        ip: this.ip
      }
      this.restE.SubirArchivoExcelContrato(datos).subscribe({
        next: (response) => {
          this.toastr.success('Plantilla de Contratos importada.', 'Operación exitosa.', {
            timeOut: 3000,
          });
          this.LimpiarCampos();
          this.ngOnInit();
          this.archivoForm.reset();
          this.nameFile = '';
        },
        error: (error) => {
          this.toastr.error('No se pudo cargar la plantilla.', 'Ups!!! algo salio mal.', {
            timeOut: 4000,
          });
          this.progreso = false;
        }
      });

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
  EstiloCeldaNivel(observacion: string): string {
    if (observacion == 'Registro duplicado') {
      return 'rgb(156, 214, 255)';
    }
    else if (observacion == 'ok') {
      return 'rgb(159, 221, 154)';
    }
    else if (observacion == 'Ya existe en el sistema') {
      return 'rgb(239, 203, 106)';
    }
    else if (observacion == 'Departamento superior ya esta configurado dentro de la plantilla') {
      return 'rgb(170, 129, 236)';
    }
    else if (observacion == 'Sucursal no existe en el sistema' ||
      observacion == 'Departamento no existe en el sistema' ||
      observacion == 'Departamento superior no existe en el sistema' ||
      observacion == 'Sucursal superior no existe en el sistema') {
      return 'rgb(255, 192, 203)';
    }
    else if (observacion == 'Departamento no pertenece al establecimiento' ||
      observacion == 'Departamento no pertenece a la sucursal' ||
      observacion == 'El nivel no puede ser 0 ni mayor a 5' ||
      observacion == 'Faltan niveles por registrar' ||
      observacion == 'Departamento superior ya se encuentra configurado' ||
      observacion == 'Departamento superior no pertenece a la sucursal') {
      return 'rgb(238, 34, 207)';
    }
    else if (observacion == 'Nivel incorrecto (solo números)') {
      return 'rgb(222, 162, 73)';
    }
    else {
      return 'rgb(242, 21, 21)';
    }
  }

  // METODO PARA DAR COLOR A LAS CELDAS Y REPRESENTAR LAS VALIDACIONES
  EstiloCelda(observacion: string): string {
    let arrayObservacion = observacion.split(" ");
    if (observacion == 'Fecha duplicada') {
      return 'rgb(170, 129, 236)';
    }
    else if (observacion == 'ok') {
      return 'rgb(159, 221, 154)';
    }
    else if (observacion == 'Cédula no existe en el sistema' ||
      observacion == 'Cargo no existe en el sistema' ||
      observacion == 'Departamento no existe en el sistema' ||
      observacion == 'Sucursal no existe en el sistema' ||
      observacion == 'Cédula no tiene registrado un contrato') {
      return 'rgb(255, 192, 203)';
    }
    else if (observacion == 'Registro duplicado (cédula)') {
      return 'rgb(156, 214, 255)';
    }
    else if (arrayObservacion[0] == 'Formato') {
      return 'rgb(222, 162, 73)';
    }
    else if (observacion == 'País no existe en el sistema' ||
      observacion == 'Régimen Laboral no existe en el sistema' ||
      observacion == 'Modalidad Laboral no existe en el sistema') {
      return 'rgb(255, 192, 203)';
    }
    else if (observacion == 'Existe un cargo en esas fechas' ||
      observacion == 'Existe un contrato vigente en esas fechas') {
      return 'rgb(239, 203, 106)';
    }
    else if (observacion == 'País no corresponde con el Régimen Laboral' ||
      observacion == 'La fecha desde no puede ser mayor o igual a la fecha hasta' ||
      observacion == 'Departamento no pertenece a la sucursal') {
      return 'rgb(238, 34, 207)';
    }
    else if (arrayObservacion[1] + ' ' + arrayObservacion[2] == 'no registrado') {
      return 'rgb(242, 21, 21)';
    }
    else if (arrayObservacion[2] + ' ' + arrayObservacion[3] == 'no registrado') {
      return 'rgb(242, 21, 21)';
    }
    else if (observacion == 'Control de asistencia es incorrecto' ||
      'Control de vacaciones es incorrecto' ||
      observacion == 'Columna jefe formato incorrecto') {
      return 'rgb(222, 162, 73)';
    }
    else {
      return 'rgb(242, 21, 21)';
    }
  }

  colorTexto: string = '';
  EstiloTextoCelda(texto: string): string {
    if (texto == 'No registrado') {
      return 'rgb(255, 80, 80)';
    } else {
      return 'black'
    }
  }

  /** ************************************************************************************************************* **
   ** **                        TRATAMIENTO DE PLANTILLA DE CARGOS DE EMPLEADOS                                  ** **
   ** ************************************************************************************************************* **/
  // METODO PARA SELECCIONAR PLANTILLA DE DATOS DE CARGOS EMPLEADOS
  nameFileCargo: string;
  archivoSubidoCargo: Array<File>;

  DatosCargos: any
  listaCargosCorrectas: any = [];
  messajeExcelCargos: string = '';
  FileChangeCargo(element: any) {
    this.numero_paginaMulCargo = 1;
    this.tamanio_paginaMulCargo = 5;
    this.archivoSubidoCargo = [];
    this.nameFileCargo = '';
    this.archivoSubidoCargo = element.target.files;
    this.nameFileCargo = this.archivoSubidoCargo[0].name;
    let arrayItems = this.nameFileCargo.split(".");
    let itemExtencion = arrayItems[arrayItems.length - 1];
    let itemName = arrayItems[0];
    if (itemExtencion == 'xlsx' || itemExtencion == 'xls') {
      if (itemName.toLowerCase().startsWith('plantillaconfiguraciongeneral')) {
        this.numero_paginaMul = 1;
        this.tamanio_paginaMul = 5;
        this.RevisarplantillaCargo();
      } else {
        this.toastr.error('Seleccione plantilla con nombre plantillaConfiguracionGeneral.', 'Plantilla seleccionada incorrecta.', {
          timeOut: 6000,
        });

        this.nameFile = '';
      }
    } else {
      this.toastr.error('Error en el formato del documento.', 'Plantilla no aceptada.', {
        timeOut: 6000,
      });

      this.nameFile = '';
    }
    this.archivoForm.reset();
    this.mostrarbtnsubir = true;
  }

  // FUNCION PARA CONFIRMAR EL REGISTRO MULTIPLE DE DATOS DEL ARCHIVO EXCEL
  ConfirmarRegistroMultipleCargos() {
    const mensaje = 'registro';
    console.log('listaCargosCorrectas: ', this.listaCargosCorrectas);
    this.ventana.open(MetodosComponent, { width: '450px', data: mensaje }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.RegistroCargos();
        }
      });
  }

  // METODO DE VERIFICACION DE DATOS DE PLANTILLA DE CARGOS
  RevisarplantillaCargo() {
    this.listaCargosCorrectas = [];
    this.DatosCargos = [];
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubidoCargo.length; i++) {
      formData.append("uploads", this.archivoSubidoCargo[i], this.archivoSubidoCargo[i].name);
    }
    this.progreso = true;
    console.log('formData: ',formData);
    this.restCa.RevisarFormato(formData).subscribe(res => {
      this.DatosCargos = res.data;
      this.messajeExcelCargos = res.message;
      if(this.DatosCargos?.length > 0){
        this.DatosCargos.sort((a: any, b: any) => {
          if (a.observacion !== 'ok' && b.observacion === 'ok') {
            return -1;
          }
          if (a.observacion === 'ok' && b.observacion !== 'ok') {
            return 1;
          }
          return 0;
        });
      }
      
      if (this.messajeExcelCargos == 'error') {
        this.DatosCargos = [];
        this.toastr.error('Revisar que la numeración de la columna "item" sea correcta.', 'Plantilla no aceptada.', {
          timeOut: 4500,
        });
        this.mostrarbtnsubir = false;

      }
      else if (this.messajeExcel == 'no_existe') {
        this.DatosContrato = [];
        this.toastr.error('No se ha encontrado pestaña EMPLEADOS_CARGOS en la plantilla.', 'Plantilla no aceptada.', {
          timeOut: 4500,
        });
        this.mostrarbtnsubir = false;
      }
      else {
        this.DatosCargos.forEach((item: any) => {
          if (item.observacion.toLowerCase() == 'ok') {
            this.listaCargosCorrectas.push(item);
          }
        });
        this.cargosCorrectos = this.listaCargosCorrectas.length;
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

  // METODO PARA REGISTRAR DATOS DE CARGOS
  RegistroCargos() {
    if (this.listaCargosCorrectas.length > 0) {
      const datos = {
        plantilla: this.listaCargosCorrectas,
        user_name: this.user_name,
        ip: this.ip
      }
      this.restCa.SubirArchivoExcelCargo(datos).subscribe({
        next: (response) => {
          console.log('respuesta: ',response)
          this.toastr.success('Plantilla de Cargos importada.', 'Operación exitosa.', {
            timeOut: 3000,
          });
          this.LimpiarCampos();
          this.ngOnInit();
          this.archivoForm.reset();
          this.nameFile = '';
        },
        error: (error) => {
          this.toastr.error('No se pudo cargar la plantilla.', 'Ups!!! algo salio mal', {
            timeOut: 4000,
          });
          this.progreso = false;
        }
      });
    } else {
      this.toastr.error('No se ha encontrado datos para su registro.', 'Plantilla procesada.', {
        timeOut: 4000,
      });
      this.archivoForm.reset();
      this.nameFile = '';
    }
  }

  //CONTROL BOTONES
  getCargarContratos(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Cargar Datos Contratos');
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 1);
    }
  }

  getCargarCargos(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Cargar Datos Cargos');
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 1);
    }
  }

  getCargarNivelDepartamentos(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Cargar Datos Nivel departamentos');
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 1);
    }
  }

}
