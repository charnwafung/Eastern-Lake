/* ============================================================
   MENU DATA
   Transcribed from your printed menu. Item numbers are kept so
   they match what regulars already order by. Every price below
   is 0 as a placeholder — set real prices before going live.
   Search this file for 0.00 to find every line still needing one.
   ============================================================ */

const MENU = [
  {
    category: "Aperitivos",
    items: [
      { no: 1,  id: "a01", name: "Egg Roll", price: 0.00 },
      { no: 2,  id: "a02", name: "Mariposas Frita", price: 0.00 },
      { no: 3,  id: "a03", name: "Camarones Frito", price: 0.00 },
      { no: 4,  id: "a04", name: "Tostone Grande", price: 0.00 },
      { no: 5,  id: "a05", name: "Tostone Pequeño", price: 0.00 },
      { no: 6,  id: "a06", name: "Mofongo", price: 0.00 },
      { no: 7,  id: "a07", name: "Mariposas con Kingcrab", price: 0.00 },
      { no: 8,  id: "a08", name: "Mariposas con Queso", price: 0.00 },
      { no: 9,  id: "a09", name: "Dumpling Al Vapor", price: 0.00 },
      { no: 10, id: "a10", name: "Dumpling a la Sarten", price: 0.00 },
      { no: 11, id: "a11", name: "Alitas a la Salten", price: 0.00 },
      { no: 12, id: "a12", name: "Papas Frita Grande", price: 0.00 },
      { no: 13, id: "a13", name: "Papas Frita Pequeñas", price: 0.00 },
      { no: 14, id: "a14", name: "Chicken Nugget", price: 0.00 }
    ]
  },
  {
    category: "Sopas",
    items: [
      { no: 15, id: "s01", name: "Sopa China", price: 0.00 },
      { no: 16, id: "s02", name: "Sopa de Vegetal", price: 0.00 },
      { no: 17, id: "s03", name: "Sopa de Pollo", price: 0.00 },
      { no: 18, id: "s04", name: "Sopa Wonton", price: 0.00 },
      { no: 19, id: "s05", name: "Sopa de Huevo", price: 0.00 },
      { no: 20, id: "s06", name: "Sopa Dumpling", price: 0.00 }
    ]
  },
  {
    category: "Arroz Frito",
    items: [
      { no: 21, id: "r01", name: "Arroz Pequeño", price: 0.00 },
      { no: 22, id: "r02", name: "Arroz Regular", price: 0.00 },
      { no: 23, id: "r03", name: "Arroz Grande", price: 0.00 },
      { no: 24, id: "r04", name: "Arroz Medio Galon", price: 0.00 },
      { no: 25, id: "r05", name: "Arroz Familiar", price: 0.00 }
    ]
  },
  {
    category: "Pollo Con Papas",
    items: [
      { no: 26, id: "pp01", name: "Pollo 1 Presa", price: 0.00 },
      { no: 27, id: "pp02", name: "Pollo 2 Presas", price: 0.00 },
      { no: 28, id: "pp03", name: "Pollo 3 Presas", price: 0.00 },
      { no: 29, id: "pp04", name: "Pollo 5 Presas", price: 0.00 },
      { no: 30, id: "pp05", name: "Pollo 8 Presas", price: 0.00 },
      { no: 31, id: "pp06", name: "Pollo 10 Presas", price: 0.00 }
    ]
  },
  {
    category: "Combinación o Solo De Pollo",
    items: [
      { no: 32, id: "p01", name: "Pollo 2 Presas", price: 0.00 },
      { no: 33, id: "p02", name: "Pollo con Brocoli", price: 0.00 },
      { no: 34, id: "p03", name: "Pollo con Pepper", price: 0.00 },
      { no: 35, id: "p04", name: "Pollo al Ajillo", price: 0.00 },
      { no: 36, id: "p05", name: "Pollo Agridulce", price: 0.00 },
      { no: 37, id: "p06", name: "Pollo Naranja", price: 0.00 },
      { no: 38, id: "p07", name: "Pollo Enchilado", price: 0.00 },
      { no: 39, id: "p08", name: "Pollo con Jengibre", price: 0.00 },
      { no: 40, id: "p09", name: "Pollo a la Plancha", price: 0.00 },
      { no: 41, id: "p10", name: "Pollo Con Setas", price: 0.00 },
      { no: 42, id: "p11", name: "Pollo con Curry", price: 0.00 },
      { no: 43, id: "p12", name: "Chow Suey de Pollo", price: 0.00 },
      { no: 44, id: "p13", name: "Egg Fu Young de Pollo", price: 0.00 }
    ]
  },
  {
    category: "Combinación o Solo De Cerdo",
    items: [
      { no: 45, id: "c01", name: "Cerdo Agridulce", price: 0.00 },
      { no: 46, id: "c02", name: "Costilla BBQ (con Hueso)", price: 0.00 },
      { no: 47, id: "c03", name: "Carne Ahumada (sin hueso)", price: 0.00 },
      { no: 48, id: "c04", name: "Carne Ahumada en Salsa", price: 0.00 },
      { no: 49, id: "c05", name: "Chuleta Frita", price: 0.00 },
      { no: 50, id: "c06", name: "Carne Ahumada con Brocoli", price: 0.00 },
      { no: 51, id: "c07", name: "Carne Frita", price: 0.00 },
      { no: 52, id: "c08", name: "Chow Suey Ahumada", price: 0.00 }
    ]
  },
  {
    category: "Combinación o Solo De Res",
    items: [
      { no: 53, id: "b01", name: "Pepper Steak", price: 0.00 },
      { no: 54, id: "b02", name: "Res con Jengibre", price: 0.00 },
      { no: 55, id: "b03", name: "Res con Brocoli", price: 0.00 },
      { no: 56, id: "b04", name: "Res con Setas", price: 0.00 },
      { no: 57, id: "b05", name: "Res con Curry", price: 0.00 },
      { no: 58, id: "b06", name: "Chow Suey de Res", price: 0.00 },
      { no: 59, id: "b07", name: "Egg Fu Young de Res", price: 0.00 }
    ]
  },
  {
    category: "Combinación o Solo De Marisco",
    items: [
      { no: 60, id: "m01", name: "Camaron con Jengibre", price: 0.00 },
      { no: 61, id: "m02", name: "Camarones con Brocoli", price: 0.00 },
      { no: 62, id: "m03", name: "Camarones en Salsa Langosta", price: 0.00 },
      { no: 63, id: "m04", name: "Camarones al Ajillo", price: 0.00 },
      { no: 64, id: "m05", name: "Camarones Enchilado", price: 0.00 },
      { no: 65, id: "m06", name: "Camarones Agridulce", price: 0.00 },
      { no: 66, id: "m07", name: "Camarones Fritos (4)", price: 0.00 },
      { no: 67, id: "m08", name: "Filete de Pescado al Ajillo", price: 0.00 },
      { no: 68, id: "m09", name: "Filete de Pescado con Brocoli", price: 0.00 },
      { no: 69, id: "m10", name: "Chow Suey de Camarones", price: 0.00 },
      { no: 70, id: "m11", name: "Egg Fu Young de Camarones", price: 0.00 },
      { no: 71, id: "m12", name: "Egg Fu Young Especial", price: 0.00 },
      { no: 72, id: "m13", name: "Chow Suey Especial", price: 0.00 }
    ]
  },
  {
    category: "Lo Mein Solo",
    items: [
      { no: 73, id: "lm01", name: "Lo Mein (Solo)", price: 0.00 },
      { no: 74, id: "lm02", name: "Lo Mein de Vegetales", price: 0.00 },
      { no: 75, id: "lm03", name: "Lo Mein de Camarones", price: 0.00 },
      { no: 76, id: "lm04", name: "Lo Mein de Pollo", price: 0.00 },
      { no: 77, id: "lm05", name: "Lo Mein de Res", price: 0.00 },
      { no: 78, id: "lm06", name: "Lo Mein de Carne Ahumada", price: 0.00 },
      { no: 79, id: "lm07", name: "Lo Mein Especial", price: 0.00 }
    ]
  },
  {
    category: "Vegetales Mixto o Brocoli",
    items: [
      { no: 80, id: "v01", name: "Pequeño", price: 0.00 },
      { no: 81, id: "v02", name: "Regular", price: 0.00 },
      { no: 82, id: "v03", name: "Grande", price: 0.00 }
    ]
  },
  {
    category: "Postres y Refresco",
    items: [
      { no: 83, id: "d01", name: "Flan", price: 0.00 },
      { no: 84, id: "d02", name: "Tres Leche", price: 0.00 },
      { no: 85, id: "d03", name: "Cheesecake", price: 0.00 },
      { no: 86, id: "d04", name: "Padrino", price: 0.00 },
      { no: 87, id: "d05", name: "Agua Embotella", price: 0.00 },
      { no: 88, id: "d06", name: "Refresco Lata", price: 0.00 },
      { no: 89, id: "d07", name: "Refresco Botella", price: 0.00 }
    ]
  },
  {
    // Promo combos from the menu — listed as "¡Desde $7.95!" (starting at),
    // not individually priced there, so $7.95 is filled in as a starting
    // point. Confirm/adjust per item if any cost more than the base price.
    category: "Mini Combos",
    items: [
      { id: "mc01", name: "Carne Ahumada", price: 7.95 },
      { id: "mc02", name: "Pollo Al Ajillo", price: 7.95 },
      { id: "mc03", name: "Pollo Naranja", price: 7.95 },
      { id: "mc04", name: "Pollo Pepper", price: 7.95 },
      { id: "mc05", name: "Pollo Agridulce", price: 7.95 },
      { id: "mc06", name: "Carne Frita", price: 7.95 },
      { id: "mc07", name: "Chuleta Frita", price: 7.95 },
      { id: "mc08", name: "Pollo Frito", price: 7.95 },
      { id: "mc09", name: "Pepper Steak", price: 7.95 }
    ]
  }
];
