// IMPORTAR LIBRERIAS
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

// IMPORTAR SERVICIOS
import { VacunacionService } from 'src/app/servicios/empleado/empleadoVacunas/vacunacion.service';

@Component({
  selector: 'app-tipo-vacuna',
  templateUrl: './tipo-vacuna.component.html',
  styleUrls: ['./tipo-vacuna.component.css']
})

export class TipoVacunaComponent implements OnInit {

  constructor(
    public restVacuna: VacunacionService, // VARIABLE DE CONSULTA DE DATOS DE VACUNAS
    public ventana: MatDialogRef<TipoVacunaComponent>, // VARIABLE DE MANEJO DE VENTANAS
    public toastr: ToastrService, // VARIABLE PARA MANEJO DE NOTIFICACIONES,
  ) { }

  ngOnInit(): void {
  }

  // VALIDACIONES DE CAMPOS DE FORMULARIO
  nombreF = new FormControl('', Validators.required);

  // FORMULARIO DENTRO DE UN GRUPO
  public formulario = new FormGroup({
    nombreForm: this.nombreF,
  });

  // METODO PARA REGISTRAR TIPO DE VACUNA
  GuardarTipoVacuna(form: any) {
    let tipoVacunas = {
      nombre: form.nombreForm,
    }
    // VERIFICAR NOMBRE DE VACUNA
    let vacuna = {
      nombre: (tipoVacunas.nombre).toUpperCase()
    }
    this.restVacuna.BuscarVacunaNombre(vacuna).subscribe(response => {
      if (response.message === 'vacio') {
        this.AlmacenarVacuna(tipoVacunas);
      }
      else if (response.message === 'ok') {
        this.toastr.warning('El tipo de vacuna ingresado ya se encuentra registrado.', '', {
          timeOut: 2000,
        })
      }
    });
  }

  // METODO PARA ALMACENAR EN EL SISTEMA
  AlmacenarVacuna(tipoVacunas: any) {
    this.restVacuna.CrearTipoVacuna(tipoVacunas).subscribe(response => {
      if (response.message === 'error') {
        this.toastr.error('El tipo de vacuna ingresado ya se encuentra registrado.', '', {
          timeOut: 2000,
        })
      }
      else {
        this.toastr.success('Registro guardado correctamente.', '', {
          timeOut: 2000,
        });
        this.ventana.close();
      }
    });
  }


  // METODO PARA CERRAR VENTANA
  CerrarVentana() {
    this.ventana.close();
  }

}
