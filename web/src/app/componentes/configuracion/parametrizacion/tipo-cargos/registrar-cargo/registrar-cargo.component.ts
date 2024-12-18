import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

import { CatTipoCargosService } from 'src/app/servicios/configuracion/parametrizacion/catTipoCargos/cat-tipo-cargos.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';

@Component({
  selector: 'app-registrar-cargo',
  templateUrl: './registrar-cargo.component.html',
  styleUrls: ['./registrar-cargo.component.css']
})

export class RegistrarCargoComponent implements OnInit {

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  cargo = new FormControl('', Validators.required)

  public formulario = new FormGroup({
    cargo: this.cargo
  });

  constructor(
    private toastr: ToastrService,
    private cargos_: CatTipoCargosService,
    public validar: ValidacionesService,
    public ventana: MatDialogRef<RegistrarCargoComponent>,
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.formulario.reset();
  }

  // METODO PARA GUARDAR DATOS DE NIVELES DE TITULO
  InsertarCargo(form: any) {
    let tipoCargo = {
      cargo: form.cargo,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
    };
    this.cargos_.CrearCargo(tipoCargo).subscribe(response => {
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
    });;
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
