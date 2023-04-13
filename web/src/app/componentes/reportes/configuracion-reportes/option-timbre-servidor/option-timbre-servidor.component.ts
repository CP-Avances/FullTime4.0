import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ReportesService } from '../../../../servicios/reportes/reportes.service';

@Component({
  selector: 'app-option-timbre-servidor',
  templateUrl: './option-timbre-servidor.component.html',
  styleUrls: ['./option-timbre-servidor.component.css']
})
export class OptionTimbreServidorComponent implements OnDestroy {

  showTimbre = this.reporteService.mostrarTimbreServidor;

  constructor(
    private reporteService: ReportesService,
  ) { }

  ngOnDestroy() {
    this.reporteService.DefaultTimbreServidor()
  }

  ChangeValue(e: MatSlideToggleChange) {
    console.log(e.checked);
    this.reporteService.setMostrarTimbreServidor(e.checked);    
  }

}
