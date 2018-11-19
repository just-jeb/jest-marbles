export class NotificationEvent {
  marbles = '';
  constructor(public start: number) {}
  get end(): number {
    return this.start + this.marbles.length;
  }

  /**
   * Returns the difference (in empty time frames) between a NotificationEvent
   * and the previous NotificationEvent.
   *
   * @param prev previous event.
   */
  diff(prev?: NotificationEvent) {
    if (prev) {
      return this.start - prev.start;
    }
    return this.start;
  }
}
