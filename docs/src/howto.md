# How to use REIMS2

## Change the location

In the top left it shows which location REIMS currently uses. To change that, click on "Change location" in the bottom left. After clicking apply, it'll take a few seconds to download the database of the new location. After that, it shows the new location in the top left and you're done.

## Dispense glasses

After a match has been found and the glasses have been dispensed, it's important to mark them as dispensed in the database. Switch to the "Edit" screen, enter the SKU and click "Dispense". Instead of clicking the button it's also possible to hit ENTER. A message will show if the dispension was successful.

## Edit existing glasses

If glasses are entered with wrong data, it's possible to correct that. Switch to the "Edit" page and enter the SKU you want to change. On the appearing glasses, click on the value you want to change. A text field will open, where it's possible to enter the new value. Click "Save" to save the changes.


## Working offline

REIMS2 can run fully offline and it's possible to find, dispense and edit glasses with no internet connection. This makes it possible to use REIMS2 in remote areas without connection.

For this to work it is neccessary that REIMS2 has been opened at least once in the last month with a working internet connection on that machine. It is required to use Google Chrome. If you use "Dispense" or "Edit" while being offline it's required to go online at least once per week. That's not required if you use it only to find matches.

To use it offline, simply open the REIMS2 website in Chrome and it'll load even when there's no connection. It'll display a banner at the top of the page that it is running offline. Finding matches works like before. If you dispense or edit glasses, those changes will be automatically uploaded as soon as the connection is back online. It will continue to work when you close the browser or shut off the machine in the meantime. Adding new glasses is not possible offline, nor is creating reports.


## Delete or replace glasses

If glasses are missing in the storage or you if you want to purge unused glasses from the storage, it's possible to delete them. Switch to the "Edit" screen, enter the SKU and click "Delete". You'll be asked to confirm that you really want to delete glasses. It's important not to confuse this with Dispense, because with this glasses are permanently deleted and cannot be recovered.


## Report of dispensed glasses

After a campaign it's necessary to create a report of all dispensed glasses. Switch to the "Reports" page and enter a start and end date. Click "Export Dispensed". This will download a `csv` file, which can be opened with Excel. In addition to the usual glasses data it also contains the dispense date and the SKU it had before it was dispensed.

## Export the current inventory

It can be helpful to export a list of all glasses, e.g. for analysing the current inventory in detail. Switch to the "Reports" page and click "Export all". This will download a `csv` file which can be opened with Excel. It contains all current (i.e. non dispensed) glasses for the current location (shown in the top left).

## Simultanously add new glasses 

With REIMS2 it's possible to add new glasses on multiple devices at the same time. REIMS2 makes sure that there are no colliding SKUs. This works out of the box and there's nothing you need to do to use this feature (this was different for REIMS1).
