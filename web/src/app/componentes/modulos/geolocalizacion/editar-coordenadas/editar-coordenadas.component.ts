// SECCION DE LIBRERIAS
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

// SECCION SERVICIOS
import { EmpleadoUbicacionService } from 'src/app/servicios/empleadoUbicacion/empleado-ubicacion.service';
import { EmplLeafletComponent } from 'src/app/componentes/modulos/geolocalizacion/empl-leaflet/empl-leaflet.component';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';

@Component({
  selector: 'app-editar-coordenadas',
  templateUrl: './editar-coordenadas.component.html',
  styleUrls: ['./editar-coordenadas.component.css']
})

export class EditarCoordenadasComponent implements OnInit {

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
    private toastr: ToastrService,
    private rest: EmpleadoUbicacionService,
    public restP: ParametrosService,
    public ventanas: MatDialog,
    public ventanap: MatDialogRef<EditarCoordenadasComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit(): void {
    this.MostrarDatos();
    this.ConsultarCoordenadas();
    this.BuscarParametro();
  }

  // METODO PARA OBTENER RANGO DE PERIMETRO
  rango: any;
  BuscarParametro() {
    // id_tipo_parametro PARA RANGO DE UBICACION = 22
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

  // METODO PARA CONSULTAR TODAS LAS COORDENDAS REGISTRADAS
  coordenadas: any = [];
  ConsultarCoordenadas() {
    this.rest.ListarCoordenadasEspecificas(this.data.ubicacion.id).subscribe(response => {
      this.coordenadas = response;
    });
  }

  // METODO PARA MOSTRAR DATOS DEL REGISTRO
  MostrarDatos() {
    this.CoordenadasForm.patchValue({
      latitudForm: this.data.ubicacion.latitud,
      longitudForm: this.data.ubicacion.longitud,
      descripcionForm: this.data.ubicacion.descripcion
    })
  }

  // METODO PARA REGISTRAR NUEVO PARÁMETRO
  GuardarDatos(form: any) {
    if (form.latitudForm != '' && form.longitudForm != '') {
      let datos = {
        latitud: form.latitudForm,
        longitud: form.longitudForm,
        descripcion: form.descripcionForm,
        id: this.data.ubicacion.id
      }
      this.rest.ActualizarCoordenadas(datos).subscribe(response => {
        this.toastr.success('Ubicación registrada exitosamente.',
          '', {
          timeOut: 2000,
        })
        this.ventanap.close(this.data.ubicacion.id);
      });
    }
    else {
      this.toastr.error('Por favor ingresar coordenadas de ubicación.',
        'Ups!!! algo salio mal.', {
        timeOut: 2000,
      })
    }
  }

  // METODO PARA VERIFICAR DATOS DE UBICACION
  VerificarDatos(form: any) {
    this.cont = 0;
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

  // METODO PARA COMPARAR COORDENADAS
  cont: number = 0;
  contDuplicado: number = 0;
  CompararCoordenadas(informacion: any, form: any, data: any) {
    this.restP.ObtenerCoordenadas(informacion).subscribe(
      res => {
        if (res[0].verificar === 'ok') {
          this.contDuplicado = this.contDuplicado + 1;
          if (this.contDuplicado === 1) {
            this.toastr.warning('El perímetro ingresado ya se encuentra registrado.',
              'Ups!!! algo salio mal.', {
              timeOut: 4000,
            })
          }
        }
        else {
          this.cont = this.cont + 1;
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

  // METODO PARA LLER COORDENADAS DEL MAPA
  TomarCoordenadasMapa() {
    this.ventanas.open(EmplLeafletComponent, { width: '500px', height: '500px' }).afterClosed()
      .subscribe((res: any) => {
        if (res) {
          if (res.message === true) {
            this.CoordenadasForm.patchValue({
              latitudForm: res.latlng.lat,
              longitudForm: res.latlng.lng,
            })
          }
        }
      });
  }

}
