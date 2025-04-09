import { FormGroup, FormBuilder } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { MainNavService } from 'src/app/componentes/generales/main-nav/main-nav.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/avisos/real-time.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';

import { ListaNotificacionComponent } from '../lista-empleados/listaNotificacion.component';

@Component({
    selector: 'app-configuracionNotificacion',
    templateUrl: './configuracionNotificacion.component.html',
    styleUrls: ['./configuracionNotificacion.component.css']
})

export class ConfiguracionNotificacionComponent implements OnInit {
    ips_locales: any = '';
    @Input() empleados: any;
    ver_modulos: boolean = false;

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
        public validar: ValidacionesService,
        private funciones: MainNavService,
        public componente: ListaNotificacionComponent,
    ) {
        this.ValidarFormulario();
    }

    ngOnInit(): void {
        this.user_name = localStorage.getItem('usuario');
        this.ip = localStorage.getItem('ip');
        this.validar.ObtenerIPsLocales().then((ips) => {
            this.ips_locales = ips;
        });
        this.VerModulos();
        this.ImprimirDatosUsuario();
    }

    // METODO PARA HABILITAR SELECCION DE OPCIONES DE MODULOS
    VerModulos() {
        this.ver_modulos = false;
        if (this.habilitarPermisos === true || this.habilitarVacaciones === true ||
            this.habilitarAlimentacion === true || this.habilitarHorasExtras) {
            this.ver_modulos = true;
        }
    }

    // METODO PARA VALIDAR FORMULARIO
    ValidarFormulario() {
        this.formGroup = this.formBuilder.group({
            vacaMail: '',
            vacaNoti: '',
            permisoMail: '',
            permisoNoti: '',
            horaExtraMail: '',
            horaExtraNoti: '',
            comidaMail: '',
            comidaNoti: '',
            comunicadoMail: '',
            comunicadoNoti: '',
            atrasosMail: '',
            atrasosNoti: '',
            faltasMail: '',
            faltasNoti: '',
            salidasAnticipadasMail: '',
            salidasAnticipadasNoti: '',
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
                    comunicadoNoti: res[0].comunicado_notificacion,
                    atrasosMail: res[0].atrasos_mail,
                    atrasosNoti: res[0].atrasos_notificacion,
                    faltasMail: res[0].faltas_mail,
                    faltasNoti: res[0].faltas_notificacion,
                    salidasAnticipadasMail: res[0].salidas_anticipadas_mail,
                    salidasAnticipadasNoti: res[0].salidas_anticipadas_notificacion
                });
            });
        }
    }

    // CREAR CONFIGURACION POR PRIMERA VEZ
    CrearConfiguracion(form: any, item: any, contador: any) {
        let data_ = {
            id_empleado: item.id,
            vaca_mail: form.vacaMail,
            vaca_notificacion: form.vacaNoti,
            permiso_mail: form.permisoMail,
            permiso_notificacion: form.permisoNoti,
            hora_extra_mail: form.horaExtraMail,
            hora_extra_notificacion: form.horaExtraNoti,
            comida_mail: form.comidaMail,
            comida_notificacion: form.comidaNoti,
            comunicado_mail: form.comunicadoMail,
            comunicado_notificacion: form.comunicadoNoti,
            atrasos_mail: form.atrasosMail,
            atrasos_notificacion: form.atrasosNoti,
            faltas_mail: form.faltasMail,
            faltas_notificacion: form.faltasNoti,
            salidas_anticipadas_mail: form.salidasAnticipadasMail,
            salidas_anticipadas_notificacion: form.salidasAnticipadasNoti,
            user_name: this.user_name,
            ip: this.ip,
            ip_local: this.ips_locales,
        }

        let data = Object.fromEntries(
            Object.entries(data_).filter(([key, value]) =>
                key === 'id_empleado' || (value !== null && value !== undefined && value !== '')
            )
        );

        console.log('ver data ', data)

        this.avisos.IngresarConfigNotiEmpleado(data).subscribe(res => {
            if (this.empleados.length == contador) {
                this.toaster.success('Operación exitosa.', 'Configuración actualizada.', {
                    timeOut: 6000,
                });
                this.CerrarVentana(true);
            }
        });

    }

    // REGISTROS DE CONFIGURACION INDIVIDUAL
    ConfigurarIndividual(form: any) {
        let data_ = {
            vaca_mail: form.vacaMail,
            vaca_notificacion: form.vacaNoti,
            permiso_mail: form.permisoMail,
            permiso_notificacion: form.permisoNoti,
            hora_extra_mail: form.horaExtraMail,
            hora_extra_notificacion: form.horaExtraNoti,
            comida_mail: form.comidaMail,
            comida_notificacion: form.comidaNoti,
            comunicado_mail: form.comunicadoMail,
            comunicado_notificacion: form.comunicadoNoti,
            atrasos_mail: form.atrasosMail,
            atrasos_notificacion: form.atrasosNoti,
            faltas_mail: form.faltasMail,
            faltas_notificacion: form.faltasNoti,
            salidas_anticipadas_mail: form.salidasAnticipadasMail,
            salidas_anticipadas_notificacion: form.salidasAnticipadasNoti,
            user_name: this.user_name,
            ip: this.ip,
            ip_local: this.ips_locales,
        }

        let data: any = Object.fromEntries(
            Object.entries(data_).filter(([key, value]) =>
                key === 'id_empleado' || (value !== null && value !== undefined && value !== '')
            )
        );

        console.log('ver data ', data)

        this.avisos.ObtenerConfiguracionEmpleado(this.empleados.id).subscribe(res => {
            this.avisos.ActualizarConfigNotiEmpl(this.empleados.id, data).subscribe(res => {
                this.toaster.success('Operación exitosa.', 'Configuración actualizada.', {
                    timeOut: 6000,
                });
                this.CerrarVentana(true);
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
            let data_ = {
                id_empleado: '',
                vaca_mail: form.vacaMail,
                vaca_notificacion: form.vacaNoti,
                permiso_mail: form.permisoMail,
                permiso_notificacion: form.permisoNoti,
                hora_extra_mail: form.horaExtraMail,
                hora_extra_notificacion: form.horaExtraNoti,
                comida_mail: form.comidaMail,
                comida_notificacion: form.comidaNoti,
                comunicado_mail: form.comunicadoMail,
                comunicado_notificacion: form.comunicadoNoti,
                atrasos_mail: form.atrasosMail,
                atrasos_notificacion: form.atrasosNoti,
                faltas_mail: form.faltasMail,
                faltas_notificacion: form.faltasNoti,
                salidas_anticipadas_mail: form.salidasAnticipadasMail,
                salidas_anticipadas_notificacion: form.salidasAnticipadasNoti,
                user_name: this.user_name,
                ip: this.ip,
                ip_local: this.ips_locales,
            }

            let data: any = Object.fromEntries(
                Object.entries(data_).filter(([key, value]) =>
                    key === 'id_empleado' || (value !== null && value !== undefined && value !== '')
                )
            );

            console.log('ver data ', data)

            this.avisos.ObtenerConfiguracionEmpleadoMultiple({ id_empleado }).subscribe(
                async res => {
                    if (res && res.respuesta) {
                        const datosEncontrados = res.respuesta; // ARRAY CON LOS OBJETOS DEVUELTOS POR EL BACKEND
                        const idsEncontrados = datosEncontrados.map((item: any) => item.id_empleado);
                        const idsFaltantes = id_empleado.filter((id: number) => !idsEncontrados.includes(id));
                        if (idsEncontrados.length != 0) {
                            data.id_empleado = idsEncontrados
                            this.avisos.ActualizarConfigNotiEmplMultiple(data).subscribe(res => {
                                if (idsFaltantes.length == 0) {
                                    this.toaster.success('Operación exitosa.', 'Configuración actualizada.', {
                                        timeOut: 6000,
                                    });
                                    this.CerrarVentana(true);
                                }
                            })
                        }
                        if (idsFaltantes.length != 0) {
                            data.id_empleado = idsFaltantes;
                            this.avisos.IngresarConfigNotiEmpleadoMultiple(data).subscribe(res => {
                                this.toaster.success('Operación exitosa.', 'Configuración actualizada.', {
                                    timeOut: 6000,
                                });
                                this.CerrarVentana(true);
                            });
                        }
                    }
                },
                async error => {
                    if (error.status === 404) {
                        console.log('El backend devolvió un 404: No se encontraron datos.');
                        // REALIZAR ACCIONES ESPECIFICAS PARA EL CASO DE 404
                        data.id_empleado = id_empleado;
                        this.avisos.IngresarConfigNotiEmpleadoMultiple(data).subscribe(res => {
                            this.toaster.success('Operación exitosa.', 'Configuración actualizada.', {
                                timeOut: 6000,
                            });
                            this.CerrarVentana(true);
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

    // METODO DE CONFIGURACION DE NOTIFICACIONES
    ActualizarConfiguracion(form: any) {
        if (this.empleados.length === undefined) {
            this.ConfigurarIndividual(form);
        }
        else {
            this.ConfigurarMultiple(form);
        }
    }

    // METODO PARA CERRAR VENTANA
    CerrarVentana(evento: any) {
        this.componente.verConfiguracion = true;
        this.componente.verSeleccion = false;
        if (evento != false) {
            this.componente.individual = true;
            this.componente.LimpiarFormulario();
        }
    }
}
