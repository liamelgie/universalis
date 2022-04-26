import fetch from 'cross-fetch'

class Universalis {
    constructor(options = {}) {
        this.BASE_API_URL = 'https://universalis.app/api'
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
    }

    taxRates = async (world) => {
        if (!this.#validateServerName(world)) return false
        const res = await fetch(`${this.BASE_API_URL}/tax-rates?world=${world}`)
        const rates = await res.json()
        return rates
    }

    marketableItems = async () => {
        const res = await fetch(`${this.BASE_API_URL}/marketable`)
        const ids = await res.json()
        return ids
    }

    recentlyUpdatedItems = async (world, entries = '50') => {
        const worldType = await this.#validateServerName(world)
        let worldParam = ''
        if (worldType.world) worldParam = `world=`
        if (worldType.dataCenter) worldParam = `dcname=`
        const res = await fetch(`${this.BASE_API_URL}/extra/stats/most-recently-updated?${worldParam}${world}&entries=${entries}`)
        const data = await res.json()
        return data
    }

    // Retrieves a generic list of recently updated items. This provides no context regarding what world or when exactly the item was updated.
    recentlyUpdatedItemsGeneric = async () => {
        const res = await fetch(`${this.BASE_API_URL}/extra/stats/recently-updated`)
        const data = await res.json()
        return data
    }

    uploadCounts = async () => {
        return Promise.all([
            fetch(`${this.BASE_API_URL}/extra/stats/world-upload-counts`).then(res => res.json()),
            fetch(`${this.BASE_API_URL}/extra/stats/uploader-upload-counts`).then(res => res.json()),
            fetch(`${this.BASE_API_URL}/extra/stats/upload-history`).then(res => res.json())
        ]).then(counts => {
            return { world: counts[0], application: counts[1], history: counts[2] }
        })
    }

    getUploadCountsByWorld = async () => {
        const res = await fetch(`${this.BASE_API_URL}/extra/stats/world-upload-counts`)
        const counts = await res.json()
        return counts
    }

    getUploadCountsByApplication = async () => {
        const res = await fetch(`${this.BASE_API_URL}/extra/stats/uploader-upload-counts`)
        const counts = await res.json()
        return counts
    }

    getUploadCountsHistory = async () => {
        const res = await fetch(`${this.BASE_API_URL}/extra/stats/upload-history`)
        const counts = await res.json()
        return counts
    }
}

export default Universalis