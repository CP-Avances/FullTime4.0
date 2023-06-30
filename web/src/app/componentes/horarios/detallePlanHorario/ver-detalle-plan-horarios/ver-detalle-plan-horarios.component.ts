import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FormControl } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';

import { RegistroDetallePlanHorarioComponent } from 'src/app/componentes/horarios/detallePlanHorario/registro-detalle-plan-horario/registro-detalle-plan-horario.component';
import { EditarDetallePlanComponent } from 'src/app/componentes/horarios/detallePlanHorario/editar-detalle-plan/editar-detalle-plan.component';
import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';

import { DetallePlanHorarioService } from 'src/app/servicios/horarios/detallePlanHorario/detalle-plan-horario.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { PlanHorarioService } from 'src/app/servicios/horarios/planHorario/plan-horario.service';
import { PlanGeneralService } from 'src/app/servicios/planGeneral/plan-general.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';

@Component({
  selector: 'app-ver-detalle-plan-horarios',
  templateUrl: './ver-detalle-plan-horarios.component.html',
  styleUrls: ['./ver-detalle-plan-horarios.component.css']
})

export class VerDetallePlanHorariosComponent implements OnInit {

  datosPlanificacion: any = [];
  datosDetalle: any = [];
  idEmpleado: string;
  idPlanH: string;

  // ITEMS DE PAGINACIÓN DE LA TABLA
  numero_pagina: number = 1;
  tamanio_pagina: number = 5;
  pageSizeOptions = [5, 10, 20, 50];

  nameFile: string;
  archivoSubido: Array<File>;

  archivo1Form = new FormControl('');
  hipervinculo: string = environment.url

  constructor(
    private restEmpleado: EmpleadoService,
    private toastr: ToastrService,
    private restDP: DetallePlanHorarioService,
    private restPH: PlanHorarioService,
    private restP: PlanGeneralService,
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

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1
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

  BuscarDatosPlanHorario(id_planificacion: any, formato_fecha: string) {
    this.datosPlanificacion = [];
    this.restPH.ObtenerPlanHorarioPorId(id_planificacion).subscribe(datos => {
      this.datosPlanificacion = datos;
      this.datosPlanificacion.forEach(data => {
        data.fec_inicio_ = this.validar.FormatearFecha(data.fec_inicio, formato_fecha, this.validar.dia_abreviado);
        data.fec_final_ = this.validar.FormatearFecha(data.fec_final, formato_fecha, this.validar.dia_abreviado);
      })
    })
  }

  ListarDetalles(id_planificacion: any, formato_fecha: string) {
    this.datosDetalle = [];
    this.restDP.ObtenerPlanHoraDetallePorIdPlanHorario(id_planificacion).subscribe(datos => {
      this.datosDetalle = datos;
      this.datosDetalle.forEach(data => {
        data.fecha_ = this.validar.FormatearFecha(data.fecha, formato_fecha, this.validar.dia_abreviado);
      })
    })
  }

  AbrirVentanaDetalles(datosSeleccionados): void {
    this.ventana.open(RegistroDetallePlanHorarioComponent, { width: '350px', data: { planHorario: datosSeleccionados, actualizarPage: true } })
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
  EliminarDetalle(id_detalle: number, fecha, horario, codigo) {
    this.restDP.EliminarRegistro(id_detalle).subscribe(res => {
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
      this.ListarDetalles(this.idPlanH, this.formato_fecha);
      this.EliminarPlanificacion(fecha, horario, codigo)
    });
  }

  id_planificacion_general: any = [];
  EliminarPlanificacion(fecha, horario, codigo) {
    this.id_planificacion_general = [];
    let plan_fecha = {
      fec_inicio: fecha.split('T')[0],
      id_horario: horario,
      codigo: parseInt(codigo)
    };
    this.restP.BuscarFecha(plan_fecha).subscribe(res => {
      this.id_planificacion_general = res;
      this.id_planificacion_general.map(obj => {
        this.restP.EliminarRegistro(obj.id).subscribe(res => {
        })
      })
    })
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
  ConfirmarDelete(datos: any) {
    console.log('detalle plan', datos);
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarDetalle(datos.id, datos.fecha, datos.id_horario, parseInt(this.empleado[0].codigo));
        } else {
          this.router.navigate(['/verDetalles/', this.idPlanH, this.idEmpleado]);
        }
      });
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

  /** ******************************************************************************************** ** 
   ** **                                  PLANTILLA CARGAR SOLO HORARIOS                        ** **
   ** ******************************************************************************************** **/

  fileChangePlantilla(element) {
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
    this.restDP.VerificarDatos(parseInt(this.idPlanH), formData).subscribe(resD => {
      if (resD.message === 'error') {
        this.toastr.error('Para el buen funcionamiento del sistema verificar los datos de la plantilla. ' +
          'Recuerde que el horario indicado debe estar registrado en el sistema y debe tener su respectivo detalle de horario, ' +
          'el empleado debe tener registrado un contrato de trabajo y la fecha indicada no deben estar duplicada dentro del sistema. ' +
          'A menos que tenga un diferente detalle de horario.', 'Verificar Plantilla', {
          timeOut: 6000,
        });
        this.archivo1Form.reset();
        this.nameFile = '';
      }
      else {
        this.restDP.VerificarPlantilla(formData).subscribe(resP => {
          if (resP.message === 'error') {
            this.toastr.error('Para el buen funcionamiento del sistema verificar los datos de la plantilla. ' +
              'Recuerde que el horario indicado debe estar registrado en el sistema y debe tener su respectivo detalle de horario, ' +
              'el empleado debe tener registrado un contrato de trabajo y la fecha indicada no deben estar duplicada dentro del sistema. ' +
              'A menos que tenga un diferente detalle de horario.', 'Verificar Plantilla', {
              timeOut: 6000,
            });
            this.archivo1Form.reset();
            this.nameFile = '';
          }
          else {
            this.restDP.subirArchivoExcel(parseInt(this.idPlanH), formData).subscribe(resS => {
              this.restDP.CrearPlanificacionGeneral(parseInt(this.idEmpleado), parseInt(this.empleado[0].codigo), formData).subscribe(resPG => {
                this.toastr.success('Operación exitosa.', 'Plantilla de Horario importada.', {
                  timeOut: 6000,
                });
                this.ListarDetalles(this.idPlanH, this.formato_fecha);
                this.archivo1Form.reset();
                this.nameFile = '';
              });
            });
          }
        });
      }
    });
  }
}
