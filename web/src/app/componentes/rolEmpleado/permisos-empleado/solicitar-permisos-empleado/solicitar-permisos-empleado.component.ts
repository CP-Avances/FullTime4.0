import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../../environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';

import { RegistroEmpleadoPermisoComponent } from 'src/app/componentes/modulos/permisos/registro-empleado-permiso/registro-empleado-permiso.component';
import { EditarPermisoEmpleadoComponent } from '../editar-permiso-empleado/editar-permiso-empleado.component';
import { CancelarPermisoComponent } from '../cancelar-permiso/cancelar-permiso.component';

import { PeriodoVacacionesService } from 'src/app/servicios/periodoVacaciones/periodo-vacaciones.service';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { ValidacionesService } from '../../../../servicios/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { PermisosService } from 'src/app/servicios/permisos/permisos.service';

@Component({
  selector: 'app-solicitar-permisos-empleado',
  templateUrl: './solicitar-permisos-empleado.component.html',
  styleUrls: ['./solicitar-permisos-empleado.component.css']
})

export class SolicitarPermisosEmpleadoComponent implements OnInit {

  idEmpleado: string = '';

  idPerVacacion: any = [];
  idContrato: any = [];
  idCargo: any = [];

  // ITEMS DE PAGINACION DE LA TABLA 
  pageSizeOptions = [5, 10, 20, 50];
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;

  hipervinculo: string = environment.url

  constructor(
    public restPermiso: PermisosService,
    public parametro: ParametrosService,
    public restPerV: PeriodoVacacionesService,
    public ventana: MatDialog,
    private toastr: ToastrService,
    private validar: ValidacionesService,
    private informacion: DatosGeneralesService,
  ) {
    // LEER ID DE USUARIO QUE INICIA SESION
    var item = localStorage.getItem('empleado');
    if (item) {
      this.idEmpleado = item;
    }
  }

  ngOnInit(): void {
    this.BuscarParametro();
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
        this.BuscarHora(this.formato_fecha)
      },
      vacio => {
        this.BuscarHora(this.formato_fecha)
      });
  }

  BuscarHora(fecha: string) {
    // id_tipo_parametro Formato hora = 26
    this.parametro.ListarDetalleParametros(26).subscribe(
      res => {
        this.formato_hora = res[0].descripcion;
        this.ObtenerPermisos(fecha, this.formato_hora);
      },
      vacio => {
        this.ObtenerPermisos(fecha, this.formato_hora);
      });
  }

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }


  /** ******************************************************************************************** **
   ** **                             METODO PARA MOSTRAR DATOS                                  ** **
   ** ******************************************************************************************** **/

  // METODO PARA IMPRIMIR DATOS DEL PERMISO
  permisosTotales: any = [];
  ObtenerPermisos(formato_fecha: string, formato_hora: string) {
    this.permisosTotales = [];
    this.restPermiso.BuscarPermisoEmpleado(parseInt(this.idEmpleado)).subscribe(datos => {
      this.permisosTotales = datos;
      this.permisosTotales.forEach((p: any) => {
        // TRATAMIENTO DE FECHAS Y HORAS
        p.fec_creacion_ = this.validar.FormatearFecha(p.fec_creacion, formato_fecha, this.validar.dia_completo);
        p.fec_inicio_ = this.validar.FormatearFecha(p.fec_inicio, formato_fecha, this.validar.dia_completo);
        p.fec_final_ = this.validar.FormatearFecha(p.fec_final, formato_fecha, this.validar.dia_completo);

        p.hora_ingreso_ = this.validar.FormatearHora(p.hora_ingreso, formato_hora);
        p.hora_salida_ = this.validar.FormatearHora(p.hora_salida, formato_hora);

      })
    }, err => {
      return this.validar.RedireccionarEstadisticas(err.error)
    });
  }

  // VENTANA PARA REGISTRAR PERMISOS DEL EMPLEADO 
  AbrirVentanaPermiso(): void {
    this.informacion.ObtenerDatosActuales(parseInt(this.idEmpleado)).subscribe((actual: any) => {
      this.restPerV.BuscarIDPerVacaciones(parseInt(this.idEmpleado)).subscribe(datos => {
        this.idPerVacacion = datos;
        this.ventana.open(RegistroEmpleadoPermisoComponent,
          {
            width: '1200px',
            data: {
              idEmpleado: this.idEmpleado, idContrato: actual[0].id_contrato,
              idPerVacacion: this.idPerVacacion[0].id, idCargo: actual[0].id_cargo
            }
          }).afterClosed().subscribe(item => {
            this.ObtenerPermisos(this.formato_fecha, this.formato_hora);
          });
      }, error => {
        this.toastr.info('El usuario no tiene registrado Periodo de Vacaciones.', '', {
          timeOut: 6000,
        })
      });
    }, error => {
      this.toastr.info('Revisar que el usuario tenga un contrato y un cargo.', '', {
        timeOut: 6000,
      })
    });
  }

  CancelarPermiso(dataPermiso: any) {
    this.ventana.open(CancelarPermisoComponent,
      {
        width: '450px',
        data: { info: dataPermiso, id_empleado: parseInt(this.idEmpleado) }
      }).afterClosed().subscribe(items => {
        this.ObtenerPermisos(this.formato_fecha, this.formato_hora);
      });
  }

  EditarPermiso(permisos: any) {
    this.ventana.open(EditarPermisoEmpleadoComponent, {
      width: '1200px',
      data: { dataPermiso: permisos, id_empleado: parseInt(this.idEmpleado) }
    }).afterClosed().subscribe(items => {
      this.ObtenerPermisos(this.formato_fecha, this.formato_hora);
    });
  }
}
