import {TouchBackend} from "react-dnd-touch-backend";
import {HTML5Backend} from "react-dnd-html5-backend";

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

function getIPSuggestions(baseIp: string, mask: string) {
    const subnetMask = parseInt( mask)

    const ipToLong = (baseIp: string) =>
        baseIp.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0);

    const longToIp = (long: number) =>
        [24, 16, 8, 0].map((shift) => (long >> shift) & 255).join('.');

    const ipLong = ipToLong(baseIp);
    const maskLong = ~((1 << (32 - subnetMask)) - 1) >>> 0; // Create subnet mask
    const network = ipLong & maskLong;
    const broadcast = network | ~maskLong;

    // const result = {
    //     network: longToIp(network),
    //     broadcast: longToIp(broadcast),
    //     usableIPs: [],
    // };

    let result = []

    // Generate usable IPs (excluding network and broadcast addresses)
    for (let i = network + 1; i < broadcast; i++) {

        const usableIP = longToIp(i)

        if (baseIp == usableIP) continue

        result.push(usableIP);
    }

    return result;
}

function isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function getReactDnDBackend() {
    return  isMobile() ? TouchBackend : HTML5Backend;
}

export {isObjectEmpty, isValidIPv4, getIPSuggestions, getReactDnDBackend}