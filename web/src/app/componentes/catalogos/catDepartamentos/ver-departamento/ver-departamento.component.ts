import { FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
import { ThemePalette } from '@angular/material/core';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';

import { DepartamentosService } from 'src/app/servicios/catalogos/catDepartamentos/departamentos.service';
import { SucursalService } from 'src/app/servicios/sucursales/sucursal.service';

import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';
import { RegistrarNivelDepartamentoComponent } from 'src/app/componentes/catalogos/catDepartamentos/registro-nivel-departamento/registrar-nivel-departamento.component';
import { AutorizaDepartamentoService } from 'src/app/servicios/autorizaDepartamento/autoriza-departamento.service';

interface Nivel {
  valor: number;
  nombre: string
}

@Component({
  selector: 'app-ver-departamento',
  templateUrl: './ver-departamento.component.html',
  styleUrls: ['./ver-departamento.component.css']
})

export class VerDepartamentoComponent implements OnInit {

  // CONTROL DE LOS CAMPOS DEL FORMULARIO
  idSucursal = new FormControl('');
  depaPadre = new FormControl('');
  nombre = new FormControl('', Validators.required);
  nivel = new FormControl('', Validators.required);

  // DATOS DEPARTAMENTO
  sucursales: any = [];
  departamentos: any = [];
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

  // ARREGLO DE NIVELES EXISTENTES
  niveles: Nivel[] = [
    { valor: 1, nombre: '1' },
    { valor: 2, nombre: '2' },
    { valor: 3, nombre: '3' },
    { valor: 4, nombre: '4' },
    { valor: 5, nombre: '5' }
  ];

  /**
   * VARIABLES PROGRESS SPINNEr
   */
  habilitarprogress: boolean = false;
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 10;

  idDepartamento: any;
  info: any = [];

  mostrar: boolean = true;

  constructor(
    public rest: DepartamentosService,
    public auto: AutorizaDepartamentoService,
    private restS: SucursalService,
    private toastr: ToastrService,
    private router: Router,
    public ventana: MatDialog,
    //public ventanacerrar: MatDialogRef<VerDepartamentoComponent>,
    //@Inject(MAT_DIALOG_DATA) public info: any
  ) { 
    var cadena = this.router.url;
    var aux = cadena.split("/");
    this.idDepartamento = parseInt(aux[2]);
  }

  datos: any = [];

  ngOnInit(): void {

    this.rest.BuscarDepartamento(this.idDepartamento).subscribe(dato => {
      this.info = dato[0];
      if (this.info.establecimiento === true) {
        this.Habilitar = false;
        this.datos = this.info.data;
      }
      else {
        this.datos = this.info;
        this.Habilitar = true;
        this.idSucursal.setValue(this.datos.id_sucursal);
      }

      this.CargarDatos(this.info);
  
    })
  }

  // METODO PARA IMPRIMIR DATOS EN FORMULARIO
  CargarDatos(info: any) {
    this.habilitarprogress = true;
    this.departamentos = [];
    var id_departamento = info.id;
    var id_establecimiento = info.id_sucursal;
    this.rest.ConsultarNivelDepartamento(id_departamento, id_establecimiento).subscribe(datos => {
      this.departamentos = datos;
      this.habilitarprogress = false;
    }, error => {
      this.toastr.error('No ha registrado niveles de autorizacion.', '', {
        timeOut: 6000,
      });
      this.habilitarprogress = false;
    })
  }

  // CONTROL DE PAGINACION
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1
  }

  // OBTENER LISTA DE DEPARTAMENTOS
  ObtenerDepartamentos(form: any) {
    this.departamentos = [];
    this.rest.BuscarDepartamentoSucursal_(parseInt(form.idSucursalForm), this.datos.id).subscribe(datos => {
      this.departamentos = datos;
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

    if (this.departamentos.length === 0) {
      this.ActualizarDepartamento(departamento);
    }
    else {
      this.GuardarDatos(departamento);
    }
  }


  // METODO DE ALMACENAMIENTO DE DATOS VALIDANDO DUPLICADOS
  contador: number = 0;
  GuardarDatos(departamento: any) {
    for (var i = 0; i <= this.departamentos.length - 1; i++) {
      if (this.departamentos[i].nombre === departamento.nombre) {
        this.contador = 1;
      }
    }
    if (this.contador === 1) {
      this.contador = 0;
      this.toastr.error('Nombre de departamento ya se encuentra registrado.', '', {
        timeOut: 4000,
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
          timeOut: 4000,
        });
      }
      else {
        this.toastr.success('Operacion Exitosa.', 'Registro actualizado.', {
          timeOut: 4000,
        });
        this.CerrarVentana();
      }
    });
  }

  // METODO PARA CERRAR VENTANA
  CerrarVentana() {
    //this.ventanacerrar.close();
  }

  nuvalistaDepa: any = [];
  depa_padre1: any = null;
  nivel1: any = 0;
  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO
  Eliminar(id_dep: number, datos: any) {
    this.rest.EliminarRegistroNivelDepa(id_dep).subscribe(res => {
      var data = {nivel: 0};
      this.departamentos.forEach(item => {
        if(datos.nivel < item.nivel){
          data.nivel = item.nivel - 1;
          item.nivel = data.nivel;
          this.nuvalistaDepa.push(item);
          this.rest.ActualizarNivelDepa(item.id, data).subscribe(res => {
            if (res.message === 'error') {
              this.toastr.error('No se pudo actualizar la tabla de Niveles de autorizacion .', '', {
                timeOut: 4000,
              });
            }
          }) 
        }
      });

      if(this.nuvalistaDepa.length > 0){
        var cg_depa = {
          depa_padre: this.nuvalistaDepa[0].id_dep_nivel,
          nivel: this.nuvalistaDepa[0].nivel
        }
        this.rest.ActualizarNivelDepartamento(this.info.id, cg_depa).subscribe(response => {
          if (response.message === 'error') {
            this.toastr.error('Problemas al actualizar la lista de departamentos.', '', {
              timeOut: 4000,
            });
          }else{
            this.CargarDatos(this.info);
          }
        })

      this.CargarDatos(this.info);

      }else if(this.departamentos.length === 1){
        var cg_depa = {
          depa_padre: this.depa_padre1,
          nivel: this.nivel1
        }
        this.rest.ActualizarNivelDepartamento(this.info.id, cg_depa).subscribe(response => {
          if (response.message === 'error') {
            this.toastr.error('Problemas al actualizar la lista de departamentos.', '', {
              timeOut: 4000,
            });
          }else{
            this.CargarDatos(this.info);
          }
        })
      }else{

        var cg_depa = {
          depa_padre: this.departamentos[1].id_dep_nivel,
          nivel: this.departamentos[1].nivel
        }

        this.rest.ActualizarNivelDepartamento(this.info.id, cg_depa).subscribe(response => {
          if (response.message === 'error') {
            this.toastr.error('Problemas al actualizar la lista de departamentos.', '', {
              timeOut: 4000,
            });
          }else{
            this.CargarDatos(this.info);
          }
        })
      }
      
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 4000,
      });
    });
   
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
  ConfirmarDelete(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Eliminar(datos.id, datos);
        }
    });
  }

  // METODO PARA BUSCAR DEPARTAMENTOS
  ListaDepartamentos() {
    this.departamentos = []
    this.rest.ConsultarDepartamentos().subscribe(datos => {
      this.departamentos = datos;
      this.OrdenarDatos(this.departamentos);
    })
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

  AbrirVentanaRegistrarNivelDep(){
    this.ventana.open(RegistrarNivelDepartamentoComponent, 
      {width: '500px', data: this.info}).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.ListaDepartamentos();
        } else {
          this.CargarDatos(this.info);
        }
      }
    );
  }


  empleados: any = [];
  depa: string;
  AbrirVentanaVerListadoEmpleados(departamento: any){
    this.habilitarprogress = true;
    var id_depa = departamento.id_dep_nivel;
    this.depa = departamento.dep_nivel_nombre;
    this.auto.BuscarListaEmpleadosAutorizan(id_depa).subscribe(datos => {
      this.empleados = datos;
      this.habilitarprogress =false;
      this.mostrar = false;
    }, error => {
      this.mostrar = true;
      this.habilitarprogress =false;
      this.toastr.error('No hay usuarios que autoricen en este departamento.', '', {
        timeOut: 4000,
      });
    })
  }

  CerrarTabla(){
    this.mostrar = true;
  }

}
