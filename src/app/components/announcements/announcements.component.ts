import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AnnouncementDTO } from '../../models/AnnouncementDTO';
import { AnnouncementService } from '../../service/announcement.service';
import { DatePipe } from '@angular/common';
import { ImageCarrouselComponent } from '../image-carrousel/image-carrousel.component';
import { UserDataService } from '../../service/user-data.service';
import { UserDetailsDTO } from '../../models/UserDetailsDTO';

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [DatePipe, ImageCarrouselComponent],
  templateUrl: './announcements.component.html',
  styleUrl: './announcements.component.css',
})
export class AnnouncementsComponent implements OnInit {
  announcements: AnnouncementDTO[];
  userDetails: UserDetailsDTO = {} as UserDetailsDTO;
  currentAnnouncement: AnnouncementDTO = {} as AnnouncementDTO;
  index: number = 0;
  timeout: number = 0;
  filters: { grades: number[]; shift: number; receiver: string } = {
    grades: [],
    shift: 0,
    receiver: 'ALL',
  };
  @ViewChild('announcement') announcementEl: ElementRef | undefined;
  constructor(
    private announcementService: AnnouncementService,
    private userDataService: UserDataService
  ) {
    this.announcements = [];
  }
  ngOnInit() {
    this.userDataService.currentUser.subscribe({
      next: value => {
        this.userDetails = value!;
        this.getGradeIds(this.userDetails);
      },
    });
    this.getAnnouncements();
  }
  getGradeIds(user: UserDetailsDTO) {
    if (user.role === 'PARENT') {
      const gradeIds: number[] = [];
      for (const student of user.students) {
        console.log(student.studentClass);
        const gradeId = student.studentClass.includes('Primaria') ? 1 : 6;
        if (!gradeIds.includes(gradeId)) gradeIds.push(gradeId);
      }
      return gradeIds;
    }
    return [1, 6];
  }
  getAnnouncements() {
    const receiver = this.userDetails.role;

    this.announcementService
      .getAnnouncements(
        this.getGradeIds(this.userDetails),
        receiver === 'ADMINISTRATIVE' ? 'ALL' : receiver,
        1
      )
      .subscribe({
        next: response => {
          this.announcements = response.content;
          if (this.announcements.length > 0) {
            this.changeAnnouncement(0);
            this.announcementTimeout();
          }
        },
        error: error => {
          console.error(error);
        },
      });
  }
  changeAnnouncement(index: number) {
    this.currentAnnouncement = this.announcements[index];
  }
  onChangeAnIndexHandler(newIndex: number) {
    const length = this.announcements.length;
    this.index = newIndex;
    if (this.index > length - 1) this.index = 0;
    if (this.index < 0) this.index = length - 1;
    this.changeAnnouncement(this.index);
  }
  announcementTimeout() {
    const classes = this.announcementEl!.nativeElement.className;
    this.announcementEl!.nativeElement.className += ' fadeOut';
    this.timeout = setTimeout(() => {
      this.onChangeAnIndexHandler(this.index + 1);
      this.announcementEl!.nativeElement.className = classes;
    }, 1000);
    setTimeout(() => {
      this.announcementTimeout();
    }, 5000);
  }
}
