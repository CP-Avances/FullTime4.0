import { Component, OnInit, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { EditarTipoComidasComponent } from '../../tipos-comidas/editar-tipo-comidas/editar-tipo-comidas.component';
import { EditarDetalleMenuComponent } from '../editar-detalle-menu/editar-detalle-menu.component';
import { DetalleMenuComponent } from '../detalle-menu/detalle-menu.component';
import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';

import { TipoComidasService } from 'src/app/servicios/catalogos/catTipoComidas/tipo-comidas.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { ListarTipoComidasComponent } from '../../tipos-comidas/listar-tipo-comidas/listar-tipo-comidas.component';

@Component({
  selector: 'app-vista-menu',
  templateUrl: './vista-menu.component.html',
  styleUrls: ['./vista-menu.component.css']
})

export class VistaMenuComponent implements OnInit {

  @Input() idMenu: number;

  datosMenu: any = [];
  datosDetalle: any = [];

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  constructor(
    public router: Router,
    public ventana: MatDialog,
    public validar: ValidacionesService,
    public parametro: ParametrosService,
    private rest: TipoComidasService,
    private toastr: ToastrService,
    public componentel: ListarTipoComidasComponent,
  ) { }

  ngOnInit(): void {
    this.BuscarHora();
  }

  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** ** 
   ** **************************************************************************************** **/

  formato_hora: string = 'HH:mm:ss';

  BuscarHora() {
    // id_tipo_parametro Formato hora = 26
    this.parametro.ListarDetalleParametros(26).subscribe(
      res => {
        this.formato_hora = res[0].descripcion;
        this.LlamarMetodos(this.formato_hora);
      },
      vacio => {
        this.LlamarMetodos(this.formato_hora);
      });
  }

  // METODO PARA LLAMAR METODOS
  LlamarMetodos(formato_hora: string) {
    this.BuscarDatosMenu(this.idMenu, formato_hora);
    this.ListarDetalles(this.idMenu);
  }

  // METODO DE MANEJO DE PAGINACION
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1
  }

  // METODO PARA BUSCAR DATOS DE MENU
  BuscarDatosMenu(id_menu: any, formato_hora: string) {
    this.datosMenu = [];
    this.rest.ConsultarUnMenu(id_menu).subscribe(datos => {
      this.datosMenu = datos;
      this.datosMenu.forEach(data => {
        data.hora_inicio_ = this.validar.FormatearHora(data.hora_inicio, formato_hora);
        data.hora_fin_ = this.validar.FormatearHora(data.hora_fin, formato_hora);
      })
    })
  }

  // METODO PARA LISTAR DETALLES DE MENU
  ListarDetalles(id_menu: any) {
    this.datosDetalle = [];
    this.rest.ConsultarUnDetalleMenu(id_menu).subscribe(datos => {
      this.datosDetalle = datos;
    })
  }

  // METODO PARA ABRIR FORMULARIO CREAR DETALLE
  AbrirVentanaDetalles(datosSeleccionados: any): void {
    this.ventana.open(DetalleMenuComponent,
      { width: '350px', data: { menu: datosSeleccionados } })
      .afterClosed().subscribe(item => {
        this.BuscarDatosMenu(this.idMenu, this.formato_hora);
        this.ListarDetalles(this.idMenu);
      });
  }

  // METODO PARA ABRIR FORMULARIO EDITAR TIPO COMIDA
  AbrirVentanaEditar(datosSeleccionados: any): void {
    this.ventana.open(EditarTipoComidasComponent, { width: '600px', data: datosSeleccionados })
      .afterClosed().subscribe(items => {
        if(items){
          if(items === 2){
            this.BuscarDatosMenu(this.idMenu, this.formato_hora);
          }
        }
      });
  }

  // METODO PARA ABRIR FORMULARIO EDITAR DETALLES
  AbrirVentanaEditarDetalle(datosSeleccionados: any): void {
    this.ventana.open(EditarDetalleMenuComponent,
      { width: '350px', data: datosSeleccionados }).afterClosed().subscribe(item => {
        if(item){
          if(item === 2){
            this.BuscarDatosMenu(this.idMenu, this.formato_hora);
            this.ListarDetalles(this.idMenu);
          }
        }
      });
  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO 
  EliminarDetalle(id_detalle: number) {
    this.rest.EliminarDetalleMenu(id_detalle).subscribe(res => {
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
      this.BuscarDatosMenu(this.idMenu, this.formato_hora);
      this.ListarDetalles(this.idMenu);
    });
  }

  // FUNCION PARA CONFIRMAR ELIMINAR REGISTROS
  ConfirmarDelete(datos: any) {
    console.log(datos);
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarDetalle(datos.id_detalle);
        }
      });
  }

  // METODO PARA VER LISTA DE COMIDAS
  VerListaServicios() {
    this.componentel.ver_lista = true;
    this.componentel.ver_datos = false;
    this.componentel.BuscarHora();
  }

}
