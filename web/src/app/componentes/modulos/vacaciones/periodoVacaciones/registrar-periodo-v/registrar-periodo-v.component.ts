
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

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
  fechaInicioF = new FormControl('', [Validators.required]);
  fechaFinF = new FormControl();
  fechaCargaF = new FormControl();  // FECHA DESDE LA QUE SE TIENE QUE EMPEZAR HACER LOS CALCULOS
  fechaActualizacionF = new FormControl();
  diasVacacionF = new FormControl(0, [Validators.required]);
  diasUsadosVacacionF = new FormControl(0, [Validators.required]);
  diaAntiguedadF = new FormControl(0, [Validators.required]);
  diasUsadosAntiguedadF = new FormControl(0, [Validators.required]);
  diaPerdidoF = new FormControl(0, [Validators.required]);
  fechaPerdidaF = new FormControl();
  estadoF = new FormControl('');

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public PerVacacionesForm = new FormGroup({
    observacionForm: this.observacionF,
    fechaInicioForm: this.fechaInicioF,
    fechaFinForm: this.fechaFinF,
    fechaCargaForm: this.fechaCargaF,
    fechaActualizacionForm: this.fechaActualizacionF,
    diasVacacionForm: this.diasVacacionF,
    diasUsadosVacacionForm: this.diasUsadosVacacionF,
    diaAntiguedadForm: this.diaAntiguedadF,
    diasUsadosAntiguedadForm: this.diasUsadosAntiguedadF,
    diaPerdidoForm: this.diaPerdidoF,
    fechaPerdidaForm: this.fechaPerdidaF,
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

    this.ObtenerContrato();
    this.PerVacacionesForm.patchValue({
      diasVacacionForm: 0,
      diasUsadosVacacionForm: 0,
      diaAntiguedadForm: 0,
      diasUsadosAntiguedadForm: 0,
      diaPerdidoForm: 0
    })
  }

  // METODO PARA VER LA INFORMACION DEL EMPLEADO
  datosContrato: any = [];
  ObtenerContrato() {
    this.datosContrato = [];
    this.rest.BuscarDatosContrato(this.datoEmpleado.idContrato).subscribe(data => {
      this.datosContrato = data;
      var fecha = new Date(String(data[0].fec_ingreso));
      this.PerVacacionesForm.patchValue({ fechaInicioForm: data[0].fec_ingreso });
      fecha.setMonth(fecha.getMonth() + parseInt(data[0].meses_periodo));
      this.PerVacacionesForm.patchValue({ fechaFinForm: fecha });
    })
  }

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

  InsertarPerVacacion(form: any) {
    let datosPerVacaciones = {
      id_empleado: this.datoEmpleado.idEmpleado,
      observacion: form.observacionForm,
      fecha_inicio: form.fechaInicioForm,
      fecha_final: form.fechaFinForm,
      fecha_carga: form.fechaCargaForm,
      fecha_actualizacion: form.fechaActualizacionForm,
      dias_vacacion: form.diasVacacionForm,
      dias_usados_vacacion: form.diasUsadosVacacionForm,
      dias_antiguedad: form.diaAntiguedadForm,
      dias_usados_antiguedad: form.diasUsadosAntiguedadForm,
      dias_perdido: form.diaPerdidoForm,
      fecha_perdida: form.fechaPerdidaForm,
      estado: true,
      user_name: this.user_name,
      ip: this.ip,
      ip_local: this.ips_locales,
    };
    console.log('ver periodo de vacaciones ', datosPerVacaciones);
    this.restV.CrearPerVacaciones(datosPerVacaciones).subscribe(response => {
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

  LimpiarCampos() {
    this.PerVacacionesForm.reset();
  }

  CerrarVentana() {
    this.LimpiarCampos();
    if (this.pagina === 'ver-empleado') {
      this.componentev.ObtenerPeriodoVacaciones(this.componentev.formato_fecha);
      this.componentev.registrar_periodo = false;
      this.componentev.ver_periodo = true;
    }

  }

  ObtenerMensajeErrorNombre() {
    if (this.observacionF.hasError('required')) {
      return 'Campo obligatorio';
    }
  }

  // METODO PARA REGISTRAR SOLO NUMEROS
  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }


  validarFecha(event: any) {
    this.PerVacacionesForm.patchValue({
      fechaFinForm: ''
    });
    // FORMATO ISO: "2025-06-11"
    const fecha = event.value.toISODate();
    // console.log('Fecha:', fecha);
    this.rest.BuscarDatosContrato(this.datoEmpleado.idContrato).subscribe(data => {
      // console.log('ver data ', data)
      if (Date.parse(data[0].fecha_ingreso.split('T')[0]) <= Date.parse(fecha)) {
        // SUMAR MESES DE PERIODO A LA FECHA
        const fechaModificada = event.value.plus({ months: data[0].mes_periodo });
        // RESTAMOS UN DIA A LA FECHA
        const fechaMenosUnDia = fechaModificada.minus({ days: 1 });
        //console.log('fecha menos un dia ', fechaMenosUnDia)
        this.PerVacacionesForm.patchValue({ fechaFinForm: fechaMenosUnDia.toISODate() });
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
