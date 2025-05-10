import { Request, Response, NextFunction } from 'express';

export const responseLogger = () => {
    return (req: Request, res: Response, next: NextFunction) => {
        const oldJson = res.json;
        res.json = function(body: any) {
            res.locals.body = body;
            return oldJson.apply(res, [body]);
        };

        res.on('finish', () => {
            console.log("🚀 ~ Response:", {
                statusCode: res.statusCode,
                payload: req.body,
                body: res.locals.body,
                path: req.originalUrl,
                method: req.method
            });
        });
        next();
    };
};