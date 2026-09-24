package com.andara.erp.service.storage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.nio.file.Paths;
import java.security.DigestInputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.UUID;

@Service
@ConditionalOnProperty(name = "app.storage.type", havingValue = "r2")
public class R2StorageService implements StorageService {

    private static final Logger log = LoggerFactory.getLogger(R2StorageService.class);

    private final S3Client s3Client;
    private final String bucketName;

    public R2StorageService(
            @Value("${app.storage.r2.endpoint:}") String endpoint,
            @Value("${app.storage.r2.access-key:}") String accessKey,
            @Value("${app.storage.r2.secret-key:}") String secretKey,
            @Value("${app.storage.r2.bucket-name:andara-files}") String bucketName,
            @Value("${app.storage.r2.region:auto}") String region
    ) {
        this.bucketName = bucketName;

        AwsBasicCredentials credentials = AwsBasicCredentials.create(
                accessKey != null ? accessKey : "placeholder",
                secretKey != null ? secretKey : "placeholder"
        );

        var builder = S3Client.builder()
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .region(Region.of(region != null && !region.isBlank() ? region : "auto"))
                .forcePathStyle(true);

        if (endpoint != null && !endpoint.isBlank()) {
            builder.endpointOverride(URI.create(endpoint));
        }

        this.s3Client = builder.build();
        log.info("Cloudflare R2 Storage initialized for bucket '{}'", bucketName);
    }

    @Override
    public String store(MultipartFile file, String folder) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Tidak dapat menyimpan file kosong");
        }

        String sanitizedFilename = file.getOriginalFilename() != null
                ? Paths.get(file.getOriginalFilename()).getFileName().toString().replaceAll("[^a-zA-Z0-9._-]", "_")
                : "file_" + System.currentTimeMillis();

        String uniqueFilename = UUID.randomUUID() + "_" + sanitizedFilename;
        String objectKey = folder + "/" + uniqueFilename;

        try {
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(this.bucketName)
                    .key(objectKey)
                    .contentType(file.getContentType() != null ? file.getContentType() : "application/octet-stream")
                    .contentLength(file.getSize())
                    .build();

            s3Client.putObject(putRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            log.info("File successfully uploaded to Cloudflare R2: key='{}', size={} bytes", objectKey, file.getSize());
            return objectKey;
        } catch (Exception e) {
            log.error("Failed to upload file to Cloudflare R2 bucket '{}': {}", this.bucketName, e.getMessage(), e);
            throw new IOException("Gagal mengunggah file ke Cloudflare R2: " + e.getMessage(), e);
        }
    }

    @Override
    public byte[] load(String objectKey) throws IOException {
        try {
            GetObjectRequest getRequest = GetObjectRequest.builder()
                    .bucket(this.bucketName)
                    .key(objectKey)
                    .build();

            return s3Client.getObjectAsBytes(getRequest).asByteArray();
        } catch (Exception e) {
            log.error("Failed to read file from Cloudflare R2 key '{}': {}", objectKey, e.getMessage(), e);
            throw new IOException("File tidak ditemukan di Cloudflare R2: " + objectKey, e);
        }
    }

    @Override
    public void delete(String objectKey) throws IOException {
        try {
            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(this.bucketName)
                    .key(objectKey)
                    .build();

            s3Client.deleteObject(deleteRequest);
            log.info("File deleted from Cloudflare R2: key='{}'", objectKey);
        } catch (Exception e) {
            log.warn("Failed to delete file from Cloudflare R2 key '{}': {}", objectKey, e.getMessage());
        }
    }

    @Override
    public String calculateChecksum(MultipartFile file) throws IOException {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            try (InputStream is = file.getInputStream();
                 DigestInputStream dis = new DigestInputStream(is, md)) {
                byte[] buffer = new byte[8192];
                while (dis.read(buffer) != -1) {
                    // Consume stream
                }
            }
            return HexFormat.of().formatHex(md.digest());
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}
