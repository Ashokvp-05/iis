import { Request, Response } from 'express';
import * as holidayService from '../services/holiday.service';

export const sync = async (req: Request, res: Response) => {
    try {
        const year = req.body.year || new Date().getFullYear() + 1; // Default to next year or current
        const result = await holidayService.syncHolidays(year);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const list = async (req: Request, res: Response) => {
    try {
        const year = parseInt(req.query.year as string) || new Date().getFullYear();
        const holidays = await holidayService.getHolidays(year);
        res.json(holidays);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
