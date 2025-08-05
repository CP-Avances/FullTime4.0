// IMPORTAR LIBRERIAS
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ITableEmpleados } from 'src/app/model/reportes.model';
import { Validators, FormControl } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';
import { DateTime } from 'luxon';

import ExcelJS, { FillPattern } from "exceljs";
import * as FileSaver from 'file-saver';
// IMPORTAR SERVICIOS
import { DatosGeneralesService } from 'src/app/servicios/generales/datosGenerales/datos-generales.service';
import { ValidacionesService } from '../../../../servicios/generales/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/configuracion/parametrizacion/parametrosGenerales/parametros.service';
import { ReportesService } from 'src/app/servicios/reportes/reportes.service';
import { EmpresaService } from 'src/app/servicios/configuracion/parametrizacion/catEmpresa/empresa.service';
import { VacunasService } from 'src/app/servicios/reportes/vacunas/vacunas.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario/usuario.service';
import { GenerosService } from 'src/app/servicios/usuarios/catGeneros/generos.service';
import { NacionalidadService } from 'src/app/servicios/usuarios/catNacionalidad/nacionalidad.service';

@Component({
  selector: 'app-vacuna-multiple',
  standalone: false,
  templateUrl: './vacuna-multiple.component.html',
  styleUrls: ['./vacuna-multiple.component.css'],
})

export class VacunaMultipleComponent implements OnInit, OnDestroy {
  private imagen: any;

  private bordeCompleto!: Partial<ExcelJS.Borders>;

  private bordeGrueso!: Partial<ExcelJS.Borders>;

  private fillAzul!: FillPattern;

  private fontTitulo!: Partial<ExcelJS.Font>;

  private fontHipervinculo!: Partial<ExcelJS.Font>;
  // METODO QUE INDICA OPCIONES DE BUSQUEDA SELECCIONADOS
  get bool() {
    return this.reporteService.criteriosBusqueda;
  }

  // VARIABLE QUE INDICA NÚMERO DE OPCIONES DE BUSQUEDA
  get opcion() {
    return this.reporteService.opcion;
  }

  // VARIABLES DE ALMACENAMIENTO DE RESULTADOS
  idEmpleadoLogueado: any;
  departamentos: any = [];
  sucursales: any = [];
  empleados: any = [];
  arr_vac: any = [];
  regimen: any = [];
  cargos: any = [];

  // VARIABLE DE ALMACENAMIENTO DE DATOS DE PDF
  data_pdf: any = [];

  //VARIABLES PARA MOSTRAR DETALLES
  verDetalle: boolean = false;

  // VARIABLES UTILIZADAS PARA IDENTIFICAR EL TIPO DE USUARIO
  tipoUsuario: string = 'activo';
  opcionBusqueda: number = 1;
  limpiar: number = 0;

  hipervinculo: string = (localStorage.getItem('empresaURL') as string);

  // VARIABLES DE ALMACENAMIENTO DE DATOS SELECCIONADOS EN LA BUSQUEDA
  selectionSuc = new SelectionModel<ITableEmpleados>(true, []);
  selectionReg = new SelectionModel<any>(true, []);
  selectionCar = new SelectionModel<ITableEmpleados>(true, []);
  selectionDep = new SelectionModel<ITableEmpleados>(true, []);
  selectionEmp = new SelectionModel<ITableEmpleados>(true, []);

  // ITEMS DE PAGINACION DE LA TABLA SUCURSAL
  numero_pagina_suc: number = 1;
  tamanio_pagina_suc: number = 5;
  pageSizeOptions_suc = [5, 10, 20, 50];

  // ITEMS DE PAGINACION DE LA TABLA REGIMEN
  numero_pagina_reg: number = 1;
  tamanio_pagina_reg: number = 5;
  pageSizeOptions_reg = [5, 10, 20, 50];

  // CAMPOS DEL FORMULARIO
  codigo = new FormControl('');
  cedula = new FormControl('', [Validators.minLength(2)]);
  nombre = new FormControl('', [Validators.minLength(2)]);

  // ITEMS DE PAGINACION DE LA TABLA CARGO
  numero_pagina_car: number = 1;
  tamanio_pagina_car: number = 5;
  pageSizeOptions_car = [5, 10, 20, 50];

  // ITEMS DE PAGINACION DE LA TABLA DEPARTAMENTO
  numero_pagina_dep: number = 1;
  tamanio_pagina_dep: number = 5;
  pageSizeOptions_dep = [5, 10, 20, 50];

  // ITEMS DE PAGINACION DE LA TABLA EMPLEADOS
  numero_pagina_emp: number = 1;
  tamanio_pagina_emp: number = 5;
  pageSizeOptions_emp = [5, 10, 20, 50];

  // ITEMS DE PAGINACION DE LA TABLA DETALLE
  @ViewChild('paginatorDetalle') paginatorDetalle: MatPaginator;
  pageSizeOptions = [5, 10, 20, 50];
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;

  // METODOS PARA BUSQUEDA DE DATOS POR FILTROS SUCURSAL
  get filtroNombreSuc() {
    return this.reporteService.filtroNombreSuc;
  }

  // METODOS PARA BUSQUEDA DE DATOS POR FILTROS REGIMEN
  get filtroNombreReg() {
    return this.reporteService.filtroNombreReg;
  }

  // METODOS PARA BUSQUEDA DE DATOS POR FILTROS CARGOS
  get filtroNombreCar() {
    return this.reporteService.filtroNombreCarg;
  }

  // METODOS PARA BUSQUEDA DE DATOS POR FILTROS DEPARTAMENTO
  get filtroNombreDep() {
    return this.reporteService.filtroNombreDep;
  }

  // METODOS PARA BUSQUEDA DE DATOS POR FILTROS EMPLEADO
  get filtroCodigo() {
    return this.reporteService.filtroCodigo;
  }
  get filtroCedula() {
    return this.reporteService.filtroCedula;
  }
  get filtroNombreEmp() {
    return this.reporteService.filtroNombreEmp;
  }
  get filtroRolEmp() {
    return this.reporteService.filtroRolEmp;
  }

  constructor(
    private reporteService: ReportesService, // SERVICIO DATOS DE BUSQUEDA GENERALES DE REPORTE
    private informacion: DatosGeneralesService,
    private parametro: ParametrosService,
    private restEmpre: EmpresaService, // SERVICIO DATOS GENERALES DE EMPRESA
    private R_vacuna: VacunasService, // SERVICIO DATOS PARA REPORTE DE VACUNAS
    private toastr: ToastrService, // VARIABLE DE MANEJO DE NOTIFICACIONES
    public restUsuario: UsuarioService,
    public validar: ValidacionesService,
    private restGenero: GenerosService,
    private restNacionalidades: NacionalidadService,
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado') as string);
    this.ObtenerLogo();
    this.ObtenerColores();
    this.ObtenerGeneros();
    this.ObtenerNacionalidades();
  }

  ngOnInit(): void {
    this.opcionBusqueda = this.tipoUsuario === 'activo' ? 1 : 2;
    this.BuscarInformacionGeneral(this.opcionBusqueda);
    this.BuscarParametro();

    this.bordeCompleto = {
      top: { style: "thin" as ExcelJS.BorderStyle },
      left: { style: "thin" as ExcelJS.BorderStyle },
      bottom: { style: "thin" as ExcelJS.BorderStyle },
      right: { style: "thin" as ExcelJS.BorderStyle },
    };

    this.bordeGrueso = {
      top: { style: "medium" as ExcelJS.BorderStyle },
      left: { style: "medium" as ExcelJS.BorderStyle },
      bottom: { style: "medium" as ExcelJS.BorderStyle },
      right: { style: "medium" as ExcelJS.BorderStyle },
    };

    this.fillAzul = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "4F81BD" }, // Azul claro
    };

    this.fontTitulo = { bold: true, size: 12, color: { argb: "FFFFFF" } };
    this.fontHipervinculo = { color: { argb: "0000FF" }, underline: true };
  }

  ngOnDestroy() {
    this.departamentos = [];
    this.sucursales = [];
    this.empleados = [];
    this.regimen = [];
    this.cargos = [];
    this.arr_vac = [];
  }

  /** ****************************************************************************************** **
   ** **                     BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** **
   ** ****************************************************************************************** **/

  formato_fecha: string = 'dd/MM/yyyy';
  formato_hora: string = 'HH:mm:ss';
  idioma_fechas: string = 'es';
  // METODO PARA BUSCAR DATOS DE PARAMETROS
  BuscarParametro() {
    let datos: any = [];
    let detalles = { parametros: '1, 2' };
    this.parametro.ListarVariosDetallesParametros(detalles).subscribe(
      res => {
        datos = res;
        //console.log('datos ', datos)
        datos.forEach((p: any) => {
          // id_tipo_parametro Formato fecha = 1
          if (p.id_parametro === 1) {
            this.formato_fecha = p.descripcion;
          }
          // id_tipo_parametro Formato hora = 2
          else if (p.id_parametro === 2) {
            this.formato_hora = p.descripcion;
          }
        })
      });
  }


  /** ****************************************************************************************** **
   ** **                           BUSQUEDA Y MODELAMIENTO DE DATOS                           ** **
   ** ****************************************************************************************** **/

  // METODO DE BUSQUEDA DE DATOS GENERALES DEL EMPLEADO
  BuscarInformacionGeneral(opcion: any) {
    // LIMPIAR DATOS DE ALMACENAMIENTO
    this.departamentos = [];
    this.sucursales = [];
    this.empleados = [];
    this.regimen = [];
    this.cargos = [];
    this.informacion.ObtenerInformacionGeneral(opcion).subscribe((res: any[]) => {
      this.ProcesarDatos(res);
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  // METODO PARA PROCESAR LA INFORMACION DE LOS EMPLEADOS
  ProcesarDatos(informacion: any) {
    this.cargos = this.validar.ProcesarDatosCargos(informacion);
    this.regimen = this.validar.ProcesarDatosRegimen(informacion);
    this.empleados = this.validar.ProcesarDatosEmpleados(informacion);
    this.sucursales = this.validar.ProcesarDatosSucursales(informacion);
    this.departamentos = this.validar.ProcesarDatosDepartamentos(informacion);
  }

  // METODO PARA OBTENER DATOS SEGUN EL ESTADO DEL USUARIO
  ObtenerTipoUsuario($event: string) {
    this.tipoUsuario = $event;
    this.opcionBusqueda = this.tipoUsuario === 'activo' ? 1 : 2;
    this.limpiar = this.opcionBusqueda;
    this.selectionSuc.clear();
    this.selectionDep.clear();
    this.selectionCar.clear();
    this.selectionReg.clear();
    this.selectionEmp.clear();
    this.BuscarInformacionGeneral(this.opcionBusqueda);
  }

  // VALIDACIONES DE SELECCION DE BUSQUEDA
  ValidarReporte(action: any) {
    if (
      this.bool.bool_suc === false &&
      this.bool.bool_reg === false &&
      this.bool.bool_cargo === false &&
      this.bool.bool_dep === false &&
      this.bool.bool_emp === false
    )
      return this.toastr.error('Seleccione un criterio de búsqueda.');
    // METODO PARA MODELAR DATOS
    this.ModelarDatos(action);
  }

  // MODELAR DATOS DE ACUERDO AL CRITERIO DE BUSQUEDA
  ModelarDatos(accion: any) {
    let seleccionados: any = [];
    switch (this.opcion) {
      case 's':
        if (this.selectionSuc.selected.length === 0)
          return this.toastr.error(
            'No a seleccionado ninguno.',
            'Seleccione sucursal.'
          );
        seleccionados = this.validar.ModelarSucursal(this.empleados, this.sucursales, this.selectionSuc);
        break;
      case 'r':
        if (this.selectionReg.selected.length === 0)
          return this.toastr.error(
            'No a seleccionado ninguno.',
            'Seleccione régimen.'
          );
        seleccionados = this.validar.ModelarRegimen(this.empleados, this.regimen, this.selectionReg);
        break;
      case 'c':
        if (this.selectionCar.selected.length === 0)
          return this.toastr.error(
            'No a seleccionado ninguno',
            'Seleccione Cargo'
          );
        seleccionados = this.validar.ModelarCargo(this.empleados, this.cargos, this.selectionCar);
        break;
      case 'd':
        if (this.selectionDep.selected.length === 0)
          return this.toastr.error(
            'No a seleccionado ninguno.',
            'Seleccione departamentos.'
          );
        seleccionados = this.validar.ModelarDepartamento(this.empleados, this.departamentos, this.selectionDep);
        break;
      case 'e':
        if (this.selectionEmp.selected.length === 0)
          return this.toastr.error(
            'No a seleccionado ninguno.',
            'Seleccione empleados.'
          );
        seleccionados = this.validar.ModelarEmpleados(this.empleados, this.selectionEmp);
        break;
      default:
        this.toastr.error(
          'Ups! algo salio mal.',
          'Seleccione criterio de búsqueda.'
        );
        this.reporteService.DefaultFormCriterios();
        break;
    }
    // METODO PARA MOSTRAR DATOS DE REGISTROS DEL USUARIO
    if (seleccionados.length != 0) {
      this.MostrarInformacion(seleccionados, accion);
    }
  }

  // METODO PARA MOSTRAR INFORMACION
  MostrarInformacion(seleccionados: any, accion: any) {
    this.data_pdf = [];
    this.R_vacuna.ReporteVacunasMultiples(seleccionados).subscribe(
      (res) => {
        this.data_pdf = res;
        switch (accion) {
          case 'excel':
            this.generarExcel();
            break;
          case 'ver':
            this.VerDatos();
            break;
          default:
            this.GenerarPDF(accion);
            break;
        }
      },
      (err) => {
        this.toastr.error(err.error.message);
      }
    );
  }

  /** ****************************************************************************************** **
   **                              COLORES Y LOGO PARA EL REPORTE                                **
   ** ****************************************************************************************** **/

  // OBTENER LOGO PARA EL REPORTE
  logo: any = String;
  ObtenerLogo() {
    this.restEmpre
      .LogoEmpresaImagenBase64(localStorage.getItem('empresa') as string)
      .subscribe((res) => {
        this.logo = 'data:image/jpeg;base64,' + res.imagen;
      });
  }

  // METODO PARA OBTENER COLORES Y MARCA DE AGUA DE EMPRESA
  p_color: any;
  s_color: any;
  frase: any;
  ObtenerColores() {
    this.restEmpre
      .ConsultarDatosEmpresa(
        parseInt(localStorage.getItem('empresa') as string)
      )
      .subscribe((res) => {
        this.p_color = res[0].color_principal;
        this.s_color = res[0].color_secundario;
        this.frase = res[0].marca_agua;
      });
  }

  /** ****************************************************************************************** **
   ** **                         METODO DE CREACION DE  PDF                                   ** **
   ** ****************************************************************************************** **/

  obtenerTipoFiltro(): string {
    if (this.bool.bool_reg) return 'regimen';
    if (this.bool.bool_dep) return 'departamento';
    if (this.bool.bool_cargo) return 'cargo';
    if (this.bool.bool_suc) return 'ciudad';
    if (this.bool.bool_emp) return 'empleado';
    return 'desconocido';
  }


  async GenerarPDF(action: any) {
    const doc_name = `Vacunas_usuarios_${this.opcionBusqueda == 1 ? 'activos' : 'inactivos'}.pdf`;
    if (action === 'download') {
      if (this.data_pdf.length === 0) {
        this.toastr.info('No hay datos para generar el reporte', 'Vacunación');
        return;
      }

      const data = {
        usuario: this.empleados[0].nombre + ' ' + this.empleados[0].apellido,
        empresa: (localStorage.getItem('name_empresa') || '').toUpperCase(),
        fraseMarcaAgua: this.frase,
        logoBase64: this.logo,
        colorPrincipal: this.p_color,
        colorSecundario: this.s_color,
        titulo: `REGISTRO DE VACUNACIÓN - ${this.opcionBusqueda == 1 ? 'ACTIVOS' : 'INACTIVOS'}`,
        tipoFiltro: this.obtenerTipoFiltro(),
        datos: this.data_pdf.map((selec: any) => ({
          sucursal: selec.sucursal,
          nombre: selec.nombre,
          ciudad: selec.ciudad,
          departamento: selec.departamento,
          empleados: selec.empleados.map((empl: any) => {
            const generoObj = this.generos.find((g: any) => g.id === empl.genero);
            const nombreGenero = generoObj ? generoObj.genero : "No especificado";

            const nacionalidadObj = this.nacionalidades.find((n: any) => n.id === empl.id_nacionalidad);
            const nombreNacionalidad = nacionalidadObj ? nacionalidadObj.nombre : "No especificado";

            return {
              identificacion: empl.identificacion,
              nombre: empl.nombre,
              apellido: empl.apellido,
              correo: empl.correo,
              genero: nombreGenero, 
              nacionalidad: nombreNacionalidad,
              cargo: empl.cargo,
              regimen: empl.regimen,
              codigo: empl.codigo,
              rol: empl.rol,
              departamento: empl.departamento,
              vacunas: empl.vacunas.map((vac: any) => ({
                tipo_vacuna: vac.tipo_vacuna,
                fecha: vac.fecha,
                descripcion: vac.descripcion
              }))
            };
          })
        }))
      };

      console.log("Enviando al microservicio:", data);

      this.validar.generarReporteVacunacionUsuarios(data).subscribe((pdfBlob: Blob) => {
        FileSaver.saveAs(pdfBlob, doc_name);
        console.log("PDF generado correctamente desde el microservicio.");
      }, error => {
        console.error("Error al generar PDF desde el microservicio:", error);
        this.toastr.error(
          'No se pudo generar el reporte. El servicio de reportes no está disponible en este momento. Intentelo mas tarde',
          'Error'
        );
      });

    } else {
      const pdfMake = await this.validar.ImportarPDF();
      const documentDefinition = this.DefinirInformacionPDF();

      switch (action) {
        case 'open':
          pdfMake.createPdf(documentDefinition).open();
          break;
        case 'print':
          pdfMake.createPdf(documentDefinition).print();
          break;
        default:
          pdfMake.createPdf(documentDefinition).open();
          break;
      }
    }
  }


  DefinirInformacionPDF() {
    return {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [40, 50, 40, 50],
      watermark: {
        text: this.frase,
        color: 'blue',
        opacity: 0.1,
        bold: true,
        italics: false,
      },
      header: {
        text: 'Impreso por:  ' + localStorage.getItem('fullname_print'),
        margin: 10,
        fontSize: 9,
        opacity: 0.3,
        alignment: 'right',
      },

      footer: function (
        currentPage: any,
        pageCount: any,
        fecha: any,
        hora: any
      ) {
        var f = DateTime.now();
        fecha = f.toFormat('yyyy-MM-dd');
        hora = f.toFormat('HH:mm:ss');
        return {
          margin: 10,
          columns: [
            { text: 'Fecha: ' + fecha + ' Hora: ' + hora, opacity: 0.3 },
            {
              text: [
                {
                  text: '© Pag ' + currentPage.toString() + ' de ' + pageCount,
                  alignment: 'right',
                  opacity: 0.3,
                },
              ],
            },
          ],
          fontSize: 10,
        };
      },
      content: [
        { image: this.logo, width: 100, margin: [10, -25, 0, 5] },
        {
          text: (localStorage.getItem('name_empresa') as string).toLocaleUpperCase(),
          bold: true,
          fontSize: 14,
          alignment: 'center',
          margin: [0, -30, 0, 5],
        },
        {
          text: `REGISTRO DE VACUNACIÓN - ${this.opcionBusqueda == 1 ? 'ACTIVOS' : 'INACTIVOS'}`,
          bold: true,
          fontSize: 12,
          alignment: 'center',
          margin: [0, 0, 0, 0],
        },
        ...this.EstructurarDatosPDF(this.data_pdf).map((obj) => {
          return obj;
        }),
      ],
      styles: {
        tableHeader: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.p_color },
        centrado: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.p_color, margin: [0, 7, 0, 0] },
        itemsTable: { fontSize: 8 },
        itemsTableInfo: { fontSize: 10, margin: [0, 3, 0, 3], fillColor: this.s_color },
        derecha: { fontSize: 10, margin: [0, 3, 0, 3], fillColor: this.s_color, alignment: 'rigth' },
        itemsTableInfoBlanco: { fontSize: 9, margin: [0, 0, 0, 0], fillColor: '#E3E3E3' },
        itemsTableInfoEmpleado: { fontSize: 9, margin: [0, -1, 0, -2], fillColor: '#E3E3E3' },
        itemsTableCentrado: { fontSize: 8, alignment: 'center' },
        tableMargin: { margin: [0, 0, 0, 0] },
        tableMarginCabecera: { margin: [0, 15, 0, 0] },
        tableMarginCabeceraEmpleado: { margin: [0, 10, 0, 0] },
        quote: { margin: [5, -2, 0, -2], italics: true },
        small: { fontSize: 8, color: 'blue', opacity: 0.5 }
      },
    };
  }

  // METODO PARA ESTRUCTURAR LA INFORMACION CONSULTADA EN EL PDF
  EstructurarDatosPDF(data: any[]): Array<any> {
    let n: any = [];
    data.forEach((selec: any) => {
      let arr_reg = selec.empleados.map((o: any) => { return o.vacunas.length })
      let reg = this.validar.SumarRegistros(arr_reg)
      // NOMBRE DE CABECERAS DEL REPORTE DE ACUERDO CON EL FILTRO DE BUSQUEDA
      let descripcion = '';
      let establecimiento = 'SUCURSAL: ' + selec.sucursal;
      if (this.bool.bool_reg === true) {
        descripcion = 'REGIMEN: ' + selec.nombre;
      }
      else if (this.bool.bool_dep === true) {
        descripcion = 'DEPARTAMENTO: ' + selec.departamento;
      }
      else if (this.bool.bool_cargo === true) {
        descripcion = 'CARGO: ' + selec.nombre;
      }
      else if (this.bool.bool_suc === true) {
        descripcion = 'CIUDAD: ' + selec.ciudad;
      }
      else if (this.bool.bool_emp === true) {
        descripcion = 'LISTA EMPLEADOS';
        establecimiento = '';
      }
      n.push({
        style: 'tableMarginCabecera',
        table: {
          widths: ['*', '*', '*'],
          headerRows: 1,
          body: [
            [
              {
                border: [true, true, false, true],
                bold: true,
                text: descripcion,
                style: 'itemsTableInfo',
              },
              {
                border: [false, true, false, true],
                bold: true,
                text: establecimiento,
                style: 'itemsTableInfo',
              },
              {
                border: [false, true, true, true],
                text: 'N° Registros: ' + reg,
                style: 'derecha',
              },
            ],
          ],
        },
      });

      // PRESENTACION DE LA INFORMACION
      selec.empleados.forEach((empl: any) => {
        let generoObj = this.generos.find((g: any) => g.id === empl.genero);
        let nombreGenero = generoObj ? generoObj.genero : "No especificado";

        let nacionalidadObj = this.nacionalidades.find((n: any) => n.id === empl.id_nacionalidad);
        let nombreNacionalidad = nacionalidadObj ? nacionalidadObj.nombre : "No especificado";

        n.push({
          style: 'tableMarginCabeceraEmpleado',
          table: {
            widths: ['*', '*', '*'],
            headerRows: 2,
            body: [
              [
                {
                  border: [true, true, false, false],
                  text: 'C.C.: ' + empl.identificacion,
                  style: 'itemsTableInfoEmpleado',
                },
                {
                  border: [true, true, false, false],
                  text: 'EMPLEADO: ' + empl.apellido + ' ' + empl.nombre,
                  style: 'itemsTableInfoEmpleado',
                },
                {
                  border: [true, true, true, false],
                  text: 'DEPARTAMENTO: ' + empl.departamento,
                  style: 'itemsTableInfoEmpleado',
                },
              ],
              [
                {
                  border: [true, false, false, false],
                  text: 'CORREO: ' + empl.correo,
                  style: 'itemsTableInfoEmpleado'
                },
                {
                  border: [true, false, false, false],
                  text: 'GENERO: ' + nombreGenero,
                  style: 'itemsTableInfoEmpleado'
                },
                {
                  border: [true, false, true, false],
                  text: 'CARGO: ' + empl.cargo,
                  style: 'itemsTableInfoEmpleado'
                }
              ],
              [
                {
                  border: [true, false, false, false],
                  text: 'REGIMEN: ' + empl.regimen,
                  style: 'itemsTableInfoEmpleado'
                },
                {
                  border: [true, false, false, false],
                  text: 'COD: ' + empl.codigo,
                  style: 'itemsTableInfoEmpleado'
                },
                {
                  border: [true, false, true, false],
                  text: 'ROL: ' + empl.rol,
                  style: 'itemsTableInfoEmpleado'
                }
              ],
            ],
          },
        });
        console.log(empl)
        n.push({
          style: 'tableMargin',
          table: {
            widths: ['*', '*', '*', '*'],
            headerRows: 1,
            body: [
              [
                { text: 'N°', style: 'tableHeader' },
                { text: 'VACUNA', style: 'tableHeader' },
                { text: 'FECHA', style: 'tableHeader' },
                { text: 'DESCRIPCIÓN', style: 'tableHeader' },
              ],
              ...empl.vacunas.map((vac: any) => {
                const fecha = this.validar.FormatearFecha(
                  vac.fecha.split('T')[0],
                  this.formato_fecha,
                  this.validar.dia_abreviado, this.idioma_fechas);

                return [
                  {
                    style: 'itemsTableCentrado',
                    text: empl.vacunas.indexOf(vac) + 1,
                  },
                  { style: 'itemsTableCentrado', text: vac.tipo_vacuna },
                  { style: 'itemsTableCentrado', text: fecha },
                  { style: 'itemsTable', text: vac.descripcion },
                ];
              }),
            ],
          },
          layout: {
            fillColor: function (rowIndex: any) {
              return rowIndex % 2 === 0 ? '#E5E7E9' : null;
            },
          },
        });
      });
    });
    return n;
  }

  /** ****************************************************************************************** **
   ** **                               METODOS PARA EXPORTAR A EXCEL                          ** **
   ** ****************************************************************************************** **/

  generos: any = [];
  ObtenerGeneros() {
    this.restGenero.ListarGeneros().subscribe(datos => {
      this.generos = datos;
    })
  }

  nacionalidades: any = [];
  ObtenerNacionalidades() {
    this.restNacionalidades.ListarNacionalidad().subscribe(datos => {
      this.nacionalidades = datos;
    })
  }

  async generarExcel() {
    let datos: any[] = [];
    let n: number = 1;
    this.data_pdf.forEach((selec) => {
      selec.empleados.map((empl: any) => {
        let generoObj = this.generos.find((g: any) => g.id === empl.genero);
        let nombreGenero = generoObj ? generoObj.genero : "No especificado";

        let nacionalidadObj = this.nacionalidades.find((n: any) => n.id === empl.id_nacionalidad);
        let nombreNacionalidad = nacionalidadObj ? nacionalidadObj.nombre : "No especificado";
        empl.vacunas.map((vac: any) => {
          datos.push([
            n++,
            empl.identificacion,
            empl.codigo,
            empl.apellido + ' ' + empl.nombre,
            nombreGenero,
            empl.ciudad,
            empl.sucursal,
            empl.regimen,
            empl.departamento,
            empl.cargo,
            empl.rol,
            empl.correo,
            vac.carnet?.length ? 'Si' : 'No',
            vac.tipo_vacuna,
            vac.fecha.split('T')[0],
            vac.descripcion,
          ])
        });
      })
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Vacunas");
    this.imagen = workbook.addImage({
      base64: this.logo,
      extension: "png",
    });

    worksheet.addImage(this.imagen, {
      tl: { col: 0, row: 0 },
      ext: { width: 220, height: 105 },
    });
    // COMBINAR CELDAS
    worksheet.mergeCells("B1:O1");
    worksheet.mergeCells("B2:O2");
    worksheet.mergeCells("B3:O3");
    worksheet.mergeCells("B4:O4");
    worksheet.mergeCells("B5:O5");

    // AGREGAR LOS VALORES A LAS CELDAS COMBINADAS
    worksheet.getCell("B1").value = localStorage.getItem('name_empresa')?.toUpperCase();
    worksheet.getCell("B2").value = 'Lista de Vacunas'.toUpperCase();

    // APLICAR ESTILO DE CENTRADO Y NEGRITA A LAS CELDAS COMBINADAS
    ["B1", "B2"].forEach((cell) => {
      worksheet.getCell(cell).alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      worksheet.getCell(cell).font = { bold: true, size: 14 };
    });

    worksheet.columns = [
      { key: "n", width: 10 },
      { key: "identificacion", width: 20 },
      { key: "codigo", width: 20 },
      { key: "apenombre", width: 20 },
      { key: "genero", width: 20 },
      { key: "ciudad", width: 20 },
      { key: "sucursal", width: 20 },
      { key: "regimen", width: 20 },
      { key: "departamento", width: 20 },
      { key: "cargo", width: 20 },
      { key: "rol", width: 20 },
      { key: "correo", width: 35 },
      { key: "carnet", width: 20 },
      { key: "tipo_vacuna", width: 20 },
      { key: "fecha", width: 20 },
      { key: "descripcion", width: 20 },
    ]

    const columnas = [
      { name: "ITEM", totalsRowLabel: "Total:", filterButton: false },
      { name: "IDENTIFICACIÓN", totalsRowLabel: "Total:", filterButton: true },
      { name: "CÓDIGO", totalsRowLabel: "", filterButton: true },
      { name: "APELLIDO NOMBRE", totalsRowLabel: "", filterButton: true },
      { name: "GÉNERO", totalsRowLabel: "", filterButton: true },
      { name: "CIUDAD", totalsRowLabel: "", filterButton: true },
      { name: "SUCURSAL", totalsRowLabel: "", filterButton: true },
      { name: "RÉGIMEN", totalsRowLabel: "", filterButton: true },
      { name: "DEPARTAMENTO", totalsRowLabel: "", filterButton: true },
      { name: "CARGO", totalsRowLabel: "", filterButton: true },
      { name: "ROL", totalsRowLabel: "", filterButton: true },
      { name: "CORREO", totalsRowLabel: "", filterButton: true },
      { name: "CARNET", totalsRowLabel: "", filterButton: true },
      { name: "TIPO VACUNA", totalsRowLabel: "", filterButton: true },
      { name: "FECHA", totalsRowLabel: "", filterButton: true },
      { name: "DESCRIPCIÓN", totalsRowLabel: "", filterButton: true },
    ]

    worksheet.addTable({
      name: "VacunasReporteTabla",
      ref: "A6",
      headerRow: true,
      totalsRow: false,
      style: {
        theme: "TableStyleMedium16",
        showRowStripes: true,
      },
      columns: columnas,
      rows: datos,
    });


    const numeroFilas = datos.length;
    for (let i = 0; i <= numeroFilas; i++) {
      for (let j = 1; j <= 15; j++) {
        const cell = worksheet.getRow(i + 6).getCell(j);
        if (i === 0) {
          cell.alignment = { vertical: "middle", horizontal: "center" };
        } else {
          cell.alignment = {
            vertical: "middle",
            horizontal: this.obtenerAlineacionHorizontal(j),
          };
        }
        cell.border = this.bordeCompleto;
      }
    }
    worksheet.getRow(6).font = this.fontTitulo;

    try {
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/octet-stream" });
      FileSaver.saveAs(blob, `Vacunas_usuarios_${this.opcionBusqueda == 1 ? 'activos' : 'inactivos'}.xlsx`);
    } catch (error) {
      console.error("Error al generar el archivo Excel:", error);
    }
  }

  private obtenerAlineacionHorizontal(
    j: number
  ): "left" | "center" | "right" {
    if (j === 1 || j === 9 || j === 10 || j === 11) {
      return "center";
    } else {
      return "left";
    }
  }

  /** ****************************************************************************************** **
   ** **                   METODOS PARA EXTRAER DATOS PARA LA PREVISUALIZACION                ** **
   ** ****************************************************************************************** **/
  ExtraerDatos() {
    this.arr_vac = [];
    let n = 0;
    this.data_pdf.forEach((empl: any) => {
      empl.empleados.forEach((vac: any) => {
        let generoObj = this.generos.find((g: any) => g.id === vac.genero);
        let nombreGenero = generoObj ? generoObj.genero : "No especificado";

        let nacionalidadObj = this.nacionalidades.find((n: any) => n.id === vac.id_nacionalidad);
        let nombreNacionalidad = nacionalidadObj ? nacionalidadObj.nombre : "No especificado";
        vac.vacunas.forEach((usu: any) => {
          const fecha = this.validar.FormatearFecha(
            usu.fecha.split('T')[0],
            this.formato_fecha,
            this.validar.dia_abreviado, this.idioma_fechas);

          n = n + 1;
          let ele = {
            n: n,
            id_empleado: vac.id,
            identificacion: vac.identificacion,
            codigo: vac.codigo,
            nombre: vac.nombre,
            apellido: vac.apellido,
            empleado: vac.apellido + ' ' + vac.nombre,
            genero: nombreGenero,
            ciudad: vac.ciudad,
            sucursal: vac.sucursal,
            regimen: vac.regimen,
            departamento: vac.departamento,
            cargo: vac.cargo,
            rol: vac.rol,
            correo: vac.correo,
            carnet: usu.carnet,
            vacuna: usu.tipo_vacuna,
            fecha,
            descripcion: usu.descripcion,
          };
          this.arr_vac.push(ele);
        });
      });
    });
  }

  /** ****************************************************************************************** **
   **                   VARIOS METODOS COMPLEMENTARIOS AL FUNCIONAMIENTO.                        **
   ** ****************************************************************************************** **/

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedSuc() {
    const numSelected = this.selectionSuc.selected.length;
    return numSelected === this.sucursales.length;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleSuc() {
    this.isAllSelectedSuc()
      ? this.selectionSuc.clear()
      : this.sucursales.forEach((row: any) => this.selectionSuc.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA.
  checkboxLabelSuc(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedSuc() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionSuc.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1
      }`;
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedReg() {
    const numSelected = this.selectionReg.selected.length;
    return numSelected === this.regimen.length;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleReg() {
    this.isAllSelectedReg()
      ? this.selectionReg.clear()
      : this.regimen.forEach((row: any) => this.selectionReg.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA.
  checkboxLabelReg(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedReg() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionReg.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1
      }`;
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedCar() {
    const numSelected = this.selectionCar.selected.length;
    return numSelected === this.cargos.length;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleCar() {
    this.isAllSelectedCar()
      ? this.selectionCar.clear()
      : this.cargos.forEach((row: any) => this.selectionCar.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelCar(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedCar() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionCar.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1
      }`;
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedDep() {
    const numSelected = this.selectionDep.selected.length;
    return numSelected === this.departamentos.length;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleDep() {
    this.isAllSelectedDep()
      ? this.selectionDep.clear()
      : this.departamentos.forEach((row: any) => this.selectionDep.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA.
  checkboxLabelDep(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedDep() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionDep.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1
      }`;
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedEmp() {
    const numSelected = this.selectionEmp.selected.length;
    return numSelected === this.empleados.length;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleEmp() {
    this.isAllSelectedEmp()
      ? this.selectionEmp.clear()
      : this.empleados.forEach((row: any) => this.selectionEmp.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA.
  checkboxLabelEmp(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedEmp() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionEmp.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1
      }`;
  }

  // METODO DE CONTROL DE PAGINACIÓN
  ManejarPagina(e: PageEvent) {
    if (this.bool.bool_suc === true) {
      this.tamanio_pagina_suc = e.pageSize;
      this.numero_pagina_suc = e.pageIndex + 1;
    }
    else if (this.bool.bool_reg === true) {
      this.tamanio_pagina_reg = e.pageSize;
      this.numero_pagina_reg = e.pageIndex + 1;
    }
    else if (this.bool.bool_dep === true) {
      this.tamanio_pagina_dep = e.pageSize;
      this.numero_pagina_dep = e.pageIndex + 1;
    }
    else if (this.bool.bool_cargo === true) {
      this.tamanio_pagina_dep = e.pageSize;
      this.numero_pagina_dep = e.pageIndex + 1;
    }
    else if (this.bool.bool_emp === true) {
      this.tamanio_pagina_emp = e.pageSize;
      this.numero_pagina_emp = e.pageIndex + 1;
    }
  }

  // METODO DE CONTROL DE PAGINACION
  ManejarPaginaDetalle(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // METODO PARA INGRESAR DATOS DE LETRAS O NUMEROS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

  //ENVIAR DATOS A LA VENTANA DE DETALLE
  VerDatos() {
    this.verDetalle = true;
    this.ExtraerDatos();
  }

  // METODO PARA REGRESAR A LA PAGINA ANTERIOR
  Regresar() {
    this.verDetalle = false;
    this.paginatorDetalle.firstPage();
  }
}
