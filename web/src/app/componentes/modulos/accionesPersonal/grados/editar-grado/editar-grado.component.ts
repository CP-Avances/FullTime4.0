import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { CatGradoService } from 'src/app/servicios/modulos/modulo-acciones-personal/catGrado/cat-grado.service';


@Component({
  selector: 'app-editar-grado',
  standalone: false,
  templateUrl: './editar-grado.component.html',
  styleUrl: './editar-grado.component.css'
})

export class EditarGradoComponent {

  ips_locales: any = '';
  
  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // CONTROL DE LOS CAMPOS DEL FORMULARIO
  grado = new FormControl('', Validators.required);

  procesos: any = [];

  // ASIGNAR LOS CAMPOS EN UN FORMULARIO EN GRUPO
  public formulario = new FormGroup({
    gradoForm: this.grado,
  });

  constructor(
    private _grados: CatGradoService,
    private toastr: ToastrService,
    public ventana: MatDialogRef<EditarGradoComponent>,
    public validar: ValidacionesService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  ngOnInit(): void {
    this.ImprimirDatos();
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });
  }

  // METODO PARA MOSTRAR DATOS DEL REGISTRO
  ImprimirDatos() {
    this.formulario.patchValue({
      gradoForm: this.data.descripcion,
    })
  }

  // METODO PARA SALIR DEL REGISTRO
  Salir() {
    this.formulario.reset();
    this.ventana.close();
  }

  // METODO PARA VALIDAR INGRESO DE LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  // METODO PARA EDITAR DEL REGISTRO
  EditarGrado(form: any){
    let dataGrado = {
      id_grado: this.data.id,
      grado: form.gradoForm,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales
    };

    this._grados.EditarGrado(dataGrado).subscribe({
      next: (res: any) => {
        
          this.toastr.success(res.message, 'Registro actualizado.', {
            timeOut: 6000,
          });
          this.Salir();
        
      },error: (err) => {
        if(err.status == 300){
          this.toastr.warning(err.error.message, 'Advertencia.', {
            timeOut: 6000,
          });
        }else{
          this.toastr.error(err.error.message, 'Erro server', {
            timeOut: 6000,
          });
        }
      },
    })

  }

}
