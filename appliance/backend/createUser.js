import bcrypt from "bcryptjs";

async function genHash() {
  const hash = await bcrypt.hash("password456", 10);
  console.log(hash);
}

genHash();
