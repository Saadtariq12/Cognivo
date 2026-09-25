import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});
import { app } from "./app.js";
import { checkSupabaseConnection } from "./config/database.js";

const PORT = process.env.PORT || 5000;
const startServer = async () => {
  await checkSupabaseConnection();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
