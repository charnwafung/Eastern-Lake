# Eastern Lake — Kitchen Printer Setup

This turns any 80mm USB thermal receipt printer into an automatic
order printer. A small always-on computer (Raspberry Pi recommended)
checks for new orders every few seconds and prints each one.

## What to buy (if you haven't yet)

- **Raspberry Pi** — a Raspberry Pi 4 or Raspberry Pi Zero 2 W both
  work fine (~$15–35). Comes with no case/power supply/SD card by
  default — a "starter kit" bundle is usually easiest.
- **80mm USB thermal receipt printer** — any ESC/POS printer works.
  Epson TM-T20III (~$180–220, most reliable) or a generic
  MUNBYN/Rongta USB thermal printer (~$70–100, budget option).
- A USB cable to connect the two (often included with the printer).

## Part 1 — Set up the Raspberry Pi

1. Download **Raspberry Pi Imager** from raspberrypi.com/software
   and use it to flash **Raspberry Pi OS Lite** onto a microSD card
   (at least 8GB). In the Imager's settings (gear icon), set up Wi-Fi
   and enable SSH before writing — this lets you set it up without
   ever connecting a monitor to the Pi.
2. Insert the SD card, power on the Pi, and connect to it from your
   own computer's terminal:
   ```
   ssh pi@raspberrypi.local
   ```
   (password is whatever you set in the Imager)
3. Install Node.js on the Pi:
   ```
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
4. Plug the thermal printer into the Pi via USB.

## Part 2 — Install the print agent

1. Copy this `print-agent` folder onto the Pi. Easiest way:
   ```
   scp -r print-agent pi@raspberrypi.local:~/
   ```
2. SSH into the Pi, then:
   ```
   cd print-agent
   npm install
   cp .env.example .env
   ```
3. Edit `.env` (e.g. `nano .env`) and fill in:
   - `BACKEND_URL` — your Render backend URL
   - `KITCHEN_PIN` — same PIN you set on the backend
   - `PRINTER_INTERFACE` — start with `usb`; if that doesn't work,
     see the troubleshooting section below

## Part 3 — Test it

1. Run it manually first:
   ```
   npm start
   ```
2. Place a test order on your live site.
3. Within a few seconds you should hear/see the printer produce a
   ticket. If nothing happens, check the terminal output for errors.
4. Stop it with `Ctrl+C` once you've confirmed it works.

## Part 4 — Make it run automatically (important)

You want this running all the time, restarting itself if the Pi
reboots or the program crashes — not something you manually start
every morning. Set it up as a system service:

1. Create the service file:
   ```
   sudo nano /etc/systemd/system/print-agent.service
   ```
2. Paste this in (adjust the path if you didn't put the folder in
   the pi user's home directory):
   ```
   [Unit]
   Description=Eastern Lake Print Agent
   After=network.target

   [Service]
   WorkingDirectory=/home/pi/print-agent
   ExecStart=/usr/bin/node agent.js
   Restart=always
   User=pi

   [Install]
   WantedBy=multi-user.target
   ```
3. Enable and start it:
   ```
   sudo systemctl enable print-agent
   sudo systemctl start print-agent
   ```
4. Check it's running:
   ```
   sudo systemctl status print-agent
   ```
5. From now on, it starts automatically every time the Pi powers on,
   and restarts itself if it ever crashes.

To see live logs any time: `sudo journalctl -u print-agent -f`

## Troubleshooting the printer connection

- **`PRINTER_INTERFACE=usb` doesn't work:** find the exact device
  path instead. Run `ls /dev/usb/` on the Pi after plugging in the
  printer — you're looking for something like `lp0`. Then set
  `PRINTER_INTERFACE=printer:/dev/usb/lp0` in `.env`.
- **Printer is on Wi-Fi/network instead of USB:** find its IP address
  (usually printable from a button combo on the printer itself, or
  check your router's connected devices list), then set
  `PRINTER_INTERFACE=tcp://<that-ip>:9100`.
- **Nothing prints and no error shows:** double check `BACKEND_URL`
  has no trailing slash, and that `KITCHEN_PIN` exactly matches what's
  set in Render's environment variables.

## How this works alongside the Kitchen Display

This print agent and `kitchen.html` (the on-screen Kitchen Display)
both read from the same backend independently — you can use one, the
other, or both at once. Printing an order doesn't mark it "done"; that
still happens by tapping "Marcar lista" on the Kitchen Display, if
you're using it. If you're going fully paper-based, that on-screen
step becomes optional — the ticket is your record.
