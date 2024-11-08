import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';

import { MetodosComponent } from 'src/app/componentes/generales/metodoEliminar/metodos.component';

import { UsuarioService } from 'src/app/servicios/usuarios/usuario/usuario.service';

@Component({
  selector: 'app-visualizar-asignaciones',
  templateUrl: './visualizar-asignaciones.component.html',
  styleUrls: ['./visualizar-asignaciones.component.css']
})

export class VisualizarAsignacionesComponent implements OnInit {

  asignaciones: any = [];
  nombre: string;
  id: number;
  user_name: string;
  ip: string;

  verTabla: boolean = false;

  // ITEMS DE PAGINACION DE LA TABLA
  numero_pagina: number = 1;
  tamanio_pagina: number = 5;
  pageSizeOptions = [5, 10, 20, 50];

  constructor(
    private usuario: UsuarioService,
    public dialogo: MatDialog,
    public ventana: MatDialogRef<VisualizarAsignacionesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.user_name = this.data.user_name;
    this.nombre = this.data.nombre;
    this.ip = this.data.ip;
    this.id = this.data.id;

    this.ObtenerAsignaciones();

  }

  // METODO PARA OBTENER ASIGNACIONES
  ObtenerAsignaciones() {
    const data = {
      id_empleado: this.id,
    }
    this.usuario.BuscarUsuarioDepartamento(data).subscribe(data => {
      this.asignaciones = data;
      this.verTabla = true;
    });

  }

  // METODO PARA CONFIRMAR SI SE ELIMINA UN REGISTRO
  ConfirmarDeleteProceso(id: number) {
    this.dialogo.open(MetodosComponent, { width: '450px', data: 'eliminar' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarAsignacion(id);
        }
      });
  }

  // METODO PARA CONFIRMAR SI SE DESHABILITA UN REGISTRO
  ConfirmarDeshabilitarProceso(id: number) {
    this.dialogo.open(MetodosComponent, { width: '450px', data: 'deshabilitar' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.DeshabilitarAsignacion(id);
        }
      });
  }

  // METODO PARA ELIMINAR ASIGNACIONES
  EliminarAsignacion(id: number) {
    const datos = {
      id: id,
      user_name: this.user_name,
      ip: this.ip
    };
    this.usuario.EliminarUsuarioDepartamento(datos).subscribe(data => {
      this.asignaciones = this.asignaciones.filter((asignacion: any) => asignacion.id !== id);
    });
  }

  // METODO PARA DESHABILITAR ASIGNACIONES
  DeshabilitarAsignacion(id: number) {
    const asignacion = this.asignaciones.find((asignacion: any) => asignacion.id === id);
    const datos = {
      id: id,
      id_departamento: asignacion.id_departamento,
      principal: asignacion.principal,
      personal: false,
      administra: false,
      user_name: this.user_name,
      ip: this.ip,
    };
    this.usuario.ActualizarUsuarioDepartamento(datos).subscribe(data => {
      this.asignaciones = this.asignaciones.map((asignacion: any) => {
        if (asignacion.id === id) {
          asignacion.personal = false;
          asignacion.administra = false;
        }
        return asignacion;
      });
    });
  }

  // METODO PARA MANEJAR LA PAGINACION
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // METODO PARA CERRAR VENTANA
  CerrarVentana() {
    const datos = {
      asignaciones: this.asignaciones,
      id: this.id,
    }
    this.ventana.close(datos);
  }
}
