import { Component, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-ingresar-procesos',
  templateUrl: './ingresar-procesos.component.html',
  styleUrl: './ingresar-procesos.component.scss'
})
export class IngresarProcesosComponent {

    @ViewChild(MatPaginator) paginator: MatPaginator;
  
    archivoForm = new FormControl('', Validators.required);
    // VARIABLE PARA TOMAR RUTA DEL SISTEMA
    hipervinculo: string = environment.url

    // VARIABLES DE MANEJO DE PLANTILLA DE DATOS
    nameFile: string;
    archivoSubido: Array<File>;
    mostrarbtnsubir: boolean = false;

     // ITEMS DE PAGINACION DE LA TABLA
    pageSizeOptions = [5, 10, 20, 50];
    tamanio_paginaMul: number = 5;
    numero_paginaMul: number = 1;

    DatosProcesos: any
    DatosGrado: any

    constructor(
      public ventana: MatDialog, // VARIABLE DE MANEJO DE VENTANAS
      private toastr: ToastrService, // VARIABLE DE MENSAJES DE NOTIFICACIONES
      public validar: ValidacionesService,
    ) {

    }

   // METODO PARA LIMPIAR FORMULARIO
   LimpiarCampos() {

  }

  
    /** ************************************************************************************************************* **
   ** **                       TRATAMIENTO DE PLANTILLA DE CONTRATOS DE EMPLEADOS                                ** **
   ** ************************************************************************************************************* **/
   // METODO PARA SELECCIONAR PLANTILLA DE DATOS DE CARGOS EMPLEADOS
   nameFileCargo: string;
   archivoSubidoCargo: Array<File>;
 
   
   listaGradoCorrectas: any = [];
   messajeExcel: string = '';
  // METODO PARA SELECCIONAR PLANTILLA DE DATOS DE CONTRATOS EMPLEADOS
  FileChange(element: any, tipo: string) {
    this.numero_paginaMul = 1;
    this.tamanio_paginaMul = 5;
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
          //this.RevisarplantillaNiveles();
        } else {
          //this.Revisarplantilla();
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

  // FUNCION PARA CONFIRMAR EL REGISTRO MULTIPLE DE DATOS DEL ARCHIVO EXCEL
  ConfirmarRegistroMultiple() {}


}
