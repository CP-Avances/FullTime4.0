// IMPORTAR LIBRERIAS
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef } from '@angular/material/dialog';
import { Component } from '@angular/core';

// IMPORTAR SERVICIOS
import { VacunacionService } from 'src/app/servicios/usuarios/empleado/empleadoVacunas/vacunacion.service';
import { CatVacunasService } from 'src/app/servicios/usuarios/catVacunas/cat-vacunas.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';

@Component({
  selector: 'app-tipo-vacuna',
  templateUrl: './tipo-vacuna.component.html',
  styleUrls: ['./tipo-vacuna.component.css']
})

export class TipoVacunaComponent {


  vacuna = new FormControl('', Validators.required);
  // FORMULARIO DENTRO DE UN GRUPO
  public formulario = new FormGroup({
    vacuna: this.vacuna,
  });

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    private rest: CatVacunasService, // VARIABLE DE CONSULTA DE DATOS DE TIPOS VACUNAS
    public toastr: ToastrService, // VARIABLE PARA MANEJO DE NOTIFICACIONES,
    public ventana: MatDialogRef<TipoVacunaComponent>, // VARIABLE DE MANEJO DE VENTANAS
    public restVacuna: VacunacionService, // VARIABLE DE CONSULTA DE DATOS DE VACUNAS
    public validar: ValidacionesService,
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
  }

  LimpiarCampos() {
    this.formulario.reset();
  }

  // METODO PARA REGISTRAR TIPO DE VACUNA
  GuardarTipoVacuna(form: any) {
    let vacuna = {
      vacuna: form.vacuna,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
    }
    this.rest.CrearVacuna(vacuna).subscribe(response => {
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


  // METODO PARA CERRAR VENTANA
  CerrarVentana() {
    this.LimpiarCampos();

    this.ventana.close();
  }

}
