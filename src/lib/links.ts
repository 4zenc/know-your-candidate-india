import type { MP } from "./types";

export const links = {
  myneta: (id: string) => `https://www.myneta.info/LokSabha2024/candidate.php?candidate_id=${id}`,
  mynetaHome: "https://www.myneta.info/LokSabha2024/",
  prs: (mp: MP) => (mp.prs ? `https://prsindia.org/mptrack/18th-lok-sabha/${mp.prs.slug}` : "https://prsindia.org/mptrack"),
  eci: "https://affidavit.eci.gov.in/",
  sansad: "https://sansad.in/ls/members",
  mplads: "https://mplads.mospi.gov.in",
  rtionline: "https://rtionline.gov.in/",
};

export const verificationLinks = (mp: MP) => [
  { label: "MyNeta / ADR — affidavit & cases", url: links.myneta(mp.id) },
  { label: "PRS MP Track — attendance & questions", url: links.prs(mp) },
  { label: "ECI Affidavit Portal", url: links.eci },
  { label: "Sansad.in — Lok Sabha members", url: links.sansad },
];
