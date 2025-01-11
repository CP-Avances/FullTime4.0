// SECCION DE LIBRERIAS
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/configuracion/parametrizacion/parametrosGenerales/parametros.service';

@Component({
  selector: 'app-editar-detalle-parametro',
  templateUrl: './editar-detalle-parametro.component.html',
  styleUrls: ['./editar-detalle-parametro.component.css']
})

export class EditarDetalleParametroComponent implements OnInit {
  ips_locales: any = '';

  // CONTROL DE LOS CAMPOS DEL FORMULARIO
  descripcion = new FormControl('');

  // ASIGNAR LOS CAMPOS EN UN FORMULARIO EN GRUPO
  public formulario = new FormGroup({
    descripcionForm: this.descripcion,
  });

  nota: string = '';
  especificacion: string = '';
  observacion: string = '';

  texto: boolean = false;
  hora: boolean = false;
  numeros: boolean = false;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    private rest: ParametrosService,
    private toastr: ToastrService,
    public ventana: MatDialogRef<EditarDetalleParametroComponent>,
    public validar: ValidacionesService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });
    this.descripcion.setValidators([Validators.required]);
    this.descripcion.updateValueAndValidity();
    this.nota = 'NOTA: Por favor llenar todos los campos obligatorios (*) del formulario para activar el botón ' +
      'Guardar.';
    this.MostrarDatos();
    // PARAMETROS QUE REQUIEREN INGRESO DE NUMEROS
    if (this.data.parametros.id_tipo === 4 || this.data.parametros.id_tipo === 6) {
      this.numeros = true;
      // PARAMETRO TOLERANCIA UBICACION
      if (this.data.parametros.id_tipo === 4) {
        this.especificacion = 'Rango de perímetro en metros.';
        this.observacion = 'Perímetro de ubicación permitido para realizar marcaciones (metros).';
      }
      // PARAMETRO DISPOSITIVOS MOVILES
      else if (this.data.parametros.id_tipo === 6) {
        this.especificacion = 'Definir el número de dispositivos que pueden usar los usuarios para registrar sus timbres en la aplicación móvil.';
        this.observacion = 'Número de dispositivos móviles en los que el usuario podrá iniciar sesión en la aplicación móvil.';
      }
    }
    // PARAMETROS DE REGISTRO DE HORA PARA ENVIO DE NOTIFICACIONES POR CORREO ELECTRONICO
    else if (this.data.parametros.id_tipo === 9 || this.data.parametros.id_tipo === 11 || this.data.parametros.id_tipo === 14 ||
      this.data.parametros.id_tipo === 18 || this.data.parametros.id_tipo === 21 || this.data.parametros.id_tipo === 25
    ) {
      this.hora = true;
      this.especificacion = 'Registrar la hora en la que se enviará la notificación (formato de 24 horas).';

      // OBSERVACION DEL PARAMETRO DE HORA DE ENVIO DE NOTIFICACIONES
      if (this.data.parametros.id_tipo === 9) {
        this.observacion = 'Hora en la que se enviará de forma automática notificaciones de correo electrónico por cumpleaños.';
      }
      else if (this.data.parametros.id_tipo === 11) {
        this.observacion = 'Hora en la que se enviará de forma automática notificaciones de correo electrónico por atrasos diarios del personal.';
      }
      else if (this.data.parametros.id_tipo === 14) {
        this.observacion = 'Hora en la que se enviará de forma automática notificaciones de correo electrónico por atrasos semanales del personal.';
      }
      else if (this.data.parametros.id_tipo === 18) {
        this.observacion = 'Hora en la que se enviará de forma automática notificaciones de correo electrónico por faltas diarias del personal.';
      }
      else if (this.data.parametros.id_tipo === 21) {
        this.observacion = 'Hora en la que se enviará de forma automática notificaciones de correo electrónico por faltas semanales del personal.';
      }
      else if (this.data.parametros.id_tipo === 25) {
        this.observacion = 'Hora en la que se enviará de forma automática notificaciones de correo electrónico por aniversarios.';
      }
    }
    else if (this.data.parametros.id_tipo === 12 || this.data.parametros.id_tipo === 16 ||
      this.data.parametros.id_tipo === 19 || this.data.parametros.id_tipo === 23
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

  // METODO PARA MOSTRAR DETALLE DE PARAMETRO
  MostrarDatos() {
    this.formulario.patchValue({
      descripcionForm: this.data.parametros.descripcion
    })
  }

  // METODO PARA REGISTRAR NUEVO PARÁMETRO
  GuardarDatos(form: any) {
    let datos = {
      id: this.data.parametros.id_detalle,
      descripcion: form.descripcionForm,
      observacion: this.observacion,
      user_name: this.user_name,
      ip: this.ip,
      ip_local: this.ips_locales,
    };
    this.rest.ActualizarDetalleParametro(datos).subscribe(response => {
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
