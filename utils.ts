export enum DeviceType {
    ANDROID = "ANDROID",
    IOS = "IOS",
    WEB = "WEB"
}

export enum SocialType {
    FACEBOOK = "FACEBOOK",
    GOOGLE = "GOOGLE",
    APPLE = "APPLE"
}

export enum AccountStatus {
    ACTIVATED = "ACTIVATED",
    DEACTIVATED = "DEACTIVATED",
    PENDING = "PENDING"
}

export enum Genders {
    MALE = "MALE",
    FEMALE = "FEMALE",
    OTHERS = "OTHERS"
}

export enum UserType {
    USER = "USER",
    ADMIN = "ADMIN"
}

export enum StaffRoles {
    null = null,
    STAFF = "STAFF",
    DASHBOARD = "DASHBOARD",
    USERS = "USERS",
    SETTINGS = "SETTINGS",
    CONTENT = "CONTENT",
    FAQ = "FAQ",
    CONTACT = "CONTACT",
    NOTIFICATION = "NOTIFICATION",
    DBBACKUP = "DBBACKUP",
    POST = 'POST',
    COMMISSION = 'COMMISSION',
    REPORT = 'REPORT',
    PAYOUT = 'PAYOUT',
    TICKET = 'TICKET',
    TRANSACTIONS = 'TRANSACTIONS'
}

export enum chat_type {
    NORMAL = "NORMAL",
    GROUP = "GROUP"
}

export enum type {
    NORMAL = "NORMAL",
    REPLY = "REPLY",
    FORWARDED = "FORWARDED",
    DELETED = "DELETED",
}

export enum message_type {
    TEXT = "TEXT",
    IMAGE = "IMAGE",
    VIDEO = "VIDEO",
    AUDIO = "AUDIO",
    DOCUMENT = "DOCUMENT",
    LOCATION = "LOCATION"
}

export enum post_type {
    POST = "POST",
    COMPETITIVE = "COMPETITIVE",
    LIVE = "LIVE",
    IQUERY = "IQUERY"
}


export enum post_by {
    ADMIN = "ADMIN",
    USER = "USER",
}

export enum post_activity {
    ONGOING = "ONGOING",
    UPCOMING = "UPCOMING",
    FINISHED = "FINISHED"
}

export enum contest_type {
    null = null,
    FREE = "FREE",
    PAID = "PAID"
}

export enum contest {
    ONGOING = "ONGOING",
    FINISHED = "FINISHED"
}

export enum iquery_contest {
    ADMIN = "ADMIN",
    USER = "USER"
}

export enum age_restrication {
    NONE = "NONE",
    ABOVE18 = "ABOVE18",//"ONLY 18 AND ABOVE",
    ABOVE13 = "ABOVE13"//"ALL AGE GROUP APPROPRIATE 13 AND ABOVE"
}

export enum gender {
    MALE = "MALE",
    FEMALE = "FEMALE",
    ANY = "ANY"
}

export enum interview_type {
    FREE = "FREE",
    PAID = "PAID",
}

export enum media_type {
    PHOTO = "PHOTO",
    VIDEO = "VIDEO",
    AUDIO = "AUDIO",
    TEXT = "TEXT"
}

export enum status {
    PENDING = "PENDING",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED"
}

export enum notification_type {
    INVITATION = "INVITATION",
    POST_LIKE = "POST_LIKE",
    POST_COMMENT = "POST_COMMENT",
    FAN_REQUEST = "FAN_REQUEST",
    PUSH = "PUSH",
    EMAIL = "EMAIL",
    GROUP = "GROUP",
}

export enum payment_type {
    Pending = "Pending",
    Completed = "Completed",
    Failed = "Failed"
}

export enum transaction_type {
    TICKET = "TICKET",
    TICKET_INTERVIEW = "TICKET_INTERVIEW"
}

export enum post_Status {
    PENDING = "PENDING",
    ONGOING = "ONGOING",
    FINISHED = "FINISHED",
    UPCOMING = "UPCOMING"
}



export enum contact_status {
    Pending = "PENDING",
    Resolve = "RESOLVED",
}

export enum report_type {
    POST = "POST",
    COMMENT = "COMMENT",
    USER = "USER",
    MESSAGE = "MESSAGE"
}