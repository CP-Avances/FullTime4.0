// IMPORTAR LIBRERIAS
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ThemePalette } from '@angular/material/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as moment from 'moment';

// IMPORTAR SERVICIOS
import { FeriadosService } from 'src/app/servicios/catalogos/catFeriados/feriados.service';

@Component({
  selector: 'app-registrar-feriados',
  templateUrl: './registrar-feriados.component.html',
  styleUrls: ['./registrar-feriados.component.css'],
})

export class RegistrarFeriadosComponent implements OnInit {

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  fechaRecuperacionF = new FormControl('');
  descripcionF = new FormControl('');
  fechaF = new FormControl('', Validators.required);

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    fechaRecuperacionForm: this.fechaRecuperacionF,
    descripcionForm: this.descripcionF,
    fechaForm: this.fechaF,
  });

  // VARIABLES PROGRESS SPINNER
  habilitarprogress: boolean = false;
  mode: ProgressSpinnerMode = 'indeterminate';
  color: ThemePalette = 'primary';
  value = 10;

  constructor(
    public ventana: MatDialogRef<RegistrarFeriadosComponent>,
    private rest: FeriadosService,
    private toastr: ToastrService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.ObtenerFeriados();
  }

  // METODO PARA CONSULTAR FERIADOS
  feriados: any = [];
  ObtenerFeriados() {
    this.feriados = [];
    this.rest.ConsultarFeriado().subscribe(response => {
      this.feriados = response;
    })
  }

  // METODO PARA GUARDAR DATOS 
  contador: number = 0;
  InsertarFeriado(form: any) {
    this.contador = 0;
    let feriado = {
      fecha: form.fechaForm,
      descripcion: form.descripcionForm,
      fec_recuperacion: form.fechaRecuperacionForm
    };
    // VERIFICAR INGRESO DE FECHAS
    if (feriado.fec_recuperacion === '' || feriado.fec_recuperacion === null) {
      feriado.fec_recuperacion = null;
      this.VerificarSinRecuperacion(feriado);
    }
    else {
      this.ValidarFechaRecuperacion(feriado, form);
    }
  }

  // METODO PARA VALIDAR REGISTRO SIN FECHA DE RECUPERACION
  VerificarSinRecuperacion(feriado: any) {
    // VERIFICAMOS SI EXISTE REGISTROS
    if (this.feriados.length != 0) {
      this.feriados.forEach(obj => {
        if (moment(obj.fec_recuperacion).format('YYYY-MM-DD') === moment(feriado.fecha).format('YYYY-MM-DD')) {
          this.contador = 1;
        }
      })
      if (this.contador === 0) {
        this.CrearFeriado(feriado);
      }
      else {
        this.toastr.error('La fecha asignada para feriado ya se encuentra registrada como una fecha de recuperación.', 'Verificar fecha de recuperación.', {
          timeOut: 6000,
        })
      }
    }
    else {
      this.CrearFeriado(feriado);
    }
  }

  // VALIDAR REGISTRO CON FECHA DE RECUPERACION
  ValidarFechaRecuperacion(feriado: any, form: any) {
    // VERIFICAMOS SI EXISTE REGISTROS
    if (this.feriados.length != 0) {
      this.feriados.forEach(obj => {
        if (obj.fecha.split('T')[0] === moment(feriado.fec_recuperacion).format('YYYY-MM-DD') ||
          moment(obj.fec_recuperacion).format('YYYY-MM-DD') === moment(feriado.fecha).format('YYYY-MM-DD')) {
          this.contador = 1;
        }
      })
      if (this.contador === 0) {
        if (Date.parse(form.fechaForm) < Date.parse(feriado.fec_recuperacion)) {
          this.CrearFeriado(feriado);
        }
        else {
          this.toastr.error('La fecha de recuperación debe ser posterior a la fecha del feriado registrado.', 'Fecha de recuperación incorrecta', {
            timeOut: 6000,
          })
        }
      }
      else {
        this.toastr.error('La fecha asignada para feriado ya se encuentra registrada como una fecha de recuperación o la fecha de recuperación ya se encuentra registrada como un feriado', 'Verificar fecha de recuperación', {
          timeOut: 6000,
        })
      }
    }
    else {
      this.CrearFeriado(feriado);
    }
  }

  // METODO PARA REGISTRAR DATOS EN BASE DE DATOS
  CrearFeriado(datos: any) {
    this.habilitarprogress = true;
    this.rest.CrearNuevoFeriado(datos).subscribe(response => {
      this.habilitarprogress = false;
      if (response.message === 'error') {
        this.toastr.error('La fecha del feriado o la fecha de recuperación se encuentran dentro de otro registro.', 'Upss!!! algo salio mal.', {
          timeOut: 6000,
        })
      }
      else {
        this.toastr.success('Operación exitosa.', 'Registro guardado.', {
          timeOut: 6000,
        })
        this.ventana.close(true)
        this.router.navigate(['/verFeriados/', response.id]);
      }
    });
  }

  // METODO PARA CERRAR VENTANA DE REGISTRO
  CerrarVentana() {
    this.ventana.close(false);
  }

}
