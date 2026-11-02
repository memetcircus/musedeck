import AppKit
import CoreGraphics
import Foundation

// Wait until left mouse button is pressed and then released (drag selection completed)
var sawDown = false
let start = Date()

while Date().timeIntervalSince(start) < 60 {
    let hidDown = CGEventSource.buttonState(.hidSystemState, button: .left)
    let sessionDown = CGEventSource.buttonState(.combinedSessionState, button: .left)
    let appKitDown = (NSEvent.pressedMouseButtons & 1) != 0
    let pressed = hidDown || sessionDown || appKitDown

    if pressed {
        sawDown = true
    } else if sawDown {
        // Mouse was held down and now released -> user finished selecting rectangle!
        exit(0)
    }
    usleep(20_000)
}
exit(1)


