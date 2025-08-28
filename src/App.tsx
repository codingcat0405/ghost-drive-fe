import { useEffect } from "react";
import cryptoUtils from "./utils/crypto";

function App() {
  const main = async () => {
    const pin = "123456";
    const aesKey = await cryptoUtils.generateFileEncryptionKey();
    console.log("aesKey", aesKey);
    const encryptedKey = await cryptoUtils.encryptFileEncryptionKey(aesKey, pin);
    console.log("encryptedKey", encryptedKey);
    const decryptedKey = await cryptoUtils.decryptFileEncryptionKey(encryptedKey, pin);
    console.log("decryptedKey", decryptedKey);
    const isPinValid = await cryptoUtils.isPinValid(pin, encryptedKey);
    console.log("isPinValid", isPinValid);
  };
  useEffect(() => {
    main();
  }, []);
  return (
    <main>
      <h1 className="text-3xl font-bold underline">Hello World</h1>
    </main>
  );
}

export default App;
