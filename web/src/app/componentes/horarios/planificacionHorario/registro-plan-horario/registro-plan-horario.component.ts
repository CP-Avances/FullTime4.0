import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';

import { PlanHorarioService } from 'src/app/servicios/horarios/planHorario/plan-horario.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';

@Component({
  selector: 'app-registro-plan-horario',
  templateUrl: './registro-plan-horario.component.html',
  styleUrls: ['./registro-plan-horario.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
  ]
})

export class RegistroPlanHorarioComponent implements OnInit {

  // Control de campos y validaciones del formulario
  fechaIngresoF = new FormControl('', [Validators.required]);
  fechaSalidaF = new FormControl('', [Validators.required]);

  // Asignación de validaciones a inputs del formulario
  public PlanHorarioForm = new FormGroup({
    fechaIngresoForm: this.fechaIngresoF,
    fechaSalidaForm: this.fechaSalidaF,
  });

  constructor(
    public rest: PlanHorarioService,
    public restE: EmpleadoService,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<RegistroPlanHorarioComponent>,
    @Inject(MAT_DIALOG_DATA) public datoEmpleado: any
  ) { }

  ngOnInit(): void {
    this.ObtenerEmpleado(this.datoEmpleado.idEmpleado);
  }

  empleado: any = [];
  // METODO para ver la información del empleado 
  ObtenerEmpleado(idemploy: any) {
    this.empleado = [];
    this.restE.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleado = data;
      console.log('empleado', this.empleado)
    })
  }

  ValidarDatosPlanHorario(form) {
    let datosBusqueda = {
      id_cargo: this.datoEmpleado.idCargo,
      id_empleado: this.datoEmpleado.idEmpleado
    }
    this.restE.BuscarFechaContrato(datosBusqueda).subscribe(response => {
      console.log('fecha', response[0].fec_ingreso.split('T')[0], ' ', Date.parse(form.fechaIngresoForm), Date.parse(response[0].fec_ingreso.split('T')[0]))
      if (Date.parse(response[0].fec_ingreso.split('T')[0]) < Date.parse(form.fechaIngresoForm)) {
        if (Date.parse(form.fechaIngresoForm) < Date.parse(form.fechaSalidaForm)) {
          this.InsertarPlanHorario(form);
        }
        else {
          this.toastr.info('La fecha de salida no debe ser anterior a la fecha de ingreso', '', {
            timeOut: 6000,
          })
        }
      }
      else {
        this.toastr.info('La fecha de inicio de actividades no puede ser anterior a la fecha de ingreso de contrato.', '', {
          timeOut: 6000,
        });
      }
    }, error => { });
  }

  InsertarPlanHorario(form) {
    let fechas = {
      fechaInicio: form.fechaIngresoForm,
      fechaFinal: form.fechaSalidaForm,
    };
    this.rest.VerificarDuplicidadPlan(fechas, this.empleado[0].codigo).subscribe(response => {
      this.toastr.info('Las fechas ingresadas ya se encuentran dentro de otra planificación.', '', {
        timeOut: 6000,
      });
    }, error => {
      let datosPlanHorario = {
        id_cargo: this.datoEmpleado.idCargo,
        fec_inicio: form.fechaIngresoForm,
        fec_final: form.fechaSalidaForm,
        codigo: this.empleado[0].codigo
      };
      this.rest.RegistrarPlanHorario(datosPlanHorario).subscribe(response => {
        this.toastr.success('Operación Exitosa', 'Planificación de Horario registrado', {
          timeOut: 6000,
        });
        this.CerrarVentanaPlanHorario();
      }, error => { });
    });
  }

  LimpiarCampos() {
    this.PlanHorarioForm.reset();
  }

  CerrarVentanaPlanHorario() {
    this.LimpiarCampos();
    this.dialogRef.close();
    // window.location.reload();
  }

}
