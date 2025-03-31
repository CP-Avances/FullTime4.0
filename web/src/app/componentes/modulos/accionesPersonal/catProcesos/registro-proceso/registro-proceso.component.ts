import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef } from '@angular/material/dialog';

import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { ProcesoService } from 'src/app/servicios/modulos/modulo-acciones-personal/catProcesos/proceso.service';

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

  ips_locales: any = '';

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // CONTROL DE LOS CAMPOS DEL FORMULARIO
  nombre = new FormControl('', Validators.required);
  procesoPadre = new FormControl('', Validators.required);

  procesos: any = [];

  // ASIGNAR LOS CAMPOS EN UN FORMULARIO EN GRUPO
  public formulario = new FormGroup({
    procesoNombreForm: this.nombre,
    procesoProcesoPadreForm: this.procesoPadre
  });

  constructor(
    private rest: ProcesoService,
    private toastr: ToastrService,
    public ventana: MatDialogRef<RegistroProcesoComponent>,
    public validar: ValidacionesService,
  ) {
  }

  ngOnInit(): void {
    this.Obtenerprocesos();
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');  
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    }); 
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
    console.log('procesoPadreNombre: ',procesoPadreNombre);
    if (procesoPadreNombre == 0) {
      let dataProceso = {
        nombre: form.procesoNombreForm,
        user_name: this.user_name,
        ip: this.ip, ip_local: this.ips_locales
      };
      this.rest.postProcesoRest(dataProceso)
        .subscribe(response => {
          console.log('response: ',response);
          this.toastr.success('Operacion exitosa.', 'Registro guardado.', {
            timeOut: 6000,
          });
          this.LimpiarCampos();
        }, error => { 
          this.toastr.error(error.error.message, 'Registro.', {
            timeOut: 6000,
          });
        });
    } else {
      this.rest.getIdProcesoPadre(procesoPadreNombre).subscribe(data => {
        procesoPadreId = data[0].id;
        let dataProceso = {
          nombre: form.procesoNombreForm,
          proc_padre: procesoPadreId,
          user_name: this.user_name,
          ip: this.ip, ip_local: this.ips_locales
        };
        this.rest.postProcesoRest(dataProceso)
        .subscribe(response => {
          console.log('response: ',response);
          this.toastr.success('Operacion exitosa.', 'Registro guardado.', {
            timeOut: 6000,
          });
          this.LimpiarCampos();
        }, error => { 
          console.log('error.message: ',error.error.message)
          this.toastr.error(error.error.message, 'Registro.', {
            timeOut: 6000,
          });
        });
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
    this.rest.ConsultarProcesos().subscribe(data => {
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
