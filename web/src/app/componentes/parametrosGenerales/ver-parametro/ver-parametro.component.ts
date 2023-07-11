// SECCIÓN DE LIBRERIAS
import { Component, OnInit, Input } from '@angular/core';
import { MatRadioChange } from '@angular/material/radio';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';

// SECCIÓN DE SERVICIOS
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';

import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';
import { EditarParametroComponent } from '../editar-parametro/editar-parametro.component';
import { CrearDetalleParametroComponent } from '../crear-detalle-parametro/crear-detalle-parametro.component';
import { EditarDetalleParametroComponent } from '../editar-detalle-parametro/editar-detalle-parametro.component';
import { ListarParametroComponent } from '../listar-parametro/listar-parametro.component';

@Component({
  selector: 'app-ver-parametro',
  templateUrl: './ver-parametro.component.html',
  styleUrls: ['./ver-parametro.component.css']
})

export class VerParametroComponent implements OnInit {

  formato12: string = 'rgb(80, 87, 97)';
  formato24: string = 'rgb(80, 87, 97)';
  formatoA: string = 'rgb(80, 87, 97)';
  formatoI: string = 'rgb(80, 87, 97)';
  formatoE: string = 'rgb(80, 87, 97)';

  @Input() idParametro: string;

  parametros: any = [];
  datosDetalle: any = [];

  // ITEMS DE PAGINACION DE LA TABLA
  numero_pagina: number = 1;
  tamanio_pagina: number = 5;
  pageSizeOptions = [5, 10, 20, 50];

  // ACTIVADORES
  formato: boolean = true;
  formato_fecha: boolean = false;
  formato_hora: boolean = false;
  carga: boolean = false;
  kardex: boolean = false;
  laboral_calendario: boolean = false;
  limite_correo: boolean = false;
  ubicacion: boolean = false;
  dispositivos: boolean = false;

  ingreso: number = 0;

  constructor(
    private toastr: ToastrService,
    public parametro: ParametrosService,
    public ventana: MatDialog,
    public router: Router,
    public componentel: ListarParametroComponent,
  ) { }

  ngOnInit(): void {
    this.BuscarParametros(this.idParametro);
    this.ListarDetalles(this.idParametro);
    this.ActivarBoton();
  }

  ActivarBoton() {
    if (this.idParametro === '22') {
      this.formato = true;
      this.ubicacion = true;
    }
    if (this.idParametro === '24') {
      this.formato = true;
      this.limite_correo = true;
    }
    if (this.idParametro === '25') {
      this.formato = false;
      this.formato_fecha = true;
    }
    if (this.idParametro === '26') {
      this.formato = false;
      this.formato_hora = true;
    }
    if (this.idParametro === '27') {
      this.formato = false;
      this.carga = true;
    }
    if (this.idParametro === '28') {
      this.formato = false;
      this.kardex = true;
    }
    if (this.idParametro === '31') {
      this.formato = false;
      this.laboral_calendario = true;
    }
    if (this.idParametro === '32') {
      this.formato = false;
      this.dispositivos = true;
    }
  }

  // METODO PARA MANEJAR PAGINACION DE TABLAS
  ManejarPagina(e: PageEvent) {
    this.numero_pagina = e.pageIndex + 1
    this.tamanio_pagina = e.pageSize;
  }

  // METODO PARA BUSCAR DATOS TIPO PARAMETRO
  BuscarParametros(id: any) {
    this.parametros = [];
    this.parametro.ListarUnParametro(id).subscribe(data => {
      this.parametros = data;
    })
  }

  id_detalle: number;
  // METODO PARA BUSCAR DETALLES DE PARAMETRO GENERAL
  ListarDetalles(id: any) {
    this.datosDetalle = [];
    this.parametro.ListarDetalleParametros(id).subscribe(datos => {
      this.datosDetalle = datos;
      if (this.ingreso === 0) {
        this.seleccion = this.datosDetalle[0].descripcion;
        this.opcion_kardex = this.datosDetalle[0].descripcion;
        this.opcion_laboral = this.datosDetalle[0].descripcion;
      }
      if (this.datosDetalle[0].descripcion === 'hh:mm:ss A') {
        this.formato12 = '#4194F0';
        this.formato24 = 'rgb(80, 87, 97)';
      }
      if (this.datosDetalle[0].descripcion === 'HH:mm:ss') {
        this.formato24 = '#4194F0';
        this.formato12 = 'rgb(80, 87, 97)';
      }
      if (this.datosDetalle[0].descripcion === 'DD/MM/YYYY') {
        this.formatoA = '#4194F0';
        this.formatoI = 'rgb(80, 87, 97)';
        this.formatoE = 'rgb(80, 87, 97)';
      }
      if (this.datosDetalle[0].descripcion === 'MM/DD/YYYY') {
        this.formatoI = '#4194F0';
        this.formatoA = 'rgb(80, 87, 97)';
        this.formatoE = 'rgb(80, 87, 97)';
      }
      if (this.datosDetalle[0].descripcion === 'YYYY-MM-DD') {
        this.formatoE = '#4194F0';
        this.formatoI = 'rgb(80, 87, 97)';
        this.formatoA = 'rgb(80, 87, 97)';
      }
    })
  }

  // METODO PARA INGRESAR DETALLE DE PARAMETRO
  AbrirVentanaDetalles(datos: any): void {
    this.ventana.open(CrearDetalleParametroComponent,
      { width: '400px', data: { parametros: datos, actualizar: true } })
      .afterClosed().subscribe(item => {
        this.BuscarParametros(this.idParametro);
        this.ListarDetalles(this.idParametro);
      });
  }

  // METODO PARA EDITAR PARAMETRO
  AbrirVentanaEditar(datos: any): void {
    this.ventana.open(EditarParametroComponent,
      { width: '400px', data: { parametros: datos, actualizar: true } })
      .afterClosed().subscribe(item => {
        if (item) {
          if (item > 0) {
            this.BuscarParametros(this.idParametro);
          }
        }
      });
  }

  // METODO PARA EDITAR DETALLE DE PARAMETRO
  AbrirVentanaEditarDetalle(datos: any): void {
    this.ventana.open(EditarDetalleParametroComponent,
      { width: '400px', data: { parametros: datos } }).
      afterClosed().subscribe(item => {
        this.BuscarParametros(this.idParametro);
        this.ListarDetalles(this.idParametro);
      });
  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO PLANIFICACION
  EliminarDetalle(id_detalle: number) {
    this.parametro.EliminarDetalleParametro(id_detalle).subscribe(res => {
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
      this.LimpiarSeleccion();
      this.BuscarParametros(this.idParametro);
      this.ListarDetalles(this.idParametro);
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
  ConfirmarDelete(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarDetalle(datos.id_detalle);
        }
      });
  }

  // METODO PARA VER LISTA PARAMETROS
  VerListaParametro() {
    this.componentel.ver_lista = true;
    this.componentel.ver_detalle = false;
    this.componentel.ObtenerParametros();
  }

  /** ******************************************************************************************* **
   ** **        REGISTRAR O EDITAR DETALLE DE PARAMETRO FORMATO DE FECHA Y HORA                ** ** 
   ** ******************************************************************************************* **/

  GuardarDatos(seleccion: number) {
    let formato = '';
    if (seleccion === 1) {
      formato = 'DD/MM/YYYY';
    }
    else if (seleccion === 2) {
      formato = 'MM/DD/YYYY';
    }
    else if (seleccion === 3) {
      formato = 'YYYY-MM-DD';
    }
    else if (seleccion === 4) {
      formato = 'hh:mm:ss A';
    }
    else if (seleccion === 5) {
      formato = 'HH:mm:ss';
    }

    this.RegistrarValores(formato);
  }

  /** ******************************************************************************************* **
   ** **           REGISTRAR O EDITAR DETALLE DE PARAMETRO CARGA DE VACACIONES                 ** ** 
   ** ******************************************************************************************* **/

  seleccion: any;
  SelecionarCarga(event: MatRadioChange) {
    this.seleccion = event.value;
    console.log('seleccion ... ', this.seleccion)
    this.RegistrarValores(this.seleccion);
  }


  /** ******************************************************************************************* **
   ** **           REGISTRAR O EDITAR DETALLE DE PARAMETRO CARGA DE VACACIONES                 ** ** 
   ** ******************************************************************************************* **/

  opcion_kardex: any;
  SelecionarDescarga(event: MatRadioChange) {
    this.opcion_kardex = event.value;
    console.log('seleccion ... ', this.opcion_kardex)
    this.RegistrarValores(this.opcion_kardex);
  }

  /** ******************************************************************************************* **
   ** **           REGISTRAR O EDITAR DETALLE DE PARAMETRO LABORAL - CALENDARIO                ** ** 
   ** ******************************************************************************************* **/

  opcion_laboral: any;
  SelecionarLaboral(event: MatRadioChange) {
    this.opcion_laboral = event.value;
    console.log('seleccion ... ', this.opcion_laboral)
    this.RegistrarValores(this.opcion_laboral);
  }


  /** ******************************************************************************************* **
   ** **                   ALMACENAMIENTO DE PARAMETROS EN BASE DE DATOS                       ** ** 
   ** ******************************************************************************************* **/

  // METODO PARA REGISTRAR DETALLES 
  RegistrarValores(detalle: string) {
    this.ingreso = 1;
    this.parametro.ListarDetalleParametros(parseInt(this.idParametro)).subscribe(datos => {
      this.ActualizarDetalle(datos[0].id_detalle, detalle);
    }, vacio => {
      this.CrearDetalle(detalle);
    })
  }

  // METODO PARA REGISTRAR NUEVO PARÁMETRO
  CrearDetalle(detalle: string) {
    let datos = {
      id_tipo: this.idParametro,
      descripcion: detalle
    };
    this.parametro.IngresarDetalleParametro(datos).subscribe(response => {
      this.toastr.success('Detalle registrado exitosamente.',
        '', {
        timeOut: 2000,
      })
      this.LeerDatos();
    });
  }

  // METODO PARA ACTUALIZAR DETALLE DEL PARAMETRO
  ActualizarDetalle(id_detalle: number, detalle: string) {
    let datos = {
      id: id_detalle,
      descripcion: detalle
    };
    this.parametro.ActualizarDetalleParametro(datos).subscribe(response => {
      this.toastr.success('Detalle registrado exitosamente.',
        '', {
        timeOut: 2000,
      })
      this.LeerDatos();
    });
  }

  // MOSTRAR DATOS DE PARAMETROS Y DETALLES
  LeerDatos() {
    this.BuscarParametros(this.idParametro);
    this.ListarDetalles(this.idParametro);
  }

  // LIMPIAR OPCIONES DE SELECCION
  LimpiarSeleccion() {
    this.seleccion = '';
    this.opcion_kardex = '';
    this.opcion_laboral = '';
  }

}
