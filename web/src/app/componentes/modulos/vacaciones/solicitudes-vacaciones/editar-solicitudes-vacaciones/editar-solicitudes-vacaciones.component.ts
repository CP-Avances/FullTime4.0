import { vacacion } from './../../../../../model/reportes.model';
import { Component, inject, Input, OnDestroy, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { ActivatedRoute, Router } from '@angular/router';
import { error } from 'console';
import { ToastrService } from 'ngx-toastr';
import { ConteoDiasSemana } from 'src/app/interfaces/ConteoDiasSemana';
import { SolicitudVacacion } from 'src/app/interfaces/SolicitudesVacacion';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { FeriadosService } from 'src/app/servicios/horarios/catFeriados/feriados.service';
import { VacacionesService } from 'src/app/servicios/modulos/modulo-vacaciones/vacaciones/vacaciones.service';


@Component({
  selector: 'app-editar-solicitudes-vacaciones',
  standalone: false,

  templateUrl: './editar-solicitudes-vacaciones.component.html',
  styleUrl: './editar-solicitudes-vacaciones.component.scss'
})
export class EditarSolicitudesVacacionesComponent implements OnInit {

  @Input() solicitud: any;
  @Input() empleado: any;
  @Input() data: any;
  @Output() cerrar = new EventEmitter<void>();
  @ViewChild('picker2') picker2!: MatDatepicker<Date>;

  //Variables principales
  ips_locales: string = "";
  user_name: string = '';
  ip: string = '';

  //Arrays y objetos de datos
  tiposVacacion: any[] = [];
  feriados: any = [];

  //Variables de calculo
  conteoDiasSemana: ConteoDiasSemana = {
    L: 0, M: 0, X: 0, J: 0, V: 0, S: 0, D: 0
  }

  //Variables de cálculo
  diasTotales: number = 0;
  diasFeriados: number = 0;
  permiteHoras: boolean = false;
  horasTotales: string = '00:00';
  diaSemanaSeleccionado: string | null = null;

  //Configuración
  formato_fecha: string = 'dd/MM/yyyy';
  idioma_fechas: string = 'es';

  constructor(
    public validar: ValidacionesService,
    private rest: FeriadosService,
    private vacaServ: VacacionesService,
    private toastr: ToastrService
  ) {
    this.user_name = localStorage.getItem('usuario') as string;
    this.ip = localStorage.getItem('ip') as string;
  }

  ngOnInit(): void {

    console.log('📋 Solicitud recibida:', this.solicitud);
    console.log('👤 Empleado recibido:', this.empleado);

    this.validar.ObtenerIPsLocales()
      .then((ips) => {
        this.ips_locales = ips as string;
      });

    this.obtenerFeriados(this.formato_fecha);
    this.registrarSuscripciones();
    this.cargarTiposVacacion();
  }

  cargarDatosSolicitudExistente(): void {
    if (this.solicitud) {

      console.log('🔄 Cargando datos de solicitud:', this.solicitud);

      this.fechaInicio.setValue(new Date(this.solicitud.fecha_inicio));
      this.fechaFinal.setValue(new Date(this.solicitud.fecha_final));

      if (this.solicitud.id_configuracion) {
        const tipoEncontrado = this.tiposVacacion.find(
          t => t.id === this.solicitud.id_configuracion
        );

        if (tipoEncontrado) {
          this.vacacionSeleccionada.setValue(tipoEncontrado.id);
          console.log('✅ Tipo vacación cargado:', tipoEncontrado.id, '-', tipoEncontrado.descripcion);
        } else {
          console.warn('⚠️ No se encontró tipo de vacación para id_configuracion:', this.solicitud.id_configuracion);

          if (this.tiposVacacion.length > 0) {
            this.vacacionSeleccionada.setValue(this.tiposVacacion[0].id);
          }
        }
      }
      /* this.vacacionSeleccionada.setValue(this.solicitud.id_tipo_vacacion);
      console.log('✅ Tipo vacación cargado:', this.vacacionSeleccionada.value); */

      if (this.solicitud.permite_horas !== undefined && this.solicitud.permite_horas !== null) {
        this.permiteHoras = Boolean(this.solicitud.permite_horas);
        console.log('✅ Permite horas:', this.permiteHoras);

        if (this.permiteHoras) {
          this.horaInicio.setValue(this.solicitud.hora_inicio);
          this.horaFinal.setValue(this.solicitud.hora_final);
          this.fechaHoras.setValue(new Date(this.solicitud.fecha_inicio));
        }
      }
      this.calculoAutomatico();
      this.validarHoras();
    }
  }

  //FormsControl
  fechaInicio = new FormControl<Date | null>(null, Validators.required);
  fechaFinal = new FormControl<Date | null>(null, Validators.required);
  vacacionSeleccionada = new FormControl(null, Validators.required);
  certificadoF = new FormControl('');
  archivoF = new FormControl('');
  horaInicio = new FormControl<string | null>(null, [Validators.required, Validators.pattern("^[0-9]*(:[0-9][0-9])?$")]);
  horaFinal = new FormControl<string | null>(null, [Validators.required, Validators.pattern("^[0-9]*(:[0-9][0-9])?$")]);
  fechaHoras = new FormControl<Date | null>(null, Validators.required);

  //Grupo del formulario
  formulario = new FormGroup({
    certificadoForm: this.certificadoF,
  });

  registrarSuscripciones(): void {
    this.fechaInicio.valueChanges
      .subscribe(() => {
        this.calculoAutomatico();
      });

    this.fechaFinal.valueChanges
      .subscribe(() => {
        this.calculoAutomatico();
      });
    this.vacacionSeleccionada.valueChanges
      .subscribe((idTipo) => {
        this.calculoAutomatico();
        this.limpiarInputs();
        this.resetearConteo();
        const tipo = this.tiposVacacion.find(
          v => v.id === idTipo
        );
        this.permiteHoras = tipo?.permite_horas ?? false;
      });
    this.horaInicio.valueChanges.subscribe(() => this.validarHoras());
    this.horaFinal.valueChanges.subscribe(() => this.validarHoras());
    this.fechaHoras.valueChanges.subscribe(() => {
      this.validarFechaPorHoras();
      this.actualizarResumenPorHoras();
    })
  }

  //METODO PARA VALIDAR INGRESO DE NUMEROS
  ingresarSoloNumerosEnteros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

  calculoAutomatico(): void {
    const inicio = this.fechaInicio.value;
    const fin = this.fechaFinal.value;
    if (inicio && fin) {
      if (fin < inicio) {
        this.fechaFinal.setErrors({ fechaInvalida: true });
        this.fechaFinal.markAllAsTouched();
        this.picker2.close();
        this.resetearConteo();
        return;
      }
      this.fechaFinal.setErrors(null);
      this.calcularDias();
    }
  }

  resetearConteo() {
    this.conteoDiasSemana = { L: 0, M: 0, X: 0, J: 0, V: 0, S: 0, D: 0 };
    this.diasTotales = 0;
    this.diasFeriados = 0;
  }

  calcularDias(): void {
    const inicio = this.fechaInicio.value;
    const fin = this.fechaFinal.value;
    if (!inicio || !fin || fin < inicio) {
      this.resetearConteo();
      return;
    }
    const fechaIterada = new Date(inicio);
    this.resetearConteo();
    const tipoSeleccionado = this.tiposVacacion
      .find(v => v.id === this.vacacionSeleccionada.value);
    const incluirFeriados = tipoSeleccionado?.incluir_feriados ?? false;

    while (fechaIterada <= fin) {
      const dia = fechaIterada.getDay();
      switch (dia) {
        case 0: this.conteoDiasSemana.D++; break;
        case 1: this.conteoDiasSemana.L++; break;
        case 2: this.conteoDiasSemana.M++; break;
        case 3: this.conteoDiasSemana.X++; break;
        case 4: this.conteoDiasSemana.J++; break;
        case 5: this.conteoDiasSemana.V++; break;
        case 6: this.conteoDiasSemana.S++; break;
      }
      const fechaFormateada = this.validar.FormatearFecha(
        fechaIterada.toISOString(),
        this.formato_fecha, 'no',
        this.idioma_fechas
      );

      const esFeriado = this.feriados.some(
        f => f.fecha_ === fechaFormateada
      );
      if (esFeriado) {
        this.diasFeriados++;
      }
      if (!esFeriado || incluirFeriados) {
        this.diasTotales++;
      }
      fechaIterada.setDate(fechaIterada.getDate() + 1);
    }
  }

  validarHoras(): void {
    const inicio = this.horaInicio.value;
    const fin = this.horaFinal.value;
    const tipo = this.tiposVacacion.find(
      v => v.id === this.vacacionSeleccionada.value
    );
    const minimoHoras = tipo?.minimo_horas ?? '00:00:00';
    if (!inicio || !fin || !tipo) return;
    if (fin <= inicio) {
      this.horaFinal.setErrors({
        ...this.horaFinal.errors,
        horaInvalida: true
      });
    } else {
      this.limpiarError('horainvalida', this.horaFinal);
    }
    const diffMinutos = this.calcularDiferenciaMinutos(inicio, fin);
    const minimoMinutos = this.convertirHoraATotalMinutos(minimoHoras);
    if (diffMinutos < minimoMinutos) {
      this.horaFinal.setErrors({
        ...this.horaFinal.errors,
        minHoras: true
      });
    } else {
      this.limpiarError('minHoras', this.horaFinal);
    }
  }

  limpiarError(nombreError: string, control: FormControl): void {
    if (control.hasError(nombreError)) {
      const errores = {
        ...control.errors
      };
      delete errores[nombreError];
      control.setErrors(Object.keys(errores).length ? errores : null);
    }
  }

  getMinimoHoras(): string {
    const tipo = this.tiposVacacion.find(
      v => v.id === this.vacacionSeleccionada.value
    );
    return tipo?.minimo_horas ?? '00:00:00';
  }

  getMinDias(): number {
    const tipo = this.tiposVacacion.find(
      v => v.id === this.vacacionSeleccionada.value);
    return tipo?.minimo_dias ?? 0;
  }

  calcularDiferenciaMinutos(inicio: string, fin: string): number {
    const [h1, m1] = inicio.split(':').map(Number);
    const [h2, m2] = fin.split(':').map(Number);
    return (h2 * 60 + m2) - (h1 * 60 + m1);
  }

  convertirHoraATotalMinutos(hora: string): number {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
  }

  actualizarResumenPorHoras(): void {
    const fecha = this.fechaHoras.value;
    const inicio = this.horaInicio.value;
    const fin = this.horaFinal.value;
    this.diaSemanaSeleccionado = null;
    this.horasTotales = '00:00';

    if (!fecha || !inicio || !fin) return;

    const dia = new Date(fecha).getDay();
    const dias = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
    this.diaSemanaSeleccionado = dias[dia];
    const [h1, m1] = inicio.split(':').map(Number);
    const [h2, m2] = fin.split(':').map(Number);
    let totalMinutos = (h2 * 60 + m2) - (h1 * 60 + m1);

    if (totalMinutos < 0) totalMinutos = 0;

    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;
    this.horasTotales = `${horas.toString().padStart(2, '0')} : ${minutos.toString().padStart(2, '0')}`;
  }

  obtenerFeriados(formato: string) {
    this.feriados = [];
    this.rest.ConsultarFeriado()
      .subscribe(datos => {
        this.feriados = datos;
        this.feriados.forEach((data: any) => {
          data.fecha_ = this.validar.FormatearFecha(
            data.fecha,
            formato,
            'no',
            this.idioma_fechas
          )
        });
      });
  }

  validarFechaPorHoras(): void {
    const fecha = this.fechaHoras.value;
    const tipo = this.tiposVacacion.find(
      v => v.id === this.vacacionSeleccionada.value
    );
    const incluyeFeriados = tipo?.incluir_feriados ?? false;
    if (!fecha || incluyeFeriados) {
      this.fechaHoras.setErrors(null);
      return;
    }
    const date = new Date(fecha);
    const fechaFormateada = this.validar.FormatearFecha(
      date.toISOString(),
      this.formato_fecha,
      'no',
      this.idioma_fechas
    );
    const esFeriado = this.feriados.some(
      f => f.fecha_ === fechaFormateada
    );
    if (esFeriado) {
      this.fechaHoras.setErrors({ esFeriado: true });
    } else {
      this.fechaHoras.setErrors(null);
    }
  }

  cargarTiposVacacion() {
    this.vacaServ.ListarTodasConfiguraciones()
      .subscribe({
        next: (data) => {
          this.tiposVacacion = Array.isArray(data) ? data : [];
          this.cargarDatosSolicitudExistente();
          console.log('📊 Tipos de vacación cargados:', this.tiposVacacion);

          if (this.solicitud) {
            console.log('🎯 Solicitud tiene id_configuracion:', this.solicitud.id_configuracion);
            const tipoQueDeberiaCargarse = this.tiposVacacion.find(
              t => t.id === this.solicitud.id_configuracion
            );
            console.log('🔍 Tipo que debería cargarse:', tipoQueDeberiaCargarse);
          }
          this.cargarDatosSolicitudExistente();
        },
        error: () => {
          this.toastr.warning('No se pudieron cargar los tipos de vacaciones');
        }
      });
  }

  incluirFeriadosSeleccionado(): boolean | null {
    const tipo = this.tiposVacacion.find(
      v => v.id === this.vacacionSeleccionada.value
    );
    return tipo ? tipo.incluir_feriados : null;
  }

  //Método para actualizar o editar
  actualizarSolicitud(): void {
    const tipoVacacion = this.tiposVacacion.find(
      v => v.id === this.vacacionSeleccionada.value
    );

    if (tipoVacacion?.documento === true && (!this.archivoF.value || this.archivoF.value === '')) {
      this.toastr.warning('Este tipo de vacación requiere subir un archivo adjunto.', 'Archivo requerido');
      return;
    }

    const esPorHoras = this.permiteHoras;
    const fechaInicio = esPorHoras ? this.fechaHoras.value : this.fechaInicio.value;
    const fechaFinal = esPorHoras ? this.fechaHoras.value : this.fechaFinal.value;

    const solicitudActualizada: any = {
      id: this.solicitud.id,
      id_tipo_vacacion: this.vacacionSeleccionada.value,
      id_empleado: this.empleado.id,
      fecha_inicio: fechaInicio,
      fecha_final: fechaFinal,
      incluir_feriados: this.incluirFeriadosSeleccionado ?? false,
      permite_horas: esPorHoras,
      num_horas: esPorHoras ? this.horasTotales ?? 0 : 0,
      num_lunes: esPorHoras ? 0 : this.conteoDiasSemana.L,
      num_martes: esPorHoras ? 0 : this.conteoDiasSemana.M,
      num_miercoles: esPorHoras ? 0 : this.conteoDiasSemana.X,
      num_jueves: esPorHoras ? 0 : this.conteoDiasSemana.J,
      num_viernes: esPorHoras ? 0 : this.conteoDiasSemana.V,
      num_sabado: esPorHoras ? 0 : this.conteoDiasSemana.S,
      num_domingo: esPorHoras ? 0 : this.conteoDiasSemana.D,
      num_dias_totales: esPorHoras ? 0 : this.diasTotales,
      user_name: this.user_name,
      ip: this.ip,
      ip_local: this.ips_locales,
    };
    this.guardarActualizacion(solicitudActualizada);
  }

  guardarActualizacion(datos: any): void {
    if (this.certificadoF.value !== '' && this.certificadoF.value !== null) {
      this.verificarArchivoVacacion(datos);
    } else {
      this.actualizarSinDocumento(datos);
    }
  }

  actualizarSinDocumento(datos: any) {
    this.vacaServ.EditarSolicitudesVacaciones(datos)
      .subscribe(
        response => {
          this.toastr.success('Solicitud actualizada correctamente');
          this.cerrar.emit();
        }
      )
  }

  verificarArchivoVacacion(datos: any): void {
    if (this.archivoSubido && this.archivoSubido[0]?.size <= 2e+6) {
      datos.subir_documento = true;
      this.actualizarConDocumento(datos);
    } else {
      this.toastr.warning("El archivo ha excedido el tamaño permitido (2MB)");
    }
  }

  actualizarConDocumento(datos: any): void {
    this.vacaServ.EditarSolicitudesVacaciones(datos)
      .subscribe(solicitud => {
        let formData = new FormData();
        for (let i = 0; i < this.archivoSubido.length; i++) {
          formData.append(
            "uploads",
            this.archivoSubido[i],
            this.archivoSubido[i].name);
        }
        formData.append('user_name', this.user_name as string);
        formData.append('ip', this.ip as string);
        formData.append('ip_local', this.ips_locales);

        this.vacaServ.SubirDocumento(formData, solicitud.id!, datos.id_empleado)
          .subscribe(
            res => {
              this.archivoF.reset();
              this.nameFile = '';
              this.toastr.success('Solicitud y documento actualizados correctamente.');
              this.cerrar.emit();
            },
            error => {
              this.toastr.error('Error al actualizar el documento.');
            }
          )
      },
      )
  }

  //Métodos para archivos
  nameFile: string = '';
  archivoSubido: Array<File> = [];
  habilitarBtn: boolean = false;

  fileChange(element: any) {
    this.archivoSubido = element.target.files;
    if (this.archivoSubido.length != 0) {
      const name = this.archivoSubido[0].name;
      this.formulario.patchValue({ certificadoForm: name });
      this.habilitarBtn = true;
    }
  }

  limpiarNombreArchivo() {
    this.formulario.patchValue({ certificadoForm: '' });
  }

  retirarArchivo() {
    this.archivoSubido = [];
    this.habilitarBtn = false;
    this.limpiarNombreArchivo();
    this.archivoF.patchValue('');
  }

  reseteoArchivo(event: any) {
    event.target.value = null;
  }

  limpiarInputs() {
    this.fechaInicio.reset();
    this.fechaFinal.reset();
    this.horaInicio.reset();
    this.horaFinal.reset();
    this.fechaHoras.reset();
    this.fechaFinal.setErrors(null);
    this.horaFinal.setErrors(null);
    this.diasFeriados = 0;
    this.diasTotales = 0;
    this.certificadoF.reset();
    this.archivoF.reset();
    this.habilitarBtn = false;
  }

  cerrarEdicion() {
    this.cerrar.emit();
  }
}
