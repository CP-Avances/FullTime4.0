import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FormControl } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';

import { RegistroDetallePlanHorarioComponent } from 'src/app/componentes/horarios/detallePlanHorario/registro-detalle-plan-horario/registro-detalle-plan-horario.component';
import { EditarDetallePlanComponent } from 'src/app/componentes/horarios/detallePlanHorario/editar-detalle-plan/editar-detalle-plan.component';
import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';

import { DetallePlanHorarioService } from 'src/app/servicios/horarios/detallePlanHorario/detalle-plan-horario.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { PlanHorarioService } from 'src/app/servicios/horarios/planHorario/plan-horario.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';

@Component({
  selector: 'app-detalle-horario-empleado',
  templateUrl: './detalle-horario-empleado.component.html',
  styleUrls: ['./detalle-horario-empleado.component.css']
})

export class DetalleHorarioEmpleadoComponent implements OnInit {

  idPlanH: string;
  idEmpleado: string;
  datosPlanificacion: any = [];
  datosDetalle: any = [];

  // ITEMS DE PAGINACIÓN DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  nameFile: string='';
  archivoSubido: Array<File>=[];

  archivo1Form = new FormControl('');
  hipervinculo: string = environment.url

  constructor(
    private restEmpleado: EmpleadoService,
    private restDP: DetallePlanHorarioService,
    private restPH: PlanHorarioService,
    private toastr: ToastrService,
    public router: Router,
    public ventana: MatDialog,
    public validar: ValidacionesService,
    public parametro: ParametrosService,
  ) {
    var cadena = this.router.url;
    var aux = cadena.split("/");
    this.idPlanH = aux[2];
    this.idEmpleado = aux[3];
  }

  ngOnInit(): void {
    this.BuscarParametro();
    this.ObtenerEmpleado(parseInt(this.idEmpleado))
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
        this.LlamarMetodo(this.formato_fecha);
      },
      vacio => {
        this.LlamarMetodo(this.formato_fecha);
      });
  }

  LlamarMetodo(formato_fecha: string) {
    this.BuscarDatosPlanHorario(this.idPlanH, formato_fecha);
    this.ListarDetalles(this.idPlanH, formato_fecha);
  }

  empleado: any = [];
  usuario: string = '';
  // METODO PARA VER LA INFORMACIÓN DEL EMPLEADO 
  ObtenerEmpleado(idemploy: any) {
    this.empleado = [];
    this.restEmpleado.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleado = data;
      this.usuario = this.empleado[0].nombre + ' ' + this.empleado[0].apellido;
    })
  }

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1
  }

  BuscarDatosPlanHorario(id_planificacion: any, formato_fecha: string) {
    this.datosPlanificacion = [];
    this.restPH.ObtenerPlanHorarioPorId(id_planificacion).subscribe(datos => {
      this.datosPlanificacion = datos;
      this.datosPlanificacion.forEach((data: any) => {
        data.fec_inicio_ = this.validar.FormatearFecha(data.fec_inicio, formato_fecha, this.validar.dia_abreviado);
        data.fec_final_ = this.validar.FormatearFecha(data.fec_final, formato_fecha, this.validar.dia_abreviado);
      })
    })
  }

  ListarDetalles(id_planificacion: any, formato_fecha: string) {
    this.datosDetalle = [];
    this.restDP.ObtenerPlanHoraDetallePorIdPlanHorario(id_planificacion).subscribe(datos => {
      this.datosDetalle = datos;
      this.datosDetalle.forEach((data: any) => {
        data.fecha_ = this.validar.FormatearFecha(data.fecha, formato_fecha, this.validar.dia_abreviado);
      })
    })
  }

  AbrirVentanaDetalles(datosSeleccionados: any): void {
    this.ventana.open(RegistroDetallePlanHorarioComponent, { width: '350px', data: { planHorario: datosSeleccionados, actualizarPage: true, direccionarE: true } })
      .afterClosed().subscribe(item => {
        this.ListarDetalles(this.idPlanH, this.formato_fecha);
      });
  }

  AbrirVentanaEditar(datosSeleccionados: any, datosPlan: any): void {
    console.log(datosSeleccionados);
    this.ventana.open(EditarDetallePlanComponent,
      { width: '350px', data: { detalle: datosSeleccionados, plan: datosPlan } })
      .afterClosed().subscribe(item => {
        this.ListarDetalles(this.idPlanH, this.formato_fecha);
      });
  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO PLANIFICACIÓN
  EliminarDetalle(id_detalle: number) {
    this.restDP.EliminarRegistro(id_detalle).subscribe(res => {
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
      this.ListarDetalles(this.idPlanH, this.formato_fecha);
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
  ConfirmarDelete(datos: any) {
    console.log(datos);
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarDetalle(datos.id);
        } else {
          this.router.navigate(['/horarioRotativo/', this.idPlanH, this.idEmpleado]);
        }
      });
  }

  /** ************************************************************************************************ ** 
   ** **                            PLANTILLA CARGAR SOLO HORARIOS                                  ** **
   ** ************************************************************************************************ **/

  fileChangePlantilla(element: any) {
    this.archivoSubido = element.target.files;
    this.nameFile = this.archivoSubido[0].name;
    let arrayItems = this.nameFile.split(".");
    let itemExtencion = arrayItems[arrayItems.length - 1];
    let itemName = arrayItems[0].slice(0, 30);
    console.log('nombre', itemName);
    if (itemExtencion == 'xlsx' || itemExtencion == 'xls') {
      if (itemName.toLowerCase() == 'detalle planificacion empleado') {
        this.plantillaDetalle();
      } else {
        this.toastr.error('Solo se acepta Platilla con nombre Detalle Planificacion Empleado', 'Plantilla seleccionada incorrecta', {
          timeOut: 6000,
        });
      }
    } else {
      this.toastr.error('Error en el formato del documento', 'Plantilla no aceptada', {
        timeOut: 6000,
      });
    }
  }

  plantillaDetalle() {
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads[]", this.archivoSubido[i], this.archivoSubido[i].name);
      console.log('ver', this.archivoSubido[i])
    }
    this.restDP.subirArchivoExcel(parseInt(this.idPlanH), formData).subscribe(res => {
      this.toastr.success('Operación exitosa.', 'Plantilla de Horario importada.', {
        timeOut: 6000,
      });
      this.ListarDetalles(this.idPlanH, this.formato_fecha);
      this.archivo1Form.reset();
      this.nameFile = '';
    });
  }

}
