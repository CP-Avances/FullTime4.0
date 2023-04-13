import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';

import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { EmplCargosService } from 'src/app/servicios/empleado/empleadoCargo/empl-cargos.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { PlanHorarioService } from 'src/app/servicios/horarios/planHorario/plan-horario.service';
import { PlanGeneralService } from 'src/app/servicios/planGeneral/plan-general.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { DetallePlanHorarioService } from 'src/app/servicios/horarios/detallePlanHorario/detalle-plan-horario.service';

import { RegistroDetallePlanHorarioComponent } from 'src/app/componentes/horarios/detallePlanHorario/registro-detalle-plan-horario/registro-detalle-plan-horario.component';
import { RegistroPlanHorarioComponent } from 'src/app/componentes/horarios/planificacionHorario/registro-plan-horario/registro-plan-horario.component';
import { EditarPlanificacionComponent } from 'src/app/componentes/horarios/planificacionHorario/editar-planificacion/editar-planificacion.component';
import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';

@Component({
  selector: 'app-planificacion-horario-empleado',
  templateUrl: './planificacion-horario-empleado.component.html',
  styleUrls: ['./planificacion-horario-empleado.component.css']
})

export class PlanificacionHorarioEmpleadoComponent implements OnInit {

  idEmpleado: string = '';
  empleadoUno: any = [];

  // ITEMS DE PAGINACION DE LA TABLA 
  numero_pagina: number = 1;
  tamanio_pagina: number = 5;
  pageSizeOptions = [5, 10, 20, 50];

  constructor(
    public restPlanHoraDetalle: DetallePlanHorarioService,
    public restPlanGeneral: PlanGeneralService,
    public restEmpleado: EmpleadoService,
    public informacion: DatosGeneralesService,
    public restCargo: EmplCargosService,
    public restPlanH: PlanHorarioService,
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
    this.VerEmpleado();
    this.BuscarParametro();
  }

  /** **************************************************************************************** **
   ** **                       METODOS GENERALES DEL SISTEMA                                ** ** 
   ** **************************************************************************************** **/

  // BUSQUEDA DE DATOS ACTUALES DEL USUARIO
  datoActual: any = [];
  VerDatosActuales(formato_fecha: string) {
    this.datoActual = [];
    this.informacion.ObtenerDatosActuales(parseInt(this.idEmpleado)).subscribe((res: any) => {
      this.datoActual = res[0];
      // LLAMADO A DATOS DE USUARIO
      this.ObtenerHorarioRotativo(this.datoActual.codigo, formato_fecha);
    });
  }

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  VerEmpleado() {
    this.empleadoUno = [];
    this.restEmpleado.BuscarUnEmpleado(parseInt(this.idEmpleado)).subscribe(data => {
      this.empleadoUno = data;
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
        this.VerDatosActuales(this.formato_fecha);
      },
      vacio => {
        this.VerDatosActuales(this.formato_fecha);
      });
  }

  /** **************************************************************************************** **
   ** **             METODO DE PRESENTACION DE DATOS DE HORARIOS ROTATIVOS                  ** **
   ** **************************************************************************************** **/

  // METODO PARA IMPRIMIR DATOS DE LA HORARIOS ROTATIVOS 
  horarioRotativo: any = [];
  ObtenerHorarioRotativo(codigo: number, formato_fecha: string) {
    this.horarioRotativo = [];
    this.restPlanH.ObtenerHorarioRotativo(codigo).subscribe(datos => {
      this.horarioRotativo = datos;
      this.horarioRotativo.forEach((data: any) => {
        data.fec_inicio_ = this.validar.FormatearFecha(data.fec_inicio, formato_fecha, this.validar.dia_abreviado);
        data.fec_final_ = this.validar.FormatearFecha(data.fec_final, formato_fecha, this.validar.dia_abreviado);
      })
    })
  }

  // VENTANA PARA REGISTRAR PLANIFICACIÓN DE HORARIOS DEL EMPLEADO 
  AbrirVentanaHorarioRotativo(): void {
    if (this.datoActual.id_cargo != undefined) {
      this.ventana.open(RegistroPlanHorarioComponent,
        {
          width: '300px', data: {
            idEmpleado: this.idEmpleado, idCargo: this.datoActual.id_cargo
          }
        })
        .afterClosed().subscribe(item => {
          this.ObtenerHorarioRotativo(this.datoActual.codigo, this.formato_fecha);
        });
    }
    else {
      this.toastr.info('El usuario no tiene registrado un Cargo.', '', {
        timeOut: 6000,
      })
    }
  }

  // VENTANA PARA REGISTRAR HORARIO 
  AbrirEditarHorarioRotativo(datoSeleccionado: any): void {
    this.ventana.open(EditarPlanificacionComponent,
      { width: '300px', data: { idEmpleado: this.idEmpleado, datosPlan: datoSeleccionado } })
      .afterClosed().subscribe(item => {
        this.ObtenerHorarioRotativo(this.datoActual.codigo, this.formato_fecha);
      });
  }

  // VENTANA PARA REGISTRAR DETALLE DE HORARIO DEL EMPLEADO
  AbrirVentanaDetallePlanHorario(datos: any): void {
    console.log(datos);
    this.ventana.open(RegistroDetallePlanHorarioComponent,
      { width: '350px', data: { idEmpleado: this.idEmpleado, planHorario: datos, actualizarPage: false, direccionarE: false } }).disableClose = true;
  }


  // BUSCAR FECHAS DE HORARIO y ELIMINAR PLANIFICACION GENERAL
  id_planificacion_general: any = [];
  EliminarPlanGeneral(fec_inicio: string, fec_final: string, horario: number, codigo: string) {
    this.id_planificacion_general = [];
    let plan_fecha = {
      fec_inicio: fec_inicio.split('T')[0],
      fec_final: fec_final.split('T')[0],
      id_horario: horario,
      codigo: parseInt(codigo)
    };
    this.restPlanGeneral.BuscarFechas(plan_fecha).subscribe(res => {
      this.id_planificacion_general = res;
      this.id_planificacion_general.map((obj: any) => {
        this.restPlanGeneral.EliminarRegistro(obj.id).subscribe(res => {
        })
      })
    })
  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO DE HORARIO ROTATIVO
  EliminarHorarioRotativo(id_plan: number) {
    this.restPlanH.EliminarRegistro(id_plan).subscribe(res => {
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
      this.ObtenerHorarioRotativo(this.datoActual.codigo, this.formato_fecha);
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO DE HORARIO ROTATIVO
  ConfirmarHorarioRotativo(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.BuscarDatosPlanHorario(datos.id, datos.codigo)
          this.EliminarHorarioRotativo(datos.id);
        } else {
          this.router.navigate(['/planificacionHorario']);
        }
      });
  }

  // BUSCAR DETALLES DEL HORARIO ROTATIVO 
  detallesPlanificacion: any = [];
  BuscarDatosPlanHorario(id_planificacion: any, codigo: string) {
    this.detallesPlanificacion = [];
    this.restPlanHoraDetalle.ObtenerPlanHoraDetallePorIdPlanHorario(id_planificacion)
      .subscribe(datos => {
        this.detallesPlanificacion = datos;
        this.detallesPlanificacion.map((obj: any) => {
          this.EliminarPlanificacionGeneral(obj.fecha, obj.id_horario, codigo)
        })
      })
  }

  // ELIMINAR REGISTROS DE PLANIFICACION GENERAL 
  EliminarPlanificacionGeneral(fecha: string, horario: number, codigo: string) {
    this.id_planificacion_general = [];
    let plan_fecha = {
      fec_inicio: fecha.split('T')[0],
      id_horario: horario,
      codigo: parseInt(codigo)
    };
    this.restPlanGeneral.BuscarFecha(plan_fecha).subscribe(res => {
      this.id_planificacion_general = res;
      this.id_planificacion_general.map((obj: any) => {
        this.restPlanGeneral.EliminarRegistro(obj.id).subscribe(res => {
        })
      })
    })
  }

}
