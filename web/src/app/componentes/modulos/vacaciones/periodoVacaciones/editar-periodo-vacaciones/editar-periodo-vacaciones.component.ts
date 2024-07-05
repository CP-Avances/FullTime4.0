import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import * as moment from 'moment';

import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { PeriodoVacacionesService } from 'src/app/servicios/periodoVacaciones/periodo-vacaciones.service';
import { VerEmpleadoComponent } from 'src/app/componentes/empleado/ver-empleado/ver-empleado.component';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';


@Component({
  selector: 'app-editar-periodo-vacaciones',
  templateUrl: './editar-periodo-vacaciones.component.html',
  styleUrls: ['./editar-periodo-vacaciones.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
  ]
})

export class EditarPeriodoVacacionesComponent implements OnInit {

  @Input() data: any;
  @Input() pagina: any;

  // Datos del empleado
  empleados: any = [];
  periodoDatos: any = [];

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  nombreEmpleadoF = new FormControl('', [Validators.required]);
  descripcionF = new FormControl('', [Validators.required, Validators.minLength(4)]);
  diaVacacionF = new FormControl('', [Validators.required]);
  horaVacacionF = new FormControl('', [Validators.required]);
  minVacacionF = new FormControl('', [Validators.required]);
  diaAntiguedadF = new FormControl('', [Validators.required]);
  estadoF = new FormControl('', [Validators.required]);
  fechaFinF = new FormControl();
  fechaInicioF = new FormControl('', [Validators.required]);
  diaPerdidoF = new FormControl('', [Validators.required]);

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public PerVacacionesForm = new FormGroup({
    nombreEmpleadoForm: this.nombreEmpleadoF,
    descripcionForm: this.descripcionF,
    diaVacacionForm: this.diaVacacionF,
    horaVacacionForm: this.horaVacacionF,
    minVacacionForm: this.minVacacionF,
    diaAntiguedadForm: this.diaAntiguedadF,
    estadoForm: this.estadoF,
    fechaFinForm: this.fechaFinF,
    fechaInicioForm: this.fechaInicioF,
    diaPerdidoForm: this.diaPerdidoF
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
    //console.log('ver data ', this.data)
    this.ObtenerEmpleados(this.data.idEmpleado);
    this.ImprimirDatos();
  }

  // METODO PARA VER LA INFORMACION DEL EMPLEADO
  ObtenerEmpleados(idemploy: any) {
    this.empleados = [];
    this.rest.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleados = data;
      console.log(this.empleados)
      this.PerVacacionesForm.patchValue({
        nombreEmpleadoForm: this.empleados[0].nombre + ' ' + this.empleados[0].apellido,
      })
    })
  }

  ImprimirDatos() {
    this.PerVacacionesForm.patchValue({
      descripcionForm: this.data.datosPeriodo.descripcion,
      diaVacacionForm: this.data.datosPeriodo.dia_vacacion,
      diaAntiguedadForm: this.data.datosPeriodo.dia_antiguedad,
      estadoForm: this.data.datosPeriodo.estado,
      fechaFinForm: this.data.datosPeriodo.fecha_final,
      fechaInicioForm: this.data.datosPeriodo.fecha_inicio,
      diaPerdidoForm: this.data.datosPeriodo.dia_perdido,
      horaVacacionForm: this.data.datosPeriodo.horas_vacaciones,
      minVacacionForm: this.data.datosPeriodo.minutos_vacaciones,
    });
    console.log("estado", this.data.datosPeriodo.estado)
  }

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

  ActualizarPerVacacion(form: any) {
    let datosPerVacaciones = {
      id: this.data.datosPeriodo.id,
      id_empl_contrato: this.data.datosPeriodo.id_empleado_contrato,
      descripcion: form.descripcionForm,
      dia_vacacion: form.diaVacacionForm,
      dia_antiguedad: form.diaAntiguedadForm,
      estado: form.estadoForm,
      fec_inicio: form.fechaInicioForm,
      fec_final: form.fechaFinForm,
      dia_perdido: form.diaPerdidoForm,
      horas_vacaciones: form.horaVacacionForm,
      min_vacaciones: form.minVacacionForm,
      user_name: this.user_name,
      ip: this.ip,
    };
    console.log('ver dara ', datosPerVacaciones)
    this.restV.ActualizarPeriodoV(datosPerVacaciones).subscribe(response => {
      this.toastr.success('Operación exitosa.', 'Período de Vacaciones actualizado', {
        timeOut: 6000,
      })
      this.CerrarVentana();
    }, error => {
      this.toastr.error('Ups!!! algo salio mal.', 'Período de Vacaciones no fue actualizado', {
        timeOut: 6000,
      })
    });
  }

  LimpiarCampos() {
    this.PerVacacionesForm.reset();
  }

  CerrarVentana() {
    this.LimpiarCampos();
    if (this.pagina === 'ver-empleado') {
      this.componentev.ObtenerPeriodoVacaciones(this.componentev.formato_fecha);
      this.componentev.editar_periodo = false;
      this.componentev.ver_periodo = true;
    }
  }

  ObtenerMensajeErrorNombre() {
    if (this.descripcionF.hasError('required')) {
      return 'Campo obligatorio';
    }
  }

  // METODO PARA INGRESAR SOLO NUMEROS
  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

  dInicio: any;
  validarFecha(event) {
    this.PerVacacionesForm.patchValue({
      fechaFinForm: ''
    });
    this.dInicio = event.value._i;
    var fecha = new Date(String(moment(this.dInicio)));
    var ingreso = String(moment(fecha, "YYYY/MM/DD").format("YYYY-MM-DD"));
    this.rest.BuscarDatosContrato(this.data.datosPeriodo.id_empl_contrato).subscribe(data => {
      if (Date.parse(data[0].fecha_ingreso.split('T')[0]) <= Date.parse(ingreso)) {
        fecha.setMonth(fecha.getMonth() + parseInt(data[0].meses_periodo));
        this.PerVacacionesForm.patchValue({ fechaFinForm: fecha });
      }
      else {
        this.PerVacacionesForm.patchValue({ fechaInicioForm: '' });
        this.toastr.info('La fecha de inicio de periodo no puede ser anterior a la fecha de ingreso de contrato.', '', {
          timeOut: 6000,
        });
      }
    })
  }


}
