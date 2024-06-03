import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';

@Component({
  selector: 'app-visualizar-asignaciones',
  templateUrl: './visualizar-asignaciones.component.html',
  styleUrls: ['./visualizar-asignaciones.component.css']
})
export class VisualizarAsignacionesComponent {

  asignaciones: any = [];
  nombre: string;
  id: number;
  user_name: string;
  ip: string;

  // ITEMS DE PAGINACION DE LA TABLA
  numero_pagina: number = 1;
  tamanio_pagina: number = 5;
  pageSizeOptions = [5, 10, 20, 50];

  constructor(
    public usuario: UsuarioService,
    public dialogo: MatDialog,
    public ventana: MatDialogRef<VisualizarAsignacionesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log('ver data ', this.data);
    this.asignaciones = this.data.asignaciones;
    this.user_name = this.data.user_name;
    this.nombre = this.data.nombre;
    this.ip = this.data.ip;
    this.id = this.data.id;
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  ConfirmarDeleteProceso(id: number) {
    this.dialogo.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarAsignacion(id);
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

  // METODO PARA MANEJAR LA PAGINACION
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina= e.pageIndex + 1;
  }

  CerrarVentana() {
    const datos = {
      asignaciones: this.asignaciones,
      id: this.id,
    }
    this.ventana.close(datos);
  }
}
