import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { SpinnerService } from "src/app/servicios/intercepto/spinner.service";
import { finalize } from 'rxjs/operators';

@Injectable()
export class SpinnerInterceptor implements HttpInterceptor {
    constructor(private SpinnerServices: SpinnerService){}
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        this.SpinnerServices.showSpinner();
        return next.handle(req).pipe(
            finalize(() => this.SpinnerServices.hideSpinner())
        );
    }

}