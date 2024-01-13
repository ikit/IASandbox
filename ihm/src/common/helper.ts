/**
 * Analyse la réponse retourné par axios, afin de traiter les cas d'erreur
 * et retourne la réponse du server quand tout se passe bien; null sinon
 * @param {any} response
 */
export function parseAxiosResponse(response: any) {
    if (!response) {
        return null;
    }
    if (response.status >= 400) {
        return null;
    }

    return response.data
}