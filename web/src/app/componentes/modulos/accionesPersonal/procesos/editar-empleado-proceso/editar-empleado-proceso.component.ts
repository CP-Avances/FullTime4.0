import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { ToastrService } from 'ngx-toastr';

import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { EmpleadoProcesosService } from 'src/app/servicios/empleado/empleadoProcesos/empleado-procesos.service';
import { ProcesoService } from 'src/app/servicios/catalogos/catProcesos/proceso.service';

@Component({
  selector: 'app-editar-empleado-proceso',
  templateUrl: './editar-empleado-proceso.component.html',
  styleUrls: ['./editar-empleado-proceso.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
  ]
})

export class EditarEmpleadoProcesoComponent implements OnInit {

  empleados: any = [];
  procesos: any = [];

  nombreEmpleado = new FormControl('', [Validators.required]);
  fechaInicio = new FormControl('', Validators.required);
  fechaFinal = new FormControl('', Validators.required);
  idProcesoF = new FormControl('', Validators.required);

  public EmpleProcesoForm = new FormGroup({
    fecInicioForm: this.fechaInicio,
    fecFinalForm: this.fechaFinal,
    nombreEmpleadoForm: this.nombreEmpleado,
    idProcesoForm: this.idProcesoF
  });

  constructor(
    private rest: EmpleadoService,
    private restP: EmpleadoProcesosService,
    private restPro: ProcesoService,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<EditarEmpleadoProcesoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.ObtenerEmpleados(this.data.idEmpleado);
    this.ObtenerProcesos();
    this.ImprimirDatos();
  }

  // metodo para ver la informacion del empleado 
  ObtenerEmpleados(idemploy: any) {
    this.empleados = [];
    this.rest.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleados = data;
      console.log(this.empleados)
      this.EmpleProcesoForm.patchValue({
        nombreEmpleadoForm: this.empleados[0].nombre + ' ' + this.empleados[0].apellido,
      })
    })
  }

  ObtenerProcesos() {
    this.procesos = [];
    this.restPro.getProcesosRest().subscribe(data => {
      this.procesos = data;
    });
  }

  ImprimirDatos() {
    this.EmpleProcesoForm.patchValue({
      fecInicioForm: this.data.datosProcesos.fec_inicio,
      fecFinalForm: this.data.datosProcesos.fec_final,
      idProcesoForm: this.data.datosProcesos.id
    })
  }

  ValidarDatosProeso(form: any) {
    if (Date.parse(form.fecInicioForm) < Date.parse(form.fecFinalForm)) {
      this.InsertarProceso(form);
    }
    else {
      this.toastr.info('La fecha de finalización debe ser mayor a la fecha de inicio','', {
        timeOut: 6000,
      })
    }
  }

  InsertarProceso(form: any) {
    let datosProceso = {
      id_p: this.data.datosProcesos.id_p,
      id_empl_cargo: this.data.datosProcesos.id_empl_cargo,
      fec_inicio: form.fecInicioForm,
      fec_final: form.fecFinalForm,
      id: form.idProcesoForm
    };
    console.log("datos cambiados", datosProceso);
    this.restP.ActualizarUnProceso(datosProceso).subscribe(response => {
      this.toastr.success('Operación exitosa.', 'Proceso del Empleado actualizado', {
        timeOut: 6000,
      })
      this.CerrarVentanaRegistroProceso();
    }, error => {
      this.toastr.error('Ups!!! algo salio mal.', 'Registro Inválido', {
        timeOut: 6000,
      })
    });
  }

  LimpiarCampos() {
    this.EmpleProcesoForm.reset();
  }

  CerrarVentanaRegistroProceso() {
    this.LimpiarCampos();
    this.dialogRef.close();
    //window.location.reload();
  }

  Salir() {
    this.LimpiarCampos();
    this.dialogRef.close();
  }

}
