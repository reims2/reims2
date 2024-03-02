---
search: false
---

# Investigation Report: Suspected Bugs in 2024 Campaign

[[toc]]

## Unexpected Results with Zero Cylinder Search Input

### Problem Description

- **Scenario**: A prescription (RX) with a cylinder of 0.0, a sphere of +0.75, and an additional of +1.50 was used as input.
- **Expected Result**: SKU 2752, a suitable match for the given RX, should appear in the top results.
- **Actual Result**: SKU 2752 does not appear in the results unless the BAL feature for OS eye is enabled.

Below are the screenshots demonstrating this issue:

- Without BAL enabled:

  ![multifocal_search_input_no_matches](/bug_screens/multifocal_search_input_no_matches.png)

- With BAL enabled:

  ![multifocal_bal_search_matched](/bug_screens/multifocal_bal_search_matched.png)

### Investigation Process

To determine if this is an issue specific to the new REIMS2 system, we compared the results with the old REIMS1 system.

- SKU 2752 was added to the REIMS1 system:

  ![reims1_adding_glass](/bug_screens/reims1_adding_glass.png)

- The same RX was searched in the REIMS1 system with BAL disabled. The results were consistent with REIMS2 - no matches were found.

  ![reims1_search_no_matches](/bug_screens/reims1_search_no_matches.png)

- The search was repeated with BAL enabled in REIMS1. The SKU 2752 was found, mirroring the behavior in REIMS2.

  ![reims1_bal_search_input](/bug_screens/reims1_bal_search_input.png)

  ![reims1_bal_search_matched_result_list](/bug_screens/reims1_bal_search_matched_result_list.png)

### Findings and Conclusion

The investigation revealed that this is not a bug in the new REIMS2 system. The old REIMS1 system exhibits the same behavior.

The explanation for the behaviour in REIMS1 and REIMS2 is as follows:

- The philscore algorithm filters by axis based on the glasses' cylinder, not the search input cylinder.
- Since the glasses' cylinder is -0.5, the expected tolerance is 25. The search input axis is implicitly 0. This means the axis tolerance ranges from 155 to 0, and from 0 to 25. However, SKU 2752 has an OS axis of 151, which falls outside the expected tolerance.
- The BAL feature bypasses the axis tolerance check for the eye with BAL enabled. This explains why SKU 2752 is found when OS BAL is enabled.
