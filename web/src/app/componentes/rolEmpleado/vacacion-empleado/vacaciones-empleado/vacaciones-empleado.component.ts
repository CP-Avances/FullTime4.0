import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';

import { PeriodoVacacionesService } from 'src/app/servicios/periodoVacaciones/periodo-vacaciones.service';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { VacacionesService } from 'src/app/servicios/vacaciones/vacaciones.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { EmplCargosService } from 'src/app/servicios/empleado/empleadoCargo/empl-cargos.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';

import { EditarVacacionesEmpleadoComponent } from '../editar-vacaciones-empleado/editar-vacaciones-empleado.component';
import { CancelarVacacionesComponent } from '../cancelar-vacaciones/cancelar-vacaciones.component';
import { RegistrarVacacionesComponent } from 'src/app/componentes/modulos/vacaciones/registrar-vacaciones/registrar-vacaciones.component';

@Component({
  selector: 'app-vacaciones-empleado',
  templateUrl: './vacaciones-empleado.component.html',
  styleUrls: ['./vacaciones-empleado.component.css']
})

export class VacacionesEmpleadoComponent implements OnInit {

  idEmpleado: string;
  idPerVacacion: any = [];

  // ITEMS DE PAGINACIÓN DE LA TABLA 
  numero_pagina: number = 1;
  tamanio_pagina: number = 5;
  pageSizeOptions = [5, 10, 20, 50];

  constructor(
    public restVacaciones: VacacionesService,
    public restEmpleado: EmpleadoService,
    public informacion: DatosGeneralesService,
    public parametro: ParametrosService,
    public restCargo: EmplCargosService,
    public restPerV: PeriodoVacacionesService,
    public ventana: MatDialog,
    public validar: ValidacionesService,
    private toastr: ToastrService,
  ) {
    this.idEmpleado = localStorage.getItem('empleado') as string;
  }

  ngOnInit(): void {
    this.BuscarParametro();
  }

  /** **************************************************************************************** **
   ** **                       METODOS GENERALES DEL SISTEMA                                ** ** 
   ** **************************************************************************************** **/

  // BUSQUEDA DE DATOS ACTUALES DEL USUARIO
  datoActual: any = [];
  VerDatosActuales() {
    this.datoActual = [];
    this.informacion.ObtenerDatosActuales(parseInt(this.idEmpleado)).subscribe(res => {
      this.datoActual = res[0];
    });
  }

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // METODO PARA VER LA INFORMACIÓN DEL EMPLEADO  
  empleadoUno: any = [];
  VerEmpleado(formato_fecha: string) {
    this.empleadoUno = [];
    this.restEmpleado.BuscarUnEmpleado(parseInt(this.idEmpleado)).subscribe(data => {
      this.empleadoUno = data;
      this.ObtenerPeriodoVacaciones(formato_fecha);
    })
  }

  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** ** 
   ** **************************************************************************************** **/

  formato_fecha: string = 'DD/MM/YYYY';
  formato_hora: string = 'HH:mm:ss';

  // METODO PARA BUSCAR PARÁMETRO DE FORMATO DE FECHA
  BuscarParametro() {
    // id_tipo_parametro Formato fecha = 25
    this.parametro.ListarDetalleParametros(25).subscribe(
      res => {
        this.formato_fecha = res[0].descripcion;
        this.LlamarMetodos(this.formato_fecha);
      },
      vacio => {
        this.LlamarMetodos(this.formato_fecha);
      });
  }

  // LLAMAR METODOS DE PRESENTACION DE INFORMACION
  LlamarMetodos(formato_fecha: string) {
    this.VerDatosActuales();
    this.VerEmpleado(formato_fecha);
    this.ObtenerVacaciones(formato_fecha);

  }

  /** ************************************************************************************************ **
   ** **                              METODO PARA MOSTRAR DATOS                                     ** **
   ** ************************************************************************************************ **/

  // METODO PARA IMPRIMIR DATOS DE VACACIONES 
  vacaciones: any = [];
  ObtenerVacaciones(formato_fecha: string) {
    this.restPerV.BuscarIDPerVacaciones(parseInt(this.idEmpleado)).subscribe(datos => {
      this.idPerVacacion = datos;
      this.restVacaciones.ObtenerVacacionesPorIdPeriodo(this.idPerVacacion[0].id).subscribe(res => {
        this.vacaciones = res;
        this.vacaciones.forEach(v => {
          // TRATAMIENTO DE FECHAS Y HORAS 
          v.fec_ingreso_ = this.validar.FormatearFecha(v.fec_ingreso, formato_fecha, this.validar.dia_completo);
          v.fec_inicio_ = this.validar.FormatearFecha(v.fec_inicio, formato_fecha, this.validar.dia_completo);
          v.fec_final_ = this.validar.FormatearFecha(v.fec_final, formato_fecha, this.validar.dia_completo);
        })
      });
    });
  }

  // METODO PARA IMPRIMIR DATOS DEL PERIODO DE VACACIONES 
  peridoVacaciones: any;
  ObtenerPeriodoVacaciones(formato_fecha: string) {
    this.peridoVacaciones = [];
    this.restPerV.ObtenerPeriodoVacaciones(this.empleadoUno[0].codigo).subscribe(datos => {
      this.peridoVacaciones = datos;

      this.peridoVacaciones.forEach(v => {
        // TRATAMIENTO DE FECHAS Y HORAS 
        v.fec_inicio_ = this.validar.FormatearFecha(v.fec_inicio, formato_fecha, this.validar.dia_completo);
        v.fec_final_ = this.validar.FormatearFecha(v.fec_final, formato_fecha, this.validar.dia_completo);
      })
    })
  }

  /** ********************************************************************************************** **
   ** **                              ABRIR VENTANAS DE SOLICITUDES                               ** **
   ** ********************************************************************************************** **/

  // VENTANA PARA REGISTRAR VACACIONES DEL EMPLEADO 
  AbrirVentanaVacaciones(): void {
    if (this.datoActual.id_contrato != undefined && this.datoActual.id_cargo != undefined) {
      this.restPerV.BuscarIDPerVacaciones(parseInt(this.idEmpleado)).subscribe(datos => {
        this.idPerVacacion = datos[0];
        this.ventana.open(RegistrarVacacionesComponent,
          {
            width: '900px', data: {
              idEmpleado: this.idEmpleado, idPerVacacion: this.idPerVacacion.id,
              idContrato: this.idPerVacacion.idcontrato, idCargo: this.datoActual.id_cargo,
              idContratoActual: this.datoActual.id_contrato
            }
          })
          .afterClosed().subscribe(item => {
            this.ObtenerVacaciones(this.formato_fecha);
          });
      }, error => {
        this.toastr.info('El empleado no tiene registrado Periodo de Vacaciones.', '', {
          timeOut: 6000,
        })
      });
    }
    else {
      this.toastr.info('El usuario no tiene registrado Contrato o Cargo.', '', {
        timeOut: 6000,
      })
    }
  }

  // METODO PARA EDITAR REGISTRO DE VACACION
  EditarVacaciones(v: any) {
    this.ventana.open(EditarVacacionesEmpleadoComponent,
      {
        width: '900px',
        data: {
          info: v, id_empleado: parseInt(this.idEmpleado),
          id_contrato: this.datoActual.id_contrato
        }
      }).afterClosed().subscribe(items => {
        this.ObtenerVacaciones(this.formato_fecha);
      });
  }

  // METODO PARA ELIMINAR REGISTRO DE VACACIONES
  CancelarVacaciones(v: any) {
    this.ventana.open(CancelarVacacionesComponent,
      {
        width: '450px',
        data: {
          id: v.id, id_empleado: parseInt(this.idEmpleado),
          id_contrato: this.datoActual.id_contrato
        }
      }).afterClosed().subscribe(items => {
        this.ObtenerVacaciones(this.formato_fecha);
      });
  }


}
