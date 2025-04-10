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

  formGroup: FormGroup;

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
      atrasosMail: false,
      atrasosNoti: false,
      faltasMail: false,
      faltasNoti: false,
      salidasAnticipadasMail: false,
      salidasAnticipadasNoti: false,
    });
  }

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
  CrearConfiguracion(form: any) {
    let data = {
      id_empleado: this.id_empleado,
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
  ActualizarConfiguracion(form: any) {
    let data = {
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
      ip_local: this.ips_locales
    }
    this.avisos.ActualizarConfigNotiEmpl(this.id_empleado, data).subscribe(res => {
      this.toaster.success('Operación exitosa.', 'Configuración Actualizada', {
        timeOut: 6000,
      });
      return this.router.navigate(['/home']);
    });
  }

}
