import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';

import { RegistrarEmpleProcesoComponent } from '../../modulos/accionesPersonal/procesos/registrar-emple-proceso/registrar-emple-proceso.component';
import { EditarEmpleadoProcesoComponent } from '../../modulos/accionesPersonal/procesos/editar-empleado-proceso/editar-empleado-proceso.component';
import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';

import { EmpleadoProcesosService } from 'src/app/servicios/empleado/empleadoProcesos/empleado-procesos.service';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';

@Component({
  selector: 'app-procesos-empleado',
  templateUrl: './procesos-empleado.component.html',
  styleUrls: ['./procesos-empleado.component.css']
})

export class ProcesosEmpleadoComponent implements OnInit {

  idEmpleado: string = '';

  // ITEMS DE PAGINACION DE LA TABLA 
  numero_pagina: number = 1;
  tamanio_pagina: number = 5;
  pageSizeOptions = [5, 10, 20, 50];

  constructor(
    public restEmpleadoProcesos: EmpleadoProcesosService,
    public informacion: DatosGeneralesService,
    public parametro: ParametrosService,
    public ventana: MatDialog,
    public validar: ValidacionesService,
    public router: Router,
    private toastr: ToastrService,
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
   ** **                       METODOS GENERALES DEL SISTEMA                                ** ** 
   ** **************************************************************************************** **/

  // BUSQUEDA DE DATOS ACTUALES DEL USUARIO
  datoActual: any = [];
  VerDatosActuales() {
    this.datoActual = [];
    this.informacion.ObtenerDatosActuales(parseInt(this.idEmpleado)).subscribe((res: any) => {
      this.datoActual = res[0];
    });
  }

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
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
    this.ObtenerEmpleadoProcesos(formato_fecha);
  }

  /** ******************************************************************************************* **
   ** **                   METODO DE PRSENTACION DE DATOS DE PROCESOS                          ** ** 
   ** ******************************************************************************************* **/

  // METODO PARA MOSTRAR DATOS DE LOS PROCESOS DEL EMPLEADO 
  empleadoProcesos: any = [];
  ObtenerEmpleadoProcesos(formato_fecha: string) {
    this.empleadoProcesos = [];
    this.restEmpleadoProcesos.ObtenerProcesoUsuario(parseInt(this.idEmpleado)).subscribe(datos => {
      this.empleadoProcesos = datos;
      this.empleadoProcesos.forEach((data: any) => {
        data.fec_inicio_ = this.validar.FormatearFecha(data.fec_inicio, formato_fecha, this.validar.dia_abreviado);
        data.fec_final_ = this.validar.FormatearFecha(data.fec_final, formato_fecha, this.validar.dia_abreviado);
      })
    })
  }

  // VENTANA PARA INGRESAR PROCESOS DEL EMPLEADO 
  AbrirVentanaProcesos(): void {
    if (this.datoActual.id_cargo != undefined) {
      this.ventana.open(RegistrarEmpleProcesoComponent,
        { width: '600px', data: { idEmpleado: this.idEmpleado, idCargo: this.datoActual.id_cargo } })
        .afterClosed().subscribe(item => {
          this.ObtenerEmpleadoProcesos(this.formato_fecha);
        });
    }
    else {
      this.toastr.info('El usuario no tiene registrado un Cargo.', '', {
        timeOut: 6000,
      })
    }
  }

  // VENTANA PARA EDITAR PROCESOS DEL EMPLEADO 
  AbrirVentanaEditarProceso(datoSeleccionado: any): void {
    this.ventana.open(EditarEmpleadoProcesoComponent,
      { width: '500px', data: { idEmpleado: this.idEmpleado, datosProcesos: datoSeleccionado } })
      .afterClosed().subscribe(item => {
        this.ObtenerEmpleadoProcesos(this.formato_fecha);
      });
  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO PROCESOS
  EliminarProceso(id_plan: number) {
    this.restEmpleadoProcesos.EliminarRegistro(id_plan).subscribe(res => {
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
      this.ObtenerEmpleadoProcesos(this.formato_fecha);
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
  ConfirmarDeleteProceso(datos: any) {
    console.log(datos);
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarProceso(datos.id);
        } else {
          this.router.navigate(['/procesosEmpleado']);
        }
      });
  }
}
