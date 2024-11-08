import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';

@Component({
  selector: 'app-confirmar-desactivados',
  templateUrl: './confirmar-crearCarpeta.component.html',
  styleUrls: ['./confirmar-crearCarpeta.component.css']
})

export class ConfirmarCrearCarpetaComponent implements OnInit {

  empleados: any = [];
  permisos: boolean = false;
  vacaciones: boolean = false;
  horasExtras: boolean = false;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    private toastr: ToastrService,
    private restE: EmpleadoService,
    public ventana: MatDialogRef<ConfirmarCrearCarpetaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

    this.empleados = this.data.empleados.map((obj: any) => {
      return obj;
    });

    this.permisos = this.data.permisos;
    this.vacaciones = this.data.vacaciones;
    this.horasExtras = this.data.horasExtras;

  }

  // METODO PARA GUARDAR CAMBIOS EN BASE DE DATOS
  ConfirmarCrearCarpetaEmpleados() {
    const datos = {
      empleados: this.empleados,
      permisos: this.permisos,
      vacaciones: this.vacaciones,
      horasExtras: this.horasExtras,
    }

    this.restE.CrearCarpetasUsuarios(datos).subscribe(res => {
      if (res.error) {
        this.toastr.error(res.message, '', {
          timeOut: 6000,
        });
      } else {
        this.toastr.success(res.message, '', {
          timeOut: 6000,
        });
      }
    });

    this.ventana.close(true);
  }

}

