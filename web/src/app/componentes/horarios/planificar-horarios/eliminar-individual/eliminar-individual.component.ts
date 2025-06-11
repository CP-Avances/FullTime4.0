// IMPORTAR LIBRERIAS
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

// IMPORTACION DE SERVICIOS
import { PlanGeneralService } from 'src/app/servicios/horarios/planGeneral/plan-general.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { EmpleadoHorariosService } from 'src/app/servicios/horarios/empleadoHorarios/empleado-horarios.service';

// IMPORTAR COMPONENTES
import { HorarioMultipleEmpleadoComponent } from '../rango-fechas/horario-multiple-empleado/horario-multiple-empleado.component';
import { BuscarPlanificacionComponent } from '../rango-fechas/buscar-planificacion/buscar-planificacion.component';
import { VerEmpleadoComponent } from 'src/app/componentes/usuarios/empleados/datos-empleado/ver-empleado/ver-empleado.component';
import { MetodosComponent } from 'src/app/componentes/generales/metodoEliminar/metodos.component';

@Component({
  selector: 'app-eliminar-individual',
  standalone: false,
  templateUrl: './eliminar-individual.component.html',
  styleUrls: ['./eliminar-individual.component.css']
})

export class EliminarIndividualComponent implements OnInit {
  ips_locales: any = '';

  @Input() datosEliminar: any;

  // CONTROL DE BOTONES
  cerrar_ventana: boolean = true;
  btn_eliminar: boolean = false;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // INICIALIZACION DE CAMPOS DE FORMULARIOS
  fechaInicioF = new FormControl('', Validators.required);
  fechaFinalF = new FormControl('', [Validators.required]);

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    fechaInicioForm: this.fechaInicioF,
    fechaFinalForm: this.fechaFinalF,
  });

  constructor(
    public rest: EmpleadoHorariosService, // SERVICIO DE DATOS DE HORARIOS ASIGNADOS A UN EMPLEADO
    public restP: PlanGeneralService,
    public router: Router,
    public validar: ValidacionesService,
    public ventana: VerEmpleadoComponent,
    public ventana_: MatDialog, // VARIABLE MANEJO DE VENTANAS
    public busqueda: BuscarPlanificacionComponent,
    public componente: HorarioMultipleEmpleadoComponent,
    public componentem: HorarioMultipleEmpleadoComponent,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    }); 
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
  ids_usuario: string = '';
  ver_horarios: boolean = false;
  isChecked: boolean = false;
  horariosSeleccionados: any = [];
  fechaInicioFormluxon: any;
  fechaFinFormluxon: any;

  BuscarPlanificacion(form: any) {
    this.horariosSeleccionados = [];
    this.fechaInicioFormluxon = this.validar.DarFormatoFecha(form.fechaInicioForm, 'yyyy-MM-dd');
    this.fechaFinFormluxon = this.validar.DarFormatoFecha(form.fechaFinalForm, 'yyyy-MM-dd');
    let busqueda = {
      fecha_inicio: this.fechaInicioFormluxon,
      fecha_final: this.fechaFinFormluxon,
      id_empleado: ''
    }
    this.datosEliminar.usuario.forEach((obj: any) => {
      if (this.ids_usuario === '') {
        this.ids_usuario = '\'' + obj.id + '\''
      }
      else {
        this.ids_usuario = this.ids_usuario + ', \'' + obj.id + '\''
      }
    })

    busqueda.id_empleado = this.ids_usuario;

    this.restP.BuscarHorariosUsuario(busqueda).subscribe(datos => {
      if (datos.message === 'OK') {
        this.lista_horarios = datos.data;
        this.ver_horarios = true;
        if (this.horariosSeleccionados.length != 0) {
          (<HTMLInputElement>document.getElementById('seleccionar')).checked = false;
        }
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
    this.horariosSeleccionados = this.horariosSeleccionados.filter((s: any) => s !== data);
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
  lista_eliminar: any = [];
  EliminarPlanificacion() {
    let inicio =  this.fechaInicioFormluxon;
    let final =  this.fechaFinFormluxon;
  
    let datos = {
      usuarios_validos: this.datosEliminar.usuario,
      eliminar_horarios: this.horariosSeleccionados,
      fec_inicio: inicio,
      fec_final: final,
    };

    this.rest.BuscarFechasMultiples(datos).subscribe(res => {
      this.lista_eliminar = res;
      let datosEliminar = {
        id_plan: res,
        user_name: this.user_name,
        ip: this.ip, 
        ip_local: this.ips_locales
      };
      this.EliminarDatos(datosEliminar);
    }, error => {
      let datosEliminar = {
        id_plan: [],
        user_name: this.user_name,
        ip: this.ip, ip_local: this.ips_locales
      };
      this.EliminarDatos(datosEliminar);
    })

  }

  // ELIMINAR DATOS DE BASE DE DATOS
  EliminarDatos(eliminar: any) {
    // METODO PARA ELIMINAR DE LA BASE DE DATOS
    this.restP.EliminarRegistroMutiple(eliminar).subscribe(datos => {
      if (datos.message === 'OK') {
        this.toastr.error('Operación exitosa.', 'Registros eliminados.', {
          timeOut: 6000,
        });
        this.CerrarVentana();
      }
      else {
        this.toastr.error('Ups! se ha producido un error y solo algunos registros fueron eliminados.',
          'Intentar eliminar los registros nuevamente.', {
          timeOut: 6000,
        });
      }
    }, error => {
      this.toastr.error('Ups! se ha producido un error. Intentar eliminar los registros nuevamente.', '', {
        timeOut: 6000,
      });
    })
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO DE HORARIO ROTATIVO
  ConfirmarEliminar() {
    if (this.horariosSeleccionados.length != 0) {
      this.ventana_.open(MetodosComponent, { width: '450px' }).afterClosed()
        .subscribe((confirmado: Boolean) => {
          if (confirmado) {
            this.EliminarPlanificacion();
          }
        });
    }
    else {
      this.toastr.warning('Ups! verificar. No ha seleccionado horarios para eliminar registros.', '', {
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
      this.ventana.BuscarHorarioPeriodo();
    }
    else if (this.datosEliminar.pagina === 'planificar') {
      this.componentem.eliminar_plan = false;
      this.componentem.seleccionar = true;
    }
  }

}
