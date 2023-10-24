import { Validators, FormGroup, FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { AsistenciaService } from 'src/app/servicios/asistencia/asistencia.service';

@Component({
  selector: 'app-registrar-asistencia',
  templateUrl: './registrar-asistencia.component.html',
  styleUrls: ['./registrar-asistencia.component.css']
})

export class RegistrarAsistenciaComponent implements OnInit {

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  fechaInicio = new FormControl('', [Validators.required]);
  fechaFin = new FormControl('', [Validators.required]);
  codigo = new FormControl('');
  cedula = new FormControl('');
  nombre = new FormControl('');
  apellido = new FormControl('');

  public formulario = new FormGroup({
    fechaInicioForm: this.fechaInicio,
    fechaFinForm: this.fechaFin,
    nombreForm: this.nombre,
    apellidoForm: this.apellido,
    codigoForm: this.codigo,
    cedulaForm: this.cedula,
  });

  constructor(
    private toastr: ToastrService,
    public validar: ValidacionesService,
    public asistir: AsistenciaService,
  ) { }

  ngOnInit(): void {
  }


  asistencia: any = [];
  BuscarDatosAsistencia(form: any) {
    let datos = {
      codigo: form.codigoForm,
      cedula: form.cedulaForm,
      nombre: form.nombreForm,
      apellido: form.apellidoForm,
      inicio: form.fechaInicioForm,
      fin: form.fechaFinForm,
    }

    this.asistir.ConsultarAsistencia(datos).subscribe(data => {
      console.log('ver datos ', data)

      if (data.message === 'OK') {
        console.log('ver respuesta ', data.respuesta)
      }
      else {
        this.toastr.warning('No se han encontrado registros.', '', {
          timeOut: 6000,
        });
      }

    }, vacio => {
      this.toastr.warning('No se han encontrado registros.', '', {
        timeOut: 6000,
      });
    })
  }

}
