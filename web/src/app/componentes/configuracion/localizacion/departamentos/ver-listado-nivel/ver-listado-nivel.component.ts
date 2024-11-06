import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';

import { AutorizaDepartamentoService } from 'src/app/servicios/configuracion/localizacion/autorizaDepartamento/autoriza-departamento.service';

interface Nivel {
  valor: number;
  nombre: string
}

@Component({
  selector: 'app-ver-listado-nivel',
  templateUrl: './ver-listado-nivel.component.html',
  styleUrls: ['./ver-listado-nivel.component.css']
})

export class VerListadoNivelComponent implements OnInit {

  // CONTROL DE LOS CAMPOS DEL FORMULARIO
  idSucursal = new FormControl('');
  depaPadre = new FormControl('');
  nombre = new FormControl('', Validators.required);
  nivel = new FormControl('', Validators.required);

  // DATOS DEPARTAMENTO
  sucursales: any = [];
  empleados: any = [];
  Habilitar: boolean = false;

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 6;
  numero_pagina: number = 1;
  pageSizeOptions = [6, 10, 20, 50];

  // ASIGNAR LOS CAMPOS EN UN FORMULARIO EN GRUPO
  public formulario = new FormGroup({
    nivelForm: this.nivel,
    nombreForm: this.nombre,
    depaPadreForm: this.depaPadre,
    idSucursalForm: this.idSucursal,
  });

  tipoAutorizacion: string;

  constructor(
    public auto: AutorizaDepartamentoService,
    private toastr: ToastrService,
    public ventana: MatDialog,
    public ventanacerrar: MatDialogRef<VerListadoNivelComponent>,
    @Inject(MAT_DIALOG_DATA) public info: any
  ) { }

  datos: any;
  ngOnInit(): void {
    this.datos = this.info;
    this.CargarDatos();

  }

  // METODO PARA IMPRIMIR DATOS EN FORMULARIO
  CargarDatos() {
    var id_depa = this.info.id_departamento_nivel;
    this.auto.BuscarListaEmpleadosAutorizan(id_depa).subscribe(datos => {
      this.empleados = datos;
    }, error => {
      this.toastr.error('No hay usuarios que autoricen en este departamento.', '', {
        timeOut: 4000,
      });
    })
  }

  // CONTROL DE PAGINACION
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1
  }

  // METODO PARA CERRAR VENTANA
  CerrarVentana() {
    this.ventanacerrar.close();
  }

}
