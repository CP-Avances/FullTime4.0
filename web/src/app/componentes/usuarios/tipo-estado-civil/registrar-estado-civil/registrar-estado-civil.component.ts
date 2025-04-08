import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { ToastrService } from 'ngx-toastr';
import { MatDialogRef } from '@angular/material/dialog';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { EstadoCivilService } from 'src/app/servicios/usuarios/catEstadoCivil/estado-civil.service';

@Component({
  selector: 'app-registrar-estado-civil',
  standalone: false,

  templateUrl: './registrar-estado-civil.component.html',
  styleUrl: './registrar-estado-civil.component.css'
})
export class RegistrarEstadoCivilComponent {
  ips_locales: any = '';

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  estadoI = new FormControl('', Validators.required)

  public formulario = new FormGroup({
    estadoForm: this.estadoI
  });

  constructor(
    private toastr: ToastrService,
    private estadoS: EstadoCivilService,
    public ventana: MatDialogRef<RegistrarEstadoCivilComponent>,
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
  InsertarEstadoCivil(form: any) {
    let nombreEstado = form.estadoForm.trim();
    let nombre_estado = nombreEstado.toUpperCase(); 
    let estadoFormateado = nombreEstado.charAt(0).toUpperCase() + nombreEstado.slice(1).toLowerCase(); 
  
    let genero = {
      estado: estadoFormateado,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
    };
    // VERIIFCAR DUPLICIDAD
    let estado = (genero.estado).toUpperCase();
    this.estadoS.BuscarEstadoCivil(nombre_estado).subscribe(response => {
      this.toastr.warning('El estado civil ingresado ya existe en el sistema.', 'Ups!!! algo salio mal.', {
        timeOut: 3000,
      });
    }, vacio => {
      // GUARDAR DATOS EN EL SISTEMA
      this.GuardarDatos(genero);
    });
  }

  // METODO PARA ALMACENRA EN LA BASE DE DATOS
  GuardarDatos(estado: any) {
    this.estadoS.RegistrarEstadoCivil(estado).subscribe(response => {
      this.toastr.success('Operación exitosa.', 'Registro guardado.', {
        timeOut: 6000,
      });
      this.CerrarVentana();
    });
  }


  // METODO PARA CERRAR VENTANA DE REGISTRO
  CerrarVentana() {
    this.LimpiarCampos();
    this.ventana.close();
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.formulario.reset();
  }

  // METODO PARA VALIDAR INGRESO DE LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }


}
