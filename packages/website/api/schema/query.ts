export default /* GraphQL */ `
    # 房间信息
    type LiveRoomInfo {
        playStreamPath: String
        systemMsg: String
        msgFilePath: String
    }

    # 用户信息
    type UserInfo {
        avatar: String
        nickname: String
        teamLogo: String
        userId: String
    }

    # 列表
    type LiveInfo {
        coverPath: String
        ctime: String
        liveId: String
        roomId: String
        liveType: Int
        title: String
        userInfo: UserInfo
        liveRoomInfo: LiveRoomInfo
    }

    # 录播
    type Record {
        next: String
        liveList: [LiveInfo]
    }

    type Query {
        record(next: String, userId: Int!): Record
    }
`;