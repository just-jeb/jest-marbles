export class NotificationEvent {
  marbles = '';
  constructor(public start: number) {
    if (!Number.isFinite(start)) {
      throw new TypeError('start must be a finite number');
    }
  }
  get end(): number {
    return this.start + this.marbles.length;
  }
}
