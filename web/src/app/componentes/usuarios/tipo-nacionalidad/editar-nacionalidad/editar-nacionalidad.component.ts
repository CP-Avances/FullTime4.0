import { Component,OnInit, Inject  } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { NacionalidadService } from 'src/app/servicios/usuarios/catNacionalidad/nacionalidad.service';

@Component({
  selector: 'app-editar-nacionalidad',
  standalone: false,
  templateUrl: './editar-nacionalidad.component.html',
  styleUrl: './editar-nacionalidad.component.css'
})

export class EditarNacionalidadComponent {
  ips_locales: any = '';

  constructor(
    private nacionalidadS: NacionalidadService,

    private toastr: ToastrService,
    public ventana: MatDialogRef<EditarNacionalidadComponent>,
    public validar: ValidacionesService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

    // VARIABLES PARA AUDITORIA
    user_name: string | null;
    ip: string | null;
  
    nacionalidadF = new FormControl('', [Validators.required, Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{3,48}")]);
  
  
  
    public formulario = new FormGroup({
      NacionalidadForm: this.nacionalidadF,
    });

    ngOnInit(): void {
      this.user_name = localStorage.getItem('usuario');
      this.ip = localStorage.getItem('ip');  
      this.validar.ObtenerIPsLocales().then((ips) => {
        this.ips_locales = ips;
      }); 
  
      this.ImprimirDatos();
    }

    
  // METODO PARA VALIDAR REGISTRO DE LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  LimpiarCampos() {
    this.formulario.reset();
  }
  // METODO PARA CERRAR VENTANA
  CerrarVentana() {
    this.LimpiarCampos();
    this.ventana.close();
  }



  // METODO PARA ACTUALIZAR NACIONALIDAD
  ActualizarNacionalidad(form: any) {
    let nombreNacionalidad = form.NacionalidadForm.trim();
    let nombre_nacionalidad = nombreNacionalidad.toUpperCase();
    let nacionalidadFormateada = nombreNacionalidad.charAt(0).toUpperCase() + nombreNacionalidad.slice(1).toLowerCase();
  
    let nacionalidad = {
      id: this.data.id,
      nacionalidad: nacionalidadFormateada,
      user_name: this.user_name,
      ip: this.ip,
      ip_local: this.ips_locales,
    };
  
    // Si el nombre no ha cambiado, actualiza directamente
    if (nombre_nacionalidad === this.data.nombre.toUpperCase()) {
      this.AlmacenarTitulo(nacionalidad);
    } else {
      // Verifica duplicado en toda la lista
      this.nacionalidadS.ListarNacionalidad().subscribe((lista: any) => {
        const existe = lista.some(n => n.nombre.toUpperCase() === nombre_nacionalidad);
  
        if (existe) {
          this.toastr.warning('La nacionalidad ingresada ya existe en el sistema.', 'Ups!!! algo salió mal.', {
            timeOut: 3000,
          });
        } else {
          this.AlmacenarTitulo(nacionalidad);
        }
      });
    }
  }  



  // METODO PARA ALMACENAR DATOS TITULO EN EL SISTEMA
  AlmacenarTitulo(titulo: any) {
    this.nacionalidadS.ActualizarUnNacionalidad(titulo).subscribe(response => {
      this.toastr.success('Operación exitosa.', 'Registro actualizado.', {
        timeOut: 6000,
      });
      this.CerrarVentana();
    });
  }

   // METODO PARA MOSTRAR DATOS EN FORMULARIO
   ImprimirDatos() {
    this.formulario.setValue({
      NacionalidadForm: this.data.nombre
    })
  }


}
