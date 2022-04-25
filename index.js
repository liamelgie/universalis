class Universalis {
    constructor(options = {}) {
        const BASE_API_URL = 'https://universalis.app/api/' // Decide whether to leave the trailing slash or not

        this.taxRates = async (world) => {
            // Add world name validation
            if (!world) return false
            const res = await fetch(`${BASE_API_URL}tax-rates?world=${world}`)
            const rates = await res.json()
            return rates
        }

        this.marketableItems = async () => {
            const res = await fetch(`${BASE_API_URL}`)
            const ids = await res.json()
            return ids
        }

        this.recentlyUpdatedItems = async (world, entries = '50') => {
            // TODO: Check whether world param is a world or a data center and use the correct url param
            // ?world=Cerberus
            // ?dcName=Chaos
            const res = await fetch(`${BASE_API_URL}extra/stats/most-recently-updated?world=${world}&entries=${entries}`)
            const data = await res.json()
            return data
        }

        // Retrieves a generic list of recently updated items. This provides no context regarding what world or when exactly the item was updated.
        this.recentlyUpdatedItemsGeneric = async () => {
            const res = await fetch(`${BASE_API_URL}extra/stats/recently-updated`)
            const data = await res.json()
            return data
        }

        this.uploadCounts = async () => {
            Promise.all([
                fetch(`${BASE_API_URL}extra/stats/world-upload-counts`).then(res => res.json()),
                fetch(`${BASE_API_URL}extra/stats/uploader-upload-counts`).then(res => res.json()),
                fetch(`${BASE_API_URL}extra/stats/upload-history`).then(res => res.json())
            ]).then(counts => {
                return { world: counts[0], application: counts[1], history: counts[2] }
            })
        }

        const getUploadCountsByWorld = async () => {
            const res = await fetch(`${BASE_API_URL}extra/stats/world-upload-counts`)
            const counts = await res.json()
            return counts
        }

        const getUploadCountsByApplication = async () => {
            const res = await fetch(`${BASE_API_URL}extra/stats/uploader-upload-counts`)
            const counts = await res.json()
            return counts
        }

        const getUploadCountsHistory = async () => {
            const res = await fetch(`${BASE_API_URL}extra/stats/upload-history`)
            const counts = await res.json()
            return counts
        }
    }
}

export default Universalis