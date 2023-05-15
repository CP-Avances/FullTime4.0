import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { AutorizacionService } from 'src/app/servicios/autorizacion/autorizacion.service';
import { DepartamentosService } from 'src/app/servicios/catalogos/catDepartamentos/departamentos.service';
import { EmplCargosService } from 'src/app/servicios/empleado/empleadoCargo/empl-cargos.service';
import { PermisosService } from 'src/app/servicios/permisos/permisos.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';

interface Orden {
  valor: number
}

interface Estado {
  id: number,
  nombre: string
}

interface Documento {
  id: number,
  nombre: string
}

@Component({
  selector: 'app-autorizaciones',
  templateUrl: './autorizaciones.component.html',
  styleUrls: ['./autorizaciones.component.css']
})
export class AutorizacionesComponent implements OnInit {

  // idDocumento = new FormControl('', Validators.required);
  orden = new FormControl(0, Validators.required);
  estado = new FormControl(0, Validators.required);
  idDepartamento = new FormControl('');

  public nuevaAutorizacionesForm = new FormGroup({
    // idDocumentoF: this.idDocumento,
    ordenF: this.orden,
    estadoF: this.estado,
    idDepartamentoF: this.idDepartamento
  });

  Habilitado: boolean = true;
  notificacion: any = [];
  notiAutrizaciones: any = [];
  departamentos: any = [];

  id_empleado_loggin: number;
  FechaActual: any;
  NotifiRes: any;

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

  constructor(
    public restAutorizaciones: AutorizacionService,
    // public restNotiAutorizaciones: NotiAutorizacionesService,
    // public restNotificaciones: NotificacionesService,
    public restDepartamento: DepartamentosService,
    public restCargo: EmplCargosService,
    private restP: PermisosService,
    private realTime: RealTimeService,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<AutorizacionesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    console.log(this.data, 'data', this.data.carga);
    var f = moment();
    this.FechaActual = f.format('YYYY-MM-DD');
    this.obtenerDepartamento();
    this.id_empleado_loggin = parseInt(localStorage.getItem('empleado') as string);
  }


  resAutorizacion: any = [];

  idNotifica: any = [];
  contador: number = 1;
  insertarAutorizacion(form) {
    if (this.data.carga === 'multiple') {
      this.data.datosPermiso.map(obj => {
        if (obj.estado === 'Pre-autorizado') {
          console.log('idpermiso-up', obj.id);
          this.restP.BuscarDatosAutorizacion(obj.id).subscribe(data => {
            var documento = data[0].empleado_estado;
            this.restDepartamento.ConsultarDepartamentoPorContrato(obj.id_cargo).subscribe(res => {
              this.departamentos = res;
              this.ActualizarDatos(form, documento, obj.id, this.departamentos[0].id_departamento, obj.id_emple_solicita);
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
          console.log('idpermiso', obj.id);
          this.restDepartamento.ConsultarDepartamentoPorContrato(obj.id_cargo).subscribe(res => {
            this.departamentos = res;
            this.IngresarDatos(form, obj.id, this.departamentos[0].id_departamento, obj.id_emple_solicita);
          })
        }
      })
    }
    else if (this.data.carga === undefined) {
      this.IngresarDatos(form, this.data.id, form.idDepartamentoF, this.data.id_emple_solicita);
    }
  }

  IngresarDatos(form, id_permiso: number, id_departamento: number, empleado_solicita: number) {
    // Arreglo de datos para ingresar una autorización
    let newAutorizaciones = {
      orden: form.ordenF,
      estado: form.estadoF,
      id_departamento: id_departamento,
      id_permiso: id_permiso,
      id_vacacion: null,
      id_hora_extra: null,
      id_documento: localStorage.getItem('empleado') as string + '_' + form.estadoF + ',',
      id_plan_hora_extra: null,
    }
    this.restAutorizaciones.postAutorizacionesRest(newAutorizaciones).subscribe(res => {
      this.EditarEstadoPermiso(id_permiso, id_departamento, empleado_solicita, form.estadoF);
    }, error => { })
  }

  ActualizarDatos(form, documento, id_permiso: number, id_departamento: number, empleado_solicita: number) {
    // Arreglo de datos para actualizar la autorización de acuerdo al permiso
    let newAutorizacionesM = {
      id_documento: documento + localStorage.getItem('empleado') as string + '_' + form.estadoF + ',',
      estado: form.estadoF,
      id_permiso: id_permiso,
    }
    this.restAutorizaciones.PutEstadoAutoPermisoMultiple(newAutorizacionesM).subscribe(resA => {
      this.EditarEstadoPermiso(id_permiso, id_departamento, empleado_solicita, form.estadoF);
    })
  }

  obtenerDepartamento() {
    if (this.data.carga === 'multiple') {
      this.nuevaAutorizacionesForm.patchValue({
        ordenF: 1,
        estadoF: 2,
      });
      this.Habilitado = false;
    }
    else if (this.data.carga === undefined) {
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

  resEstado: any = [];
  idNoti: any = [];
  EditarEstadoPermiso(id_permiso, id_departamento, id_empleado, estado_permiso) {
    let datosPermiso = {
      estado: estado_permiso,
      id_permiso: id_permiso,
      id_departamento: id_departamento,
      id_empleado: id_empleado
    }
    // Actualizar estado del permiso
    var estado_letras: string = '';
    if (estado_permiso === 1) {
      estado_letras = 'Pendiente';
    }
    else if (estado_permiso === 2) {
      estado_letras = 'Pre-autorizado';
    } else if (estado_permiso === 3) {
      estado_letras = 'Autorizado';
    }
    else if (estado_permiso === 4) {
      estado_letras = 'Negado';
    }
    this.restP.ActualizarEstado(id_permiso, datosPermiso).subscribe(respo => {
      this.resEstado = [respo];
      var f = new Date();
      let notificacion = {
        id: null,
        id_send_empl: this.id_empleado_loggin,
        id_receives_empl: id_empleado,
        id_receives_depa: id_departamento,
        estado: estado_letras,
        create_at: `${this.FechaActual}T${f.toLocaleTimeString()}.000Z`,
        id_permiso: id_permiso,
        id_vacaciones: null,
        id_hora_extra: null
      }
      // Enviar la respectiva notificación de cambio de estado del permiso
      this.realTime.IngresarNotificacionEmpleado(notificacion).subscribe(res => {
        this.NotifiRes = res;
        notificacion.id = this.NotifiRes._id;
        if (this.NotifiRes._id > 0 && this.resEstado[0].notificacion === true) {
          this.restP.EnviarNotificacionRealTime(notificacion);
        }
      });
    }, err => {
      const { access, message } = err.error.message;
      if (access === false) {
        this.toastr.error(message)
        this.dialogRef.close();
      }
    });
    console.log('contador', this.contador);
    this.contador = this.contador + 1;
    if (this.data.carga === 'multiple') {
      console.log('arreglo', this.data.datosPermiso.length);
      if (this.contador === this.data.datosPermiso.length) {
        this.toastr.success('Operación Exitosa', 'Se autorizo un total de ' + this.data.datosPermiso.length + ' permisos.', {
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

  limpiarCampos() {
    this.nuevaAutorizacionesForm.reset();
  }

  CerrarVentanaRegistroNoti() {
    this.limpiarCampos();
    this.dialogRef.close();
  }

}
