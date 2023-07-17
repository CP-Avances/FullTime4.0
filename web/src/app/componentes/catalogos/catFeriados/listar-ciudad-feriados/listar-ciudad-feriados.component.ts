import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';

import { FeriadosService } from 'src/app/servicios/catalogos/catFeriados/feriados.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { CiudadFeriadosService } from 'src/app/servicios/ciudadFeriados/ciudad-feriados.service';

import { EditarFeriadosComponent } from 'src/app/componentes/catalogos/catFeriados/editar-feriados/editar-feriados.component';
import { EditarCiudadComponent } from 'src/app/componentes/catalogos/catFeriados/editar-ciudad/editar-ciudad.component';
import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';

@Component({
  selector: 'app-listar-ciudad-feriados',
  templateUrl: './listar-ciudad-feriados.component.html',
  styleUrls: ['./listar-ciudad-feriados.component.css']
})

export class ListarCiudadFeriadosComponent implements OnInit {

  idFeriado: string;
  datosFeriado: any = [];
  datosCiudades: any = [];

  // ITEMS DE PAGINACIÓN DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  constructor(
    public router: Router,
    private rest: FeriadosService,
    private restF: CiudadFeriadosService,
    private toastr: ToastrService,
    public ventana: MatDialog,
    public validar: ValidacionesService,
    public parametro: ParametrosService,
  ) {
    var cadena = this.router.url;
    var aux = cadena.split("/");
    this.idFeriado = aux[2];
  }

  ngOnInit(): void {
    this.BuscarParametro();
    this.ListarCiudadesFeriados(this.idFeriado);
  }

  /** **************************************************************************************** **
  ** **                          BUSQUEDA DE FORMATOS DE FECHAS                            ** ** 
  ** **************************************************************************************** **/

  formato_fecha: string = 'DD/MM/YYYY';

  // METODO PARA BUSCAR PARÁMETRO DE FORMATO DE FECHA
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
        if (data.fec_recuperacion != null) {
          data.fec_recuperacion_ = this.validar.FormatearFecha(data.fec_recuperacion, formato_fecha, this.validar.dia_abreviado);
        }
      })
    })
  }

  // METODO PARA BUSCAR FERIADOS - CIUDADES
  ListarCiudadesFeriados(idFeriado: any) {
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
      { width: '400px', data: datoSeleccionado })
      .afterClosed().subscribe(item => {
        this.ListarCiudadesFeriados(this.idFeriado);
      });
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
  ConfirmarDelete(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Eliminar(datos.idciudad_asignada);
        } else {
          this.router.navigate(['/verFeriados/', datos.idferiado]);
        }
      });
  }

}
