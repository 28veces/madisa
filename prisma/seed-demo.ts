import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

config({ path: ".env.local" });
config({ path: ".env" });

const prisma = new PrismaClient();

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number, decimals = 2): number {
  const val = Math.random() * (max - min) + min;
  return Math.round(val * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

function utcDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day));
}

type PurchaseCategory = "SUBLIMABLE" | "NO_SUBLIMABLE" | "INSUMO" | "OTROS";

interface InventoryDef {
  code: string;
  description: string;
  category: PurchaseCategory;
  buyPrice: number;
  sellMin: number;
  sellMax: number;
}

const INVENTORY_ITEMS: InventoryDef[] = [
  // ── Tazas cerámica (001-020) ────────────────────────────────────────────
  { code: "INV-001", description: "Taza cerámica blanca 11oz",                  category: "SUBLIMABLE",    buyPrice: 2.50, sellMin: 12, sellMax: 15 },
  { code: "INV-002", description: "Taza cerámica negra 11oz",                   category: "SUBLIMABLE",    buyPrice: 3.00, sellMin: 14, sellMax: 18 },
  { code: "INV-003", description: "Taza cerámica blanca 15oz",                  category: "SUBLIMABLE",    buyPrice: 3.00, sellMin: 14, sellMax: 18 },
  { code: "INV-004", description: "Taza cerámica interior rojo 11oz",           category: "SUBLIMABLE",    buyPrice: 3.50, sellMin: 15, sellMax: 18 },
  { code: "INV-005", description: "Taza cerámica interior azul 11oz",           category: "SUBLIMABLE",    buyPrice: 3.50, sellMin: 15, sellMax: 18 },
  { code: "INV-006", description: "Taza cerámica interior verde 11oz",          category: "SUBLIMABLE",    buyPrice: 3.50, sellMin: 15, sellMax: 18 },
  { code: "INV-007", description: "Taza cerámica interior amarillo 11oz",       category: "SUBLIMABLE",    buyPrice: 3.50, sellMin: 15, sellMax: 18 },
  { code: "INV-008", description: "Taza mágica sensible al calor 11oz",         category: "SUBLIMABLE",    buyPrice: 4.50, sellMin: 18, sellMax: 22 },
  { code: "INV-009", description: "Taza mágica negra 11oz",                     category: "SUBLIMABLE",    buyPrice: 5.00, sellMin: 20, sellMax: 24 },
  { code: "INV-010", description: "Taza panorámica cerámica 15oz",              category: "SUBLIMABLE",    buyPrice: 3.50, sellMin: 16, sellMax: 20 },
  { code: "INV-011", description: "Taza corazón cerámica blanca",               category: "SUBLIMABLE",    buyPrice: 4.00, sellMin: 16, sellMax: 20 },
  { code: "INV-012", description: "Taza cerámica dos tonos blanco/negro",       category: "SUBLIMABLE",    buyPrice: 4.00, sellMin: 16, sellMax: 20 },
  { code: "INV-013", description: "Taza bota cerámica 16oz",                    category: "SUBLIMABLE",    buyPrice: 5.00, sellMin: 20, sellMax: 25 },
  { code: "INV-014", description: "Taza cerámica con tapa blanca 12oz",         category: "SUBLIMABLE",    buyPrice: 4.50, sellMin: 18, sellMax: 22 },
  { code: "INV-015", description: "Taza cerámica rectangular 11oz",             category: "SUBLIMABLE",    buyPrice: 3.00, sellMin: 14, sellMax: 18 },
  { code: "INV-016", description: "Taza cerámica ovalada 11oz",                 category: "SUBLIMABLE",    buyPrice: 3.50, sellMin: 15, sellMax: 19 },
  { code: "INV-017", description: "Taza cerámica tipo jarra 16oz",              category: "SUBLIMABLE",    buyPrice: 4.00, sellMin: 17, sellMax: 22 },
  { code: "INV-018", description: "Taza cerámica minimalista 11oz",             category: "SUBLIMABLE",    buyPrice: 2.80, sellMin: 13, sellMax: 16 },
  { code: "INV-019", description: "Taza cerámica fosforescente 11oz",           category: "SUBLIMABLE",    buyPrice: 5.50, sellMin: 22, sellMax: 28 },
  { code: "INV-020", description: "Taza cerámica rascador 11oz",                category: "SUBLIMABLE",    buyPrice: 4.50, sellMin: 18, sellMax: 22 },
  // ── Termos y tazas de viaje (021-030) ───────────────────────────────────
  { code: "INV-021", description: "Taza de viaje acero inoxidable 14oz",        category: "SUBLIMABLE",    buyPrice: 6.00, sellMin: 20, sellMax: 25 },
  { code: "INV-022", description: "Taza de viaje acero inoxidable 20oz",        category: "SUBLIMABLE",    buyPrice: 8.00, sellMin: 25, sellMax: 32 },
  { code: "INV-023", description: "Taza de viaje plástico con tapa 12oz",       category: "SUBLIMABLE",    buyPrice: 4.00, sellMin: 15, sellMax: 20 },
  { code: "INV-024", description: "Termo acero inoxidable 16oz",                category: "SUBLIMABLE",    buyPrice: 9.00, sellMin: 28, sellMax: 35 },
  { code: "INV-025", description: "Termo acero inoxidable 20oz",                category: "SUBLIMABLE",    buyPrice: 11.00, sellMin: 32, sellMax: 40 },
  { code: "INV-026", description: "Tumbler acero sublimable 20oz",              category: "SUBLIMABLE",    buyPrice: 7.00, sellMin: 22, sellMax: 28 },
  { code: "INV-027", description: "Tumbler acero sublimable 30oz",              category: "SUBLIMABLE",    buyPrice: 9.00, sellMin: 28, sellMax: 35 },
  { code: "INV-028", description: "Botella deportiva plástico 24oz",            category: "SUBLIMABLE",    buyPrice: 5.00, sellMin: 18, sellMax: 24 },
  { code: "INV-029", description: "Termo con asa acero 17oz",                   category: "SUBLIMABLE",    buyPrice: 10.00, sellMin: 30, sellMax: 38 },
  { code: "INV-030", description: "Vaso Stanley-style acero 40oz",              category: "SUBLIMABLE",    buyPrice: 12.00, sellMin: 38, sellMax: 48 },
  // ── Vasos (031-050) ──────────────────────────────────────────────────────
  { code: "INV-031", description: "Vaso vidrio sublimable 16oz",                category: "SUBLIMABLE",    buyPrice: 2.00, sellMin: 12, sellMax: 15 },
  { code: "INV-032", description: "Vaso vidrio sublimable 20oz",                category: "SUBLIMABLE",    buyPrice: 2.50, sellMin: 13, sellMax: 17 },
  { code: "INV-033", description: "Vaso plástico sublimable 16oz",              category: "SUBLIMABLE",    buyPrice: 1.50, sellMin: 9,  sellMax: 13 },
  { code: "INV-034", description: "Vaso acrílico sublimable 20oz",              category: "SUBLIMABLE",    buyPrice: 2.50, sellMin: 13, sellMax: 17 },
  { code: "INV-035", description: "Copa de vidrio sublimable",                  category: "SUBLIMABLE",    buyPrice: 3.00, sellMin: 14, sellMax: 18 },
  { code: "INV-036", description: "Vaso cervecero vidrio 16oz",                 category: "SUBLIMABLE",    buyPrice: 2.50, sellMin: 13, sellMax: 17 },
  { code: "INV-037", description: "Shot glass sublimable 2oz",                  category: "SUBLIMABLE",    buyPrice: 1.50, sellMin: 9,  sellMax: 13 },
  { code: "INV-038", description: "Jarra de vidrio sublimable 32oz",            category: "SUBLIMABLE",    buyPrice: 4.50, sellMin: 18, sellMax: 24 },
  { code: "INV-039", description: "Vaso deportivo plástico 24oz",               category: "SUBLIMABLE",    buyPrice: 3.00, sellMin: 14, sellMax: 18 },
  { code: "INV-040", description: "Copa champán vidrio sublimable",             category: "SUBLIMABLE",    buyPrice: 3.50, sellMin: 16, sellMax: 20 },
  { code: "INV-041", description: "Copa de vino vidrio sublimable",             category: "SUBLIMABLE",    buyPrice: 3.50, sellMin: 16, sellMax: 20 },
  { code: "INV-042", description: "Vaso hexagonal vidrio 16oz",                 category: "SUBLIMABLE",    buyPrice: 3.00, sellMin: 14, sellMax: 18 },
  { code: "INV-043", description: "Vaso grueso tipo bar 16oz",                  category: "SUBLIMABLE",    buyPrice: 2.50, sellMin: 13, sellMax: 17 },
  { code: "INV-044", description: "Vaso plástico con tapa y pitillo 22oz",      category: "SUBLIMABLE",    buyPrice: 3.00, sellMin: 14, sellMax: 18 },
  { code: "INV-045", description: "Set 2 vasos vidrio sublimable 16oz",         category: "SUBLIMABLE",    buyPrice: 5.00, sellMin: 20, sellMax: 26 },
  { code: "INV-046", description: "Vaso vidrio esmerilado 16oz",                category: "SUBLIMABLE",    buyPrice: 3.50, sellMin: 16, sellMax: 20 },
  { code: "INV-047", description: "Copa de champán plástico sublimable",        category: "SUBLIMABLE",    buyPrice: 2.50, sellMin: 12, sellMax: 16 },
  { code: "INV-048", description: "Vaso cónico vidrio 12oz",                    category: "SUBLIMABLE",    buyPrice: 2.00, sellMin: 11, sellMax: 15 },
  { code: "INV-049", description: "Vaso Mason jar 16oz",                        category: "SUBLIMABLE",    buyPrice: 3.50, sellMin: 16, sellMax: 20 },
  { code: "INV-050", description: "Vaso de aluminio campismo 12oz",             category: "SUBLIMABLE",    buyPrice: 2.50, sellMin: 12, sellMax: 16 },
  // ── Platos (051-065) ─────────────────────────────────────────────────────
  { code: "INV-051", description: "Plato cerámica sublimable 8\"",              category: "SUBLIMABLE",    buyPrice: 3.00, sellMin: 15, sellMax: 20 },
  { code: "INV-052", description: "Plato cerámica sublimable 10\"",             category: "SUBLIMABLE",    buyPrice: 4.00, sellMin: 18, sellMax: 24 },
  { code: "INV-053", description: "Plato cerámica sublimable 12\"",             category: "SUBLIMABLE",    buyPrice: 5.00, sellMin: 22, sellMax: 28 },
  { code: "INV-054", description: "Plato ovalado cerámica sublimable",          category: "SUBLIMABLE",    buyPrice: 4.50, sellMin: 20, sellMax: 26 },
  { code: "INV-055", description: "Plato cuadrado cerámica 8\"",                category: "SUBLIMABLE",    buyPrice: 4.00, sellMin: 18, sellMax: 24 },
  { code: "INV-056", description: "Plato hexagonal cerámica 8\"",               category: "SUBLIMABLE",    buyPrice: 4.50, sellMin: 20, sellMax: 26 },
  { code: "INV-057", description: "Platillo mini cerámica 5\"",                 category: "SUBLIMABLE",    buyPrice: 2.50, sellMin: 12, sellMax: 16 },
  { code: "INV-058", description: "Plato hondo cerámica sublimable",            category: "SUBLIMABLE",    buyPrice: 4.00, sellMin: 18, sellMax: 24 },
  { code: "INV-059", description: "Bandeja rectangular cerámica sublimable",    category: "SUBLIMABLE",    buyPrice: 5.50, sellMin: 24, sellMax: 30 },
  { code: "INV-060", description: "Plato borde dorado cerámica 8\"",            category: "SUBLIMABLE",    buyPrice: 5.00, sellMin: 22, sellMax: 28 },
  { code: "INV-061", description: "Plato MDF sublimable 8\"",                   category: "SUBLIMABLE",    buyPrice: 2.50, sellMin: 12, sellMax: 16 },
  { code: "INV-062", description: "Plato de madera sublimable redondo",         category: "SUBLIMABLE",    buyPrice: 3.00, sellMin: 15, sellMax: 20 },
  { code: "INV-063", description: "Plato aluminio sublimable 8\"",              category: "SUBLIMABLE",    buyPrice: 3.50, sellMin: 16, sellMax: 22 },
  { code: "INV-064", description: "Plato de pizarra sublimable 8\"",            category: "SUBLIMABLE",    buyPrice: 4.00, sellMin: 18, sellMax: 24 },
  { code: "INV-065", description: "Platito de postre cerámica 6\"",             category: "SUBLIMABLE",    buyPrice: 3.00, sellMin: 14, sellMax: 18 },
  // ── Camisetas y ropa (066-085) ───────────────────────────────────────────
  { code: "INV-066", description: "Camiseta poliéster sublimable talla S",      category: "SUBLIMABLE",    buyPrice: 3.50, sellMin: 15, sellMax: 20 },
  { code: "INV-067", description: "Camiseta poliéster sublimable talla M",      category: "SUBLIMABLE",    buyPrice: 3.50, sellMin: 15, sellMax: 20 },
  { code: "INV-068", description: "Camiseta poliéster sublimable talla L",      category: "SUBLIMABLE",    buyPrice: 3.50, sellMin: 15, sellMax: 20 },
  { code: "INV-069", description: "Camiseta poliéster sublimable talla XL",     category: "SUBLIMABLE",    buyPrice: 4.00, sellMin: 17, sellMax: 22 },
  { code: "INV-070", description: "Camiseta poliéster sublimable talla XXL",    category: "SUBLIMABLE",    buyPrice: 4.50, sellMin: 18, sellMax: 24 },
  { code: "INV-071", description: "Camiseta algodón/poly sublimable talla M",   category: "SUBLIMABLE",    buyPrice: 4.00, sellMin: 17, sellMax: 22 },
  { code: "INV-072", description: "Camiseta algodón/poly sublimable talla L",   category: "SUBLIMABLE",    buyPrice: 4.00, sellMin: 17, sellMax: 22 },
  { code: "INV-073", description: "Camiseta manga larga sublimable talla M",    category: "SUBLIMABLE",    buyPrice: 5.00, sellMin: 20, sellMax: 26 },
  { code: "INV-074", description: "Camiseta manga larga sublimable talla L",    category: "SUBLIMABLE",    buyPrice: 5.00, sellMin: 20, sellMax: 26 },
  { code: "INV-075", description: "Polo cuello V sublimable talla M",           category: "SUBLIMABLE",    buyPrice: 4.50, sellMin: 18, sellMax: 24 },
  { code: "INV-076", description: "Polo cuello V sublimable talla L",           category: "SUBLIMABLE",    buyPrice: 4.50, sellMin: 18, sellMax: 24 },
  { code: "INV-077", description: "Franela niño sublimable talla 4T",           category: "SUBLIMABLE",    buyPrice: 3.00, sellMin: 14, sellMax: 18 },
  { code: "INV-078", description: "Franela niño sublimable talla 6T",           category: "SUBLIMABLE",    buyPrice: 3.00, sellMin: 14, sellMax: 18 },
  { code: "INV-079", description: "Franela niño sublimable talla 8T",           category: "SUBLIMABLE",    buyPrice: 3.00, sellMin: 14, sellMax: 18 },
  { code: "INV-080", description: "Franela niño sublimable talla 10T",          category: "SUBLIMABLE",    buyPrice: 3.50, sellMin: 15, sellMax: 20 },
  { code: "INV-081", description: "Hoodie sublimable talla M",                  category: "SUBLIMABLE",    buyPrice: 12.00, sellMin: 35, sellMax: 45 },
  { code: "INV-082", description: "Hoodie sublimable talla L",                  category: "SUBLIMABLE",    buyPrice: 12.00, sellMin: 35, sellMax: 45 },
  { code: "INV-083", description: "Delantal sublimable blanco",                 category: "SUBLIMABLE",    buyPrice: 6.00, sellMin: 22, sellMax: 28 },
  { code: "INV-084", description: "Body bebé sublimable 3-6m",                  category: "SUBLIMABLE",    buyPrice: 3.50, sellMin: 15, sellMax: 20 },
  { code: "INV-085", description: "Body bebé sublimable 6-12m",                 category: "SUBLIMABLE",    buyPrice: 3.50, sellMin: 15, sellMax: 20 },
  // ── Gorras (086-100) ─────────────────────────────────────────────────────
  { code: "INV-086", description: "Gorra sublimable 5 paneles blanca",          category: "SUBLIMABLE",    buyPrice: 4.00, sellMin: 18, sellMax: 25 },
  { code: "INV-087", description: "Gorra sublimable 5 paneles negra",           category: "SUBLIMABLE",    buyPrice: 4.00, sellMin: 18, sellMax: 25 },
  { code: "INV-088", description: "Gorra sublimable 5 paneles azul",            category: "SUBLIMABLE",    buyPrice: 4.00, sellMin: 18, sellMax: 25 },
  { code: "INV-089", description: "Gorra snapback sublimable blanca",           category: "SUBLIMABLE",    buyPrice: 5.00, sellMin: 22, sellMax: 28 },
  { code: "INV-090", description: "Gorra snapback sublimable negra",            category: "SUBLIMABLE",    buyPrice: 5.00, sellMin: 22, sellMax: 28 },
  { code: "INV-091", description: "Gorra beisbolera sublimable blanca",         category: "SUBLIMABLE",    buyPrice: 4.50, sellMin: 20, sellMax: 26 },
  { code: "INV-092", description: "Gorra beisbolera sublimable roja",           category: "SUBLIMABLE",    buyPrice: 4.50, sellMin: 20, sellMax: 26 },
  { code: "INV-093", description: "Gorra trucker sublimable",                   category: "SUBLIMABLE",    buyPrice: 5.50, sellMin: 22, sellMax: 30 },
  { code: "INV-094", description: "Sombrero de playa sublimable",               category: "SUBLIMABLE",    buyPrice: 6.00, sellMin: 24, sellMax: 32 },
  { code: "INV-095", description: "Visera sublimable blanca",                   category: "SUBLIMABLE",    buyPrice: 4.00, sellMin: 18, sellMax: 24 },
  { code: "INV-096", description: "Visera sublimable negra",                    category: "SUBLIMABLE",    buyPrice: 4.00, sellMin: 18, sellMax: 24 },
  { code: "INV-097", description: "Gorra niño sublimable",                      category: "SUBLIMABLE",    buyPrice: 3.50, sellMin: 16, sellMax: 22 },
  { code: "INV-098", description: "Beanie sublimable",                          category: "SUBLIMABLE",    buyPrice: 5.00, sellMin: 20, sellMax: 28 },
  { code: "INV-099", description: "Bucket hat sublimable",                      category: "SUBLIMABLE",    buyPrice: 6.00, sellMin: 24, sellMax: 32 },
  { code: "INV-100", description: "Gorra golf sublimable blanca",               category: "SUBLIMABLE",    buyPrice: 5.00, sellMin: 22, sellMax: 28 },
  // ── Placas y reconocimientos (101-115) ──────────────────────────────────
  { code: "INV-101", description: "Placa aluminio sublimable 10x15cm",          category: "SUBLIMABLE",    buyPrice: 1.50, sellMin: 10, sellMax: 15 },
  { code: "INV-102", description: "Placa aluminio sublimable 15x20cm",          category: "SUBLIMABLE",    buyPrice: 2.00, sellMin: 14, sellMax: 18 },
  { code: "INV-103", description: "Placa aluminio sublimable 20x25cm",          category: "SUBLIMABLE",    buyPrice: 2.50, sellMin: 16, sellMax: 22 },
  { code: "INV-104", description: "Placa aluminio sublimable 30x40cm",          category: "SUBLIMABLE",    buyPrice: 4.00, sellMin: 20, sellMax: 28 },
  { code: "INV-105", description: "Placa acero inoxidable 10x15cm",             category: "SUBLIMABLE",    buyPrice: 3.00, sellMin: 16, sellMax: 22 },
  { code: "INV-106", description: "Placa bronce efecto sublimable 15x20cm",     category: "SUBLIMABLE",    buyPrice: 4.00, sellMin: 20, sellMax: 28 },
  { code: "INV-107", description: "Placa MDF con marco sublimable 20x25cm",     category: "SUBLIMABLE",    buyPrice: 3.50, sellMin: 18, sellMax: 24 },
  { code: "INV-108", description: "Placa cristal sublimable 10x15cm",           category: "SUBLIMABLE",    buyPrice: 8.00, sellMin: 28, sellMax: 38 },
  { code: "INV-109", description: "Placa cristal sublimable 20x25cm",           category: "SUBLIMABLE",    buyPrice: 12.00, sellMin: 38, sellMax: 50 },
  { code: "INV-110", description: "Medalla sublimable 50mm",                    category: "SUBLIMABLE",    buyPrice: 3.00, sellMin: 15, sellMax: 20 },
  { code: "INV-111", description: "Medalla sublimable 70mm",                    category: "SUBLIMABLE",    buyPrice: 4.00, sellMin: 18, sellMax: 25 },
  { code: "INV-112", description: "Trofeo aluminio sublimable",                 category: "SUBLIMABLE",    buyPrice: 8.00, sellMin: 28, sellMax: 38 },
  { code: "INV-113", description: "Portarretrato aluminio sublimable 4x6\"",    category: "SUBLIMABLE",    buyPrice: 4.00, sellMin: 18, sellMax: 25 },
  { code: "INV-114", description: "Portarretrato aluminio sublimable 5x7\"",    category: "SUBLIMABLE",    buyPrice: 5.00, sellMin: 22, sellMax: 30 },
  { code: "INV-115", description: "Placa pizarra sublimable 20x25cm",           category: "SUBLIMABLE",    buyPrice: 3.00, sellMin: 16, sellMax: 22 },
  // ── Mousepads (116-125) ──────────────────────────────────────────────────
  { code: "INV-116", description: "Mousepad sublimable 20x24cm",                category: "SUBLIMABLE",    buyPrice: 2.50, sellMin: 12, sellMax: 16 },
  { code: "INV-117", description: "Mousepad sublimable 20x24cm espesor 3mm",    category: "SUBLIMABLE",    buyPrice: 3.00, sellMin: 14, sellMax: 18 },
  { code: "INV-118", description: "Mousepad grande 30x40cm",                    category: "SUBLIMABLE",    buyPrice: 4.00, sellMin: 18, sellMax: 24 },
  { code: "INV-119", description: "Mousepad XL escritorio 40x80cm",             category: "SUBLIMABLE",    buyPrice: 8.00, sellMin: 28, sellMax: 38 },
  { code: "INV-120", description: "Mousepad circular 20cm",                     category: "SUBLIMABLE",    buyPrice: 2.50, sellMin: 12, sellMax: 16 },
  { code: "INV-121", description: "Mousepad con reposamuñecas",                 category: "SUBLIMABLE",    buyPrice: 5.00, sellMin: 20, sellMax: 28 },
  { code: "INV-122", description: "Mousepad rectangular 25x20cm",               category: "SUBLIMABLE",    buyPrice: 3.00, sellMin: 14, sellMax: 18 },
  { code: "INV-123", description: "Mousepad gaming 35x25cm",                    category: "SUBLIMABLE",    buyPrice: 5.00, sellMin: 20, sellMax: 28 },
  { code: "INV-124", description: "Mousepad doble cara sublimable",             category: "SUBLIMABLE",    buyPrice: 4.50, sellMin: 18, sellMax: 26 },
  { code: "INV-125", description: "Mousepad resistente al agua 20x24cm",        category: "SUBLIMABLE",    buyPrice: 3.50, sellMin: 16, sellMax: 22 },
  // ── Almohadas y textiles (126-140) ───────────────────────────────────────
  { code: "INV-126", description: "Almohada sublimable 35x35cm",                category: "SUBLIMABLE",    buyPrice: 5.00, sellMin: 20, sellMax: 28 },
  { code: "INV-127", description: "Almohada sublimable 40x40cm",                category: "SUBLIMABLE",    buyPrice: 6.00, sellMin: 24, sellMax: 32 },
  { code: "INV-128", description: "Almohada cilíndrica sublimable 30x50cm",     category: "SUBLIMABLE",    buyPrice: 7.00, sellMin: 26, sellMax: 35 },
  { code: "INV-129", description: "Almohada corazón sublimable",                category: "SUBLIMABLE",    buyPrice: 7.00, sellMin: 26, sellMax: 35 },
  { code: "INV-130", description: "Funda de almohada sublimable 45x45cm",       category: "SUBLIMABLE",    buyPrice: 4.00, sellMin: 18, sellMax: 24 },
  { code: "INV-131", description: "Bolsa tela sublimable 30x40cm",              category: "SUBLIMABLE",    buyPrice: 3.00, sellMin: 14, sellMax: 20 },
  { code: "INV-132", description: "Bolsa tela sublimable 40x45cm",              category: "SUBLIMABLE",    buyPrice: 3.50, sellMin: 16, sellMax: 22 },
  { code: "INV-133", description: "Bandera sublimable 50x75cm",                 category: "SUBLIMABLE",    buyPrice: 5.00, sellMin: 20, sellMax: 28 },
  { code: "INV-134", description: "Bandera sublimable 60x90cm",                 category: "SUBLIMABLE",    buyPrice: 7.00, sellMin: 26, sellMax: 35 },
  { code: "INV-135", description: "Tapete de baño sublimable 40x60cm",          category: "SUBLIMABLE",    buyPrice: 6.00, sellMin: 24, sellMax: 32 },
  { code: "INV-136", description: "Pañuelo sublimable 50x50cm",                 category: "SUBLIMABLE",    buyPrice: 3.50, sellMin: 16, sellMax: 22 },
  { code: "INV-137", description: "Toalla sublimable 30x50cm",                  category: "SUBLIMABLE",    buyPrice: 7.00, sellMin: 26, sellMax: 35 },
  { code: "INV-138", description: "Toalla grande sublimable 60x90cm",           category: "SUBLIMABLE",    buyPrice: 12.00, sellMin: 38, sellMax: 50 },
  { code: "INV-139", description: "Cojín sublimable forma estrella",            category: "SUBLIMABLE",    buyPrice: 8.00, sellMin: 28, sellMax: 38 },
  { code: "INV-140", description: "Cojín sublimable forma corazón",             category: "SUBLIMABLE",    buyPrice: 8.00, sellMin: 28, sellMax: 38 },
  // ── Misceláneos sublimables (141-160) ────────────────────────────────────
  { code: "INV-141", description: "Rompecabezas sublimable 110 piezas",         category: "SUBLIMABLE",    buyPrice: 4.00, sellMin: 18, sellMax: 25 },
  { code: "INV-142", description: "Rompecabezas sublimable 252 piezas",         category: "SUBLIMABLE",    buyPrice: 6.00, sellMin: 24, sellMax: 32 },
  { code: "INV-143", description: "Llavero acrílico sublimable redondo",        category: "SUBLIMABLE",    buyPrice: 0.80, sellMin: 6,  sellMax: 10 },
  { code: "INV-144", description: "Llavero aluminio sublimable rectangular",    category: "SUBLIMABLE",    buyPrice: 1.00, sellMin: 7,  sellMax: 12 },
  { code: "INV-145", description: "Llavero MDF sublimable",                     category: "SUBLIMABLE",    buyPrice: 0.80, sellMin: 6,  sellMax: 10 },
  { code: "INV-146", description: "Funda celular iPhone 14 sublimable",         category: "SUBLIMABLE",    buyPrice: 3.00, sellMin: 15, sellMax: 20 },
  { code: "INV-147", description: "Funda celular Samsung S23 sublimable",       category: "SUBLIMABLE",    buyPrice: 3.00, sellMin: 15, sellMax: 20 },
  { code: "INV-148", description: "Funda celular universal sublimable",         category: "SUBLIMABLE",    buyPrice: 2.50, sellMin: 12, sellMax: 17 },
  { code: "INV-149", description: "Agenda/planificador sublimable",             category: "SUBLIMABLE",    buyPrice: 5.00, sellMin: 20, sellMax: 28 },
  { code: "INV-150", description: "Cuaderno sublimable tapa dura",              category: "SUBLIMABLE",    buyPrice: 4.00, sellMin: 18, sellMax: 25 },
  { code: "INV-151", description: "Pin/botón sublimable 25mm",                  category: "SUBLIMABLE",    buyPrice: 0.50, sellMin: 4,  sellMax: 7  },
  { code: "INV-152", description: "Pin/botón sublimable 38mm",                  category: "SUBLIMABLE",    buyPrice: 0.80, sellMin: 5,  sellMax: 9  },
  { code: "INV-153", description: "Pin/botón sublimable 58mm",                  category: "SUBLIMABLE",    buyPrice: 1.00, sellMin: 6,  sellMax: 10 },
  { code: "INV-154", description: "Taza plástica para infantes sublimable",     category: "SUBLIMABLE",    buyPrice: 2.50, sellMin: 12, sellMax: 16 },
  { code: "INV-155", description: "Caja de regalo sublimable",                  category: "SUBLIMABLE",    buyPrice: 3.00, sellMin: 14, sellMax: 20 },
  { code: "INV-156", description: "Lámpara de luna 3D sublimable",              category: "SUBLIMABLE",    buyPrice: 15.00, sellMin: 45, sellMax: 60 },
  { code: "INV-157", description: "Marco de fotos cristal sublimable",          category: "SUBLIMABLE",    buyPrice: 10.00, sellMin: 35, sellMax: 48 },
  { code: "INV-158", description: "Tablero de corcho sublimable 30x40cm",       category: "SUBLIMABLE",    buyPrice: 6.00, sellMin: 24, sellMax: 32 },
  { code: "INV-159", description: "Bolsa neopreno sublimable para laptop",      category: "SUBLIMABLE",    buyPrice: 8.00, sellMin: 28, sellMax: 38 },
  { code: "INV-160", description: "Tarjeta de aluminio sublimable",             category: "SUBLIMABLE",    buyPrice: 1.50, sellMin: 8,  sellMax: 14 },
  // ── Insumos (161-185) ────────────────────────────────────────────────────
  { code: "INV-161", description: "Papel sublimación A4 (100 hojas)",           category: "INSUMO",        buyPrice: 8.00, sellMin: 0, sellMax: 0 },
  { code: "INV-162", description: "Papel sublimación A3 (100 hojas)",           category: "INSUMO",        buyPrice: 15.00, sellMin: 0, sellMax: 0 },
  { code: "INV-163", description: "Tinta sublimación cian 100ml",               category: "INSUMO",        buyPrice: 12.00, sellMin: 0, sellMax: 0 },
  { code: "INV-164", description: "Tinta sublimación magenta 100ml",            category: "INSUMO",        buyPrice: 12.00, sellMin: 0, sellMax: 0 },
  { code: "INV-165", description: "Tinta sublimación amarillo 100ml",           category: "INSUMO",        buyPrice: 12.00, sellMin: 0, sellMax: 0 },
  { code: "INV-166", description: "Tinta sublimación negro 100ml",              category: "INSUMO",        buyPrice: 12.00, sellMin: 0, sellMax: 0 },
  { code: "INV-167", description: "Tinta sublimación set 4 colores 100ml",      category: "INSUMO",        buyPrice: 45.00, sellMin: 0, sellMax: 0 },
  { code: "INV-168", description: "Vinilo termoadhesivo blanco 30cm×1m",        category: "INSUMO",        buyPrice: 5.00, sellMin: 0, sellMax: 0 },
  { code: "INV-169", description: "Vinilo termoadhesivo negro 30cm×1m",         category: "INSUMO",        buyPrice: 5.00, sellMin: 0, sellMax: 0 },
  { code: "INV-170", description: "Vinilo termoadhesivo rojo 30cm×1m",          category: "INSUMO",        buyPrice: 5.00, sellMin: 0, sellMax: 0 },
  { code: "INV-171", description: "Vinilo DTF transfer A3 (10 hojas)",          category: "INSUMO",        buyPrice: 18.00, sellMin: 0, sellMax: 0 },
  { code: "INV-172", description: "Cinta de resistencia para plancha",          category: "INSUMO",        buyPrice: 3.00, sellMin: 0, sellMax: 0 },
  { code: "INV-173", description: "Papel silicona protector plancha (rollo)",   category: "INSUMO",        buyPrice: 8.00, sellMin: 0, sellMax: 0 },
  { code: "INV-174", description: "Spray fijador para sublimación",             category: "INSUMO",        buyPrice: 12.00, sellMin: 0, sellMax: 0 },
  { code: "INV-175", description: "Esponja de silicona para plancha",           category: "INSUMO",        buyPrice: 5.00, sellMin: 0, sellMax: 0 },
  { code: "INV-176", description: "Pinzas para ropa (paquete 20 uds)",          category: "INSUMO",        buyPrice: 4.00, sellMin: 0, sellMax: 0 },
  { code: "INV-177", description: "Guantes de látex para plancha",              category: "INSUMO",        buyPrice: 3.00, sellMin: 0, sellMax: 0 },
  { code: "INV-178", description: "Fundas shrink wrap para tazas",              category: "INSUMO",        buyPrice: 6.00, sellMin: 0, sellMax: 0 },
  { code: "INV-179", description: "Film protector para placa sublimable",       category: "INSUMO",        buyPrice: 4.00, sellMin: 0, sellMax: 0 },
  { code: "INV-180", description: "Papel transfer bordado A4 (50 hojas)",       category: "INSUMO",        buyPrice: 10.00, sellMin: 0, sellMax: 0 },
  { code: "INV-181", description: "Vinilo reflectivo sublimable 30cm×1m",       category: "INSUMO",        buyPrice: 9.00, sellMin: 0, sellMax: 0 },
  { code: "INV-182", description: "Cinta doble cara para montaje",              category: "INSUMO",        buyPrice: 3.50, sellMin: 0, sellMax: 0 },
  { code: "INV-183", description: "Papel resistente al agua sublimación A4",    category: "INSUMO",        buyPrice: 12.00, sellMin: 0, sellMax: 0 },
  { code: "INV-184", description: "Tinta comestible sublimación set 4 colores", category: "INSUMO",        buyPrice: 35.00, sellMin: 0, sellMax: 0 },
  { code: "INV-185", description: "Vinilo colores surtidos 30cm×1m",            category: "INSUMO",        buyPrice: 6.00, sellMin: 0, sellMax: 0 },
  // ── No sublimables / decoración (186-200) ───────────────────────────────
  { code: "INV-186", description: "Florero de vidrio decorativo",               category: "NO_SUBLIMABLE", buyPrice: 8.00, sellMin: 0, sellMax: 0 },
  { code: "INV-187", description: "Caja de madera para regalo",                 category: "NO_SUBLIMABLE", buyPrice: 6.00, sellMin: 0, sellMax: 0 },
  { code: "INV-188", description: "Globo metálico personalizable",              category: "NO_SUBLIMABLE", buyPrice: 2.00, sellMin: 0, sellMax: 0 },
  { code: "INV-189", description: "Cinta de regalo satinada (rollo 10m)",       category: "NO_SUBLIMABLE", buyPrice: 3.00, sellMin: 0, sellMax: 0 },
  { code: "INV-190", description: "Papel de regalo kraft (rollo 2m)",           category: "NO_SUBLIMABLE", buyPrice: 4.00, sellMin: 0, sellMax: 0 },
  { code: "INV-191", description: "Base de madera para trofeo",                 category: "NO_SUBLIMABLE", buyPrice: 5.00, sellMin: 0, sellMax: 0 },
  { code: "INV-192", description: "Soporte de acrílico para placa",             category: "NO_SUBLIMABLE", buyPrice: 4.00, sellMin: 0, sellMax: 0 },
  { code: "INV-193", description: "Caja organizadora de acrílico",              category: "NO_SUBLIMABLE", buyPrice: 12.00, sellMin: 0, sellMax: 0 },
  { code: "INV-194", description: "Lámina de madera MDF 3mm A4",               category: "NO_SUBLIMABLE", buyPrice: 3.00, sellMin: 0, sellMax: 0 },
  { code: "INV-195", description: "Lámina de acrílico transparente A4",         category: "NO_SUBLIMABLE", buyPrice: 4.50, sellMin: 0, sellMax: 0 },
  { code: "INV-196", description: "Pegamento epóxico bicomponente",             category: "NO_SUBLIMABLE", buyPrice: 8.00, sellMin: 0, sellMax: 0 },
  { code: "INV-197", description: "Pintura acrílica blanca 500ml",              category: "NO_SUBLIMABLE", buyPrice: 7.00, sellMin: 0, sellMax: 0 },
  { code: "INV-198", description: "Pintura acrílica negra 500ml",               category: "NO_SUBLIMABLE", buyPrice: 7.00, sellMin: 0, sellMax: 0 },
  { code: "INV-199", description: "Barniz mate para manualidades 500ml",        category: "NO_SUBLIMABLE", buyPrice: 9.00, sellMin: 0, sellMax: 0 },
  { code: "INV-200", description: "Caja de cartón para envío 30x20x15cm",       category: "NO_SUBLIMABLE", buyPrice: 1.50, sellMin: 0, sellMax: 0 },
];

// Solo los sublimables se pueden vender
const SELLABLE = INVENTORY_ITEMS.filter((i) => i.sellMin > 0);

const CLIENT_NAMES = [
  "María García", "Juan Pérez", "Ana Rodríguez", "Carlos López",
  "Patricia Martínez", "Roberto Sánchez", "Linda Herrera", "Miguel Torres",
  "Carmen Flores", "Eduardo Castro", "Sofía Vargas", "Diego Morales",
  "Isabella Jiménez", "Fernando Reyes", "Valentina Cruz", "Andrés Moreno",
  "Gabriela Romero", "Sebastián Ruiz", "Natalia Gutiérrez", "Ricardo Díaz",
  "Elena Mendoza", "Alejandro Vega", "Daniela Ríos", "Pablo Castillo",
  "Lucía Ortiz", "Ernesto Navarro", "Adriana Delgado", "Julio Muñoz",
  "Beatriz Ramírez", "Héctor Aguilar", "Mariana Silva", "Tomás Fuentes",
  "Rosa Peña", "Víctor Alvarado", "Claudia Espinoza",
];

const BUSINESS_LINES = ["PERSONALIZACION", "ARREGLOS", "IMPRESIONES", "OTRO"] as const;
const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

async function main() {
  const business = await prisma.business.findUnique({ where: { slug: "artemadisa" } });
  if (!business) throw new Error("Primero ejecuta: npm run db:seed");

  const existingPurchases = await prisma.purchase.count({ where: { businessId: business.id } });
  if (existingPurchases > 0) {
    console.log("⚠️  Ya existen datos de demo. Ejecuta db:reset si quieres regenerarlos.");
    return;
  }

  // ============================================================
  // PARTNERS
  // ============================================================
  const partnerData = [
    { id: "partner-miguel",   name: "Miguel",   percentage: 10, order: 1 },
    { id: "partner-marlenis", name: "Marlenis", percentage: 70, order: 2 },
    { id: "partner-madisa",   name: "Madisa",   percentage: 20, order: 3 },
  ];

  const partners = [];
  for (const p of partnerData) {
    const partner = await prisma.partner.upsert({
      where: { id: p.id },
      update: { percentage: p.percentage, order: p.order },
      create: { ...p, businessId: business.id },
    });
    partners.push(partner);
  }
  console.log("✅ Socios:", partners.map((p) => `${p.name} ${p.percentage}%`).join(" | "));

  // ============================================================
  // SUPPLIERS
  // ============================================================
  const supplierData = [
    { id: "sup-pansub",  name: "Distribuidora Panamá Sublimación", phone: "6700-1001", address: "Vía España, Ciudad de Panamá" },
    { id: "sup-todosub", name: "Todo en Sublimación",              phone: "6700-1002", address: "Ave. Balboa, Panamá" },
    { id: "sup-artpan",  name: "Arte y Regalos Panamá",            phone: "6700-1003", address: "Transistmica, Panamá" },
  ];

  const suppliers = [];
  for (const s of supplierData) {
    const supplier = await prisma.supplier.upsert({
      where: { id: s.id },
      update: {},
      create: { ...s, businessId: business.id },
    });
    suppliers.push(supplier);
  }
  console.log("✅ Proveedores:", suppliers.map((s) => s.name).join(", "));

  // ============================================================
  // INVENTORY ITEMS (200)
  // ============================================================
  const invMap: Record<string, string> = {};

  for (const item of INVENTORY_ITEMS) {
    const inv = await prisma.inventoryItem.upsert({
      where: { code: item.code },
      update: {},
      create: {
        code: item.code,
        description: item.description,
        category: item.category,
        businessId: business.id,
      },
    });
    invMap[item.code] = inv.id;

    const supplier = pick(suppliers);
    await prisma.inventoryItemSupplier.upsert({
      where: { inventoryItemId_supplierId: { inventoryItemId: inv.id, supplierId: supplier.id } },
      update: {},
      create: { inventoryItemId: inv.id, supplierId: supplier.id },
    });
  }
  console.log(`✅ ${INVENTORY_ITEMS.length} artículos de inventario creados`);

  // ============================================================
  // PURCHASES + SALES — mes a mes, stock nunca negativo
  // Solo los SUBLIMABLES se venden; todos se compran.
  // ============================================================
  const stock: Record<string, number> = {};
  for (const item of INVENTORY_ITEMS) stock[item.code] = 0;

  let purchaseCount = 0;
  let saleCount = 0;

  for (let month = 1; month <= 12; month++) {

    // --- COMPRAS (días 2-10 y 14-22) ---
    for (let p = 0; p < 2; p++) {
      const day = p === 0 ? rand(2, 10) : rand(14, 22);
      const purchaseDate = utcDate(2025, month, day);
      const supplier = pick(suppliers);

      // Comprar 15-20 artículos distintos por compra para cubrir variedad
      const shuffled = [...INVENTORY_ITEMS].sort(() => Math.random() - 0.5).slice(0, rand(15, 20));

      let totalAmount = 0;
      const items = shuffled.map((inv) => {
        const needed = Math.max(30 - stock[inv.code], 10);
        const qty = rand(needed, needed + 20);
        stock[inv.code] += qty;
        totalAmount += qty * inv.buyPrice;
        return {
          description: inv.description,
          quantity: qty,
          unitCost: inv.buyPrice,
          inventoryItemId: invMap[inv.code],
        };
      });

      await prisma.purchase.create({
        data: {
          description: `Compra ${MONTH_NAMES[month - 1]} ${p + 1} - Insumos sublimación`,
          totalAmount: Math.round(totalAmount * 100) / 100,
          category: "SUBLIMABLE",
          purchaseDate,
          businessId: business.id,
          supplierId: supplier.id,
          notes: `Proveedor: ${supplier.name}`,
          items: { create: items },
        },
      });
      purchaseCount++;
    }

    // --- VENTAS (solo artículos sublimables con stock) ---
    const days = Array.from({ length: 30 }, () => rand(1, 28));

    for (let s = 0; s < 30; s++) {
      const saleDate = utcDate(2025, month, days[s]);
      const clientName = pick(CLIENT_NAMES);
      const businessLine = pick([...BUSINESS_LINES]);
      const status = s < 27 ? "COMPLETED" : "IN_PROGRESS";
      const deliveredAt = status === "COMPLETED"
        ? utcDate(2025, month, Math.min(days[s] + rand(1, 3), 28))
        : null;

      const available = SELLABLE.filter((inv) => stock[inv.code] > 0);
      if (available.length === 0) continue;

      const numItems = Math.min(rand(1, 3), available.length);
      const picked = [...available].sort(() => Math.random() - 0.5).slice(0, numItems);

      let totalAmount = 0;
      const saleItems = picked.map((inv) => {
        const maxQty = Math.min(5, stock[inv.code]);
        const qty = rand(1, maxQty);
        stock[inv.code] -= qty;
        const unitPrice = randFloat(inv.sellMin, inv.sellMax);
        const productionCost = randFloat(inv.buyPrice, inv.buyPrice * 1.3);
        totalAmount += qty * unitPrice;
        return {
          inventoryItemId: invMap[inv.code],
          quantity: qty,
          unitPrice,
          productionCost: Math.round(productionCost * 100) / 100,
        };
      });

      await prisma.sale.create({
        data: {
          clientName,
          totalAmount: Math.round(totalAmount * 100) / 100,
          status,
          businessLine,
          deliveredAt,
          businessId: business.id,
          createdAt: saleDate,
          items: { create: saleItems },
        },
      });
      saleCount++;
    }
  }

  console.log(`✅ ${purchaseCount} compras creadas (2/mes × 12 meses)`);
  console.log(`✅ ${saleCount} ventas creadas (~30/mes × 12 meses)`);

  console.log("\n🎉 Datos de demostración cargados:");
  console.log(`   Socios:      ${partners.length} (Miguel 10% | Marlenis 70% | Madisa 20%)`);
  console.log(`   Proveedores: ${suppliers.length}`);
  console.log(`   Inventario:  ${INVENTORY_ITEMS.length} artículos`);
  console.log(`   Compras:     ${purchaseCount}`);
  console.log(`   Ventas:      ${saleCount}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
