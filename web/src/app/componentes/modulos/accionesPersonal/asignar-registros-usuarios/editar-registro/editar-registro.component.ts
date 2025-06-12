import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { ProcesoService } from 'src/app/servicios/modulos/modulo-acciones-personal/catProcesos/proceso.service';
import { CatGradoService } from 'src/app/servicios/modulos/modulo-acciones-personal/catGrado/cat-grado.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { CatGrupoOcupacionalService } from 'src/app/servicios/modulos/modulo-acciones-personal/catGrupoOcupacional/cat-grupo-ocupacional.service';

@Component({
  selector: 'app-editar-registro',
  standalone: false,
  templateUrl: './editar-registro.component.html',
  styleUrl: './editar-registro.component.css'
})

export class EditarRegistroComponent {

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;
  ips_locales: any = '';
  idEmpleado: number;
  name_sucursal: string = '';

  @Input() dato: any;
  tipoAccionPersonal: string = ''
  listadoAccion: any;
  infoAccion: any

  idListaAcc = new FormControl('', [Validators.required])
  ValorEstado = new FormControl('', [Validators.required])

  public formulario = new FormGroup({
    idlistForm: this.idListaAcc,
    estadoForm: this.ValorEstado
  });

  estados: any = [
    { value: true, item: 'ACTIVO' },
    { value: false, item: 'INACTIVO' }
  ]

  id: any
  id_empleado: any

  constructor(
    public ventana: MatDialogRef<EditarRegistroComponent>,
    public toastr: ToastrService,
    private validar: ValidacionesService,
    private restPr: ProcesoService,
    private restGra: CatGradoService,
    private restGrupo: CatGrupoOcupacionalService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });

    this.listadoAccion = []
    this.tipoAccionPersonal = this.data.tipo.toUpperCase();
    this.listadoAccion = this.data.listAccion;
    this.infoAccion = this.data.info;
    this.LlenarFormulario()
    this.id = this.data.info.id
    this.id_empleado = this.data.id_empleado
  }

  // METODO PARA MOSTRAR DATOS EN FORMULARIO
  LlenarFormulario() {
    if (this.tipoAccionPersonal == 'PROCESO') {
      this.formulario.patchValue({
        idlistForm: this.infoAccion.id_proceso,
        estadoForm: this.infoAccion.estado
      })
    } else if (this.tipoAccionPersonal == 'GRADOS') {
      this.formulario.patchValue({
        idlistForm: this.infoAccion.id_grado,
        estadoForm: this.infoAccion.estado
      })
    } else {
      this.formulario.patchValue({
        idlistForm: this.infoAccion.id_grupo_ocupacional,
        estadoForm: this.infoAccion.estado
      })
    }
  }

  // METODO PARA VALIDAR SOLO INGRESO DE LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  CerrarVentana(): void {
    this.ventana.close(false);
  }

  Confirmar(): void {
    const data = {
      id_empleado: this.id_empleado,
      id: this.id,
      id_accion: this.formulario.value.idlistForm,
      estado: this.formulario.value.estadoForm,
      user_name: this.user_name,
      ip: this.ip,
      ip_local: this.ips_locales
    }
    if (this.tipoAccionPersonal == 'PROCESO') {
      this.restPr.ActualizarProcesoEmple(data).subscribe({
        next: (value: any) => {
          this.toastr.success(value.message, 'Correcto.', {
            timeOut: 4500,
          });
        }, error: (err) => {
          this.toastr.warning(err.error.message, 'Advertencia.', {
            timeOut: 4500,
          });
        },
      })
    }
    else if (this.tipoAccionPersonal == 'GRADOS') {
      this.restGra.ActualizarGradoEmple(data).subscribe({
        next: (value: any) => {
          this.toastr.success(value.message, 'Correcto.', {
            timeOut: 4500,
          });
        }, error: (err) => {
          this.toastr.warning(err.error.message, 'Advertencia.', {
            timeOut: 4500,
          });
        },
      })
    }
    else {
      this.restGrupo.ActualizarGrupoEmple(data).subscribe({
        next: (value: any) => {
          this.toastr.success(value.message, 'Correcto.', {
            timeOut: 4500,
          });
        }, error: (err) => {
          this.toastr.warning(err.error.message, 'Advertencia.', {
            timeOut: 4500,
          });
        },
      })
    }
    this.ventana.close(true);
  }

}
