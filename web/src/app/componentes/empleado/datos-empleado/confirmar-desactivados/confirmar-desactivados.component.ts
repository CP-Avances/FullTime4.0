import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';

@Component({
  selector: 'app-confirmar-desactivados',
  templateUrl: './confirmar-desactivados.component.html',
  styleUrls: ['./confirmar-desactivados.component.css']
})

export class ConfirmarDesactivadosComponent implements OnInit {

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
    @Inject(MAT_DIALOG_DATA) public Empleados: any,
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

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
    const datos = {
      arrayIdsEmpleados: this.ids,
      user_name: this.user_name,
      ip: this.ip
    }
    // INACTIVAR EMPLEADOS
    if (this.Empleados.opcion === 1) {
      this.restE.DesactivarVariosUsuarios(datos).subscribe(res => {
        this.toastr.success(res.message, '', {
          timeOut: 6000,
        })
      });
      this.ventana.close(true);

      // ACTIVAR EMPLEADOS
    } else if (this.Empleados.opcion === 2) {
      this.restE.ActivarVariosUsuarios(datos).subscribe(res => {
        this.toastr.success(res.message, '', {
          timeOut: 6000,
        })
      });
      this.ventana.close(true);

      // REACTIVAR EMPLEADOS
    } else if (this.Empleados.opcion === 3) {
      this.restE.ReActivarVariosUsuarios(datos).subscribe(res => {
        this.toastr.success(res.message, '', {
          timeOut: 6000,
        })
      });
      this.ventana.close(true);
    }
  }
  
}
