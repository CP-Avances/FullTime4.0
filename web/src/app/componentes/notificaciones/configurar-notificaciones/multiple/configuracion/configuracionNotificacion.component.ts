import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { RealTimeService } from 'src/app/servicios/notificaciones/avisos/real-time.service';
import { MainNavService } from 'src/app/componentes/generales/main-nav/main-nav.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';

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
        public validar: ValidacionesService,
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
            ip: this.ip, ip_local: this.ips_locales,
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
            ip: this.ip, ip_local: this.ips_locales,
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
        if (this.empleados.length > 0) {

            const id_empleado = this.empleados.map((empl: any) => empl.id);
            let data = {
                id_empleado: '',
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
                ip: this.ip, ip_local: this.ips_locales,
            }

            this.avisos.ObtenerConfiguracionEmpleadoMultiple({ id_empleado }).subscribe(
                async res => {
                    if (res && res.respuesta) {
                        const datosEncontrados = res.respuesta; // Array con los objetos devueltos por el backend
                        const idsEncontrados = datosEncontrados.map((item: any) => item.id_empleado);
                        const idsFaltantes = id_empleado.filter((id: number) => !idsEncontrados.includes(id));

                        console.log("ver idsEncontrados", idsEncontrados)
                        console.log("ver idsFaltantes", idsFaltantes)

                        if (idsEncontrados.length != 0) {
                            // infoActualizar.id_empleado = idsEncontrados;
                            data.id_empleado = idsEncontrados
                            // await this.ActualizarOpcionMarcacion(infoActualizar, idsFaltantes);
                            this.avisos.ActualizarConfigNotiEmplMultiple(data).subscribe(res => {
                                if (idsFaltantes.length == 0) {
                                    this.toaster.success('Operación exitosa.', 'Configuración actualizada.', {
                                        timeOut: 6000,
                                    });
                                }
                            })
                        }

                        if (idsFaltantes.length != 0) {
                            data.id_empleado = idsFaltantes;
                            this.avisos.IngresarConfigNotiEmpleadoMultiple(data).subscribe(res => {
                                this.toaster.success('Operación exitosa.', 'Configuración actualizada.', {
                                    timeOut: 6000,
                                });
                                this.ventana.close(true);
                            });
                        }

                    }

                },
                async error => {

                    if (error.status === 404) {
                        console.log('El backend devolvió un 404: No se encontraron datos.');
                        // Realizar acciones específicas para el caso de 404}
                        data.id_empleado = id_empleado;
                        this.avisos.IngresarConfigNotiEmpleadoMultiple(data).subscribe(res => {
                            this.toaster.success('Operación exitosa.', 'Configuración actualizada.', {
                                timeOut: 6000,
                            });
                            this.ventana.close(true);
                        });
                    } else {
                        console.error('Error inesperado:', error);
                    }
                }
            )


        } else { 
            this.toaster.warning('No ha seleccionado usuarios.', '', {
                timeOut: 6000,
              });
        }

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
