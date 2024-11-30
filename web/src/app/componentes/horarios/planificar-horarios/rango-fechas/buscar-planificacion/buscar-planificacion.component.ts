// IMPORTAR LIBRERIAS
import { PageEvent } from '@angular/material/paginator';
import { FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDatepicker } from '@angular/material/datepicker';
import { Component, Input } from '@angular/core';
import { DateTime } from 'luxon';

// IMPORTAR SERVICIOS
import { PeriodoVacacionesService } from 'src/app/servicios/modulos/modulo-vacaciones/periodoVacaciones/periodo-vacaciones.service';
import { DatosGeneralesService } from 'src/app/servicios/generales/datosGenerales/datos-generales.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { PlanGeneralService } from 'src/app/servicios/horarios/planGeneral/plan-general.service';
import { EmplCargosService } from 'src/app/servicios/usuarios/empleado/empleadoCargo/empl-cargos.service';
import { ParametrosService } from 'src/app/servicios/configuracion/parametrizacion/parametrosGenerales/parametros.service';
import { ReportesService } from 'src/app/servicios/reportes/reportes.service';

import { HorarioMultipleEmpleadoComponent } from '../horario-multiple-empleado/horario-multiple-empleado.component';

@Component({
  selector: 'app-buscar-planificacion',
  templateUrl: './buscar-planificacion.component.html',
  styleUrls: ['./buscar-planificacion.component.css']
})

export class BuscarPlanificacionComponent {

  @Input() resultados: any;

  // FECHAS DE BUSQUEDA
  fechaInicialF = new FormControl();
  fechaFinalF = new FormControl();

  // VARIABLES VISTA DE PANTALLAS
  seleccionar: boolean = true;

  idEmpleadoLogueado: any;
  columnAccion: boolean = true;

  constructor(
    public informacion: DatosGeneralesService, // SERVICIO DE DATOS INFORMATIVOS DE USUARIOS
    public componente: HorarioMultipleEmpleadoComponent,
    public restCargo: EmplCargosService,
    public parametro: ParametrosService,
    public restPerV: PeriodoVacacionesService, // SERVICIO DATOS PERIODO DE VACACIONES
    public validar: ValidacionesService, // VARIABLE USADA PARA VALIDACIONES DE INGRESO DE LETRAS - NUMEROS
    public restR: ReportesService,
    public plan: PlanGeneralService,
    private toastr: ToastrService, // VARIABLE PARA MANEJO DE NOTIFICACIONES
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.seleccionar = true;
    this.ventana_horario_individual = false;
    this.BuscarHora();
  }

  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** ** 
   ** **************************************************************************************** **/
  formato_hora: string = 'HH:mm:ss';

  // METODO PARA BUSCAR PARAMETRO HORA
  BuscarHora() {
    // id_tipo_parametro Formato hora = 2
    this.parametro.ListarDetalleParametros(2).subscribe(
      res => {
        this.formato_hora = res[0].descripcion;
      });
  }

  fecHorario: boolean = true;
  // METODO PARA MOSTRAR FECHA SELECCIONADA
  FormatearFecha(fecha: DateTime, datepicker: MatDatepicker<DateTime>, opcion: number) {
    console.log()
    const ctrlValue = fecha;
    if (opcion === 1) {
      console.log("opcion 1")
      if (this.fechaFinalF.value) {
        console.log("existente fecha final")

        this.ValidarFechas(ctrlValue, DateTime.fromJSDate(this.fechaFinalF.value) , this.fechaInicialF, opcion);
      }
      else {
        let inicio = ctrlValue.set({ day: 1 }).toFormat('dd/MM/yyyy');
        console.log("ver inicio opcion 1: ", inicio)
        this.fechaInicialF.setValue(DateTime.fromFormat(inicio, 'dd/MM/yyyy').toJSDate());
      }
      this.fecHorario = false;
    }
    else {
      console.log("NO opcion 1")

      this.ValidarFechas(DateTime.fromJSDate(this.fechaInicialF.value), ctrlValue, this.fechaFinalF, opcion);
    }
    datepicker.close();
  }

  // METODO PARA VALIDAR EL INGRESO DE LAS FECHAS
  ValidarFechas(fec_inicio: any, fec_fin: any, formulario: any, opcion: number) {
    // FORMATO DE FECHA PERMITIDO PARA COMPARARLAS

    let inicio = fec_inicio.set({ day: 1 }).toFormat('dd/MM/yyyy');
    console.log("ver fec_inicio: ", fec_inicio)
    console.log("ver fecha_fin: ", fec_fin)
    console.log("ver formulario: ", formulario)
    console.log("ver opcion: ", opcion)

    const lastDayOfMonth = fec_fin.endOf('month').day;
    const formattedDate = `${lastDayOfMonth}/${fec_fin.toFormat('MM/yyyy')}`;

    let final = formattedDate;
    console.log("ver inicio: ", inicio)
    console.log("ver final: ", final)

    let feci = DateTime.fromFormat(inicio, 'dd/MM/yyyy').toFormat('yyyy/MM/dd')
    let fecf = DateTime.fromFormat(final, 'dd/MM/yyyy').toFormat('yyyy/MM/dd')

    // VERIFICAR SI LAS FECHAS ESTAN INGRESDAS DE FORMA CORRECTA

    console.log("ver Date.parse(feci) ", Date.parse(feci))
    if (Date.parse(feci) <= Date.parse(fecf)) {
      if (opcion === 1) {
        formulario.setValue(DateTime.fromFormat(inicio, 'dd/MM/yyyy').toJSDate());
      }
      else {
        formulario.setValue(DateTime.fromFormat(final, 'dd/MM/yyyy').toJSDate());
      }
    }
    else {
      this.toastr.warning('La fecha no se registro. Ups la fecha no es correcta.!!!', 'VERIFICAR', {
        timeOut: 6000,
      });
    }
    console.log("ver fecha final: ", this.fechaFinalF.value)
  }

  // METODO PARA VER PLANIFICACION
  ids_empleado: string = '';
  VerPlanificacion() {
    this.ids_empleado = '';
    this.resultados.forEach((obj: any) => {
      if (this.ids_empleado === '') {
        this.ids_empleado = '\'' + obj.id + '\''
      }
      else {
        this.ids_empleado = this.ids_empleado + ', \'' + obj.id + '\''
      }
    })
    this.BuscarHorarioPeriodo(this.ids_empleado);
  }

  // METODO PARA SELECCIONAR TIPO DE BUSQUEDA
  BuscarHorarioPeriodo(id_empleado: any) {
    if (this.fechaInicialF.value != null && this.fechaFinalF.value != null) {
      this.ObtenerHorariosEmpleado(this.fechaInicialF.value, this.fechaFinalF.value, 1, id_empleado);
    }
    else {
      const ahora = DateTime.now();

      let inicio = ahora.toFormat('yyyy/MM/01');
      let final = `${ahora.toFormat('yyyy/MM/')}${ahora.daysInMonth}`;
      this.ObtenerHorariosEmpleado(inicio, final, 2, id_empleado);
    }
  }

  // METODO PARA MOSTRAR DATOS DE HORARIO 
  horariosEmpleado: any = [];
  mes_inicio: any = '';
  mes_fin: any = '';
  ObtenerHorariosEmpleado(fec_inicio: any, fec_final: any, opcion: number, id_empleado: any) {
    this.editar_activar = false;
    this.editar_horario = false;
    this.columnAccion = true;
    this.horariosEmpleado = [];
    if (opcion === 1) {
      this.mes_inicio = DateTime.fromJSDate(fec_inicio).toFormat('yyyy-MM-dd');
      this.mes_fin = DateTime.fromJSDate(fec_final).toFormat('yyyy-MM-dd');
    }
    else {
      this.mes_inicio = fec_inicio;
      this.mes_fin = fec_final;
    }

    let busqueda = {
      fecha_inicio: this.mes_inicio,
      fecha_final: this.mes_fin,
      id_empleado: id_empleado
    }
    this.plan.BuscarPlanificacionHoraria(busqueda).subscribe(datos => {
      if (datos.message === 'OK') {
        this.horariosEmpleado = datos.data;
        let index = 0;
        this.horariosEmpleado.forEach((obj: any) => {
          this.resultados.forEach((r: any) => {
            if (r.codigo === obj.codigo_e) {
              obj.id_empleado = r.id;
              obj.id_cargo = r.id_cargo;
              obj.hora_trabaja = r.hora_trabaja;
              obj.seleccionado = '';
              obj.color = '';
              obj.index = index;
              index = index + 1;
            }
          })
        })
        if (this.asignar_multiple === true || this.ventana_horario_individual === true) {
          this.multiple = false;
          // EDITAR HORARIO
          this.ver_activar_editar = false;
          this.auto_individual = false;
        }
        else {
          this.multiple = true;
          // EDITAR HORARIO
          this.ver_activar_editar = true;
          this.auto_individual = true;
        }
      }
      else {
        this.toastr.info('Ups no se han encontrado registros!!!', 'No existe planificación.', {
          timeOut: 6000,
        });
        this.multiple = false;
        // EDITAR HORARIO
        this.ver_activar_editar = false;
      }
    })
  }

  // ITEMS DE PAGINACION DE LA TABLA EMPLEADOS
  pageSizeOptions_emp = [5, 10, 20, 50];
  tamanio_pagina_emp: number = 5;
  numero_pagina_emp: number = 1;

  ManejarPaginaResultados(e: PageEvent) {
    this.tamanio_pagina_emp = e.pageSize;
    this.numero_pagina_emp = e.pageIndex + 1;
  }

  /** ************************************************************************************** **
   ** **                     METODOS DE PLANIFICACION DE HORARIOS                         ** ** 
   ** ************************************************************************************** **/

  // METODO PARA ABRIR VENTANA DE ASIGNACION DE HORARIO
  data_horario: any = [];
  ventana_horario_individual: boolean = false;
  PlanificarIndividual(usuario: any): void {
    for (var i = 0; i < this.resultados.length; i++) {
      if (this.resultados[i].codigo === usuario.codigo || this.resultados[i].codigo === usuario.codigo_e) {
        this.data_horario = {
          pagina: 'busqueda',
          codigo: this.resultados[i].codigo,
          idCargo: this.resultados[i].id_cargo,
          idEmpleado: this.resultados[i].id,
          horas_trabaja: this.resultados[i].hora_trabaja,
        }
        this.ventana_horario_individual = true;
        this.buscar_fechas = false;
        this.multiple = false;
        // EDITAR HORARIO
        this.ver_activar_editar = false;
        this.auto_individual = false;
        break;
      }
    }
  }

  // VENTANA PARA REGISTRAR PLANIFICACION DE HORARIOS DEL EMPLEADO 
  rotativo: any = []
  registrar_rotativo: boolean = false;
  PlanificarMultipleI(usuario: any): void {
    for (var i = 0; i < this.resultados.length; i++) {
      if (this.resultados[i].codigo === usuario.codigo || this.resultados[i].codigo === usuario.codigo_e) {
        this.rotativo = {
          idCargo: this.resultados[i].id_cargo,
          codigo: this.resultados[i].codigo,
          pagina: 'busqueda',
          idEmpleado: this.resultados[i].id,
          horas_trabaja: this.resultados[i].hora_trabaja,
        }
        this.registrar_rotativo = true;
        this.buscar_fechas = false;
        this.multiple = false;
        // EDITAR HORARIO
        this.ver_activar_editar = false;
        this.auto_individual = false;
        break;
      }
    }
  }

  // HABILITAR O DESHABILITAR EL ICONO DE AUTORIZACION INDIVIDUAL
  multiple: boolean = false;
  buscar_fechas: boolean = true;
  seleccionados: any = [];
  auto_individual: boolean = true;
  asignar_multiple: boolean = false;
  // METODO DE VALIDACION DE SELECCION MULTIPLE HORARIOS FIJOS
  PlanificarFija() {
    this.auto_individual = false;
    this.multiple = false;
    // EDITAR HORARIO
    this.ver_activar_editar = false;
    this.buscar_fechas = false;
    if (this.resultados.length === 1) {
      this.PlanificarIndividual(this.resultados[0]);
    } else {
      this.seleccionados = this.resultados;
      this.asignar_multiple = true;
      this.ver_acciones = false;
    }
  }


  // METODO DE VALIDACION DE SELECCION MULTIPLE HORARIOS MULTIPLES
  rotativo_multiple: boolean = false;
  PlanificarMultiple() {
    this.auto_individual = false;
    this.multiple = false;
    // EDITAR HORARIO
    this.ver_activar_editar = false;
    this.buscar_fechas = false;
    if (this.resultados.length === 1) {
      this.PlanificarMultipleI(this.resultados[0]);
    } else {
      this.data_horario = {
        usuarios: this.resultados,
        pagina: 'busqueda',
      }
      this.seleccionados = this.resultados;
      this.rotativo_multiple = true;
      this.ver_acciones = false;
    }
  }

  // METODO PARA CERRAR VENTANA DE BUSQUEDA
  CerrarBuscar() {
    this.resultados = [];
    this.componente.ventana_busqueda = false;
    this.componente.seleccionar = true;
  }

  // METODO PARA OBTENER DETALLE DE PLANIFICACION
  ver_detalle: boolean = false;
  ver_acciones: boolean = false;
  paginar: boolean = false;
  detalles: any = [];
  detalle_acciones: any = [];
  // ACCIONES DE HORARIOS
  entrada: '';
  salida: '';
  inicio_comida = '';
  fin_comida = '';
  ObtenerDetallesPlanificacion() {
    this.detalles = [];
    // DATOS DE BUSQUEDA DE DETALLES DE PLANIFICACION
    let busqueda = {
      fecha_inicio: this.mes_inicio,
      fecha_final: this.mes_fin,
      id_empleado: this.ids_empleado
    }
    let codigo_horario = '';
    let tipos: any = [];
    let accion = '';
    // VARIABLES AUXILIARES
    let aux_h = '';
    let aux_a = '';
    // BUSQUEDA DE DETALLES DE PLANIFICACIONES
    this.plan.BuscarDetallePlanificacion(busqueda).subscribe(datos => {
      if (datos.message === 'OK') {
        this.ver_acciones = true;
        this.detalle_acciones = [];
        this.detalles = datos.data;

        datos.data.forEach((obj: any) => {
          if (aux_h === '') {
            accion = obj.tipo_accion + ': ' + obj.hora;
            this.ValidarAcciones(obj);
          }
          else if (obj.id_horario === aux_h) {
            if (obj.tipo_accion != aux_a) {
              accion = accion + ' , ' + obj.tipo_accion + ': ' + obj.hora
              codigo_horario = obj.codigo_dia
              this.ValidarAcciones(obj);
            }
          }
          else {
            // CONCATENAR VALORES ANTERIORES
            tipos = [{
              acciones: accion,
              horario: codigo_horario,
              entrada: this.entrada,
              inicio_comida: this.inicio_comida,
              fin_comida: this.fin_comida,
              salida: this.salida,
            }]
            this.detalle_acciones = this.detalle_acciones.concat(tipos);
            // LIMPIAR VALORES
            accion = obj.tipo_accion + ': ' + obj.hora;
            codigo_horario = obj.codigo_dia;
            this.entrada = '';
            this.salida = '';
            this.inicio_comida = '';
            this.fin_comida = '';
            this.ValidarAcciones(obj);
          }
          // ASIGNAR VALORES A VARIABLES AUXILIARES
          aux_h = obj.id_horario;
          aux_a = obj.tipo_accion;
        })
        // AL FINALIZAR EL CICLO CONCATENAR VALORES
        tipos = [{
          acciones: accion,
          horario: codigo_horario,
          entrada: this.entrada,
          inicio_comida: this.inicio_comida,
          fin_comida: this.fin_comida,
          salida: this.salida,
        }]
        this.detalle_acciones = this.detalle_acciones.concat(tipos);

        // FORMATEAR HORAS
        this.detalle_acciones.forEach((detalle: any) => {
          detalle.entrada_ = this.validar.FormatearHora(detalle.entrada, this.formato_hora);
          if (detalle.inicio_comida != '') {
            detalle.inicio_comida = this.validar.FormatearHora(detalle.inicio_comida, this.formato_hora);
          }
          if (detalle.fin_comida != '') {
            detalle.fin_comida = this.validar.FormatearHora(detalle.fin_comida, this.formato_hora);
          }
          detalle.salida_ = this.validar.FormatearHora(detalle.salida, this.formato_hora);
        })

        // METODO PARA VER PAGINACION
        if (this.detalle_acciones.length > 8) {
          this.paginar = true;
        }
        else {
          this.paginar = false;
        }
      }
      else {
        this.toastr.info('Ups no se han encontrado registros!!!', 'No existe detalle de planificación.', {
          timeOut: 6000,
        });
      }
    })
  }

  // CONDICIONES DE ACCIONES EN HORARIO ASIGNADO
  ValidarAcciones(obj: any) {
    if (obj.tipo_accion === 'E') {
      return this.entrada = obj.hora;
    }
    if (obj.tipo_accion === 'S') {
      return this.salida = obj.hora;
    }
    if (obj.tipo_accion === 'I/A') {
      return this.inicio_comida = obj.hora;
    }
    if (obj.tipo_accion === 'F/A') {
      return this.fin_comida = obj.hora;
    }
  }

  // ARREGLO DE DATOS DE HORARIOS
  nomenclatura = [
    { nombre: 'L', descripcion: 'LIBRE' },
    { nombre: 'FD', descripcion: 'FERIADO' },
    { nombre: 'REC', descripcion: 'RECUPERACIÓN' },
    { nombre: 'P', descripcion: 'PERMISO' },
    { nombre: 'V', descripcion: 'VACACION' },
    { nombre: '-', descripcion: 'SIN PLANIFICACIÓN' }
  ]

  // OCULTAR DETALLE DE HORARIOS
  CerrarDetalles() {
    this.ver_acciones = false;
  }

  // ITEMS DE PAGINACION DE LA TABLA DETALLES
  pageSizeOptionsD = [5, 10, 20, 50];
  tamanio_paginaD: number = 5;
  numero_paginaD: number = 1;

  // EVENTO PARA MOSTRAR NUMERO DE FILAS EN TABLA DETALLES
  ManejarPaginaDetalles(e: PageEvent) {
    this.numero_paginaD = e.pageIndex + 1;
    this.tamanio_paginaD = e.pageSize;
  }

  /** ********************************************************************************************* **
   ** **                                METODO DE EDICION DE HORARIOS                            ** **
   ** ********************************************************************************************* **/
  editar_activar: boolean = false;
  ver_activar_editar: boolean = false;
  ActivarEditarHorario() {
    if (this.editar_activar === true) {
      this.editar_activar = false;
    }
    else {
      this.editar_activar = true;
    }
  }

  // VENTANA PARA REGISTRAR HORARIO 
  editar_horario: boolean = false;
  datos_editar: any = [];
  AbrirEditarHorario(anio: any, mes: any, dia: any, horario: any, id_empleado: any, codigo: any, id_cargo: any, hora_trabaja: any, index: any): void {
    let fecha = anio + '-' + mes + '-' + dia;
    console.log("fecha en AbrirEditarHorario", fecha);
    let fecha_ = DateTime.fromFormat(fecha, 'yyyy-MM-d').toFormat('yyyy/MM/dd');
    console.log("Ver fecha_", fecha_)
    let verificar = DateTime.fromFormat(fecha_, 'yyyy/MM/dd').isValid;
    console.log("Ver verificar", verificar)

    // VERIFICAR QUE EL DIA SEA VALIDO
    if (verificar === true) {
      console.log("entra a valido")
      this.horariosEmpleado[index].color = 'ok';
      this.horariosEmpleado[index].seleccionado = dia;
      this.datos_editar = {
        idEmpleado: id_empleado,
        datosPlan: horario,
        anio: anio,
        mes: mes,
        dia: dia,
        codigo: codigo,
        pagina: 'lista-planificar',
        idCargo: id_cargo,
        horas_trabaja: hora_trabaja,
        index: index
      }
      this.multiple = false;
      this.editar_horario = true;
      this.editar_activar = false;
      this.auto_individual = false;
      this.ver_activar_editar = false;
      this.columnAccion = false;
    }
    else {
      this.toastr.warning('Ups!!! Fecha no es válida.', '', {
        timeOut: 6000,
      });
    }
  }

  // METODO PARA CAMBIAR DE COLORES SEGUN EL MES
  CambiarColores(opcion: any) {
    let color: string;
    switch (opcion) {
      case 'ok':
        return color = '#F6DDCC';
    }
  }

}
