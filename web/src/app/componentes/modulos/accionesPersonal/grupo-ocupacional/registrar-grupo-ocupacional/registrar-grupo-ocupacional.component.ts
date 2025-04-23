import { MatDialogRef } from '@angular/material/dialog';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { ToastrService } from 'ngx-toastr';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { CatGrupoOcupacionalService } from 'src/app/servicios/modulos/modulo-acciones-personal/catGrupoOcupacional/cat-grupo-ocupacional.service';

@Component({
  selector: 'app-registrar-grupo-ocupacional',
  standalone: false,
  templateUrl: './registrar-grupo-ocupacional.component.html',
  styleUrl: './registrar-grupo-ocupacional.component.css'
})

export class RegistrarGrupoOcupacionalComponent implements OnInit {

  ips_locales: any = '';

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // CONTROL DE LOS CAMPOS DEL FORMULARIO
  grupo = new FormControl('', Validators.required);

  procesos: any = [];

  // ASIGNAR LOS CAMPOS EN UN FORMULARIO EN GRUPO
  public formulario = new FormGroup({
    grupoForm: this.grupo,
  });

  constructor(
    private _grupoOp: CatGrupoOcupacionalService,
    private toastr: ToastrService,
    public validar: ValidacionesService,
    public ventana: MatDialogRef<RegistrarGrupoOcupacionalComponent>,
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });
  }

  InsertarGrupo(form: any) {
    let dataGrupo = {
      grupo: form.grupoForm,
      user_name: this.user_name,
      ip: this.ip,
      ip_local: this.ips_locales
    };
    this._grupoOp.IngresarGrupoOcupacion(dataGrupo).subscribe({
      next: (respuesta: any) => {
        this.toastr.success(respuesta.message, 'Registro guardado.', {
          timeOut: 6000,
        });
        this.CerrarVentana();
      }, error: (err) => {
        if (err.status == 300) {
          this.toastr.warning(err.error.message, 'Advertencia.', {
            timeOut: 6000,
          });
        } else {
          this.toastr.error(err.error.message, 'Ups! algo salio mal.', {
            timeOut: 6000,
          });
        }
      },
    })
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.formulario.reset();
  }

  // METODO PARA CERRAR VENTANA
  CerrarVentana() {
    this.LimpiarCampos();
    this.ventana.close();
  }

}
