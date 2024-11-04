import express from "express";
import morgan from "morgan";
import cors from "cors";
import { SoapService } from "./services/soapServices.js";
import router from "./routes/routes.js";
import SpeiController from "./controllers/speiController.js";
import { SOAP_URL } from "./config/config.js";
const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'PUT', 'DELETE', 'PATCH', 'POST'],
  allowedHeaders: 'Content-Type, Authorization, Origin, X-Requested-With, Accept'
}));



app.use('/api/spt', router);


app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(error.status || 500).json({
    error: {
      message: error.message,
    },
  });
});

export default app;