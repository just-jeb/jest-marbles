import { Notification } from 'rxjs/Notification';

export interface TestMessage {
  frame: number;
  notification: Notification<any>;
  isGhost?: boolean;
}
