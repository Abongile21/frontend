import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FortyGuardService } from '../../core/services/fortyguard.service';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let service: jasmine.SpyObj<FortyGuardService>;

  beforeEach(async () => {
    service = jasmine.createSpyObj<FortyGuardService>('FortyGuardService', ['getHealth']);
    service.getHealth.and.returnValue(of({ status: 'ok', fortyGuard: 'disabled' }));
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [{ provide: FortyGuardService, useValue: service }, provideRouter([])]
    }).compileComponents();
    fixture = TestBed.createComponent(DashboardComponent);
  });

  it('shows the dashboard shortcuts and does not invent analytics', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('What Should I Wear?');
    expect(fixture.nativeElement.textContent).toContain('No recent analyses');
    expect(fixture.nativeElement.textContent).not.toContain('analyses submitted');
  });

  it('shows an explicit connection error when the API is unavailable', () => {
    service.getHealth.and.returnValue(throwError(() => new Error('offline')));
    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Backend unavailable');
  });
});
