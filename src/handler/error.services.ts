import { HttpException, HttpStatus } from '@nestjs/common';

export class BadRequestException extends HttpException {
    constructor(message: string) {
        super(message, HttpStatus.BAD_REQUEST);
    }
}

export class EmailExist extends HttpException {
    constructor() {
        super("This email is already in use. Please use different mail", HttpStatus.BAD_REQUEST);
    }
}

export class EmailNotExist extends HttpException {
    constructor() {
        super('Sorry this email does not exists', HttpStatus.BAD_REQUEST);
    }
}

export class PhoneNumberExist extends HttpException {
    constructor() {
        super('Sorry this phone number is already exists', HttpStatus.BAD_REQUEST);
    }
}

export class PhoneNumberNotExist extends HttpException {
    constructor() {
        super('Sorry this phone number does not exists', HttpStatus.BAD_REQUEST);
    }
}

export class NotBearerToken extends HttpException {
    constructor() {
        super('Sorry this is not a bearer token', HttpStatus.BAD_REQUEST);
    }
}

export class Unauthorized extends HttpException {
    constructor() {
        super('You are not authorized to perform this action.', HttpStatus.UNAUTHORIZED);
    }
}

export class InsufficientPermission extends HttpException {
    constructor() {
        super('insufficient permission', HttpStatus.BAD_REQUEST);
    }
}

export class NotAllowed extends HttpException {
    constructor() {
        super('Not Allowed', HttpStatus.NOT_ACCEPTABLE);
    }
}

export class InvalidObjectId extends HttpException {
    constructor() {
        super('Sorry this is not a valid object id.', HttpStatus.BAD_REQUEST);
    }
}

export class IncorrectMessageId extends HttpException {
    constructor() {
        super('Sorry this is not a valid message _id.', HttpStatus.BAD_REQUEST);
    }
}

export class WrongOtp extends HttpException {
    constructor() {
        super('Sorry you entered wrong Otp.', HttpStatus.BAD_REQUEST);
    }
}


export class UserNotMatched extends HttpException {
    constructor() {
        super('Sorry users does not matched.', HttpStatus.BAD_REQUEST);
    }
}

export class UserNotFound extends HttpException {
    constructor() {
        super('Sorry user not found.', HttpStatus.BAD_REQUEST);
    }
}

export class WrongPassword extends HttpException {
    constructor() {
        super('Sorry wrong password.', HttpStatus.BAD_REQUEST);
    }
}

export class AccountBlocked extends HttpException {
    constructor() {
        super('Sorry your Account Blocked.', HttpStatus.BAD_REQUEST);
    }
}

export class AccountDeleted extends HttpException {
    constructor() {
        super('Sorry your Account Is Deleted.', HttpStatus.BAD_REQUEST);
    }
}
export class AgeRestriction13 extends HttpException {
    constructor() {
        super('Sorry Age Restriction Rated 13+.', HttpStatus.NOT_ACCEPTABLE);
    }
}

export class AgeRestriction18 extends HttpException {
    constructor() {
        super('Sorry Age Restriction Rated 18+.', HttpStatus.NOT_ACCEPTABLE);
    }
}

export class MalesOnly extends HttpException {
    constructor() {
        super('Sorry Gender Restriction Males Only.', HttpStatus.NOT_ACCEPTABLE);
    }
}

export class FemalesOnly extends HttpException {
    constructor() {
        super('Sorry Gender Restriction FEMALE Only.', HttpStatus.NOT_ACCEPTABLE);
    }
}

export class DataNotFound extends HttpException {
    constructor() {
        super('Sorry Data Not Found.', HttpStatus.NOT_ACCEPTABLE);
    }
}

export class InvitationExpired extends HttpException {
    constructor() {
        super('Sorry Invitation Expired.', HttpStatus.FORBIDDEN);
    }
}

export class InvitationAtLeastOne extends HttpException {
    constructor() {
        super('Invite at least 1 user.', HttpStatus.FORBIDDEN);
    }
}

export class InvitationLimit extends HttpException {
    constructor() {
        super('Sorry You can Invite Only 3 user.', HttpStatus.FORBIDDEN);
    }
}

export class SelectDate extends HttpException {
    constructor() {
        super('Select date.', HttpStatus.FORBIDDEN);
    }
}

export class StartTime extends HttpException {
    constructor() {
        super('Select Start Time.', HttpStatus.FORBIDDEN);
    }
}

export class EndTime extends HttpException {
    constructor() {
        super('Select End Time.', HttpStatus.FORBIDDEN);
    }
}

export class UpdateDob extends HttpException {
    constructor() {
        super('Update Your Date Of Birth', HttpStatus.NOT_FOUND);
    }
}

export class BankAccountNotFound extends HttpException {
    constructor() {
        super('Bank account not found.', HttpStatus.NOT_FOUND);
    }
}

export class TicketNotFound extends HttpException {
    constructor() {
        super('Tickets not found.', HttpStatus.NOT_FOUND);
    }
}

export class TicketSaleClosed extends HttpException {
    constructor() {
        super('Tickets sale closed.', HttpStatus.BAD_REQUEST);
    }
}

export class BankDetailsNotExist extends HttpException {
    constructor() {
        super('Sorry bank details does not exists', HttpStatus.BAD_REQUEST);
    }
}

export class NoLivePostFound extends HttpException {
    constructor() {
        super('Sorry this Live Post does not exists', HttpStatus.BAD_REQUEST);
    }
}

export class LivePostNotStarted extends HttpException {
    constructor() {
        super('Sorry Live Post not started yet', HttpStatus.BAD_REQUEST);
    }
}

export class StartingTimeIsNotYet extends HttpException {
    constructor() {
        super('Sorry Live Post time is not matching', HttpStatus.BAD_REQUEST);
    }
}