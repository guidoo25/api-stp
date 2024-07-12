import app from "./app.js";
import { PORT } from "./config/config.js";

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server en puerto: ${PORT}`);
  });