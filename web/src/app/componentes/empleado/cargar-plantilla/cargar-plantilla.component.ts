import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { environment } from 'src/environments/environment';
import { MetodosComponent } from '../../administracionGeneral/metodoEliminar/metodos.component';
import { EmplCargosService } from 'src/app/servicios/empleado/empleadoCargo/empl-cargos.service';

@Component({
  selector: 'app-cargar-plantilla',
  templateUrl: './cargar-plantilla.component.html',
  styleUrls: ['./cargar-plantilla.component.css']
})
export class CargarPlantillaComponent {

  archivoForm = new FormControl('', Validators.required);
  // VARIABLE PARA TOMAR RUTA DEL SISTEMA
  hipervinculo: string = environment.url

  // ITEMS DE PAGINACION DE LA TABLA
  pageSizeOptions = [5, 10, 20, 50];
  tamanio_paginaMul: number = 5;
  numero_paginaMul: number = 1;

  tamanio_paginaMulCargo: number = 5;
  numero_paginaMulCargo: number = 1;

  // VARIABLES PROGRESS SPINNER
  progreso: boolean = false;
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 10;

  constructor(
    public restCa: EmplCargosService,
    public restE: EmpleadoService, // SERVICIO DATOS DE EMPLEADO
    public ventana: MatDialog, // VARIABLE DE MANEJO DE VENTANAS
    private toastr: ToastrService, // VARIABLE DE MENSAJES DE NOTIFICACIONES
    private router: Router, // VARIABLE DE MANEJO DE TUTAS URL
  ) {
    this.DatosContrato = [];
    this.DatosCargos = [];
  }

   // EVENTO PARA MOSTRAR FILAS DETERMINADAS EN LA TABLA
  ManejarPaginaMulti(e: PageEvent) {
    this.tamanio_paginaMul = e.pageSize;
    this.numero_paginaMul = e.pageIndex + 1
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    console.log('entro en limpiar')
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
  // METODO PARA SELECCIONAR PLANTILLA DE DATOS DE FERIADOS -----------------------------------------------------------------
  FileChange(element: any) {
    this.archivoSubido = [];
    this.nameFile = '';
    this.archivoSubido = element.target.files;
    this.nameFile = this.archivoSubido[0].name;
    let arrayItems = this.nameFile.split(".");
    let itemExtencion = arrayItems[arrayItems.length - 1];
    let itemName = arrayItems[0].slice(0, 25);
    console.log('itemName: ', itemName);
    if (itemExtencion == 'xlsx' || itemExtencion == 'xls') {
      if (itemName.toLowerCase() == 'contratos') {
        this.numero_paginaMul = 1;
        this.tamanio_paginaMul = 5;
        this.Revisarplantilla();
      } else {
        this.toastr.error('Seleccione plantilla con nombre Contratos', 'Plantilla seleccionada incorrecta', {
          timeOut: 6000,
        });

        this.nameFile = '';
      }
    } else {
      this.toastr.error('Error en el formato del documento', 'Plantilla no aceptada', {
        timeOut: 6000,
      });

      this.nameFile = '';
    }
    this.archivoForm.reset();
    this.mostrarbtnsubir = true;
  }

  DatosContrato: any
  listaContratosCorrectas: any = [];
  messajeExcel: string = '';
  Revisarplantilla(){
    this.listaContratosCorrectas = [];
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads", this.archivoSubido[i], this.archivoSubido[i].name);
    }

    this.progreso = true;

    this.restE.RevisarFormato(formData).subscribe(res => {
      console.log('plantilla contrato', res);
      this.DatosContrato = res.data;
      this.messajeExcel = res.message;

      if (this.messajeExcel == 'error') {
        this.toastr.error('Revisar que la numeración de la columna "item" sea correcta.', 'Plantilla no aceptada.', {
          timeOut: 4500,
        });
        this.mostrarbtnsubir = false;
      } else {
        this.DatosContrato.forEach(item => {
          if (item.observacion.toLowerCase() == 'ok') {
            this.listaContratosCorrectas.push(item);
          }
        });
      }

    }, error => {
      console.log('Serivicio rest -> metodo RevisarFormato - ', error);
      this.toastr.error('Error al cargar los datos.', 'Plantilla no aceptada.', {
        timeOut: 4000,
      });
      this.progreso = false;
    }, () => {
      this.progreso = false;
    });
  }

  //FUNCION PARA CONFIRMAR EL REGISTRO MULTIPLE DE LOS FERIADOS DEL ARCHIVO EXCEL
  ConfirmarRegistroMultiple() {
    const mensaje = 'registro';
    console.log('listaContratosCorrectas: ', this.listaContratosCorrectas.length);
    this.ventana.open(MetodosComponent, { width: '450px', data: mensaje }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.registroContratos();
        }
      });
  }

  registroContratos(){
    if (this.listaContratosCorrectas.length > 0) {
      this.restE.subirArchivoExcelContrato(this.listaContratosCorrectas).subscribe(response => {
        console.log('respuesta: ',response);
        this.toastr.success('Operación exitosa.', 'Plantilla de Contratos importada.', {
          timeOut: 3000,
        });
        window.location.reload();
        this.archivoForm.reset();
        this.nameFile = '';
      });
    }else {
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
    if (observacion == 'Fecha duplicada') {
      return 'rgb(170, 129, 236)';
    } else if (observacion == 'ok') {
      return 'rgb(159, 221, 154)';
    } else if (observacion == 'Cédula no existe en el sistema' || 
      observacion == 'Sucursal no existe en el sistema' ||
      observacion == 'Departamento no existe en el sistema' ||
      observacion == 'Cargo no existe en el sistema' ||
      observacion == 'Cédula no tiene registrado un contrato') {
      return 'rgb(255, 192, 203)';
    } else if (observacion == 'Registro duplicado - cédula') {
      return 'rgb(156, 214, 255)';
    } else if (arrayObservacion[0] == 'Formato') {
      return 'rgb(230, 176, 96)';
    } else if (observacion == 'Pais ingresado no se encuentra registrado' ||
      observacion == 'Regimen ingresado no se encuentra registrado' ||
      observacion == 'Modalidad trabajo no se encuentra registrado' 
    ) {
      return 'rgb(242, 21, 21)';
    }else if(observacion == 'Existe un cargo vigente en esas fechas' || 
    observacion == 'Existe un contrato vigente en esas fechas'){
      return 'rgb(239, 203, 106)';
    }else if (observacion == 'Regimen no corresponde al pais'){
      return 'rgb(238, 34, 207)';
    }else if (arrayObservacion[1]+' '+arrayObservacion[2] == 'no registrado'){
      return 'rgb(242, 21, 21)';
    }else {
      return 'white'
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
      


  //CARGOS
   // METODO PARA SELECCIONAR PLANTILLA DE DATOS DE FERIADOS -----------------------------------------------------------------
   nameFileCargo: string;
   archivoSubidoCargo: Array<File>;

    DatosCargos: any
    listaCargosCorrectas: any = [];
    messajeExcelCargos: string = '';
   FileChangeCargo(element: any) {
    this.archivoSubidoCargo = [];
    this.nameFileCargo = '';
    this.archivoSubidoCargo = element.target.files;
    this.nameFileCargo = this.archivoSubidoCargo[0].name;
    let arrayItems = this.nameFileCargo.split(".");
    let itemExtencion = arrayItems[arrayItems.length - 1];
    let itemName = arrayItems[0].slice(0, 25);
    console.log('itemName: ', itemName);
    if (itemExtencion == 'xlsx' || itemExtencion == 'xls') {
      if (itemName.toLowerCase() == 'cargos') {
        this.numero_paginaMul = 1;
        this.tamanio_paginaMul = 5;
        this.RevisarplantillaCargo();
      } else {
        this.toastr.error('Seleccione plantilla con nombre Cargos', 'Plantilla seleccionada incorrecta', {
          timeOut: 6000,
        });

        this.nameFile = '';
      }
    } else {
      this.toastr.error('Error en el formato del documento', 'Plantilla no aceptada', {
        timeOut: 6000,
      });

      this.nameFile = '';
    }
    this.archivoForm.reset();
    this.mostrarbtnsubir = true;
  }

  //FUNCION PARA CONFIRMAR EL REGISTRO MULTIPLE DE LOS FERIADOS DEL ARCHIVO EXCEL
  ConfirmarRegistroMultipleCargos(){
    const mensaje = 'registro';
    console.log('listaCargosCorrectas: ',this.listaCargosCorrectas.length);
    this.ventana.open(MetodosComponent, { width: '450px', data: mensaje }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.registroCargos();
        }
      });
  }

  RevisarplantillaCargo(){
    this.listaContratosCorrectas = [];
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubidoCargo.length; i++) {
      formData.append("uploads", this.archivoSubidoCargo[i], this.archivoSubidoCargo[i].name);
    }

    this.progreso = true;

    this.restCa.RevisarFormato(formData).subscribe(res => {
      console.log('plantilla cargo', res);
      this.DatosCargos = res.data;
      this.messajeExcelCargos = res.message;

      if (this.messajeExcelCargos == 'error') {
        this.toastr.error('Revisar que la numeración de la columna "item" sea correcta.', 'Plantilla no aceptada.', {
          timeOut: 4500,
        });
        this.mostrarbtnsubir = false;
      } else {
        this.DatosCargos.forEach(item => {
          if (item.observacion.toLowerCase() == 'ok') {
            this.listaCargosCorrectas.push(item);
          }
        });
      }

    }, error => {
      console.log('Serivicio rest -> metodo RevisarFormato - ', error);
      this.toastr.error('Error al cargar los datos.', 'Plantilla no aceptada.', {
        timeOut: 4000,
      });
      this.progreso = false;
    }, () => {
      this.progreso = false;
    });

  }

  registroCargos(){
    if (this.listaCargosCorrectas.length > 0) {
      this.restCa.subirArchivoExcelCargo(this.listaCargosCorrectas).subscribe(response => {
        console.log('respuesta: ',response);
        this.toastr.success('Operación exitosa.', 'Plantilla de Contratos importada.', {
          timeOut: 3000,
        });
        window.location.reload();
        this.archivoForm.reset();
        this.nameFile = '';
      });
    }else {
      this.toastr.error('No se ha encontrado datos para su registro.', 'Plantilla procesada.', {
        timeOut: 4000,
      });
      this.archivoForm.reset();
      this.nameFile = '';
    }
  }

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

}
