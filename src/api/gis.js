import api from './axios'

export const gisApi = {
    getLocations: () => 
        api.get('/gis/locations'),

    getLocationById: (id) =>
        api.get(`/gis/locations/${id}`),

    createLocation: (data) =>
        api.post('/gis/locations', data),

    getByType: (type) =>
        api.get(`/gis/locations/type/${type}`),

    findNearby: (lat, lng, radius, type = null) =>
        api.post('/gis/locations/nearby', { 
            lat, 
            lng, 
            radius, ...(type && { type }), 
    })
}