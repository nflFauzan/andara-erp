package com.andara.erp.service;

import com.andara.erp.common.exception.AppException;
import com.andara.erp.common.exception.ErrorCode;
import com.andara.erp.dto.itemcatalog.CreateItemCatalogRequest;
import com.andara.erp.dto.itemcatalog.ItemCatalogDTO;
import com.andara.erp.dto.itemcatalog.UpdateItemCatalogRequest;
import com.andara.erp.entity.ItemCatalog;
import com.andara.erp.repository.ItemCatalogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ItemCatalogService {

    private final ItemCatalogRepository itemCatalogRepository;

    public ItemCatalogService(ItemCatalogRepository itemCatalogRepository) {
        this.itemCatalogRepository = itemCatalogRepository;
    }

    @Transactional(readOnly = true)
    public Page<ItemCatalogDTO> getItems(String search, String category, Boolean isActive, Pageable pageable) {
        return itemCatalogRepository.searchItems(search, category, isActive, pageable)
                .map(ItemCatalogDTO::fromEntity);
    }

    @Transactional(readOnly = true)
    public ItemCatalogDTO getItemById(Long id) {
        ItemCatalog item = itemCatalogRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ITEM_CATALOG_NOT_FOUND, "Item katalog tidak ditemukan dengan ID: " + id));
        return ItemCatalogDTO.fromEntity(item);
    }

    @Transactional(readOnly = true)
    public List<ItemCatalogDTO> getActiveItems() {
        return itemCatalogRepository.findByIsActiveTrueOrderByNameAsc()
                .stream()
                .map(ItemCatalogDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<String> getCategories() {
        return itemCatalogRepository.findDistinctCategories();
    }

    @Transactional
    public ItemCatalogDTO createItem(CreateItemCatalogRequest request, String currentUsername) {
        String code = request.getCode() != null ? request.getCode().trim().toUpperCase() : null;
        if (code != null && !code.isEmpty()) {
            if (itemCatalogRepository.existsByCodeIgnoreCase(code)) {
                throw new AppException(ErrorCode.CONFLICT, "Kode item '" + code + "' sudah digunakan.");
            }
        } else {
            // Auto generate readable code
            long count = itemCatalogRepository.count() + 1;
            code = String.format("ITM-%03d", count);
            while (itemCatalogRepository.existsByCodeIgnoreCase(code)) {
                count++;
                code = String.format("ITM-%03d", count);
            }
        }

        ItemCatalog item = new ItemCatalog(
                code,
                request.getName().trim(),
                request.getDefaultUnit() != null ? request.getDefaultUnit().trim() : "unit",
                request.getDefaultPrice(),
                request.getCategory() != null ? request.getCategory().trim() : null,
                request.getDescription() != null ? request.getDescription().trim() : null,
                currentUsername
        );

        ItemCatalog saved = itemCatalogRepository.save(item);
        return ItemCatalogDTO.fromEntity(saved);
    }

    @Transactional
    public ItemCatalogDTO updateItem(Long id, UpdateItemCatalogRequest request, String currentUsername) {
        ItemCatalog item = itemCatalogRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ITEM_CATALOG_NOT_FOUND, "Item katalog tidak ditemukan dengan ID: " + id));

        String code = request.getCode() != null ? request.getCode().trim().toUpperCase() : null;
        if (code != null && !code.isEmpty()) {
            if (itemCatalogRepository.existsByCodeIgnoreCaseAndIdNot(code, id)) {
                throw new AppException(ErrorCode.CONFLICT, "Kode item '" + code + "' sudah digunakan oleh item lain.");
            }
            item.setCode(code);
        }

        item.setName(request.getName().trim());
        if (request.getDefaultUnit() != null) {
            item.setDefaultUnit(request.getDefaultUnit().trim());
        }
        if (request.getDefaultPrice() != null) {
            item.setDefaultPrice(request.getDefaultPrice());
        }
        item.setCategory(request.getCategory() != null ? request.getCategory().trim() : null);
        item.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        if (request.getActive() != null) {
            item.setActive(request.getActive());
        }
        item.setUpdatedBy(currentUsername);

        ItemCatalog updated = itemCatalogRepository.save(item);
        return ItemCatalogDTO.fromEntity(updated);
    }

    @Transactional
    public ItemCatalogDTO toggleItemStatus(Long id, boolean active, String currentUsername) {
        ItemCatalog item = itemCatalogRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ITEM_CATALOG_NOT_FOUND, "Item katalog tidak ditemukan dengan ID: " + id));

        item.setActive(active);
        item.setUpdatedBy(currentUsername);
        ItemCatalog updated = itemCatalogRepository.save(item);
        return ItemCatalogDTO.fromEntity(updated);
    }

    @Transactional
    public void deleteItem(Long id) {
        ItemCatalog item = itemCatalogRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ITEM_CATALOG_NOT_FOUND, "Item katalog tidak ditemukan dengan ID: " + id));

        // Soft delete for historical integrity
        item.setActive(false);
        itemCatalogRepository.save(item);
    }
}
