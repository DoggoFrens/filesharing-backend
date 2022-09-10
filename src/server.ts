import express, { Application } from "express";
import { uploadRouter } from "./routes/upload";
import { downloadRouter } from "./routes/download";

const app: Application = express();
const PORT: number = 5000;

app.get("/", (req, res) => {
  res.send(200);
});

app.use("/upload", uploadRouter);
app.use("/download", downloadRouter);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
