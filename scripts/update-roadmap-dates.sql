-- ============================================================
-- ACTUALIZACIÓN DE FECHAS PARA ROADMAP DE GONVARRI
-- ============================================================
-- 
-- Estrategia de distribución:
-- - Q1 2025 (Enero-Marzo): Proyectos críticos de Finance e Invoicing
-- - Q2 2025 (Abril-Junio): Proyectos de HR y Legal
-- - Q3 2025 (Julio-Sept): Proyectos de Procurement y Sales
-- - Q4 2025 (Oct-Dic): Proyectos de Upskilling y Analytics
--
-- ============================================================

-- ====================
-- TRIMESTRE 1 (Q1 2025) - Finance & Invoicing Focus
-- ====================

-- Proyecto: Invoicing (CRÍTICO - En progreso)
UPDATE projects 
SET 
  start_date = '2025-01-06',
  end_date = '2025-03-31',
  status = 'in_progress',
  description = 'Critical finance automation initiatives'
WHERE name = 'Invoicing';

-- Issues de Invoicing distribuidos en Q1
UPDATE issues SET 
  start_date = '2025-01-06',
  due_date = '2025-01-24',
  state = 'in_progress',
  priority = 'P0'
WHERE key = 'GON-50'; -- FraudFinder AI

UPDATE issues SET 
  start_date = '2025-01-13',
  due_date = '2025-01-31',
  state = 'todo',
  priority = 'P0'
WHERE key = 'GON-36'; -- Invoice AutoFlow

UPDATE issues SET 
  start_date = '2025-02-03',
  due_date = '2025-02-28',
  state = 'todo',
  priority = 'P1'
WHERE key = 'GON-47'; -- InvoiceGenius

UPDATE issues SET 
  start_date = '2025-02-10',
  due_date = '2025-03-14',
  state = 'todo',
  priority = 'P1'
WHERE key = 'GON-69'; -- Accounts Receivable Collections

UPDATE issues SET 
  start_date = '2025-03-03',
  due_date = '2025-03-28',
  state = 'todo',
  priority = 'P1'
WHERE key = 'GON-80'; -- FinanceGuardian

UPDATE issues SET 
  start_date = '2025-03-10',
  due_date = '2025-03-31',
  state = 'todo',
  priority = 'P2'
WHERE key = 'GON-81'; -- DebtTrend AI

-- Proyecto: Pricing
UPDATE projects 
SET 
  start_date = '2025-01-20',
  end_date = '2025-03-14',
  status = 'planned',
  description = 'AI-powered pricing optimization'
WHERE name = 'Pricing';

UPDATE issues SET 
  start_date = '2025-01-20',
  due_date = '2025-03-14',
  state = 'todo',
  priority = 'P1'
WHERE key = 'GON-6'; -- Agile pricing

-- ====================
-- TRIMESTRE 2 (Q2 2025) - HR & Legal Focus
-- ====================

-- Proyecto: NPS (Employee Experience)
UPDATE projects 
SET 
  start_date = '2025-04-01',
  end_date = '2025-06-30',
  status = 'planned',
  description = 'Employee satisfaction and engagement initiatives'
WHERE name = 'NPS';

UPDATE issues SET 
  start_date = '2025-04-07',
  due_date = '2025-04-25',
  state = 'triage',
  priority = 'P1'
WHERE key = 'GON-11'; -- GonvAlrri desk

UPDATE issues SET 
  start_date = '2025-04-14',
  due_date = '2025-05-09',
  state = 'triage',
  priority = 'P2'
WHERE key = 'GON-55'; -- Onboarding Buddy

UPDATE issues SET 
  start_date = '2025-05-12',
  due_date = '2025-06-06',
  state = 'triage',
  priority = 'P2'
WHERE key = 'GON-56'; -- HRChatbot

UPDATE issues SET 
  start_date = '2025-06-02',
  due_date = '2025-06-27',
  state = 'triage',
  priority = 'P2'
WHERE key = 'GON-76'; -- OnboardEase

UPDATE issues SET 
  start_date = '2025-05-05',
  due_date = '2025-05-30',
  state = 'triage',
  priority = 'P2'
WHERE key = 'GON-93'; -- SentimentScraper

-- Proyecto: Compliance (Legal)
UPDATE projects 
SET 
  start_date = '2025-04-14',
  end_date = '2025-06-20',
  status = 'planned',
  description = 'Regulatory compliance and risk management'
WHERE name = 'Compliance';

UPDATE issues SET 
  start_date = '2025-04-14',
  due_date = '2025-05-30',
  state = 'triage',
  priority = 'P0'
WHERE key = 'GON-51'; -- ComplianceAI Mapper

UPDATE issues SET 
  start_date = '2025-05-12',
  due_date = '2025-06-20',
  state = 'triage',
  priority = 'P1'
WHERE key = 'GON-79'; -- ComplyStreamline

-- Proyecto: Advisory (Legal)
UPDATE projects 
SET 
  start_date = '2025-05-05',
  end_date = '2025-06-27',
  status = 'planned',
  description = 'Legal advisory and contract management'
WHERE name = 'Advisory';

UPDATE issues SET 
  start_date = '2025-05-05',
  due_date = '2025-05-23',
  state = 'triage',
  priority = 'P2'
WHERE key = 'GON-8'; -- Contract concierge

UPDATE issues SET 
  start_date = '2025-05-26',
  due_date = '2025-06-13',
  state = 'triage',
  priority = 'P2'
WHERE key = 'GON-29'; -- Supplier contract analysis

UPDATE issues SET 
  start_date = '2025-06-09',
  due_date = '2025-06-27',
  state = 'triage',
  priority = 'P2'
WHERE key = 'GON-30'; -- Customer contract analysis

-- ====================
-- TRIMESTRE 3 (Q3 2025) - Procurement & Sales Focus
-- ====================

-- Proyecto: Negotiation (Procurement)
UPDATE projects 
SET 
  start_date = '2025-07-07',
  end_date = '2025-09-26',
  status = 'planned',
  description = 'Intelligent negotiation and trading tools'
WHERE name = 'Negotiation';

UPDATE issues SET 
  start_date = '2025-07-07',
  due_date = '2025-08-01',
  state = 'triage',
  priority = 'P1'
WHERE key = 'GON-27'; -- Supplier negotiation cockpit

UPDATE issues SET 
  start_date = '2025-08-11',
  due_date = '2025-09-05',
  state = 'triage',
  priority = 'P1'
WHERE key = 'GON-71'; -- SmartBidder

-- Proyecto: Processing (Sales)
UPDATE projects 
SET 
  start_date = '2025-07-14',
  end_date = '2025-09-30',
  status = 'planned',
  description = 'Sales process automation and optimization'
WHERE name = 'Processing';

UPDATE issues SET 
  start_date = '2025-07-14',
  due_date = '2025-08-08',
  state = 'triage',
  priority = 'P2'
WHERE key = 'GON-7'; -- GMHS Offer automation

UPDATE issues SET 
  start_date = '2025-08-04',
  due_date = '2025-08-29',
  state = 'triage',
  priority = 'P1'
WHERE key = 'GON-24'; -- Bid Crafter

UPDATE issues SET 
  start_date = '2025-09-01',
  due_date = '2025-09-26',
  state = 'triage',
  priority = 'P1'
WHERE key = 'GON-28'; -- Customer Negotiation Cockpit

-- Proyecto: Operations (Procurement)
UPDATE projects 
SET 
  start_date = '2025-08-04',
  end_date = '2025-09-19',
  status = 'planned',
  description = 'Procurement operations automation'
WHERE name = 'Operations';

UPDATE issues SET 
  start_date = '2025-08-04',
  due_date = '2025-09-19',
  state = 'triage',
  priority = 'P2'
WHERE key = 'GON-64'; -- Automated supplier inquiry

-- ====================
-- TRIMESTRE 4 (Q4 2025) - Analytics & Development
-- ====================

-- Proyecto: Upskilling (HR Development)
UPDATE projects 
SET 
  start_date = '2025-10-06',
  end_date = '2025-12-19',
  status = 'planned',
  description = 'Employee development and career growth'
WHERE name = 'Upskilling';

UPDATE issues SET 
  start_date = '2025-10-06',
  due_date = '2025-11-14',
  state = 'triage',
  priority = 'P2'
WHERE key = 'GON-60'; -- CareerCoPilot

UPDATE issues SET 
  start_date = '2025-11-03',
  due_date = '2025-12-19',
  state = 'triage',
  priority = 'P2'
WHERE key = 'GON-94'; -- PathFinder

-- Proyecto: Reporting (Analytics)
UPDATE projects 
SET 
  start_date = '2025-10-13',
  end_date = '2025-12-12',
  status = 'planned',
  description = 'Business intelligence and analytics'
WHERE name = 'Reporting';

UPDATE issues SET 
  start_date = '2025-10-13',
  due_date = '2025-11-21',
  state = 'triage',
  priority = 'P1'
WHERE key = 'GON-77'; -- TalentInsight AI

UPDATE issues SET 
  start_date = '2025-10-20',
  due_date = '2025-11-28',
  state = 'triage',
  priority = 'P2'
WHERE key = 'GON-72'; -- SpendSight Analytics

UPDATE issues SET 
  start_date = '2025-11-10',
  due_date = '2025-12-12',
  state = 'triage',
  priority = 'P2'
WHERE key = 'GON-92'; -- TalentInsight AI (duplicate)

-- Proyecto: Retention (HR)
UPDATE projects 
SET 
  start_date = '2025-11-03',
  end_date = '2025-12-19',
  status = 'planned',
  description = 'Employee retention initiatives'
WHERE name = 'Retention';

UPDATE issues SET 
  start_date = '2025-11-03',
  due_date = '2025-12-19',
  state = 'triage',
  priority = 'P1'
WHERE key = 'GON-59'; -- AttritionPredictor

-- ====================
-- CONTINUOUS / CROSS-CUTTING
-- ====================

-- Proyecto: Accounting (Ongoing)
UPDATE projects 
SET 
  start_date = '2025-02-03',
  end_date = '2025-04-25',
  status = 'planned',
  description = 'Financial accounting automation'
WHERE name = 'Accounting';

UPDATE issues SET 
  start_date = '2025-02-17',
  due_date = '2025-03-21',
  state = 'triage',
  priority = 'P2'
WHERE key = 'GON-82'; -- QueryAssist AI

UPDATE issues SET 
  start_date = '2025-03-10',
  due_date = '2025-04-11',
  state = 'triage',
  priority = 'P2'
WHERE key = 'GON-83'; -- CloudBill Exchange

UPDATE issues SET 
  start_date = '2025-03-24',
  due_date = '2025-04-25',
  state = 'triage',
  priority = 'P2'
WHERE key = 'GON-87'; -- InvoiceAccelerator

UPDATE issues SET 
  start_date = '2025-04-07',
  due_date = '2025-05-02',
  state = 'triage',
  priority = 'P2'
WHERE key = 'GON-90'; -- FinConsolidate

-- Proyecto: Outbound (Procurement)
UPDATE projects 
SET 
  start_date = '2025-06-02',
  end_date = '2025-07-11',
  status = 'planned',
  description = 'Outbound procurement processes'
WHERE name = 'Outbound';

UPDATE issues SET 
  start_date = '2025-06-02',
  due_date = '2025-07-11',
  state = 'triage',
  priority = 'P2'
WHERE key = 'GON-42'; -- RFP QuickGen

-- Issue sin proyecto específico (All)
UPDATE issues SET 
  start_date = '2025-01-27',
  due_date = '2025-02-14',
  state = 'triage',
  priority = 'P3'
WHERE key = 'GON-10'; -- Translator (herramienta general)

UPDATE issues SET 
  start_date = '2025-05-19',
  due_date = '2025-06-06',
  state = 'triage',
  priority = 'P2'
WHERE key = 'GON-58'; -- NLP HRRequest Sorter
