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

  nacionalidades: any = [];
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
    private nacionalidadS: NacionalidadService,
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

  InsertarNacionalidad(form: any) {
    let nombreNacionalidad = form.nacionalidadForm.trim();
    let nombre_nacionalidad = nombreNacionalidad.toUpperCase();
    let nacionalidadFormateada = nombreNacionalidad.charAt(0).toUpperCase() + nombreNacionalidad.slice(1).toLowerCase();
  
    let nacionalidad = {
      nacionalidad: nacionalidadFormateada,
      user_name: this.user_name,
      ip: this.ip,
      ip_local: this.ips_locales,
    };
  
    this.nacionalidadS.ListarNacionalidad().subscribe((lista: any) => {
      const existe = lista.some(n => n.nombre.toUpperCase() === nombre_nacionalidad);
  
      if (existe) {
        this.toastr.warning('La nacionalidad ingresada ya existe en el sistema.', 'Ups! algo salió mal.', {
          timeOut: 3000,
        });
      } else {
        this.GuardarDatos(nacionalidad);
      }
    });
  }
  
  

  // METODO PARA ALMACENRA EN LA BASE DE DATOS
  GuardarDatos(nacionalidad: any) {
    this.nacionalidadS.RegistrarNacionalidad(nacionalidad).subscribe(response => {
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

  // METODO PARA BUSCAR NACIONALIDADES
  ListarNacionalidades() {

    this.nacionalidades = [];
    this.nacionalidadS.ListarNacionalidad().subscribe(datos => {
      this.nacionalidades = datos;
  })

}
}
