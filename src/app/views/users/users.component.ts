import { Component, TemplateRef, ViewChild } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { UserService } from '../../service/user.service';
import { PersonService } from '../../service/person-service.service';
import { ModalComponent } from '../../components/modal/modal.component';
import roles from '../../consts/roles.json';
import { UserCreateDTO } from '../../models/UserCreateDTO';
import { RoleDTO } from '../../models/RoleDTO';
import { NgOptimizedImage } from '@angular/common';
import { ModalService } from '../../service/modal.service';
import { ResponseDTO } from '../../models/ResponseDTO';
import { SubjectDTO } from '../../models/SubjectDTO';
import { HttpErrorResponse } from '@angular/common/http';
import { debounceTime } from 'rxjs';
import { SubjectSelectionComponent } from '../../components/subject-selection/subject-selection.component';
import { ScheduleSelectionComponent } from '../../components/schedule-selection/schedule-selection.component';
import { TeacherService } from '../../service/teacher.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ModalComponent,
    NgOptimizedImage,
    SubjectSelectionComponent,
    ScheduleSelectionComponent,
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent {
  constructor(
    private userService: UserService,
    private personService: PersonService,
    private modalService: ModalService,
    private teacherService: TeacherService
  ) {
    this.userForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(2)]),
      lastname: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
      ]),
      email: new FormControl('', [Validators.required, Validators.email]),
      phone: new FormControl('', [
        Validators.required,
        Validators.minLength(7),
        Validators.maxLength(10),
        Validators.pattern('^[0-9]*$'),
      ]),
      address: new FormControl('', [
        Validators.required,
        Validators.minLength(4),
      ]),
      ci: new FormControl('', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(12),
        Validators.pattern('^\\d{5,12}(?:[\\s-]\\w{1,2})?$'),
      ]),
      role: new FormControl('ADMINISTRATIVE', [
        Validators.required,
        Validators.minLength(4),
      ]),
      workEmail: new FormControl('', [Validators.required, Validators.email]),
    });
    this.userForm
      .get('ci')
      ?.valueChanges.pipe(debounceTime(500))
      .subscribe(() => {
        this.checkCi();
      });
    this.userForm
      .get('email')
      ?.valueChanges.pipe(debounceTime(500))
      .subscribe(() => {
        this.checkEmail();
      });
    this.userForm
      .get('phone')
      ?.valueChanges.pipe(debounceTime(500))
      .subscribe(() => {
        this.checkPhone();
      });
    this.userForm
      .get('workEmail')
      ?.valueChanges.pipe(debounceTime(500))
      .subscribe(() => {
        this.checkWorkEmail();
      });
  }
  @ViewChild('modal') modal: TemplateRef<unknown> | undefined;
  imageFile: File | null = null;
  userImage: string = '../../assets/user.svg';
  hasImage = false;
  requestSend = false;
  modalMessage = '';
  modalTitle = '';
  subjectList: SubjectDTO[] = [];
  userForm: FormGroup;

  onSubmit() {
    this.requestSend = true;
    if (this.userForm.controls['role'].value !== 'TEACHER') {
      this.userForm.controls['workEmail'].setValidators([Validators.email]);
    }
    const currentRoles = JSON.parse(JSON.stringify(roles));
    const selected = currentRoles.roles.find(
      (role: RoleDTO) => role.name === this.userForm.controls['role'].value
    );
    if (this.userForm.valid) {
      const user: UserCreateDTO = {
        name: this.userForm.controls['name']!.value!,
        lastname: this.userForm.controls['lastname'].value!,
        email: this.userForm.controls['email'].value!,
        phone: this.userForm.controls['phone'].value!,
        address: this.userForm.controls['address'].value!,
        ci: this.userForm.controls['ci'].value!,
        academicEmail: this.userForm.controls['workEmail'].value!,
        roles: [selected],
      };
      const formData = new FormData();
      formData.append('user', JSON.stringify(user));
      if (this.hasImage) {
        formData.append('image', this.imageFile as Blob);
      }
      if (this.subjectList.length > 0) {
        formData.append('subjects', JSON.stringify(this.subjectList));
      }
      this.userService.createUser(formData).subscribe({
        next: (data: ResponseDTO<string>) => {
          console.log(data);
          this.modalMessage = 'Usuario creado exitosamente';
          this.modalTitle = 'Usuario creado ';
          this.openModal(this.modalTitle, this.modalMessage);
          this.userForm.reset();
          this.userImage = '../../assets/user.svg';
        },
        error: (error: HttpErrorResponse) => {
          this.modalMessage = error.error.message;
          this.modalTitle = 'Error al crear el usuario';
          this.openModal(this.modalTitle, this.modalMessage);
          this.requestSend = false;
        },
        complete: () => {
          this.requestSend = false;
        },
      });
    } else {
      this.openModal('Error', 'Formulario invalido');
    }
  }
  onFileSelectedHandler(event: Event) {
    const target = event.target as HTMLInputElement;
    if (!target.files) return;
    this.imageFile = target.files.item(0);
    console.log(this.imageFile);
    this.hasImage = true;
    const reader = new FileReader();
    reader.readAsDataURL(this.imageFile as Blob);
    reader.onload = () => {
      this.userImage = reader.result as string;
    };
  }
  checkEmail() {
    console.log(this.userForm.controls['email'].getError('emailExists'));
    if (this.userForm.get('email')?.errors) {
      return;
    }
    this.personService
      .existsByEmail(this.userForm.controls['email'].value ?? '')
      .subscribe({
        next: (data: ResponseDTO<boolean>) => {
          console.log(data.content);
          if (data.content) {
            this.userForm.controls['email'].setErrors({
              emailExists: data.content,
            });
          }
        },
      });
  }
  checkPhone() {
    if (this.userForm.get('phone')?.errors) {
      return;
    }
    this.personService
      .existsByPhone(this.userForm.controls['phone'].value ?? '')
      .subscribe({
        next: (data: ResponseDTO<boolean>) => {
          console.log(data);
          if (data.content) {
            this.userForm.controls['phone'].setErrors({ phoneExists: true });
          }
        },
      });
  }
  checkWorkEmail() {
    if (this.userForm.get('workEmail')?.errors) {
      return;
    }
    this.teacherService
      .existsByAcademicEmail(this.userForm.controls['workEmail'].value ?? '')
      .subscribe({
        next: (data: ResponseDTO<boolean>) => {
          console.log(data);
          if (data.content) {
            this.userForm.controls['workEmail'].setErrors({
              emailExists: true,
            });
          }
        },
      });
  }
  checkCi() {
    if (this.userForm.get('ci')?.errors) {
      return;
    }
    this.personService
      .existsByCi(this.userForm.controls['ci'].value ?? '')
      .subscribe({
        next: (data: ResponseDTO<boolean>) => {
          console.log(data.content);
          if (data.content) {
            this.userForm.controls['ci'].setErrors({ ciExists: true });
          }
        },
      });
  }

  changeValidators(event: Event) {
    if ((event.target as HTMLInputElement).value === 'TEACHER') {
      this.userForm.controls['workEmail'].setValidators([
        Validators.required,
        Validators.email,
      ]);
      this.userForm.get('workEmail')?.updateValueAndValidity();
    } else {
      this.userForm.get('workEmail')?.clearValidators();
      this.userForm.get('workEmail')?.updateValueAndValidity();
    }
  }
  openModal(title: string, message: string) {
    const content = this.modal!;
    console.log(content);
    this.modalService.open({
      content: content,
      options: {
        size: 'small',
        title: title,
        message: message,
        isSubmittable: false,
      },
    });
  }
  onUpdateSubjectHandler(newSubjects: SubjectDTO[]) {
    this.subjectList = newSubjects;
    console.log('subjects updated', this.subjectList);
  }
}
