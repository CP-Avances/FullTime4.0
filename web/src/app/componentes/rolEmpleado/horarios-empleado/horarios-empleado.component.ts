import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FormControl } from '@angular/forms';
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
import { EmpleadoHorariosService } from 'src/app/servicios/horarios/empleadoHorarios/empleado-horarios.service';

import { RegistoEmpleadoHorarioComponent } from 'src/app/componentes/horarios/rango-fechas/registo-empleado-horario/registo-empleado-horario.component';
import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-horarios-empleado',
  templateUrl: './horarios-empleado.component.html',
  styleUrls: ['./horarios-empleado.component.css']
})

export class HorariosEmpleadoComponent implements OnInit {

  idEmpleado: string;

  // ITEMS DE PAGINACION DE LA TABLA 
  numero_pagina: number = 1;
  tamanio_pagina: number = 5;
  pageSizeOptions = [5, 10, 20, 50];

  hipervinculo: string = environment.url

  constructor(
    public restEmpleHorario: EmpleadoHorariosService,
    public restEmpleado: EmpleadoService,
    public informacion: DatosGeneralesService,
    public restCargo: EmplCargosService,
    public restPlanH: PlanHorarioService,
    public parametro: ParametrosService,
    public ventana: MatDialog,
    public validar: ValidacionesService,
    public router: Router,
    private toastr: ToastrService,
    private restPlanGeneral: PlanGeneralService,
  ) {
    this.idEmpleado = localStorage.getItem('empleado') as string;
  }

  ngOnInit(): void {
    this.ObtenerEmpleado();
    this.BuscarParametro();
  }

  /** **************************************************************************************** **
   ** **                       METODOS GENERALES DEL SISTEMA                                ** ** 
   ** **************************************************************************************** **/

  // BUSQUEDA DE DATOS ACTUALES DEL USUARIO
  datoActual: any = [];
  VerDatosActuales(formato_fecha: string) {
    this.datoActual = [];
    this.informacion.ObtenerDatosActuales(parseInt(this.idEmpleado)).subscribe(res => {
      this.datoActual = res[0];
      // LLAMADO A DATOS DE USUARIO
      this.ObtenerHorariosEmpleado(this.datoActual.codigo, formato_fecha);
      this.ObtenerCargoEmpleado(this.datoActual.id_cargo, formato_fecha);
    });
  }

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // METODO PARA VER LA INFORMACION DEL EMPLEADO 
  empleado: any = [];
  ObtenerEmpleado() {
    this.empleado = [];
    this.restEmpleado.BuscarUnEmpleado(parseInt(this.idEmpleado)).subscribe(data => {
      this.empleado = data;
    })
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
        this.LlamarMetodos(this.formato_fecha);
      },
      vacio => {
        this.LlamarMetodos(this.formato_fecha);
      });
  }

  // LLAMAR METODOS DE PRESENTACION DE INFORMACION
  LlamarMetodos(formato_fecha: string) {
    this.VerDatosActuales(formato_fecha);
  }

  /** ***************************************************************************************** ** 
   ** **              METODOS PARA MANEJAR HORARIOS FIJOS DEL USUARIO                        ** ** 
   ** ***************************************************************************************** **/

  // METODO PARA MOSTRAR DATOS DE HORARIO 
  horariosEmpleado: any = [];
  ObtenerHorariosEmpleado(codigo: number, formato_fecha: string) {
    this.horariosEmpleado = [];
    this.restEmpleHorario.BuscarHorarioUsuario(codigo).subscribe(datos => {
      this.horariosEmpleado = datos;
      this.horariosEmpleado.forEach(data => {
        data.fec_inicio_ = this.validar.FormatearFecha(data.fec_inicio, formato_fecha, this.validar.dia_abreviado);
        data.fec_final_ = this.validar.FormatearFecha(data.fec_final, formato_fecha, this.validar.dia_abreviado);
      })
    })
  }

  // VENTANA PARA REGISTRAR HORARIO 
  AbrirVentanaEmplHorario(): void {
    if (this.datoActual.id_cargo != undefined) {
      this.ventana.open(RegistoEmpleadoHorarioComponent,
        {
          width: '600px',
          data: {
            idEmpleado: this.idEmpleado, idCargo: this.datoActual.id_cargo,
            horas_trabaja: this.cargoEmpleado[0].hora_trabaja
          }
        }).afterClosed().subscribe(item => {
          this.ObtenerHorariosEmpleado(this.datoActual.codigo, this.formato_fecha);
        });
    }
    else {
      this.toastr.info('El usuario no tiene registrado un Cargo.', '', {
        timeOut: 6000,
      })
    }
  }



  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO HORARIO
  EliminarHorario(id_horario: number) {
    this.restEmpleHorario.EliminarRegistro(id_horario).subscribe(res => {
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
      this.ObtenerHorariosEmpleado(this.datoActual.codigo, this.formato_fecha);
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
  ConfirmarDeleteHorario(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarPlanGeneral(datos.fec_inicio, datos.fec_final, datos.id_horarios, datos.codigo)
          this.EliminarHorario(datos.id);
        } else {
          this.router.navigate(['/horariosEmpleado']);
        }
      });
  }

  // BUSCAR FECHAS DE HORARIO y ELIMINAR PLANIFICACION GENERAL
  id_planificacion_general: any = [];
  EliminarPlanGeneral(fec_inicio: string, fec_final: string, horario: number, codigo: string) {
    this.id_planificacion_general = [];
    let plan_fecha = {
      fec_inicio: fec_inicio.split('T')[0],
      fec_final: fec_final.split('T')[0],
      id_horario: horario,
      codigo: codigo
    };
    this.restPlanGeneral.BuscarFechas(plan_fecha).subscribe(res => {
      this.id_planificacion_general = res;
      this.id_planificacion_general.map(obj => {
        this.restPlanGeneral.EliminarRegistro(obj.id).subscribe(res => {
        })
      })
    })
  }

  /** ********************************************************************************************* **
   ** **                     CARGAR HORARIOS DEL EMPLEADO CON PLANTILLA                          ** **
   ** ********************************************************************************************* **/

  nameFileHorario: string;
  archivoSubidoHorario: Array<File>;
  archivoHorarioForm = new FormControl('');

  FileChangeHorario(element) {
    if (this.datoActual.id_cargo != undefined) {
      this.archivoSubidoHorario = element.target.files;
      this.nameFileHorario = this.archivoSubidoHorario[0].name;
      let arrayItems = this.nameFileHorario.split(".");
      let itemExtencion = arrayItems[arrayItems.length - 1];
      let itemName = arrayItems[0].slice(0, 16);
      console.log(itemName.toLowerCase());
      if (itemExtencion == 'xlsx' || itemExtencion == 'xls') {
        if (itemName.toLowerCase() == 'horario empleado') {
          this.SubirPlantillaHorario();
        } else {
          this.toastr.error('Plantilla seleccionada incorrecta', '', {
            timeOut: 6000,
          });
          this.archivoHorarioForm.reset();
          this.nameFileHorario = '';
        }
      } else {
        this.toastr.error('Error en el formato del documento', 'Plantilla no aceptada', {
          timeOut: 6000,
        });
        this.archivoHorarioForm.reset();
        this.nameFileHorario = '';
      }
    }
    else {
      this.toastr.info('El empleado no tiene registrado un Cargo.', '', {
        timeOut: 6000,
      })
      this.archivoHorarioForm.reset();
      this.nameFileHorario = '';
    }
  }

  SubirPlantillaHorario() {
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubidoHorario.length; i++) {
      formData.append("uploads[]", this.archivoSubidoHorario[i], this.archivoSubidoHorario[i].name);
      console.log("toda la data", this.archivoSubidoHorario[i])
    }
    this.restEmpleHorario.VerificarDatos_EmpleadoHorario(formData, parseInt(this.idEmpleado)).subscribe(res => {
      console.log('entra')
      if (res.message === 'error') {
        this.toastr.error('Para el buen funcionamiento del sistema verificar los datos de la plantilla. ' +
          'Recuerde que el horario indicado debe estar registrado en el sistema y debe tener su respectivo detalle de horario, ' +
          'el empleado debe tener registrado un contrato de trabajo y las fechas indicadas no deben estar duplicadas dentro del sistema. ' +
          'Las fechas deben estar ingresadas correctamente, la fecha de inicio no debe ser posterior a la fecha final.', 'Verificar Plantilla', {
          timeOut: 6000,
        });
        this.archivoHorarioForm.reset();
        this.nameFileHorario = '';
      }
      else {
        this.restEmpleHorario.VerificarPlantilla_EmpleadoHorario(formData).subscribe(resD => {
          if (resD.message === 'error') {
            this.toastr.error('Para el buen funcionamiento del sistema verificar los datos de la plantilla. ' +
              'Recuerde que el horario indicado debe estar registrado en el sistema y debe tener su respectivo detalle de horario, ' +
              'el empleado debe tener registrado un contrato de trabajo y las fechas indicadas no deben estar duplicadas dentro del sistema.', 'Verificar Plantilla', {
              timeOut: 6000,
            });
            this.archivoHorarioForm.reset();
            this.nameFileHorario = '';
          }
          else {
            this.restEmpleHorario.SubirArchivoExcel(formData, parseInt(this.idEmpleado), this.empleado[0].codigo).subscribe(resC => {
              this.restEmpleHorario.CreaPlanificacion(formData, parseInt(this.idEmpleado), this.empleado[0].codigo).subscribe(resP => {
                this.toastr.success('Operación exitosa.', 'Plantilla de Horario importada.', {
                  timeOut: 6000,
                });
                this.ObtenerHorariosEmpleado(this.datoActual.codigo, this.formato_fecha);
                //this.actualizar = false;
                //window.location.reload(this.actualizar);
                this.archivoHorarioForm.reset();
                this.nameFileHorario = '';
              });
              /*this.ObtenerHorariosEmpleado(parseInt(this.idEmpleado));
              //this.actualizar = false;
              //window.location.reload(this.actualizar);
              this.archivoHorarioForm.reset();
              this.nameFileHorario = '';*/
            });
          }
        });
      }
    });
  }

  /** ** ***************************************************************************************** **
   ** ** **                  METODOS PARA MANEJO DE DATOS DE CARGO                              ** **
   ** ******************************************************************************************** **/

  // METODO PARA OBTENER LOS DATOS DEL CARGO DEL EMPLEADO 
  cargoEmpleado: any = [];
  ObtenerCargoEmpleado(id_cargo: number, formato_fecha: string) {
    this.cargoEmpleado = [];
    this.restCargo.BuscarCargoID(id_cargo).subscribe(datos => {
      this.cargoEmpleado = datos;
      this.cargoEmpleado.forEach(data => {
        data.fec_inicio_ = this.validar.FormatearFecha(data.fec_inicio, formato_fecha, this.validar.dia_abreviado);
        data.fec_final_ = this.validar.FormatearFecha(data.fec_final, formato_fecha, this.validar.dia_abreviado);
      })
    });
  }

}
