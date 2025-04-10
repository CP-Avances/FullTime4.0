// SECCION DE LIBRERIAS
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { ParametrosService } from 'src/app/servicios/configuracion/parametrizacion/parametrosGenerales/parametros.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';

@Component({
  selector: 'app-crear-detalle-parametro',
  standalone: false,
  templateUrl: './crear-detalle-parametro.component.html',
  styleUrls: ['./crear-detalle-parametro.component.css']
})

export class CrearDetalleParametroComponent implements OnInit {
  ips_locales: any = '';

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // CONTROL DE LOS CAMPOS DEL FORMULARIO
  descripcion = new FormControl('');

  // ASIGNAR LOS CAMPOS EN UN FORMULARIO EN GRUPO
  public formulario = new FormGroup({
    descripcionForm: this.descripcion,
  });

  constructor(
    private rest: ParametrosService,
    private toastr: ToastrService,
    public ventana: MatDialogRef<CrearDetalleParametroComponent>,
    public validar: ValidacionesService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  nota: string = '';
  especificacion: string = '';
  observacion: any = '';
  texto: boolean = false;
  hora: boolean = false;
  numeros: boolean = false;


  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });
    this.descripcion.setValidators([Validators.required]);
    this.descripcion.updateValueAndValidity();
    this.observacion = '';
    this.nota = 'NOTA: Por favor llenar todos los campos obligatorios (*) del formulario para activar el botón ' +
      'Guardar.'
    // PARAMETROS QUE REQUIEREN INGRESO DE NUMEROS
    if (this.data.parametros.id === 4 || this.data.parametros.id === 6) {
      this.numeros = true;
      // PARAMETRO TOLERANCIA UBICACION
      if (this.data.parametros.id === 4) {
        this.especificacion = 'Rango de perímetro en metros.';
        this.observacion = 'Perímetro de ubicación permitido para realizar marcaciones (metros).';
      }
      // PARAMETRO DISPOSITIVOS MOVILES
      else if (this.data.parametros.id === 6) {
        this.especificacion = 'Definir el número de dispositivos que pueden usar los usuarios para registrar sus timbres en la aplicación móvil.';
        this.observacion = 'Número de dispositivos móviles en los que el usuario podrá iniciar sesión en la aplicación móvil.';
      }
    }
    // PARAMETROS DE REGISTRO DE HORA PARA ENVIO DE NOTIFICACIONES POR CORREO ELECTRONICO
    else if (
      this.data.parametros.id === 9       // ----> MENSAJE CUMPLEAÑOS
      || this.data.parametros.id === 11   // ----> REPORTE ATRASOS DIARIO
      || this.data.parametros.id === 14   // ----> REPORTE ATRASOS SEMANAL
      || this.data.parametros.id === 18   // ----> REPORTE FALTAS DIARIO
      || this.data.parametros.id === 21   // ----> REPORTE FALTAS SEMANAL
      || this.data.parametros.id === 25   // ----> MENSAJE ANIVERSARIO
      || this.data.parametros.id === 27   // ----> REPORTE SALIDAS ANTICIPADAS DIARIO
      || this.data.parametros.id === 30   // ----> REPORTE SALIDAS ANTICIPADAS SEMANAL
    ) {
      this.hora = true;
      this.especificacion = 'Registrar la hora en la que se enviará la notificación (formato de 24 horas).';

      // OBSERVACION DEL PARAMETRO DE HORA DE ENVIO DE NOTIFICACIONES
      if (this.data.parametros.id === 9) {
        this.observacion = 'Hora en la que se enviará de forma automática notificaciones de correo electrónico por cumpleaños.';
      }
      else if (this.data.parametros.id === 11) {
        this.observacion = 'Hora en la que se enviará de forma automática notificaciones de correo electrónico por atrasos diarios del personal.';
      }
      else if (this.data.parametros.id === 14) {
        this.observacion = 'Hora en la que se enviará de forma automática notificaciones de correo electrónico por atrasos semanales del personal.';
      }
      else if (this.data.parametros.id === 18) {
        this.observacion = 'Hora en la que se enviará de forma automática notificaciones de correo electrónico por faltas diarias del personal.';
      }
      else if (this.data.parametros.id === 21) {
        this.observacion = 'Hora en la que se enviará de forma automática notificaciones de correo electrónico por faltas semanales del personal.';
      }
      else if (this.data.parametros.id === 25) {
        this.observacion = 'Hora en la que se enviará de forma automática notificaciones de correo electrónico por aniversarios.';
      }
      else if (this.data.parametros.id === 27) {
        this.observacion = 'Hora en la que se enviará de forma automática notificaciones de correo electrónico por salidas anticipadas diarias del personal.';
      }
      else if (this.data.parametros.id === 30) {
        this.observacion = 'Hora en la que se enviará de forma automática notificaciones de correo electrónico por salidas anticipadas semanales del personal.';
      }
    }
    else if (
      // INGRESO DE CORREO GENERAL DE ENVIO DE REPORTES
      this.data.parametros.id === 12      // ----> REPORTE ATRASOS DIARIO
      || this.data.parametros.id === 16   // ----> REPORTE ATRASOS SEMANAL
      || this.data.parametros.id === 19   // ----> REPORTE FALTAS DIARIO
      || this.data.parametros.id === 23   // ----> REPORTE FALTAS SEMANAL
      || this.data.parametros.id === 28   // ----> REPORTE SALIDAS ANTICIPADAS DIARIO
      || this.data.parametros.id === 32   // ----> REPORTE SALIDAS ANTICIPADAS SEMANAL
    ) {
      this.texto = true;
      this.descripcion.setValidators([Validators.required, Validators.email]);
      this.descripcion.updateValueAndValidity();
    }
    else {
      this.especificacion = '';
      this.texto = true;
    }
  }

  // METODO PARA REGISTRAR NUEVO PARÁMETRO
  GuardarDatos(form: any) {
    let datos = {
      id_tipo: this.data.parametros.id,
      descripcion: form.descripcionForm,
      observacion: this.observacion,
      user_name: this.user_name,
      ip: this.ip,
      ip_local: this.ips_locales,
    };
    this.rest.IngresarDetalleParametro(datos).subscribe(response => {
      this.toastr.success('Detalle registrado exitosamente.',
        '', {
        timeOut: 2000,
      })
      this.CerrarVentana();
    });
  }

  // METODO PARA CERRAR VENTANA
  CerrarVentana() {
    this.ventana.close();
  }

}
