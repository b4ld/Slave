declare const routes: {
    method: string;
    path: string;
    handler: (request: any, h: any) => string;
}[];
export default routes;
