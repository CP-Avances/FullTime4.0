import { Component, OnInit, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDatepicker } from '@angular/material/datepicker';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';

import { DetalleCatHorariosService } from 'src/app/servicios/horarios/detalleCatHorarios/detalle-cat-horarios.service';
import { EmpleadoHorariosService } from 'src/app/servicios/horarios/empleadoHorarios/empleado-horarios.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { PlanGeneralService } from 'src/app/servicios/horarios/planGeneral/plan-general.service';
import { ParametrosService } from 'src/app/servicios/configuracion/parametrizacion/parametrosGenerales/parametros.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { FeriadosService } from 'src/app/servicios/horarios/catFeriados/feriados.service';
import { HorarioService } from 'src/app/servicios/horarios/catHorarios/horario.service';
import { TimbresService } from 'src/app/servicios/timbres/timbrar/timbres.service';

import { HorarioMultipleEmpleadoComponent } from '../../rango-fechas/horario-multiple-empleado/horario-multiple-empleado.component';
import { BuscarPlanificacionComponent } from '../../rango-fechas/buscar-planificacion/buscar-planificacion.component';
import { VerEmpleadoComponent } from 'src/app/componentes/usuarios/empleados/datos-empleado/ver-empleado/ver-empleado.component';

@Component({
  selector: 'app-registro-plan-horario',
  standalone: false,
  templateUrl: './registro-plan-horario.component.html',
  styleUrls: ['./registro-plan-horario.component.css'],
})

export class RegistroPlanHorarioComponent implements OnInit {
  
  ips_locales: any = '';

  @Input() datoEmpleado: any;
  // FECHAS DE BUSQUEDA
  fechaInicialF = new FormControl();
  fechaFinalF = new FormControl();
  horarioF = new FormControl();
  fecHorario: boolean = true;

  // VARIABLE DE ALMACENAMIENTO
  horarios: any = [];
  feriados: any = [];
  ver_horario: boolean = false;
  ver_horario_: boolean = false;
  ver_guardar: boolean = false;

  expansion: boolean = false;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    public componentev: VerEmpleadoComponent,
    public componentem: HorarioMultipleEmpleadoComponent,
    public componenteb: BuscarPlanificacionComponent,
    public parametro: ParametrosService,
    public feriado: FeriadosService,
    public validar: ValidacionesService,
    public horario: EmpleadoHorariosService,
    public timbrar: TimbresService,
    public router: Router,
    public restE: EmpleadoService,
    public restD: DetalleCatHorariosService,
    public restH: HorarioService,
    public restP: PlanGeneralService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');  
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    }); 

    this.BuscarHorarios();
    this.BuscarHora();
  }

  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** **
   ** **************************************************************************************** **/
  formato_hora: string = 'HH:mm:ss';
  idioma_fecha: string = 'es';
  BuscarHora() {
    // id_tipo_parametro Formato hora = 2
    this.parametro.ListarDetalleParametros(2).subscribe(
      res => {
        this.formato_hora = res[0].descripcion;
      });
  }

  // VARIABLES DE ALMACENAMIENTO DE DATOS ESPECIFICOS DE UN HORARIO
  detalles_horarios: any = [];
  vista_horarios: any = [];
  vista_descanso: any = [];
  lista_descanso: any = [];
  hora_entrada: any;
  hora_salida: any;
  segundo_dia: any;
  tercer_dia: any;
  // METODO PARA MOSTRAR NOMBRE DE HORARIO CON DETALLE DE ENTRADA Y SALIDA
  BuscarHorarios() {
    this.horarios = [];
    this.vista_horarios = [];
    this.vista_descanso = [];
    this.lista_descanso = [];
    // BUSQUEDA DE HORARIOS
    this.restH.BuscarListaHorarios().subscribe(datos => {
      this.horarios = datos;
      this.horarios.map((hor: any) => {
        // BUSQUEDA DE DETALLES DE ACUERDO AL ID DE HORARIO
        this.restD.ConsultarUnDetalleHorario(hor.id).subscribe(res => {
          this.detalles_horarios = res;
          this.detalles_horarios.map((det: any) => {
            if (det.tipo_accion === 'E') {
              this.hora_entrada = det.hora.slice(0, 5);
            }
            if (det.tipo_accion === 'S') {
              this.hora_salida = det.hora.slice(0, 5);
              this.segundo_dia = det.segundo_dia;
              this.tercer_dia = det.tercer_dia;
            }
          })
          let datos_horario = [{
            id: hor.id,
            nombre: hor.codigo + ' (' + this.hora_entrada + '-' + this.hora_salida + ')',
            codigo: hor.codigo,
            entrada: this.hora_entrada,
            salida: this.hora_salida,
            segundo_dia: this.segundo_dia,
            tercer_dia: this.tercer_dia,
          }]
          hor.detalles = datos_horario[0];
          if (hor.default_ === 'DL' || hor.default_ === 'DFD') {
            this.vista_descanso = this.vista_descanso.concat(datos_horario);
            let descanso = {
              tipo: hor.default_,
              id_horario: hor.id,
              detalle: this.detalles_horarios
            }
            this.lista_descanso = this.lista_descanso.concat(descanso);
          }
          else {
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
  FormatearFecha(fecha: DateTime, datepicker: MatDatepicker<DateTime>, opcion: number) {
    this.ControlarBotones(true, false);
    const ctrlValue = fecha;
    if (opcion === 1) {
      if (this.fechaFinalF.value) {
        this.ValidarFechas(ctrlValue, this.fechaFinalF.value, this.fechaInicialF, opcion);
      }
      else {
        let inicio = ctrlValue.set({ day: 1 }).toFormat('dd/MM/yyyy');
        this.fechaInicialF.setValue(DateTime.fromFormat(inicio, 'dd/MM/yyyy').toJSDate());
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
    console.log("ver fec_inicio", fec_inicio)
    console.log("ver fec_fin", fec_fin)
    console.log("ver formulario", formulario)

    let inicio = DateTime.fromJSDate(fec_inicio).set({ day: 1 }).toFormat('dd/MM/yyyy');
    const lastDayOfMonth = fec_fin.endOf('month').day;
    const formattedDate = `${lastDayOfMonth}/${fec_fin.toFormat('MM/yyyy')}`;
    let final = formattedDate;
    let feci = DateTime.fromFormat(inicio, 'dd/MM/yyyy').toFormat('yyyy/MM/dd')
    let fecf = DateTime.fromFormat(final, 'dd/MM/yyyy').toFormat('yyyy/MM/dd')
    console.log("ver feci", feci)
    console.log("ver fecf", fecf)

    // VERIFICAR SI LAS FECHAS ESTAN INGRESADAS DE FORMA CORRECTA
    if (Date.parse(feci) <= Date.parse(fecf)) {
      let datosBusqueda = {
        id_empleado: parseInt(this.datoEmpleado.idEmpleado)
      }
      // METODO PARA BUSCAR FECHA DE CONTRATO REGISTRADO EN FICHA DE EMPLEADO
      this.restE.BuscarFechaContrato(datosBusqueda).subscribe(response => {
        // VERIFICAR SI LAS FECHAS SON VALIDAS DE ACUERDO A LOS REGISTROS Y FECHAS INGRESADAS (CONTRATO)
        if ((Date.parse(response[0].fecha_ingreso.split('T')[0]) <= Date.parse(feci)) &&
          (Date.parse(response[0].fecha_salida.split('T')[0]) >= Date.parse(fecf))) {
          // REGISTRO DE LA FECHA EN EL FORMULARIO
          if (opcion === 1) {
            formulario.setValue(DateTime.fromFormat(inicio, 'dd/MM/yyyy').toJSDate());
          }
          else {
            formulario.setValue(DateTime.fromFormat(final, 'dd/MM/yyyy').toJSDate());
          }
        }
        else {
          this.toastr.warning('Las fechas ingresadas no estan dentro del contrato vigente del empleado.', 'Ups! algo salio mal.', {
            timeOut: 6000,
          });
        }
      });
    }
    else {
      // METODO PARA VERIFICAR SI EL EMPLEADO INGRESO CORRECTAMENTE LAS FECHAS
      this.toastr.warning('La fecha no se registro. Ups! la fecha no es correcta.', 'VERIFICAR', {
        timeOut: 6000,
      });
    }
  }

  // METODO PARA SELECCIONAR TIPO DE BUSQUEDA
  GenerarCalendario() {
    this.ver_horario = true;
    this.cargar = false;
    this.ControlarBotones(true, false);

    if (this.fechaInicialF.value != null && this.fechaFinalF.value != null) {
      console.log('fecha 1 ', this.fechaInicialF.value)
      console.log('fecha 2 ', this.fechaFinalF.value)
      let inicio = DateTime.fromJSDate(new Date(this.fechaInicialF.value)).toFormat('yyyy-MM-dd');
      let final = DateTime.fromJSDate(new Date(this.fechaFinalF.value)).toFormat('yyyy-MM-dd');
      console.log('fecha 1 ', inicio)
      console.log('fecha 2 ', final)
      this.BuscarFeriados(inicio, final);
    }
    else {
      const now = DateTime.now();
      // Formatear la fecha de inicio como '01/MM/YYYY'
      let inicio = now.set({ day: 1 }).toFormat('yyyy-MM-dd');
      let final = now.endOf('month').toFormat('yyyy-MM-dd');
      console.log('fecha 1 ', inicio)
      console.log('fecha 2 ', final)
      this.BuscarFeriados(inicio, final);
    }
  }

  // METODO PARA OBTENER FECHAS, MES, DIA, AÑO
  fechas_mes: any = [];
  hora_feriado: boolean = false;
  ListarFechas(fecha_inicio: any, fecha_final: any) {
    //console.log('dia i... ', fecha_inicio, ' dia f... ', fecha_final)
    this.fechas_mes = []; // ARRAY QUE CONTIENE TODAS LAS FECHAS DEL MES INDICADO
    // Convertimos las fechas de inicio y fin a DateTime de Luxon
    let dia_inicio = DateTime.fromISO(fecha_inicio).setLocale(this.idioma_fecha);
    let dia_fin = DateTime.fromISO(fecha_final).setLocale(this.idioma_fecha);
    //console.log('dia i ', dia_inicio, ' dia f ', dia_fin)
    // LOGICA PARA OBTENER EL NOMBRE DE CADA UNO DE LOS DIAS DEL PERIODO INDICADO
    while (dia_inicio <= dia_fin) {
      let fechas = {
        fecha: dia_inicio.toFormat('yyyy-MM-dd'),
        dia: dia_inicio.toFormat('EEEE').toUpperCase(), // Nombre del día completo
        num_dia: dia_inicio.weekday, // Día de la semana (1-7, donde 1 es lunes)
        formato: dia_inicio.toFormat('MMMM, EEE. dd, yyyy').toUpperCase(), // Formato largo de la fecha
        formato_: dia_inicio.toFormat('MMM. EEE. dd, yyyy').toUpperCase(), // Formato corto de la fecha
        mes: dia_inicio.toFormat('MMMM').toUpperCase(), // Mes en texto completo
        anio: dia_inicio.toFormat('yyyy'), // Año
        horarios: [],
        registrados: [],
        tipo_dia: '-',
        tipo_dia_origen: '-',
        estado: false,
        observacion: '',
        horarios_existentes: '',
        supera_jornada: '',
        horas_superadas: '',
      }
      this.fechas_mes.push(fechas);
      dia_inicio = dia_inicio.plus({ days: 1 });
    }
    console.log(" fechas_mes : ", this.fechas_mes)
    console.log(" feriados : ", this.feriados)

    // TRATAMIENTO DE FERIADOS
    this.fechas_mes.forEach((obj: any) => {
      // BUSCAR FERIADOS
      if (this.feriados.length != 0) {
        for (let i = 0; i < this.feriados.length; i++) {
          console.log("ver fecha en el if formateada: ", DateTime.fromISO(this.feriados[i].fecha).toFormat('yyyy-MM-dd'))
          if (DateTime.fromISO(this.feriados[i].fecha).toFormat('yyyy-MM-dd') === obj.fecha) {
            obj.tipo_dia = 'FD';
            obj.estado = true;
            obj.observacion = 'FERIADO*';
            obj.tipo_dia_origen = 'DFD';
            this.hora_feriado = true;
            const [datoHorario] = this.horarios.filter((o: any) => {
              return o.default_ === 'DFD';
            })
            let data = [{
              horario: datoHorario.codigo,
              detalles: datoHorario.detalles,
              id_horario: datoHorario.id,
              hora_trabajo: datoHorario.hora_trabajo,
              verificar: '',
            }]
            obj.horarios = data;
            break;
          }
        }
      }
      // BUSCAR FECHAS DE RECUPERACION DE FERIADOS
      if (this.recuperar.length != 0) {
        for (let j = 0; j < this.recuperar.length; j++) {
          if (DateTime.fromISO(this.recuperar[j].fecha_recuperacion).toFormat('yyyy-MM-dd') === obj.fecha
            === obj.fecha) {
            obj.tipo_dia = 'N';
            obj.observacion = 'RECUPERACIÓN*';
            break;
          }
        }
      }
      // METODO DE BUSQUEDA DE PLANIFICACIONES EXISTENTES
      let fechas = {
        fechaInicio: obj.fecha,
        fechaFinal: obj.fecha,
      };
      this.horario.VerificarHorariosExistentes(this.datoEmpleado.idEmpleado, fechas).subscribe(existe => {
        obj.horarios_existentes = '***';
        obj.registrados = existe;
        if (existe.length === 1) {
          if (existe[0].default_ === 'DL') {
            obj.estado = false;
          }
        }
      }, error => {
        obj.horarios_existentes = '';
      });
    })
  }

  // METODO PARA CAMBIAR DE COLORES SEGUN EL MES
  CambiarColores(opcion: any) {
    let color: string;
    switch (opcion) {
      case 'OK':
        return color = '#115703';
      case 'Horario ya existe.':
        return color = '#DC341A';
      case '1':
        return color = '#FFFFFF';
      case 6:
        return color = '#F6DDCC';
      case 7:
        return color = '#F6DDCC';
    }
  }

  // METODO PARA SUBRAYAR TEXTO
  EstiloSubrayado(opcion: any) {
    let color: string;
    switch (opcion) {
      case 'OK':
        return color = 'none';
      case 'Horario ya existe.':
        return color = 'line-through red';
    }
  }

  // METODO PARA SELECCIONAR HORARIO
  valor: any;
  ver_icono: boolean = false;
  SeleccionarHorario() {
    this.ver_icono = true;
    this.valor = this.horarioF.value;
  }

  // METODO PARA VALIDAR SELECCION DE HORARIO
  ValidarHorario() {
    const [obj_res] = this.horarios.filter((o: any) => {
      return o.codigo === this.horarioF.value
    })
    if (!obj_res) return this.toastr.warning('Horario no válido.');
    const { hora_trabajo, id, codigo, minutos_comida } = obj_res;
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
      this.ObtenerDetallesHorario(id, codigo, minutos_comida);
    }
  }

  // METODO PARA SUMAR HORAS
  StringTimeToSegundosTime(stringTime: string) {
    const h = parseInt(stringTime.split(':')[0]) * 3600;
    const m = parseInt(stringTime.split(':')[1]) * 60;
    const s = parseInt(stringTime.split(':')[2]);
    return h + m + s
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
      this.detalles.forEach((obj: any) => {
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
  lista_eliminar: any = [];
  IngresarHorario(index: number) {
    let verificador = 0;
    let procesar = 0;
    this.ControlarBotones(true, false);
    const [datoHorario] = this.horarios.filter((o: any) => {
      return o.codigo === this.horarioF.value
    })
    let data = {
      horario: this.horarioF.value,
      detalles: datoHorario.detalles,
      id_horario: datoHorario.id,
      hora_trabajo: datoHorario.hora_trabajo,
    }
    // SI EL DIA ES FERIADO, INGRESAR HORARIOS TIPO LIBRES O FERIADOS
    if (this.fechas_mes[index].tipo_dia_origen === 'DFD') {
      if (datoHorario.default_ === 'FD' || datoHorario.default_ === 'L') {
        procesar = 0
      }
      else {
        procesar = 1;
      }
    }
    // PROCESAMIENTO DE LOS DATOS AL CUMPLIR LAS CONDICIONES
    if (procesar === 0) {
      // EXISTEN HORARIOS REGISTRADOS
      if (this.fechas_mes[index].registrados.length === 1) {
        if (this.fechas_mes[index].registrados[0].default_ === 'DL' || this.fechas_mes[index].registrados[0].default_ === 'DFD') {
          let eliminar = {
            fecha: this.fechas_mes[index].fecha,
            id_horarios: this.fechas_mes[index].registrados[0].id_horario,
          }
          this.lista_eliminar = this.lista_eliminar.concat(eliminar);
          this.fechas_mes[index].registrados = [];
        }
      }

      // DIA REGISTRADO COMO LIBRE
      if (this.fechas_mes[index].tipo_dia_origen === 'DL') {
        this.EliminarLibre(index)
      }
      // LECTURA DE HORARIOS ASIGNADOS
      for (let i = 0; i < this.fechas_mes[index].horarios.length; i++) {
        if (this.fechas_mes[index].horarios[i].horario != 'DEFAULT-FERIADO') {
          if (this.fechas_mes[index].horarios[i].horario === this.horarioF.value) {
            verificador = 1;
            break
          }
          else {
            if (this.fechas_mes[index].horarios[i].detalles.segundo_dia === false && data.detalles.segundo_dia === false) {
              if (this.fechas_mes[index].horarios[i].detalles.salida < data.detalles.entrada) {
                verificador = 0;
              }
              else if (this.fechas_mes[index].horarios[i].detalles.entrada > data.detalles.salida) {
                verificador = 0
              }
              else {
                verificador = 2;
                break;
              }
            }
            else if (this.fechas_mes[index].horarios[i].detalles.segundo_dia === true && data.detalles.segundo_dia === true) {
              verificador = 2;
              break;
            }
            else if (this.fechas_mes[index].horarios[i].detalles.segundo_dia === false && data.detalles.segundo_dia === true) {
              if (this.fechas_mes[index].horarios[i].detalles.entrada > data.detalles.salida
                && this.fechas_mes[index].horarios[i].detalles.salida > data.detalles.salida
                && this.fechas_mes[index].horarios[i].detalles.salida < data.detalles.entrada) {
                verificador = 0;
              }
              else {
                verificador = 2;
                break;
              }
            }
            else if (this.fechas_mes[index].horarios[i].detalles.segundo_dia === true && data.detalles.segundo_dia === false) {
              if (this.fechas_mes[index].horarios[i].detalles.salida < data.detalles.entrada
                && this.fechas_mes[index].horarios[i].detalles.salida < data.detalles.salida
                && this.fechas_mes[index].horarios[i].detalles.entrada > data.detalles.salida) {
                verificador = 0;
              }
              else {
                verificador = 2;
                break;
              }
            }
          }
        }
        else {
          verificador = 0;
          this.fechas_mes[index].horarios.splice(i, 1);
        }
      }
      if (verificador === 0) {
        this.fechas_mes[index].estado = true;
        this.fechas_mes[index].tipo_dia = datoHorario.default_;
        this.fechas_mes[index].tipo_dia_origen = datoHorario.default_;
        this.fechas_mes[index].horarios = this.fechas_mes[index].horarios.concat(data);
      }
      else if (verificador === 1) {
        this.toastr.warning('Horario ya se encuentra registrado.', 'Ups! VERIFICAR.', {
          timeOut: 6000,
        });
      }
      else if (verificador === 2) {
        this.toastr.warning('No es posible registrar horarios con rangos de tiempo similares.', 'Ups! VERIFICAR.', {
          timeOut: 6000,
        });
      }
    }
    else {
      this.toastr.warning('Día configurado como FERIADO dentro del sistema.', 'Ups! VERIFICAR.', {
        timeOut: 6000,
      });
    }
  }

  // METODO PARA INGRESAR HORARIO
  IngresarLibre(index: number) {
    this.cargar = false;
    let verificador = 0;
    this.ControlarBotones(true, false);
    const [datoHorario] = this.horarios.filter((o: any) => {
      return o.default_ === 'DL';
    })
    let data = [{
      horario: datoHorario.codigo,
      detalles: datoHorario.detalles,
      id_horario: datoHorario.id,
      hora_trabajo: datoHorario.hora_trabajo,
      verificar: '',
    }]
    if (this.fechas_mes[index].registrados.length === 1) {
      if (this.fechas_mes[index].registrados[0].default_ === 'DL') {
        this.toastr.info('Ya se encuentra registrado como día de descanso.', 'Ups! VERIFICAR.', {
          timeOut: 6000,
        });
      }
      else {
        this.toastr.warning('Ya se encuentra registrada una planificación horaria.', 'Ups! VERIFICAR.', {
          timeOut: 6000,
        });
      }
    }
    else if (this.fechas_mes[index].registrados.length > 1) {
      this.toastr.warning('Ya se encuentra registrada una planificación horaria.', 'Ups! VERIFICAR.', {
        timeOut: 6000,
      });
    }
    else {
      verificador = 1;
    }
    if (verificador === 1) {
      if (this.fechas_mes[index].tipo_dia_origen === 'DL') {
        this.EliminarLibre(index)
      }
      else {
        this.fechas_mes[index].horarios = [];
        this.fechas_mes[index].horarios_existentes = '';
        this.fechas_mes[index].estado = true;
        this.fechas_mes[index].tipo_dia = 'L';
        this.fechas_mes[index].tipo_dia_origen = 'DL';
        this.fechas_mes[index].horarios = this.fechas_mes[index].horarios.concat(data);
      }
    }
  }

  // METODO PARA ELIMINAR HORARIOS
  EliminarHorario(index: number) {
    this.ControlarBotones(true, false);
    for (let i = 0; i < this.fechas_mes[index].horarios.length; i++) {
      if (this.fechas_mes[index].horarios[i].horario === this.horarioF.value) {
        this.fechas_mes[index].horarios.splice(i, 1);
        break
      }
    }
    if (this.fechas_mes[index].horarios.length === 0) {
      this.fechas_mes[index].tipo_dia = '-';
      this.fechas_mes[index].estado = false;
      this.fechas_mes[index].horas_validas = '';
    }
    this.fechas_mes[index].horas_superadas = '';
    this.fechas_mes[index].supera_jornada = '';
  }

  // METODO PARA ELIMINAR HORARIOS LIBRES
  EliminarLibre(index: number) {
    this.ControlarBotones(true, false);
    for (let i = 0; i < this.fechas_mes[index].horarios.length; i++) {
      if (this.fechas_mes[index].tipo_dia_origen === 'DL') {
        this.fechas_mes[index].tipo_dia = '-';
        this.fechas_mes[index].tipo_dia_origen = '-';
        this.fechas_mes[index].estado = false;
        this.fechas_mes[index].horarios.splice(i, 1);
        break
      }
    }
  }

  // METODO PARA VALIDAR DATOS SELECCIONADOS
  data_horarios: any = [];
  VerificarHorario(opcion: number) {
    let verificador = 0;
    this.data_horarios = [];
    this.fechas_mes.forEach((obj: any) => {
      if (obj.estado === true) {
        verificador = verificador + 1;
        this.data_horarios = this.data_horarios.concat(obj);
      }
    })
    if (verificador > 0) {
      console.log('ingresa ver datos seleccionados ', this.data_horarios)
      this.VerificarDuplicidad(opcion);
    }
    else {
      this.toastr.warning('No ha registrado horarios.', 'Ups! VERIFICAR.', {
        timeOut: 6000,
      });
    }
  }

  // METODO PARA VERIFICAR DUPLICIDAD DE REGISTROS
  iterar: number = 0;
  leer_horario: number = 0;
  contar_duplicado: number = 0;
  sin_duplicidad: any = [];
  VerificarDuplicidad(opcion: number) {
    this.sin_duplicidad = [];
    let total = 0;
    this.data_horarios.forEach((obj: any) => {
      total = total + obj.horarios.length
    })
    this.contar_duplicado = 0;
    this.leer_horario = 0;
    this.iterar = 0;
    this.data_horarios.forEach((obj: any) => {
      this.iterar = this.iterar + 1;
      obj.horarios.forEach((h: any) => {
        const [horario] = this.horarios.filter((o: any) => {
          return o.codigo === h.horario
        })
        let fechas = {
          fechaInicio: obj.fecha,
          fechaFinal: obj.fecha,
          id_horario: horario.id
        };
        h.verificar = 'OK';
        obj.supera_jornada = '';
        obj.horas_superadas = '';
        this.horario.VerificarDuplicidadHorarios(this.datoEmpleado.idEmpleado, fechas).subscribe(existe => {
          this.leer_horario = this.leer_horario + 1;
          this.contar_duplicado = 1;
          h.verificar = 'Horario ya existe.';
          if (this.iterar === this.data_horarios.length) {
            if (this.leer_horario === total) {
              this.ValidarHorarioByHorasTrabaja(opcion)
            }
          }
        }, error => {
          this.leer_horario = this.leer_horario + 1;
          if (this.iterar === this.data_horarios.length) {
            if (this.leer_horario === total) {
              this.ValidarHorarioByHorasTrabaja(opcion)
            }
          }
        });
      })
    })
    this.data_horarios.forEach((obj: any) => {
      this.fechas_mes.forEach((fec: any) => {
        if (obj.fecha === fec.fecha) {
          fec.horarios = obj.horarios;
        }
      })
    })
  }

  // METODO PARA VALIDAR HORAS DE TRABAJO SEGUN ULTIMO CARGO
  sumHoras: any;
  suma = '00:00:00';
  horariosEmpleado: any = [];
  iterar2: number = 0;
  leer_horario2: number = 0;
  ValidarHorarioByHorasTrabaja(opcion: number) {
    const trabajo = this.datoEmpleado.horas_trabaja;
    let suma1 = '00:00:00';
    let suma2 = '00:00:00';
    this.iterar2 = 0;
    this.leer_horario2 = 0;
    let horario1: number = 0;
    let horario2: number = 0;
    let iterar3 = 0;
    let iterar4 = 0;
    // LEER HORAS DE HORARIOS SELECCIONADOS
    this.data_horarios.forEach((obj: any) => {
      this.iterar2 = this.iterar2 + 1;
      obj.horas_seleccionadas = suma1;
      obj.horas_registradas = suma2;
      obj.horarios.forEach((valor: any) => {
        horario1 = horario1 + 1;
        // SUMA DE HORAS DE CADA UNO DE LOS HORARIOS SELECCIONADOS
        suma1 = this.SumarHoras(suma1, valor.hora_trabajo);
        if (obj.horarios.length === horario1) {
          obj.horas_seleccionadas = suma1;
          horario1 = 0;
          suma1 = '00:00:00';
        }
      })
    })

    // LEER HORAS DE HORARIOS REGISTRADOS O EXISTENTES
    if (this.iterar2 === this.data_horarios.length) {
      this.data_horarios.forEach((obj: any) => {
        iterar3 = iterar3 + 1;
        obj.registrados.map((h: any) => {
          horario2 = horario2 + 1;
          // SUMA DE HORAS DE CADA UNO DE LOS HORARIOS DEL EMPLEADO
          if (h.default_ != 'DL' && h.default_ != 'DFD') {
            suma2 = this.SumarHoras(suma2, h.hora_trabajo);
          }
          if (horario2 === obj.registrados.length) {
            obj.horas_registradas = suma2;
            horario2 = 0;
            suma2 = '00:00:00';
          }
        })
      })
    }

    if (iterar3 === this.data_horarios.length) {
      this.data_horarios.forEach((obj: any) => {
        this.leer_horario2 = this.leer_horario2 + 1;
        if (obj.tipo_dia_origen != 'DL' && obj.tipo_dia_origen != 'DFD') {
          let suma3 = this.SumarHoras(obj.horas_seleccionadas, obj.horas_registradas);
          if (this.StringTimeToSegundosTime(suma3) <= this.StringTimeToSegundosTime(trabajo)) {
            obj.horas_validas = 'OK';
          }
          else {
            obj.horas_validas = 'OK';
            obj.supera_jornada = 'OK';
            obj.horas_superadas = 'Jornada superada: ' + suma3;
          }
        }
      })
    }
    if (this.leer_horario2 === this.data_horarios.length) {
      this.data_horarios.forEach((obj: any) => {
        iterar4 = iterar4 + 1;
        this.VerificarHorarioRangos(obj.registrados, obj.horarios, obj.tipo_dia, obj);
      })
    }
    if (iterar4 === this.data_horarios.length) {
      this.LeerDatosValidos(opcion);
    }
  }

  // METODO PARA LEER DATOS VALIDOS
  LeerDatosValidos(opcion: number) {
    let datos: any = [];
    this.data_horarios.forEach((valor: any) => {
      if (valor.horas_validas === 'OK') {
        datos = datos.concat(valor);
      }
    })
    if (datos.length === 0) {
      this.toastr.warning('', 'Ups! verificar calendario.', {
        timeOut: 6000,
      });
      this.ControlarBotones(true, false);
    }
    else {
      this.CrearPlanGeneral(datos, opcion);
    }
  }

  // METODO PARA CREAR LISTA DE PLANIFICACION
  plan_general: any = [];
  CrearPlanGeneral(seleccionados: any, opcion: number) {
    this.plan_general = [];
    var origen: string = '';
    if (opcion === 2) {
      if (this.lista_eliminar.length != 0) {
        // ELIMINACION HORARIOS LIBRES - FERIADOS
        this.EliminarPlanificacion(seleccionados, origen, opcion);
      }
      else {
        this.LeerDatosConHorario(seleccionados, origen, opcion);
      }
    }
    else {
      this.LeerDatosConHorario(seleccionados, origen, opcion);
    }
  }

  // METODO PARA VERIFICAR QUE NO EXISTAN HORARIOS DENTRO DE LOS MISMOS RANGOS
  VerificarHorarioRangos(existe: any, ingresados: any, tipo: any, valor: any) {
    this.horarios.forEach((obj: any) => {
      for (var h = 0; h < existe.length; h++) {
        if (obj.id === existe[h].id_horario) {
          existe[h].detalles = obj.detalles;
          break;
        }
      }
    })
    for (var i = 0; i < existe.length; i++) {
      if ((tipo === 'N' || tipo === 'HA' || tipo === 'N' || tipo === 'HA') && valor.tipo_dia_origen != 'DFD' && valor.tipo_dia_origen != 'DL') {
        for (var k = 0; k < ingresados.length; k++) {
          if (existe[i].detalles.segundo_dia === false && ingresados[k].detalles.segundo_dia === false) {
            if (existe[i].detalles.salida < ingresados[k].detalles.entrada) {
              valor.horas_validas = 'OK';
            }
            else if (existe[i].detalles.entrada > ingresados[k].detalles.salida) {
              valor.horas_validas = 'OK';
            }
            else {
              valor.horas_validas = 'Horarios con rangos de jornada similares.';
              break;
            }
          }
          else if (existe[i].detalles.segundo_dia === true && ingresados[k].detalles.segundo_dia === true) {
            valor.horas_validas = 'Horarios con rangos de jornada similares.';
            break;
          }
          else if (existe[i].detalles.segundo_dia === false && ingresados[k].detalles.segundo_dia === true) {
            if (existe[i].detalles.entrada > ingresados[k].detalles.salida
              && existe[i].detalles.salida > ingresados[k].detalles.salida
              && existe[i].detalles.salida < ingresados[k].detalles.entrada) {
              valor.horas_validas = 'OK';
            }
            else {
              valor.horas_validas = 'Horarios con rangos de jornada similares.';
              break;
            }
          }
          else if (existe[i].detalles.segundo_dia === true && ingresados[k].detalles.segundo_dia === false) {
            if (existe[i].detalles.salida < ingresados[k].detalles.entrada
              && existe[i].detalles.salida < ingresados[k].detalles.salida
              && existe[i].detalles.entrada > ingresados[k].detalles.salida) {
              valor.horas_validas = 'OK';
            }
            else {
              valor.horas_validas = 'Horarios con rangos de jornada similares.';
              break;
            }
          }
        }
      }
    }
  }

  // METODO PARA VALIDAR RANGOS DE TIEMPOS EN HORARIOS
  ValidarRangos(lista: any) {
    var datos_o: any = [];
    var datos: any = [];
    lista.forEach((obj: any) => {
      if (obj.salida_otro_dia === 1) {
        datos = datos.concat(obj)
      }
      else {
        datos_o = datos_o.concat(obj);
      }
    })
    datos.forEach((ele: any) => {
      for (var i = 0; i < datos_o.length; i++) {

        if (ele.codigo === datos_o[i].codigo) {

          if ((DateTime.fromISO(datos_o[i].fecha_hora_horario).toFormat('yyyy-MM-dd') == DateTime.fromISO(ele.fecha_hora_horario).toFormat('yyyy-MM-dd'))
            && datos_o[i].tipo_accion === 'E' && ele.tipo_accion === 'S' && datos_o[i].tipo_dia === 'N') {

            if (DateTime.fromISO(datos_o[i].fecha_hora_horario).toFormat('HH:mm:ss') <= DateTime.fromISO(ele.fecha_hora_horario).toFormat('HH:mm:ss')) {
              this.data_horarios.forEach((li: any) => {
                if (li.fecha === DateTime.fromISO(ele.fec_hora_horario).toFormat('yyyy-MM-dd')) {
                  li.horas_validas = 'RANGOS DE TIEMPO SIMILARES'
                }
              })
              break;
            }
          }
        }
      }
    })
    this.ControlarBotones(false, true);
  }

  // METODO PARA SUMAR HORAS
  SumarHoras(suma: string, tiempo: string) {
    let sumah = parseInt(suma.split(':')[0]) + parseInt(tiempo.split(':')[0]);
    let sumam = parseInt(suma.split(':')[1]) + parseInt(tiempo.split(':')[1]);
    let sumas = parseInt(suma.split(':')[2]) + parseInt(tiempo.split(':')[2]);
    if (sumam === 60) {
      sumam = 0;
      sumah = sumah + 1;
    }
    let h = '00';
    let m = '00';
    let s = '00';
    if (sumah < 10) {
      h = '0' + sumah;
    }
    else {
      h = String(sumah)
    }
    if (sumam < 10) {
      m = '0' + sumam;
    }
    else {
      m = String(sumam)
    }
    if (sumas < 10) {
      s = '0' + sumas;
    }
    else {
      s = String(sumas)
    }
    return h + ':' + m + ':' + s
  }

  // CONTROL DE BOTONES
  ControlarBotones(horario: boolean, guardar: boolean) {
    this.ver_horario_ = horario;
    this.ver_guardar = guardar;
  }

  // METODO PARA GUARDAR DATOS
  guardar: any = [];
  GuardarDatos(opcion: number) {
    let datos: any = [];
    this.data_horarios.forEach((valor: any) => {
      if (valor.horas_validas === 'OK') {
        datos = datos.concat(valor);
      }
      if (valor.tipo_dia_origen === 'DL') {
        datos = datos.concat(valor);
      }
      if (valor.tipo_dia_origen === 'DFD') {
        valor.registrados.forEach((r: any) => {
          let eliminar = {
            fecha: valor.fecha,
            id_horarios: r.id_horario,
          }
          this.lista_eliminar = this.lista_eliminar.concat(eliminar);
        })
        datos = datos.concat(valor);
      }
    })
    if (datos.length === 0) {
      this.toastr.warning('No se han encontrado datos para registrar.', 'Ups! verificar calendario.', {
        timeOut: 6000,
      });
      this.ControlarBotones(true, false);
    }
    else {
      this.CrearPlanGeneral(datos, opcion);
    }
  }

  // METODO PARA ELIMINAR PLANIFICACION GENERAL DE HORARIOS
  EliminarPlanificacion(seleccionados: any, origen: any, opcion: number) {
    let verificador = 0;
    let datos = {
      id_plan: [],
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
    }
    this.lista_eliminar.forEach((eliminar: any) => {
      let plan_fecha = {
        id_empleado: this.datoEmpleado.idEmpleado,
        fec_final: eliminar.fecha,
        fec_inicio: eliminar.fecha,
        id_horario: eliminar.id_horarios,
      };
      this.restP.BuscarFechas(plan_fecha).subscribe(res => {
        // METODO PARA ELIMINAR DE LA BASE DE DATOS
        this.restP.EliminarRegistro(datos).subscribe(datos => {
          verificador = verificador + 1;
          if (verificador === this.lista_eliminar.length) {
            this.LeerDatosConHorario(seleccionados, origen, opcion);
          }
        })
      }, vacio => {
        verificador = verificador + 1;
        if (verificador === this.lista_eliminar.length) {
          this.LeerDatosConHorario(seleccionados, origen, opcion);
        }
      })
    })
  }

  // METODO PARA LEER DATOS CON HORARIO
  LeerDatosConHorario(seleccionados: any, origen: any, opcion: number) {
    let cont1 = 0;
    let cont2 = 0;
    let cont3 = 0;
    let total = 0;
    // SE CONTABILIZA EL TOTAL DE HORARIOS SELEECCIONADOS POR DIA
    seleccionados.forEach((valor: any) => {
      total = total + valor.horarios.length;
    })
    // SELECCIONADOS CON HORARIOS
    seleccionados.forEach((valor: any) => {
      cont1 = cont1 + 1;
      valor.horarios.forEach((h: any) => {
        this.restD.ConsultarUnDetalleHorario(h.id_horario).subscribe(res => {
          cont2 = cont2 + 1;
          if (res.length != 0) {
            // COLOCAR DETALLE DE DIA SEGUN HORARIO
            res.map((deta: any) => {
              cont3 = cont3 + 1;
              var accion = 0;
              var nocturno: number = 0;
              if (deta.tipo_accion === 'E') {
                accion = deta.tolerancia;
              }
              if (deta.segundo_dia === true) {
                nocturno = 1;
              }
              else if (deta.tercer_dia === true) {
                nocturno = 2;
              }
              else {
                nocturno = 0;
              }
              // SE COLOCA TIPO DE DIA ACORDE AL TIPO DE HORARIO
              if (valor.tipo_dia_origen === 'DFD') {
                valor.tipo_dia = 'FD';
                origen = 'FD';
              }
              else if (valor.tipo_dia_origen === 'DL') {
                valor.tipo_dia = 'L';
                origen = 'L';
              }
              else if (valor.tipo_dia === 'L') {
                valor.tipo_dia = 'L';
                origen = 'HL';
              }
              else if (valor.tipo_dia === 'FD') {
                valor.tipo_dia = 'FD';
                origen = 'HFD';
              }
              else {
                valor.tipo_dia = 'N';
                origen = 'N';
              }

              let plan = {
                id_empleado: this.datoEmpleado.idEmpleado,
                tipo_dia: valor.tipo_dia,
                min_antes: deta.minutos_antes,
                tolerancia: accion,
                id_horario: h.id_horario,
                min_despues: deta.minutos_despues,
                fec_horario: valor.fecha,
                estado_origen: origen,
                estado_timbre: valor.tipo_dia,
                id_empl_cargo: this.datoEmpleado.idCargo,
                id_det_horario: deta.id,
                salida_otro_dia: nocturno,
                tipo_entr_salida: deta.tipo_accion,
                fec_hora_horario: valor.fecha + ' ' + deta.hora,
                min_alimentacion: deta.minutos_comida,
              };
              if (deta.segundo_dia === true) {
                plan.fec_hora_horario = DateTime.fromISO(valor.fecha).plus({ days: 1 }).toFormat('yyyy-MM-dd') + deta.hora;
              }
              if (deta.tercer_dia === true) {
                plan.fec_hora_horario = DateTime.fromISO(valor.fecha).plus({ days: 2 }).toFormat('yyyy-MM-dd') + deta.hora;
              }
              // ALMACENAMIENTO DE PLANIFICACION GENERAL
              this.plan_general = this.plan_general.concat(plan);
              if (cont3 === res.length) {
                cont3 = 0;
                if (cont1 === seleccionados.length) {
                  if (cont2 === total) {
                    if (opcion === 1) {
                      this.ValidarRangos(this.plan_general);
                    }
                    else {
                      this.InsertarPlanificacion();
                    }
                  }
                }
              }
            })
          }
        })
      })
    })
  }

  // METODO PARA INGRESAR DATOS A LA BASE
  InsertarPlanificacion() {
    const datos = {
      plan_general: this.plan_general,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
    }
    this.restP.CrearPlanGeneral(datos).subscribe(res => {
      if (res.message === 'OK') {
        this.toastr.success('Operación exitosa.', 'Planificación horaria registrada.', {
          timeOut: 6000,
        });
        this.cargar = true;
        this.ver_guardar = false;
      }
      else {
        this.toastr.error('Ups! se ha producido un error.', 'Verificar la planificación.', {
          timeOut: 6000,
        });
        this.CerrarVentana();
      }
    }, error => {
      this.toastr.error('Ups! se ha producido un error.', 'Verificar la planificación.', {
        timeOut: 6000,
      });
      this.CerrarVentana();
    })
  }


  // METODO PARA CARGAR TIMBRES
  cargar: boolean = false;
  CargarTimbres() {
    var codigos = '\'' + this.datoEmpleado.codigo + '\'';
    let usuarios = {
      codigo: codigos,
      fec_final: DateTime.fromJSDate(this.fechaFinalF.value).plus({ days: 2 }).toFormat('yyyy-MM-dd'),
      fec_inicio: DateTime.fromJSDate(this.fechaInicialF.value).toFormat('yyyy-MM-dd'),
    };
    this.timbrar.BuscarTimbresPlanificacion(usuarios).subscribe(datos => {
      if (datos.message === 'vacio') {
        this.toastr.info(
          'No se han encontrado registros de marcaciones.', '', {
          timeOut: 6000,
        })
        this.CerrarVentana();
      }
      else if (datos.message === 'error') {
        this.toastr.info(
          'Ups! algo salio mal', 'No se cargaron todos los registros.', {
          timeOut: 6000,
        })
      }
      else {
        this.toastr.success(
          'Operación exitosa.', 'Registros cargados.', {
          timeOut: 6000,
        })
        this.CerrarVentana();
      }
    }, vacio => {
      this.toastr.info(
        'No se han encontrado registros de marcaciones.', '', {
        timeOut: 6000,
      })
    })
  }

  // METODO PARA CERRAR VENTANA
  CerrarVentana() {
    if (this.datoEmpleado.pagina === 'ver-empleado') {
      this.componentev.ver_tabla_horarios = true;
      this.componentev.registrar_rotativo = false;
    }
    else if (this.datoEmpleado.pagina === 'mutiple-horario') {
      this.componentem.seleccionar = true;
      this.componentem.registrar_rotativo = false;
      this.componentem.LimpiarFormulario();
    }
    else if (this.datoEmpleado.pagina === 'busqueda') {
      this.componenteb.registrar_rotativo = false;
      this.componenteb.seleccionar = true;
      this.componenteb.buscar_fechas = true;
      this.componenteb.auto_individual = true;
      this.componenteb.multiple = true;
    }
  }

}


