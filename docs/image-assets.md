# Image Assets — `public/items/`

All product images are served statically from the `public/items/` directory.
Reference them in JSON as `/items/<folder>/<number>.jpg` (no `/public` prefix —
Next.js serves `public/` at the root).

---

## Folder Overview

| Folder | Images | Range | Maps to category |
|--------|--------|-------|-----------------|
| `gpu` | 156 | 1–156 | GPUs |
| `cpu` | 142 | 1–142 | CPUs |
| `motherboard` | 241 | 1–241 | Motherboards |
| `ram` | 226 | 1–226 | RAM |
| `cables` | 298 | 1–298 | PSUs / Cooling (no dedicated folder) |
| `hdd` | 262 | 1–262 | Storage |
| `case` | 282 | 1–282 | Cases |
| `keyboard` | 268 | 1–268 | Peripherals — Keyboards |
| `mouse` | 210 | 1–210 | Peripherals — Mice |
| `monitor` | 256 | 1–256 | Peripherals — Monitors |
| `headset` | 264 | 1–264 | Peripherals — Headsets |
| `microphone` | 214 | 1–214 | Peripherals — Microphones |
| `speakers` | 296 | 1–296 | Peripherals — Speakers |
| `webcam` | 164 | 1–164 | Peripherals — Webcams |

**Total: 3,279 images across 14 folders**

---

## Folder Details

### `/items/gpu/` — 156 images
Graphics cards.

- Range: `1.jpg` – `156.jpg`
- Use for: GPUs (`ic: "i-gpu"`, `category: "GPUs"`)
- Example: `/items/gpu/1.jpg`

---

### `/items/cpu/` — 142 images
Desktop and workstation processors.

- Range: `1.jpg` – `142.jpg`
- Use for: CPUs (`ic: "i-cpu"`, `category: "CPUs"`)
- Example: `/items/cpu/1.jpg`

---

### `/items/motherboard/` — 241 images
ATX, mATX, and ITX motherboards.

- Range: `1.jpg` – `241.jpg`
- Use for: Motherboards (`ic: "i-mobo"`, `category: "Motherboards"`)
- Example: `/items/motherboard/1.jpg`

---

### `/items/ram/` — 226 images
DDR4 and DDR5 RAM kits, SO-DIMMs, and ECC modules.

- Range: `1.jpg` – `226.jpg`
- Use for: RAM (`ic: "i-ram"`, `category: "RAM"`)
- Example: `/items/ram/1.jpg`

---

### `/items/cables/` — 298 images
Power cables, cable management, and PSU images. Used as fallback for PSUs
and Cooling products which do not have dedicated folders.

- Range: `1.jpg` – `298.jpg`
- Use for: PSUs (`ic: "i-psu"`, `category: "PSUs"`) and Cooling (`ic: "i-fan"`, `category: "Cooling"`)
- Example PSU: `/items/cables/1.jpg`
- Example Cooler: `/items/cables/2.jpg`
- **Note:** Use lower numbers (1–50) for PSU imagery, higher numbers (51–100) for cooler imagery to reduce visual repetition.

---

### `/items/hdd/` — 262 images
HDDs, SSDs, and NVMe drives.

- Range: `1.jpg` – `262.jpg`
- Use for: Storage (`ic: "i-ssd"`, `category: "Storage"`)
- Example: `/items/hdd/1.jpg`

---

### `/items/case/` — 282 images
PC cases in all form factors.

- Range: `1.jpg` – `282.jpg`
- Use for: Cases (`ic: "i-case"`, `category: "Cases"`)
- Example: `/items/case/1.jpg`

---

### `/items/keyboard/` — 268 images
Mechanical, membrane, and wireless keyboards.

- Range: `1.jpg` – `268.jpg`
- Use for: Peripherals — keyboards
- Example: `/items/keyboard/1.jpg`

---

### `/items/mouse/` — 210 images
Gaming mice, ergonomic mice, and trackballs.

- Range: `1.jpg` – `210.jpg`
- Use for: Peripherals — mice, also mousepads (no dedicated folder)
- Example: `/items/mouse/1.jpg`

---

### `/items/monitor/` — 256 images
Gaming monitors, professional displays, and ultrawide screens.

- Range: `1.jpg` – `256.jpg`
- Use for: Peripherals — monitors
- Example: `/items/monitor/1.jpg`

---

### `/items/headset/` — 264 images
Gaming headsets, studio headphones, and wireless audio.

- Range: `1.jpg` – `264.jpg`
- Use for: Peripherals — headsets and headphones
- Example: `/items/headset/1.jpg`

---

### `/items/microphone/` — 214 images
USB microphones, XLR mics, boom arms, and mic accessories.

- Range: `1.jpg` – `214.jpg`
- Use for: Peripherals — microphones and mic accessories
- Example: `/items/microphone/1.jpg`

---

### `/items/speakers/` — 296 images
Desktop speakers, studio monitors, and portable Bluetooth speakers.

- Range: `1.jpg` – `296.jpg`
- Use for: Peripherals — speakers
- Example: `/items/speakers/1.jpg`

---

### `/items/webcam/` — 164 images
Webcams, streaming cameras, and conference cameras.

- Range: `1.jpg` – `164.jpg`
- Use for: Peripherals — webcams
- Example: `/items/webcam/1.jpg`

---

## Usage in products.json

The `img` field on each product should point to a single primary image:

```json
{
  "img": "/items/gpu/4.jpg"
}
```

Rules:
- Path starts with `/items/` — no `/public` prefix
- Always `.jpg` extension
- Number must be within the valid range for that folder (see table above)
- Each product should use a **unique image number** within its folder to avoid visual duplicates in grids

---

## Suggested Image Number Allocation

To avoid duplicate images showing up on listing pages, spread products across
the available range. Suggested starting points per category:

| Category | Folder | Suggested range for first 15 products |
|----------|--------|---------------------------------------|
| GPUs | `gpu` | 1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140 |
| CPUs | `cpu` | 1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 142 |
| Motherboards | `motherboard` | 1, 15, 30, 50, 70, 90, 110, 130, 150, 170, 190, 210, 225, 235, 241 |
| RAM | `ram` | 1, 15, 30, 45, 60, 75, 90, 110, 130, 150, 170, 190, 200, 215, 226 |
| PSUs | `cables` | 1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70 |
| Storage | `hdd` | 1, 15, 30, 50, 70, 90, 110, 130, 150, 170, 190, 210, 230, 250, 262 |
| Cooling | `cables` | 75, 85, 95, 105, 115, 125, 135, 145, 155, 165, 175, 185, 195, 205, 215 |
| Cases | `case` | 1, 18, 36, 54, 72, 90, 110, 130, 150, 170, 190, 210, 230, 260, 280 |
| Keyboards | `keyboard` | 1, 18, 36, 54, 72, 90, 110, 130, 150, 170, 190, 210, 230, 250, 265 |
| Mice | `mouse` | 1, 14, 28, 42, 56, 70, 85, 100, 115, 130, 145, 160, 175, 190, 210 |
| Monitors | `monitor` | 1, 17, 34, 51, 68, 85, 102, 120, 140, 160, 180, 200, 220, 240, 256 |
| Headsets | `headset` | 1, 18, 36, 54, 72, 90, 110, 130, 150, 170, 190, 210, 230, 250, 264 |
| Microphones | `microphone` | 1, 15, 30, 45, 60, 75, 90, 110, 130, 150, 170, 190, 200, 210, 214 |
| Speakers | `speakers` | 1, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 250, 270, 296 |
| Webcams | `webcam` | 1, 12, 24, 36, 48, 60, 72, 84, 96, 110, 125, 140, 150, 160, 164 |
