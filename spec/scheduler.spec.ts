import {Scheduler} from '../index';

describe('Scheduler unit test', () => {

    it('should throw if the Scheduler is not initialized', () => {
        Scheduler.reset();

        try {
            Scheduler.get();
        } catch (err) {
            expect(err).toEqual(new Error('Scheduler is not initialized'));
        }

        Scheduler.init();
    });
});
