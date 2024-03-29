import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from '../../service/auth-service.service';
import { Router } from '@angular/router';
import { RouteDTO } from '../../models/RouteDTO';
import * as routes from '../../consts/routes.json';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-navs',
  standalone: true,
  imports: [],
  templateUrl: './navs.component.html',
  styleUrl: './navs.component.css'
})
export class NavsComponent implements OnInit {

  routesList: RouteDTO[] = []
  @Input() userRole: string = '';
  constructor(private authService: AuthService, private router: Router) { }
  ngOnInit() {
    initFlowbite();
    if (this.userRole === 'ADMINISTRATIVE') {
      this.routesList = JSON.parse(JSON.stringify(routes));
    }
  }
  logout() {
    localStorage.removeItem('isLogged');
    localStorage.removeItem('userDetails');
    localStorage.removeItem('currentRole');
    localStorage.removeItem('roleDetails');
    this.authService.logout().subscribe((data: any) => {
    });
    this.router.navigate(['/login']);
  }
}
