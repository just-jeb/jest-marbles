export class NotificationEvent {
  marbles = '';
  constructor(public start: number) {}
  get end(): number {
    return this.start + this.marbles.length;
  }
}
