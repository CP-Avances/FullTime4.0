// IMPORTAR LIBRERIAS
import { MatTableDataSource } from '@angular/material/table';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

// IMPORTAR SERVICIOS
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { TimbresService } from 'src/app/servicios/timbres/timbres.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';
import { MainNavService } from '../../../administracionGeneral/main-nav/main-nav.service';

// IMPORTAR COMPONENTES
import { RegistrarTimbreComponent } from '../registrar-timbre/registrar-timbre.component';

@Component({
  selector: 'app-timbre-web',
  templateUrl: './timbre-web.component.html',
  styleUrls: ['./timbre-web.component.css']
})

export class TimbreWebComponent implements OnInit {

  // VARIABLES DE ALMACENAMIENTO DE DATOS
  info_usuario: any = [];
  timbres: any = [];
  cuenta: any = [];
  info: any = [];

  activar_timbre: boolean = true;

  // ITEMS DE PAGINACION DE LA TABLA
  numero_pagina: number = 1;
  tamanio_pagina: number = 5;
  pageSizeOptions = [5, 10, 20, 50];

  // VARIABLES DE ALMACENAMIENTO DE TABLAS
  dataSource: any;
  filtroFechaTimbre = '';
  idEmpleado: number;

  get habilitarTimbre(): boolean { return this.funciones.timbre_web; }

  constructor(
    private restTimbres: TimbresService, // SERVICIOS DATOS TIMBRES
    private ventana: MatDialog, // VARIABLE USADA PARA NAVEGACIÓN ENTRE VENTANAS
    private validar: ValidacionesService, // VALIDACIONES DE SERVICIOS
    private toastr: ToastrService, // VARIABLE USADA PARA NOTIFICACIONES
    public parametro: ParametrosService,
    public funciones: MainNavService,
    public usuario: UsuarioService,
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    if (this.habilitarTimbre === false) {
      let mensaje = {
        access: false,
        title: `Ups!!! al parecer no tienes activado en tu plan el Módulo de Teletrabajo. \n`,
        message: '¿Te gustaría activarlo? Comunícate con nosotros.',
        url: 'www.casapazmino.com.ec'
      }
      return this.validar.RedireccionarHomeAdmin(mensaje);
    }
    else {
      this.BuscarParametro();
      this.ObtenerUsuario();
    }
  }

  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** **
   ** **************************************************************************************** **/

  formato_fecha: string = 'DD/MM/YYYY';
  formato_hora: string = 'HH:mm:ss';

  // METODO PARA BUSCAR PARAMETRO DE FORMATO DE FECHA
  BuscarParametro() {
    // id_tipo_parametro Formato fecha = 1
    this.parametro.ListarDetalleParametros(1).subscribe(
      res => {
        this.formato_fecha = res[0].descripcion;
        this.BuscarHora(this.formato_fecha)
      },
      vacio => {
        this.BuscarHora(this.formato_fecha)
      });
  }

  BuscarHora(fecha: string) {
    // id_tipo_parametro Formato hora = 2
    this.parametro.ListarDetalleParametros(2).subscribe(
      res => {
        this.formato_hora = res[0].descripcion;
        this.ObtenerListaTimbres(fecha, this.formato_hora);
      },
      vacio => {
        this.ObtenerListaTimbres(fecha, this.formato_hora);
      });
  }

  // METODO DE MANEJO DE PAGINAS DE LA TABLA
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // METODO PARA OBTENER DATOS DE USUARIO
  ObtenerUsuario() {
    this.info_usuario = [];
    this.usuario.BuscarDatosUser(this.idEmpleado).subscribe(res => {
      this.info_usuario = res[0];
      if (this.info_usuario.web_habilita === true) {
        this.activar_timbre = false;
      }
    })
  }

  // METODO PARA MOSTRAR DATOS DE TIMBRES
  ObtenerListaTimbres(formato_fecha: string, formato_hora: string) {
    this.restTimbres.ObtenerTimbres().subscribe(res => {
      this.dataSource = new MatTableDataSource(res.timbres);
      this.timbres = this.dataSource.data;
      this.cuenta = res.cuenta;
      this.info = res.info;
      this.timbres.forEach((data: any) => {
        data.fecha = this.validar.FormatearFecha(data.fecha_hora_timbre, formato_fecha, this.validar.dia_abreviado);
        data.hora = this.validar.FormatearHora(data.fecha_hora_timbre.split(' ')[1], formato_hora);
        if (data.tecla_funcion === '0') {
          data.tecla_funcion_ = 'Entrada';
        }
        else if (data.tecla_funcion === '1') {
          data.tecla_funcion_ = 'Salida';
        }
        else if (data.tecla_funcion === '2') {
          data.tecla_funcion_ = 'Inicio alimentación';
        }
        else if (data.tecla_funcion === '3') {
          data.tecla_funcion_ = 'Fin alimentación';
        }
        else if (data.tecla_funcion === '4') {
          data.tecla_funcion_ = 'Inicio permiso';
        }
        else if (data.tecla_funcion === '5') {
          data.tecla_funcion_ = 'Fin permiso';
        }
        if (data.tecla_funcion === '7') {
          data.tecla_funcion_ = 'Timbre libre';
        }
        else if (data.tecla_funcion === '99') {
          data.tecla_funcion_ = 'Desconocido';
        }
      })
    }, err => {
      this.toastr.info(err.error.message)
    })
  }

  // METODO PARA REGISTRAR TIMBRES
  AbrirRegistrarTimbre() {
    this.ventana.open(RegistrarTimbreComponent, { width: '550px' }).afterClosed().subscribe(data => {
      if (data !== undefined) {
        if (!data.close) {
          this.restTimbres.RegistrarTimbreWeb(data).subscribe(res => {
            data.id_empleado = this.idEmpleado;
            this.BuscarParametro();
            this.toastr.success(res.message)
          }, err => {
            this.toastr.error(err.message)
          })
        }
      }
    })
  }

  // METODO PARA REALIZAR FILTROS DE BUSQUEDA
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filtroFechaTimbre = filterValue.trim().toLowerCase();
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // METODO PARA ABRIR PAGINA GOOGLE MAPAS
  AbrirMapa(latitud: string, longitud: string) {
    if (!latitud || !longitud) return this.toastr.warning(
      'Marcación seleccionada no posee registro de coordenadas de ubicación.')
    const rutaMapa = "https://www.google.com/maps/search/+" + latitud + "+" + longitud;
    window.open(rutaMapa);
  }

  // VISUALIZAR MENSAJE NO PERMITIDO EL ACCESO
  VerMensaje() {
    this.toastr.info(
      '¿Te gustaría activarlo? Comunícate con el administrador del sistema.',
      `Ups!!! al parecer no tienes permisos para timbrar desde la aplicación web. \n`,
      {
        timeOut: 6000,
      });
  }

}
