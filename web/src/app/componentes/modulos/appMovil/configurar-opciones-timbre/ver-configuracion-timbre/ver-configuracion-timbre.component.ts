import { Component, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';

import { TimbresService } from 'src/app/servicios/timbres/timbres.service';

import { ConfigurarOpcionesTimbresComponent } from '../configurar-opciones-timbres/configurar-opciones-timbres.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-ver-configuracion-timbre',
  templateUrl: './ver-configuracion-timbre.component.html',
  styleUrl: './ver-configuracion-timbre.component.css'
})

export class VerConfiguracionTimbreComponent implements OnInit {

  @Input() informacion: any;

  configuracion: any = [];
  idEmpleadoLogueado: any;
  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  nombreF = new FormControl('', Validators.minLength(2));;
  codigoF = new FormControl('');

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    nombreForm: this.nombreF,
    codigoForm: this.codigoF,
  });

  // ITEMS DE PAGINACION DE LA TABLA
  pageSizeOptions = [5, 10, 20, 50];
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;

  constructor(
    public ventanac: ConfigurarOpcionesTimbresComponent,
    public ventanae: MatDialog,
    public opciones: TimbresService,
    private toastr: ToastrService,
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    //console.log('ver info ', this.informacion)
    this.RevisarEmpleados();
  }


  // METODO PARA OBTENER IDs DE EMPLEADOS
  RevisarEmpleados() {
    let id = '';
    this.informacion.forEach((empl: any) => {
      if (id === '') {
        id = empl.id;
      }
      else {
        id = id + ', ' + empl.id;
      }
    })
    let buscar = {
      id_empleado: id,
    }
    //console.log('ver id ', buscar)
    this.ActualizarOpcionMarcacion(buscar);
  }

  // METODO PARA ACTUALIZAR OPCION DE MARCACION
  ActualizarOpcionMarcacion(informacion: any) {
    this.configuracion = [];
    let numero = 0;
    this.opciones.BuscarVariasOpcionesMarcacion(informacion).subscribe((a) => {
      console.log('ver datos ', a)
      this.configuracion = a.respuesta;
      this.configuracion.forEach((c: any) => {
        numero = numero + 1;
        c.n = numero;
      })
    }, (vacio: any) => {
      //console.log('vacio ')
      this.toastr.info('No se han encontrado registros.', '', {
        timeOut: 6000,
      });
      this.Regresar();
    });
  }

  // METODO PARA SALIR DE LA PANTALLA
  Regresar() {
    this.ventanac.configurar = true;
    this.ventanac.ver_configurar = false;
  }

  // METODO PARA MANEJAR PAGINACION 
  ManejarPagina(e: PageEvent) {
    this.numero_pagina = e.pageIndex + 1;
    this.tamanio_pagina = e.pageSize;
  }

  /** ************************************************************************************************* **
   ** **                          METODO DE SELECCION MULTIPLE DE DATOS                              ** **
   ** ************************************************************************************************* **/

  // METODOS PARA LA SELECCION MULTIPLE
  btnCheckHabilitar: boolean = false;
  auto_individual: boolean = true;
  selectionUsuario = new SelectionModel<any>(true, []);
  eliminar_datos: any = [];

  HabilitarSeleccion() {
    if (this.btnCheckHabilitar === false) {
      this.btnCheckHabilitar = true;
      this.auto_individual = false;
    }
    else if (this.btnCheckHabilitar === true) {
      this.btnCheckHabilitar = false;
      this.auto_individual = true;
      this.selectionUsuario.clear();
      this.eliminar_datos = [];
    }
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedPag() {
    const numSelected = this.selectionUsuario.selected.length;
    return numSelected === this.configuracion.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterTogglePag() {
    this.isAllSelectedPag() ?
      this.selectionUsuario.clear() :
      this.configuracion.forEach((row: any) => this.selectionUsuario.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelPag(row?: any): string {
    if (!row) {
      return `${this.isAllSelectedPag() ? 'select' : 'deselect'} all`;
    }
    this.eliminar_datos = this.selectionUsuario.selected;

    return `${this.selectionUsuario.isSelected(row) ? 'deselect' : 'select'} row ${row.descripcion + 1}`;
  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO
  EliminarDetalle(id_opcion: any) {
    const datos = {
      user_name: this.user_name,
      ip: this.ip,
      id: id_opcion
    };
    console.log('ver datos ', datos)
    this.opciones.EliminarOpcionesMarcacion(datos).subscribe((res: any) => {
      if (res.message === 'error') {
        this.toastr.error('Existen datos relacionados con este registro.', 'No fue posible eliminar.', {
          timeOut: 6000,
        });
      } else {
        this.toastr.error('Registro eliminado.', '', {
          timeOut: 6000,
        });
        this.RevisarEmpleados();
      }
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  ConfirmarDelete(datos: any) {
    this.ventanae.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarDetalle(datos.id);
          this.RevisarEmpleados();
        }
      });
  }

  // METODO PARA ELIMINAR REGISTROS
  contador: number = 0;
  ingresar: boolean = false;
  EliminarMultiple() {
    const data = {
      user_name: this.user_name,
      ip: this.ip,
      id: '',
    };
    this.ingresar = false;
    this.contador = 0;
    this.eliminar_datos = this.selectionUsuario.selected;
    this.eliminar_datos.forEach((datos: any) => {
      this.configuracion = this.configuracion.filter((item: any) => item.id !== datos.id);
      this.contador = this.contador + 1;
      data.id = datos.id;
      this.opciones.EliminarOpcionesMarcacion(data).subscribe((res: any) => {
        if (res.message === 'error') {
          this.toastr.error('Existen datos relacionados con el usuario ' + datos.codigo + '.', 'No fue posible eliminar.', {
            timeOut: 6000,
          });
          this.contador = this.contador - 1;
        } else {
          if (!this.ingresar) {
            this.toastr.error('Se ha eliminado ' + this.contador + ' registros.', '', {
              timeOut: 6000,
            });
            this.ingresar = true;
          }
          this.RevisarEmpleados();
        }
      });
    }
    )
  }

  // METODO PARA CONFIRMAR ELIMINACION MULTIPLE
  ConfirmarDeleteMultiple() {
    if (this.eliminar_datos.length != 0) {
      this.ventanae.open(MetodosComponent, { width: '450px' }).afterClosed()
        .subscribe((confirmado: Boolean) => {
          if (confirmado) {
            this.EliminarMultiple();
            this.HabilitarSeleccion();
            this.RevisarEmpleados();
          }
        });
    } else {
      this.toastr.warning('No ha seleccionado Usuarios.', 'Ups!!! algo salio mal.', {
        timeOut: 6000,
      })
      this.HabilitarSeleccion();
    }
  }

}
