# universalis.js

universalis.js is a promise-driven wrapper for the [Universalis API](https://universalis.app/docs/index.html), written in Node.js.

[Universalis](https://github.com/Universalis-FFXIV/Universalis) is a crowd-sourced aggregator of market board data for FFXIV. This package is unofficial and is not supported by the Universalis developers. 

# Installation
```sh-session
npm i universalis.js --save
```
# Usage & Examples
Import and initialize the module:
```js
import Universalis from 'universalis.js'
const uni = new Universalis()
```

## .getListings(worldDcRegion, itemIds, options)
Retrieves the current listings for an item. This data includes the quality, price, quantity and the time that the listing was created. 
#### Parameters
##### `worldDcRegion [string]`
A specific world (e.g. Cerberus) or data center (e.g. Chaos) that you wish to retrieve the data for. Providing a data center will return data for all worlds within it.

##### `itemIds [string][array]`
An ID that corresponds to an item.  IDs can be found via the [Universalis app](https://universalis.app) or via the `marketableItems` method.

By providing an array of IDs, you can retrieve data for multiple items at once. Make sure to do this to prevent hitting rate limits and to maximize performance.

##### `options [object]`
An object that contains the optional parameters that can be used to refine your results. These options include:
listingLimit, tax, hq
`listingLimit [number]`: The amount of listings that should be returned. The listings will be ordered by price from lowest to highest.
`tax [boolean]`: If city-state tax should be included in the total price for each listing.
`hq [boolean]`: If listings should be limited to HQ items only. 

#### Example
Retrieve 10 HQ listings on the world 'Cerberus' for the item 'Fat Cat' (9347)
```js
const getFatCatListings = async () => {
	const listings = await uni.getListings('cerberus', '9347', { hq: true, listingLimit: 10 })
}
```

## .sortListingsByWorld(listings)
Sorts listings into an associative array with data grouped by world name. 

#### Parameters
##### `listings [array]`
Data returned from the `getListings` method.

#### Example
Retrieve listings on the data center 'Chaos' for the item 'Fat Cat' (9347) and sort them by world.
```js
const getFatCatListings = async () => {
	const listings = await uni.getListings('chaos', '9347')
	const sorted = uni.sortListingsByWorld(listings)
	// access listings on Spriggan:
	sorted['Spriggan']
}
```

## .getSales(worldDcRegion, itemIds)
Retrieves the previous sales for an item. This includes the quality, price, quantity and time of the sale.
#### Parameters
##### `worldDcRegion [string]`
A specific world (e.g. Cerberus) or data center (e.g. Chaos) that you wish to retrieve the data for. Providing a data center will return data for all worlds within it.

##### `itemIds [string][array]`
An ID that corresponds to an item.  IDs can be found via the [Universalis app](https://universalis.app) or via the `marketableItems` method.

By providing an array of IDs, you can retrieve data for multiple items at once. Make sure to do this to prevent hitting rate limits and to maximize performance.

#### Example
Retrieve previous sales on the world 'Cerberus' for the item 'Fat Cat' (9347)
```js
const getFatCatSales = async () => {
	const sales = await uni.getSales('cerberus', '9347')
}
```

## .sortSalesByDay(sales)
Sorts sales into an associative array with data grouped by the date of sale. 
**Dates are in the YYYY-MM-DD format.**

#### Parameters
##### `sales [array]`
Data returned from the `getSales` method.

#### Example
Retrieve sales on the world 'Cerberus' for the item 'Fat Cat' (9347) and sort them by the date of sale.
Dates are in the YYYY-MM-DD format.
```js
const getFatCatSales = async () => {
	const sales = await uni.getSales('cerberus', '9347')
	const sorted = uni.sortSalesByDay(sales)
	// access all sales on 2019-04-22:
	sorted['2019-04-22']
}
```

## .validateMarketableItem(itemId)
Checks if a provided item ID can be sold on the market board. Returns either true or false. 

#### Parameters
##### `itemId [string]`
The item ID that you wish to validate.

## .getTaxRates(world)
Retrieves the tax rates for each city in which your retainers can list items on the market board.
#### Parameters
##### `world [string]`
The world (e.g. Cerberus) that you wish to retrieve data for. 

## .getMarketableItems()
Retrieves an array of every ID of items that can be listed on the market board. 

## .getMostRecentlyUpdatedItems(worldDc, options)
Retrieves an array of recently updated items on a specific world. 

In this context, recently updated means that a player who is [contributing to Universalis'](https://universalis.app/contribute) data has searched for the item via the market board in-game.

#### Parameters
##### `worldDc [string]`
The world (e.g. Cerberus) or data center (e.g. Chaos) that you wish to retrieve data for. 
##### `options [object]`
An object that contains the optional parameters that can be used to refine your results. Currently, these options only include:
`entries [int]`: The amount of results to return. Valid values range from 1-200. **Defaults to 50.**

## .getLeastRecentlyUpdatedItems(worldDc, options)
Retrieves an array of recently updated items on a specific world. 

In this context, recently updated means that a player who is [contributing to Universalis'](https://universalis.app/contribute) data has searched for the item via the market board in-game.

#### Parameters
##### `worldDc [string]`
The world (e.g. Cerberus) or data center (e.g. Chaos) that you wish to retrieve data for. 
##### `options [object]`
An object that contains the optional parameters that can be used to refine your results. Currently, these options only include:
`entries [int]`: The amount of results to return. Valid values range from 1-200. **Defaults to 50.**


## .getRecentlyUpdatedItemsLegacy()
Retrieves an array of recently updated items.  This method provides no context to the data and is across every server and region.

## .getUploadCounts()
Retrieves data regarding the [contributions from users](https://universalis.app/contribute).  

This method returns the following:

#### World Upload Counts
The total upload count per world and the percentage of the total data that it represents.

#### Upload Application Counts
The total upload count and name of each application that contributes data to Universalis.

#### Upload History
The number of uploads per day over the past 30 days.

#### Example
```js
const getUploadData = async () => {
	const data = await uni.getUploadCounts()
	const worldCounts = data[0]
	const applicationCounts = data[1]
	const uploadHistory = data[2]
}
```