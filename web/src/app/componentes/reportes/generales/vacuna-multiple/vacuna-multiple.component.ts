// IMPORTAR LIBRERIAS
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ITableEmpleados } from 'src/app/model/reportes.model';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';
import { DateTime } from 'luxon';

import * as xlsx from 'xlsx';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// IMPORTAR SERVICIOS
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { ValidacionesService } from '../../../../servicios/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { ReportesService } from 'src/app/servicios/reportes/reportes.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { VacunasService } from 'src/app/servicios/reportes/vacunas/vacunas.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';

import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-vacuna-multiple',
  templateUrl: './vacuna-multiple.component.html',
  styleUrls: ['./vacuna-multiple.component.css'],
})

export class VacunaMultipleComponent implements OnInit, OnDestroy {

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

  hipervinculo: string = environment.url;

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

  constructor(
    private reporteService: ReportesService, // SERVICIO DATOS DE BUSQUEDA GENERALES DE REPORTE
    private informacion: DatosGeneralesService,
    private parametro: ParametrosService,
    private restEmpre: EmpresaService, // SERVICIO DATOS GENERALES DE EMPRESA
    private R_vacuna: VacunasService, // SERVICIO DATOS PARA REPORTE DE VACUNAS
    private toastr: ToastrService, // VARIABLE DE MANEJO DE NOTIFICACIONES
    public restUsuario: UsuarioService,
    public validar: ValidacionesService,
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado') as string);
    this.ObtenerLogo();
    this.ObtenerColores();
  }

  ngOnInit(): void {
    this.opcionBusqueda = this.tipoUsuario === 'activo' ? 1 : 2;
    this.BuscarInformacionGeneral(this.opcionBusqueda);
    this.BuscarParametro();
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
          'Ups!!! algo salio mal.',
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
            this.ExportarExcel();
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

  GenerarPDF(action: any) {
    const documentDefinition = this.DefinirInformacionPDF();
    let doc_name = `Vacunas_usuarios_${this.opcionBusqueda == 1 ? 'activos' : 'inactivos'}.pdf`;
    switch (action) {
      case 'open':
        pdfMake.createPdf(documentDefinition).open();
        break;
      case 'print':
        pdfMake.createPdf(documentDefinition).print();
        break;
      case 'download':
        pdfMake.createPdf(documentDefinition).download(doc_name);
        break;
      default:
        pdfMake.createPdf(documentDefinition).open();
        break;
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
        n.push({
          style: 'tableMarginCabeceraEmpleado',
          table: {
            widths: ['*', 'auto', 'auto'],
            headerRows: 2,
            body: [
              [
                {
                  border: [true, true, false, false],
                  text: 'C.C.: ' + empl.cedula,
                  style: 'itemsTableInfoEmpleado',
                },
                {
                  border: [true, true, false, false],
                  text: 'EMPLEADO: ' + empl.apellido + ' ' + empl.nombre,
                  style: 'itemsTableInfoEmpleado',
                },
                {
                  border: [true, true, true, false],
                  text: 'COD: ' + empl.codigo,
                  style: 'itemsTableInfoEmpleado',
                },
              ],
              [
                {
                  border: [true, false, false, false],
                  text: 'RÉGIMEN LABORAL: ' + empl.regimen,
                  style: 'itemsTableInfoEmpleado'
                },
                {
                  border: [true, false, false, false],
                  text: 'DEPARTAMENTO: ' + empl.departamento,
                  style: 'itemsTableInfoEmpleado'
                },
                {
                  border: [true, false, true, false],
                  text: 'CARGO: ' + empl.cargo,
                  style: 'itemsTableInfoEmpleado'
                }
              ],
            ],
          },
        });
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
  ExportarExcel(): void {
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(
      this.EstructurarDatosExcel(this.data_pdf)
    );
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'Vacunas');
    xlsx.writeFile(wb, `Vacunas_usuarios_${this.opcionBusqueda == 1 ? 'activos' : 'inactivos'}.xlsx`);
  }

  EstructurarDatosExcel(array: Array<any>) {
    let nuevo: Array<any> = [];
    let c = 0;
    array.forEach((selec) => {
      selec.empleados.forEach((empl: any) => {
        empl.vacunas.forEach((vac: any) => {
          c = c + 1;
          let ele = {
            'N°': c,
            Cédula: empl.cedula,
            Código: empl.codigo,
            Empleado: empl.apellido + ' ' + empl.nombre,
            Género: empl.genero == 1 ? 'M' : 'F',
            Ciudad: empl.ciudad,
            Sucursal: empl.sucursal,
            Régimen: empl.regimen,
            Departamento: empl.departamento,
            Cargo: empl.cargo,
            Correo: empl.correo,
            Carnet: vac.carnet?.length ? 'Si' : 'No',
            Vacuna: vac.tipo_vacuna,
            Fecha: vac.fecha.split('T')[0],
            Descripción: vac.descripcion,
          };
          nuevo.push(ele);
        });
      });
    });

    return nuevo;
  }

  /** ****************************************************************************************** **
   ** **                   METODOS PARA EXTRAER DATOS PARA LA PREVISUALIZACION                ** **
   ** ****************************************************************************************** **/
  ExtraerDatos() {
    this.arr_vac = [];
    let n = 0;
    this.data_pdf.forEach((empl: any) => {
      empl.empleados.forEach((vac: any) => {
        vac.vacunas.forEach((usu: any) => {
          const fecha = this.validar.FormatearFecha(
            usu.fecha.split('T')[0],
            this.formato_fecha,
            this.validar.dia_abreviado, this.idioma_fechas);

          n = n + 1;
          let ele = {
            n: n,
            id_empleado: vac.id,
            cedula: vac.cedula,
            codigo: vac.codigo,
            empleado: vac.apellido + ' ' + vac.nombre,
            genero: vac.genero,
            ciudad: vac.ciudad,
            sucursal: vac.sucursal,
            regimen: vac.regimen,
            departamento: vac.departamento,
            cargo: vac.cargo,
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
