var TSOS;
(function (TSOS) {
    class ASCII {
        static map;
        /**
         * Maps hex codes to the corresponding ASCII character.
         */
        static initMap() {
            ASCII.map = new Map();
            ASCII.map.set(0x0, "NUL");
            ASCII.map.set(0x1, "SOH");
            ASCII.map.set(0x2, "STX");
            ASCII.map.set(0x3, "ETX");
            ASCII.map.set(0x4, "EOT");
            ASCII.map.set(0x5, "ENQ");
            ASCII.map.set(0x6, "ACK");
            ASCII.map.set(0x7, "BEL");
            ASCII.map.set(0x8, "BS");
            ASCII.map.set(0x9, "HT");
            ASCII.map.set(0x0A, "LF");
            ASCII.map.set(0x0B, "VT");
            ASCII.map.set(0x0C, "FF");
            ASCII.map.set(0x0D, "CR");
            ASCII.map.set(0x0E, "SO");
            ASCII.map.set(0x0F, "SI");
            ASCII.map.set(0x10, "DLE");
            ASCII.map.set(0x11, "DC1");
            ASCII.map.set(0x12, "DC2");
            ASCII.map.set(0x13, "DC3");
            ASCII.map.set(0x14, "DC4");
            ASCII.map.set(0x15, "NAK");
            ASCII.map.set(0x16, "SYN");
            ASCII.map.set(0x17, "ETB");
            ASCII.map.set(0x18, "CAN");
            ASCII.map.set(0x19, "EM");
            ASCII.map.set(0x1A, "SUB");
            ASCII.map.set(0x1B, "ESC");
            ASCII.map.set(0x1C, "FS");
            ASCII.map.set(0x1D, "GS");
            ASCII.map.set(0x1E, "RS");
            ASCII.map.set(0x1F, "US");
            ASCII.map.set(0x20, " ");
            ASCII.map.set(0x21, "!");
            ASCII.map.set(0x22, '"');
            ASCII.map.set(0x23, "#");
            ASCII.map.set(0x24, "$");
            ASCII.map.set(0x25, "%");
            ASCII.map.set(0x26, "&");
            ASCII.map.set(0x27, "'");
            ASCII.map.set(0x28, "(");
            ASCII.map.set(0x29, ")");
            ASCII.map.set(0x2A, "*");
            ASCII.map.set(0x2B, "+");
            ASCII.map.set(0x2C, ",");
            ASCII.map.set(0x2D, "-");
            ASCII.map.set(0x2E, ".");
            ASCII.map.set(0x2F, "/");
            ASCII.map.set(0x30, "0");
            ASCII.map.set(0x31, "1");
            ASCII.map.set(0x32, "2");
            ASCII.map.set(0x33, "3");
            ASCII.map.set(0x34, "4");
            ASCII.map.set(0x35, "5");
            ASCII.map.set(0x36, "6");
            ASCII.map.set(0x37, "7");
            ASCII.map.set(0x38, "8");
            ASCII.map.set(0x39, "9");
            ASCII.map.set(0x3A, ":");
            ASCII.map.set(0x3B, ";");
            ASCII.map.set(0x3C, "<");
            ASCII.map.set(0x3D, "=");
            ASCII.map.set(0x3E, ">");
            ASCII.map.set(0x3F, "?");
            ASCII.map.set(0x40, "@");
            ASCII.map.set(0x41, "A");
            ASCII.map.set(0x42, "B");
            ASCII.map.set(0x43, "C");
            ASCII.map.set(0x44, "D");
            ASCII.map.set(0x45, "E");
            ASCII.map.set(0x46, "F");
            ASCII.map.set(0x47, "G");
            ASCII.map.set(0x48, "H");
            ASCII.map.set(0x49, "I");
            ASCII.map.set(0x4A, "J");
            ASCII.map.set(0x4B, "K");
            ASCII.map.set(0x4C, "L");
            ASCII.map.set(0x4D, "M");
            ASCII.map.set(0x4E, "N");
            ASCII.map.set(0x4F, "O");
            ASCII.map.set(0x50, "P");
            ASCII.map.set(0x51, "Q");
            ASCII.map.set(0x52, "R");
            ASCII.map.set(0x53, "S");
            ASCII.map.set(0x54, "T");
            ASCII.map.set(0x55, "U");
            ASCII.map.set(0x56, "V");
            ASCII.map.set(0x57, "W");
            ASCII.map.set(0x58, "X");
            ASCII.map.set(0x59, "Y");
            ASCII.map.set(0x5A, "Z");
            ASCII.map.set(0x5B, "[");
            ASCII.map.set(0x5C, "\\");
            ASCII.map.set(0x5D, "]");
            ASCII.map.set(0x5E, "^");
            ASCII.map.set(0x5F, "_");
            ASCII.map.set(0x60, "`");
            ASCII.map.set(0x61, "a");
            ASCII.map.set(0x62, "b");
            ASCII.map.set(0x63, "c");
            ASCII.map.set(0x64, "d");
            ASCII.map.set(0x65, "e");
            ASCII.map.set(0x66, "f");
            ASCII.map.set(0x67, "g");
            ASCII.map.set(0x68, "h");
            ASCII.map.set(0x69, "i");
            ASCII.map.set(0x6A, "j");
            ASCII.map.set(0x6B, "k");
            ASCII.map.set(0x6C, "l");
            ASCII.map.set(0x6D, "m");
            ASCII.map.set(0x6E, "n");
            ASCII.map.set(0x6F, "o");
            ASCII.map.set(0x70, "p");
            ASCII.map.set(0x71, "q");
            ASCII.map.set(0x72, "r");
            ASCII.map.set(0x73, "s");
            ASCII.map.set(0x74, "t");
            ASCII.map.set(0x75, "u");
            ASCII.map.set(0x76, "v");
            ASCII.map.set(0x77, "w");
            ASCII.map.set(0x78, "x");
            ASCII.map.set(0x79, "y");
            ASCII.map.set(0x7A, "z");
            ASCII.map.set(0x7B, "{");
            ASCII.map.set(0x7C, "|");
            ASCII.map.set(0x7D, "}");
            ASCII.map.set(0x7E, "~");
            ASCII.map.set(0x7F, "DEL");
        }
        /**
         * Gets a character in the ASCII table with the specified key.
         * @param key The key in the table
         * @returns The character as a string
         */
        static getChar(key) {
            return ASCII.map.get(key);
        }
        /**
         * Get the hex value of a character in the ASCII table.
         * @param char The character
         * @returns The hex code (key) associated with the character
         */
        static getHex(char) {
            // of keyword returns a pair
            for (let entry of ASCII.map.entries()) {
                if (entry[1] == char) {
                    return entry[0];
                }
            }
        }
    }
    TSOS.ASCII = ASCII;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=ascii.js.map