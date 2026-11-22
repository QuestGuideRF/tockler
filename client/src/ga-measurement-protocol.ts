import { getMachineId } from './services/settings.api';
const trackingId: string = import.meta.env.VITE_TRACKING_ID || '';
const secretKey: string = import.meta.env.VITE_SECRET_KEY || '';
const config: {
    measurementId: string;
    measurementSecret: string;
    measurementUrl: string;
    measurementUrlDebug: string;
    clientId: string | null;
} = {
    measurementId: trackingId,
    measurementSecret: secretKey,
    measurementUrl: 'https://www.google-analytics.com/mp/collect',
    measurementUrlDebug: 'https://www.google-analytics.com/debug/mp/collect',
    clientId: null,
};
const getUrl = () => {
    const params = new URLSearchParams({
        measurement_id: config.measurementId,
        api_secret: config.measurementSecret,
    });
    return new URL(`${config.measurementUrl}?${params}`);
};
export const sendEvent = async ({ name, params }: { name: string; params }) => {
    const url = getUrl();
    if (!config.clientId) {
        const machineId = await getMachineId();
        config.clientId = machineId as string;
    }
    return fetch(url.toString(), {
        method: 'POST',
        body: JSON.stringify({
            client_id: config.clientId,
            non_personalized_ads: true,
            events: [
                {
                    name,
                    params,
                },
            ],
        }),
    });
};
export const setUserProperty = async (name, value) => {
    const url = getUrl();
    if (!config.clientId) {
        const machineId = await getMachineId();
        config.clientId = machineId as string;
    }
    return fetch(url, {
        method: 'POST',
        body: JSON.stringify({
            client_id: config.clientId,
            user_properties: {
                [name]: {
                    value,
                },
            },
        }),
    });
};
export const pageView = ({ location, title }) => {
    return sendEvent({
        name: 'page_view',
        params: {
            page_title: title,
            page_location: location,
        },
    });
};