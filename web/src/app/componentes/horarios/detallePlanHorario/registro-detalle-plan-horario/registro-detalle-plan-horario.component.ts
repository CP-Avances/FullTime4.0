import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import * as moment from 'moment';

import { DetallePlanHorarioService } from 'src/app/servicios/horarios/detallePlanHorario/detalle-plan-horario.service';
import { HorarioService } from 'src/app/servicios/catalogos/catHorarios/horario.service';
import { DetalleCatHorariosService } from 'src/app/servicios/horarios/detalleCatHorarios/detalle-cat-horarios.service';
import { PlanGeneralService } from 'src/app/servicios/planGeneral/plan-general.service';


interface Dia {
  value: number;
  viewValue: string;
}

@Component({
  selector: 'app-registro-detalle-plan-horario',
  templateUrl: './registro-detalle-plan-horario.component.html',
  styleUrls: ['./registro-detalle-plan-horario.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
  ]
})

export class RegistroDetallePlanHorarioComponent implements OnInit {

  horarios: any = [];

  dia: Dia[] = [
    { value: 1, viewValue: 'Libre' },
    { value: 2, viewValue: 'Feriado' },
    { value: 3, viewValue: 'Normal' }
  ];

  tipoDia = new FormControl('', Validators.required);
  fechaF = new FormControl('', [Validators.required]);
  horarioF = new FormControl('', [Validators.required]);

  // Asignación de validaciones a inputs del formulario
  public DetallePlanHorarioForm = new FormGroup({
    fechaForm: this.fechaF,
    tipoDiaForm: this.tipoDia,
    horarioForm: this.horarioF
  });
  constructor(
    public rest: DetallePlanHorarioService,
    public restH: HorarioService,
    public restD: DetalleCatHorariosService,
    public restP: PlanGeneralService,
    private toastr: ToastrService,
    private router: Router,
    public dialogRef: MatDialogRef<RegistroDetallePlanHorarioComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.BuscarHorarios();
  }

  detalles_horarios: any = [];
  vista_horarios: any = [];
  hora_entrada: any;
  hora_salida: any;
  BuscarHorarios() {
    this.horarios = [];
    this.vista_horarios = [];
    this.restH.BuscarListaHorarios().subscribe(datos => {
      this.horarios = datos;

      this.horarios.map(hor => {

        this.restD.ConsultarUnDetalleHorario(hor.id).subscribe(res => {
          this.detalles_horarios = res;

          this.detalles_horarios.map(det => {
            if (det.tipo_accion === 'E') {
              this.hora_entrada = det.hora
            }
            if (det.tipo_accion === 'S') {
              this.hora_salida = det.hora
            }
          })
          let datos_horario = [{
            id: hor.id,
            nombre: hor.nombre + ' (' + this.hora_entrada + '-' + this.hora_salida + ')'
          }]
          if (this.vista_horarios.length === 0) {
            this.vista_horarios = datos_horario;
          } else {
            this.vista_horarios = this.vista_horarios.concat(datos_horario);
            console.log('datos horario', this.vista_horarios)
          }
        }, error => {
          let datos_horario = [{
            id: hor.id,
            nombre: hor.nombre
          }]
          if (this.vista_horarios.length === 0) {
            this.vista_horarios = datos_horario;
          } else {
            this.vista_horarios = this.vista_horarios.concat(datos_horario);
            console.log('datos horario', this.vista_horarios)
          }
        })
      })
    })
  }

  ValidarRegistro(form) {
    var fin = this.data.planHorario.fec_final.split('T')[0];
    var inicio = this.data.planHorario.fec_inicio.split('T')[0];
    var ingreso = String(moment(form.fechaForm, "YYYY/MM/DD").format("YYYY-MM-DD"));
    if ((Date.parse(fin) >= Date.parse(ingreso)) &&
      (Date.parse(inicio) <= Date.parse(ingreso))) {
      this.InsertarDetallePlanHorario(form);
    }
    else {
      this.toastr.info('La fecha de inicio de actividades no se encuentra dentro de la planificación registrada.', '', {
        timeOut: 6000,
      });
    }
  }

  InsertarDetallePlanHorario(form) {
    let datosBusqueda = {
      id_plan_horario: this.data.planHorario.id,
      fecha: form.fechaForm,
      id_horario: form.horarioForm
    }
    this.rest.VerificarDuplicidad(datosBusqueda).subscribe(response => {
      this.toastr.info('Se le recuerda que esta fecha ya se encuentra en la lista de detalles.', '', {
        timeOut: 6000,
      })
    }, error => {
      let datosDetallePlanH = {
        fecha: form.fechaForm,
        id_plan_horario: this.data.planHorario.id,
        tipo_dia: form.tipoDiaForm,
        id_cg_horarios: form.horarioForm,
      };
      this.rest.RegistrarDetallesPlanHorario(datosDetallePlanH).subscribe(response => {
        this.IngresarPlanGeneral(form);
        this.CerrarVentanaDetallePlanHorario();
      }, error => { });
    });
  }

  detalles: any = [];
  IngresarPlanGeneral(form) {
    this.detalles = [];
    this.restD.ConsultarUnDetalleHorario(form.horarioForm).subscribe(res => {
      this.detalles = res;
      this.detalles.map(element => {
        var accion = 0;
        if (element.tipo_accion === 'E') {
          accion = element.minu_espera;
        }
        let plan = {
          fec_hora_horario: moment(form.fechaForm).format('YYYY-MM-DD') + ' ' + element.hora,
          tolerancia: accion,
          estado: null,
          id_det_horario: element.id,
          fec_horario: form.fechaForm,
          id_empl_cargo: this.data.planHorario.id_cargo,
          tipo_entr_salida: element.tipo_accion,
          codigo: this.data.planHorario.codigo,
          id_horario: form.horarioForm
        };
        this.restP.CrearPlanGeneral(plan).subscribe(res => {
        })
      })
      this.toastr.success('Operación Exitosa', 'Detalle de Planificación de Horario registrado', {
        timeOut: 6000,
      });
    });
  }

  LimpiarCampos() {
    this.DetallePlanHorarioForm.reset();
  }

  CerrarVentanaDetallePlanHorario() {
    this.LimpiarCampos();
    this.dialogRef.close();
    if (this.data.actualizarPage === false && this.data.direccionarE === false) {
      this.router.navigate(['/verDetalles/', this.data.planHorario.id, this.data.idEmpleado]);
    }
    if (this.data.actualizarPage === false && this.data.direccionarE === true) {
      this.router.navigate(['/horarioRotativo/', this.data.planHorario.id, this.data.idEmpleado]);
    }
  }

  VerificarDetalles(form) {
    this.restD.ConsultarUnDetalleHorario(form.horarioForm).subscribe(res => {
    },
      erro => {
        this.DetallePlanHorarioForm.patchValue({
          horarioForm: ''
        });
        this.toastr.info('El horario seleccionado no tienen registros de detalle de horario.', 'Primero registrar detalle de horario.', {
          timeOut: 6000,
        });
      })
  }

  Salir() {
    this.LimpiarCampos();
    this.dialogRef.close();
  }

}
