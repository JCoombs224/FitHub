import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { WorkoutsService } from 'src/app/services/workouts.service';
import { animate, style, transition, trigger } from "@angular/animations";
import { FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-equipment-modal',
  templateUrl: './equipment-modal.component.html',
  styleUrls: ['./equipment-modal.component.css'],
  animations: [
    trigger(
      'slideOutAnimation',
      [
        transition(
          ':enter',
          [
            style({ height: 0, opacity: 0 }),
            animate('0.4s ease-out',
              style({}))
          ]
        ),
        transition(
          ':leave',
          [
            style({}),
            animate('0.4s ease-in',
              style({ height: 0, opacity: 0 }))
          ]
        )
      ]
    )
  ]
})
export class EquipmentModalComponent implements OnInit {

  constructor(public bsModalRef: BsModalRef,
              private workoutService: WorkoutsService,
              private fb: FormBuilder,
              private toastr: ToastrService) { }

  equipmentNames = [
    { name: 'barbell', control: 'barbell' },
    { name: 'bench', control: 'bench' },
    { name: 'cable', control: 'cable' },
    { name: 'dumbbell', control: 'dumbbell' },
    { name: 'kettlebells', control: 'kettlebells' },
    { name: 'machine', control: 'machine' },
    { name: 'medicine ball', control: 'medicineball' },
    { name: 'pullup bar', control: 'pullupbar' },
    { name: 'other', control: 'other' }
  ];

  equipmentChecklist = this.fb.group({
    name: ['', Validators.required],
    barbell: [false],
    bench: [false],
    cable: [false],
    dumbbell: [false],
    kettlebells: [false],
    machine: [false],
    medicineball: [false],
    pullupbar: [false],
    other: [false],
  });

  equipment;
  editing = false;

  ngOnInit(): void {
    if(this.equipment) {
      console.log(this.equipment);
      this.equipmentChecklist.get('name').setValue(this.equipment.name);
      this.editing = true;
      for (let i of this.equipment.equipment) {
        this.equipmentChecklist.get(i.replace(/\s/g, "")).setValue(true);
      }
    }
  }

  public submit() {
    this.equipmentChecklist.markAllAsTouched();
    if(this.equipmentChecklist.invalid) {
      return;
    }
    if(this.editing) {
      this.update();
    }
    const equipment = [];
    for(let i of this.equipmentNames) {
      if(this.equipmentChecklist.get(i.control).value) {
        equipment.push(i.name);
      }
    }
    this.workoutService.addEquipmentGroup({name: this.equipmentChecklist.get('name').value, equipment: equipment}).then(() => {
      this.toastr.success('Equipment group added successfully');
      this.bsModalRef.content.callback({name: this.equipmentChecklist.get('name').value, equipment: equipment});
      this.bsModalRef.hide();
    }).catch((error)=>{
      console.log(error);
      this.toastr.error('Error adding equipment group')});
  }

  public cancel() {
    if (this.bsModalRef.content.callback != null) {
      this.bsModalRef.content.callback(false);
      this.bsModalRef.hide();
    }
  }

  private update() {
    this.workoutService.deleteEquipmentGroup(this.equipment).then(() => {
      this.toastr.success('Equipment group deleted successfully');
    }).catch((error)=>{
      console.log(error);
      this.toastr.error('Error deleting equipment group')
    });
  }

  public delete() {
    const equipment = [];
    for(let i of this.equipmentNames) {
      if(this.equipmentChecklist.get(i.control).value) {
        equipment.push(i.name);
      }

    this.workoutService.deleteEquipmentGroup({name: this.equipmentChecklist.get('name').value, equipment: equipment}).then(() => {
      this.toastr.success('Equipment group deleted successfully');
      this.bsModalRef.content.callback(false);
      this.bsModalRef.hide();
    }).catch((error)=>{
      console.log(error);
      this.toastr.error('Error deleting equipment group')});
    }
  }

  get name() { return this.equipmentChecklist.get('name'); }
}
