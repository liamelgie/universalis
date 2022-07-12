import fetch from 'cross-fetch'
import dayjs from 'dayjs'

class Universalis {
    constructor(options = {}) {
        this.BASE_API_URL = 'https://universalis.app/api/v2/'
    }

    #arrayToParam = (array) => {
        const param = array.map((item) => {
            return JSON.stringify(item)
        })
        return param.join(',')
    }

    #validateServerName = async (name) => {
        if (!name) return false
        const servers = await fetch('https://xivapi.com/servers/dc').then(res => res.json())
        const dataCenter = await Object.keys(servers)
        if (dataCenter.includes(name)) return { dataCenter: true, world: false } // Maybe rethink on what to return
        const worlds = await Object.values(servers)
        for (let dc of worlds) {
            if (dc.includes(name)) {
                return { dataCenter: false, world: true } // Maybe rethink on what to return 
            }
        }
        return false // Not found
    }

    getDataCenters = async () => {
        const data = await (await fetch(`${this.BASE_API_URL}/data-centers`)).json()
        return data
    }

    getWorlds = async () => {
        const data = await (await fetch(`${this.BASE_API_URL}/worlds`)).json()
        return data
    }

    validateMarketableItem = async (id) => {
        const validIDs = await this.getMarketableItems()
        return validIDs.includes(id)
    }

    getListings = async (worldDcRegion, itemIds, options) => {
        if (!worldDcRegion || !itemIds) return false
        if (!this.#validateServerName(worldDcRegion)) return false
        const { listingLimit, tax, hq } = options
        if (typeof itemIds === 'Array') itemIds = this.#arrayToParam(itemIds)
        const data = await (await fetch(`${this.BASE_API_URL}/${worldDcRegion}/${itemIds}?
            ${listingLimit ? `listings=${listingLimit}`: ''}
            ${tax ? `noGst=false` : `noGst=true`}
            ${hq ? `hq=true` : `hq=false`}
        `)).json()
        return data
    }

    getSales = async (worldDcRegion, itemIds, options) => {
        if (!worldDcRegion || !itemIds) return false
        if (!this.#validateServerName(worldDcRegion)) return false
        if (typeof itemIds === 'Array') itemIds = this.#arrayToParam(itemIds)
        const data = await (await fetch(`${this.BASE_API_URL}/history/${worldDcRegion}/${itemIds}`)).json()
        return data
    }

    sortListingsByWorld = (listings) => {
        if (!listings[0].worldName) throw 'Missing .worldName property in listing data. Ensure the provided data contains results from an entire data center and not a single world'
        const sortedListings = listings.reduce((worldGroups, { lastReviewTime, pricePerUnit, quantity, stainID, worldName, worldID, creatorName, creatorID, hq, isCrafted, listingID, materia, onMannequin, retainerCity, retainerID, retainerName, sellerID, total}) => {
            if (!worldGroups[worldName]) worldGroups[worldName] = []
            worldGroups[worldName].push({ lastReviewTime, pricePerUnit, quantity, stainID, worldName, worldID, creatorName, creatorID, hq, isCrafted, listingID, materia, onMannequin, retainerCity, retainerID, retainerName, sellerID, total})
            return worldGroups
        }, {})
        return sortedListings
    }

    sortSalesByDay = (sales, limit) => {
        const data = sales.entries.map((sale) => {
            const dateObject = dayjs(sale.timestamp * 1000)
            return {
                itemID: sales.itemID,
                hq: sale.hq, 
                pricePerUnit: sale.pricePerUnit,
                quantity: sale.quantity,
                worldName: sales.worldName || sale.worldName,
                worldID: sales.worldID || sale.worldID,
                date: dateObject.format('YYYY-MM-DD'),
                time: { 
                    raw: `${dateObject.hour()}${dateObject.minute()}${dateObject.second()}`, 
                    pretty: `${dateObject.hour()}:${dateObject.minute()}:${dateObject.second()}` 
                } 
            }
        })
        const sortedSales = data.reduce((datedGroups, { date, itemID, hq, pricePerUnit, quantity, worldName, worldID, time }) => {
            if (!datedGroups[date]) datedGroups[date] = []
            datedGroups[date].push({ itemID, hq, pricePerUnit, quantity, worldName, worldID, time })
            return datedGroups
        }, {})
        return Object.fromEntries(Object.entries(sortedSales).slice(0, limit))
    }

    getTaxRates = async (world) => {
        if (!this.#validateServerName(world)) return false
        const data = await (await fetch(`${this.BASE_API_URL}/tax-rates/?world=${world}`)).json()
        return data
    }

    getMarketableItems = async () => {
        const data = await (await fetch(`${this.BASE_API_URL}/marketable`)).json()
        return data
    }

    getLeastRecentlyUpdatedItems = async (worldDc, options) => {
        const { entries } = options
        if (!worldDc) return false
        const worldTypeValidation = this.#validateServerName(worldDc)
        if (!worldTypeValidation) return false
        const data = await (await fetch(`${this.BASE_API_URL}/extra/stats/least-recently-updated?
            ${worldTypeValidation.dataCenter ? `dcName=${worldDc}` : ''}
            ${worldTypeValidation.world ? `world=${worldDc}` : ''}
            ${entries ? `&entries=${entries}` : ''}    
        `)).json()
        return data
    }
    
    getMostRecentlyUpdatedItems = async (worldDc, options) => {
        const { entries } = options
        if (!worldDc) return false
        const worldTypeValidation = this.#validateServerName(worldDc)
        if (!worldTypeValidation) return false
        const data = await (await fetch(`${this.BASE_API_URL}/extra/stats/most-recently-updated?
            ${worldTypeValidation.dataCenter ? `dcName=${worldDc}` : ''}
            ${worldTypeValidation.world ? `world=${worldDc}` : ''}
            ${entries ? `&entries=${entries}` : ''}    
        `)).json()
        return data
    }

    // Retrieves a generic list of recently updated items. This provides no context regarding what world or when exactly the item was updated.
    getRecentlyUpdatedItemsLegacy = async () => {
        const data = await (await fetch(`${this.BASE_API_URL}/extra/stats/recently-updated`)).json()
        return data
    }

    getUploadCounts = async () => {
        return Promise.all([
            fetch(`${this.BASE_API_URL}/extra/stats/world-upload-counts`).then(res => res.json()),
            fetch(`${this.BASE_API_URL}/extra/stats/uploader-upload-counts`).then(res => res.json()),
            fetch(`${this.BASE_API_URL}/extra/stats/upload-history`).then(res => res.json())
        ]).then(counts => {
            return { world: counts[0], application: counts[1], history: counts[2] }
        })
    }

    getUploadCountsByWorld = async () => {
        const data = await (await fetch(`${this.BASE_API_URL}/extra/stats/world-upload-counts`)).json()
        return data
    }

    getUploadCountsByApplication = async () => {
        const data = await (await fetch(`${this.BASE_API_URL}/extra/stats/uploader-upload-counts`)).json()
        return data
    }

    getUploadCountsHistory = async () => {
        const data = await (await fetch(`${this.BASE_API_URL}/extra/stats/upload-history`)).json()
        return data
    }
}

export default Universalis