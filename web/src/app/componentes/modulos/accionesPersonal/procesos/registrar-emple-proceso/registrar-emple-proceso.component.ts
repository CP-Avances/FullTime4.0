
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { ProcesoService } from 'src/app/servicios/modulos/modulo-acciones-personal/catProcesos/proceso.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { EmpleadoProcesosService } from 'src/app/servicios/modulos/modulo-acciones-personal/empleadoProcesos/empleado-procesos.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';

@Component({
  selector: 'app-registrar-emple-proceso',
  templateUrl: './registrar-emple-proceso.component.html',
  styleUrls: ['./registrar-emple-proceso.component.css'],
})

export class RegistrarEmpleProcesoComponent implements OnInit {

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
    nombreEmpleadoForm: this.nombreEmpleado,
    fecInicioForm: this.fechaInicio,
    idProcesoForm: this.idProcesoF,
    fecFinalForm: this.fechaFinal,
  });

  constructor(
    private restPro: ProcesoService,
    private toastr: ToastrService,
    private restP: EmpleadoProcesosService,
    private rest: EmpleadoService,
    public ventana: MatDialogRef<RegistrarEmpleProcesoComponent>,
    public validar: ValidacionesService,
    @Inject(MAT_DIALOG_DATA) public datoEmpleado: any
  ) { }

  ngOnInit(): void {
    this.ObtenerEmpleados(this.datoEmpleado.idEmpleado);
    this.ObtenerProcesos();
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
  }

  // METODO PARA VER LA INFORMACION DEL EMPLEADO
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
      id_empl_cargo: this.datoEmpleado.idCargo,
      id_empleado: this.datoEmpleado.idEmpleado,
      fec_inicio: form.fecInicioForm,
      fec_final: form.fecFinalForm,
      id: form.idProcesoForm,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
    };
    this.restP.RegistrarEmpleProcesos(datosProceso).subscribe(response => {
      this.toastr.success('Operación exitosa.', 'Período de Procesos del Empleado registrados', {
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
    this.ventana.close();
  }

}
