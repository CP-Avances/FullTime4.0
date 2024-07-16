import { Component, OnInit } from '@angular/core';

import { Validators, FormGroup, FormControl } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';

import { ToastrService } from 'ngx-toastr';
import moment from 'moment';

import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { PlanGeneralService } from 'src/app/servicios/planGeneral/plan-general.service';
import { AsignacionesService } from 'src/app/servicios/asignaciones/asignaciones.service';

@Component({
  selector: 'app-buscar-asistencia',
  templateUrl: './buscar-asistencia.component.html',
  styleUrls: ['./buscar-asistencia.component.css']
})

export class BuscarAsistenciaComponent implements OnInit {

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  fechaInicio = new FormControl('', [Validators.required]);
  fechaFin = new FormControl('', [Validators.required]);
  codigo = new FormControl('');
  cedula = new FormControl('');
  nombre = new FormControl('');
  apellido = new FormControl('');

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  idEmpleadoLogueado: any;
  rolEmpleado: number; // VARIABLE DE ALMACENAMIENTO DE ROL DE EMPLEADO QUE INICIA SESION

  idUsuariosAcceso: Set<any> = new Set();

  existenAsistencias: boolean = false;

  public formulario = new FormGroup({
    fechaInicioForm: this.fechaInicio,
    fechaFinForm: this.fechaFin,
    nombreForm: this.nombre,
    apellidoForm: this.apellido,
    codigoForm: this.codigo,
    cedulaForm: this.cedula,
  });

  constructor(
    private toastr: ToastrService,
    public validar: ValidacionesService,
    public asistir: PlanGeneralService,
    public parametro: ParametrosService,
    private asignaciones: AsignacionesService,
  ) { }

  ngOnInit(): void {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado') as string);
    this.idUsuariosAcceso = this.asignaciones.idUsuariosAcceso;
    this.rolEmpleado = parseInt(localStorage.getItem('rol') as string);

    this.BuscarFecha();
    this.BuscarHora();
  }

  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** **
   ** **************************************************************************************** **/

  formato_fecha: string = 'DD/MM/YYYY';
  formato_hora: string = 'HH:mm:ss';

  // METODO PARA BUSCAR PARAMETRO DE FORMATO DE FECHA
  BuscarFecha() {
    // id_tipo_parametro Formato fecha = 1
    this.parametro.ListarDetalleParametros(1).subscribe(
      res => {
        this.formato_fecha = res[0].descripcion;
        this.BuscarHora();
      });
  }

  BuscarHora() {
    // id_tipo_parametro Formato hora = 2
    this.parametro.ListarDetalleParametros(2).subscribe(
      res => {
        this.formato_hora = res[0].descripcion;
      });
  }

  // CONTROL DE PAGINACION
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1
  }

  // METODO PARA
  asistencia: any = [];
  ver_asistencia: boolean = true;
  BuscarDatosAsistencia(form: any) {
    this.asistencia = [];
    this.existenAsistencias = false;
    let datos = {
      codigo: form.codigoForm,
      cedula: form.cedulaForm,
      nombre: form.nombreForm,
      apellido: form.apellidoForm,
      inicio: form.fechaInicioForm,
      fin: form.fechaFinForm,
    }

    if (!datos.codigo && !datos.cedula && !datos.nombre && !datos.apellido) {
      return this.toastr.warning('Debe ingresar al menos un criterio de búsqueda.', 'Notificación', {
        timeOut: 6000,
      });
    }

    this.asistir.ConsultarAsistencia(datos).subscribe(async data => {
      console.log('ver asistencia ', data)

      if (data.message === 'OK') {

        if (data.respuesta.length > 0) {
          this.existenAsistencias = true;
        }

        this.asistencia = this. rolEmpleado === 1 ? data.respuesta : await this.FiltrarEmpleadosAsignados(data.respuesta);

        if (this.asistencia.length === 0 && this.existenAsistencias) {
          return this.toastr.error('No tiene acceso a los datos de este usuario.', 'Notificación', {
            timeOut: 6000,
          });
        }
        this.asistencia.forEach((obj: any) => {
          //console.log('ver fecha ', moment(obj.fecha_hora_horario).format('YYYY-MM-DD'))
          //console.log('ver hora ', moment(obj.fecha_hora_horario).format('HH:mm:ss'))
          obj.fecha_general_ = this.validar.FormatearFecha(moment(obj.fecha_horario).format('YYYY-MM-DD'), this.formato_fecha, this.validar.dia_abreviado);
          obj.fecha_horario_ = this.validar.FormatearFecha(obj.fecha_horarios, this.formato_fecha, this.validar.dia_abreviado);
          obj.hora_horario_ = this.validar.FormatearHora(obj.hora_horario, this.formato_hora);
          if (obj.fecha_timbre) {
            obj.fecha_timbre_ = this.validar.FormatearFecha(obj.fecha_timbre, this.formato_fecha, this.validar.dia_abreviado);
          }
          if (obj.hora_timbre) {
            obj.hora_timbre_ = this.validar.FormatearHora(obj.hora_timbre, this.formato_hora);
          }
          if (obj.tipo_accion === 'E') {
            obj.tipo_ = 'Entrada';
          }
          else if (obj.tipo_accion === 'S') {
            obj.tipo_ = 'Salida';
          }
          else if (obj.tipo_accion === 'I/A') {
            obj.tipo_ = 'Inicio alimentación';
          }
          else if (obj.tipo_accion === 'F/A') {
            obj.tipo_ = 'Fin alimentación';
          }
          else if (obj.tipo_accion === 'I/P') {
            obj.tipo_ = 'Inicio permiso';
          }
          else if (obj.tipo_accion === 'F/P') {
            obj.tipo_ = 'Fin permiso';
          }
          else if (obj.tipo_accion === 'HA') {
            obj.tipo_ = 'Timbre libre';
          }
        })
      }
      else {
        this.toastr.warning('No se han encontrado registros.', '', {
          timeOut: 6000,
        });
      }
    }, vacio => {
      this.toastr.warning('No se han encontrado registros.', '', {
        timeOut: 6000,
      });
    })
  }

  async FiltrarEmpleadosAsignados(data: any) {
    return data.filter((asistencia: any) => this.idUsuariosAcceso.has(asistencia.id_empleado));
  }

  // METODO PARA VER PANTALLA DETALLE DE TIMBRE
  ver_detalle: boolean = false;
  informacion: any = [];
  VerDetalle(seleccion: any) {
    this.ver_asistencia = false;
    this.ver_detalle = true;
    this.informacion = {
      pagina: 'buscar-asistencia',
      detalle: seleccion,
    }
  }

  // METODO PARA LIMPIAR FORMULARIO
  Limpiar() {
    this.formulario.reset();
    this.asistencia = [];
  }


}
