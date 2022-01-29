import recordSchema from './record.js';
import roomInfoSchema from './roomInfo.js';

export default /* GraphQL */ `
    ${ recordSchema }

    ${ roomInfoSchema }

    type Query {
        record(userId: Int!, next: String, liveId: [String]): Record
        roomInfo: RoomInfo
    }
`;