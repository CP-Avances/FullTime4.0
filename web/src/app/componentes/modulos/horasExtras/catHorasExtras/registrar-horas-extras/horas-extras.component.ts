import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { HorasExtrasService } from 'src/app/servicios/modulos/modulo-horas-extras/catHorasExtras/horas-extras.service';

import { ListaHorasExtrasComponent } from '../lista-horas-extras/lista-horas-extras.component';

interface TipoDescuentos {
  value: number;
  viewValue: string;
}

interface Algoritmo {
  value: number;
  viewValue: string;
}

interface Horario {
  value: number;
  viewValue: string;
}

interface Dia {
  value: number;
  viewValue: string;
}

@Component({
  selector: 'app-horas-extras',
  standalone: false,
  templateUrl: './horas-extras.component.html',
  styleUrls: ['./horas-extras.component.css']
})

export class HorasExtrasComponent implements OnInit {
  ips_locales: any = '';

  recaPorcentaje = new FormControl('', Validators.required);
  tipoDescuento = new FormControl('', Validators.required);
  horaJornada = new FormControl('', Validators.required);
  descripcion = new FormControl('', Validators.required);
  horaInicio = new FormControl('', Validators.required);
  horaFinal = new FormControl('', Validators.required);


  inclAlmuerzo = new FormControl('', Validators.required);
  tipoFuncion = new FormControl('');
  tipoDia = new FormControl('', Validators.required);
  codigo = new FormControl('', Validators.required);

  descuentos: TipoDescuentos[] = [
    { value: 1, viewValue: 'Horas Extras' },
    { value: 2, viewValue: 'Recargo Nocturno' }
  ];

  tipoFuncionAlg: Algoritmo[] = [
    { value: 1, viewValue: 'Entrada' },
    { value: 2, viewValue: 'Salida' },
  ];

  horario: Horario[] = [
    { value: 1, viewValue: 'Diurna' },
    { value: 2, viewValue: 'Nocturna' }
  ];

  dia: Dia[] = [
    { value: 1, viewValue: 'Libre' },
    { value: 2, viewValue: 'Feriado' },
    { value: 3, viewValue: 'Normal' }
  ];

  isLinear = true;
  primeroFormGroup: FormGroup;
  segundoFormGroup: FormGroup;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    private _formBuilder: FormBuilder,
    private validar: ValidacionesService,
    private toastr: ToastrService,
    private rest: HorasExtrasService,
    public componentel: ListaHorasExtrasComponent,
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');  
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    }); 

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

  // METODO PARA MOSTRAR VALOR
  formatLabel(value: number) {
    return value + '%';
  }

  // METODO PARA CAPTURAR DATOS DEL FORMULARIO
  InsertarHoraExtra(form1: any, form2: any) {
    let dataHoraExtra = {
      reca_porcentaje: form1.recaPorcentajeForm,
      tipo_descuento: form1.tipoDescuentoForm,
      hora_jornada: form1.horaJornadaForm,
      descripcion: form1.descripcionForm,
      hora_inicio: form1.horaInicioForm,
      hora_final: form1.horaFinalForm,

      tipo_dia: form2.tipoDiaForm,
      codigo: form2.codigoForm,
      incl_almuerzo: form2.inclAlmuerzoForm,
      tipo_funcion: form2.tipoFuncionForm,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales
    };

    this.rest.postHoraExtraRest(dataHoraExtra)
      .subscribe(response => {
        this.toastr.success('Operación exitosa.', 'Registro guardado.', {
          timeOut: 6000,
        });
        this.CerrarVentana(2, response.id);
      }, err => {
        return this.validar.RedireccionarHomeAdmin(err.error)
      });
  }

  // METODO PARA CERRAR REGISTRO
  CerrarVentana(opcion: any, datos: any) {
    this.componentel.ver_registrar = false;
    if (opcion === 1) {
      this.componentel.ver_lista = true;
    }
    else {
      this.componentel.AbrirVistaDatos(datos);
    }
  }

}
