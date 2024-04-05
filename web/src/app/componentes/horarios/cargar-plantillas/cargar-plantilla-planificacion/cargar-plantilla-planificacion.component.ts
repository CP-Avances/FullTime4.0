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
import { PlanificacionHorariaService } from 'src/app/servicios/catalogos/catPlanificacionHoraria/planificacionHoraria.service';
@Component({
  selector: 'app-cargar-plantilla-planificacion',
  templateUrl: './cargar-plantilla-planificacion.component.html',
  styleUrls: ['./cargar-plantilla-planificacion.component.css']
})
export class CargarPlantillaPlanificacionComponent  implements OnInit{

  @Input() datosSeleccionados: any;
  usuarios: any;

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

  // VARIABLES PARA EL MANEJO DE LOS DIAS DEL MES
  dias_mes: any[] = [];
  dia_inicio: any;
  dia_fin: any;

  // VARIABLES PARA LAS PLANIFICACIONES HORARIAS DE LOS USUARIOS
  planificacionesHorarias: any;

  constructor(
    public componentem: HorarioMultipleEmpleadoComponent,
    public componenteb: BuscarPlanificacionComponent,
    private spinnerService: SpinnerService,
    private toastr: ToastrService,
    private restP: PlanificacionHorariaService,
  ) { }

  ngOnInit(): void {
    console.log(this.datosSeleccionados.usuariosSeleccionados);
    this.usuarios = this.datosSeleccionados.usuarios;
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.fechaInicialF.reset();
    this.fechaFinalF.reset();
    this.archivo1Form.reset();
  }


  /** **************************************************************************************** **
   ** **                              FORMATO DE FECHAS Y HORAS                             ** **
   ** **************************************************************************************** **/


  // METODO PARA MOSTRAR FECHA SELECCIONADA
  FormatearFecha(fecha: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = fecha;
    let inicio = moment(ctrlValue).format('01/MM/YYYY');
    let final = moment(ctrlValue).daysInMonth() + moment(ctrlValue).format('/MM/YYYY');
    this.fechaInicialF.setValue(moment(inicio, 'DD/MM/YYYY'));
    this.fechaFinalF.setValue(moment(final, 'DD/MM/YYYY'));
    datepicker.close();
  }

  // GENERAR DIAS DEL MES
  GenerarDiasMes() {
    this.dias_mes = [];
    let dia_inicio = moment(this.dia_inicio, 'YYYYY-MM-DD');
    let dia_fin = moment(this.dia_fin, 'YYYYY-MM-DD');

    while (dia_inicio <= dia_fin) {
      let dia = {
        fecha: dia_inicio.format('YYYY-MM-DD'),
        fecha_formato: dia_inicio.format('dddd, DD/MM/YYYY').toUpperCase()
      }
      this.dias_mes.push(dia);
      dia_inicio = dia_inicio.add(1, 'days');
    }
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
    this.GenerarExcel(this.fechaInicialF.value, this.fechaFinalF.value, this.datosSeleccionados.usuariosSeleccionados);
  }

  // METODO PARA CARGAR PLANTILLA
  CargarPlantilla(plantilla: any) {
    this.spinnerService.show();
    if(plantilla.target.files && plantilla.target.files[0]){
      this.archivo = plantilla.target.files;
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
    this.restP.VerificarDatosPlanificacionHoraria(formData).subscribe( (res: any) => {
      console.log(res);
      this.OrganizarDatosPlanificacion(res);
      this.spinnerService.hide();
      this.toastr.success('Plantilla verificada correctamente', 'Plantilla verificada', {
        timeOut: 6000,
      });
    });

  }

  OrganizarDatosPlanificacion(data: any) {
    this.planificacionesHorarias = [];
    this.dias_mes = [];
    this.dia_inicio = data.fechaInicioMes;
    this.dia_fin = data.fechaFinalMes;

    this.GenerarDiasMes();

    console.log('dias_mes', this.dias_mes);


    if (data.planificacionHoraria.length > 0) {
      data.planificacionHoraria.forEach((planificacion: any) => {
          this.dias_mes.forEach((dia: any) => {
              // BUSCAR DENTRO DE PLANIFICACION.DIAS SI EXISTE EL DIA
              if (!planificacion.dias.hasOwnProperty(dia.fecha)) {
                  // SI EL DIA NO EXISTE EN PLANIFICACION.DIAS, AÑADIRLO
                  planificacion.dias[dia.fecha] = {
                      horarios: [],
                      observacion: ''
                  };
              }
          });

          // CONVERTIR PLANIFICACION.DIAS A UN ARRAY DE OBJETOS
          planificacion.dias = Object.keys(planificacion.dias).map(key => ({
            fecha: key,
            ...planificacion.dias[key]
          }));
      });

      this.planificacionesHorarias = data.planificacionHoraria;
      console.log('planificacionesHorarias', this.planificacionesHorarias);
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
      this.componentem.seleccionar = true;
      this.componentem.cargar_plantilla = false;
      this.componentem.LimpiarFormulario();

  }

}
