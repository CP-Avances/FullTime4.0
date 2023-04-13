import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { TipoPermisosService } from 'src/app/servicios/catalogos/catTipoPermisos/tipo-permisos.service';

@Component({
  selector: 'app-registrar-asistencia',
  templateUrl: './registrar-asistencia.component.html',
  styleUrls: ['./registrar-asistencia.component.css']
})
export class RegistrarAsistenciaComponent implements OnInit {

      // Control de campos y validaciones del formulario
      fechaHoraHF = new FormControl('', [Validators.required]);
      fechaHoraTF = new FormControl('', [Validators.required]);
      accionF = new FormControl('', [Validators.required]);
      esperaF = new FormControl('', [Validators.required]);
      fechaHoraAF = new FormControl('');
      nombreEmpleadoF = new FormControl('');
      estadoF = new FormControl('', [Validators.required]);
  
    public AsistenciaForm = new FormGroup({
      fechaHoraHForm: this.fechaHoraHF,
      fechaHoraTForm: this.fechaHoraTF,
      accionForm: this.accionF,
      esperaForm: this.esperaF,
      fechaHoraAForm: this.fechaHoraAF,
      nombreEmpleadoForm: this.nombreEmpleadoF,
      estadoForm: this.estadoF,
  
    });
  
    constructor(
      private rest: TipoPermisosService,
      private toastr: ToastrService,
    ) { }
  
    ngOnInit(): void {
    }
  
    insertarTipoPermiso(form1) {
      let dataAsistencia = {
        fec_hora_timbre: form1.fechaHoraForm,
        accion: form1.accionForm,
        tecl_funcion: form1.teclaFuncionForm,
        observacion: form1.observacionForm,
        latitud: form1.latitud,
        longitud: form1.longitudForm,
        id_empleado: form1.nombreEmpleadoForm,
        id_reloj: form1.dispositivoForm,
      }
  
    }
  
    IngresarDatos(datos) {
      this.rest.RegistrarTipoPermiso(datos).subscribe(res => {
        this.toastr.success('Operación Exitosa', 'Tipo Permiso guardado', {
          timeOut: 6000,
        });
        window.location.reload();
      }, error => {
      });
    }
  
  
    IngresarSoloLetras(e) {
      let key = e.keyCode || e.which;
      let tecla = String.fromCharCode(key).toString();
      //Se define todo el abecedario que se va a usar.
      let letras = " áéíóúabcdefghijklmnñopqrstuvwxyzÁÉÍÓÚABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
      //Es la validación del KeyCodes, que teclas recibe el campo de texto.
      let especiales = [8, 37, 39, 46, 6, 13];
      let tecla_especial = false
      for (var i in especiales) {
        if (key == especiales[i]) {
          tecla_especial = true;
          break;
        }
      }
      if (letras.indexOf(tecla) == -1 && !tecla_especial) {
        this.toastr.info('No se admite datos numéricos', 'Usar solo letras', {
          timeOut: 6000,
        })
        return false;
      }
    }
  
}
