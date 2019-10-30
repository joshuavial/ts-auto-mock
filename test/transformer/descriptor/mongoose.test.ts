import { createMock } from 'ts-auto-mock';
import { Connection} from 'mongoose';

describe('for mongoose', () => {
    describe('connection', () => {
        interface Interface {
            connection: Connection
        }

        fit('should set an empty string', () => {
            const mock: Interface = createMock<Interface>();
            console.log(mock.connection);
        });
    });
});
