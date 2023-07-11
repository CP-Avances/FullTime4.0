import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

import { EnroladosRelojesService } from 'src/app/servicios/enroladosRelojes/enrolados-relojes.service';
import { RelojesService } from 'src/app/servicios/catalogos/catRelojes/relojes.service';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-editar-dispositivo-enrolado',
  templateUrl: './editar-dispositivo-enrolado.component.html',
  styleUrls: ['./editar-dispositivo-enrolado.component.css']
})
export class EditarDispositivoEnroladoComponent implements OnInit {

  dispositivos: any = [];
  enroladoReloj: any = [];
  seleccionarDispositivo;
  actualizarPagina: boolean = false;


  // CONTROL DE LOS CAMPOS DEL FORMULARIO
  dispositivoF = new FormControl('', [Validators.required]);

  // ASIGNAR LOS CAMPOS EN UN FORMULARIO EN GRUPO
  public asignarRelojForm = new FormGroup({
    dispositivoForm: this.dispositivoF,
  });
  
  /**
   * VARIABLES PROGRESS SPINNER
   */
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 10;
  habilitarprogress: boolean = false;
  
  constructor(
    private rest: EnroladosRelojesService,
    private restR: RelojesService,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<EditarDispositivoEnroladoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.ObtenerDispositios();
    this.CargarDatos();
  }


  LimpiarCampos() {
    this.asignarRelojForm.reset();
    this.seleccionarDispositivo = this.ObtenerDispositios();
  }

  CerrarVentanaAsignarReloj() {
    this.LimpiarCampos();
    this.dialogRef.close();
  }

  ObtenerDispositios() {
    this.dispositivos = [];
    this.restR.ConsultarRelojes().subscribe(datos => {
      this.dispositivos = datos;
      this.dispositivos[this.dispositivos.length] = { nombre: "Seleccionar" };
    })
  }

  InsertarEnroladoReloj(form: any) {
    this.habilitarprogress = true;
    var idEnrolado = this.data.enroladoid;
    var nombreReloj = form.dispositivoForm;
    var buscarReloj = {
      id_reloj: nombreReloj,
      id_enrolado: idEnrolado,
      id: this.data.id_relj_enrolado
    }
    this.enroladoReloj = [];
    this.rest.BuscarIdReloj(buscarReloj).subscribe(datos => {
      this.enroladoReloj = datos;
      this.toastr.info('Se le recuerda que el empleado enrolado ya esta agregado a este dispositivo','', {
        timeOut: 6000,
      })
      this.habilitarprogress = false;
      this.LimpiarCampos();
    }, error => {
      this.habilitarprogress = true;
      this.rest.ActualizarDatos(buscarReloj).subscribe(response => {
        this.toastr.success('Operación exitosa.', 'Empleado enrolado agregado al dispositivo', {
          timeOut: 6000,
        });
        this.CerrarVentanaAsignarReloj();
        this.habilitarprogress = false;
      }, error => {
        this.habilitarprogress = false;
        this.toastr.error('Ups!!! algo salio mal.', 'Empleado enrolado no fue agregado al dispositivo', {
          timeOut: 6000,
        })
      });
    });
  }

  CargarDatos() {
    this.asignarRelojForm.patchValue({
      dispositivoForm: this.data.relojid,
    })
  }

}
