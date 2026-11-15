package encoding

// The functions in this file port the client's scripts line for line, in Lingo's 32-bit integers,
// so that the tests compare the encoding with the client's own code. A Lingo string is a []int32 of
// character codes. Below Director 11, which LibreShockwave reports, every character the socket
// delivers or sends is one byte. They port fuse_client/51_Connection Instance Class.ls, and
// encodeUTF8 and decodeUTF8 of fuse_client/37_String Services Class.ls with client.textdata.utf8 on.

func lingoString(b []byte) []int32 {
	s := make([]int32, len(b))
	for i, c := range b {
		s[i] = int32(c)
	}
	return s
}

func lingoBytes(s []int32) []byte {
	b := make([]byte, len(s))
	for i, c := range s {
		b[i] = byte(c)
	}
	return b
}

// lingoChar is charToNum(char i of s): 0 past the end, as charToNum(EMPTY) is.
func lingoChar(s []int32, i int32) int32 {
	if int(i) > len(s) {
		return 0
	}
	return s[i-1]
}

// lingoFrom is s.char[i..length(s)].
func lingoFrom(s []int32, i int32) []int32 {
	if int(i) > len(s) {
		return nil
	}
	return s[i-1:]
}

func lingoBool(b bool) int32 {
	if b {
		return 1
	}
	return 0
}

// lingoSendNewInteger is the #integer case of sendNew.
func lingoSendNewInteger(tParm int32) []byte {
	var tNegMask int32
	if tParm < 0 {
		tNegMask = 4
		tParm = -tParm
	} else {
		tNegMask = 0
	}
	tStr := []int32{64 + (tParm & 3)}
	tBytes := int32(1)
	tParm = tParm / 4
	for tParm != 0 {
		tBytes = tBytes + 1
		tStr = append(tStr, 64+(tParm&63))
		tParm = tParm / 64
	}
	tMsg := []int32{(tStr[0] | tBytes*8) | tNegMask}
	tMsg = append(tMsg, tStr[1:tBytes]...)
	return lingoBytes(tMsg)
}

// lingoGetIntFrom is GetIntFrom: it returns the number and the content that is left.
func lingoGetIntFrom(tByteStr []int32) (int32, []int32) {
	tByte := lingoChar(tByteStr, 1) & 63
	tByCnt := (tByte & 56) / 8
	tNeg := tByte & 4
	tInt := tByte & 3
	if tByCnt > 1 {
		tPowTbl := []int32{4, 256, 16384, 1048576, 67108864}
		for i := int32(2); i <= tByCnt; i++ {
			tByte = lingoChar(tByteStr, i) & 63
			tInt = (tByte * tPowTbl[i-2]) | tInt
		}
	}
	if tNeg != 0 {
		tInt = -tInt
	}
	return tInt, lingoFrom(tByteStr, tByCnt+1)
}

// lingoGetStrFrom is GetStrFrom.
func lingoGetStrFrom(tArr []int32) ([]int32, []int32) {
	tLen := int32(0)
	for i, c := range tArr {
		if c == 2 {
			tLen = int32(i) + 1
			break
		}
	}
	var tStr []int32
	if tLen > 1 {
		tStr = tArr[:tLen-1]
	}
	return tStr, lingoFrom(tArr, tLen+1)
}

// lingoGetBoolFrom is GetBoolFrom.
func lingoGetBoolFrom(tByteStr []int32) (bool, []int32) {
	tByte := lingoChar(tByteStr, 1) & 63
	return tByte != 0, lingoFrom(tByteStr, 2)
}

// lingoGetByteFrom is GetByteFrom.
func lingoGetByteFrom(tByteStr []int32) (int32, []int32) {
	tByte := lingoChar(tByteStr, 1) & 63
	return tByte, lingoFrom(tByteStr, 2)
}

// lingoMessageID is how msghandler reads the 2 characters of a message id.
func lingoMessageID(tContent []int32) int32 {
	tByte1 := lingoChar(tContent, 2) & 63
	tByte2 := lingoChar(tContent, 1) & 63
	return (tByte2 * 64) | tByte1
}

// lingoShort is the #short case of sendNew, which registerCommands also uses for command ids.
func lingoShort(tParm int32) []byte {
	return lingoBytes([]int32{64 | (tParm / 64), 64 | (63 & tParm)})
}

// lingoLength is the 3 characters of length that send and sendNew write before a command.
func lingoLength(tLength int32) []byte {
	tL1 := (tLength & 63) | 64
	tL2 := ((tLength / 64) & 63) | 64
	tL3 := ((tLength / 4096) & 63) | 64
	return lingoBytes([]int32{tL3, tL2, tL1})
}

// lingoSendNewBoolean is the #boolean case of sendNew.
func lingoSendNewBoolean(tParm int32) []byte {
	tParm = lingoBool(tParm != 0)
	return lingoBytes([]int32{64 | (63 & tParm)})
}

// lingoSendNewString is the #string case of sendNew.
func lingoSendNewString(tParm []int32) []byte {
	tParm = lingoEncodeUTF8(tParm)
	tLen := int32(0)
	for _, tNum := range tParm {
		tLen = tLen + 1 + lingoBool(tNum > 255 && tNum%256 != 0)
	}
	tBy1 := 64 | (tLen / 64)
	tBy2 := 64 | (63 & tLen)
	return lingoBytes(append([]int32{tBy1, tBy2}, tParm...))
}

// lingoEncodeUTF8 is encodeUTF8, with the character codes of a Director below version 11 taken
// as they are.
func lingoEncodeUTF8(tUnicodeData []int32) []int32 {
	var tUTF8Data []int32
	for _, tValue := range tUnicodeData {
		if tValue < 128 {
			tUTF8Data = append(tUTF8Data, tValue)
			continue
		}
		if tValue < 2048 {
			tUTF8Data = append(tUTF8Data, 192+((tValue/64)&31), 128+(tValue&63))
			continue
		}
		if tValue < 65536 {
			tUTF8Data = append(tUTF8Data, 224+((tValue/(64*64))&15), 128+((tValue/64)&63), 128+(tValue&63))
		}
	}
	return tUTF8Data
}

// lingoDecodeUTF8 is decodeUTF8 below Director 11, which msghandler runs on every message's
// content before the handlers read it.
func lingoDecodeUTF8(tStr []int32) []int32 {
	var tBinData []int32
	for _, tValue := range tStr {
		if tValue < 255 {
			tBinData = append(tBinData, tValue)
			continue
		}
		tBinData = append(tBinData, tValue/256)
		if tValue%256 != 0 {
			tBinData = append(tBinData, tValue%256)
		}
	}
	var tUnicodeData []int32
	for i := 0; i < len(tBinData); i++ {
		tValue := tBinData[i]
		switch {
		case tValue < 128:
			tUnicodeData = append(tUnicodeData, tValue)
		case tValue > 224:
			tValue2, tValue3 := tBinData[i+1], tBinData[i+2]
			tUnicodeData = append(tUnicodeData, ((((tValue&15)*64)+(tValue2&63))*64)+(tValue3&63))
			i += 2
		case tValue > 192:
			tValue2 := tBinData[i+1]
			tUnicodeData = append(tUnicodeData, ((tValue&31)*64)+(tValue2&63))
			i++
		}
	}
	return tUnicodeData
}
