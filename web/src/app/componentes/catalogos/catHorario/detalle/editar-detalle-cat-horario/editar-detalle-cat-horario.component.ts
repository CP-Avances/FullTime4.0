import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
import { ThemePalette } from '@angular/material/core';

import { DetalleCatHorariosService } from 'src/app/servicios/horarios/detalleCatHorarios/detalle-cat-horarios.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { HorarioService } from 'src/app/servicios/catalogos/catHorarios/horario.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { hora } from '../../../../../model/reportes.model';

const OPTIONS_HORARIOS = [
  { orden: 1, accion: 'E', view_option: 'Entrada' },
  { orden: 2, accion: 'I/A', view_option: 'Inicio alimentación' },
  { orden: 3, accion: 'F/A', view_option: 'Fin alimentación' },
  { orden: 4, accion: 'S', view_option: 'Salida' }
]

@Component({
  selector: 'app-editar-detalle-cat-horario',
  templateUrl: './editar-detalle-cat-horario.component.html',
  styleUrls: ['./editar-detalle-cat-horario.component.css']
})

export class EditarDetalleCatHorarioComponent implements OnInit {

  segundo: boolean = false;
  tercero: boolean = false;
  comida: boolean = false;

  min_despuesF = new FormControl('');
  minEsperaF = new FormControl('');
  min_antesF = new FormControl('');
  segundoF = new FormControl(false);
  terceroF = new FormControl(false);
  accionF = new FormControl('', [Validators.required]);
  ordenF = new FormControl(0, [Validators.required]);
  horaF = new FormControl('', [Validators.required]);

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    min_despuesForm: this.min_despuesF,
    min_antesForm: this.min_antesF,
    minEsperaForm: this.minEsperaF,
    terceroForm: this.terceroF,
    segundoForm: this.segundoF,
    accionForm: this.accionF,
    ordenForm: this.ordenF,
    horaForm: this.horaF,
  });

  /**
   * VARIABLES PROGRESS SPINNER
   */
  habilitarprogress: boolean = false;
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 10;

  options = OPTIONS_HORARIOS;
  espera: boolean = false;

  acciones: boolean = false;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    public ventana: MatDialogRef<EditarDetalleCatHorarioComponent>,
    public validar: ValidacionesService,
    public restH: HorarioService,
    public rest: DetalleCatHorariosService,
    private toastr: ToastrService,
    private empre: EmpresaService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

    this.VerEmpresa();
    this.ListarDetalles(this.data.detalle.id_horario);
    this.BuscarDatosHorario(this.data.detalle.id_horario);
  }

  // METODO DE CONSULTA DE DATOS DE EMPRESA
  empresa: any = [];
  VerEmpresa() {
    this.empresa = [];
    this.empre.ConsultarDatosEmpresa(parseInt(localStorage.getItem('empresa') as string)).subscribe(data => {
      this.empresa = data;
      if (this.empresa[0].acciones_timbres === true) {
        this.acciones = true;
      }
      else {
        this.acciones = false;
      }
    });
  }

  // METODO PARA BUSCAR DATOS DE HORARIO
  datosHorario: any = [];
  BuscarDatosHorario(id_horario: any) {
    this.datosHorario = [];
    this.restH.BuscarUnHorario(id_horario).subscribe(data => {
      this.datosHorario = data;
      this.CargarDatos();
    })
  }

  // METODO PARA MOSTRAR DATOS EN FORMULARIO
  CargarDatos() {
    const [obj] = this.options.filter((o: any) => {
      return o.orden === this.data.detalle.orden
    })
    this.formulario.patchValue({
      horaForm: this.data.detalle.hora,
      ordenForm: obj.orden,
      accionForm: obj.accion,
      segundoForm: this.data.detalle.segundo_dia,
      terceroForm: this.data.detalle.tercer_dia,
      minEsperaForm: this.data.detalle.tolerancia,
      min_antesForm: this.data.detalle.minutos_antes,
      min_despuesForm: this.data.detalle.minutos_despues,
    })
    if (obj.orden === 1) {
      this.espera = true;
    }

    if (obj.orden === 4 && this.datosHorario[0].nocturno === true &&
      (this.datosHorario[0].hora_trabajo >= '48:00' || this.datosHorario[0].hora_trabajo >= '48:00:00')) {
      this.segundo = false;
      this.tercero = true;
    }
    else if (obj.orden === 4 && this.datosHorario[0].nocturno === true &&
      ((this.datosHorario[0].hora_trabajo >= '00:00' && this.datosHorario[0].hora_trabajo < '48:00') ||
        (this.datosHorario[0].hora_trabajo >= '00:00:00' && this.datosHorario[0].hora_trabajo < '48:00:00'))) {
      this.segundo = true;
      this.tercero = false;
    }

    if ((obj.orden === 3 || obj.orden === 2) && this.datosHorario[0].nocturno === true) {
      this.comida = true;
    }
    else {
      this.comida = false;
    }
  }

  // METODO PARA VALIDAR TIPO DE ACCIONES
  AutoSelectOrden(orden: number) {
    this.formulario.patchValue({
      ordenForm: orden
    })
    if (orden === 1) {
      this.espera = true;
    }
    else {
      this.espera = false;
    }

    if (orden === 4 && this.datosHorario[0].nocturno === true &&
      (this.datosHorario[0].hora_trabajo >= '48:00' || this.datosHorario[0].hora_trabajo >= '48:00:00')) {
      this.segundo = false;
      this.tercero = true;
    }
    else if (orden === 4 && this.datosHorario[0].nocturno === true &&
      ((this.datosHorario[0].hora_trabajo >= '00:00' && this.datosHorario[0].hora_trabajo < '48:00') ||
        (this.datosHorario[0].hora_trabajo >= '00:00:00' && this.datosHorario[0].hora_trabajo < '48:00:00'))) {
      this.segundo = true;
      this.tercero = false;
    }

    if ((orden === 3 || orden === 2) && this.datosHorario[0].nocturno === true) {
      this.comida = true;
    }
    else {
      this.comida = false;
    }
  }

  // VALIDAR INGRESO DE MINUTOS DE ESPERA
  ValidarMinEspera(form: any, datos: any) {
    if (form.minEsperaForm === '') {
      datos.minu_espera = 0;
    }
  }

  // METODO PARA REALIZAR REGISTRO DE DETALLES DE HORARIO
  InsertarDetalleHorario(form: any) {
    let detalle = {
      comida_next_dia: form.comidaForm,
      segundo_dia: form.segundoForm,
      minu_espera: form.minEsperaForm,
      tipo_accion: form.accionForm,
      tercer_dia: form.terceroForm,
      id_horario: this.data.detalle.id_horario,
      orden: form.ordenForm,
      hora: form.horaForm,
      min_antes: this.data.detalle.min_antes,
      min_despues: this.data.detalle.min_despues,
      id: this.data.detalle.id,
      user_name: this.user_name,
      ip: this.ip,
    };
    if (this.acciones === true) {
      detalle.min_antes = parseInt(form.min_antesForm);
      detalle.min_despues = parseInt(form.min_despuesForm);
    }
    console.log('ver datos de horario ', detalle)
    this.ValidarMinEspera(form, detalle);
    if (this.datosHorario[0].minutos_comida === 0) {
      this.ValidarDetallesSinAlimentacion(detalle);
    }
    else {
      this.ValidarDetallesConAlimentacion(detalle);
    }
  }

  // METODO PARA ACTUALIZAR HORARIO
  EditarHorario() {
    let horasT = this.data.horario.hora_trabajo.split(':')[0] + ':' + this.data.horario.hora_trabajo.split(':')[1];
    const datos = {
      hora_trabajo: horasT,
      user_name: this.user_name,
      ip: this.ip
    };

    this.restH.ActualizarHorasTrabaja(this.data.horario.id, datos).subscribe(res => {
    }, err => {
      this.toastr.error(err.message)
    })
  }

  // VALIDAR DETALLES CON ALIMENTACION
  ValidarDetallesConAlimentacion(datos: any) {
    var contador: number = 0;
    var entrada: number = 0, salida: number = 0, e_comida1: number = 0, e_comida2: number = 0,
      e_comida3: number = 0, s_comida1: number = 0, s_comida2: number = 0, s_comida3: number = 0;
    // VALIDAR EXISTENCIA DE DETALLES
    if (this.datosDetalle.length != 0) {

      this.datosDetalle.map((obj: any) => {
        // VALIDAR ORDEN DE LOS DETALLES
        contador = contador + 1;
        if (datos.orden === 1 && obj.orden != 1 && (datos.hora + ':00') > obj.hora && this.datosHorario[0].nocturno === false) {
          entrada = entrada + 1;
        }
        if (datos.orden === 2 && obj.orden != 2 && obj.orden === 1 && (datos.hora + ':00') <= obj.hora &&
          this.datosHorario[0].nocturno === false) {
          s_comida1 = s_comida1 + 1;
        }
        if (datos.orden === 2 && obj.orden != 2 && obj.orden === 3 && (datos.hora + ':00') >= obj.hora &&
          this.datosHorario[0].nocturno === false) {
          s_comida2 = s_comida2 + 1;
        }
        if (datos.orden === 2 && obj.orden != 2 && obj.orden === 4 && (datos.hora + ':00') >= obj.hora &&
          this.datosHorario[0].nocturno === false) {
          s_comida3 = s_comida3 + 1;
        }
        if (datos.orden === 3 && obj.orden != 3 && obj.orden === 1 && (datos.hora + ':00') <= obj.hora &&
          this.datosHorario[0].nocturno === false) {
          e_comida1 = e_comida1 + 1;
        }
        if (datos.orden === 3 && obj.orden != 3 && obj.orden === 2 && (datos.hora + ':00') <= obj.hora &&
          this.datosHorario[0].nocturno === false) {
          e_comida2 = e_comida2 + 1;
        }
        if (datos.orden === 3 && obj.orden != 3 && obj.orden === 4 && (datos.hora + ':00') >= obj.hora &&
          this.datosHorario[0].nocturno === false) {
          e_comida3 = e_comida3 + 1;
        }
        if (datos.orden === 4 && obj.orden != 4 && (datos.hora + ':00') <= obj.hora && this.datosHorario[0].nocturno === false) {
          salida = salida + 1;
        }

        // VALIDAR INGRESO DE HORAS DE DETALLES
        if (contador === this.datosDetalle.length) {
          if (entrada != 0) return this.toastr.warning(
            'Hora en detalle de Entrada no puede ser superior a las horas ya registradas.',
            'Verificar datos de horario.', {
            timeOut: 6000
          });
          if (s_comida1 != 0) return this.toastr.warning(
            'Hora en detalle de Inicio alimentación no puede ser menor a la hora configurada como Entrada.',
            'Verificar datos de horario.', {
            timeOut: 6000
          });
          if (s_comida2 != 0) return this.toastr.warning(
            'Hora en detalle de Inicio alimentación no puede ser superior a la hora configurada como Fin de alimentación.',
            'Verificar datos de horario.', {
            timeOut: 6000
          });
          if (s_comida3 != 0) return this.toastr.warning(
            'Hora en detalle de Inicio alimentación no puede ser superior a la hora configurada como Salida.',
            'Verificar datos de horario.', {
            timeOut: 6000
          });
          if (e_comida1 != 0) return this.toastr.warning(
            'Hora en detalle de Fin alimentación no puede ser menor a la hora configurada como Entrada.',
            'Verificar datos de horario.', {
            timeOut: 6000
          });
          if (e_comida2 != 0) return this.toastr.warning(
            'Hora en detalle de Fin alimentación no puede ser menor a la hora configurada como Inicio alimentación.',
            'Verificar datos de horario.', {
            timeOut: 6000
          });
          if (e_comida3 != 0) return this.toastr.warning(
            'Hora en detalle de Fin alimentación no puede ser superior a la hora configurada como Salida.',
            'Verificar datos de horario.', {
            timeOut: 6000
          });
          if (salida != 0) return this.toastr.warning(
            'Hora en detalle de Salida no puede ser menor a las horas ya registradas en el detalle.',
            'Verificar datos de horario.', {
            timeOut: 6000
          });
          this.GuardarRegistro(datos);
        }
      })
    }
    // NO EXISTEN REGISTROS DE DETALLES
    else {
      this.GuardarRegistro(datos);
    }
  }

  // VALIDAR DETALLES SIN ALIMENTACION
  ValidarDetallesSinAlimentacion(datos: any) {
    var contador: number = 0;
    var entrada: number = 0, salida: number = 0, comida: number = 0;
    // VALIDAR EXISTENCIA DE DETALLES
    if (this.datosDetalle.length != 0) {

      this.datosDetalle.map((obj: any) => {
        // VALIDAR INGRESO DE HORAS DE DETALLES
        contador = contador + 1;
        if (datos.orden === 1 && obj.orden != 1 && (datos.hora + ':00') > obj.hora && this.datosHorario[0].nocturno === false) {
          entrada = entrada + 1;
        }
        if (datos.orden === 4 && obj.orden != 4 && (datos.hora + ':00') <= obj.hora && this.datosHorario[0].nocturno === false) {
          salida = salida + 1;
        }
        if (datos.orden === 2 || datos.orden === 3) {
          comida = comida + 1;
        }
        if (contador === this.datosDetalle.length) {
          if (entrada != 0) return this.toastr.warning(
            'Hora en detalle de Entrada no puede ser superior a las horas ya registradas.',
            'Verificar datos de horario.', {
            timeOut: 6000
          });
          if (salida != 0) return this.toastr.warning(
            'Hora en detalle de Salida no puede ser menor a las horas ya registradas en el detalle.',
            'Verificar datos de horario.', {
            timeOut: 6000
          });
          if (comida != 0) return this.toastr.warning(
            'No es posible registrar detalle de alimentación.',
            'Horario no tiene configurado minutos de alimentación.', {
            timeOut: 6000
          });
          this.GuardarRegistro(datos);
        }
      })
    }
    // NO EXISTEN REGISTROS
    else {
      this.GuardarRegistro(datos);
    }
  }

  // CONSULTAR DETALLES DE HORRAIO
  datosDetalle: any = [];
  ListarDetalles(id_horario: any) {
    this.datosDetalle = [];
    this.rest.ConsultarUnDetalleHorario(id_horario).subscribe(datos => {
      this.datosDetalle = datos;
    })
  }

  // METODO PARA ACTUALIZAR REGISTRO
  GuardarRegistro(datos: any) {
    this.habilitarprogress = true;
    this.rest.ActualizarRegistro(datos).subscribe(response => {
      this.habilitarprogress = false;
      this.toastr.success('Operación exitosa.', 'Registro guardado.', {
        timeOut: 6000,
      })
      this.EditarHorario();
      this.CerrarVentana();
    });
  }

  // METODO PARA VALIDAR INGRESO DE NUMEROS
  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.formulario.reset();
    this.segundoF.setValue(false);
    this.terceroF.setValue(false);
  }

  // METODO PARA CERRAR VENTANA DE REGISTRO
  CerrarVentana() {
    this.LimpiarCampos();
    this.ventana.close();
  }

}
