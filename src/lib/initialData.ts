import { Activity, MaterialItem } from '@/types';

export const INITIAL_ACTIVITIES: Activity[] = [
  { id: 1, phase: 'Critical Civil & External', name: 'Waterproofing', start: '2026-08-01', end: '2026-09-20', priority: 'High', resp: 'Site Engineer', dep: '', status: 'In Progress', pct: 50, remarks: 'Urgent — civil site team on site' },
  { id: 2, phase: 'Critical Civil & External', name: 'Plaster', start: '2026-09-09', end: '2026-09-12', priority: 'High', resp: 'RS Construction', dep: 'Brick Masonary', status: 'In Progress', pct: 50, remarks: '' },
  { id: 3, phase: 'Critical Civil & External', name: 'Stone Masonary', start: '2026-09-09', end: '2026-09-16', priority: 'High', resp: 'RS Construction', dep: 'Brick Masonary', status: 'In Progress', pct: 50, remarks: '' },
  { id: 4, phase: 'Critical Civil & External', name: 'Brick Masonary', start: '2026-09-09', end: '2026-09-13', priority: 'High', resp: 'RS Construction', dep: '', status: 'In Progress', pct: 50, remarks: '' },
  { id: 5, phase: 'Critical Civil & External', name: 'MS Fabrication Roof', start: '2026-09-14', end: '2026-09-20', priority: 'High', resp: 'Fabricator', dep: '', status: 'Not Started', pct: 0, remarks: 'Selection done — delivery pending' },
  { id: 6, phase: 'Critical Civil & External', name: 'Roof Flooring', start: '2026-09-21', end: '2026-09-27', priority: 'High', resp: 'Nanak', dep: 'MS Fabrication Roof', status: 'Not Started', pct: 0, remarks: 'Crazy pattern — selection pending' },
  { id: 7, phase: 'Critical Civil & External', name: 'Outer Area Development', start: '2026-09-14', end: '2026-09-26', priority: 'High', resp: 'RS Construction', dep: '', status: 'In Progress', pct: 50, remarks: '' },
  { id: 8, phase: 'Swimming Pool', name: 'Swimming Pool Work', start: '2026-09-14', end: '2026-09-26', priority: 'High', resp: 'DD Pools', dep: '', status: 'In Progress', pct: 50, remarks: '' },
  { id: 9, phase: 'Services', name: 'Plumbing Drainage', start: '2026-09-14', end: '2026-09-18', priority: 'High', resp: 'Plumbing Team', dep: '', status: 'Completed', pct: 100, remarks: '' },
  { id: 10, phase: 'Services', name: 'BT Plumbing', start: '2026-09-19', end: '2026-09-23', priority: 'High', resp: 'Plumbing Team', dep: '', status: 'Not Started', pct: 0, remarks: 'Fittings partially delivered' },
  { id: 11, phase: 'Services', name: 'Electrical', start: '2026-09-21', end: '2026-10-01', priority: 'High', resp: 'Ganesh Ji', dep: '', status: 'Not Started', pct: 0, remarks: 'All selections pending' },
  { id: 12, phase: 'Finishes', name: 'False Ceiling', start: '2026-10-02', end: '2026-10-08', priority: 'High', resp: 'False Ceiling Vendor', dep: 'Electrical', status: 'In Progress', pct: 50, remarks: '' },
  { id: 13, phase: 'Finishes', name: 'Wall Tiles', start: '2026-09-24', end: '2026-10-01', priority: 'Medium', resp: 'Tiling Team', dep: '', status: 'Not Started', pct: 0, remarks: 'Tiles delivered' },
  { id: 14, phase: 'Finishes', name: 'Flooring', start: '2026-10-02', end: '2026-10-10', priority: 'Medium', resp: 'Tiling Team', dep: 'False Ceiling', status: 'Not Started', pct: 0, remarks: 'Tiles delivered' },
  { id: 15, phase: 'Finishes', name: 'Kitchen Counter', start: '2026-10-03', end: '2026-10-09', priority: 'Medium', resp: 'Kitchen Vendor', dep: 'Wall Tiles', status: 'Not Started', pct: 0, remarks: 'Full body tile delivered' },
  { id: 16, phase: 'Finishes', name: 'Bathroom Counter', start: '2026-09-24', end: '2026-09-29', priority: 'Medium', resp: 'Tiling Team', dep: 'Wall Tiles', status: 'Not Started', pct: 0, remarks: 'Full body tile delivered' },
  { id: 17, phase: 'Finishes', name: 'Paint', start: '2026-10-11', end: '2026-10-16', priority: 'Medium', resp: 'Painter', dep: 'Flooring', status: 'Not Started', pct: 0, remarks: 'Shade not selected' },
  { id: 18, phase: 'Openings', name: 'Sliding Doors', start: '2026-10-04', end: '2026-10-10', priority: 'Medium', resp: 'Door/Window Vendor', dep: 'Wall Tiles', status: 'Not Started', pct: 0, remarks: '4 nos — material to be specified' },
  { id: 19, phase: 'Openings', name: 'Windows', start: '2026-10-04', end: '2026-10-10', priority: 'Medium', resp: 'Door/Window Vendor', dep: 'Wall Tiles', status: 'Not Started', pct: 0, remarks: '5 nos — details pending' },
  { id: 20, phase: 'Openings', name: 'MS Fabrication Stairs', start: '2026-09-14', end: '2026-09-18', priority: 'Medium', resp: 'Fabricator (Izhan)', dep: 'Civil/Stairs', status: 'Completed', pct: 100, remarks: 'Red oxide & paint done' },
  { id: 21, phase: 'Interior', name: 'Mirrors', start: '2026-10-11', end: '2026-10-13', priority: 'Low', resp: 'Interior Vendor', dep: 'Paint', status: 'Not Started', pct: 0, remarks: '2 nos — selection pending' },
  { id: 22, phase: 'Interior', name: 'Furniture', start: '2026-10-11', end: '2026-10-25', priority: 'Medium', resp: 'Furniture Vendor', dep: 'Paint', status: 'Not Started', pct: 0, remarks: 'Details pending' },
  { id: 23, phase: 'Interior', name: 'Data / CCTV', start: '2026-10-11', end: '2026-10-18', priority: 'Medium', resp: 'ELV Vendor', dep: 'Electrical', status: 'Not Started', pct: 0, remarks: 'No details yet' },
  { id: 24, phase: 'Interior', name: 'UPS / Inverter', start: '2026-10-18', end: '2026-10-22', priority: 'Low', resp: 'Electrical Vendor', dep: 'Electrical', status: 'Not Started', pct: 0, remarks: 'No details yet' },
];

export const INITIAL_MATERIALS: MaterialItem[] = [
  // ── 1. Critical Civil & External ──
  { id: 1, name: 'Dr. Fixit 2K Polymer Chemical & Fiber Mesh', mat: 'Delivered', work: 'In Progress', resp: 'Aditya Construction', deadline: '07 Sep 2026', phase: 'Critical Civil & External', notes: 'Waterproofing for sunken slabs & roof terrace (30 Barrels)' },
  { id: 2, name: 'Ultratech OPC 53 Grade Structural Cement', mat: 'Delivered', work: 'In Progress', resp: 'RS Construction', deadline: '09 Sep 2026', phase: 'Critical Civil & External', notes: '500 Bags batch for masonry & structural plaster' },
  { id: 3, name: 'Class-1 Red Clay Kiln Bricks (50k Pcs)', mat: 'Delivered', work: 'In Progress', resp: 'RS Construction', deadline: '13 Sep 2026', phase: 'Critical Civil & External', notes: 'Perimeter boundary walls and room partitions' },
  { id: 4, name: 'Dholpur Natural Sandstone Blocks & Cladding', mat: 'To be Delivered', work: 'In Progress', resp: 'RS Construction', deadline: '28 Sep 2026', phase: 'Critical Civil & External', notes: 'Hand-chiseled elevation cladding stone' },
  { id: 5, name: 'Tata Structura Hollow Steel Trusses (IS 4923)', mat: 'To be Delivered', work: 'Pending', resp: 'Fabricator', deadline: '18 Sep 2026', phase: 'Critical Civil & External', notes: 'Heavy gauge steel rafters for terrace canopy' },
  { id: 6, name: 'Jaisalmer Crazy Pattern Natural Stone Slabs', mat: 'Selection Pending', work: 'Pending', resp: 'Nanak', deadline: '22 Sep 2026', phase: 'Critical Civil & External', notes: 'Crazy paving pattern for rooftop lounge sit-out' },
  { id: 7, name: 'Heavy-Duty M-30 Interlocking Pavers & Kerbs', mat: 'Delivered', work: 'In Progress', resp: 'RS Construction', deadline: '26 Sep 2026', phase: 'Critical Civil & External', notes: 'Driveway, driveway curbs & vehicle parking lot' },

  // ── 2. Swimming Pool ──
  { id: 8, name: 'Crystal Azure Glass Mosaic Tiles & Epoxy Grout', mat: 'To be Delivered', work: 'In Progress', resp: 'DD Pools', deadline: '26 Sep 2026', phase: 'Swimming Pool', notes: '25x25mm pool mosaic with anti-fungal epoxy grout' },
  { id: 9, name: 'Pentair Sand Filtration Plant & 1.5HP Pump', mat: 'Selection Pending', work: 'Pending', resp: 'DD Pools', deadline: '24 Sep 2026', phase: 'Swimming Pool', notes: 'Commercial pool circulation unit, skimmers & nozzles' },
  { id: 10, name: 'IP68 Submersible Warm White LED Pool Lights', mat: 'To be Delivered', work: 'Not Started', resp: 'DD Pools', deadline: '25 Sep 2026', phase: 'Swimming Pool', notes: '12V safe underwater lights with silicone sealing' },

  // ── 3. Services (Plumbing & Electrical) ──
  { id: 11, name: 'Astral CPVC / SWR Heavy Duty Pressure Pipes', mat: 'Partial', work: 'In Progress', resp: 'Plumbing Team', deadline: '18 Sep 2026', phase: 'Services', notes: 'Hot/cold concealed lines, soil stacks & floor traps' },
  { id: 12, name: 'Sintex 3-Layer Antimicrobial Overhead Tanks', mat: 'Delivered', work: 'Complete', resp: 'Plumbing Team', deadline: '14 Sep 2026', phase: 'Services', notes: '2 Units 2000L UV-protected overhead storage tanks' },
  { id: 13, name: 'Polycab FRLS Copper Cables & Heavy Conduits', mat: 'Selection Pending', work: 'Pending', resp: 'Ganesh Ji', deadline: '21 Sep 2026', phase: 'Services', notes: 'Fire retardant 1.5, 2.5, 4 sq.mm wiring & PVC conduit runs' },
  { id: 14, name: 'Legrand Modular Switches & Distribution Boards', mat: 'Selection Pending', work: 'Not Started', resp: 'Ganesh Ji', deadline: '28 Oct 2026', phase: 'Services', notes: 'Matte grey switchplates, MCBs, RCCB shock safety breaker' },

  // ── 4. Finishes ──
  { id: 15, name: 'Saint-Gobain Gyproc 12.5mm Ceiling Boards & GI', mat: 'Delivered', work: 'In Progress', resp: 'False Ceiling Vendor', deadline: '02 Oct 2026', phase: 'Finishes', notes: 'Moisture-resistant drywall boards & GI perimeter channels' },
  { id: 16, name: 'Kajaria 1200x600mm Vitrified Bathroom Wall Tiles', mat: 'Delivered', work: 'Pending', resp: 'Tiling Team', deadline: '24 Sep 2026', phase: 'Finishes', notes: 'Matte stone porcelain tiles for master and guest suites' },
  { id: 17, name: 'Full Body Italian Marble Countertop Slabs', mat: 'Delivered', work: 'Pending', resp: 'Kitchen Vendor', deadline: '20 Sep 2026', phase: 'Finishes', notes: 'Seamless 20mm slab for island kitchen & breakfast counter' },
  { id: 18, name: 'Black Galaxy Granite Vanity Counters', mat: 'Delivered', work: 'Pending', resp: 'Tiling Team', deadline: '15 Sep 2026', phase: 'Finishes', notes: 'Pre-moulded undermount vanity counters for washrooms' },
  { id: 19, name: 'Somany 800x1600mm High Gloss Vitrified Tiles', mat: 'Delivered', work: 'Pending', resp: 'Tiling Team', deadline: '02 Oct 2026', phase: 'Finishes', notes: 'Main living hall & bed suites primary flooring' },
  { id: 20, name: 'Asian Paints Royale Luxury Emulsion & Putty', mat: 'Selection Pending', work: 'Pending', resp: 'Painter', deadline: '11 Oct 2026', phase: 'Finishes', notes: 'Interior acrylic putty & luxury interior paint (200L)' },

  // ── 5. Openings ──
  { id: 21, name: 'Domal 27mm Heavy Duty Aluminium Sliding Doors', mat: 'Selection Pending', work: 'Pending', resp: 'Door/Window Vendor', deadline: '04 Oct 2026', phase: 'Openings', notes: '4 Sets anodized black frames with multi-point locks' },
  { id: 22, name: 'Soundproof Toughened DGU Glass Windows', mat: 'Selection Pending', work: 'Pending', resp: 'Door/Window Vendor', deadline: '04 Oct 2026', phase: 'Openings', notes: '5 Sets casement windows with SS mosquito mesh' },
  { id: 23, name: 'Custom MS Spiral Staircase Stringers & Rails', mat: 'Delivered', work: 'Complete', resp: 'Fabricator (Izhan)', deadline: '14 Sep 2026', phase: 'Openings', notes: '6mm plate tread brackets, anti-rust zinc primer coated' },

  // ── 6. Interior ──
  { id: 24, name: 'Custom Fluted Charcoal Louvers & Teak Veneer', mat: 'To be Delivered', work: 'Pending', resp: 'Furniture Vendor', deadline: '11 Oct 2026', phase: 'Interior', notes: 'Lounge feature wall & master bedroom wardrobe paneling' },
  { id: 25, name: 'Saint-Gobain 5mm LED Backlit Vanity Mirrors', mat: 'Selection Pending', work: 'Not Started', resp: 'Interior Vendor', deadline: '11 Oct 2026', phase: 'Interior', notes: '3 Nos touch-sensor anti-fog smart bathroom mirrors' },
  { id: 26, name: 'Hikvision 4K IP CCTV Surveillance & NVR', mat: 'To be Delivered', work: 'Not Started', resp: 'ELV Vendor', deadline: '11 Oct 2026', phase: 'Interior', notes: 'Outdoor weather-resistant IP cameras with Cat6 PoE cables' },
];
