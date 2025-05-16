import { FormGroup, FormBuilder } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { MainNavService } from 'src/app/componentes/generales/main-nav/main-nav.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/avisos/real-time.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';

import { ListaNotificacionComponent } from '../lista-empleados/listaNotificacion.component';

@Component({
    selector: 'app-configuracionNotificacion',
    standalone: false,
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

    permisosCorreo: boolean | null = null;
    permisosNotificacion: boolean | null = null;
    vacaCorreo: boolean | null = null;
    vacaNotificacion: boolean | null = null;
    horaExtraCorreo: boolean | null = null;
    horaExtraNotificacion: boolean | null = null;
    comidaCorreo: boolean | null = null;
    comidaNotificacion: boolean | null = null;
    cominicadoCorreo: boolean | null = null;
    cominicadoNotificacion: boolean | null = null;
    atrasosCorreo: boolean | null = null;
    atrasosNotificacion: boolean | null = null;
    faltasCorreo: boolean | null = null;
    faltasNotificacion: boolean | null = null;
    salidaCorreo: boolean | null = null;
    salidaNotificacion: boolean | null = null;

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
        if (this.empleados.length > 0) {
            this.InicializarConfiguracionNula();
        } else {
            this.ImprimirDatosUsuario();
        }
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

    //MOSTRAR VACIO/NULO CUANDO SE REGISTRA CONFIGURACION MULTIPLE
    InicializarConfiguracionNula(): void {
        this.permisosCorreo = null;
        this.permisosNotificacion = null;
        this.vacaCorreo = null;
        this.vacaNotificacion = null;
        this.horaExtraCorreo = null;
        this.horaExtraNotificacion = null;
        this.comidaCorreo = null;
        this.comidaNotificacion = null;
        this.cominicadoCorreo = null;
        this.cominicadoNotificacion = null;
        this.atrasosCorreo = null;
        this.atrasosNotificacion = null;
        this.faltasCorreo = null;
        this.faltasNotificacion = null;
        this.salidaCorreo = null;
        this.salidaNotificacion = null;
    }


    // MOSTRAR INFORMACION DEL USUARIO
    ImprimirDatosUsuario() {
        if ((this.empleados.length == undefined)) {
            this.avisos.ObtenerConfiguracionEmpleado(this.empleados.id).subscribe(res => {

                this.permisosCorreo = res[0].permiso_mail
                this.permisosNotificacion = res[0].permiso_notificacion
                this.vacaCorreo = res[0].vacacion_mail
                this.vacaNotificacion = res[0].vacacion_notificacion
                this.horaExtraCorreo = res[0].hora_extra_mail
                this.horaExtraNotificacion = res[0].hora_extra_notificacion;
                this.comidaCorreo = res[0].comida_mail;
                this.comidaNotificacion = res[0].comida_notificacion;

                this.cominicadoCorreo = res[0].comunicado_mail
                this.cominicadoNotificacion = res[0].comunicado_notificacion
                this.atrasosCorreo = res[0].atrasos_mail
                this.atrasosNotificacion = res[0].atrasos_notificacion
                this.faltasCorreo = res[0].faltas_mail
                this.faltasNotificacion = res[0].faltas_notificacion
                this.salidaCorreo = res[0].salidas_anticipadas_mail
                this.salidaNotificacion = res[0].salidas_anticipadas_notificacion
            });
        }
    }

    // CREAR CONFIGURACION POR PRIMERA VEZ
    CrearConfiguracion(form: any, item: any, contador: any) {
        let data_ = {
            id_empleado: item.id,
            vaca_mail: this.vacaCorreo,
            vaca_notificacion: this.vacaNotificacion,
            permiso_mail: this.permisosCorreo,
            permiso_notificacion: this.permisosNotificacion,
            hora_extra_mail: this.horaExtraCorreo,
            hora_extra_notificacion: this.horaExtraNotificacion,
            comida_mail: this.comidaCorreo,
            comida_notificacion: this.comidaNotificacion,
            comunicado_mail: this.cominicadoCorreo,
            comunicado_notificacion: this.cominicadoNotificacion,
            atrasos_mail: this.atrasosCorreo,
            atrasos_notificacion: this.atrasosNotificacion,
            faltas_mail: this.faltasCorreo,
            faltas_notificacion: this.faltasNotificacion,
            salidas_anticipadas_mail: this.salidaCorreo,
            salidas_anticipadas_notificacion: this.salidaNotificacion,
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
        },
            error => {
                this.toaster.error('Servicio no disponible temporalmente, intente más tarde.')
            }
        );

    }

    // REGISTROS DE CONFIGURACION INDIVIDUAL
    ConfigurarIndividual(form: any) {
        let data_ = {
            vaca_mail: this.vacaCorreo,
            vaca_notificacion: this.vacaNotificacion,
            permiso_mail: this.permisosCorreo,
            permiso_notificacion: this.permisosNotificacion,
            hora_extra_mail: this.horaExtraCorreo,
            hora_extra_notificacion: this.horaExtraNotificacion,
            comida_mail: this.comidaCorreo,
            comida_notificacion: this.comidaNotificacion,
            comunicado_mail: this.cominicadoCorreo,
            comunicado_notificacion: this.cominicadoNotificacion,
            atrasos_mail: this.atrasosCorreo,
            atrasos_notificacion: this.atrasosNotificacion,
            faltas_mail: this.faltasCorreo,
            faltas_notificacion: this.faltasNotificacion,
            salidas_anticipadas_mail: this.salidaCorreo,
            salidas_anticipadas_notificacion: this.salidaNotificacion,
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
                vaca_mail: this.vacaCorreo,
                vaca_notificacion: this.vacaNotificacion,
                permiso_mail: this.permisosCorreo,
                permiso_notificacion: this.permisosNotificacion,
                hora_extra_mail: this.horaExtraCorreo,
                hora_extra_notificacion: this.horaExtraNotificacion,
                comida_mail: this.comidaCorreo,
                comida_notificacion: this.comidaNotificacion,
                comunicado_mail: this.cominicadoCorreo,
                comunicado_notificacion: this.cominicadoNotificacion,
                atrasos_mail: this.atrasosCorreo,
                atrasos_notificacion: this.atrasosNotificacion,
                faltas_mail: this.faltasCorreo,
                faltas_notificacion: this.faltasNotificacion,
                salidas_anticipadas_mail: this.salidaCorreo,
                salidas_anticipadas_notificacion: this.salidaNotificacion,
                user_name: this.user_name,
                ip: this.ip,
                ip_local: this.ips_locales,
            }


            let data: any = Object.fromEntries(
                Object.entries(data_).filter(([key, value]) =>
                    key === 'id_empleado' || (value !== null && value !== undefined && value !== '')
                )
            );

            const camposEditables = Object.keys(data).filter(k =>
                k !== 'id_empleado' && k !== 'user_name' && k !== 'ip' && k !== 'ip_local'
            );

            if (camposEditables.length === 0) {
                this.toaster.warning('Debe presionar al menos un botón para actualizar la configuración.', '', {
                    timeOut: 5000,
                });
                return;
            }

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
                    console.log('error J')
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
                        this.toaster.error('Servicio no disponible temporalmente, intente más tarde.')
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

    // METODO PARA ACTUALIZAR EL ESTADO DE LOS BOTONES
    toggleEstado(item: string, tipo: string) {
        if (item == 'comunicado') {
            if (tipo == 'correo') {
                this.cominicadoCorreo = !this.cominicadoCorreo;
            } else {
                this.cominicadoNotificacion = !this.cominicadoNotificacion
                if (this.cominicadoNotificacion) {
                    this.reproducirSonido()
                }
            }
        } else if (item == 'atrasos') {
            if (tipo == 'correo') {
                this.atrasosCorreo = !this.atrasosCorreo;
            } else {
                this.atrasosNotificacion = !this.atrasosNotificacion
                if (this.atrasosNotificacion) {
                    this.reproducirSonido()
                }
            }
        } else if (item == 'faltas') {
            if (tipo == 'correo') {
                this.faltasCorreo = !this.faltasCorreo;
            } else {
                this.faltasNotificacion = !this.faltasNotificacion
                if (this.faltasNotificacion) {
                    this.reproducirSonido()
                }
            }
        } else if (item == 'permisos') {
            if (tipo == 'correo') {
                this.permisosCorreo = !this.permisosCorreo;
            } else {
                this.permisosNotificacion = !this.permisosNotificacion
                if (this.permisosNotificacion) {
                    this.reproducirSonido()
                }
            }
        } else if (item == 'vacaciones') {
            if (tipo == 'correo') {
                this.vacaCorreo = !this.vacaCorreo;
            } else {
                this.vacaNotificacion = !this.vacaNotificacion
                if (this.vacaNotificacion) {
                    this.reproducirSonido()
                }
            }
        } else if (item == 'horaExtra') {
            if (tipo == 'correo') {
                this.horaExtraCorreo = !this.horaExtraCorreo;
            } else {
                this.horaExtraNotificacion = !this.horaExtraNotificacion
                if (this.horaExtraNotificacion) {
                    this.reproducirSonido()
                }
            }
        } else if (item == 'comida') {
            if (tipo == 'correo') {
                this.comidaCorreo = !this.comidaCorreo;
            } else {
                this.comidaNotificacion = !this.comidaNotificacion
                if (this.comidaNotificacion) {
                    this.reproducirSonido()
                }
            }
        } else if (item == 'salida') {
            if (tipo == 'correo') {
                this.salidaCorreo = !this.salidaCorreo;
            } else {
                this.salidaNotificacion = !this.salidaNotificacion
                if (this.salidaNotificacion) {
                    this.reproducirSonido()
                }
            }
        }
    }

    cambiarEstado(item: string, tipo: string, valor: boolean) {
        if (item === 'comunicado') {
            if (tipo === 'correo') {
                this.cominicadoCorreo = valor;
            } else if (tipo === 'notificacion') {
                this.cominicadoNotificacion = valor;
                if (valor) {
                    this.reproducirSonido();
                }
            }
        } else if (item === 'atrasos') {
            if (tipo === 'correo') {
                this.atrasosCorreo = valor;
            } else if (tipo === 'notificacion') {
                this.atrasosNotificacion = valor;
                if (valor) {
                    this.reproducirSonido();
                }
            }
        } else if (item === 'faltas') {
            if (tipo === 'correo') {
                this.faltasCorreo = valor;
            } else if (tipo === 'notificacion') {
                this.faltasNotificacion = valor;
                if (valor) {
                    this.reproducirSonido();
                }
            }
        } else if (item === 'salida') {
            if (tipo === 'correo') {
                this.salidaCorreo = valor;
            } else if (tipo === 'notificacion') {
                this.salidaNotificacion = valor;
                if (valor) {
                    this.reproducirSonido();
                }
            }
        } else if (item === 'permisos') {
            if (tipo === 'correo') {
                this.permisosCorreo = valor;
            } else if (tipo === 'notificacion') {
                this.permisosNotificacion = valor;
                if (valor) {
                    this.reproducirSonido();
                }
            }
        } else if (item === 'vacaciones') {
            if (tipo === 'correo') {
                this.vacaCorreo = valor;
            } else if (tipo === 'notificacion') {
                this.vacaNotificacion = valor;
                if (valor) {
                    this.reproducirSonido();
                }
            }
        } else if (item === 'horaExtra') {
            if (tipo === 'correo') {
                this.horaExtraCorreo = valor;
            } else if (tipo === 'notificacion') {
                this.horaExtraNotificacion = valor;
                if (valor) {
                    this.reproducirSonido();
                }
            }
        } else if (item === 'comida') {
            if (tipo === 'correo') {
                this.comidaCorreo = valor;
            } else if (tipo === 'notificacion') {
                this.comidaNotificacion = valor;
                if (valor) {
                    this.reproducirSonido();
                }
            }
        }
    }

    reproducirSonido() {
        const audio = new Audio();
        audio.src = 'assets/sounds/click_confirmed.mp3'; // Ruta del sonido
        audio.load();
        audio.play();
    }
}
