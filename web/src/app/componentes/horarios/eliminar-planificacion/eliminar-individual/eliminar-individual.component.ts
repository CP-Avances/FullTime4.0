// IMPORTAR LIBRERIAS
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ThemePalette } from '@angular/material/core';
import { ToastrService } from 'ngx-toastr';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { Component, OnInit, Input } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import moment from 'moment';

// IMPORTACION DE SERVICIOS
import { PlanGeneralService } from 'src/app/servicios/planGeneral/plan-general.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';

// IMPORTAR COMPONENTES
import { HorarioMultipleEmpleadoComponent } from '../../rango-fechas/horario-multiple-empleado/horario-multiple-empleado.component';
import { BuscarPlanificacionComponent } from '../../rango-fechas/buscar-planificacion/buscar-planificacion.component';
import { VerEmpleadoComponent } from 'src/app/componentes/empleado/ver-empleado/ver-empleado.component';
import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';

@Component({
  selector: 'app-eliminar-individual',
  templateUrl: './eliminar-individual.component.html',
  styleUrls: ['./eliminar-individual.component.css']
})

export class EliminarIndividualComponent implements OnInit {

  @Input() datosEliminar: any;

  // VARIABLES PROGRESS SPINNER
  progreso: boolean = false;
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 10;

  // CONTROL DE BOTONES
  cerrar_ventana: boolean = true;
  btn_eliminar: boolean = false;

  // INICIALIZACION DE CAMPOS DE FORMULARIOS
  fechaInicioF = new FormControl('', Validators.required);
  fechaFinalF = new FormControl('', [Validators.required]);

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    fechaInicioForm: this.fechaInicioF,
    fechaFinalForm: this.fechaFinalF,
  });

  constructor(
    public restP: PlanGeneralService,
    public router: Router,
    public validar: ValidacionesService,
    public ventana: VerEmpleadoComponent,
    public ventana_: MatDialog, // VARIABLE MANEJO DE VENTANAS
    public busqueda: BuscarPlanificacionComponent,
    public componente: HorarioMultipleEmpleadoComponent,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
  }

  // METODO PARA VERIFICAR QUE CAMPOS DE FECHAS NO SE ENCUENTREN VACIOS
  VerificarIngresoFechas(form: any) {
    if (form.fechaInicioForm === '' || form.fechaInicioForm === null || form.fechaInicioForm === undefined ||
      form.fechaFinalForm === '' || form.fechaFinalForm === null || form.fechaFinalForm === undefined) {
      this.toastr.warning('Por favor ingrese fechas de inicio y fin de actividades.', '', {
        timeOut: 6000,
      });
      this.lista_horarios = [];
      this.ver_horarios = false;
    }
    else {
      this.ValidarFechas(form);
    }
  }

  // METODO PARA VERIFICAR SI EL EMPLEADO INGRESO CORRECTAMENTE LAS FECHAS
  ValidarFechas(form: any) {
    // VERIFICAR SI LAS FECHAS SON VALIDAS DE ACUERDO A LOS REGISTROS Y FECHAS INGRESADAS
    if (Date.parse(form.fechaInicioForm) <= Date.parse(form.fechaFinalForm)) {
      this.BuscarPlanificacion(form);
    }
    else {
      this.toastr.warning('Fecha de inicio de actividades debe ser mayor a la fecha fin de actividades.', '', {
        timeOut: 6000,
      });
      this.lista_horarios = [];
      this.ver_horarios = false;
    }
  }

  // METODO PARA BUSCAR PLANIFICACION
  lista_horarios: any = [];
  codigo_usuario: string = '';
  ver_horarios: boolean = false;
  isChecked: boolean = false;
  horariosSeleccionados: any = [];
  BuscarPlanificacion(form: any) {
    this.horariosSeleccionados = [];
    let busqueda = {
      fecha_inicio: moment(form.fechaInicioForm).format('YYYY-MM-DD'),
      fecha_final: moment(form.fechaFinalForm).format('YYYY-MM-DD'),
      codigo: ''
    }
    this.datosEliminar.usuario.forEach(obj => {
      if (this.codigo_usuario === '') {
        this.codigo_usuario = '\'' + obj.codigo + '\''
      }
      else {
        this.codigo_usuario = this.codigo_usuario + ', \'' + obj.codigo + '\''
      }
    })

    busqueda.codigo = this.codigo_usuario;

    this.restP.BuscarHorariosUsuario(busqueda).subscribe(datos => {
      //console.log('ver datos horarios ', datos)
      if (datos.message === 'OK') {

        this.lista_horarios = datos.data;
        this.ver_horarios = true;
        if (this.horariosSeleccionados.length != 0) {
          (<HTMLInputElement>document.getElementById('seleccionar')).checked = false;
        }
        //console.log('ver datos horarios ', this.lista_horarios)
      }
      else {
        this.toastr.info('Ups no se han encontrado registros!!!', 'No existe planificación.', {
          timeOut: 6000,
        });
      }
    })
  }

  // METODO PARA SELECCIONAR TODOS LOS DATOS
  SeleccionarTodas(event: any) {
    if (event === true) {
      this.AgregarTodos();
    }
    else {
      this.QuitarTodos();
    }
  }

  // METODO PARA VERIFICAR SELECCION DE HORARIOS
  SeleccionarIndividual(event: any, valor: any) {
    const target = event.target as HTMLInputElement;
    if (target.checked === true) {
      this.AgregarHorario(valor);
    }
    else {
      this.QuitarHorario(valor);
    }
  }

  // METODO PARA SELECCIONAR AGREGAR HORARIOS
  AgregarHorario(data: string) {
    this.horariosSeleccionados.push(data);
  }

  // METODO PARA RETIRAR OBJETO
  QuitarHorario(data: any) {
    this.horariosSeleccionados = this.horariosSeleccionados.filter(s => s !== data);
  }

  // AGREGAR DATOS MULTIPLES
  AgregarTodos() {
    this.horariosSeleccionados = this.lista_horarios;
    for (var i = 0; i <= this.lista_horarios.length - 1; i++) {
      (<HTMLInputElement>document.getElementById('horariosSeleccionados' + i)).checked = true;
    }
  }

  // QUITAR TODOS LOS DATOS SELECCIONADOS
  limpiarData: any = [];
  QuitarTodos() {
    this.limpiarData = this.lista_horarios;
    for (var i = 0; i <= this.limpiarData.length - 1; i++) {
      (<HTMLInputElement>document.getElementById('horariosSeleccionados' + i)).checked = false;
      this.horariosSeleccionados = this.horariosSeleccionados.filter(s => s !== this.lista_horarios[i]);
    }
  }

  // METODO PARA ELIMINAR PLANIFICACION GENERAL DE HORARIOS
  EliminarPlanificacion(form: any) {
    let inicio = moment(form.fechaInicioForm).format('YYYY-MM-DD');
    let final = moment(form.fechaFinalForm).format('YYYY-MM-DD');

    let total = this.horariosSeleccionados.length * this.datosEliminar.usuario.length;
    let contador = 0;
    let correctos = 0;
    let incorrectos = 0;
    this.progreso = true;

    this.horariosSeleccionados.forEach(obj => {

      this.datosEliminar.usuario.forEach(usu => {

        let plan_fecha = {
          codigo: usu.codigo,
          fec_final: final,
          fec_inicio: inicio,
          id_horario: obj.id_horario,
        };

        this.restP.BuscarFechas(plan_fecha).subscribe(res => {
          contador = contador + 1;

          // METODO PARA ELIMINAR DE LA BASE DE DATOS
          this.restP.EliminarRegistro(res).subscribe(datos => {

            if (datos.message === 'OK') {
              correctos = correctos + 1;
            }
            else {
              incorrectos = incorrectos + 1;
            }

            if (contador === total) {
              if (contador === correctos) {
                this.progreso = false;
                this.toastr.error('Operación exitosa.', 'Registros eliminados.', {
                  timeOut: 6000,
                });
                this.CerrarVentana();
              }
              else if (incorrectos > 0) {
                this.progreso = false;
                this.toastr.error('Ups!!! se ha producido un error y solo algunos registros fueron eliminados.',
                  'Intentar eliminar los registros nuevamente.', {
                  timeOut: 6000,
                });
              }
              else {
                this.progreso = false;
              }
            }

          }, error => {
            incorrectos = incorrectos + 1;
            if (contador === total) {
              if (contador === correctos) {
                this.progreso = false;
                this.toastr.error('Operación exitosa.', 'Registros eliminados.', {
                  timeOut: 6000,
                });
                this.CerrarVentana();
              }
              else if (incorrectos > 0) {
                this.progreso = false;
                this.toastr.error('Ups!!! se ha producido un error y solo algunos registros fueron eliminados.',
                  'Intentar eliminar los registros nuevamente.', {
                  timeOut: 6000,
                });
              }
              else {
                this.progreso = false;
              }
            }
          })

        }, error => {
          contador = contador + 1;
          if (contador === total) {
            if (contador === correctos) {
              this.progreso = false;
              this.toastr.error('Operación exitosa.', 'Registros eliminados.', {
                timeOut: 6000,
              });
              this.CerrarVentana();
            }
            else if (incorrectos > 0) {
              this.progreso = false;
              this.toastr.error('Ups!!! se ha producido un error y solo algunos registros fueron eliminados.',
                'Intentar eliminar los registros nuevamente.', {
                timeOut: 6000,
              });
            }
            else {
              this.progreso = false;
            }
          }
        })
      })
    })

  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO DE HORARIO ROTATIVO
  ConfirmarEliminar(form: any) {
    if (this.horariosSeleccionados.length != 0) {
      this.ventana_.open(MetodosComponent, { width: '450px' }).afterClosed()
        .subscribe((confirmado: Boolean) => {
          if (confirmado) {
            this.EliminarPlanificacion(form);
          }
        });
    }
    else {
      this.toastr.warning('Ups!!! verificar. No ha seleccionado horarios para eliminar registros.', '', {
        timeOut: 6000,
      });
    }
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarHorario() {
    this.lista_horarios = [];
    this.ver_horarios = false;
  }

  // METODO PARA CERRAR VENTANA DE SELECCION DE HORARIO
  CerrarVentana() {
    if (this.datosEliminar.pagina === 'ver_empleado') {
      this.ventana.eliminar_plan = false;
      this.ventana.ver_tabla_horarios = true;
    }
  }

}
