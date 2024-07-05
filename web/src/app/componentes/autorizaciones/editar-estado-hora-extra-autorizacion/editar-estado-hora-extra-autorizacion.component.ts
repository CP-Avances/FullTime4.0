import { FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

import { AutorizacionService } from 'src/app/servicios/autorizacion/autorizacion.service';
import { PedHoraExtraService } from 'src/app/servicios/horaExtra/ped-hora-extra.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';
import { AutorizaDepartamentoService } from 'src/app/servicios/autorizaDepartamento/autoriza-departamento.service';

interface Estado {
  id: number,
  nombre: string
}

@Component({
  selector: 'app-editar-estado-hora-extra-autorizacion',
  templateUrl: './editar-estado-hora-extra-autorizacion.component.html',
  styleUrls: ['./editar-estado-hora-extra-autorizacion.component.css']
})

export class EditarEstadoHoraExtraAutorizacionComponent implements OnInit {

  estados: Estado[] = [];

  estado = new FormControl('', Validators.required);

  public estadoAutorizacionesForm = new FormGroup({
    estadoF: this.estado
  });

  id_empleado_loggin: number;
  FechaActual: any;
  NotifiRes: any;

  ArrayAutorizacionTipos: any = [];
  gerencia: boolean = false;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    private restA: AutorizacionService,
    private toastr: ToastrService,
    public restPH: PedHoraExtraService,
    private realTime: RealTimeService,
    public ventana: MatDialogRef<EditarEstadoHoraExtraAutorizacionComponent>,
    public restAutoriza: AutorizaDepartamentoService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.id_empleado_loggin = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

    if (this.data.autorizacion[0].estado === 1) {
      this.toastr.info('Solicitud pendiente de aprobación.', '', {
        timeOut: 6000,
      })
    } else {
      this.estadoAutorizacionesForm.patchValue({
        estadoF: this.data.autorizacion[0].estado
      });
    }
    this.tiempo();

    this.restAutoriza.BuscarAutoridadUsuarioDepa(this.id_empleado_loggin).subscribe(
      (res) => {
        this.ArrayAutorizacionTipos = res;
        this.ArrayAutorizacionTipos.filter(x => {
          if(x.nombre == 'GERENCIA' && x.estado == true){
            this.gerencia = true;
            if(x.autorizar == true){
              this.estados = [
                { id: 3, nombre: 'Autorizado' },
                { id: 4, nombre: 'Negado' }
              ];
            }else if(x.preautorizar == true){
              this.estados = [
                { id: 2, nombre: 'Pre-autorizado' },
                { id: 4, nombre: 'Negado' }
              ];
            }
          }
          else if((this.gerencia == false) && (this.data.auto.id_departamento == x.id_departamento && x.estado == true)){
            if(x.autorizar == true){
              this.estados = [
                { id: 3, nombre: 'Autorizado' },
                { id: 4, nombre: 'Negado' }
              ];
            }else if(x.preautorizar == true){
              this.estados = [
                { id: 2, nombre: 'Pre-autorizado' },
                { id: 4, nombre: 'Negado' }
              ];
            }
          }
        });
      }
    );
  }

  tiempo() {
    var f = moment();
    this.FechaActual = f.format('YYYY-MM-DD');
  }

  resAutorizacion: any = [];
  idNoti: any = [];
  ActualizarEstadoAutorizacion(form: any) {
    let newAutorizaciones = {
      id_documento: this.data.autorizacion[0].id_autoriza_estado + localStorage.getItem('empleado') as string + '_' + form.estadoF + ',',
      estado: form.estadoF,
      id_hora_extra: this.data.autorizacion[0].id_hora_extra,
      id_departamento: this.data.autorizacion[0].id_departamento,
    }
    console.log(newAutorizaciones);
    this.restA.PutEstadoAutoHoraExtra(this.data.autorizacion[0].id_hora_extra, newAutorizaciones).subscribe(res => {
      this.resAutorizacion = [res];
      console.log(this.resAutorizacion);
      this.toastr.success('Operación exitosa.', 'Estado Actualizado', {
        timeOut: 6000,
      });
      this.EditarEstadoHoraExtra(form);
    }, err => {
      const { access, message } = err.error.message;
      if (!access) {
        this.toastr.error(message)
        this.ventana.close();
      }
    })
  }

  resEstado: any = [];
  EditarEstadoHoraExtra(form: any) {
    let datosHorasExtras = {
      estado: form.estadoF,
      id_hora_extra: this.data.autorizacion[0].id_hora_extra,
      id_departamento: this.data.autorizacion[0].id_departamento,
      user_name: this.user_name,
      ip: this.ip,
    }
    this.restPH.ActualizarEstado(this.data.autorizacion[0].id_hora_extra, datosHorasExtras).subscribe(res => {
      this.resEstado = [res];
      var f = new Date();
      let notificacion = {
        id: null,
        id_send_empl: this.id_empleado_loggin,
        id_receives_empl: this.data.empl,
        id_receives_depa: this.data.autorizacion[0].id_departamento,
        estado: form.estadoF,
        create_at: `${this.FechaActual}T${f.toLocaleTimeString()}.000Z`,
        id_permiso: null,
        id_vacaciones: null,
        id_hora_extra: this.data.autorizacion[0].id_hora_extra,
        user_name: this.user_name,
        ip: this.ip,
      }
      this.realTime.IngresarNotificacionEmpleado(notificacion).subscribe(res1 => {
        this.NotifiRes = res1;
        notificacion.id = this.NotifiRes._id;
        if (this.NotifiRes._id > 0 && this.resEstado[0].notificacion === true) {
          this.restPH.EnviarNotificacionRealTime(notificacion);
        }
      });
      this.ventana.close();
    }, err => {
      const { access, message } = err.error.message;
      if (!access) {
        this.toastr.error(message)
        this.ventana.close();
      }
    })
  }



}
