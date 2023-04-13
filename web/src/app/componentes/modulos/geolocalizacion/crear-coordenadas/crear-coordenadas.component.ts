// SECCIÓN DE LIBRERIAS
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

// SECCIÓN SERVICIOS
import { EmplLeafletComponent } from 'src/app/componentes/modulos/geolocalizacion/empl-leaflet/empl-leaflet.component';
import { EmpleadoUbicacionService } from 'src/app/servicios/empleadoUbicacion/empleado-ubicacion.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';

@Component({
  selector: 'app-crear-coordenadas',
  templateUrl: './crear-coordenadas.component.html',
  styleUrls: ['./crear-coordenadas.component.css']
})

export class CrearCoordenadasComponent implements OnInit {

  // CONTROL DE LOS CAMPOS DEL FORMULARIO
  latitud = new FormControl('', Validators.required);
  longitud = new FormControl('', Validators.required);
  descripcion = new FormControl('', Validators.required);

  // ASIGNAR LOS CAMPOS EN UN FORMULARIO EN GRUPO
  public CoordenadasForm = new FormGroup({
    latitudForm: this.latitud,
    longitudForm: this.longitud,
    descripcionForm: this.descripcion
  });

  constructor(
    private rest: EmpleadoUbicacionService,
    private toastr: ToastrService,
    public ventanap: MatDialogRef<CrearCoordenadasComponent>,
    public ventanas: MatDialog,
    public restP: ParametrosService,
  ) { }

  ngOnInit(): void {
    this.ConsultarCoordenadas();
    this.BuscarParametro();
  }

  // METODO PARA OBTENER RANGO DE PERÍMETRO
  rango: any;
  BuscarParametro() {
    // id_tipo_parametro PARA RANGO DE UBICACIÓN = 22
    let datos: any = [];
    this.restP.ListarDetalleParametros(22).subscribe(
      res => {
        datos = res;
        if (datos.length != 0) {
          this.rango = ((parseInt(datos[0].descripcion) * (0.0048)) / 500)
        }
        else {
          this.rango = 0.00
        }
      });
  }

  // METODO PARA REGISTRAR NUEVO PARÁMETRO
  GuardarDatos(form: any) {
    if (form.latitudForm != '' && form.longitudForm != '') {
      let datos = {
        latitud: form.latitudForm,
        longitud: form.longitudForm,
        descripcion: form.descripcionForm,
      }
      this.rest.RegistrarCoordenadas(datos).subscribe(response => {
        this.toastr.success('Ubicación registrada exitosamente.',
          '', {
          timeOut: 2000,
        })
        this.CerrarVentana();
      });

    }
    else {
      this.toastr.error('Por favor ingresar coordenadas de ubicación.',
        '', {
        timeOut: 2000,
      })
    }

  }

  coordenadas: any = [];
  ConsultarCoordenadas() {
    this.rest.ListarCoordenadas().subscribe(response => {
      this.coordenadas = response;
    });
  }

  VerificarDatos(form) {
    this.cont = 0;
    this.contDuplicado = 0;
    if (this.coordenadas.length != 0) {
      let informacion = {
        lat1: form.latitudForm,
        lng1: form.longitudForm,
        lat2: '',
        lng2: '',
        valor: this.rango
      }
      this.coordenadas.forEach((obj: any) => {
        informacion.lat2 = obj.latitud;
        informacion.lng2 = obj.longitud;
        this.CompararCoordenadas(informacion, form, this.coordenadas);
      })
    }
    else {
      this.GuardarDatos(form)
    }
  }

  contDuplicado: number = 0;
  cont: number = 0;
  CompararCoordenadas(informacion: any, form: any, data: any) {
    this.restP.ObtenerCoordenadas(informacion).subscribe(
      res => {
        if (res[0].verificar === 'ok') {
          this.contDuplicado = this.contDuplicado + 1;
          if (this.contDuplicado === 1) {
            this.toastr.info('El perímetro ingresado ya se encuentra registrado.',
              'VERIFICAR LA INFORMACIÓN.', {
              timeOut: 4000,
            })
          }
        }
        else {
          this.cont = this.cont + 1;
          console.log('ver contador', this.cont + '  ' + data.length)
          if (this.cont === data.length) {
            this.GuardarDatos(form)
          }
        }
      });
  }

  // METODO PARA CERRAR VENTANA
  CerrarVentana() {
    this.ventanap.close();
  }

  TomarCoordenadasMapa() {
    this.ventanas.open(EmplLeafletComponent, { width: '500px', height: '500px' }).afterClosed().subscribe((res: any) => {
      console.log(res);
      if (res.message === true) {
        if (res.latlng != undefined) {
          this.CoordenadasForm.patchValue({
            latitudForm: res.latlng.lat,
            longitudForm: res.latlng.lng,
          })
        }
      }
    });
  }

}
