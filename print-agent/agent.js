/* ============================================================
   Eastern Lake — Print Agent

   Runs on a small always-on computer in the kitchen (Raspberry Pi,
   old laptop, etc.) connected to a USB thermal receipt printer.
   It checks the same backend the Kitchen Display uses, and instead
   of showing new orders on a screen, prints each one automatically
   as a physical ticket.

   Works with any 80mm ESC/POS thermal printer (Epson TM-T20III,
   generic MUNBYN/Rongta printers, etc.) via the node-thermal-printer
   library.

   SETUP — see README.md in this folder for the full walkthrough.

   npm install node-thermal-printer node-fetch dotenv
   ============================================================ */

require("dotenv").config();
const fetch = require("node-fetch");
const { ThermalPrinter, PrinterTypes } = require("node-thermal-printer");

const BACKEND_URL = process.env.BACKEND_URL;
const KITCHEN_PIN = process.env.KITCHEN_PIN;
const PRINTER_INTERFACE = process.env.PRINTER_INTERFACE || "usb"; // see README for options
const POLL_MS = Number(process.env.POLL_MS || 7000);

if (!BACKEND_URL || !KITCHEN_PIN) {
  console.error("Missing BACKEND_URL or KITCHEN_PIN in .env — see .env.example");
  process.exit(1);
}

const printer = new ThermalPrinter({
  type: PrinterTypes.EPSON, // most ESC/POS printers, including generic ones, understand Epson's command set
  interface: PRINTER_INTERFACE,
  removeSpecialCharacters: false,
  lineCharacter: "-"
});

function fmtMoney(n) { return `$${Number(n || 0).toFixed(2)}`; }
function fmtPickupTime(hhmm) {
  if (!hhmm) return "—";
  if (hhmm === "asap") return "LO ANTES POSIBLE";
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

async function printOrder(order) {
  printer.clear();
  printer.alignCenter();
  printer.setTextSize(1, 1);
  printer.bold(true);
  printer.println("EASTERN LAKE");
  printer.bold(false);
  printer.println("Restaurante Chino");
  printer.drawLine();

  printer.alignLeft();
  printer.setTextSize(0, 0);
  printer.bold(true);
  printer.println(order.id);
  printer.bold(false);
  printer.println(`Cliente: ${order.customerName}`);
  printer.println(`Tel: ${order.customerPhone}`);
  printer.println(`Recoger: ${fmtPickupTime(order.pickupTime)}`);
  printer.drawLine();

  order.items.forEach(it => {
    printer.println(`${it.qty} x ${it.name}`);
  });

  if (order.notes) {
    printer.drawLine();
    printer.bold(true);
    printer.println("NOTAS:");
    printer.bold(false);
    printer.println(order.notes);
  }

  printer.drawLine();
  printer.bold(true);
  printer.println(`TOTAL: ${fmtMoney(order.total)}`);
  printer.bold(false);
  printer.println(order.paid ? "Pagado en linea" : "Cobrar al recoger");

  printer.cut();

  await printer.execute();
}

async function poll() {
  try {
    const res = await fetch(`${BACKEND_URL}/orders`, {
      headers: { "x-kitchen-pin": KITCHEN_PIN }
    });
    if (!res.ok) {
      console.error(`Backend returned ${res.status} — check BACKEND_URL and KITCHEN_PIN`);
      return;
    }
    const data = await res.json();
    const unprinted = (data.orders || []).filter(o => !o.printed);

    for (const order of unprinted) {
      try {
        console.log(`Printing ${order.id}...`);
        await printOrder(order);
        await fetch(`${BACKEND_URL}/orders/${encodeURIComponent(order.id)}/printed`, {
          method: "PATCH",
          headers: { "x-kitchen-pin": KITCHEN_PIN }
        });
        console.log(`Printed and marked ${order.id}`);
      } catch (err) {
        // If printing fails (paper out, unplugged, etc.) the order stays
        // unprinted and gets retried on the next poll — nothing is lost.
        console.error(`Failed to print ${order.id}:`, err.message);
      }
    }
  } catch (err) {
    console.error("Could not reach backend:", err.message);
  }
}

console.log(`Print agent started. Checking ${BACKEND_URL} every ${POLL_MS / 1000}s...`);
poll();
setInterval(poll, POLL_MS);
