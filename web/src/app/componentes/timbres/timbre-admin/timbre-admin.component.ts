// IMPORTACION DE LIBRERIAS
import { FormControl, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';

// IMPORTACION DE SERVICIOS
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { TimbresService } from 'src/app/servicios/timbres/timbres.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-timbre-admin',
  templateUrl: './timbre-admin.component.html',
  styleUrls: ['./timbre-admin.component.css']
})

export class TimbreAdminComponent implements OnInit {

  // VARIABLE DE ALMACENAMIENTO DE DATOS DE EMPLEADO
  datosEmpleado: any = [];

  idEmpleadoLogueado: any;
  asignacionesAcceso: any;
  idUsuariosAcceso: any = [];

  // DATOS DEL FORMULARIO DE BUSQUEDA
  departamentoF = new FormControl('', Validators.minLength(2));
  cedula = new FormControl('', Validators.minLength(2));
  nombre = new FormControl('', Validators.minLength(2));
  cargoF = new FormControl('', Validators.minLength(2));
  codigo = new FormControl('');

  // DATOS DE FILTROS DE BUSQUEDA
  filtroDepartamento: '';
  filtroEmpleado = '';
  filtroCodigo: number;
  filtroCedula: '';
  filtroCargo: '';

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
    private restUsuario: UsuarioService,
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
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
    // id_tipo_parametro Formato fecha = 25
    this.parametro.ListarDetalleParametros(25).subscribe(
      res => {
        this.formato_fecha = res[0].descripcion;
      });
  }

  BuscarHora() {
    // id_tipo_parametro Formato hora = 26
    this.parametro.ListarDetalleParametros(26).subscribe(
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
  async VerDatosEmpleado() {
    this.datosEmpleado = [];
    await this.ObtenerAsignacionesUsuario(this.idEmpleadoLogueado);
    this.restD.ListarInformacionActual().subscribe(data => {
      this.datosEmpleado = this.FiltrarEmpleadosAsignados(data);
    });
  }

  // METODO PARA CONSULTAR ASIGNACIONES DE ACCESO
  async ObtenerAsignacionesUsuario(idEmpleado: any) {
    const dataEmpleado = {
      id_empleado: Number(idEmpleado)
    }

    let noPersonal: boolean = false;

    const res = await firstValueFrom(this.restUsuario.BuscarUsuarioDepartamento(dataEmpleado));
    this.asignacionesAcceso = res;

    const promises = this.asignacionesAcceso.map((asignacion: any) => {
      if (asignacion.principal) {
        if (!asignacion.administra && !asignacion.personal) {
          return Promise.resolve(null); // Devuelve una promesa resuelta para mantener la consistencia de los tipos de datos
        } else if (asignacion.administra && !asignacion.personal) {
          noPersonal = true;
        } else if (asignacion.personal && !asignacion.administra) {
          this.idUsuariosAcceso.push(this.idEmpleadoLogueado);
          return Promise.resolve(null); // Devuelve una promesa resuelta para mantener la consistencia de los tipos de datos
        }
      }

      const data = {
        id_departamento: asignacion.id_departamento
      }
      return firstValueFrom(this.restUsuario.ObtenerIdUsuariosDepartamento(data));
    });

    const results = await Promise.all(promises);

    const ids = results.flat().map((res: any) => res?.id).filter(Boolean);
    this.idUsuariosAcceso.push(...ids);

    if (noPersonal) {
      this.idUsuariosAcceso = this.idUsuariosAcceso.filter((id: any) => id !== this.idEmpleadoLogueado);
    }

  }

  // METODO PARA FILTRAR EMPLEADOS A LOS QUE EL USUARIO TIENE ACCESO
  FiltrarEmpleadosAsignados(data: any) {
    return data.filter((empleado: any) => this.idUsuariosAcceso.includes(empleado.id));
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
        data.fecha = this.validar.FormatearFecha(data.fecha_hora_timbre, this.formato_fecha, this.validar.dia_abreviado);
        data.hora = this.validar.FormatearHora(data.fecha_hora_timbre.split(' ')[1], this.formato_hora);
      })
    }, err => {
      this.toastr.info(err.error.message)
    })
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
    this.departamentoF.reset();
    this.filtroEmpleado = '';
    this.codigo.reset();
    this.cedula.reset();
    this.nombre.reset();
    this.cargoF.reset();
  }

  // METODO PARA CERRAR TABLA
  CerrarTabla() {
    this.lista = false;
    this.timbres = [];
  }
}
