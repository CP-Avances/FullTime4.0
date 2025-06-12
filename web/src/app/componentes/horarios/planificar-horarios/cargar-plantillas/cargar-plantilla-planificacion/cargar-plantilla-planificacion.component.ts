//IMPORTAR LIBRERIAS
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDatepicker } from '@angular/material/datepicker';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DateTime } from 'luxon';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

//IMPORTAR SERVICIOS
import { PlanificacionHorariaService } from 'src/app/servicios/horarios/catPlanificacionHoraria/planificacionHoraria.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { ToastrService } from 'ngx-toastr';

//IMPORTAR COMPONENTES
import { HorarioMultipleEmpleadoComponent } from '../../rango-fechas/horario-multiple-empleado/horario-multiple-empleado.component';
import { VisualizarObservacionComponent } from '../visualizar-observacion/visualizar-observacion.component';
import { BuscarPlanificacionComponent } from '../../rango-fechas/buscar-planificacion/buscar-planificacion.component';
import { MetodosComponent } from 'src/app/componentes/generales/metodoEliminar/metodos.component';

@Component({
  selector: 'app-cargar-plantilla-planificacion',
  standalone: false,
  templateUrl: './cargar-plantilla-planificacion.component.html',
  styleUrls: ['./cargar-plantilla-planificacion.component.css']
})

export class CargarPlantillaPlanificacionComponent implements OnInit {
  ips_locales: any = '';

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
    public validar: ValidacionesService,
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });
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
    let inicio = ctrlValue.set({ day: 1 });
    let final = ctrlValue.endOf('month');
    this.fechaInicialF.setValue(inicio.toJSDate());
    this.fechaFinalF.setValue(final.toJSDate());
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

    while (fechaLuxonInicio <= fechaLuxonFin) {

      let dia = {
        fecha: fechaLuxonInicio.toFormat('yyyy-MM-dd'),
        fecha_formato: fechaLuxonInicio.toFormat('EEEE, dd/MM/yyyy').toUpperCase()
      }
      this.dias_mes.push(dia);
      fechaLuxonInicio = fechaLuxonInicio.plus({ days: 1 });
    }

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
      this.toastr.error('Error al cargar el archivo', 'Ups! algo salio mal.', {
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
        this.toastr.error('Error al verificar la plantilla de planificación horaria.', 'Ups! algo salio mal.', {
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
    (document.activeElement as HTMLElement)?.blur();
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
      ip: this.ip, ip_local: this.ips_locales
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
      this.toastr.error('Error al importar la plantilla de planificaciones horarias.', 'Ups! algo salio mal.', {
        timeOut: 6000,
      });
    });
    this.LimpiarCamposPlantilla();
    this.CerrarVentana();
    this.deshabilitarRegistro = true;

  }


  // METODO PARA GENERAR EXCEL  ** CORREGI
  GenerarExcel(fechaInicial: Date, fechaFinal: Date, usuarios: any[]) {

    if (!fechaInicial || !fechaFinal) {
      this.toastr.error('Debe seleccionar una fecha inicial y una fecha final', 'Fechas no seleccionadas', {
        timeOut: 6000,
      });
      return;
    }

    const fechaInicio =  DateTime.fromJSDate(fechaInicial);
    let fechaFin = DateTime.fromJSDate(fechaFinal);

    const filas: any[] = [];
    const encabezados = ['IDENTIFICACION', 'EMPLEADO'];

    // CREAR RANGO DE FECHAS
    let fecha = fechaInicio.startOf('day');
    fechaFin = fechaFin.startOf('day');

    while (fecha <= fechaFin) {
      const fechaFormateada = fecha.setLocale('es').toFormat("cccc, dd/LL/yyyy").toUpperCase();
      encabezados.push(fechaFormateada);
      fecha = fecha.plus({ days: 1 });
    }

    filas.push(encabezados);

    // AGREGAR FILAS DE USUARIOS
    for (const usuario of usuarios) {
      const fila = [usuario.identificacion, usuario.nombre];
      filas.push(fila);
    }

    // CREAR LIBRO Y HOJA CON EXCELJS
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Planificacion');

    // DEFINIR LA TABLA COMO OBJETO
    worksheet.addTable({
      name: 'PlanificacionTable',
      ref: 'A1',
      headerRow: true,
      totalsRow: false,
      style: {
        theme: 'TableStyleMedium16',
        showRowStripes: true,
      },
      columns: encabezados.map(titulo => ({ name: titulo })),
      rows: usuarios.map(usuario => {
        const fila = [usuario.identificacion, usuario.nombre];
        // AGREGAR COLUMNAS VACIAS PARA CADA DIA
        for (let i = 2; i < encabezados.length; i++) {
          fila.push(''); // PUEDES RELLENAR CON DATOS SI LOS TIENES
        }
        return fila;
      }),
    });

    // DEFINIR ANCHOS DE COLUMNAS
    worksheet.columns = encabezados.map((_, index) => ({
      width: index === 1 ? 40 : 20
    }));

    // DEFINIR ANCHO DE COLUMNAS
    worksheet.columns = encabezados.map((_, index) => {
      return {
        width: index === 1 ? 40 : 20 // SEGUNDA COLUMNA MAS ANCHA
      };
    });

    // GUARDAR EL ARCHIVO
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, 'plantillaPlanificacionMultiple.xlsx');
    }).catch((error) => {
      this.toastr.error('Hubo un error al generar el archivo Excel', 'Error', { timeOut: 6000 });
    });
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
