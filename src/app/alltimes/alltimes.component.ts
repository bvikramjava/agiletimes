import { Component, OnInit, ViewChild } from '@angular/core';
import { MenuItem, DataTable, LazyLoadEvent,Message,ConfirmationService } from "primeng/primeng";
import Dexie from 'dexie';
import { Observable } from "rxjs";
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { FormGroup,FormBuilder } from '@angular/forms';

const MAX_EXAMPLE_RECORDS = 1000;

@Component({
  selector: 'at-alltimes',
  templateUrl: './alltimes.component.html',
  styleUrls: ['./alltimes.component.css']
})
export class AlltimesComponent implements OnInit {

  @ViewChild("dt") dt : DataTable;

  timesheetForm: FormGroup;
  
  allTimesheetData = [];

  allProjectNames = ['', 'Payroll App', 'Mobile App', 'Agile Times'];

  allProjects = this.allProjectNames.map((proj) => {
    return { label: proj, value: proj }
  });

  selectedRows: Array<any>;

  contextMenu: MenuItem[];

  recordCount : number;

  messages: Message[] = [];

  displayEntryForm = false;

  display: boolean = false;

  constructor(private apollo: Apollo,private fb: FormBuilder) { }

  ngOnInit() {
this.timesheetForm = this.fb.group({
  input1: '',
  input2: '',
  input3: '',
  input4: '',
  input5: '',

})
    const AllClientsQuery = gql`
    query allTimesheets {
      allTimesheets {
          id
          user
          project
          category
          startTime
          endTime
        }
    }`;

    const queryObservable = this.apollo.watchQuery({

      query: AllClientsQuery,
        pollInterval:200
    }).subscribe(({ data, loading }: any) => {

      this.allTimesheetData = data.allTimesheets;
      this.recordCount = data.allTimesheets.length;

    });

  }
  onSaveComplete() {
            const user = this.timesheetForm.value.input1;
            const project = this.timesheetForm.value.input2;
            const category = this.timesheetForm.value.input3;
            const startTime = this.timesheetForm.value.input4;
            const endTime = this.timesheetForm.value.input5;
        
            const createTimesheet = gql`
              mutation createTimesheet ($user: String!, $project: String!, $category: String!, $startTime: Int!, $endTime: Int!, $date: DateTime!) {
                createTimesheet(user: $user, project: $project, category: $category, startTime: $startTime, endTime: $endTime, date: $date ) {
                  id
                }
              }
            `;
        
            this.apollo.mutate({
              mutation: createTimesheet,
              variables: {
                user: user,
                project: project,
                category: category,
                startTime: startTime,
                endTime: endTime,
                date: new Date()
              }
            }).subscribe(({ data }) => {
              console.log('got data', data);
              
            }, (error) => {
              console.log('there was an error sending the query', error);
            });
            this.displayEntryForm = false;
          }
}