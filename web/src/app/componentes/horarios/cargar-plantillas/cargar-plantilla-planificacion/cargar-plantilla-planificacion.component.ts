//IMPORTAR LIBRERIAS
import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import moment, { Moment } from 'moment';
import * as XLSX from 'xlsx';

//IMPORTAR SERVICIOS

//IMPORTAR COMPONENTES
import { HorarioMultipleEmpleadoComponent } from '../../rango-fechas/horario-multiple-empleado/horario-multiple-empleado.component';
import { BuscarPlanificacionComponent } from '../../rango-fechas/buscar-planificacion/buscar-planificacion.component';
import { SpinnerService } from 'src/app/servicios/spinner/spinner.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-cargar-plantilla-planificacion',
  templateUrl: './cargar-plantilla-planificacion.component.html',
  styleUrls: ['./cargar-plantilla-planificacion.component.css']
})
export class CargarPlantillaPlanificacionComponent  implements OnInit{

  @Input() datosSeleccionados: any;

  // FECHAS DE BUSQUEDA
  fechaInicialF = new FormControl;
  fechaFinalF = new FormControl();
  fecHorario: boolean = true;

  // ITEMS DE PAGINACION DE LA TABLA EMPLEADOS
  pageSizeOptions_emp = [5, 10, 20, 50];
  tamanio_pagina_emp: number = 5;
  numero_pagina_emp: number = 1;

  archivo1Form = new FormControl('');

  // VARIABLES USADAS EN SELECCION DE ARCHIVOS
  archivo: Array<File>;
  nombreArchivo: string;

  constructor(
    public componentem: HorarioMultipleEmpleadoComponent,
    public componenteb: BuscarPlanificacionComponent,
    private spinnerService: SpinnerService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    console.log(this.datosSeleccionados.usuarios);
  }


  // METODO PARA MOSTRAR FECHA SELECCIONADA
  FormatearFecha(fecha: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = fecha;
    let inicio = moment(ctrlValue).format('01/MM/YYYY');
    let final = moment(ctrlValue).daysInMonth() + moment(ctrlValue).format('/MM/YYYY');
    this.fechaInicialF.setValue(moment(inicio, 'DD/MM/YYYY'));
    this.fechaFinalF.setValue(moment(final, 'DD/MM/YYYY'));
    datepicker.close();
    // this.ver_horario = false;
    // this.ver_verificar = false;
    // this.ver_guardar = false;
    // this.ver_acciones = false;
    // this.InicialiciarDatos();
    // this.fechas_mes = [];
  }

    // METODO PARA LIMPIAR FORMULARIO
    LimpiarCampos() {
      this.fechaInicialF.reset();
      this.fechaFinalF.reset();
      this.archivo1Form.reset();
    }

  /** ************************************************************************************************* **
   ** **                              PLANTILLA CARGAR PLANIFICACION                                 ** **
   ** ************************************************************************************************* **/

  // LIMPIAR CAMPOS PLANTILLA
  LimpiarCamposPlantilla() {
    this.archivo1Form.reset();
    this.spinnerService.hide();

  }

  // DESCARGAR PLANTILLA EXCEL
  DescargarPlantilla() {
    this.GenerarExcel(this.fechaInicialF.value, this.fechaFinalF.value, this.datosSeleccionados.usuarios);
  }

  // METODO PARA CARGAR PLANTILLA
  CargarPlantilla(plantilla: any) {
    if(plantilla.targer.files && plantilla.targer.files[0]){
      this.archivo = plantilla.targer.files[0];
      this.nombreArchivo = this.archivo[0].name;
      let arrayItems = this.nombreArchivo.split(".");
      let itemExtencion = arrayItems[arrayItems.length - 1];
      let itemName = arrayItems[0];

      if (itemExtencion === 'xlsx' || itemExtencion === 'xls') {
        if (itemName === 'plantillaPlanificacionMultiple') {
          this.VerificarPlantilla();
        } else {
          this.toastr.error('Solo se acepta plantillaPlanificacionMultiple', 'Plantilla seleccionada incorrecta', {
            timeOut: 6000,
          });
        }

      } else {
        this.toastr.error('Error en el formato del documento', 'Plantilla no aceptada', {
          timeOut: 6000,
        });
      }
    } else {
      this.toastr.error('Error al cargar el archivo', 'Ups!!! algo salio mal.', {
        timeOut: 6000,
      });
    }
  }

  // METODO PARA VERIFICAR PLANTILLA
  VerificarPlantilla() {
    let formData = new FormData();
    for (let i = 0; i < this.archivo.length; i++) {
      formData.append("uploads", this.archivo[i], this.archivo[i].name);
    }
  }

  GenerarExcel(fechaInicial: Moment, fechaFinal: Moment, usuarios: any[]) {
    // CONVERTIR MOMENT A DATE
    const fechaInicio = fechaInicial.toDate();
    const fechaFin = fechaFinal.toDate();

    console.log('usuarios', usuarios);

    // CREAR UN ARRAY PARA LAS FILAS DEL ARCHIVO EXCEL
    const filas: any[] = [];

    // CREAR LA FILA DE ENCABEZADOS
    const encabezados = ['USUARIO'];
    for (let fecha = new Date(fechaInicio); fecha <= fechaFin; fecha.setDate(fecha.getDate() + 1)) {
      // CONVERTIR FECHA A ESTE FORMATO VIERNES 26/01/2024
      const opciones: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      };
      const fechaFormateada = new Date(fecha).toLocaleDateString('es-ES', opciones).toUpperCase();

      encabezados.push(fechaFormateada);
    }
    filas.push(encabezados);

    // CREAR LAS FILAS DE DATOS
    for (const usuario of usuarios) {
      const fila = [usuario.cedula];
      filas.push(fila);
    }

    // CREAR EL LIBRO DE TRABAJO Y LA HOJA DE CÁLCULO
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(filas);


    // ESTABLECER EL ANCHO DE LAS COLUMNAS
    ws['!cols'] = Array(encabezados.length).fill({ wpx: 125 });

    // AGREGAR LA HOJA DE CÁLCULO AL LIBRO DE TRABAJO
    XLSX.utils.book_append_sheet(wb, ws, 'Planificacion');

    // ESCRIBIR EL LIBRO DE TRABAJO EN UN ARCHIVO EXCEL
    XLSX.writeFile(wb, 'plantillaPlanificacionMultiple.xlsx');
  }


  // METODO PARA CERRAR VENTANA
  CerrarVentana() {
    if (this.datosSeleccionados.pagina === 'multiple-empleado') {
      this.componentem.seleccionar = true;
      this.componentem.plan_rotativo = false;
      this.componentem.LimpiarFormulario();
    }
    else if (this.datosSeleccionados.pagina === 'busqueda') {
      this.componenteb.rotativo_multiple = false;
      this.componenteb.seleccionar = true;
      this.componenteb.buscar_fechas = true;
      this.componenteb.auto_individual = true;
      this.componenteb.multiple = true;
    }
  }

}
