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
        this.CargarImagen('cabecera');
      }
      if (this.datosEmpresa[0].pie_firma != null) {
        this.CargarImagen('pie');
      }
    });
  }

  // BUSQUEDA DE LOGO DE CABECERA Y PIE DE CORREO
  CargarImagen(tipo: 'cabecera' | 'pie') {
    const servicio = tipo === 'cabecera'
      ? this.restE.ObtenerCabeceraCorreo(this.idEmpresa)
      : this.restE.ObtenerPieCorreo(this.idEmpresa);
    servicio.subscribe({
      next: (res: any) => {
        const sinImagen = res.imagen === 0;
        if (tipo === 'cabecera') {
          this.imagen_default_c = sinImagen;
          this.cabecera = sinImagen ? '' : 'data:image/jpeg;base64,' + res.imagen;
        } else {
          this.imagen_default_p = sinImagen;
          this.pie = sinImagen ? '' : 'data:image/jpeg;base64,' + res.imagen;
        }
      },
      error: (err) => {
        console.error(`Error al obtener imagen de ${tipo}:`, err);
        if (tipo === 'cabecera') {
          this.imagen_default_c = true;
        } else {
          this.imagen_default_p = true;
        }
      }
    });
  }

  // METODO PARA EDITAR LOGO
  EditarLogo(pagina: String) {
    (document.activeElement as HTMLElement)?.blur();
    this.ventana.open(LogosComponent, {
      width: '500px',
      data: { empresa: parseInt(this.idEmpresa), pagina: pagina }
    }).afterClosed()
      .subscribe((res: any) => {
        if (res?.actualizar === true) {
          if (pagina === 'header') {
            this.imagen_default_c = false;
            this.cabecera = '';
            setTimeout(() => this.CargarImagen('cabecera'), 50);
          } else if (pagina === 'footer') {
            this.imagen_default_p = false;
            this.pie = '';
            setTimeout(() => this.CargarImagen('pie'), 50);
          }
        }
      });
  }

  // METODO PARA CONFIGURAR CORREO ELECTRONICO
  ConfigurarCorreoElectronico(info_empresa: any) {
    (document.activeElement as HTMLElement)?.blur();
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

  getConfigurarImagenes() {
    return this.tienePermiso('Configurar Imágenes Correo');
  }

  getConfigurarServidor() {
    return this.tienePermiso('Configurar Servidor Correo');
  }

}
