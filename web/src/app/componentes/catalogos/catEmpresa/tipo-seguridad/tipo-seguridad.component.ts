import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';

import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { ThemePalette } from '@angular/material/core';

@Component({
  selector: 'app-tipo-seguridad',
  templateUrl: './tipo-seguridad.component.html',
  styleUrls: ['./tipo-seguridad.component.css']
})

export class TipoSeguridadComponent implements OnInit {

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  tipoF = new FormControl('', [Validators.required]);

  // ASIGNACIÓN DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    tipoForm: this.tipoF
  });

  /**
   * VARIABLES PROGRESS SPINNER
   */
  habilitarprogress: boolean = false;
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 10;

  constructor(
    private rest: EmpresaService,
    private toastr: ToastrService,
    public ventana: MatDialogRef<TipoSeguridadComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.ImprimirDatos();
  }

  // METODO PARA IMPRIMIR DATOS EN FORMULARIO
  ImprimirDatos() {

    if (this.data.seg_contrasena != null && this.data.seg_contrasena != false) {
      this.formulario.patchValue({ tipoForm: 'contrasena' });
    }

    if (this.data.seg_frase != null && this.data.seg_frase != false) {
      this.formulario.patchValue({ tipoForm: 'frase' });
    }

    if (this.data.seg_ninguna != null && this.data.seg_ninguna != false) {
      this.formulario.patchValue({ tipoForm: 'ninguna' });
    }

  }

  // METODO PARA CAPTURAR DATOS DE SEGURIDAD
  InsertarEmpresa(form: any) {
    this.habilitarprogress = true;
    let datosEmpresa = {
      seg_contrasena: false,
      seg_ninguna: false,
      seg_frase: false,
      id: parseInt(localStorage.getItem('empresa') as string)
    };
    if (form.tipoForm === 'contrasena') {
      datosEmpresa.seg_contrasena = true;
    }
    else if (form.tipoForm === 'frase') {
      datosEmpresa.seg_frase = true;
    }
    else if (form.tipoForm === 'ninguna') {
      datosEmpresa.seg_ninguna = true;
    }

    this.GuardarDatos(datosEmpresa);
    this.CerrarVentana(true);
  }

  // METODO PARA GUARDAR DATOS DE SEGURIDAD
  GuardarDatos(datos: any) {
    this.habilitarprogress = true;
    this.rest.ActualizarSeguridad(datos).subscribe(response => {
      this.LimpiarCampos();
      this.toastr.success('Operación exitosa.', 'Datos de seguridad registrados.', {
        timeOut: 6000,
      })
      this.habilitarprogress = false
    });
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.formulario.reset();
  }

  // METODO PARA CERRAR VENTANA
  CerrarVentana(evento: boolean) {
    this.LimpiarCampos();
    this.ventana.close(evento);
  }

}
