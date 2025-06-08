//import { Router } from "express";
import { Router, Request, Response, NextFunction } from "express";


import residentController from "../controllers/residentController";

const router = Router();

/*
router.get('/:wallet', () => {
    console.log("aqui 0");
    void residentController.getResident;
});
*/


router.get(
  "/:wallet",
  (req: Request, res: Response, next: NextFunction) =>
    {
        void residentController.getResident(req, res, next)
    }
);

router.post(
  "/",
  (req: Request, res: Response, next: NextFunction) =>
    {
        void residentController.postResident(req, res, next)
    }
);

router.patch(
  "/:wallet",
  (req: Request, res: Response, next: NextFunction) =>
    {
        void residentController.patchResident(req, res, next)
    }
);

router.delete(
  "/:wallet",
  (req: Request, res: Response, next: NextFunction) =>
    {
        void residentController.deleteResident(req, res, next)
    }
);


export default router;
