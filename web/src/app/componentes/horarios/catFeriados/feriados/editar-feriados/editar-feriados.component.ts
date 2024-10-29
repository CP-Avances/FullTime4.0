import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
import { ThemePalette } from '@angular/material/core';

import { FeriadosService } from 'src/app/servicios/catalogos/catFeriados/feriados.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';

@Component({
  selector: 'app-editar-feriados',
  templateUrl: './editar-feriados.component.html',
  styleUrls: ['./editar-feriados.component.css'],
})

export class EditarFeriadosComponent implements OnInit {

  idFeriado: number;
  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  fechaF = new FormControl('', Validators.required);
  descripcionF = new FormControl('');
  fechaRecuperacionF = new FormControl('');

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    fechaForm: this.fechaF,
    descripcionForm: this.descripcionF,
    fechaRecuperacionForm: this.fechaRecuperacionF
  });

  /** ************************************************************* **
   ** **           VARIABLES PROGRESS SPINNER                    ** **
   ** ************************************************************* **/
  habilitarprogress: boolean = false;
  color: ThemePalette = 'primary';
  value = 10;
  mode: ProgressSpinnerMode = 'indeterminate';

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    private rest: FeriadosService,
    private toastr: ToastrService,
    public ventana: MatDialogRef<EditarFeriadosComponent>,
    public validar: ValidacionesService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

    this.ImprimirDatos();
    this.ObtenerFeriados();
  }

  // METODO PARA MOSTRAR DATOS EN FORMULARIO
  ImprimirDatos() {
    if (this.data.datosFeriado.fecha_recuperacion === null || this.data.datosFeriado.fecha_recuperacion === '') {
      this.formulario.patchValue({
        fechaRecuperacionForm: null
      })
    }
    this.formulario.setValue({
      fechaForm: this.data.datosFeriado.fecha,
      descripcionForm: this.data.datosFeriado.descripcion,
      fechaRecuperacionForm: this.data.datosFeriado.fecha_recuperacion
    })
  }

  // METODO PARA CONSULTAR FERIADOS EXCEPTO REGISTRO ACTUAL
  feriados: any = [];
  ObtenerFeriados() {
    this.feriados = [];
    this.rest.ConsultarFeriadoActualiza(this.data.datosFeriado.id).subscribe(response => {
      this.feriados = response;
    })
  }

  // METODO PARA ACTUALIZAR FERIADO
  contador: number = 0;
  ActualizarFeriados(form: any) {
    this.contador = 0;
    let feriado = {
      id: this.data.datosFeriado.id,
      fecha: form.fechaForm,
      descripcion: form.descripcionForm,
      fec_recuperacion: form.fechaRecuperacionForm,
      user_name: this.user_name,
      ip: this.ip
    };
    // VALIDAR INGRESO DE FECHAS
    if (feriado.fec_recuperacion === '' || feriado.fec_recuperacion === null) {
      feriado.fec_recuperacion = null;
      this.ValidarSinRecuperacion(feriado);
    }
    else {
      this.ValidarRecuperacion(feriado, form);
    }
  }

  // METODO PARA VALIDAR REGISTRO SIN FECHA DE RECUPERACION
  ValidarSinRecuperacion(feriado: any) {
    if (this.feriados.length != 0) {
      this.feriados.forEach((obj: any) => {
        if (obj.fecha_recuperacion) {
          if (this.validar.DarFormatoFecha(obj.fecha_recuperacion, 'yyyy-MM-dd') === this.validar.DarFormatoFecha(feriado.fecha, 'yyyy-MM-dd')) {
            this.contador = 1;
          }
        }
      })
      if (this.contador === 0) {
        this.RegistrarFeriado(feriado);
      }
      else {
        this.toastr.error(
          'La fecha asignada para feriado ya se encuentra registrada como una fecha de recuperación.',
          'Verificar fecha de recuperación.', {
          timeOut: 6000,
        })
      }
    }
    else {
      this.RegistrarFeriado(feriado);
    }
  }

  // METODO PARA VALIDAR REGISTRO CON FECHA DE RECUPERACION
  ValidarRecuperacion(feriado: any, form: any) {
    if (this.feriados.length != 0) {
      this.feriados.forEach((obj: any) => {
        if (feriado.fec_recuperacion) {
          if (obj.fecha.split('T')[0] === this.validar.DarFormatoFecha(feriado.fec_recuperacion, 'YYYY-MM-DD')) {
            this.contador = 1;
          }
        }
        if (obj.fecha_recuperacion) {
          if (this.validar.DarFormatoFecha(obj.fecha_recuperacion, 'yyyy-MM-dd') === this.validar.DarFormatoFecha(feriado.fecha, ('yyyy-MM-dd'))) {
            this.contador = 1;
          }
        }
      })
      if (this.contador === 0) {
        if (Date.parse(form.fechaForm) < Date.parse(feriado.fec_recuperacion)) {
          this.RegistrarFeriado(feriado);
        }
        else {
          this.toastr.error(
            'La fecha de recuperación debe ser posterior a la fecha del feriado registrado.',
            'Fecha de recuperación incorrecta', {
            timeOut: 6000,
          })
        }
      }
      else {
        this.toastr.error(
          'La fecha de recuperación se encuentra registrada como un feriado.',
          'Verificar fecha de recuperación', {
          timeOut: 6000,
        })
      }
    }
    else {
      this.RegistrarFeriado(feriado);
    }
  }

  // METODO PARAR REGISTRAR ACTUALIZACION EN BASE DE DATOS
  RegistrarFeriado(feriado: any) {
    this.habilitarprogress = true;
    this.rest.ActualizarUnFeriado(feriado).subscribe(response => {
      this.habilitarprogress = false;
      if (response.message === 'error') {
        this.toastr.error(
          'Verificar los datos ingresados.',
          'Ups!!! algo salio mal.', {
          timeOut: 6000,
        })
      }
      else if (response.message === 'existe') {
        this.toastr.warning('Nombre, fecha de recuperación o fecha de feriado ya existe en el sistema.', 'Upss!!! algo salio mal.', {
          timeOut: 6000,
        })
      }
      else {
        this.toastr.success('Operación exitosa.', 'Registro actualizado.', {
          timeOut: 6000,
        })
        this.CerrarVentana(feriado.id);
      }
    });
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.formulario.reset();
  }

  // METODO PARA CERRAR VENTANA DE REGISTRO
  CerrarVentana(opcion: number) {
    this.LimpiarCampos();
    this.ventana.close(opcion);
  }

}
