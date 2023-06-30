import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

import { PlanHorarioService } from 'src/app/servicios/horarios/planHorario/plan-horario.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';

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
    public dialogRef: MatDialogRef<EditarPlanificacionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.CargarDatos();
    console.log('imprimir', this.data)
  }

  ValidarDatosPlanHorario(form) {
    let datosBusqueda = {
      id_cargo: this.data.datosPlan.id_cargo,
      id_empleado: this.data.idEmpleado
    }
    this.restE.BuscarFechaContrato(datosBusqueda).subscribe(response => {
      if (Date.parse(response[0].fec_ingreso.split('T')[0]) < Date.parse(form.fechaIngresoForm)) {
        if (Date.parse(form.fechaIngresoForm) < Date.parse(form.fechaSalidaForm)) {
          this.InsertarPlanHorario(form);
        }
        else {
          this.toastr.info('La fecha de salida no debe ser anterior a la fecha de ingreso','', {
            timeOut: 6000,
          })
        }
      }
      else {
        this.toastr.info('La fecha de inicio de actividades no puede ser anterior a la fecha de ingreso de contrato.','', {
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
    this.rest.VerificarDuplicidadPlanEdicion(this.data.datosPlan.id, this.data.datosPlan.codigo, fechas).subscribe(response => {
      this.toastr.info('Las fechas ingresadas ya se encuentran dentro de otra planificación.','', {
        timeOut: 6000,
      });
    }, error => {
      let datosPlanHorario = {
        id_cargo: this.data.datosPlan.id_cargo,
        fec_inicio: form.fechaIngresoForm,
        fec_final: form.fechaSalidaForm,
        id: this.data.datosPlan.id
      };
      this.rest.ActualizarDatos(datosPlanHorario).subscribe(response => {
        console.log('prueba actualizacopn', response)
        this.toastr.success('Operación exitosa.', 'Planificación de Horario actualizada', {
          timeOut: 6000,
        })
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

  CargarDatos() {
    this.PlanHorarioForm.patchValue({
      fechaIngresoForm: this.data.datosPlan.fec_inicio,
      fechaSalidaForm: this.data.datosPlan.fec_final,
    })
  }

}
