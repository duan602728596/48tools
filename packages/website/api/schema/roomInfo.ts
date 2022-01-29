export default /* GraphQL */ `
    type RoomInfoRoomId {
        id: Float
        ownerName: String
        roomId: String
        account: String
    }

    type RoomInfo {
        roomId: [RoomInfoRoomId]
        buildTime: String
    }
`;