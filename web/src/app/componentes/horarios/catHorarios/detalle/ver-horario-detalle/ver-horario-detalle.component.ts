import { Component, OnInit, Input } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';

import { DetalleCatHorariosService } from 'src/app/servicios/horarios/detalleCatHorarios/detalle-cat-horarios.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/configuracion/parametrizacion/parametrosGenerales/parametros.service';
import { HorarioService } from 'src/app/servicios/horarios/catHorarios/horario.service';

import { EditarDetalleCatHorarioComponent } from 'src/app/componentes/horarios/catHorarios/detalle/editar-detalle-cat-horario/editar-detalle-cat-horario.component';
import { HorarioMultipleEmpleadoComponent } from 'src/app/componentes/horarios/planificar-horarios/rango-fechas/horario-multiple-empleado/horario-multiple-empleado.component';
import { DetalleCatHorarioComponent } from 'src/app/componentes/horarios/catHorarios/detalle/detalle-cat-horario/detalle-cat-horario.component';
import { PrincipalHorarioComponent } from '../../horario/principal-horario/principal-horario.component';
import { EditarHorarioComponent } from '../../horario/editar-horario/editar-horario.component';
import { MetodosComponent } from 'src/app/componentes/generales/metodoEliminar/metodos.component';

@Component({
  selector: 'app-ver-horario-detalle',
  standalone: false,
  templateUrl: './ver-horario-detalle.component.html',
  styleUrls: ['./ver-horario-detalle.component.css']
})

export class VerHorarioDetalleComponent implements OnInit {
  ips_locales: any = '';

  @Input() idHorario: number;
  @Input() pagina: string;

  datosHorario: any = [];
  datosDetalle: any = [];

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  booleanMap = { 'true': 'Si', 'false': 'No' };
  hipervinculo: string = (localStorage.getItem('empresaURL') as string);

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    private toastr: ToastrService,
    private restD: DetalleCatHorariosService,
    private rest: HorarioService,
    public router: Router,
    public ventana: MatDialog,
    public validar: ValidacionesService,
    public parametro: ParametrosService,
    public componente: PrincipalHorarioComponent,
    public componentep: HorarioMultipleEmpleadoComponent,
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');  
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    }); 

    this.BuscarDatosHorario(this.idHorario);
    this.BuscarHora();
  }

  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** **
   ** **************************************************************************************** **/

  formato_hora: string = 'HH:mm:ss';

  BuscarHora() {
    // id_tipo_parametro Formato hora = 2
    this.parametro.ListarDetalleParametros(2).subscribe(
      res => {
        this.formato_hora = res[0].descripcion;
        this.ListarDetalles(this.idHorario, this.formato_hora);
      },
      vacio => {
        this.ListarDetalles(this.idHorario, this.formato_hora);
      });
  }

  // METODO PARA MANEJAR LA PAGINACION
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1
  }

  // METODO PARA BUSCAR UN HORARIO
  BuscarDatosHorario(id_horario: any) {
    this.datosHorario = [];
    this.rest.BuscarUnHorario(id_horario).subscribe(data => {
      this.datosHorario = data;
      console.log('horarios ', data)
      this.ColocarTipo();
    })
  }

  // METODO PARA COLOCAR TIPO DE HORARIO
  ColocarTipo() {
    this.datosHorario.forEach((obj: any) => {
      if (obj.default_ === 'N') {
        obj.default_tipo = 'Laborable';
      }
      else if (obj.default_ === 'L' || obj.default_ === 'DL') {
        obj.default_tipo = 'Libre';
      }
      else if (obj.default_ === 'FD' || obj.default_ === 'DFD') {
        obj.default_tipo = 'Feriado';
      }
      else if (obj.default_ === 'HA' || obj.default_ === 'DHA') {
        obj.default_tipo = 'Abierto';
      }
    })
  }

  // METODO PARA BUSCAR DETALES DE UN HORARIO
  detalles: any = [];
  ListarDetalles(id_horario: any, formato_hora: string) {
    this.datosDetalle = [];
    this.detalles = [];
    this.restD.ConsultarUnDetalleHorario(id_horario).subscribe(datos => {
      this.datosDetalle = datos;
      this.detalles = datos;
      this.datosDetalle.forEach((data: any) => {
        data.hora_ = this.validar.FormatearHora(data.hora, formato_hora);
      });
    })
  }

  // METODO PARA REGISTRAR DETALLE DE HORARIO
  AbrirVentanaDetalles(datosSeleccionados: any): void {
    this.ventana.open(DetalleCatHorarioComponent,
      { width: '600px', data: { datosHorario: datosSeleccionados, actualizar: true } })
      .afterClosed().subscribe(item => {
        this.BuscarDatosHorario(this.idHorario);
        this.ListarDetalles(this.idHorario, this.formato_hora);
      });
  }

  // METODO PARA EDITAR HORARIO
  AbrirVentanaEditar(datosSeleccionados: any): void {
    this.ventana.open(EditarHorarioComponent, { width: '900px', data: { horario: datosSeleccionados, actualizar: true } })
      .afterClosed().subscribe(result => {
        if (result !== undefined) {
          this.datosHorario = result;
        }
        this.BuscarDatosHorario(this.idHorario);
        this.ListarDetalles(this.idHorario, this.formato_hora);
      });
  }

  // METODO PARA EDITAR DETALLE DE HORARIO
  AbrirVentanaEditarDetalle(datosSeleccionados: any): void {
    this.ventana.open(EditarDetalleCatHorarioComponent,
      { width: '600px', data: { detalle: datosSeleccionados, horario: this.datosHorario[0] } }).afterClosed().subscribe(item => {
        this.BuscarDatosHorario(this.idHorario);
        this.ListarDetalles(this.idHorario, this.formato_hora);
      });
  }

  // METODO PARA CALCULAR HORAS DE TRABAJO
  CalcularHorasTrabaja() {
    const [cg_horario] = this.datosHorario;
    const { nocturno, id, minutos_comida } = cg_horario;

    // SI LAS HORAS TIENEN FORMATO HH:mm SE REALIZA VALIDACIONES
    if (this.datosHorario[0].hora_trabajo.split(':').length === 2) {

      // SI NO EXISTEN DETALLES DE HORARIO
      if (this.datosDetalle.length === 0) return this.toastr.error(
        'Ingresar detalles de horario para continuar.'
      );

      // REGISTROS INCOMPLETOS DE DETALLE DE HORARIOS
      if (this.datosDetalle.length === 1) return this.toastr.error(
        `El horario debe tener al menos 2 detalles (Entrada - Salida).`, 'Detalle de horario incompleto.'
      );

      // VALIDAR SI EXISTE REGISTRO MINUTOS DE ALMUERZO
      if (minutos_comida != 0) {
        if (this.datosDetalle.length != 4) return this.toastr.error(
          `El horario debe tener 4 detalles. (Entrada - Inicio alimentación - Fin alimentación - Salida)`,
          'Detalle de horario incompleto.'
        );

        if (nocturno === true) {
          var [det_uno, det_dos, det_tres, det_cuatro] = this.datosDetalle;

          // HORARIOS CON FINALIZACION DE JORNADA Y ALIMENTACION EL MISMO DIA
          if (det_cuatro.segundo_dia === false && det_tres.segundo_dia === false && det_dos.segundo_dia === false) {
            if (det_dos.hora < det_tres.hora) {
              if (det_dos.hora > det_uno.hora && det_dos.hora < det_cuatro.hora &&
                det_tres.hora > det_uno.hora && det_tres.hora < det_cuatro.hora) {
              }
              else {
                return this.EmitirMensajeErrorAlimentacion();
              }
            }
            else {
              return this.EmitirMensajeErrorAlimentacion();
            }
          }

          // HORARIOS CON FINALIZACION DE JORNADA EN OTRO DIA
          else if (det_cuatro.segundo_dia === true && det_tres.segundo_dia === false && det_dos.segundo_dia === false) {
            if (det_dos.hora < det_tres.hora) {
              if (det_dos.hora > det_uno.hora && det_dos.hora < '24:00:00' &&
                det_tres.hora > det_uno.hora && det_tres.hora < '24:00:00') {
              }
              else {
                return this.EmitirMensajeErrorAlimentacion();
              }
            }
            else {
              return this.EmitirMensajeErrorAlimentacion();
            }
          }

          // HORARIOS CON FINALIZACION DE JORNADA Y ALIMENTACION EN OTRO DIA
          else if (det_cuatro.segundo_dia === true && det_tres.segundo_dia === true && det_dos.segundo_dia === false) {
            if (det_dos.hora < '24:00:00') {
              if (det_dos.hora > det_uno.hora &&
                det_tres.hora > '00:00:00' && det_tres.hora < det_cuatro.hora) {
              }
              else {
                return this.EmitirMensajeErrorAlimentacion();
              }
            }
            else {
              return this.EmitirMensajeErrorAlimentacion();
            }
          }

          // HORARIOS CON FINALIZACION DE JORNADA E INICIO Y FINALIZACION DE ALIMENTACION EL OTRO DIA
          else if (det_cuatro.segundo_dia === true && det_tres.segundo_dia === true && det_dos.segundo_dia === true) {
            if (det_dos.hora < det_tres.hora) {
              if (det_dos.hora < det_cuatro.hora && det_tres.hora < det_cuatro.hora) {
              }
              else {
                return this.EmitirMensajeErrorAlimentacion();
              }
            }
            else {
              return this.EmitirMensajeErrorAlimentacion();
            }
          }
        }
      }

      // VALIDAR HORAS TOTALES DE HORARIO
      this.ValidarHorario(nocturno, id, minutos_comida);

    }
    // VERIFICADO QUE LAS HORAS TENGAN EL FORMATO HH:mm:ss
    else {
      this.toastr.success('Horas totales de trabajo son correctas.', 'Verificación exitosa.', {
        timeOut: 6000
      });
    }
  }

  // MENSAJE DE ERRORES EN CONFIGURACION DE DETALLE DE HORARIO
  EmitirMensajeErrorAlimentacion() {
    return this.toastr.warning(
      `Horas de entra, salida o alimentación no son correctas.`,
      'Revisar detalle de horario.')
  }

  // METODO PARA VERIFICAR HORAS INGRESADAS Y FORMATEAR LAS MISMAS
  ValidarHorario(nocturno: boolean, id: number, min_almuerzo: any) {
    // VALIDAR HORARIOS NOCTURNOS
    if (nocturno === true) {
      this.CalcularMetodoNocturno(id, min_almuerzo);
    } else {
      if (this.datosHorario[0].hora_trabajo >= '24:00') {
        this.toastr.warning('Horarios de horas superiores o iguales a 24:00 horas deben ser configurados como horarios nocturnos.',
          'Ups!!! algo salio mal.', {
          timeOut: 6000
        });
      }
      else {
        const detalleDiurno = this.datosDetalle.map(o => {
          if (o.orden === 4 && o.hora === '00:00:00') {
            o.hora = '24:00:00';
          }
          if (o.orden === 3 && o.hora === '00:00:00') {
            o.hora = '24:00:00';
          }
          return {
            orden: o.orden,
            segundo: o.segundo_dia,
            tercero: o.tercer_dia,
            hora: this.StringTimeToSegundosTime(o.hora)
          }
        })
        this.ActualizarHorasTrabajaSegunHorario(detalleDiurno, id, min_almuerzo)
      }
    }
  }

  // METODO PARA CALCULAR EL TIEMPO DE LAS HORAS
  CalcularMetodoNocturno(id: number, min_almuerzo: any) {
    const detalleNocturno = this.datosDetalle.map((o: any) => {
      if ((o.orden === 4 || o.orden === 3) && o.hora === '00:00:00') {
        o.hora = '24:00:00';
      }
      let tiempo = this.StringTimeToSegundosTime(o.hora);
      return {
        orden: o.orden,
        hora: tiempo,
        segundo: o.segundo_dia,
        tercero: o.tercer_dia,
      }
    })
    this.ActualizarHorasTrabajaSegunHorario(detalleNocturno, id, min_almuerzo);
  }

  // METODO PARA ACTUALIZAR HORAS TRABAJADAS DE ACUERDO AL HORARIO - NOCTURNO
  ActualizarHorasTrabajaSegunHorario(detalle: any[], id: number, min_almuerzo: number) {

    const median_noche = this.StringTimeToSegundosTime('24:00:00');

    var horasT = '';
    var horario = 0;
    var diferencia = 0;
    var alimentacion = 0;
    var entrada = 0;

    if (min_almuerzo === 0) {
      var [det_uno, det_cuatro] = detalle;

      if (det_cuatro.segundo === true) {
        if (det_uno.hora === 0) {
          entrada = det_uno.hora;
        }
        else {
          entrada = median_noche - det_uno.hora;
        }

        horario = (det_cuatro === undefined) ? 0 : det_cuatro.hora + entrada;
        horasT = this.SegundosToStringTime(horario);

      }
      else if (det_cuatro.tercero === true) {

        if (det_uno.hora === 0) {
          entrada = det_uno.hora;
        }
        else {
          entrada = median_noche - det_uno.hora;
        }

        if (this.datosHorario[0].hora_trabajo + ':00' === '48:00:00') {
          horario = (det_cuatro === undefined) ? 0 : det_cuatro.hora + entrada + median_noche;
        }
        else {
          horario = (det_cuatro === undefined) ? 0 : det_cuatro.hora + entrada + median_noche + median_noche;
        }
        horasT = this.SegundosToStringTime(horario);

      }
      else {
        horario = (det_cuatro === undefined) ? 0 : det_cuatro.hora - det_uno.hora;
        horasT = this.SegundosToStringTime(horario);
      }
    }
    else {
      var [det_uno, det_dos, det_tres, det_cuatro] = detalle;
      if (det_tres.segundo === true && det_dos.segundo === false) {
        var inicio = median_noche - det_dos.hora;
        alimentacion = (det_tres === undefined) ? 0 : det_tres.hora + inicio;
      }
      else if ((det_tres.segundo === true && det_dos.segundo === true) ||
        (det_tres.segundo === false && det_dos.segundo === false)) {
        alimentacion = (det_tres === undefined) ? 0 : det_tres.hora - det_dos.hora;
      }

      let minutos: number = Math.floor((alimentacion / 60));

      // VALIDAR MINUTOS DE ALIMENTACION
      if (minutos < min_almuerzo) return this.toastr.warning(
        `El detalle de inicio y fin de alimentación tiene registrado menos minutos de alimentación
                de lo establecido en el horario.`,
        'Por favor revisar detalle de alimentación.', {
        timeOut: 6000
      });

      if (det_cuatro.segundo === true) {
        entrada = median_noche - det_uno.hora;
        horario = (det_cuatro === undefined) ? 0 : det_cuatro.hora + entrada;
        diferencia = horario - Math.floor((min_almuerzo * 60));
        horasT = this.SegundosToStringTime(diferencia);
      }
      else if (det_cuatro.tercero === true) {
        horario = (det_cuatro === undefined) ? 0 : det_cuatro.hora + det_uno.hora;
        diferencia = horario - Math.floor((min_almuerzo * 60));
        horasT = this.SegundosToStringTime(diferencia);
      }
      else {
        horario = (det_cuatro === undefined) ? 0 : det_cuatro.hora - det_uno.hora;
        diferencia = horario - Math.floor((min_almuerzo * 60));
        horasT = this.SegundosToStringTime(diferencia);
      }
    }

    if (horasT < (this.datosHorario[0].hora_trabajo + ':00')) {
      this.toastr.warning(
        `Las horas totales de trabajo definidas en su detalle son menores a las horas de trabajo establecidas en el horario.
        ${horasT} < ${this.datosHorario[0].hora_trabajo}:00`,
        'Por favor revisar detalle de horario.', {
        timeOut: 6000
      });
    }

    else if (horasT > (this.datosHorario[0].hora_trabajo + ':00')) {
      this.toastr.warning(
        `Las horas totales de trabajo definidas en su detalle son mayores a las horas de trabajo establecidas en el horario.
        ${horasT} > ${this.datosHorario[0].hora_trabajo}:00`,
        'Por favor revisar detalle de horario.', {
        timeOut: 6000
      });
    }
    else {
      this.ActualizarHorario(id, horasT, true);
    }
  }

  // METODO PARA ESTABLECER TIEMPO SEGUNDOS
  StringTimeToSegundosTime(stringTime: string) {
    const h = parseInt(stringTime.split(':')[0]) * 3600;
    const m = parseInt(stringTime.split(':')[1]) * 60;
    const s = parseInt(stringTime.split(':')[2]);
    return h + m + s
  }

  // METODO PARA FORMATEAR HORA
  SegundosToStringTime(segundos: number) {
    let h: string | number = Math.floor(segundos / 3600);
    h = (h < 10) ? '0' + h : h;
    let m: string | number = Math.floor((segundos / 60) % 60);
    m = (m < 10) ? '0' + m : m;
    let s: string | number = segundos % 60;
    s = (s < 10) ? '0' + s : s;
    return h + ':' + m + ':' + s;
  }

  // METODO PARA ACTUALIZAR HORAS DE HORARIO
  ActualizarHorario(id: any, horasT: any, mensaje: boolean) {
    const datos = {
      hora_trabajo: horasT,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales
    }
    this.rest.ActualizarHorasTrabaja(id, datos).subscribe(res => {
      this.datosHorario = res;
      this.ColocarTipo();
      if (mensaje === true) {
        this.toastr.success('Horas totales de trabajo son correctas.', 'Verificación exitosa.', {
          timeOut: 6000
        });
        if (this.pagina === 'planificar') {
          this.componentep.ver_horario = false;
          this.componentep.seleccionar = true;
        }
      }
    }, err => {
      this.toastr.error(err.message)
    })
  }

  // METODO PARA VISUALIZAR LISTA DE HORARIOS
  VerHorarios() {
    if (this.pagina === 'planificar') {
      this.router.navigate(['/horario']);
    } else {
      this.componente.ver_horarios = true;
      this.componente.ver_detalles = false;
      this.componente.ObtenerHorarios();
    }

  }


  /** ************************************************************************************************* **
   ** **                          METODO DE SELECCION MULTIPLE DE DATOS                              ** **
   ** ************************************************************************************************* **/

  // METODOS PARA LA SELECCION MULTIPLE
  auto_individual: boolean = true;

  btnCheckHabilitar: boolean = false;
  selectionDetalles = new SelectionModel<any>(true, []);
  detallesEliminar: any = [];

  HabilitarSeleccion() {
    if (this.btnCheckHabilitar === false) {
      this.btnCheckHabilitar = true;
      this.auto_individual = false;
    }
    else if (this.btnCheckHabilitar === true) {
      this.btnCheckHabilitar = false;
      this.auto_individual = true;
      this.selectionDetalles.clear();
      this.detallesEliminar = [];
    }
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedPag() {
    const numSelected = this.selectionDetalles.selected.length;
    return numSelected === this.detalles.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterTogglePag() {
    this.isAllSelectedPag() ?
      this.selectionDetalles.clear() :
      this.detalles.forEach((row: any) => this.selectionDetalles.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelPag(row?: any): string {
    if (!row) {
      return `${this.isAllSelectedPag() ? 'select' : 'deselect'} all`;
    }
    this.detallesEliminar = this.selectionDetalles.selected;

    return `${this.selectionDetalles.isSelected(row) ? 'deselect' : 'select'} row ${row.descripcion + 1}`;
  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO
  EliminarDetalle(id_detalle: number) {
    const datos = {
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales
    }
    this.restD.EliminarRegistro(id_detalle, datos).subscribe((res: any) => {
      if (res.message === 'error') {
        this.toastr.error('Existen datos relacionados con este registro.', 'No fue posible eliminar.', {
          timeOut: 6000,
        });
      }
      else {
        this.toastr.error('Registro eliminado.', '', {
          timeOut: 6000,
        });
        let horasT = this.datosHorario[0].hora_trabajo.split(':')[0] + ':' + this.datosHorario[0].hora_trabajo.split(':')[1];
        this.ActualizarHorario(this.datosHorario[0].id, horasT, false);
        this.BuscarDatosHorario(this.idHorario);
        this.ListarDetalles(this.idHorario, this.formato_hora);
      }
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  ConfirmarDelete(datos: any, opcion: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          if (opcion === 1) {
            this.EliminarDetalle(datos.id);
          }
          else if (opcion === 2) {
            if (this.detallesEliminar.length != 0) {
              this.EliminarMultiple();
            } else {
              this.toastr.warning('No ha seleccionado DETALLES.', 'Ups!!! algo salio mal.', {
                timeOut: 6000,
              })
            }
          }
        }
      });
  }

  // METODO PARA ELIMINAR REGISTROS
  contador: number = 0;
  ingresar: number = 0;
  errores: number = 0;
  EliminarMultiple() {
    const data = {
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales
    };
    this.contador = 0;
    this.ingresar = 0;
    this.errores = 0;
    this.detallesEliminar.forEach((datos: any) => {
      this.contador = this.contador + 1;
      this.restD.EliminarRegistro(datos.id, data).subscribe((res: any) => {
        if (res.message === 'error') {
          this.errores = this.errores + 1;
        }
        else {
          this.detalles = this.detalles.filter((item: any) => item.id !== datos.id);
          this.ingresar = this.ingresar + 1;
        }

        if (this.contador === this.detallesEliminar.length) {
          if (this.errores != 0) {
            this.toastr.error('Existen datos relacionados con los registros.', 'No fue posible eliminar.', {
              timeOut: 6000,
            });
          }
          if (this.ingresar != 0) {
            this.toastr.error('Se ha eliminado ' + this.ingresar + ' registros.', '', {
              timeOut: 6000,
            });
            let horasT = this.datosHorario[0].hora_trabajo.split(':')[0] + ':' + this.datosHorario[0].hora_trabajo.split(':')[1];
            this.ActualizarHorario(this.datosHorario[0].id, horasT, false);
          }

          this.HabilitarSeleccion();
          this.BuscarDatosHorario(this.idHorario);
          this.ListarDetalles(this.idHorario, this.formato_hora);
        }

      });
    }
    )
  }

  //CONTROL BOTONES
  private tienePermiso(accion: string, idFuncion?: number): boolean {
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      try {
        const datos = JSON.parse(datosRecuperados);
        return datos.some((item: any) =>
          item.accion === accion && (idFuncion === undefined || item.id_funcion === idFuncion)
        );
      } catch {
        return false;
      }
    } else {
      return parseInt(localStorage.getItem('rol') || '0') === 1;
    }
  }

  getEditarHorario(){
    return this.tienePermiso('Editar Horario');
  }

  getCrearDetalleHorario(){
    return this.tienePermiso('Crear Detalle Horario');
  }

  getDescargarDocumentoHorario(){
    return this.tienePermiso('Descargar Documento Horario');
  }

  getVerEditarDetalleHorario(){
    return this.tienePermiso('Ver Horario - Editar Detalle Horario');
  }

  getVerEliminarDetalleHorario(){
    return this.tienePermiso('Ver Horario - Eliminar Detalle Horario');
  }

}
