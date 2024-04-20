import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {ActivityService} from "../../service/activity.service";
import {GradesService} from "../../service/grades.service";
import {ResponseDTO} from "../../models/ResponseDTO";
import {ActivityDTO} from "../../models/ActivityDTO";
import {ActivityGradeDTO} from "../../models/ActivityGradeDTO";
import {StudentDTO} from "../../models/StudentDTO";
import {forkJoin} from "rxjs";
import {AssignationService} from "../../service/assignation.service";
import {AssignationDTO} from "../../models/AssignationDTO";
import {NgClass, NgStyle} from "@angular/common";
import colors from "tailwindcss/colors";
import {RoundPipe} from "../../pipes/RoundPipe";

@Component({
  selector: 'app-student-activities',
  standalone: true,
  imports: [
    NgStyle,
    RoundPipe,
    NgClass
  ],
  templateUrl: './student-activities.component.html',
  styleUrl: './student-activities.component.css'
})
export class StudentActivitiesComponent implements OnInit{
  bimester: number = 0;
  assignationId: number = 0;
  activities: ActivityDTO[];
  grades: ActivityGradeDTO[];
  studentData: StudentDTO;
  table: any[] ;
  dimensionValue : {[key: string]: number} ;
  totalGrade: number;
  assignation: AssignationDTO;
  constructor(private route: ActivatedRoute,
              private activityService: ActivityService,
              private gradesService: GradesService,
              private assignationService: AssignationService) {
    this.assignation = {} as AssignationDTO;
    this.activities = [];
    this.grades = [];
    this.table = [];
    this.totalGrade = 0;
    this.studentData = {
      "id": 13,
      "name": "Trueman",
      "ci": "179-94-9723",
      "fatherLastname": "Deyes",
      "motherLastname": "Paybody",
      "birthDate": "2009-05-07",
      "address": "73 Pankratz Center",
      "rude": "820-32-9193",
      "studentClass": "1°Primaria A"
    }
    this.dimensionValue = {
      'HACER':30,
      'SABER':30,
      'SER':20,
      'DECIDIR':20
    }
  }
  ngOnInit(): void {
    this.getRouteParams();
    forkJoin({
      activities: this.activityService.getActivitiesByAssignationId(this.assignationId,this.bimester),
      grades: this.gradesService.getGradesByStudentIdAndAssignationAndBimester(this.studentData.id,this.assignationId,this.bimester),
      assignation: this.assignationService.getAssignationById(this.assignationId)
    }).subscribe({
      next: (data: {activities: ResponseDTO<ActivityDTO[]>, grades: ResponseDTO<ActivityGradeDTO[]>, assignation: ResponseDTO<AssignationDTO>}) => {
        this.activities = data.activities.content;
        this.grades = data.grades.content;
        this.assignation = data.assignation.content
        this.table = this.buildTable();
        console.log(this.table);
      },
      error: (error: any) => {
        console.error(error);
      }

    })
  }
  getRouteParams(){
    this.route.params.subscribe({
      next: (params: any) => {
        this.bimester = params.bimester;
        this.assignationId = params.assignationId;
      },
    });
  }
  buildTable(){
    let table = [];
    for(let i = 0; i < this.activities.length; i++){
      let activity = this.activities[i];
      let grade = this.grades.find((grade) => grade.activityId === activity.id);
      this.totalGrade += activity.value * (grade?.grade || 0) / 100 * this.dimensionValue[activity.dimension] /100;
      table.push({
        id: grade?.id || 0,
        activity: activity.name ,
        value: activity.value,
        grade: grade?.grade || 0,
        dimension: activity.dimension,
        total: activity.value * (grade?.grade || 0) / 100 * this.dimensionValue[activity.dimension] /100 });
    }
    return table;
  }

  protected readonly colors = colors;
}
