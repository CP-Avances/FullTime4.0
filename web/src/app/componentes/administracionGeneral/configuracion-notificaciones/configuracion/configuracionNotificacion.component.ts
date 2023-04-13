import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-configuracionNotificacion',
    templateUrl: './configuracionNotificacion.component.html',
    styleUrls: ['./configuracionNotificacion.component.css']
})

export class ConfiguracionNotificacionComponent implements OnInit {

    // FORMULARIO
    formGroup: FormGroup;

    constructor(
        private toaster: ToastrService,
        private restN: RealTimeService,
        public formBuilder: FormBuilder,
        public ventana: MatDialogRef<ConfiguracionNotificacionComponent>,
        @Inject(MAT_DIALOG_DATA) public empleados: any
    ) {
        this.ValidarFormulario();
    }

    ngOnInit(): void {
        console.log("Empleados: ", this.empleados);
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
            this.restN.ObtenerConfiguracionEmpleado(this.empleados.id).subscribe(res => {
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
            comunicado_noti: form.comunicadoNoti
        }
        this.restN.IngresarConfigNotiEmpleado(data).subscribe(res => {
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
            comunicado_noti: form.comunicadoNoti
        }
        this.restN.ObtenerConfiguracionEmpleado(this.empleados.id).subscribe(res => {
            this.restN.ActualizarConfigNotiEmpl(this.empleados.id, data).subscribe(res => {
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
        this.empleados.forEach(item => {
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
            this.restN.ObtenerConfiguracionEmpleado(item.id).subscribe(res => {
                this.restN.ActualizarConfigNotiEmpl(item.id, data).subscribe(res => {
                    this.contador = this.contador + 1;
                    if (this.empleados.length == this.contador) {
                        this.ventana.close(true);
                        this.toaster.success('Operación exitosa', 'Configuración actualizada.', {
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