export default /* GraphQL */ `
    # 房间信息
    type RecordLiveRoomInfo {
        playStreamPath: String
        systemMsg: String
        msgFilePath: String
        title: String
        liveId: String
        ctime: String
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
        liveMode: Int
        title: String
        userInfo: RecordUserInfo
        liveRoomInfo: RecordLiveRoomInfo
    }

    # 录播
    type Record {
        next: String
        liveList: [RecordLiveInfo]
        liveRoomInfo: [RecordLiveRoomInfo]
    }
`;