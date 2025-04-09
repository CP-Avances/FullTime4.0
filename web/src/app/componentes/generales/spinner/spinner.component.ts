import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { ChangeDetectorRef } from '@angular/core';
import { SpinnerService } from 'src/app/servicios/generales/intercepto/spinner.service';
import { ThemePalette } from '@angular/material/core';
import { Component } from '@angular/core';
import { delay } from 'rxjs';

@Component({
  selector: 'app-spinner',
  standalone: false,
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
