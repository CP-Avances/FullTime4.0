import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { CatGradoService } from 'src/app/servicios/modulos/modulo-acciones-personal/catGrado/cat-grado.service';

@Component({
  selector: 'app-registrar-grado',
  templateUrl: './registrar-grado.component.html',
  styleUrl: './registrar-grado.component.css'
})
export class RegistrarGradoComponent  implements OnInit{

  ips_locales: any = '';

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // CONTROL DE LOS CAMPOS DEL FORMULARIO
  grado = new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z ]*')]);

  procesos: any = [];

  // ASIGNAR LOS CAMPOS EN UN FORMULARIO EN GRUPO
  public formulario = new FormGroup({
    gradoForm: this.grado,
  });

  constructor(
    private _grados: CatGradoService,
    private toastr: ToastrService,
    public validar: ValidacionesService,
    public ventana: MatDialogRef<RegistrarGradoComponent>,
  ){}

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');  
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });   
  }

  // METODO DE VALIDACION DE CAMPOS
  ObtenerMensajeErrorNombre() {
    if (this.grado.hasError('required')) {
      return 'Campo obligatorio.';
    }
    return this.grado.hasError('pattern') ? 'No ingresar números.' : '';
  }

  // METODO PARA REGISTRAR PROCESO
  InsertarGrado(form: any) {
    let dataGrado = {
      grado: form.gradoForm,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales
    };
    this._grados.IngresarGrado(dataGrado).subscribe({
      next: (respuesta: any) => {
        if(respuesta.codigo != 200){
          this.toastr.warning(respuesta.message, 'Error registro.', {
            timeOut: 6000,
          });
        }else{
          this.toastr.success(respuesta.message, 'Registro guardado.', {
            timeOut: 6000,
          });
          this.CerrarVentana();
        }

      }, error: (err) => {
        this.toastr.error(err.error.message, 'Erro server', {
          timeOut: 6000,
        });
      },
    })
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.formulario.reset();
  }

  // METODO PARA VALIDAR INGRESO DE LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  // METODO PARA CERRAR VENTANA
  CerrarVentana() {
    this.LimpiarCampos();
    this.ventana.close();
  }

}
