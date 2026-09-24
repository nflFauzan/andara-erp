package com.andara.erp.service.storage;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface StorageService {

    String store(MultipartFile file, String folder) throws IOException;

    byte[] load(String objectKey) throws IOException;

    void delete(String objectKey) throws IOException;

    String calculateChecksum(MultipartFile file) throws IOException;
}
