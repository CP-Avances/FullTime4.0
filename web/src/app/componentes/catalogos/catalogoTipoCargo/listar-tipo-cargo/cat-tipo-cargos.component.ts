import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { MetodosComponent } from '../../../administracionGeneral/metodoEliminar/metodos.component';
import { PageEvent } from '@angular/material/paginator';
import { CatTipoCargosService } from 'src/app/servicios/catalogos/catTipoCargos/cat-tipo-cargos.service';
import { RegistrarCargoComponent } from '../registrar-cargo/registrar-cargo.component';
import { EditarTipoCargoComponent } from '../editar-tipo-cargo/editar-tipo-cargo.component';


@Component({
  selector: 'app-cat-tipo-cargos',
  templateUrl: './cat-tipo-cargos.component.html',
  styleUrls: ['./cat-tipo-cargos.component.css']
})
export class CatTipoCargosComponent {

  archivoForm = new FormControl('', Validators.required);

  // VARIABLE PARA TOMAR RUTA DEL SISTEMA
  hipervinculo: string = environment.url

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_paginaMul: number = 5;
  numero_paginaMul: number = 1;

  // VARIABLES PROGRESS SPINNER
  progreso: boolean = false;
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 10;

  listaTipoCargos: any

  constructor(
    private _TipoCargos: CatTipoCargosService,
    public ventana: MatDialog, // VARIABLE DE MANEJO DE VENTANAS
    private toastr: ToastrService, // VARIABLE DE MENSAJES DE NOTIFICACIONES
  ){}

  ngOnInit(){
    this.listaTipoCargos = [];
    this._TipoCargos.listaCargos().subscribe(res =>{
      console.log('lista> ',res);
      this.listaTipoCargos = res
    }, error => {
      console.log('Serivicio rest -> metodo RevisarFormato - ', error);
      this.toastr.error('Error al cargar los datos', 'Listado de Tipo Cargos', {
        timeOut: 4000,
      });
    });
  }

  LimpiarCampos() {
    this.Datos_tipo_cargos = null;
    this.archivoSubido = [];
    this.nameFile = '';
    this.ngOnInit();
    this.archivoForm.reset();
    this.mostrarbtnsubir = false;
    this.messajeExcel = '';
  }

  AbrirVentanaRegistrarCargo(): void{
    this.ventana.open(RegistrarCargoComponent, { width: '500px' })
      .afterClosed().subscribe(items => {
        this.ngOnInit();
      });
  }
  AbrirEditar(item_cargo: any): void{
    this.ventana.open(EditarTipoCargoComponent, { width: '450px', data: item_cargo })
      .afterClosed().subscribe(items => {
        this.ngOnInit();
      });
  }

  ConfirmarDelete(cargo: any){
    const mensaje = 'eliminar';
    this.ventana.open(MetodosComponent, { width: '450px', data: mensaje }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this._TipoCargos.eliminar(cargo.id).subscribe(res => {
            console.log('res eliminado: ',res);
            this.toastr.error(cargo.cargo+' se elimino', res.message, {
              timeOut: 4000,
            });
            this.ngOnInit();
          }, error => {
            if(error.error.code == "23503"){
              this.toastr.error(cargo.cargo+" todavía es referida desde la tabla «empl_cargos».",'Error al eliminar dato', {
                timeOut: 4000,
              });
            }else{
              this.toastr.error(error.error.message,'Error al eliminar dato', {
                timeOut: 4000,
              });
            }
          })
        }
      });
  }

  // CONTROL DE PAGINACION
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1
  }

  // EVENTO PARA MOSTRAR FILAS DETERMINADAS EN LA TABLA
  ManejarPaginaMulti(e: PageEvent) {
    this.tamanio_paginaMul = e.pageSize;
    this.numero_paginaMul = e.pageIndex + 1
  }

  // VARIABLES DE MANEJO DE PLANTILLA DE DATOS
  nameFile: string;
  archivoSubido: Array<File>;
  mostrarbtnsubir: boolean = false;
  // METODO PARA SELECCIONAR PLANTILLA DE DATOS -----------------------------------------------------------------
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
      if (itemName.toLowerCase() == 'modalidad_cargo') {
        this.numero_paginaMul = 1;
        this.tamanio_paginaMul = 5;
        this.Revisarplantilla();
      } else {
        this.toastr.error('Seleccione plantilla con nombre modalidad_cargo', 'Plantilla seleccionada incorrecta', {
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


  Datos_tipo_cargos: any
  listaCargosCorrectas: any = [];
  messajeExcel: string = '';
  Revisarplantilla(){
    this.listaCargosCorrectas = [];
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads", this.archivoSubido[i], this.archivoSubido[i].name);
    }

    this.progreso = true;

    // VERIFICACIÓN DE DATOS FORMATO - DUPLICIDAD DENTRO DEL SISTEMA
    this._TipoCargos.RevisarFormato(formData).subscribe(res => {
      this.Datos_tipo_cargos = res.data;
      this.messajeExcel = res.message;
      console.log('probando plantilla tipo cargos', this.Datos_tipo_cargos);

      if (this.messajeExcel == 'error') {
        this.toastr.error('Revisar que la numeración de la columna "item" sea correcta.', 'Plantilla no aceptada.', {
          timeOut: 4500,
        });
        this.mostrarbtnsubir = false;
      } else {
        this.Datos_tipo_cargos.forEach(item => {
          if (item.observacion.toLowerCase() == 'ok') {
            this.listaCargosCorrectas.push(item);
          }
        });
      }
    }, error => {
      console.log('Serivicio rest -> metodo RevisarFormato - ', error);
      this.toastr.error('Error al cargar los datos', 'Plantilla no aceptada', {
        timeOut: 4000,
      });
      this.progreso = false;
    }, () => {
      this.progreso = false;
    });
  }

  // METODO PARA DAR COLOR A LAS CELDAS Y REPRESENTAR LAS VALIDACIONES
  colorCelda: string = ''
  stiloCelda(observacion: string): string {
    let arrayObservacion = observacion.split(" ");
    if (observacion == 'Registro duplicado') {
      return 'rgb(156, 214, 255)';
    } else if (observacion == 'ok') {
      return 'rgb(159, 221, 154)';
    } else if (observacion == 'Ya existe en el sistema') {
      return 'rgb(239, 203, 106)';
    } else if (arrayObservacion[0] == 'Cargo ') {
      return 'rgb(242, 21, 21)';
    } else {
      return 'white'
    }
  }
  colorTexto: string = '';
  stiloTextoCelda(texto: string): string {
    let arrayObservacion = texto.split(" ");
    if (arrayObservacion[0] == 'No') {
      return 'rgb(255, 80, 80)';
    } else {
      return 'black'
    }
  }

  //FUNCION PARA CONFIRMAR EL REGISTRO MULTIPLE DE LOS FERIADOS DEL ARCHIVO EXCEL
  ConfirmarRegistroMultiple() {
    const mensaje = 'registro';
    console.log('listaCargosCorrectas: ', this.listaCargosCorrectas.length);
    this.ventana.open(MetodosComponent, { width: '450px', data: mensaje }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.subirDatosPlantillaModal()
        }
      });
  }

  subirDatosPlantillaModal(){
    if (this.listaCargosCorrectas.length > 0) {
      this._TipoCargos.subirArchivoExcel(this.listaCargosCorrectas).subscribe(response => {
        console.log('respuesta: ',response);
        this.toastr.success('Operación exitosa.', 'Plantilla de Tipo Cargos importada.', {
          timeOut: 2500,
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

  //Control Botones
  getCrearTipoCargo(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Crear Tipo Cargo');
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 1);
    }
  }

  getEditarTipoCargo(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Editar Tipo Cargo');
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 1);
    }
  }

  getEliminarTipoCargo(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Eliminar Tipo Cargo');
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 1);
    }
  }

  getCargarPlantillaTipoCargo(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Cargar Plantilla Tipo Cargo');
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 1);
    }
  }

  getDescargarReportesTipoCargo(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Descargar Reportes Tipo Cargo');
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 1);
    }
  }

}
