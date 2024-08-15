import { Component } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { delay } from 'rxjs';
import { SpinnerService } from 'src/app/servicios/intercepto/spinner.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.css']
})

export class SpinnerComponent {
  isLoading$ = this.SpinnerServices.isLoading$.pipe(delay(0));
  constructor(private SpinnerServices: SpinnerService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.isLoading$.subscribe(isLoading => {
      this.cdr.detectChanges();
    });
  }

  // VARIABLES PROGRESS SPINNER
  progreso: boolean = false;
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 10;


}
