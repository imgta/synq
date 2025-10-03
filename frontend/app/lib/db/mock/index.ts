import { MOCK_COMPANIES as MOCK_COMPS, EXTENDED_MOCK_COMPANIES } from "@/lib/db/mock/companies";
import { MOCK_OPPORTUNITIES as MOCK_OPPS, EXTENDED_MOCK_OPPORTUNITIES } from "@/lib/db/mock/opportunities";
import { MOCK_PROGRAMS } from "@/lib/db/mock/programs";
import { MOCK_AWARDS } from "@/lib/db/mock/awards";

const MOCK_COMPANIES = [...MOCK_COMPS, ...EXTENDED_MOCK_COMPANIES];
const MOCK_OPPORTUNITIES = [...MOCK_OPPS, ...EXTENDED_MOCK_OPPORTUNITIES];

export { MOCK_AWARDS, MOCK_COMPANIES, MOCK_OPPORTUNITIES, MOCK_PROGRAMS };