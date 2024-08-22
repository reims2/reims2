---
search: false
---

# Suspected Bugs in 2024 Campaign

[[toc]]

## No results with zero cylinder search input

> [!NOTE]
> This bug was referred to in the mails as `Ex1-SphBi` and also all the examples in the mail from Scott.

### Problem Description

I reproduced this with a search, that has the same parameters as the one from the mail. The search was done with the BAL feature disabled.

- **Scenario**: A multifocal prescription with a cylinder of 0.0, a sphere of +0.75, and an additional of +1.50 was used as input for OD and OS (same RX for both eyes).
- **Expected Result**: SKU 2752, a suitable match for the given RX, should appear in the top results.
- **Actual Result**: SKU 2752 does not appear in the results unless the BAL feature for OS eye is enabled.

Below are the screenshots demonstrating this issue:

- Without BAL enabled:

  ![multifocal_search_input_no_matches](/bug_screens/multifocal_search_input_no_matches.png)

- With BAL enabled:

  ![multifocal_bal_search_matched](/bug_screens/multifocal_bal_search_matched.png)

### Investigation Process

To determine if this is an issue specific to new REIMS2, we compared the results with the old REIMS1.

- SKU 2752 was added to the REIMS1 system:

  ![reims1_adding_glass](/bug_screens/reims1_adding_glass.png)

- The same RX was searched in the REIMS1 system with BAL disabled. The results were consistent with REIMS2 - no matches were found.

  ![reims1_search_no_matches](/bug_screens/reims1_search_no_matches.png)

- The search was repeated with BAL enabled in REIMS1. The SKU 2752 was found, mirroring the behavior in REIMS2.

  ![reims1_bal_search_input](/bug_screens/reims1_bal_search_input.png)

  ![reims1_bal_search_matched_result_list](/bug_screens/reims1_bal_search_matched_result_list.png)

### Findings

The investigation showed that this is not a new issue specific to REIMS2. The behavior is consistent with the old REIMS1.

Here's why the glasses are not found without BAL with the algorithm:

- The PhilScore algorithm filters by axis tolerance based on the glasses' cylinder, not the search input cylinder.
- Given the glasses' OS cylinder of -0.5, the expected tolerance is 25. With the search input axis of 0 (implicitly since search cylinder is 0), the axis tolerance ranges from 155 to 0, and from 0 to 25. However, SKU 2752 has an OS axis of 151, which falls outside the expected tolerance.
- The BAL feature bypasses the axis tolerance check for the eye which has BAL enabled, which is why SKU 2752 is found when OS BAL is enabled.

This is also confirmed by the fact that screenshots `Ex1-SphBi2` (OS BAL) and `Ex1-SphBi3` (OD BAL) from Shanti have different glasses as the results. This would only be a bug if both would have same pairs of glasses as the result.

> [!NOTE]
> Scott also said that "if a similar prescription is entered but it even has a little bit of Cyl, the search function seems to work".
> I'm not sure why this is the case. According to the findings, this bug could also happen for prescriptions with a non-zero cylinder. I would need more concrete examples to investigate this further.

### Implications and Next Steps

The next steps involve deciding whether this behavior is intended or requires modification.

- If the behavior is not intended, several solutions are available:
  - Implement a special case for a search input cylinder of 0.0, allowing all (or a wider) axis tolerance, independent of the glasses' cylinder.
  - Modify the algorithm to use the search input cylinder (instead of the actual glasses cylinder) for the axis tolerance calculation. (This may not be advisable.)
  - Refer to the [Matching Algorithm -> Potential Improvements](/philscore.md#potential-improvements) section for ideas on how to adjust the algorithm so that axis influences the score more, allowing for less strict filtering by axis.

## Better results when searching separately for OD and OS

This is really similar to the previous bug, but I'm investigating it separately, because it also occurs with a non zero cylinder.

> [!NOTE]
> This bug was referred to in the mails as `Ex2-SphBi`.

### Problem Description

- **Scenario**: OD: Sphere +0.00, Cylinder -1.00, Axis 005; OS: Sphere +0.00, Cylinder -1.00, Axis 175
- **Expected Result**: There should be some results
- **Actual Result**: No results are found, unless the BAL feature is enabled for the OS or OD eye. Then we can see **different** results for OD and OS.

Below are the screenshots demonstrating this issue:

- Without BAL enabled:

  ![Ex2-SphBi1](/bug_screens/Ex2-SphBi1.png)

- With OS BAL enabled:

  ![Ex2-SphBi2](/bug_screens/Ex2-SphBi2.png)

- With OD BAL enabled:

  ![Ex2-SphBi3](/bug_screens/Ex2-SphBi3.png)

### Investigation Process

Reproducing this in REIMS1.

1. Adding glasses to REIMS1, we use SKU 5976 from the image above.

   ![](/bug_screens/2_reims1_adding_glass.png)

2. Then we search for the glasses with the same query as in the mail (first, without BAL enabled). The results are consistent with REIMS2 - no matches are found.

   ![](/bug_screens/2_reims1_search_no_matches.png)

3. We repeat the search with BAL enabled for the OS eye. The SKU 5976 is found, mirroring the behavior in REIMS2. The result also has the same PhilScore.

   ![](/bug_screens/2_reims1_bal_search_matched_result_list.png)

### Findings

Like before, the issue is not specific to REIMS2. The behavior is consistent with the old REIMS1. Therefore the same conclusions apply.
