---
search: false
---

# Writeup for suspected bugs in 2024 campaign

[[toc]]

## Better results when using BAL with zero cylinder

- Input: A RX with a cylinder of 0.0, a sphere of +0.75 and an additional of +1.50.
- Glasses in database: SKU 2752 (see image below), that would match quite well
- Expected result: SKU 2752 should be in the top results
- Actual result: SKU 2752 is not displayed at all. It is only displayed when searching with OS BAL enabled.

Output of REIMS2 which shows this issue:

![multifocal_search_input_no_matches](/bug_screens/multifocal_search_input_no_matches.png)

When using the BAL feature, it does suddenly work as expected.

![multifocal_bal_search_matched](/bug_screens/multifocal_bal_search_matched.png)

### Investigation

To check if this is an issue with the new REIMS2 system, we want to compare the results with the old REIMS1 system.

For that, SKU 2752 was added to REIMS1:

![reims1_adding_glass](/bug_screens/reims1_adding_glass.png)

Then we searched for the same RX in the REIMS1 system (BAL disabled). There were no results, so it does behave the same as REIMS2.

![reims1_search_no_matches](/bug_screens/reims1_search_no_matches.png)

Then we searched with BAL enabled in REIMS1. As with REIMS2, the result was found. It also has the same score as in REIMS2.

![reims1_bal_search_input](/bug_screens/reims1_bal_search_input.png)

![reims1_bal_search_matched_result_list](/bug_screens/reims1_bal_search_matched_result_list.png)

### Conclusion

This is not a bug in the new REIMS2 system. The old REIMS1 system behaves the same way.

- philscore algorithm filters by axis depending on glasses cylinder. not search input cylinder.
- since glasses cylinder is -0.5, the expected tolerance is 25. The search input axis is implicitly 0. This means axis tolerance is from 155 to 0, and from 0 to 25. The SKU 2752 has an OS axis of 151, which is not within the expected tolerance.
- The BAL feature bypasses the axis tolerance check for eye with BAL enabled. This is why the SKU 2752 is found when OS BAL is enabled.
