export const sectores = {
  "estadio": [
    {
      "id": "tribuna-andes",
      "nombre": "Tribuna Andes",
      "precio": 35000,
      "estado": "disponible"
    },
    {
      "id": "cancha-preferencial",
      "nombre": "Cancha Preferencial",
      "precio": 85000,
      "estado": "disponible"
    },
    {
      "id": "cancha-general",
      "nombre": "Cancha General",
      "precio": 45000,
      "estado": "disponible"
    },
    {
      "id": "galeria-sur",
      "nombre": "Galería Sur",
      "precio": 22000,
      "estado": "disponible"
    },
    {
      "id": "tribuna-pacifico",
      "nombre": "Tribuna Pacífico",
      "precio": 35000,
      "estado": "agotada"
    }
  ],
  "teatro": [
    {
      "id": "palco-izq",
      "nombre": "Palco Izq.",
      "precio": 45000,
      "estado": "disponible"
    },
    {
      "id": "platea-baja",
      "nombre": "Platea Baja",
      "precio": 38000,
      "estado": "disponible"
    },
    {
      "id": "platea-alta",
      "nombre": "Platea Alta",
      "precio": 28000,
      "estado": "disponible"
    },
    {
      "id": "palco-der",
      "nombre": "Palco Der.",
      "precio": 45000,
      "estado": "disponible"
    },
    {
      "id": "balcon",
      "nombre": "Balcón",
      "precio": 20000,
      "estado": "agotada"
    },
    {
      "id": "galeria",
      "nombre": "Galería",
      "precio": 12000,
      "estado": "disponible"
    }
  ],
  "arena": [
    {
      "id": "lateral-izq",
      "nombre": "Lateral Izq.",
      "precio": 26000,
      "estado": "disponible"
    },
    {
      "id": "cancha",
      "nombre": "Cancha",
      "precio": 70000,
      "estado": "disponible"
    },
    {
      "id": "platea-preferencial",
      "nombre": "Platea Preferencial",
      "precio": 52000,
      "estado": "disponible"
    },
    {
      "id": "tribuna-central",
      "nombre": "Tribuna Central",
      "precio": 34000,
      "estado": "disponible"
    },
    {
      "id": "lateral-der",
      "nombre": "Lateral Der.",
      "precio": 26000,
      "estado": "disponible"
    },
    {
      "id": "tribuna-superior",
      "nombre": "Tribuna Superior",
      "precio": 18000,
      "estado": "disponible"
    }
  ],
  "ferial": [
    {
      "id": "pabellon-a",
      "nombre": "Pabellón A",
      "precio": 8000,
      "estado": "disponible"
    },
    {
      "id": "pabellon-b",
      "nombre": "Pabellón B",
      "precio": 8000,
      "estado": "disponible"
    },
    {
      "id": "zona-exterior",
      "nombre": "Zona Exterior · Food",
      "precio": 5000,
      "estado": "disponible"
    },
    {
      "id": "acceso-vip",
      "nombre": "Acceso VIP · Pase de día",
      "precio": 15000,
      "estado": "disponible"
    },
    {
      "id": "entrada-general",
      "nombre": "Entrada General",
      "precio": 10000,
      "estado": "agotada"
    }
  ]
};

export function obtenerSectores(evento) {
  const nombre = evento.recinto.toLowerCase();
  if (nombre.includes('teatro')) return sectores.teatro;
  if (nombre.includes('arena')) return sectores.arena;
  if (evento.categoriaId === 'ferias') return sectores.ferial;
  return sectores.estadio;
}
