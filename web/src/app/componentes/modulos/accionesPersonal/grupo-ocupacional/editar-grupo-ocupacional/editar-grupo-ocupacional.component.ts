import { Component, Inject, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { CatGrupoOcupacionalService } from 'src/app/servicios/modulos/modulo-acciones-personal/catGrupoOcupacional/cat-grupo-ocupacional.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-editar-grupo-ocupacional',
  templateUrl: './editar-grupo-ocupacional.component.html',
  styleUrl: './editar-grupo-ocupacional.component.css'
})
export class EditarGrupoOcupacionalComponent implements OnInit{

  ips_locales: any = '';

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // CONTROL DE LOS CAMPOS DEL FORMULARIO
  grupo = new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z ]*')]);
  numero_partida = new FormControl('', [Validators.required, Validators.pattern('[1-9]*')]);

  procesos: any = [];

  // ASIGNAR LOS CAMPOS EN UN FORMULARIO EN GRUPO
  public formulario = new FormGroup({
    grupoForm: this.grupo,
    numero_partidaForm: this.numero_partida
  });

  constructor(
    private _grupoOp: CatGrupoOcupacionalService,
    private toastr: ToastrService,
    public validar: ValidacionesService,
    public ventana: MatDialogRef<EditarGrupoOcupacionalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ){}

  
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
      grupoForm: this.data.descripcion,
      numero_partidaForm: this.data.numero_partida
    })
  }

  // METODO PARA VALIDAR INGRESO DE NUMEROS
  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }
  // METODO PARA VALIDAR INGRESO DE LETRA
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  // METODO DE VALIDACION DE CAMPOS
  ObtenerMensajeErrorNombre() {
    return this.grupo.hasError('pattern') ? 'No se admite el ingreso de letras.' : '';
  }
  
  // METODO DE VALIDACION DE CAMPOS
  ObtenerMensajeErrorNumero() {
    return this.numero_partida.hasError('pattern') ? 'No se admite el ingreso de letras.' : '';
  }

  // METODO PARA SALIR DEL REGISTRO
  Salir() {
    this.formulario.reset();
    this.ventana.close();
  }

  // METODO PARA EDITAR DEL REGISTRO
  EditarGrupo(form: any){
    let dataGrado = {
      id_grupo: this.data.id,
      grupo: form.grupoForm,
      numero_partida: form.numero_partidaForm,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales
    };

    this._grupoOp.EditarGrupoOcupacion(dataGrado).subscribe({
      next: (res: any) => {
        if(res.codigo != 200){
          this.toastr.warning(res.message, 'Error registro.', {
            timeOut: 6000,
          });
        }else{
          this.toastr.success(res.message, 'Registro actualizado.', {
            timeOut: 6000,
          });
          this.Salir();
        }
        
      },error: (err) => {
        this.toastr.error(err.error.message, 'Erro server', {
          timeOut: 6000,
        });
      },
    })

  }

}
