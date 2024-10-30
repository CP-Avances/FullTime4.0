import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { EmpleadoProcesosService } from 'src/app/servicios/empleado/empleadoProcesos/empleado-procesos.service';
import { ProcesoService } from 'src/app/servicios/catalogos/catProcesos/proceso.service';

@Component({
  selector: 'app-editar-empleado-proceso',
  templateUrl: './editar-empleado-proceso.component.html',
  styleUrls: ['./editar-empleado-proceso.component.css'],
})

export class EditarEmpleadoProcesoComponent implements OnInit {

  empleados: any = [];
  procesos: any = [];

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

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
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

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
    this.restPro.ConsultarProcesos().subscribe(data => {
      this.procesos = data;
    });
  }

  ImprimirDatos() {
    this.EmpleProcesoForm.patchValue({
      fecInicioForm: this.data.datosProcesos.fecha_inicio,
      fecFinalForm: this.data.datosProcesos.fecha_final,
      idProcesoForm: this.data.datosProcesos.id_proceso
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
      id_p: this.data.datosProcesos.id_proceso,
      id_empleado_cargo: this.data.datosProcesos.id_empleado_cargo,
      fec_inicio: form.fecInicioForm,
      fec_final: form.fecFinalForm,
      id: this.data.datosProcesos.id,
      id_proceso: form.idProcesoForm,
      user_name: this.user_name,
      ip: this.ip,
    };
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
