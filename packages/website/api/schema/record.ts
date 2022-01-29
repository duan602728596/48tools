export default /* GraphQL */ `
    # 房间信息
    type RecordLiveRoomInfo {
        playStreamPath: String
        systemMsg: String
        msgFilePath: String
    }

    # 用户信息
    type RecordUserInfo {
        avatar: String
        nickname: String
        teamLogo: String
        userId: String
    }

    # 列表
    type RecordLiveInfo {
        coverPath: String
        ctime: String
        liveId: String
        roomId: String
        liveType: Int
        title: String
        userInfo: RecordUserInfo
        liveRoomInfo: RecordLiveRoomInfo
    }

    # 录播
    type Record {
        next: String
        liveList: [RecordLiveInfo]
    }
`;