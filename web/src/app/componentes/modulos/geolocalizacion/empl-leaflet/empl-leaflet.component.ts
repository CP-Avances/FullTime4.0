import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import * as L from 'leaflet';
import { ToastrService } from 'ngx-toastr';

import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';

@Component({
  selector: 'app-empl-leaflet',
  templateUrl: './empl-leaflet.component.html',
  styleUrls: ['./empl-leaflet.component.css']
})

export class EmplLeafletComponent implements OnInit {

  COORDS: any;
  MARKER: any;

  // METODO DE CONTROL DE MEMORIA
  private options = {
    enableHighAccuracy: false,
    maximumAge: 30000,
    timeout: 15000
  };

  // VARIABLES DE ALMACENAMIENTO DE COORDENADAS
  latitud: number;
  longitud: number;

  constructor(
    private ventana: MatDialogRef<EmplLeafletComponent>,
    private toastr: ToastrService,
    public restP: ParametrosService,
  ) { }

  ngOnInit(): void {
    this.BuscarParametroCertificado()
  }

  // METODO PARA VERIFICAR USO DE CERTIFICADOS DE SEGURIDAD
  BuscarParametroCertificado() {
    // id_tipo_parametro PARA VERIFICAR USO SSL = 7
    let datos: any = [];
    this.restP.ListarDetalleParametros(7).subscribe(
      res => {
        datos = res;
        if (datos.length != 0) {
          if (datos[0].descripcion === 'Si') {
            this.Geolocalizar();
          }
          else {
            this.toastr.warning(
              'Es necesario el uso de CERTIFICADO DE SEGURIDAD (SSL) para ver el mapa.', 'Ups!!! algo salio mal.', {
              timeOut: 6000,
            })
            //this.Salir();
            // SOLO PARA DESARROLLO
            this.Geolocalizar();
          }
        }
      });
  }

  // METODO PARA TOMAR COORDENAS DE UBICACION
  Geolocalizar() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (objPosition) => {
          this.latitud = objPosition.coords.latitude;
          this.longitud = objPosition.coords.longitude;
          this.LeerCoordenadas(this.latitud, this.longitud)
        }, (objPositionError) => {
          switch (objPositionError.code) {
            case objPositionError.PERMISSION_DENIED:
              this.toastr.info(
                'No se ha permitido el acceso a la posición del usuario.', '', {
                timeOut: 6000,
              })
              this.Salir();
              break;
            case objPositionError.POSITION_UNAVAILABLE:
              this.toastr.info(
                'No se ha podido acceder a la información de su posición.', '', {
                timeOut: 6000,
              })
              this.Salir();
              break;
            case objPositionError.TIMEOUT:
              this.toastr.info(
                'El servicio ha tardado demasiado tiempo en responder.', '', {
                timeOut: 6000,
              })
              this.Salir();
              break;
            default:
              this.toastr.warning(
                'Ups!!! algo salio mal.', 'Volver a intentar.', {
                timeOut: 6000,
              })
              this.Salir();
          }
        }, this.options);
    }
    else {
      this.toastr.warning(
        'Ups!!! algo salio mal.', 'Su navegador no soporta la API de geolocalización.', {
        timeOut: 6000,
      })
      this.Salir();
    }
  }

  // METODO PARA LEER COORDENADAS
  LeerCoordenadas(latitud: number, longitud: number) {
    const map = L.map('map-template', {
      center: [latitud, longitud],
      zoom: 13
    });
    map.locate({ enableHighAccuracy: true })
    map.on('click', (e: any) => {
      const coords: any = [e.latlng.lat, e.latlng.lng];
      const marker = L.marker(coords);
      if (this.COORDS !== undefined) {
        map.removeLayer(this.MARKER);
      } else {
        marker.setLatLng(coords);
      }
      marker.bindPopup('COORDENADAS UBICACION');
      map.addLayer(marker)
      this.COORDS = e.latlng;
      this.MARKER = marker
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>' }).addTo(map);
  }

  // METODO PARA GUARDAR UBICACION
  GuardarLocalizacion() {
    this.ventana.close({ message: true, latlng: this.COORDS })
  }

  // NETODO PARA CERRAR VENTANA DE REGISTRO
  Salir() {
    this.ventana.close({ message: false })
  }

}
