import Foundation
import ApplicationServices

guard CommandLine.arguments.count > 1 else {
    print("Usage: mac-type <command> [argument]")
    print("Commands: text <string>, key <single-char-with-enter>, ctrl-c, enter")
    exit(1)
}

let mode = CommandLine.arguments[1]
let source = CGEventSource(stateID: .hidSystemState)

func typeString(_ text: String) {
    for char in text.utf16 {
        if let keyDown = CGEvent(keyboardEventSource: source, virtualKey: 0, keyDown: true) {
            var unichar = UniChar(char)
            keyDown.keyboardSetUnicodeString(stringLength: 1, unicodeString: &unichar)
            keyDown.post(tap: .cghidEventTap)
        }
        if let keyUp = CGEvent(keyboardEventSource: source, virtualKey: 0, keyDown: false) {
            var unichar = UniChar(char)
            keyUp.keyboardSetUnicodeString(stringLength: 1, unicodeString: &unichar)
            keyUp.post(tap: .cghidEventTap)
        }
        usleep(1500)
    }
}

func pressOptionV() {
    let vKeyCode: CGKeyCode = 0x09 // 'v'
    if let keyDown = CGEvent(keyboardEventSource: source, virtualKey: vKeyCode, keyDown: true) {
        keyDown.flags = .maskAlternate
        keyDown.post(tap: .cghidEventTap)
    }
    usleep(30000)
    if let keyUp = CGEvent(keyboardEventSource: source, virtualKey: vKeyCode, keyDown: false) {
        keyUp.flags = []
        keyUp.post(tap: .cghidEventTap)
    }
    usleep(50000)
}

func pressReturn() {
    let returnKeyCode: CGKeyCode = 0x24
    if let keyDown = CGEvent(keyboardEventSource: source, virtualKey: returnKeyCode, keyDown: true) {
        keyDown.post(tap: .cghidEventTap)
    }
    usleep(10000)
    if let keyUp = CGEvent(keyboardEventSource: source, virtualKey: returnKeyCode, keyDown: false) {
        keyUp.post(tap: .cghidEventTap)
    }
}

func pressCtrlC() {
    let cKeyCode: CGKeyCode = 0x08 // 'c'
    if let keyDown = CGEvent(keyboardEventSource: source, virtualKey: cKeyCode, keyDown: true) {
        keyDown.flags = .maskControl
        keyDown.post(tap: .cghidEventTap)
    }
    usleep(30000)
    if let keyUp = CGEvent(keyboardEventSource: source, virtualKey: cKeyCode, keyDown: false) {
        keyUp.flags = []
        keyUp.post(tap: .cghidEventTap)
    }
    usleep(80000)
}

switch mode {
case "text":
    if CommandLine.arguments.count > 2 {
        typeString(CommandLine.arguments[2])
    }
case "clear-and-type":
    pressCtrlC()
    if CommandLine.arguments.count > 2 {
        typeString(CommandLine.arguments[2])
    }
case "key":
    if CommandLine.arguments.count > 2 {
        typeString(CommandLine.arguments[2])
        usleep(50000)
        pressReturn()
    }
case "ctrl-c":
    pressCtrlC()
case "opt-v", "voice":
    pressOptionV()
case "enter":
    pressReturn()
default:
    typeString(mode)
}
