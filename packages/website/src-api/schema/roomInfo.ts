export default /* GraphQL */ `
    type RoomInfoRoomId {
        id: Float
        ownerName: String
        roomId: String
        account: String
        serverId: String
    }

    type RoomInfo {
        roomId: [RoomInfoRoomId]
        buildTime: String
    }
`;