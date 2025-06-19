import { FormGroup, FormBuilder } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/avisos/real-time.service';
import { MainNavService } from 'src/app/componentes/generales/main-nav/main-nav.service';

import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: false,
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})

export class SettingsComponent implements OnInit {

  btnActualizar: boolean = false;
  btnCrear: boolean = false;
  id_empleado: any;
  ver_modulos: boolean = false;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;
  ips_locales: any = '';

  permisosCorreo = false;
  permisosNotificacion = false;
  vacaCorreo = false;
  vacaNotificacion = false;
  horaExtraCorreo = false;
  horaExtraNotificacion = false;
  comidaCorreo = false;
  comidaNotificacion = false;
  cominicadoCorreo = false;
  cominicadoNotificacion = false;
  atrasosCorreo = false;
  atrasosNotificacion = false;
  faltasCorreo = false;
  faltasNotificacion = false;
  salidaCorreo = false;
  salidaNotificacion = false;

  // BUSQUEDA DE MODULOS ACTIVOS
  get habilitarPermisos(): boolean { return this.funciones.permisos; }
  get habilitarVacaciones(): boolean { return this.funciones.vacaciones; }
  get habilitarHorasExtras(): boolean { return this.funciones.horasExtras; }
  get habilitarAlimentacion(): boolean { return this.funciones.alimentacion; }

  constructor(
    private avisos: RealTimeService,
    private toaster: ToastrService,
    public formBuilder: FormBuilder,
    private funciones: MainNavService,
    public validar: ValidacionesService,
    public router: Router,
  ) {}

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });
    // CODIGO TOMADO DESDE LA RUTA URL
    var ruta = this.router.url.split('#')[0];
    var datoEncontrado: string = ruta.split("/")[2];
    const formatearDato = decodeURIComponent(datoEncontrado);
    this.id_empleado = this.validar.DesencriptarDato(formatearDato);

    this.VerModulos();
    this.avisos.ObtenerConfiguracionEmpleado(this.id_empleado).subscribe(res => {
      this.btnActualizar = true;

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

    }, error => {
      this.btnCrear = true;
    });

  }

  // METODO PARA HABILITAR SELECCION DE OPCIONES DE MODULOS
  VerModulos() {
    this.ver_modulos = false;
    if (this.habilitarPermisos === true || this.habilitarVacaciones === true ||
      this.habilitarAlimentacion === true || this.habilitarHorasExtras) {
      this.ver_modulos = true;
    }
  }

  // METODO PARA REGISTRAR CONFIGURACION DE NOTIFICACIONES
  CrearConfiguracion() {
    let data = {
      id_empleado: this.id_empleado,
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
      ip_local: this.ips_locales
    }
    this.avisos.IngresarConfigNotiEmpleado(data).subscribe(res => {
      this.toaster.success('Operación exitosa.', 'Configuración Guardada', {
        timeOut: 6000,
      });
      return this.router.navigate(['/home']);
    });
  }

  // METODO PARA ACTUALIZAR REGISTRO DE NOTIFICACIONES
  ActualizarConfiguracion() {
    let data = {
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
      ip_local: this.ips_locales
    }
    this.avisos.ActualizarConfigNotiEmpl(this.id_empleado, data).subscribe(res => {
      this.toaster.success('Operación exitosa.', 'Configuración Actualizada', {
        timeOut: 6000,
      });
      return this.router.navigate(['/home']);
    });
  }

  // METODO PARA ACTUALIZAR EL ESTADO DE LOS BOTONES
  toggleEstado(item: string, tipo: string) {
    if(item == 'comunicado'){
      if(tipo == 'correo'){
        this.cominicadoCorreo = !this.cominicadoCorreo;
      }else{
        this.cominicadoNotificacion = !this.cominicadoNotificacion
        if(this.cominicadoNotificacion){
          this.reproducirSonido()
        }
      }
    }else if(item == 'atrasos'){
      if(tipo == 'correo'){
        this.atrasosCorreo = !this.atrasosCorreo;
      }else{
        this.atrasosNotificacion = !this.atrasosNotificacion
        if(this.atrasosNotificacion){
          this.reproducirSonido()
        }
      }
    }else if(item == 'faltas'){
      if(tipo == 'correo'){
        this.faltasCorreo = !this.faltasCorreo;
      }else{
        this.faltasNotificacion = !this.faltasNotificacion
        if( this.faltasNotificacion){
          this.reproducirSonido()
        }
      }
    }else if(item == 'permisos'){
      if(tipo == 'correo'){
        this.permisosCorreo = !this.permisosCorreo;
      }else{
        this.permisosNotificacion = !this.permisosNotificacion
        if( this.permisosNotificacion){
          this.reproducirSonido()
        }
      }
    }else if(item == 'vacaciones'){
      if(tipo == 'correo'){
        this.vacaCorreo = !this.vacaCorreo;
      }else{
        this.vacaNotificacion = !this.vacaNotificacion
        if( this.vacaNotificacion){
          this.reproducirSonido()
        }
      }
    }else if(item == 'horaExtra'){
      if(tipo == 'correo'){
        this.horaExtraCorreo = !this.horaExtraCorreo;
      }else{
        this.horaExtraNotificacion = !this.horaExtraNotificacion
        if( this.horaExtraNotificacion){
          this.reproducirSonido()
        }
      }
    }else if(item == 'comida'){
      if(tipo == 'correo'){
        this.comidaCorreo = !this.comidaCorreo;
      }else{
        this.comidaNotificacion = !this.comidaNotificacion
        if( this.comidaNotificacion){
          this.reproducirSonido()
        }
      }
    }else if(item == 'salida'){
      if(tipo == 'correo'){
        this.salidaCorreo = !this.salidaCorreo;
      }else{
        this.salidaNotificacion = !this.salidaNotificacion
        if( this.salidaNotificacion){
          this.reproducirSonido()
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
