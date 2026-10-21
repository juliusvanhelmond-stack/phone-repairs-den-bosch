# Image credits

The atmosphere photos on the homepage are the shop's own photos of Martijn at work (professional shoot,
2020), sent by Phone Repairs on 2026-10-12 (iCloud Mail Drop "wetransfer-35217c.zip", 18 photos) and asked for on
the homepage on 2026-10-14 ("ik herkenbaar op main page"). They are stored resized (max 2000 px) in
`src/assets/photos/` and served through `next/image`. The originals stay with the client; the other photos of
the set can be added the same way.

| File | Original | Used in | Description |
| --- | --- | --- | --- |
| `martijn-workplace.jpg` | RVM 810_6381 (3) | Homepage hero | Martijn at his workbench, looking into the camera |
| `martijn-portrait.jpg` | RVM 810_6382 (4) | About section (home) | Portrait of Martijn |
| `martijn-microscope.jpg` | RVM 810_6528 (14) | "Zo werkt het" photo band | Martijn soldering under the microscope |
| `martijn-diagnostics.jpg` | RVM 810_6417 (7) | Final call-to-action background | Hands testing a phone on a diagnostic board |

The Adobe Stock photos used before (735790954, 257975054, 300745045, 299326526) were removed on 2026-10-16.

## Device photos (`src/assets/devices/`)

One representative photo per device type, shown on a white background on device cards, device pages and in the
device finder. All are unbranded mockups licensed through Adobe Stock (standard licence, free tier) on 2026-10-12.
They illustrate the type of device, not the exact model, so the alt text says "voorbeeldafbeelding" and device
pages carried the caption "Afbeelding ter illustratie" until the client asked to remove it (2026-10-16). Backgrounds were whitened and cropped locally
(no generative edits). Foldables (Galaxy Z) still use the SVG render: no suitable photo on white was found.

| File | Used for | Adobe Stock ID |
| --- | --- | --- |
| iphone-pro.jpg | iPhone Pro models with Dynamic Island | 1795403790 |
| iphone.jpg | Other iPhones with Dynamic Island | 1726358550 |
| iphone-notch.jpg | iPhones with a notch | 1030134880 |
| iphone-home.jpg | iPhones with a home button | 68461588 |
| android.jpg | Samsung and other Android phones | 239489349 |
| ipad.jpg | iPads without a home button | 1274665187 |
| ipad-home.jpg | iPads with a home button | 117830271 |
| galaxy-tab.jpg | Samsung Galaxy Tab | 177650219 |
| macbook.jpg | MacBook Air and MacBook Pro | 287523136 |

## Site icons

`src/app/icon.png`, `apple-icon.png` and `favicon.ico` are the current site's own favicon (wrench and screwdriver,
`/wp-content/uploads/2021/10/cropped-PR_favicon_RGB_MV2021040*.png` on www.phonerepairs.nl), downloaded unchanged
at the client's request (e-mail 2026-10-19: "Logo in browser zoals op oude site").
