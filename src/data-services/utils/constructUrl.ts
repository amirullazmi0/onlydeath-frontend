type ConfigType = {
    query?: { [key: string]: string };
};

export const constructUrl = (baseUrl: string, config: ConfigType = {}): string => {
    const { query } = config;

    return baseUrl.replaceAll(/\/:(\w+)/g, (_, value) => {
        const replacedValue = query?.[value] ?? 'undefined';
        return '/' + encodeURIComponent(replacedValue);
    });
};
