import { Component, OnInit, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';

import { PlanHorarioService } from 'src/app/servicios/horarios/planHorario/plan-horario.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';



interface Persona {




  nombre: string;




  edad: number;




  pais: string;


  editando: boolean;
}

@Component({
  selector: 'app-registro-plan-horario',
  templateUrl: './registro-plan-horario.component.html',
  styleUrls: ['./registro-plan-horario.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
  ]
})

export class RegistroPlanHorarioComponent implements OnInit {

  /*
  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  fechaIngresoF = new FormControl('', [Validators.required]);
  fechaSalidaF = new FormControl('', [Validators.required]);

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public PlanHorarioForm = new FormGroup({
    fechaIngresoForm: this.fechaIngresoF,
    fechaSalidaForm: this.fechaSalidaF,
  });

  */

  @Input() datoEmpleado: any




  public events: any[];
  public options: any;


  constructor(
    public rest: PlanHorarioService,
    public restE: EmpleadoService,
    private toastr: ToastrService,

    private dataAdapter: DateAdapter<Date>



  ) {

    this.dataAdapter.setLocale('es-MX');
  }

  ngOnInit(): void {
    //this.ObtenerEmpleado(this.datoEmpleado.idEmpleado);
    // Generar filas con los datos


  }

  /*
    empleado: any = [];
    // METODO PARA VER LA INFORMACION DEL EMPLEADO 
    ObtenerEmpleado(idemploy: any) {
      this.empleado = [];
      this.restE.BuscarUnEmpleado(idemploy).subscribe(data => {
        this.empleado = data;
        console.log('empleado', this.empleado)
      })
    }
  
    ValidarDatosPlanHorario(form: any) {
      let datosBusqueda = {
        id_cargo: this.datoEmpleado.idCargo,
        id_empleado: this.datoEmpleado.idEmpleado
      }
      this.restE.BuscarFechaContrato(datosBusqueda).subscribe(response => {
        console.log('fecha', response[0].fec_ingreso.split('T')[0], ' ', Date.parse(form.fechaIngresoForm), Date.parse(response[0].fec_ingreso.split('T')[0]))
        if (Date.parse(response[0].fec_ingreso.split('T')[0]) < Date.parse(form.fechaIngresoForm)) {
          if (Date.parse(form.fechaIngresoForm) < Date.parse(form.fechaSalidaForm)) {
            this.InsertarPlanHorario(form);
          }
          else {
            this.toastr.info('La fecha de salida no debe ser anterior a la fecha de ingreso', '', {
              timeOut: 6000,
            })
          }
        }
        else {
          this.toastr.info('La fecha de inicio de actividades no puede ser anterior a la fecha de ingreso de contrato.', '', {
            timeOut: 6000,
          });
        }
      }, error => { });
    }
  
    InsertarPlanHorario(form: any) {
      let fechas = {
        fechaInicio: form.fechaIngresoForm,
        fechaFinal: form.fechaSalidaForm,
      };
      this.rest.VerificarDuplicidadPlan(fechas, this.empleado[0].codigo).subscribe(response => {
        this.toastr.info('Las fechas ingresadas ya se encuentran dentro de otra planificación.', '', {
          timeOut: 6000,
        });
      }, error => {
        let datosPlanHorario = {
          id_cargo: this.datoEmpleado.idCargo,
          fec_inicio: form.fechaIngresoForm,
          fec_final: form.fechaSalidaForm,
          codigo: this.empleado[0].codigo
        };
        this.rest.RegistrarPlanHorario(datosPlanHorario).subscribe(response => {
          this.toastr.success('Operación exitosa.', 'Planificación de Horario registrado', {
            timeOut: 6000,
          });
          this.CerrarVentanaPlanHorario();
        }, error => { });
      });
    }
  
    LimpiarCampos() {
      this.PlanHorarioForm.reset();
    }
  
    CerrarVentanaPlanHorario() {
      this.LimpiarCampos();
      this.dialogRef.close();
      // window.location.reload();
    }
  */



  personas: Persona[] = [



    {


      nombre: 'Juan', edad: 25, pais: 'México', editando: false
    },

    {


      nombre: 'María', edad: 30, pais: 'España', editando: false
    },


    {


      nombre: 'Pedro', edad: 28, pais: 'Argentina', editando: false
    }
  ];

  agregarFila() {
    this.personas.push({ nombre: '', edad: 0, pais: '', editando: false });
  }

  editarPersona(index: number) {


    this.personas[index].editando = true;
  }

  guardarCambios(index: number) {


    this.personas[index].editando = false;
  }




  calendarPlugins = [];
  calendarWeekends = true;

  calendarEvents = [


    { title: 'Evento 1', start: '2023-07-10' },



    {


      title: 'Evento 2', start: '2023-07-12'
    }
  ];




  onEventClick(eventInfo: any) {


    console.log('Evento clickeado:', eventInfo.event.title);
  }


  onDateClick(eventInfo: any) {
    const title = prompt('Ingrese un título para el evento:');
    if (title) {
      this.calendarEvents = [...this.calendarEvents, { title, start: eventInfo.dateStr }];
    }
  }


}


