import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { EmpresaService } from 'src/app/servicios/configuracion/parametrizacion/catEmpresa/empresa.service';

@Component({
  selector: 'app-tipo-seguridad',
  templateUrl: './tipo-seguridad.component.html',
  styleUrls: ['./tipo-seguridad.component.css']
})

export class TipoSeguridadComponent implements OnInit {

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  tipoF = new FormControl('', [Validators.required]);

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    tipoForm: this.tipoF
  });

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    private rest: EmpresaService,
    private toastr: ToastrService,
    public ventana: MatDialogRef<TipoSeguridadComponent>,
    public validar: ValidacionesService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

    this.ImprimirDatos();
  }

  // METODO PARA IMPRIMIR DATOS EN FORMULARIO
  ImprimirDatos() {

    if (this.data.seguridad_contrasena != null && this.data.seguridad_contrasena != false) {
      this.formulario.patchValue({ tipoForm: 'contrasena' });
    }

    if (this.data.seguridad_frase != null && this.data.seguridad_frase != false) {
      this.formulario.patchValue({ tipoForm: 'frase' });
    }

    if (this.data.seguridad_ninguna != null && this.data.seguridad_ninguna != false) {
      this.formulario.patchValue({ tipoForm: 'ninguna' });
    }

  }

  // METODO PARA CAPTURAR DATOS DE SEGURIDAD
  InsertarEmpresa(form: any) {
    let datosEmpresa = {
      seg_contrasena: false,
      seg_ninguna: false,
      seg_frase: false,
      id: parseInt(localStorage.getItem('empresa') as string),
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales
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
    this.rest.ActualizarSeguridad(datos).subscribe(response => {
      this.LimpiarCampos();
      this.toastr.success('Operación exitosa.', 'Datos de seguridad registrados.', {
        timeOut: 6000,
      })
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
