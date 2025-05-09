/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * A TableDownload component that converts the provided data to CSV format
 * and triggers a file download when the button is clicked.
 *
 * @param data - Array of objects representing the data.
 * @param filename - The name of the downloaded file.
 * @returns A button that triggers the CSV file download.
 */
export async function tableDownload(
  data: Record<string, any>[],
  filename = "data.csv"
) {
  // Function to convert JSON data to CSV format
  const convertToCSV = (data: any[]): string => {
    if (!data || data.length === 0) return "";

    const headers = Object.keys(data[0]); // Extract column headers
    const csvRows = [];

    // Add header row
    csvRows.push(headers.join(","));

    // Convert each row
    data.forEach((row) => {
      const values = headers.map((header) => {
        const value = row[header] !== undefined ? row[header] : "";
        return `"${String(value).replace(/"/g, '""')}"`; // Escape quotes
      });
      csvRows.push(values.join(","));
    });

    return csvRows.join("\n");
  };

  try {
    if (!data || data.length === 0) {
      throw new Error("No data returned from the server");
    }

    // Convert data to CSV
    const csvData = convertToCSV(data);

    // Add UTF-8 BOM for proper encoding (supports Arabic, etc.)
    const utf8BOM = "\uFEFF" + csvData;
    const blob = new Blob([utf8BOM], { type: "text/csv;charset=utf-8;" });

    // Create a downloadable link and trigger click
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading file:", error);
    alert("Error downloading file. Please try again.");
  }
}

/* eslint-enable @typescript-eslint/no-explicit-any */
