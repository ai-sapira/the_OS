-- Update initiative dates to match CSV data
-- Iniciativas limpias Gonvarri.csv
-- Format: dates from DD/MM/YYYY converted to YYYY-MM-DD

-- Initiative 6: Agile pricing (01/06/2026 - 01/09/2026)
UPDATE issues SET start_date = '2026-06-01', due_date = '2026-09-01'
WHERE key = 'GON-6' AND organization_id = '01234567-8901-2345-6789-012345678901';

-- Initiative 7: GMHS's Offer automation (01/01/2026 - 01/06/2026)
UPDATE issues SET start_date = '2026-01-01', due_date = '2026-06-01'
WHERE key = 'GON-7' AND organization_id = '01234567-8901-2345-6789-012345678901';

-- Initiative 8: Contract concierge (01/01/2026 - 01/03/2026)
UPDATE issues SET start_date = '2026-01-01', due_date = '2026-03-01'
WHERE key = 'GON-8' AND organization_id = '01234567-8901-2345-6789-012345678901';

-- Initiative 10: Translator (01/01/2026 - 01/03/2026)
UPDATE issues SET start_date = '2026-01-01', due_date = '2026-03-01'
WHERE key = 'GON-10' AND organization_id = '01234567-8901-2345-6789-012345678901';

-- Initiative 11: GonvAlrri desk (01/01/2026 - 01/05/2026)
UPDATE issues SET start_date = '2026-01-01', due_date = '2026-05-01'
WHERE key = 'GON-11' AND organization_id = '01234567-8901-2345-6789-012345678901';

-- Initiative 24: Bid Crafter (01/01/2026 - 01/06/2026)
UPDATE issues SET start_date = '2026-01-01', due_date = '2026-06-01'
WHERE key = 'GON-24' AND organization_id = '01234567-8901-2345-6789-012345678901';

-- Initiative 27: Supplier negotiation cockpit (01/01/2026 - 01/06/2026)
UPDATE issues SET start_date = '2026-01-01', due_date = '2026-06-01'
WHERE key = 'GON-27' AND organization_id = '01234567-8901-2345-6789-012345678901';

-- Initiative 28: Customer Negotiation Cockpit (01/01/2026 - 01/06/2026)
UPDATE issues SET start_date = '2026-01-01', due_date = '2026-06-01'
WHERE key = 'GON-28' AND organization_id = '01234567-8901-2345-6789-012345678901';

-- Initiative 29: Supplier contract analysis (01/01/2026 - 01/03/2026)
UPDATE issues SET start_date = '2026-01-01', due_date = '2026-03-01'
WHERE key = 'GON-29' AND organization_id = '01234567-8901-2345-6789-012345678901';

-- Initiative 30: Customer contract analysis (01/01/2026 - 01/03/2026)
UPDATE issues SET start_date = '2026-01-01', due_date = '2026-03-01'
WHERE key = 'GON-30' AND organization_id = '01234567-8901-2345-6789-012345678901';

-- Initiative 36: Invoice AutoFlow (01/01/2026 - 01/04/2026)
UPDATE issues SET start_date = '2026-01-01', due_date = '2026-04-01'
WHERE key = 'GON-36' AND organization_id = '01234567-8901-2345-6789-012345678901';

-- Initiative 42: RFP QuickGen (01/01/2026 - 01/06/2026)
UPDATE issues SET start_date = '2026-01-01', due_date = '2026-06-01'
WHERE key = 'GON-42' AND organization_id = '01234567-8901-2345-6789-012345678901';

-- Initiative 47: InvoiceGenius (01/01/2026 - 01/01/2026)
UPDATE issues SET start_date = '2026-01-01', due_date = '2026-01-01'
WHERE key = 'GON-47' AND organization_id = '01234567-8901-2345-6789-012345678901';

-- Initiative 50: FraudFinder AI (01/01/2026 - 01/01/2026)
UPDATE issues SET start_date = '2026-01-01', due_date = '2026-01-01'
WHERE key = 'GON-50' AND organization_id = '01234567-8901-2345-6789-012345678901';

-- Initiative 51: ComplianceAI Mapper (01/01/2026 - 01/03/2026)
UPDATE issues SET start_date = '2026-01-01', due_date = '2026-03-01'
WHERE key = 'GON-51' AND organization_id = '01234567-8901-2345-6789-012345678901';

-- Initiative 55: Onboarding Buddy GenAI (01/01/2026 - 01/05/2026)
UPDATE issues SET start_date = '2026-01-01', due_date = '2026-05-01'
WHERE key = 'GON-55' AND organization_id = '01234567-8901-2345-6789-012345678901';

-- Initiative 56: HRChatbot GenAI (01/01/2026 - 01/05/2026)
UPDATE issues SET start_date = '2026-01-01', due_date = '2026-05-01'
WHERE key = 'GON-56' AND organization_id = '01234567-8901-2345-6789-012345678901';

-- Initiative 58: NLP HRRequest Sorter (01/01/2026 - 01/05/2026)
UPDATE issues SET start_date = '2026-01-01', due_date = '2026-05-01'
WHERE key = 'GON-58' AND organization_id = '01234567-8901-2345-6789-012345678901';

-- Initiative 59: AttritionPredictor AI (01/01/2026 - 01/05/2026)
UPDATE issues SET start_date = '2026-01-01', due_date = '2026-05-01'
WHERE key = 'GON-59' AND organization_id = '01234567-8901-2345-6789-012345678901';

-- Initiative 60: CareerCoPilot GenAI (01/01/2026 - 01/05/2026)
UPDATE issues SET start_date = '2026-01-01', due_date = '2026-05-01'
WHERE key = 'GON-60' AND organization_id = '01234567-8901-2345-6789-012345678901';

-- Initiative 64: Automated supplier inquiry handling (01/01/2026 - 01/06/2026)
UPDATE issues SET start_date = '2026-01-01', due_date = '2026-06-01'
WHERE key = 'GON-64' AND organization_id = '01234567-8901-2345-6789-012345678901';

-- Initiative 69: Accounts Receivable Collections Assistant (01/01/2026 - 01/01/2026)
UPDATE issues SET start_date = '2026-01-01', due_date = '2026-01-01'
WHERE key = 'GON-69' AND organization_id = '01234567-8901-2345-6789-012345678901';

-- Initiative 71: SmartBidder (01/01/2026 - 01/06/2026)
UPDATE issues SET start_date = '2026-01-01', due_date = '2026-06-01'
WHERE key = 'GON-71' AND organization_id = '01234567-8901-2345-6789-012345678901';

-- Initiative 72: SpendSight Analytics (01/01/2026 - 01/06/2026)
UPDATE issues SET start_date = '2026-01-01', due_date = '2026-06-01'
WHERE key = 'GON-72' AND organization_id = '01234567-8901-2345-6789-012345678901';

-- Initiative 76: OnboardEase (01/01/2026 - 01/05/2026)
UPDATE issues SET start_date = '2026-01-01', due_date = '2026-05-01'
WHERE key = 'GON-76' AND organization_id = '01234567-8901-2345-6789-012345678901';

-- Initiative 77: TalentInsight AI (01/01/2026 - 01/05/2026)
UPDATE issues SET start_date = '2026-01-01', due_date = '2026-05-01'
WHERE key = 'GON-77' AND organization_id = '01234567-8901-2345-6789-012345678901';

-- Initiative 79: ComplyStreamline (01/01/2026 - 01/03/2026)
UPDATE issues SET start_date = '2026-01-01', due_date = '2026-03-01'
WHERE key = 'GON-79' AND organization_id = '01234567-8901-2345-6789-012345678901';

-- Initiative 80: FinanceGuardian (01/01/2026 - 01/01/2026)
UPDATE issues SET start_date = '2026-01-01', due_date = '2026-01-01'
WHERE key = 'GON-80' AND organization_id = '01234567-8901-2345-6789-012345678901';

-- Initiative 81: DebtTrend AI (01/01/2026 - 01/01/2026)
UPDATE issues SET start_date = '2026-01-01', due_date = '2026-01-01'
WHERE key = 'GON-81' AND organization_id = '01234567-8901-2345-6789-012345678901';

-- Initiative 82: QueryAssist AI (01/01/2026 - 01/01/2026)
UPDATE issues SET start_date = '2026-01-01', due_date = '2026-01-01'
WHERE key = 'GON-82' AND organization_id = '01234567-8901-2345-6789-012345678901';

-- Initiative 83: CloudBill Exchange (01/01/2026 - 01/01/2026)
UPDATE issues SET start_date = '2026-01-01', due_date = '2026-01-01'
WHERE key = 'GON-83' AND organization_id = '01234567-8901-2345-6789-012345678901';

