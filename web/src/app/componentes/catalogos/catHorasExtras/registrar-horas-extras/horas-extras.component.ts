import { Component, OnInit } from '@angular/core';
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
import { HorasExtrasService } from 'src/app/servicios/catalogos/catHorasExtras/horas-extras.service';
import { ValidacionesService } from '../../../../servicios/validaciones/validaciones.service';

interface TipoDescuentos{
  value: number;
  viewValue: string;
}

interface Algoritmo{
  value: number;
  viewValue: string;
}

interface Horario{
  value: number;
  viewValue: string;
}

interface Dia{
  value: number;
  viewValue: string;
}

@Component({
  selector: 'app-horas-extras',
  templateUrl: './horas-extras.component.html',
  styleUrls: ['./horas-extras.component.css'],
  //encapsulation: ViewEncapsulation.None
})
export class HorasExtrasComponent implements OnInit {

  descripcion = new FormControl('', Validators.required);
  tipoDescuento = new FormControl('', Validators.required);
  recaPorcentaje = new FormControl('', Validators.required);
  horaInicio = new FormControl('', Validators.required);
  horaFinal = new FormControl('', Validators.required);
  horaJornada = new FormControl('', Validators.required);
  tipoDia = new FormControl('', Validators.required);
  codigo = new FormControl('', Validators.required);
  inclAlmuerzo = new FormControl('', Validators.required);
  tipoFuncion = new FormControl('');

  descuentos: TipoDescuentos[] = [
    {value: 1, viewValue: 'Horas Extras'},
    {value: 2, viewValue: 'Recargo Nocturno'}
  ];

  tipoFuncionAlg: Algoritmo[] = [
    {value: 1, viewValue: 'Entrada'},
    {value: 2, viewValue: 'Salida'},
  ];

  horario: Horario[] = [
    {value: 1, viewValue: 'Diurna'},
    {value: 2, viewValue: 'Nocturna'}
  ];

  dia: Dia[] = [
    {value: 1, viewValue: 'Libre'},
    {value: 2, viewValue: 'Feriado'},
    {value: 3, viewValue: 'Normal'}
  ];

  isLinear = true;
  primeroFormGroup: FormGroup;
  segundoFormGroup: FormGroup;

  /**
   * Variables progress spinner
   */
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 10;
  habilitarprogress: boolean = false;
  
  constructor(
    private toastr: ToastrService,
    private rest: HorasExtrasService,
    private _formBuilder: FormBuilder,
    private validacionesService: ValidacionesService
  ) { }

  ngOnInit(): void {
    this.primeroFormGroup = this._formBuilder.group({
      descripcionForm: this.descripcion,
      tipoDescuentoForm: this.tipoDescuento,
      recaPorcentajeForm: this.recaPorcentaje,
      horaInicioForm: this.horaInicio,
      horaFinalForm: this.horaFinal,
      horaJornadaForm: this.horaJornada,
    });
    this.segundoFormGroup = this._formBuilder.group({
      tipoDiaForm: this.tipoDia,
      codigoForm: this.codigo,
      inclAlmuerzoForm: this.inclAlmuerzo,
      tipoFuncionForm: this.tipoFuncion
    });
  }

  formatLabel(value: number) {
    return value + '%';
  }

  obtenerMensajeErrorDescripcion(){
    if (this.descripcion.hasError('required')) {
      return 'Campo obligatorio';
    }
  }

  insertarHoraExtra(form1, form2) {
    let dataHoraExtra = {
      descripcion: form1.descripcionForm,
      tipo_descuento: form1.tipoDescuentoForm,
      reca_porcentaje: form1.recaPorcentajeForm,
      hora_inicio: form1.horaInicioForm,
      hora_final: form1.horaFinalForm,
      hora_jornada: form1.horaJornadaForm,
      tipo_dia: form2.tipoDiaForm,
      codigo: form2.codigoForm,
      incl_almuerzo: form2.inclAlmuerzoForm,
      tipo_funcion: form2.tipoFuncionForm
    };

    this.rest.postHoraExtraRest(dataHoraExtra)
      .subscribe(response => {
        this.toastr.success('Operación exitosa.', 'Hora extra guardada', {
          timeOut: 6000,
        });
      }, err => {
        return this.validacionesService.RedireccionarHomeAdmin(err.error) 
      });
  }

}
