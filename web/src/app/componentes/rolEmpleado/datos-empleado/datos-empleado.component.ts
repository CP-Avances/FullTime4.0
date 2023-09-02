import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import * as xlsx from 'xlsx';
import * as moment from 'moment';
import * as FileSaver from 'file-saver';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
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

@Component({
  selector: 'app-datos-empleado',
  templateUrl: './datos-empleado.component.html',
  styleUrls: ['./datos-empleado.component.css']
})

export class DatosEmpleadoComponent implements OnInit {

  empleadoUno: any = [];
  tituloEmpleado: any = [];
  discapacidadUser: any = [];
  empleadoLogueado: any = [];
  contratoEmpleado: any = [];

  // VARIABLES DE ALMACENAMIENTO DE DATOS DE BOTONES
  idEmpleado: string = ''; // VARIABLE DE ALMACENAMIENTO DE ID DE EMPLEADO SELECCIONADO PARA VER DATOS
  btnTitulo = 'Añadir';
  btnDisc = 'Añadir';
  editar: string = '';

  // ITEMS DE PAGINACION DE LA TABLA 
  numero_pagina: number = 1;
  tamanio_pagina: number = 5;
  pageSizeOptions = [5, 10, 20, 50];

  hipervinculo: string = environment.url; // VARIABLE DE MANEJO DE RUTAS CON URL

  empresa: string = '';

  constructor(
    public restDiscapacidad: DiscapacidadService,
    public restEmpleado: EmpleadoService,
    public informacion: DatosGeneralesService,
    public restTitulo: TituloService,
    public restVacuna: VacunacionService,
    public restEmpre: EmpresaService,
    public parametro: ParametrosService,
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
    this.ObtenerLogo();
    this.ObtenerColores();
    this.BuscarParametro();
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
    // id_tipo_parametro Formato fecha = 25
    this.parametro.ListarDetalleParametros(25).subscribe(
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
      this.p_color = res[0].color_p;
      this.s_color = res[0].color_s;
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
  VerEmpleado(formato_fecha: string) {
    this.empleadoUno = [];
    this.restEmpleado.BuscarUnEmpleado(parseInt(this.idEmpleado)).subscribe(data => {
      this.empleadoUno = data;
      this.empleadoUno[0].fec_nacimiento_ = this.validar.FormatearFecha(this.empleadoUno[0].fec_nacimiento, formato_fecha, this.validar.dia_abreviado);
      if (data[0]['imagen'] != null) {
        this.urlImagen = `${environment.url}/empleado/img/` + data[0]['imagen'];
        this.mostrarImagen = true;
        this.textoBoton = 'Editar foto';
      } else {
        this.iniciales = data[0].nombre.split(" ")[0].slice(0, 1) + data[0].apellido.split(" ")[0].slice(0, 1);
        this.mostrarImagen = false;
        this.textoBoton = 'Subir foto';
      }
    })
  }

  /** ********************************************************************************************* **
   ** **                            PARA LA SUBIR LA IMAGEN DEL EMPLEADO                         ** **                                 *
   ** ********************************************************************************************* **/

  nameFile: string = '';
  archivoSubido: Array<File> = [];
  archivoForm = new FormControl('');
  FileChange(element: any) {
    this.archivoSubido = element.target.files;
    this.SubirPlantilla();
  }

  SubirPlantilla() {
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      console.log(this.archivoSubido[i], this.archivoSubido[i].name)
      formData.append("image[]", this.archivoSubido[i], this.archivoSubido[i].name);
      console.log("iamge", formData);
    }
    this.restEmpleado.SubirImagen(formData, parseInt(this.idEmpleado)).subscribe(res => {
      this.toastr.success('Operación exitosa.', 'imagen subida.', {
        timeOut: 6000,
      });
      this.VerEmpleado(this.formato_fecha);
      this.archivoForm.reset();
      this.nameFile = '';
    });
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
    this.ventana.open(TituloEmpleadoComponent, { data: this.idEmpleado, width: '360px' })
      .afterClosed().subscribe(result => {
        if (result) {
          this.ObtenerTituloEmpleado();
        }
      })
  }

  // EDITAR UN TITULO
  AbrirVentanaEditarTitulo(dataTitulo: any) {
    this.ventana.open(EditarTituloComponent, { data: dataTitulo, width: '360px' })
      .afterClosed().subscribe(result => {
        if (result) {
          this.ObtenerTituloEmpleado();
        }
      })
  }

  // ELIMINAR REGISTRO DE TÍTULO 
  EliminarTituloEmpleado(id: number) {
    this.restEmpleado.EliminarTitulo(id).subscribe(res => {
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
    this.restDiscapacidad.EliminarDiscapacidad(id_discapacidad).subscribe(res => {
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
    this.restVacuna.EliminarRegistroVacuna(datos.id, datos.carnet).subscribe(res => {
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

  // METODO PARA OBTENER EL CONTRATO DE UN EMPLEADO CON SU RESPECTIVO RÉGIMEN LABORAL 
  ObtenerContratoEmpleado(id_contrato: number, formato_fecha: string) {
    this.restEmpleado.BuscarDatosContrato(id_contrato).subscribe(res => {
      this.contratoEmpleado = res;
      this.contratoEmpleado.forEach((data: any) => {
        data.fec_ingreso_ = this.validar.FormatearFecha(data.fec_ingreso, formato_fecha, this.validar.dia_abreviado);
        data.fec_salida_ = this.validar.FormatearFecha(data.fec_salida, formato_fecha, this.validar.dia_abreviado);
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
    sessionStorage.setItem('profile', this.empleadoUno);
    return {
      // ENCABEZADO DE LA PAGINA
      pageOrientation: 'landscape',
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleadoLogueado[0].nombre + ' ' + this.empleadoLogueado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },
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
        { image: this.logoE, width: 150, margin: [10, -25, 0, 5] },
        { text: 'Perfil Empleado', bold: true, fontSize: 20, alignment: 'center', margin: [0, -30, 0, 10] },
        {
          columns: [
            [
              { text: this.empleadoUno[0].nombre + ' ' + this.empleadoUno[0].apellido, style: 'name' },
              { text: 'Fecha Nacimiento: ' + this.empleadoUno[0].fec_nacimiento_ },
              { text: 'Corre Electronico: ' + this.empleadoUno[0].correo },
              { text: 'Teléfono: ' + this.empleadoUno[0].telefono }
            ]
          ]
        },
        { text: 'Contrato Empleado', style: 'header' },
        this.PresentarDataPDFcontratoEmpleado(),
        { text: 'Plan de comidas', style: 'header' },
        { text: 'Titulos', style: 'header' },
        this.PresentarDataPDFtitulosEmpleado(),
        { text: 'Discapacidad', style: 'header' },
        this.PresentarDataPDFdiscapacidadEmpleado(),
      ],
      info: {
        title: this.empleadoUno[0].nombre + ' ' + this.empleadoUno[0].apellido + '_PERFIL',
        author: this.empleadoUno[0].nombre + ' ' + this.empleadoUno[0].apellido,
        subject: 'Perfil',
        keywords: 'Perfil, Empleado',
      },
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 20, 0, 10], decoration: 'underline' },
        name: { fontSize: 16, bold: true },
        tableHeader: { bold: true, alignment: 'center', fillColor: this.p_color }
      }
    };
  }

  PresentarDataPDFtitulosEmpleado() {
    return {
      table: {
        widths: ['*', '*', '*'],
        body: [
          [
            { text: 'Observaciones', style: 'tableHeader' },
            { text: 'Nombre', style: 'tableHeader' },
            { text: 'Nivel', style: 'tableHeader' }
          ],
          ...this.tituloEmpleado.map((obj: any) => {
            return [obj.observaciones, obj.nombre, obj.nivel];
          })
        ]
      }
    };
  }

  PresentarDataPDFcontratoEmpleado() {
    return {
      table: {
        widths: ['*', 'auto', 100, '*'],
        body: [
          [
            { text: 'Descripción', style: 'tableHeader' },
            { text: 'Dias Vacacion', style: 'tableHeader' },
            { text: 'Fecha Ingreso', style: 'tableHeader' },
            { text: 'Fecha Salida', style: 'tableHeader' }
          ],
          ...this.contratoEmpleado.map((obj: any) => {
            const ingreso = obj.fec_ingreso_;
            if (obj.fec_salida === null) {
              const salida = '';
              return [obj.descripcion, obj.dia_anio_vacacion, ingreso, salida];
            } else {
              const salida = obj.fec_salida_;
              return [obj.descripcion, obj.dia_anio_vacacion, ingreso, salida];
            }
          })
        ]
      }
    };
  }

  PresentarDataPDFdiscapacidadEmpleado() {
    return {
      table: {
        widths: ['*', '*', '*'],
        body: [
          [
            { text: 'Carnet conadis', style: 'tableHeader' },
            { text: 'Porcentaje', style: 'tableHeader' },
            { text: 'Tipo', style: 'tableHeader' }
          ],
          ...this.discapacidadUser.map((obj: any) => {
            return [obj.carn_conadis, obj.porcentaje + ' %', obj.tipo];
          })
        ]
      }
    };
  }

  /** ******************************************************************************************* **
   ** **                          PARA LA EXPORTACION DE ARCHIVOS EXCEL                        ** **                           *
   ** ******************************************************************************************* **/

  ExportToExcel() {
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.empleadoUno);
    const wsc: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.contratoEmpleado);
    const wsd: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.discapacidadUser);
    const wst: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.tituloEmpleado);
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wse, 'PERFIL');
    xlsx.utils.book_append_sheet(wb, wsc, 'CONTRATO');
    xlsx.utils.book_append_sheet(wb, wst, 'TITULOS');
    xlsx.utils.book_append_sheet(wb, wsd, 'DISCAPACIDA');
    xlsx.writeFile(wb, "EmpleadoEXCEL" + new Date().getTime() + '.xlsx');
  }

  /** ******************************************************************************************* **
   ** **                          PARA LA EXPORTACION DE ARCHIVOS CSV                          ** **                                *
   ** ******************************************************************************************* **/

  ExportToCVS() {
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.empleadoUno);
    const wsc: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.contratoEmpleado);
    const wsd: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.discapacidadUser);
    const wst: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.tituloEmpleado);
    const csvDataE = xlsx.utils.sheet_to_csv(wse);
    const csvDataC = xlsx.utils.sheet_to_csv(wsc);
    const csvDataD = xlsx.utils.sheet_to_csv(wsd);
    const csvDataT = xlsx.utils.sheet_to_csv(wst);
    const data: Blob = new Blob([csvDataE, csvDataC, csvDataD, csvDataT], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, "EmpleadoCSV" + new Date().getTime() + '.csv');
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

  urlxml: string = '';
  data: any = [];
  ExportToXML() {
    var objeto: any;
    var arregloEmpleado: any = [];
    this.empleadoUno.forEach((obj: any) => {
      var estadoCivil = this.EstadoCivilSelect[obj.esta_civil - 1];
      var genero = this.GeneroSelect[obj.genero - 1];
      var estado = this.EstadoSelect[obj.estado - 1];
      let nacionalidad: any;
      this.nacionalidades.forEach((element: any) => {
        if (obj.id_nacionalidad == element.id) {
          nacionalidad = element.nombre;
        }
      });
      objeto = {
        "empleado": {
          '@codigo': obj.codigo,
          "cedula": obj.cedula,
          "apellido": obj.apellido,
          "nombre": obj.nombre,
          "estadoCivil": estadoCivil,
          "genero": genero,
          "correo": obj.correo,
          "fechaNacimiento": obj.fec_nacimiento_,
          "estado": estado,
          "domicilio": obj.domicilio,
          "telefono": obj.telefono,
          "nacionalidad": nacionalidad,
          "imagen": obj.imagen
        }
      }
      arregloEmpleado.push(objeto)
    });
    this.restEmpleado.CrearXML(arregloEmpleado).subscribe(res => {
      this.data = res;
      this.urlxml = `${environment.url}/empleado/download/` + this.data.name;
      window.open(this.urlxml, "_blank");
    });
  }

}
