// TypeScript declaration file to resolve Windows casing issues
declare module 'axios' {
  import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
  const axios: AxiosInstance;
  export default axios;
  export * from 'axios';
}
