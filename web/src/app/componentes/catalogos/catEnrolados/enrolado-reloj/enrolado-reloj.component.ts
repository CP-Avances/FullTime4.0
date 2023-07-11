import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';


import { EnroladosRelojesService } from 'src/app/servicios/enroladosRelojes/enrolados-relojes.service';
import { RelojesService } from 'src/app/servicios/catalogos/catRelojes/relojes.service';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-enrolado-reloj',
  templateUrl: './enrolado-reloj.component.html',
  styleUrls: ['./enrolado-reloj.component.css'],
})

export class EnroladoRelojComponent implements OnInit {

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
    private router: Router,
    public dialogRef: MatDialogRef<EnroladoRelojComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.ObtenerDispositios();
  }

 
  LimpiarCampos() {
    this.asignarRelojForm.reset();
    this.ObtenerDispositios();
  }

  CerrarVentanaAsignarReloj() {
    this.LimpiarCampos();
    this.dialogRef.close();
    window.location.reload();
  }

  ObtenerDispositios() {
    this.dispositivos = [];
    this.restR.ConsultarRelojes().subscribe(datos => {
      this.dispositivos = datos;
      this.dispositivos[this.dispositivos.length] = { nombre: "Seleccionar" };
      this.seleccionarDispositivo = this.dispositivos[this.dispositivos.length - 1].nombre;
    })
  }

  InsertarEnroladoReloj(form, id) {
    this.habilitarprogress = true;
    var idEnrolado = this.data.datosEnrolado.id;
    var nombreReloj = form.dispositivoForm;
    var buscarReloj = {
      id_reloj: nombreReloj,
      id_enrolado: idEnrolado
    }
    this.enroladoReloj = [];
    this.rest.BuscarIdReloj(buscarReloj).subscribe(datos => {
      this.habilitarprogress = false;
      this.enroladoReloj = datos;
      this.toastr.info('Se le recuerda que el empleado enrolado ya esta agregado a este dispositivo','', {
        timeOut: 6000,
      })
      this.LimpiarCampos();
    }, error => {
      this.habilitarprogress = false;
      this.rest.CrearEnroladoReloj(buscarReloj).subscribe(response => {
        this.toastr.success('Operación exitosa.', 'Empleado enrolado agregado al dispositivo', {
          timeOut: 6000,
        });
        this.actualizarPagina = this.data.actualizar;
        if (this.actualizarPagina === true) {
          this.LimpiarCampos();
        }
        else {
          this.dialogRef.close();
          this.router.navigate(['/enroladoDispositivo/', id]);
        }
        this.habilitarprogress = false;
      }, error => {
        this.toastr.error('Ups!!! algo salio mal.', 'Empleado enrolado no fue agregado al dispositivo', {
          timeOut: 6000,
        });
        this.habilitarprogress = false;
      });
    });
  }

}
