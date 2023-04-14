import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipmentModaComponent } from './equipment-moda.component';

describe('EquipmentModaComponent', () => {
  let component: EquipmentModaComponent;
  let fixture: ComponentFixture<EquipmentModaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EquipmentModaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EquipmentModaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
