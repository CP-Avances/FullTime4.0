// IMPORTAR LIBRERIAS
import * as moment from 'moment';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, Validators, FormGroup } from '@angular/forms';

// IMPORTACION DE SERVICIOS
import { HorarioService } from 'src/app/servicios/catalogos/catHorarios/horario.service';
import { FeriadosService } from 'src/app/servicios/catalogos/catFeriados/feriados.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { PlanGeneralService } from 'src/app/servicios/planGeneral/plan-general.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { EmpleadoHorariosService } from 'src/app/servicios/horarios/empleadoHorarios/empleado-horarios.service';
import { DetalleCatHorariosService } from 'src/app/servicios/horarios/detalleCatHorarios/detalle-cat-horarios.service';

@Component({
  selector: 'app-registo-empleado-horario',
  templateUrl: './registo-empleado-horario.component.html',
  styleUrls: ['./registo-empleado-horario.component.css'],
})

export class RegistoEmpleadoHorarioComponent implements OnInit {

  // VARIABLES QUE ALMACENAN SELECCION DE DIAS LIBRES
  lunes = false;
  martes = false;
  miercoles = false;
  jueves = false;
  viernes = false;
  sabado = false;
  domingo = false;

  // VARIABLE DE ALMACENAMIENTO
  horarios: any = [];
  feriados: any = [];

  // INICIALIZACIÓN DE CAMPOS DE FORMULARIOS
  fechaInicioF = new FormControl('', Validators.required);
  fechaFinalF = new FormControl('', [Validators.required]);
  miercolesF = new FormControl('');
  horarioF = new FormControl(0, [Validators.required]);
  viernesF = new FormControl('');
  domingoF = new FormControl('');
  martesF = new FormControl('');
  juevesF = new FormControl('');
  sabadoF = new FormControl('');
  lunesF = new FormControl('');

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    fechaInicioForm: this.fechaInicioF,
    fechaFinalForm: this.fechaFinalF,
    miercolesForm: this.miercolesF,
    horarioForm: this.horarioF,
    viernesForm: this.viernesF,
    domingoForm: this.domingoF,
    martesForm: this.martesF,
    juevesForm: this.juevesF,
    sabadoForm: this.sabadoF,
    lunesForm: this.lunesF,
  });

  constructor(
    public rest: EmpleadoHorariosService,
    public router: Router,
    public restH: HorarioService,
    public restE: EmpleadoService,
    public restP: PlanGeneralService,
    public restD: DetalleCatHorariosService,
    public validar: ValidacionesService,
    public ventana: MatDialogRef<RegistoEmpleadoHorarioComponent>,
    public feriado: FeriadosService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public datoEmpleado: any,
  ) { }

  ngOnInit(): void {
    this.BuscarHorarios();
    this.ObtenerEmpleado(this.datoEmpleado.idEmpleado);
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
            nombre: '(' + this.hora_entrada + '-' + this.hora_salida + ') ' + hor.codigo
          }]
          if (this.vista_horarios.length === 0) {
            this.vista_horarios = datos_horario;
          } else {
            this.vista_horarios = this.vista_horarios.concat(datos_horario);
          }
        }, error => {
          let datos_horario = [{
            id: hor.id,
            nombre: hor.codigo
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

  // METODO PARA VER LA INFORMACION DEL EMPLEADO 
  empleado: any = [];
  ObtenerEmpleado(idemploy: any) {
    this.empleado = [];
    this.restE.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleado = data;
    })
  }

  // METODO PARA VERIFICAR QUE CAMPOS DE FECHAS NO SE ENCUENTREN VACIOS
  VerificarIngresoFechas(form: any) {
    if (form.fechaInicioForm === '' || form.fechaInicioForm === null || form.fechaInicioForm === undefined ||
      form.fechaFinalForm === '' || form.fechaFinalForm === null || form.fechaFinalForm === undefined) {
      this.toastr.warning('Por favor ingrese fechas de inicio y fin de actividades.', '', {
        timeOut: 6000,
      });

      this.formulario.patchValue({
        horarioForm: 0
      })
    }
    else {
      this.ValidarFechas(form);
    }
  }

  // METODO PARA VERIFICAR SI EL EMPLEADO INGRESO CORRECTAMENTE LAS FECHAS
  ValidarFechas(form: any) {
    let datosBusqueda = {
      id_empleado: this.datoEmpleado.idEmpleado
    }

    // METODO PARA BUSCAR FECHA DE CONTRATO REGISTRADO EN FICHA DE EMPLEADO
    this.restE.BuscarFechaContrato(datosBusqueda).subscribe(response => {
      // VERIFICAR SI LAS FECHAS SON VALIDAS DE ACUERDO A LOS REGISTROS Y FECHAS INGRESADAS
      if (Date.parse(response[0].fec_ingreso.split('T')[0]) < Date.parse(form.fechaInicioForm)) {
        if (Date.parse(form.fechaInicioForm) <= Date.parse(form.fechaFinalForm)) {
          this.VerificarDuplicidad(form);
        }
        else {
          this.toastr.warning('Fecha de inicio de actividades debe ser mayor a la fecha fin de actividades.', '', {
            timeOut: 6000,
          });
          this.formulario.patchValue({
            horarioForm: 0
          })
        }
      }
      else {
        this.toastr.warning('Fecha de inicio de actividades no puede ser anterior a fecha de ingreso de contrato.', '', {
          timeOut: 6000,
        });
        this.formulario.patchValue({
          horarioForm: 0
        })
      }
    });
  }

  // VARIABLES USADAS PARA AUDITORIA
  data_nueva: any = [];
  // METODO PARA REGISTRAR DATOS DE HORARIO
  fechasHorario: any = [];
  inicioDate: any;
  finDate: any;
  InsertarEmpleadoHorario(form: any) {
    let datosempleH = {
      id_hora: 0,
      lunes: form.lunesForm,
      martes: form.martesForm,
      jueves: form.juevesForm,
      estado: 1,
      sabado: form.sabadoForm,
      codigo: this.empleado[0].codigo,
      domingo: form.domingoForm,
      viernes: form.viernesForm,
      miercoles: form.miercolesForm,
      fec_final: form.fechaFinalForm,
      fec_inicio: form.fechaInicioForm,
      id_horarios: form.horarioForm,
      id_empl_cargo: this.datoEmpleado.idCargo,
    };

    this.rest.IngresarEmpleadoHorarios(datosempleH).subscribe(response => {
      // METODO PARA AUDITAR TIMBRES
      this.data_nueva = [];
      this.data_nueva = datosempleH;
      this.validar.Auditar('app-web', 'empl_horarios', '', this.data_nueva, 'INSERT');
      this.IngresarPlanGeneral(form);
      this.CerrarVentana();
    });
  }

  // METODO PARA VERIFICAR DUPLICIDAD DE REGISTROS
  horarioExistentes: any = [];
  VerificarDuplicidad(form: any) {
    let fechas = {
      fechaInicio: form.fechaInicioForm,
      fechaFinal: form.fechaFinalForm,
      id_horario: form.horarioForm
    };
    this.rest.VerificarDuplicidadHorarios(this.datoEmpleado.idEmpleado, fechas).subscribe(existe => {
      this.toastr.info(
        'Fechas y horario seleccionado ya se encuentran registrados.',
        'Verificar la información ingresada.', {
        timeOut: 6000,
      });
      this.formulario.patchValue({
        horarioForm: 0
      })
    }, error => {
      this.BuscarFeriados(form);
      this.BuscarFeriadosRecuperar(form);
      this.ValidarHorarioByHorasTrabaja(form);
    });
  }

  // METODO PARA BUSCAR FERIADOS
  BuscarFeriados(form: any) {
    this.feriados = [];
    let datos = {
      fecha_inicio: form.fechaInicioForm,
      fecha_final: form.fechaFinalForm,
      id_empleado: parseInt(this.datoEmpleado.idEmpleado)
    }
    this.feriado.ListarFeriadosCiudad(datos).subscribe(data => {
      this.feriados = data;
    })
  }

  // METODO PARA BUSCAR FECHAS DE RECUPERACION DE FERIADOS
  recuperar: any = [];
  BuscarFeriadosRecuperar(form: any) {
    this.recuperar = [];
    let datos = {
      fecha_inicio: form.fechaInicioForm,
      fecha_final: form.fechaFinalForm,
      id_empleado: parseInt(this.datoEmpleado.idEmpleado)
    }
    this.feriado.ListarFeriadosRecuperarCiudad(datos).subscribe(data => {
      this.recuperar = data;
    })
  }

  // METODO DE INGRESO DE HORARIOS PLAN GENERAL
  detalles: any = [];
  IngresarPlanGeneral(form: any) {
    this.detalles = [];
    this.restD.ConsultarUnDetalleHorario(form.horarioForm).subscribe(res => {
      this.detalles = res;
      this.fechasHorario = []; // ARRAY QUE CONTIENE TODAS LAS FECHAS DEL MES INDICADO 
      this.inicioDate = moment(form.fechaInicioForm).format('MM-DD-YYYY');
      this.finDate = moment(form.fechaFinalForm).format('MM-DD-YYYY');
      // INICIALIZAR DATOS DE FECHA
      var start = new Date(this.inicioDate);
      var end = new Date(this.finDate);
      // LOGICA PARA OBTENER EL NOMBRE DE CADA UNO DE LOS DIA DEL PERIODO INDICADO
      while (start <= end) {
        this.fechasHorario.push(moment(start).format('YYYY-MM-DD'));
        var newDate = start.setDate(start.getDate() + 1);
        start = new Date(newDate);
      }
      var tipo: string = '';
      this.fechasHorario.map(obj => {
        // DEFINICION DE TIPO DE DIA SEGUN HORARIO
        tipo = 'N';
        var day = moment(obj).day();
        if (moment.weekdays(day) === 'lunes') {
          if (form.lunesForm === true) {
            tipo = 'L';
          }
        }
        if (moment.weekdays(day) === 'martes') {
          if (form.martesForm === true) {
            tipo = 'L';
          }
        }
        if (moment.weekdays(day) === 'miércoles') {
          if (form.miercolesForm === true) {
            tipo = 'L';
          }
        }
        if (moment.weekdays(day) === 'jueves') {
          if (form.juevesForm === true) {
            tipo = 'L';
          }
        }
        if (moment.weekdays(day) === 'viernes') {
          if (form.viernesForm === true) {
            tipo = 'L';
          }
        }
        if (moment.weekdays(day) === 'sábado') {
          if (form.sabadoForm === true) {
            tipo = 'L';
          }
        }
        if (moment.weekdays(day) === 'domingo') {
          if (form.domingoForm === true) {
            tipo = 'L';
          }
        }

        // BUSCAR FERIADOS 
        if (this.feriados.length != 0) {
          for (let i = 0; i < this.feriados.length; i++) {
            if (moment(this.feriados[i].fecha, 'YYYY-MM-DD').format('YYYY-MM-DD') === obj) {
              tipo = 'FD';
              break;
            }
          }
        }

        // BUSCAR FECHAS DE RECUPERACION DE FERIADOS
        if (this.recuperar.length != 0) {
          for (let j = 0; j < this.recuperar.length; j++) {
            if (moment(this.recuperar[j].fec_recuperacion, 'YYYY-MM-DD').format('YYYY-MM-DD') === obj) {
              tipo = 'N';
              break;
            }
          }
        }

        // COLOCAR DETALLE DE DIA SEGUN HORARIO
        this.detalles.map(element => {
          var accion = 0;
          var nocturno: number = 0;
          if (element.tipo_accion === 'E') {
            accion = element.minu_espera;
          }
          if (element.segundo_dia === true) {
            nocturno = 1;
          }
          else if (element.tercer_dia === true) {
            nocturno = 2;
          }
          else {
            nocturno = 0;
          }

          let plan = {
            tipo: tipo,
            estado: 1,
            codigo: this.empleado[0].codigo,
            id_horario: form.horarioForm,
            fec_horario: obj,
            id_empl_cargo: this.datoEmpleado.idCargo,
            id_det_horario: element.id,
            maxi_min_espera: accion,
            salida_otro_dia: nocturno,
            tipo_entr_salida: element.tipo_accion,
            fec_hora_horario: obj + ' ' + element.hora,
          };
          if (element.segundo_dia === true) {
            plan.fec_horario = moment(obj).add(1, 'd').format('YYYY-MM-DD');
            plan.fec_hora_horario = moment(obj).add(1, 'd').format('YYYY-MM-DD') + ' ' + element.hora;
          }
          if (element.tercer_dia === true) {
            plan.fec_horario = moment(obj).add(2, 'd').format('YYYY-MM-DD');
            plan.fec_hora_horario = moment(obj).add(2, 'd').format('YYYY-MM-DD') + ' ' + element.hora;
          }
          // REGISTRO DE PLAN GENERAL
          this.restP.CrearPlanGeneral(plan).subscribe(res => {
          })
        })
      })
      this.toastr.success('Operación exitosa.', 'Registro guardado.', {
        timeOut: 6000,
      });
    });
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.formulario.reset();
  }

  // METODO PARA CERRAR VENTANA DE SELECCION DE HORARIO
  CerrarVentana() {
    this.LimpiarCampos();
    this.ventana.close();
  }

  // METODO PARA VALIDAR HORAS DE TRABAJO SEGUN CONTRATO
  sumHoras: any;
  suma = '00:00:00';
  horariosEmpleado: any = []
  ValidarHorarioByHorasTrabaja(form: any) {
    const [obj_res] = this.horarios.filter(o => {
      return o.id === parseInt(form.horarioForm)
    })
    if (!obj_res) return this.toastr.warning('Horario no válido.');
    if (obj_res.detalle === false) {

    }
    else {
      const seg = this.datoEmpleado.horas_trabaja;
      const { hora_trabajo, id } = obj_res;

      // VERIFICACION DE FORMATO CORRECTO DE HORARIOS
      if (!this.StringTimeToSegundosTime(hora_trabajo)) {
        this.formulario.patchValue({ horarioForm: 0 });
        this.toastr.warning(
          'Formato de horas en horario seleccionado no son válidas.',
          'Dar click para verificar registro de detalle de horario.', {
          timeOut: 6000,
        }).onTap.subscribe(obj => {
          this.ventana.close();
          this.router.navigate(['/verHorario', id]);
        });
      }
      else {
        // METODO PARA LECTURA DE HORARIOS DE EMPLEADO
        this.horariosEmpleado = [];
        let fechas = {
          fechaInicio: form.fechaInicioForm,
          fechaFinal: form.fechaFinalForm,
        };
        this.rest.VerificarHorariosExistentes(this.datoEmpleado.idEmpleado, fechas).subscribe(existe => {
          this.horariosEmpleado = existe;
          this.horariosEmpleado.map(h => {
            console.log('ver horarios ', h)
            // SUMA DE HORAS DE CADA UNO DE LOS HORARIOS DEL EMPLEADO
            this.suma = moment(this.suma, 'HH:mm:ss').add(moment.duration(h.hora_trabajo)).format('HH:mm:ss');
          })
          console.log(this.suma, 'ver suma')
          // SUMA DE HORAS TOTALES DE HORARIO CON HORAS DE HORARIO SELECCIONADO
          this.sumHoras = moment(this.suma, 'HH:mm:ss').add(moment.duration(hora_trabajo)).format('HH:mm:ss');

          // METODO PARA COMPARAR HORAS DE TRABAJO CON HORAS DE CONTRATO
          if (this.StringTimeToSegundosTime(this.sumHoras) === this.StringTimeToSegundosTime(seg)) {
            return this.toastr.info('Va a cumplir un total de: ' + this.sumHoras + ' horas.')
          } else if (this.StringTimeToSegundosTime(this.sumHoras) < this.StringTimeToSegundosTime(seg)) {
            return this.toastr.info('Cumplirá un total de ' + this.sumHoras + ' horas.',
              'Recuerde que de acuerdo a su contrato debe cumplir un total de ' + seg + ' horas.', {
              timeOut: 6000,
            });
          }
          else {
            this.formulario.patchValue({ horarioForm: 0 });
            return this.toastr.warning('Esta registrando un total de ' + this.sumHoras + ' horas.',
              'Recuerde que de acuerdo a su contrato debe cumplir un total de ' + seg + ' horas.', {
              timeOut: 6000,
            });
          }
        }, error => {
          // METODO PARA COMPARAR HORAS DE TRABAJO CON HORAS DE CONTRATO CUANDO NO EXISTEN HORARIOS EN LAS FECHAS INDICADAS
          if (this.StringTimeToSegundosTime(hora_trabajo) === this.StringTimeToSegundosTime(seg)) {
            return this.toastr.info('Va a cumplir un total de: ' + hora_trabajo + ' horas.')
          } else if (this.StringTimeToSegundosTime(hora_trabajo) < this.StringTimeToSegundosTime(seg)) {
            return this.toastr.info('Cumplirá un total de ' + hora_trabajo + ' horas.',
              'Recuerde que de acuerdo a su contrato debe cumplir un total de ' + seg + ' horas.', {
              timeOut: 6000,
            });
          }
          else {
            this.formulario.patchValue({ horarioForm: 0 });
            return this.toastr.warning('El horario seleccionado indica un total de ' + hora_trabajo + ' horas.',
              'Recuerde que de acuerdo a su contrato debe cumplir un total de ' + seg + ' horas.', {
              timeOut: 6000,
            });
          }
        });
      }
    }
  }

  // METODO PARA FORMATEAR HORAS
  SegundosToStringTime(segundos: number) {
    let h: string | number = Math.floor(segundos / 3600);
    h = (h < 10) ? '0' + h : h;
    let m: string | number = Math.floor((segundos / 60) % 60);
    m = (m < 10) ? '0' + m : m;
    let s: string | number = segundos % 60;
    s = (s < 10) ? '0' + s : s;
    return h + ':' + m + ':' + s;
  }

  // METODO PARA SUMAR HORAS
  StringTimeToSegundosTime(stringTime: string) {
    const h = parseInt(stringTime.split(':')[0]) * 3600;
    const m = parseInt(stringTime.split(':')[1]) * 60;
    const s = parseInt(stringTime.split(':')[2]);
    return h + m + s
  }

  // METODO PARA LIMPIAR CAMPO SELECCION DE HORARIO
  LimpiarHorario() {
    this.formulario.patchValue({ horarioForm: 0 });
  }

}
