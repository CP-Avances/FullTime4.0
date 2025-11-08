import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Component } from '@angular/core';

import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { GenerosService } from 'src/app/servicios/usuarios/catGeneros/generos.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-registrar-genero',
  standalone: false,
  templateUrl: './registrar-genero.component.html',
  styleUrl: './registrar-genero.component.css'
})

export class RegistrarGeneroComponent {

  ips_locales: any = '';

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  generoI = new FormControl('', Validators.required)

  public formulario = new FormGroup({
    generoForm: this.generoI
  });

  constructor(
    private toastr: ToastrService,
    private generoS: GenerosService,
    public ventana: MatDialogRef<RegistrarGeneroComponent>,
    public validar: ValidacionesService,
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip')
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });
  }

  InsertarGenero(form: any) {
    let nombreGenero = form.generoForm.trim();
    let nombre_genero = nombreGenero.toUpperCase(); 
    let generoFormateado = nombreGenero.charAt(0).toUpperCase() + nombreGenero.slice(1).toLowerCase(); 
  
    let genero = {
      genero: generoFormateado, 
      user_name: this.user_name,
      ip: this.ip,
      ip_local: this.ips_locales,
    };

    this.generoS.BuscarGenero(nombre_genero).subscribe(response => {
      this.toastr.warning('El género ingresado ya existe en el sistema.', 'Ups! algo salió mal.', {
        timeOut: 3000,
      });
    }, vacio => {
      this.GuardarDatos(genero);
    });
  }
  

  // METODO PARA ALMACENRA EN LA BASE DE DATOS
  GuardarDatos(genero: any) {
    this.generoS.RegistrarGenero(genero).subscribe(response => {
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
