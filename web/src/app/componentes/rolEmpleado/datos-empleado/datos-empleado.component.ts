import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import * as xlsx from 'xlsx';
import * as xml2js from 'xml2js';
import * as moment from 'moment';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
import * as FileSaver from 'file-saver';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { DiscapacidadService } from 'src/app/servicios/discapacidad/discapacidad.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { VacunacionService } from 'src/app/servicios/empleado/empleadoVacunas/vacunacion.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { TituloService } from 'src/app/servicios/catalogos/catTitulos/titulo.service';
import { ScriptService } from 'src/app/servicios/empleado/script.service';

import { CambiarContrasenaComponent } from 'src/app/componentes/iniciarSesion/contrasenia/cambiar-contrasena/cambiar-contrasena.component';
import { TituloEmpleadoComponent } from '../../empleado/titulos/titulo-empleado/titulo-empleado.component';
import { EditarTituloComponent } from '../../empleado/titulos/editar-titulo/editar-titulo.component';
import { DiscapacidadComponent } from '../../empleado/discapacidad/discapacidad.component';
import { EditarVacunaComponent } from '../../empleado/vacunacion/editar-vacuna/editar-vacuna.component';
import { CrearVacunaComponent } from '../../empleado/vacunacion/crear-vacuna/crear-vacuna.component';
import { MetodosComponent } from '../../administracionGeneral/metodoEliminar/metodos.component';
import { EmplCargosService } from 'src/app/servicios/empleado/empleadoCargo/empl-cargos.service';

@Component({
  selector: 'app-datos-empleado',
  templateUrl: './datos-empleado.component.html',
  styleUrls: ['./datos-empleado.component.css']
})

export class DatosEmpleadoComponent implements OnInit {

  empleadoUno: any = [];
  tituloEmpleado: any = [];
  discapacidadUser: any = [];
  contratoEmpleado: any = [];
  empresa: string = '';

  // VARIABLES DE ALMACENAMIENTO DE DATOS DE BOTONES
  idEmpleado: string = ''; // VARIABLE DE ALMACENAMIENTO DE ID DE EMPLEADO SELECCIONADO PARA VER DATOS
  btnTitulo = 'Añadir';
  btnDisc = 'Añadir';
  editar: string = '';

  // ITEMS DE PAGINACION DE LA TABLA
  numero_pagina: number = 1;
  tamanio_pagina: number = 5;
  pageSizeOptions = [5, 10, 20, 50];

  hipervinculo: string = (localStorage.getItem('empresaURL') as string); // VARIABLE DE MANEJO DE RUTAS CON URL

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;


  constructor(
    public restDiscapacidad: DiscapacidadService,
    public restEmpleado: EmpleadoService,
    public informacion: DatosGeneralesService,
    public restTitulo: TituloService,
    public restVacuna: VacunacionService,
    public restEmpre: EmpresaService,
    public parametro: ParametrosService,
    public restCargo: EmplCargosService,
    public ventana: MatDialog,
    public validar: ValidacionesService,
    public router: Router,
    private scriptService: ScriptService,
    private toastr: ToastrService,
  ) {
    var item = localStorage.getItem('empleado');
    if (item) {
      this.idEmpleado = item;
    }

    var empre = localStorage.getItem('empresa');
    if (empre) {
      this.empresa = empre;
    }
    this.scriptService.load('pdfMake', 'vfsFonts');
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

    this.ObtenerLogo();
    this.ObtenerColores();
    this.BuscarParametro();
    this.ObtenerNacionalidades()
    this.ObtenerTituloEmpleado();
    this.ObtenerDiscapacidadEmpleado();
  }

  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** **
   ** **************************************************************************************** **/

  formato_fecha: string = 'DD/MM/YYYY';
  formato_hora: string = 'HH:mm:ss';

  // METODO PARA BUSCAR PARAMETRO DE FORMATO DE FECHA
  BuscarParametro() {
    // id_tipo_parametro Formato fecha = 1
    this.parametro.ListarDetalleParametros(1).subscribe(
      res => {
        this.formato_fecha = res[0].descripcion;
        this.LlamarMetodos(this.formato_fecha);
      },
      vacio => {
        this.LlamarMetodos(this.formato_fecha);
      });
  }

  // LLAMAR METODOS DE PRESENTACION DE INFORMACION
  LlamarMetodos(formato_fecha: string) {
    this.VerDatosActuales(formato_fecha);
    this.VerEmpleado(formato_fecha);
    this.ObtenerDatosVacunas(formato_fecha);
  }

  /** ********************************************************************************************* **
   ** **                            METODO GENERALES DE CONSULTAS                                ** **                                           *
   ** ********************************************************************************************* **/

  // BUSQUEDA DE DATOS ACTUALES DEL USUARIO
  datoActual: any = [];
  VerDatosActuales(formato_fecha: string) {
    this.datoActual = [];
    this.informacion.ObtenerDatosActuales(parseInt(this.idEmpleado)).subscribe((res: any) => {
      this.datoActual = res[0];
      // LLAMADO A DATOS DE USUARIO
      this.ObtenerContratoEmpleado(this.datoActual.id_contrato, formato_fecha);
      this.ObtenerCargoEmpleado(this.datoActual.id_cargo, formato_fecha);
    }, vacio => {
      this.BuscarContratoActual(formato_fecha);
    });
  }

  // METODO PARA OBTENER EL LOGO DE LA EMPRESA
  logoE: any = String;

  ObtenerLogo() {
    this.restEmpre.LogoEmpresaImagenBase64(this.empresa).subscribe(res => {
      this.logoE = 'data:image/jpeg;base64,' + res.imagen;
    });
  }

  // METODO PARA OBTENER COLORES Y MARCA DE AGUA DE EMPRESA
  p_color: any;
  s_color: any;
  frase: any;
  ObtenerColores() {
    this.restEmpre.ConsultarDatosEmpresa(parseInt(this.empresa)).subscribe((res: any) => {
      this.p_color = res[0].color_principal;
      this.s_color = res[0].color_secundario;
      this.frase = res[0].marca_agua;
    });
  }

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // VENTANA PARA REALIZAR CAMBIO DE CONTRASEÑA
  CambiarContrasena(): void {
    console.log(this.idEmpleado);
    this.ventana.open(CambiarContrasenaComponent, { width: '350px', data: this.idEmpleado }).disableClose = true;
  }

  /** ********************************************************************************************* **
   ** **                      METODO PARA MOSTRAR DATOS PERFIL DE USUARIO                        ** **                                           *
   ** ********************************************************************************************* **/

  // METODO PARA VER LA INFORMACIÓN DEL USUARIO
  urlImagen: any;
  iniciales: any;
  mostrarImagen: boolean = false;
  textoBoton: string = 'Subir foto';
  imagenEmpleado: any;
  VerEmpleado(formato_fecha: string) {
    this.empleadoUno = [];
    this.restEmpleado.BuscarUnEmpleado(parseInt(this.idEmpleado)).subscribe(data => {
      this.empleadoUno = data;
      this.empleadoUno[0].fec_nacimiento_ = this.validar.FormatearFecha(this.empleadoUno[0].fecha_nacimiento, formato_fecha, this.validar.dia_abreviado);
      var empleado = data[0].nombre + data[0].apellido;
      if (data[0]['imagen'] != null) {
        this.urlImagen = `${(localStorage.getItem('empresaURL') as string)}/empleado/img/` + data[0].id + '/' + data[0].imagen;
        console.log('url empleado ', this.urlImagen)
        this.restEmpleado.obtenerImagen(data[0].id, data[0].imagen).subscribe(data => {
          if (data.imagen != 0) {
            this.imagenEmpleado = 'data:image/jpeg;base64,' + data.imagen;
          }
          else {
            this.ImagenLocalUsuario("assets/imagenes/user.png").then(
              (result) => (this.imagenEmpleado = result)
            );
          }
        });
        this.mostrarImagen = true;
        this.textoBoton = 'Editar foto';
      } else {
        this.iniciales = data[0].nombre.split(" ")[0].slice(0, 1) + data[0].apellido.split(" ")[0].slice(0, 1);
        this.mostrarImagen = false;
        this.textoBoton = 'Subir foto';
        this.ImagenLocalUsuario("assets/imagenes/user.png").then(
          (result) => (this.imagenEmpleado = result)
        );
      }
      this.MapGeolocalizar(data[0].latitud, data[0].longitud, empleado);
    })
  }

  // METODO PARA MOSTRAR IMAGEN EN PDF
  ImagenLocalUsuario(localPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      let canvas = document.createElement('canvas');
      let img = new Image();
      img.onload = () => {
        canvas.height = img.height;
        canvas.width = img.width;
        const context = canvas.getContext("2d")!;
        context.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      }
      img.onerror = () => reject('Imagen no disponible')
      img.src = localPath;
    });
  }

  // METODO PARA VER UBICACION EN EL MAPA
  MARKER: any;
  MAP: any;
  MapGeolocalizar(latitud: number, longitud: number, empleado: string) {
    let zoom = 19;
    if (latitud === null && longitud === null) {
      latitud = -0.1918213;
      longitud = -78.4875258;
      zoom = 7
    }

    if (this.MAP) {
      this.MAP = this.MAP.remove();
    }

    this.MAP = L.map('geolocalizacion', {
      center: [latitud, longitud],
      zoom: zoom
    });
    const marker = L.marker([latitud, longitud]);
    if (this.MARKER !== undefined) {
      this.MAP.removeLayer(this.MARKER);
    }
    else {
      marker.setLatLng([latitud, longitud]);
    }
    marker.bindPopup(empleado);
    this.MAP.addLayer(marker);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>' }).addTo(this.MAP);
    this.MARKER = marker;
  }

  /** ********************************************************************************************* **
   ** **                            PARA LA SUBIR LA IMAGEN DEL EMPLEADO                         ** **                                 *
   ** ********************************************************************************************* **/

  nameFile: string = '';
  archivoSubido: Array<File> = [];
  archivoForm = new FormControl('');
  FileChange(element: any) {
    this.archivoSubido = element.target.files;
    var detalle = this.archivoSubido[0].name;
    let arrayItems = detalle.split(".");
    let itemExtencion = arrayItems[arrayItems.length - 1];
    // VALIDAR FORMATO PERMITIDO DE ARCHIVO
    if (itemExtencion == 'png' || itemExtencion == 'jpg' || itemExtencion == 'jpeg') {
      // VALIDAR PESO DE IMAGEN
      if (this.archivoSubido.length != 0) {
        if (this.archivoSubido[0].size <= 2e+6) {
          this.SubirPlantilla();
        }
        else {
          this.toastr.info('El archivo ha excedido el tamaño permitido.',
            'Tamaño de archivos permitido máximo 2MB.', {
            timeOut: 6000,
          });
        }
      }
    }
    else {
      this.toastr.info(
        'Formatos permitidos .png, .jpg, .jpeg', 'Formato de imagen no permitido.', {
        timeOut: 6000,
      });
    }
  }

  SubirPlantilla() {
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      console.log(this.archivoSubido[i], this.archivoSubido[i].name)
      formData.append("image", this.archivoSubido[i], this.archivoSubido[i].name);
    }

    formData.append('user_name', this.user_name as string);
    formData.append('ip', this.ip as string);

    this.restEmpleado.SubirImagen(formData, parseInt(this.idEmpleado)).subscribe(res => {
      this.toastr.success('Operación exitosa.', 'Imagen registrada.', {
        timeOut: 6000,
      });
      this.VerEmpleado(this.formato_fecha);
      this.archivoForm.reset();
      this.nameFile = '';
      this.ResetDataMain();
    }, error => {
        this.toastr.info('Verifique que este usuario tenga creadas capetas', 'No se ha podido cargar el archivo.', {
        timeOut: 6000,
      });

    });
  }

  ResetDataMain() {
    localStorage.removeItem('fullname');
    localStorage.removeItem('correo');
    localStorage.removeItem('iniciales');
    localStorage.removeItem('view_imagen');
  }

  /** ********************************************************************************************* **
   ** **                   BUSQUEDA DE DATOS DE ASIGNACIONES: TITULOS                            ** **                        *
   ** ********************************************************************************************* **/

  // BUSQUEDA DE TITULOS
  ObtenerTituloEmpleado() {
    this.tituloEmpleado = [];
    this.restEmpleado.BuscarTituloUsuario(parseInt(this.idEmpleado)).subscribe(data => {
      this.tituloEmpleado = data;
    });
  }

  // REGISTRAR NUEVO TITULO
  AbrirVentanaRegistarTituloEmpleado() {
    this.ventana.open(TituloEmpleadoComponent, { data: this.idEmpleado, width: '400px' })
      .afterClosed().subscribe(result => {
        if (result) {
          this.ObtenerTituloEmpleado();
        }
      })
  }

  // EDITAR UN TITULO
  AbrirVentanaEditarTitulo(dataTitulo: any) {
    this.ventana.open(EditarTituloComponent, { data: dataTitulo, width: '400px' })
      .afterClosed().subscribe(result => {
        if (result) {
          this.ObtenerTituloEmpleado();
        }
      })
  }

  // ELIMINAR REGISTRO DE TITULO
  EliminarTituloEmpleado(id: number) {
    const datos = {
      user_name: this.user_name,
      ip: this.ip,
    };
    this.restEmpleado.EliminarTitulo(id, datos).subscribe(res => {
      this.ObtenerTituloEmpleado();
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  ConfirmarDeleteTitulo(id: number) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarTituloEmpleado(id);
        } else {
          this.router.navigate(['/datosEmpleado']);

        }
      });
  }


  /** ********************************************************************************************* **
   ** **               BUSQUEDA DE DATOS DE ASIGNACIONES: DISCAPACIDAD                           ** **                        *
   ** ********************************************************************************************* **/

  // METODO PARA OBTENER DATOS DE DISCAPACIDAD
  ObtenerDiscapacidadEmpleado() {
    this.discapacidadUser = [];
    this.restDiscapacidad.BuscarDiscapacidadUsuario(parseInt(this.idEmpleado)).subscribe(data => {
      this.discapacidadUser = data;
      this.HabilitarBtn();
    });
  }

  // ELIMINAR REGISTRO DE DISCAPACIDAD
  EliminarDiscapacidad(id_discapacidad: number) {
    const datos = {
      user_name: this.user_name,
      ip: this.ip,
    };

    this.restDiscapacidad.EliminarDiscapacidad(id_discapacidad, datos).subscribe(res => {
      this.ObtenerDiscapacidadEmpleado();
      this.btnDisc = 'Añadir';
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
    })
  };

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  ConfirmarDeleteDiscapacidad(id: number) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarDiscapacidad(id);
        } else {
          this.router.navigate(['/datosEmpleado']);
        }
      });
  }

  // REGISTRAR DISCAPACIDAD
  AbrirVentanaDiscapacidad(proceso: string) {
    this.ventana.open(DiscapacidadComponent, {
      data: { idEmpleado: this.idEmpleado, metodo: proceso }, width: '360px'
    })
      .afterClosed().subscribe(result => {
        this.ObtenerDiscapacidadEmpleado();
      })
  }

  // HABILITAR BOTONES DE EDICION
  HabilitarBtn() {
    if (this.discapacidadUser.length != 0) {
      this.btnDisc = 'Editar';
    }
    else {
      this.btnDisc = 'Añadir';
    }
  }

  // LÓGICA DE BOTÓN PARA MOSTRAR COMPONENTE DEL REGISTRO DE DISCAPACIDAD
  MostrarDis() {
    if (this.discapacidadUser.length != 0) {
      this.AbrirVentanaDiscapacidad('editar');
    }
    else {
      this.AbrirVentanaDiscapacidad('registrar');
    }
  }

  /** ********************************************************************************************* **
   ** **                          BUSQUEDA DE DATOS DE VACUNACIÓN                                ** **                        *
   ** ********************************************************************************************* **/

  // METODO PARA CONSULTAR DATOS DE REGISTRO DE VACUNACIÓN
  datosVacuna: any = [];
  ObtenerDatosVacunas(formato_fecha: string) {
    this.datosVacuna = [];
    this.restVacuna.ObtenerVacunaEmpleado(parseInt(this.idEmpleado)).subscribe(data => {
      this.datosVacuna = data;

      this.datosVacuna.forEach((data: any) => {
        data.fecha_ = this.validar.FormatearFecha(data.fecha, formato_fecha, this.validar.dia_abreviado);
      })
    });
  }

  // EDITAR REGISTRO DE VACUNA
  AbrirVentanaEditar(datos: any) {
    this.ventana.open(EditarVacunaComponent, {
      data: { idEmpleado: this.idEmpleado, vacuna: datos }, width: '600px'
    })
      .afterClosed().subscribe(result => {
        this.ObtenerDatosVacunas(this.formato_fecha);
      })
  }

  // LÓGICA DE BOTÓN PARA MOSTRAR COMPONENTE DEL REGISTRO DE VACUNACION
  MostrarVentanaVacuna() {
    this.ventana.open(CrearVacunaComponent, {
      data: { idEmpleado: this.idEmpleado }, width: '600px'
    })
      .afterClosed().subscribe(result => {
        this.ObtenerDatosVacunas(this.formato_fecha);
      })
  }

  // ELIMINAR REGISTRO DE VACUNA
  EliminarVacuna(datos: any) {
    const data = {
      user_name: this.user_name,
      ip: this.ip,
    };

    this.restVacuna.EliminarRegistroVacuna(datos.id, datos.carnet, data).subscribe(res => {
      this.ObtenerDatosVacunas(this.formato_fecha);
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  ConfirmarEliminarVacuna(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarVacuna(datos);
        } else {
          this.router.navigate(['/datosEmpleado']);
        }
      });
  }


  /** ******************************************************************************************** **
   ** **                    METODOS PARA MENEJO DE DATOS DE CONTRATO                            ** **
   ** ******************************************************************************************** **/

  // METODO PARA OBTENER ULTIMO CONTRATO
  BuscarContratoActual(formato_fecha: string) {
    this.restEmpleado.BuscarIDContratoActual(parseInt(this.idEmpleado)).subscribe((datos: any) => {
      this.datoActual.id_contrato = datos[0].max;
      this.ObtenerContratoEmpleado(this.datoActual.id_contrato, formato_fecha);
    });
  }

  // METODO PARA OBTENER EL CONTRATO DE UN EMPLEADO CON SU RESPECTIVO REGIMEN LABORAL
  ObtenerContratoEmpleado(id_contrato: number, formato_fecha: string) {
    this.restEmpleado.BuscarDatosContrato(id_contrato).subscribe(res => {
      this.contratoEmpleado = res;
      this.contratoEmpleado.forEach((data: any) => {
        data.fec_ingreso_ = this.validar.FormatearFecha(data.fecha_ingreso, formato_fecha, this.validar.dia_abreviado);
        data.fec_salida_ = this.validar.FormatearFecha(data.fecha_salida, formato_fecha, this.validar.dia_abreviado);
      })
    });
  }

  /** ** ***************************************************************************************** **
   ** ** **                  METODOS PARA MANEJO DE DATOS DE CARGO                              ** **
   ** ******************************************************************************************** **/


  // METODO PARA OBTENER LOS DATOS DEL CARGO DEL EMPLEADO
  cargoEmpleado: any = [];
  ObtenerCargoEmpleado(id_cargo: number, formato_fecha: string) {
    this.cargoEmpleado = [];
    this.restCargo.BuscarCargoID(id_cargo).subscribe(datos => {
      this.cargoEmpleado = datos;
      this.cargoEmpleado.forEach((data: any) => {
        data.fec_inicio_ = this.validar.FormatearFecha(data.fecha_inicio, formato_fecha, this.validar.dia_abreviado);
        data.fec_final_ = this.validar.FormatearFecha(data.fecha_final, formato_fecha, this.validar.dia_abreviado);
      })
    });
  }

  /** ****************************************************************************************** **
   ** **                               PARA LA GENERACION DE PDFs                             ** **                                           *
   ** ****************************************************************************************** **/

  GenerarPdf(action = 'open') {
    const documentDefinition = this.GetDocumentDefinicion();
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  GetDocumentDefinicion() {
    let estadoCivil = this.EstadoCivilSelect[this.empleadoUno[0].estado_civil - 1];
    let genero = this.GeneroSelect[this.empleadoUno[0].genero - 1];
    let estado = this.EstadoSelect[this.empleadoUno[0].estado - 1];
    let nacionalidad: any;
    this.nacionalidades.forEach((element: any) => {
      if (this.empleadoUno[0].id_nacionalidad == element.id) {
        nacionalidad = element.nombre;
      }
    });
    sessionStorage.setItem('profile', this.empleadoUno);
    return {
      // ENCABEZADO DE LA PAGINA
      pageOrientation: 'portrait',
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleadoUno[0].nombre + ' ' + this.empleadoUno[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },
      // PIE DE PAGINA
      footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
        var f = moment();
        fecha = f.format('YYYY-MM-DD');
        hora = f.format('HH:mm:ss');
        return {
          margin: 10,
          columns: [
            { text: 'Fecha: ' + fecha + ' Hora: ' + hora, opacity: 0.3 },
            {
              text: [
                {
                  text: '© Pag ' + currentPage.toString() + ' of ' + pageCount,
                  alignment: 'right', opacity: 0.3
                }
              ],
            }
          ], fontSize: 10
        }
      },
      content: [
        { image: this.logoE, width: 150, margin: [10, -30, 0, 5] },
        {
          text: this.empleadoUno[0].nombre + ' ' + this.empleadoUno[0].apellido,
          bold: true, fontSize: 14,
          alignment: 'left',
          margin: [0, 15, 0, 18]
        },
        {
          columns: [
            [
              { image: this.imagenEmpleado, width: 120, margin: [10, -10, 0, 5] },
            ],
            [
              { text: 'Cédula: ' + this.empleadoUno[0].cedula, style: 'item' },
              { text: 'Nacionalidad: ' + nacionalidad, style: 'item' },
              { text: 'Fecha Nacimiento: ' + this.empleadoUno[0].fec_nacimiento_, style: 'item' },
              { text: 'Estado civil: ' + estadoCivil, style: 'item' },
              { text: 'Género: ' + genero, style: 'item' },
            ],
            [
              { text: 'Código: ' + this.empleadoUno[0].codigo, style: 'item' },
              { text: 'Estado: ' + estado, style: 'item' },
              { text: 'Domicilio: ' + this.empleadoUno[0].domicilio, style: 'item' },
              { text: 'Correo: ' + this.empleadoUno[0].correo, style: 'item' },
              { text: 'Teléfono: ' + this.empleadoUno[0].telefono, style: 'item' },
            ],
          ]
        },
        { text: (this.discapacidadUser.length > 0 ? 'DISCAPACIDAD' : ''), style: 'header' },
        this.PresentarDataPDFdiscapacidadEmpleado(),
        { text: (this.tituloEmpleado.length > 0 ? 'TÍTULOS' : ''), style: 'header' },
        this.PresentarDataPDFtitulosEmpleado(),
        { text: 'CONTRATO', style: 'header' },
        this.PresentarDataPDFcontratoEmpleado(),
        { text: 'CARGO', style: 'header' },
        this.PresentarDataPDFcargoEmpleado(),
      ],
      info: {
        title: this.empleadoUno[0].nombre + ' ' + this.empleadoUno[0].apellido + '_PERFIL',
        author: this.empleadoUno[0].nombre + ' ' + this.empleadoUno[0].apellido,
        subject: 'Perfil',
        keywords: 'Perfil, Empleado',
      },
      styles: {
        header: { fontSize: 12, bold: true, margin: [0, 20, 0, 10] },
        name: { fontSize: 12, bold: true },
        item: { fontSize: 11, bold: false },
        tableHeader: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color },
        tableCell: { fontSize: 11, alignment: 'center', },
      }
    };
  }

  PresentarDataPDFtitulosEmpleado() {
    if (this.tituloEmpleado.length > 0) {
      return {
        table: {
          widths: ['*', '*'],
          body: [
            [
              { text: 'NOMBRE', style: 'tableHeader' },
              { text: 'NIVEL', style: 'tableHeader' }
            ],
            ...this.tituloEmpleado.map((obj: any) => {
              return [{ text: obj.nombre, style: 'tableCell' }, { text: obj.nivel, style: 'tableCell' }];
            })
          ]
        }
      };
    }

  }

  PresentarDataPDFcontratoEmpleado() {

    return {
      table: {
        widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto'],
        body: [
          [
            { text: 'RÉGIMEN', style: 'tableHeader' },
            { text: 'FECHA DESDE', style: 'tableHeader' },
            { text: 'FECHA HASTA', style: 'tableHeader' },
            { text: 'MODALIDAD LABORAL', style: 'tableHeader' },
            { text: 'CONTROL ASISTENCIA', style: 'tableHeader' },
            { text: 'CONTROL VACACIONES', style: 'tableHeader' },
          ],
          ...this.contratoEmpleado.map(contrato => {
            return [
              { text: contrato.descripcion, style: 'tableCell' },
              { text: contrato.fec_ingreso_, style: 'tableCell' },
              { text: contrato.fecha_salida === null ? 'Sin fecha' : contrato.fec_salida_, style: 'tableCell' },
              { text: contrato.nombre_contrato, style: 'tableCell' },
              { text: contrato.controlar_asistencia ? 'Si' : 'No', style: 'tableCell' },
              { text: contrato.controlar_vacacion ? 'Si' : 'No', style: 'tableCell' },
            ];
          }),
        ],
      },
    };
  }

  PresentarDataPDFcargoEmpleado() {
    return {
      table: {
        widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
        body: [
          [
            { text: 'SUCURSAL', style: 'tableHeader' },
            { text: 'DEPARTAMENTO', style: 'tableHeader' },
            { text: 'CARGO', style: 'tableHeader' },
            { text: 'FECHA DESDE', style: 'tableHeader' },
            { text: 'FECHA HASTA', style: 'tableHeader' },
            { text: 'HORAS TRABAJO', style: 'tableHeader' },
            { text: 'SUELDO', style: 'tableHeader' },
          ],
          ...this.cargoEmpleado.map(cargo => {
            return [
              { text: cargo.sucursal, style: 'tableCell' },
              { text: cargo.departamento, style: 'tableCell' },
              { text: cargo.nombre_cargo, style: 'tableCell' },
              { text: cargo.fec_inicio_, style: 'tableCell' },
              { text: cargo.fecha_final === null ? 'Sin fecha' : cargo.fec_final_, style: 'tableCell' },
              { text: cargo.hora_trabaja, style: 'tableCell' },
              { text: '$' + cargo.sueldo, style: 'tableCell' },
            ]
          })
        ]
      }
    };
  }

  PresentarDataPDFdiscapacidadEmpleado() {
    if (this.discapacidadUser.length > 0) {
      return {
        table: {
          widths: ['*', '*', '*'],
          body: [
            [
              { text: 'CARNET CONADIS', style: 'tableHeader' },
              { text: 'PORCENTAJE', style: 'tableHeader' },
              { text: 'TIPO', style: 'tableHeader' },
            ],
            ...this.discapacidadUser.map((obj: any) => {
              return [
                { text: obj.carnet_conadis, style: 'tableCell' },
                { text: obj.porcentaje + ' %', style: 'tableCell' },
                { text: obj.tipo, style: 'tableCell' },
              ];
            })
          ]
        }
      };
    }
  }

  /** ******************************************************************************************* **
   ** **                          PARA LA EXPORTACION DE ARCHIVOS EXCEL                        ** **                           *
   ** ******************************************************************************************* **/

  ObtenerDatos() {
    let objeto: any;
    let objetoContrato: any;
    let objetoCargo: any;
    let arregloEmpleado: any = [];
    let arregloContrato: any = [];
    let arregloCargo: any = [];
    this.empleadoUno.forEach((obj: any) => {
      let estadoCivil = this.EstadoCivilSelect[obj.estado_civil - 1];
      let genero = this.GeneroSelect[obj.genero - 1];
      let estado = this.EstadoSelect[obj.estado - 1];
      let nacionalidad: any;
      this.nacionalidades.forEach((element: any) => {
        if (obj.id_nacionalidad == element.id) {
          nacionalidad = element.nombre;
        }
      });
      objeto = {
        'Codigo': obj.codigo,
        "Apellido": obj.apellido,
        "Nombre": obj.nombre,
        "Cedula": obj.cedula,
        "Estado Civil": estadoCivil,
        "Genero": genero,
        "Correo": obj.correo,
        "Fecha de Nacimiento": new Date(obj.fec_nacimiento_.split(" ")[1]),
        "Estado": estado,
        "Domicilio": obj.domicilio,
        "Telefono": obj.telefono,
        "Nacionalidad": nacionalidad,
      };
      if (obj.longitud !== null) {
        objeto.empleado.longitud = obj.longitud;
      }
      if (obj.latitud !== null) {
        objeto.empleado.latitud = obj.latitud;
      }
      arregloEmpleado.push(objeto);
    });
    if (this.contratoEmpleado !== null) {
      this.contratoEmpleado.map((contrato: any) => {
        let fechaI = contrato.fec_ingreso_.split(" ");
        let fechaS: string = contrato.fecha_salida === null ? 'Sin fecha' : contrato.fec_salida_.split(" ")[1];
        objetoContrato = {
          'Regimen': contrato.descripcion,
          'Fecha desde': fechaI[1],
          'Fecha hasta': fechaS,
          'Modalidad laboral': contrato.nombre_contrato,
          'Control asistencia': contrato.controlar_asistencia ? 'Si' : 'No',
          'Control vacaciones': contrato.controlar_vacacion ? 'Si' : 'No',
        };
        arregloContrato.push(objetoContrato);
      });

    }
    if (this.cargoEmpleado !== null) {
      this.cargoEmpleado.map((cargo: any) => {
        let fechaI = cargo.fec_inicio_.split(" ");
        let fechaS: string = cargo.fecha_final === null ? 'Sin fecha' : cargo.fec_final_.split(" ")[1];
        objetoCargo = {
          'Sucursal': cargo.sucursal,
          'Departamento': cargo.departamento,
          'Cargo': cargo.nombre_cargo,
          'Fecha desde': fechaI[1],
          'Fecha hasta': fechaS,
          'Sueldo': cargo.sueldo,
          'Horas trabaja': cargo.hora_trabaja,
        };
        arregloCargo.push(objetoCargo);
      });
    }
    return [arregloEmpleado, arregloContrato, arregloCargo];
  }


  ExportToExcel() {
    const datos: any = this.ObtenerDatos();
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(datos[0]);
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wse, 'PERFIL');
    if (this.contratoEmpleado.length > 0) {
      const wsco: xlsx.WorkSheet = xlsx.utils.json_to_sheet(datos[1]);
      xlsx.utils.book_append_sheet(wb, wsco, 'CONTRATO');
    }
    if (this.cargoEmpleado.length > 0) {
      const wsca: xlsx.WorkSheet = xlsx.utils.json_to_sheet(datos[2]);
      xlsx.utils.book_append_sheet(wb, wsca, 'CARGO');
    }
    if (this.tituloEmpleado.length > 0) {
      const wst: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.tituloEmpleado);
      xlsx.utils.book_append_sheet(wb, wst, 'TITULOS');
    }
    if (this.discapacidadUser.length > 0) {
      const wsd: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.discapacidadUser);
      xlsx.utils.book_append_sheet(wb, wsd, 'DISCAPACIDA');
    }
    xlsx.writeFile(wb, "Empleado_" + (datos[0])[0].Nombre + "_" + (datos[0])[0].Apellido + "_" + new Date().getTime() + '.xlsx');
  }

  /** ******************************************************************************************* **
   ** **                          PARA LA EXPORTACION DE ARCHIVOS CSV                          ** **                                *
   ** ******************************************************************************************* **/

  ExportToCVS() {
    const datos: any = this.ObtenerDatos();
    const datosEmpleado: any = [];
    const objeto = {
      ...datos[0][0],
      ...datos[1][0],
      ...datos[2][0],
      ...this.tituloEmpleado[0],
      ...this.discapacidadUser[0],
    };
    datosEmpleado.push(objeto);
    const csvDataE = xlsx.utils.sheet_to_csv(xlsx.utils.json_to_sheet(datosEmpleado));
    const data: Blob = new Blob([csvDataE], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, "EmpleadoCSV" + (datos[0])[0].Nombre + "_" + (datos[0])[0].Apellido + "_" + new Date().getTime() + '.csv');
  }

  /** ******************************************************************************************* **
   ** **                             METODO PARA IMPRIMIR EN XML                               ** **
   ** ******************************************************************************************* **/

  nacionalidades: any = [];
  ObtenerNacionalidades() {
    this.restEmpleado.BuscarNacionalidades().subscribe(res => {
      this.nacionalidades = res;
    });
  }

  EstadoCivilSelect: any = ['Soltero/a', 'Unión de Hecho', 'Casado/a', 'Divorciado/a', 'Viudo/a'];
  GeneroSelect: any = ['Masculino', 'Femenino'];
  EstadoSelect: any = ['Activo', 'Inactivo'];

  urlxml: string;
  data: any = [];
  ExportToXML() {
    let objeto: any;
    let arregloEmpleado: any = [];
    this.empleadoUno.forEach((obj: any) => {
      let estadoCivil = this.EstadoCivilSelect[obj.estado_civil - 1];
      let genero = this.GeneroSelect[obj.genero - 1];
      let estado = this.EstadoSelect[obj.estado - 1];
      let nacionalidad: any;
      this.nacionalidades.forEach((element: any) => {
        if (obj.id_nacionalidad == element.id) {
          nacionalidad = element.nombre;
        }
      });

      objeto = {
        "empleado": {
          'codigo': obj.codigo,
          "apellido": obj.apellido,
          "nombre": obj.nombre,
          "cedula": obj.cedula,
          "estadoCivil": estadoCivil,
          "genero": genero,
          "correo": obj.correo,
          "fechaNacimiento": obj.fec_nacimiento_,
          "estado": estado,
          "domicilio": obj.domicilio,
          "telefono": obj.telefono,
          "nacionalidad": nacionalidad,
        }
      };
      if (obj.longitud !== null) {
        objeto.empleado.longitud = obj.longitud;
      }
      if (obj.latitud !== null) {
        objeto.empleado.latitud = obj.latitud;
      }
      if (this.contratoEmpleado !== null) {
        this.contratoEmpleado.map((contrato: any) => {
          objeto.empleado.contrato = {
            'regimen': contrato.descripcion,
            'fecha_desde': contrato.fec_ingreso_,
            'fecha_hasta': contrato.fecha_salida === null ? 'Sin fecha' : contrato.fec_salida_,
            'modalidad_laboral': contrato.nombre_contrato,
            'control_asistencia': contrato.controlar_asistencia ? 'Si' : 'No',
            'control_vacaciones': contrato.controlar_vacacion ? 'Si' : 'No',
          };
        });

      }
      if (this.cargoEmpleado !== null) {
        this.cargoEmpleado.map((cargo: any) => {
          objeto.empleado.cargo = {
            'sucursal': cargo.sucursal,
            'departamento': cargo.departamento,
            'cargo': cargo.nombre_cargo,
            'fecha_desde': cargo.fec_inicio_,
            'fecha_hasta': cargo.fecha_final === null ? 'Sin fecha' : cargo.fec_final_,
            'sueldo': cargo.sueldo,
            'horas_trabaja': cargo.hora_trabaja,
          };
        });
      }
      arregloEmpleado.push(objeto)
    });
    const xmlBuilder = new xml2js.Builder();
    const xml = xmlBuilder.buildObject(objeto);

    if (xml === undefined) {
      console.error('Error al construir el objeto XML.');
      return;
    }

    const blob = new Blob([xml], { type: 'application/xml' });
    const xmlUrl = URL.createObjectURL(blob);

    // ABRIR UNA NUEVA PESTAÑA O VENTANA CON EL CONTENIDO XML
    const newTab = window.open(xmlUrl, '_blank');
    if (newTab) {
      newTab.opener = null; // EVITAR QUE LA NUEVA PESTAÑA TENGA ACCESO A LA VENTANA PADRE
      newTab.focus(); // DAR FOCO A LA NUEVA PESTAÑA
    } else {
      alert('No se pudo abrir una nueva pestaña. Asegúrese de permitir el uso de ventanas emergentes.');
    }

    const a = document.createElement('a');
    a.href = xmlUrl;
    a.download = "Empleado-" + objeto.empleado.nombre + '-' + objeto.empleado.apellido + '-' + new Date().getTime() + '.xml';
    // SIMULAR UN CLIC EN EL ENLACE PARA INICIAR LA DESCARGA
    a.click();
  }
}
