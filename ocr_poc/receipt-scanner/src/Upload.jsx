import { useState } from "react";

export default function ReceiptUploader() {
  const [result, setResult] = useState(null);

  async function handleUpload(e) {
    const file = e.target.files[0];

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      "http://localhost:8000/api/receipts/parse",
      {
        method: "POST",
        body: formData,
      }
    );
    console.log(response)
    
    const data = await response.json();
    console.log(data)
    setResult(data);
  }

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
      />

      {result && (
        <pre>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}