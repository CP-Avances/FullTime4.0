import { FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
import { ThemePalette } from '@angular/material/core';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';

import { DepartamentosService } from 'src/app/servicios/catalogos/catDepartamentos/departamentos.service';
import { AutorizaDepartamentoService } from 'src/app/servicios/autorizaDepartamento/autoriza-departamento.service';
import { SucursalService } from 'src/app/servicios/sucursales/sucursal.service';

import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';
import { RegistrarNivelDepartamentoComponent } from 'src/app/componentes/catalogos/catDepartamentos/registro-nivel-departamento/registrar-nivel-departamento.component';

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

  // ITEMS DE PAGINACIÓN DE LA TABLA
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

  /**
   * VARIABLES PROGRESS SPINNEr
   */
  habilitarprogress: boolean = false;
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 10;

  tipoAutorizacion: string;

  constructor(
    private rest: DepartamentosService,
    public auto: AutorizaDepartamentoService,
    private restS: SucursalService,
    private toastr: ToastrService,
    private router: Router,
    public ventana: MatDialog,
    public ventanacerrar: MatDialogRef<VerListadoNivelComponent>,
    @Inject(MAT_DIALOG_DATA) public info: any
  ) { }

  datos: any;

  ngOnInit(): void {

    this.datos = this.info;
    this.CargarDatos();

    /*if (this.info.establecimiento === true) {
      this.Habilitar = false;
      this.datos = this.info.data;
    }
    else {
      this.datos = this.info;
      this.Habilitar = true;
      this.idSucursal.setValue(this.datos.id_sucursal);
    }
    */

  }

  // METODO PARA IMPRIMIR DATOS EN FORMULARIO
  CargarDatos() {
    var id_depa = this.info.id_dep_nivel;
    //var id_establecimiento = this.info.id_sucursal;
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

  // OBTENER LISTA DE DEPARTAMENTOS
  ObtenerDepartamentos(form: any) {
    this.empleados = [];
    this.rest.BuscarDepartamentoSucursal_(parseInt(form.idSucursalForm), this.datos.id).subscribe(datos => {
      this.empleados = datos;
    });
  }

  // METODO PARA CAPTURAR DATOS DE FORMULARIO
  ModificarDepartamento(form: any) {
    var departamento = {
      id_sucursal: form.idSucursalForm,
      depa_padre: form.depaPadreForm,
      nombre: form.nombreForm.toUpperCase(),
      nivel: parseInt(form.nivelForm),
    };

    // VERIFICAR ID DE SUCURSAL
    if (this.info.establecimiento === true) {
      departamento.id_sucursal = this.datos.id_sucursal;
    }

    if (departamento.depa_padre === '') {
      departamento.depa_padre = null;
    }

    if (this.empleados.length === 0) {
      this.ActualizarDepartamento(departamento);
    }
    else {
      this.GuardarDatos(departamento);
    }
  }


  // METODO DE ALMACENAMIENTO DE DATOS VALIDANDO DUPLICADOS
  contador: number = 0;
  GuardarDatos(departamento: any) {
    for (var i = 0; i <= this.empleados.length - 1; i++) {
      if (this.empleados[i].nombre === departamento.nombre) {
        this.contador = 1;
      }
    }
    if (this.contador === 1) {
      this.contador = 0;
      this.toastr.error('Nombre de departamento ya se encuentra registrado.', '', {
        timeOut: 6000,
      });
    }
    else {
      this.ActualizarDepartamento(departamento);
    }
  }

  // METODO DE ACTUALIZACION DE REGISTRO EN BASE DE DATOS
  ActualizarDepartamento(departamento: any) {
    this.habilitarprogress = true;
    this.rest.ActualizarDepartamento(this.datos.id, departamento).subscribe(response => {
      this.habilitarprogress = false;
      if (response.message === 'error') {
        this.toastr.error('Existe un error en los datos.', '', {
          timeOut: 6000,
        });
      }
      else {
        this.toastr.success('Operacion Exitosa.', 'Registro actualizado.', {
          timeOut: 6000,
        });
        this.CerrarVentana();
      }
    });
  }

  // METODO PARA CERRAR VENTANA
  CerrarVentana() {
    this.ventanacerrar.close();
  }

  // ORDENAR LOS DATOS SEGÚN EL ID 
  OrdenarDatos(array: any) {
    function compare(a: any, b: any) {
      if (a.id < b.id) {
        return -1;
      }
      if (a.id > b.id) {
        return 1;
      }
      return 0;
    }
    array.sort(compare);
  }
}
