declare const _default: {
    swagger: {
        options: {
            jsonEditor: boolean;
            info: {
                title: string;
                version: string;
                contact: {
                    name: string;
                    email: string;
                };
            };
            grouping: string;
            sortEndpoints: string;
        };
    };
    status: {
        options: {
            path: string;
            title: string;
            routeConfig: {
                auth: boolean;
            };
        };
    };
};
export default _default;
