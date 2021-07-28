declare module '*.yaml' {
  const content: { [key: string]: any }
  export default content
}

declare var process : {
  env: {
    REACT_APP_API_URL: string
  }
}
