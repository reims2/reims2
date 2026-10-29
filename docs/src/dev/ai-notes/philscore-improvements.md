# PhilScore improvement ideas

A literature review on matching donated glasses to a prescription, and proposals for changing the
matching algorithm based on it. It builds on the [PhilScore deep dive](/dev/ai-notes/philscore-deep-dive),
which explains the current rules. Nothing here is implemented. Every proposal breaks REIMS1 parity on
purpose, so each would join the deliberate differences that [Matching Algorithm](/philscore) lists,
ideally with sign-off from PVH optometrists.

## Summary

- The only published formula for grading donated glasses is Arnold 2021, fitted on 8 to 10 people and
  never tested on dispensing outcomes. REIMS1 (in use since 1996), ReSpectacle and WinGlasses don't
  publish theirs. What counts as "close enough" has to come from studies of ready-made glasses and of
  blur.
- That evidence backs the general shape of PhilScore but disagrees in three places:
  - **Axis is free in the score.** A lens 10 degrees off at -1.50 cylinder scores 0.003, but leaves as
    much blur as a sphere 0.25 to 0.5 D off.
  - **Cylinder may be too cheap.** Per diopter of blur, two acuity studies with induced cylinder find
    astigmatism costs twice as much as defocus, while blur-limit studies, optics and studies of real
    cylinder errors find the two about equal. PhilScore weighs it equally at best, and patients often
    dislike dropped cylinder (Reddy 2017).
  - **Asymmetry follows age, not sphere sign.** Too much minus hurts every presbyope, not only hyperopes.
- The biggest proposal deletes code: one weighted power-vector distance instead of the bonus rules.

## Literature

### Recycled glasses programs

| Source                         | Finding                                                                                                                                                                                                                                                                   |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ramke 2006, Tuvalu             | 13 % of 102 donated pairs were usable. Pairs with more than 1.00 D cylinder or 0.50 D anisometropia were excluded.                                                                                                                                                        |
| Wilson 2012                    | 7 % of 275 donated pairs were usable, at US$20.49 per delivered pair, twice the cost of ready-made glasses.                                                                                                                                                               |
| Wan 2015, Timor-Leste          | 29 of 200 prescriptions (14.5 %) matched at least one of 1,854 donated pairs, but a match had to be near exact: 0.125 D in sphere and cylinder, axis within 5 degrees, PD within 3 mm.                                                                                    |
| Pearce 2014, systematic review | No outcome study of recycled glasses met the inclusion criteria.                                                                                                                                                                                                          |
| IAPB 2014 position paper       | Advises against recycled glasses, partly because sphere, cylinder, axis and lens centration make matching hard.                                                                                                                                                           |
| REIMS1, VOSH and CVDW 2004     | Matches on spherical equivalents and axis tolerances. Built once the hand-sorted stock reached about 10,000 pairs (1995), in use from 1996, later also at other VOSH chapters.                                                                                            |
| ReSpectacle, 2011              | Shows a percentage: green from 90 %, yellow 80 to 90 %, red 70 to 80 %. Formula unpublished.                                                                                                                                                                              |
| WinGlasses, Huang 2021         | Matches on spherical equivalent and axis. Proprietary, behind a network of 10 clinics in Mexico, the US and Haiti. Optimizes one value for both eyes, which offered pairs that worsened the weaker eye.                                                                   |
| Arnold 2021, two papers        | A, B and C grades for 1, 3 and 6 lines of acuity lost. The astigmatism allowance grows with the Rx cylinder and is 1.6 times larger for cylinder power than for axis errors, the over-minus allowance shrinks with age, PD and anisometropia graded too. Free Excel tool. |
| VOSH Southeast field guide     | Axis within 5 to 10 degrees, lens cylinder not above the Rx cylinder, aim for 20/40.                                                                                                                                                                                      |

### Ready-made glasses: what can be left out

Ready-made glasses have no cylinder and the same sphere in both eyes, so trials of them show what
patients tolerate.

| Source                  | Finding                                                                                                                                                                                                                                                                                 |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brady 2012, 363 adults  | Glasses at the SE of the eye with less error satisfied about as well as custom ones. Patients with more than 2.00 D cylinder gained less.                                                                                                                                               |
| Zeng 2009, children     | Excluded 2.00 D cylinder or more, myopic anisometropia of 2 D or more and hyperopic anisometropia of 1 D or more.                                                                                                                                                                       |
| Morjaria 2017, children | Eligible with anisometropia below 1.0 D and SE acuity within one line of full correction. Wear rates matched custom glasses.                                                                                                                                                            |
| Reddy 2017, age 41 mean | Side by side with full correction, 100 % were comfortable with SE for 0.25 D cylinder, 43 % for 0.50, 26 % for 0.75 and 19 % for 1.00. Acuity fell by nothing at 0.25 D, by more than a line at 1.00 D and by more than two lines beyond. None of those given SE glasses returned them. |
| du Toit 2007            | Wearers tolerate up to 0.5 prism diopters vertical and 1.0 horizontal induced prism. Optical centre mismatch rarely matters up to +-1.50 D.                                                                                                                                             |

### What each error costs

| Source                           | Finding                                                                                                                                                                                                                                                                                                                                                             |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Thibos 1997, Thibos 2001         | Power vectors (M, J0, J45). Their length B measures overall blur. In RMS wavefront error, J counts 1.41 times as much as M.                                                                                                                                                                                                                                         |
| Raasch 1995, Blendowske 2015     | One combined dioptric distance predicts acuity for mixed sphere and cylinder errors. Blendowske: relative acuity `1 / (1 + B^2)`, fitted to pooled sphere and cylinder data with no extra weight on J.                                                                                                                                                              |
| Atchison 2005                    | Blur becomes noticeable at about 0.3 D, troublesome at 1.6 to 1.8 times that, objectionable at 2.1 to 2.5 times. Larger letters raise all three.                                                                                                                                                                                                                    |
| Atchison 2009, Guo 2010          | Blur limits for crossed cylinders are about 90 % of those for defocus, for plain cylinders 30 to 50 % higher, as blur strength predicts. Per unit of B, astigmatism and defocus are about equal.                                                                                                                                                                    |
| Atchison 2011, Mathur 2015       | Acuity drops 0.33 logMAR per diopter of induced crossed-cylinder blur strength, against 0.18 for defocus. Only 8 and 22 subjects. Atchison 2011 went up to 0.375 D and used eye drops (cycloplegia) only for the defocus runs, a confound the authors name. Mathur 2015 used them throughout, went up to 0.5 D and found no age effect between 23 and 57-year-olds. |
| Kobashi 2012, Wolffsohn 2011     | Some axes hurt more: oblique in Kobashi, 45 and 180 more than 90 in Wolffsohn. Guo 2010 puts the axis effect at about 20 %, Remón 2017 found none.                                                                                                                                                                                                                  |
| Remón 2017, Weisensee 2026       | Per unit of blur strength, mixed astigmatism (what an exact-SE lens leaves) costs about as much acuity as defocus, simple astigmatism (one focal line on the retina) less. Remón induced it with lenses in young eyes, Weisensee measured real leftover cylinder in 75 eyes after cataract surgery, 0.25 logMAR per diopter.                                        |
| Ohlendorf 2011                   | Real astigmatic lenses cost about half the acuity of the same astigmatism simulated on screen.                                                                                                                                                                                                                                                                      |
| Vinas 2013                       | Astigmats lose less acuity to astigmatism along their own axis, even after 6 months of full correction.                                                                                                                                                                                                                                                             |
| Rosenfield 1995, Bullimore 1998  | A repeated refraction varies by +-0.27 D with the same examiner and by about +-0.8 D in SE between two clinicians, 95 % limits.                                                                                                                                                                                                                                     |
| Joseph 2021, 400 adults          | Glasses from a handheld autorefractor were liked as much as glasses from subjective refraction, with SE limits of -0.68 to +0.83 D.                                                                                                                                                                                                                                 |
| Skov 2026, review                | Induced anisometropia just under 1 D is well tolerated.                                                                                                                                                                                                                                                                                                             |
| Burge 2019, Rodriguez-Lopez 2026 | Different blur in the two eyes causes motion illusions, visible for some people. Shown for monovision, which sets the eyes 1 D or more apart.                                                                                                                                                                                                                       |
| Guyton 1977                      | Cylinder corrections distort space, mostly binocularly. Less cylinder means less distortion.                                                                                                                                                                                                                                                                        |
| Pointer 1995                     | The add people need rises steeply from the early 40s, and slower after the mid 50s.                                                                                                                                                                                                                                                                                 |

## Where PhilScore disagrees

Rx `-1.50 -1.50 x 90`, scored with a Python port of `calcSingleEyePhilscore` that reproduces the deep
dive's table. B is the Thibos blur strength of the difference. Weighted B counts J twice
(`sqrt(dM^2 + 4 * (dJ0^2 + dJ45^2))`), the upper end of the evidence (Atchison 2011, Mathur 2015).

| Lens                                           | PhilScore | B    | Weighted B |
| ---------------------------------------------- | --------- | ---- | ---------- |
| `-1.75 -1.50 x 90`, sphere off 0.25            | 0.25      | 0.25 | 0.25       |
| `-1.50 -1.25 x 90`, cylinder off 0.25          | 0.13      | 0.18 | 0.28       |
| `-1.75 -1.00 x 90`, SE with 0.50 D cyl dropped | 0.25      | 0.25 | 0.50       |
| `-2.00 -0.50 x 90`, SE with 1.00 D cyl dropped | 1.00      | 0.50 | 1.00       |
| `-1.50 -1.50 x 80`, axis 10 degrees off        | 0.003     | 0.26 | 0.52       |

- **Axis.** The last lens passes the filter and ranks first, though it leaves 0.52 D of astigmatism. The
  score caps axis at 0.025 and the filter only looks at the lens cylinder.
- **Two budgets for one error.** Dropping cylinder and rotating the axis both leave astigmatism (`dJ`). The
  axis table caps rotation at 0.3 to 1.0 D of residual, about 0.5 in the common range. The SE candidates
  let a lens drop up to 2.00 D of cylinder: Rx `-2.00 -2.00` matches a `-2.75` sphere.
- **SE swaps.** Dropping 0.50 D of cylinder costs as much as a 0.25 sphere error. That's what blur
  strength says too, but one acuity study puts it at 0.50, and only 43 % in Reddy 2017 were comfortable
  with it.
- **Asymmetry.** The hyperope penalty keys on sphere and sphere sign. For Rx `+2.00 -1.00`, the exact-SE
  lens `+1.75 -0.50` scores 0.45, worse than the over-plus `+2.25 -1.00` at 0.25.
- **False precision.** Tie-break terms of 0.01 to 0.05 decide the order, while refractions repeat only to
  +-0.25 D or worse.
- **Eyes alone.** Errors of -0.25 in one eye and +0.25 in the other tie with -0.25 in both, though the
  first adds 0.50 D of anisometropia.
- **Add.** For Rx `+1.00 add +2.50`, lens `+1.00 add +2.00` scores 0.05 although near power is 0.50 off.
  Lens `+1.25 add +2.25` has exact near power and scores 0.275.

## Proposals

Roughly from smallest to biggest change.

| #   | Proposal                       | Evidence            | Effort               | New data     |
| --- | ------------------------------ | ------------------- | -------------------- | ------------ |
| 1   | Axis error in the score        | strong              | small                | no           |
| 2   | One residual-astigmatism limit | strong              | small                | no           |
| 3   | Quality tiers                  | moderate            | small, UI            | no           |
| 4   | Too much minus, by age         | moderate            | small                | optional age |
| 5   | Binocular balance              | moderate            | small                | no           |
| 6   | Near power for multifocals     | clinical call       | small                | no           |
| 7   | Weighted power-vector score    | strong, weight open | medium, deletes code | no           |
| 8   | Never return nothing           | precedent           | medium, UI           | no           |
| 9   | Store the Rx on dispense       | enables evaluation  | small                | yes          |
| 10  | PD against optical centres     | moderate            | medium               | yes          |
| 11  | Spare scarce pairs             | weak                | large                | no           |

### 1. Axis error in the score

Replace `axisDiff / 3600` with the residual astigmatism `|dJ|` from power vectors, a few lines of trig.
Zero cylinder then needs no special case, since its J is 0 whatever the stored axis, so the axis term on
spherical lenses and zero-cylinder Rx goes away. Works alone, with the rest of PhilScore unchanged.

### 2. One residual-astigmatism limit

Filter on SE (`|dM|` within the tolerance) and on residual astigmatism (`2 * |dJ|` below a budget),
instead of the axis table and the SE candidate windows. Rotation and dropped cylinder then share one
budget. Ready-made trials accept 1 to 2 D, Ramke 2006 used 1 D. Pick the value by replaying past searches so the match rate stays about where it is.

### 3. Quality tiers

Show three or four bands instead of a decimal, cut at the blur limits of Atchison 2005: below 0.3 D
equivalent blur hardly noticeable, then noticeable, troublesome and poor. ReSpectacle does the same with
colours, Arnold 2021 with A, B and C. Blendowske 2015 turns each cut into acuity: 0.25 D keeps 94 % of
best acuity, 0.5 D 80 %, 1 D 50 %. Within a band, staff can pick by frame size and looks, which matters: IAPB 2014 names poor fit
and dated looks as reasons people reject donated glasses. This replaces the percentage idea in
[Matching Algorithm](/philscore#in-general).

### 4. Too much minus, by age

Standard refraction gives the most plus that still gives best acuity. A young patient focuses through
extra minus, a presbyope can't, so extra minus blurs every distance. Penalize a lens whose SE is more
minus than the Rx SE, for multifocal searches and for single vision patients over about 45. Using SE
instead of sphere stops the penalty from hitting exact-SE swaps. An optional age field would replace the
cutoff with a scale, for example from Hofstetter's minimum accommodation of `15 - 0.25 * age` D.

### 5. Binocular balance

Score the difference between the eyes' SE errors (`|dM_od - dM_os|`): free up to 0.25, penalized from
0.50, filtered from 1.00 D, the cutoff most ready-made trials use. For multifocals, extra vertical power
difference between the lenses causes vertical prism at reading height (Prentice: about 1 prism diopter per
diopter at 1 cm below centre), and du Toit 2007 puts the limit at 0.5.

### 6. Near power for multifocals

Score distance (`S`) and near (`S + add`) errors instead of `add / 10`. Too little add pushes reading
farther out (+2.00 reads at 50 cm, +2.50 at 40 cm), too much narrows the range, so under-add should cost
more. The weight is a clinical decision for PVH optometrists.

### 7. Weighted power-vector score

Per eye, `sqrt(dM^2 + w^2 * |dJ|^2)` plus the asymmetry of 4, then 5 and 6 on top. `w` sits between 1
(optics, blur limits, Blendowske 2015) and 2 (acuity at small blur, Atchison 2011, Arnold 2021), an open
question for optometrists. Arnold 2021 lets the allowance grow with the Rx cylinder. This replaces `calcInitialDiffScore`'s weights,
the three exclusive rules, the SE candidates and the axis table. PhilScore already ranks like plain B
(Kendall tau 0.89 in the deep dive), so most rankings stay. The changes land where the literature
disagrees: axis, SE swaps and plus prescriptions. Extra weight on oblique J45 is possible, but the evidence
is mixed, so leave it out at first. Worked out together with 3 to 6, and replayed against real data,
in [Predicted-blur matching](/dev/ai-notes/predicted-blur-matching). It settled on `w = 1` without
relief.

### 8. Never return nothing

Rank beyond the tolerance window and show the best few below a "poor" divider, instead of an empty list.
Still log an unsuccessful search when nothing reaches the good tiers. Bring back REIMS1's "two single
vision pairs" for failed multifocal searches: a distance pair, plus a reading pair at `S + add`.

### 9. Store the Rx on dispense

There's no ground truth today. The deep dive's replay had to use dispensed pairs as stand-in
prescriptions. Storing the searched Rx, and which rank was picked, with each dispense would show what
staff actually choose. It does break the rule that prescriptions only reach the server on unsuccessful
searches, though no names are involved.

### 10. PD against optical centres

Record the optical centre distance when adding glasses and the patient's PD when searching, then
penalize the prism this induces (Prentice's rule). du Toit 2007 tabulates the tolerable mismatch: 7 mm at
+-1.00 D, 5 mm at 2.00, 3 mm at 3.00, 1 mm at 5.00 to 6.00. Arnold 2021 grades it the same way. That's two new fields and a measuring step per pair, so only worth it if strong lenses are
common.

### 11. Spare scarce pairs

Within a tier, prefer the pair fewer other likely prescriptions could use, judged from dispense and
unsuccessful-search history. Most code, least evidence, likely not worth it at REIMS's scale.

## Evaluating a change

- **Replay.** As in the deep dive, run dispensed pairs from 2023 to 2026 as prescriptions against the
  stock at that time. Count how often the first and top three suggestions change and how the match rate
  moves, then read the changed cases.
- **Blind review.** Show PVH optometrists the cases where old and new top suggestion differ, unlabelled,
  and ask which pair they'd dispense. Until proposal 9 exists, this is the only ground truth.
- Ship between campaigns, not during one.

## References

All PubMed links unless noted.

- Arnold RW et al. 2021a. [Grading sphero-cylinder spectacle similarity](https://pubmed.ncbi.nlm.nih.gov/33505178/). Clin Optom.
- Arnold RW et al. 2021b. [Ellipsoid spectacle comparison of Plusoptix, Retinomax and 2WIN autorefractors](https://pubmed.ncbi.nlm.nih.gov/34511869/). Clin Ophthalmol.
- Atchison DA et al. 2005. [Noticeable, troublesome and objectionable limits of blur](https://pubmed.ncbi.nlm.nih.gov/15820515/). Vision Res.
- Atchison DA et al. 2009. [Blur limits for defocus, astigmatism and trefoil](https://pubmed.ncbi.nlm.nih.gov/19631683/). Vision Res.
- Atchison DA, Mathur A. 2011. [Visual acuity with astigmatic blur](https://pubmed.ncbi.nlm.nih.gov/21478784/). Optom Vis Sci.
- Blendowske R. 2015. [Unaided visual acuity and blur: a simple model](https://pubmed.ncbi.nlm.nih.gov/25955640/). Optom Vis Sci.
- Brady CJ et al. 2012. [Visual function after correction with ready-made and custom spectacles](https://pubmed.ncbi.nlm.nih.gov/22705346/). Ophthalmology.
- Bullimore MA et al. 1998. [The repeatability of automated and clinician refraction](https://pubmed.ncbi.nlm.nih.gov/9734807/). Optom Vis Sci.
- Burge J et al. 2019. [Monovision and the misperception of motion](https://pubmed.ncbi.nlm.nih.gov/31353183/). Curr Biol.
- CVDW 2004. [REIMS slide](https://cvdw.org/conferences/2004/ppt12/tsld006.htm), and VOSH's [REIMS history](https://vosh.org/?p=9820).
- du Toit R et al. 2007. [Tolerance to prism induced by readymade spectacles](https://pubmed.ncbi.nlm.nih.gov/18043425/). Optom Vis Sci.
- Guo H, Atchison DA. 2010. [Subjective blur limits for cylinder](https://pubmed.ncbi.nlm.nih.gov/20562670/). Optom Vis Sci.
- Guyton DL. 1977. [Prescribing cylinders: the problem of distortion](https://pubmed.ncbi.nlm.nih.gov/594888/). Surv Ophthalmol.
- Hofstetter HW. 1950. Useful age-amplitude formula. Optom World 38:42-45.
- Huang VP et al. 2021. [The utility of recycled eyeglasses](https://pubmed.ncbi.nlm.nih.gov/35782466/). Int J Med Stud.
- IAPB 2014. [Position paper on recycled spectacles](https://www.iapb.org/wp-content/uploads/2020/10/Position-Paper-on-Recycled-Spectacles.pdf).
- Joseph S et al. 2021. [Accuracy of a low-cost portable autorefractor](https://pubmed.ncbi.nlm.nih.gov/34111444/). Ophthalmology.
- Kobashi H et al. 2012. [Effect of axis orientation on visual performance in astigmatic eyes](https://pubmed.ncbi.nlm.nih.gov/22727988/). J Cataract Refract Surg.
- Mathur A et al. 2015. [Effect of age on visual acuity with defocus and astigmatism](https://pubmed.ncbi.nlm.nih.gov/25479447/). Optom Vis Sci.
- Morjaria P et al. 2017. [Ready-made vs custom-made spectacles in India](https://pubmed.ncbi.nlm.nih.gov/28426857/). JAMA Ophthalmol.
- Ohlendorf A et al. 2011. [Visual acuity with simulated and real astigmatic defocus](https://pubmed.ncbi.nlm.nih.gov/21460757/). Optom Vis Sci.
- Pearce MG. 2014. [Outcomes of ready-made and recycled spectacles, a systematic review](https://pubmed.ncbi.nlm.nih.gov/24397254/). Clin Exp Optom.
- Pointer JS. 1995. [The presbyopic add II: age-related trend](https://pubmed.ncbi.nlm.nih.gov/7667016/). Ophthalmic Physiol Opt.
- Raasch TW. 1995. [Spherocylindrical refractive errors and visual acuity](https://pubmed.ncbi.nlm.nih.gov/7609953/). Optom Vis Sci.
- Ramke J et al. 2006. [An assessment of recycled spectacles donated to a developing country](https://pubmed.ncbi.nlm.nih.gov/16970761/). Clin Exp Ophthalmol.
- Reddy BS et al. 2017. [Acceptance of spherical equivalent spectacles in rural India](https://pubmed.ncbi.nlm.nih.gov/28820160/). Indian J Ophthalmol.
- Remón L et al. 2017. [Influence of different types of astigmatism on visual acuity](https://pubmed.ncbi.nlm.nih.gov/27639497/). J Optom.
- ReSpectacle. [FAQ](https://respectacle.org/faq).
- Rodriguez-Lopez V et al. 2026. [Motion illusions in the presbyopic and general populations](https://pubmed.ncbi.nlm.nih.gov/42080788/). Invest Ophthalmol Vis Sci.
- Rosenfield M, Chiu NN. 1995. [Repeatability of subjective and objective refraction](https://pubmed.ncbi.nlm.nih.gov/8539026/). Optom Vis Sci.
- Skov AG et al. 2026. [Tolerance to surgically induced anisometropia](https://pubmed.ncbi.nlm.nih.gov/40580148/). Acta Ophthalmol.
- Thibos LN et al. 1997. [Power vectors](https://pubmed.ncbi.nlm.nih.gov/9255814/). Optom Vis Sci.
- Thibos LN, Horner D. 2001. [Power vector analysis of the optical outcome of refractive surgery](https://pubmed.ncbi.nlm.nih.gov/11165859/). J Cataract Refract Surg.
- Vinas M et al. 2013. [Astigmatism impact on visual performance: meridional and adaptational effects](https://pubmed.ncbi.nlm.nih.gov/24141632/). Optom Vis Sci.
- VOSH Southeast. [The basics](https://voshsoutheast.org/educational/the-basics/).
- Wan SL et al. 2015. [Do recycled spectacles meet the refractive needs of a developing country?](https://pubmed.ncbi.nlm.nih.gov/25425093/). Clin Exp Optom.
- Weisensee J et al. 2026. [Same defocus, different vision: the role of astigmatism type in pseudophakic visual acuity loss](https://pubmed.ncbi.nlm.nih.gov/42060245/). Ophthalmic Physiol Opt.
- Wilson DA et al. 2012. [Real cost of recycled spectacles](https://pubmed.ncbi.nlm.nih.gov/22327796/). Optom Vis Sci.
- Wolffsohn JS et al. 2011. [Effect of uncorrected astigmatism on vision](https://pubmed.ncbi.nlm.nih.gov/21333869/). J Cataract Refract Surg.
- Zeng Y et al. 2009. [Ready-made and custom spectacles in a school program in China](https://pubmed.ncbi.nlm.nih.gov/19592103/). Ophthalmology.
