import fetch from 'node-fetch';

export default class SpecificationURL {
    private readonly url: string;
    constructor(url: string) {
        this.url = url;
    }

    isValid() {
        let url;
        try {
            url = new URL(this.url);
        } catch (error) {
            return false;
        }

        return url?.protocol === 'http:' || url?.protocol === 'https:';
    }

    async fetch() {
        let response;
        try {
            response = await fetch(this.url, { method: 'GET' })
        } catch (error: any) {
            throw new Error(`fetch-url-error: ${error.message}`)
        }

        return response?.text();
    }
}