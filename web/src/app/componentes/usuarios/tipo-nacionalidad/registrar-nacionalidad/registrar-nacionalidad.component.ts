import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { GenerosService } from 'src/app/servicios/usuarios/catGeneros/generos.service';
import { MatDialogRef } from '@angular/material/dialog';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { NacionalidadService } from 'src/app/servicios/usuarios/catNacionalidad/nacionalidad.service';


@Component({
  selector: 'app-registrar-nacionalidad',
  standalone: false,
  
  templateUrl: './registrar-nacionalidad.component.html',
  styleUrl: './registrar-nacionalidad.component.css'
})
export class RegistrarNacionalidadComponent {

  
  ips_locales: any = '';

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  nacionalidadI = new FormControl('', Validators.required)

  public formulario = new FormGroup({
    nacionalidadForm: this.nacionalidadI
  });

  constructor(
    private toastr: ToastrService,
    private nacionalidad: NacionalidadService,
    public ventana: MatDialogRef<RegistrarNacionalidadComponent>,
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
   InsertarNacionalidad(form: any) {
    let nacionalidad = {
      nacionalidad: form.nacionalidadForm,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
    };
    // VERIIFCAR DUPLICIDAD
    let nombre_nacionalidad = (nacionalidad.nacionalidad).toUpperCase();
    this.nacionalidad.BuscarNacionalidad(nombre_nacionalidad).subscribe(response => {
      this.toastr.warning('La nacionalidad ingresada ya existe en el sistema.', 'Ups!!! algo salio mal.', {
        timeOut: 3000,
      });
    }, vacio => {
      // GUARDAR DATOS EN EL SISTEMA
      this.GuardarDatos(nacionalidad);
    });
  }

  // METODO PARA ALMACENRA EN LA BASE DE DATOS
  GuardarDatos(nacionalidad: any) {
    this.nacionalidad.RegistrarNacionalidad(nacionalidad).subscribe(response => {
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
