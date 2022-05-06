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

## .getListings(world, id)
Retrieves the current listings for an item. This data includes the quality, price, quantity and the time that the listing was created. 
#### Parameters
##### `world [string]`
A specific world (e.g. Cerberus) or a data center (e.g. Chaos) that you wish to retrieve the data for. Providing a data center will return data for all worlds within it.

##### `id [string][array]`
An ID that corresponds to an item.  IDs can be found via the [Universalis app](https://universalis.app) or via the `marketableItems` method.

By providing an array of IDs, you can retrieve data for multiple items at once. Make sure to do this to prevent hitting rate limits and to maximize performance.
#### Example
Retrieve listings on the world 'Cerberus' for the item 'Fat Cat' (9347)
```js
const getFatCatListings = async () => {
	const listings = await uni.getListings('cerberus', '9347')
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
	const sales = await uni.getListings('chaos', '9347')
	const sorted = uni.sortListingsByWorld(listings)
	// access listings on Spriggan:
	sorted['Spriggan']
}
```

## .getSales(world, id)
Retrieves the previous sales for an item. This includes the quality, price, quantity and time of the sale.
#### Parameters
##### `world [string]`
A specific world (e.g. Cerberus) or a data center (e.g. Chaos) that you wish to retrieve the data for. Providing a data center will return data for all worlds within it.

##### `id [string][array]`
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
**Dates are in the DD-MM-YY format.**

#### Parameters
##### `sales [array]`
Data returned from the `getSales` method.

#### Example
Retrieve sales on the world 'Cerberus' for the item 'Fat Cat' (9347) and sort them by the date of sale.
Dates are in the DD-MM-YY format.
```js
const getFatCatSales = async () => {
	const sales = await uni.getSales('cerberus', '9347')
	const sorted = uni.sortSalesByDay(sales)
	// access all sales on 19-04-22:
	sorted['19-04-22']
}
```

## .validateMarketableItem(id)
Checks if a provided item ID can be sold on the market board. Returns either true or false. 

#### Parameters
##### `id [string]`
The item ID that you wish to validate.

## .getTaxRates(world)
Retrieves the tax rates for each city in which your retainers can list items on the market board.
#### Parameters
##### `world [string]`
The world (e.g. Cerberus) that you wish to retrieve data for. 

## .getMarketableItems()
Retrieves an array of every ID of items that can be listed on the market board. 

## .getRecentlyUpdatedItems(world, entries)
Retrieves an array of recently updated items on a specific world. 

In this context, recently updated means that a player who is [contributing to Universalis'](https://universalis.app/contribute) data has searched for the item via the market board in-game.

#### Parameters
##### `world [string]`
The world (e.g. Cerberus) that you wish to retrieve data for. 
##### `entries [int]`
The amount of results to return. Valid values range from 1-200. **Defaults to 50.**

## .getRecentlyUpdatedItemsGeneric()
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