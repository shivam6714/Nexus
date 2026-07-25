const crypto = require("crypto");

const generateInviteCode = () => {
    return `NXS-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
};

module.exports = generateInviteCode;