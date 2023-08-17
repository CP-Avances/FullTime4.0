import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';

import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { EmplCargosService } from 'src/app/servicios/empleado/empleadoCargo/empl-cargos.service';
import { AutorizaDepartamentoService } from 'src/app/servicios/autorizaDepartamento/autoriza-departamento.service';

@Component({
  selector: 'app-informacion-jefe',
  templateUrl: './informacion-jefe.component.html',
  styleUrls: ['./informacion-jefe.component.css']
})

export class InformacionJefeComponent implements OnInit {

  // Almacenamiento de datos y BUSQUEDA
  departamento: any = [];
  idEmpleado: string;
  idCargo: any = [];
  autorizan: any = [];

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  constructor(
    private rest: EmpleadoService,
    private restCargo: EmplCargosService,
    private restAuto: AutorizaDepartamentoService,
    private toastr: ToastrService,
    public vistaRegistrarDatos: MatDialog,
  ) {
    this.idEmpleado = localStorage.getItem('empleado') as string;
  }

  ngOnInit(): void {
    this.ObtenerNombreDepartamento();
  }

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1
  }

  ObtenerNombreDepartamento() {
    this.idCargo = [];
    this.departamento = [];
    this.restCargo.BuscarIDCargoActual(parseInt(this.idEmpleado)).subscribe(datos => {
      this.idCargo = datos;
      var datosEmpleado = {
        id_emple: parseInt(this.idEmpleado),
        id_cargo: this.idCargo[0].max
      }
      this.rest.BuscarDepartamentoEmpleado(datosEmpleado).subscribe(datos => {
        this.departamento = datos;
        this.ObtenerPersonasAutorizan(this.departamento[0].id_depar);
      })
    }, error => { });
  }

  ObtenerPersonasAutorizan(id: number) {
    this.autorizan = [];
    this.restAuto.BuscarEmpleadosAutorizan(id).subscribe(datos => {
      this.autorizan = datos;
    }, error => { });
  }

}
