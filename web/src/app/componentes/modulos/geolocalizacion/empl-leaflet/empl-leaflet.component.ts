import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import * as L from 'leaflet';

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
    private ventana: MatDialogRef<EmplLeafletComponent>
  ) { }

  ngOnInit(): void {
    //this.Geolocalizar();
    this.latitud= -0.1918213;
    this.longitud = -78.4875258;
    this.LeerCoordenadas(this.latitud, this.longitud)
  }

  // METODO PARA CAPTURAR LA UBICACION DEL USUARIO
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
              console.log('ACCESO A LA POSICIÓN DEL USUARIO NO PERMITIDA.');
              break;
            case objPositionError.POSITION_UNAVAILABLE:
              console.log('NO SE HA PODIDO ACCEDER A LA INFORMACIÓN DE SU POSICIÓN.');
              break;
            case objPositionError.TIMEOUT:
              console.log('EL SERVICIO HA TARDADO DEMASIADO TIEMPO EN RESPONDER.');
              break;
            default:
              console.log('ERROR DESCONOCIDO.');
          }
        }, this.options);
    }
    else {
      console.log('SU NAVEGADOR NO SOPORTA LA API DE GEOLOCALIZACIÓN.');
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
      marker.bindPopup('Ubicación domicilio.');
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
