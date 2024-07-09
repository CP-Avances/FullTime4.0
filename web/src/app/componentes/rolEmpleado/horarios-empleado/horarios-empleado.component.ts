import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDatepicker } from '@angular/material/datepicker';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { default as _rollupMoment, Moment } from 'moment';
import * as moment from 'moment';

import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { EmplCargosService } from 'src/app/servicios/empleado/empleadoCargo/empl-cargos.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { PlanGeneralService } from 'src/app/servicios/planGeneral/plan-general.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { EmpleadoHorariosService } from 'src/app/servicios/horarios/empleadoHorarios/empleado-horarios.service';

@Component({
  selector: 'app-horarios-empleado',
  templateUrl: './horarios-empleado.component.html',
  styleUrls: ['./horarios-empleado.component.css']
})

export class HorariosEmpleadoComponent implements OnInit {

  @ViewChild('tabla1') tabla1: ElementRef;
  @ViewChild('tabla2') tabla2: ElementRef;

  idEmpleado: string;

  // ITEMS DE PAGINACION DE LA TABLA 
  numero_pagina: number = 1;
  tamanio_pagina: number = 5;
  pageSizeOptions = [5, 10, 20, 50];

  constructor(
    public restEmpleHorario: EmpleadoHorariosService,
    public restEmpleado: EmpleadoService,
    public informacion: DatosGeneralesService,
    public restCargo: EmplCargosService,
    public parametro: ParametrosService,
    public ventana: MatDialog,
    public validar: ValidacionesService,
    public router: Router,
    private toastr: ToastrService,
    private restPlanGeneral: PlanGeneralService,
  ) {
    this.idEmpleado = localStorage.getItem('empleado') as string;
  }

  ngOnInit(): void {
    this.BuscarParametro();
  }

  /** **************************************************************************************** **
   ** **                       METODOS GENERALES DEL SISTEMA                                ** ** 
   ** **************************************************************************************** **/

  // BUSQUEDA DE DATOS ACTUALES DEL USUARIO
  datoActual: any = [];
  VerDatosActuales(formato_fecha: string) {
    this.datoActual = [];
    this.informacion.ObtenerDatosActuales(parseInt(this.idEmpleado)).subscribe(res => {
      this.datoActual = res[0];
      // LLAMADO A DATOS DE USUARIO
      this.ObtenerCargoEmpleado(this.datoActual.id_cargo, formato_fecha);
    });
  }

  // METODO PARA MANEJAR TABLA
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }


  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** ** 
   ** **************************************************************************************** **/

  formato_fecha: string = 'DD/MM/YYYY';
  formato_hora: string = 'HH:mm:ss';

  // METODO PARA BUSCAR PARAMETRO DE FORMATO DE FECHA
  BuscarParametro() {
    // id_tipo_parametro Formato fecha = 1
    this.parametro.ListarDetalleParametros(1).subscribe(
      res => {
        this.formato_fecha = res[0].descripcion;
        this.LlamarMetodos(this.formato_fecha);
      },
      vacio => {
        this.LlamarMetodos(this.formato_fecha);
      });
  }

  // LLAMAR METODOS DE PRESENTACION DE INFORMACION
  LlamarMetodos(formato_fecha: string) {
    this.VerDatosActuales(formato_fecha);
  }

  /** ** ***************************************************************************************** **
   ** ** **                  METODOS PARA MANEJO DE DATOS DE CARGO                              ** **
   ** ******************************************************************************************** **/

  // METODO PARA OBTENER LOS DATOS DEL CARGO DEL EMPLEADO 
  cargoEmpleado: any = [];
  ObtenerCargoEmpleado(id_cargo: number, formato_fecha: string) {
    this.cargoEmpleado = [];
    this.restCargo.BuscarCargoID(id_cargo).subscribe(datos => {
      this.cargoEmpleado = datos;
      this.cargoEmpleado.forEach((data: any) => {
        data.fec_inicio_ = this.validar.FormatearFecha(data.fec_inicio, formato_fecha, this.validar.dia_abreviado);
        data.fec_final_ = this.validar.FormatearFecha(data.fec_final, formato_fecha, this.validar.dia_abreviado);
      })
    });
  }


  /** ** ***************************************************************************************** **
   ** ** **                  METODOS DE BUSQUEDA DE PLANIFICACIONES ASIGNADAS                   ** **
   ** ******************************************************************************************** **/

  // FECHAS DE BUSQUEDA
  fechaInicialF = new FormControl();
  fechaFinalF = new FormControl();
  fecHorario: boolean = true;

  // METODO PARA MOSTRAR FECHA SELECCIONADA
  FormatearFecha(fecha: Moment, datepicker: MatDatepicker<Moment>, opcion: number) {
    const ctrlValue = fecha;
    if (opcion === 1) {
      if (this.fechaFinalF.value) {
        this.ValidarFechas(ctrlValue, this.fechaFinalF.value, this.fechaInicialF, opcion);
      }
      else {
        let inicio = moment(ctrlValue).format('01/MM/YYYY');
        this.fechaInicialF.setValue(moment(inicio, 'DD/MM/YYYY'));
      }
      this.fecHorario = false;
    }
    else {
      this.ValidarFechas(this.fechaInicialF.value, ctrlValue, this.fechaFinalF, opcion);
    }
    datepicker.close();
  }

  // METODO PARA VALIDAR EL INGRESO DE LAS FECHAS
  ValidarFechas(fec_inicio: any, fec_fin: any, formulario: any, opcion: number) {
    // FORMATO DE FECHA PERMITIDO PARA COMPARARLAS
    let inicio = moment(fec_inicio).format('01/MM/YYYY');
    let final = moment(fec_fin).daysInMonth() + moment(fec_fin).format('/MM/YYYY');
    let feci = moment(inicio, 'DD/MM/YYYY').format('YYYY/MM/DD');
    let fecf = moment(final, 'DD/MM/YYYY').format('YYYY/MM/DD');
    // VERIFICAR SI LAS FECHAS ESTAN INGRESDAS DE FORMA CORRECTA
    if (Date.parse(feci) <= Date.parse(fecf)) {
      if (opcion === 1) {
        formulario.setValue(moment(inicio, 'DD/MM/YYYY'));
      }
      else {
        formulario.setValue(moment(final, 'DD/MM/YYYY'));
      }
    }
    else {
      this.toastr.warning('La fecha no se registro. Ups la fecha no es correcta.!!!', 'VERIFICAR', {
        timeOut: 6000,
      });
    }
  }

  // METODO PARA SELECCIONAR TIPO DE BUSQUEDA
  ver_tabla_horarios: boolean = true;
  BuscarHorarioPeriodo() {
    this.ver_tabla_horarios = true;
    this.eliminar_plan = false;
    this.ventana_horario = false;
    this.registrar_rotativo = false;
    this.editar_horario = false;

    if (this.fechaInicialF.value != null && this.fechaFinalF.value != null) {
      this.ObtenerHorariosEmpleado(this.fechaInicialF.value, this.fechaFinalF.value, 1);
    }
    else {
      let inicio = moment().format('YYYY/MM/01');
      let final = moment().format('YYYY/MM/') + moment().daysInMonth();
      this.ObtenerHorariosEmpleado(inicio, final, 2);
    }
  }

  // METODO PARA MOSTRAR DATOS DE HORARIO 
  horariosEmpleado: any = [];
  mes_inicio: any = '';
  mes_fin: any = '';
  ObtenerHorariosEmpleado(fec_inicio: any, fec_final: any, opcion: number) {
    this.horariosEmpleado = [];
    if (opcion === 1) {
      this.mes_inicio = fec_inicio.format("YYYY-MM-DD");
      this.mes_fin = fec_final.format("YYYY-MM-DD");
    }
    else {
      this.mes_inicio = fec_inicio;
      this.mes_fin = fec_final;
    }

    let busqueda = {
      fecha_inicio: this.mes_inicio,
      fecha_final: this.mes_fin,
      codigo: '\'' + this.datoActual.codigo + '\''
    }
    this.restPlanGeneral.BuscarPlanificacionHoraria(busqueda).subscribe(datos => {
      if (datos.message === 'OK') {
        this.horariosEmpleado = datos.data;
        let index = 0;
        this.horariosEmpleado.forEach((obj: any) => {
          obj.index = index;
          index = index + 1;
        })
        this.ver_detalle = true;
        this.ver_acciones = false;
        this.ver_activar_editar = true;
        this.editar_activar = false;
      }
      else {
        this.toastr.info('Ups no se han encontrado registros!!!', 'No existe planificación.', {
          timeOut: 6000,
        });
        this.ver_acciones = false;
        this.ver_activar_editar = false;
        this.editar_activar = false;
      }
    })
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
      codigo: '\'' + this.datoActual.codigo + '\''
    }
    let codigo_horario = '';
    let tipos: any = [];
    let accion = '';
    // VARIABLES AUXILIARES
    let aux_h = '';
    let aux_a = '';
    // BUSQUEDA DE DETALLES DE PLANIFICACIONES
    this.restPlanGeneral.BuscarDetallePlanificacion(busqueda).subscribe(datos => {
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

  // ITEMS DE PAGINACION DE LA TABLA 
  pageSizeOptionsD = [5, 10, 20, 50];
  tamanio_paginaD: number = 5;
  numero_paginaD: number = 1;

  // EVENTO PARA MOSTRAR NÚMERO DE FILAS EN TABLA
  ManejarPaginaDetalles(e: PageEvent) {
    this.numero_paginaD = e.pageIndex + 1;
    this.tamanio_paginaD = e.pageSize;
  }

  /** ***************************************************************************************** ** 
   ** **              METODOS PARA MANEJAR HORARIOS FIJOS DEL USUARIO                        ** ** 
   ** ***************************************************************************************** **/

  // VENTANA PARA REGISTRAR HORARIO 
  ventana_horario: boolean = false;
  data_horario: any = [];
  AbrirPlanificarHorario(): void {
    this.ver_tabla_horarios = false;
    this.ver_acciones = false;
    this.eliminar_plan = false;
    this.registrar_rotativo = false;
    this.editar_horario = false;
    this.data_horario = [];
    if (this.datoActual.id_cargo != undefined) {
      this.ventana_horario = true;
      this.ver_rotativo = false;

      this.data_horario = {
        pagina: 'perfil-empleado',
        codigo: this.datoActual.codigo,
        idCargo: this.datoActual.id_cargo,
        idEmpleado: this.idEmpleado,
        horas_trabaja: this.cargoEmpleado[0].hora_trabaja,
      }
    }
    else {
      this.toastr.info('El usuario no tiene registrado un Cargo.', '', {
        timeOut: 6000,
      })
    }
  }

  /** **************************************************************************************** **
   ** **                          METODO DE REGISTRO DE HORARIOS ROTATIVOS                  ** **
   ** **************************************************************************************** **/

  // VENTANA PARA REGISTRAR PLANIFICACION DE HORARIOS DEL EMPLEADO 
  rotativo: any = []
  registrar_rotativo: boolean = false;
  ver_rotativo: boolean = true;
  pagina_rotativo: string = '';
  AbrirVentanaHorarioRotativo(): void {
    if (this.datoActual.id_cargo != undefined) {
      this.pagina_rotativo = 'perfil-empleado';
      this.rotativo = {
        idCargo: this.datoActual.id_cargo,
        codigo: this.datoActual.codigo,
        pagina: this.pagina_rotativo,
        idEmpleado: this.idEmpleado,
        horas_trabaja: this.cargoEmpleado[0].hora_trabaja,
      }
      this.registrar_rotativo = true;
      this.ver_acciones = false;
      this.ver_tabla_horarios = false;
      this.ventana_horario = false;
      this.eliminar_plan = false;
      this.editar_horario = false;
    }
    else {
      this.toastr.info('El usuario no tiene registrado un Cargo.', '', {
        timeOut: 6000,
      })
    }
  }

  /** ********************************************************************************************* **
   ** **                               ELIMINAR PLANIFICACIONES HORARIAS                         ** **
   ** ********************************************************************************************* **/
  eliminar_plan: boolean = false;
  eliminar_horarios: any = [];
  EliminarHorarios() {
    this.eliminar_horarios = {
      pagina: 'perfil-empleado',
      usuario: [{ codigo: this.datoActual.codigo, id: this.idEmpleado }]
    }
    this.ver_tabla_horarios = false;
    this.eliminar_plan = true;
    this.ver_acciones = false;
    this.ventana_horario = false;
    this.registrar_rotativo = false;
    this.editar_horario = false;
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
  AbrirEditarHorario(anio: any, mes: any, dia: any, horario: any, index: any): void {
    let fecha = anio + '-' + mes + '-' + dia;
    let fecha_ = moment(fecha, 'YYYY-MM-D').format('YYYY/MM/DD');
    let verificar = moment(fecha_, 'YYYY/MM/DD', true).isValid();
    console.log('resultado ', verificar)
    // VERIFICAR QUE EL DIA SEA VALIDO
    if (verificar === true) {
      this.horariosEmpleado[index].color = 'ok';
      this.horariosEmpleado[index].seleccionado = dia;
      this.datos_editar = {
        idEmpleado: this.idEmpleado,
        datosPlan: horario,
        anio: anio,
        mes: mes,
        dia: dia,
        codigo: this.datoActual.codigo,
        pagina: 'perfil-empleado',
        idCargo: this.datoActual.id_cargo,
        horas_trabaja: this.cargoEmpleado[0].hora_trabaja,
        index: index
      }
      this.editar_horario = true;
      this.expansion = false;
      this.editar_activar = false;
      this.ver_activar_editar = false;
    }
    else {
      this.toastr.warning('Ups!!! Fecha no es válida.', '', {
        timeOut: 6000,
      });
    }
  }

  // METODO PARA EXPANDIR Y CONTRAER FORMULARIO
  expansion: boolean = true;

  // METODO PARA CAMBIAR DE COLORES SEGUN EL MES
  CambiarColores(opcion: any) {
    let color: string;
    switch (opcion) {
      case 'ok':
        return color = '#F6DDCC';
    }
  }
}

