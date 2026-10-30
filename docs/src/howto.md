# REIMS2 User Guide

This guide provides instructions on how to perform common tasks using REIMS2:

[[toc]]

## Changing the Location

The current location used by REIMS2 is displayed at the top left. To change it, click on the location. After selecting your desired location and clicking apply, the system will take a few moments to download the database for the new location. Once completed, the new location will be displayed in the top bar.

## Dispensing Glasses

Once suitable glasses have been identified for a patient, it's crucial to mark them as dispensed in the database. To do this, navigate to the "Edit" screen, input the SKU, and click "Dispense". Alternatively, you can press ENTER. A notification will appear confirming the successful dispensation.

## Editing Existing Glasses

In case glasses are recorded with incorrect data, REIMS2 allows you to correct this. Navigate to the "Edit" page and input the SKU of the glasses you wish to modify. Click "Edit" on the glasses, correct the values in the dialog and click "Save". The dialog closes once the change is saved.

## Working Offline

REIMS2 is designed to operate fully offline, enabling you to find, dispense, and edit glasses without an internet connection. This feature is particularly useful in remote areas with limited or no internet connectivity.

To use REIMS2 offline, ensure that the application has been accessed at least once in the past month on the machine you're using, with a working internet connection. Google Chrome is required for this feature. If you use the "Dispense" or "Edit" functions while offline, you'll need to connect to the internet at least once per week. This is not necessary if you're only using the application to find matches. When offline, REIMS2 will display a banner in the bottom right corner indicating that it's running offline. Any changes made while offline will be automatically uploaded when the connection is restored. Until then, the top bar shows how many changes are still waiting to upload.

Please note that adding new glasses or creating reports is not possible while offline.

## Deleting or Replacing Glasses

If glasses are missing from the storage or if you wish to remove unused glasses, you can delete them. Navigate to the "Edit" screen, input the SKU, click the three dots in the bottom right corner of the glasses, and select "Delete". You'll be prompted to provide a reason for the deletion, which will be recorded in the campaign reports.

## Generating a Report of Dispensed Glasses

After a campaign, it's necessary to generate a report of all dispensed glasses. To do this, navigate to the "Reports" page and click "Download" under "Dispense & delete report". This will download a `csv` file of all glasses ever dispensed or deleted at the current location. Each row has the previous SKU, the date and the reason, for example dispensed or broken.

## Exporting the Current Inventory

For detailed analysis of the current inventory, you can export a list of all glasses. Navigate to the "Reports" page and click "Download" under "Current inventory report". This will download a `csv` file containing all current (i.e., non-dispensed) glasses for the current location.

## Adding New Glasses Simultaneously

REIMS2 allows you to add new glasses on multiple devices simultaneously, ensuring there are no SKU conflicts. This feature is enabled by default and requires no additional setup.
