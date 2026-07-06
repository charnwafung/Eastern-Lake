Drop real dish photos in this folder whenever you have them —
any filename works, e.g. pollo-agridulce.jpg.

Then open js/menu-data.js, find the FEATURED_DISHES list near the
top, and set the "image" field for that dish to the file's path,
for example:

  { itemId: "p05", image: "img/dishes/pollo-agridulce.jpg" }

Leave "image" as null for any dish that doesn't have a photo yet —
it'll keep showing the placeholder graphic instead.

Want more than 4 featured dishes, or different ones? Just add or
edit entries in that same FEATURED_DISHES list — each one just
needs to match an existing item id from the MENU list below it.

Tip: photos roughly in a 4:3 ratio (like 1200×900px) will fit the
card shape best without needing to be cropped.
