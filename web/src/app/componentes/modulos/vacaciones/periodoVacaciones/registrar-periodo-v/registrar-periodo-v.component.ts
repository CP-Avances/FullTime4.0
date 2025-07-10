
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { DateTime } from 'luxon';

import { PeriodoVacacionesService } from 'src/app/servicios/modulos/modulo-vacaciones/periodoVacaciones/periodo-vacaciones.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';

import { VerEmpleadoComponent } from 'src/app/componentes/usuarios/empleados/datos-empleado/ver-empleado/ver-empleado.component';

@Component({
  selector: 'app-registrar-periodo-v',
  standalone: false,
  templateUrl: './registrar-periodo-v.component.html',
  styleUrls: ['./registrar-periodo-v.component.css'],
})

export class RegistrarPeriodoVComponent implements OnInit {
  ips_locales: any = '';

  @Input() datoEmpleado: any;
  @Input() pagina: string = '';

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  observacionF = new FormControl('', [Validators.required, Validators.minLength(4)]);
  fechaAcreditarF = new FormControl();
  fechaInicioF = new FormControl('', [Validators.required]);
  fechaFinF = new FormControl();
  fechaCargaF = new FormControl();  // FECHA DESDE LA QUE SE TIENE QUE EMPEZAR HACER LOS CALCULOS
  fechaActualizacionF = new FormControl();
  diasIncialesF = new FormControl(0);
  diasVacacionF = new FormControl(0, [Validators.required]);
  diasUsadosVacacionF = new FormControl(0);
  diasCargadosF = new FormControl(0);
  saldoTransferidoF = new FormControl(0);
  fechaPerdidaF = new FormControl();
  diaPerdidoF = new FormControl(0);
  diaAntiguedadF = new FormControl(0);
  diasUsadosAntiguedadF = new FormControl(0);
  observacionAntiguedadF = new FormControl('');
  estadoF = new FormControl('');

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public PerVacacionesForm = new FormGroup({
    observacionForm: this.observacionF,
    fechaInicioForm: this.fechaInicioF,
    fechaFinForm: this.fechaFinF,
    fechaCargaForm: this.fechaCargaF,
    fechaActualizacionForm: this.fechaActualizacionF,
    fechaAcreditarForm: this.fechaAcreditarF,
    diasCargadosForm: this.diasCargadosF,
    diasInicialesForm: this.diasIncialesF,
    diasVacacionForm: this.diasVacacionF,
    diasUsadosVacacionForm: this.diasUsadosVacacionF,
    fechaPerdidaForm: this.fechaPerdidaF,
    diaPerdidoForm: this.diaPerdidoF,
    diaAntiguedadForm: this.diaAntiguedadF,
    diasUsadosAntiguedadForm: this.diasUsadosAntiguedadF,
    observacionAntiguedadForm: this.observacionAntiguedadF,
    saldoTransferidoForm: this.saldoTransferidoF,
    estadoForm: this.estadoF,
  });

  constructor(
    private rest: EmpleadoService,
    private restV: PeriodoVacacionesService,
    private toastr: ToastrService,
    public validar: ValidacionesService,
    public componentev: VerEmpleadoComponent,
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });

    // INICIALIZACION DE FECHA Y MOSTRAR EN FORMULARIO
    var f = DateTime.now();
    var FechaActual = f.toFormat("yyyy-MM-dd");

    this.ObtenerContrato();
    this.PerVacacionesForm.patchValue({
      fechaActualizacionForm: FechaActual,
      diasUsadosAntiguedadForm: 0,
      diasUsadosVacacionForm: 0,
      saldoTransferidoForm: 0,
      diaAntiguedadForm: 0,
      diasInicialesForm: 0,
      diasVacacionForm: 0,
      diasCargadosForm: 0,
      diaPerdidoForm: 0,
    })
  }

  // METODO PARA VER LA INFORMACION DEL EMPLEADO
  datosContrato: any = [];
  ObtenerContrato() {
    this.datosContrato = [];
    this.rest.BuscarDatosContrato(this.datoEmpleado.idContrato).subscribe(data => {
      this.datosContrato = data;
      //console.log(' contrato ', this.datosContrato)
      var fecha = new Date(String(data[0].fecha_ingreso));
      // METODO PARA OBTENER FECHAS PERIODO
      this.ObtenerFechaPeriodo(fecha, parseInt(data[0].meses_calculo), parseInt(data[0].mes_periodo), 1);
    })
  }

  // METODO PARA VERIFICAR FECHAS DE PERIODO
  ObtenerFechaPeriodo(fecha: any, meses_calculo: any, mes_periodo: any, opcion: number) {
    //console.log('fecha ', fecha)
    var fecha_inicio = fecha;
    if (opcion === 1) {
      this.PerVacacionesForm.patchValue({ fechaInicioForm: fecha });
      fecha_inicio = DateTime.fromJSDate(fecha);
    }

    const fecha_actual = DateTime.now();

    // EXTRAEMOS SOLO MES Y DÍA
    const diaInicio = fecha_inicio.day;
    const mesInicio = fecha_inicio.month;
    const anioInicio = fecha_inicio.year;

    const diaHoy = fecha_actual.day;
    const mesHoy = fecha_actual.month;
    const anioHoy = fecha_actual.year;

    let fecha_fin: any;
    let acreditar: any;
    let nuevo_inicio: any;

    if (mesInicio === mesHoy && diaInicio === diaHoy && anioInicio === anioHoy) {
      // ES HOY
      console.log('ES HOY');
      fecha_fin = fecha_inicio.plus({ months: meses_calculo });
      acreditar = fecha_inicio.plus({ months: mes_periodo });
    }
    else if (mesInicio === mesHoy && diaInicio === diaHoy) {
      // MISMO DIA Y MES
      console.log('MISMO DIA Y MES');
      nuevo_inicio = fecha_actual;
      fecha_fin = nuevo_inicio.plus({ months: meses_calculo });
      acreditar = nuevo_inicio.plus({ months: mes_periodo });
      this.PerVacacionesForm.patchValue({ fechaInicioForm: nuevo_inicio });
    }
    else if (mesInicio < mesHoy || (mesInicio === mesHoy && diaInicio < diaHoy)) {
      // YA PASO
      console.log('YA PASO')
      nuevo_inicio = fecha_inicio.set({ year: anioHoy });
      fecha_fin = nuevo_inicio.plus({ months: (meses_calculo) });
      acreditar = nuevo_inicio.plus({ months: (mes_periodo) });
      this.PerVacacionesForm.patchValue({ fechaInicioForm: nuevo_inicio });
    }
    else {
      // AUN NO PASA
      console.log('AUN NO PASA')
      fecha_fin = fecha_inicio.plus({ months: meses_calculo });
      acreditar = fecha_inicio.plus({ months: mes_periodo });
    }
    this.PerVacacionesForm.patchValue({ fechaFinForm: fecha_fin, fechaAcreditarForm: acreditar });

    //console.log('fecha ', fecha_fin, 'acreditar ', acreditar)
  }

  // METODO PARA VALIDAR LAS FECHAS DE INICIO Y FIN DE PERIODO
  ValidarDatosPerVacacion(form: any) {
    if (form.fechaFinForm === '') {
      form.fechaFinForm = null;
      this.InsertarPerVacacion(form);
    } else {
      if (Date.parse(form.fechaInicioForm) < Date.parse(form.fechaFinForm)) {
        this.InsertarPerVacacion(form);
      }
      else {
        this.toastr.info('La fecha de finalización de período debe ser mayor a la fecha de inicio de período', '', {
          timeOut: 6000,
        })
      }
    }
  }

  // METODO PARA INSERTAR LOS DATOS EN LA BASE DE DATOS
  InsertarPerVacacion(form: any) {
    let periodo = {
      id_empleado: this.datoEmpleado.idEmpleado,
      observacion: form.observacionForm,
      fecha_inicio: form.fechaInicioForm,
      fecha_final: form.fechaFinForm,
      fecha_carga: form.fechaCargaForm,
      fecha_actualizacion: form.fechaActualizacionForm,
      fecha_acreditar: form.fechaAcreditarForm,
      dias_cargados: form.diasCargadosForm,
      dias_iniciales: form.diasInicialesForm,
      dias_vacacion: form.diasVacacionForm,
      dias_usados_vacacion: form.diasUsadosVacacionForm,
      fecha_perdida: form.fechaPerdidaForm,
      dias_perdido: form.diaPerdidoForm,
      tomar_antiguedad: false,
      dias_antiguedad: form.diaAntiguedadForm,
      dias_usados_antiguedad: form.diasUsadosAntiguedadForm,
      observacion_antiguedad: form.observacionAntiguedadForm,
      transferido: form.saldoTransferidoForm,
      estado: true,
      user_name: this.user_name,
      ip_local: this.ips_locales,
      ip: this.ip,
    };
    if (periodo.transferido === 0) {
      periodo.dias_iniciales = periodo.dias_vacacion;
    }
    if (periodo.dias_usados_antiguedad != 0) {
      periodo.tomar_antiguedad = true;
    }
    console.log('ver periodo de vacaciones ', periodo);
    this.restV.CrearPerVacaciones(periodo).subscribe(response => {
      this.toastr.success('Operación exitosa.', 'Período de Vacaciones registrado.', {
        timeOut: 6000,
      })
      this.CerrarVentana();
    }, error => {
      this.toastr.error('Ups! algo salio mal.', 'Período de Vacaciones no fue registrado.', {
        timeOut: 6000,
      })
    });

  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.PerVacacionesForm.reset();
  }

  // METODO PARA CERRAR EL FORMULARIO
  CerrarVentana() {
    this.LimpiarCampos();
    if (this.pagina === 'ver-empleado') {
      this.componentev.ObtenerPeriodoVacaciones(this.componentev.formato_fecha);
      this.componentev.registrar_periodo = false;
      this.componentev.ver_periodo = true;
    }
  }

  // METODO PARA REGISTRAR SOLO NUMEROS
  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

  // METODO PARA VALIDAR FECHAS CON EL CONTRATO DEL EMPLEADO
  validarFecha(event: any) {
    this.PerVacacionesForm.patchValue({
      fechaFinForm: ''
    });
    // FORMATO ISO: "2025-06-11"
    const fecha = event.value.toISODate();
    // console.log('Fecha:', fecha);
    if (Date.parse(this.datosContrato[0].fecha_ingreso.split('T')[0]) <= Date.parse(fecha)) {
      // VERIFICAR FECHAS DE PERIODO
      this.ObtenerFechaPeriodo(event.value, this.datosContrato[0].meses_calculo, this.datosContrato[0].mes_periodo, 2);
    }
    else {
      this.PerVacacionesForm.patchValue({ fechaInicioForm: '' });
      this.toastr.info('La fecha de inicio de periodo no puede ser anterior a la fecha de ingreso de contrato.', '', {
        timeOut: 6000,
      });
    }
  }

}
