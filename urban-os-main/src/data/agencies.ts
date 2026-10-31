export interface AgencyHelpline {
  label: string;
  number: string;
}

export interface AgencyContact {
  role: string;
  address: string;
}

export interface Agency {
  id: string;
  name: string;
  shortName: string;
  description: string;
  color: string;
  helplines: AgencyHelpline[];
  emails: AgencyContact[];
  portalUrl: string;
  formUrl: string;
}

export const AGENCIES: Agency[] = [
  {
    id: 'bbmp',
    name: 'Bruhat Bengaluru Mahanagara Palike',
    shortName: 'BBMP',
    description: 'Municipal authority for road corridors, stormwater drains, solid waste, and municipal zoning.',
    color: '#00cc66',
    helplines: [
      { label: 'Control Room 24x7', number: '1533' },
      { label: 'Central Sahaya Helpline', number: '080-22660000' },
      { label: 'WhatsApp Grievance', number: '9480685700' },
    ],
    emails: [
      { role: 'Chief Commissioner', address: 'comm@bbmp.gov.in' },
      { role: 'Chief Engineer (Roads & Infra)', address: 'eic@bbmp.gov.in' },
      { role: 'Special Commissioner (Projects)', address: 'spcomm.roads@bbmp.gov.in' },
      { role: 'Chief Engineer (SWD Drains)', address: 'ce.swd@bbmp.gov.in' },
    ],
    portalUrl: 'https://bbmp.gov.in',
    formUrl: 'https://nammabengaluru.org.in/home/department/form?displayName=BBMP',
  },
  {
    id: 'bwssb',
    name: 'Bangalore Water Supply and Sewerage Board',
    shortName: 'BWSSB',
    description: 'Statutory board for Cauvery potable water distribution, sanitary pipelines, and wastewater plants.',
    color: '#00aaff',
    helplines: [
      { label: 'Water Emergency 24x7', number: '1916' },
      { label: 'Customer Grievance Desk', number: '080-22238888' },
      { label: 'WhatsApp Help Desk', number: '8762228888' },
    ],
    emails: [
      { role: 'Chairman BWSSB', address: 'chairman@bwssb.gov.in' },
      { role: 'Engineer-in-Chief (Maintenance)', address: 'eic@bwssb.gov.in' },
      { role: 'Chief Engineer (Cauvery Project)', address: 'ce.cauvery@bwssb.gov.in' },
      { role: 'Chief Engineer (Sewerage & WWM)', address: 'ce.wwm@bwssb.gov.in' },
    ],
    portalUrl: 'https://bwssb.karnataka.gov.in',
    formUrl: 'https://bwssb.karnataka.gov.in/public-grievance',
  },
  {
    id: 'bescom',
    name: 'Bangalore Electricity Supply Company',
    shortName: 'BESCOM',
    description: 'Power distribution utility managing underground 11kV/66kV high-tension cables and transformers.',
    color: '#ff3300',
    helplines: [
      { label: 'Power Outage Emergency', number: '1912' },
      { label: 'Central Call Center', number: '080-22873333' },
      { label: 'WhatsApp Outage Reporting', number: '9483191212' },
    ],
    emails: [
      { role: 'Managing Director', address: 'md@bescom.co.in' },
      { role: 'Director (Technical & Power Distribution)', address: 'dt@bescom.co.in' },
      { role: 'Chief General Manager (Operations)', address: 'cgmop@bescom.co.in' },
      { role: 'Superintending Engineer (Electrical)', address: 'se.elec@bescom.co.in' },
    ],
    portalUrl: 'https://bescom.karnataka.gov.in',
    formUrl: 'https://bescom.karnataka.gov.in/complaints',
  },
  {
    id: 'gail',
    name: 'GAIL Gas Limited (City Gas Network)',
    shortName: 'GAIL Gas',
    description: 'Central Public Sector enterprise providing piped natural gas (PNG) and CNG pipelines in Bengaluru.',
    color: '#ff8800',
    helplines: [
      { label: 'Gas Leak Emergency 24x7', number: '18001029282' },
      { label: 'Bengaluru City Gas Control', number: '080-26590200' },
      { label: 'Toll-Free PNG Support Desk', number: '18002660099' },
    ],
    emails: [
      { role: 'Chief Executive Officer', address: 'ceo.gailgas@gail.co.in' },
      { role: 'Officer-in-Charge (Bengaluru CGD)', address: 'cgd.bengaluru@gail.co.in' },
      { role: 'DGM (HSE & Pipeline Safety)', address: 'safety.bengaluru@gail.co.in' },
      { role: 'Head (City Gas Infrastructure)', address: 'cgd-infra@gail.co.in' },
    ],
    portalUrl: 'https://gailgas.com',
    formUrl: 'https://gailgas.com/customer-care',
  },
];
