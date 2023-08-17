import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})

export class SettingsComponent implements OnInit {

  btnActualizar: boolean = false;
  btnCrear: boolean = false;

  formGroup: FormGroup;

  constructor(
    public formBuilder: FormBuilder,
    private avisos: RealTimeService,
    private toaster: ToastrService,
    public ventana: MatDialogRef<SettingsComponent>,
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
    this.avisos.ObtenerConfiguracionEmpleado(this.data.id_empleado).subscribe(res => {
      this.btnActualizar = true;
      this.formGroup.patchValue({
        vacaMail: res[0].vaca_mail,
        vacaNoti: res[0].vaca_noti,
        permisoMail: res[0].permiso_mail,
        permisoNoti: res[0].permiso_noti,
        horaExtraMail: res[0].hora_extra_mail,
        horaExtraNoti: res[0].hora_extra_noti,
        comidaMail: res[0].comida_mail,
        comidaNoti: res[0].comida_noti,
        comunicadoMail: res[0].comunicado_mail,
        comunicadoNoti: res[0].comunicado_noti
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
      comunicado_noti: form.comunicadoNoti
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
      comunicado_noti: form.comunicadoNoti
    }
    this.avisos.ActualizarConfigNotiEmpl(this.data.id_empleado, data).subscribe(res => {
      this.ventana.close();
      this.toaster.success('Operación exitosa.', 'Configuración Actualizada', {
        timeOut: 6000,
      });
    });
  }
}
