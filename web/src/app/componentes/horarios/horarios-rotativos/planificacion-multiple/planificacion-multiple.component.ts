import { Component, OnInit, Input } from '@angular/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { FormControl } from '@angular/forms';
import { default as _rollupMoment, Moment } from 'moment';
import moment from 'moment';

import { HorarioMultipleEmpleadoComponent } from '../../rango-fechas/horario-multiple-empleado/horario-multiple-empleado.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-planificacion-multiple',
  templateUrl: './planificacion-multiple.component.html',
  styleUrls: ['./planificacion-multiple.component.css']
})

export class PlanificacionMultipleComponent implements OnInit {

  @Input() datosSeleccionados: any;

  // FECHAS DE BUSQUEDA
  fechaInicialF = new FormControl;
  fechaFinalF = new FormControl();
  horarioF = new FormControl();
  fecHorario: boolean = true;

  constructor(
    public componentem: HorarioMultipleEmpleadoComponent,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
  }

  // METODO PARA MOSTRAR FECHA SELECCIONADA
  FormatearFecha(fecha: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = fecha;

    let inicio = moment(ctrlValue).format('01/MM/YYYY');
    let final = moment(ctrlValue).daysInMonth() + moment(ctrlValue).format('/MM/YYYY');

    this.fechaInicialF.setValue(moment(inicio, 'DD/MM/YYYY'));
    this.fechaFinalF.setValue(moment(final, 'DD/MM/YYYY'));

    datepicker.close();
  }


  // METODO PARA SELECCIONAR TIPO DE BUSQUEDA
  mes_asignar: string = '';
  GenerarCalendario() {
    if (this.fechaInicialF.value === null && this.fechaFinalF.value === null) {
      let inicio = moment().format('01/MM/YYYY');
      let final = moment().daysInMonth() + moment().format('/MM/YYYY');
      this.fechaInicialF.setValue(moment(inicio, 'DD/MM/YYYY'));
      this.fechaFinalF.setValue(moment(final, 'DD/MM/YYYY'));

      this.mes_asignar = ('DE ' + moment(this.fechaInicialF.value).format('MMMM')).toUpperCase();
    }

    this.ListarFechas(this.fechaInicialF.value, this.fechaFinalF.value);
  }

  // METODO PARA OBTENER FECHAS, MES, DIA, AÑO
  fechas_mes: any = [];
  dia_inicio: any;
  dia_fin: any;
  ListarFechas(fecha_inicio: any, fecha_final: any) {
    this.fechas_mes = []; // ARRAY QUE CONTIENE TODAS LAS FECHAS DEL MES INDICADO 

    this.dia_inicio = moment(fecha_inicio, 'YYYY-MM-DD').format('YYYY-MM-DD');
    this.dia_fin = moment(fecha_final, 'YYYY-MM-DD').format('YYYY-MM-DD');

    // LOGICA PARA OBTENER EL NOMBRE DE CADA UNO DE LOS DIAS DEL PERIODO INDICADO
    while (this.dia_inicio <= this.dia_fin) {
      let fechas = {
        fecha: this.dia_inicio,
        dia: (moment(this.dia_inicio).format('dddd')).toUpperCase(),
        num_dia: moment(this.dia_inicio, 'YYYY/MM/DD').isoWeekday(),
        formato: (moment(this.dia_inicio).format('MMMM, ddd DD, YYYY')).toUpperCase(),
        formato_: (moment(this.dia_inicio).format('ddd DD, YYYY')).toUpperCase(),
        mes: moment(this.dia_inicio).format('MMMM').toUpperCase(),
        anio: moment(this.dia_inicio).format('YYYY'),
        horarios: [],
        registrados: [],
        tipo_dia: '-',
        estado: false,
        observacion: '',
        horarios_existentes: '',
        supera_jornada: '',
        horas_superadas: '',
      }
      this.fechas_mes.push(fechas);
      var newDate = moment(this.dia_inicio).add(1, 'd').format('YYYY-MM-DD')
      this.dia_inicio = newDate;
    }

    console.log('ver fechas ', this.fechas_mes)
  }




  // METODO PARA CERRAR VENTANA
  CerrarVentana() {
    if (this.datosSeleccionados.pagina === 'multiple-empleado') {
      this.componentem.seleccionar = true;
      this.componentem.plan_rotativo = false;
      this.componentem.LimpiarFormulario();
    }
  }

}
