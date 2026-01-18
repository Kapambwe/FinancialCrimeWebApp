# Lusaka City Council - Investigations.Procurements Component Sample Data

## Overview
This directory contains comprehensive sample data for the Investigations.Procurements Component Mock service. All data is specific to Lusaka City Council's procurement investigation operations with realistic Zambian anti-corruption context.

## Mock Services and JSON File Mappings

### 1. ProcurementMockService
**File:** `procurement-mock.json` (30 entries)
- **Purpose:** Procurement fraud and irregularity investigation tracking
- **Key Fields:** investigationId, procurementRef, allegation, findings, financialLoss

## Investigation Categories

### Allegation Types
1. **Conflict of Interest**
   - Undisclosed relationships between officials and contractors
   - Favoritism in bid evaluation
   - Insider information sharing

2. **Bid Rigging**
   - Collusive bidding
   - Bid rotation schemes
   - Market allocation agreements
   - Complementary bidding

3. **Inflated Prices**
   - Overpricing compared to market rates
   - Artificial cost escalation
   - Phantom costs and charges

4. **Irregular Award**
   - Non-compliance with procurement procedures
   - Bypass of competitive bidding
   - Improper single-source justification
   - Splitting of contracts to avoid thresholds

5. **Non-Compliance**
   - Failure to follow Public Procurement Act
   - Deviation from procurement regulations
   - Missing approvals or documentation

6. **Collusion**
   - Supplier cartels
   - Bid coordination among contractors
   - Price fixing arrangements

7. **Fraudulent Documents**
   - False certificates and licenses
   - Forged tax clearances
   - Fake company registration
   - Altered financial statements

## Investigation Process

### Investigation Stages
1. **Complaint/Allegation Receipt**
   - Anonymous tip-offs
   - Audit findings
   - Whistleblower reports
   - Routine compliance checks

2. **Preliminary Assessment**
   - Allegation validity check
   - Jurisdiction determination
   - Resource allocation

3. **Full Investigation**
   - Evidence collection
   - Witness interviews
   - Document review
   - Financial analysis
   - Site inspections

4. **Findings and Reporting**
   - Evidence analysis
   - Conclusion determination
   - Report compilation
   - Recommendations formulation

5. **Action and Follow-up**
   - Disciplinary proceedings
   - Contract termination
   - Criminal referral
   - Recovery of funds
   - System improvements

### Finding Classifications

**Substantiated**
- Sufficient evidence to support allegation
- Clear violation of procurement rules
- Recommendation for action

**Unsubstantiated**
- Insufficient evidence
- Allegation not proven
- No violation found

**Partially Substantiated**
- Some elements proven
- Mixed findings
- Conditional recommendations

**Under Review**
- Investigation ongoing
- Additional evidence needed
- Pending expert opinion

## Key Investigation Components

### Evidence Collection
- **Documents Reviewed:** 10-100 per case
  - Tender documents
  - Bid submissions
  - Evaluation reports
  - Contract agreements
  - Payment vouchers
  - Correspondence

- **Witnesses Interviewed:** 3-15 per case
  - Procurement officers
  - Bid committee members
  - Contractors
  - Department heads
  - Finance staff

- **Evidence Items:** 5-50 per case
  - Physical evidence
  - Digital records
  - Financial transactions
  - Communication records

### Financial Impact
- **Financial Loss:** ZMW 0 - 2,000,000 per case
  - Direct losses (overpayments)
  - Indirect losses (opportunity cost)
  - Recovery potential assessment

### Departments Investigated
- Finance
- Public Health
- Engineering
- Education
- Water & Sanitation
- Waste Management
- Planning
- Social Services
- Transport
- Parks & Recreation

## Recommendations and Actions

### Potential Recommendations
1. **Refer to Police**
   - Criminal prosecution warranted
   - Serious fraud detected
   - Corruption evidence found

2. **Disciplinary Action**
   - Internal misconduct procedures
   - Staff suspension or dismissal
   - Professional sanctions

3. **Contract Termination**
   - Material breach found
   - Non-performance issues
   - Fraudulent conduct

4. **Blacklist Contractor**
   - Debarment from future tenders
   - Industry-wide notification
   - Duration: 2-5 years typically

5. **Process Improvement**
   - System weaknesses identified
   - Control enhancement needed
   - Training requirements

6. **No Action**
   - Unsubstantiated allegations
   - Minor technical issues
   - Corrective measures already taken

## Reporting Structure

### Report Recipients
- **Town Clerk** - Internal governance
- **Anti-Corruption Commission** - Criminal matters
- **Auditor General** - Systemic issues
- **Public Procurement Authority** - Regulatory violations
- **Council Committee** - Oversight and governance

## Legal and Regulatory Framework

### Applicable Laws
- **Public Procurement Act** (No. 12 of 2008)
- **Anti-Corruption Act** (No. 3 of 2012)
- **Penal Code** (fraud provisions)
- **Public Finance Management Act**
- **Local Government Act**

### Regulatory Bodies
- **Zambia Public Procurement Authority (ZPPA)**
  - Procurement oversight
  - Compliance monitoring
  - Sanctions authority

- **Anti-Corruption Commission (ACC)**
  - Corruption investigations
  - Criminal prosecutions
  - Asset recovery

- **Office of the Auditor General**
  - Financial audits
  - Value for money audits
  - Special investigations

## Data Characteristics

### Currency
- All financial amounts in ZMW (Zambian Kwacha)

### Date Format
- ISO 8601 format: YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS

### Property Naming
- camelCase convention for all JSON properties

### Confidentiality Levels
- **Confidential:** High-sensitivity investigations
- **Restricted:** Internal use only
- **Internal:** Council staff access

### Priority Levels
- **Critical:** Immediate action required
- **High:** Significant financial impact or public interest
- **Medium:** Routine investigation priority

## Investigation Metrics

### Performance Indicators
- Average investigation duration: 30-120 days
- Document review volume: 10-100 documents
- Witness interview count: 3-15 persons
- Evidence items collected: 5-50 items
- Substantiation rate: 60-80%
- Recovery success rate: 40-70%

### Contract Values Under Investigation
- Range: ZMW 500,000 - 15,000,000
- Average: ZMW 3,500,000
- Total exposure per year: ZMW 100,000,000+

## Contractor Profiles

### Common Contractors
- ABC Construction Ltd
- XYZ Suppliers
- Premium Services Ltd
- Quality Works Ltd
- Excel Contractors

### Red Flags
- Newly registered companies winning large contracts
- Consistent lowest bids (below cost)
- Same directors across multiple bidding companies
- Pattern of contract variations
- Delayed or non-delivery

## Usage Notes

1. **Sample Data Only:** This data is for development and testing purposes
2. **Realistic Scenarios:** Based on common procurement fraud patterns in Zambia
3. **Investigation Training:** Useful for investigator training and awareness
4. **System Testing:** Comprehensive test coverage for investigation workflows
5. **Anti-Corruption Focus:** Supports transparency and accountability initiatives

## Best Practices

### Investigation Principles
- Independence and objectivity
- Thorough evidence collection
- Fair hearing for all parties
- Confidentiality protection
- Timely completion
- Clear documentation

### Whistleblower Protection
- Anonymous reporting channels
- Retaliation prevention
- Legal protection frameworks

### Preventive Measures
- Procurement training
- Internal controls strengthening
- Regular audits
- Market price benchmarking
- Competitive bidding enforcement

## File Location
```
/src/Components/CompanyApp.Components.Investigations.Procurements/wwwroot/sample-data/lusaka-city-council/
```

## Integration
This JSON file is designed to be consumed by the ProcurementMockService to provide realistic data for:
- Development and testing
- Investigation workflow demonstrations
- Anti-corruption training
- Audit and compliance testing
- Case management system testing
- Reporting and analytics

## Related Systems

### Integration Points
- Procurement Management System
- Financial Management System
- Contract Management
- Audit Management
- Document Management
- Case Management

### Data Exchange
- Investigation findings feed into audit reports
- Contractor blacklist updates to procurement system
- Financial loss data to recovery tracking
- Disciplinary outcomes to HR system

## Last Updated
2025-01-19
