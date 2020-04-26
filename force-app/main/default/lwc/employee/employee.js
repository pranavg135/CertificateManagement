import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { createRecord, updateRecord, deleteRecord } from 'lightning/uiRecordApi';

import getEmployeeList from '@salesforce/apex/Fetchdata.employeeData';
import { refreshApex } from '@salesforce/apex';
import EmployeeObject from '@salesforce/schema/Employee__c';
import IdField from '@salesforce/schema/Employee__c.Id';
import EmpName from '@salesforce/schema/Employee__c.Emp_Name__c';
import EmpEmail from '@salesforce/schema/Employee__c.Employee_Email__c';
import PrimarySkill from '@salesforce/schema/Employee__c.Primary_Skill__c';
import SecondarySkill from '@salesforce/schema/Employee__c.Secondary_Skill__c';
import EmpExperience from '@salesforce/schema/Employee__c.Experience__c';
import EmpComments from '@salesforce/schema/Employee__c.Comments__c';

const actions = [
    { label: 'Edit', name: 'edit' },
    { label: 'Delete', name: 'delete' },
    { label: 'Details', name: 'details' },
];

const columns = [
    { label: 'Emp ID', fieldName: 'Name' },
    { label: 'Name', fieldName: 'Emp_Name__c', type: 'text' },
    { label: 'Email', fieldName: 'Employee_Email__c', type: 'email' },
    { label: 'Primary Skill', fieldName: 'Primary_Skill__c', type: 'text' },
    { label: 'Secondary Skill', fieldName: 'Secondary_Skill__c', type: 'text' },
    { label: 'Experience', fieldName: 'Experience__c', type: 'number' },
    { label: 'Comments', fieldName: 'Comments__c', type: 'text' },
    {
        type: 'action',
        typeAttributes: {
            rowActions: actions,
        }
    }
];

export default class employee extends LightningElement {

    // insert data into the database

    name = '';
    email = '';
    primaryskill = '';
    secondaryskill = '';
    experience = '';
    comments = '';

    handleChange(event) {
        if (event.target.label == 'Name') {
            this.name = event.target.value;
        } else if (event.target.label == 'Email') {
            this.email = event.target.value;
        } else if (event.target.label == 'Primary Skill') {
            this.primaryskill = event.target.value;
        } else if (event.target.label == 'Secondary Skill') {
            this.secondaryskill = event.target.value;
        } else if (event.target.label == 'Experience') {
            this.experience = event.target.value;
        } else if (event.target.label == 'Comments') {
            this.comments = event.target.value;
        }
    }

    submit() {
        const fields = {};
        fields[EmpName.fieldApiName] = this.name;
        fields[EmpEmail.fieldApiName] = this.email;
        fields[PrimarySkill.fieldApiName] = this.primaryskill;
        fields[SecondarySkill.fieldApiName] = this.secondaryskill;
        fields[EmpExperience.fieldApiName] = this.experience;
        fields[EmpComments.fieldApiName] = this.comments;
       // console.log(fields);

        const recordInput = { apiName: EmployeeObject.objectApiName, fields };

        createRecord(recordInput).then(() => {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Success',
                message: 'Employee Successfully Added !',
                variant: 'success'
            }));
            location.reload();
        }).catch(() => {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: 'Incorrect Value. Error Creating Record',
                variant: 'error'
            }));
        });
    }
    // part Ends

    // fetching data from the database

    @track employees = [];
    @track columns = columns;
    @track record;
    @track currentRecordId;
    @track isEditForm = false;
    @track bShowModal = false;

    error;
    refreshTable;

    @wire(getEmployeeList)
    Employee__c(result) {
        this.refreshTable = result;
        if (result.data) {
            this.employees = result.data;
            this.error = undefined;
        } else if (result.error) {
            this.employees = undefined;
            this.error = result.error;
        }
        console.log(this.error);
    }

    // part ends

    handleRowActions(event) {
        let actionName = event.detail.action.name;
        let row = event.detail.row;

        switch (actionName) {
            case 'record_details':
                this.viewEmp(row);
                break;
            case 'edit':
                this.editCurrEmp(row);
                break;
            case 'delete':
                this.deleteEmp(row);
                break;
        }
    }

    viewEmp(currRow) {
        this.bShowModal = true;
        this.isEditForm = false;
        this.record = currRow;
    }

    closeModal() {
        this.bShowModal = false;
    }

    editCurrEmp(currRow) {
        this.bShowModal = true;
        this.isEditForm = true;
        this.currentRecordId = currRow.Id;
    }

    handleSubmit(event) {
        console.log("Update method called !");
        this.bShowModal = false;
        this.isEditForm = false;

        const fields = {};
        fields[IdField.fieldApiName] = this.currentRecordId;
        fields[EmpName.fieldApiName] = event.detail.fields.Emp_Name__c;
        fields[EmpEmail.fieldApiName] = event.detail.fields.Employee_Email__c;
        fields[PrimarySkill.fieldApiName] = event.detail.fields.Primary_Skill__c;
        fields[SecondarySkill.fieldApiName] = event.detail.fields.Secondary_Skill__c;
        fields[EmpExperience.fieldApiName] = event.detail.fields.Experience__c;
        fields[EmpComments.fieldApiName] = event.detail.fields.Comments__c;
        console.log(fields);

        const recordInput = { fields };

        updateRecord(recordInput).then(() => {
            this.dispatchEvent(new ShowToastEvent({
                title: 'success',
                message: 'Record Successfully Updated !',
                variant: 'success'
            }));
            return refreshApex(this.refreshTable);
        }).catch(err => {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error updaing record',
                message: 'Error',
                variant: 'error'
            }));
            console.log('Error aa gaya Bhaiyo');
        });
    }

    deleteEmp(currRow) {
        deleteRecord(currRow.Id).then(() => {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Deleted',
                message: 'Record Deleted !',
                variant: 'success'
            }));
            return refreshApex(this.refreshTable);
        }).catch(error => {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: 'Record could not be Deleted !',
                variant: 'error'
            }));
        });
    }
}