import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';

import { AutorizacionService } from 'src/app/servicios/autorizacion/autorizacion.service';
import { DepartamentosService } from 'src/app/servicios/catalogos/catDepartamentos/departamentos.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';
import { VacacionesService } from 'src/app/servicios/vacaciones/vacaciones.service';

interface Orden {
  valor: number
}

interface Estado {
  id: number,
  nombre: string
}

@Component({
  selector: 'app-vacacion-autorizaciones',
  templateUrl: './vacacion-autorizaciones.component.html',
  styleUrls: ['./vacacion-autorizaciones.component.css']
})
export class VacacionAutorizacionesComponent implements OnInit {

  // idDocumento = new FormControl('', Validators.required);
  TipoDocumento = new FormControl('');
  orden = new FormControl(0, Validators.required);
  estado = new FormControl(0, Validators.required);
  idCatNotificacion = new FormControl('', Validators.required);
  idCatNotiAutorizacion = new FormControl('', Validators.required);
  idDepartamento = new FormControl('');

  public nuevaAutorizacionesForm = new FormGroup({
    // idDocumentoF: this.idDocumento,
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

  id_empleado_loggin: number;
  FechaActual: any;
  NotifiRes: any;

  constructor(
    public restAutorizaciones: AutorizacionService,
    public restDepartamento: DepartamentosService,
    private realTime: RealTimeService,
    private restV: VacacionesService,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<VacacionAutorizacionesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    console.log(this.data, 'data_vacaciones');
    this.id_empleado_loggin = parseInt(localStorage.getItem('empleado') as string);
    var f = moment();
    this.FechaActual = f.format('YYYY-MM-DD');
    this.obtenerDepartamento();
  }

  insertarAutorizacion(form) {
    if (this.data.carga === 'multiple') {
      this.data.datosVacacion.map(obj => {
        if (obj.estado === 'Pre-autorizado') {
          this.restV.BuscarDatosAutorizacion(obj.id).subscribe(data => {
            var documento = data[0].empleado_estado;
            this.restDepartamento.ConsultarDepartamentoPorContrato(obj.id_cargo).subscribe(res => {
              this.departamentos = res;
              this.ActualizarDatos(form, documento, obj.id, this.departamentos[0].id_departamento, obj.id_emple_solicita);
            })
          })
        }
        else {
          this.restDepartamento.ConsultarDepartamentoPorContrato(obj.id_cargo).subscribe(res => {
            this.departamentos = res;
            this.IngresarDatos(form, obj.id, this.departamentos[0].id_departamento, obj.id_emple_solicita);
          })
        }
      })
    }
    else if (this.data.carga === undefined) {
      this.IngresarDatos(form, this.data.id, form.idDepartamentoF, this.data.id_empleado);
    }
  }

  IngresarDatos(form, id_vacacion: number, id_departamento: number, empleado_solicita: number) {
    // Arreglo de datos para ingresar una autorización
    let newAutorizaciones = {
      orden: form.ordenF,
      estado: form.estadoF,
      id_departamento: id_departamento,
      id_permiso: null,
      id_vacacion: id_vacacion,
      id_hora_extra: null,
      id_documento: localStorage.getItem('empleado') as string + '_' + form.estadoF + ',',
      id_plan_hora_extra: null,
    }
    this.restAutorizaciones.postAutorizacionesRest(newAutorizaciones).subscribe(res => {
      this.EditarEstadoVacacion(form, id_vacacion, empleado_solicita, id_departamento);
    }, error => { })
  }

  ActualizarDatos(form, documento, id_vacacion: number, id_departamento: number, empleado_solicita: number) {
    // Arreglo de datos para actualizar la autorización de acuerdo al permiso
    let newAutorizacionesM = {
      id_documento: documento + localStorage.getItem('empleado') as string + '_' + form.estadoF + ',',
      estado: form.estadoF,
      id_vacacion: id_vacacion,
    }
    /*  this.restAutorizaciones.PutEstadoAutoVacacion(newAutorizacionesM).subscribe(resA => {
        this.EditarEstadoVacacion(form, id_vacacion, empleado_solicita, id_departamento);
      })*/
  }

  resVacacion: any = [];
  contador: number = 0;
  EditarEstadoVacacion(form, id_vacacion, id_empleado, id_departamento) {
    let datosVacacion = {
      estado: form.estadoF,
      id_vacacion: id_vacacion,
      id_rece_emp: id_empleado,
      id_depa_send: id_departamento
    }
    this.restV.ActualizarEstado(id_vacacion, datosVacacion).subscribe(respon => {
      this.resVacacion = respon
      console.log(this.resVacacion);
      var f = new Date();
      var estado_letras: string = '';
      if (form.estadoF === 1) {
        estado_letras = 'Pendiente';
      }
      else if (form.estadoF === 2) {
        estado_letras = 'Pre-autorizado';
      }
      else if (form.estadoF === 3) {
        estado_letras = 'Autorizado';
      }
      else if (form.estadoF === 4) {
        estado_letras = 'Negado';
      }
      let notificacion = {
        id: null,
        id_send_empl: this.id_empleado_loggin,
        id_receives_empl: id_empleado,
        id_receives_depa: id_departamento,
        estado: estado_letras,
        create_at: `${this.FechaActual}T${f.toLocaleTimeString()}.000Z`,
        id_vacaciones: id_vacacion,
        id_permiso: null
      }
      this.realTime.IngresarNotificacionEmpleado(notificacion).subscribe(res => {
        this.NotifiRes = res;
        console.log(this.NotifiRes);
        notificacion.id = this.NotifiRes._id;
        if (this.NotifiRes._id > 0 && this.resVacacion.notificacion === true) {
          this.restV.EnviarNotificacionRealTime(notificacion);
        }
      });
    });
    console.log('contador', this.contador);
    this.contador = this.contador + 1;
    if (this.data.carga === 'multiple') {
      console.log('arreglo', this.data.datosVacacion.length);
      if (this.contador === this.data.datosVacacion.length) {
        this.toastr.success('Operación Exitosa', 'Se autorizo un total de ' + this.data.datosVacacion.length + ' solicitudes de vacaciones.', {
          timeOut: 6000,
        });
        console.log('idpermiso', 'entra');
        this.dialogRef.close();
      }
    }
    else {
      this.dialogRef.close();
    }
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
      this.restDepartamento.ConsultarDepartamentoPorContrato(this.data.id_empl_cargo).subscribe(res => {
        this.departamentos = res;
        this.nuevaAutorizacionesForm.patchValue({
          ordenF: 1,
          estadoF: 2,
          idDepartamentoF: this.departamentos[0].id_departamento
        })
      })
    }
  }

  limpiarCampos() {
    this.nuevaAutorizacionesForm.reset();
  }
}
