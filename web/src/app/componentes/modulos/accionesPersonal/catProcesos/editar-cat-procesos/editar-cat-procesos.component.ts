import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { ProcesoService } from 'src/app/servicios/modulos/modulo-acciones-personal/catProcesos/proceso.service';

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

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // CONTROL DE LOS CAMPOS DEL FORMULARIO
  procesoPadre = new FormControl('', Validators.required);
  nombre = new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z ]*')]);
  nivel = new FormControl('', Validators.required);

  procesos: any = [];

  // ASIGNAR LOS CAMPOS EN UN FORMULARIO EN GRUPO
  public formulario = new FormGroup({
    procesoNivelForm: this.nivel,
    procesoNombreForm: this.nombre,
    procesoPadreForm: this.procesoPadre,
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
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    //console.log('data ', this.data)
  }

  // METODO PARA MOSTRAR DATOS DEL REGISTRO
  ImprimirDatos() {
    this.formulario.patchValue({
      procesoNombreForm: this.data.datosP.nombre,
      procesoNivelForm: String(this.data.datosP.nivel),
    })
    if (this.data.datosP.proc_padre === null) {
      this.procesoPadre.setValue('Ninguno');
    }
    else {
      this.formulario.patchValue({
        procesoPadreForm: this.data.datosP.proc_padre,
      })
    }
  }


  // METODO PARA EDITAR REGISTRO
  EditarProceso(form: any) {
    var procesoPadreId: any;
    var procesoPadreNombre = form.procesoPadreForm;
    if (procesoPadreNombre === 'Ninguno') {
      let dataProceso = {
        id: this.data.datosP.id,
        nombre: form.procesoNombreForm,
        nivel: form.procesoNivelForm,
        user_name: this.user_name,
        ip: this.ip
      };
      this.ActualizarDatos(dataProceso);
    } else {
      this.rest.getIdProcesoPadre(procesoPadreNombre).subscribe(data => {
        procesoPadreId = data[0].id;
        let dataProceso = {
          id: this.data.datosP.id,
          nombre: form.procesoNombreForm,
          nivel: form.procesoNivelForm,
          proc_padre: procesoPadreId,
          user_name: this.user_name,
          ip: this.ip
        };
        this.ActualizarDatos(dataProceso);
      });
    }
  }

  // METODO PARA ACTUALIZAR DATOS EN BASE DE DATOS
  ActualizarDatos(datos: any) {
    this.rest.ActualizarUnProceso(datos).subscribe(response => {
      //console.log(datos)
      this.toastr.success('Operacion exitosa.', 'Proceso actualizado', {
        timeOut: 6000,
      });
      this.ObtenerProcesos();
      this.LimpiarCampos();
      this.CerrarVentana();
    }, error => { });
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.formulario.reset();
    this.ObtenerProcesos();
  }

  // METODO PARA BUSCAR PROCESOS
  ObtenerProcesos() {
    this.procesos = [];
    this.rest.ConsultarProcesos().subscribe(data => {
      this.procesos = data;
      this.procesos.push({ nombre: 'Ninguno' });
      //console.log('procesos', this.procesos)
    })
  }

  // METODO PARA CERRRA PROCESOS
  CerrarVentana() {
    this.LimpiarCampos();
    this.ImprimirDatos();
    this.ventana.close();
    this.ObtenerProcesos();

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
