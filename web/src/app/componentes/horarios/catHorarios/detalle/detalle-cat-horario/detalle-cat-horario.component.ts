import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { DetalleCatHorariosService } from 'src/app/servicios/horarios/detalleCatHorarios/detalle-cat-horarios.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { HorarioService } from 'src/app/servicios/horarios/catHorarios/horario.service';
import { EmpresaService } from 'src/app/servicios/configuracion/parametrizacion/catEmpresa/empresa.service';

const OPTIONS_HORARIOS = [
  { orden: 1, accion: 'E', view_option: 'Entrada' },
  { orden: 2, accion: 'I/A', view_option: 'Inicio alimentación' },
  { orden: 3, accion: 'F/A', view_option: 'Fin alimentación' },
  { orden: 4, accion: 'S', view_option: 'Salida' }
]

@Component({
  selector: 'app-detalle-cat-horario',
  standalone: false,
  templateUrl: './detalle-cat-horario.component.html',
  styleUrls: ['./detalle-cat-horario.component.css']
})

export class DetalleCatHorarioComponent implements OnInit {
  ips_locales: any = '';


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
  horaF = new FormControl(null, [Validators.required]);

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    min_despuesForm: this.min_despuesF,
    min_antesForm: this.min_antesF,
    minEsperaForm: this.minEsperaF,
    segundoForm: this.segundoF,
    terceroForm: this.terceroF,
    accionForm: this.accionF,
    ordenForm: this.ordenF,
    horaForm: this.horaF,
  });

  options = OPTIONS_HORARIOS;
  espera: boolean = false;
  acciones: boolean = false;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    public ventana: MatDialogRef<DetalleCatHorarioComponent>,
    public validar: ValidacionesService,
    public restH: HorarioService,
    public rest: DetalleCatHorariosService,
    private empre: EmpresaService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');  
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    }); 

    this.VerEmpresa();
    this.ListarDetalles(this.data.datosHorario.id);
    this.BuscarDatosHorario(this.data.datosHorario.id);
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
    })
  }

  // METODO DE SELECCION DE TIPOS DE ACCION
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

  // METODO PARA VALIDAR INGRESO DE MINUTOS DE ESPERA
  ValidarMinEspera(form: any, datos: any) {
    if (form.minEsperaForm === '') {
      datos.minu_espera = 0;
    }
  }

  // METODO PARA REGISTRAR DETALLE
  InsertarDetalleHorario(form: any) {
    let detalle = {
      hora: form.horaForm,
      orden: form.ordenForm,
      tercer_dia: form.terceroForm,
      id_horario: this.data.datosHorario.id,
      minu_espera: form.minEsperaForm,
      tipo_accion: form.accionForm,
      segundo_dia: form.segundoForm,
      min_antes: 0,
      min_despues: 0,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales
    };
    if (this.acciones === true) {
      detalle.min_antes = parseInt(form.min_antesForm);
      detalle.min_despues = parseInt(form.min_despuesForm);
    }
    this.ValidarMinEspera(form, detalle);
    if (this.datosHorario[0].minutos_comida === 0) {
      this.ValidarDetallesSinAlimentacion(detalle);
    }
    else {
      this.ValidarDetallesConAlimentacion(detalle);
    }
  }

  // METODO PARA LISTAR DETALLES
  datosDetalle: any = [];
  ListarDetalles(id_horario: any) {
    this.datosDetalle = [];
    this.rest.ConsultarUnDetalleHorario(id_horario).subscribe(datos => {
      this.datosDetalle = datos;
    })
  }

  // METODO PARA VALIDAR DETALLES DE CON ALIMENTACION
  ValidarDetallesConAlimentacion(datos: any) {
    var contador: number = 0, orden1: number = 0, orden2: number = 0, orden3: number = 0,
      orden4: number = 0;
    var entrada: number = 0, salida: number = 0, e_comida1: number = 0, e_comida2: number = 0,
      e_comida3: number = 0, s_comida1: number = 0, s_comida2: number = 0, s_comida3: number = 0;

    // VERIFICAR SI EXISTEN REGISTROS DE DETALLES
    if (this.datosDetalle.length != 0) {

      this.datosDetalle.map((obj: any) => {

        // VALIDAR ORDEN DE DETALLES
        contador = contador + 1;
        if (obj.orden === datos.orden && obj.orden === 1) {
          orden1 = orden1 + 1;
        }
        else if (obj.orden === datos.orden && obj.orden === 2) {
          orden2 = orden2 + 1;
        }
        else if (obj.orden === datos.orden && obj.orden === 3) {
          orden3 = orden3 + 1;
        }
        else if (obj.orden === datos.orden && obj.orden === 4) {
          orden4 = orden4 + 1;
        }

        if (datos.orden === 1 && (datos.hora + ':00') > obj.hora && this.datosHorario[0].nocturno === false) {
          entrada = entrada + 1;
        }
        if (datos.orden === 2 && obj.orden === 1 && (datos.hora + ':00') <= obj.hora &&
          this.datosHorario[0].nocturno === false) {
          s_comida1 = s_comida1 + 1;
        }
        if (datos.orden === 2 && obj.orden === 3 && (datos.hora + ':00') >= obj.hora &&
          this.datosHorario[0].nocturno === false) {
          s_comida2 = s_comida2 + 1;
        }
        if (datos.orden === 2 && obj.orden === 4 && (datos.hora + ':00') >= obj.hora &&
          this.datosHorario[0].nocturno === false) {
          s_comida3 = s_comida3 + 1;
        }
        if (datos.orden === 3 && obj.orden === 1 && (datos.hora + ':00') <= obj.hora &&
          this.datosHorario[0].nocturno === false) {
          e_comida1 = e_comida1 + 1;
        }
        if (datos.orden === 3 && obj.orden === 2 && (datos.hora + ':00') <= obj.hora &&
          this.datosHorario[0].nocturno === false) {
          e_comida2 = e_comida2 + 1;
        }
        if (datos.orden === 3 && obj.orden === 4 && (datos.hora + ':00') >= obj.hora &&
          this.datosHorario[0].nocturno === false) {
          e_comida3 = e_comida3 + 1;
        }
        if (datos.orden === 4 && (datos.hora + ':00') <= obj.hora && this.datosHorario[0].nocturno === false) {
          salida = salida + 1;
        }

        if (contador === this.datosDetalle.length) {
          // VALIDANDO OPCION DE ENTRADA
          if (orden1 != 0) return this.toastr.warning(
            'Detalle Entrada ya se encuentra registrado.',
            'Verificar detalles registrados.', {
            timeOut: 6000
          });
          // VALIDANDO OPCION INICIO ALIMENTACION
          if (orden2 != 0) return this.toastr.warning(
            'Detalle Inicio alimentación ya se encuentra registrado.',
            'Verificar detalles registrados.', {
            timeOut: 6000
          });
          // VALIDANDO OPCION FIN ALIMENTACION
          if (orden3 != 0) return this.toastr.warning(
            'Detalle Fin alimentación ya se encuentra registrado.',
            'Verificar detalles registrados.', {
            timeOut: 6000
          });
          // VALIDANDO OPCION SALIDA
          if (orden4 != 0) return this.toastr.warning(
            'Detalle Salida ya se encuentra registrado.',
            'Verificar detalles registrados.', {
            timeOut: 6000
          });

          // VALIDANDO INGRESO DE HORAS DE DETALLES
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

    // SIN EXISTENCIAS SE GUARDA REGISTROS
    else {
      this.GuardarRegistro(datos);
    }
  }

  // METODO PARA VALIDAR REGISTRO DE DETALLES SIN ALIMENTACION
  ValidarDetallesSinAlimentacion(datos: any) {
    var contador: number = 0, orden1: number = 0, orden4: number = 0;
    var entrada: number = 0, salida: number = 0, comida: number = 0;

    // VALIDAR EXISTENCIA DE DETALLES
    if (this.datosDetalle.length != 0) {

      // VALIDAR ORDEN DE DETALLES
      this.datosDetalle.map((obj: any) => {
        contador = contador + 1;
        if (obj.orden === datos.orden && obj.orden === 1) {
          orden1 = orden1 + 1;
        }
        else if (obj.orden === datos.orden && obj.orden === 4) {
          orden4 = orden4 + 1;
        }
        if (datos.orden === 2 || datos.orden === 3) {
          comida = comida + 1;
        }
        if (datos.orden === 1 && (datos.hora + ':00') > obj.hora && this.datosHorario[0].nocturno === false) {
          entrada = entrada + 1;
        }
        if (datos.orden === 4 && (datos.hora + ':00') <= obj.hora && this.datosHorario[0].nocturno === false) {
          salida = salida + 1;
        }

        // VALIDAR HORAS DE DETALLES
        if (contador === this.datosDetalle.length) {
          if (orden1 != 0) return this.toastr.warning(
            'Detalle Entrada ya se encuentra registrado.', 'Verificar detalles registrados.', {
            timeOut: 6000
          });
          if (orden4 != 0) return this.toastr.warning(
            'Detalle Salida ya se encuentra registrado.', 'Verificar detalles registrados.', {
            timeOut: 6000
          });
          if (comida != 0) return this.toastr.warning(
            'No es posible registrar detalle de alimentación.',
            'Horario no tiene configurado minutos de alimentación.', {
            timeOut: 6000
          });
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
          this.GuardarRegistro(datos);
        }
      })
    }
    // SIN EXISTENCIA DE DETALLES
    else {
      this.GuardarRegistro(datos);
    }
  }

  // METODO PARA REGISTRAR DETALLES DE HORARIO
  GuardarRegistro(datos: any) {
    this.rest.IngresarDetalleHorarios(datos).subscribe(response => {
      this.toastr.success('Operación exitosa.', 'Registro guardado.', {
        timeOut: 6000,
      })
      this.LimpiarCampos();
      if (this.data.actualizar === true) {
        this.LimpiarCampos();
      }
      else {
        this.ventana.close(this.data.datosHorario.id);
      }
    });
  }

  // METODO PARA VALIDAR SOLO INGRESO DE NUMEROS
  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.formulario.reset();
    this.segundoF.setValue(false);
    this.terceroF.setValue(false);
    this.ListarDetalles(this.data.datosHorario.id);
  }

  // METODO PARA CERRAR VENTANA DE REGISTRO
  CerrarVentana() {
    this.LimpiarCampos();
    this.ventana.close();
  }

}
