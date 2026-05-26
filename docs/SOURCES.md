
## Source 1 — SAP (Fuel Data)

### Where we researched this

- SAP Help Portal: https://help.sap.com/docs/SAP_ERP/f66ae60e8d2743f9a6834c09d78b1cfd/4f8a8e6ddd15ba0fe10000000a174cb4.html
- SAP transaction MB51 documentation: https://www.tcodesearch.com/sap-tcodes/search?q=MB51
- Community discussions on what sustainability teams actually export: https://community.sap.com/topics/sustainability

### What we learned

SAP has many export formats — IDocs, OData APIs, BAPI calls. But in practice, sustainability teams don't use any of those. They ask their SAP admin to run a report called **MB51** (Material Document List) and export it to Excel or CSV. That's the realistic workflow.

The MB51 export gives you:
- Which material was consumed (diesel, petrol, LPG)
- How much (quantity + unit)
- Where (plant code)
- When (posting date)
- Movement type (261 = consumed, 101 = received)

**The messy parts:**
- Dates come in European format: `01.03.2024` not `2024-03-01`
- Units are inconsistent — one plant uses Litres, another uses Gallons
- Plant codes like `IN01` mean nothing without a lookup table
- Material codes like `MAT-DIESEL` are custom per company

### Our sample data

```csv
MatDoc,DocDate,PostDate,Plant,Material,MaterialDesc,MvtType,Qty,UoM,AmountLC,Currency,CostCenter
5000012301,01.01.2024,01.01.2024,IN01,MAT-DIESEL,Diesel Fuel,261,2500.000,L,187500.00,INR,CC-OPERATIONS
5000012302,03.01.2024,03.01.2024,IN01,MAT-PETROL,Petrol,261,800.000,L,72000.00,INR,CC-FLEET
5000012303,05.01.2024,05.01.2024,IN02,MAT-DIESEL,Diesel Fuel,261,1200.000,GAL,362880.00,INR,CC-GENERATOR
5000012304,08.01.2024,08.01.2024,IN01,MAT-LPG,LPG Gas,261,150.000,KG,18000.00,INR,CC-CANTEEN
5000012305,10.01.2024,10.01.2024,IN03,MAT-NATGAS,Natural Gas,261,45.000,M3,9000.00,INR,CC-BOILER
5000012306,01.01.2024,02.01.2024,IN02,MAT-DIESEL,Diesel Fuel,101,5000.000,L,375000.00,INR,CC-OPERATIONS
```

Why it looks this way:
- IN01 uses Litres, IN02 uses Gallons — different plant configurations, both realistic
- Row 6 has DocDate Jan 1 but PostDate Jan 2 — goods arrived one day, posted next day, common in SAP
- Movement type 101 on row 6 is a receipt, not consumption — our parser handles both
- INR currency because this is an Indian client

### What would break in a real deployment

- If the client's SAP is in German, column headers come as `Buchungsdatum` instead of `PostDate`
- Real material codes are numeric like `10000023`, not `MAT-DIESEL` — we'd need a mapping table per client
- Large companies can have 50,000+ rows per quarter — no chunked processing in our prototype

---

## Source 2 — Utility Bills (Electricity)

### Where we researched this

- MSEDCL portal CSV format: https://www.mahadiscom.in/consumer/
- BSES Delhi portal: https://www.bsesdelhi.com
- Green Button standard (US): https://www.greenbuttondata.org
- Energy Star Portfolio Manager data format: https://www.energystar.gov/buildings/benchmark

### What we learned

Facilities teams don't use APIs. They log into their utility's website, go to usage history, and click download. The CSV they get has one row per billing period per meter.

The tricky part: **billing periods don't match calendar months.** A bill might cover October 2 to November 3. So you can't just say "this is October's electricity." You have to split it proportionally across months if needed.

Also one building often has multiple meters — different floors, different equipment like chillers or HVAC.

**The messy parts:**
- Billing periods start on random dates, not the 1st of the month
- One site can have 3-5 meters in the same CSV
- MSEDCL and BSES export slightly different column names for the same data

### Our sample data

```csv
account_number,meter_id,site_name,bill_start,bill_end,days,usage_kwh,peak_demand_kw,total_cost_inr,tariff_code,utility
ACC-MUM-001,MTR-001-A,Mumbai HQ - Floor 1-5,2024-01-02,2024-02-01,30,42500,185,340000,LT-COM-2,MSEDCL
ACC-MUM-001,MTR-001-B,Mumbai HQ - Floor 6-10,2024-01-02,2024-02-01,30,38200,162,305600,LT-COM-2,MSEDCL
ACC-MUM-001,MTR-001-C,Mumbai HQ - Common Areas,2024-01-02,2024-02-01,30,8900,45,71200,LT-COM-2,MSEDCL
ACC-DEL-002,MTR-002-A,Delhi Office,2024-01-05,2024-02-04,30,29100,140,232800,HT-COM-1,BSES
ACC-PUN-003,MTR-003-A,Pune Factory,2024-01-01,2024-02-01,31,185000,820,1480000,HT-IND-1,MSEDCL
ACC-PUN-003,MTR-003-B,Pune Factory - Chiller,2024-01-01,2024-02-01,31,42000,210,336000,HT-IND-1,MSEDCL
```

Why it looks this way:
- Mumbai HQ has 3 meters — floor sub-metering is standard in commercial buildings
- Delhi billing starts Jan 5, not Jan 1 — each meter has its own cycle
- Pune factory uses 185,000 kWh vs 42,500 for an office floor — manufacturing uses roughly 4x more electricity
- Two different utilities (MSEDCL and BSES) because Mumbai and Delhi are served by different providers

### What would break in a real deployment

- Different utilities name columns differently — "Units Consumed" vs "kWh Used" vs "Energy Usage"
- If a client has solar panels or RECs, their effective emission factor could be near zero — we don't handle this
- PDF bills from older utilities can't be parsed by our system at all

---

## Source 3 — Corporate Travel (Concur)

### Where we researched this

- SAP Concur developer docs: https://developer.concur.com/api-reference/expense/expense-report/v3.reports.html
- Concur Travel Request v4 API: https://developer.concur.com/api-reference/travel/itinerary-v4/v4.itinerary.html
- Navan (formerly TripActions) export format: https://help.navan.com
- DEFRA flight emission factors: https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2023

### What we learned

Companies like Concur or Navan are corporate travel platforms. Employees book flights and hotels through them. Finance teams export a monthly CSV of all travel expenses.

The export has one row per expense item — so one trip (Mumbai to London) becomes multiple rows: one for the flight out, one for the hotel, one for the flight back, maybe one for a taxi.

**The key problem with flights:** Concur gives you airport codes (BOM, LHR) but not the distance. We have to calculate it ourselves using a Haversine formula — essentially measuring the straight-line distance between two points on a globe using their coordinates.

**The messy parts:**
- Taxis and car rentals have no distance at all — just a cost
- Travel class (economy vs business) is often not filled in
- Amounts are in whatever currency the employee used — INR, USD, GBP

### Our sample data

```csv
employee_id,employee_name,trip_id,expense_type,travel_date,origin,destination,origin_iata,dest_iata,travel_class,vendor,amount,currency,hotel_nights,distance_km
EMP001,Priya Sharma,TRIP-2401-001,AIRFARE,2024-01-08,Mumbai,Delhi,BOM,DEL,ECONOMY,IndiGo,4500,INR,,1148
EMP001,Priya Sharma,TRIP-2401-001,HOTEL,2024-01-08,,,,,,The Leela Delhi,12000,INR,2,
EMP001,Priya Sharma,TRIP-2401-001,TAXI,2024-01-08,Delhi Airport,Leela Hotel,,,,,850,INR,,
EMP001,Priya Sharma,TRIP-2401-001,AIRFARE,2024-01-10,Delhi,Mumbai,DEL,BOM,ECONOMY,IndiGo,4200,INR,,1148
EMP002,Rahul Mehta,TRIP-2401-002,AIRFARE,2024-01-15,Mumbai,London,BOM,LHR,BUSINESS,Air India,145000,INR,,7192
EMP002,Rahul Mehta,TRIP-2401-002,HOTEL,2024-01-15,,,,,,Marriott London,38000,INR,3,
EMP002,Rahul Mehta,TRIP-2401-002,AIRFARE,2024-01-18,London,Mumbai,LHR,BOM,BUSINESS,Air India,138000,INR,,7192
EMP003,Aisha Khan,TRIP-2401-003,CARRENT,2024-01-20,Pune,Pune,,,,,3200,INR,,
EMP003,Aisha Khan,TRIP-2401-003,TAXI,2024-01-20,Pune Station,Office,,,,,320,INR,,
```

Why it looks this way:
- BOM-DEL distance is 1,148 km — this is the actual great-circle distance, calculated from coordinates
- BOM-LHR is 7,192 km — also calculated, realistic London flight distance
- Rahul's business class ticket is ₹1,45,000 vs Priya's economy at ₹4,500 — realistic price difference
- Taxi rows have no IATA codes and no distance — this is the real limitation we documented
- CARRENT has no distance either — we use a flat emission estimate for these

### What would break in a real deployment

- Small regional airports may not be in the airportsdata library — distance calculation fails silently
- If travel class is blank, we default to economy, which underestimates business class emissions by 2x
- Rail travel is completely missing — no TRAIN expense type in standard Concur export