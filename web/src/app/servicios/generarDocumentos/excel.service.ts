import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';

import * as FileSaver from 'file-saver';
import ExcelJS from "exceljs";

import { EmpresaService } from '../configuracion/parametrizacion/catEmpresa/empresa.service';
import { EmpleadoService } from '../usuarios/empleado/empleadoRegistro/empleado.service';
import { ValidacionesService } from '../generales/validaciones/validaciones.service';
import { AccionPersonalService } from '../modulos/modulo-acciones-personal/accionPersonal/accion-personal.service';

@Injectable({
  providedIn: 'root'
})

export class ExcelService {

  private imagen: any;
  private imagenMinisterio: any;

  // VARIABLES PARA AUDITORIA
  ips_locales: any = '';
  user_name: string | null;
  ip: string | null;

  datosPedido: any

  constructor(
    public restE: EmpleadoService,
    private rest: AccionPersonalService,
    public restEmpre: EmpresaService,
    private validar: ValidacionesService,
  ) {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });
    this.ObtenerTipoAccionesPersonal();
    this.ObtenerLogo();
    this.ObtenerColores();
    this.ObtenerLogoMinisterio();
  }

  // METODO PARA OBTENER TIPOS DE ACCIONES
  tipo_acciones: any = [];
  ObtenerTipoAccionesPersonal() {
    this.rest.ConsultarTipoAccionPersonal().subscribe(datos => {
      this.tipo_acciones = datos;
    });
  }

  // METODO PARA OBTENER EL LOGO DE LA EMPRESA
  logo: any = String;
  ObtenerLogo() {
    this.restEmpre.LogoEmpresaImagenBase64(localStorage.getItem('empresa') as string).subscribe(res => {
      this.logo = 'data:image/jpeg;base64,' + res.imagen;
    });
  }

    // OBTENER LOGO DEL MINISTERIO DE TRABAJO
  logoMinisterios: any = String;
  ObtenerLogoMinisterio() {
    this.rest.LogoImagenBase64().subscribe((res) => {
      this.logoMinisterios = "data:image/jpeg;base64," + res.imagen;
      
    });
  }

  // METODO PARA OBTENER COLORES Y MARCA DE AGUA DE EMPRESA
  p_color: any;
  s_color: any;
  frase: any;
  ObtenerColores() {
    this.restEmpre.ConsultarDatosEmpresa(parseInt(localStorage.getItem('empresa') as string)).subscribe(res => {
      this.p_color = res[0].color_principal;
      this.s_color = res[0].color_secundario;
      this.frase = res[0].marca_agua;
    });
  }

  textoFijo: string = '';
  async generarExcel(datosPedidoSelected: any) {

    this.datosPedido = datosPedidoSelected[0];
    console.log('datos del pedido selecionado: ', this.datosPedido);

    const tipo_acciones_perso: any[] = [];
    this.tipo_acciones.forEach((accion: any, index: number) => {
      tipo_acciones_perso.push([
        index + 1,
        accion.nombre,
        accion.descripcion,
        accion.base_legal
      ]);

      if (accion.descripcion == this.datosPedido.descripcion) {
        return this.textoFijo = accion.base_legal.replace(/\n\s*\n/g, ' ');
      }

    });
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Tipos accion personal");

    this.imagen = workbook.addImage({
      base64: this.logo,
      extension: "png",
    });

    this.imagenMinisterio = workbook.addImage({
      base64: this.logoMinisterios,
      extension: "png",
    })


    //APLICAR ESTILOS DE WIDTH (ANCHO) A LA COLUMNAS
    worksheet.getColumn('A').width = 1;
    worksheet.getColumn('B').width = 9;
    worksheet.getColumn('C').width = 9;
    worksheet.getColumn('D').width = 3;
    worksheet.getColumn('E').width = 1;
    worksheet.getColumn('F').width = 9;
    worksheet.getColumn('G').width = 11;
    worksheet.getColumn('H').width = 3;
    worksheet.getColumn('I').width = 1;
    worksheet.getColumn('J').width = 8;
    worksheet.getColumn('K').width = 9;
    worksheet.getColumn('L').width = 3;
    worksheet.getColumn('N').width = 9;
    worksheet.getColumn('M').width = 10;
    worksheet.getColumn('O').width = 3;
    worksheet.getColumn('P').width = 1;

    worksheet.getRow(1).height = 30;
    worksheet.getRow(2).height = 1;
    worksheet.getRow(3).height = 30;
    worksheet.getRow(4).height = 28;
    worksheet.getRow(5).height = 28;
    worksheet.getRow(6).height = 28;
    worksheet.getRow(7).height = 30;
    worksheet.getRow(8).height = 22;
    worksheet.getRow(9).height = 24;
    worksheet.getRow(10).height = 28;
    worksheet.getRow(11).height = 28;
    worksheet.getRow(12).height = 5;
    worksheet.getRow(21).height = 1;
    worksheet.getRow(22).height = 28;
    worksheet.getRow(23).height = 200;
    worksheet.getRow(24).height = 30;
    worksheet.getRow(25).height = 1;
    for(var i=26; i<=43; i++){
      worksheet.getRow(i).height = 20;
    }
    worksheet.getRow(44).height = 5;
    worksheet.getRow(45).height = 30;
    worksheet.getRow(46).height = 5;
    worksheet.getRow(48).height = 20;
    worksheet.getRow(49).height = 30;
    worksheet.getRow(50).height = 5;
    worksheet.getRow(53).height = 20;
    worksheet.getRow(54).height = 5;
    worksheet.getRow(55).height = 30;
    worksheet.getRow(56).height = 40;
    worksheet.getRow(57).height = 20;
    worksheet.getRow(58).height = 90;
    worksheet.getRow(62).height = 20;
    worksheet.getRow(63).height = 40;
    worksheet.getRow(64).height = 1;
    worksheet.getRow(65).height = 30;
    worksheet.getRow(66).height = 1;
    worksheet.getRow(67).height = 30;
    worksheet.getRow(69).height = 80;
    worksheet.getRow(70).height = 80;
    worksheet.getRow(77).height = 15;
    worksheet.getRow(78).height = 15;
    worksheet.getRow(79).height = 1;
    worksheet.getRow(80).height = 40;
    worksheet.getRow(81).height = 80;
    worksheet.getRow(82).height = 80;
    worksheet.getRow(87).height = 100;
    worksheet.getRow(88).height = 20;
    worksheet.getRow(89).height = 50;
    worksheet.getRow(90).height = 20;
    worksheet.getRow(91).height = 40;
    worksheet.getRow(92).height = 50;
    worksheet.getRow(94).height = 50;
    worksheet.getRow(100).height = 70;
    worksheet.getRow(101).height = 70;
    worksheet.getRow(102).height = 30;
    worksheet.getRow(108).height = 50;
    worksheet.getRow(109).height = 50;

    // COMBINAR CELDAS
    worksheet.mergeCells("A1:D5");
    worksheet.mergeCells("E1:J5");
    worksheet.mergeCells("K1:P1");
    worksheet.mergeCells("K2:P2");
    worksheet.mergeCells("K3:L3");
    worksheet.mergeCells("M3:P3");
    worksheet.mergeCells("K4:P4");
    worksheet.mergeCells("K5:P5");
    worksheet.mergeCells("A6:H6");
    worksheet.mergeCells("I6:P6");
    worksheet.mergeCells("A7:H7");
    worksheet.mergeCells("I7:P7");
    worksheet.mergeCells("A8:D9");
    worksheet.mergeCells("E8:H9");
    worksheet.mergeCells("I8:P8");
    worksheet.mergeCells("I9:L9");
    worksheet.mergeCells("M9:P9");
    worksheet.mergeCells("A10:D10");
    worksheet.mergeCells("E10:H10");
    worksheet.mergeCells("I10:L10");
    worksheet.mergeCells("M10:P10");
    worksheet.mergeCells("A11:P11");

    // COMBINAR CELDAS PARA LOS CHECKBOX
    worksheet.mergeCells("A12:P12");
    worksheet.mergeCells("A13:A19");
    worksheet.mergeCells("P13:P19");
    worksheet.mergeCells("A21:P21");
    worksheet.mergeCells("A22:P22");

    // COMBINAR PRIMERA COLUMNA PARA LOS CHECKBOX
    worksheet.mergeCells("B13:C13");
    worksheet.mergeCells("B14:C14");
    worksheet.mergeCells("B15:C15");
    worksheet.mergeCells("B16:C16");
    worksheet.mergeCells("B17:C17");
    worksheet.mergeCells("B18:C18");

    // COMBINAR SEGUNDA COLUMNA PARA LOS CHECKBOX
    worksheet.mergeCells("F13:G13");
    worksheet.mergeCells("F14:G14");
    worksheet.mergeCells("F15:G15");
    worksheet.mergeCells("F16:G16");
    worksheet.mergeCells("F17:G17");
    worksheet.mergeCells("F18:G18");

    // COMBINAR TERCERA COLUMNA PARA LOS CHECKBOX
    worksheet.mergeCells("J13:K13");
    worksheet.mergeCells("J14:K14");
    worksheet.mergeCells("J15:K15");
    worksheet.mergeCells("J16:K16");
    worksheet.mergeCells("J17:K17");
    worksheet.mergeCells("J18:K18");

    worksheet.mergeCells("M13:N13");
    worksheet.mergeCells("M14:N14");
    worksheet.mergeCells("M15:O18");

    worksheet.mergeCells("B19:G19");
    worksheet.mergeCells("H19:O19");

    worksheet.mergeCells("M20:P20");
    worksheet.mergeCells("B23:O23");
    worksheet.mergeCells("A24:H24");
    worksheet.mergeCells("I24:P24");
    worksheet.mergeCells("A25:P25");

    worksheet.mergeCells("A26:H26");
    worksheet.mergeCells("I26:P26");
    worksheet.mergeCells("A27:H27");
    worksheet.mergeCells("I27:P27");
    worksheet.mergeCells("A28:H28");
    worksheet.mergeCells("I28:P28");
    worksheet.mergeCells("A29:H29");
    worksheet.mergeCells("I29:P29");
    worksheet.mergeCells("A30:H30");
    worksheet.mergeCells("I30:P30");
    worksheet.mergeCells("A31:H31");
    worksheet.mergeCells("I31:P31");
    worksheet.mergeCells("A32:H32");
    worksheet.mergeCells("I32:P32");
    worksheet.mergeCells("A33:H33");
    worksheet.mergeCells("I33:P33");
    worksheet.mergeCells("A34:H34");
    worksheet.mergeCells("I34:P34");
    worksheet.mergeCells("A35:H35");
    worksheet.mergeCells("I35:P35");
    worksheet.mergeCells("A36:H36");
    worksheet.mergeCells("I36:P36");
    worksheet.mergeCells("A37:H37");
    worksheet.mergeCells("I37:P37");
    worksheet.mergeCells("A38:H38");
    worksheet.mergeCells("I38:P38");
    worksheet.mergeCells("A39:H39");
    worksheet.mergeCells("I39:P39");
    worksheet.mergeCells("A40:H40");
    worksheet.mergeCells("I40:P40");
    worksheet.mergeCells("A41:H41");
    worksheet.mergeCells("I41:P41");
    worksheet.mergeCells("A42:H42");
    worksheet.mergeCells("I42:P42");
    worksheet.mergeCells("A43:H44");
    worksheet.mergeCells("I43:P44");
    worksheet.mergeCells("A45:P45");
    worksheet.mergeCells("A46:P46");
    worksheet.mergeCells("A47:A53");
    worksheet.mergeCells("P47:P53");
    worksheet.mergeCells("C47:G47");
    worksheet.mergeCells("I47:M47");
    worksheet.mergeCells("N47:O47");
    worksheet.mergeCells("B48:G48");
    worksheet.mergeCells("C49:D49");

    worksheet.mergeCells("B51:G51");
    worksheet.mergeCells("B52:D52");
    worksheet.mergeCells("F52:G52");
    worksheet.mergeCells("K52:N52");
    worksheet.mergeCells("B53:D53");
    worksheet.mergeCells("F53:G53");
    worksheet.mergeCells("K53:N53");

    worksheet.mergeCells("A54:P54");
    worksheet.mergeCells("A55:P55");
    worksheet.mergeCells("A56:H56");
    worksheet.mergeCells("I56:P56");
    worksheet.mergeCells("A57:H57");
    worksheet.mergeCells("I57:P57");
    worksheet.mergeCells("A58:H58");
    worksheet.mergeCells("I58:P58");
    
    
    
    worksheet.mergeCells("C59:G59");
    worksheet.mergeCells("C60:G60");
    worksheet.mergeCells("C61:G61");
    worksheet.mergeCells("J59:J59");
    worksheet.mergeCells("J60:J60");
    worksheet.mergeCells("J61:J61");
    worksheet.mergeCells("K59:O59");
    worksheet.mergeCells("K60:O60");
    worksheet.mergeCells("K61:O61");

    worksheet.mergeCells("A62:H62");
    worksheet.mergeCells("I62:P62");
    worksheet.mergeCells("A63:G63");
    worksheet.mergeCells("H63:P63");

    worksheet.mergeCells("A64:P64");
    worksheet.mergeCells("A65:P65");
    worksheet.mergeCells("A66:P66");
    worksheet.mergeCells("A67:H67");
    worksheet.mergeCells("I67:P67");

    worksheet.mergeCells("A68:H68");
    worksheet.mergeCells("I68:P68");
    worksheet.mergeCells("A69:H69");
    worksheet.mergeCells("I69:P69");
    worksheet.mergeCells("A70:H70");
    worksheet.mergeCells("I70:P70");

    worksheet.mergeCells("C71:G71");
    worksheet.mergeCells("K71:O71");
    worksheet.mergeCells("C72:G72");
    worksheet.mergeCells("K72:O72");
    worksheet.mergeCells("C73:G73");
    worksheet.mergeCells("K73:O73");
    worksheet.mergeCells("C74:G74");

    worksheet.mergeCells("K74:O77");
    worksheet.mergeCells("A79:P79");

    worksheet.mergeCells("A80:F80");
    worksheet.mergeCells("G80:K80");
    worksheet.mergeCells("L80:P80");

    worksheet.mergeCells("A81:F81");
    worksheet.mergeCells("G81:K81");
    worksheet.mergeCells("L81:P81");
    worksheet.mergeCells("A82:F82");
    worksheet.mergeCells("G82:K82");
    worksheet.mergeCells("L82:P82");
    worksheet.mergeCells("B83:F83");
    worksheet.mergeCells("G83:K83");
    worksheet.mergeCells("L83:O83");
    worksheet.mergeCells("B84:F84");
    worksheet.mergeCells("G84:K84");
    worksheet.mergeCells("L84:O84");
    worksheet.mergeCells("B85:F85");
    worksheet.mergeCells("G85:K85");
    worksheet.mergeCells("L85:O85");
    worksheet.mergeCells("A86:F86");
    worksheet.mergeCells("G86:K86");
    worksheet.mergeCells("L86:P86");
    
    worksheet.mergeCells("A87:E87");
    worksheet.mergeCells("F87:K87");
    worksheet.mergeCells("L87:P87");
    worksheet.mergeCells("A88:P88");
    worksheet.mergeCells("A89:P89");
    worksheet.mergeCells("L90:P90");
    worksheet.mergeCells("A91:P91");

    worksheet.mergeCells("B93:C93");

    worksheet.mergeCells("A94:P94");
    worksheet.mergeCells("D95:F95");
    worksheet.mergeCells("K95:L95");
    worksheet.mergeCells("A96:P96");
    worksheet.mergeCells("D97:M99");

    worksheet.mergeCells("F101:K101");
    worksheet.mergeCells("F102:K102");
    worksheet.mergeCells("G104:K104");
    worksheet.mergeCells("G105:K105");
    worksheet.mergeCells("A107:P107");
    worksheet.mergeCells("A109:G109");
    worksheet.mergeCells("H109:P109");

    // AGREGAR LOS VALORES A LAS CELDAS COMBINADAS
    worksheet.getCell("K1").value = "Acción de Personal".toUpperCase();
    worksheet.getCell("K3").value = "Nro.";
    worksheet.getCell("M3").value = this.datosPedido.numero_accion_personal;
    worksheet.getCell("K4").value = "Fecha de elaboración".toUpperCase();
    const fecha = DateTime.fromISO(this.datosPedido.fecha_elaboracion, { zone: 'utc' }).setZone('America/Guayaquil');
    worksheet.getCell("K5").value = fecha.toFormat('yyyy-MM-dd');

    worksheet.getCell("A6").value = "apellidos".toUpperCase();
    let arrayNombres = this.datosPedido.nombres.split(" ");
    let nombres = arrayNombres[0].toUpperCase() + ' ' + arrayNombres[1].toUpperCase()
    let apellido = arrayNombres[2].toUpperCase() + ' ' + arrayNombres[3].toUpperCase()
    worksheet.getCell("A7").value = apellido;
    worksheet.getCell("I7").value = nombres;
    worksheet.getCell("I6").value = "nombres".toUpperCase();

    worksheet.getCell("A8").value = "documento de identificación".toUpperCase();
    worksheet.getCell("A10").value = "CEDULA";
    worksheet.getCell("E8").value = "nro. de identifiación".toUpperCase();
    worksheet.getCell("E10").value = this.datosPedido.cedula_empleado;
    worksheet.getCell("I8").value = "rige:".toUpperCase();
    worksheet.getCell("I9").value = "Desde ".toUpperCase() + "(dd-mm-aaaa)"
    const fecha_desde = DateTime.fromISO(this.datosPedido.fecha_rige_desde, { zone: 'utc' }).setZone('America/Guayaquil');
    worksheet.getCell("I10").value = fecha_desde.toFormat('yyyy-MM-dd');

    worksheet.getCell("M9").value = "Hasta ".toUpperCase() + "(dd-mm-aaaa)(cuando aplica)"
    const fecha_hasta = DateTime.fromISO(this.datosPedido.fecha_rige_hasta, { zone: 'utc' }).setZone('America/Guayaquil');
    worksheet.getCell("M10").value = fecha_hasta.toFormat('yyyy-MM-dd');
    worksheet.getCell("A11").value = "  Escoja una opción (según lo estipulado en el artículo 21 del Reglamento General a la Ley Orgánica del Servicio Público)"

    worksheet.getCell("B13").value = "ingreso".toUpperCase()
    worksheet.getCell("D13").value = (this.datosPedido.accion_personal != null && this.datosPedido.accion_personal.toUpperCase() == 'INGRESO' ? "X" : "");
    worksheet.getCell("B14").value = "reingreso".toUpperCase()
    worksheet.getCell("D14").value = (this.datosPedido.accion_personal != null && this.datosPedido.accion_personal.toUpperCase() == 'REINGRESO' ? "X" : "");
    worksheet.getCell("B15").value = "restitución".toUpperCase()
    worksheet.getCell("D15").value = (this.datosPedido.accion_personal != null && this.datosPedido.accion_personal.toUpperCase() == 'RESTITUCIÓN' ? "X" : "");
    worksheet.getCell("B16").value = "reintegro".toUpperCase()
    worksheet.getCell("D16").value = (this.datosPedido.accion_personal != null && this.datosPedido.accion_personal.toUpperCase() == 'REINTEGRO' ? "X" : "");
    worksheet.getCell("B17").value = "ascenso".toUpperCase()
    worksheet.getCell("D17").value = (this.datosPedido.accion_personal != null && this.datosPedido.accion_personal.toUpperCase() == 'ASCENSO' ? "X" : "");
    worksheet.getCell("B18").value = "traslado".toUpperCase()
    worksheet.getCell("D18").value = (this.datosPedido.accion_personal != null && this.datosPedido.accion_personal.toUpperCase() == 'TRASLADO' ? "X" : "");

    worksheet.getCell("F13").value = "traspaso".toUpperCase()
    worksheet.getCell("H13").value = (this.datosPedido.accion_personal != null && this.datosPedido.accion_personal.toUpperCase() == 'TRASPASO' ? "X" : "");
    worksheet.getCell("F14").value = "cambio administrativo".toUpperCase()
    worksheet.getCell("H14").value = (this.datosPedido.accion_personal != null && this.datosPedido.accion_personal.toUpperCase() == 'CAMBIO ADMINISTRATIVO' ? "X" : "");
    worksheet.getCell("F15").value = "intercambio voluntario".toUpperCase()
    worksheet.getCell("H15").value = (this.datosPedido.accion_personal != null && this.datosPedido.accion_personal.toUpperCase() == 'INTERCAMBIO VOLUNTARIO' ? "X" : "");
    worksheet.getCell("F16").value = "licencia".toUpperCase()
    worksheet.getCell("H16").value = (this.datosPedido.accion_personal != null && this.datosPedido.accion_personal.toUpperCase() == 'LICENCIA' ? "X" : "");
    worksheet.getCell("F17").value = "comisión de servicios".toUpperCase()
    worksheet.getCell("H17").value = (this.datosPedido.accion_personal != null && this.datosPedido.accion_personal.toUpperCase() == 'COMISIÓN DE SERVICIOS' ? "X" : "");
    worksheet.getCell("F18").value = "sanciones".toUpperCase()
    worksheet.getCell("H18").value = (this.datosPedido.accion_personal != null && this.datosPedido.accion_personal.toUpperCase() == 'SANCIONES' ? "X" : "");

    worksheet.getCell("J13").value = "incremento rmu".toUpperCase()
    worksheet.getCell("L13").value = (this.datosPedido.accion_personal != null && this.datosPedido.accion_personal.toUpperCase() == 'INCREMENTO RMU' ? "X" : "");
    worksheet.getCell("J14").value = "subrogación".toUpperCase()
    worksheet.getCell("L14").value = (this.datosPedido.accion_personal != null && this.datosPedido.accion_personal.toUpperCase() == 'SUBROGACIÓN' ? "X" : "");
    worksheet.getCell("J15").value = "encargo".toUpperCase()
    worksheet.getCell("L15").value = (this.datosPedido.accion_personal != null && this.datosPedido.accion_personal.toUpperCase() == 'ENCARGO' ? "X" : "");
    worksheet.getCell("J16").value = "cesación de funciones".toUpperCase()
    worksheet.getCell("L16").value = (this.datosPedido.accion_personal != null && this.datosPedido.accion_personal.toUpperCase() == 'CESACIÓN DE FUNCIONES' ? "X" : "");
    worksheet.getCell("J17").value = "destitución".toUpperCase()
    worksheet.getCell("L17").value = (this.datosPedido.accion_personal != null && this.datosPedido.accion_personal.toUpperCase() == 'DESTITUCIÓN' ? "X" : "");
    worksheet.getCell("J18").value = "vacaciones".toUpperCase()
    worksheet.getCell("L18").value = (this.datosPedido.accion_personal != null && this.datosPedido.accion_personal.toUpperCase() == 'VACACIONES' ? "X" : "");

    worksheet.getCell("M13").value = " revisión clasi. puesto".toUpperCase()
    worksheet.getCell("O13").value = (this.datosPedido.accion_personal != null && this.datosPedido.accion_personal.toUpperCase() == 'REVISIÓN CLASI. PUESTO' ? "X" : "");
    worksheet.getCell("M14").value = " otro (detallar)".toUpperCase()
    worksheet.getCell("O14").value = (this.datosPedido.accion_personal != null && this.datosPedido.accion_personal.toUpperCase() == 'OTRO' ? "X" : "");
    worksheet.getCell("M15").value = this.datosPedido.detalle_otro;

    worksheet.getCell("B19").value = "EN CASO DE REQUERIR ESPECIFICACIÓN DE LO SELECCIONADO: ".toUpperCase()
    worksheet.getCell("H19").value = this.datosPedido.especificacion
    worksheet.getCell("B20").value = " * PRESENTÓ LA DECLARACIÓN JURADA (número 2 del art. 3 RLOSEP)   SI"
    worksheet.getCell("H20").value = (this.datosPedido.declaracion_jurada == true ? "X" : "");
    worksheet.getCell("K20").value = "NO APLICA"
    worksheet.getCell("L20").value = (this.datosPedido.declaracion_jurada == false ? "X" : "");
    worksheet.getCell("B22").value = "   MOTIVACIÓN: (adjuntar anexo si lo posee) "
    worksheet.getCell("B23").value = (this.datosPedido.adicion_base_legal != null || this.textoFijo != '' ? (this.textoFijo + '\n' + this.datosPedido.adicion_base_legal) + '\n' + ((this.datosPedido.observacion != null && this.datosPedido.observacion != '') ? 'Observación: '+this.datosPedido.observacion : '' ) : "(Explicar el motivo por el cual se está colocando el movimiento escogido en el anterior paso)");

    worksheet.getCell("A24").value = "SITUACION ACTUAL"
    worksheet.getCell("I24").value = "SITUACION PROPUESTA"

    worksheet.getCell("A26").value = "  PROCESO INSTITUCIONAL: (ESCOGER DE LA LISTA DESPLEGABLE)"
    worksheet.getCell("A27").value = " " + this.datosPedido.proceso_actual
    worksheet.getCell("I26").value = " PROCESO INSTITUCIONAL: (ESCOGER DE LA LISTA DESPLEGABLE)"
    worksheet.getCell("I27").value = " " + (this.datosPedido.proceso_propuesto ? this.datosPedido.proceso_propuesto : "")
    worksheet.getCell("A28").value = "  NIVEL DE GESTIÓN: (VICEMINISTERIO,SUBSECRETARÍA,COORDINACIÓN,ETC)"
    worksheet.getCell("A29").value = " " + this.datosPedido.nivel_gestion_actual
    worksheet.getCell("I28").value = " NIVEL DE GESTIÓN: (VICEMINISTERIO,SUBSECRETARÍA,COORDINACIÓN,ETC)"
    worksheet.getCell("I29").value = " " + (this.datosPedido.nivel_gestion_propuesto ? this.datosPedido.nivel_gestion_propuesto : "")
    worksheet.getCell("A30").value = "  UNIDAD ADMINISTRATIVA: (UNIDAD, GESTIÓN INTERNA)"
    worksheet.getCell("A31").value = " " + this.datosPedido.unidad_administrativa
    worksheet.getCell("I30").value = " UNIDAD ADMINISTRATIVA: (UNIDAD, GESTIÓN INTERNA)"
    worksheet.getCell("I31").value = " " + (this.datosPedido.unidad_administrativa_propuesta ? this.datosPedido.unidad_administrativa_propuesta : "")
    worksheet.getCell("A32").value = "  LUGAR DE TRABAJO: (CIUDAD)"
    worksheet.getCell("A33").value = " " + this.datosPedido.lugar_trabajo_actual
    worksheet.getCell("I32").value = " LUGAR DE TRABAJO: (CIUDAD)"
    worksheet.getCell("I33").value = " " + (this.datosPedido.lugar_trabajo_propuesto ? this.datosPedido.lugar_trabajo_propuesto : "")
    worksheet.getCell("A34").value = "  DENOMINACIÓN DEL PUESTO:"
    worksheet.getCell("A35").value = " " + this.datosPedido.cargo_actual
    worksheet.getCell("I34").value = " DENOMINACIÓN DEL PUESTO:"
    worksheet.getCell("I35").value = " " + (this.datosPedido.cargo_propuesto ? this.datosPedido.cargo_propuesto : "")
    worksheet.getCell("A36").value = "  GRUPO OCUPACIONAL:"
    worksheet.getCell("A37").value = " " + this.datosPedido.grupo_ocupacional_actual
    worksheet.getCell("I36").value = " GRUPO OCUPACIONAL:"
    worksheet.getCell("I37").value = " " + (this.datosPedido.grupo_ocupacional_propuesto ? this.datosPedido.grupo_ocupacional_propuesto : "")
    worksheet.getCell("A38").value = "  GRADO:"
    worksheet.getCell("A39").value = " " + this.datosPedido.grado_actual
    worksheet.getCell("I38").value = " GRADO:"
    worksheet.getCell("I39").value = " " + (this.datosPedido.grado_propuesto ? this.datosPedido.grado_propuesto : "")
    worksheet.getCell("A40").value = "  REMUNERACIÓN MENSUAL:"
    worksheet.getCell("A41").value = " " + this.datosPedido.remuneracion_actual
    worksheet.getCell("I40").value = " REMUNERACIÓN MENSUAL:"
    worksheet.getCell("I41").value = " " + (this.datosPedido.remuneracion_propuesta ? this.datosPedido.remuneracion_propuesta : "")
    worksheet.getCell("A42").value = "  PARTIDA INDIVIDUAL:"
    worksheet.getCell("A43").value = " " + this.datosPedido.partida_individual_actual
    worksheet.getCell("I42").value = " PARTIDA INDIVIDUAL:"
    worksheet.getCell("I43").value = " " + (this.datosPedido.partida_individual_propuesta ? this.datosPedido.partida_individual_propuesta : "")
    worksheet.getCell("A45").value = "  POSESIÓN DEL PUESTO"
    worksheet.getCell("B47").value = "  YO,  "
    worksheet.getCell("C47").value = " " + (this.datosPedido.numero_acta_final != '' && this.datosPedido.numero_acta_final != null ? apellido + " " + nombres : "")
    worksheet.getCell("I47").value = " CON NRO. DE DOCUMENTO DE IDENTIFICACIÓN: "
    worksheet.getCell("N47").value = " " + (this.datosPedido.numero_acta_final != '' && this.datosPedido.numero_acta_final != null ? this.datosPedido.cedula_empleado : "")
    worksheet.getCell("B48").value = "          JURO LEALTAD AL ESTADO ECUATORIANO."
    worksheet.getCell("B49").value = "LUGAR:"
    worksheet.getCell("C49").value = " " + (this.datosPedido.numero_acta_final != '' && this.datosPedido.numero_acta_final != null ? this.datosPedido.descripcion_lugar_posesion : "")
    worksheet.getCell("F49").value = "FECHA:"
    const fecha_posesion = DateTime.fromISO(this.datosPedido.fecha_posesion, { zone: 'utc' }).setZone('America/Guayaquil');
    worksheet.getCell("G49").value = " " + (this.datosPedido.numero_acta_final != '' && this.datosPedido.numero_acta_final != null ? fecha_posesion.toFormat('yyyy-MM-dd') : "")
    worksheet.getCell("B51").value = "** (EN CASO DE GANADOR DE CONCURSO DE MÉRITOS Y OPOSICIÓN)"
    worksheet.getCell("J52").value = "FIRMA:"
    worksheet.getCell("B52").value = " " + (this.datosPedido.numero_acta_final != '' && this.datosPedido.numero_acta_final != null ? this.datosPedido.numero_acta_final : "")
    worksheet.getCell("B53").value = "NRO. ACTA FINAL"
    const fecha_acta_final = DateTime.fromISO(this.datosPedido.fecha_acta_final, { zone: 'utc' }).setZone('America/Guayaquil');
    worksheet.getCell("F52").value = " " + (this.datosPedido.numero_acta_final != '' && this.datosPedido.numero_acta_final != null ? fecha_acta_final.toFormat('yyyy-MM-dd') : "")
    worksheet.getCell("F53").value = "FECHA"
    worksheet.getCell("K53").value = "SERVIDOR PÚBLICO"

    worksheet.getCell("A55").value = "  RESPONSABLES DE APROBACIÓN"
    worksheet.getCell("A56").value = "DIRECTOR (A) O RESPONSABLE DE TALENTO HUMANO"
    worksheet.getCell("I56").value = "AUTORIDAD NOMINADORA O SU DELEGADO"

    worksheet.getCell("B59").value = "FIRMA:"
    worksheet.getCell("B60").value = "NOMBRE:"
    worksheet.getCell("C60").value = " " + (this.datosPedido.empleado_director != null ? this.datosPedido.abreviatura_director + ". " + this.datosPedido.empleado_director.toUpperCase() : "");
    worksheet.getCell("B61").value = "PUESTO:"
    worksheet.getCell("C61").value = " " + (this.datosPedido.cargo_director != null ? this.datosPedido.cargo_director : "");

    worksheet.getCell("J59").value = "FIRMA:"
    worksheet.getCell("J60").value = "NOMBRE:"
    worksheet.getCell("K60").value = " " + (this.datosPedido.empleado_autoridad_delegado != null ? this.datosPedido.abreviatura_delegado + ". " + this.datosPedido.empleado_autoridad_delegado.toUpperCase() : "");
    worksheet.getCell("J61").value = "PUESTO:"
    worksheet.getCell("K61").value = " " + (this.datosPedido.cargo_autoridad_delegado != null ? this.datosPedido.cargo_autoridad_delegado : "");

    worksheet.getCell("A63").value = "Elaborado por el Ministerio del Trabajo"
    worksheet.getCell("I63").value = "Fecha de actualización de formato: 2024-08-23 /  Versión: 01.1 /   Página 1 de 2"

    worksheet.getCell("A65").value = "  RESPONSABLES DE FIRMAS"
    worksheet.getCell("A67").value = "ACEPTACIÓN Y/O RECEPCIÓN DEL SERVIDOR PÚBLICO"
    worksheet.getCell("I67").value = "EN CASO DE NEGATIVA DE LA RECEPCIÓN (TESTIGO)"

    worksheet.getCell("B71").value = "FIRMA."
    worksheet.getCell("B72").value = "NOMBRE:"
    worksheet.getCell("C72").value = " " + this.datosPedido.numero_acta_final != '' && this.datosPedido.numero_acta_final != null ? this.datosPedido.abreviatura_empleado + ". "+apellido + " " + nombres : ""
    worksheet.getCell("B73").value = "FECHA:"
    const fecha_servidor = DateTime.fromISO(this.datosPedido.fecha_elaboracion, { zone: 'utc' }).setZone('America/Guayaquil');
    worksheet.getCell("C73").value = " " + fecha_servidor .toFormat('yyyy-MM-dd')
    worksheet.getCell("B74").value = "HORA:"
    const hora_servidor = DateTime.fromISO(this.datosPedido.hora_elaboracion, { zone: 'utc' }).setZone('America/Guayaquil');
    worksheet.getCell("C74").value = " " + hora_servidor.toFormat('hh:mm:ss')

    worksheet.getCell("J71").value = "FIRMA."
    worksheet.getCell("J72").value = "NOMBRE:"
    worksheet.getCell("K72").value = (this.datosPedido.abreviatura_testigo != null ? this.datosPedido.abreviatura_testigo+'. ' : '' )+ (this.datosPedido.empleado_testigo != null ? this.datosPedido.empleado_testigo.toUpperCase() : "");
    worksheet.getCell("J73").value = "FECHA:"
    const fecha_negativa = DateTime.fromISO(this.datosPedido.fecha_testigo, { zone: 'utc' }).setZone('America/Guayaquil');
    worksheet.getCell("K73").value = " " + ( this.datosPedido.fecha_testigo != null ? fecha_negativa.toFormat('yyyy-MM-dd') : '')
    worksheet.getCell("J75").value = "RAZÓN:"
    worksheet.getCell("K74").value = "En presencia del testigo se deja constancia de que la o el servidor público tiene la negativa de recibir la comunicación de registro de esta acción de personal."

    worksheet.getCell("A80").value = "RESPONSABLE DE ELABORACIÓN"
    worksheet.getCell("G80").value = "RESPONSABLE DE REVISIÓN"
    worksheet.getCell("L80").value = "RESPONSABLE DE REGISTRO Y CONTROL"

    worksheet.getCell("B83").value = "FIRMA: _________________________________________"
    worksheet.getCell("B84").value = "NOMBRE: "+(this.datosPedido.abreviatura_elaboracion != null ? this.datosPedido.abreviatura_elaboracion+'. ' : '')+ (this.datosPedido.empleado_elaboracion != null ? this.datosPedido.empleado_elaboracion.toUpperCase() : '');
    worksheet.getCell("B85").value = "PUESTO: "+(this.datosPedido.tipo_cargo_elaboracion != null ? this.datosPedido.tipo_cargo_elaboracion.toUpperCase() : "");
    
    worksheet.getCell("G83").value = " FIRMA: _________________________________________"
    worksheet.getCell("G84").value = " NOMBRE: "+(this.datosPedido.abreviatura_control != null ? this.datosPedido.abreviatura_control+'. ' : '')+ (this.datosPedido.empleado_control != null ? this.datosPedido.empleado_control.toUpperCase() : "");
    worksheet.getCell("G85").value = " PUESTO: "+(this.datosPedido.tipo_cargo_control != null ? this.datosPedido.tipo_cargo_control.toUpperCase() : "");
    
    worksheet.getCell("L83").value = " FIRMA: ______________________________"
    worksheet.getCell("L84").value = " NOMBRE: "+(this.datosPedido.abreviatura_revision != null ? this.datosPedido.abreviatura_revision+'. ' : '')+ (this.datosPedido.empleado_revision != null ? this.datosPedido.empleado_revision.toUpperCase() : "");
    worksheet.getCell("L85").value = " PUESTO: "+(this.datosPedido.tipo_cargo_revision != null ? this.datosPedido.tipo_cargo_revision.toUpperCase() : "");

    worksheet.getCell("A89").value = "** USO EXCLUSIVO PARA TALENTO HUMANO"
    worksheet.getCell("A91").value = "REGISTRO DE NOTIFICACIÓN AL SERVIDOR PÚBLICO DE LA ACCIÓN DE PERSONAL (primer inciso del art. 22 RGLOSEP, art. 101 COA , art. 66 y 126 ERJAFE) "
    worksheet.getCell("C93").value = "COMUNICACIÓN ELECTRÓNICA:"
    worksheet.getCell("D93").value = (this.datosPedido.comunicacion_electronica == true ? "X" : "");
    worksheet.getCell("C95").value = "FECHA:"
    const fecha_comunicacion = DateTime.fromISO(this.datosPedido.fecha_comunicacion, { zone: 'utc' }).setZone('America/Guayaquil');
    worksheet.getCell("D95").value = " " + fecha_comunicacion.toFormat('yyyy-MM-dd')
    worksheet.getCell("J95").value = "HORA:"
    const hora_comunicacion = DateTime.fromISO(this.datosPedido.hora_comunicacion, { zone: 'utc' }).setZone('America/Guayaquil');
    worksheet.getCell("K95").value = " " + hora_comunicacion.toFormat('hh:mm:ss')
    worksheet.getCell("C97").value = "** MEDIO:"
    worksheet.getCell("D97").value = " " + (this.datosPedido.medio_comunicacion != null && this.datosPedido.medio_comunicacion != "" ? this.datosPedido.medio_comunicacion : "");
    worksheet.getCell("F102").value = "FIRMA DEL RESPONSABLE QUE NOTIFICÓ"
    worksheet.getCell("F104").value = "NOMBRE:"
    worksheet.getCell("G104").value = (this.datosPedido.abreviatura_comunicacion != null ? this.datosPedido.abreviatura_comunicacion+'. ' : '')+ (this.datosPedido.empleado_comunicacion != null ? this.datosPedido.empleado_comunicacion.toUpperCase() : "");
    worksheet.getCell("F105").value = "PUESTO:"
    worksheet.getCell("G105").value = " " + (this.datosPedido?.cargo_comunicacion != null ? this.datosPedido.cargo_comunicacion.toUpperCase() : "");

    worksheet.getCell("A107").value = "** Si la comunicación fue electrónica se deberá colocar el medio por el cual se notificó al servidor; así como, el número del documento."
    worksheet.getCell("A109").value = " Elaborado por el Ministerio del Trabajo  "
    worksheet.getCell("I109").value = "Fecha de actualización de formato: 2024-08-23  /  Versión: 01.1   /  Página 1 de 2"

    worksheet.addImage(this.imagen, {
      tl: { col: 1, row: 0},
      ext: { width: 140, height: 60},
    });

    worksheet.addImage(this.imagenMinisterio, {
      tl:  { col: 4, row: 0},
      ext: { width: 210, height: 60 }
    })

    // DAMOS EL ESTILO DE BORDES A LAS CELDAS
    const borderStyle: Partial<ExcelJS.Borders> = {
      top: { style: "thin", color: { argb: "000000" } }, // Borde superior negro
      left: { style: "thin", color: { argb: "000000" } }, // Borde izquierdo negro
      bottom: { style: "thin", color: { argb: "000000" } }, // Borde inferior negro
      right: { style: "thin", color: { argb: "000000" } }, // Borde derecho negro
    };

    const bordertopLeftBottomStyle: Partial<ExcelJS.Borders> = {
      top: { style: "thin", color: { argb: "000000" } }, // Borde superior negro
      left: { style: "thin", color: { argb: "000000" } }, // Borde izquierdo negro
      bottom: { style: "thin", color: { argb: "000000" } }, // Borde inferior negro
    };

    const bordertopRightBottomStyle: Partial<ExcelJS.Borders> = {
      top: { style: "thin", color: { argb: "000000" } }, // Borde superior negro
      right: { style: "thin", color: { argb: "000000" } }, // Borde derecho negro
      bottom: { style: "thin", color: { argb: "000000" } }, // Borde inferior negro
    };

    const borderRightStyle: Partial<ExcelJS.Borders> = {
      right: { style: "thin", color: { argb: "000000" } }, // Borde derecho negro
    };

    const borderLeftStyle: Partial<ExcelJS.Borders> = {
      left: { style: "thin", color: { argb: "000000" } }, // Borde derecho negro
    };

    const borderTopStyle: Partial<ExcelJS.Borders> = {
      top: { style: "thin", color: { argb: "000000" } }, // Borde superior negro
    };

    const borderbottomStyle: Partial<ExcelJS.Borders> = {
      bottom: { style: "thin", color: { argb: "000000" } }, // Borde derecho negro
    };

    const borderTopLeftRightStyle: Partial<ExcelJS.Borders> = {
      left: { style: "thin", color: { argb: "000000" } }, // Borde derecho negro
      right: { style: "thin", color: { argb: "000000" } }, // Borde derecho negro
    };

    const borderTopLeftStyle: Partial<ExcelJS.Borders> = {
      left: { style: "thin", color: { argb: "000000" } }, // Borde derecho negro
      top: { style: "thin", color: { argb: "000000" } }, // Borde derecho negro
    };

    const borderTopRightStyle: Partial<ExcelJS.Borders> = {
      top: { style: "thin", color: { argb: "000000" } }, // Borde superior negro
      right: { style: "thin", color: { argb: "000000" } }, // Borde derecho negro
    };

    const borderbottomRightStyle: Partial<ExcelJS.Borders> = {
      bottom: { style: "thin", color: { argb: "000000" } }, // Borde superior negro
      right: { style: "thin", color: { argb: "000000" } }, // Borde derecho negro
    };

    const borderbottomLeftStyle: Partial<ExcelJS.Borders> = {
      bottom: { style: "thin", color: { argb: "000000" } }, // Borde superior negro
      left: { style: "thin", color: { argb: "000000" } }, // Borde derecho negro
    };

    const borderbottomRighLefttStyle: Partial<ExcelJS.Borders> = {
      bottom: { style: "thin", color: { argb: "000000" } }, // Borde superior negro
      right: { style: "thin", color: { argb: "000000" } }, // Borde derecho negro
      left: { style: "thin", color: { argb: "000000" } }, // Borde derecho negro
    };

    // DAMOS EL ESTILO DE BACKGROUND COLOR A LAS CELDAS
    const backgroundColorStyle: ExcelJS.FillPattern = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "F2F1EC" }, // Amarillo (puedes cambiarlo por otro color)
    };

    const backgroundColorStyleWhite: ExcelJS.FillPattern = {
      type: "pattern",
      pattern: "solid",
      bgColor: { argb: "FFFFFF" },
      fgColor: { argb: "FFFFFF" }, // BLANCO (puedes cambiarlo por otro color)
    };

    const totalFilas = 110; // EMPIEZA EN LA FILA 6 (DONDE COMIENZA LA TABLA)
    const totalColumnas = 16; // NUMERO DE COLUMNAS EN LA TABLA



    for (let i = 0; i <= totalFilas; i++) {
      for (let j = 1; j <= totalColumnas; j++) {
        const cell = worksheet.getRow(i).getCell(j);

        if (i <= 11 || i == 22 || i == 24 || i == 25 || i == 45 || i == 55 || i == 64 ||
          i == 65 || i == 66 || i == 67 || i == 79 || i == 80 || i == 91 || (i == 13 && j == 4) ||
          (i == 14 && j == 4) || (i == 15 && j == 4) || (i == 16 && j == 4) || (i == 17 && j == 4) ||
          (i == 18 && j == 4) || (i == 13 && j == 8) || (i == 14 && j == 8) || (i == 15 && j == 8) ||
          (i == 16 && j == 8) || (i == 17 && j == 8) || (i == 18 && j == 8) || (i == 13 && j == 12) ||
          (i == 14 && j == 12) || (i == 15 && j == 12) || (i == 16 && j == 12) || (i == 17 && j == 12) ||
          (i == 18 && j == 12) || (i == 13 && j == 15) || (i == 14 && j == 15) || (i == 20 && (j == 8 || j == 12))
          || (i == 93 && j == 4)
        ) {
          cell.border = borderStyle; // APLICAR BORDJES NEGROS
        } else if ((i >= 12 && i <= 21 && j == 16) || (i >= 46 && i <= 54 && j == 16) ||
          (i >= 56 && i <= 62 && j == 8) || (i >= 56 && i <= 61 && j == 16) || (i == 62) || (i == 23 && j == 16)
        ) {
          cell.border = borderRightStyle
        } else if (i >= 15 && i <= 18 && j >= 13 && j <= 15) {
          cell.border = borderbottomStyle
        }

        if ((i == 23 && j == 1)){
          cell.border = borderLeftStyle
        }

        if(i <= 5 && j == 4){
          cell.border = bordertopLeftBottomStyle
        }else if(i <= 5 && j == 10){
          cell.border = bordertopRightBottomStyle
        }

        if (i == 19 && j >= 7 && j <= 15) {
          cell.border = borderbottomStyle
        } else if (i == 47 && j >= 3 && j <= 7) {
          cell.border = borderbottomStyle
        } else if (i == 49 && ((j >= 3 && j <= 4) || (j == 7))) {
          cell.border = borderbottomStyle
        } else if (i == 52 && ((j >= 2 && j <= 4) || (j >= 6 && j <= 7) || (j >= 11 && j <= 14))) {
          cell.border = borderbottomStyle
        } else if (i == 47 && (j >= 14 && j <= 15)) {
          cell.border = borderbottomStyle
        } else if ((i >= 59 && i <= 61) && ((j >= 3 && j <= 7) || (j >= 11 && j <= 15))) {
          cell.border = borderbottomStyle
        } else if ((i == 63) || (i == 110 && (j >= 8 && j <= 16)) || (i == 109 && j == 16)) {
          cell.border = borderTopStyle
          if(j==7){
            cell.border = borderTopLeftStyle
          }else if (j == 16) {
            cell.border = borderTopRightStyle
          }
        } else if (i >= 68 && i <= 78) {
          if (i >= 71 && i <= 73) {
            if ((j >= 3 && j <= 7) || (j >= 11 && j <= 15)) {
              cell.border = borderbottomStyle
            }
          } else if (i == 74) {
            if ((j >= 3 && j <= 7)) {
              cell.border = borderbottomStyle
            }
          }

          if (j == 8 || j == 16) {
            cell.border = borderRightStyle
          }

        } else if (i >= 81 && i <= 86) {
          if (j == 5 || j == 11) {
            cell.border = borderRightStyle
            if (i >= 83 && i <= 85) {
              cell.border = borderRightStyle
            }
          } else if (j == 16) {
            cell.border = borderRightStyle
          }

          if (i >= 83 && i <= 85) {
            if ((j >= 3 && j <= 4) || (j >= 8 && j <= 10)) {
              cell.border = borderbottomStyle
            }
          }
        } else if (i >= 88 && i <= 90 && (j == 16)) {
          cell.border = borderRightStyle
        } else if (i >= 92 && i <= 109) {

          if (i == 95 && ((j >= 4 && j <= 5) || (j >= 11 && j <= 12))) {
            cell.border = borderbottomStyle
          } else if ((i >= 97 && i <= 99) && (j >= 4 && j <= 6)) {
            cell.border = borderbottomStyle
          } else if (i == 101 && (j >= 7 && j <= 11)) {
            cell.border = borderbottomStyle
          } else if ((i == 104 || i == 105) && (j >= 7 && j <= 11)) {
            cell.border = borderbottomStyle
          } else if (i == 108) {
            cell.border = borderbottomStyle
            if(j==1){
              cell.border = borderbottomLeftStyle
            }
          } else if (i == 109) {
            if (j == 7) {
              cell.border = borderbottomLeftStyle
            } else {
              cell.border = borderbottomStyle
            }
          }

          if (j == 16) {
            cell.border = borderRightStyle
          }
        }

        if ((i == 1 && j >= 11) ||
          (i == 3 && (j >= 11 && j < 13)) ||
          (i == 4 && j >= 11) || (i == 6) ||
          (i >= 8 && i <= 9) || (i == 11) ||
          (i == 22) ||
          (i == 20 && j >= 2 && j <= 12) ||
          (i == 24) ||
          (i == 26) || (i == 28) || (i == 30) || (i == 32) || (i == 34) ||
          (i == 36) || (i == 38) || (i == 40) || (i == 42) || (i == 45) || (i == 55) ||
          (i == 65) || (i == 67) || (i == 80) || (i == 91)
        ) {
          cell.fill = backgroundColorStyle; // APLICAR COLOR DE FONDO
        }

        if ((i >= 13 && i <= 19) || (i >= 46 && i <= 54) ||
          (i >= 57 && i <= 64) || (i >= 68 && i <= 78) || (i >= 81 && i <= 90) ||
          (i >= 92 && i <= 109) || (i == 20 && (j == 8 || j == 12))
        ) {
          cell.fill = backgroundColorStyleWhite
        }

        if(i == 12 || i == 21 || (i >= 26 && i <= 44) || i == 46 || i == 54 || (i >= 56 && i <= 58) || i == 62
        || i == 68 || i == 69 || i == 70 || i == 81 || i == 82 || i == 88 || i == 89 || i == 94 || i == 96
        || i == 107
       ){
          cell.border = borderTopLeftRightStyle
        }else if ((j == 1 && (i >= 13 && i <= 20)) || (j == 1 && (i >= 47 && i <= 53)) || (j == 1 && (i >= 59 && i <= 61)) ||
          (j == 1 && (i >= 71 && i <= 78)) || (j == 1 && (i >= 83 && i <= 85)) || (j == 1 && i == 90)
          || (j == 1 && (i >= 97 && i <= 106)) || (j == 1 && (i >= 92 && i <= 93)) || (j == 1 && i == 95) || (j == 1 && i == 108)
        ){
          cell.border = borderLeftStyle
        }

        if ((j == 5 && i == 87)){
          cell.border = borderTopLeftStyle
        }else if((j == 5 && i == 86) || (j == 11 && i == 86) || (j == 16 && i == 86)){
          cell.border = borderbottomRighLefttStyle
        }else if((j == 16 && i == 87)){
          cell.border = borderRightStyle
        }

        if (i === 0) {
          cell.alignment = { vertical: "middle", horizontal: "center" };
        }else {
          cell.alignment = {vertical: "middle",};
        }

      }
    }

    // APLICAR ESTILO DE CENTRADO Y NEGRITA A LAS CELDAS COMBINADAS
    ["A1", "K1", "K3", "K4", "A6", "A7", "I6", "A8", "A9", "A10","E8", "E9", "I8", "I9", "M3", "M9", "A11", "A22", "A23", "B23",
      "A24", "I24", "E10", "I10", "M10", "D13", "D14", "D15", "D16", "D17", "D18", "H13", "H14", "H15", "H16", "H17", "H18",
      "L13", "L14", "L15", "L16", "L17", "L18", "O13", "O14", "J20", "L20", "B52", "F52", "D93", "C47", "N47", "C49",
      "F49", "C60", "C61", "K60", "K61", "C72", "C73", "C74", "K72", "K73", "C84", "C85", "G84", "G85", "M84", "M85", "D95", "K95",
      "B13", "B14", "B15", "B16", "B17", "B18", "B19", "B20", "F13", "F14", "F15", "F16", "F17", "F18", "J13", "J14", "D97",
      "J15", "J16", "J17", "J18", "M13", "M14", "H20", "K5", "K20", "A26", "I26", "A27",  "I7", "I27", "A28", "I28", "A29", "I29",
      "A30", "A31", "A33", "A35", "A37", "I30", "A32", "I32", "A34", "I34", "A36", "I36", "A38", "I38", "A39", "A40", "I40", "A41", "A42", "I42", 
      "A44", "I44", "A45", "B47", "I47", "B48", "B49", "G49", "B51", "J52", "B53", "F53", "K53", "A55", "A56", "I56", "B59", "B60",
      "B61", "J59", "J60", "J61", "A63", "I63", "A65", "A67", "I67", "B71", "B72", "B73", "B73", "B74", "J71", "J72", "J73",
      "J75", "K74", "A80", "G80", "L80", "B83", "B84", "B85", "L83", "L84", "L85", "G83", "G84", "G85", "A89", "A91",
      "C93", "C95", "C97", "J95", "F102", "F104", "F105", "A107", "A109", "I109", "G104", "G105", "H19", "M15",
      "I31", "I33", "I35", "I37", "I39", "I41"
    ].forEach((cell) => {
      if (
        cell != 'B13' && cell != 'B14' && cell != 'B15' && cell != 'B16' && cell != 'B17' && cell != 'B18' &&
        cell != 'B19' && cell != 'B20' && cell != 'F13' && cell != 'F14' && cell != 'F15' && cell != 'F16' &&
        cell != 'F17' && cell != 'F18' && cell != 'J13' && cell != 'J14' && cell != 'J15' && cell != 'J16' &&
        cell != 'J17' && cell != 'J18' && cell != 'M13' && cell != 'M14' && 
        cell != 'A22' && cell != 'A26' && cell != 'I26' && cell != 'A27' && cell != 'I27' &&
        cell != 'A28' && cell != 'I28' && cell != 'A29' && cell != 'I29' && cell != 'A30' && cell != 'I30' &&
        cell != 'A32' && cell != 'I32' && cell != 'A34' && cell != 'I34' && cell != 'A36' && cell != 'I36' &&
        cell != 'A38' && cell != 'I38' && cell != 'A40' && cell != 'I40' && cell != 'A42' && cell != 'I42' &&
        cell != 'A31' && cell != 'I31' && cell != 'A33' && cell != 'I33' && cell != 'A35' && cell != 'I35' &&
        cell != 'A37' && cell != 'I37' && cell != 'A39' && cell != 'I39' && cell != 'A41' && cell != 'I41' &&
        cell != 'A44' && cell != 'I44' && cell != 'A45' && cell != 'B48' && cell != 'A89' 

      ) {
        worksheet.getCell(cell).alignment = {
          horizontal: "center",
          vertical: "middle"
        };

        if (cell == 'A23' || cell == 'B23' || cell == 'D97') {
          worksheet.getCell(cell).alignment = {
            vertical: "middle",
            wrapText: true
          }
        }

      }

      if (cell == 'K1') {
        worksheet.getCell(cell).font = { bold: true, size: 10 };
      }else if(cell == 'A89'){
        worksheet.getCell(cell).font = { bold: true, size: 16 };
      } else if (
        cell == "A8" || cell == 'A9' || cell == "K3" || cell == 'K4' ||
        cell == 'A6' || cell == 'I6' || cell == 'I8' || cell == 'I9' ||
        cell == 'E8' || cell == 'E9' || cell == 'M9' || cell == "A11" ||
        cell == 'A22' || cell == 'A24' || cell == "I24" || cell == 'A26' ||
        cell == "I26" || cell == 'A28' || cell == "I28" || cell == 'A30' ||
        cell == "I30" || cell == 'A32' || cell == "I32" || cell == 'A34' ||
        cell == "I34" || cell == 'A36' || cell == "I36" || cell == 'A38' ||
        cell == "I38" || cell == 'A40' || cell == "I40" || cell == 'A42' ||
        cell == "I42" || cell == 'A45' ||
        cell == "I47" || cell == "B51" || cell == 'B53' || cell == "F53" ||
        cell == 'K53' || cell == "A55" || cell == 'A56' || cell == "I56" ||
        cell == 'A65' || cell == "A67" || cell == 'I67' || cell == "A80" ||
        cell == 'G80' || cell == "L80" || cell == 'A91' || cell == "A107" ||
        cell == 'F102'
      ) {
        worksheet.getCell(cell).font = { bold: true, size: 8 };
      } else {
        worksheet.getCell(cell).font = { size: 8 };
      }

      if (cell == 'B49' || cell == 'J52' ||
        cell == 'A60' || cell == 'A61' ||
        cell == 'J59' || cell == 'J60' || cell == 'J61' ||
        cell == 'F49' ||
        cell == 'C95' || cell == 'J95' || cell == 'C97'
      ) {
        worksheet.getCell(cell).alignment = {
          horizontal: "right",
          vertical: "middle",
        };

        worksheet.getCell(cell).font = { bold: true, size: 7 };
      }

      if (cell == "A63" || cell == 'C93' || cell == "A109") {
        worksheet.getCell(cell).alignment = {
          horizontal: "center",
          vertical: "middle",
        };

        worksheet.getCell(cell).font = { bold: true, size: 7 };
      } else if (cell == "I63" || cell == "I109" || cell == "A11" || cell == "A55" || cell == 'A65' ) {
        worksheet.getCell(cell).alignment = {
          horizontal: "left",
          vertical: "middle",
        };

        worksheet.getCell(cell).font = { bold: true, size: 7 };
      }else if(cell == 'B59' || cell == 'B60' || cell == 'B61' ||
        cell == 'J59' || cell == 'J60' || cell == 'J61' ||
        cell == 'B71' || cell == 'B72' || cell == 'B73' ||
        cell == 'B74' || cell == 'J71' || cell == 'J72' ||
        cell == 'J73' || cell == 'J75' || cell == 'B83' ||
        cell == 'B84' || cell == 'B85' || cell == 'G83' ||
        cell == 'G84' || cell == 'G85' || cell == 'L83' ||
        cell == 'F104' || cell == 'F105' ||
        cell == 'L84' || cell == 'L85' 
      ){
         worksheet.getCell(cell).alignment = {
          horizontal: "left",
          vertical: "middle",
          wrapText: true
        };


        worksheet.getCell(cell).font = { bold: true, size: 7 };
      }else if(cell == 'C47' || cell == 'C49' ||
        cell == 'C74' || cell == 'C72' || cell == 'C73' ||
        cell == 'C60' || cell == 'C61' || cell == 'K60' ||
        cell == 'K61' || cell == 'K72' || cell == 'K73' ||
        cell == 'C84' || cell == 'C85' || cell == 'G84' || 
        cell == 'G85' || cell == 'M84' || cell == 'M85' || 
        cell == 'D95' || cell == 'K95' || cell == 'M15' ||
        cell == 'G104' || cell == 'G105' || cell == 'H19'){
        worksheet.getCell(cell).alignment = {
          horizontal: "left",
          vertical: "middle",
        };
        worksheet.getCell(cell).font = {size: 8 };
      }

      if (cell == "K74" || cell == "A11" ) {
        worksheet.getCell(cell).alignment = {
          horizontal: "left",
          vertical: "middle",
          wrapText: true
        }
      }

    });

    try {
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/octet-stream" });
      FileSaver.saveAs(blob, "tipo_acciones_personal.xlsx");
    } catch (error) {
      console.error("Error al generar el archivo Excel:", error);
    }

  }

}
