
function isStrongPassword(password) {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }


function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhoneNumber(phoneNumber) {
    // Phone number regex for demonstration (matches 10-digit numbers)
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phoneNumber);
}

function generateVerificationToken() {
    return otpToken = Math.floor(100000 + Math.random() * 900000);
}
module.exports = {
    isStrongPassword,
    isValidEmail,
    isValidPhoneNumber,
    generateVerificationToken,

}