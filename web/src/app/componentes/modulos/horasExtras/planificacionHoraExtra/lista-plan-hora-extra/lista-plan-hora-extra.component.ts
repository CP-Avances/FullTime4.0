import { FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';

import { SelectionModel } from '@angular/cdk/collections';

import { PlanHoraExtraService } from 'src/app/servicios/planHoraExtra/plan-hora-extra.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';

import { TiempoAutorizadoComponent } from '../../tiempo-autorizado/tiempo-autorizado.component';
import { PlanHoraExtraAutorizaComponent } from 'src/app/componentes/autorizaciones/plan-hora-extra-autoriza/plan-hora-extra-autoriza.component';

export interface HoraExtraPlanElemento {
  apellido: string;
  cedula: string;
  codigo: string;
  empl_id: number;
  fecha_desde: string;
  fecha_hasta: string;
  fecha_timbre: string;
  hora_fin: string;
  hora_inicio: string;
  hora_total_plan: string;
  hora_total_timbre: string;
  id_plan_extra: number;
  id_empl_cargo: number;
  id_empl_contrato: number;
  nombre: string;
  observacion: string;
  plan_estado: string;
  tiempo_autorizado: string;
  timbre_entrada: string;
  timbre_salida: string
}

@Component({
  selector: 'app-lista-plan-hora-extra',
  templateUrl: './lista-plan-hora-extra.component.html',
  styleUrls: ['./lista-plan-hora-extra.component.css']
})

export class ListaPlanHoraExtraComponent implements OnInit {

  horas_extras_plan: any = [];
  horas_extras_plan_observacion: any = [];
  selectionUno = new SelectionModel<HoraExtraPlanElemento>(true, []);

  // BUSQUEDA
  cedula = new FormControl('', [Validators.minLength(2)]);
  nombre = new FormControl('', [Validators.minLength(2)]);
  filtroCedula: '';
  filtroCedulaO: '';
  filtroEmpleado = '';

  // HABILITAR O DESHABILITAR EL ICONO DE AUTORIZACION INDIVIDUAL
  auto_individual: boolean = true;

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  // ITEMS DE PAGINACION DE LA TABLA OBSERVACION
  tamanio_pagina_O: number = 5;
  numero_pagina_O: number = 1;
  pageSizeOptions_O = [5, 10, 20, 50];

  // HABILITAR O DESHABILITAR SELECTOR DE EMPLEADOS
  Habilitar: boolean = true;

  // HABILITAR O DESHABILITAR LISTA DE EMPLEADOS CON OBSERVACIONES
  HabilitarObservacion: boolean = true;
  HabilitarAutoriza: boolean = true;
  HabilitarPlan: boolean = true;

  constructor(
    public toastr: ToastrService,
    private restHEP: PlanHoraExtraService,
    private ventana: MatDialog,
    private validacionesService: ValidacionesService
  ) { }

  ngOnInit(): void {
    this.obtenerPlanHorasExtras();
    this.obtenerPlanHorasExtrasObservacion();
    this.obtenerPlanHorasExtrasAutorizadas();
    this.calcularHoraPaginacion1();
    this.calcularHoraPaginacion2();
    this.calcularHoraPaginacion_auto();
  }

  /** ********************************************************************************************
   *                         LISTA DE PLANIFICACIONES QUE DEBEN SER AUTORIZADAS
   *  ******************************************************************************************** **/
  // Lista de empleados que han realizado horas extras planificadas
  totalHorasExtras;
  obtenerPlanHorasExtras() {
    var t1 = new Date();
    var tt = new Date();
    var hora1 = '00:00:00', horaT = '00:00:00'.split(":");
    this.restHEP.ConsultarPlanHoraExtra().subscribe(res => {
      this.horas_extras_plan = res;
      if (this.horas_extras_plan.length != 0) {
        this.HabilitarPlan = false;
      } else {
        this.HabilitarPlan = true;
      }
      for (var i = 0; i <= this.horas_extras_plan.length - 1; i++) {
        if (this.horas_extras_plan[i].plan_estado === 1) {
          this.horas_extras_plan[i].plan_estado = 'Pendiente';
        }
        else if (this.horas_extras_plan[i].plan_estado === 2) {
          this.horas_extras_plan[i].plan_estado = 'Pre-Autorizado';
        }
        else if (this.horas_extras_plan[i].plan_estado === 3) {
          this.horas_extras_plan[i].plan_estado = 'Autorizado';
        }
        else if (this.horas_extras_plan[i].plan_estado === 4) {
          this.horas_extras_plan[i].plan_estado = 'Negado';
        }
        // Formato de horas
        hora1 = (this.horas_extras_plan[i].hora_total_timbre).split(":");
        t1.setHours(parseInt(hora1[0]), parseInt(hora1[1]), parseInt(hora1[2]));
        tt.setHours(parseInt(horaT[0]), parseInt(horaT[1]), parseInt(horaT[2]));
        // Aqui realizamos la suma
        tt.setHours(tt.getHours() + t1.getHours(), tt.getMinutes() + t1.getMinutes(), tt.getSeconds() + tt.getSeconds());
        horaT = (moment(tt).format('HH:mm:ss')).split(':');
        this.totalHorasExtras = (moment(tt).format('HH:mm:ss'));
      }
      console.log('planes', this.horas_extras_plan)
    }, err => {
      return this.validacionesService.RedireccionarHomeAdmin(err.error)
    });
  }

  // Suma de subtotales en cada paginación
  sumaHoras: any = [];
  horasSumadas;
  SumatoriaHoras1(inicio, fin) {
    var t1 = new Date();
    var tt = new Date();
    var hora1 = '00:00:00', horaT = '00:00:00'.split(":");
    this.restHEP.ConsultarPlanHoraExtra().subscribe(res => {
      this.sumaHoras = res;
      for (var i = inicio; i < fin; i++) {
        if (i < this.sumaHoras.length) {
          hora1 = (this.sumaHoras[i].hora_total_timbre).split(":");
          t1.setHours(parseInt(hora1[0]), parseInt(hora1[1]), parseInt(hora1[2]));
          tt.setHours(parseInt(horaT[0]), parseInt(horaT[1]), parseInt(horaT[2]));
          // Aqui realizamos la suma
          tt.setHours(tt.getHours() + t1.getHours(), tt.getMinutes() + t1.getMinutes(), tt.getSeconds() + tt.getSeconds());
          horaT = (moment(tt).format('HH:mm:ss')).split(':');
          this.horasSumadas = (moment(tt).format('HH:mm:ss'));
        }
        else {
          break;
        }
      }
    }, err => {
      return this.validacionesService.RedireccionarHomeAdmin(err.error)
    });
  }

  // Calcular subtotales al cambiar la página
  inicioFor = 0;
  calcularHoraPaginacion1() {
    if (this.numero_pagina != 1) {
      this.inicioFor = (this.numero_pagina - 1) * this.tamanio_pagina;
      this.SumatoriaHoras1(this.inicioFor, ((this.numero_pagina) * this.tamanio_pagina))
    } else {
      this.inicioFor = 0;
      this.SumatoriaHoras1(this.inicioFor, ((this.tamanio_pagina) * this.numero_pagina))
    }
  }

  // Evento para manejar paginación 
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
    this.calcularHoraPaginacion1();
  }

  // SELECCIÓN DE DATOS EN LA LISTA DE PLANIFICACIONES
  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelected() {
    const numSelected = this.selectionUno.selected.length;
    const numRows = this.horas_extras_plan.length;
    return numSelected === numRows;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA. 
  masterToggle() {
    this.isAllSelected() ?
      this.selectionUno.clear() :
      this.horas_extras_plan.forEach((row: any) => this.selectionUno.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA.
  checkboxLabel(row?: HoraExtraPlanElemento): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionUno.isSelected(row) ? 'deselect' : 'select'} row ${row.id_plan_extra + 1}`;
  }

  // Habilitar botones de autorización
  btnCheckHabilitar: boolean = false;
  HabilitarSeleccion() {
    if (this.btnCheckHabilitar === false) {
      this.btnCheckHabilitar = true;
      this.auto_individual = false;
    } else if (this.btnCheckHabilitar === true) {
      this.btnCheckHabilitar = false;
      this.auto_individual = true;
    }
  }

  /** ********************************************************************************************
   *                         LISTA DE PLANIFICACIONES QUE TIENEN OBSERVACIÓN
   *  ******************************************************************************************** **/
  // Lista de empleados que han realizado horas extras planificadas y tienen observacion
  totalHorasExtrasO;
  obtenerPlanHorasExtrasObservacion() {
    var t1 = new Date();
    var tt = new Date();
    var hora1 = '00:00:00', horaT = '00:00:00'.split(":");
    this.restHEP.ConsultarPlanHoraExtraObservacion().subscribe(res => {
      this.horas_extras_plan_observacion = res;
      console.log('observa', this.horas_extras_plan_observacion)
      if (this.horas_extras_plan_observacion.length != 0) {
        this.HabilitarObservacion = false;
      } else {
        this.HabilitarObservacion = true;
      }
      for (var i = 0; i <= this.horas_extras_plan_observacion.length - 1; i++) {

        if (this.horas_extras_plan_observacion[i].plan_estado === 1) {
          this.horas_extras_plan_observacion[i].plan_estado = 'Pendiente';
        }
        else if (this.horas_extras_plan_observacion[i].plan_estado === 2) {
          this.horas_extras_plan_observacion[i].plan_estado = 'Pre-Autorizado';
        }
        else if (this.horas_extras_plan_observacion[i].plan_estado === 3) {
          this.horas_extras_plan_observacion[i].plan_estado = 'Autorizado';
        }
        else if (this.horas_extras_plan_observacion[i].plan_estado === 4) {
          this.horas_extras_plan_observacion[i].plan_estado = 'Negado';
        }
        // Formato de horas
        hora1 = (this.horas_extras_plan_observacion[i].hora_total_timbre).split(":");
        t1.setHours(parseInt(hora1[0]), parseInt(hora1[1]), parseInt(hora1[2]));
        tt.setHours(parseInt(horaT[0]), parseInt(horaT[1]), parseInt(horaT[2]));
        //Aquí hago la suma
        tt.setHours(tt.getHours() + t1.getHours(), tt.getMinutes() + t1.getMinutes(), tt.getSeconds() + tt.getSeconds());
        horaT = (moment(tt).format('HH:mm:ss')).split(':');
        this.totalHorasExtrasO = (moment(tt).format('HH:mm:ss'));
      }
    }, err => {
      return this.validacionesService.RedireccionarHomeAdmin(err.error)
    });
  }

  // Subtotales de la lista con observaciones
  sumaHoras2: any = [];
  horasSumadas2;
  SumatoriaHoras2(inicio, fin) {
    var t1 = new Date();
    var tt = new Date();
    var hora1 = '00:00:00', horaT = '00:00:00'.split(":");
    this.restHEP.ConsultarPlanHoraExtraObservacion().subscribe(res => {
      this.sumaHoras2 = res;
      for (var i = inicio; i < fin; i++) {
        if (i < this.sumaHoras2.length) {
          hora1 = (this.sumaHoras2[i].hora_total_timbre).split(":");
          t1.setHours(parseInt(hora1[0]), parseInt(hora1[1]), parseInt(hora1[2]));
          tt.setHours(parseInt(horaT[0]), parseInt(horaT[1]), parseInt(horaT[2]));
          //Aquí hago la suma
          tt.setHours(tt.getHours() + t1.getHours(), tt.getMinutes() + t1.getMinutes(), tt.getSeconds() + tt.getSeconds());
          horaT = (moment(tt).format('HH:mm:ss')).split(':');
          this.horasSumadas2 = (moment(tt).format('HH:mm:ss'));
        }
        else {
          break;
        }
      }
      console.log(res);
    }, err => {
      return this.validacionesService.RedireccionarHomeAdmin(err.error)
    });
  }

  // Evento para manejar paginación 
  ManejarPaginaObserva(e: PageEvent) {
    this.tamanio_pagina_O = e.pageSize;
    this.numero_pagina_O = e.pageIndex + 1;
    this.calcularHoraPaginacion2();
  }

  // Calcular subtotales de lista con observación al cambiar página
  inicioFor2 = 0;
  calcularHoraPaginacion2() {
    if (this.numero_pagina_O != 1) {
      this.inicioFor2 = (this.numero_pagina_O - 1) * this.tamanio_pagina_O;
      this.SumatoriaHoras2(this.inicioFor2, ((this.numero_pagina_O) * this.tamanio_pagina_O))
    } else {
      this.inicioFor2 = 0;
      this.SumatoriaHoras2(this.inicioFor2, ((this.tamanio_pagina_O) * this.numero_pagina_O))
    }
  }

  // SELECCIONAR DATOS DE LA LISTA CON OBSERVACIONES
  selectionDos = new SelectionModel<HoraExtraPlanElemento>(true, []);
  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedO() {
    const numSelected = this.selectionDos.selected.length;
    const numRows = this.horas_extras_plan_observacion.length;
    return numSelected === numRows;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleO() {
    this.isAllSelectedO() ?
      this.selectionDos.clear() :
      this.horas_extras_plan_observacion.forEach((row: any) => this.selectionDos.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelO(row?: HoraExtraPlanElemento): string {
    if (!row) {
      return `${this.isAllSelectedO() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionDos.isSelected(row) ? 'deselect' : 'select'} row ${row.id_plan_extra + 1}`;
  }

  // Habilitar botones de autorizacion - lista de observaciones
  btnCheckHabilitarO: boolean = false;
  auto_individualO: boolean = true;
  HabilitarSeleccionO() {
    if (this.btnCheckHabilitarO === false) {
      this.btnCheckHabilitarO = true;
      this.auto_individualO = false;
    } else if (this.btnCheckHabilitarO === true) {
      this.btnCheckHabilitarO = false;
      this.auto_individualO = true;
    }
  }

  // Autorizar horas realizadas o indicar cuantas horas se autorizan
  AbrirTiempoAutorizacion(num_hora, id, datos, id_solicita) {
    let h = {
      id: id,
      hora: num_hora,
      id_empl_solicita: id_solicita
    }
    this.ventana.open(TiempoAutorizadoComponent, {
      width: '300px',
      data: { horas_calculadas: h, pagina: 'plan_hora_extra' }
    }).afterClosed().subscribe(items => {
      if (items === true) {
        this.AbrirAutorizaciones(datos, 'individual');
      }
      else {
        window.location.reload();
      }
    });
  }

  // Autorización individual de horas extras planificadas
  AbrirAutorizaciones(datosHoraExtra, forma: string) {
    this.ventana.open(PlanHoraExtraAutorizaComponent,
      { width: '300px', data: { datosHora: datosHoraExtra, carga: forma } }).afterClosed().subscribe(items => {
        /* this.obtenerPlanHorasExtras();
          this.obtenerPlanHorasExtrasObservacion();
          this.obtenerPlanHorasExtrasAutorizadas();
          this.calcularHoraPaginacion1();
          this.calcularHoraPaginacion2();
          this.calcularHoraPaginacion_auto();
          this.auto_individualO = true;
          this.auto_individual = true;*/
        window.location.reload();
      });
  }

  // Autorizar horas realizadas o indicar cuantas horas se autorizan de forma múltiple
  AutorizarHoras(lista: string) {
    var dato: any;
    if (lista === 'pedido') {
      dato = this.selectionUno;
    }
    else if (lista === 'observacion') {
      dato = this.selectionDos;
    }
    let EmpleadosSeleccionados: any;
    EmpleadosSeleccionados = dato.selected.map(obj => {
      return {
        id_plan_extra: obj.id_plan_extra,
        hora_total_timbre: obj.hora_total_timbre,
        empleado: obj.nombre + ' ' + obj.apellido,
        id_usua_solicita: obj.empl_id,
        estado: obj.plan_estado,
        id_cargo: obj.id_empl_cargo
      }
    })
    for (var i = 0; i <= EmpleadosSeleccionados.length - 1; i++) {
      let h = {
        hora: EmpleadosSeleccionados[i].hora_total_timbre
      }
      this.restHEP.AutorizarTiempoHoraExtra(EmpleadosSeleccionados[i].id_plan_extra, h).subscribe(res => {
      }, err => {
        return this.validacionesService.RedireccionarHomeAdmin(err.error)
      })
    }
    this.AbrirAutorizaciones(EmpleadosSeleccionados, 'multiple');
  }

  // METODO para limpiar el campo cédula
  limpiarCampos() {
    this.cedula.reset();
    this.nombre.reset();
    this.filtroEmpleado = '';
  }

  // METODO PARA INGRESAR SOLO NUMEROS
  IngresarSoloNumeros(evt) {
    return this.validacionesService.IngresarSoloNumeros(evt)
  }

  /** ********************************************************************************************
     *                         LISTA DE PLANIFICACIONES AUTORIZADAS
     *  ******************************************************************************************** **/
  // Lista de empleados que han realizado horas extras planificadas
  totalAutorizadas;
  horas_extras_autorizadas: any = [];
  obtenerPlanHorasExtrasAutorizadas() {
    var t1 = new Date();
    var tt = new Date();
    var hora1 = '00:00:00', horaT = '00:00:00'.split(":");
    this.restHEP.ConsultarPlanHoraExtraAutorizada().subscribe(res => {
      this.horas_extras_autorizadas = res;
      if (this.horas_extras_autorizadas.length != 0) {
        this.HabilitarAutoriza = false;
      } else {
        this.HabilitarAutoriza = true;
      }
      for (var i = 0; i <= this.horas_extras_autorizadas.length - 1; i++) {
        if (this.horas_extras_autorizadas[i].plan_estado === 1) {
          this.horas_extras_autorizadas[i].plan_estado = 'Pendiente';
        }
        else if (this.horas_extras_autorizadas[i].plan_estado === 2) {
          this.horas_extras_plan[i].plan_estado = 'Pre-Autorizado';
        }
        else if (this.horas_extras_autorizadas[i].plan_estado === 3) {
          this.horas_extras_autorizadas[i].plan_estado = 'Autorizado';
        }
        else if (this.horas_extras_autorizadas[i].plan_estado === 4) {
          this.horas_extras_autorizadas[i].plan_estado = 'Negado';
        }
        // Formato de horas
        hora1 = (this.horas_extras_autorizadas[i].hora_total_timbre).split(":");
        t1.setHours(parseInt(hora1[0]), parseInt(hora1[1]), parseInt(hora1[2]));
        tt.setHours(parseInt(horaT[0]), parseInt(horaT[1]), parseInt(horaT[2]));
        // Aqui realizamos la suma
        tt.setHours(tt.getHours() + t1.getHours(), tt.getMinutes() + t1.getMinutes(), tt.getSeconds() + tt.getSeconds());
        horaT = (moment(tt).format('HH:mm:ss')).split(':');
        this.totalAutorizadas = (moment(tt).format('HH:mm:ss'));
      }
    }, err => {
      return this.validacionesService.RedireccionarHomeAdmin(err.error)
    });
  }

  // Suma de subtotales en cada paginación
  sumaHoras_auto: any = [];
  horasSumadas_auto;
  SumatoriaHoras_auto(inicio, fin) {
    var t1 = new Date();
    var tt = new Date();
    var hora1 = '00:00:00', horaT = '00:00:00'.split(":");
    this.restHEP.ConsultarPlanHoraExtraAutorizada().subscribe(res => {
      this.sumaHoras_auto = res;
      for (var i = inicio; i < fin; i++) {
        if (i < this.sumaHoras_auto.length) {
          hora1 = (this.sumaHoras_auto[i].hora_total_timbre).split(":");
          t1.setHours(parseInt(hora1[0]), parseInt(hora1[1]), parseInt(hora1[2]));
          tt.setHours(parseInt(horaT[0]), parseInt(horaT[1]), parseInt(horaT[2]));
          // Aqui realizamos la suma
          tt.setHours(tt.getHours() + t1.getHours(), tt.getMinutes() + t1.getMinutes(), tt.getSeconds() + tt.getSeconds());
          horaT = (moment(tt).format('HH:mm:ss')).split(':');
          this.horasSumadas_auto = (moment(tt).format('HH:mm:ss'));
        }
        else {
          break;
        }
      }
    }, err => {
      return this.validacionesService.RedireccionarHomeAdmin(err.error)
    });
  }

  // Calcular subtotales al cambiar la página
  inicioFor_auto = 0;
  calcularHoraPaginacion_auto() {
    if (this.numero_pagina_auto != 1) {
      this.inicioFor_auto = (this.numero_pagina_auto - 1) * this.tamanio_pagina_auto;
      this.SumatoriaHoras_auto(this.inicioFor_auto, ((this.numero_pagina_auto) * this.tamanio_pagina_auto))
    } else {
      this.inicioFor_auto = 0;
      this.SumatoriaHoras_auto(this.inicioFor_auto, ((this.tamanio_pagina_auto) * this.numero_pagina_auto))
    }
  }

  tamanio_pagina_auto: number = 5;
  numero_pagina_auto: number = 1;
  pageSizeOptions_auto = [5, 10, 20, 50];
  // Evento para manejar paginación 
  ManejarPagina_auto(e: PageEvent) {
    this.tamanio_pagina_auto = e.pageSize;
    this.numero_pagina_auto = e.pageIndex + 1;
    this.calcularHoraPaginacion_auto();
  }

  IngresarSoloLetras(e) {
    let key = e.keyCode || e.which;
    let tecla = String.fromCharCode(key).toString();
    //Se define todo el abecedario que se va a usar.
    let letras = " áéíóúabcdefghijklmnñopqrstuvwxyzÁÉÍÓÚABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    //Es la validación del KeyCodes, que teclas recibe el campo de texto.
    let especiales = [8, 37, 39, 46, 6, 13];
    let tecla_especial = false
    for (var i in especiales) {
      if (key == especiales[i]) {
        tecla_especial = true;
        break;
      }
    }
    if (letras.indexOf(tecla) == -1 && !tecla_especial) {
      this.toastr.info('No se admite datos numéricos', 'Usar solo letras', {
        timeOut: 6000,
      })
      return false;
    }
  }

}
