import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TestListComponent } from './components/test-list.component';
import { CreateTestComponent } from './components/create-test.component';
import { TestDetailComponent } from './components/test-detail.component';
import { AssignTestComponent } from './components/assign-test.component';
import { EmployeTestsComponent } from './components/employe-tests.component';
import { TakeTestComponent } from './components/take-test.component';
import { TestResultComponent } from './components/test-result.component';

const routes: Routes = [
    // Manager Routes
    { path: 'tests', component: TestListComponent },
    { path: 'tests/create', component: CreateTestComponent },
    { path: 'tests/:id', component: TestDetailComponent },
    { path: 'tests/assign/:id', component: AssignTestComponent },

    // Employee Routes
    { path: 'employe/tests', component: EmployeTestsComponent },
    { path: 'employe/tests/:id/pass', component: TakeTestComponent },
    { path: 'employe/tests/:id/result', component: TestResultComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TestsRoutingModule { }
