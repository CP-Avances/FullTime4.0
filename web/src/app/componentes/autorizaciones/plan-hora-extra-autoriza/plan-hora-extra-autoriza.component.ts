import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { DepartamentosService } from 'src/app/servicios/catalogos/catDepartamentos/departamentos.service';
import { AutorizacionService } from 'src/app/servicios/autorizacion/autorizacion.service';
import { PlanHoraExtraService } from 'src/app/servicios/planHoraExtra/plan-hora-extra.service';
import { use } from 'echarts';

interface Orden {
  valor: number
}

interface Estado {
  id: number,
  nombre: string
}

@Component({
  selector: 'app-plan-hora-extra-autoriza',
  templateUrl: './plan-hora-extra-autoriza.component.html',
  styleUrls: ['./plan-hora-extra-autoriza.component.css']
})
export class PlanHoraExtraAutorizaComponent implements OnInit {

  idDocumento = new FormControl('');
  TipoDocumento = new FormControl('');
  orden = new FormControl(0, Validators.required);
  estado = new FormControl(0, Validators.required);
  idDepartamento = new FormControl('');

  public nuevaAutorizacionesForm = new FormGroup({
    idDocumentoF: this.idDocumento,
    ordenF: this.orden,
    estadoF: this.estado,
    idDepartamentoF: this.idDepartamento
  });

  departamentos: any = [];

  ordenes: Orden[] = [
    { valor: 1 },
    { valor: 2 },
    { valor: 3 },
    { valor: 4 },
    { valor: 5 }
  ];

  estados: Estado[] = [
    //{ id: 1, nombre: 'Pendiente' },
    { id: 2, nombre: 'Pre-autorizado' },
    { id: 3, nombre: 'Autorizado' },
    { id: 4, nombre: 'Negado' },
  ];

  id_user_loggin: number;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    public restAutorizaciones: AutorizacionService,
    public restDepartamento: DepartamentosService,
    public restPlanH: PlanHoraExtraService,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<PlanHoraExtraAutorizaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    console.log('datos, planificacion', this.data);
    this.id_user_loggin = parseInt(localStorage.getItem("empleado") as string);
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.obtenerDepartamento();
  }

  insertarAutorizacion(form: any) {
    if (this.data.carga === 'multiple') {
      this.data.datosHora.map(obj => {
        if (obj.estado === 'Pre-autorizado') {
          this.restPlanH.BuscarDatosAutorizacion(obj.id).subscribe(data => {
            var documento = data[0].empleado_estado;
            this.restDepartamento.ConsultarDepartamentoPorContrato(obj.id_cargo).subscribe(res => {
              this.departamentos = res;
              this.ActualizarDatos(form, documento, obj.id_plan_extra, this.departamentos[0].id_departamento, obj.id_usua_solicita);
            })
          }, err => {
            const { access, message } = err.error.message;
            if (access === false) {
              this.toastr.error(message)
              this.dialogRef.close();
            }
          })
        }
        else {
          this.restDepartamento.ConsultarDepartamentoPorContrato(obj.id_cargo).subscribe(res => {
            this.departamentos = res;
            this.IngresarDatos(form, obj.id_plan_extra, this.departamentos[0].id_departamento, obj.id_usua_solicita);
          })
        }
      })
    }
    else {
      this.IngresarDatos(form, this.data.datosHora.id_plan_extra, form.idDepartamentoF, this.data.datosHora.empl_id);
    }
  }

  IngresarDatos(form, id_hora: number, id_departamento: number, empleado_solicita: number) {
    // Arreglo de datos para ingresar una autorización
    let newAutorizaciones = {
      orden: form.ordenF,
      estado: form.estadoF,
      id_departamento: id_departamento,
      id_permiso: null,
      id_vacacion: null,
      id_hora_extra: null,
      id_plan_hora_extra: id_hora,
      id_documento: localStorage.getItem('empleado') as string + '_' + form.estadoF + ',',
      user_name: this.user_name,
      ip: this.ip
    }
    this.restAutorizaciones.postAutorizacionesRest(newAutorizaciones).subscribe(res => {
      this.toastr.success('Operación exitosa.', 'Autorizacion guardada', {
        timeOut: 6000,
      });
      this.EditarEstadoPlan(id_hora, id_departamento, empleado_solicita, form.estadoF);
      if (form.estadoF === 3) {
        this.NotificarPlanificacion(empleado_solicita);
      }
      this.limpiarCampos();
      this.dialogRef.close();
    }, error => { })
  }

  ActualizarDatos(form, documento, id_hora: number, id_departamento: number, empleado_solicita: number) {
    // Arreglo de datos para actualizar la autorización de acuerdo al permiso
    let newAutorizacionesM = {
      id_documento: documento + localStorage.getItem('empleado') as string + '_' + form.estadoF + ',',
      estado: form.estadoF,
      id_plan_hora_extra: id_hora,
      user_name: this.user_name,
      ip: this.ip
    }
    this.restAutorizaciones.PutEstadoAutoPermisoMultiple(newAutorizacionesM).subscribe(resA => {
      this.toastr.success('Operación exitosa.', 'Autorización Guardada', {
        timeOut: 6000,
      });
      this.EditarEstadoPlan(id_hora, id_departamento, empleado_solicita, form.estadoF);
      if (form.estadoF === 3) {
        this.NotificarPlanificacion(empleado_solicita);
      }
      this.limpiarCampos();
      this.dialogRef.close();
    })
  }

  Habilitado: boolean = true;
  obtenerDepartamento() {
    if (this.data.carga === 'multiple') {
      this.nuevaAutorizacionesForm.patchValue({
        ordenF: 1,
        estadoF: 2,
      });
      this.Habilitado = false;
    }
    else {
      this.restDepartamento.ConsultarDepartamentoPorContrato(this.data.datosHora.id_empl_cargo).subscribe(res => {
        console.log('entra departamento', res);
        this.departamentos = res;
        this.nuevaAutorizacionesForm.patchValue({
          ordenF: 1,
          estadoF: 2,
          idDepartamentoF: this.departamentos[0].id_departamento
        })
      })
    }
  }

  resEstado: any = [];
  EditarEstadoPlan(id_hora, id_departamento, usuario_solicita, estado_hora) {
    let datosHorasExtras = {
      estado: estado_hora,
      user_name: this.user_name,
      ip: this.ip
    }
    this.restPlanH.EditarEstado(id_hora, datosHorasExtras).subscribe(res => {
      this.resEstado = [res];
    }, err => {
      const { access, message } = err.error.message;
      if (access === false) {
        this.toastr.error(message)
        this.dialogRef.close();
      }
    })
  }

  NotificarPlanificacion(id_empleado_recibe) {
    let mensaje = {
      id_empl_envia: this.id_user_loggin,
      id_empl_recive: id_empleado_recibe,
      mensaje: 'Horas Extras realizadas Autorizadas'
    }
    //console.log(mensaje);
    //// no sirve cambiar
    this.restPlanH.EnviarCorreoPlanificacion(mensaje).subscribe(res => {
      console.log(res.message);
      this.toastr.success(res.message,'', {
        timeOut: 6000,
      });
    }, err => {
      const { access, message } = err.error.message;
      if (access === false) {
        this.toastr.error(message)
        this.dialogRef.close();
      }
    })
  }

  limpiarCampos() {
    this.nuevaAutorizacionesForm.reset();
  }

}
