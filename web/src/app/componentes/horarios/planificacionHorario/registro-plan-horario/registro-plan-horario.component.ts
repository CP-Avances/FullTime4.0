import { MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Component, OnInit, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDatepicker } from '@angular/material/datepicker';
import { FormControl } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { default as _rollupMoment, Moment } from 'moment';
import moment from 'moment';

import { DetalleCatHorariosService } from 'src/app/servicios/horarios/detalleCatHorarios/detalle-cat-horarios.service';
import { PlanHorarioService } from 'src/app/servicios/horarios/planHorario/plan-horario.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { FeriadosService } from 'src/app/servicios/catalogos/catFeriados/feriados.service';
import { HorarioService } from 'src/app/servicios/catalogos/catHorarios/horario.service';

import { VerEmpleadoComponent } from 'src/app/componentes/empleado/ver-empleado/ver-empleado.component';

@Component({
  selector: 'app-registro-plan-horario',
  templateUrl: './registro-plan-horario.component.html',
  styleUrls: ['./registro-plan-horario.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
  ]
})

export class RegistroPlanHorarioComponent implements OnInit {

  @Input() datoEmpleado: any

  // FECHAS DE BUSQUEDA
  fechaInicialF = new FormControl();
  fechaFinalF = new FormControl();
  horarioF = new FormControl();
  fecHorario: boolean = true;

  // VARIABLE DE ALMACENAMIENTO
  horarios: any = [];
  feriados: any = [];
  ver_horario: boolean = false;

  constructor(
    public componentev: VerEmpleadoComponent,
    public parametro: ParametrosService,
    public feriado: FeriadosService,
    public validar: ValidacionesService,
    public router: Router,
    public restE: EmpleadoService,
    public restD: DetalleCatHorariosService,
    public restH: HorarioService,
    public rest: PlanHorarioService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.BuscarHorarios();
    this.BuscarHora();
  }

  /** **************************************************************************************** **
 ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** ** 
 ** **************************************************************************************** **/
  formato_hora: string = 'HH:mm:ss';

  BuscarHora() {
    // id_tipo_parametro Formato hora = 26
    this.parametro.ListarDetalleParametros(26).subscribe(
      res => {
        this.formato_hora = res[0].descripcion;
      });
  }

  // VARIABLES DE ALMACENAMIENTO DE DATOS ESPECIFICOS DE UN HORARIO
  detalles_horarios: any = [];
  vista_horarios: any = [];
  hora_entrada: any;
  hora_salida: any;
  // METODO PARA MOSTRAR NOMBRE DE HORARIO CON DETALLE DE ENTRADA Y SALIDA
  BuscarHorarios() {
    this.horarios = [];
    this.vista_horarios = [];
    // BUSQUEDA DE HORARIOS
    this.restH.BuscarListaHorarios().subscribe(datos => {
      this.horarios = datos;
      this.horarios.map(hor => {
        // BUSQUEDA DE DETALLES DE ACUERDO AL ID DE HORARIO
        this.restD.ConsultarUnDetalleHorario(hor.id).subscribe(res => {
          this.detalles_horarios = res;
          this.detalles_horarios.map(det => {
            if (det.tipo_accion === 'E') {
              this.hora_entrada = det.hora.slice(0, 5)
            }
            if (det.tipo_accion === 'S') {
              this.hora_salida = det.hora.slice(0, 5)
            }
          })
          let datos_horario = [{
            id: hor.id,
            nombre: hor.codigo + ' (' + this.hora_entrada + '-' + this.hora_salida + ')',
            codigo: hor.codigo
          }]
          if (this.vista_horarios.length === 0) {
            this.vista_horarios = datos_horario;
          } else {
            this.vista_horarios = this.vista_horarios.concat(datos_horario);
          }
        }, error => {
          let datos_horario = [{
            id: hor.id,
            nombre: hor.codigo,
            codigo: hor.codigo
          }]
          if (this.vista_horarios.length === 0) {
            this.vista_horarios = datos_horario;
          } else {
            this.vista_horarios = this.vista_horarios.concat(datos_horario);
          }
        })
      })
    })
  }

  // METODO PARA BUSCAR FERIADOS
  BuscarFeriados(inicio: any, fin: any) {
    this.feriados = [];
    let datos = {
      fecha_inicio: inicio,
      fecha_final: fin,
      id_empleado: parseInt(this.datoEmpleado.idEmpleado)
    }
    this.feriado.ListarFeriadosCiudad(datos).subscribe(data => {
      this.feriados = data;
      this.BuscarFeriadosRecuperar(inicio, fin)
    }, error => {
      this.BuscarFeriadosRecuperar(inicio, fin)
    })
  }

  // METODO PARA BUSCAR FECHAS DE RECUPERACION DE FERIADOS
  recuperar: any = [];
  BuscarFeriadosRecuperar(inicio: any, fin: any) {
    this.recuperar = [];
    let datos = {
      fecha_inicio: inicio,
      fecha_final: fin,
      id_empleado: parseInt(this.datoEmpleado.idEmpleado)
    }
    this.feriado.ListarFeriadosRecuperarCiudad(datos).subscribe(data => {
      this.recuperar = data;
      this.ListarFechas(inicio, fin);
    }, error => {
      this.ListarFechas(inicio, fin);
    })
  }

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
  GenerarCalendario() {
    this.ver_horario = true;
    if (this.fechaInicialF.value != null && this.fechaFinalF.value != null) {
      this.BuscarFeriados(this.fechaInicialF.value, this.fechaFinalF.value);
    }
    else {
      let inicio = moment().format('YYYY/MM/01');
      let final = moment().format('YYYY/MM/') + moment().daysInMonth();
      this.BuscarFeriados(inicio, final);
    }
  }

  // METODO PARA OBTENER FECHAS, MES, DIA, AÑO
  fechas_mes: any = [];
  dia_inicio: any;
  dia_fin: any;
  ListarFechas(fecha_inicio: any, fecha_final: any) {
    this.fechas_mes = []; // ARRAY QUE CONTIENE TODAS LAS FECHAS DEL MES INDICADO 

    this.dia_inicio = moment(fecha_inicio, 'YYYY-MM-DD').format('YYYY-MM-DD');
    this.dia_fin = moment(fecha_final, 'YYYY-MM-DD').format('YYYY-MM-DD');

    // LOGICA PARA OBTENER EL NOMBRE DE CADA UNO DE LOS DIAS DEL PERIODO INDICADO
    while (this.dia_inicio <= this.dia_fin) {
      let fechas = {
        fecha: this.dia_inicio,
        dia: (moment(this.dia_inicio).format('dddd')).toUpperCase(),
        formato: (moment(this.dia_inicio).format('MMMM DD, YYYY')).toUpperCase(),
        mes: moment(this.dia_inicio).format('MMMM').toUpperCase(),
        anio: moment(this.dia_inicio).format('YYYY'),
        horarios: [],
        tipo_dia: '-',
        estado: false,
      }
      this.fechas_mes.push(fechas);
      var newDate = moment(this.dia_inicio).add(1, 'd').format('YYYY-MM-DD')
      this.dia_inicio = newDate;
    }

    // TRATAMIENTO DE FERIADOS
    this.fechas_mes.forEach(obj => {
      // BUSCAR FERIADOS 
      if (this.feriados.length != 0) {
        console.log('ingresa feriados ', this.feriados)
        for (let i = 0; i < this.feriados.length; i++) {
          console.log('fecha feriados ', moment(this.feriados[i].fecha, 'YYYY-MM-DD').format('YYYY-MM-DD'))
          console.log('obj ', obj)
          if (moment(this.feriados[i].fecha, 'YYYY-MM-DD').format('YYYY-MM-DD') === obj.fecha) {
            obj.tipo_dia = 'FD';
            obj.observacion = 'FERIADO*';
            obj.estado = true;
            break;
          }
        }
      }

      // BUSCAR FECHAS DE RECUPERACION DE FERIADOS
      if (this.recuperar.length != 0) {
        for (let j = 0; j < this.recuperar.length; j++) {
          if (moment(this.recuperar[j].fec_recuperacion, 'YYYY-MM-DD').format('YYYY-MM-DD') === obj.fecha) {
            obj.tipo_dia = 'N';
            obj.observacion = 'RECUPERACIÓN*';
            break;
          }
        }
      }
    })
  }

  // METODO PARA CAMBIAR DE COLORES SEGUN EL MES
  CambiarColores(mes: any) {
    let color: string;
    switch (mes) {
      case 'ENERO':
        return color = '#FFC7A3';
      case 'FEBRERO':
        return color = '#CAFFA9';
      case 'MARZO':
        return color = '#FEEEA9';
      case 'ABRIL':
        return color = '#AFDDE9';
      case 'MAYO':
        return color = '#F2B8FF';
      case 'JUNIO':
        return color = '#FFFF97';
      case 'JULIO':
        return color = '#FE9594';
      case 'AGOSTO':
        return color = '#CCAAFE';
      case 'SEPTIEMBRE':
        return color = '#80E7FF';
      case 'OCTUBRE':
        return color = '#FDD6F6';
      case 'NOVIEMBRE':
        return color = '#E9C6B0';
      case 'DICIEMBRE':
        return color = '#C9E9B0';
    }
  }

  // METODO PARA SELECCIONAR HORARIO
  valor: any;
  ver_icono: boolean = false;
  SeleccionarHorario() {
    this.ver_icono = true;
    this.valor = this.horarioF.value
  }

  // METODO PARA VALIDAR SELECCION DE HORARIO
  ValidarHorario() {
    const [obj_res] = this.horarios.filter(o => {
      return o.codigo === this.horarioF.value
    })
    if (!obj_res) return this.toastr.warning('Horario no válido.');

    const { hora_trabajo, id, codigo, min_almuerzo } = obj_res;

    // VERIFICACION DE FORMATO CORRECTO DE HORARIOS
    if (!this.StringTimeToSegundosTime(hora_trabajo)) {
      this.ver_icono = false;
      this.horarioF.setValue('');
      this.toastr.warning(
        'Formato de horas en horario seleccionado no son válidas.',
        'Dar click para verificar registro de detalle de horario.', {
        timeOut: 6000,
      }).onTap.subscribe(obj => {
        this.router.navigate(['/horario/']);
      });
    }
    else {
      this.SeleccionarHorario();
      this.ObtenerDetallesHorario(id, codigo, min_almuerzo);
    }
  }

  // METODO PARA SUMAR HORAS
  StringTimeToSegundosTime(stringTime: string) {
    const h = parseInt(stringTime.split(':')[0]) * 3600;
    const m = parseInt(stringTime.split(':')[1]) * 60;
    const s = parseInt(stringTime.split(':')[2]);
    return h + m + s
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


  // METODO PARA VER DETALLE DE HORARIO
  ver_acciones: boolean = false;
  detalle_acciones: any = [];
  detalles: any = [];
  // ACCIONES DE HORARIOS
  inicio_comida = '';
  fin_comida = '';
  entrada: '';
  salida: '';
  ObtenerDetallesHorario(id: number, codigo: any, min_almuerzo: any) {
    this.inicio_comida = '';
    this.fin_comida = '';
    this.entrada = '';
    this.salida = '';
    this.detalles = [];
    let tipos: any = [];
    this.detalle_acciones = [];
    // BUSQUEDA DE DETALLES DE PLANIFICACIONES
    this.restD.ConsultarUnDetalleHorario(id).subscribe(res => {

      this.ver_acciones = true;
      this.detalle_acciones = [];
      this.detalles = res;

      this.detalles.forEach(obj => {
        this.ValidarAcciones(obj);
      })

      // AL FINALIZAR EL CICLO CONCATENAR VALORES
      tipos = [{
        horario: codigo,
        entrada: this.entrada,
        inicio_comida: this.inicio_comida,
        fin_comida: this.fin_comida,
        salida: this.salida,
        almuerzo: min_almuerzo,
      }]

      this.detalle_acciones = this.detalle_acciones.concat(tipos);

      this.detalle_acciones.forEach(detalle => {
        detalle.entrada_ = this.validar.FormatearHora(detalle.entrada, this.formato_hora);
        if (detalle.inicio_comida != '') {
          detalle.inicio_comida = this.validar.FormatearHora(detalle.inicio_comida, this.formato_hora);
        }
        if (detalle.fin_comida != '') {
          detalle.fin_comida = this.validar.FormatearHora(detalle.fin_comida, this.formato_hora);
        }
        detalle.salida_ = this.validar.FormatearHora(detalle.salida, this.formato_hora);
      })
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

  // METODO PARA INGRESAR HORARIO
  IngresarHorario(index: number) {
    let verificador = 0;
    let data = [{
      horario: this.horarioF.value,
    }]

    if (this.fechas_mes[index].tipo_dia === 'L') {
      this.toastr.warning('Este día esta configurado como libre.', 'Ups!!! VERIFICAR.', {
        timeOut: 6000,
      });
    }
    else {
      for (let i = 0; i < this.fechas_mes[index].horarios.length; i++) {
        if (this.fechas_mes[index].horarios[i].horario === this.horarioF.value) {
          verificador = 1;
          break
        }
      }

      if (verificador === 0) {
        this.fechas_mes[index].estado = true;
        this.fechas_mes[index].tipo_dia = 'N';
        this.fechas_mes[index].horarios = this.fechas_mes[index].horarios.concat(data);
      }
      else {
        this.toastr.warning('Horario ya se encuentra registrado.', 'Ups!!! VERIFICAR.', {
          timeOut: 6000,
        });
      }
    }

    console.log('ver fechas final', this.fechas_mes)
  }

  // METODO PARA INGRESAR HORARIO
  IngresarLibre(index: number) {
    let verificador = 0;
    let data = [{
      horario: this.horarioF.value,
    }]

    if (this.fechas_mes[index].horarios.length === 0) {
      for (let i = 0; i < this.fechas_mes[index].horarios.length; i++) {
        if (this.fechas_mes[index].horarios[i].tipo_dia === 'L') {
          verificador = 1;
          break
        }
      }

      if (verificador === 0) {
        this.fechas_mes[index].estado = true;
        this.fechas_mes[index].tipo_dia = 'L';
        this.fechas_mes[index].horarios = this.fechas_mes[index].horarios.concat(data);
      }
      else {
        this.toastr.warning('Día libre ya se encuentra registrado.', 'Ups!!! VERIFICAR.', {
          timeOut: 6000,
        });
      }
    }
    else {
      this.toastr.info('Este día ya tiene configurado horarios. No puede ser libre.', 'Ups!!! VERIFICAR.', {
        timeOut: 6000,
      });
    }



    console.log('ver fechas final', this.fechas_mes)
  }

  // METODO PARA ELIMINAR HORARIOS
  EliminarHorario(index: number) {
    for (let i = 0; i < this.fechas_mes[index].horarios.length; i++) {

      if (this.fechas_mes[index].horarios[i].horario === this.horarioF.value) {
        this.fechas_mes[index].horarios.splice(i, 1);
        break
      }
    }
    if (this.fechas_mes[index].horarios.length === 0) {
      this.fechas_mes[index].tipo_dia = '-';
      this.fechas_mes[index].estado = false;
    }
    console.log('ver fechas final', this.fechas_mes)
  }

  // METODO PARA ELIMINAR HORARIOS
  EliminarLibre(index: number) {
    for (let i = 0; i < this.fechas_mes[index].horarios.length; i++) {
      if (this.fechas_mes[index].tipo_dia === 'L') {
        this.fechas_mes[index].tipo_dia = '-';
        this.fechas_mes[index].estado = false;
        this.fechas_mes[index].horarios.splice(i, 1);
        break
      }
    }
    console.log('ver fechas final', this.fechas_mes)
  }

  // METODO PARA VALIDAR DATOS SELECCIONADOS
  data_horarios: any = [];
  VerificarHorario() {
    let verificador = 0;
    this.data_horarios = [];
    this.fechas_mes.forEach(obj => {
      if (obj.estado === true) {
        this.data_horarios = this.data_horarios.concat(obj);
      }

      if (obj.estado === true && obj.tipo_dia === 'N') {
        verificador = verificador + 1;
      }
    })

    if (verificador > 0) {
      console.log('ingresa ver datos seleccionados ', this.data_horarios)
    }
    else {
      this.toastr.warning('No ha registrado horarios.', 'Ups!!! VERIFICAR.', {
        timeOut: 6000,
      });
    }

    console.log('ver datos seleccionados ', this.data_horarios)
  }

  // METODO PARA CERRAR VENTANA
  CerrarVentana() {
    if (this.datoEmpleado.pagina === 'ver-empleado') {
      this.componentev.ver_rotativo = true;
      this.componentev.registrar_rotativo = false;
    }
  }

}


