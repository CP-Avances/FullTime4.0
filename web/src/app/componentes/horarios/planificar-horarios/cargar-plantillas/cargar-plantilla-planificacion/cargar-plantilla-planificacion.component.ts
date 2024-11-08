//IMPORTAR LIBRERIAS
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDatepicker } from '@angular/material/datepicker';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import * as XLSX from 'xlsx';
import { DateTime } from 'luxon';


//IMPORTAR SERVICIOS
import { PlanificacionHorariaService } from 'src/app/servicios/horarios/catPlanificacionHoraria/planificacionHoraria.service';
import { ToastrService } from 'ngx-toastr';

//IMPORTAR COMPONENTES
import { HorarioMultipleEmpleadoComponent } from '../../rango-fechas/horario-multiple-empleado/horario-multiple-empleado.component';
import { VisualizarObservacionComponent } from '../visualizar-observacion/visualizar-observacion.component';
import { BuscarPlanificacionComponent } from '../../rango-fechas/buscar-planificacion/buscar-planificacion.component';
import { MetodosComponent } from 'src/app/componentes/generales/metodoEliminar/metodos.component';

@Component({
  selector: 'app-cargar-plantilla-planificacion',
  templateUrl: './cargar-plantilla-planificacion.component.html',
  styleUrls: ['./cargar-plantilla-planificacion.component.css']
})

export class CargarPlantillaPlanificacionComponent implements OnInit {

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
  numeroPlanificacionesCorrectas: number = 0;


  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    public componentem: HorarioMultipleEmpleadoComponent,
    public componenteb: BuscarPlanificacionComponent,
    private toastr: ToastrService,
    private restP: PlanificacionHorariaService,
    public ventana: MatDialog,
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
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
  FormatearFecha(fecha: DateTime, datepicker: MatDatepicker<DateTime>) {
    const ctrlValue = fecha;
    console.log("ctrlValue", ctrlValue)
    let inicio = ctrlValue.set({ day: 1 }).toFormat('dd/MM/yyyy');
    console.log("inicio luxon", inicio)
    let final = `${ctrlValue.daysInMonth}${ctrlValue.toFormat('/MM/yyyy')}`;
    console.log("final luxon", final)
    this.fechaInicialF.setValue(DateTime.fromFormat(inicio, 'dd/MM/yyyy').toJSDate());
    console.log("fechaInicialF", this.fechaInicialF.value)
    this.fechaFinalF.setValue(DateTime.fromFormat(final, 'dd/MM/yyyy').toJSDate());
    datepicker.close();
  }

  // GENERAR DIAS DEL MES
  GenerarDiasMes() {
    this.dias_mes = [];
    let dia_inicio = DateTime.fromISO(this.dia_inicio).toFormat('dd/MM/yyyy');
    console.log("ver this.dia_inicio", dia_inicio)

    let dia_fin = DateTime.fromISO(this.dia_fin).toFormat('dd/MM/yyyy');
    console.log("ver this.dia_fin", dia_fin)

    let fechaLuxonInicio = DateTime.fromFormat(dia_inicio, 'dd/MM/yyyy').setLocale('es');
    let fechaLuxonFin = DateTime.fromFormat(dia_fin, 'dd/MM/yyyy').setLocale('es');

    this.mes = fechaLuxonInicio.setLocale('es').toFormat('MMMM').toUpperCase();
    console.log("ver mes: ", this.mes);

    while (fechaLuxonInicio <= fechaLuxonFin) {

      let dia = {
        fecha: fechaLuxonInicio.toFormat('yyyy-MM-dd'),
        fecha_formato: fechaLuxonInicio.toFormat('EEEE, dd/MM/yyyy').toUpperCase()
      }
      this.dias_mes.push(dia);
      fechaLuxonInicio = fechaLuxonInicio.plus({ days: 1 });
    }
    console.log("ver dias_mes", this.dias_mes)

  }


  /** ************************************************************************************************* **
   ** **                   METODOS PARA EL MAJEJO DE LA PLANTILLA DE PLANIFICACION                   ** **
   ** ************************************************************************************************* **/

  // LIMPIAR CAMPOS PLANTILLA
  LimpiarCamposPlantilla() {
    this.archivo1Form.reset();
    this.textoBoton = 'Cargar nueva plantilla';
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
    if (plantilla.target.files && plantilla.target.files[0]) {
      this.archivo = plantilla.target.files;
      this.nombreArchivo = this.archivo[0].name;
      let arrayItems = this.nombreArchivo.split(".");
      let itemExtencion = arrayItems[arrayItems.length - 1];
      let itemName = arrayItems[0];
      if (itemExtencion === 'xlsx' || itemExtencion === 'xls') {
        if (itemName.toLowerCase().startsWith('plantillaplanificacionmultiple')) {
          this.VerificarPlantilla();
          this.deshabilitarRegistro = false;
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
    this.restP.VerificarDatosPlanificacionHoraria(formData).subscribe({
      next: (res: any) => {
        this.OrganizarDatosPlanificacion(res);
        this.toastr.success('Plantilla verificada correctamente.', 'Plantilla verificada.', {
          timeOut: 6000,
        });
      },
      error: (error: any) => {
        this.toastr.error('Error al verificar la plantilla de planificación horaria.', 'Ups!!! algo salio mal.', {
          timeOut: 6000,
        });
      }
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

            // COMPROBAR SI EL DIA ES FERIADO Y AÑADIR LA OBSERVACION
            if (planificacion.feriados) {
              if (planificacion.feriados.some((feriado: any) => feriado.fecha === dia.fecha)) {
                planificacion.dias[dia.fecha].observacion = 'FD';
                planificacion.dias[dia.fecha].observacion3 = 'DEFAULT-FERIADO';
              }
            }
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

      // Filtrar planificaciones que no tienen observaciones inválidas
      const planificacionesFiltradas = this.planificacionesHorarias.filter((planificacion) => {
        return planificacion.observacion !== 'Usuario no válido' && planificacion.observacion !== 'No tiene un cargo asignado';
      });

      // Contar el número de días con observación 'OK' sin modificar this.planificacionesHorarias
      this.numeroPlanificacionesCorrectas = planificacionesFiltradas.reduce((count, planificacion) => {
        const diasOk = planificacion.dias.filter((dia: any) => dia.observacion === 'OK').length;
        return count + diasOk;
      }, 0);

    }
  }

  // METODO PARA SOLICITAR CONFIRMACION DE REGISTRO DE PLANIFICACIONES
  ConfirmarRegistroPlanificaciones() {
    const mensaje = 'registro-planificacion';
    this.ventana.open(MetodosComponent, { width: '450px', data: mensaje }).afterClosed().subscribe((confimado: Boolean) => {
      if (confimado) {
        this.RegistrarPlanificaciones();
      }
    });
  }

  // METODO PARA REGISTRAR PLANIFICACIONES
  RegistrarPlanificaciones() {
    this.planificacionesHorarias = this.planificacionesHorarias.filter((planificacion) => {
      return planificacion.observacion !== 'Usuario no válido' && planificacion.observacion !== 'No tiene un cargo asignado';
    });

    this.planificacionesCorrectas = JSON.parse(JSON.stringify(this.planificacionesHorarias)).map((planificacion: any) => {
      planificacion.dias = planificacion.dias.map((dia: any) => {
        if (dia.observacion !== 'OK') {

          const existePlanificacion = dia.horarios.some((horario: any) => horario.observacion === 'Ya existe planificación');

          if (!existePlanificacion) {
            dia.observacion = dia.observacion3 ? 'DEFAULT-FERIADO' : 'DEFAULT-LIBRE';
            dia.horarios = dia.observacion3 ? [{ codigo: 'DEFAULT-FERIADO', dia: dia.fecha, observacion: 'DEFAULT-FERIADO' }] : [{ codigo: 'DEFAULT-LIBRE', dia: dia.fecha, observacion: 'DEFAULT-LIBRE' }];
          }
        }
        return dia;
      });
      return planificacion;
    });

    const datos = {
      planificacionHoraria: this.planificacionesCorrectas,
      user_name: this.user_name,
      ip: this.ip
    };

    this.restP.RegistrarPlanificacionHoraria(datos).subscribe((res: any) => {
      if (res.message === 'No existen datos para registrar') {
        this.toastr.warning('No existen datos para registrar', 'Plantilla no importada.', {
          timeOut: 6000,
        });
      } else {
        this.toastr.success('Plantilla de planificaciones horarias importada.', 'Operación exitosa.', {
          timeOut: 6000,
        });
      }
    }, (error: any) => {
      this.toastr.error('Error al importar la plantilla de planificaciones horarias.', 'Ups!!! algo salio mal.', {
        timeOut: 6000,
      });
    });
    this.LimpiarCamposPlantilla();
    this.CerrarVentana();
    this.deshabilitarRegistro = true;

  }


  // METODO PARA GENERAR EXCEL
  GenerarExcel(fechaInicial: DateTime, fechaFinal: DateTime, usuarios: any[]) {

    console.log("ver fechaInicial: ", fechaInicial)
    if (fechaInicial === null || fechaFinal === null) {
      this.toastr.error('Debe seleccionar una fecha inicial y una fecha final', 'Fechas no seleccionadas', {
        timeOut: 6000,
      });
      return;
    }
    const fechaInicialD = new Date(fechaInicial);
    const fechaInicio = DateTime.fromJSDate(fechaInicialD);

    const fechaFinalD = new Date(fechaFinal);
    const fechaFin = DateTime.fromJSDate(fechaFinalD);
    // CREAR UN ARRAY PARA LAS FILAS DEL ARCHIVO EXCEL
    const filas: any[] = [];
    // CREAR LA FILA DE ENCABEZADOS
    const encabezados = ['CEDULA', 'EMPLEADO'];
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
      const fila = [usuario.cedula, usuario.nombre];
      filas.push(fila);
    }

    // CREAR EL LIBRO DE TRABAJO Y LA HOJA DE CÁLCULO
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(filas);


    // ESTABLECER EL ANCHO DE LAS COLUMNAS
    const columnWidths = Array(encabezados.length).fill({ wpx: 125 });
    columnWidths[1] = { wpx: 300 }; // ESTABLECER EL ANCHO DE LA SEGUNDA COLUMNA

    ws['!cols'] = columnWidths;

    // AGREGAR LA HOJA DE CÁLCULO AL LIBRO DE TRABAJO
    XLSX.utils.book_append_sheet(wb, ws, 'Planificacion');

    // ESCRIBIR EL LIBRO DE TRABAJO EN UN ARCHIVO EXCEL
    XLSX.writeFile(wb, 'plantillaPlanificacionMultiple.xlsx');
  }

  /** ************************************************************************************************* **
   ** **                       METODOS PARA EL CONTROL DE ELEMENTOS DE LA VISTA                      ** **
   ** ************************************************************************************************* **/

  MostrarVisualizarObservacion(dia: any): boolean {
    return (dia.observacion != '' && dia.observacion != 'OK') || Boolean(dia.observacion2) || Boolean(dia.observacion3) || Boolean(dia.observacion4) || Boolean(dia.observacion6);
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
    if (observacion && observacion.startsWith('Jornada superada')) return 'rgb(19, 192, 163)';

    switch (observacion) {
      case 'OK':
        return 'rgb(19, 191, 65)';
      case 'FD':
        return 'rgb(22, 19, 191)';
      default:
        return 'rgb(242, 21, 21)';
    }
  }

  // METODO PARA OBTENER EL COLOR DEL USUARIO
  ObtenerColorEmpleado(observacion: string) {
    if (observacion === 'Empleado no válido' || observacion === 'No tiene un cargo asignado') return 'rgb(242, 21, 21)';
  }

  // OBTENER NOMBRE DE USUARIO
  ObtenerNombreUsuario(nombre: any, usuario: any) {
    return nombre ? nombre : 'Empleado no existe en el sistema';
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
