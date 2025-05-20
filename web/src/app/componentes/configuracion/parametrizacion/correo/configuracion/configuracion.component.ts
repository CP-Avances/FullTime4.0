// SECCION DE LIBRERIAS
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

// SECCION DE SERVICICOS
import { EmpresaService } from 'src/app/servicios/configuracion/parametrizacion/catEmpresa/empresa.service';

// SECCION DE COMPONENTES
import { CorreoEmpresaComponent } from 'src/app/componentes/configuracion/parametrizacion/correo/correo-empresa/correo-empresa.component';
import { LogosComponent } from 'src/app/componentes/configuracion/parametrizacion/empresa/logos/logos.component';

@Component({
  selector: 'app-configuracion',
  standalone: false,
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.css']
})

export class ConfiguracionComponent implements OnInit {

  idEmpresa: string;
  datosEmpresa: any = [];

  // IMAGENES
  cabecera: string;
  pie: string;
  imagen_default_c: boolean = true;
  imagen_default_p: boolean = true;

  constructor(
    public restE: EmpresaService,
    public router: Router,
    public ventana: MatDialog,
  ) {
    this.idEmpresa = localStorage.getItem('empresa') as string;
  }

  ngOnInit(): void {
    this.CargarDatosEmpresa();
  }

  // OBTENER DATOS DE EMPRESA
  CargarDatosEmpresa() {
    this.datosEmpresa = [];
    this.restE.ConsultarDatosEmpresa(parseInt(this.idEmpresa)).subscribe(datos => {
      this.datosEmpresa = datos;
      if (this.datosEmpresa[0].cabecera_firma != null) {
        this.ObtenerCabeceraCorreo();
      }
      if (this.datosEmpresa[0].pie_firma != null) {
        this.ObtenerPieCorreo();
      }
    });
  }

  // BUSQUEDA DE LOGO DE CABECERA DE CORREO
  ObtenerCabeceraCorreo() {
    this.restE.ObtenerCabeceraCorreo(this.idEmpresa).subscribe(res => {
      if (res.imagen === 0) {
        this.imagen_default_c = true
      }
      else {
        this.imagen_default_c = false;
        this.cabecera = 'data:image/jpeg;base64,' + res.imagen;
      }
    })
  }

  // BUSQUEDA DE LOGO DE PIE DE FIRMA
  ObtenerPieCorreo() {
    this.restE.ObtenerPieCorreo(this.idEmpresa).subscribe(res => {
      if (res.imagen === 0) {
        this.imagen_default_p = true
      }
      else {
        this.imagen_default_p = false;
        this.pie = 'data:image/jpeg;base64,' + res.imagen;
      }
    })
  }

  // METODO PARA EDITAR LOGO
  EditarLogo(pagina: String) {
    this.ventana.open(LogosComponent, {
      width: '500px',
      data: { empresa: parseInt(this.idEmpresa), pagina: pagina }
    }).afterClosed()
      .subscribe((res: any) => {
        if (res) {
          if (res.actualizar === true) {
            this.ObtenerCabeceraCorreo();
            this.ObtenerPieCorreo();
          }
        }
      })
  }

  // METODO PARA CONFIGURAR CORREO ELECTRONICO
  ConfigurarCorreoElectronico(info_empresa: any) {
    this.ventana.open(CorreoEmpresaComponent, { width: '650px', data: info_empresa }).afterClosed()
      .subscribe(res => {
        if (res) {
          if (res.actualizar === true) {
            this.CargarDatosEmpresa();
          }
        }
      })
  }

  // CONTROL BOTONES
  private tienePermiso(accion: string): boolean {
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      try {
        const datos = JSON.parse(datosRecuperados);
        return datos.some((item: any) => item.accion === accion);
      } catch {
        return false;
      }
    } else {
      // SI NO HAY DATOS, SE PERMITE SI EL ROL ES 1 (ADMIN)
      return parseInt(localStorage.getItem('rol') || '0') === 1;
    }
  }

  getConfigurarImagenes(){
    return this.tienePermiso('Configurar Imágenes Correo');
  }

  getConfigurarServidor(){
    return this.tienePermiso('Configurar Servidor Correo');
  }

}
