import axios, { AxiosInstance } from 'axios'
import { store } from '../store/configureStore'
import API_CONFIG from '../../../cattle.config'

const HTTP_CLIENT: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 10000 // Timeout after 10s
})

HTTP_CLIENT.interceptors.request.use(
  async config => {
    const token = store.getState()?.auth.accessToken

    if (!config.headers) {
      config.headers = {}
    }

    config.headers.Accept = 'application/json'
    config.headers['Cache-Control'] = 'no-cache'
    config.headers['Content-Type'] = 'application/json'

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  error => Promise.reject(error)
)

export default HTTP_CLIENT
