import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';

@Component({
  selector: 'app-confirmar-desactivados',
  standalone: false,
  templateUrl: './confirmar-desactivados.component.html',
  styleUrls: ['./confirmar-desactivados.component.css']
})

export class ConfirmarDesactivadosComponent implements OnInit {
  ips_locales: any = '';

  ids: any = [];
  contenidoHabilitar: boolean = false;
  contenidoDeshabilitar: boolean = false;
  contenidoReactivar: boolean = false;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    private toastr: ToastrService,
    private restE: EmpleadoService,
    public ventana: MatDialogRef<ConfirmarDesactivadosComponent>,
    public validar: ValidacionesService,
    @Inject(MAT_DIALOG_DATA) public Empleados: any,
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');  this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    }); 

    this.ids = this.Empleados.lista.map((obj: any) => {
      return obj.id
    });
    this.Opcion();
  }

  // METODO PARA ACTIVAR - INACTIVAR - REACTIVAR USUARIO
  Opcion() {
    // INACTIVAR EMPLEADOS
    if (this.Empleados.opcion === 1) {
      this.contenidoDeshabilitar = true;

      // ACTIVAR EMPLEADOS
    } else if (this.Empleados.opcion === 2) {
      this.contenidoHabilitar = true;

      // REACTIVAR EMPLEADOS
    } else if (this.Empleados.opcion === 3) {
      this.contenidoReactivar = true;
    }
  }

  // METODO PARA GUARDAR CAMBIOS EN BASE DE DATOS
  ConfirmarListaEmpleados() {
    this.ventana.close(true);
  }

}
