import { Component } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../service/auth-service.service';
import { UserService } from '../../service/user.service';
import { Router } from '@angular/router';
import { LocalStorageService } from '../../service/local-storage.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NavbarComponent, ReactiveFormsModule],
  providers: [HttpClient],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  constructor(private loginService: AuthService,
    private userService: UserService,
    private router: Router,
    private localStorageService: LocalStorageService) { }
  loginForm: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.maxLength(20), Validators.minLength(5)]),
    password: new FormControl('', [Validators.required, Validators.maxLength(20), Validators.minLength(5),]),
  })

  isInvalid = false;
  requestSent = false;
  login(event: any) {
    event.preventDefault();
    this.requestSent = true;
    this.loginService.login(this.loginForm.value)
      .subscribe({
        next: (data: any) => {
          this.localStorageService.setItem('isLogged', data);
        },
        error: (error: any) => {
          this.requestSent = false;
          if (error.status === 401) {
            this.isInvalid = true;
          }
        },
        complete: () => {
          this.userService.userDetails().subscribe({
            next: (data: any) => {
              this.localStorageService.setItem('userDetails', JSON.stringify(data));
            },
            complete: () => {

              window.location.href = '';
            },
            error: (error: any) => {
              alert('Error al obtener los detalles del usuario');
            }
          });
        }
      })
  }
}
