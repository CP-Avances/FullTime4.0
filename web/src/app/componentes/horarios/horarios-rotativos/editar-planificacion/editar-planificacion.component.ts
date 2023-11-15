import { MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Component, OnInit, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import moment from 'moment';
import { default as _rollupMoment } from 'moment';

import { DetalleCatHorariosService } from 'src/app/servicios/horarios/detalleCatHorarios/detalle-cat-horarios.service';
import { EmpleadoHorariosService } from 'src/app/servicios/horarios/empleadoHorarios/empleado-horarios.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { PlanGeneralService } from 'src/app/servicios/planGeneral/plan-general.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { FeriadosService } from 'src/app/servicios/catalogos/catFeriados/feriados.service';
import { HorarioService } from 'src/app/servicios/catalogos/catHorarios/horario.service';
import { TimbresService } from 'src/app/servicios/timbres/timbres.service';

import { BuscarPlanificacionComponent } from '../../rango-fechas/buscar-planificacion/buscar-planificacion.component';
import { HorariosEmpleadoComponent } from 'src/app/componentes/rolEmpleado/horarios-empleado/horarios-empleado.component';
import { VerEmpleadoComponent } from 'src/app/componentes/empleado/ver-empleado/ver-empleado.component';
import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';

@Component({
  selector: 'app-editar-planificacion',
  templateUrl: './editar-planificacion.component.html',
  styleUrls: ['./editar-planificacion.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
  ]
})

export class EditarPlanificacionComponent implements OnInit {

  @Input() datos_horarios: any;

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

  constructor(
    public componentev: VerEmpleadoComponent,
    public componenteb: BuscarPlanificacionComponent,
    public componentep: HorariosEmpleadoComponent,
    public parametro: ParametrosService,
    public ventanae: MatDialog,
    public feriado: FeriadosService,
    public validar: ValidacionesService,
    public timbrar: TimbresService,
    public horario: EmpleadoHorariosService,
    public router: Router,
    public restE: EmpleadoService,
    public restD: DetalleCatHorariosService,
    public restH: HorarioService,
    public restP: PlanGeneralService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    //console.log('ver rotativo ', this.datos_horarios)
    this.BuscarHora();
    this.BuscarFeriados();
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

  // METODO PARA BUSCAR FERIADOS
  BuscarFeriados() {
    let fecha = this.datos_horarios.anio + '-' + this.datos_horarios.mes + '-' + this.datos_horarios.dia;
    this.feriados = [];
    let datos = {
      fecha_inicio: moment(fecha, 'YYYY-MM-DD').format('YYYY-MM-DD'),
      fecha_final: moment(fecha, 'YYYY-MM-DD').format('YYYY-MM-DD'),
      id_empleado: parseInt(this.datos_horarios.idEmpleado)
    }
    this.feriado.ListarFeriadosCiudad(datos).subscribe(data => {
      this.feriados = data;
      this.BuscarFeriadosRecuperar(fecha)
    }, error => {
      this.BuscarFeriadosRecuperar(fecha)
    })
  }

  // METODO PARA BUSCAR FECHAS DE RECUPERACION DE FERIADOS
  recuperar: any = [];
  BuscarFeriadosRecuperar(fecha: any) {
    this.recuperar = [];
    let datos = {
      fecha_inicio: moment(fecha, 'YYYY-MM-DD').format('YYYY-MM-DD'),
      fecha_final: moment(fecha, 'YYYY-MM-DD').format('YYYY-MM-DD'),
      id_empleado: parseInt(this.datos_horarios.idEmpleado)
    }
    this.feriado.ListarFeriadosRecuperarCiudad(datos).subscribe(data => {
      this.recuperar = data;
      this.BuscarHorarios();
    }, error => {
      this.BuscarHorarios();
    })
  }

  // VARIABLES DE ALMACENAMIENTO DE DATOS ESPECIFICOS DE UN HORARIO
  detalles_horarios: any = [];
  vista_horarios: any = [];
  vista_descanso: any = [];
  hora_entrada: any;
  hora_salida: any;
  segundo_dia: any;
  tercer_dia: any;
  // METODO PARA MOSTRAR NOMBRE DE HORARIO CON DETALLE DE ENTRADA Y SALIDA
  BuscarHorarios() {
    this.horarios = [];
    this.vista_horarios = [];
    this.vista_descanso = [];
    // BUSQUEDA DE HORARIOS
    this.restH.BuscarListaHorarios().subscribe(datos => {
      this.horarios = datos;
      this.horarios.map(hor => {
        // BUSQUEDA DE DETALLES DE ACUERDO AL ID DE HORARIO
        this.restD.ConsultarUnDetalleHorario(hor.id).subscribe(res => {
          this.detalles_horarios = res;
          //console.log('detalles ', this.detalles_horarios)
          this.detalles_horarios.map(det => {
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
          if (hor.default_ === 'DL' || hor.default === 'DFD') {
            this.vista_descanso = this.vista_descanso.concat(datos_horario);
          }
          else {
            this.vista_horarios = this.vista_horarios.concat(datos_horario);
          }
        })
      })

      this.ListarHorariosSeleccionados();

    })
  }

  // METODO PARA VER HORARIOS SELECCIONADOS
  horas: any = [];
  dia_fecha: any;
  tipo_dia_verificar: string = '';
  seleccionar_horario: boolean = true;
  seleccionar_libre: boolean = true;
  ListarHorariosSeleccionados() {
    this.tipo_dia_verificar = '';
    this.horas = [];
    this.lista_libres = [];
    let total = this.datos_horarios.datosPlan.split(',').length;

    let fecha = this.datos_horarios.anio + '-' + this.datos_horarios.mes + '-' + this.datos_horarios.dia;
    let fecha_ = moment(fecha, 'YYYY-MM-D').format('YYYY/MM/DD');
    this.dia_fecha = (moment(fecha_, 'YYYY/MM/DD').format('MMMM, ddd DD, YYYY')).toUpperCase();

    for (var i = 0; i < total; i++) {
      // HORARIOS LIBRE Y FERIADO PROPIOS DEL SISTEMA
      if ((this.datos_horarios.datosPlan.split(',')[i]).trim() === 'L' ||
        (this.datos_horarios.datosPlan.split(',')[i]).trim() === 'FD') {
        this.BuscarPlanificacion((this.datos_horarios.datosPlan.split(',')[i]).trim());
        break;
      }
      else {
        this.horarios.forEach(o => {
          // COMPARAR HORARIOS (SE RETIRA ESPACIOS)
          if (o.codigo === (this.datos_horarios.datosPlan.split(',')[i]).trim()) {
            let data = {
              horarios: o,
              asignado: false,
              anio: this.datos_horarios.anio,
              mes: this.datos_horarios.mes,
              dia: this.datos_horarios.dia,
            }
            this.horas = this.horas.concat(data);
          }
        })
      }
    }

    if (this.feriados.length) {
      //console.log('existen feriados', this.feriados);
      this.seleccionar_libre = false;
      this.ver_feriado = true;
      this.ver_nota = true;
      this.notas1 = 'DÍA CONFIGURADO EN EL SISTEMA COMO FERIADO.';
      this.nota_ = 'feriado';
    }

    //console.log('ver horarios asignados ', this.horas)

    this.BuscarPlanificacionAntes();
    this.BuscarPlanificacionDespues();
  }

  // METODO PARA BUSCAR PLANIFICACION
  lista_libres: any = [];
  lista_feriados: any = [];
  BuscarPlanificacion(tipo: string) {
    //console.log('ver tipo ', tipo)
    if (tipo === 'L') {
      this.tipo_dia_verificar = 'L';
    }
    else {
      this.tipo_dia_verificar = 'FD';
    }

    this.lista_libres = [];
    this.lista_feriados = [];
    let fecha = this.datos_horarios.anio + '-' + this.datos_horarios.mes + '-' + this.datos_horarios.dia;
    let busqueda = {
      fecha_inicio: moment(fecha, 'YYYY-MM-DD').format('YYYY-MM-DD'),
      fecha_final: moment(fecha, 'YYYY-MM-DD').format('YYYY-MM-DD'),
      codigo: '\'' + this.datos_horarios.codigo + '\''
    }
    this.restP.BuscarHorariosUsuario(busqueda).subscribe(datos => {
      //console.log('ver datos horarios ', datos.data)
      if (datos.message === 'OK') {
        for (var j = 0; j < this.horarios.length; j++) {
          // COMPARAR HORARIOS (SE RETIRA ESPACIOS)
          if (this.horarios[j].id === datos.data[0].id_horario) {
            let data = {
              horarios: this.horarios[j],
              asignado: false,
              anio: this.datos_horarios.anio,
              mes: this.datos_horarios.mes,
              dia: this.datos_horarios.dia,
              tipo_dia: this.tipo_dia_verificar,
            }
            if (tipo === 'L') {
              this.lista_libres = this.lista_libres.concat(data);
              this.seleccionar_libre = false;
            }
            else {
              this.lista_feriados = this.lista_feriados.concat(data);
            }
            break;
          }
        }
      }
      //console.log('ver horario libre ', this.lista_libres);
    })
  }

  // METODO PARA BUSCAR PLANIFICACION DIA ANTES
  antes: any = [];
  BuscarPlanificacionAntes() {
    let formato = this.datos_horarios.anio + '-' + this.datos_horarios.mes + '-' + this.datos_horarios.dia;
    var restar = moment(formato, 'YYYY-MM-DD').subtract(1, 'days');
    var fecha = moment(restar, 'YYYY-MM-DD').format('YYYY-MM-DD');
    //console.log('ver dia anterior ', fecha);

    let busqueda = {
      fecha_inicio: fecha,
      fecha_final: fecha,
      codigo: '\'' + this.datos_horarios.codigo + '\''
    }
    this.restP.BuscarHorariosUsuario(busqueda).subscribe(datos => {
      //console.log('ver datos horarios antes', datos)
      if (datos.message === 'OK') {
        for (var j = 0; j < this.horarios.length; j++) {
          for (var k = 0; k < datos.data.length; k++) {
            // COMPARAR HORARIOS (SE RETIRA ESPACIOS)
            if (this.horarios[j].id === datos.data[k].id_horario) {
              if (this.horarios[j].detalles.segundo_dia) {
                //console.log('detalles ', this.horarios[j].detalles.segundo_dia)
                if (this.horarios[j].detalles.segundo_dia === true) {
                  let data = {
                    horarios: this.horarios[j].detalles,
                  }
                  this.antes = this.antes.concat(data);
                }
              }
              break;
            }
          }
        }
      }
      //console.log('antes ', this.antes);
    })
  }

  // METODO PARA BUSCAR PLANIFICACION DIA DESPUES
  despues: any = [];
  BuscarPlanificacionDespues() {
    let formato = this.datos_horarios.anio + '-' + this.datos_horarios.mes + '-' + this.datos_horarios.dia;
    var restar = moment(formato, 'YYYY-MM-DD').add(1, 'days');
    var fecha = moment(restar, 'YYYY-MM-DD').format('YYYY-MM-DD');
    //console.log('ver dia anterior ', fecha);

    let busqueda = {
      fecha_inicio: fecha,
      fecha_final: fecha,
      codigo: '\'' + this.datos_horarios.codigo + '\''
    }
    this.restP.BuscarHorariosUsuario(busqueda).subscribe(datos => {
      //console.log('ver datos horarios despues', datos)
      if (datos.message === 'OK') {
        for (var j = 0; j < this.horarios.length; j++) {
          for (var k = 0; k < datos.data.length; k++) {
            // COMPARAR HORARIOS (SE RETIRA ESPACIOS)
            if (this.horarios[j].id === datos.data[k].id_horario) {
              let data = {
                horarios: this.horarios[j].detalles,
              }
              this.despues = this.despues.concat(data);
              break;
            }
          }
        }
      }
      //console.log('depues ', this.despues);
    })
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
      this.ObtenerDetallesHorario(id, codigo, min_almuerzo);
      this.AgregarHorario();
    }
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

  // METODO PARA AGREGAR UN NUEVO HORARIO
  AgregarHorario() {
    const [obj_res] = this.horarios.filter(o => {
      return o.codigo === this.horarioF.value
    })

    if (!obj_res) return this.toastr.warning('Horario no válido.');


    //console.log('ver horas ', this.horas)

    this.asignado_libre = [];

    var tipo = '';

    console.log('ver obj horario ', obj_res.default_)
    if (obj_res.default_ === 'HA') {
      tipo = 'HA';
    }
    else if (obj_res.default_ === 'L') {
      tipo = 'HL';
    }
    else if (obj_res.default_ === 'FD') {
      console.log('ingresa a DFD')
      tipo = 'HFD';
    }
    else {
      console.log('ingresa a N')
      tipo = 'N';
    }

    var proceso: number = 0;
    if (this.feriados.length) {
      //console.log('ver tipo ', tipo)
      if (tipo === 'HL' || tipo === 'HFD') {
        proceso = 0;
        this.ver_feriado = false;
      }
      else {
        //console.log('existen feriados', this.feriados);
        this.seleccionar_libre = false;
        this.ver_feriado = true;
        this.ver_nota = true;
        this.notas1 = 'DÍA CONFIGURADO EN EL SISTEMA COMO FERIADO.';
        this.nota_ = 'feriado';
        proceso = 1;
      }
    }
    else {
      proceso = 0;
    }

    if (proceso === 0) {
      let data = {
        horarios: obj_res,
        asignado: true,
        anio: this.datos_horarios.anio,
        mes: this.datos_horarios.mes,
        dia: this.datos_horarios.dia,
        tipo_dia: tipo,
      }

      let verificador = 0;
      for (var i = 0; i < this.horas.length; i++) {
        if (this.horas[i].horarios.codigo === this.horarioF.value) {
          verificador = 1;
          break;
        }
        else {
          if (this.horas[i].horarios.detalles.segundo_dia === false && data.horarios.detalles.segundo_dia === false) {
            if (this.horas[i].horarios.detalles.salida < data.horarios.detalles.entrada) {
              verificador = 0;
            }
            else if (this.horas[i].horarios.detalles.entrada > data.horarios.detalles.salida) {
              verificador = 0
            }
            else {
              verificador = 2;
              break;
            }
          }
          else if (this.horas[i].horarios.detalles.segundo_dia === true && data.horarios.detalles.segundo_dia === true) {
            verificador = 2;
            break;
          }
          else if (this.horas[i].horarios.detalles.segundo_dia === false && data.horarios.detalles.segundo_dia === true) {
            if (this.horas[i].horarios.detalles.entrada > data.horarios.detalles.salida
              && this.horas[i].horarios.detalles.salida > data.horarios.detalles.salida
              && this.horas[i].horarios.detalles.salida < data.horarios.detalles.entrada) {
              verificador = 0;
            }
            else {
              verificador = 2;
              break;
            }
          }
          else if (this.horas[i].horarios.detalles.segundo_dia === true && data.horarios.detalles.segundo_dia === false) {
            if (this.horas[i].horarios.detalles.salida < data.horarios.detalles.entrada
              && this.horas[i].horarios.detalles.salida < data.horarios.detalles.salida
              && this.horas[i].horarios.detalles.entrada > data.horarios.detalles.salida) {
              verificador = 0;
            }
            else {
              verificador = 2;
              break;
            }
          }
        }
      }
      //console.log('verificador .. ', verificador)
      if (verificador === 1) {
        this.toastr.warning('Horario ya se encuentra registrado.', 'Ups!!! VERIFICAR.', {
          timeOut: 6000,
        });
      }
      else if (verificador === 2) {
        this.toastr.warning('No es posible registrar horarios con rangos de tiempo similares.', 'Ups!!! VERIFICAR.', {
          timeOut: 6000,
        });
      }
      else {

        // VERIFICAR SI EXISTEN HORARIOS CON SALIDAS AL DIA SIGUIENTE (UN DIA ANTES)
        for (var t = 0; t < this.antes.length; t++) {
          if (moment(this.antes[i].horarios.salida, 'HH:mm:ss').format('HH:mm:ss') <= moment(data.horarios.detalles.entrada, 'HH:mm:ss').format('HH:mm:ss')) {
            verificador = 3;
            break;
          }
        }

        if (verificador === 3) {
          this.toastr.warning('No es posible registrar horarios con rangos de tiempo similares.', 'Ups!!! VERIFICAR.', {
            timeOut: 6000,
          });
        }
        else {
          console.log('ver horario dia despues ', this.despues)
          // SI EL HORARIO TIENE SALIDA AL SIGUIENTE DIA
          if (data.horarios.detalles.segundo_dia === true) {
            // VALIDAR SI EXISTEN HORARIOS DEL DIA SIGUIENTE
            for (var t = 0; t < this.despues.length; t++) {
              //console.log('entrada ', moment(this.despues[i].horarios.entrada, 'HH:mm:ss').format('HH:mm:ss'))
              //console.log('salida ', moment(data.horarios.detalles.salida, 'HH:mm:ss').format('HH:mm:ss'))
              if (moment(this.despues[i].horarios.entrada, 'HH:mm:ss').format('HH:mm:ss') <= moment(data.horarios.detalles.salida, 'HH:mm:ss').format('HH:mm:ss')) {
                verificador = 4;
                break;
              }
            }
          }
          else {
            verificador === 5
          }

          // FIN DE LAS VALIDACIONES
          if (verificador === 4) {
            this.toastr.warning('No es posible registrar horarios con rangos de tiempo similares.', 'Ups!!! VERIFICAR.', {
              timeOut: 6000,
            });
          }
          else {
            this.horas = this.horas.concat(data);
            this.ver_horario_ = true;
            this.ver_guardar = false;
            this.ver_nota = false;
          }
        }
      }

      //console.log('horarios agregados ', this.horas)
      //console.log('verificador ', verificador)

    }
    else {
      this.toastr.warning('Dia configurado como feriado en el sistema. Puede ingresar horarios de tipo Feriado.', 'Ups!!! VERIFICAR.', {
        timeOut: 6000,
      });
    }
  }

  // METODO PARA QUITAR HORARIOS DE LA LISTA
  lista_eliminar: any = []
  QuitarHorarios(index: any) {
    if (this.horas[index].asignado === false) {
      this.lista_eliminar = this.lista_eliminar.concat(this.horas[index]);
    }
    this.horas.splice(index, 1);

    this.ver_nota = false;

    if (this.tipo_dia_verificar === 'L') {
      if (this.horas.length === 0) {
        this.ver_horario_ = false;
        this.ver_guardar = false;
      }
    }
    else {
      if (this.horas.length === 0) {
        this.ver_horario_ = false;
        this.ver_guardar = true;
      }
      else {
        this.ver_horario_ = true;
        this.ver_guardar = false;
      }
    }
    console.log('ver datos horas', this.horas);
    console.log('ver eliminados ', this.lista_eliminar);
  }

  // METODO PARA AGREGAR DIAS LIBRES
  asignado_libre: any = [];
  AgregarLibre() {

    if (this.horas.length != 0) {
      this.toastr.warning('Este día ya tiene configurado horarios. No puede ser libre.', 'Ups!!! VERIFICAR.', {
        timeOut: 6000,
      });
    }
    else {
      if (this.asignado_libre.length != 0) {
        this.asignado_libre = [];
        this.ver_horario_ = false;
        this.ver_guardar = false;
        this.ver_nota = false;
        this.notas1 = '';
        this.notas2 = '';
      }
      else {
        //console.log('ver horarios ', this.horarios)
        const [obj_res] = this.horarios.filter(o => {
          return o.default_ === 'DL'
        })

        this.asignado_libre = [];

        let data = {
          horarios: obj_res,
          asignado: true,
          anio: this.datos_horarios.anio,
          mes: this.datos_horarios.mes,
          dia: this.datos_horarios.dia,
          tipo_dia: 'L',
        }

        this.asignado_libre = this.asignado_libre.concat(data);
        this.ver_horario_ = false;
        this.ver_guardar = true;

        this.ver_nota = true;
        this.nota_ = 'libre';
        this.notas1 = 'DÍA CONFIGURADO COMO LIBRE O NO LABORABLE.';
        this.notas2 = '';
      }
      //console.log('ver libre ', this.asignado_libre)
    }
  }

  // METODO PARA VERIFICAR HORARIOS
  ver_nota: boolean = false;
  notas1: string = '';
  notas2: string = '';
  nota_: string = '';
  observacion: string = '';
  VerificarHorarios() {
    this.notas1 = '';
    const trabajo = this.datos_horarios.horas_trabaja;
    let suma = '00:00:00';
    this.horas.forEach(valor => {
      // SUMA DE HORAS DE CADA UNO DE LOS HORARIOS SELECCIONADOS
      suma = this.SumarHoras(suma, valor.horarios.hora_trabajo);
    })

    this.ver_nota = true;
    //console.log('ver datos de horas ', this.StringTimeToSegundosTime(suma), ' trabajo ', this.StringTimeToSegundosTime(trabajo))
    if (this.StringTimeToSegundosTime(suma) <= this.StringTimeToSegundosTime(trabajo)) {
      this.notas1 = 'Horarios verificados exitosamente.';
      this.notas2 = '';
      this.nota_ = 'ok';
      this.ver_guardar = true;
      this.ver_horario_ = false;
      this.ver_feriado = false;
    }
    else {
      this.nota_ = 'ok';
      this.observacion = 'error'
      this.notas1 = 'Horarios verificados exitosamente.';
      this.notas2 = 'Horas totales de horarios seleccionados (' + suma + '). Superan las horas de su jornada laboral (' + trabajo + ').';
      this.ver_guardar = true;
      this.ver_horario_ = false;
      this.ver_feriado = false;
    }
    //console.log('ver suma total ', suma);
  }

  // METODO PARA ELIMINAR Y REGISTRAR HORARIOS
  RegistrarHorario() {

    // VERIFICAR ELIMINACION DE DIAS LIBRES
    if (this.tipo_dia_verificar === 'L') {
      this.EliminarPlanificacion(this.lista_libres, this.horas);
    }
    else {
      // VERIFICAR SI ESTA CONFIGURADO COMO LIBRE
      if (this.asignado_libre.length != 0) {
        if (this.lista_eliminar != 0) {
          this.EliminarPlanificacion(this.lista_eliminar, this.asignado_libre);
        }
        else {
          this.GuardarHorario(this.asignado_libre);
        }
      }
      else {
        // VERIFICAR SI EXISTEN HORARIOS ELIMINADOS
        if (this.lista_eliminar.length != 0) {
          if (this.horas.length === 0) {
            this.ConfirmarEliminar(this.lista_eliminar, this.horas);
          }
          else {
            this.EliminarPlanificacion(this.lista_eliminar, this.horas);
          }
        }
        else {
          this.GuardarHorario(this.horas);
        }
      }
    }
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
  ConfirmarEliminar(lista: any, asignacion: any) {
    this.ventanae.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarPlanificacion(lista, asignacion);
        }
      });
  }

  // METODO PARA ELIMINAR PLANIFICACION GENERAL DE HORARIOS
  EliminarPlanificacion(lista: any, asignacion: any) {
    let cont = 0;
    let eliminado = 0;
    let no_eliminado = 0;
    lista.forEach(horario => {
      let fecha = horario.anio + '-' + horario.mes + '-' + horario.dia;
      //console.log('fecha ', moment(fecha, 'YYYY-MM-DD').format('YYYY-MM-DD'))
      let plan_fecha = {
        codigo: this.datos_horarios.codigo,
        fec_final: moment(fecha, 'YYYY-MM-DD').format('YYYY-MM-DD'),
        fec_inicio: moment(fecha, 'YYYY-MM-DD').format('YYYY-MM-DD'),
        id_horario: horario.horarios.id,
      };
      //console.log('plan ', plan_fecha)
      this.restP.BuscarFechas(plan_fecha).subscribe(res => {
        // METODO PARA ELIMINAR DE LA BASE DE DATOS
        this.restP.EliminarRegistro(res).subscribe(datos => {
          cont = cont + 1;
          if (datos.message === 'OK') {
            eliminado = eliminado + 1;
            if (cont === lista.length) {
              if (eliminado === cont) {
                if (asignacion.length != 0) {
                  this.GuardarHorario(asignacion);
                }
                else {
                  this.CerrarVentana(2);
                }
              }
              else {
                this.toastr.error('Ups!!! se ha producido un error.',
                  'Verificar nuevamente.', {
                  timeOut: 6000,
                });
                this.CerrarVentana(2);
              }
            }
          }
          else {
            no_eliminado = no_eliminado + 1;
            if (cont === lista.length) {
              if (eliminado === cont) {
                if (asignacion.length != 0) {
                  this.GuardarHorario(asignacion);
                }
                else {
                  this.CerrarVentana(2);
                }
              }
              else {
                this.toastr.error('Ups!!! se ha producido un error.',
                  'Verificar nuevamente.', {
                  timeOut: 6000,
                });
                this.CerrarVentana(2);
              }
            }
          }
        })
      })
    })
  }

  // METODO PARA GUARDAR DATOS DE HORARIOS
  GuardarHorario(lista: any) {
    this.plan_general = [];
    let fecha = moment(this.dia_fecha, 'MMMM, ddd DD, YYYY').format('YYYY-MM-DD');
    let cont1 = 0;
    // CONTAR HORARIOS ASIGNADOS
    lista.forEach(h => {
      if (h.asignado === true) {
        cont1 = cont1 + 1;
      }
    })

    if (cont1 != 0) {
      let cont2 = 0;
      let cont3 = 0;
      let origen = '';
      var laborar = 0;
      // SELECCIONADOS CON HORARIOS
      lista.forEach(h => {
        //console.log('ver asignado ', h)
        if (h.asignado === true) {
          this.restD.ConsultarUnDetalleHorario(h.horarios.id).subscribe(res => {
            cont2 = cont2 + 1;
            if (res.length != 0) {
              // COLOCAR DETALLE DE DIA SEGUN HORARIO
              res.map(deta => {
                cont3 = cont3 + 1;
                //console.log('ver detalle ', deta)
                var accion = 0;
                var nocturno: number = 0;
                if (deta.tipo_accion === 'E') {
                  accion = deta.minu_espera;
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
                var estado: any = null;
                var dia_tipo = '';
                if (h.tipo_dia === 'HFD') {
                  dia_tipo = 'FD';
                  estado = 'FD';
                  origen = 'HFD';
                  laborar = 1;
                }
                else if (h.tipo_dia === 'FD') {
                  dia_tipo = 'FD';
                  estado = 'FD';
                  origen = 'FD';
                }
                else if (h.tipo_dia === 'HL') {
                  dia_tipo = 'L';
                  estado = 'L';
                  origen = 'HL';
                  laborar = 1;
                }
                else if (h.tipo_dia === 'L') {
                  dia_tipo = 'L';
                  estado = 'L';
                  origen = 'L';
                }
                else {
                  dia_tipo = 'N';
                  origen = 'N';
                }

                let plan = {
                  codigo: this.datos_horarios.codigo,
                  tipo_dia: dia_tipo,
                  min_antes: deta.min_antes,
                  tolerancia: accion,
                  id_horario: h.horarios.id,
                  min_despues: deta.min_despues,
                  fec_horario: fecha,
                  estado_origen: origen,
                  estado_timbre: estado,
                  id_empl_cargo: this.datos_horarios.idCargo,
                  id_det_horario: deta.id,
                  salida_otro_dia: nocturno,
                  tipo_entr_salida: deta.tipo_accion,
                  fec_hora_horario: fecha + ' ' + deta.hora,
                  min_alimentacion: deta.min_almuerzo,
                };
                if (deta.segundo_dia === true) {
                  plan.fec_hora_horario = moment(fecha).add(1, 'd').format('YYYY-MM-DD') + ' ' + deta.hora;
                }
                if (deta.tercer_dia === true) {
                  plan.fec_hora_horario = moment(fecha).add(2, 'd').format('YYYY-MM-DD') + ' ' + deta.hora;
                }
                // ALMACENAMIENTO DE PLANIFICACION GENERAL
                this.plan_general = this.plan_general.concat(plan);

                if (cont3 === res.length) {
                  cont3 = 0;
                  if (cont2 === cont1) {
                    //console.log('ver data plan generala ', this.plan_general);
                    if (laborar === 1) {
                      this.EliminarFeriados(this.lista_feriados);
                    }
                    this.InsertarPlanificacion();
                  }
                }
              })
            }
          })
        }
      })
    }
    else {
      this.CerrarVentana(2)
    }
  }

  // METODO PARA INGRESAR DATOS A LA BASE
  plan_general: any = [];
  InsertarPlanificacion() {
    //console.log('plan genral ', this.plan_general)
    this.restP.CrearPlanGeneral(this.plan_general).subscribe(res => {
      //console.log('ver respuesta ', res)
      if (res.message === 'OK') {
        //this.progreso = false;
        this.toastr.success('Operación exitosa.', 'Planificación horaria registrada.', {
          timeOut: 6000,
        });
        this.cargar = true;
        this.ver_feriado = false;
        this.ver_guardar = false;
      }
      else {
        //this.progreso = false;
        this.toastr.error('Ups!!! se ha producido un error.', 'Verificar la planificación.', {
          timeOut: 6000,
        });
        this.CerrarVentana(2);
      }
    }, error => {
      //this.progreso = false;
      this.toastr.error('Ups!!! se ha producido un error.', 'Verificar la planificación.', {
        timeOut: 6000,
      });
      this.CerrarVentana(2);
    })
    //this.AuditarPlanificar(form);
  }

  // METODO PARA REGISTRAR DIAS COMO FERIADOS
  ver_feriado: boolean = false;
  asignado_feriados: any = [];
  RegistrarFeriado() {
    const [obj_res] = this.horarios.filter(o => {
      return o.default_ === 'FD'
    })

    this.asignado_feriados = [];

    let data = {
      horarios: obj_res,
      asignado: true,
      anio: this.datos_horarios.anio,
      mes: this.datos_horarios.mes,
      dia: this.datos_horarios.dia,
      tipo_dia: 'FD',
    }
    this.asignado_feriados = this.asignado_feriados.concat(data);

    if (this.horas.length != 0) {
      this.EliminarPlanificacion(this.horas, this.asignado_feriados);
    }
    else {
      if (this.lista_feriados.length != 0) {
        this.EliminarPlanificacion(this.lista_feriados, this.asignado_feriados);
      }
      else {
        this.GuardarHorario(this.asignado_feriados);
      }
    }
  }

  // METODO PARA CARGAR TIMBRES
  cargar: boolean = false;
  CargarTimbres() {
    let fecha = this.datos_horarios.anio + '-' + this.datos_horarios.mes + '-' + this.datos_horarios.dia;
    var codigos = '\'' + this.datos_horarios.codigo + '\'';
    let usuarios = {
      codigo: codigos,
      fec_final: moment(moment(fecha, 'YYYY-MM-DD').format('YYYY-MM-DD')).add(2, 'days'),
      fec_inicio: moment(fecha, 'YYYY-MM-DD').format('YYYY-MM-DD'),
    };

    this.timbrar.BuscarTimbresPlanificacion(usuarios).subscribe(datos => {
      //console.log('datos ', datos)
      if (datos.message === 'vacio') {
        this.toastr.info(
          'No se han encontrado registros de marcaciones.', '', {
          timeOut: 6000,
        })
      }
      else if (datos.message === 'error') {
        this.toastr.info(
          'Ups!!! algo salio mal', 'No se cargaron todos los registros.', {
          timeOut: 6000,
        })
      }
      else {
        this.toastr.success(
          'Operación exitosa.', 'Registros de marcaciones cargados.', {
          timeOut: 6000,
        })
        this.CerrarVentana(2);
      }
    }, vacio => {
      this.toastr.info(
        'No se han encontrado registros de marcaciones.', '', {
        timeOut: 6000,
      })
      this.CerrarVentana(2);
    })
  }


  // METODO PARA ELIMINAR FERIADOS
  EliminarFeriados(lista: any) {
    lista.forEach(horario => {
      let fecha = horario.anio + '-' + horario.mes + '-' + horario.dia;
      //console.log('fecha ', moment(fecha, 'YYYY-MM-DD').format('YYYY-MM-DD'))
      let plan_fecha = {
        codigo: this.datos_horarios.codigo,
        fec_final: moment(fecha, 'YYYY-MM-DD').format('YYYY-MM-DD'),
        fec_inicio: moment(fecha, 'YYYY-MM-DD').format('YYYY-MM-DD'),
        id_horario: horario.horarios.id,
      };
      //console.log('plan ', plan_fecha)
      this.restP.BuscarFechas(plan_fecha).subscribe(res => {
        // METODO PARA ELIMINAR DE LA BASE DE DATOS
        this.restP.EliminarRegistro(res).subscribe(datos => {
        })
      })
    })
  }

  // METODO PARA SUMAR HORAS
  SumarHoras(suma: string, tiempo: string) {
    //console.log('dato 1 ', suma, ' dato 2 ', tiempo)
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

  // METODO PARA CAMBIAR DE COLORES SEGUN EL MES
  CambiarColores(opcion: any) {
    let color: string;
    switch (opcion) {
      case 'error':
        return color = '#A37401';
      case 'ok':
        return color = '#2FA406';
      case 'libre':
        return color = '#6E09AD';
      case 'feriado':
        return color = '#7D2D81';
    }
  }

  // METODO PARA SUMAR HORAS
  StringTimeToSegundosTime(stringTime: string) {
    const h = parseInt(stringTime.split(':')[0]) * 3600;
    const m = parseInt(stringTime.split(':')[1]) * 60;
    const s = parseInt(stringTime.split(':')[2]);
    return h + m + s
  }

  // METODO PARA CERRAR VENTANA
  CerrarVentana(opcion: number) {
    if (this.datos_horarios.pagina === 'ver_empleado') {
      this.componentev.editar_horario = false;
      this.componentev.expansion = true;
      this.componentev.editar_activar = true;
      this.componentev.ver_activar_editar = true;
      this.componentev.horariosEmpleado[this.datos_horarios.index].color = '';
      this.componentev.horariosEmpleado[this.datos_horarios.index].seleccionado = 0;
      if (opcion === 2) {
        this.componentev.BuscarHorarioPeriodo();
      }
    }
    else if (this.datos_horarios.pagina === 'lista-planificar') {
      this.componenteb.editar_horario = false;
      this.componenteb.columnAccion = true;
      this.componenteb.multiple = true;
      this.componenteb.auto_individual = true;
      this.componenteb.ver_activar_editar = true;
      this.componenteb.editar_activar = true;
      this.componenteb.horariosEmpleado[this.datos_horarios.index].color = '';
      this.componenteb.horariosEmpleado[this.datos_horarios.index].seleccionado = 0;
      if (opcion === 2) {
        this.componenteb.VerPlanificacion();
      }
    }
    else if (this.datos_horarios.pagina === 'perfil-empleado') {
      this.componentep.editar_horario = false;
      this.componentep.expansion = true;
      this.componentep.editar_activar = true;
      this.componentep.ver_activar_editar = true;
      this.componentep.horariosEmpleado[this.datos_horarios.index].color = '';
      this.componentep.horariosEmpleado[this.datos_horarios.index].seleccionado = 0;
      if (opcion === 2) {
        this.componentep.BuscarHorarioPeriodo();
      }
    }
  }

  // METODO PARA VER LOS DATOS MODIFICADOS
  VerModificacion() {
    if (this.datos_horarios.pagina === 'ver_empleado') {
      this.componentev.BuscarHorarioPeriodo();
    }
    else if (this.datos_horarios.pagina === 'lista-planificar') {
      this.componenteb.VerPlanificacion();
    }
    else if (this.datos_horarios.pagina === 'perfil-empleado') {
      this.componentep.BuscarHorarioPeriodo();
    }
  }













































































}
