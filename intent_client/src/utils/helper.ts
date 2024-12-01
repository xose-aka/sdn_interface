
function isObjectEmpty(obj: object) {
    for (const prop in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, prop)) {
            return false;
        }
    }

    return true
}

function isValidIPv4(ip: string) {
    // Regular expression for a valid IPv4 address
    const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}$/;

    return ipv4Regex.test(ip);
}

function getIPSuggestions(baseIp: string) {
    const subnetMask = 24
    const ipParts = baseIp.split('.').map(Number);

    if (subnetMask === 24) {
        const suggestions: string[] = [];

        let counter = 1

        for (let i = 1; i <= 254; i++)
        {
            if (i === ipParts[3]) continue

            suggestions.push(`${ipParts[0]}.${ipParts[1]}.${ipParts[2]}.${i}`);

            if (counter === 10) break
        }

        return suggestions;
    }

    return []
}

export {isObjectEmpty, isValidIPv4, getIPSuggestions}