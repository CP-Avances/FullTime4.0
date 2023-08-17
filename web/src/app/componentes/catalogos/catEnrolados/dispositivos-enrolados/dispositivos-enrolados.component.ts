import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';

import { EnroladoService } from 'src/app/servicios/catalogos/catEnrolados/enrolado.service';
import { EnroladosRelojesService } from 'src/app/servicios/enroladosRelojes/enrolados-relojes.service';
import { EnroladoRelojComponent } from 'src/app/componentes/catalogos/catEnrolados/enrolado-reloj/enrolado-reloj.component';
import { EditarEnroladosComponent } from 'src/app/componentes/catalogos/catEnrolados/editar-enrolados/editar-enrolados.component';
import { EditarDispositivoEnroladoComponent } from 'src/app/componentes/catalogos/catEnrolados/editar-dispositivo-enrolado/editar-dispositivo-enrolado.component';
import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';

@Component({
  selector: 'app-dispositivos-enrolados',
  templateUrl: './dispositivos-enrolados.component.html',
  styleUrls: ['./dispositivos-enrolados.component.css']
})
export class DispositivosEnroladosComponent implements OnInit {

  idEnrolado: string;
  datosEnrolado: any = [];
  datosDispositivos: any = [];
  hide = false;

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  constructor(
    public router: Router,
    private rest: EnroladoService,
    private restE: EnroladosRelojesService,
    private toastr: ToastrService,
    public vistaRegistrarDatos: MatDialog,
  ) {
    var cadena = this.router.url;
    var aux = cadena.split("/");
    this.idEnrolado = aux[2];
  }

  ngOnInit(): void {
    this.BuscarDatosEnrolado(this.idEnrolado);
    this.ListarEnroladoDispositivo(this.idEnrolado);
  }

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1
  }

  BuscarDatosEnrolado(idEnrolado: any) {
    this.datosEnrolado = [];
    this.rest.ListarUnEnrolado(idEnrolado).subscribe(data => {
      this.datosEnrolado = data;
      console.log(this.datosEnrolado);
    })
  }

  ListarEnroladoDispositivo(idEnrolado: any) {
    console.log('entra', this.datosDispositivos)
    this.datosDispositivos = [];
    this.restE.BuscarEnroladosReloj(idEnrolado).subscribe(datos => {
      this.datosDispositivos = datos;
      console.log('datos dispositivo', this.datosDispositivos)
    })
  }

  AbrirVentanaAsignarReloj(datosSeleccionados: any): void {
    console.log(datosSeleccionados);
    this.vistaRegistrarDatos.open(EnroladoRelojComponent, { width: '400px', data: { datosEnrolado: datosSeleccionados, actualizar: true } }).disableClose = true;
    console.log(datosSeleccionados.nombre);
  }

  // Ventana para editar datos
  AbrirVentanaEditar(datosSeleccionados: any): void {
    console.log(datosSeleccionados);
    this.vistaRegistrarDatos.open(EditarEnroladosComponent, { width: '900px', data: { datosEnrolado: datosSeleccionados, actualizar: true } }).disableClose = true;
  }

  // Ventana para editar datos
  AbrirVentanaEditarReloj(datosSeleccionados: any): void {
    console.log(datosSeleccionados);
    this.vistaRegistrarDatos.open(EditarDispositivoEnroladoComponent,
      { width: '400px', data: datosSeleccionados })
      .afterClosed().subscribe(item => {
        this.BuscarDatosEnrolado(this.idEnrolado);
        this.ListarEnroladoDispositivo(this.idEnrolado);
      });
  }

  /** FUNCION para eliminar registro seleccionado HORARIO*/
  EliminarReloj(id_horario: number) {
    this.restE.EliminarRegistro(id_horario).subscribe(res => {
      this.toastr.error('Registro eliminado.','', {
        timeOut: 6000,
      });
      this.BuscarDatosEnrolado(this.idEnrolado);
      this.ListarEnroladoDispositivo(this.idEnrolado);
    });
  }

  // FUNCION PARA CONFIRMAR ELIMINAR REGISTROS
  ConfirmarDeleteReloj(datos: any) {
    console.log(datos);
    this.vistaRegistrarDatos.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarReloj(datos.id_relj_enrolado);
        } else {
          this.router.navigate(['/enroladoDispositivo/', this.idEnrolado]);
        }
      });
  }

}
