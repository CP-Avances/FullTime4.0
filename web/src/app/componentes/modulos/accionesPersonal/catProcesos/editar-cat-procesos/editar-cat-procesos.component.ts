import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ProcesoService } from 'src/app/servicios/catalogos/catProcesos/proceso.service';
import { ToastrService } from 'ngx-toastr';

import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';

// AYUDA PARA CREAR LOS NIVELES
interface Nivel {
  valor: string;
  nombre: string
}

@Component({
  selector: 'app-editar-cat-procesos',
  templateUrl: './editar-cat-procesos.component.html',
  styleUrls: ['./editar-cat-procesos.component.css']
})

export class EditarCatProcesosComponent implements OnInit {

  // CONTROL DE LOS CAMPOS DEL FORMULARIO
  procesoPadre = new FormControl('', Validators.required);
  nombre = new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z ]*')]);
  nivel = new FormControl('', Validators.required);

  procesos: any = [];
  seleccionarNivel: any;
  seleccionarProceso: any;

  // ASIGNAR LOS CAMPOS EN UN FORMULARIO EN GRUPO
  public nuevoProcesoForm = new FormGroup({
    procesoNivelForm: this.nivel,
    procesoNombreForm: this.nombre,
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
    public ventana: MatDialogRef<EditarCatProcesosComponent>,
    public validar: ValidacionesService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  ngOnInit(): void {
    this.ObtenerProcesos();
    this.ImprimirDatos();
  }

  // METODO PARA MOSTRAR DATOS DEL REGISTRO
  ImprimirDatos() {
    this.nuevoProcesoForm.patchValue({
      procesoNombreForm: this.data.datosP.nombre,
      procesoNivelForm: this.data.datosP.nivel,
    })
    this.seleccionarNivel = String(this.data.datosP.nivel);
    if (this.data.datosP.proc_padre === null) {
      this.seleccionarProceso = 0;
      this.nuevoProcesoForm.patchValue({
        procesoProcesoPadreForm: 'Ningún Proceso'
      })
    }
    else {
      this.nuevoProcesoForm.patchValue({
        procesoProcesoPadreForm: this.data.datosP.proc_padre
      })
      this.seleccionarProceso = this.data.datosP.proc_padre;
    }
  }

  // METODO PARA VALIDAR CAMPOS
  ObtenerMensajeErrorNombre() {
    if (this.nombre.hasError('required')) {
      return 'Campo obligatorio.';
    }
    return this.nombre.hasError('pattern') ? 'No ingresar números.' : '';
  }

  // METODO PARA EDITAR REGISTRO
  EditarProceso(form: any) {
    var procesoPadreId: any;
    var procesoPadreNombre = form.procesoProcesoPadreForm;
    if (procesoPadreNombre == 0) {
      let dataProceso = {
        id: this.data.datosP.id,
        nombre: form.procesoNombreForm,
        nivel: form.procesoNivelForm,
      };
      this.ActualizarDatos(dataProceso);
    } else {
      this.rest.getIdProcesoPadre(procesoPadreNombre).subscribe(data => {
        procesoPadreId = data[0].id;
        let dataProceso = {
          id: this.data.datosP.id,
          nombre: form.procesoNombreForm,
          nivel: form.procesoNivelForm,
          proc_padre: procesoPadreId
        };
        this.ActualizarDatos(dataProceso);
      });
    }
  }

  // METODO PARA ACTUALIZAR DATOS EN BASE DE DATOS
  ActualizarDatos(datos: any) {
    this.rest.ActualizarUnProceso(datos).subscribe(response => {
      console.log(datos)
      this.toastr.success('Operacion exitosa.', 'Proceso actualizado', {
        timeOut: 6000,
      });
      this.CerrarVentana();
    }, error => { });
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.nuevoProcesoForm.reset();
  }

  // METODO PARA BUSCAR PROCESOS
  ObtenerProcesos() {
    this.procesos = [];
    this.rest.getProcesosRest().subscribe(data => {
      this.procesos = data
    })
  }

  // METODO PARA CERRRA PROCESOS
  CerrarVentana() {
    this.ObtenerProcesos();
    this.LimpiarCampos();
    this.ImprimirDatos();
    this.ventana.close();
  }

  // METODO PARA SALIR DEL REGISTRO
  Salir() {
    this.LimpiarCampos();
    this.ventana.close();
  }

  // METODO PARA VALIDAR INGRESO DE LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

}
