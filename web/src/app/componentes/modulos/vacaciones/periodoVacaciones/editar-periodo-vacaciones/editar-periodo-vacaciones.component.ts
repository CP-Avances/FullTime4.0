import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ToastrService } from 'ngx-toastr';
import { DateTime } from 'luxon';

import { PeriodoVacacionesService } from 'src/app/servicios/modulos/modulo-vacaciones/periodoVacaciones/periodo-vacaciones.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';

import { VerEmpleadoComponent } from 'src/app/componentes/usuarios/empleados/datos-empleado/ver-empleado/ver-empleado.component';

@Component({
  selector: 'app-editar-periodo-vacaciones',
  standalone: false,
  templateUrl: './editar-periodo-vacaciones.component.html',
  styleUrls: ['./editar-periodo-vacaciones.component.css'],
})

export class EditarPeriodoVacacionesComponent implements OnInit {
  ips_locales: any = '';

  @Input() data: any;
  @Input() pagina: any;

  // DATOS DEL EMPLEADO
  empleados: any = [];
  periodoDatos: any = [];

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  observacionF = new FormControl('', [Validators.required, Validators.minLength(4)]);
  fechaInicioF = new FormControl('', [Validators.required]);
  fechaFinF = new FormControl();
  fechaCargaF = new FormControl();  // FECHA DESDE LA QUE SE TIENE QUE EMPEZAR HACER LOS CALCULOS
  fechaActualizacionF = new FormControl();
  fechaAcreditarF = new FormControl();
  diasCargadosF = new FormControl(0);
  diasIncialesF = new FormControl(0);
  diasVacacionF = new FormControl(0, [Validators.required, Validators.pattern(/^[-]?\d+(\.\d+)?$/)]);
  fechaPerdidaF = new FormControl();
  diaPerdidoF = new FormControl(0, Validators.pattern(/^[-]?\d+(\.\d+)?$/));
  tomarAntiguedadF = new FormControl(false);
  diaAntiguedadF = new FormControl(0, Validators.pattern(/^[-]?\d+(\.\d+)?$/));
  diasUsadosVacacionF = new FormControl(0, Validators.pattern(/^[-]?\d+(\.\d+)?$/));
  observacionAntiguedadF = new FormControl('');
  diasUsadosAntiguedadF = new FormControl(0, Validators.pattern(/^[-]?\d+(\.\d+)?$/));
  saldoTransferidoF = new FormControl(0);
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
    tomarAntiguedadForm: this.tomarAntiguedadF,
    diaAntiguedadForm: this.diaAntiguedadF,
    diasUsadosAntiguedadForm: this.diasUsadosAntiguedadF,
    observacionAntiguedadForm: this.observacionAntiguedadF,
    diaPerdidoForm: this.diaPerdidoF,
    fechaPerdidaForm: this.fechaPerdidaF,
    saldoTransferidoForm: this.saldoTransferidoF,
    estadoForm: this.estadoF,
  });

  constructor(
    private rest: EmpleadoService,
    private restV: PeriodoVacacionesService,
    private toastr: ToastrService,
    public componentev: VerEmpleadoComponent,
    public validar: ValidacionesService,

  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });
    console.log('ver data ', this.data)
    // INICIALIZACION DE FECHA Y MOSTRAR EN FORMULARIO
    var f = DateTime.now();
    var FechaActual = f.toFormat("yyyy-MM-dd");
    this.ImprimirDatos();
    this.PerVacacionesForm.patchValue({
      fechaActualizacionForm: FechaActual,
    })
  }

  // METODO PARA IMPRIMIR DATOS EN EL FORMULARIO
  ImprimirDatos() {
    this.PerVacacionesForm.patchValue({
      observacionForm: this.data.datosPeriodo.observacion,
      fechaInicioForm: this.data.datosPeriodo.fecha_inicio,
      fechaFinForm: this.data.datosPeriodo.fecha_final,
      fechaCargaForm: this.data.datosPeriodo.fecha_desde,
      fechaActualizacionForm: this.data.datosPeriodo.fecha_ultima_actualizacion,
      diasVacacionForm: this.data.datosPeriodo.dias_vacacion,
      diasUsadosVacacionForm: this.data.datosPeriodo.usados_dias_vacacion,
      diaPerdidoForm: this.data.datosPeriodo.dias_perdidos,
      tomarAntiguedadForm: this.data.datosPeriodo.tomar_antiguedad,
      diaAntiguedadForm: this.data.datosPeriodo.dias_antiguedad,
      diasUsadosAntiguedadForm: this.data.datosPeriodo.usados_antiguedad,
      observacionAntiguedadForm: this.data.datosPeriodo.observacion_antiguedad,
      estadoForm: this.data.datosPeriodo.estado,
      fechaPerdidaForm: this.data.datosPeriodo.fecha_inicio_perdida,
      saldoTransferidoForm: this.data.datosPeriodo.saldo_transferido,
      diasCargadosForm: this.data.datosPeriodo.dias_cargados,
      diasInicialesForm: this.data.datosPeriodo.dias_iniciales,
      fechaAcreditarForm: this.data.datosPeriodo.fecha_acreditar_vacaciones,
    });
    if (this.data.datosPeriodo.tomar_antiguedad === true) {
      this.ver_antiguedad = true;
    }
    console.log("estado", this.data.datosPeriodo.estado)
  }

  // METODO PARA INGRESAR DIAS DE ANTIGUEDAD
  ver_antiguedad: boolean = false;
  ActivarAntiguedad(ob: MatCheckboxChange) {
    if (ob.checked === true) {
      this.ver_antiguedad = true;
    }
    else {
      this.ver_antiguedad = false;
    }
  }

  // METODO PARA MARCAR COMO DIAS ADICIONALES
  adicionales: boolean = false;
  MarcarDiasAdicionales(evento: MatCheckboxChange) {
    if (evento.checked === true) {
      this.adicionales = true;
    }
    else {
      this.adicionales = false;
    }
  }

  // VALIDAR FECHAS DE INCIO Y FIN DE PERIODO
  ValidarDatosPerVacacion(form: any) {
    if (form.fechaFinForm === '') {
      form.fechaFinForm = null;
      this.ActualizarPerVacacion(form);
    } else {
      if (Date.parse(form.fechaInicioForm) < Date.parse(form.fechaFinForm)) {
        this.ActualizarPerVacacion(form);
      }
      else {
        this.toastr.info('La fecha de finalización de período debe ser mayor a la fecha de inicio de período', '', {
          timeOut: 6000,
        })
      }
    }
  }

  // METODO DE ACTUALIZACION DEL PERIODO DE VACACIONES
  ActualizarPerVacacion(form: any) {
    let datosPerVacaciones = {
      id: this.data.datosPeriodo.id,
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
      tomar_antiguedad: form.tomarAntiguedadForm,
      dias_antiguedad: form.diaAntiguedadForm,
      dias_usados_antiguedad: form.diasUsadosAntiguedadForm,
      observacion_antiguedad: form.observacionAntiguedadForm,
      transferido: form.saldoTransferidoForm,
      estado: form.estadoForm,
      user_name: this.user_name,
      ip: this.ip,
      ip_local: this.ips_locales,
    };
    if (this.adicionales === true) {
      datosPerVacaciones.dias_iniciales = datosPerVacaciones.dias_vacacion;
    }
    console.log('ver data ', datosPerVacaciones)
    this.restV.ActualizarPeriodoV(datosPerVacaciones).subscribe(response => {
      this.toastr.success('Operación exitosa.', 'Período de Vacaciones actualizado', {
        timeOut: 6000,
      })
      this.CerrarVentana();
    }, error => {
      this.toastr.error('Ups! algo salio mal.', 'Período de Vacaciones no fue actualizado', {
        timeOut: 6000,
      })
    });
  }

  // METOOD PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.PerVacacionesForm.reset();
  }

  // METODO PARA CERRAR VENTANA
  CerrarVentana() {
    this.LimpiarCampos();
    if (this.pagina === 'ver-empleado') {
      this.componentev.ObtenerPeriodoVacaciones(this.componentev.formato_fecha);
      this.componentev.editar_periodo = false;
      this.componentev.ver_periodo = true;
    }
  }

  // METODO PARA INGRESAR SOLO NUMEROS
  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

  // METODO PARA VALIDAR FECHAS
  validarFecha(event: any) {
    this.PerVacacionesForm.patchValue({
      fechaFinForm: ''
    });
    // FORMATO ISO: "2025-06-11"
    const fecha = event.value.toISODate();
    this.rest.BuscarDatosContrato(this.data.idContrato).subscribe(data => {
      if (Date.parse(data[0].fecha_ingreso.split('T')[0]) <= Date.parse(fecha)) {
        // VERIFICAR FECHAS DE PERIODO
        this.ObtenerFechaPeriodo(event.value, data[0].meses_calculo, data[0].mes_periodo);
      }
      else {
        this.PerVacacionesForm.patchValue({ fechaInicioForm: '' });
        this.toastr.info('La fecha de inicio de periodo no puede ser anterior a la fecha de ingreso de contrato.', '', {
          timeOut: 6000,
        });
      }
    })
  }

  // METODO PARA VERIFICAR FECHAS DE PERIODO
  ObtenerFechaPeriodo(fecha: any, meses_calculo: any, mes_periodo: any) {
    console.log('fecha ', fecha)
    var fecha_inicio = fecha;
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
      var anio_actual = fecha_inicio.set({ year: anioHoy });
      nuevo_inicio = anio_actual.minus({ years: 1 });
      fecha_fin = nuevo_inicio.plus({ months: meses_calculo });
      acreditar = nuevo_inicio.plus({ months: mes_periodo });
      this.PerVacacionesForm.patchValue({ fechaInicioForm: nuevo_inicio });
    }
    this.PerVacacionesForm.patchValue({ fechaFinForm: fecha_fin, fechaAcreditarForm: acreditar });
    //console.log('fecha ', fecha_fin, 'acreditar ', acreditar)
  }


}
