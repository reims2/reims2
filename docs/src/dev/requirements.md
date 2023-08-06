# Requirements

This is just a very basic overview that's still missing a lot of requirements. It's more helpful to check the [user stories](./user-stories)

## Backend

### Endpoints

- Adding new glasses. This should return a unique SKU that was not in use (i.e. the previous glasses in that slot were dispensed).
- Recording glasses as dispensed (and optionally an undo function for that)
- Deleting entries from DB so that it's possible to remove wrongly-entered entries completely (and not just mark them as dispensed).
- Optional: Modifying existing data so that it's possible to correct wrongly entered data. This is rarily needed and could also be done via delete+add for now.
- Returning all active (i.e. non dispensed) glasses so that it's possible to work w/o internet connection on site. Optionally make that endpoint searchable/sortable but we'll probably do that on client-side.
- Optional: Saving failed matches so that it's possible to analyze what type of glasses were often required but not available. For this the frontend will report to the backend what was missing and it's simply stored.

### General considerations

- Support for different locations: There is one site in San Miguel and one in Santa Ana (and that should be extendable in the future). The sites are independet of each other, so they should have different tables / different API endpoints. Optional: currently it's possible to filter by location because one location has all SKUs less than 5000 and the other greater than 5000.
- Some endpoints need to be authenticated, especially the write endpoints

  - Read is not that important, since there is no personal data
  - Login via Google Account or other 3rd parties would be okay if it's easier
  - Neccessary new endpoints: One endpoint for login, one for logout and one for user info (to get the capabilities of the current user, e.g. if is admin, which physicallocation is allowed). Frontend will use [this library](https://auth.nuxtjs.org/schemes/local#options)

- It should never be possible to have the same SKU for two active (i.e. non dispensed) glasses.

## Glasses data structure

_See [Working with REIMS to find glasses (PDF)](/working-with-reims.pdf) for a detailled explanation_

Data for every entry:

- `Type` can be single (standard glasses), bifocal (single, but with a different lens power at the bottom) or progressive (bifocal, but with a smooth transition. German: "Gleitsichtbrille"). In REIMS2, it is simplified to either `single` or `multifocal`. In the future, reader (simple reading glasses with `Sphere` only could be possible as well).
- `Size` can be small, medium, large, child
- `Appearance` can be neutral, feminine or masculine

The following data is stored for **each** eye (OD=right eye, OS=left):

- `Sphere`/lens power in diopters. Negative numbers means near sighted, positive is far sighted. Range from -20 to +20 in 0.25 increments. Usually between -6 to +6.
- `Cylinder` Lens power to correct astigmatism (German: "Hornhautverkrümmung"). Range from 0 to -6 in 0.25 increments => Negative only. Usually between 0 to -3.
- `Axis` Also some value to correct astigmatism. Range from 0 to 180 in 1 increments. (0 equals 180, wraparound). Always specified with 3 digits (zero padding).
- `Add` **only for bifocal or progressive lenses**, this described the lens power of the additional bottom lens. Range from 0.25 to 4 in 0.25 increments => Positive only. Usually between 0.75 to 3.50.

## Frontend

General:

- Everything should be usable via keyboard/numpad only as it's the current workflow.
- The current sequence (of tabbing) fields should be kept.
- Mobile usage is not required, since numpad is much faster.
- No additional help texts are required (expect for why entered data is incorrect)
- Tab to switch fields, enter to submit

Entering data:

- Return SKU after data entry so that it's easier to implement the backend no duplicates logic.
- Round to 0.25 increments automatically.
- Force a plus or minus to be entered for sphere
- Force axis to be entered with three digits, i.e. zero left padding required

Matching data:

- [Philscore Breakdown (PDF)](/philscore-breakdown.pdf)

Viewing data (America **as well as onsite**):

- Sorting table is required
- Filtering data is required for type and OD/OS sphere+cyl
- Optionally some export to CSV feature

Report generation

- See [user stories](user-stories#inventory-analysis)
- Export to CSV

## General / other

- System might be reused from other initiatives in the world, so it's preferred to make the branding customizable and the code easy to setup & modular
