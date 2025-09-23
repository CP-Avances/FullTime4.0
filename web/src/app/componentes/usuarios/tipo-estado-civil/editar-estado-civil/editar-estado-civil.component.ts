import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { EstadoCivilService } from 'src/app/servicios/usuarios/catEstadoCivil/estado-civil.service';

@Component({
  selector: 'app-editar-estado-civil',
  standalone: false,
  templateUrl: './editar-estado-civil.component.html',
  styleUrl: './editar-estado-civil.component.css'
})

export class EditarEstadoCivilComponent {

  ips_locales: any = '';

  constructor(
    private estadoS: EstadoCivilService,

    private toastr: ToastrService,
    public ventana: MatDialogRef<EditarEstadoCivilComponent>,
    public validar: ValidacionesService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  estadoF = new FormControl('', [Validators.required, Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{3,48}")]);

  public formulario = new FormGroup({
    EstadoForm: this.estadoF,
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


      // METODO PARA ACTUALIZAR TITULO
  ActualizarTitulo(form: any) {
    let estado = {
      id: this.data.id,
      estado: form.EstadoForm,
      user_name: this.user_name,
      ip: this.ip, 
      ip_local: this.ips_locales,
    };
    // VERIFICAR SI EL REGISTRO TITULO ES DIFERENTE
    if ((estado.estado).toUpperCase() === (this.data.estado_civil).toUpperCase()) {
      this.AlmacenarTitulo(estado);
    }
    else {
      // METODO PARA VALIDAR DUPLICADOS
        
      
      this.estadoS.BuscarEstadoCivil((estado.estado).toUpperCase()).subscribe(response => {
        this.toastr.warning('El nombre ingresado ya existe en el sistema.', 'Ups! algo salio mal.', {
          timeOut: 3000,
        });
      }, vacio => {
        this.AlmacenarTitulo(estado);
      });
    }
  }


  // METODO PARA ALMACENAR DATOS TITULO EN EL SISTEMA
  AlmacenarTitulo(titulo: any) {
    this.estadoS.ActualizarUnEstadoCivil(titulo).subscribe(response => {
      this.toastr.success('Operación exitosa.', 'Registro actualizado.', {
        timeOut: 6000,
      });
      this.CerrarVentana();
    });
  }

  



  ImprimirDatos() {
    this.formulario.setValue({
      EstadoForm: this.data.estado_civil
    })
  }




}
