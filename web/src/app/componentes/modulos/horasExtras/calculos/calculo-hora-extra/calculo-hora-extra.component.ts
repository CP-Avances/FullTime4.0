import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

import { HorasExtrasService } from 'src/app/servicios/catalogos/catHorasExtras/horas-extras.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';

interface tipoDia {
  value: number;
  viewValue: string;
}

@Component({
  selector: 'app-calculo-hora-extra',
  templateUrl: './calculo-hora-extra.component.html',
  styleUrls: ['./calculo-hora-extra.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
  ]
})
export class CalculoHoraExtraComponent implements OnInit {

  // Control de campos y validaciones del formulario

  nombreEmpleadoF = new FormControl('');
  seleccionarHoraF = new FormControl('', [Validators.required]);
  horaInicioF = new FormControl('');
  horaFinF = new FormControl('', [Validators.required]);
  horaInicioTF = new FormControl('');
  horaFinTF = new FormControl('', [Validators.required]);
  horasF = new FormControl('', [Validators.required]);
  horasRealesF = new FormControl('', [Validators.required]);
  tipoF = new FormControl('', [Validators.required]);
  horasPermisoF = new FormControl('', [Validators.required]);
  estadoF = new FormControl('', [Validators.required]);
  fechaRealizadasF = new FormControl('', [Validators.required]);

  public PedirHoraExtraForm = new FormGroup({
    nombreEmpleadoForm: this.nombreEmpleadoF,
    seleccionarHoraForm: this.seleccionarHoraF,
    horaInicioForm: this.horaInicioF,
    horaFinForm: this.horaFinF,
    horaInicioTForm: this.horaInicioTF,
    horaFinTForm: this.horaFinTF,
    horasForm: this.horasF,
    horasRealesForm: this.horasRealesF,
    tipoForm: this.tipoF,
    horasPermisoForm: this.horasPermisoF,
    estadoForm: this.estadoF,
    fechaRealizadasForm: this.fechaRealizadasF
  });

  FechaActual: any;
  horasExtras: any = [];
  tipoD: tipoDia[] = [
    { value: 1, viewValue: 'Normal' },
    { value: 2, viewValue: 'Libre' },
    { value: 3, viewValue: 'Feriado' }
  ];

  constructor(
    private rest: HorasExtrasService,
    private toastr: ToastrService,
    private validacionesService: ValidacionesService
  ) { }

  ngOnInit(): void {
    this.ObtenerHorasExtras();
  }

  ObtenerHorasExtras() {
    this.horasExtras = [];
    this.rest.ListarHorasExtras().subscribe(datos => {
      this.horasExtras = datos;
    }, err => {
      this.toastr.info('Registros no encontrados','', {
        timeOut: 6000,
      })
      return this.validacionesService.RedireccionarHomeAdmin(err.error) 
    });
  }

  insertarTipoPermiso(form) {
    let dataHoraExtra = {
      id_hora_extr_pedido: 1,
      id_empl_cargo: 1,
      id_usuario: 1,
      estado: form.estadoForm,
      id_hora_extra: form.seleccionarHoraForm,
      hora_ini_planificacion: form.horaInicioForm,
      hora_fin_planificacion: form.horaFinForm,
      hora_ini_timbre: form.horaInicioTForm,
      hora_fin_timbre: form.horaFinTForm,
      hora_numero: form.horasRealesForm,
      hora_limite:form.horasForm,
      fecha: form.fechaRealizadasForm,
      tipo_dia: form.tipoForm,
      id_horario: 1,
      hora_permiso: form.horasPermisoForm
    }

  }

  IngresarDatos(datos) {
    /* this.rest.RegistrarTipoPermiso(datos).subscribe(res => {
       this.toastr.success('Operación Exitosa', 'Tipo Permiso guardado', {
        timeOut: 6000,
      });
       window.location.reload();
     }, err => {
      return this.validacionesService.RedireccionarHomeAdmin(err.error) 
    });*/
  }

  IngresarSoloLetras(e) {
    return this.validacionesService.IngresarSoloLetras(e)
  }

  IngresarSoloNumeros(evt) {
    return this.validacionesService.IngresarSoloNumeros(evt)
  }

}
