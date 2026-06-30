import { Scheduler } from './rxjs/scheduler';

export function animate(marbles: string): void {
  Scheduler.animate(marbles);
}
