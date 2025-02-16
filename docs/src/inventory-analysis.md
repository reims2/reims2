# Inventory analysis after 2025 campaign

This is a very rough interpretation of the results. Raw graphs are also shown [here](https://github.com/reims2/data-analysis/blob/main/analysis.ipynb)

This considers all dispensed glasses since the 2023 campaign and also unsuccessful searches made in (parts of) the 2024 campaign and all of the 2025 campaign.

The analysis for singlefocal is much worse than for multifocal since we have much more dispensed multifocals and therefore more data.

Check the [grafana dashboard](https://monitoring.reims2.app/d/ee00c8b8-fba7-42a4-9bf6-a2eaefdb5927/refill-stats) for the percentage of multi- vs. singlefocal per location.

## sa single


**we need**

- much more of zero-ish axis (from 160 to 0 to 20) with any sphere 
- also few more where at least one eye sphere is 0 specifically (and any other params)

**we have**

- enough with axis not zero-ish (so 50 to 120) (and at least one cylinder > 0).

### sm single

**we need**

- more with a zero-ish axis, specifically:
  - a lot more with a sphere of -1.5 to +1.5, 
  - some with any negative sphere and 0 to -0.5 cylinder
  - also few with sphere of 0 (in at least one eye)
- MAYBE? tiny amount more of glasses with high cylinders (-1 to -4) and 160 to 0 to 20 axis

**we have**

- more than enough of axis around 90-ish (i.e. not close to 0 axis)


### sa multi

**we need**

- more with with any positive spheres and 0-ish axis / zero cylinder. 
  - rather with higher add (i.e. bigger than 2.5) than lower (less than 2), but also some of the latter

**we have**

- more than enough of 90ish axis (like 70-110) (and therefore non null cylinders)
  - especially for spheres higher than +1.25 much more than enough


## sm multi

**we need**

- muuuuch more with close to 0 axis and 0 to -0.75 cylinder, any positive spheres
- some more of glasses with a smaller add value, i.e. -1 to -1.75 (and an axis that is roughly 0-ish) and any sphere

**we have**

- much more than enough of spheres bigger than +1.5 and non-zero cylinders
- enough of spheres bigger than 0 and non-zero cylinders




## Appendix

Ignore this for now

### Santa Ana singlefocal

![SA single Cluster 1](/plots/features_sa_False_1.png)
![SA single Cluster 2](/plots/features_sa_False_2.png)
![SA single Cluster 3](/plots/features_sa_False_3.png)
![SA single Cluster 4](/plots/features_sa_False_4.png)

### Santa Ana multifocal
![SA multi Cluster 1](/plots/features_sa_True_1.png)
![SA multi Cluster 2](/plots/features_sa_True_2.png)
![SA multi Cluster 3](/plots/features_sa_True_3.png)
![SA multi Cluster 4](/plots/features_sa_True_4.png)
