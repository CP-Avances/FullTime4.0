import { Component, OnInit, Input } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';

import { FeriadosService } from 'src/app/servicios/catalogos/catFeriados/feriados.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { CiudadFeriadosService } from 'src/app/servicios/ciudadFeriados/ciudad-feriados.service';

import { EditarFeriadosComponent } from 'src/app/componentes/catalogos/catFeriados/feriados/editar-feriados/editar-feriados.component';
import { ListarFeriadosComponent } from '../../feriados/listar-feriados/listar-feriados.component';
import { EditarCiudadComponent } from 'src/app/componentes/catalogos/catFeriados/ciudad-feriados/editar-ciudad/editar-ciudad.component';
import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { ThemePalette } from '@angular/material/core';

export interface Feriado {
  idciudad_asignada: number
}

@Component({
  selector: 'app-listar-ciudad-feriados',
  templateUrl: './listar-ciudad-feriados.component.html',
  styleUrls: ['./listar-ciudad-feriados.component.css']
})

export class ListarCiudadFeriadosComponent implements OnInit {

  @Input() idFeriado: number;
  @Input() pagina_: string;

  ver_lista: boolean = true;
  datosFeriado: any = [];
  datosCiudades: any = [];

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

    // VARIABLES PROGRESS SPINNER
    habilitarprogress: boolean = false;
    mode: ProgressSpinnerMode = 'indeterminate';
    color: ThemePalette = 'primary';
    value = 10;

  constructor(
    public router: Router,
    private rest: FeriadosService,
    private restF: CiudadFeriadosService,
    private toastr: ToastrService,
    public ventana: MatDialog,
    public validar: ValidacionesService,
    public parametro: ParametrosService,
    public componentef: ListarFeriadosComponent,
  ) { }

  ngOnInit(): void {
    this.BuscarParametro();
    this.ListarCiudadesFeriados(this.idFeriado);
  }

  /** **************************************************************************************** **
  ** **                          BUSQUEDA DE FORMATOS DE FECHAS                            ** ** 
  ** **************************************************************************************** **/

  formato_fecha: string = 'DD/MM/YYYY';

  // METODO PARA BUSCAR PARAMETRO DE FORMATO DE FECHA
  BuscarParametro() {
    // id_tipo_parametro Formato fecha = 25
    this.parametro.ListarDetalleParametros(25).subscribe(
      res => {
        this.formato_fecha = res[0].descripcion;
        this.BuscarDatosFeriado(this.idFeriado, this.formato_fecha)
      },
      vacio => {
        this.BuscarDatosFeriado(this.idFeriado, this.formato_fecha)
      });
  }

  // METODO PARA MANEJAR PAGINACION
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1
  }

  // METODO PARA BUSCAR INFORMACION DE UN FERIADO
  BuscarDatosFeriado(idFeriado: any, formato_fecha: string) {
    this.datosFeriado = [];
    this.rest.ConsultarUnFeriado(idFeriado).subscribe(data => {
      this.datosFeriado = data;
      this.datosFeriado.forEach(data => {
        data.fecha_ = this.validar.FormatearFecha(data.fecha, formato_fecha, this.validar.dia_abreviado);
        if (data.fecha_recuperacion != null) {
          data.fec_recuperacion_ = this.validar.FormatearFecha(data.fecha_recuperacion, formato_fecha, this.validar.dia_abreviado);
        }
      })
    })
  }

  // METODO PARA BUSCAR FERIADOS - CIUDADES
  ListarCiudadesFeriados(idFeriado: number) {
    this.datosCiudades = [];
    this.restF.BuscarCiudadesFeriado(idFeriado).subscribe(datos => {
      this.datosCiudades = datos;
    })
  }

  // METODO PARA EDITAR FERIADO
  AbrirVentanaEditarFeriado(datosSeleccionados: any): void {
    this.ventana.open(EditarFeriadosComponent,
      { width: '400px', data: { datosFeriado: datosSeleccionados, actualizar: true } })
      .afterClosed().subscribe(items => {
        this.BuscarDatosFeriado(this.idFeriado, this.formato_fecha);
      });
  }

  // METODO PARA EDITAR ASIGNACION DE CIUDADES
  AbrirVentanaEditarCiudad(datoSeleccionado: any): void {
    this.ventana.open(EditarCiudadComponent,
      { width: '600px', data: datoSeleccionado })
      .afterClosed().subscribe(item => {
        this.ListarCiudadesFeriados(this.idFeriado);
      });
  }

  // METODO PARA VERIFICAR ELIMINACION DE REGISTROS
  eliminar: number = 0;
  VerificarEliminar(opcion: number, datos: any) {
    this.eliminar = 0;
    if (opcion === 1) {
      this.Eliminar(datos.idciudad_asignada);
    }
    else {
      this.habilitarprogress = true;
      datos.forEach(obj => {
        this.restF.EliminarRegistro(obj.idciudad_asignada).subscribe(res => {
          this.eliminar = this.eliminar + 1;
          if (this.eliminar === datos.length) {
            this.toastr.error('Registro eliminado.', '', {
              timeOut: 6000,
            });
            this.habilitarprogress = false;
            this.ListarCiudadesFeriados(this.idFeriado);
            this.HabilitarSeleccion();
          }
        });
      })
    }
  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO
  Eliminar(id_ciudad_asignada: number) {
    this.restF.EliminarRegistro(id_ciudad_asignada).subscribe(res => {
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
      this.ListarCiudadesFeriados(this.idFeriado);
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  ConfirmarDelete(datos: any, opcion: number) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.VerificarEliminar(opcion, datos);
        }
      });
  }

  // METODO PARA CONFIRMAR TIPO DE ELIMINACION
  ConfirmarProceso(datos: any, opcion: number) {
    if (opcion === 1) {
      this.ConfirmarDelete(datos, opcion);
    }
    else {
      if (datos.length > 0) {
        this.ConfirmarDelete(datos, opcion);
      }
      else {
        this.toastr.warning('Ups!!! algo ha salido mal.', 'No ha seleccionado registros.', {
          timeOut: 6000,
        });
      }
    }
  }

  // METODO PARA VISUALIZAR COMPONENTE DE ASIGNACION DE CIUDADES
  ver_asignar: boolean = false;
  pagina: string = '';
  feriado_id: number;
  VerAsignarCiudad(id: number) {
    this.feriado_id = id;
    this.ver_lista = false;
    this.ver_asignar = true;
    this.pagina = 'listar-ciudades';
  }

  // METODO PARA VISUALIZAR PANTALLA DE FERIADOS
  CerrarPantalla() {
    this.componentef.ver_asignar = false;
    this.componentef.ver_ciudades = false;
    this.componentef.ver_lista = true;
  }

  // METODO PARA HABILITAR SELECCION MULTIPLE
  btnCheckHabilitar: boolean = false;
  auto_individual: boolean = true;
  HabilitarSeleccion() {
    if (this.btnCheckHabilitar === false) {
      this.btnCheckHabilitar = true;
      this.auto_individual = false;
    } else if (this.btnCheckHabilitar === true) {
      this.btnCheckHabilitar = false;
      this.auto_individual = true;
      this.selection.clear();
    }
  }

  selection = new SelectionModel<Feriado>(true, []);

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.datosCiudades.length;
    return numSelected === numRows;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA. 
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.datosCiudades.forEach((row: any) => this.selection.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabel(row?: Feriado): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.idciudad_asignada + 1}`;
  }



}
