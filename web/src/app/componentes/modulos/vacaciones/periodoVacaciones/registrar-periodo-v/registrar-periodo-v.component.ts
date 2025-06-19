
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

  // Datos del empleado
  empleados: any = [];

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  nombreEmpleadoF = new FormControl('', [Validators.required]);
  descripcionF = new FormControl('', [Validators.required, Validators.minLength(4)]);
  diaVacacionF = new FormControl(0, [Validators.required]);
  horaVacacionF = new FormControl(0, [Validators.required]);
  minVacacionF = new FormControl(0, [Validators.required]);
  diaAntiguedadF = new FormControl(0, [Validators.required]);
  estadoF = new FormControl('', [Validators.required]);
  fechaFinF = new FormControl();
  fechaInicioF = new FormControl('', [Validators.required]);
  diaPerdidoF = new FormControl(0, [Validators.required]);

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
    public validar: ValidacionesService,
    public componentev: VerEmpleadoComponent,
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });

    this.ObtenerEmpleados(this.datoEmpleado.idEmpleado);
    this.ObtenerContrato();
    this.PerVacacionesForm.patchValue({
      diaVacacionForm: 0,
      horaVacacionForm: 0,
      minVacacionForm: 0,
      diaAntiguedadForm: 0,
      diaPerdidoForm: 0
    })
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
      id_empl_contrato: this.datoEmpleado.idContrato,
      descripcion: form.descripcionForm,
      dia_vacacion: form.diaVacacionForm,
      dia_antiguedad: form.diaAntiguedadForm,
      estado: form.estadoForm,
      fec_inicio: form.fechaInicioForm,
      fec_final: form.fechaFinForm,
      dia_perdido: form.diaPerdidoForm,
      horas_vacaciones: form.horaVacacionForm,
      min_vacaciones: form.minVacacionForm,
      id_empleado: this.empleados[0].id,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
    };
    this.restV.CrearPerVacaciones(datosPerVacaciones).subscribe(response => {
      this.toastr.success('Operación exitosa.', 'Período de Vacaciones registrado', {
        timeOut: 6000,
      })
      this.CerrarVentana();
    }, error => {
      this.toastr.error('Ups! algo salio mal.', 'Período de Vacaciones no fue registrado', {
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
    if (this.descripcionF.hasError('required')) {
      return 'Campo obligatorio';
    }
  }

  // METODO PARA REGISTRAR SOLO NUMEROS
  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

  dInicio: any;
  validarFecha(event: any) {
    this.PerVacacionesForm.patchValue({
      fechaFinForm: ''
    });
    this.dInicio = event.value._i;
    var fecha = this.dInicio.toISOString();
    var ingreso = DateTime.fromFormat(fecha, 'yyyy/MM/dd').toFormat('yyyy-MM-dd');
    this.rest.BuscarDatosContrato(this.datoEmpleado.idContrato).subscribe(data => {
      //console.log('ver data ', data)
      if (Date.parse(data[0].fecha_ingreso.split('T')[0]) <= Date.parse(ingreso)) {
        if (data[0].descripcion === 'CODIGO DE TRABAJO') {
          fecha.setMonth(fecha.getMonth() + 12);
          this.PerVacacionesForm.patchValue({ fechaFinForm: fecha });
        }
        else if (data[0].descripcion === 'LOSEP') {
          fecha.setMonth(fecha.getMonth() + 11);
          this.PerVacacionesForm.patchValue({ fechaFinForm: fecha });
        }
        else if (data[0].descripcion === 'LOES') {
          fecha.setMonth(fecha.getMonth() + 11);
          this.PerVacacionesForm.patchValue({ fechaFinForm: fecha });
        }
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
