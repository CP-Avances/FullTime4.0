import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
import { DepartamentosService } from 'src/app/servicios/catalogos/catDepartamentos/departamentos.service';
import { AutorizacionService } from 'src/app/servicios/autorizacion/autorizacion.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';
import { PedHoraExtraService } from 'src/app/servicios/horaExtra/ped-hora-extra.service';

interface Orden {
  valor: number
}

interface Estado {
  id: number,
  nombre: string
}

@Component({
  selector: 'app-hora-extra-autorizaciones',
  templateUrl: './hora-extra-autorizaciones.component.html',
  styleUrls: ['./hora-extra-autorizaciones.component.css']
})

export class HoraExtraAutorizacionesComponent implements OnInit {

  TipoDocumento = new FormControl('');
  orden = new FormControl(0, Validators.required);
  estado = new FormControl(0, Validators.required);
  idDepartamento = new FormControl('');

  public nuevaAutorizacionesForm = new FormGroup({
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
    // { id: 1, nombre: 'Pendiente' },
    { id: 2, nombre: 'Pre-autorizado' },
    { id: 3, nombre: 'Autorizado' },
    { id: 4, nombre: 'Negado' },
  ];

  Habilitado: boolean = true;
  id_empleado_loggin: number;
  FechaActual: any;
  NotifiRes: any;

  constructor(
    public restAutorizaciones: AutorizacionService,
    public restDepartamento: DepartamentosService,
    private realTime: RealTimeService,
    private restH: PedHoraExtraService,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<HoraExtraAutorizacionesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.id_empleado_loggin = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    console.log(this.data, 'datam');
    this.obtenerDepartamento();
    this.tiempo();
  }

  insertarAutorizacion(form) {
    if (this.data.carga === 'individual') {
      if (this.data.pedido_hora.estado === 2 || this.data.pedido_hora.estado === 3 || this.data.pedido_hora.estado === 4) {
        this.restH.BuscarDatosAutorizacion(this.data.pedido_hora.id).subscribe(data => {
          var documento = data[0].empleado_estado;
          this.ActualizarDatos(form, documento, this.data.pedido_hora.id, form.idDepartamentoF, this.data.pedido_hora.id_usua_solicita);
        }, err => {
          const { access, message } = err.error.message;
          if (access === false) {
            this.toastr.error(message)
            this.dialogRef.close();
          }
        })
      }
      else {
        this.IngresarDatos(form, this.data.pedido_hora.id, form.idDepartamentoF, this.data.pedido_hora.id_usua_solicita);
      }
    }
    else if (this.data.carga === 'multiple') {
      this.data.datosHora.map(obj => {
        if (obj.estado === 'Pre-Autorizado') {
          this.restH.BuscarDatosAutorizacion(obj.id).subscribe(data => {
            var documento = data[0].empleado_estado;
            this.restDepartamento.ConsultarDepartamentoPorContrato(obj.id_cargo).subscribe(res => {
              this.departamentos = res;
              this.ActualizarDatos(form, documento, obj.id, this.departamentos[0].id_departamento, obj.id_usua_solicita);
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
            this.IngresarDatos(form, obj.id, this.departamentos[0].id_departamento, obj.id_usua_solicita);
          })
        }
      })
    }
    else if (this.data.carga === undefined) {
      if (this.data.estado === 2 || this.data.estado === 3 || this.data.estado === 4) {
        this.restH.BuscarDatosAutorizacion(this.data.id).subscribe(data => {
          var documento = data[0].empleado_estado;
          this.ActualizarDatos(form, documento, this.data.id, form.idDepartamentoF, this.data.id_usua_solicita);
        }, err => {
          const { access, message } = err.error.message;
          if (access === false) {
            this.toastr.error(message)
            this.dialogRef.close();
          }
        })
      }
      else {
        this.IngresarDatos(form, this.data.id, form.idDepartamentoF, this.data.id_usua_solicita);
      }
    }
  }

  obtenerDepartamento() {
    if (this.data.carga === 'individual') {
      this.BusquedaDepartamento(this.data.pedido_hora.id_empl_cargo);
    }
    else {
      this.nuevaAutorizacionesForm.patchValue({
        ordenF: 1,
        estadoF: 2,
      })
      this.Habilitado = false;
    }
  }

  BusquedaDepartamento(cargo_id) {
    this.restDepartamento.ConsultarDepartamentoPorContrato(cargo_id).subscribe(res => {
      console.log(res, 'departamentos');
      this.departamentos = res;
      this.nuevaAutorizacionesForm.patchValue({
        ordenF: 1,
        estadoF: 2,
        idDepartamentoF: this.departamentos[0].id_departamento
      })
    })
  }

  tiempo() {
    var f = moment();
    this.FechaActual = f.format('YYYY-MM-DD');
    console.log('fecha Actual', this.FechaActual);
  }


  IngresarDatos(form, id_hora_extra: number, id_departamento: number, empleado_solicita: number) {
    // Arreglo de datos para ingresar una autorización
    let newAutorizaciones = {
      orden: form.ordenF,
      estado: form.estadoF,
      id_departamento: id_departamento,
      id_permiso: null,
      id_vacacion: null,
      id_hora_extra: id_hora_extra,
      id_documento: localStorage.getItem('empleado') as string + '_' + form.estadoF + ',',
      id_plan_hora_extra: null,
    }
    this.restAutorizaciones.postAutorizacionesRest(newAutorizaciones).subscribe(res => {
      console.log('pasa')
      this.EditarEstadoHoraExtra(id_hora_extra, id_departamento, empleado_solicita, form.estadoF)
    }, error => { })
  }

  ActualizarDatos(form, documento, id_hora_extra: number, id_departamento: number, empleado_solicita: number) {
    // Arreglo de datos para actualizar la autorización de acuerdo a la hora extra
    let newAutorizacionesM = {
      id_documento: documento + localStorage.getItem('empleado') as string + '_' + form.estadoF + ',',
      estado: form.estadoF,
      id_hora_extra: id_hora_extra,
      id_departamento: id_departamento,
    }
    this.restAutorizaciones.PutEstadoAutoHoraExtra(id_hora_extra, newAutorizacionesM).subscribe(res => {
      this.EditarEstadoHoraExtra(id_hora_extra, id_departamento, empleado_solicita, form.estadoF)
    })
  }

  resEstado: any = [];
  contador: number = 0;
  EditarEstadoHoraExtra(id_hora, id_departamento, usuario_solicita, estado_hora) {
    console.log('estado', estado_hora)
    let datosHorasExtras = {
      estado: estado_hora,
      id_hora_extra: id_hora,
      id_departamento: id_departamento,
    }
    console.log('datos', datosHorasExtras);
    this.restH.ActualizarEstado(id_hora, datosHorasExtras).subscribe(res => {
      this.resEstado = [res];
      console.log('estado', this.resEstado);
      console.log(this.resEstado[0].realtime[0].estado);
      var f = new Date();
      // let nomEstado = '';
      // this.estados.forEach(obj => {
      //   if(obj.valor = form.estadoForm) {
      //     nomEstado = obj.nombre
      //   }
      // })
      var estado_letras: string = '';
      if (estado_hora === 1) {
        estado_letras = 'Pendiente';
      }
      else if (estado_hora === 2) {
        estado_letras = 'Pre-autorizado';
      }
      else if (estado_hora === 3) {
        estado_letras = 'Autorizado';
      }
      else if (estado_hora === 4) {
        estado_letras = 'Negado';
      }
      let notificacion = {
        id: null,
        id_send_empl: this.id_empleado_loggin,
        id_receives_empl: usuario_solicita,
        id_receives_depa: id_departamento,
        estado: estado_letras,
        create_at: `${this.FechaActual}T${f.toLocaleTimeString()}.000Z`,
        id_permiso: null,
        id_vacaciones: null,
        id_hora_extra: id_hora
      }
      this.realTime.IngresarNotificacionEmpleado(notificacion).subscribe(res1 => {
        this.NotifiRes = res1;
        notificacion.id = this.NotifiRes._id;
        if (this.NotifiRes._id > 0 && this.resEstado[0].notificacion === true) {
          this.restH.EnviarNotificacionRealTime(notificacion);
        }
      });
    }, err => {
      const { access, message } = err.error.message;
      if (access === false) {
        this.toastr.error(message)
        this.dialogRef.close();
      }
    })
    console.log('contador', this.contador);
    this.contador = this.contador + 1;
    if (this.data.carga === 'multiple') {
      console.log('arreglo', this.data.datosHora.length);
      if (this.contador === this.data.datosHora.length) {
        this.toastr.success('Operación Exitosa', 'Se autorizo un total de ' + this.data.datosHora.length + ' solicitudes de horas extras.', {
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

}
