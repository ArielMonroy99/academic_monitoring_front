import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import {  RouterModule, RouterOutlet } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { UserService } from './service/user.service';
import { NavsComponent } from './components/navs/navs.component';
import { UserDTO } from './models/UserDTO';
import { ModalComponent } from './components/modal/modal.component';
import {  FormsModule, ReactiveFormsModule } from '@angular/forms';
import {ResponseDTO} from "./models/ResponseDTO";
import myLocalEs from '@angular/common/locales/es';
import {registerLocaleData} from "@angular/common";
import {ModalService} from "./service/modal.service";
import {role_names} from "./consts/roles.json"
import {LoginComponent} from "./views/login/login.component";
import {UserDataService} from "./service/user-data.service";
import {UserDetailsDTO} from "./models/UserDetailsDTO";
import {LocalStorageService} from "./service/local-storage.service";

registerLocaleData(myLocalEs, "es-ES");

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, NavsComponent, ModalComponent, FormsModule, ReactiveFormsModule, LoginComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],

})

export class AppComponent implements OnInit {
  @ViewChild('modal') content : TemplateRef<any> | undefined;
  title = 'Seguimiento académico';
  user: UserDTO | undefined;
  isLogged: boolean = false;
  currentRole: string = '';
  userDetails: UserDetailsDTO ;
  currentRoles: any = role_names;
  constructor(private userService: UserService,
              private userDataService: UserDataService,
              private modalService: ModalService,
              private localStorage: LocalStorageService) {
    this.user = {} as UserDTO;
    this.userDetails = {} as UserDetailsDTO;
  }
  ngOnInit() {
    initFlowbite();
    this.getUserDetails();
  }

  openRoleSelectionModal(){
    this.modalService.open({content: this.content!,
      options: {
        size:'medium',
        hasContent: true,
        data: this.user?.role,
        isSubmittable: true,
        title: 'Selecciona un rol',
      }
    }).subscribe(
      {
        next: data =>{
          this.localStorage.setItem('role', data);
          this.getRoleDetails();
        }
      }
    );
  }
  getUserDetails(){
    this.userService.userDetails().subscribe({
      next: (data:ResponseDTO<UserDTO>)=>{
        this.user = data.content;
        if(this.user.role.length > 1)
          this.openRoleSelectionModal();
        else
          this.currentRole = this.user.role[0].name;
          this.getRoleDetails();
      },
      error: error =>{
        console.log(error);
        if(error.status === 401){
          this.isLogged = false;
        }
      }
    })
  }

  getRoleDetails(){
    this.userService.getUserRoleDetails(this.currentRole).subscribe({
      next: (data:ResponseDTO<UserDetailsDTO>)=>{
        this.userDetails = data.content;
      },
      complete: () => {
        this.updateUserData();
        this.isLogged = true;
      }
    })
  }
  updateLoginState(isLogged: boolean){
    this.isLogged = isLogged;
    this.getUserDetails();
  }
  updateUserData(){
    this.userDataService.setUserDetails(this.userDetails);
  }

}
