package com.andara.erp.service.storage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.DigestInputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@ConditionalOnProperty(name = "app.storage.type", havingValue = "local", matchIfMissing = true)
public class LocalStorageService implements StorageService {

    private static final Logger log = LoggerFactory.getLogger(LocalStorageService.class);

    private final Path rootLocation;

    public LocalStorageService(@Value("${app.storage.local-dir:uploads}") String localDir) {
        this.rootLocation = Paths.get(localDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.rootLocation);
        } catch (IOException e) {
            log.error("Could not initialize storage directory", e);
        }
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
        Path folderPath = this.rootLocation.resolve(folder).normalize();
        Files.createDirectories(folderPath);

        Path destinationFile = folderPath.resolve(uniqueFilename).normalize();
        if (!destinationFile.startsWith(this.rootLocation)) {
            throw new SecurityException("Tidak dapat menyimpan file di luar direktori yang diizinkan");
        }

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
        }

        return folder + "/" + uniqueFilename;
    }

    @Override
    public byte[] load(String objectKey) throws IOException {
        Path filePath = this.rootLocation.resolve(objectKey).normalize();
        if (!filePath.startsWith(this.rootLocation) || !Files.exists(filePath)) {
            throw new IOException("File tidak ditemukan: " + objectKey);
        }
        return Files.readAllBytes(filePath);
    }

    @Override
    public void delete(String objectKey) throws IOException {
        Path filePath = this.rootLocation.resolve(objectKey).normalize();
        if (filePath.startsWith(this.rootLocation) && Files.exists(filePath)) {
            Files.delete(filePath);
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
                    // Consume stream to compute digest
                }
            }
            return HexFormat.of().formatHex(md.digest());
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}
