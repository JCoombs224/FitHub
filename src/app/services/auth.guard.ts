import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router} from '@angular/router';
import { Observable } from 'rxjs';
import {CurrentUserService} from "./current-user.service";
import {ToastrService} from "ngx-toastr";
import {isPlatformBrowser} from "@angular/common";

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private currentUserService: CurrentUserService,
              private toastr: ToastrService,
              @Inject(PLATFORM_ID) private platformId,
              private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.currentUserService.profile_data.email) {
      return true;
    } else {
      if(isPlatformBrowser(this.platformId)) {
        // this.toastr.error("Unauthorized Access");
      }
      let url_param = btoa(encodeURIComponent(state.url));
      // this.router.navigate(["login"],{queryParams: {next_url:url_param}}); // use this one if you want to continue to url after signin
      this.router.navigate(["/"]);
      return false;
    }
  }

}