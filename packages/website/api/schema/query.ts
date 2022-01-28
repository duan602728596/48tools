import recordSchema from './record.js';
import roomInfoSchema from './roomInfo.js';

export default /* GraphQL */ `
    ${ recordSchema }

    ${ roomInfoSchema }

    type Query {
        record(next: String, userId: Int!): Record
        roomInfo: RoomInfo
    }
`;