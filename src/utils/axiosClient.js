import axios from 'axios'

const axiosClient = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  withCredentials: true, //attach the cookies to  the requests
  headers: {
    'Content-Type': 'application/json',
  },
})

export default axiosClient
