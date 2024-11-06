import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { RealTimeService } from 'src/app/servicios/notificaciones/avisos/real-time.service';
import { MainNavService } from 'src/app/componentes/generales/main-nav/main-nav.service';

@Component({
    selector: 'app-configuracionNotificacion',
    templateUrl: './configuracionNotificacion.component.html',
    styleUrls: ['./configuracionNotificacion.component.css']
})

export class ConfiguracionNotificacionComponent implements OnInit {

    // FORMULARIO
    formGroup: FormGroup;

    // VARIABLES PARA AUDITORIA
    user_name: string | null;
    ip: string | null;

    // BUSQUEDA DE MODULOS ACTIVOS
    get habilitarPermisos(): boolean { return this.funciones.permisos; }
    get habilitarVacaciones(): boolean { return this.funciones.vacaciones; }
    get habilitarHorasExtras(): boolean { return this.funciones.horasExtras; }
    get habilitarAlimentacion(): boolean { return this.funciones.alimentacion; }

    constructor(
        private toaster: ToastrService,
        private avisos: RealTimeService,
        public formBuilder: FormBuilder,
        public ventana: MatDialogRef<ConfiguracionNotificacionComponent>,
        private funciones: MainNavService,
        @Inject(MAT_DIALOG_DATA) public empleados: any
    ) {
        this.ValidarFormulario();
    }

    ngOnInit(): void {
      this.user_name = localStorage.getItem('usuario');
      this.ip = localStorage.getItem('ip');
        this.ImprimirDatosUsuario();
    }

    // METODO PARA VALIDAR FORMULARIO
    ValidarFormulario() {
        this.formGroup = this.formBuilder.group({
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

    // MOSTRAR INFORMACION DEL USUARIO
    ImprimirDatosUsuario() {
        if ((this.empleados.length == undefined)) {
            this.avisos.ObtenerConfiguracionEmpleado(this.empleados.id).subscribe(res => {
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
            });
        }
    }

    // CREAR CONFIGURACION POR PRIMERA VEZ
    CrearConfiguracion(form: any, item: any, contador: any) {
        let data = {
            id_empleado: item.id,
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
            ip: this.ip,
        }
        this.avisos.IngresarConfigNotiEmpleado(data).subscribe(res => {
            if (this.empleados.length == contador) {
                this.toaster.success('Operación exitosa.', 'Configuración actualizada.', {
                    timeOut: 6000,
                });
                this.ventana.close(true);
            }
        });
    }

    // REGISTROS DE CONFIGURACION INDIVIDUAL
    ConfigurarIndividual(form: any) {
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
            ip: this.ip,
        }
        this.avisos.ObtenerConfiguracionEmpleado(this.empleados.id).subscribe(res => {
            this.avisos.ActualizarConfigNotiEmpl(this.empleados.id, data).subscribe(res => {
                this.toaster.success('Operación exitosa.', 'Configuración actualizada.', {
                    timeOut: 6000,
                });
                this.ventana.close(true);
            });
        }, error => {
            this.CrearConfiguracion(form, this.empleados, undefined);
        });
    }

    // REGISTRO DE CONFIGURACION MULTIPLE
    contador: number = 0;
    ConfigurarMultiple(form: any) {
        this.contador = 0;
        this.empleados.forEach((item: any) => {
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
                ip: this.ip,
            }
            this.avisos.ObtenerConfiguracionEmpleado(item.id).subscribe(res => {
                this.avisos.ActualizarConfigNotiEmpl(item.id, data).subscribe(res => {
                    this.contador = this.contador + 1;
                    if (this.empleados.length == this.contador) {
                        this.ventana.close(true);
                        this.toaster.success('Operación exitosa.', 'Configuración actualizada.', {
                            timeOut: 6000,
                        });
                    }
                });
            }, error => {
                this.contador = this.contador + 1;
                this.CrearConfiguracion(form, item, this.contador);
            });
        });
    }

    // METODO DE CONFIGURCAION DE NOTIFICACIONES
    ActualizarConfiguracion(form: any) {
        if (this.empleados.length === undefined) {
            this.ConfigurarIndividual(form);
        }
        else {
            this.ConfigurarMultiple(form);
        }
    }
}
