// IMPORTAR LIBRERIAS
import { MatTableDataSource } from '@angular/material/table';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';

// IMPORTAR SERVICIOS
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { TimbresService } from 'src/app/servicios/timbres/timbres.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';
import { MainNavService } from '../../../generales/main-nav/main-nav.service';
import { MatDialog } from '@angular/material/dialog';
import { VerImagenComponent } from 'src/app/componentes/timbres/acciones-timbres/ver-imagen/ver-imagen.component';

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
  ver_principal: boolean = true;
  ver_timbre: boolean = false;

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
    private validar: ValidacionesService, // VALIDACIONES DE SERVICIOS
    private toastr: ToastrService, // VARIABLE USADA PARA NOTIFICACIONES
    public parametro: ParametrosService,
    public funciones: MainNavService,
    public usuario: UsuarioService,
    public ventana: MatDialog,
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
  idioma_fechas: string = 'es';
  // METODO PARA BUSCAR DATOS DE PARAMETROS
  BuscarParametro() {
    let datos: any = [];
    let detalles = { parametros: '1, 2' };
    this.parametro.ListarVariosDetallesParametros(detalles).subscribe(
      res => {
        datos = res;
        //console.log('datos ', datos)
        datos.forEach((p: any) => {
          // id_tipo_parametro Formato fecha = 1
          if (p.id_parametro === 1) {
            this.formato_fecha = p.descripcion;
          }
          // id_tipo_parametro Formato hora = 2
          else if (p.id_parametro === 2) {
            this.formato_hora = p.descripcion;
          }
        })
        this.ObtenerListaTimbres(this.formato_fecha, this.formato_hora);
      }, vacio => {
        this.ObtenerListaTimbres(this.formato_fecha, this.formato_hora);
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
        let fecha: any = data.fecha_hora_timbre_validado;
        data.fecha = this.validar.FormatearFecha(fecha, formato_fecha, this.validar.dia_abreviado, this.idioma_fechas);
        data.hora = this.validar.FormatearHora(fecha.split(' ')[1], formato_hora);
        this.LeerAcciones(data);
        this.LeerBiometrico(data);
      })
    }, err => {
      this.toastr.info(err.error.message)
    })
  }

  // METODO PARA LEER DATOS DE ACCIONES
  LeerAcciones(data: any) {
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
  }

  // METODO PARA LEER BIOMETRICOS
  LeerBiometrico(data: any) {
    if (data.id_reloj === '97') {
      data.id_reloj_ = 'APP_MOVIL';
    }
    else if (data.id_reloj === '98') {
      data.id_reloj_ = 'APP_WEB';
    }
    else {
      data.id_reloj_ = 'BIOMÉTRICO';
    }
  }

  // METODO PARA REGISTRAR TIMBRES
  AbrirRegistrarTimbre() {
    this.ver_principal = false;
    this.ver_timbre = true;
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

  // METODO PARA VER IMAGEN
  VerImagen(imagen: any) {
    this.ventana.open(VerImagenComponent,
      { width: '400px', height: '400px', data: imagen }).afterClosed().subscribe(item => {
      });
  }

  //CONTROL BOTONES
  getTimbreVirtual(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Ver Timbres Personales');
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 1);
    }
  }

}
