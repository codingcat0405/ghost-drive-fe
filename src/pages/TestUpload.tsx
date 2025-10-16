import cryptoUtils from "@/utils/crypto";
import { toast } from "sonner";
import { useState, useEffect } from "react";

const TestUpload = () => {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  } | null>(null);

  // Monitor memory usage
  useEffect(() => {
    const updateMemoryInfo = () => {
      if ("memory" in performance) {
        const memory = (performance as any).memory;
        setMemoryInfo({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
        });
      }
    };

    // Update memory info every 2 seconds
    const interval = setInterval(updateMemoryInfo, 500);
    updateMemoryInfo(); // Initial update

    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const logMemoryUsage = (context: string) => {
    if (memoryInfo) {
      console.log(
        `Memory ${context}: ${formatBytes(memoryInfo.usedJSHeapSize)}`
      );
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    console.log("Starting upload for file:", {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    // Log memory before operation
    logMemoryUsage("before upload");

    const aesKey = "KGQUUR1TUIpJ+Clpv9llQVKjrR2VG5zKIBXBe8uKh1k=";

    try {
      await cryptoUtils.encryptAndUpload(
        file,
        aesKey,
        file.name,
        (progress) => {
          console.log("Upload progress:", progress);
          if (progress.percentage === 100) {
            toast.success(`File ${file.name} uploaded successfully!`);
            // Log memory after operation
            setTimeout(() => {
              logMemoryUsage("after upload");
            }, 1000);
          }
        }
      );
    } catch (error: any) {
      console.error("Upload failed:", error);
      toast.error(`Upload failed: ${error.message}`);
    }
  };
  const handleDownload = async (fileName: string) => {
    const aesKey = "KGQUUR1TUIpJ+Clpv9llQVKjrR2VG5zKIBXBe8uKh1k=";

    // Log memory before download
    if (memoryInfo) {
      console.log(
        `Memory before download: ${formatBytes(memoryInfo.usedJSHeapSize)}`
      );
    }

    const blob = await cryptoUtils.decryptAndDownload(
      fileName,
      aesKey,
      104857600
    );

    // Log memory after download
    if (memoryInfo) {
      console.log(
        `Memory after download: ${formatBytes(memoryInfo.usedJSHeapSize)}`
      );
    }

    //download the blob
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);

    // Log memory after cleanup
    setTimeout(() => {
      if (memoryInfo) {
        console.log(
          `Memory after cleanup: ${formatBytes(memoryInfo.usedJSHeapSize)}`
        );
      }
    }, 1000);
  };
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Test Upload & Performance Monitor
      </h1>

      {/* Memory Usage Display */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-3">
          Memory Usage (Current Tab)
        </h2>
        {memoryInfo ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-700 p-3 rounded">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Used JS Heap
              </div>
              <div className="text-lg font-mono">
                {formatBytes(memoryInfo.usedJSHeapSize)}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-700 p-3 rounded">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total JS Heap
              </div>
              <div className="text-lg font-mono">
                {formatBytes(memoryInfo.totalJSHeapSize)}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-700 p-3 rounded">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Heap Limit
              </div>
              <div className="text-lg font-mono">
                {formatBytes(memoryInfo.jsHeapSizeLimit)}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-500">
            Memory info not available in this browser
          </div>
        )}

        {memoryInfo && (
          <div className="mt-3">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Memory Usage
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) *
                    100
                  }%`,
                }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {(
                (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) *
                100
              ).toFixed(1)}
              % of heap limit
            </div>
          </div>
        )}
      </div>

      {/* File Operations */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Upload File</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <div>
          <button
            onClick={() => handleDownload("100mb-test-file.txt")}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Download Test File
          </button>
        </div>
      </div>

      {/* Performance Tips */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
          Performance Tips:
        </h3>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Watch memory usage during large file operations</li>
          <li>• Memory should stay stable during chunked operations</li>
          <li>• If memory spikes, the chunked approach is working</li>
          <li>• Memory should return to baseline after operations complete</li>
        </ul>
      </div>
    </div>
  );
};

export default TestUpload;
