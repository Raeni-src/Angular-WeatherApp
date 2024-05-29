import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrendpageComponent } from './trendpage.component';

describe('TrendpageComponent', () => {
  let component: TrendpageComponent;
  let fixture: ComponentFixture<TrendpageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrendpageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TrendpageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
