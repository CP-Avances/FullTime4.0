import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { GenerosService } from 'src/app/servicios/usuarios/catGeneros/generos.service';
import { MatDialogRef } from '@angular/material/dialog';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';

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
    private genero: GenerosService,
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

  // METODO PARA GUARDAR DATOS DE NIVELES DE TITULO Y VERIFICAR DUPLICIDAD
  InsertarGenero(form: any) {
    let genero = {
      genero: form.generoForm,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
    };
    // VERIIFCAR DUPLICIDAD
    let nombre_genero = (genero.genero).toUpperCase();
    this.genero.BuscarGenero(nombre_genero).subscribe(response => {
      this.toastr.warning('El genero ingresado ya existe en el sistema.', 'Ups!!! algo salio mal.', {
        timeOut: 3000,
      });
    }, vacio => {
      // GUARDAR DATOS EN EL SISTEMA
      this.GuardarDatos(genero);
    });
  }

  // METODO PARA ALMACENRA EN LA BASE DE DATOS
  GuardarDatos(genero: any) {
    this.genero.RegistrarGenero(genero).subscribe(response => {
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
