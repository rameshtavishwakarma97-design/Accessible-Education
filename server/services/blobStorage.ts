import { BlobServiceClient, StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions } from '@azure/storage-blob';

// ─── AZURE BLOB STORAGE SERVICE ──────────────────────────────────────────────
// Provides upload/download helpers for the conversion pipeline.
// Requires AZURE_STORAGE_CONNECTION_STRING in environment variables.
// Falls back to local disk storage when Azure is not configured.

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_BLOB_CONTAINER ?? 'content';

let blobServiceClient: BlobServiceClient | null = null;

function getClient(): BlobServiceClient {
    if (!blobServiceClient) {
        if (!connectionString) {
            throw new Error(
                'AZURE_STORAGE_CONNECTION_STRING is not set. ' +
                'Azure Blob Storage is unavailable.'
            );
        }
        blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    }
    return blobServiceClient;
}

/**
 * Returns true if Azure Blob Storage is configured and available.
 */
export function isAzureConfigured(): boolean {
    return !!connectionString;
}

/**
 * Upload a Buffer to Azure Blob Storage.
 *
 * @param blobPath  - The path/key within the container (e.g. "converted/abc/transcript.txt")
 * @param buffer    - The file content as a Buffer
 * @param contentType - MIME type (e.g. "text/plain", "application/pdf")
 * @returns The blob path that was written
 */
export async function uploadBuffer(
    blobPath: string,
    buffer: Buffer,
    contentType: string
): Promise<string> {
    const client = getClient();
    const containerClient = client.getContainerClient(containerName);

    // Ensure the container exists (no-op if it already does)
    await containerClient.createIfNotExists({ access: 'blob' });

    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

    await blockBlobClient.upload(buffer, buffer.length, {
        blobHTTPHeaders: { blobContentType: contentType },
    });

    console.log(`[BlobStorage] Uploaded ${blobPath} (${buffer.length} bytes)`);
    return blobPath;
}

/**
 * Download a blob from Azure Blob Storage as a Buffer.
 *
 * @param blobPath - The path/key within the container
 * @returns The file content as a Buffer, or null if not found
 */
export async function downloadBuffer(blobPath: string): Promise<Buffer | null> {
    try {
        const client = getClient();
        const containerClient = client.getContainerClient(containerName);
        const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

        const response = await blockBlobClient.download(0);
        if (!response.readableStreamBody) return null;

        const chunks: Buffer[] = [];
        for await (const chunk of response.readableStreamBody as AsyncIterable<Buffer>) {
            chunks.push(chunk);
        }
        return Buffer.concat(chunks);
    } catch (err: any) {
        if (err.statusCode === 404) return null;
        throw err;
    }
}

/**
 * Get the public URL of a blob (if container has public access).
 *
 * @param blobPath - The path/key within the container
 * @returns The full URL to the blob
 */
export function getBlobUrl(blobPath: string): string {
    const client = getClient();
    const containerClient = client.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
    return blockBlobClient.url;
}

/**
 * Delete a blob from Azure Blob Storage.
 *
 * @param blobPath - The path/key within the container
 */
export async function deleteBlob(blobPath: string): Promise<void> {
    const client = getClient();
    const containerClient = client.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
    await blockBlobClient.deleteIfExists();
    console.log(`[BlobStorage] Deleted ${blobPath}`);
}

/**
 * Generate a SAS-signed download URL for a blob with a time-limited expiry.
 *
 * @param blobPath - The path/key within the container
 * @param expiryHours - Number of hours until the URL expires (default: 1)
 * @returns A signed URL string for direct download
 */
export async function getSignedUrl(blobPath: string, expiryHours: number = 1): Promise<string> {
    if (!connectionString) {
        throw new Error('AZURE_STORAGE_CONNECTION_STRING is not set.');
    }

    // Parse account name and key from the connection string
    const accountNameMatch = connectionString.match(/AccountName=([^;]+)/);
    const accountKeyMatch = connectionString.match(/AccountKey=([^;]+)/);

    if (!accountNameMatch || !accountKeyMatch) {
        throw new Error('Could not parse AccountName/AccountKey from connection string.');
    }

    const accountName = accountNameMatch[1];
    const accountKey = accountKeyMatch[1];
    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

    const startsOn = new Date();
    const expiresOn = new Date(startsOn.getTime() + expiryHours * 60 * 60 * 1000);

    const sasToken = generateBlobSASQueryParameters(
        {
            containerName,
            blobName: blobPath,
            permissions: BlobSASPermissions.parse('r'), // read-only
            startsOn,
            expiresOn,
        },
        sharedKeyCredential
    ).toString();

    const client = getClient();
    const containerClient = client.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

    return `${blockBlobClient.url}?${sasToken}`;
}
