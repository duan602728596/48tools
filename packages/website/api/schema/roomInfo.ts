export default /* GraphQL */ `
    type RoomId {
        id: Float
        ownerName: String
        roomId: String
        account: String
    }

    type RoomInfo {
        roomId: [RoomId]
        buildTime: String
    }
`;