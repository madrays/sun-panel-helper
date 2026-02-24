export interface WeatherParams {
    // API Prefix
    apiPrefix?: string;

    // Weather API Config
    qweatherApiKey: string;
    qweatherApiHost: string;
    amapApiKey: string;

    // AI Config
    openaiApiKey: string;
    openaiModel: string;
    openaiBaseUrl: string;

    // User Profile
    userProfile: {
        age: number;
        gender: string;
        commuteDays: string;
        commuteMethod: string;
        coreNeeds: string;
    };

    // Location Config
    defaultLocation: string;
    defaultLocationName: string;

    // Style Config
    transparency?: number;
    textColor?: string;
}
