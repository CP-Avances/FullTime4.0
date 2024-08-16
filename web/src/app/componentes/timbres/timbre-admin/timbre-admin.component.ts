// IMPORTACION DE LIBRERIAS
import { FormControl, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';

// IMPORTACION DE SERVICIOS
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { AsignacionesService } from 'src/app/servicios/asignaciones/asignaciones.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { TimbresService } from 'src/app/servicios/timbres/timbres.service';

@Component({
  selector: 'app-timbre-admin',
  templateUrl: './timbre-admin.component.html',
  styleUrls: ['./timbre-admin.component.css']
})

export class TimbreAdminComponent implements OnInit {

  // VARIABLE DE ALMACENAMIENTO DE DATOS DE EMPLEADO
  datosEmpleado: any = [];

  idEmpleadoLogueado: any;
  rolEmpleado: number; // VARIABLE DE ALMACENAMIENTO DE ROL DE EMPLEADO QUE INICIA SESION

  idUsuariosAcceso: Set<any> = new Set();

  // DATOS DEL FORMULARIO DE BUSQUEDA
  cedula = new FormControl('', Validators.minLength(2));
  nombre = new FormControl('', Validators.minLength(2));
  codigo = new FormControl('');

  // ITEMS DE PAGINACION DE LA TABLA DE LISTA DE EMPLEADOS
  numero_pagina_e: number = 1;
  tamanio_pagina_e: number = 5;
  pageSizeOptions_e = [5, 10, 20, 50];

  // VARIABLES DE ALMACENAMIENTO DE DATOS DE TIMBRES
  timbres: any = [];
  lista: boolean = false

  // ITEMS DE PAGINACION DE LA TABLA TIMBRES
  numero_pagina: number = 1;
  tamanio_pagina: number = 5;
  pageSizeOptions = [5, 10, 20, 50];

  // FILTROS DE BUSQUEDA DE TIMBRES POR FECHA
  dataSource: any;
  filtroFechaTimbre = '';

  constructor(
    private restTimbres: TimbresService, // SERVICIO DATOS DE TIMBRES
    private validar: ValidacionesService, // SERVICIO CONTROL DE VALIDACONES
    private toastr: ToastrService, // VARIABLE MANEJO DE NOTIFICACIONES
    public restD: DatosGeneralesService, // SERVICIO DATOS GENERALES
    public parametro: ParametrosService,
    private asignaciones: AsignacionesService,
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.rolEmpleado = parseInt(localStorage.getItem('rol') as string);

    this.idUsuariosAcceso = this.asignaciones.idUsuariosAcceso;

    this.VerDatosEmpleado();
    this.BuscarParametro();
    this.BuscarHora();
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
      });
  }

  BuscarHora() {
    // id_tipo_parametro Formato hora = 2
    this.parametro.ListarDetalleParametros(2).subscribe(
      res => {
        this.formato_hora = res[0].descripcion;
      });
  }

  // EVENTO PARA MANEJAR LA PAGINACION DE TABLA DE EMPLEADOS
  ManejarPaginaE(e: PageEvent) {
    this.tamanio_pagina_e = e.pageSize;
    this.numero_pagina_e = e.pageIndex + 1;
  }

  // LISTA DE DATOS DE EMPLEADOS
  VerDatosEmpleado() {
    this.datosEmpleado = [];
    this.restD.ObtenerInformacionGeneral(1).subscribe(data => {
      console.log('data',data);
      this.datosEmpleado = this.rolEmpleado === 1 ? data : this.FiltrarEmpleadosAsignados(data);
      console.log(this.datosEmpleado);
    });
  }

  // METODO PARA FILTRAR EMPLEADOS A LOS QUE EL USUARIO TIENE ACCESO
  FiltrarEmpleadosAsignados(data: any) {
    return data.filter((empleado: any) => this.idUsuariosAcceso.has(empleado.id));
  }

  // EVENTO PARA MANEJAR LA PAGINACION DE TABLA DE TIMBRES
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // LISTAR DATOS DE TIMBRES SEGÚN CÓDIGO DE EMPLEADO
  selec_nombre: any;
  ObtenerListaTimbres(id: number, nombre: any, apellido: any) {
    this.restTimbres.ObtenerTimbresEmpleado(id).subscribe(res => {
      this.dataSource = new MatTableDataSource(res.timbres);
      this.timbres = this.dataSource.data;
      this.lista = true;
      this.selec_nombre = nombre + ' ' + apellido;
      this.timbres.forEach((data: any) => {
        data.fecha = this.validar.FormatearFecha(data.fecha_hora_timbre_servidor, this.formato_fecha, this.validar.dia_abreviado);
        data.hora = this.validar.FormatearHora(data.fecha_hora_timbre_servidor.split(' ')[1], this.formato_hora);
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

  VerJustificacion(justificacion: any) {
    // CREAR UNA URL DE DATOS PARA LA IMAGEN EN BASE64
    const imageUrl = `${justificacion}`;

    // ABRIR LA IMAGEN EN UNA NUEVA PESTAÑA DEL NAVEGADOR
    const newWindow = window.open(imageUrl, '_blank');
    if (newWindow) {
      newWindow.document.write(`<img src="${imageUrl}" alt="Justificación" />`);
      newWindow.document.title = "Justificación";
    } else {
      this.toastr.error('No se pudo abrir la nueva pestaña.');
    }
  }

  // METODO DE BUSQUEDA DE DATOS DE ACUERDO A LA FECHA INGRESADA
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filtroFechaTimbre = filterValue.trim().toLowerCase();
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // METODO PARA VER UBICACION DE TIMBRE
  AbrirMapa(latitud: string, longitud: string) {
    if (!latitud || !longitud) return this.toastr.warning(
      'Timbre seleccionado no posee registro de coordenadas de ubicación.')
    const rutaMapa = "https://www.google.com/maps/search/+" + latitud + "+" + longitud;
    window.open(rutaMapa);
  }

  // METODO DE VALIDACION DE INGRESO DE SOLO LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e)
  }

  // METODO DE VALIDACION DE INGRESO DE SOLO NUMEROS
  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt)
  }

  // METODO PARA LIMPIAR CAMPOS DE FORMULARIO
  LimpiarCampos() {
    this.codigo.reset();
    this.cedula.reset();
    this.nombre.reset();
  }

  // METODO PARA CERRAR TABLA
  CerrarTabla() {
    this.lista = false;
    this.timbres = [];
  }

  //CONTROL BOTONES
  getVerTimbres(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Ver Timbres');
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 1);
    }
  }
}
