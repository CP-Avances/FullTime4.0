//IMPORTAR LIBRERIAS
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import moment, { Moment } from 'moment';
import * as XLSX from 'xlsx';

//IMPORTAR SERVICIOS
import { SpinnerService } from 'src/app/servicios/spinner/spinner.service';
import { PlanificacionHorariaService } from 'src/app/servicios/catalogos/catPlanificacionHoraria/planificacionHoraria.service';
import { ToastrService } from 'ngx-toastr';

//IMPORTAR COMPONENTES
import { HorarioMultipleEmpleadoComponent } from '../../rango-fechas/horario-multiple-empleado/horario-multiple-empleado.component';
import { VisualizarObservacionComponent } from '../visualizar-observacion/visualizar-observacion/visualizar-observacion.component';
import { BuscarPlanificacionComponent } from '../../rango-fechas/buscar-planificacion/buscar-planificacion.component';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-cargar-plantilla-planificacion',
  templateUrl: './cargar-plantilla-planificacion.component.html',
  styleUrls: ['./cargar-plantilla-planificacion.component.css']
})
export class CargarPlantillaPlanificacionComponent  implements OnInit{

  @Input() datosSeleccionados: any;
  usuarios: any;

  // FECHAS DE BUSQUEDA
  fechaInicialF = new FormControl();
  fechaFinalF = new FormControl();
  fecHorario: boolean = true;

  // ITEMS DE PAGINACION DE LA TABLA DE PLANIFICACIONES HORARIAS
  @ViewChild(MatPaginator) paginator: MatPaginator;
  pageSizeOptions_planificacion = [5, 10, 20, 50];
  tamanio_pagina_planificacion: number = 5;
  numero_pagina_planificacion: number = 1;

  archivo1Form = new FormControl('');

  // VARIABLES USADAS EN SELECCION DE ARCHIVOS
  archivo: Array<File>;
  nombreArchivo: string;
  textoBoton: string = 'Cargar plantilla';
  deshabilitarRegistro: boolean = true;

  // VARIABLES PARA EL MANEJO DE LOS DIAS DEL MES
  dias_mes: any[] = [];
  dia_inicio: any;
  dia_fin: any;
  mes: string;

  // VARIABLES PARA LAS PLANIFICACIONES HORARIAS DE LOS USUARIOS
  planificacionesHorarias: any;
  planificacionesCorrectas: any;

  constructor(
    public componentem: HorarioMultipleEmpleadoComponent,
    public componenteb: BuscarPlanificacionComponent,
    private spinnerService: SpinnerService,
    private toastr: ToastrService,
    private restP: PlanificacionHorariaService,
    public ventana: MatDialog,
  ) { }

  ngOnInit(): void {
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

    this.mes = dia_inicio.format('MMMM').toUpperCase();


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
   ** **                   METODOS PARA EL MAJEJO DE LA PLANTILLA DE PLANIFICACION                   ** **
   ** ************************************************************************************************* **/

  // LIMPIAR CAMPOS PLANTILLA
  LimpiarCamposPlantilla() {
    this.archivo1Form.reset();
    this.spinnerService.hide();
    this.textoBoton = 'Cargar nueva plantilla';
    this.deshabilitarRegistro = false;
    this.numero_pagina_planificacion = 1;
    this.tamanio_pagina_planificacion = 5;
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  // DESCARGAR PLANTILLA EXCEL
  DescargarPlantilla() {
    this.GenerarExcel(this.fechaInicialF.value, this.fechaFinalF.value, this.datosSeleccionados.usuariosSeleccionados);
    this.LimpiarCampos();
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
    this.LimpiarCamposPlantilla();

  }

  // METODO PARA VERIFICAR PLANTILLA
  VerificarPlantilla() {
    let formData = new FormData();
    for (let i = 0; i < this.archivo.length; i++) {
      formData.append("uploads", this.archivo[i], this.archivo[i].name);
    }
    this.restP.VerificarDatosPlanificacionHoraria(formData).subscribe( (res: any) => {
      this.OrganizarDatosPlanificacion(res);
      this.toastr.success('Plantilla verificada correctamente', 'Plantilla verificada', {
        timeOut: 6000,
      });
    });

  }

  // METODO PARA ORGANIZAR LOS DATOS DE LA PLANIFICACION
  OrganizarDatosPlanificacion(data: any) {
    this.planificacionesHorarias = [];
    this.dias_mes = [];
    this.dia_inicio = data.fechaInicioMes;
    this.dia_fin = data.fechaFinalMes;

    this.GenerarDiasMes();

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

          // ORDENAR LOS DIAS DE LA PLANIFICACION POR FECHA Y CONVERTIR A UN ARRAY DE OBJETOS
          planificacion.dias = Object.keys(planificacion.dias)
          .sort()
          .map(key => ({
              fecha: key,
              ...planificacion.dias[key]
          }));
      });

      this.planificacionesHorarias = data.planificacionHoraria;

        console.log(this.planificacionesHorarias);

    }
  }

  // METODO PARA SOLICITAR CONFIRMACION DE REGISTRO DE PLANIFICACIONES
  ConfirmarRegistroPlanificaciones() {
    const mensaje = 'registro-planificacion';
    this.ventana.open(MetodosComponent, { width: '450px', data:  mensaje  }).afterClosed().subscribe((confimado: Boolean) => {
      if (confimado) {
        this.RegistrarPlanificaciones();
      }
    });
  }

  // METODO PARA REGISTRAR PLANIFICACIONES
  RegistrarPlanificaciones() {
    this.spinnerService.show();

    this.planificacionesCorrectas = JSON.parse(JSON.stringify(this.planificacionesHorarias)).map((planificacion: any) => {
      planificacion.dias = planificacion.dias.map((dia: any) => {
        if (dia.observacion !== 'OK') {

          const existePlanificacion = dia.horarios.some((horario: any) => horario.observacion === 'Ya existe planificación');

          if (!existePlanificacion) {
            dia.observacion = dia.observacion3 ? 'DEFAULT-FERIADO' : 'DEFAULT-LIBRE';
            dia.horarios = dia.observacion3 ? [{codigo:'DEFAULT-FERIADO', dia: dia.fecha ,observacion: 'DEFAULT-FERIADO' }] : [{codigo:'DEFAULT-LIBRE', dia: dia.fecha, observacion: 'DEFAULT-LIBRE'}];
          }
        }
        return dia;
      });
      return planificacion;
    });

    this.restP.RegistrarPlanificacionHoraria(this.planificacionesCorrectas).subscribe( (res: any) => {
      this.spinnerService.hide();

      if (res.message === 'No existen datos para registrar') {
        this.toastr.warning('No existen datos para registrar', 'Plantilla no importada.', {
          timeOut: 6000,
        });
      } else {
        this.toastr.success('Plantilla de planificaciones horarias importada', 'Operación exitosa', {
          timeOut: 6000,
        });
    }
    }, (error: any) => {
      this.spinnerService.hide();
      this.toastr.error('Error al importar la plantilla de planificaciones horarias', 'Ups!!! algo salio mal.', {
        timeOut: 6000,
      });
    });
    this.LimpiarCamposPlantilla();
    this.CerrarVentana();
    this.deshabilitarRegistro = true;

  }


  // METODO PARA GENERAR EXCEL
  GenerarExcel(fechaInicial: Moment, fechaFinal: Moment, usuarios: any[]) {

    if (fechaInicial === null || fechaFinal === null) {
      this.toastr.error('Debe seleccionar una fecha inicial y una fecha final', 'Fechas no seleccionadas', {
        timeOut: 6000,
      });
      return;
    }

    const fechaInicio = fechaInicial.toDate();
    const fechaFin = fechaFinal.toDate();


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

  /** ************************************************************************************************* **
   ** **                       METODOS PARA EL CONTROL DE ELEMENTOS DE LA VISTA                      ** **
   ** ************************************************************************************************* **/

  MostrarVisualizarObservacion(dia: any): boolean {
    return (dia.observacion != '' && dia.observacion != 'OK') || Boolean(dia.observacion2) || Boolean(dia.observacion3) || Boolean(dia.observacion4) ;
  }


  // METODO PARA ABRIR VENTANA DE VISUALIZACION DE OBSERVACIONES
  VisualizarObservacion(planificacion: any) {
    this.ventana.open(VisualizarObservacionComponent, {
      data: planificacion,
      width: '500px',
      height: '300px',
    });

  }

  // METODO PARA OBTENER EL COLOR DE LA OBSERVACION
  ObtenerColorObservacion(observacion: string) {

    if(observacion.startsWith('Jornada superada')) return 'rgb(19, 192, 163)';

    switch (observacion) {
      case 'OK':
        return 'rgb(19, 191, 65)';
      default:
        return 'rgb(242, 21, 21)';
    }
  }

  ManejarPaginaResultados(e: PageEvent) {
    this.tamanio_pagina_planificacion = e.pageSize;
    this.numero_pagina_planificacion = e.pageIndex + 1;
  }


  // METODO PARA CERRAR VENTANA
  CerrarVentana() {
      this.componentem.seleccionar = true;
      this.componentem.cargar_plantilla = false;
      this.componentem.LimpiarFormulario();

  }

}
