import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { NivelTitulosService } from 'src/app/servicios/usuarios/nivelTitulos/nivel-titulos.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';

@Component({
  selector: 'app-editar-nivel-titulo',
  templateUrl: './editar-nivel-titulo.component.html',
  styleUrls: ['./editar-nivel-titulo.component.css']
})

export class EditarNivelTituloComponent implements OnInit {

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  nombre = new FormControl('', Validators.required)

  public formulario = new FormGroup({
    nombreForm: this.nombre
  });

  constructor(
    private nivel: NivelTitulosService,
    private toastr: ToastrService,
    public ventana: MatDialogRef<EditarNivelTituloComponent>,
    public validar: ValidacionesService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

    this.ImprimirDatos();
  }

  // METODO PARA ACTUALIZAR NIVEL DE TITULO
  InsertarNivelTitulo(form: any) {
    let nivel = {
      id: this.data.id,
      nombre: form.nombreForm,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
    };
    // VERIFICAR SI EL NOMBRE DEL NIVEL ES DIFERENTE DEL REGISTRO
    if ((this.data.nombre).toUpperCase() === (nivel.nombre).toUpperCase()) {
      this.GuardarDatos(nivel);
    }
    else {
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
  }

  // METODO PARA ALMACENAR LOS DATOS EN EL SISTEMA
  GuardarDatos(nivel: any) {
    this.nivel.ActualizarNivelTitulo(nivel).subscribe(response => {
      this.toastr.success('Operación exitosa.', 'Registro actualizado.', {
        timeOut: 6000,
      });
      this.CerrarVentana();
    });
  }

  // METODO PARA MOSTRAR DATOS EN FORMULARIO
  ImprimirDatos() {
    this.formulario.setValue({
      nombreForm: this.data.nombre
    })
  }

  // METODO PARA LIMPIAR DATOS DE FORMULARIO
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
