import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { CatTipoCargosService } from 'src/app/servicios/configuracion/parametrizacion/catTipoCargos/cat-tipo-cargos.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';

@Component({
  selector: 'app-editar-tipo-cargo',
  templateUrl: './editar-tipo-cargo.component.html',
  styleUrls: ['./editar-tipo-cargo.component.css']
})

export class EditarTipoCargoComponent implements OnInit {
  ips_locales: any = '';

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  cargo = new FormControl('', Validators.required)

  public formulario = new FormGroup({
    cargo: this.cargo
  });

  constructor(
    private cargos_: CatTipoCargosService,
    private toastr: ToastrService, // VARIABLE DE MENSAJES DE NOTIFICACIONES
    public validar: ValidacionesService,
    public ventana: MatDialogRef<EditarTipoCargoComponent>, // VARIABLE DE MANEJO DE VENTANAS
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');  
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    }); 
    this.ImprimirDatos();
  }

  // METODO PARA LIMPIAR DATOS DE FORMULARIO
  LimpiarCampos() {
    this.formulario.reset();
  }

  // METODO PARA MOSTRAR DATOS EN FORMULARIO
  ImprimirDatos() {
    this.formulario.setValue({
      cargo: this.data.cargo
    })
  }

  // METODO PARA ACTUALIZAR CARGO
  EditarCargo(form: any) {
    let tipoCargo = {
      id: this.data.id,
      cargo: form.cargo,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
    };
    this.cargos_.ActualizarCargo(tipoCargo).subscribe(response => {
      if (response.status == '200') {
        this.toastr.success(response.message, 'Operación exitosa.', {
          timeOut: 4000,
        });
        this.CerrarVentana();
      } else if (response.status == '300') {
        this.toastr.warning(response.message, 'Operación fallida.', {
          timeOut: 4000,
        });
      } else {
        this.toastr.error(response.message, 'Error.', {
          timeOut: 4000,
        });
      }
    }, error => {
      this.toastr.info(error, 'Error', {
        timeOut: 4000,
      })
    });
  }

  // METODO PARA VALIDAR INGRESO DE LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  // METODO PARA CERRAR VENTANA DE REGISTRO
  CerrarVentana() {
    this.LimpiarCampos();
    this.ventana.close();
  }


}
