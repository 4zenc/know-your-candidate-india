// Generates src/data/constituencies.json — ILLUSTRATIVE sample data.
// Constituencies are real; candidates, parties, figures and cases are fictional.
// Run: node scripts/generate_seed.mjs
import { writeFileSync } from "node:fs";

const SERIOUS = [["IPC 420", "Cheating and dishonestly inducing delivery of property"], ["IPC 307", "Attempt to murder"], ["IPC 406", "Criminal breach of trust"], ["IPC 120B", "Criminal conspiracy"], ["IPC 468", "Forgery for purpose of cheating"]];
const OTHER = [["IPC 143", "Unlawful assembly"], ["IPC 188", "Disobedience to order promulgated by public servant"], ["IPC 341", "Wrongful restraint"], ["IPC 504", "Intentional insult to provoke breach of peace"], ["IPC 506", "Criminal intimidation"]];
const STAT = ["Fulfilled", "In Progress", "Stalled", "Broken"];

const C = [
  { slug: "mumbai-south", name: "Mumbai South", state: "Maharashtra", code: "MH", pins: ["400001", "400005", "400026"], electors: 1550000, mp: [81, 42, 187, 3], mpl: [2500, 2250, 1890],
    projects: [["Colaba pedestrian walkway upgrade", "Roads", 420, "Completed", 100], ["Municipal school science labs", "Education", 310, "In Progress", 64], ["Worli sewage line replacement", "Sanitation", 780, "Delayed", 38], ["Community health centre expansion", "Health", 540, "In Progress", 72]],
    promises: ["Replace ageing water mains in old city wards", "Open 3 digital libraries in municipal schools", "Cut hospital outpatient wait times below 45 minutes", "Build 10 km of protected cycle lanes", "Quarterly public ward-level budget meetings", "Install flood sensors along the coastal drains"],
    cands: [["Anil Deshmukar", "Jan Vikas Morcha", 58, "Post Graduate", 41200, 98700, 21400, 38, [], [1]], ["Meera Kulkarney", "Rashtriya Pragati Dal", 49, "Graduate Professional", 28900, 52300, 9800, 22, [], []], ["Farhan Sheikhdar", "Lok Samaj Party", 44, "12th Pass", 6100, 14500, 3200, 61, [0], [2, 3]]] },
  { slug: "chennai-central", name: "Chennai Central", state: "Tamil Nadu", code: "TN", pins: ["600003", "600008", "600010"], electors: 1380000, mp: [88, 57, 242, 5], mpl: [2500, 2500, 2310],
    projects: [["Cooum bank storm-water drains", "Sanitation", 690, "Completed", 100], ["Corporation school smart classrooms", "Education", 260, "Completed", 100], ["Perambur arterial road resurfacing", "Roads", 510, "In Progress", 55], ["RO drinking water kiosks (40 sites)", "Water", 180, "In Progress", 80]],
    promises: ["Desilt all major drains before monsoon each year", "Commission 40 community RO water kiosks", "Modernise 12 corporation school buildings", "Create a ward-wise grievance dashboard", "Widen congested Perambur junction", "Open evening skill-training centres"],
    cands: [["Karthikeyan Subramanyam", "Rashtriya Pragati Dal", 61, "Doctorate", 77400, 214000, 36500, 44, [], [0]], ["Priya Venkataraghavan", "Jan Vikas Morcha", 52, "Post Graduate", 31800, 61200, 12900, 19, [], []], ["Selvam Arumugham", "Independent", 47, "10th Pass", 4300, 9700, 5100, 83, [2], [1, 4]]] },
  { slug: "kolkata-dakshin", name: "Kolkata Dakshin", state: "West Bengal", code: "WB", pins: ["700019", "700029", "700033"], electors: 1620000, mp: [73, 38, 133, 2], mpl: [2500, 2000, 1420],
    projects: [["Gariahat footpath & drainage revamp", "Roads", 350, "Delayed", 41], ["Tolly Nullah embankment repair", "Sanitation", 880, "In Progress", 47], ["Girls' school hostel block", "Education", 295, "Completed", 100], ["Primary health sub-centre", "Health", 215, "Sanctioned", 8]],
    promises: ["Restore Tolly Nullah embankments", "Add 2 girls' school hostels", "Set up 24x7 ambulance bays at 5 hubs", "Publish quarterly MPLADS spending online", "Pedestrianise Gariahat market hours", "Plant 50,000 trees along arterial roads"],
    cands: [["Soumitra Bhattacharyya", "Lok Samaj Party", 66, "Post Graduate", 52600, 142000, 18800, 27, [], []], ["Debjani Mukhopadhyay", "Jan Vikas Morcha", 45, "Graduate", 19700, 38400, 7700, 35, [], [3]], ["Rajib Chakrabortty", "Rashtriya Pragati Dal", 54, "Graduate Professional", 24100, 73900, 29600, 52, [0, 3], [1]]] },
  { slug: "bengaluru-south", name: "Bengaluru South", state: "Karnataka", code: "KA", pins: ["560004", "560041", "560070"], electors: 2210000, mp: [79, 49, 168, 4], mpl: [2500, 2400, 1750],
    projects: [["Jayanagar lake rejuvenation", "Water", 640, "Completed", 100], ["Flyover approach junction fix", "Roads", 720, "In Progress", 58], ["Govt PU college lab upgrade", "Education", 230, "Completed", 100], ["Solid-waste segregation units", "Sanitation", 410, "Stalled", 22]],
    promises: ["Rejuvenate 4 neighbourhood lakes", "Decentralised waste-segregation units in each ward", "Reduce junction wait time by 20%", "Free coaching hubs in government PU colleges", "Open data on every MPLADS rupee", "Last-mile feeder buses to metro stations"],
    cands: [["Naveen Gowdappa", "Jan Vikas Morcha", 42, "Graduate Professional", 88200, 156000, 24100, 71, [], []], ["Lakshmi Hegdeshwar", "Rashtriya Pragati Dal", 56, "Post Graduate", 46900, 112000, 15200, 31, [], [4]], ["Imran Pashashah", "Lok Samaj Party", 50, "12th Pass", 9200, 27800, 8400, 48, [1], [0, 2]]] },
  { slug: "jaipur", name: "Jaipur", state: "Rajasthan", code: "RJ", pins: ["302001", "302017", "302021"], electors: 2090000, mp: [84, 61, 211, 6], mpl: [2500, 2350, 2160],
    projects: [["Walled-city water pipeline", "Water", 590, "In Progress", 69], ["Tonk Road bypass lighting", "Roads", 190, "Completed", 100], ["Anganwadi centre renovation (60)", "Education", 270, "In Progress", 76], ["District hospital trauma wing", "Health", 830, "Delayed", 44]],
    promises: ["Piped water to every walled-city household", "Renovate 60 anganwadi centres", "Trauma wing at district hospital", "Solar streetlights on bypass roads", "Heritage-street vendor zoning plan", "Monthly open-house with the MP"],
    cands: [["Ramavtar Shekhawatt", "Rashtriya Pragati Dal", 63, "Graduate", 61300, 187000, 22700, 39, [], [1]], ["Sunita Rathorewal", "Jan Vikas Morcha", 48, "Post Graduate", 27400, 66800, 10300, 24, [], []], ["Bhanwar Lal Meenawat", "Lok Samaj Party", 57, "8th Pass", 12800, 41200, 17900, 58, [2], [3, 4]]] },
  { slug: "guwahati", name: "Guwahati", state: "Assam", code: "AS", pins: ["781001", "781005", "781021"], electors: 1470000, mp: [77, 35, 126, 2], mpl: [2500, 2100, 1530],
    projects: [["Bharalu river flood-control works", "Water", 910, "In Progress", 52], ["Dispur school building repair", "Education", 240, "Completed", 100], ["Beltola road drainage", "Roads", 360, "Stalled", 19], ["Urban primary health centre", "Health", 205, "Sanctioned", 12]],
    promises: ["Reduce waterlogging in 8 flood-prone wards", "Repair 30 government school buildings", "Open an urban health centre in Beltola", "Real-time flood alerts via SMS", "Bus shelters on major corridors", "Publish project progress photos monthly"],
    cands: [["Dhruba Jyoti Baruahand", "Lok Samaj Party", 55, "Graduate", 33100, 84500, 11900, 33, [], [2]], ["Anamika Choudhurian", "Jan Vikas Morcha", 41, "Post Graduate", 15600, 29300, 4100, 29, [], []], ["Pranjal Hazarikash", "Rashtriya Pragati Dal", 59, "Graduate Professional", 40800, 119000, 38200, 64, [4], [0, 1]]] },
];

const SRC = [{ label: "ECI Affidavit Portal (Form 26)", url: "https://affidavit.eci.gov.in" }, { label: "ADR / MyNeta", url: "https://myneta.info" }, { label: "Lok Sabha / Sansad", url: "https://sansad.in" }, { label: "MPLADS e-SAKSHI", url: "https://mplads.mospi.gov.in" }];

const out = { disclaimer: "Demo site: constituencies are real, but all candidate details (names, parties, assets, cases, promises) are made up for illustration. Do not treat them as fact.", sources: SRC, constituencies: [], candidates: [] };

for (const c of C) {
  const cids = [];
  c.cands.forEach((k, i) => {
    const [name, party, age, edu, mov, imm, liab, g, ser, oth] = k;
    const id = `${c.code.toLowerCase()}-${i + 1}`;
    cids.push(id);
    const net = mov + imm - liab;
    const start = net / (1 + g / 100);
    const wealth = [2019, 2020, 2021, 2022, 2023, 2024].map((y, j) => ({ year: y, netWorth: Math.round(start * Math.pow(1 + g / 100, j / 5) * (1 + ((j * 7 + i * 3) % 5 - 2) / 100)) }));
    wealth[5].netWorth = net;
    const promises = [0, 1, 2].map((p) => ({ id: `${id}-p${p + 1}`, text: c.promises[(i * 2 + p) % c.promises.length], status: STAT[(i + p * 2 + c.code.length) % 4], source: SRC[(p + i) % 4] }));
    out.candidates.push({ id, name, party, constituency: c.slug, age, education: edu, incumbent: i === 0, assets: { movable: mov, immovable: imm }, liabilities: liab, netWorth: net, assetGrowthPct: g, wealthHistory: wealth,
      cases: { serious: ser.map((s) => ({ section: SERIOUS[s][0], description: SERIOUS[s][1] })), other: oth.map((s) => ({ section: OTHER[s][0], description: OTHER[s][1] })) }, promises });
  });
  out.constituencies.push({ slug: c.slug, name: c.name, state: c.state, type: "Lok Sabha", pins: c.pins, electors: c.electors, sittingMp: { candidateId: cids[0], attendancePct: c.mp[0], debates: c.mp[1], questions: c.mp[2], privateBills: c.mp[3] },
    mplads: { allocated: c.mpl[0], released: c.mpl[1], utilized: c.mpl[2] }, projects: c.projects.map(([title, category, costLakh, status, completionPct]) => ({ title, category, costLakh, status, completionPct })), candidateIds: cids });
}
writeFileSync(new URL("../src/data/constituencies.json", import.meta.url), JSON.stringify(out, null, 2));
console.log(out.constituencies.length, "constituencies,", out.candidates.length, "candidates");
