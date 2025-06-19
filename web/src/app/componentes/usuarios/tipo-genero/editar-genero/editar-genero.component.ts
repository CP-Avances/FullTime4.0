import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { GenerosService } from 'src/app/servicios/usuarios/catGeneros/generos.service';

@Component({
  selector: 'app-editar-genero',
  standalone: false,
  templateUrl: './editar-genero.component.html',
  styleUrl: './editar-genero.component.css'
})

export class EditarGeneroComponent {
  ips_locales: any = '';

  constructor(
    // private ntitulo: NivelTitulosService,
    // private rest: TituloService,
    private generoS: GenerosService,

    private toastr: ToastrService,
    public ventana: MatDialogRef<EditarGeneroComponent>,
    public validar: ValidacionesService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  generoF = new FormControl('', [Validators.required, Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{3,48}")]);



  public formulario = new FormGroup({
    GeneroForm: this.generoF,
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



  // MÉTODO PARA ACTUALIZAR GÉNERO
  ActualizarTitulo(form: any) {
    let nombreGenero = form.GeneroForm.trim();
    let nombre_genero = nombreGenero.toUpperCase(); 
    let generoFormateado = nombreGenero.charAt(0).toUpperCase() + nombreGenero.slice(1).toLowerCase();
  
    let genero = {
      id: this.data.id,
      genero: generoFormateado,
      user_name: this.user_name,
      ip: this.ip,
      ip_local: this.ips_locales,
    };
  
    if (generoFormateado === this.data.genero) {
      this.AlmacenarTitulo(genero);
    } else {
      this.generoS.BuscarGenero(nombre_genero).subscribe(response => {
        this.toastr.warning('El género ingresado ya existe en el sistema.', 'Ups! algo salió mal.', {
          timeOut: 3000,
        });
      }, vacio => {
        this.AlmacenarTitulo(genero);
      });
    }
  }
  

  // MÉTODO PARA ALMACENAR DATOS DEL GÉNERO ACTUALIZADO EN LA BASE DE DATOS
  AlmacenarTitulo(titulo: any) {
    this.generoS.ActualizarUnGenero(titulo).subscribe(response => {
      this.toastr.success('Operación exitosa.', 'Registro actualizado.', {
        timeOut: 6000,
      });
      this.CerrarVentana();
    });
  }

   // METODO PARA MOSTRAR DATOS EN FORMULARIO
   ImprimirDatos() {
    this.formulario.setValue({
      GeneroForm: this.data.genero
    })
  }


}
