import { HttpException, HttpStatus } from '@nestjs/common';

export class BadRequestException extends HttpException {
    constructor(message: string) {
        super(message, HttpStatus.BAD_REQUEST);
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
        super('Sorry user not found.', HttpStatus.NOT_FOUND);
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


export class DisplayNameTooLong extends HttpException {
  constructor() {
    super("The display name is too long. Please use a shorter name.", HttpStatus.BAD_REQUEST);
  }
}

export class CapitalizeFirstLetter extends HttpException {
  constructor() {
    super("Please capitalize the first letter of each name in your full name.", HttpStatus.BAD_REQUEST);
  }
}

export class ConsecutiveUnderscoresInDisplayName extends HttpException {
  constructor() {
    super("Please avoid using consecutive underscores in your display name.", HttpStatus.BAD_REQUEST);
  }
}

export class EmailRequired extends HttpException {
  constructor() {
    super("Please enter your email address.", HttpStatus.BAD_REQUEST);
  }
}

export class InvalidEmailOrPassword extends HttpException {
  constructor() {
    super("Invalid email or password. Please try again.", HttpStatus.BAD_REQUEST);
  }
}

export class EmailAlreadyRegistered extends HttpException {
  constructor() {
    super("The email address you entered is already registered. Please log in or use a different email.", HttpStatus.BAD_REQUEST);
  }
}

export class EmailDomainNotSupported extends HttpException {
  constructor() {
    super("Email domain is not supported. Please use a different email.", HttpStatus.BAD_REQUEST);
  }
}

export class InvalidEmail extends HttpException {
  constructor() {
    super("Please enter a valid email address.", HttpStatus.BAD_REQUEST);
  }
}

export class NonexistentEmail extends HttpException {
  constructor() {
    super("The email address you entered does not exist. Please check and try again.", HttpStatus.BAD_REQUEST);
  }
}

export class EmailTooLong extends HttpException {
  constructor() {
    super("The email address is too long. Please shorten it and try again.", HttpStatus.BAD_REQUEST);
  }
}

export class EmailMinimumLength extends HttpException {
  constructor() {
    super("The email address must be at least 5 characters long.", HttpStatus.BAD_REQUEST);
  }
}

export class ExcessiveConsecutiveDotsInEmail extends HttpException {
  constructor() {
    super("Please avoid using excessive consecutive dots in your email address.", HttpStatus.BAD_REQUEST);
  }
}

export class ExcessiveConsecutiveUnderscoresInEmail extends HttpException {
  constructor() {
    super("Please avoid using consecutive underscores in your email address.", HttpStatus.BAD_REQUEST);
  }
}

export class EmailNotVerified extends HttpException {
  constructor() {
    super("Email address not verified. Please check your inbox for verification instructions.", HttpStatus.BAD_REQUEST);
  }
}

export class EmailContainsSpaces extends HttpException {
  constructor() {
    super("Email address cannot contain spaces. Please remove spaces and try again.", HttpStatus.BAD_REQUEST);
  }
}

export class EmailStartsWithDot extends HttpException {
  constructor() {
    super("Email address cannot start with a dot. Please enter a valid email address.", HttpStatus.BAD_REQUEST);
  }
}

export class EmailEndsWithDot extends HttpException {
  constructor() {
    super("Email address cannot end with a dot. Please enter a valid email address.", HttpStatus.BAD_REQUEST);
  }
}

export class EmailNotAllowed extends HttpException {
  constructor() {
    super("This email address is not allowed. Please use a different email.", HttpStatus.BAD_REQUEST);
  }
}

export class EmailAlreadyVerified extends HttpException {
  constructor() {
    super("The email address is already verified.", HttpStatus.BAD_REQUEST);
  }
}

export class EmailContainsSpacesLeadingTrailing extends HttpException {
  constructor() {
    super("Email address cannot contain leading or trailing spaces. Please enter a valid email address.", HttpStatus.BAD_REQUEST);
  }
}

export class EmailDomainNotAllowed extends HttpException {
  constructor() {
    super("Email address from this domain is not allowed. Please use a different email.", HttpStatus.BAD_REQUEST);
  }
}

export class AvoidConsecutiveHyphensInEmail extends HttpException {
  constructor() {
    super("Please avoid using consecutive hyphens in your email address.", HttpStatus.BAD_REQUEST);
  }
}

export class TempDomainNotAllowed extends HttpException {
  constructor() {
    super("Email address from temporary domains is not allowed. Please use a different email.", HttpStatus.BAD_REQUEST);
  }
}

export class InvalidCharactersInEmail extends HttpException {
  constructor() {
    super("Email address contains invalid characters. Please use a valid email address.", HttpStatus.BAD_REQUEST);
  }
}

export class EmailConfirmationTimeExceeded extends HttpException {
  constructor() {
    super("Email address confirmation time exceeded. Please request a new confirmation link.", HttpStatus.BAD_REQUEST);
  }
}

export class EmailStartsOrEndsWithUnderscore extends HttpException {
  constructor() {
    super("Email address cannot start or end with an underscore. Please enter a valid email address.", HttpStatus.BAD_REQUEST);
  }
}



export class EmailLowerCase extends HttpException {
  constructor() {
    super("Email address should be in lowercase. Please enter a valid email address.", HttpStatus.BAD_REQUEST);
  }
}


export class EmailNotAssociated extends HttpException {
  constructor() {
    super("The email address you entered is not associated with any account. Please sign up.", HttpStatus.BAD_REQUEST);
  }
}

export class ConsecutiveUnderscoresInEmail extends HttpException {
  constructor() {
    super("Please avoid using consecutive underscores in your email address.", HttpStatus.BAD_REQUEST);
  }
}

export class RestrictedCharactersInEmail extends HttpException {
  constructor() {
    super("Email address contains restricted characters. Please use a valid email address.", HttpStatus.BAD_REQUEST);
  }
}

export class ConfirmEmailToLogin extends HttpException {
  constructor() {
    super("Please confirm your email address to log in. Check your inbox for the confirmation link.", HttpStatus.BAD_REQUEST);
  }
}

export class ConsecutivePeriodsInEmail extends HttpException {
  constructor() {
    super("Please avoid using consecutive periods in your email address.", HttpStatus.BAD_REQUEST);
  }
}

export class ValidEmailWithValidDomain extends HttpException {
  constructor() {
    super("Please enter a valid email address with a valid domain.", HttpStatus.BAD_REQUEST);
  }
}

export class ConsecutiveAtSymbolsInEmail extends HttpException {
  constructor() {
    super("Please avoid using consecutive '@' symbols in your email address.", HttpStatus.BAD_REQUEST);
  }
}

export class EmailAssociatedWithDisabledAccount extends HttpException {
  constructor() {
    super("The email address you entered is associated with a disabled account. Please contact support for assistance.", HttpStatus.BAD_REQUEST);
  }
}

export class EmailLowerCaseInvalid extends HttpException {
  constructor() {
    super("Email address should be in lowercase. Please enter a valid email address.", HttpStatus.BAD_REQUEST);
  }
}

export class EmailNotAcceptedDueToDomainPolicies extends HttpException {
  constructor() {
    super("The email address you entered is not accepted due to domain policies. Please use a different email.", HttpStatus.BAD_REQUEST);
  }
}

export class EmailAssociatedWithBannedUser extends HttpException {
  constructor() {
    super("The email address you entered is associated with a banned user. Please contact support for assistance.", HttpStatus.BAD_REQUEST);
  }
}

export class EmailContainsRestrictedWords extends HttpException {
  constructor() {
    super("The email address you entered contains restricted words. Please use a different email.", HttpStatus.BAD_REQUEST);
  }
}

export class InvalidEmailFormat extends HttpException {
  constructor() {
    super("The email address format is not valid. Please enter a valid email address.", HttpStatus.BAD_REQUEST);
  }
}

export class EmailAssociatedWithInactiveAccount extends HttpException {
  constructor() {
    super("The email address you entered is associated with an inactive account. Please contact support for assistance.", HttpStatus.BAD_REQUEST);
  }
}

export class EmailAssociatedWithDeletedAccount extends HttpException {
  constructor() {
    super("The email address you entered is associated with a deleted account. Please contact support for assistance.", HttpStatus.BAD_REQUEST);
  }
}

export class EmailAssociatedWithSuspendedAccount extends HttpException {
  constructor() {
    super("The email address you entered is associated with a suspended account. Please contact support for assistance.", HttpStatus.BAD_REQUEST);
  }
}



export class ExcessiveConsecutiveHyphensInEmail extends HttpException {
  constructor() {
    super("Please avoid using excessive consecutive hyphens in your email address.", HttpStatus.BAD_REQUEST);
  }
}

export class UnsupportedEmailFormat extends HttpException {
  constructor() {
    super("The email address format is not supported. Please enter a valid email address.", HttpStatus.BAD_REQUEST);
  }
}

export class ConsecutiveUnderscoresAndPeriodsInEmail extends HttpException {
  constructor() {
    super("Please avoid using consecutive underscores and periods in your email address.", HttpStatus.BAD_REQUEST);
  }
}

export class PasswordLengthShort extends HttpException {
  constructor() {
    super("Password must be at least 8 characters long.", HttpStatus.BAD_REQUEST);
  }
}

export class IncorrectPasswordOrEmail extends HttpException {
  constructor() {
    super("Incorrect Password or Email. Please try again.", HttpStatus.BAD_REQUEST);
  }
}

export class CombinationOfLettersNumbersSpecialChars extends HttpException {
  constructor() {
    super("Password must contain a combination of letters, numbers, and special characters.", HttpStatus.BAD_REQUEST);
  }
}

export class AvoidConsecutiveCharactersInPassword extends HttpException {
  constructor() {
    super("Please avoid using consecutive characters in your password.", HttpStatus.BAD_REQUEST);
  }
}


export class PasswordSameAsUsername extends HttpException {
  constructor() {
    super("Password cannot be the same as the username. Please choose a different password.", HttpStatus.BAD_REQUEST);
  }
}

export class CommonPassword extends HttpException {
  constructor() {
    super("Password is too common. Please choose a more secure password.", HttpStatus.BAD_REQUEST);
  }
}


export class PasswordContainsPersonalInfo extends HttpException {
  constructor() {
    super("Password cannot contain personal information. Please choose a more secure password.", HttpStatus.BAD_REQUEST);
  }
}

export class PasswordsDoNotMatch extends HttpException {
  constructor() {
    super("Passwords do not match. Please enter the same password in both fields.", HttpStatus.BAD_REQUEST);
  }
}

export class WeakPassword extends HttpException {
  constructor() {
    super("Password is too weak. Please choose a stronger password.", HttpStatus.BAD_REQUEST);
  }
}

export class AvoidConsecutiveNumbersInPassword extends HttpException {
  constructor() {
    super("Please avoid using consecutive numbers in your password.", HttpStatus.BAD_REQUEST);
  }
}

export class AvoidConsecutiveSpecialCharsInPassword extends HttpException {
  constructor() {
    super("Please avoid using consecutive special characters in your password.", HttpStatus.BAD_REQUEST);
  }
}

export class PasswordTooLong extends HttpException {
  constructor() {
    super("Password is too long. Please use a shorter password.", HttpStatus.BAD_REQUEST);
  }
}

export class ConfirmPasswordToCompleteSignUp extends HttpException {
  constructor() {
    super("Please confirm your password to complete the sign-up.", HttpStatus.BAD_REQUEST);
  }
}

export class AvoidRepeatedCharsInPassword extends HttpException {
  constructor() {
    super("Please avoid using repeated characters in your password.", HttpStatus.BAD_REQUEST);
  }
}

export class PasswordCannotContainName extends HttpException {
  constructor() {
    super("Password cannot contain your name. Please choose a different password.", HttpStatus.BAD_REQUEST);
  }
}

export class PasswordCannotContainCommonWords extends HttpException {
  constructor() {
    super("Password cannot contain common dictionary words. Please choose a more secure password.", HttpStatus.BAD_REQUEST);
  }
}


export class InsufficientPasswordStrength extends HttpException {
  constructor() {
    super("Password strength is insufficient. Please choose a stronger password.", HttpStatus.BAD_REQUEST);
  }
}

export class PasswordInLeakedDatabases extends HttpException {
  constructor() {
    super("Password has been found in leaked databases. Please choose a more secure password.", HttpStatus.BAD_REQUEST);
  }
}

export class PasswordRequirements1 extends HttpException {
  constructor() {
    super("Password must contain 8-16 characters that include at least 1 (lowercase, uppercase, number, and special character) Eg- (Deepu+@34)", HttpStatus.BAD_REQUEST);
  }
}

export class PasswordRequirements2 extends HttpException {
  constructor() {
    super("Password must contain 8-16 characters that include at least 1 (lowercase, uppercase, number, and special) character in (Deepu+@34)", HttpStatus.BAD_REQUEST);
  }
}

export class PasswordRequirements3 extends HttpException {
  constructor() {
    super("Password must contain 8-16 characters that include at least 1 (lowercase, uppercase, number, and special) character in (!@#$%^&_*)", HttpStatus.BAD_REQUEST);
  }
}

export class ConsecutiveUppercaseLettersInPassword extends HttpException {
  constructor() {
    super("Please avoid using consecutive uppercase letters in your password.", HttpStatus.BAD_REQUEST);
  }
}

export class ConsecutiveLowercaseLettersInPassword extends HttpException {
  constructor() {
    super("Please avoid using consecutive lowercase letters in your password.", HttpStatus.BAD_REQUEST);
  }
}

export class EnterPasswordToLogIn extends HttpException {
  constructor() {
    super("Please enter your password to log in.", HttpStatus.BAD_REQUEST);
  }
}

export class ConsecutiveSpecialCharsInPassword extends HttpException {
  constructor() {
    super("Please avoid using consecutive special characters in your password.", HttpStatus.BAD_REQUEST);
  }
}

export class PasswordCannotContainSpaces extends HttpException {
  constructor() {
    super("Password cannot contain leading or trailing spaces. Please enter a valid password.", HttpStatus.BAD_REQUEST);
  }
}

export class ConsecutiveRepeatedCharsInPassword extends HttpException {
  constructor() {
    super("Please avoid using consecutive repeated characters in your password.", HttpStatus.BAD_REQUEST);
  }
}

export class SequentialNumbersInPassword extends HttpException {
  constructor() {
    super("Please avoid using sequential numbers in your password.", HttpStatus.BAD_REQUEST);
  }
}

export class CombinationOfCharsInPassword extends HttpException {
  constructor() {
    super("Password must contain a combination of uppercase and lowercase letters, numbers, and special characters.", HttpStatus.BAD_REQUEST);
  }
}

export class PasswordSameAsEmail extends HttpException {
  constructor() {
    super("Password cannot be the same as the email address. Please choose a different password.", HttpStatus.BAD_REQUEST);
  }
}

export class PasswordContainsCommonPattern extends HttpException {
  constructor() {
    super("Password contains a common pattern. Please choose a more secure password.", HttpStatus.BAD_REQUEST);
  }
}


export class PasswordContainsBannedWords extends HttpException {
  constructor() {
    super("Password contains banned words. Please choose a more secure password.", HttpStatus.BAD_REQUEST);
  }
}

export class PasswordsDoNotMatchSignUp extends HttpException {
  constructor() {
    super("Passwords do not match. Please enter the same password in both fields.", HttpStatus.BAD_REQUEST);
  }
}

export class AcceptTermsAndConditions extends HttpException {
  constructor() {
    super("Please accept the terms and conditions to proceed.", HttpStatus.BAD_REQUEST);
  }
}

export class AgreeToPrivacyPolicy extends HttpException {
  constructor() {
    super("Please agree to the privacy policy to continue.", HttpStatus.BAD_REQUEST);
  }
}

export class SubscribeToNewsletter extends HttpException {
  constructor() {
    super("Please subscribe to the newsletter to receive updates.", HttpStatus.BAD_REQUEST);
  }
}

export class CheckRememberMeBox extends HttpException {
  constructor() {
    super("Please check the 'Remember Me' box to stay logged in.", HttpStatus.BAD_REQUEST);
  }
}

export class OptInForMarketingEmails extends HttpException {
  constructor() {
    super("Please opt-in to receive marketing emails.", HttpStatus.BAD_REQUEST);
  }
}


export class TermsAndConditionsCheckboxNotFound extends HttpException {
  constructor() {
    super("Terms and conditions checkbox not found. Please try again.", HttpStatus.BAD_REQUEST);
  }
}

export class NewsletterCheckboxNotFound extends HttpException {
  constructor() {
    super("Newsletter checkbox not found. Please try again.", HttpStatus.BAD_REQUEST);
  }
}

export class RememberMeCheckboxNotFound extends HttpException {
  constructor() {
    super("\"Remember Me\" checkbox not found. Please try again.", HttpStatus.BAD_REQUEST);
  }
}

export class MarketingEmailsCheckboxNotFound extends HttpException {
  constructor() {
    super("Marketing emails checkbox not found. Please try again.", HttpStatus.BAD_REQUEST);
  }
}

export class AgeRequirementToAcceptTerms extends HttpException {
  constructor() {
    super("You must be 18 years or older to accept the terms and conditions.", HttpStatus.BAD_REQUEST);
  }
}

export class AgeRequirementToAgreeToPrivacyPolicy extends HttpException {
  constructor() {
    super("You must be 18 years or older to agree to the privacy policy.", HttpStatus.BAD_REQUEST);
  }
}

export class MarketingEmailsNotAvailable extends HttpException {
  constructor() {
    super("Marketing emails are not available based on your preference.", HttpStatus.BAD_REQUEST);
  }
}

export class CheckboxLabelTextNotFound1 extends HttpException {
  constructor() {
    super("Error: Checkbox label text not found. Please contact support.", HttpStatus.BAD_REQUEST);
  }
}

export class CheckboxLabelTextNotFound2 extends HttpException {
  constructor() {
    super("Error: Checkbox label text not found. Please contact support.", HttpStatus.BAD_REQUEST);
  }
}

export class CheckboxLabelTextNotFound3 extends HttpException {
  constructor() {
    super("Error: Checkbox label text not found. Please contact support.", HttpStatus.BAD_REQUEST);
  }
}

export class CheckboxLabelTextNotFound4 extends HttpException {
  constructor() {
    super("Error: Checkbox label text not found. Please contact support.", HttpStatus.BAD_REQUEST);
  }
}

export class CheckboxLabelTextNotFound5 extends HttpException {
  constructor() {
    super("Error: Checkbox label text not found. Please contact support.", HttpStatus.BAD_REQUEST);
  }
}

export class CheckboxNotResponding1 extends HttpException {
  constructor() {
    super("Error: Checkbox not responding. Please try again.", HttpStatus.BAD_REQUEST);
  }
}

export class CheckboxNotResponding2 extends HttpException {
  constructor() {
    super("Error: Checkbox not responding. Please try again.", HttpStatus.BAD_REQUEST);
  }
}

export class CheckboxNotResponding3 extends HttpException {
  constructor() {
    super("Error: Checkbox not responding. Please try again.", HttpStatus.BAD_REQUEST);
  }
}



export class OTPSentToPhone extends HttpException {
  constructor() {
    super("OTP sent to your registered phone number.", HttpStatus.OK);
  }
}

export class OTPResentSuccessfully extends HttpException {
  constructor() {
    super("OTP resent successfully.", HttpStatus.OK);
  }
}

export class OTPSentToEmail extends HttpException {
  constructor() {
    super("OTP sent to your registered email address.", HttpStatus.OK);
  }
}

export class OTPVerificationSuccessful extends HttpException {
  constructor() {
    super("OTP verification successful. You can now reset your password.", HttpStatus.OK);
  }
}

export class ResendOTPAvailableAfter30Seconds extends HttpException {
  constructor() {
    super("Resend OTP will be available after 30 seconds.", HttpStatus.OK);
  }
}

export class ResendOTPAvailableAfter1Minute extends HttpException {
  constructor() {
    super("Resend OTP will be available after 1 minute.", HttpStatus.OK);
  }
}

export class SignUpSuccessful extends HttpException {
  constructor() {
    super("Sign-up successful. Welcome to our platform!", HttpStatus.OK);
  }
}

export class LoginSuccessful extends HttpException {
  constructor() {
    super("Login successful. Welcome!", HttpStatus.OK);
  }
}

export class EmailVerifiedSuccessfully extends HttpException {
  constructor() {
    super("Email verified successfully.", HttpStatus.OK);
  }
}

export class PhoneNumberVerifiedSuccessfully extends HttpException {
  constructor() {
    super("Phone number verified successfully.", HttpStatus.OK);
  }
}

export class TwoFactorAuthenticationEnabled extends HttpException {
  constructor() {
    super("Two-factor authentication enabled.", HttpStatus.OK);
  }
}

export class TwoFactorAuthenticationSuccessful extends HttpException {
  constructor() {
    super("Two-factor authentication successful.", HttpStatus.OK);
  }
}

export class PasswordResetSuccessful extends HttpException {
  constructor() {
    super("Password reset successful.", HttpStatus.OK);
  }
}

export class AccountDeletionSuccessful extends HttpException {
  constructor() {
    super("Account deletion successful.", HttpStatus.OK);
  }
}

export class AccountActivationSuccessful extends HttpException {
  constructor() {
    super("Account activated successfully.", HttpStatus.OK);
  }
}

export class ProfileCompletedSuccessfully extends HttpException {
  constructor() {
    super("Profile completed successfully.", HttpStatus.OK);
  }
}

export class TwoFactorAuthenticationDisabled extends HttpException {
  constructor() {
    super("Two-factor authentication disabled.", HttpStatus.OK);
  }
}

export class EmailAddressConfirmedSuccessfully extends HttpException {
  constructor() {
    super("Email address confirmed successfully.", HttpStatus.OK);
  }
}

export class PhoneNumberConfirmedSuccessfully extends HttpException {
  constructor() {
    super("Phone number confirmed successfully.", HttpStatus.OK);
  }
}

export class AccountDeletionRequestReceived extends HttpException {
  constructor() {
    super("Account deletion request received.", HttpStatus.OK);
  }
}

export class AccountRecoverySuccessful extends HttpException {
  constructor() {
    super("Account recovery successful.", HttpStatus.OK);
  }
}

export class SubscribedToEmailUpdates extends HttpException {
  constructor() {
    super("Successfully subscribed to email updates.", HttpStatus.OK);
  }
}

export class NewsletterSubscriptionSuccessful extends HttpException {
  constructor() {
    super("Newsletter subscription successful.", HttpStatus.OK);
  }
}

export class AccountInformationUpdatedSuccessfully extends HttpException {
  constructor() {
    super("Account information updated successfully.", HttpStatus.OK);
  }
}

export class UnsubscribedFromEmailUpdates extends HttpException {
  constructor() {
    super("Successfully unsubscribed from email updates.", HttpStatus.OK);
  }
}

export class NewsletterUnsubscribedSuccessfully extends HttpException {
  constructor() {
    super("Newsletter unsubscribed successfully.", HttpStatus.OK);
  }
}

export class AccountPasswordResetSuccessful extends HttpException {
  constructor() {
    super("Account password reset successful.", HttpStatus.OK);
  }
}

export class AccountRecoveryOptionUpdatedSuccessfully extends HttpException {
  constructor() {
    super("Account recovery option updated successfully.", HttpStatus.OK);
  }
}

export class AccountSecuritySettingsUpdatedSuccessfully extends HttpException {
  constructor() {
    super("Account security settings updated successfully.", HttpStatus.OK);
  }
}



export class NameCannotBeEmptyException extends HttpException {
  constructor() {
    super('Name cannot be empty. Please enter your name.', HttpStatus.BAD_REQUEST);
  }
}

export class NameIsTooLongException extends HttpException {
  constructor() {
    super('Name is too long. Please use a shorter name.', HttpStatus.BAD_REQUEST);
  }
}

export class InvalidDateOfBirthException extends HttpException {
  constructor() {
    super('Invalid date of birth. Please enter a valid date.', HttpStatus.BAD_REQUEST);
  }
}

export class MustBeAtLeast18Exception extends HttpException {
  constructor() {
    super('You must be at least 18 years old to create a profile.', HttpStatus.BAD_REQUEST);
  }
}

export class AddressCannotBeEmptyException extends HttpException {
  constructor() {
    super('Address cannot be empty. Please enter your address.', HttpStatus.BAD_REQUEST);
  }
}

export class AddressIsTooLongException extends HttpException {
  constructor() {
    super('Address is too long. Please use a shorter address.', HttpStatus.BAD_REQUEST);
  }
}

export class InvalidEmailException extends HttpException {
  constructor() {
    super('Invalid email address. Please enter a valid email.', HttpStatus.BAD_REQUEST);
  }
}

export class EmailCannotBeEmptyException extends HttpException {
  constructor() {
    super('Email address cannot be empty. Please enter your email.', HttpStatus.BAD_REQUEST);
  }
}

export class InvalidPhoneNumberException extends HttpException {
  constructor() {
    super('Invalid phone number. Please enter a valid phone number.', HttpStatus.BAD_REQUEST);
  }
}

export class PhoneNumberCannotBeEmptyException extends HttpException {
  constructor() {
    super('Phone number cannot be empty. Please enter your phone number.', HttpStatus.BAD_REQUEST);
  }
}

export class BioIsTooLongException extends HttpException {
  constructor() {
    super('Bio is too long. Please use a shorter bio.', HttpStatus.BAD_REQUEST);
  }
}

export class UsernameCannotBeEmptyException extends HttpException {
  constructor() {
    super('Username cannot be empty. Please enter your username.', HttpStatus.BAD_REQUEST);
  }
}

export class UsernameIsTooLongException extends HttpException {
  constructor() {
    super('Username is too long. Please use a shorter username.', HttpStatus.BAD_REQUEST);
  }
}

export class InvalidUsernameSpecialCharactersException extends HttpException {
  constructor() {
    super('Username cannot contain special characters. Please enter a valid username.', HttpStatus.BAD_REQUEST);
  }
}

export class UsernameIsAlreadyTakenException extends HttpException {
  constructor() {
    super('Username is already taken. Please choose a different username.', HttpStatus.BAD_REQUEST);
  }
}



export class CurrentPasswordRequiredException extends HttpException {
  constructor() {
    super('Please enter your current password to proceed.', HttpStatus.BAD_REQUEST);
  }
}

export class NewPasswordRequiredException extends HttpException {
  constructor() {
    super('Please enter a new password for your account.', HttpStatus.BAD_REQUEST);
  }
}

export class PasswordRequirementsException extends HttpException {
  constructor() {
    super('Your password should be at least 8 characters long and contain a mix of uppercase, lowercase, and special characters.', HttpStatus.BAD_REQUEST);
  }
}

export class ConfirmPasswordMismatchException extends HttpException {
  constructor() {
    super('The new password and confirm password do not match. Please try again.', HttpStatus.BAD_REQUEST);
  }
}

export class IncorrectCurrentPasswordException extends HttpException {
  constructor() {
    super('The current password you entered is incorrect. Please try again.', HttpStatus.UNAUTHORIZED);
  }
}

export class UnableToChangePasswordException extends HttpException {
  constructor() {
    super('We were unable to change your password. Please try again later.', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class MaxPasswordChangeAttemptsReachedException extends HttpException {
  constructor() {
    super('You have reached the maximum limit of password change attempts. Please contact support.', HttpStatus.BAD_REQUEST);
  }
}

export class PasswordReuseException extends HttpException {
  constructor() {
    super('You cannot reuse your previous passwords. Please choose a new one.', HttpStatus.BAD_REQUEST);
  }
}

export class PasswordResetLinkExpiredException extends HttpException {
  constructor() {
    super('The password reset link has expired. Please request a new one.', HttpStatus.BAD_REQUEST);
  }
}

export class ratingValue extends HttpException {
  constructor() {
    super('Rating should be greater then 1 and less than 5', HttpStatus.BAD_REQUEST);
  }
}


export class ratedAlready extends HttpException {
  constructor() {
    super('Already give rating', HttpStatus.BAD_REQUEST);
  }
}

export class invalidGameType extends HttpException {
  constructor() {
    super('Invalid Game Type', HttpStatus.BAD_REQUEST);
  }
}

export class invalidGame extends HttpException {
  constructor() {
    super('Invalid Game', HttpStatus.BAD_REQUEST);
  }
}

export class GameNotFound extends HttpException {
  constructor() {
    super('Game not found', HttpStatus.NOT_FOUND);
  }
}

export class invalidProduct extends HttpException {
  constructor() {
    super('Invalid Product', HttpStatus.BAD_REQUEST);
  }
}


export class ProductNotFound extends HttpException {
  constructor() {
    super('Product not found', HttpStatus.NOT_FOUND);
  }
}


export class alreadyParticipate extends HttpException {
  constructor(){
    super('Already Participate in this Game', HttpStatus.BAD_REQUEST);
  }
}

export class gameComleted extends HttpException {
  constructor(){
    super('Game already Completed', HttpStatus.BAD_REQUEST);
  }
}

export class gameExpired extends HttpException {
  constructor(){
    super('Game Expired !', HttpStatus.BAD_REQUEST);
  }
}

export class gameNotLive extends HttpException {
  constructor(){
    super('Game not live', HttpStatus.BAD_REQUEST);
  }
}

export class requiredField extends HttpException {
  constructor(){
    super('Game not live', HttpStatus.BAD_REQUEST);
  }
}