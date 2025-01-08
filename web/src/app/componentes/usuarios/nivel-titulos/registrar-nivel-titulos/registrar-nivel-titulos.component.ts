import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef } from '@angular/material/dialog';

import { NivelTitulosService } from 'src/app/servicios/usuarios/nivelTitulos/nivel-titulos.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';

@Component({
  selector: 'app-registrar-nivel-titulos',
  templateUrl: './registrar-nivel-titulos.component.html',
  styleUrls: ['./registrar-nivel-titulos.component.css']
})

export class RegistrarNivelTitulosComponent implements OnInit {
  ips_locales: any = '';

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  nombre = new FormControl('', Validators.required)

  public formulario = new FormGroup({
    nombreForm: this.nombre
  });

  constructor(
    private toastr: ToastrService,
    private nivel: NivelTitulosService,
    public ventana: MatDialogRef<RegistrarNivelTitulosComponent>,
    public validar: ValidacionesService,
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip')
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    }); 
  }

  // METODO PARA GUARDAR DATOS DE NIVELES DE TITULO Y VERIFICAR DUPLICIDAD
  InsertarNivelTitulo(form: any) {
    let nivel = {
      nombre: form.nombreForm,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
    };
    // VERIIFCAR DUPLICIDAD
    let nombre_nivel = (nivel.nombre).toUpperCase();
    this.nivel.BuscarNivelNombre(nombre_nivel).subscribe(response => {
      this.toastr.warning('El nombre ingresado ya existe en el sistema.', 'Ups!!! algo salio mal.', {
        timeOut: 3000,
      });
    }, vacio => {
      // GUARDAR DATOS EN EL SISTEMA
      this.GuardarDatos(nivel);
    });
  }

  // METODO PARA ALMACENRA EN LA BASE DE DATOS
  GuardarDatos(nivel: any) {
    this.nivel.RegistrarNivel(nivel).subscribe(response => {
      this.toastr.success('Operación exitosa.', 'Registro guardado.', {
        timeOut: 6000,
      });
      this.CerrarVentana();
    });
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.formulario.reset();
  }

  // METODO PARA VALIDAR INGRESO DE LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  // METODO PARA CERRAR VENTANA DE REGISTRO
  CerrarVentana() {
    this.LimpiarCampos();
    this.ventana.close();
  }


}
