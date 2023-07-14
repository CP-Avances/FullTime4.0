import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ProcesoService } from 'src/app/servicios/catalogos/catProcesos/proceso.service';
import { ToastrService } from 'ngx-toastr';

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
  seleccionarNivel;
  seleccionarProceso;

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
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  ngOnInit(): void {
    this.getProcesos();
    this.ImprimirDatos();
  }

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
      //console.log(this.seleccionarProceso)
    }
    else {
      this.nuevoProcesoForm.patchValue({
        procesoProcesoPadreForm: this.data.datosP.proc_padre
      })
      this.seleccionarProceso = this.data.datosP.proc_padre;
      //console.log(this.seleccionarProceso)
    }
  }

  IngresarSoloLetras(e) {
    let key = e.keyCode || e.which;
    let tecla = String.fromCharCode(key).toString();
    // SE DEFINE TODO EL ABECEDARIO QUE SE VA A USAR.
    let letras = " áéíóúabcdefghijklmnñopqrstuvwxyzÁÉÍÓÚABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    // ES LA VALIDACIÓN DEL KEYCODES, QUE TECLAS RECIBE EL CAMPO DE TEXTO.
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

  obtenerMensajeErrorNombre() {
    if (this.nombre.hasError('required')) {
      return 'Campo obligatorio';
    }
    return this.nombre.hasError('pattern') ? 'No ingresar números' : '';
  }

  insertarProceso(form) {
    var procesoPadreId
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

  ActualizarDatos(datos) {
    this.rest.ActualizarUnProceso(datos).subscribe(response => {
      console.log(datos)
      this.toastr.success('Operacion Exitosa', 'Proceso actualizado', {
        timeOut: 6000,
      });
      this.CerrarVentanaRegistroProceso();
    }, error => { });
  }

  limpiarCampos() {
    this.nuevoProcesoForm.reset();
  }

  getProcesos() {
    this.procesos = [];
    this.rest.getProcesosRest().subscribe(data => {
      this.procesos = data
    })
  }

  CerrarVentanaRegistroProceso() {
    this.getProcesos();
    this.limpiarCampos();
    this.ImprimirDatos();
    this.ventana.close();
  }

  Salir() {
    this.limpiarCampos();
    this.ventana.close();
  }

}
