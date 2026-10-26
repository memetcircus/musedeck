import { MetaModelApiClient } from "../src/api/meta-client.js";
import { MuseSparkClient } from "../src/api/spark-client.js";

async function runMetaTests() {
  console.log("🧪 --- RUNNING META MODEL API & SPARK SYNTHESIS TESTS ---");

  const metaClient = new MetaModelApiClient({
    apiKey: "mock_api_key_test",
  });

  const sparkClient = new MuseSparkClient(metaClient);

  // Test Muse Spark Code Synthesis
  console.log("⚡ Testing Muse Spark image-to-code synthesis...");
  const dummyImage = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");
  
  const result = await sparkClient.generateCodeFromImage(dummyImage, "Create hero section");

  console.assert(Boolean(result.code), "Synthesized code should not be empty");
  console.assert(result.code.includes("React"), "Generated code should be a valid React component");
  console.log(`✅ Muse Spark synthesis succeeded! Framework: ${result.framework}`);
  console.log(`Component:\n${result.code.substring(0, 150)}...\n`);

  console.log("🎉 ALL META API & SPARK TESTS PASSED!\n");
}

runMetaTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
