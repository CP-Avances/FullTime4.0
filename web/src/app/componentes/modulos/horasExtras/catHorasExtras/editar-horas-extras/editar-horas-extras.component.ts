import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { ListaHorasExtrasComponent } from '../lista-horas-extras/lista-horas-extras.component';

import { HorasExtrasService } from 'src/app/servicios/modulos/modulo-horas-extras/catHorasExtras/horas-extras.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';

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
  selector: 'app-editar-horas-extras',
  templateUrl: './editar-horas-extras.component.html',
  styleUrls: ['./editar-horas-extras.component.css']
})

export class EditarHorasExtrasComponent implements OnInit {
  ips_locales: any = '';

  @Input() data: any;
  @Input() pagina: string = '';

  recaPorcentaje = new FormControl('', Validators.required);
  tipoDescuento = new FormControl('', Validators.required);
  descripcion = new FormControl('', Validators.required);
  horaJornada = new FormControl('', Validators.required);
  horaInicio = new FormControl('', Validators.required);
  horaFinal = new FormControl('', Validators.required);

  codigo = new FormControl('', Validators.required);
  tipoDia = new FormControl('', Validators.required);
  tipoFuncion = new FormControl('');
  inclAlmuerzo = new FormControl('', Validators.required);

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

  datosHoraExtra: any = [];
  isLinear = true;
  primeroFormGroup: FormGroup;
  segundoFormGroup: FormGroup;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    private toastr: ToastrService,
    private rest: HorasExtrasService,
    private _formBuilder: FormBuilder,
    public componentel: ListaHorasExtrasComponent,
    public validar: ValidacionesService,
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
    this.CargarDatos();
  }

  // METODO PARA PRESENTAR DATOS
  formatLabel(value: number) {
    return value + '%';
  }

  InsertarHoraExtra(form1: any, form2: any) {
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
      tipo_funcion: form2.tipoFuncionForm,
      id: this.data.id,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales
    };

    this.rest.ActualizarDatos(dataHoraExtra)
      .subscribe(response => {
        this.toastr.success('Operación exitosa.', 'Registro actualizado.', {
          timeOut: 6000,
        });
        this.CerrarVentana(2);
      }, err => {
        const { access, message } = err.error.message;
        if (access === false) {
          this.toastr.error(message)
          this.CerrarVentana(1);
        }
      });

  }

  // METODO PARA CARGAR DATOS
  CargarDatos() {
    this.datosHoraExtra = [];
    this.rest.ObtenerUnaHoraExtra(parseInt(this.data.id)).subscribe(datos => {
      this.datosHoraExtra = datos;
      console.log(this.datosHoraExtra);
      this.primeroFormGroup.patchValue({
        descripcionForm: this.datosHoraExtra[0].descripcion,
        tipoDescuentoForm: this.datosHoraExtra[0].tipo_descuento,
        recaPorcentajeForm: this.datosHoraExtra[0].recargo_porcentaje,
        horaInicioForm: this.datosHoraExtra[0].hora_inicio,
        horaFinalForm: this.datosHoraExtra[0].hora_final,
        horaJornadaForm: this.datosHoraExtra[0].hora_jornada,
      });
      this.segundoFormGroup.patchValue({
        tipoDiaForm: this.datosHoraExtra[0].tipo_dia,
        codigoForm: parseInt(this.datosHoraExtra[0].codigo),
        inclAlmuerzoForm: this.datosHoraExtra[0].minutos_comida,
        tipoFuncionForm: this.datosHoraExtra[0].tipo_funcion
      })
    }, err => {
      const { access, message } = err.error.message;
      if (access === false) {
        this.toastr.error(message)
        this.CerrarVentana(1);
      }
    })
  }

  // METODO PARA CERRAR VENTANA
  CerrarVentana(opcion: number) {
    this.componentel.ver_editar = false;
    if (opcion === 1 && this.pagina === 'listar-configuracion') {
      this.componentel.ver_lista = true;
    }
    else if (opcion === 2 && this.pagina === 'listar-configuracion') {
      this.componentel.AbrirVistaDatos(this.data.id);
    }
    if (opcion === 1 && this.pagina === 'ver-configuracion') {
      this.componentel.AbrirVistaDatos(this.data.id);
    }
    else if (opcion === 2 && this.pagina === 'ver-configuracion') {
      this.componentel.AbrirVistaDatos(this.data.id);
    }
  }

}
