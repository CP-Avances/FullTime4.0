import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';
import { MainNavService } from 'src/app/componentes/generales/main-nav/main-nav.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})

export class SettingsComponent implements OnInit {

  btnActualizar: boolean = false;
  btnCrear: boolean = false;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  formGroup: FormGroup;

  // BUSQUEDA DE MODULOS ACTIVOS
  get habilitarPermisos(): boolean { return this.funciones.permisos; }
  get habilitarVacaciones(): boolean { return this.funciones.vacaciones; }
  get habilitarHorasExtras(): boolean { return this.funciones.horasExtras; }
  get habilitarAlimentacion(): boolean { return this.funciones.alimentacion; }

  constructor(
    private avisos: RealTimeService,
    private toaster: ToastrService,
    public ventana: MatDialogRef<SettingsComponent>,
    public formBuilder: FormBuilder,
    private funciones: MainNavService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.formGroup = formBuilder.group({
      vacaMail: false,
      vacaNoti: false,
      permisoMail: false,
      permisoNoti: false,
      horaExtraMail: false,
      horaExtraNoti: false,
      comidaMail: false,
      comidaNoti: false,
      comunicadoMail: false,
      comunicadoNoti: false,
    });
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

    this.avisos.ObtenerConfiguracionEmpleado(this.data.id_empleado).subscribe(res => {
      this.btnActualizar = true;
      this.formGroup.patchValue({
        vacaMail: res[0].vacacion_mail,
        vacaNoti: res[0].vacacion_notificacion,
        permisoMail: res[0].permiso_mail,
        permisoNoti: res[0].permiso_notificacion,
        horaExtraMail: res[0].hora_extra_mail,
        horaExtraNoti: res[0].hora_extra_notificacion,
        comidaMail: res[0].comida_mail,
        comidaNoti: res[0].comida_notificacion,
        comunicadoMail: res[0].comunicado_mail,
        comunicadoNoti: res[0].comunicado_notificacion
      });
    }, error => {
      this.btnCrear = true;
    });
  }

  // METODO PARA REGISTRAR CONFIGURACION DE NOTIFICACIONES
  CrearConfiguracion(form: any) {
    let data = {
      id_empleado: this.data.id_empleado,
      vaca_mail: form.vacaMail,
      vaca_noti: form.vacaNoti,
      permiso_mail: form.permisoMail,
      permiso_noti: form.permisoNoti,
      hora_extra_mail: form.horaExtraMail,
      hora_extra_noti: form.horaExtraNoti,
      comida_mail: form.comidaMail,
      comida_noti: form.comidaNoti,
      comunicado_mail: form.comunicadoMail,
      comunicado_noti: form.comunicadoNoti,
      user_name: this.user_name,
      ip: this.ip
    }
    this.avisos.IngresarConfigNotiEmpleado(data).subscribe(res => {
      this.ventana.close();
      this.toaster.success('Operación exitosa.', 'Configuración Guardada', {
        timeOut: 6000,
      });
    });
  }

  // METODO PARA ACTUALIZAR REGISTRO DE NOTIFICACIONES
  ActualizarConfiguracion(form: any) {
    let data = {
      vaca_mail: form.vacaMail,
      vaca_noti: form.vacaNoti,
      permiso_mail: form.permisoMail,
      permiso_noti: form.permisoNoti,
      hora_extra_mail: form.horaExtraMail,
      hora_extra_noti: form.horaExtraNoti,
      comida_mail: form.comidaMail,
      comida_noti: form.comidaNoti,
      comunicado_mail: form.comunicadoMail,
      comunicado_noti: form.comunicadoNoti,
      user_name: this.user_name,
      ip: this.ip
    }
    this.avisos.ActualizarConfigNotiEmpl(this.data.id_empleado, data).subscribe(res => {
      this.ventana.close();
      this.toaster.success('Operación exitosa.', 'Configuración Actualizada', {
        timeOut: 6000,
      });
    });
  }
}
