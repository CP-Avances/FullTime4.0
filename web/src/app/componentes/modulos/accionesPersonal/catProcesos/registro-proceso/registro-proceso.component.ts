import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ProcesoService } from 'src/app/servicios/catalogos/catProcesos/proceso.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef } from '@angular/material/dialog';

import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';

// AYUDA PARA CREAR LOS NIVELES
interface Nivel {
  valor: string;
  nombre: string
}

@Component({
  selector: 'app-registro-proceso',
  templateUrl: './registro-proceso.component.html',
  styleUrls: ['./registro-proceso.component.css']
})

export class RegistroProcesoComponent implements OnInit {

  // CONTROL DE LOS CAMPOS DEL FORMULARIO
  nombre = new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z ]*')]);
  nivel = new FormControl('', Validators.required);
  procesoPadre = new FormControl('', Validators.required);

  procesos: any = [];

  // ASIGNAR LOS CAMPOS EN UN FORMULARIO EN GRUPO
  public formulario = new FormGroup({
    procesoNombreForm: this.nombre,
    procesoNivelForm: this.nivel,
    procesoProcesoPadreForm: this.procesoPadre
  });

  // ARREGLO DE NIVELES EXISTENTES
  niveles: Nivel[] = [
    { valor: '1', nombre: '1' },
    { valor: '2', nombre: '2' },
    { valor: '3', nombre: '3' },
    { valor: '4', nombre: '4' },
    { valor: '5', nombre: '5' }
  ];

  constructor(
    private rest: ProcesoService,
    private toastr: ToastrService,
    public ventana: MatDialogRef<RegistroProcesoComponent>,
    public validar: ValidacionesService,
  ) {
  }

  ngOnInit(): void {
    this.Obtenerprocesos();
  }

  // METODO DE VALIDACION DE CAMPOS
  ObtenerMensajeErrorNombre() {
    if (this.nombre.hasError('required')) {
      return 'Campo obligatorio.';
    }
    return this.nombre.hasError('pattern') ? 'No ingresar números.' : '';
  }

  // METODO PARA REGISTRAR PROCESO
  InsertarProceso(form: any) {
    var procesoPadreId: any;
    var procesoPadreNombre = form.procesoProcesoPadreForm;
    if (procesoPadreNombre == 0) {
      let dataProceso = {
        nombre: form.procesoNombreForm,
        nivel: form.procesoNivelForm,
      };
      this.rest.postProcesoRest(dataProceso)
        .subscribe(response => {
          this.toastr.success('Operacion exitosa.', 'Registro guardado.', {
            timeOut: 6000,
          });
          this.LimpiarCampos();
        }, error => { });
    } else {
      this.rest.getIdProcesoPadre(procesoPadreNombre).subscribe(data => {
        procesoPadreId = data[0].id;
        let dataProceso = {
          nombre: form.procesoNombreForm,
          nivel: form.procesoNivelForm,
          proc_padre: procesoPadreId
        };
        this.rest.postProcesoRest(dataProceso)
          .subscribe(response => {
            this.toastr.success('Operacion exitosa.', 'Proceso guardado.', {
              timeOut: 6000,
            });
            this.LimpiarCampos();
          }, error => { });;
      });
    }
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.formulario.reset();
    this.Obtenerprocesos();
  }

  // METODO PARA BUSCAR PROCESOS
  Obtenerprocesos() {
    this.procesos = [];
    this.rest.getProcesosRest().subscribe(data => {
      this.procesos = data
    })
  }

  // METODO PARA CERRAR VENTANA
  CerrarVentana() {
    this.LimpiarCampos();
    this.ventana.close();
  }

  // METODO PARA VALIDAR INGRESO DE LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

}
