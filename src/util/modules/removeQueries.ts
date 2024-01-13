export default function (url: any) {
    const parsedURL = new URL(url)
    parsedURL.search = ""
    
    return {
        hostnameURL: parsedURL.host,
        cleanURL: parsedURL.toString()
    }
}
