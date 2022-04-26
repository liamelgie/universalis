# universalis.js

universalis.js is a promise-driven wrapper for the [Universalis API](https://universalis.app/docs/index.html), written in in Node.js.


[Universalis](https://github.com/Universalis-FFXIV/Universalis) is a crowd-sourced aggregator of marketboard data for FFXIV.

## Installation
**Requires Node.js**
```sh-session
npm install universalis.js
```
## Usage & Examples
Import and initilise the module:
```js
import Universalis from 'universalis.js'
const uni = new Universalis()
```

### .listings(world, id)
Retrieves the current listings for an item. This data includes the quality, price, quantity and the time that the listing was created. 
##### Parameters
##### `world [string]`
A specific world (e.g. Cerberus) or a data center (e.g. Chaos) that you wish to retrieve the data for. Providing a data center will return data for all worlds within it.

##### `id [string][array]`
An ID that corresponds to an item.  IDs can be found via the [Universalis app](https://universalis.app) or via the `marketableItems` method.

By providing an array of IDs, you can retrieve data for multiple items at once. Make sure to do this to prevent hitting rate limits and to maximise performance.
##### Example
Retrieve listings on the world 'Cerberus' for the item 'Fat Cat' (9347)
```js
const getFatCatListings = async () => {
	const listings = await uni.listings('cerberus', '9347')
}
```

### .sales(world, id)
Retrieves the previous sales for an item. This includes the quality, price, quantity and time of the sale.
##### Parameters
###### `world [string]`
A specific world (e.g. Cerberus) or a data center (e.g. Chaos) that you wish to retrieve the data for. Providing a data center will return data for all worlds within it.

###### `id [string][array]`
An ID that corresponds to an item.  IDs can be found via the [Universalis app](https://universalis.app) or via the `marketableItems` method.

By providing an array of IDs, you can retrieve data for multiple items at once. Make sure to do this to prevent hitting rate limits and to maximise performance.

##### Example
Retrieve previous sales on the world 'Cerberus' for the item 'Fat Cat' (9347)
```js
const getFatCatSales = async () => {
	const sales = await uni.sales('cerberus', '9347')
}
```

### .taxRates(world)
Retrieves the tax rates for each city in which your retainers can list items on the market board.
##### Parameters
###### `world [string]`
The world (e.g. Cerberus) that you wish to retrieve data for. 

### .marketableItems()
Retrieves an array of every ID of items that can be listed on the market board. 

### .recentlyUpdatedItems(world, entries)
Retrieves an array of recently updated items on a specific world. 

In this context, recently updated means that a player who is [contributing to Universalis'](https://universalis.app/contribute) data has searched for the item via the market board in-game.

##### Parameters
###### `world [string]`
The world (e.g. Cerberus) that you wish to retrieve data for. 
###### `entries [int]`
The amount of results to return. Valid values range from 1-200. **Defaults to 50.**

### .recentlyUpdatedItemsGeneric()
Retrieves an array of recently updated items.  This method provides no context to the data and is across every server and region.

### .uploadCounts()
Retrieves data regarding the [contributions from users](https://universalis.app/contribute).  

This method returns the following:

##### World Upload Counts
The total upload count per world and the percentage of the total data that it represents.

##### Upload Application Counts
The total upload count and name of each application that contributes data to Universalis.

##### Upload History
The number of uploads per day over the past 30 days.

##### Example
```js
const getUploadData = async () => {
	const data = await uni.uploadCounts()
	const worldCounts = data[0]
	const applicationCounts = data[1]
	const uploadHistory = data[2]
}
```
