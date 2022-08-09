import fetch from 'cross-fetch'
import dayjs from 'dayjs'

class Universalis {
    constructor(options = {}) {
        this.BASE_UNIVERSALIS_URL = 'https://universalis.app/api/v2'
        this.BASE_XIVAPI_URL = `https://xivapi.com`
    }

    #capitalise = (string) => {
        return string[0].toUpperCase() + string.slice(1);
      }

    #arrayToParam = (array) => {
        const param = array.map((item) => {
            return JSON.stringify(item)
        })
        return param.join(',')
    }

    #validateServerName = async (name) => {
        if (!name) return false
        name = this.#capitalise(name) // Mutate string to ensure first character is a capital
        const servers = await fetch(`${this.BASE_XIVAPI_URL}/servers/dc`).then(res => res.json())
        const dataCenter =  Object.keys(servers)
        if (dataCenter.includes(name)) return { dataCenter: true, world: false } // Maybe rethink on what to return
        const worlds = Object.values(servers)
        for (let dc of worlds) {
            if (dc.includes(name)) {
                return { dataCenter: false, world: true } // Maybe rethink on what to return 
            }
        }
        return false // Not found
    }

    getDataCenters = async () => {
        const res = await fetch(`${this.BASE_UNIVERSALIS_URL}/data-centers`)
        return res.json()
    }

    getWorlds = async () => {
        const res = await fetch(`${this.BASE_UNIVERSALIS_URL}/worlds`)
        return res.json()
    }

    validateMarketableItem = async (id) => {
        const validIDs = await this.getMarketableItems()
        return validIDs.includes(id)
    }

    getListings = async (worldDcRegion, itemIds, options) => {
        if (!worldDcRegion || !itemIds || !this.#validateServerName(worldDcRegion)) return false

        const { listingLimit, tax, hq } = options
        if (typeof itemIds === 'Array') itemIds = this.#arrayToParam(itemIds)
        const res = await fetch(`${this.BASE_UNIVERSALIS_URL}/${worldDcRegion}/${itemIds}?
            ${listingLimit ? `listings=${listingLimit}`: ''}
            ${tax ? `noGst=false` : `noGst=true`}
            ${hq ? `hq=true` : `hq=false`}
        `)
        return res.json()
    }

    getSales = async (worldDcRegion, itemIds, options) => {
        if (!worldDcRegion || !itemIds || !this.#validateServerName(worldDcRegion)) return false

        if (typeof itemIds === 'Array') itemIds = this.#arrayToParam(itemIds)
        const res = await fetch(`${this.BASE_UNIVERSALIS_URL}/history/${worldDcRegion}/${itemIds}`)
        return res.json()
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
        const validatedServerName = await this.#validateServerName(world)
        if (!validatedServerName || validatedServerName.dataCenter === true) return false
        const res = await fetch(`${this.BASE_UNIVERSALIS_URL}/tax-rates/?world=${world}`)
        return res.json()
    }

    getMarketableItems = async () => {
        const res = await fetch(`${this.BASE_UNIVERSALIS_URL}/marketable`)
        return res.json()
    }

    getLeastRecentlyUpdatedItems = async (worldDc, options) => {
        if (!worldDc) return false

        const worldTypeValidation = await this.#validateServerName(worldDc)
        if (!worldTypeValidation) return false

        const { entries } = options
        const res = await fetch(`${this.BASE_UNIVERSALIS_URL}/extra/stats/least-recently-updated?
            ${worldTypeValidation.dataCenter ? `dcName=${worldDc}` : ''}
            ${worldTypeValidation.world ? `world=${worldDc}` : ''}
            ${entries ? `&entries=${entries}` : ''}    
        `)
        return res.json()
    }
    
    getMostRecentlyUpdatedItems = async (worldDc, options) => {
        if (!worldDc) return false

        const worldTypeValidation = await this.#validateServerName(worldDc)
        if (!worldTypeValidation) return false

        const { entries } = options
        const res = await fetch(`${this.BASE_UNIVERSALIS_URL}/extra/stats/most-recently-updated?
            ${worldTypeValidation.dataCenter ? `dcName=${worldDc}` : ''}
            ${worldTypeValidation.world ? `world=${worldDc}` : ''}
            ${entries ? `&entries=${entries}` : ''}    
        `)
        return res.json()
    }

    // Retrieves a generic list of recently updated items. This provides no context regarding what world or when exactly the item was updated.
    getRecentlyUpdatedItemsLegacy = async () => {
        const res = await fetch(`${this.BASE_UNIVERSALIS_URL}/extra/stats/recently-updated`)
        return res.json()
    }

    getUploadCounts = async () => {
        return Promise.all([
            fetch(`${this.BASE_UNIVERSALIS_URL}/extra/stats/world-upload-counts`).then(res => res.json()),
            fetch(`${this.BASE_UNIVERSALIS_URL}/extra/stats/uploader-upload-counts`).then(res => res.json()),
            fetch(`${this.BASE_UNIVERSALIS_URL}/extra/stats/upload-history`).then(res => res.json())
        ]).then(counts => {
            return { world: counts[0], application: counts[1], history: counts[2] }
        })
    }

    getUploadCountsByWorld = async () => {
        const res = await fetch(`${this.BASE_UNIVERSALIS_URL}/extra/stats/world-upload-counts`)
        return res.json()
    }

    getUploadCountsByApplication = async () => {
        const res = await fetch(`${this.BASE_UNIVERSALIS_URL}/extra/stats/uploader-upload-counts`)
        return res.json()
    }

    getUploadCountsHistory = async () => {
        const res = await fetch(`${this.BASE_UNIVERSALIS_URL}/extra/stats/upload-history`)
        return res.json()
    }
}

export default Universalis