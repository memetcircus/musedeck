import AppKit
import Foundation

// Wait until left mouse button is pressed and then released (drag selection completed)
var sawDown = false
let start = Date()

while Date().timeIntervalSince(start) < 60 {
    let pressed = (NSEvent.pressedMouseButtons & 1) != 0
    if pressed {
        sawDown = true
    } else if sawDown {
        // Mouse was held down and now released -> user finished selecting rectangle!
        exit(0)
    }
    usleep(25_000)
}
exit(1)

