// Middleware to authenticate token
function authenticateToken(token: string | undefined) {
    if (!token || token?.slice(7) !== "XaN1kT9Z2cpd5TUo0SfEKQ28t01WdiL4UZZduo1Qrz2jeE3ceL") {
        return false;
    } else {
        return true;
    }
}

export { authenticateToken };