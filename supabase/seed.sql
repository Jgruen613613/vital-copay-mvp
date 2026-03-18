-- Seed data: 5 medications
INSERT INTO medications (id, generic_name, brand_names, drug_class, route_of_administration, is_biologic, is_biosimilar) VALUES
  (1, 'adalimumab',  '["Humira","Hadlima","Hyrimoz","Cyltezo"]', 'TNF inhibitor',    'subcutaneous_injection', true,  false),
  (2, 'etanercept',  '["Enbrel","Erelzi","Eticovo"]',            'TNF inhibitor',    'subcutaneous_injection', true,  false),
  (3, 'tofacitinib', '["Xeljanz","Xeljanz XR"]',                 'JAK inhibitor',    'oral',                   false, false),
  (4, 'upadacitinib','["Rinvoq"]',                                'JAK inhibitor',    'oral',                   false, false),
  (5, 'secukinumab', '["Cosentyx"]',                              'IL-17A inhibitor', 'subcutaneous_injection', true,  false);

SELECT setval('medications_id_seq', 5);

-- Seed data: 12 programs (with updated insurance types, annual savings, likelihood)
INSERT INTO medication_assistance_programs (medication_id, program_name, program_type, eligible_insurance_types, eligibility_summary, estimated_monthly_savings, estimated_annual_savings, likelihood_can_help, fund_status) VALUES
  -- adalimumab (med 1)
  (1, 'AbbVie Complete',            'copay_card',       '["commercial"]',              'Commercially insured patients. Not for government insurance.', '$0 copay',         'Up to $20,000/yr',  '98-95%', 'open'),
  (1, 'AbbVie myAbbVie Assist',     'pap',              '["uninsured"]',               'Uninsured or income ≤400% FPL.',                              'Free medication',  'Full cost covered', '90-95%', 'open'),
  (1, 'PAN Foundation — RA',        'foundation_grant', '["medicare","dual_eligible"]', 'Medicare patients. Income ≤500% FPL.',                        'Up to $625/mo',    'Up to $7,500/yr',   '85-90%', 'waitlist'),
  -- etanercept (med 2)
  (2, 'Amgen FIRST STEP',           'copay_card',       '["commercial"]',              'Commercially insured. Not for government insurance.',          '$0 copay',         'Up to $12,000/yr',  '98-95%', 'open'),
  (2, 'Amgen Safety Net Foundation', 'pap',              '["uninsured"]',               'Uninsured or underinsured.',                                  'Free medication',  'Full cost covered', '90-95%', 'open'),
  -- tofacitinib (med 3)
  (3, 'Pfizer enCompass',            'copay_card',       '["commercial"]',              'Commercially insured.',                                       '$0 copay',         'Up to $15,000/yr',  '98-95%', 'open'),
  (3, 'Pfizer RxPathways',           'pap',              '["uninsured"]',               'Uninsured or income ≤400% FPL.',                              'Free medication',  'Full cost covered', '90-95%', 'open'),
  -- upadacitinib (med 4)
  (4, 'AbbVie Complete (Rinvoq)',    'copay_card',       '["commercial"]',              'Commercially insured.',                                       '$0 copay',         'Up to $16,000/yr',  '98-95%', 'open'),
  (4, 'HealthWell Foundation — RA',  'foundation_grant', '["medicare","dual_eligible"]', 'Medicare patients. Income ≤500% FPL.',                        'Up to $833/mo',    'Up to $10,000/yr',  '85-90%', 'open'),
  -- secukinumab (med 5)
  (5, 'Novartis CoPay Card',         'copay_card',       '["commercial"]',              'Commercially insured.',                                       '$0 copay',         'Up to $16,000/yr',  '98-95%', 'open'),
  (5, 'Novartis PAP',                'pap',              '["uninsured"]',               'Uninsured or income ≤400% FPL.',                              'Free medication',  'Full cost covered', '90-95%', 'open'),
  (5, 'CARF — Autoimmune',           'foundation_grant', '["medicare","dual_eligible"]', 'Medicare. Currently closed to new enrollees.',                 'Up to $750/mo',    'Up to $9,000/yr',   '85-90%', 'closed');
