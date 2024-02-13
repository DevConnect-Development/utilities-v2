export default function (url: String) {
    try {
        const urlObj = new URL(url as unknown as string);
        return urlObj.hostname;
    } catch (e) {
        return undefined;
    }
}
